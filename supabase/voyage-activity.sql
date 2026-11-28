create schema if not exists voyage_internal;
revoke all on schema voyage_internal from public,anon,authenticated;
create table if not exists public.voyage_activity(
 id bigint generated always as identity primary key,
 trip_id uuid not null references public.voyage_trips(id) on delete cascade,
 actor_id uuid not null,
 actor_name text not null,
 trip_name text not null,
 kind text not null,
 detail text not null,
 created_at timestamptz not null default now()
);
alter table public.voyage_activity enable row level security;
revoke all on public.voyage_activity from public,anon,authenticated;
grant select on public.voyage_activity to authenticated;
create index if not exists voyage_activity_trip_recent on public.voyage_activity(trip_id,id desc);
drop policy if exists voyage_activity_read_member on public.voyage_activity;
create policy voyage_activity_read_member on public.voyage_activity for select to authenticated using
 (exists(select 1 from public.voyage_trips t where t.id=trip_id));
create or replace function voyage_internal.activity_log() returns trigger language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); nick text; title text; k text; label text; before_items jsonb; after_items jsonb; msg text; a int; b int;
begin
 if actor is null then return new; end if;
 select left(coalesce(nullif(raw_user_meta_data->>'nickname',''),'旅伴'),30) into nick from auth.users where id=actor;
 if nick is null then return new; end if;
 if TG_TABLE_NAME='voyage_members' then
   if new.user_id<>actor then return new; end if;
   select left(coalesce(payload->>'name','旅行'),100) into title from public.voyage_trips where id=new.trip_id;
   insert into public.voyage_activity(trip_id,actor_id,actor_name,trip_name,kind,detail) values(new.trip_id,actor,nick,title,'join','加入了旅行');
   return new;
 end if;
 if new.payload=old.payload then return new; end if;
 title:=left(coalesce(new.payload->>'name','旅行'),100);
 for k,label in select * from (values ('days','每日行程'),('wishlist','購物願望'),('packing','行李清單'),('foodWishlist','美食清單'),('countryReminderBy','旅行小提醒'),('expenses','費用'),('documents','機票住宿'),('ideas','行程名單'),('journal','旅行回憶'),('notes','旅行備註')) as fields(k,label) loop
  if new.payload->k is not distinct from old.payload->k then continue; end if;
  before_items:=old.payload->k;after_items:=new.payload->k;
  if k='days' then
   select coalesce(sum(case when jsonb_typeof(x)='array' then jsonb_array_length(x) else 0 end),0) into a from jsonb_array_elements(case when jsonb_typeof(before_items)='array' then before_items else '[]'::jsonb end) x;
   select coalesce(sum(case when jsonb_typeof(x)='array' then jsonb_array_length(x) else 0 end),0) into b from jsonb_array_elements(case when jsonb_typeof(after_items)='array' then after_items else '[]'::jsonb end) x;
  else
   a:=case when jsonb_typeof(before_items)='array' then jsonb_array_length(before_items) else 0 end;
   b:=case when jsonb_typeof(after_items)='array' then jsonb_array_length(after_items) else 0 end;
  end if;
  msg:=case when b>a then '新增了'||label||'（'||(b-a)||' 項）' when a>b then '刪除了'||label||'（'||(a-b)||' 項）' else '更新了'||label end;
  insert into public.voyage_activity(trip_id,actor_id,actor_name,trip_name,kind,detail) values(new.id,actor,nick,title,k,msg);
 end loop;
 if (new.payload->'name',new.payload->'startDate',new.payload->'city',new.payload->'budget') is distinct from (old.payload->'name',old.payload->'startDate',old.payload->'city',old.payload->'budget') then
 insert into public.voyage_activity(trip_id,actor_id,actor_name,trip_name,kind,detail) values(new.id,actor,nick,title,'settings','更新了旅行設定');
 end if;
 return new;
end $$;
revoke all on function voyage_internal.activity_log() from public,anon,authenticated;
drop trigger if exists voyage_activity_on_join on public.voyage_members;
create trigger voyage_activity_on_join after insert on public.voyage_members for each row execute function voyage_internal.activity_log();
drop trigger if exists voyage_activity_on_update on public.voyage_trips;
create trigger voyage_activity_on_update after update of payload on public.voyage_trips for each row execute function voyage_internal.activity_log();