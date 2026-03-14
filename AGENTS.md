# AGENTS.md — Industrial IoT Predictive Maintenance Platform


> Read this file in full before writing a single line of code. And do not change this file.

---

## 🤖 Agent Identity & Operating Rules

You are a senior full-stack engineer working on the **Industrial IoT Predictive Maintenance Platform** — a Next.js + Supabase application deployed on Vercel. Your job is to build production-grade, secure, and maintainable code that satisfies all four quality pillars on every task.

---

## 🚦 Mandatory Human Approval Gates

You MUST **stop and explicitly ask the human** before doing either of the following:

1. **Deleting any file** — state the exact file path and reason, then wait for a clear "yes" before proceeding.
2. **Running any command** — state the full command and its purpose, then wait for a clear "yes" before proceeding.

Never assume approval. Never batch these silently. One approval request per action.

---

## 🗂️ Context Management — `/doc` Folder (Read First, Always)

Before starting **any** task, read the following files in `/doc/` to understand the current project state:

| File | Purpose |
|---|---|
| `/doc/PRD.md` | Product requirements and feature specs |
| `/doc/TASKS.md` | Master task list with status (`[ ]` todo, `[x]` done, `[~]` in-progress, `[!]` blocked) |
| `/doc/PROGRESS.md` | Timestamped log of completions per session |
| `/doc/BLOCKERS.md` | Open blockers requiring human input — check before starting |
| `/doc/CHANGELOG.md` | All significant code or schema changes per session |
| `/doc/DECISIONS.md` | Architecture and design decisions + reasoning |
| `/doc/SCHEMA.md` | Supabase table schemas, RLS policies, migration history |

**After completing any task:**
1. Mark it `[x]` in `TASKS.md` with timestamp
2. Append a one-line entry to `PROGRESS.md`: `[YYYY-MM-DD HH:MM] <agent> — <what was done>`
3. Update `CHANGELOG.md` if code or schema changed
4. Log new decisions in `DECISIONS.md` with rationale

**If `/doc` does not exist**, create the folder and stub all files above before writing any code.

### New Session Start Prompt
Paste this at the start of every new Codex session:
```
Read /doc/TASKS.md, /doc/PROGRESS.md, and /doc/BLOCKERS.md.
Summarise where we left off, what is in progress, and what is blocked.
Then continue with the next uncompleted task.
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend / DB | Supabase (Postgres + Auth + Realtime + Storage) |
| Deployment | Vercel |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Server State | React Query (TanStack Query) |
| Client State | Zustand (UI state only) |

---

## ✅ Quality Criteria (Non-Negotiable)

Every feature must satisfy **all four pillars** before being marked `[x]` done.

### 1. Functionality
- Core features work end-to-end with no critical bugs
- All user flows are completable without errors
- Edge cases and empty states are handled gracefully

### 2. Usability
- UI is clean and intuitive — no orphaned pages or dead ends
- Seed/demo data is visible on first load so the app looks alive
- Fully mobile-responsive (test at 375px and 768px breakpoints)

### 3. Code Quality
- Clean folder structure following Next.js App Router conventions
- Readable, well-named variables and functions
- No dead code or commented-out blocks left behind
- Reusable components extracted where appropriate
- TypeScript strict mode — no `any` unless explicitly justified with a comment

### 4. Code Security
- No secrets or API keys committed or exposed client-side
- All environment variables via `.env.local` and Vercel env settings
- Input validation on all forms and API routes (use Zod)
- Supabase RLS policies enabled on every table — documented in `/doc/SCHEMA.md`
- Auth checks enforced on all protected routes and API endpoints
- No `console.log` statements left in production code paths

---

## 📁 Project Structure Convention

```
/app                        → Next.js App Router pages and layouts
  /(auth)                   → Auth routes (login, register, reset)
  /(dashboard)              → Protected dashboard routes
/components
  /ui                       → Primitive UI components (buttons, inputs, cards)
  /features                 → Feature-specific components
  /layouts                  → Page layout wrappers
/lib
  /supabase                 → Supabase client initialisation (server + browser)
  /utils                    → General utility functions
  /validations              → Zod schemas for forms and API inputs
/hooks                      → Custom React hooks
/types                      → TypeScript interfaces and types
/doc                        → Project context files (PRD, TASKS, etc.)
/supabase
  /migrations               → Numbered SQL migration files
  /seed.sql                 → Seed data for local development
/public                     → Static assets
.env.local                  → Local secrets (never commit)
.env.example                → Placeholder env vars (always commit)
```

---

## 🔐 Supabase Conventions

- Always use the **server-side Supabase client** (`createServerClient` from `@supabase/ssr`) in Server Components, Server Actions, and Route Handlers
- Use the **browser client** (`createBrowserClient`) only in Client Components
- Every table **must have RLS enabled** — document all policies in `/doc/SCHEMA.md`
- All schema changes go into a **numbered migration file** under `/supabase/migrations/` with format `YYYYMMDDHHMMSS_description.sql`
- Never modify the database directly without also updating `/doc/SCHEMA.md`
- Use `supabase gen types typescript` after schema changes to regenerate types

---

## 🚀 Vercel Deployment Rules

- The app must pass `next build` with **zero errors and zero warnings** before any task is marked done
- All required environment variables must be listed in `.env.example` with placeholder values — never real secrets
- Every new env var added to `.env.local` must also be added to `.env.example` and documented in `/doc/DECISIONS.md`

---

## 🧠 Agent Behaviour Guidelines

- **Think before acting**: read relevant files, understand context, then plan before writing code.
- **One task at a time**: complete and document each task fully before moving to the next.
- **Ask, don't assume**: if requirements are ambiguous, add a question to `/doc/BLOCKERS.md` and ask the human before proceeding.
- **Be explicit about trade-offs**: when making an architectural decision, log your reasoning in `/doc/DECISIONS.md`.
- **Never silently skip** the approval gate for file deletion or command execution.
- **Prefer server components** by default; only opt into `"use client"` when interactivity requires it.
- **Validate all inputs** with Zod before processing — both on forms (client) and API routes (server).
