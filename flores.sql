-- Ejecuta este archivo completo una vez en SQL Editor de Supabase.
-- Conserva las respuestas anteriores de la invitación.
begin;
create table if not exists public.flower_responses (
  id uuid primary key default gen_random_uuid(),
  flower text not null check (flower in ('Rosas','Tulipanes','Girasoles','Peonías','Gerberas')),
  created_at timestamptz not null default now()
);
alter table public.flower_responses enable row level security;
revoke all on public.flower_responses from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant insert (flower) on public.flower_responses to anon, authenticated;
grant select on public.flower_responses to authenticated;
drop policy if exists flowers_submit on public.flower_responses;
create policy flowers_submit on public.flower_responses for insert to anon, authenticated with check (true);
drop policy if exists flowers_owner_read on public.flower_responses;
create policy flowers_owner_read on public.flower_responses for select to authenticated
using ((select auth.uid()) = 'f49ced05-8037-4d15-a675-8f472d4985ab'::uuid);
commit;
