# GrowKeeper

GrowKeeper is a plant care management SaaS for tracking plants, logging care events, and sending reminders.

This project uses:

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Supabase (database and authentication)

## Setup

1. **Install dependencies:**

```bash
npm install
```

1. **Configure Supabase:**

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your [Supabase project settings](https://app.supabase.com).

1. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Initial Project Structure

```text
src/
  app/
    dashboard/
      page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
      page-shell.tsx
    ui/
  config/
    site.ts
  features/
    plants/
    care-events/
    reminders/
  hooks/
  lib/
    date.ts
  types/
    plant.ts
```

## Next Steps

- Add authentication and user accounts.
- Add database models for plants, care events, and reminders.
- Build CRUD flows for plant profiles and care logs.
- Add scheduled reminder delivery.
