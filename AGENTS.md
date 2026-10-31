# Agent instructions — blog

Astro 6.4 static site (MDX posts, Tailwind 4, no UI framework). Package manager is
**npm** (`package-lock.json` is the lockfile).

## Commands

```sh
npm run dev      # astro dev, http://localhost:4321
npm run build    # astro build — must stay green
npm run preview
npm run lint     # prettier --check + eslint
npm run format
```

## Layout of the thing

| Path                       | What lives there                                                        |
| -------------------------- | ----------------------------------------------------------------------- |
| `src/posts/*.mdx`          | Blog posts. Collection + frontmatter schema in `src/content.config.ts`. |
| `src/assets/blog/<slug>/`  | Post images, imported with `astro:assets`.                              |
| `src/assets/teasers/`      | Card/OG images, keyed by `teaser:` in frontmatter.                      |
| `src/assets/models/…`      | Binary meshes, imported with Vite's `?url` and fetched at runtime.      |
| `src/assets/textures/…`    | PBR texture sets, same `?url` treatment.                                |
| `src/components/markdown/` | Components registered globally for every post (see below).              |
| `static/`                  | `publicDir`; served verbatim at the site root.                          |
| `docs/archive/`            | Historical migration notes. Not current.                                |

## Posts and frontmatter

`title`, `date`, `excerpt`, `teaser`, `categories` are required; `draft` defaults to
`false`. Post URLs are `/blog/<file-stem>`.

Markdown components (`Output`, `Details`, `a`, `img`, `blockquote`, `ImgSmall`) are wired
up once in `src/pages/blog/[...slug].astro` and apply to every post. Anything heavier or
interactive — like `LatticeViewer.astro` — should be **imported in the post itself**, so
its bundle only lands on pages that use it.

### Known problem: the `draft` flag

`draft` is filtered in **four** places (`[...slug].astro`, `blog/index.astro`,
`rss.xml.ts`, and implicitly anywhere else a `getCollection('blog')` call is added).
A `draft: true` post gets **no route at all**, so it cannot be previewed — the flag does
the opposite of what a draft flag is for.

**This should be removed** (treat every post as public and use the branch for staging,
or replace it with an `unlisted` flag that still builds a route). It is deliberately out
of scope for now; do not leave a new draft-dependent feature behind when you touch it.

Tracked in <https://github.com/RikVoorhaar/blog/issues/10> — delete this section when
that lands.

## Three.js viewer rules

`src/components/LatticeViewer.astro` + `src/lib/lattice/` render the printable lattices.
The constraints matter more than the code:

- **Never import Three.js from `src/layouts/Layout.astro`** or any global entry point. The
  engine (`src/lib/lattice/engine.ts`) is only imported dynamically inside
  `mount.ts`, which is only included by `LatticeViewer.astro`.
- **Scene parameters live in `src/lib/lattice/presets.ts` and `types.ts`**, never inline in
  the rendering code. Retuning composition means editing data, not logic.
- **Render on demand.** Do not add a permanent `requestAnimationFrame` loop; call
  `requestRender()` instead.
- **Dispose GPU resources** when a viewer goes away (`pagehide`) — geometry, materials,
  textures, and the WebGL context.
- Meshes are `.glb`, generated from the parent project's STLs with
  `uv run python -m printable_surfaces.glb`. Do not commit raw multi-megabyte STLs into
  the blog; regenerate the GLB instead.
