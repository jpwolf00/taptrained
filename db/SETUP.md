# Supabase setup — owner checklist

This is the part only you (Jason) can do, because it involves account creation and
secret keys. ~10 minutes. Claude Code wrote all the SQL; you just click and paste.

## 1. Create the Supabase project
1. Go to https://supabase.com → sign in → **New project**.
2. Name it (e.g. `taptrained`), pick a region near you, set a strong database password (save it).
3. Wait for it to finish provisioning (~2 min).

## 2. Run the schema
1. In the project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `db/schema.sql` from this repo, copy the whole file, paste it in.
3. Click **Run**. You should see "Success. No rows returned."
   - Harmless `NOTICE: policy ... does not exist, skipping` messages are expected.

## 3. Grab the keys (Project Settings → API)
Copy these three values:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ secret — server-side only, never commit it

## 4. Put them in your env
- Local dev: copy `.env.local.example` to `.env.local` and fill in the Supabase values
  (you already have the OpenRouter ones from the AI test step).
- Production: add the same vars in **Vercel → Project → Settings → Environment Variables**.

## 5. Email auth (default is fine for the POC)
Supabase Auth has email/password on by default. For the demo you can turn **off**
"Confirm email" (Authentication → Providers → Email) so test signups are instant —
just remember to turn it back on before any real use.

---

## What the schema sets up
- **Tables:** venues, profiles, menus, menu_items, questions, quiz_attempts.
- **Row-Level Security** on every table so one venue can never see another's data.
- **`create_venue_and_join(name, display_name)`** — admin signup: makes a venue + invite code.
- **`join_venue_with_code(code, display_name)`** — staff signup via invite code.
- **`publish_menu(menu_id)`** — publishes a menu and flags **new arrivals** by diffing
  against the venue's previously-published menu (powers the "What's New" quiz).

All of the above was validated locally against Postgres 16 before you ever see it.
