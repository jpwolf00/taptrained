-- 002_venue_name_for_code.sql
-- Lets the public /join page greet staff with their venue's name from an
-- invite code (e.g. "Join Rivertown Brewing's team"). Safe to expose: an
-- invite code is already a shareable secret, and this only reveals the name.
--
-- Run in the Supabase SQL editor. The /join page works without it (it just
-- falls back to generic copy), so this migration is optional.

create or replace function venue_name_for_code(p_code text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select name from venues where invite_code = upper(trim(p_code));
$$;

grant execute on function venue_name_for_code(text) to anon, authenticated;
