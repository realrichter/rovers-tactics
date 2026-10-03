-- =====================================================================
-- Cream Flow Rovers tactics board: database schema
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to re-run.
-- =====================================================================

-- 1. Who may edit. Add one row per co-manager (lower-case email).
create table if not exists public.editors (
  email text primary key
);
alter table public.editors enable row level security;
-- No policies on editors: the browser can never read or change this list.

-- 2. All board data: one JSON document per path.
--    'season/squad'      -> { "players": [...] }
--    'matches/<id>'      -> one match
create table if not exists public.board_docs (
  path        text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);
alter table public.board_docs enable row level security;

-- Explicit grants (newer Supabase projects no longer grant these automatically)
grant usage on schema public to anon, authenticated;
grant select on public.board_docs to anon, authenticated;
grant insert, update, delete on public.board_docs to authenticated;
revoke all on public.editors from anon, authenticated;

-- 3. Helper: is the signed-in user an editor?
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.editors e
    where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_editor() to anon, authenticated;

-- 4. Policies
drop policy if exists "board: anyone can read"   on public.board_docs;
drop policy if exists "board: editors insert"    on public.board_docs;
drop policy if exists "board: editors update"    on public.board_docs;
drop policy if exists "board: editors delete"    on public.board_docs;

-- Read access is public so players can open the link and see the lineup.
-- To make the board private, replace `using (true)` with
-- `using (public.is_editor())` and add `to authenticated`.
create policy "board: anyone can read" on public.board_docs
  for select using (true);

create policy "board: editors insert" on public.board_docs
  for insert to authenticated with check (public.is_editor());

create policy "board: editors update" on public.board_docs
  for update to authenticated using (public.is_editor()) with check (public.is_editor());

create policy "board: editors delete" on public.board_docs
  for delete to authenticated using (public.is_editor());

-- 5. Keep updated_at current
create or replace function public.touch_board_doc()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists board_docs_touch on public.board_docs;
create trigger board_docs_touch before update on public.board_docs
  for each row execute function public.touch_board_doc();

-- 6. Live sync between devices
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'board_docs'
  ) then
    alter publication supabase_realtime add table public.board_docs;
  end if;
end $$;

-- 7. EDIT THESE EMAILS, then run.
insert into public.editors (email) values
  ('raffael@example.com'),
  ('liam@example.com')
on conflict do nothing;
