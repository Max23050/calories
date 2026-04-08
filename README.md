# Calories — AI-powered calorie tracker

React (Vite) + Supabase + OpenAI GPT-4o. Three ways to log food: photo, chat, or manual entry. Designed mobile-first, deployable as static site on Cloudflare Pages.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + react-router-dom v7
- **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions, Realtime)
- **AI**: OpenAI GPT-4o (Vision + Text), called only via Edge Function
- **Hosting**: Cloudflare Pages (static)

## Local setup

```bash
npm install
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migration from `supabase/migrations/001_initial.sql` in the SQL editor (it creates tables, RLS policies, and the `meal-photos` storage bucket).
3. Deploy the Edge Function:
   ```bash
   supabase functions deploy analyze-food
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
4. Copy `Project URL` and `anon key` from Project Settings → API into your `.env` (and into Cloudflare Pages env vars).

## Cloudflare Pages deploy

1. Push this repo to GitHub.
2. In Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Environment variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Add a `_redirects` file or rely on Pages SPA fallback (Pages auto-handles `index.html` for unknown routes when no static file matches — for safety this repo includes `public/_redirects`).

## Architecture notes

- The OpenAI key never touches the client. All AI calls go through `supabase/functions/analyze-food`, which is invoked from `src/lib/ai.js` via `supabase.functions.invoke`.
- Photos are compressed to ~1MB on the client (`src/lib/imageUtils.js`) before upload to the `meal-photos` bucket.
- After AI analysis, the user always sees an editable preview before saving — values can be corrected.
- Dashboard subscribes to `meal_entries` Realtime changes for the current user.

## Project structure

See the `src/` and `supabase/` directories.
