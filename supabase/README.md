# Supabase Setup

## 1. Schema

Run `schema.sql` in Supabase Dashboard → SQL Editor.

Creates:
- `sneakers` table with all columns
- Row Level Security (RLS) policies:
  - Anon users: can read `active = true` sneakers
  - Authenticated users: full CRUD access

## 2. Seed Data

Run `seed.sql` after schema.sql to insert 12 sample sneakers.

## 3. Admin User

In Supabase Dashboard → Authentication → Users → Add user:
- Email: your email address
- Password: secure password
- Auto-confirm: ✅

## 4. Environment Variables

Copy from Supabase Dashboard → Settings → API into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
