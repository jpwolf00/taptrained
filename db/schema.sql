-- TapTrained — database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor (see db/SETUP.md for the click-by-click).
--
-- Tenancy: every venue-scoped table carries venue_id and is protected by
-- Row-Level Security so one venue can never read another's data. Signup and
-- publish flows that need to cross RLS run through SECURITY DEFINER functions
-- with explicit checks.

-- =====================================================================
-- Extensions
-- =====================================================================
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- =====================================================================
-- Enums
-- =====================================================================
do $$ begin
  create type user_role as enum ('admin', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type menu_source as enum ('text', 'photo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type menu_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type question_category as enum ('recall', 'selling', 'scenario');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- Tables
-- =====================================================================
create table if not exists venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,           -- short, human-typeable
  created_at  timestamptz not null default now()
);

create table if not exists profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  venue_id     uuid not null references venues (id) on delete cascade,
  display_name text not null,
  role         user_role not null default 'staff',
  created_at   timestamptz not null default now()
);
create index if not exists profiles_venue_idx on profiles (venue_id);

create table if not exists menus (
  id           uuid primary key default gen_random_uuid(),
  venue_id     uuid not null references venues (id) on delete cascade,
  title        text not null,
  source_type  menu_source not null,
  raw_input    text,                          -- pasted text or note about the photo
  status       menu_status not null default 'draft',
  published_at timestamptz,                   -- set when published; drives "what's new" diff
  created_at   timestamptz not null default now()
);
create index if not exists menus_venue_idx on menus (venue_id);
create index if not exists menus_published_idx on menus (venue_id, published_at desc);

create table if not exists menu_items (
  id             uuid primary key default gen_random_uuid(),
  menu_id        uuid not null references menus (id) on delete cascade,
  name           text not null,
  style          text not null default '',
  abv            numeric(4,1),
  description    text,
  selling_points text,
  -- true if this beer was NOT on the venue's previously-published menu.
  -- Set by publish_menu(); powers the "New Arrivals" quiz + awareness badge.
  is_new         boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists menu_items_menu_idx on menu_items (menu_id);

create table if not exists questions (
  id            uuid primary key default gen_random_uuid(),
  menu_id       uuid not null references menus (id) on delete cascade,
  menu_item_id  uuid references menu_items (id) on delete cascade,  -- null = menu-wide
  category      question_category not null,
  prompt        text not null,
  choices       jsonb not null,              -- array of option strings
  correct_index int not null,
  explanation   text not null,
  created_at    timestamptz not null default now()
);
create index if not exists questions_menu_idx on questions (menu_id);
create index if not exists questions_item_idx on questions (menu_item_id);

create table if not exists quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  venue_id     uuid not null references venues (id) on delete cascade,
  menu_id      uuid not null references menus (id) on delete cascade,
  profile_id   uuid not null references profiles (id) on delete cascade,
  mode         text not null default 'quick',   -- 'quick' | 'new_arrivals' | 'full'
  score        int not null,
  total        int not null,
  completed_at timestamptz not null default now()
);
create index if not exists attempts_scoreboard_idx
  on quiz_attempts (venue_id, menu_id, profile_id, score desc);

-- =====================================================================
-- Helper: the current user's venue (SECURITY DEFINER so RLS policies can
-- consult profiles without recursing into profiles' own RLS).
-- =====================================================================
create or replace function current_venue_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select venue_id from profiles where id = auth.uid();
$$;

create or replace function current_role_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- Row-Level Security
-- =====================================================================
alter table venues       enable row level security;
alter table profiles     enable row level security;
alter table menus        enable row level security;
alter table menu_items   enable row level security;
alter table questions    enable row level security;
alter table quiz_attempts enable row level security;

-- venues: members can read their own venue. (Creation happens via RPC.)
drop policy if exists venues_select on venues;
create policy venues_select on venues
  for select using (id = current_venue_id());

drop policy if exists venues_update on venues;
create policy venues_update on venues
  for update using (id = current_venue_id() and current_role_is_admin());

-- profiles: you can read profiles in your venue; you can update your own.
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select using (venue_id = current_venue_id());

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles
  for update using (id = auth.uid());

-- menus: members read their venue's menus; admins write.
drop policy if exists menus_select on menus;
create policy menus_select on menus
  for select using (venue_id = current_venue_id());

drop policy if exists menus_write on menus;
create policy menus_write on menus
  for all using (venue_id = current_venue_id() and current_role_is_admin())
  with check (venue_id = current_venue_id() and current_role_is_admin());

-- menu_items: members read items of their venue's menus; admins write.
drop policy if exists menu_items_select on menu_items;
create policy menu_items_select on menu_items
  for select using (
    exists (select 1 from menus m where m.id = menu_id and m.venue_id = current_venue_id())
  );

drop policy if exists menu_items_write on menu_items;
create policy menu_items_write on menu_items
  for all using (
    current_role_is_admin() and
    exists (select 1 from menus m where m.id = menu_id and m.venue_id = current_venue_id())
  )
  with check (
    current_role_is_admin() and
    exists (select 1 from menus m where m.id = menu_id and m.venue_id = current_venue_id())
  );

-- questions: members read; admins write (review/edit/delete).
drop policy if exists questions_select on questions;
create policy questions_select on questions
  for select using (
    exists (select 1 from menus m where m.id = menu_id and m.venue_id = current_venue_id())
  );

drop policy if exists questions_write on questions;
create policy questions_write on questions
  for all using (
    current_role_is_admin() and
    exists (select 1 from menus m where m.id = menu_id and m.venue_id = current_venue_id())
  )
  with check (
    current_role_is_admin() and
    exists (select 1 from menus m where m.id = menu_id and m.venue_id = current_venue_id())
  );

-- quiz_attempts: you can read your venue's attempts (for the scoreboard) and
-- insert your own.
drop policy if exists attempts_select on quiz_attempts;
create policy attempts_select on quiz_attempts
  for select using (venue_id = current_venue_id());

drop policy if exists attempts_insert_self on quiz_attempts;
create policy attempts_insert_self on quiz_attempts
  for insert with check (
    profile_id = auth.uid() and venue_id = current_venue_id()
  );

-- =====================================================================
-- Signup RPCs (SECURITY DEFINER — create the first profile, which RLS can't)
-- =====================================================================

-- Short, unambiguous invite code (no 0/O/1/I).
create or replace function gen_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from venues where invite_code = code);
  end loop;
  return code;
end;
$$;

-- Admin signup: create a venue and make the caller its admin.
create or replace function create_venue_and_join(p_venue_name text, p_display_name text)
returns table (venue_id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'profile already exists for this user';
  end if;

  v_code := gen_invite_code();
  insert into venues (name, invite_code) values (p_venue_name, v_code)
    returning id into v_id;
  insert into profiles (id, venue_id, display_name, role)
    values (auth.uid(), v_id, p_display_name, 'admin');

  return query select v_id, v_code;
end;
$$;

-- Staff signup: join an existing venue by invite code.
create or replace function join_venue_with_code(p_code text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'profile already exists for this user';
  end if;

  select id into v_id from venues where invite_code = upper(trim(p_code));
  if v_id is null then
    raise exception 'invalid invite code';
  end if;

  insert into profiles (id, venue_id, display_name, role)
    values (auth.uid(), v_id, p_display_name, 'staff');
  return v_id;
end;
$$;

-- =====================================================================
-- Publish RPC — flips a menu to published and computes new-arrivals diff
-- against the venue's previously-published menu (by case-insensitive name).
-- =====================================================================
create or replace function publish_menu(p_menu_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venue uuid;
  v_prev_menu uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select venue_id into v_venue from menus where id = p_menu_id;
  if v_venue is null then
    raise exception 'menu not found';
  end if;
  if not exists (
    select 1 from profiles
    where id = auth.uid() and venue_id = v_venue and role = 'admin'
  ) then
    raise exception 'not authorized to publish this menu';
  end if;

  -- Most recent previously-published menu for this venue (excluding this one).
  select id into v_prev_menu
  from menus
  where venue_id = v_venue and status = 'published' and id <> p_menu_id
  order by published_at desc
  limit 1;

  -- Flag new arrivals: items whose name isn't on the previous published menu.
  if v_prev_menu is null then
    -- First ever published menu: nothing is "new" relative to history.
    update menu_items set is_new = false where menu_id = p_menu_id;
  else
    update menu_items mi
    set is_new = not exists (
      select 1 from menu_items prev
      where prev.menu_id = v_prev_menu
        and lower(trim(prev.name)) = lower(trim(mi.name))
    )
    where mi.menu_id = p_menu_id;
  end if;

  update menus
  set status = 'published', published_at = now()
  where id = p_menu_id;
end;
$$;
