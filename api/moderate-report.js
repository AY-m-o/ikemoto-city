// Vercel Serverless Function
// Triggered by Supabase Database Webhook on reports INSERT
// Uses Gemini to judge reported content and auto-moderates based on severity

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// 利用可能なGeminiモデルを動的取得（キャッシュ付き）
let _cachedModel = null;
async function getAvailableModel() {
  if (_cachedModel) return _cachedModel;
  const res = await fetch(`${GEMINI_BASE}/models?key=${GEMINI_API_KEY}`);
  if (!res.ok) throw new Error("ListModels failed: " + res.status);
  const { models = [] } = await res.json();
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

// システムプロンプト
const SYSTEM_PROMPT = `あなたは池本市（Ikemoto City）というクリエイター経済プラットフォームのコンテンツ審査AIです。以下のコンテンツがコミュニティガイドラインに違反しているか判定してください。違反カテゴリ：ヘイトスピーチ・差別的表現、性的・暴力的コンテンツ、脅迫・ハラスメント、詐欺・不正取引への誘導、外部プラットフォームへのスパム的誘導、なりすまし・偽市民証。また以下の単語・表現を含む場合は違反として扱う：スパム, spam, 出会い, 売春, 援助交際, 詐欺, フィッシング, わいせつ, ポルノ, 暴力, 殺, 死ね（ただし創作・文学的文脈は除く）, ヘイト, 差別, 個人情報, マルウェア, ウイルス, 不法, 違法, 薬物。以下のJSON形式のみで返答してください：{"violation": true/false, "category": "カテゴリ名またはnull", "severity": "low/medium/high", "reason": "理由"}`;

// キーワードフォールバック判定（Gemini APIが使えない場合）
function judgeByKeyword({ targetTitle, targetDesc, reason }) {
  const BLOCK_KEYWORDS = [
    "スパム", "spam", "出会い", "売春", "援助交際", "詐欺", "フィッシング",
    "わいせつ", "ポルノ", "暴力", "殺", "死ね", "ヘイト", "差別",
    "個人情報", "マルウェア", "ウイルス", "不法", "違法", "薬物",
  ];
  const text = [targetTitle, targetDesc, reason].join(" ").toLowerCase();
  const matched = BLOCK_KEYWORDS.some(kw => text.includes(kw));
  if (matched) {
    return {
      violation: true,
      category: "キーワード違反",
      severity: "high",
      reason: "禁止キーワードを検出（自動判定）",
    };
  }
  return {
    violation: false,
    category: null,
    severity: "low",
    reason: "キーワード違反なし・AI未使用",
  };
}

// Gemini APIで審査
async function judgeWithGemini({ targetTitle, targetDesc, reason }) {
  const userContent = `
【通報対象プロジェクト】
タイトル: ${targetTitle || "(不明)"}
説明: ${targetDesc || "(なし)"}

【通報理由（ユーザー選択）】
${reason || "(なし)"}
`.trim();

  const model = await getAvailableModel();
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: '{"violation": false, "category": null, "severity": "low", "reason": "理解しました。審査します。"}' }] },
        { role: "user", parts: [{ text: userContent }] },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gemini API error: " + err.slice(0, 200));
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("Gemini raw:", raw.slice(0, 300));

  // violation / category / severity / reason をそれぞれ抽出
  const violationMatch = raw.match(/"violation"\s*:\s*(true|false)/);
  const categoryMatch  = raw.match(/"category"\s*:\s*"([^"]{0,60})"/);
  const severityMatch  = raw.match(/"severity"\s*:\s*"(low|medium|high)"/);
  const reasonMatch    = raw.match(/"reason"\s*:\s*"([^"]{1,200})"/);

  if (!violationMatch) {
    throw new Error("Gemini response missing violation field: " + raw.slice(0, 100));
  }

  return {
    violation: violationMatch[1] === "true",
    category:  categoryMatch  ? categoryMatch[1]  : null,
    severity:  severityMatch  ? severityMatch[1]  : "medium",
    reason:    reasonMatch    ? reasonMatch[1]    : "AI判定完了",
  };
}

// judge: Gemini → フォールバック
async function judge(params) {
  try {
    return await judgeWithGemini(params);
  } catch (e) {
    console.error("Gemini error, falling back to keyword judge:", e.message);
    const fallback = judgeByKeyword(params);
    return { ...fallback, reason: fallback.reason + " [GeminiErr]" };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const record = req.body?.record;
  if (!record) {
    return res.status(400).json({ error: "No record in payload" });
  }

  const { id: reportId, target_id: targetReg, reason, reporter_user_id } = record;

  try {
    // 対象プロジェクトの情報を取得
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

    // 審査実行
    const aiResult = await judge({ targetTitle, targetDesc, reason });
    const { violation, severity } = aiResult;

    // 最終ステータス決定
    // severity=high かつ violation=true → auto_blocked
    // violation=true かつ severity=medium → pending_review
    // violation=false → dismissed
    let finalStatus;
    if (violation && severity === "high") {
      finalStatus = "auto_blocked";
    } else if (violation && severity === "medium") {
      finalStatus = "pending_review";
    } else if (violation && severity === "low") {
      finalStatus = "pending_review";
    } else {
      finalStatus = "dismissed";
    }

    // エスカレーション判定（同ユーザーの auto_blocked 累積）
    if (finalStatus === "auto_blocked" && reporter_user_id) {
      const { data: user } = await supabase
        .from("users")
        .select("report_count")
        .eq("id", reporter_user_id)
        .single();

      const currentCount = user?.report_count || 0;
      const newCount = currentCount + 1;

      await supabase
        .from("users")
        .update({ report_count: newCount })
        .eq("id", reporter_user_id);

      if (newCount >= ESCALATE_THRESHOLD) {
        finalStatus = "escalated";
      }
    }

    // reports テーブルを更新（ai_result に JSON全体を保存）
    await supabase
      .from("reports")
      .update({
        status: finalStatus,
        ai_verdict: violation ? (severity === "high" ? "auto_blocked" : "pending_review") : "dismissed",
        ai_reason: aiResult.reason,
        ai_result: aiResult,
      })
      .eq("id", reportId);

    // severity=high なら対象プロジェクトを非表示
    if (violation && severity === "high" && targetReg) {
      await supabase
        .from("projects")
        .update({ hidden: true })
        .eq("reg", targetReg);
      console.log("Project hidden:", targetReg);
    }

    return res.status(200).json({ aiResult, finalStatus });
  } catch (e) {
    console.error("moderate-report error:", e);
    await supabase
      .from("reports")
      .update({
        status: "pending_review",
        ai_reason: "処理エラー: " + e.message.slice(0, 100),
      })
      .eq("id", reportId);
    return res.status(500).json({ error: e.message });
  }
};
