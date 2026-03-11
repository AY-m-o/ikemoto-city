import { loadStripe } from "@stripe/stripe-js";

// 公開キーのみをフロントエンドに置く（シークレットキーは api/ のみ）
const PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY ||
  "pk_test_51T9kusHMx5lUUPcizSkHgcKBIMyN8A2OrMJb2FUUZmUzc4sgCDjURED8wtrqstBJzKPmOGpt0AYEJTtXfgnSHXuI00Mq4R9Epp";

// loadStripe はシングルトンで使う（複数回呼ばない）
let stripePromise = null;
export function getStripe() {
  if (!stripePromise) stripePromise = loadStripe(PUBLIC_KEY);
  return stripePromise;
}

// 価格テキスト "¥3,800" → 3800 に変換するユーティリティ
export function parsePriceJPY(priceText) {
  return parseInt(String(priceText).replace(/[^0-9]/g, ""), 10) || 0;
}
