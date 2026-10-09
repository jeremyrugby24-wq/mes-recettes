-- Mes recettes : planning personnel
-- À exécuter une seule fois dans Supabase > SQL Editor > New query.

create table if not exists public.user_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  portions integer not null default 1 check (portions between 1 and 20),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint user_recipes_one_recipe_per_user unique (user_id, recipe_id)
);

create index if not exists user_recipes_user_id_idx
  on public.user_recipes (user_id);

alter table public.user_recipes enable row level security;

grant select, insert, update, delete on public.user_recipes to authenticated;

drop policy if exists "Users can read their own planned recipes" on public.user_recipes;
create policy "Users can read their own planned recipes"
  on public.user_recipes for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own planned recipes" on public.user_recipes;
create policy "Users can add their own planned recipes"
  on public.user_recipes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own planned recipes" on public.user_recipes;
create policy "Users can update their own planned recipes"
  on public.user_recipes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own planned recipes" on public.user_recipes;
create policy "Users can delete their own planned recipes"
  on public.user_recipes for delete
  to authenticated
  using ((select auth.uid()) = user_id);
