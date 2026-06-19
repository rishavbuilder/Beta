-- ============================================
-- Fix RLS — Add missing SELECT/INSERT/DELETE policies
-- Run this in Supabase SQL Editor
-- ============================================

-- 0. SAVES TABLE (missing from initial schema)
create table if not exists public.saves (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, prompt_id)
);

alter table public.saves enable row level security;

-- 1. CATEGORIES
alter table public.categories enable row level security;

create policy if not exists "Public categories are viewable by everyone"
  on public.categories for select
  using (true);

-- 2. DISCUSSIONS
create policy if not exists "Public discussions are viewable by everyone"
  on public.discussions for select
  using (true);

create policy if not exists "Users can create discussions"
  on public.discussions for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own discussions"
  on public.discussions for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own discussions"
  on public.discussions for delete
  using (auth.uid() = user_id);

-- 3. BATTLES
create policy if not exists "Public battles are viewable by everyone"
  on public.battles for select
  using (true);

create policy if not exists "Authenticated users can create battles"
  on public.battles for insert
  with check (auth.role() = 'authenticated');

create policy if not exists "Anyone can update battle vote counts"
  on public.battles for update
  using (true);

-- 4. BATTLE_VOTES
create policy if not exists "Public battle votes are viewable by everyone"
  on public.battle_votes for select
  using (true);

create policy if not exists "Users can vote in battles"
  on public.battle_votes for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can remove their own votes"
  on public.battle_votes for delete
  using (auth.uid() = user_id);

-- 5. SAVES
create policy if not exists "Users can view their own saves"
  on public.saves for select
  using (auth.uid() = user_id);

create policy if not exists "Users can save prompts"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can remove their own saves"
  on public.saves for delete
  using (auth.uid() = user_id);

-- 6. LIKES
create policy if not exists "Public likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy if not exists "Users can like prompts"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can remove their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- 7. COMMENTS
create policy if not exists "Public comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy if not exists "Users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- 8. REVIEWS
create policy if not exists "Public reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy if not exists "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- 9. USERS (profiles)
create policy if not exists "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

create policy if not exists "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- 10. FOLLOWERS
create policy if not exists "Public followers are viewable by everyone"
  on public.followers for select
  using (true);

create policy if not exists "Users can follow others"
  on public.followers for insert
  with check (auth.uid() = follower_id);

create policy if not exists "Users can unfollow"
  on public.followers for delete
  using (auth.uid() = follower_id);

-- 11. COLLECTIONS
create policy if not exists "Public collections are viewable by everyone"
  on public.collections for select
  using (is_public = true);

create policy if not exists "Users can view their own collections"
  on public.collections for select
  using (auth.uid() = user_id);

create policy if not exists "Users can create collections"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own collections"
  on public.collections for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own collections"
  on public.collections for delete
  using (auth.uid() = user_id);

-- 12. COLLECTION_PROMPTS
create policy if not exists "Public collection_prompts are viewable by everyone"
  on public.collection_prompts for select
  using (true);

create policy if not exists "Users can add to their own collections"
  on public.collection_prompts for insert
  with check (
    exists (select 1 from public.collections where id = collection_id and user_id = auth.uid())
  );

create policy if not exists "Users can remove from their own collections"
  on public.collection_prompts for delete
  using (
    exists (select 1 from public.collections where id = collection_id and user_id = auth.uid())
  );

-- 13. NOTIFICATIONS
create policy if not exists "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy if not exists "System can create notifications"
  on public.notifications for insert
  with check (true);

-- 14. EARNINGS
create policy if not exists "Users can view their own earnings"
  on public.earnings for select
  using (auth.uid() = user_id);

create policy if not exists "System can create earnings"
  on public.earnings for insert
  with check (true);

-- 15. DISCUSSION UP VOTES (per-user tracking)
create table if not exists public.discussion_upvotes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  discussion_id uuid references public.discussions(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, discussion_id)
);

alter table public.discussion_upvotes enable row level security;

create policy if not exists "Anyone can view upvotes"
  on public.discussion_upvotes for select
  using (true);

create policy if not exists "Users can toggle their own upvote"
  on public.discussion_upvotes for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can remove their own upvote"
  on public.discussion_upvotes for delete
  using (auth.uid() = user_id);

-- 16. DISCUSSION REPLIES
create table if not exists public.discussion_replies (
  id uuid default uuid_generate_v4() primary key,
  discussion_id uuid references public.discussions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.discussion_replies enable row level security;

create policy if not exists "Replies are viewable by everyone"
  on public.discussion_replies for select
  using (true);

create policy if not exists "Users can create replies"
  on public.discussion_replies for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own replies"
  on public.discussion_replies for delete
  using (auth.uid() = user_id);
