-- VOYAGE private trip collaboration, run ONCE in your own Supabase project's SQL editor.
-- Requires Supabase Auth with Email OTP and the deployed GitHub Pages URL in Auth Redirect URLs.
-- This code does NOT create a Supabase project or enable sync automatically.
-- Uses core PostgreSQL gen_random_uuid() and md5(), no optional extension required.

create table if not exists public.voyage_trips (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  version bigint not null default 1 check (version > 0),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload)='object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.voyage_members (
  trip_id uuid not null references public.voyage_trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer','editor')),
  joined_at timestamptz not null default now(),
  primary key(trip_id,user_id)
);

create table if not exists public.voyage_invites (
  token_hash text primary key,
  trip_id uuid not null references public.voyage_trips(id) on delete cascade,
  role text not null check (role in ('viewer','editor')),
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default now()+interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users(id)
);
create index if not exists voyage_members_user_idx on public.voyage_members(user_id,trip_id);
create index if not exists voyage_invites_trip_idx on public.voyage_invites(trip_id,expires_at);

alter table public.voyage_trips enable row level security;
alter table public.voyage_members enable row level security;
alter table public.voyage_invites enable row level security;
-- A member can see their own membership; trip RLS reads this table without
-- recursively invoking policies that query voyage_trips again.
drop policy if exists voyage_members_read_self on public.voyage_members;
create policy voyage_members_read_self on public.voyage_members
 for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists voyage_trips_read on public.voyage_trips;
create policy voyage_trips_read on public.voyage_trips
 for select to authenticated
 using (owner=(select auth.uid()) or exists
  (select 1 from public.voyage_members m where m.trip_id=id and m.user_id=(select auth.uid())));
drop policy if exists voyage_trips_insert_owner on public.voyage_trips;
create policy voyage_trips_insert_owner on public.voyage_trips
 for insert to authenticated with check (owner=(select auth.uid()));
-- NO RLS policies for direct update/delete of trips/members/invites.
-- All edits must go through the role/locking RPC below.
revoke all on public.voyage_trips,public.voyage_members,public.voyage_invites from anon;
revoke update,delete on public.voyage_trips from authenticated;
revoke insert,update,delete on public.voyage_members,public.voyage_invites from authenticated;
grant select,insert on public.voyage_trips to authenticated;
grant select on public.voyage_members to authenticated;
revoke all on public.voyage_invites from authenticated;

create or replace function public.voyage_save(
 p_trip_id uuid,p_expected_version bigint,p_payload jsonb
) returns bigint language plpgsql security definer
 set search_path='' as $$
declare v_owner uuid;v_old bigint;v_auth uuid:=auth.uid();
begin
 if v_auth is null then raise exception 'LOGIN_REQUIRED';end if;
 if p_payload is null or jsonb_typeof(p_payload)<>'object'
   then raise exception 'INVALID_PAYLOAD';end if;
 if pg_column_size(p_payload)>1048576 then raise exception 'PAYLOAD_TOO_LARGE';end if;
 select t.owner,t.version into v_owner,v_old
 from public.voyage_trips t where t.id=p_trip_id for update;
 if not found then raise exception 'TRIP_NOT_FOUND';end if;
 if v_owner<>v_auth and not exists(
  select 1 from public.voyage_members m
  where m.trip_id=p_trip_id and m.user_id=v_auth and m.role='editor'
 ) then raise exception 'ACCESS_DENIED';end if;
 if v_old<>p_expected_version then raise exception 'VERSION_CONFLICT';end if;
 update public.voyage_trips set payload=p_payload,
  version=version+1,updated_at=now() where id=p_trip_id
  returning version into v_old;
 return v_old;
end $$;

create or replace function public.voyage_create_invite(
 p_trip_id uuid,p_role text
) returns text language plpgsql security definer
 set search_path='' as $$
declare v_auth uuid:=auth.uid();v_token text;
begin
 if v_auth is null then raise exception 'LOGIN_REQUIRED';end if;
 if p_role not in ('viewer','editor') then raise exception 'INVALID_ROLE';end if;
 if not exists(
  select 1 from public.voyage_trips t where t.id=p_trip_id
  and (t.owner=v_auth or exists(
    select 1 from public.voyage_members m where m.trip_id=t.id
    and m.user_id=v_auth and m.role='editor'))
 ) then raise exception 'ACCESS_DENIED';end if;
 v_token:=replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
 insert into public.voyage_invites(token_hash,trip_id,role,created_by)
 values(md5(v_token),p_trip_id,p_role,v_auth);
 return v_token;
end $$;

create or replace function public.voyage_accept_invite(
 p_token text
) returns uuid language plpgsql security definer
 set search_path='' as $$
declare v_auth uuid:=auth.uid();v_inv public.voyage_invites%rowtype;
begin
 if v_auth is null then raise exception 'LOGIN_REQUIRED';end if;
 if p_token is null or length(p_token)<30 or length(p_token)>100
   then raise exception 'INVALID_INVITE';end if;
 select * into v_inv from public.voyage_invites
  where token_hash=md5(p_token)
  for update;
 if not found or v_inv.used_at is not null or v_inv.expires_at<=now()
   then raise exception 'INVITE_EXPIRED_OR_USED';end if;
 if not exists(select 1 from public.voyage_trips where id=v_inv.trip_id)
   then raise exception 'TRIP_NOT_FOUND';end if;
 insert into public.voyage_members(trip_id,user_id,role)
 values(v_inv.trip_id,v_auth,v_inv.role)
 on conflict(trip_id,user_id) do update set
  role=case when public.voyage_members.role='editor' then 'editor'
            else excluded.role end;
 update public.voyage_invites set used_at=now(),used_by=v_auth
  where token_hash=v_inv.token_hash;
 return v_inv.trip_id;
end $$;

revoke all on function public.voyage_save(uuid,bigint,jsonb) from public,anon;
revoke all on function public.voyage_create_invite(uuid,text) from public,anon;
revoke all on function public.voyage_accept_invite(text) from public,anon;
grant execute on function public.voyage_save(uuid,bigint,jsonb) to authenticated;
grant execute on function public.voyage_create_invite(uuid,text) to authenticated;
grant execute on function public.voyage_accept_invite(text) to authenticated;
