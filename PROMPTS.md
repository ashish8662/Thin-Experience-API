# Claude Code Prompts

## Prompt 1 – Architecture
"Read SPEC-A-architecture.md and propose a clean TypeScript folder structure
with minimal abstractions and testability in mind."

✔ Accepted structure as-is.

---

## Prompt 2 – API Contracts
"Read SPEC-B-api.md and generate TypeScript interfaces and route handlers
without implementation."

✔ Minor edits to naming.

---

## Prompt 3 – Implementation
"Using SPEC-A and SPEC-B, implement the ExperienceCartService and
SalesforceCartClient test double with context expiry."

✔ Accepted logic, added explicit TTL tests.

---

## Prompt 4 – Tests
"Write Jest unit tests covering:
- Cart recreation after expiry
- Add item happy path
- Idempotent getCart behavior"

✔ Added edge case tests manually.
