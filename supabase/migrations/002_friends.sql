-- Extend profiles
alter table profiles add column if not exists username text unique;
alter table profiles add column if not exists avatar_url text;

-- Friendships
create table if not exists friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references auth.users not null,
  addressee_id uuid references auth.users not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table friendships enable row level security;

drop policy if exists "Users see own friendships" on friendships;
create policy "Users see own friendships" on friendships
  for select using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

drop policy if exists "Users can send friend requests" on friendships;
create policy "Users can send friend requests" on friendships
  for insert with check (auth.uid() = requester_id);

drop policy if exists "Addressee can respond to requests" on friendships;
create policy "Addressee can respond to requests" on friendships
  for update using (auth.uid() = addressee_id);

drop policy if exists "Users can delete own friendships" on friendships;
create policy "Users can delete own friendships" on friendships
  for delete using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Allow looking up other users by username (only id/username/avatar exposed)
drop policy if exists "Anyone can read public profile fields" on profiles;
create policy "Anyone can read public profile fields" on profiles
  for select using (true);

-- Realtime
alter publication supabase_realtime add table friendships;

-- Friend daily summary RPC
create or replace function get_friend_daily_summary(
  p_friend_id uuid,
  p_date date default current_date
)
returns json
language plpgsql
security definer
as $$
declare
  result json;
  friendship_exists boolean;
begin
  select exists(
    select 1 from friendships
    where status = 'accepted'
    and (
      (requester_id = auth.uid() and addressee_id = p_friend_id)
      or (requester_id = p_friend_id and addressee_id = auth.uid())
    )
  ) into friendship_exists;

  if not friendship_exists then
    raise exception 'Not friends';
  end if;

  select json_build_object(
    'profile', (
      select json_build_object(
        'username', p.username,
        'avatar_url', p.avatar_url,
        'daily_calories_goal', p.daily_calories_goal,
        'daily_protein_goal', p.daily_protein_goal,
        'daily_fat_goal', p.daily_fat_goal,
        'daily_carbs_goal', p.daily_carbs_goal
      )
      from profiles p where p.id = p_friend_id
    ),
    'totals', (
      select json_build_object(
        'calories', coalesce(sum(calories), 0),
        'protein', coalesce(sum(protein), 0),
        'fat', coalesce(sum(fat), 0),
        'carbs', coalesce(sum(carbs), 0),
        'entries_count', count(*)
      )
      from meal_entries
      where user_id = p_friend_id
      and created_at::date = p_date
    ),
    'meals', (
      select coalesce(json_agg(
        json_build_object(
          'name', m.name,
          'calories', m.calories,
          'protein', m.protein,
          'fat', m.fat,
          'carbs', m.carbs,
          'meal_type', m.meal_type,
          'source', m.source,
          'photo_url', m.photo_url,
          'created_at', m.created_at
        ) order by m.created_at
      ), '[]'::json)
      from meal_entries m
      where m.user_id = p_friend_id
      and m.created_at::date = p_date
    )
  ) into result;

  return result;
end;
$$;

-- Avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
