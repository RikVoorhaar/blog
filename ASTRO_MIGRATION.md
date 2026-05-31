# Migration Plan: SvelteKit + mdsvex → Astro 6.4

> Status: planning. Target: full migration of `rikvoorhaar.com` from SvelteKit 1.x /
> mdsvex to Astro 6.4, in independently-buildable phases. Blog posts first. Visual
> overhaul is explicitly deferred — get content live, then redesign.

---

## 1. Goals & constraints

**Hard requirements**

- Migrate the whole site to **Astro 6.4**.
- **Phased**: every phase must produce a site that builds and serves *part* of the site.
- **Content lives in Markdown / YAML.** No more hand-edited Svelte for data (the CV
  is the motivating pain point).
- Blog posts can embed Svelte components → treat posts **like MDX**.
- Maintainable, fast for the user, leans on **Cloudflare's CDN** as much as possible.

**Sequencing the user asked for**

1. Stand up a *basic* Astro site with the **same content** first.
2. **Blog posts are stage #1.** Matching the exact CV styling is *not* a priority.
3. Port the existing visual design *after* content is live.
4. CI/CD (cache invalidation etc.) is **low priority** — nothing ships until it works
   locally.

**Non-goals for the early phases**

- Pixel-perfect parity with current styling.
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
  removed during Phase 7 cleanup.
- DNS for `rikvoorhaar.com` points at Pages; keep the apex/`www` behavior consistent
  with today's Traefik host rules.

Nothing about Phases 1–5 depends on the host, so this only materially matters from
Phase 6 onward.

### 3.3 Integrations

- `@astrojs/mdx` — posts as MDX (Svelte components inside Markdown).
- `@astrojs/svelte` — reuse existing Svelte components as islands where interactivity
  is genuinely needed.
- Tailwind via the **Vite plugin** (`@tailwindcss/vite`, Tailwind 4) *or* keep
  Tailwind 3 + `@astrojs/tailwind`. **Decision: stay on Tailwind 3 for the migration**
  to preserve the existing   config/palettes and `@tailwindcss/typography`; revisit
  Tailwind 4 in Phase 8 (after the redesign is stable).
- `@astrojs/sitemap` + `@astrojs/rss` (Phase 4).
- `astro:assets` (built-in, `sharp`) for image optimization (Phase 5/6).

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

#### Sätteri (deferred, real Phase 8 opportunity)

Astro 6.4 ships **`@astrojs/markdown-satteri`** — a Rust-based Markdown/MDX processor
(`markdown.processor: satteri()`) that is dramatically faster than the unified pipeline
(Astro cut >1 min off their own docs builds). **It does not run remark/rehype plugins.**

**Decision:** stay on `unified()` for the migration, because we depend on
`remark-math`, `rehype-katex`, `rehype-slug`, and `rehype-autolink-headings`. Revisit
in Phase 8: Sätteri implements many features (incl. heading IDs) natively and supports
its own **MDAST/HAST** plugins, so the win is real once math + heading-anchor behavior
is re-validated or its plugins are ported. This is exactly the build-speed lever to
pull *after* everything works — not during the migration.

### 3.5 Component / element overrides

mdsvex mapped Markdown elements to Svelte components via the layout. Astro's MDX does
this with the **`components` prop** on `<Content />`:

- Map HTML elements (`img`, `a`, `pre`, `code`, `blockquote`) to **Astro** components.
- Map `Details` / `Output` so posts don't need per-file imports.

**Decision:** convert all posts to **`.mdx`** so the override mechanism is uniform and
Svelte components work everywhere ("treat like MDX", as requested).

> **MDX scope gotcha (verify in Phase 1).** mdsvex injects layout-mapped components
> ambiently, but **MDX requires components used in a file to be in scope** — either
> imported in the file *or* supplied via the `components` prop on `<Content/>`. We rely
> on the `components` prop so posts need no per-file imports, which works, but the
> ~10 posts using `<Details>` / `<Output>` (and all element overrides) must be
> explicitly checked. This is an acceptance item in Phase 1, not an assumption.

> **`rehype-add-classes` audit.** The old config injected `pre: 'bg-white'`. Before
> dropping the plugin in favor of CSS, grep post/global CSS for any rule that depends on
> classes it added (notably on `pre`), and reproduce them in the new prose styling.

### 3.6 Interactivity strategy (fast loads)

Most current "components" are presentational and can be **static Astro components**
(zero JS shipped):

- `Output`, `code`, `pre`, `img`, `a`, `blockquote`, all CV components → Astro.
- `Details` → reimplement with the **native `<details>`/`<summary>`** element (no JS,
  no Svelte runtime on blog pages). *Trade-off:* loses localStorage open/close memory.
  Acceptable per the user's "don't sweat the details" stance; can be re-added as a tiny
  island later if missed.
- `darkmode` → keep the inline anti-FOUC `<head>` script; the toggle button becomes a
  tiny vanilla `<script>` or a single `client:load` Svelte island.

Result: blog/content pages ship **little or no JS**, which is the fast-load win.

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
  processed; truly static assets stay in `public/`. (Asset triage happens in Phase 6 —
  see §7 "Asset volume".)

---

## 4. Content model

### 4.1 Blog posts — content collection

Use Astro Content Collections (Content Layer `glob()` loader) with a Zod schema. Keep
files in `src/posts/` (or move to `src/content/blog/`; decided in Phase 1).

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
  excluded by the glob. (Decided in Phase 1; `draft` flag is cleaner.)
- Fix the `devonvolution_part3` teaser typo (rename asset or correct frontmatter).

### 4.2 CV — YAML-driven

Replace the hand-written Svelte page with `src/data/cv.yaml` + a YAML data collection
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
| `@sveltejs/kit`, `adapter-node` | `astro` 6.4 (static output) |
| `mdsvex`, `svelte-preprocess` | `@astrojs/mdx` |
| `svelte`, `lucide-svelte` | `@astrojs/svelte` (islands only) + `lucide` icons as Astro components/SVG |
| `shiki` (manual) | Astro built-in Shiki |
| `rehype-katex-svelte` | `rehype-katex` |
| `remark-math`, `rehype-slug`, `rehype-autolink-headings` | unchanged (Astro markdown plugins) |
| `rehype-add-classes` (`pre: 'bg-white'`), `rehype-toc` | replace with CSS / `rehype-autolink` options — **audit dependent CSS first** (§3.5) |
| `svelte-image`, `svimg` | `astro:assets` (`<Image/>`, `sharp`) |
| `tailwindcss` 3, `@tailwindcss/typography` | keep for now; Tailwind 4 considered in Phase 8 |
| `vite`, `postcss`, `autoprefixer` | provided by Astro |
| SvelteKit `$lib`, `$app/*` | TS path aliases + `import.meta.env` / `Astro` globals |

---

## 6. Phases

Each phase ends with a **green `astro build`** and a runnable `astro preview` that
serves the listed routes.

### Phase 0 — Scaffold & tooling
**Goal:** empty Astro 6.4 site that builds.
- Add Astro 6.4 + `@astrojs/mdx` + `@astrojs/svelte`; wire Tailwind 3 config & palettes.
- `astro.config.mjs`: `output: 'static'`, `site`, markdown pipeline (Shiki monokai,
  remark-math, rehype-katex, slug, autolink), TS aliases (`@/*`, `$lib` shim).
- Global CSS: `app.css` (Tailwind layers, scrollbars, KaTeX overrides) + KaTeX CSS.
- One placeholder `index.astro`.
- **Avoid routing collisions with the old SvelteKit tree.** SvelteKit's `src/routes`
  and Astro's `src/pages` differ, so they won't clash directly, but keeping both apps in
  one working dir invites confusion (shared `src/lib`, `static/` vs `public/`, two
  configs). Cleanest: build the Astro app at the repo root on this `experiment/astro`
  branch and **delete the SvelteKit-specific files as each phase supersedes them**
  (routes in P1–P3, configs/Docker in P7), rather than running two frameworks in
  parallel long-term. The git branch already gives us the "parallel" safety net.
- **Builds:** a single placeholder page. ✅

### Phase 1 — Blog posts (PRIORITY #1)
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
  count/JS bytes) so later phases — especially Sätteri in Phase 8 — have a real number
  to compare against.
- **Builds:** `/blog` + all 20 `/blog/<slug>` pages with working code/math/components. ✅

### Phase 2 — Site shell & core pages
**Goal:** navigable site (landing, contact, header/footer, dark mode, 404).
- `Layout.astro` (header, footer, dark-mode head script + toggle island).
- **Test the dark-mode anti-FOUC script early.** The inline `<head>` + `localStorage`
  pattern from `darkmode.svelte` must run *before paint* and behave under Astro's
  preview iframe and on Cloudflare Pages. Validate it here (no flash, correct theme on
  reload) rather than discovering an issue during the Phase 5 redesign.
- Port `/` landing and `/contact` (content can move to Markdown/data if desired).
- `src/pages/404.astro` replacing `+error.svelte`.
- **Builds:** `/`, `/contact`, `/blog`, posts, with shared shell + dark mode. ✅

### Phase 3 — CV from YAML
**Goal:** `/cv` rendered from `src/data/cv.yaml`.
- YAML data collection + schema (§4.2); Astro components for each section.
- Migrate all current CV content into YAML; handle inline-HTML fields.
- Styling rough/functional (explicitly not priority).
- **Builds:** `/cv` from data, fully content-editable. ✅

> **Ordering note (Phase 3 vs 4).** CV precedes redirects/SEO, which is fine for local
> dev. *If* you do a soft launch on Cloudflare Pages before Phase 4, missing redirects
> could break inbound links / search indexing for the old Jekyll dash-slugs. For
> zero-downtime, do Phase 4 (redirects) **before** any public deploy — easy to flip
> since the phases are independent.

### Phase 4 — Routing parity (redirects, feeds, SEO)
**Goal:** no regressions vs old URLs; discoverability.
- Port `redirects.json` → Cloudflare Pages `public/_redirects` (301s), optionally
  mirrored in Astro `redirects` config so `astro preview` reflects them locally.
- Decide `trailingSlash` to match current behavior.
- Add `@astrojs/sitemap`, `@astrojs/rss` (`/rss.xml`), OG/meta tags (was in
  `+page.svelte` `<svelte:head>`).
- **Builds:** old slugs 301 to new paths; sitemap + RSS emitted. ✅

### Phase 5 — Visual overhaul (the redesign)
**Goal:** the new look. *This is where design work happens, not before.*
- Design system: tokens, typography scale, refined dark mode, component polish.
- Reapply/replace the old prose styling with the new design.
- Convert remaining raw `<img>` usages to `<Image>`/`<Picture>` (§3.7) as the design
  settles.
- (Tailwind 4 upgrade is deferred to Phase 8 — keep Tailwind 3 stable through the
  redesign.)
- **Builds:** full site, redesigned. ✅

### Phase 6 — Performance & Cloudflare CDN
**Goal:** fast loads, edge-cached.
- `astro:assets` `<Image>`/`<Picture>` for teasers + in-post images (responsive, modern
  formats); migrate processable images out of `static/` into `src/` (hashed, immutable,
  long-cache filenames). SVG/PDF/pre-rendered plots stay in `public/`.
- Audit JS: confirm content pages ship ~0 JS; islands only where needed.
- `public/_headers`: long `Cache-Control` + `immutable` for hashed assets, sensible
  HTML caching (Cloudflare Pages honors `_headers`).
- Font loading strategy; Lighthouse pass against the Phase 1 baseline.
- **Builds:** optimized, CDN-friendly artifact. ✅

### Phase 7 — CI/CD (LOW priority, after it works locally)
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

### Phase 8 — Post-migration speedups (optional, after launch)
**Goal:** pull the build/runtime levers that need a stable baseline first.
- **Sätteri (§3.4):** evaluate `@astrojs/markdown-satteri` for build speed; re-validate
  KaTeX math + heading anchors, porting to MDAST/HAST plugins if needed. Compare against
  the Phase 1 build-time baseline.
- **Tailwind 4:** upgrade and reconcile the custom palettes / typography plugin.
- **Drop `@astrojs/svelte`** entirely if no remaining island needs Svelte (dark-mode
  toggle can be vanilla; `Details` is native `<details>`), shrinking the toolchain.
- **Builds:** faster builds / smaller dependency surface, same output. ✅

---

## 7. Risks & open questions

- **`Details` interactivity:** native `<details>` drops localStorage memory of
  open/closed state. OK? (Default: yes, reintroduce as island only if missed.)
- **KaTeX rendering:** confirm `rehype-katex` output matches the old
  `rehype-katex-svelte` (delimiters, `fleqn`, `throwOnError: false`).
- **Inline HTML in CV YAML:** `info`/`note`/flag fields need `set:html`; keep an eye on
  trust/escaping (content is self-authored, so acceptable).
- **MDX component scope:** components used in `.mdx` must be in scope (imported or via
  the `components` prop) — verify on the `Details`/`Output` posts in Phase 1 (§3.5).
- **Dark-mode anti-FOUC:** inline `<head>` + `localStorage` must paint correctly under
  Astro preview / Cloudflare Pages — test in Phase 2, not Phase 5.
- **`rehype-add-classes` removal:** audit CSS depending on injected classes
  (`pre: 'bg-white'`) before dropping the plugin (§3.5).
- **Lucide icons:** `lucide-svelte` → use `lucide` SVGs as Astro components (avoid
  shipping Svelte just for static icons).
- **Asset volume:** `static/blog/**` is large (many `.png/.webp/.svg/.pdf`); decide what
  goes through `astro:assets` vs stays in `public/` untouched.
- **`first_post.md` date** and the `devonvolution_part3` teaser typo must be fixed
  during Phase 1 normalization.

---

## 8. Suggested first concrete step

Phase 0 + the Phase 1 skeleton for **one** post (e.g. `ukf.mdx`, since it exercises
Shiki, KaTeX, `Details`, and `Output`) — proving the whole content pipeline end to end
before bulk-converting the remaining 19 posts.
