# Skill: Next.js Best Practices

Stack: Next.js App Router + TypeScript

---

# Component Design

Rules:

• Prefer Server Components
• Use Client Components only when required
• Avoid unnecessary "use client"

---

# Folder Structure

app/
components/
lib/
hooks/

Do not place business logic inside UI components.

Business logic must live in:

lib/services

---

# Data Fetching

Prefer server-side data fetching.

Use:

- Server Components
- Server Actions
- API routes (only when necessary)

Avoid fetching data directly in client components.

---

# Performance

Rules:

• Avoid unnecessary re-renders
• Use streaming where useful
• Use dynamic imports for heavy components

---

# State Management

Prefer:

- React state
- URL state
- Server state

Avoid unnecessary global state.

---

# Error Handling

All async operations must include error handling.

Use:

- error boundaries
- try/catch

---

# Routing

Use the Next.js App Router.

Routes must follow clear naming.

Example:

/dashboard
/dashboard/machines
/dashboard/alerts