# Personal Finance Tracker

A full-stack personal finance tracker: several bank accounts, income and expenses by category, a warning when a category's monthly limit is exceeded, and a monthly summary per account.

**TypeScript end to end**: NestJS (REST API) + Next.js (web) + PostgreSQL. 

## Live demo

| | URL |
|---|---|
| Web application | `https://finance-tracker-black-sigma.vercel.app` |
| REST API | `https://finance-tracker-api-pza6.onrender.com` (health check: `/health`) |

> **The first request can be slow (up to a minute).** The API (Render free tier) and the database (Neon) both sleep when idle. The UI shows a message while they wake up; after that everything is fast.
> There is **no authentication** (single-user demo): all data is shared.

## Features

Accounts (checking, savings, cash; an account with transactions cannot be deleted), transactions (income/expense, balance never below zero), categories with an optional monthly limit (exceeding it **warns** but still records the transaction), and a monthly summary per account (income, expenses, net, spending per category with progress towards each limit).

## Tech stack

NestJS 12 + `@nestjs/cqrs` + `class-validator` · Prisma 6 + PostgreSQL (Neon) · Next.js 16 (App Router) + React + Tailwind CSS + TanStack Query 5 · Vitest (backend and frontend) · Vercel / Render / Neon.

## Getting started (local)

**Prerequisites:** Node.js 24.9+ (NestJS 12 packages are ESM-only; `.nvmrc` provided), npm, and a PostgreSQL database (a free [Neon](https://neon.tech) project works; use the **direct** connection string, without `-pooler`).

```bash
# Backend
cd backend
cp .env.example .env          # set DATABASE_URL (keep PORT=4000)
npm install
npx prisma migrate deploy
npm run start:dev             # http://localhost:4000

# Frontend
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000
```

A fresh database has **no categories**: create a few from the Categories screen first (e.g. *Food* with a limit, *Salary* without).

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL URL (direct, `sslmode=require`) |
| `PORT` | backend | HTTP port (`4000` locally) |
| `CORS_ORIGIN` | backend | Frontend URL(s), comma-separated (empty = all, dev only) |
| `NEXT_PUBLIC_API_URL` | frontend | API base URL (read at build time) |
| `NEXT_PUBLIC_CURRENCY` | frontend | Currency label (default `€`) |

## Tests

```bash
cd backend  && npm test
cd frontend && npm test
```

No database needed: business rules are pure functions and handlers are tested against fake repositories. They pass on a clean checkout (`git clone`, `npm ci`, `npm test`).

**Edge cases covered, beyond the happy path:**

- Balance reaching **exactly zero** is allowed; one cent below is refused and nothing is written.
- Spending that **exactly reaches** a limit gives no warning; one cent more does.
- A transaction over the limit is **still recorded**, with a warning in the response.
- A category **without a limit** triggers no spending query.
- The monthly total uses the **transaction's month**, not today's; December to January rollover; invalid month strings.
- Renaming a category to **its own name** is accepted; to another's name (any case) is refused.
- `null` removes a limit, whereas an absent field leaves it untouched.
- Summary: empty month, with/without limit, 79 % vs 80 % vs 100 % vs over, sorting.
- Missing account or category; deleting an account that has transactions.

## Architecture

```
backend/src/   accounts/ categories/ transactions/   (commands, queries, domain, infrastructure, dto)
               summary/ (read-only)  shared/  prisma/  health/
frontend/      app/ (routes)  components/ (by feature)  lib/ (api client, money, dates, hooks, types)
```

### Backend: CQRS with ports and adapters

```
Write: HTTP ─► Controller ─► CommandBus ─► Handler ─► Repository (abstract) ◄─ PrismaXxxRepository
                                              └─► domain policies (pure functions, no I/O)
Read:  HTTP ─► Controller ─► QueryBus ─► Handler ─► Prisma (read only) ─► DTO
```

- **Commands** (`CreateAccount`, `DeleteAccount`, `CreateCategory`, `UpdateCategory`, `AddTransaction`) change state and hold the business rules. One handler each.
- **Queries** (`GetAccounts`, `GetAccount`, `GetCategories`, `GetTransactions`, `GetMonthlySummary`) never modify anything and read directly from the database. `SummaryController` only injects the `QueryBus`, so it cannot write.
- The separation is **logical** (same database, no event sourcing), the right size for this scope.

### Where each business rule lives

| Rule | Implemented in | Tested in |
|---|---|---|
| Account with transactions cannot be deleted | `DeleteAccountHandler` | `delete-account.handler.spec.ts` |
| Balance never below zero | `balance.policy.ts` (early error) **and** a conditional `UPDATE` in `PrismaTransactionRepository` (race-safe) | `balance.policy.spec.ts`, `add-transaction.handler.spec.ts` |
| Over-limit expense: allowed, with a warning | `budget.policy.ts` + `AddTransactionHandler` | `budget.policy.spec.ts`, handler spec |
| Unique category names (case-insensitive) | `CreateCategoryHandler`, `UpdateCategoryHandler` | both handler specs |
| Monthly totals and progress | `summary/domain/monthly-summary.ts` | `monthly-summary.spec.ts` |

### SOLID in practice

- **Single responsibility**: one handler per use case; rules are small pure functions (`computeNewBalance`, `evaluateBudget`, `buildMonthlySummary`); controllers only translate HTTP into messages.
- **Open/closed**: a new feature is a new command/query plus its handler; existing handlers are untouched.
- **Liskov**: any repository implementation can replace the Prisma one (the tests use fakes).
- **Interface segregation**: one small repository contract per aggregate, no generic catch-all.
- **Dependency inversion**: handlers depend on abstract classes (needed as NestJS injection tokens); binding is one line per module, e.g. `{ provide: AccountRepository, useClass: PrismaAccountRepository }`.

### Safe balance updates

Inserting a transaction and updating the balance run in **one SQL transaction**. For expenses the update is conditional (`UPDATE ... WHERE balance >= amount`): if two expenses race, PostgreSQL locks the row and the second fails cleanly. The handler also checks first, only to return a clear error early.

### Frontend

- Thin Server Component pages rendering client components (forms and mutations need client state).
- **TanStack Query** for server state, with cache invalidation after each write (a new transaction refreshes accounts, transactions and summaries).
- **One API client** (`lib/api.ts`) normalises every failure, including an unreachable server, into a single `ApiError`.
- **Two-level validation**: obvious mistakes are caught instantly in the browser; the API stays the source of truth and its errors are displayed.
- **UX**: shared `Alert` component (errors use `role="alert"`), limit status shown as text as well as colour, buttons disabled while saving, previous list kept (dimmed) while filtering, explanatory empty states.

## Data model

```
Account     id, name, type (CHECKING | SAVINGS | CASH), balance, createdAt
Category    id, name (unique), monthlyLimit (nullable)
Transaction id, accountId, categoryId, type (INCOME | EXPENSE), amount, date, note, createdAt
```

Money is stored as **integer cents**; `amount` is always positive and `type` gives the direction. Index on `(accountId, date)` for the summary.

## API reference

| Method and path | Purpose | Notable responses |
|---|---|---|
| `GET /health` | Liveness (no DB access) | `200` |
| `POST /accounts` | Create `{name, type, initialBalance?}` | `201`, `400` |
| `GET /accounts`, `GET /accounts/:id` | List / read | `404` |
| `DELETE /accounts/:id` | Delete | `204`, `409` if it has transactions |
| `POST /categories` | Create `{name, monthlyLimit?}` | `201`, `409` duplicate |
| `PATCH /categories/:id` | Update (`null` removes the limit) | `404`, `409` |
| `GET /categories` | List, sorted by name | |
| `POST /transactions` | Add `{accountId, categoryId, type, amount, date, note?}` | `201 {transaction, warnings[]}`, `422` insufficient funds, `404` |
| `GET /transactions?accountId&from&to` | List, newest first | |
| `GET /accounts/:accountId/summary?month=YYYY-MM` | Monthly summary | `400`, `404` |

Amounts are integer cents; dates are `YYYY-MM-DD`. A limit warning looks like `{ "type": "CATEGORY_LIMIT_EXCEEDED", "categoryName", "limit", "spent", "exceededBy" }`.

## Deployment

Neon (PostgreSQL, direct URL) · Render (API, free tier, Frankfurt; root `backend`, health check `/health`) · Vercel (frontend, root `frontend`). Migrations run **during the Render build** (`prisma migrate deploy`): a failing migration aborts the deploy and the previous version keeps serving.

## Design decisions and trade-offs

1. **Money as integer cents**, never floats; the frontend parses input from strings. Amounts are capped at 1,000,000,000 cents (PostgreSQL 32-bit `integer`); production would use `BigInt` or `Decimal`.
2. **`balance` is stored on the account** (denormalised): cheap reads, with correctness ensured by updating it in the same SQL transaction as the insert.
3. **Limits are evaluated per account and per month**, consistent with the summary "for an account and a month". A global limit across accounts is a plausible alternative.
4. **A transaction's month is the month of its date**, not today's. Dates are stored and displayed in UTC to avoid off-by-one-day shifts.
5. **A limit warning is data, not an error**: it is returned next to the saved transaction. It is computed *before* the insert, so with truly simultaneous requests it can be slightly imprecise (acceptable for a non-blocking warning).
6. **Reaching a limit exactly is not exceeding it**: no warning at 100 %; the summary shows `NEAR_LIMIT` from 80 %.
7. **The read side bypasses repositories** while the write side uses them: rules live on the write side.
8. **API types are duplicated in the frontend** (`lib/types.ts`) rather than shared. 
9. **Tooling choices**: Prisma 6 (newer majors changed CLI/client setup), Vitest instead of Jest (ESM-only NestJS 12 packages; SWC keeps decorator metadata), direct Neon URL instead of the pooler (long-running server with its own pool; migrations misbehave through the pooler).

## Not implemented

- **Bonus items** (transfers, Excel export, CI). The architecture is ready: a transfer is a new command reusing the atomic balance update on two accounts, an export is a new query, CI is a workflow running `npm ci && npm test` per package.
- Authentication and multi-user separation.
- Editing/deleting transactions, and pagination of the transaction list.
- End-to-end tests of the HTTP layer and the UI (rules are unit-tested; HTTP and UI flows were verified manually).