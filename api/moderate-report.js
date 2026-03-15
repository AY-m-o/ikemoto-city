// Vercel Serverless Function
// Triggered by Supabase Database Webhook on reports INSERT
// Judges the report with Gemini Flash and auto-moderates

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// 利用可能なモデルを動的に取得（キャッシュ付き）
let _cachedModel = null;
async function getAvailableModel() {
  if (_cachedModel) return _cachedModel;
  const res = await fetch(`${GEMINI_BASE}/models?key=${GEMINI_API_KEY}`);
  if (!res.ok) throw new Error("ListModels failed: " + res.status);
  const { models = [] } = await res.json();
  // generateContent対応モデルの中でflashを優先
  const candidates = models.filter(m =>
    (m.supportedGenerationMethods || []).includes("generateContent")
  );
  const flash = candidates.find(m => m.name.includes("flash"));
  const chosen = flash || candidates[0];
  if (!chosen) throw new Error("No available Gemini model found");
  _cachedModel = chosen.name.replace("models/", "");
  console.log("Using Gemini model:", _cachedModel);
  return _cachedModel;
}

// 同ユーザーの違反が何回でエスカレートするか
const ESCALATE_THRESHOLD = 3;

// キーワードベースのフォールバック判定（Gemini API が使えない場合に使用）
function judgeByKeyword({ targetTitle, targetDesc, reason }) {
  const BLOCK_KEYWORDS = [
    "スパム", "spam", "出会い", "売春", "援助交際", "詐欺", "フィッシング",
    "わいせつ", "ポルノ", "暴力", "殺", "死ね", "ヘイト", "差別",
    "個人情報", "マルウェア", "ウイルス", "不法", "違法", "薬物",
  ];
  const text = [targetTitle, targetDesc, reason].join(" ").toLowerCase();
  const matched = BLOCK_KEYWORDS.some(kw => text.includes(kw));
  if (matched) {
    return { verdict: "auto_blocked", reason: "キーワード検出による自動ブロック" };
  }
  // 規約違反・不適切コンテンツの通報理由はレビュー待ちに
  if (reason === "規約違反" || reason === "不適切なコンテンツ") {
    return { verdict: "pending_review", reason: "要人間レビュー" };
  }
  return { verdict: "pending_review", reason: "AIなし判定：人間レビュー待ち" };
}

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

  const model = await getAvailableModel();
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 256,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gemini API error: " + err);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("Gemini raw response:", raw.slice(0, 200));
  // 最初の { から最後の } を取り出してJSONをパース
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return { verdict: "pending_review", reason: "AI応答にJSONなし: " + raw.slice(0, 60) };
  }
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return { verdict: "pending_review", reason: "AI応答JSON解析エラー" };
  }
}

async function judge(params) {
  try {
    return await judgeWithGemini(params);
  } catch (e) {
    const errMsg = e.message.slice(0, 120);
    console.error("Gemini error:", errMsg);
    const fallback = judgeByKeyword(params);
    return { ...fallback, reason: fallback.reason + " [GeminiErr:" + errMsg + "]" };
  }
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

    // Gemini（失敗時はキーワード判定）で判定
    const { verdict, reason: aiReason } = await judge({
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
