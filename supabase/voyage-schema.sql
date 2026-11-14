-- VOYAGE V1 opt-in Supabase backend. Run once in an owned Supabase SQL editor.
-- Requires authentication (email OTP). NEVER expose service_role key in GitHub Pages.
-- Store only travel-plan JSON, not passwords, passport scans or payment credentials.
create table if not exists public.voyage_trips (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references auth.users(id) on delete cascade,
 payload jsonb not null,
 version bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint voyage_payload_object check (jsonb_typeof(payload) = 'object')
);
create table if not exists public.voyage_members (
 trip_id uuid not null references public.voyage_trips(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('viewer','editor')),
 added_at timestamptz not null default now(),
 primary key (trip_id,user_id)
);
create table if not exists public.voyage_invites (
 token_hash text primary key,
 trip_id uuid not null references public.voyage_trips(id) on delete cascade,
 created_by uuid not null references auth.users(id),
 role text not null check (role in ('viewer','editor')),
 expires_at timestamptz not null,
 uses integer not null default 0,
 max_uses integer not null default 10,
 check (max_uses > 0 and max_uses <= 100)
);
create table if not exists public.voyage_audit (
 id bigint generated always as identity primary key,
 trip_id uuid not null references public.voyage_trips(id) on delete cascade,
 actor uuid not null references auth.users(id),
 version bigint not null,
 changed_at timestamptz not null default now()
);
create index if not exists voyage_members_user_idx on public.voyage_members(user_id);
create index if not exists voyage_trips_owner_idx on public.voyage_trips(owner);
create index if not exists voyage_audit_trip_idx on public.voyage_audit(trip_id,changed_at desc);
alter table public.voyage_trips enable row level security;
alter table public.voyage_members enable row level security;
alter table public.voyage_invites enable row level security;
alter table public.voyage_audit enable row level security;

drop policy if exists voyage_trip_read on public.voyage_trips;
create policy voyage_trip_read on public.voyage_trips for select to authenticated
using (owner = (select auth.uid()) or exists (select 1 from public.voyage_members m where m.trip_id=id and m.user_id=(select auth.uid())));
drop policy if exists voyage_trip_insert on public.voyage_trips;
create policy voyage_trip_insert on public.voyage_trips for insert to authenticated
with check(owner=(select auth.uid()));
-- Updates are only allowed through version-checked function to prevent lost writes.
drop policy if exists voyage_member_self_read on public.voyage_members;
create policy voyage_member_self_read on public.voyage_members for select to authenticated
using(user_id=(select auth.uid()));
drop policy if exists voyage_audit_read on public.voyage_audit;
create policy voyage_audit_read on public.voyage_audit for select to authenticated
using(exists(select 1 from public.voyage_trips t where t.id=trip_id and (t.owner=(select auth.uid()) or exists(select 1 from public.voyage_members m where m.trip_id=t.id and m.user_id=(select auth.uid())))));

create or replace function public.voyage_save(p_trip_id uuid,p_expected_version bigint,p_payload jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); current_version bigint; new_version bigint;
begin
 if actor is null then raise exception 'AUTH_REQUIRED'; end if;
 if jsonb_typeof(p_payload)<>'object' then raise exception 'INVALID_PAYLOAD'; end if;
 if length(p_payload::text)>2000000 then raise exception 'PAYLOAD_TOO_LARGE'; end if;
 select t.version into current_version from public.voyage_trips t
 where t.id=p_trip_id and (t.owner=actor or exists (select 1 from public.voyage_members m where m.trip_id=t.id and m.user_id=actor and m.role='editor'))
 for update;
 if not found then raise exception 'NO_EDITOR_PERMISSION'; end if;
 if current_version<>p_expected_version then raise exception 'VERSION_CONFLICT'; end if;
 update public.voyage_trips set payload=p_payload,version=version+1,updated_at=now() where id=p_trip_id returning version into new_version;
 insert into public.voyage_audit(trip_id,actor,version)values(p_trip_id,actor,new_version);
 return new_version;
end $$;
revoke all on function public.voyage_save(uuid,bigint,jsonb) from public;
grant execute on function public.voyage_save(uuid,bigint,jsonb) to authenticated;

create or replace function public.voyage_create_invite(p_trip_id uuid,p_role text default 'editor')
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); token text:=gen_random_uuid()::text;
begin
 if actor is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_role not in ('viewer','editor') then raise exception 'INVALID_ROLE'; end if;
 if not exists(select 1 from public.voyage_trips where id=p_trip_id and owner=actor) then raise exception 'OWNER_ONLY'; end if;
 insert into public.voyage_invites(token_hash,trip_id,created_by,role,expires_at)
 values(encode(sha256(convert_to(token,'UTF8')),'hex'),p_trip_id,actor,p_role,now()+interval '7 days');
 return token;
end $$;
revoke all on function public.voyage_create_invite(uuid,text) from public;
grant execute on function public.voyage_create_invite(uuid,text) to authenticated;

create or replace function public.voyage_accept_invite(p_token text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); invited public.voyage_invites%rowtype;
begin
 if actor is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into invited from public.voyage_invites
 where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
 if not found or invited.expires_at<=now() or invited.uses>=invited.max_uses then raise exception 'INVITE_EXPIRED_OR_INVALID'; end if;
 if exists(select 1 from public.voyage_trips where id=invited.trip_id and owner=actor) then return invited.trip_id; end if;
 if not exists(select 1 from public.voyage_members where trip_id=invited.trip_id and user_id=actor) then
  insert into public.voyage_members(trip_id,user_id,role) values(invited.trip_id,actor,invited.role);
  update public.voyage_invites set uses=uses+1 where token_hash=invited.token_hash;
 end if;
 return invited.trip_id;
end $$;
revoke all on function public.voyage_accept_invite(text) from public;
grant execute on function public.voyage_accept_invite(text) to authenticated;
-- Recommended: enable Email OTP in Auth and configure the GitHub Pages URL under
-- Auth > URL Configuration > Redirect URLs.
-- Additional production hardening: CAPTCHA/rate limiting, monitoring, audit retention,
-- payload schema checks, backup policy, and automated RLS/security tests.
