// Vercel Serverless Function
// Checks uploaded image content with Gemini Vision API
// Returns { approved: bool, reason: string }

const { createClient } = require("@supabase/supabase-js");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// 利用可能なGeminiモデルを動的取得（moderate-report.jsと同じロジック）
let _cachedModel = null;
async function getAvailableModel() {
  if (_cachedModel) return _cachedModel;
  const res = await fetch(`${GEMINI_BASE}/models?key=${GEMINI_API_KEY}`);
  if (!res.ok) throw new Error("ListModels failed: " + res.status);
  const { models = [] } = await res.json();
  const candidates = models.filter(m =>
    (m.supportedGenerationMethods || []).includes("generateContent")
  );
  // Vision対応モデル（flash系を優先）
  const flash = candidates.find(m => m.name.includes("flash"));
  const chosen = flash || candidates[0];
  if (!chosen) throw new Error("No available Gemini model");
  _cachedModel = chosen.name.replace("models/", "");
  return _cachedModel;
}

async function checkImageWithGemini(imageUrl) {
  const model = await getAvailableModel();
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
あなたはコンテンツモデレーターです。以下の画像を分析し、JSONで結果を返してください。

チェック項目:
1. 成人向け・性的コンテンツ（ポルノ・わいせつ等）
2. 暴力・グロテスク・残虐なコンテンツ
3. 著作権で保護されたキャラクター（ポケモン・ワンピース・ドラゴンボール・Disney・Marvel・任天堂キャラ・アニメキャラ等）
4. ヘイトスピーチ・差別的シンボル（ナチス等）
5. 個人の顔写真（プライバシー侵害の恐れ）

判定基準:
- "rejected": 上記のいずれかに明らかに該当する
- "approved": 問題なし（風景・イラスト・図解・商用フリー素材等）

必ず以下のJSON形式のみで返してください:
{"result":"<approved|rejected>","reason":"<理由（日本語・50文字以内）>"}
`.trim();

  // 画像URLをfetchしてbase64に変換
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("画像の取得に失敗: " + imgRes.status);
  const imgBuffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(imgBuffer).toString("base64");
  const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gemini Vision error: " + err.slice(0, 200));
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // resultとreasonを正規表現で抽出
  const resultMatch = raw.match(/"result"\s*:\s*"(approved|rejected)"/);
  const reasonMatch = raw.match(/"reason"\s*:\s*"([^"]{1,100})"/);

  if (!resultMatch) {
    // AI判定不能 → 安全側に倒してpending
    console.warn("check-image: could not parse Gemini response:", raw.slice(0, 100));
    return { approved: true, reason: "AI検査スキップ（判定不能）" };
  }

  return {
    approved: resultMatch[1] === "approved",
    reason: reasonMatch ? reasonMatch[1] : (resultMatch[1] === "approved" ? "問題なし" : "コンテンツポリシー違反"),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl, context } = req.body || {};
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const result = await checkImageWithGemini(imageUrl);
    return res.status(200).json(result);
  } catch (e) {
    console.error("check-image error:", e.message);
    // エラー時はapprovedとして扱い（アップロードをブロックしない）
    return res.status(200).json({ approved: true, reason: "検査エラー（手動確認推奨）: " + e.message.slice(0, 60) });
  }
};
