# Friends Map

An interactive map where friends can pin their locations across different time periods (Summer 2026, 2026–2027, 2027–2028). Built with Next.js, MapLibre GL JS, and Supabase.

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/friendsmap.git
cd friendsmap
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy your **Project URL** and **anon public** key

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy to [Vercel](https://vercel.com) (recommended):

1. Push this repo to GitHub
2. Import the repo on Vercel
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in Vercel's project settings
4. Deploy

All users (local dev or production) share the same Supabase database, so entries are visible everywhere.
