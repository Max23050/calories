-- Profiles
create table if not exists profiles (
  id uuid references auth.users primary key,
  daily_calories_goal int default 2000,
  daily_protein_goal int default 150,
  daily_fat_goal int default 70,
  daily_carbs_goal int default 250,
  created_at timestamptz default now()
);

-- Meal entries
create table if not exists meal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  calories int not null,
  protein numeric(5,1) not null,
  fat numeric(5,1) not null,
  carbs numeric(5,1) not null,
  weight_g int,
  source text check (source in ('photo', 'chat', 'manual')) not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  photo_url text,
  created_at timestamptz default now()
);

create index if not exists meal_entries_user_date_idx
  on meal_entries (user_id, created_at desc);

-- RLS
alter table meal_entries enable row level security;
drop policy if exists "Users see own entries" on meal_entries;
create policy "Users see own entries" on meal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table profiles enable row level security;
drop policy if exists "Users see own profile" on profiles;
create policy "Users see own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Enable Realtime for meal_entries
alter publication supabase_realtime add table meal_entries;

-- Storage bucket for meal photos (public read)
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read meal-photos" on storage.objects;
create policy "Public read meal-photos" on storage.objects
  for select using (bucket_id = 'meal-photos');

drop policy if exists "Users upload own meal-photos" on storage.objects;
create policy "Users upload own meal-photos" on storage.objects
  for insert with check (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own meal-photos" on storage.objects;
create policy "Users delete own meal-photos" on storage.objects
  for delete using (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
