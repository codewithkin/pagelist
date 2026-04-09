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

# PageList Design System Skill

## Purpose
This skill forces UI generation toward a **specific editorial-luxury web aesthetic** instead of the default AI stack of:
- generic shadcn dashboard cards
- gradient-heavy hero sections
- lucide icon spam
- rounded blobs and SaaS clichés
- excessive visual noise pretending to be polish

The target reference is a **quiet, premium, book-publisher-inspired storefront** based on the provided layout. The result should feel like:
- independent literary brand
- editorial landing page
- restrained luxury
- print-inspired composition
- calm confidence

PageList is a **digital bookstore for PDF books**. The interface should feel like a curated reading space, not a startup template.

---

## Core Design Philosophy

### 1. Editorial before startup
Design like a **book launch microsite** or **publisher catalogue**, not like a B2B app.

UI should prioritize:
- typography
- composition
- whitespace
- rhythm
- image framing
- calm hierarchy

Do **not** prioritize:
- bright productized gradients
- giant feature cards
- icon-led communication
- glassmorphism
- flashy motion
- "tech" visual language

### 2. Quiet luxury, not visual hype
The reference works because it is understated. It uses:
- warm neutrals
- thin dividers
- serif-display typography
- compact navigation
- restrained accent color
- spacious layouts

Every choice should feel deliberate, not decorative.

### 3. Books are the visual heroes
Book covers are the primary color and texture source in the interface. The system chrome should remain neutral so the content stands out.

### 4. Print logic over app logic
Think in terms of:
- spreads
- columns
- sections
- captions
- pull quotes
- catalogue rows
- editorial alignment

Not:
- widget stacks
- app tiles
- analytics blocks
- marketing feature grids

---

## Visual Identity

### Aesthetic keywords
Use these as the governing style language:
- editorial
- literary
- premium
- warm minimal
- cultured
- print-inspired
- restrained
- curated
- soft-neutral
- refined

### Anti-keywords
Avoid these completely:
- futuristic
- neon
- glassy
- cyber
- playful startup
- over-illustrated
- generic SaaS
- crypto aesthetic
- AI-generated dashboard feel
- Dribbble gradients

---

## Color System

The palette should come from the screenshot’s atmosphere: warm paper backgrounds, black type, muted grays, and a restrained golden accent.

### Base palette
```txt
Background / canvas:        #E9DFD1
Surface / card:             #F7F3EE
Surface alt / section:      #EFE7DD
Primary text:               #161312
Secondary text:             #4F463F
Muted text:                 #7A6F67
Hairline border:            #D8CEC2
Strong border:              #C7B9AA
Accent gold:                #D9A826
Accent gold hover:          #BF901D
Deep ink brown:             #241C18
White:                      #FFFFFF
```

### Color usage rules
- Use **warm off-white and paper tones** as the dominant surfaces.
- Keep black/ink text high contrast and elegant.
- Use the gold accent sparingly for:
  - buttons
  - active states
  - small highlights
  - inline emphasis
- Do not introduce random secondary brand colors unless content demands it.
- Book covers may add color, but UI framing must stay neutral.

### Strict prohibitions
- No large gradients.
- No electric blues, purples, or neon accents in the shell.
- No saturated CTA overload.
- No colored shadows.

---

## Typography System

Typography is the backbone of this system.

### Typeface roles
Use a **high-contrast editorial serif** for major headlines and a **clean readable sans-serif** for UI/body.

Recommended combinations:
- **Display serif:** Cormorant Garamond, DM Serif Display, Playfair Display, or Canela-like alternatives
- **UI sans:** Inter, Manrope, Instrument Sans, or Satoshi-like alternative

### Hierarchy

#### Display / Hero
- Large serif headlines
- Tight but elegant line-height
- Upper/lowercase preferred over all caps, except for occasional editorial labels
- Use scale, not boldness, for drama

#### Section headings
- Serif or refined small-caps styling
- Spacious, not heavy
- Often left-aligned

#### Body
- Sans-serif
- Moderate line-height
- Slightly smaller than default SaaS body copy
- Comfortable reading width

#### Labels / metadata / nav
- Small uppercase or tightly tracked sans-serif
- Light weight
- Conservative sizing

### Typography rules
- Avoid oversized bold sans-serif hero headlines.
- Avoid trendy oversized gradient text.
- Avoid too many font weights.
- Let typography create elegance through proportion and spacing.

### Suggested scale
```txt
Hero display:      64–92px
H1:                44–56px
H2:                30–40px
H3:                22–28px
Body large:        18–20px
Body:              15–17px
Small/meta:        11–13px
```

---

## Layout Principles

### Overall structure
The reference uses a **magazine-like modular grid** with large content blocks and vertical rhythm.

Use:
- wide outer margins
- generous section padding
- clean columns
- strong alignment
- full-width sections broken into editorial modules

### Grid behavior
Desktop:
- 12-column grid or equivalent custom editorial grid
- allow asymmetry when composition benefits from it
- hero can be split into content column + visual column

Tablet:
- compress into balanced stacked sections
- preserve breathing room

Mobile:
- collapse cleanly
- keep hierarchy intact
- do not convert everything into generic stacked cards with thick shadows

### Spacing rhythm
Use a spacing scale that feels print-like rather than app-like.

Suggested spacing tokens:
```txt
4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

But favor:
- 24+
- 32+
- 48+
- 64+

This system should breathe.

---

## Shape Language

### Corners
- Soft but restrained corner radii
- Mostly **8px to 20px**
- Large containers can use 20–28px if needed
- Avoid pill overload

### Borders
- Thin borders are important
- Use hairline separators and subtle framing
- Border usage should evoke paper sections and catalogue framing

### Shadows
- Very soft, nearly invisible
- Prefer layering through color and border rather than obvious shadows
- No floating dashboard cards with aggressive blur

---

## Components

## Buttons
Buttons should feel like editorial action markers, not app-store CTAs.

### Primary button
- warm gold fill
- dark text
- compact height
- modest horizontal padding
- square-to-soft corners
- no icon unless absolutely necessary

### Secondary button
- neutral surface
- thin border
- dark text

### Button rules
- No gradient buttons
- No giant rounded-full pills
- No left icons by default
- No excessive hover animation

Example tone:
- “Browse PDFs”
- “Read Sample”
- “View Collection”
- “Continue Reading”

## Navigation
Navigation should be small, quiet, and confident.

Rules:
- small uppercase or micro-sans links
- wide horizontal spacing
- no chunky nav pills
- no heavy underline effects
- use a very clean top bar

Logo/wordmark should feel literary, not technical.

## Cards
Avoid generic SaaS cards.

Use cards only when they resemble:
- book listings
- editorial blocks
- quote panels
- collection modules
- author or publisher sections

Card behavior:
- thin border or soft paper background
- minimal shadow
- image-led
- generous padding

## Book item
A book item is one of the core primitives.

Structure:
- cover image
- title
- author or imprint
- short format/meta line
- optional price or CTA

Rules:
- cover image should dominate
- text beneath should be elegant and compact
- do not clutter with badges, ratings, icons, and gimmicks

## Quote / testimonial block
Treat as a pull quote.

Style:
- centered or offset in a spacious block
- serif or italicized body
- quiet attribution line
- lots of negative space

## Newsletter / signup
Should feel like a magazine subscription panel.

Style:
- framed section
- one clear headline
- one sentence of supporting copy
- refined input + button row
- no noisy trust badges

## Footer
Footer should be structured like a publishing site.

Possible sections:
- PageList summary
- Browse
- Collections
- Account
- Newsletter
- Social links kept subtle

Use thin dividers and muted text.

---

## Imagery Rules

### Photography
When using photography:
- keep it warm and natural
- avoid hyper-commercial stock imagery
- favor candid, editorial, intimate scenes
- framing should feel like an author portrait, reading moment, or bookshelf scene

### Product images
For PageList, book/PDF covers are primary assets.

Rules:
- show covers clearly
- avoid excessive 3D mockup gimmicks
- use flat cover presentation or subtle realistic depth
- let cover art bring vibrancy

### Decorative graphics
Allowed only if subtle:
- faint botanical lines
- paper textures
- quiet ornaments
- divider flourishes

Never let decoration overpower content.

---

## Motion Principles
Motion should be nearly invisible.

Use:
- soft fade-ins
- subtle translateY on reveal
- gentle hover shifts
- smooth opacity transitions

Avoid:
- springy bounce everywhere
- spinning icons
- oversized parallax
- flashy entrance choreography
- motion that makes the design feel like a tech landing page

Recommended timing:
- 160ms to 280ms for interactions
- 300ms to 500ms for reveals

Easing should feel calm and polished.

---

## Content Tone
Copy should match the visual system.

Use language that is:
- calm
- literate
- confident
- concise
- curated

Avoid copy that sounds like:
- hyper-growth SaaS
- startup hustle culture
- over-enthusiastic product marketing
- generic AI-generated persuasion

Good direction:
- “Curated reads for thoughtful readers.”
- “Browse independent titles in digital format.”
- “A quieter way to discover your next book.”

Bad direction:
- “Supercharge your reading workflow.”
- “Unlock powerful reading experiences.”
- “Revolutionary PDF commerce platform.”

---

## PageList-Specific UI Translation

This reference image is author-centric. For PageList, translate it into a **curated digital bookstore**.

### Keep from the reference
- warm neutral palette
- serif-led editorial hierarchy
- premium spacing
- large content-led hero
- modular catalogue sections
- soft panels and thin borders
- restrained gold accents

### Adapt for PageList
Replace author-site modules with bookstore modules:
- New Release → Featured PDF / Editor’s Pick
- About Me → About PageList / Why this collection exists
- Podcast / interview modules → Reading lists / curated shelves / featured publishers
- Testimonials → reader notes / editorial recommendations
- Newsletter → new release digest
- Book grid → catalogue of PDF titles

### Possible homepage structure
1. Quiet top nav
2. Featured release hero
3. Curated collections
4. New and notable titles
5. Publisher or author spotlight
6. Reading quote or editorial statement
7. Membership/newsletter block
8. Footer

---

## shadcn Override Rules

If shadcn is used, it must be **subordinated** to this system. Do not let default component styling dictate the product identity.

### What to override immediately
- default radius tokens
- default shadows
- default muted colors
- default card look
- default button sizing
- default input styling
- default font stack

### shadcn usage rules
- Use shadcn as a structural primitive library, not as a design language.
- Strip out anything that feels like a dashboard.
- Remove default visual signatures that make the UI look recognizable as “AI-made shadcn.”

### Specifically avoid
- Card + CardContent everywhere
- icons inside every button
- gradient hero banners
- dashboard sidebar patterns unless a page truly requires it
- default accordion/alert/dialog styling without customization

---

## CSS / Token Direction

### Suggested tokens
```css
:root {
  --background: #E9DFD1;
  --surface: #F7F3EE;
  --surface-alt: #EFE7DD;
  --foreground: #161312;
  --muted-foreground: #7A6F67;
  --border: #D8CEC2;
  --border-strong: #C7B9AA;
  --accent: #D9A826;
  --accent-hover: #BF901D;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-soft: 0 8px 30px rgba(22, 19, 18, 0.04);
}
```

### Font direction
```css
--font-display: "Cormorant Garamond", "DM Serif Display", serif;
--font-body: "Inter", "Manrope", sans-serif;
```

---

## AI Prompt Guardrails

When generating UI, follow these hard constraints:

1. Make the design editorial and literary, not startup-like.
2. Use warm neutral paper tones and restrained gold accents.
3. Use serif display typography for major headings.
4. Prefer thin borders and soft surfaces over shadows and gradients.
5. Avoid lucide-react icon overuse.
6. Avoid generic SaaS section patterns.
7. Let book covers and typography create visual interest.
8. Keep motion subtle and premium.
9. Preserve spacious layout and calm hierarchy.
10. The result should feel like a premium bookstore or publisher website, not a dashboard template.

---

## Copy-Paste Build Prompt

Use this when asking AI to generate PageList UI:

```md
Design this interface for PageList as a premium editorial digital bookstore. The visual language must be based on a warm neutral, print-inspired, literary aesthetic — not a generic shadcn SaaS dashboard.

Use:
- warm paper backgrounds
- thin borders
- serif display typography for major headings
- refined sans-serif for body and navigation
- restrained gold accents
- spacious layout
- modular editorial sections
- subtle shadows only
- book covers as the main source of color

Avoid:
- gradients
- glassmorphism
- default shadcn card aesthetics
- dashboard vibes
- lucide-react icon spam
- loud CTA styling
- startup hero patterns

The UI should feel like a curated publisher/bookshop website with quiet luxury and strong typographic hierarchy.
```

---

## Final Standard
Before approving any UI, ask:

- Does this look like a literary brand or like a startup template?
- If all icons disappeared, would typography and spacing still carry the design?
- Are the book covers the stars, or is the UI chrome competing with them?
- Does the page feel calm, premium, and curated?
- Would this still look good in mostly monochrome with only one accent color?

If the answer is no, it is drifting back into generic AI UI.
