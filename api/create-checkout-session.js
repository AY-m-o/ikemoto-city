// Vercel Serverless Function: Stripe Checkout Session 作成
// POST /api/create-checkout-session
// Body: { itemName, price, shopName, stripeAccountId? }

const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

  const { itemName, price, shopName, stripeAccountId } = req.body;

  // 価格文字列から数値を抽出（例: "¥3,800" → 3800）
  const priceNum = parseInt(String(price).replace(/[^0-9]/g, ""), 10);
  if (!priceNum || priceNum < 50) {
    res.status(400).json({ error: "Invalid price" });
    return;
  }

  // 1.5%インフラ維持税
  const appFee = Math.round(priceNum * 0.015);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ikemoto-city.vercel.app";

  try {
    const sessionParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: itemName || "物質化アセット",
              description: shopName ? "出品店舗: " + shopName : undefined,
            },
            unit_amount: priceNum,
          },
          quantity: 1,
        },
      ],
      success_url: baseUrl + "/?purchase=success&item=" + encodeURIComponent(itemName || ""),
      cancel_url: baseUrl + "/?purchase=cancel",
    };

    // Stripe Connect経由（クリエイターのアカウントIDがある場合）
    if (stripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: appFee,
        transfer_data: { destination: stripeAccountId },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};
