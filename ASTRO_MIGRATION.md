# Migration Plan: SvelteKit + mdsvex → Astro 6.4

> Status: in progress. Target: full migration of `rikvoorhaar.com` from SvelteKit 1.x /
> mdsvex to Astro 6.4, in independently-buildable phases.
>
> **Phase 0 (scaffold) is done.** Revised plan: before touching content, **rip Svelte /
> SvelteKit / mdsvex out of the build entirely** (Phase 1) and **upgrade to Tailwind 4**
> (Phase 2), so the toolchain is clean from here on. Blog posts (Phase 3) follow on that
> clean foundation. Visual overhaul stays deferred.
>
> **Guiding principle: buildable at every stage, not shippable.** Each phase must end
> with a green `astro build`. Intermediate stages are allowed to look broken/unstyled —
> only the *final* result has to look good.

---

## 1. Goals & constraints

**Hard requirements**

- Migrate the whole site to **Astro 6.4**.
- **Phased**: every phase must produce a site that builds and serves *part* of the site.
- **Content lives in Markdown / YAML.** No more hand-edited Svelte for data (the CV
  is the motivating pain point).
- Posts are authored **as MDX** so they can embed components. (Originally those were
  Svelte; post-revision the embedded components are plain **Astro** components — see
  the Svelte decision below.)
- Maintainable, fast for the user, leans on **Cloudflare's CDN** as much as possible.

**Revised sequencing (post Phase 0)**

1. **Excise Svelte/SvelteKit/mdsvex from the build ASAP** (Phase 1) — keep the old
   `.svelte` files *for reference only*, fully excluded from the build.
2. **Upgrade to Tailwind 4 ASAP** (Phase 2) — clean, CSS-first config now rather than
   carrying Tailwind 3 + PostCSS through the whole migration.
3. Stand up a *basic* Astro site with the **same content**; **blog posts are the first
   content stage** (Phase 3). Matching the exact CV styling is *not* a priority.
4. Port the existing visual design *after* content is live (Phase 7).
5. CI/CD (cache invalidation etc.) is **low priority** — nothing ships until it works
   locally.

**Decision — drop Svelte entirely (no `@astrojs/svelte`).** The interactive bits are
small enough to do with native HTML + vanilla JS (`Details` → native `<details>`;
dark-mode toggle → tiny inline script; lucide icons → static SVG). So the migration
ships **no UI framework at all** — just Astro + MDX. This is consistent with the
fast-load goal (≈0 JS on content pages) and removes the Svelte 4 vs 5 / `@astrojs/svelte`
version-matrix headache surfaced in Phase 0. *Escape hatch:* if a future post genuinely
needs a heavy interactive island, re-add a framework integration at that point — it is
explicitly out of scope for the migration.

**Non-goals for the early phases**

- Pixel-perfect parity with current styling. (Stages may be ugly/unstyled — that's fine.)
- Preserving every micro-interaction (e.g. the `Details` localStorage-remembered
  open/closed state — see §4.3).

---

## 2. Current state (what we are migrating from)

| Area | Current implementation |
|---|---|
| Framework | SvelteKit `1.26`, Svelte `4`, Vite `4`, `adapter-node` (SSR Node server) |
| Markdown | `mdsvex` `0.11` with a Svelte layout (`src/mdsvex.svelte`) |
| Highlighting | `shiki` `0.14`, `monokai` theme, wrapped as `{@html ...}` |
| Math | `remark-math` + `rehype-katex-svelte`, KaTeX CSS loaded in root layout |
| Headings | `rehype-autolink-headings`, `rehype-add-classes` (`rehype-slug`/`toc` disabled) |
| Styling | Tailwind `3` + `@tailwindcss/typography`, `darkMode: 'class'`, custom palettes (`turbo`, `puerto-rico`, `main`, `secondary`) |
| Posts | 20 published `src/posts/*.md`; drafts as `*.md.unpublish`; frontmatter: `layout, title, date, categories, excerpt, teaser` |
| Embedded components | ~10 posts use `<script>import ...</script>` to pull in `Details` / `Output` |
| Routes | `/` (landing), `/blog`, `/blog/[slug]`, `/cv`, `/contact`, `/[slug]` (redirects), `/api/posts` (JSON), `+error` |
| Markdown overrides | `img, a, code, pre, blockquote, nav` + `Output`, `Details` |
| CV | **Hand-written Svelte** in `src/routes/cv/+page.svelte` (~370 lines) using `Experience, Education, Skill, Tool, Publication, OpenSource, SectionHeader, ExperienceBulletpoint, Date` |
| Redirects | `src/lib/redirects.json` (old Jekyll dash-slugs → `/blog/underscore_slug`), served via SSR `load` |
| Dark mode | `darkmode.svelte` — inline `<head>` script (anti-FOUC) + toggle button using `localStorage` |
| Assets | `static/blog/<slug>/...`, teasers in `static/blog/teasers/`, CV logos in `static/cv/` |
| Deploy | Docker (`node build`) → `ghcr.io` → self-hosted runner → `docker compose` behind Traefik (`rikvoorhaar.com`) |

### Frontmatter quirks to normalize

- `categories` is a **space-separated string** (e.g. `"website data-science tools"`),
  not a YAML list.
- `date` is mostly `"YYYY-MM-DD"` but `first_post.md` uses
  `2020-06-19 14:19:44 +0200` (unquoted).
- `selfhosted.md` has **no `layout`** key; `teaser` extensions vary (`.jpg/.png/.svg/.webp`).
- One teaser filename is misspelled: `devonvolution_part3.webp`.

---

## 3. Target architecture & key decisions

### 3.1 Output mode: **static (SSG)**

The site is content-driven with no per-request logic that can't be precomputed. The
two "dynamic" pieces are trivially static:

- `/api/posts` → not needed; the post list is known at build time (content collection).
- `/[slug]` redirects → emit static redirects (Astro `redirects` config /
  Cloudflare `_redirects`).

**Decision:** build to fully static output (`output: 'static'`). This maximizes
Cloudflare CDN cacheability (every page is an immutable, edge-cacheable artifact) and
removes the Node server entirely.

### 3.2 Hosting: **Cloudflare Pages** (decided)

**Decision:** deploy to **Cloudflare Pages**. The build artifact is a plain `dist/` of
static files served from Cloudflare's edge — native CDN, automatic caching,
`_redirects`/`_headers` support, and trivial cache purge. This removes the
Node/Docker/Traefik server entirely; self-hosting a static site in a container is
unnecessary overhead once SSR is gone.

Consequences threaded through the plan:

- Redirects → Cloudflare Pages `_redirects` file (and/or Astro `redirects` config).
- Cache headers → `public/_headers`.
- The `Dockerfile` / `docker-compose.yml` / Traefik labels become **dead code** to be
  removed during Phase 9 cleanup.
- DNS for `rikvoorhaar.com` points at Pages; keep the apex/`www` behavior consistent
  with today's Traefik host rules.

Nothing about Phases 1–7 depends on the host, so this only materially matters from
Phase 8 onward.

### 3.3 Integrations

- `@astrojs/mdx` — posts as MDX (Astro components inside Markdown). **No UI framework
  integration** (no `@astrojs/svelte` / React / Vue) — see the Svelte decision in §1.
- **Tailwind 4 via the Vite plugin** (`@tailwindcss/vite`). Upgraded early in Phase 2,
  replacing the Tailwind 3 + `postcss.config.js` + `autoprefixer` setup left over from
  Phase 0. (`@astrojs/tailwind` is *not* used — it's deprecated and only targets Astro
  3–5; the Vite plugin is the Tailwind 4 path.)
- `@astrojs/sitemap` + `@astrojs/rss` (Phase 6).
- `astro:assets` (built-in, `sharp`) for image optimization (Phase 7/8).

### 3.4 Markdown / MDX pipeline

Replicate the mdsvex pipeline with Astro-native equivalents:

- **Highlighting:** Astro's built-in Shiki — `shikiConfig.theme: 'monokai'`.
  Drop the `escapeSvelte` / `{@html}` hack entirely.
- **Math:** `remark-math` + **standard `rehype-katex`** (drop `rehype-katex-svelte`,
  which was a Svelte-specific workaround). Import `katex/dist/katex.min.css` globally.
- **Headings:** `rehype-slug` + `rehype-autolink-headings`.

**Astro 6.4 config API note.** 6.4 deprecates the top-level
`markdown.remarkPlugins` / `markdown.rehypePlugins` / `gfm` / `smartypants` options
(removed in Astro 8). Configure the pipeline through the new pluggable
`markdown.processor` instead:

```js
// astro.config.mjs (sketch)
import { unified } from '@astrojs/markdown-remark';
markdown: {
  processor: unified({
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeSlug, rehypeAutolinkHeadings],
  }),
  shikiConfig: { theme: 'monokai' },
}
```

#### Sätteri (deferred, real Phase 10 opportunity)

Astro 6.4 ships **`@astrojs/markdown-satteri`** — a Rust-based Markdown/MDX processor
(`markdown.processor: satteri()`) that is dramatically faster than the unified pipeline
(Astro cut >1 min off their own docs builds). **It does not run remark/rehype plugins.**

**Decision:** stay on `unified()` for the migration, because we depend on
`remark-math`, `rehype-katex`, `rehype-slug`, and `rehype-autolink-headings`. Revisit
in Phase 10: Sätteri implements many features (incl. heading IDs) natively and supports
its own **MDAST/HAST** plugins, so the win is real once math + heading-anchor behavior
is re-validated or its plugins are ported. This is exactly the build-speed lever to
pull *after* everything works — not during the migration.

### 3.4b Tailwind 4 (upgraded early, Phase 2)

Tailwind 4 is **CSS-first** and removes most of the JS config / PostCSS plumbing:

- Install `tailwindcss@4` + `@tailwindcss/vite`; register the plugin in
  `astro.config.mjs` under `vite.plugins`. **Delete `postcss.config.js`, `autoprefixer`,
  and `postcss`** (Tailwind 4 uses Lightning CSS internally; no autoprefixer needed).
- In the global stylesheet, replace `@tailwind base; @tailwind components; @tailwind
  utilities;` with a single `@import "tailwindcss";`.
- Migrate `tailwind.config.js` into CSS: the four palettes (`turbo`, `puerto-rico`,
  `main`, `secondary`) become `@theme { --color-turbo-500: …; … }` tokens; load the
  typography plugin with `@plugin "@tailwindcss/typography";`.
- Keep the **class-based dark mode** (`html.dark`) with
  `@custom-variant dark (&:where(.dark, .dark *));` (v4 defaults to `prefers-color-scheme`
  otherwise). The existing `html.dark` / `html.light` background rules stay.
- v4 auto-detects template files (the `content` array is gone); legacy `.svelte` files
  relocated out of `src/` (Phase 1) won't be scanned. Use `@source` only if needed.
- Run `npx @tailwindcss/upgrade` as a starting point, then hand-fix.
- **Note:** the Phase-0 `tailwind.config.js` uses `require('@tailwindcss/typography')`
  in an ESM (`type: module`) project — already a smell; the CSS-first `@plugin` approach
  removes it.

### 3.5 Component / element overrides

mdsvex mapped Markdown elements to Svelte components via the layout. Astro's MDX does
this with the **`components` prop** on `<Content />`:

- Map HTML elements (`img`, `a`, `pre`, `code`, `blockquote`) to **Astro** components.
- Map `Details` / `Output` (now Astro components) so posts don't need per-file imports.

**Decision:** convert all posts to **`.mdx`** so the override mechanism is uniform and
embedded components work everywhere ("treat like MDX", as requested). The embedded
components are **Astro** (not Svelte) — the old `import ... .svelte` lines in posts are
removed during conversion.

> **MDX scope gotcha (verify in Phase 3).** mdsvex injects layout-mapped components
> ambiently, but **MDX requires components used in a file to be in scope** — either
> imported in the file *or* supplied via the `components` prop on `<Content/>`. We rely
> on the `components` prop so posts need no per-file imports, which works, but the
> ~10 posts using `<Details>` / `<Output>` (and all element overrides) must be
> explicitly checked. This is an acceptance item in Phase 3, not an assumption.

> **`rehype-add-classes` audit.** The old config injected `pre: 'bg-white'`. Before
> dropping the plugin in favor of CSS, grep post/global CSS for any rule that depends on
> classes it added (notably on `pre`), and reproduce them in the new prose styling.

### 3.6 Interactivity strategy (fast loads)

Most current "components" are presentational and can be **static Astro components**
(zero JS shipped):

- `Output`, `code`, `pre`, `img`, `a`, `blockquote`, all CV components → Astro.
- `Details` → reimplement with the **native `<details>`/`<summary>`** element (no JS).
  *Trade-off:* loses localStorage open/close memory. Acceptable per the user's "don't
  sweat the details" stance; if a tiny bit of JS is wanted later it can be a vanilla
  `<script>`, not a framework island.
- `darkmode` → keep the inline anti-FOUC `<head>` script; the toggle button is a small
  **vanilla `<script>`** (no Svelte island — Svelte is removed from the build, §1).

Result: blog/content pages ship **no framework runtime and ~0 JS**, which is the
fast-load win (and the reason dropping Svelte entirely is cheap).

### 3.7 Images: use `astro:assets` (`<Image>` / `<Picture>`)

Use Astro's built-in image components wherever an image is rendered, rather than raw
`<img>`:

- **`<Image>`** for single optimized images (teasers in `PostCard`, CV logos, landing
  art) — automatic resizing, modern formats, lazy-loading, explicit dimensions (no CLS).
- **`<Picture>`** where multiple formats / art-direction help (e.g. large in-post
  figures that benefit from AVIF/WebP fallbacks).
- The post-body `img` override (§3.5) renders through `<Image>` so Markdown images get
  optimized too, falling back to a plain `<img>` only for assets that must stay in
  `public/` (e.g. SVGs, PDFs, pre-generated plots).
- Source images move from `static/` (served as-is) into `src/` where they should be
  processed; truly static assets stay in `public/`. (Asset triage happens in Phase 8 —
  see §7 "Asset volume".)

---

## 4. Content model

### 4.1 Blog posts — content collection

Use Astro Content Collections (Content Layer `glob()` loader) with a Zod schema. Keep
files in `src/posts/` (or move to `src/content/blog/`; decided in Phase 3).

```ts
// src/content.config.ts (sketch)
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),                 // handles the messy first_post date
    excerpt: z.string(),
    teaser: z.string(),                    // filename in /blog/teasers/
    categories: z.string()                 // normalize "a b c" → ["a","b","c"]
      .transform((s) => s.split(/\s+/).filter(Boolean)),
    draft: z.boolean().default(false),
    // `layout` is dropped — layouts are applied by the route, not frontmatter
  }),
});
```

- Drafts: rename `*.md.unpublish` → real files with `draft: true`, or keep them
  excluded by the glob. (Decided in Phase 3; `draft` flag is cleaner.)
- Fix the `devonvolution_part3` teaser typo (rename asset or correct frontmatter).

### 4.2 CV — YAML-driven

Replace the hand-written Svelte page (kept as reference under `_reference/`, see Phase 1)
with `src/data/cv.yaml` + a YAML data collection
+ small Astro render components. Schema mirrors the current component props:

```yaml
# src/data/cv.yaml (sketch)
experience:
  - position: Computer Vision Engineer
    employer: Grazper Technologies
    image: /cv/grazper_circle.svg
    date_start: January 2023
    date_end: Current
    bullets:
      - Filed 3 patent applications ...
education: [...]
skills: [...]
tools: [...]
languages: [...]
publications: [...]
open_source: [...]
courses: [...]
```

Render with a typed `getEntry`/`getCollection` data loader. Some current fields carry
inline HTML (`info`, `note`, language flag `<span class="fi ...">`) — preserve with a
deliberate `set:html`, or migrate flags to a small component.

### 4.3 Site config

`src/lib/config.ts` (`title`, `description`, `url`) → `src/consts.ts` (plain TS, no
`$app/environment`; use `import.meta.env`).

---

## 5. Dependency mapping

| Current | Astro replacement |
|---|---|
| `@sveltejs/kit`, `adapter-node` | `astro` 6.4 (static output) — **removed Phase 1** |
| `mdsvex`, `svelte-preprocess` | `@astrojs/mdx` — **removed Phase 1** |
| `svelte`, `@sveltejs/*`, `svelte-check`, `eslint-plugin-svelte`, `prettier-plugin-svelte` | **removed entirely Phase 1** (no UI framework; lint/format via `eslint-plugin-astro` / `prettier-plugin-astro`) |
| `lucide-svelte` | static `lucide` SVGs as Astro components — **removed Phase 1** |
| `shiki` (manual) | Astro built-in Shiki |
| `rehype-katex-svelte` | `rehype-katex` |
| `remark-math`, `rehype-slug`, `rehype-autolink-headings` | unchanged (Astro markdown plugins) |
| `rehype-add-classes` (`pre: 'bg-white'`), `rehype-toc` | replace with CSS / `rehype-autolink` options — **audit dependent CSS first** (§3.5) |
| `svelte-image`, `svimg` | `astro:assets` (`<Image/>` / `<Picture/>`, `sharp`) |
| `tailwindcss` 3 + `postcss` + `autoprefixer` + `@astrojs`-less PostCSS | **Tailwind 4 + `@tailwindcss/vite`, Phase 2** (drop `postcss.config.js` / `autoprefixer`) |
| `@tailwindcss/typography` | kept (loaded via `@plugin` in CSS, Phase 2) |
| `vite` | provided by Astro |
| SvelteKit `$lib`, `$app/*` | TS path aliases + `import.meta.env` / `Astro` globals |

---

## 6. Phases

Each phase ends with a **green `astro build`** and a runnable `astro preview` that
serves the listed routes.

### Phase 0 — Scaffold & tooling ✅ **COMPLETED**

**Result:** `astro build` produces `dist/index.html` with working Tailwind 3
processing. `astro preview` serves on `localhost:4321`. All SvelteKit files
intact — the two frameworks coexist (Astro uses `src/pages/`, SvelteKit uses
`src/routes/`).

**What was done:**
- Installed `astro@6.4.2`, `@astrojs/mdx@6.0.1`.
- Created `astro.config.mjs`: `output: 'static'`, `site: 'https://rikvoorhaar.com'`,
  markdown processor via `unified()` (`remark-math`, `rehype-katex` with `fleqn`,
  `rehype-slug`, `rehype-autolink-headings`), Shiki `monokai`, Vite aliases
  (`@` → `/src`, `$lib` → `/src/lib`).
- Created `src/pages/index.astro` — placeholder page importing Tailwind + KaTeX CSS.
- Migrated global CSS to `src/styles/app.css` (Tailwind `@tailwind` directives,
  scrollbar styles, KaTeX overrides, dark/light html background colors).
- Updated `tailwind.config.js` content glob to include `.astro` and `.mdx` files.
- Updated `.gitignore` with `/.astro` and `/dist` entries.
- Added `astro:dev`, `astro:build`, `astro:preview` npm scripts.
- Created `src/env.d.ts` with `/// <reference types="astro/client" />`.

**Phase-0 leftovers that Phases 1–2 will clean up** (this is the "dependency mess"):

- `package.json` still defaults `dev` / `build` / `preview` to `vite` (SvelteKit) and
  still lists the entire Svelte/SvelteKit/mdsvex toolchain in `devDependencies`. Astro
  lives under separate `astro:*` scripts. → Phase 1 makes Astro the default and prunes
  the Svelte deps.
- Both `src/routes/*` (SvelteKit) and `src/pages/*` (Astro) exist; `src/app.html`,
  `src/app.d.ts`, `src/mdsvex.svelte`, `svelte.config.js`, `vite.config.ts`,
  `mdsvex.config.js`, `.svelte-kit/` are still present. → Phase 1 relocates the
  reference-worthy ones and deletes the rest.
- Duplicate global CSS: `src/app.css` (old) **and** `src/styles/app.css` (new). →
  consolidate in Phase 1/2.
- Tailwind 3 currently works via `postcss.config.js` (+ `autoprefixer`), picked up
  automatically by Astro's Vite. → replaced wholesale by Tailwind 4 in Phase 2.

**Resolved decisions (were open in Phase 0):**

1. **No `@astrojs/svelte`.** The Svelte 4↔5 / Astro 5↔6 version matrix is a trap, and
   we don't need it: per §1 we drop Svelte entirely and use Astro + vanilla JS. This is
   why Phase 1 (excise Svelte) is now the immediate next step.
2. **No `@astrojs/tailwind`.** Go straight to **Tailwind 4 + `@tailwindcss/vite`** in
   Phase 2 (CSS-first, §3.4b) rather than carrying Tailwind 3 + PostCSS.
3. **KaTeX/markdown plugin versions** (`remark-math@3`, `rehype-katex@7`) build cleanly
   on Astro 6's `unified()`; full rendering validation still happens in Phase 3.

### Phase 1 — Excise Svelte / SvelteKit / mdsvex from the build (NEW, do first)
**Goal:** Astro is the *only* build system; Svelte is gone from the toolchain but the
old files survive **for reference**.
- **Relocate reference files out of the build.** Move the legacy Svelte/SvelteKit tree
  to a top-level `_reference/` directory (outside `src/`, so Astro routing, Tailwind
  scanning, and `tsconfig` never see it): `src/routes/**`, `src/lib/components/**.svelte`,
  `src/mdsvex.svelte`, `src/app.html`, `src/app.d.ts`, and the old `src/app.css`. These
  are the blueprints for the Astro/vanilla rewrites in Phases 3–7.
- **Delete dead config:** `svelte.config.js`, `vite.config.ts`, `mdsvex.config.js`,
  `.svelte-kit/`. Keep `_reference/` **tracked in git** (it's our blueprint) but exclude
  it from `tsconfig.json` `include`/add to `exclude`, and from any lint globs, so the
  build/typecheck never touches it.
- **Prune `package.json`:** remove `@sveltejs/*`, `svelte`, `svelte-check`,
  `svelte-preprocess`, `svelte-image`, `mdsvex`, `lucide-svelte`, `eslint-plugin-svelte`,
  `prettier-plugin-svelte`, `rehype-katex-svelte`, `rehype-toc`. Make `dev`/`build`/
  `preview` run **astro** (drop the `vite`/`svelte-kit` scripts and the `astro:*`
  aliases). Re-lock; confirm `node_modules` no longer pulls Svelte.
- **Lint/format:** swap Svelte ESLint/Prettier plugins for `eslint-plugin-astro` /
  `prettier-plugin-astro` (low priority; can stub out lint if it fights us).
- Keep `index.astro` as the only page for now (content comes in Phase 3).
- **Builds:** `astro build` green with a Svelte-free dependency tree; site is just the
  placeholder — **expected to look bare** (buildable, not shippable). ✅

#### Phase 1 — Completion notes ✅ **COMPLETED**

**What was moved to `_reference/`:**
- `src/routes/**` (all SvelteKit routes: `blog/`, `cv/`, `contact/`, `api/`, `[slug]/`,
  `+page`, `+layout`, `+error`, `header`, `footer`)
- `src/lib/components/**` (all `.svelte` components + `cv/cvIcons.ts`, `markdown/index.ts`)
- `src/mdsvex.svelte`, `src/app.html`, `src/app.d.ts`, `src/app.css`

Kept in `src/lib/` for future reuse: `config.ts`, `index.ts`, `redirects.json`,
`types.ts`, `utils.ts`.

**Deleted:** `svelte.config.js`, `vite.config.ts`, `mdsvex.config.js`, `.svelte-kit/`.

**`package.json` pruned — removed:** `@sveltejs/*`, `svelte`, `svelte-check`,
`svelte-preprocess`, `svelte-image`, `mdsvex`, `lucide-svelte`, `eslint-plugin-svelte`,
`prettier-plugin-svelte`, `rehype-katex-svelte`, `rehype-toc`, `shiki`, `vite`.
Scripts `dev`/`build`/`preview` now run `astro`, old `astro:*` aliases dropped.

**`tsconfig.json`** rewritten (no more `.svelte-kit/tsconfig.json` extend):
bundler resolution, `jsx: preserve`, path aliases for `@/*` and `$lib/*`, includes
`.astro`/`.mdx`, excludes `_reference`.

**`.eslintrc.cjs` / `.prettierrc`** stripped of Svelte overrides/plugins. Lint is
minimal — `eslint-plugin-astro` / `prettier-plugin-astro` deferred (low priority).

**Build verification:** `npm run build` → 1 page, 1.13s, green. `npm ls svelte`,
`npm ls @sveltejs/kit`, `npm ls mdsvex` all empty. Vite only present as Astro 6.4.2's
internal dep (vite@7.3.3).

**Notes for Phase 2 (resolved in Phase 2 ✅):**
- ~~`rehype-add-classes` is still in `devDependencies` but not wired in Astro's unified
  pipeline. It was used in mdsvex to inject `pre: 'bg-white'`. Audit CSS depending on
  that class before removing the package in Phase 2.~~ → Removed. No dependent CSS.
- ~~`autoprefixer`, `postcss`, `tailwindcss@3`, `tailwind.config.js` are still present —
  all get replaced by Tailwind 4 + `@tailwindcss/vite` in Phase 2.~~ → Replaced.
- `flag-icons` remains for future contact page; `katex`, `remark-math`, `rehype-*`
  plugins remain for the content pipeline.

**Notes for Phase 3 (blog posts):**
- Blueprint Svelte components to port: `_reference/src/lib/components/markdown/`
  (`Output.svelte`, `Details.svelte`, `a.svelte`, `img.svelte`, `code.svelte`,
  `pre.svelte`, `blockquote.svelte`), `PostCard.svelte`, `PostCardGallery.svelte`.
- Blueprint routes: `_reference/src/routes/blog/+page.svelte`,
  `_reference/src/routes/blog/+page.ts` (data loader),
  `_reference/src/routes/blog/[slug]/+page.svelte`.
- `src/lib/redirects.json` and `src/lib/config.ts` remain in place for reference.
- 20 posts in `src/posts/*.md` (2 `.unpublish` drafts) — untouched, ready for conversion.

### Phase 2 — Tailwind 4 upgrade ✅ **COMPLETED**
**Goal:** clean, CSS-first styling foundation before any real UI is built.
- Install `tailwindcss@4` + `@tailwindcss/vite`; add the plugin to `astro.config.mjs`
  (`vite.plugins`). Remove `postcss.config.js`, `autoprefixer`, `postcss`,
  `tailwind.config.js`.
- Consolidate to one global stylesheet: `@import "tailwindcss";`, palettes → `@theme`
  tokens, `@plugin "@tailwindcss/typography";`, `@custom-variant dark`, and the existing
  scrollbar / KaTeX / `html.dark`·`html.light` rules (§3.4b). Drop the duplicate
  `src/app.css`.
- Sanity-check a few utility classes + dark variant on `index.astro`.
- **Builds:** `astro build` green on Tailwind 4; placeholder may look rough — fine. ✅

#### Phase 2 — Completion notes ✅ **COMPLETED**
- **Installed:** `tailwindcss@4.3.0`, `@tailwindcss/vite@4.3.0`, `@tailwindcss/typography@0.5.19`
  (latest — compatible with Tailwind v4).
- **Removed:** `autoprefixer`, `postcss`, `tailwindcss@3` (old), `rehype-add-classes`
  (audited — no CSS depended on its injected `pre: 'bg-white'` class; `bg-white` usages
  in `_reference/` are hand-written utility classes).
- **Deleted files:** `tailwind.config.js`, `postcss.config.js`.
- **`astro.config.mjs`:** Added `@tailwindcss/vite` plugin to `vite.plugins`.
- **`src/styles/app.css`:** Migrated from `@tailwind` directives to `@import "tailwindcss"`,
  added `@theme` block with all four palettes (`turbo`, `puerto-rico`, `main`, `secondary`),
  `@plugin "@tailwindcss/typography"`, `@custom-variant dark (&:where(.dark, .dark *))`.
  No duplicate `src/app.css` existed (only `_reference/src/app.css` remains).
- **`src/pages/index.astro`:** Added sanity-check blocks exercising all four palettes,
  dark variants, and `.prose` / `.dark:prose-invert`.
- **Build (final):** `1 page(s) built in 864ms` ✅ (~80KB generated CSS + KaTeX fonts).

**Notes for Phase 3:**
- Tailwind v4 auto-detects template files — no `content` array needed. `_reference/` is
  outside `src/` so it won't be scanned.
- `flag-icons` retained for future contact page.
- When porting markdown overrides (`Output`, `Details`, `a`, `img`, `code`, `pre`,
  `blockquote`), use Tailwind v4 utilities; the palette tokens (`text-main-600`, etc.)
  are available as `@theme` CSS variables.
- The `@tailwindcss/typography` plugin is active via `@plugin` — `.prose` classes work
  out of the box with dark mode via `dark:prose-invert`.

### Phase 3 — Blog posts (FIRST CONTENT STAGE) ✅ **COMPLETED**
**Goal:** every blog post + the blog index render from content files.
- Define the `blog` content collection + schema (§4.1); normalize `categories`/`date`.
- Convert posts to `.mdx`; strip per-file `<script>import>` blocks.
- Build the MDX `components` map: `img, a, pre, code, blockquote` (Astro) + `Output`,
  `Details` (native `<details>`).
- `src/pages/blog/[...slug].astro` (renders `<Content components={...}/>`) +
  `src/pages/blog/index.astro` (uses `getCollection`, sorts by date desc).
- Port `PostCard` / `PostCardGallery` to Astro.
- Verify: Shiki highlighting, KaTeX math, heading anchors, images from `static/`,
  the `Details`/`Output` posts (`ukf`, `lastfm`, ...).
- **Explicitly confirm MDX component scope** for the ~10 `Details`/`Output` posts (see
  §3.5 gotcha) — this is the most likely source of silent breakage.
- **Start with `ukf.mdx`** (§8): it exercises Shiki + KaTeX + `Details` + `Output` in
  one file. Prove the pipeline on it before bulk-converting the other 19.
- Minimal layout — readable, *not* final design.
- **Record a build-time + output-size baseline** (`astro build` duration, `dist/` page
  count/JS bytes) so later phases — especially Sätteri in Phase 10 — have a real number
  to compare against.
- **Builds:** `/blog` + all 20 `/blog/<slug>` pages with working code/math/components. ✅

#### Phase 3 — Completion notes ✅ **COMPLETED**

**Content collection** (`src/content.config.ts`):
- Defined `blog` collection with `glob` loader (`**/*.mdx` in `./src/posts`)
- Zod schema: `title` (string), `date` (coerced Date), `excerpt` (string), `teaser` (string), `categories` (string[]), `draft` (boolean, default false)
- `.unpublish` files excluded automatically (glob only matches `.mdx`)

**Post conversion** (22 posts: 20 published + 2 `.unpublish`):
- Renamed all `.md` → `.mdx` (and `.md.unpublish` → `.mdx.unpublish`)
- Stripped all `<script>` import blocks (9 posts had Svelte imports for Output/Details/ImgSmall)
- Stripped all `<style scoped>` blocks (2 posts had dataframe table styles → moved to `app.css`)
- Normalized frontmatter:
  - Removed `layout: posts` (legacy SvelteKit layout field)
  - Converted `categories: string` → `categories: [string, ...]` (YAML array)
  - Fixed `first_post.md` date: `2020-06-19 14:19:44 +0200` → `"2020-06-19"`
  - Fixed single-quoted strings in `ijzer.md` and `thesis.md` → double-quoted
  - Added missing `categories: [website, tools]` to `selfhosted.md`

**MDX math brace issue & resolution**:
- **Problem:** MDX v3 parses `{`/`}` inside `$$...$$` math blocks as JSX expressions (acorn parse error). `remark-math` is incompatible with MDX v3 — it uses legacy `remark-parse` APIs not available in the MDX parser.
- **Solution:** Custom `remark-mdx-math.mjs` plugin:
  1. `escape-math-braces.mjs` — run once on all posts: replaces `{`/`}` inside `$$` blocks with null-byte placeholders that MDX ignores
  2. `remark-mdx-math.mjs` — scans MDAST text nodes for `$$...$$`, creates `math`/`inlineMath` nodes with proper `data.hProperties.className`, restores `{`/`}` from placeholders
  3. `rehype-katex` renders the math nodes normally
- Remark/rehype plugins passed to `mdx({remarkPlugins, rehypePlugins})` — the `markdown.processor` extends to `.md` files but not `.mdx`

**MDX components** (`src/components/markdown/`):
| Component | Source | Notes |
|---|---|---|
| `Output.astro` | `Output.svelte` | "Output" header + styled `<pre>` with optional indent |
| `Details.astro` | `Details.svelte` | Interactive: inline `<script>` with `localStorage`, SVG chevron icon |
| `a.astro` | `a.svelte` | Styled link with Tailwind classes |
| `img.astro` | `img.svelte` | Centered image wrapper |
| `blockquote.astro` | `blockquote.svelte` | Styled blockquote with left border |
| `ImgSmall.astro` | `imgsmall.svelte` | Small right-floating image (used in `selfhosted.mdx`) |
- `pre` and `code` intentionally NOT overridden — Shiki handles code blocks, CSS handles inline code

**Routes**:
- `src/pages/blog/[...slug].astro` — uses `render()` from `astro:content`, passes components to `<Content />`
- `src/pages/blog/index.astro` — blog listing sorted by date desc, uses `PostCardGallery`

**Ported components**: `PostCard.astro`, `PostCardGallery.astro`, `BlogPostLayout.astro`

**CSS additions** (`src/styles/app.css`): inline code styling, dataframe table styles

**Build baseline** (SSG, 22 pages, clean build):
| Metric | Value |
|---|---|
| Build time | 4.4s |
| Output size | 2.2 MB (`dist/`) |
| Pages | 22 (1 root + 1 blog index + 20 posts) |
| JS payload | ~600 bytes inline (Details interactivity only) |
| KaTeX fonts | 1.3 MB (`dist/_astro/`, 59 font files) |
| Largest page | `ukf` — 168 KaTeX inline + 21 display + 11 Shiki blocks + 6 Details + 3 Outputs |
| No framework JS | Zero framework runtime — pure SSG with inline scripts where needed |

**Verified**:
- ✅ Shiki highlighting: 11 `astro-code monokai` blocks in `ukf`
- ✅ KaTeX math: 36 rendered expressions in `bayes_exam`, 189 in `ukf`
- ✅ Details component: 6 collapsible sections in `ukf`, localStorage persistence
- ✅ Output component: 3 outputs in `ukf`, 1 in `lastfm`
- ✅ ImgSmall: 16 instances in `selfhosted`
- ✅ Dataframe styles: present in `lastfm` output
- ✅ Category pills: rendered in post footer
- ✅ Teaser images: PostCard `src` paths preserved
- ✅ Draft posts excluded: `.unpublish` files not built
- ✅ Zero null-byte leakage in HTML output
- ⚠️ Deprecation warning: `remarkPlugins` on `mdx()` is deprecated in Astro 6.x (will need migration to `markdown.processor` when `extendMarkdownConfig` supports it for `.mdx`)

### Phase 4 — Site shell & core pages ✅ **COMPLETED**

#### Phase 4 — Completion notes ✅ **COMPLETED**

**Site shell** (`src/layouts/Layout.astro`):
- Full `<html>` / `<head>` / `<body>` structure shared by all pages
- **Anti-FOUC dark-mode script** (`is:inline` in `<head>`): reads `localStorage.theme` or
  `prefers-color-scheme`, sets `document.documentElement.classList` before first paint.
  Exact port of the `darkmode.svelte` inline head script.
- Header nav: Home, Blog, CV, Contact — matching old header.svelte styles exactly
- Footer: gradient spacer + copyright bar (ported from footer.svelte)
- `<slot />` for page content, `<slot name="head" />` for per-page head additions
- Imports `app.css` and `katex/dist/katex.min.css` globally (matches old `+layout.svelte`)

**Dark mode toggle** (`src/components/DarkMode.astro`):
- Button with inline Lucide Sun/Moon SVG icons (no `lucide-svelte` dependency)
- `<script>` (Astro-bundled) handles toggle: flips `localStorage.theme` + `classList` + icons
- NOT a `client:load` island — Astro components can't use hydration directives; the
  `<script>` inside `.astro` components is auto-bundled by Astro

**Refactored `BlogPostLayout.astro`**: now delegates to `Layout.astro` instead of having
its own `<html>` structure. Wraps content in prose `<article>`. CSS imports removed
(inherited from `Layout.astro`).

**Landing page** (`src/pages/index.astro`): full port of `+page.svelte` — Hello heading,
5 hobby sections (Reading, Cooking, Music, Coding, Gaming) with inline Lucide SVGs,
About this website section. Uses `Layout` + `SmallContainer` + `SectionHeader` +
`LandingSection`.

**Contact page** (`src/pages/contact.astro`): 5 `ContactItem` components (email,
location, github, work, linkedin) with inline Lucide SVG icons. Uses `Layout` +
`SmallContainer`.

**404 page** (`src/pages/404.astro`): replaces `+error.svelte`. Zap icon + error
message. Uses `Layout` + `SmallContainer`.

**Ported components**: `SmallContainer.astro`, `SectionHeader.astro`,
`landing/LandingSection.astro`, `contact/ContactItem.astro` (all Svelte → Astro).

**Build** (SSG, 24 pages, 4.5s): landing + contact + 404 + blog index + 20 posts.
Anti-FOUC script present on all pages. Theme toggle on all pages. Zero framework
runtime JS.

**Design decisions**: (1) No icon library — all Lucide icons are inline SVGs.
(2) `Layout.astro` is the single `<html>` root; `BlogPostLayout` delegates to it.
(3) Dark mode toggle is plain JS, not a framework island.

**Handoff for Phase 5 (CV)**: CV link in header exists but page doesn't — Phase 5
creates `src/pages/cv.astro`. `SectionHeader.astro` already built and reusable. CV
data model defined in §4.2 — YAML at `src/data/cv.yaml`. Old Svelte CV page at
`_reference/src/routes/cv/+page.svelte`.

**Handoff for Phase 6 (redirects/feeds/SEO)**: `src/lib/redirects.json` exists from
old build. RSS/Atom feeds from old SvelteKit build need porting. Phase 6 should be
done before any public Cloudflare Pages deploy to avoid breaking old inbound links.

**Handoff for Phase 7 (visual overhaul)**: dark-mode system fully functional and tested.
All components use Tailwind 4 utility classes — redesign changes are localized to
class strings. Icon SVGs are inline — a shared icon component could simplify Phase 7.

### Phase 5 — CV from YAML
**Goal:** `/cv` rendered from `src/data/cv.yaml`.
- YAML data collection + schema (§4.2); Astro components for each section.
- Migrate all current CV content into YAML; handle inline-HTML fields.
- Styling rough/functional (explicitly not priority).
- **Builds:** `/cv` from data, fully content-editable. ✅

> **Ordering note (Phase 5 vs 6).** CV precedes redirects/SEO, which is fine for local
> dev. *If* you do a soft launch on Cloudflare Pages before Phase 6, missing redirects
> could break inbound links / search indexing for the old Jekyll dash-slugs. For
> zero-downtime, do Phase 6 (redirects) **before** any public deploy — easy to flip
> since the phases are independent.

### Phase 6 — Routing parity (redirects, feeds, SEO)
**Goal:** no regressions vs old URLs; discoverability.
- Port `redirects.json` → Cloudflare Pages `public/_redirects` (301s), optionally
  mirrored in Astro `redirects` config so `astro preview` reflects them locally.
- Decide `trailingSlash` to match current behavior.
- Add `@astrojs/sitemap`, `@astrojs/rss` (`/rss.xml`), OG/meta tags (was in
  `+page.svelte` `<svelte:head>`).
- **Builds:** old slugs 301 to new paths; sitemap + RSS emitted. ✅

### Phase 7 — Visual overhaul (the redesign)
**Goal:** the new look. *This is where design work happens, not before.* Everything up
to here was "buildable, not pretty"; this is where it becomes pretty.
- Design system: tokens (extend the Tailwind 4 `@theme` from Phase 2), typography scale,
  refined dark mode, component polish.
- Reapply/replace the old prose styling with the new design.
- Convert remaining raw `<img>` usages to `<Image>`/`<Picture>` (§3.7) as the design
  settles.
- **Builds:** full site, redesigned. ✅

### Phase 8 — Performance & Cloudflare CDN
**Goal:** fast loads, edge-cached.
- `astro:assets` `<Image>`/`<Picture>` for teasers + in-post images (responsive, modern
  formats); migrate processable images out of `static/` into `src/` (hashed, immutable,
  long-cache filenames). SVG/PDF/pre-rendered plots stay in `public/`.
- Audit JS: confirm content pages ship ~0 JS; islands only where needed.
- `public/_headers`: long `Cache-Control` + `immutable` for hashed assets, sensible
  HTML caching (Cloudflare Pages honors `_headers`).
- Font loading strategy; Lighthouse pass against the Phase 3 baseline.
- **Builds:** optimized, CDN-friendly artifact. ✅

### Phase 9 — CI/CD (LOW priority, after it works locally)
**Goal:** automated build + deploy on Cloudflare Pages.
- Connect the repo to **Cloudflare Pages** (build command `astro build`, output `dist`)
  — Git-push deploys with automatic preview deployments per branch/PR.
  - Optional: keep a GitHub Action using `cloudflare/wrangler-action`
    (`wrangler pages deploy dist`) if we want the build to run in Actions instead of
    Pages' own builder.
  - **Cache purge** is largely automatic on Pages deploys; add an explicit
    `POST /zones/{zone}/purge_cache` (token `CF_API_TOKEN`, `CF_ZONE_ID`) only if the
    apex domain is proxied with custom cache rules that need busting.
- **Delete dead infra:** `Dockerfile`, `docker-compose.yml`, Traefik labels, the
  `node build` workflow, and `adapter-node` remnants.
- **Builds:** push-to-deploy with edge caching + preview URLs. ✅

### Phase 10 — Post-migration speedups (optional, after launch)
**Goal:** pull the remaining build-speed lever once everything is stable.
- **Sätteri (§3.4):** evaluate `@astrojs/markdown-satteri` for build speed; re-validate
  KaTeX math + heading anchors, porting to MDAST/HAST plugins if needed. Compare against
  the Phase 3 build-time baseline.
- (Tailwind 4 and dropping Svelte were pulled forward to Phases 1–2 and are already
  done by this point.)
- **Builds:** faster builds, same output. ✅

---

## 7. Risks & open questions

- **`Details` interactivity:** native `<details>` drops localStorage memory of
  open/closed state. OK? (Default: yes, reintroduce as island only if missed.)
- **KaTeX rendering:** confirm `rehype-katex` output matches the old
  `rehype-katex-svelte` (delimiters, `fleqn`, `throwOnError: false`).
- **Inline HTML in CV YAML:** `info`/`note`/flag fields need `set:html`; keep an eye on
  trust/escaping (content is self-authored, so acceptable).
- **MDX component scope:** components used in `.mdx` must be in scope (imported or via
  the `components` prop) — verify on the `Details`/`Output` posts in Phase 3 (§3.5).
- ~~**Tailwind 4 migration (Phase 2):** CSS-first `@theme`/`@plugin`/`@custom-variant`,
  the codemod's edge cases, and class-based dark mode are the riskiest mechanical change
  — but it's early, on a placeholder page, so breakage is cheap to spot.~~ → ✅ Resolved.
- **Svelte excision completeness (Phase 1):** confirm no `.astro` file imports anything
  Svelte and that the lockfile no longer resolves `svelte` before pruning is "done".
- **Embedded components beyond `Details`/`Output`:** before Phase 3, confirm the full
  set of components used across all posts; each needs an Astro/vanilla equivalent (no
  framework). If one needs real interactivity, native HTML/vanilla JS first.
- **Dark-mode anti-FOUC:** inline `<head>` + `localStorage` must paint correctly under
  Astro preview / Cloudflare Pages — test in Phase 4, not Phase 7.
- ~~**`rehype-add-classes` removal:** audit CSS depending on injected classes
  (`pre: 'bg-white'`) before dropping the plugin (§3.5).~~ → ✅ Removed. No dependent CSS.
- **Lucide icons:** `lucide-svelte` → use `lucide` static SVGs as Astro components (no
  framework runtime for icons).
- **Asset volume:** `static/blog/**` is large (many `.png/.webp/.svg/.pdf`); decide what
  goes through `astro:assets` vs stays in `public/` untouched.
- **`first_post.md` date** and the `devonvolution_part3` teaser typo must be fixed
  during Phase 3 normalization.

---

## 8. Suggested next concrete step

Phase 0 is done. **Next: Phase 1 (excise Svelte) then Phase 2 (Tailwind 4)** — both are
mechanical, low-risk on the current placeholder site, and they clear the dependency mess
so every later phase builds on a clean Astro-only + Tailwind 4 foundation.

Then, in Phase 3, prove the content pipeline on **one** post first (`ukf.mdx` — it
exercises Shiki, KaTeX, `Details`, and `Output`) before bulk-converting the other 19.
