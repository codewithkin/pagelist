# Pagelist — Copilot Instructions

This document defines **how** code is written in this monorepo. It is not a feature spec. Every rule here exists to prevent drift between platforms, duplication of logic, and architectural inconsistency. Read this before writing any code.

---

## Monorepo Mental Model

There are three kinds of code in this repo:

1. **Shared logic** — business rules, API calls, validation, hooks, types. Lives in `packages/`. Has zero knowledge of whether it runs on web or native.
2. **Platform rendering** — UI components, navigation, layout. Lives in `apps/web` or `apps/native`. Consumes shared logic, renders it appropriately for the platform.
3. **Server logic** — API routes, database access, auth. Lives in `apps/server`. Consumed by both frontends via the shared API client in `packages/`.

If you are writing something and asking "does this belong in apps or packages?" — apply this test: **could the other frontend use this without modification?** If yes, it belongs in `packages/`.

---

## Package Responsibilities

### `packages/db`
The single source of truth for data shape.

- Contains the database schema (Drizzle ORM preferred)
- Exports all table definitions, types inferred from schema, and relation definitions
- Never contains query logic — that lives in `apps/server`
- Types exported from here are the canonical types used across the entire monorepo
- Do not redefine entity types anywhere else; import them from `@pagelist/db`

```ts
// ✅ Correct — import canonical types from db package
import type { Book, Author } from '@pagelist/db'

// ❌ Wrong — redefining types that already exist in the db package
interface Book { id: string; title: string; ... }
```

### `packages/env`
Validates and exports environment variables using `t3-env` or `zod`.

- All env vars are validated here at startup — no raw `process.env` calls anywhere else in the codebase
- Server-only vars and client-safe vars are separated into distinct exports
- Both `apps/web` and `apps/server` import from `@pagelist/env`
- `apps/native` uses its own Expo-compatible env handling that mirrors the same variable names

```ts
// ✅ Correct
import { env } from '@pagelist/env'
const apiUrl = env.API_URL

// ❌ Wrong — raw process.env access outside the env package
const apiUrl = process.env.API_URL
```

### `packages/config`
Shared tooling configuration only. No runtime code.

- Exports base `tailwind.config.ts`, `tsconfig.json`, and `eslint` configs
- Each app extends these rather than defining its own from scratch
- The Tailwind config exported here is the design token source of truth — colors, fonts, spacing — used by both `apps/web` (via standard Tailwind) and `apps/native` (via NativeWind)
- If a design token changes, it changes here and propagates to both platforms

### `packages/ui`
Platform-aware shared components. This is the most nuanced package.

- Contains components that have both a web and a native implementation
- Uses a **platform file extension strategy**: `button.web.tsx` and `button.native.tsx` export the same API, resolved at build time by the respective bundler
- The component's **props interface** is defined in a shared `button.types.ts` file that both implementations import
- Do not put styling in this package — web components use Tailwind class strings, native components use NativeWind class strings, both sourced from `packages/config`
- React Native Reusables (from `reactnativeresusables.com`) components live in `apps/native` and are **not** re-exported through `packages/ui` — they are native-only primitives

```
packages/ui/
  src/
    button/
      button.types.ts       ← shared props interface
      button.web.tsx        ← Tailwind implementation
      button.native.tsx     ← NativeWind implementation
      index.ts              ← re-exports, bundler resolves the right file
    book-card/
      ...
```

---

## Cross-Platform Logic — The Core Rule

Business logic and data-fetching logic are **written once** and used by both platforms.

### Hooks (`packages/` — to be created as `packages/hooks`)

All hooks that are not rendering-specific live in a shared hooks package. A hook is rendering-agnostic if it only manages state, calls API functions, and returns data — it does not reference any JSX, DOM APIs, or React Native APIs.

```ts
// packages/hooks/src/use-book.ts
// ✅ Platform-agnostic — works on web and native identically
export function useBook(id: string) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBook(id).then(setBook).finally(() => setLoading(false))
  }, [id])

  return { book, loading }
}
```

If a hook needs platform-specific behavior (e.g. using `AsyncStorage` on native vs `localStorage` on web), use the same file extension strategy: `use-storage.web.ts` and `use-storage.native.ts` with a shared interface.

### API Client (`packages/` — to be created as `packages/api`)

The API client is shared. It is a thin typed wrapper over `fetch` (or `ky`/`ofetch`) pointing at `apps/server`.

- All API functions live here, typed against the server's response shapes using types from `packages/db`
- Neither `apps/web` nor `apps/native` makes raw `fetch` calls to the server — they always go through the API client
- The base URL is injected from `packages/env`

```ts
// packages/api/src/books.ts
export async function fetchBook(id: string): Promise<Book> {
  const res = await client.get(`/books/${id}`)
  return res.json()
}
```

### Validation Schemas

Zod schemas used for form validation and API response validation live in `packages/db` alongside the types they validate. Do not duplicate validation logic between web and native forms.

---

## `apps/web` — Next.js

- Uses the App Router. All pages are in `app/`
- Fetches data via server components where possible; falls back to client components with hooks from `packages/hooks` only when interactivity requires it
- All styling is Tailwind only — no inline styles, no CSS modules, no styled-components
- Imports UI components from `@pagelist/ui` — the bundler resolves `.web.tsx` automatically
- Never imports from `apps/native` or anything React Native-specific

### File Naming — Web
```
app/
  (marketing)/
    page.tsx
  (app)/
    books/
      [id]/
        page.tsx
components/           ← web-only components (not suitable for packages/ui)
  book-grid.tsx
  hero-banner.tsx
```

Web-only components (things that use Next.js-specific APIs, `<Image>`, `<Link>`, server actions) live in `apps/web/components`, not in `packages/ui`.

---

## `apps/native` — Expo

- Uses Expo Router with file-based routing — mirrors the web route structure where sensible
- All styling is NativeWind class strings — no `StyleSheet.create`, no inline style objects
- Uses React Native Reusables as the primitive component library for native-specific UI (dialogs, sheets, etc.) — these do not have web equivalents and are not abstracted
- Imports shared UI components from `@pagelist/ui` — the bundler resolves `.native.tsx` automatically
- Navigation-adjacent logic (deep links, tab state) stays in `apps/native`

### NativeWind ↔ Tailwind Correlation

Because both platforms source their design tokens from `packages/config/tailwind.config.ts`, class names are intentionally identical. When building a component for both platforms, write the class string once and apply it to both the web and native implementations.

```ts
// packages/ui/src/button/button.types.ts
export interface ButtonProps {
  label: string
  onPress?: () => void
  variant?: 'primary' | 'ghost'
  className?: string   // Tailwind/NativeWind class string — same on both platforms
}
```

```tsx
// button.web.tsx — className applied to <button>
// button.native.tsx — className applied to <Pressable> via NativeWind
```

---

## `apps/server`

- REST API (Hono preferred for edge-compatibility and type safety)
- All database access is here — no other app imports from `packages/db` at query time, only for types
- Route handlers are thin: validate input (using shared Zod schemas from `packages/db`), call a service function, return the result
- Service functions contain actual business logic and are testable in isolation
- Auth middleware is applied at the router level, not inside individual handlers

### File Structure — Server
```
src/
  routes/
    books.ts        ← route definitions, input validation, calls services
    authors.ts
  services/
    book-service.ts ← business logic, database queries
    author-service.ts
  middleware/
    auth.ts
  index.ts          ← app entry, mounts routers
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `book-card.tsx` |
| Components | PascalCase | `BookCard` |
| Hooks | camelCase, `use` prefix | `useBook` |
| API functions | camelCase, verb prefix | `fetchBook`, `createListing` |
| DB tables | snake_case | `book_listings` |
| Types from DB | PascalCase, singular | `Book`, `Author` |
| Env vars | SCREAMING_SNAKE | `API_BASE_URL` |
| Package names | `@pagelist/name` | `@pagelist/ui`, `@pagelist/db` |

---

## Import Rules

These are ordered by strictness.

1. `apps/server` may import from `packages/db`, `packages/env`, `packages/config`
2. `apps/web` may import from `packages/ui`, `packages/hooks`, `packages/api`, `packages/env`, `packages/config`
3. `apps/native` may import from `packages/ui`, `packages/hooks`, `packages/api`, `packages/env`, `packages/config`
4. `packages/ui` may import from `packages/config` only
5. `packages/hooks` may import from `packages/api`, `packages/db` (types only)
6. `packages/api` may import from `packages/db` (types only), `packages/env`
7. **No package may import from an app.** Ever.
8. **`apps/web` and `apps/native` may never import from each other.**

---

## What Never Gets Duplicated

If you find yourself writing the same thing in both `apps/web` and `apps/native`, stop. It belongs in packages. Specifically, these things are always shared:

- API call functions
- Form validation schemas
- Data transformation utilities
- Auth token handling logic
- Any hook that only uses `useState`, `useEffect`, `useCallback`, `useMemo`
- Error parsing and error boundary logic
- Date/currency formatting utilities

---

## Adding a New Feature — Checklist

1. Define or extend the DB schema in `packages/db`
2. Add or extend the Zod validation schema alongside the types
3. Add the server route + service in `apps/server`
4. Add the API client function in `packages/api`
5. Write the shared hook in `packages/hooks`
6. Build the shared UI component in `packages/ui` (web + native implementations)
7. Compose the screen/page in `apps/web` and `apps/native` using the above

This is the direction of dependency. Never start from step 6 and work backwards.