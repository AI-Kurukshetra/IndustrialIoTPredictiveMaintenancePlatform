# Skill: Code Security

Security is mandatory.

---

# Secrets

Never expose secrets in code.

Use environment variables.

Never commit:

SUPABASE_SERVICE_ROLE_KEY

---

# Authentication

All protected operations must verify user authentication.

Example pattern:

if (!user) {
  throw new Error("Unauthorized")
}

---

# Input Validation

All user inputs must be validated.

Use a schema validation library such as:

Zod

Validation must occur:

• on the client
• on the server

---

# Database Protection

Never trust frontend input.

All database operations must enforce:

• authentication
• authorization

---

# Error Handling

Never expose internal errors.

Return safe messages to users.

Log detailed errors internally.

---

# Rate Limiting

Sensitive operations should include:

• rate limiting
• abuse protection