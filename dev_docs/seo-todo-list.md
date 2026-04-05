# SEO todo list — genta-website

Check items off as you complete or close them. “Investigate” means confirm current behavior, choose an approach, then implement if warranted.

## 1. Route split: marketing landing + interactive chat (Option B)

- [x] Add an SSR **landing page** at `/` with real HTML: primary **`<h1>`**, value proposition, waitlist (inline form or clear CTA), link to **Privacy**, and a primary CTA to the terminal (e.g. “Open terminal” / “Try Genta”).
- [x] Move the current client-only shell to a dedicated route (e.g. **`/chat`**) and keep **`dynamic(..., { ssr: false })`** there if the full chat UI must stay client-only. (`src/app/chat/page.tsx` → `chat-dynamic.tsx` → `dynamic(..., { ssr: false })`.)
- [x] Update internal links (`WaitlistOverlay`, header, privacy links, any `Link`/`href`/`router.push`) so they target `/` vs `/chat` correctly. (`CHAT_ROUTE` on landing/contact; chat shell links home to **`/`**; legal routes unchanged.)
- [x] Decide **redirects**: e.g. whether `/` should ever auto-redirect to `/chat` for returning users (usually avoid for SEO; prefer explicit CTA). (**No** `middleware` auto-redirect; marketing **`/`** stays the default entry.)
- [x] Revisit **waitlist gate** UX on `/chat`: modal on first visit vs always-visible link back to landing waitlist — pick one consistent story. (**Chosen:** no forced modal on first paint; waitlist opens from header / inline bot control; primary signup story remains the landing `#waitlist`.)

## 2. Investigate: root `metadata` and social previews

- [x] Set **`metadataBase`** to the production origin (e.g. `https://trygenta.com`) so relative URLs resolve for Open Graph and canonicals. (`src/app/layout.tsx`.)
- [x] Replace generic **`description`** on the default layout with a user-facing, keyword-aligned one-line pitch (drop internal phrasing like “marketing site”). (Default in root layout; `/` uses `WAITLIST_OVERLAY.tagline` for a fuller pitch.)
- [x] Add **Open Graph** (`openGraph.title`, `description`, `url`, `siteName`, `locale`, and type where relevant). (Defaults in root layout; **`url`** set per route on `/`, `/chat`, `/privacy`, `/contact`.)
- [x] Add **Twitter card** metadata (`card`, `title`, `description`) aligned with OG. (`summary_large_image` in root; per-route **title** / **description** match OG.)
- [x] Use **`title.template`** or per-route titles so pages share a consistent pattern (e.g. `%s | Genta`) without clashing with `/privacy`. (**`%s · Genta`** in root layout; each page sets **`title`** only.)

## 3. Investigate: icons and share images

- [x] Add **`src/app/icon`** / **`apple-icon`** (or `public/favicon.ico`) so browser tabs and bookmarks are branded. (**`public/icons/`** — `favicon-16.png`, `favicon-32.png`, `favicon.ico`, **`apple-touch-icon.png`**, **`android-192.png`**, **`android-512.png`**; **`public/favicon.ico`** copy for legacy **`/favicon.ico`**; **`site.webmanifest`** with **`metadata.manifest`** in `layout.tsx`.)
- [ ] Add **`opengraph-image`** / **`twitter-image`** (file- or code-based) so link unfurls show intentional creative, not platform defaults.

## 4. Investigate: `robots.txt` and sitemap

- [ ] Add **`src/app/robots.ts`** (or `public/robots.txt`) with correct **`allow`/`disallow`** for production; confirm nothing blocks `/`, `/privacy`, or `/chat` unintentionally.
- [ ] Add **`src/app/sitemap.ts`** listing public indexable URLs (`/`, `/privacy`, `/chat` if indexable — otherwise exclude chat if you treat it as app-only).

## 5. Investigate: indexability of `/chat`

- [ ] Decide whether **`/chat`** should be **indexed** (rankable “try the product”) or **noindex** (pure app surface). If noindex, set **`robots: { index: false, follow: true }`** (or stricter) on that segment only and reflect that in the sitemap.

## 6. Investigate: structured data (optional)

- [ ] Evaluate **JSON-LD** for `Organization` / `WebSite` (and `WebPage` on landing) if you want richer results; keep it minimal and accurate.

## 7. Investigate: forms and progressive enhancement

- [ ] If the landing waitlist stays a client form, consider a **Server Action** or **POST** handler that accepts **`application/x-www-form-urlencoded`** so a no-JS or crawler-friendly `<form>` can still submit (accessibility + resilience).

## 8. Investigate: performance signals that affect SEO

- [ ] Run **Lighthouse** (or similar) on `/` after the landing ships; tune **LCP** (hero/static content), font loading, and JS shipped to the landing route (keep landing lean).

---

## Context (why this list exists)

- The previous home route used **`ssr: false`** for the shell, so **initial HTML carried almost no indexable content**.
- The waitlist lived in a **client dialog**; crawlers benefit from **server-rendered** copy and structure on `/` after Option B.
- There was **no sitemap or robots** configuration and **minimal** global metadata (no OG/Twitter, weak default description).
