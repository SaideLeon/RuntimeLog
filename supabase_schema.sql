-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. POSTS (The Blog Content)
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text, -- Stores raw Markdown
  category text default 'General',
  subcategory text, -- Optional subcategory field
  tags text[] default '{}',
  read_time text default '5 min read',
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid not null references public.profiles(id) on delete cascade,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- MIGRATION: Ensure subcategory column exists if table was already created
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'posts' and column_name = 'subcategory') then
    alter table public.posts add column subcategory text;
  end if;
end $$;

-- 3. COMMENTS (Threaded)
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- 4. POST LIKES (N:N)
create table if not exists public.post_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, post_id)
);

-- 5. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

-- 6. POLICIES — PROFILES
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

-- 7. POLICIES — POSTS
drop policy if exists "Published posts are viewable by everyone" on public.posts;
create policy "Published posts are viewable by everyone"
on public.posts for select
using (status = 'published');

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
on public.posts for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- 8. POLICIES — COMMENTS
drop policy if exists "Comments are viewable by everyone" on public.comments;
create policy "Comments are viewable by everyone"
on public.comments for select
using (true);

drop policy if exists "Authenticated users can insert comments" on public.comments;
create policy "Authenticated users can insert comments"
on public.comments for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments"
on public.comments for delete
using (auth.uid() = user_id);

-- 9. POLICIES — POST LIKES
drop policy if exists "Likes are viewable by everyone" on public.post_likes;
create policy "Likes are viewable by everyone"
on public.post_likes for select
using (true);

drop policy if exists "Authenticated users can manage likes" on public.post_likes;
create policy "Authenticated users can manage likes"
on public.post_likes for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own likes" on public.post_likes;
create policy "Users can delete their own likes"
on public.post_likes for delete
using (auth.uid() = user_id);

-- 10. TRIGGER — Auto-create Profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 11. TRIGGER — updated_at automatic
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 12. INDEXES
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_post_likes_post_id on public.post_likes(post_id);