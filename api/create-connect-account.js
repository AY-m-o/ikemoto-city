// Vercel Serverless Function: Stripe Connect アカウント作成 & オンボーディングURL生成
// POST /api/create-connect-account
// Body: { email, shopName }

const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

  const { email, shopName } = req.body;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ikemoto-city.vercel.app";

  try {
    // Stripe Connect アカウント作成（Express タイプ）
    const account = await stripe.accounts.create({
      type: "express",
      country: "JP",
      email: email || undefined,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { shop_name: shopName || "" },
    });

    // オンボーディングURL生成
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: baseUrl + "/?connect=refresh",
      return_url: baseUrl + "/?connect=success&accountId=" + account.id,
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url, accountId: account.id });
  } catch (err) {
    console.error("Stripe Connect error:", err);
    res.status(500).json({ error: err.message });
  }
};
