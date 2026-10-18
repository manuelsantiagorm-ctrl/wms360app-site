-- Ejecutar en SQL Editor del proyecto Supabase.
begin;
create table if not exists public.invitation_responses (
  id uuid primary key default gen_random_uuid(),
  food text not null check (food in ('No lo sé, escoge tú','Hamburguesa de Burger King','Tacos','Birria','Tacos de sal')),
  time text not null check (time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  created_at timestamptz not null default now()
);
alter table public.invitation_responses enable row level security;
revoke all on public.invitation_responses from anon, authenticated;
grant insert (food,time) on public.invitation_responses to anon, authenticated;
grant select on public.invitation_responses to authenticated;
drop policy if exists invitation_submit on public.invitation_responses;
create policy invitation_submit on public.invitation_responses for insert to anon, authenticated with check (true);
drop policy if exists invitation_admin_read on public.invitation_responses;
-- Reemplazar el UUID de ceros por el ID de TU usuario de Authentication > Users.
-- Hasta reemplazarlo, ninguna cuenta puede consultar las respuestas.
create policy invitation_admin_read on public.invitation_responses for select to authenticated
using ((select auth.uid()) = '00000000-0000-0000-0000-000000000000'::uuid);
commit;
