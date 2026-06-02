# Launch Plan — Cloudflare Pages deployment

**Status:** Site builds and deploys successfully on Cloudflare Pages from the
`experiment/astro` branch. DNS not yet pointed.

This document groups remaining work into independent phases. Each phase is marked
**👤 Human** (needs manual decisions / domain knowledge) or **🤖 Agentic** (can be
automated).

---

## Phase 1 — Repo cleanup ✅ 🤖

**No dependencies.** Safe to run anytime on the `experiment/astro` branch.

### 1a. Delete dead Docker/VPS infrastructure

| File                                 | Reason                                      |
| ------------------------------------ | ------------------------------------------- |
| `Dockerfile`                         | Old Node SSR image build                    |
| `docker-compose.yml`                 | Traefik + container orchestration           |
| `.dockerignore`                      | Exclusively Docker-related                  |
| `.github/workflows/build-deploy.yml` | Builds Docker image → deploys to VPS runner |

### 1b. Delete old SvelteKit reference

| Path          | Size   | Reason                                                                  |
| ------------- | ------ | ----------------------------------------------------------------------- |
| `_reference/` | 268 KB | Full SvelteKit source. All components have Astro equivalents in `src/`. |

### 1c. Archive migration documentation

These were useful during development but aren't needed going forward:

| File                    | Action                            |
| ----------------------- | --------------------------------- |
| `ASTRO_MIGRATION.md`    | Move to `docs/archive/` or delete |
| `WEBSITE_FIXES.md`      | Move to `docs/archive/` or delete |
| `MATH_RENDERING_FIX.md` | Move to `docs/archive/` or delete |
| `LAUNCH_PLAN.md`        | Keep — this is the live plan      |

If keeping history matters, create `docs/archive/` and move them there.

### 1d. Clean config remnants

| File              | Fix                                                                            |
| ----------------- | ------------------------------------------------------------------------------ |
| `.prettierignore` | Remove `.svelte-kit` and `pnpm-lock.yaml` entries (dead frameworks)            |
| `.npmrc`          | Either add an `engines` field to `package.json` or remove `engine-strict=true` |

### 1e. Remove draft posts

| File                                 | Reason                     |
| ------------------------------------ | -------------------------- |
| `src/posts/test_post.mdx.unpublish`  | Test post, never published |
| `src/posts/music_2020.mdx.unpublish` | Unpublished draft          |

These don't match the content collection glob (`**/*.mdx`) so they don't affect build output,
but they're repo clutter.

**Handoff for Phase 2:**

- **Deleted:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.github/workflows/build-deploy.yml`, `_reference/` (full directory), `src/posts/test_post.mdx.unpublish`, `src/posts/music_2020.mdx.unpublish`
- **Moved:** `ASTRO_MIGRATION.md`, `WEBSITE_FIXES.md`, `MATH_RENDERING_FIX.md` → `docs/archive/`
- **Modified:** `.prettierignore` (removed `.svelte-kit` and `pnpm-lock.yaml`), `package.json` (added `engines` field with `node >= 22`)
- **Caveats:** The old `.github/workflows/` directory is now empty and was removed. Phase 2 should create `.github/workflows/ci.yml` fresh. Build verified clean after cache purge (pre-existing stale `.astro` cache caused a spurious failure on `/contact`).

---

## Phase 2 — CI/CD ✅ 🤖

**Depends on:** Phase 1a (old workflow must be deleted first).

Create `.github/workflows/ci.yml` — a lightweight verify-only pipeline. Cloudflare Pages
handles the actual deploy.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

**Optional extensions** (can add later, not launch-blocking):

- `pa11y-ci` — accessibility regression tests (needs headless browser in CI)
- `@lhci/cli` — Lighthouse CI for perf budgets
- `lychee` — broken link checker on the built site

**Handoff for Phase 6 (validation):**

### Status

| Subtask                  | Status          | Notes                                                                                      |
| ------------------------ | --------------- | ------------------------------------------------------------------------------------------ |
| 3a — date on posts       | ✅ done         | Date+categories in `BlogPostLayout` metadata bar below `<h1>`                              |
| 3b — teaser aspect ratio | ❌ unresolved   | See `POSTCARD_HANDOVER.md` for full analysis. Requires design decision on approach A/B/C/D |
| 3c — excerpt whitespace  | ✅ done         | `.trim()` in PostCard, spacer `div.flex-1` prevents border stretch                         |
| 3d — CV padding          | ✅ done         | `mb-4` wrapper around bullet points in `Experience.astro`                                  |
| 3e — nav animations      | ❌ needs rework | Current `font-semibold scale-105` not liked. Needs different approach                      |
| 3f — CV data             | 👤 human        | Edit `src/data/cv.ts`                                                                      |

### Files changed

- `src/layouts/BlogPostLayout.astro` — added `date` + `categories` props; metadata bar below `<h1>`
- `src/pages/blog/[...slug].astro` — passes date/categories to layout; removed duplicate footer
- `src/components/PostCard.astro` — excerpt `.trim()`, spacer div instead of flex-1 on excerpt, removed read-more link, teaser section still in flux (currently `w-full h-auto`, no object-fit)
- `src/components/cv/Experience.astro` — bullets wrapped in `<div class="mb-4">`
- `src/layouts/Layout.astro` — nav links use `font-semibold scale-105` on active, `text-accent scale-105` on hover (needs rework)

### Known caveats

- The lint command fails on `dist/` HTML due to pre-existing `<div>` inside `<p>` from post content — unrelated.
- 3b is blocked on a design decision: see `POSTCARD_HANDOVER.md` for options A–D.
- 3e needs a fresh design approach from a human (or a new agent with clean context).
- Phase 3f (CV data) is 👤 human.

## Phase 3 — Bug fixes & visual polish 🤖

**No dependencies.** Safe to iterate on `experiment/astro` while Cloudflare Pages deploys
preview builds.

### 3a. Show published date on blog post pages

**Problem:** When opening a blog post, there's no visible publication date — only title
and content.

**Fix:** `BlogPostLayout.astro` already receives `title` and `description` props.
The `[...slug].astro` page already renders date+categories in the **footer** (below
content). Move them to appear right below the `<h1>` title, before the content.

> 💡 Add `date` and `categories` props to `BlogPostLayout.astro`, render them in a
> metadata bar between the title and `<slot />`.

### 3b. Preserve teaser aspect ratio in PostCards

**Problem:** `PostCard.astro` uses a fixed `aspect-[16/10]` container with `object-cover`,
cropping teasers instead of showing the full image.

**Fix:** Use `object-contain` instead of `object-cover`, and remove the fixed aspect ratio
container. Let the image set its own aspect ratio with a `max-height` to prevent
excessively tall images from dominating the card.

> 💡 Replace:
>
> ```astro
> <div class="aspect-[16/10] overflow-hidden" ...>
>   <Image class="w-full h-full object-cover" ... />
> </div>
> ```
>
> With a container that uses `object-contain` and no forced aspect ratio:
>
> ```astro
> <div class="overflow-hidden" style="max-height: 12rem;">
>   <Image class="w-full h-auto max-h-48 object-contain" ... />
> </div>
> ```

### 3c. Suppress empty paragraphs after excerpts

**Problem:** Some posts show several blank lines after the excerpt text in the blog index
cards (reported on `ijzer` and `deconvolution_part2`).

**Likely cause:** The excerpt frontmatter field may contain trailing newlines, or the
`excerpt` YAML string is multi-line without `>-` folding, producing embedded `\n`
characters that render as `<p>` breaks.

**Fix (two approaches):**

1. **Automated (preferred):** In `PostCard.astro`, trim whitespace from the excerpt
   before rendering:

   ```astro
   {post.data.excerpt.trim()}
   ```

   This is a one-line fix that handles all posts.

2. **Content-side:** If some excerpts genuinely need multi-paragraph formatting, switch
   those posts to use YAML block scalar syntax (`>-` or `|`) and fix the rendering to
   handle line breaks properly.

### 3d. CV — more vertical padding between roles

**Problem:** The horizontal `<hr>`-like border between CV roles sits immediately after
the bullet points of the previous role, with no breathing room.

**Fix:** In `Experience.astro`, add top padding (`pb-6` → `pb-8`) or adjust the
`ExperienceBulletpoint` container. The border-t is on the experience container itself
with `pt-4`, but there's no bottom padding after the last bullet.

> 💡 Add `mb-4` or `pb-6` to the `<div>` wrapping `Experience.astro` in `cv.astro`, or
> add bottom margin after the bullet list in `Experience.astro`.

### 3e. Navigation bar — more distinct active/hover state

**Problem:** Nav links have subtle underline but no color/font-size animation. The
design calls for a color change and font-size transition to make it "pop."

**Fix:** In `Layout.astro`, enhance the nav link styles:

- Active link: `text-accent` color + slightly larger font (`font-semibold` or
  `scale-105`)
- Hover: color transition to `text-accent`
- Animate all transitions with `transition-all duration-200`

> 💡 Change:
>
> ```astro
> 'px-2 py-1 text-sm font-medium rounded transition-all duration-200',
> 'hover:underline hover:underline-offset-4',
> ```
>
> To include color and scale transforms, e.g.:
>
> ```astro
> 'px-2 py-1 text-sm font-medium rounded transition-all duration-200',
> 'hover:text-(--text-accent) hover:scale-105',
> ```

### 3f. CV content update 👤

**Human task.** The CV data in `src/data/cv.ts` is out of date. Update:

- Work experience (new roles, end dates)
- Skills and tools
- Languages (proficiency levels may have changed)
- Publications
- Other sections as needed

Edit `src/data/cv.ts` directly — it's a single structured TypeScript file.

**Handoff for Phase 6 (validation):**

### Status

| Subtask                  | Status          | Notes                                                                                      |
| ------------------------ | --------------- | ------------------------------------------------------------------------------------------ |
| 3a — date on posts       | ✅ done         | Date+categories in `BlogPostLayout` metadata bar below `<h1>`                              |
| 3b — teaser aspect ratio | ❌ unresolved   | See `POSTCARD_HANDOVER.md` for full analysis. Requires design decision on approach A/B/C/D |
| 3c — excerpt whitespace  | ✅ done         | `.trim()` in PostCard, spacer `div.flex-1` prevents border stretch                         |
| 3d — CV padding          | ✅ done         | `mb-4` wrapper around bullet points in `Experience.astro`                                  |
| 3e — nav animations      | ❌ needs rework | Current `font-semibold scale-105` not liked. Needs different approach                      |
| 3f — CV data             | 👤 human        | Edit `src/data/cv.ts`                                                                      |

### Files changed

- `src/layouts/BlogPostLayout.astro` — added `date` + `categories` props; metadata bar below `<h1>`
- `src/pages/blog/[...slug].astro` — passes date/categories to layout; removed duplicate footer
- `src/components/PostCard.astro` — excerpt `.trim()`, spacer div instead of flex-1 on excerpt, removed read-more link, teaser section still in flux (currently `w-full h-auto`, no object-fit)
- `src/components/cv/Experience.astro` — bullets wrapped in `<div class="mb-4">`
- `src/layouts/Layout.astro` — nav links use `font-semibold scale-105` on active, `text-accent scale-105` on hover (needs rework)

### Known caveats

- The lint command fails on `dist/` HTML due to pre-existing `<div>` inside `<p>` from post content — unrelated.
- 3b is blocked on a design decision: see `POSTCARD_HANDOVER.md` for options A–D.
- 3e needs a fresh design approach from a human (or a new agent with clean context).
- Phase 3f (CV data) is 👤 human.

---

## Phase 4 — Typography experiments 🤖

**No dependencies, no risk.** CSS-only changes to `src/styles/app.css`. Try one
experiment at a time, check the Cloudflare preview deploy, and keep or revert.

The current `.prose` baseline:

```css
font-size: 1.125rem; /* ~20px on 18px base */
line-height: 1.6;
max-width: 48rem;
```

### Body text & spacing

| #   | Change                          | Rationale                                                                                                   |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| E1  | `line-height: 1.5`              | 1.6 feels spacious for long-form tech writing. 1.5 is the sweet spot for Source Sans 3                      |
| E2  | `font-size: 1.0625rem` (~19px)  | 20px is slightly large for body text in long posts. 19px keeps legibility, reduces "presentation-y" feel    |
| E3  | `h2, h3 { margin-top: 2.25em }` | Section headings feel too close to preceding paragraphs. More top space helps readers orient                |
| E4  | `max-width: 52rem` (was 48rem)  | Gives math blocks and code snippets more horizontal room. 52rem ≈ 70 chars/line at 19px — still comfortable |

### Heading decoration (small marker before `h2`/`h3`)

Three independent options for adding a decorative marker before section headings.
**Suggested: E5 (teal dash).** Try one at a time.

| #   | CSS                                                                                                                                                                                        | Effect                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E5  | `h2::before { content: '— '; color: var(--text-heading-accent); font-weight: 400; }`                                                                                                       | Teal em-dash before headings. Editorial/literary feel, introduces the secondary teal color into content naturally. Pairs well with Raleway's decorative character. **← Suggested** |
| E6  | `h2, h3 { padding-left: 0.75rem; border-left: 3px solid var(--color-accent-500); }`                                                                                                        | Crimson left accent bar. Simple, clean, already works in both themes. Safest/most conventional option.                                                                             |
| E7  | `h2::before { content: ''; display: inline-block; width: 0.45em; height: 0.45em; border-radius: 50%; background: var(--color-accent-500); margin-right: 0.55em; vertical-align: 0.15em; }` | Small crimson dot. Geometric and subtle, echoes the accent color without text characters. Works well with Raleway's geometric aesthetic.                                           |

All experiments are independent CSS tweaks in `.prose`.

**Handoff for Phase 6 (pre-launch validation):**

- **File modified:** `src/styles/app.css` — `.prose` block updated with E1–E5.
- **E1–E4 applied:** body line-height 1.5, font-size 19px, h2/h3 margin-top 2.25em, max-width 52rem.
- **E5 applied (revised):** crimson em-dash (`—`) ::before marker on `h2` using `var(--text-accent)`, teal em-dash on `h3`/`h4` using `var(--text-heading-accent)`.
- **E6, E7 not applied** — deferred. E5 was the suggested starting option; switch to E6 or E7 if the teal dash doesn't suit.
- **Build verified:** 25 pages, ~10s, no errors.

---

## Phase 5 — README update 🤖 ✅

**No dependencies.**

Rewrite `README.md` with:

- **Stack:** Astro 6.4 + Tailwind CSS 4, hosted on Cloudflare Pages
- **Local dev:** `npm install && npm run dev` → `localhost:4321`
- **How to add a blog post:**
  - Create `src/posts/my-post.mdx`
  - Required frontmatter:
    ```yaml
    ---
    title: 'My Post Title'
    date: '2025-06-02'
    categories: [coding, math]
    excerpt: 'A one-sentence summary shown in post cards.'
    teaser: 'my-teaser.png'
    ---
    ```
  - **Frontmatter constraints:**
    - `teaser` — an image filename placed in `src/assets/teasers/` (used by
      `astro:assets` for optimized WebP output) AND `static/blog/teasers/original/`
      (fallback for non-raster images like SVGs). Must be referenced from both
      locations. Raster images (png/jpg/webp) go through `astro:assets`; SVGs
      stay in `static/` only.
    - `excerpt` — one sentence, displayed in post cards with `line-clamp-3`.
    - `categories` — lowercase, kebab-case strings. Used for related-posts scoring
      and category chips.
    - `date` — YYYY-MM-DD format.
    - Optional: `draft: true` to hide from production.
  - **Images in post content:** Place raster images (png/jpg) in
    `src/assets/blog/<post-slug>/` — they are processed by `astro:assets` for
    responsive WebP output. SVGs stay in `static/blog/<post-slug>/`.
  - Run `npm run dev` to preview; cloudflare auto-deploys on push.

**Handoff for Phase 6:**

- **File changed:** `README.md` — rewritten from old Svelte/VPS content to Astro/Cloudflare
- **No code changes** — build verified clean (25 pages, 9.26s)
- **Caveats:** The README documents the double-location teaser image requirement
  (`src/assets/teasers/` + `static/blog/teasers/original/`). Phase 6 validators should
  confirm OG images work correctly for all posts, since the fallback path depends on
  both locations being populated.

---

## Phase 6 — Pre-launch validation 👤

**Depends on:** Phases 1–4 (cleanup + fixes + typography).

Before switching DNS, manually verify every page at `rikvoorhaar.pages.dev`:

- [ ] Home page loads, layout correct
- [ ] Blog index — all post cards render, aspect ratios correct, no blank lines
- [ ] Every blog post — math renders, code blocks styled, published date visible
- [ ] CV page — spacing between roles correct, all data current
- [ ] Contact page
- [ ] RSS feed at `/rss.xml` is valid
- [ ] Sitemap at `/sitemap-index.xml`
- [ ] Redirects: `/resume` → `/cv`, `/posts` → `/blog`, `/articles` → `/blog`
- [ ] Dark mode toggle works, no FOUC
- [ ] Responsive: mobile (375px), tablet (768px), desktop (1280px)
- [ ] OG meta tags on blog posts (check with opengraph.xyz or similar)

---

## Phase 7 — DNS cutover & merge 👤

**Depends on:** Phase 6 (validation passed).

1. **DNS switch** — in Cloudflare Dashboard → Pages → rikvoorhaar → Custom domains,
   add `rikvoorhaar.com` and `www.rikvoorhaar.com`. Cloudflare handles the CNAME
   records.

2. **Merge to main:**

   ```bash
   git checkout main
   git merge experiment/astro
   git push
   ```

3. **Reconfigure Cloudflare Pages** — change production branch from
   `experiment/astro` to `main` in the Pages dashboard.

4. **Shut down VPS** (after DNS propagates — keep VPS running for a few days as
   rollback safety net):

   ```bash
   docker compose down    # on the VPS
   ```

5. **Clean up GitHub:**
   ```bash
   git branch -d experiment/astro
   git push origin --delete experiment/astro
   ```

---

## Dependency graph

```
Phase 1 (cleanup) ──┐
                     ├──→ Phase 2 (CI) ──┐
Phase 3 (fixes)  ───┤                    ├──→ Phase 6 (validate) ──→ Phase 7 (DNS)
Phase 4 (typo)   ───┤                    │
Phase 5 (README) ──┘                    │
                                        │
Phase 3f (CV data) 👤 ──────────────────┘
```

Phases 1, 3, 4, and 5 are all independent and can be done in parallel.
Phase 2 depends on Phase 1a only (old CI must be deleted first).
Phase 6 gates everything before DNS.
Phase 7 is the final human step.

---

## Summary checklist (ordered by execution)

### 🤖 Agentic phases

- [x] 1a: Delete `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.github/workflows/build-deploy.yml`
- [x] 1b: Delete `_reference/`
- [x] 1c: Archive `ASTRO_MIGRATION.md`, `WEBSITE_FIXES.md`, `MATH_RENDERING_FIX.md` → `docs/archive/`
- [x] 1d: Clean `.prettierignore` (remove `.svelte-kit`, `pnpm-lock.yaml`)
- [x] 1e: Remove `.unpublish` draft posts
- [x] 2: Create `.github/workflows/ci.yml` (build + lint)
- [x] 3a: Add published date below blog post title
- [ ] 3b: Fix teaser aspect ratio in PostCard (object-contain, no crop)
- [x] 3c: Trim excerpt whitespace in PostCard (fix blank lines)
- [x] 3d: Add vertical padding between CV roles
- [ ] 3e: Enhance nav link animations (color + scale)
- [x] 4 (E1–E7): Typography experiments — E1–E4 body/spacing, E5–E7 heading decorations (E5 applied) ✅
- [x] 5: Rewrite README with Astro stack + blog post how-to

### 👤 Human phases

- [ ] 3f: Update CV data in `src/data/cv.ts`
- [ ] 6: Validate entire site at `rikvoorhaar.pages.dev`
- [ ] 7.1: Switch DNS: `rikvoorhaar.com` → Cloudflare Pages
- [ ] 7.2: Merge `experiment/astro` → `main`
- [ ] 7.3: Reconfigure Cloudflare Pages to deploy from `main`
- [ ] 7.4: Shut down VPS deployment
- [ ] 7.5: Delete `experiment/astro` branch

### Optional / later

- [ ] Add pa11y-ci or Lighthouse CI to GitHub Actions
- [ ] Add `eslint-plugin-astro`
- [ ] Phase 10 from ASTRO_MIGRATION.md: evaluate Sätteri for build speed
