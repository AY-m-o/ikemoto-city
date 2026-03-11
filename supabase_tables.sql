-- ========================================
-- 池本市デジタル市役所 — Supabase テーブル定義
-- Supabase SQL Editor で実行してください
-- ========================================

-- ① users（市民プロフィール）
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  citizen_id  text unique not null,
  email       text,
  citizen_name text,
  domain      text,
  evi         numeric default 0.75,
  created_at  timestamptz default now()
);
alter table public.users enable row level security;
create policy "users: read own" on public.users for select using (auth.uid() = id);
create policy "users: insert own" on public.users for insert with check (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);

-- ② assets（アセット）
create table if not exists public.assets (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price       text,
  type        text check (type in ('physical','digital','license')),
  shop_name   text,
  owner_id    uuid references public.users(id),
  created_at  timestamptz default now()
);
alter table public.assets enable row level security;
create policy "assets: public read" on public.assets for select using (true);
create policy "assets: owner insert" on public.assets for insert with check (auth.uid() = owner_id);

-- ③ likes（いいね）
create table if not exists public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  asset_name  text not null,
  shop_name   text,
  created_at  timestamptz default now(),
  unique (user_id, asset_name)
);
alter table public.likes enable row level security;
create policy "likes: read own" on public.likes for select using (auth.uid() = user_id);
create policy "likes: insert own" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes: delete own" on public.likes for delete using (auth.uid() = user_id);

-- ④ follows（フォロー）
create table if not exists public.follows (
  id          uuid primary key default gen_random_uuid(),
  follower_id uuid references public.users(id) on delete cascade,
  shop_name   text not null,
  created_at  timestamptz default now(),
  unique (follower_id, shop_name)
);
alter table public.follows enable row level security;
create policy "follows: read own" on public.follows for select using (auth.uid() = follower_id);
create policy "follows: insert own" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows: delete own" on public.follows for delete using (auth.uid() = follower_id);

-- ⑤ assignments（プロジェクトアサイン）
create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null,
  user_id     uuid references public.users(id) on delete cascade,
  status      text default 'active',
  created_at  timestamptz default now(),
  unique (project_id, user_id)
);
alter table public.assignments enable row level security;
create policy "assignments: read own" on public.assignments for select using (auth.uid() = user_id);
create policy "assignments: insert own" on public.assignments for insert with check (auth.uid() = user_id);

-- ⑥ messages（プロジェクトチャット）
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null,
  sender_id   uuid references public.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);
alter table public.messages enable row level security;
create policy "messages: read assigned" on public.messages for select
  using (exists (
    select 1 from public.assignments a
    where a.project_id = messages.project_id and a.user_id = auth.uid()
  ));
create policy "messages: insert assigned" on public.messages for insert
  with check (auth.uid() = sender_id and exists (
    select 1 from public.assignments a
    where a.project_id = messages.project_id and a.user_id = auth.uid()
  ));

-- ⑦ reports（通報）
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id) on delete cascade,
  target_id   text not null,
  reason      text not null,
  status      text default 'pending',
  created_at  timestamptz default now()
);
alter table public.reports enable row level security;
create policy "reports: insert own" on public.reports for insert with check (auth.uid() = reporter_id);
