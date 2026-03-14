# Skill: Supabase + Postgres Best Practices

Supabase is the primary backend.

---

# Client Setup

Use centralized clients.

lib/supabase/client.ts

Environment variables must be used.

Never hardcode keys.

Required variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

---

# Database Design

Follow relational database best practices.

Rules:

• Use UUID primary keys
• Use proper foreign keys
• Normalize tables
• Avoid large JSON blobs
• Add indexes for frequently queried fields

Example columns:

id uuid primary key default gen_random_uuid()
created_at timestamptz default now()

---

# Row Level Security

RLS must be enabled on every table.

Policies must enforce:

auth.uid() = user_id

Never rely on frontend-only protection.

---

# Query Best Practices

Avoid:

select *

Prefer:

select id, name, created_at

Use filters and pagination.

Example:

limit 20
offset 0

---

# Mutations

All mutations must:

• verify authentication
• validate input
• return structured responses

---

# Migrations

All schema changes must be stored in:

supabase/migrations

Seed data must be placed in:

supabase/seed.sql