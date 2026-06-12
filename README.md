# TapTrained

A multi-tenant staff training app for craft breweries. Admins upload a beer menu (text or photo), AI generates a reusable quiz question bank focused on recommendations and selling points, and staff take short ~6-question quizzes on mobile. Includes a scoreboard showing who's trained and tracks new arrivals.

**Stack:** Next.js 16 (App Router) + Supabase (Postgres, Auth, RLS) + Tailwind CSS v4 + OpenRouter AI

**Status:** POC in progress. Demo (`/demo` page) is fully functional and live. Auth and admin/staff UIs coming next.

---

## Local setup

### Prerequisites
- Node 26+, npm 11+ (install via [Homebrew](https://brew.sh) if needed)
- PostgreSQL 16 (optional; only needed if you want to validate the schema locally before Supabase)
- `.env.local` with your API keys (see below)

### Environment variables

Copy [`.env.local.example`](.env.local.example) to `.env.local` and fill in:

```bash
# Supabase (get these from your Supabase project settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...  # ⚠️ keep this secret, server-side only

# OpenRouter (get your API key from https://openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-xxx...
OPENROUTER_MODEL=google/gemini-2.5-flash-lite
OPENROUTER_VISION_MODEL=google/gemini-2.5-flash-lite

# Local dev / Vercel URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note:** You don't need Supabase keys to test the demo locally — it falls back to sample data.

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test the AI pipeline

Without hitting the UI, smoke-test extraction + question generation:

```bash
npm run test:ai
```

Swap models:
```bash
OPENROUTER_MODEL=openai/gpt-4o-mini npm run test:ai
```

---

## Deployment

### Supabase setup

See [**db/SETUP.md**](db/SETUP.md) for the full checklist. TL;DR:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `db/schema.sql` in the SQL Editor
3. Grab your Project URL and API keys from Settings → API

### Vercel deployment

1. Push this repo to GitHub (e.g., `github.com/YOUR_USERNAME/taptrained`)
2. Go to [vercel.com](https://vercel.com) → Add New → Project → Import your repo
3. Add environment variables (same as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (set scope to **Production only**)
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
   - `OPENROUTER_VISION_MODEL`
4. Deploy. Your live URL will be `https://taptrained.vercel.app` (or custom domain)
5. In Supabase: **Authentication → URL Configuration → Site URL** → add your Vercel URL and any redirect URLs

---

## What's built

### ✅ Demo (`/demo` page)
- Paste a beer menu or snap a photo
- AI extracts beers and generates a question bank in ~10 seconds
- Short 6-question quiz with shuffled choices (no memorization bias)
- Score screen with "Retake" and "Try another menu" buttons
- Fully responsive, mobile-first design (taproom dark theme)

### ✅ AI layer
- **Extraction:** text parsing + photo OCR (vision model)
- **Generation:** Recommendation-focused quiz questions (35% scenario, 30% selling, 35% recall)
- **Grounding:** BJCP 2021 beer style guidelines injected into prompts; guest-request taxonomy maps loose requests ("a wheat beer") to style families
- **Models:** Configurable via `OPENROUTER_MODEL` env var; curated picker list in `src/lib/ai/config.ts`
  - Default: `google/gemini-2.5-flash-lite` (fastest, cheapest, ~$0.10/M)
  - Also tested: `xiaomi/mimo-v2.5`, `qwen/qwen3.6-flash`

### ✅ Database schema
- Tables: venues, profiles, menus, menu_items, questions, quiz_attempts
- Row-Level Security (RLS) on every table
- Signup RPCs: `create_venue_and_join()` (admin), `join_venue_with_code()` (staff)
- `publish_menu()` RPC diffs new arrivals and flags them for the "What's New" quiz

### 🔲 Auth + signup UI (next)
- Admin signup (create venue + get invite code)
- Staff signup (join with code, set display name)
- Session management (Supabase Auth client)

### 🔲 Admin ingestion UI (next)
- Upload menu (text or photo)
- Review extracted beers + edit if needed
- Publish to staff

### 🔲 Question review/edit UI (next)
- Edit questions before publishing
- Reorder by category
- Rebalance question mix

### 🔲 Staff quiz UI (next)
- Full short-sampled quiz (~6 questions)
- Always includes new arrivals
- Records score

### 🔲 Scoreboard (next)
- Staff scores for each menu
- "N new this week" badge
- Training progress

---

## Project structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── demo/page.tsx         # Demo quiz UI
│   │   ├── api/demo/route.ts     # Demo API (extraction + generation)
│   │   ├── globals.css           # Taproom dark theme (Tailwind v4)
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── config.ts         # Model configuration
│   │   │   ├── client.ts         # OpenRouter client factory
│   │   │   ├── extract.ts        # Text + photo extraction
│   │   │   ├── generate.ts       # Question generation
│   │   │   ├── prompts.ts        # System + user prompts
│   │   │   ├── types.ts          # Zod schemas
│   │   │   └── sample.ts         # Fallback sample data
│   │   └── beer/
│   │       ├── styles.ts         # BJCP 2021 beer styles (24 styles)
│   │       ├── guestRequests.ts  # Guest-request taxonomy (12 types)
│   │       └── reference/        # BJCP PDF (source of truth)
├── db/
│   ├── schema.sql                # Full Postgres schema + RLS + RPCs
│   └── SETUP.md                  # Owner deployment checklist
├── scripts/
│   └── test-ai.ts                # Smoke test: extraction + generation
├── .env.local.example            # Environment variable template
└── README.md                      # This file
```

---

## Key decisions

- **AI provider:** OpenRouter (not Anthropic) — ~10x cheaper, multi-provider choice, same OpenAI API
- **Beer knowledge:** BJCP 2021 Style Guidelines injected into every generation prompt (no hallucination)
- **Question focus:** Recommendation scenarios (35%) + selling skills (30%) + recall (35%) — goal is guest satisfaction and staff confidence
- **Quiz format:** Short sampled (~6 questions per session), never the full bank — high completion rate, daily nudge to learn what's new
- **New arrivals:** `publish_menu()` diffs current tap list vs. previously published, flags new beers, short "What's New" quiz always includes them
- **Model tuning:** Gemini flash-lite is 4.6x faster than qwen flash and 3.5x cheaper; question quality is equivalent for this use case

---

## Roadmap

**Phase 2:** Auth + signup UI (admin creates venue, staff joins with code)  
**Phase 3:** Admin ingestion + question review UI  
**Phase 4:** Staff quiz + scoreboard  
**Phase 5:** Analytics, staff leaderboards, multi-location support

---

## Notes for developers

- **Tailwind v4:** Uses `@theme inline` in `globals.css` (CSS variables, not `tailwind.config.js`)
- **Zod validation:** All AI model output is validated at runtime; malformed JSON is defensively parsed
- **RLS:** Server-side queries use `SUPABASE_SERVICE_ROLE_KEY`; client-side use `NEXT_PUBLIC_SUPABASE_ANON_KEY` with RLS policies enforcing venue isolation
- **Photo upload:** Client-side Canvas downscale (max 1400px, JPEG 0.82) keeps payloads small
- **Model configuration:** Three layers of priority: explicit `model` param → env var → fallback default. Admin picker (future) will override all three

---

## Questions?

Check the BJCP 2021 guidelines at `src/lib/beer/reference/` for beer knowledge validation. All prompt templates and style facts are in `src/lib/`.
