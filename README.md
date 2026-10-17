# Taaza

Taaza helps Indian families waste less food: scan your fridge, a grocery bill or an online order, see what expires first, cook it in time, or share extras with neighbours.

Built with Next.js 15 (App Router), Tailwind CSS 4, Supabase (Postgres, auth, row-level security) and Claude (reading photos and suggesting recipes).

## What works

| Screen | Route | What it does |
|---|---|---|
| Welcome | `/welcome` | Onboarding for signed-out visitors |
| Log in | `/login` | Google sign-in (Supabase OAuth) |
| Home | `/` | Kitchen list sorted by expiry, search, categories, "expires today" banner, mark items used or thrown |
| Scan | `/scan` | Take or upload a photo of a fridge shelf, bill or order screenshot → Claude lists the food with estimated days left → edit → save. Items can also be typed by hand. |
| Recipes | `/recipes` | Claude suggests 4 recipes that use the food expiring first, respecting the diet set in Profile |
| Report | `/report` | This month: items saved vs thrown, saved per week, most-thrown items, money saved (from bill prices) |
| Share | `/share` | Post extra food with a pickup window, see neighbours' posts, request food, mark your post as given |
| Profile | `/profile` | Name, email and photo from Google, family members, food preference, reminder settings, log out |
| Pricing | `/pricing` | Taaza Plus, ₹2,000/month, 200 scans (payments not connected yet) |

New users automatically get a profile and a "My Kitchen" household (database trigger).

## Not built yet

- Payments and the 7-day trial (button shows "Payments coming soon")
- The 200-scans-a-month limit is not enforced yet
- Family invites, daily reminder notifications, Hindi translation
- Location-based "nearby" filtering on Share (all open posts are shown)

## Setup

1. Install: `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API; the publishable key)
   - `ANTHROPIC_API_KEY` (console.anthropic.com → API keys). Server only, never sent to the browser.
3. In Supabase → Authentication → URL Configuration, set **Site URL** to your app URL and add these **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-DOMAIN/auth/callback`
4. The Google provider must be enabled in Supabase → Authentication → Sign In / Providers, with the Google Cloud OAuth client's redirect URI set to `https://eqwzvhaghhlhmxnjnico.supabase.co/auth/v1/callback`.
5. Run `npm run dev` and open http://localhost:3000

## Database

The schema lives in `supabase/migrations/` (already applied to the `taaza` Supabase project). Every table has row-level security: people only see their own kitchen's items and their family's profiles; open share posts are visible to all signed-in users.

## Scripts

- `npm run dev`: local dev server
- `npm run build` / `npm start`: production build
- `npm run lint`, `npm run typecheck`, `npm test`

## Image credits

The photos and illustrations in `public/images` were supplied for the mockups. Check each one's licence (several look like Freepik/stock images that need attribution or a paid licence) before a public launch.
