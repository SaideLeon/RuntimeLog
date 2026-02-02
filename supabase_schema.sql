-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. POSTS (The Blog Content)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text, -- Stores raw Markdown
  category text default 'General',
  tags text[] default '{}',
  read_time text default '5 min read',
  status text default 'draft' check (status in ('draft', 'published')),
  author_id uuid references public.profiles(id) not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. COMMENTS
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. POST LIKES
create table public.post_likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, post_id)
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

-- Policies for PROFILES
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);
create policy "Users can insert their own profile" 
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Policies for POSTS
create policy "Published posts are viewable by everyone" 
  on public.posts for select using (status = 'published');

create policy "Admins can view all posts (including drafts)" 
  on public.posts for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert posts" 
  on public.posts for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update posts" 
  on public.posts for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete posts" 
  on public.posts for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Policies for COMMENTS
create policy "Comments are viewable by everyone" 
  on public.comments for select using (true);
create policy "Authenticated users can insert comments" 
  on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can delete their own comments" 
  on public.comments for delete using (auth.uid() = user_id);

-- Policies for LIKES
create policy "Likes are viewable by everyone" 
  on public.post_likes for select using (true);
create policy "Authenticated users can insert likes" 
  on public.post_likes for insert with check (auth.role() = 'authenticated');
create policy "Users can delete their own likes" 
  on public.post_likes for delete using (auth.uid() = user_id);

-- TRIGGER: Handle New User Creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Default role is user. Change to 'admin' manually in DB for the owner.
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index idx_posts_slug on public.posts(slug);
create index idx_posts_status on public.posts(status);
create index idx_comments_post_id on public.comments(post_id);
create index idx_post_likes_post_id on public.post_likes(post_id);
