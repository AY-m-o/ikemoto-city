import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://aeubsvgqilfaujqvlgdd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldWJzdmdxaWxmYXVqcXZsZ2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzgzMDksImV4cCI6MjA4ODYxNDMwOX0.OcJlqou5w9oZUgdpSGo4Po2Iki5KHIYrWJPQcsaefyE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 市民ID生成（IK-2026-XXXX形式）
export function generateCitizenId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return "IK-2026-" + suffix;
}

// ── 認証ヘルパー ──────────────────────────────

// 新規登録
export async function signUp(email, password, citizenName, domain) {
  const citizenId = generateCitizenId();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        citizen_id: citizenId,
        citizen_name: citizenName,
        domain,
      },
    },
  });
  if (error) throw error;

  // usersテーブルに保存
  if (data.user) {
    await supabase.from("users").upsert({
      id: data.user.id,
      citizen_id: citizenId,
      email,
      citizen_name: citizenName,
      domain,
      evi: 0.75,
      created_at: new Date().toISOString(),
    });
  }
  return { user: data.user, citizenId };
}

// ログイン
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const citizenId = data.user.user_metadata?.citizen_id || "IK-2026-????";
  return { user: data.user, citizenId };
}

// ログアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 現在のセッション取得
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── いいね ────────────────────────────────────

export async function fetchLikes(userId) {
  const { data } = await supabase
    .from("likes")
    .select("asset_name, shop_name")
    .eq("user_id", userId);
  if (!data) return {};
  const map = {};
  data.forEach(r => { map[r.asset_name] = { shop: r.shop_name }; });
  return map;
}

export async function toggleLike(userId, assetName, shopName) {
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("asset_name", assetName)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    return false; // unliked
  } else {
    await supabase.from("likes").insert({ user_id: userId, asset_name: assetName, shop_name: shopName });
    return true; // liked
  }
}

// ── フォロー ─────────────────────────────────

export async function fetchFollows(userId) {
  const { data } = await supabase
    .from("follows")
    .select("shop_name")
    .eq("follower_id", userId);
  if (!data) return {};
  const map = {};
  data.forEach(r => { map[r.shop_name] = true; });
  return map;
}

export async function toggleFollow(userId, shopName) {
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", userId)
    .eq("shop_name", shopName)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
    return false; // unfollowed
  } else {
    await supabase.from("follows").insert({ follower_id: userId, shop_name: shopName });
    return true; // followed
  }
}

// ── 通報 ─────────────────────────────────────

export async function submitReport(reporterId, targetId, reason) {
  await supabase.from("reports").insert({
    reporter_id: reporterId,
    target_id: targetId,
    reason,
    status: "pending",
    created_at: new Date().toISOString(),
  });
}
