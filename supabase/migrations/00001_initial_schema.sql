-- ============================================
-- PromptOS — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. USERS (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'creator', 'admin')),
  is_premium boolean default false,
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- 2. CATEGORIES
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  prompt_count integer default 0
);

-- 3. PROMPTS
create table if not exists public.prompts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  content text not null,
  category_id uuid references public.categories(id) on delete set null,
  model text not null,
  price decimal(10,2) default 0,
  is_premium boolean default false,
  is_featured boolean default false,
  is_published boolean default true,
  tags text[] default '{}',
  cover_image text,
  likes_count integer default 0,
  saves_count integer default 0,
  comments_count integer default 0,
  views_count integer default 0,
  rating decimal(2,1) default 0,
  rating_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. COLLECTIONS
create table if not exists public.collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default true,
  prompt_count integer default 0,
  created_at timestamptz default now()
);

-- 5. COLLECTION_PROMPTS (junction table)
create table if not exists public.collection_prompts (
  id uuid default uuid_generate_v4() primary key,
  collection_id uuid references public.collections(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique(collection_id, prompt_id)
);

-- 6. LIKES
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, prompt_id)
);

-- 7. COMMENTS
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  content text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

-- 8. REVIEWS
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamptz default now(),
  unique(user_id, prompt_id)
);

-- 9. FOLLOWERS
create table if not exists public.followers (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- 10. PROMPT_VERSIONS
create table if not exists public.prompt_versions (
  id uuid default uuid_generate_v4() primary key,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  content text not null,
  version_number integer not null,
  change_log text,
  created_at timestamptz default now()
);

-- 11. SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  creator_id uuid references public.users(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_subscription_id text,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  created_at timestamptz default now()
);

-- 12. BATTLES
create table if not exists public.battles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  prompt_1_id uuid references public.prompts(id) on delete cascade not null,
  prompt_2_id uuid references public.prompts(id) on delete cascade not null,
  created_by uuid references public.users(id) on delete cascade not null,
  status text default 'active' check (status in ('pending', 'active', 'closed')),
  votes_1 integer default 0,
  votes_2 integer default 0,
  winner_id uuid references public.prompts(id) on delete set null,
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- 13. BATTLE_VOTES
create table if not exists public.battle_votes (
  id uuid default uuid_generate_v4() primary key,
  battle_id uuid references public.battles(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  voted_for uuid not null,
  created_at timestamptz default now(),
  unique(battle_id, user_id)
);

-- 14. DISCUSSIONS (Community)
create table if not exists public.discussions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  user_id uuid references public.users(id) on delete cascade not null,
  category text not null,
  tags text[] default '{}',
  upvotes integer default 0,
  comment_count integer default 0,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 16. EARNINGS
create table if not exists public.earnings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete set null,
  amount decimal(10,2) not null,
  type text not null check (type in ('sale', 'subscription', 'tip')),
  status text not null default 'pending' check (status in ('pending', 'available', 'paid')),
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_prompts_user on public.prompts(user_id);
create index if not exists idx_prompts_category on public.prompts(category_id);
create index if not exists idx_prompts_model on public.prompts(model);
create index if not exists idx_prompts_created on public.prompts(created_at desc);
create index if not exists idx_prompts_rating on public.prompts(rating desc);
create index if not exists idx_prompts_featured on public.prompts(is_featured) where is_featured = true;
create index if not exists idx_collections_user on public.collections(user_id);
create index if not exists idx_likes_prompt on public.likes(prompt_id);
create index if not exists idx_comments_prompt on public.comments(prompt_id);
create index if not exists idx_followers_following on public.followers(following_id);
create index if not exists idx_notifications_user on public.notifications(user_id) where is_read = false;
create index if not exists idx_battles_status on public.battles(status);
create index if not exists idx_discussions_pinned on public.discussions(is_pinned) where is_pinned = true;

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.prompts enable row level security;
alter table public.collections enable row level security;
alter table public.collection_prompts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.reviews enable row level security;
alter table public.followers enable row level security;
alter table public.battles enable row level security;
alter table public.battle_votes enable row level security;
alter table public.discussions enable row level security;
alter table public.notifications enable row level security;
alter table public.earnings enable row level security;

-- Public read access for prompts, categories, etc.
create policy if not exists "Public prompts are viewable by everyone"
  on public.prompts for select using (is_published = true);

create policy if not exists "Users can insert their own prompts"
  on public.prompts for insert with check (auth.uid() = user_id);

create policy if not exists "Users can update their own prompts"
  on public.prompts for update using (auth.uid() = user_id);

create policy if not exists "Users can delete their own prompts"
  on public.prompts for delete using (auth.uid() = user_id);

-- ============================================
-- SEED CATEGORIES
-- ============================================
insert into public.categories (name, slug, description, icon) values
  ('Coding', 'coding', 'Code generation, debugging, and refactoring prompts', 'Code'),
  ('Web Development', 'web-dev', 'Full-stack, frontend, and backend prompts', 'Globe'),
  ('Business', 'business', 'Strategy, planning, and operations', 'Briefcase'),
  ('Marketing', 'marketing', 'Campaigns, copywriting, and analytics', 'Megaphone'),
  ('SEO', 'seo', 'Search optimization and content strategy', 'Search'),
  ('Design', 'design', 'UI/UX, graphic design, and branding', 'Palette'),
  ('Education', 'education', 'Learning, tutoring, and course creation', 'GraduationCap'),
  ('Resume', 'resume', 'Resume writing and career development', 'FileText'),
  ('Productivity', 'productivity', 'Task management and workflow optimization', 'Zap'),
  ('Content Creation', 'content', 'Blog posts, social media, and articles', 'PenTool'),
  ('Image Generation', 'image-gen', 'AI image generation prompts', 'Image'),
  ('Video Generation', 'video-gen', 'Video creation and editing prompts', 'Video')
on conflict (slug) do nothing;

-- ============================================
-- STORAGE BUCKET for prompt cover images
-- ============================================
insert into storage.buckets (id, name, public) values ('prompt-covers', 'prompt-covers', true)
on conflict (id) do nothing;

create policy if not exists "Public can view prompt covers"
  on storage.objects for select using (bucket_id = 'prompt-covers');

create policy if not exists "Authenticated users can upload prompt covers"
  on storage.objects for insert with check (
    bucket_id = 'prompt-covers' and auth.role() = 'authenticated'
  );

create policy if not exists "Users can delete their own prompt covers"
  on storage.objects for delete using (
    bucket_id = 'prompt-covers' and auth.uid() = owner
  );
