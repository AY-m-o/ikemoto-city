// Vercel Serverless Function
// Triggered by Supabase Database Webhook on reports INSERT
// Judges the report with Gemini Flash and auto-moderates

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=" +
  GEMINI_API_KEY;

// 同ユーザーの違反が何回でエスカレートするか
const ESCALATE_THRESHOLD = 3;

async function judgeWithGemini({ targetTitle, targetDesc, reason }) {
  const prompt = `
あなたはオンラインコミュニティ「池本市」のコンテンツモデレーターです。
以下の通報を分析し、JSONで判定を返してください。

【通報対象プロジェクト】
タイトル: ${targetTitle || "(不明)"}
説明: ${targetDesc || "(なし)"}

【通報理由（ユーザー選択）】
${reason}

以下のいずれかを verdict として返してください:
- "auto_blocked": 明らかな規約違反（スパム・ヘイトスピーチ・詐欺・暴力・わいせつ・個人情報漏洩など）
- "pending_review": グレーゾーン（人間の判断が必要）
- "dismissed": 問題なし

必ず以下のJSON形式のみで返してください（余計なテキスト不要）:
{"verdict":"<verdict>","reason":"<判定理由（日本語・50文字以内）>"}
`.trim();

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 128 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gemini API error: " + err);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  // JSONを安全にパース
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : { verdict: "pending_review", reason: "AI判定失敗" };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Supabase Webhook の payload
  const record = req.body?.record;
  if (!record) {
    return res.status(400).json({ error: "No record in payload" });
  }

  const { id: reportId, target_id: targetReg, reason, reporter_user_id } = record;

  try {
    // 対象プロジェクトの情報を取得（タイトル・説明）
    let targetTitle = targetReg;
    let targetDesc = "";
    if (targetReg) {
      const { data: project } = await supabase
        .from("projects")
        .select("title, desc")
        .eq("reg", targetReg)
        .single();
      if (project) {
        targetTitle = project.title;
        targetDesc = project.desc || "";
      }
    }

    // Gemini で判定
    const { verdict, reason: aiReason } = await judgeWithGemini({
      targetTitle,
      targetDesc,
      reason,
    });

    // report のステータスを更新
    let finalStatus = verdict; // auto_blocked | pending_review | dismissed

    // 同ユーザーの違反回数を確認してエスカレートするか判断
    if (verdict === "auto_blocked" && reporter_user_id) {
      const { data: user } = await supabase
        .from("users")
        .select("report_count")
        .eq("id", reporter_user_id)
        .single();

      const currentCount = user?.report_count || 0;
      const newCount = currentCount + 1;

      // 違反カウントを更新
      await supabase
        .from("users")
        .update({ report_count: newCount })
        .eq("id", reporter_user_id);

      if (newCount >= ESCALATE_THRESHOLD) {
        finalStatus = "escalated";
      }
    }

    // report を更新
    await supabase
      .from("reports")
      .update({ status: finalStatus, ai_verdict: verdict, ai_reason: aiReason })
      .eq("id", reportId);

    // auto_blocked の場合はプロジェクトを非表示に
    if (verdict === "auto_blocked" && targetReg) {
      await supabase
        .from("projects")
        .update({ hidden: true })
        .eq("reg", targetReg);
    }

    return res.status(200).json({ verdict, aiReason, finalStatus });
  } catch (e) {
    console.error("moderate-report error:", e);
    // エラーでも report を pending_review に更新して人間が対応できるようにする
    await supabase
      .from("reports")
      .update({ status: "pending_review", ai_reason: "処理エラー: " + e.message })
      .eq("id", reportId);
    return res.status(500).json({ error: e.message });
  }
};
