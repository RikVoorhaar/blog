---
name: astro-migration
description: Execute a phase of the SvelteKit to Astro 6.4 migration for rikvoorhaar.com. Use when implementing the next phase from ASTRO_MIGRATION.md, porting Svelte components to Astro, or recording phase completion notes.
---

# Astro Migration Phase Execution

The full migration plan and all architectural decisions live in `ASTRO_MIGRATION.md`
at the project root. This skill covers the step-by-step workflow for executing one
phase. Read the phase spec in the migration doc before starting.

## Workflow

### 1. Read the phase spec in `ASTRO_MIGRATION.md`

Read the full file — later phases depend on decisions from earlier sections. Understand
what the phase builds, its acceptance criteria, and any handoff notes from the previous
phase. Phases 0–5 are complete; the next is Phase 6 unless specified otherwise.

### 2. Gather blueprints from `_reference/`

The old SvelteKit code lives in `_reference/` (git-tracked, excluded from builds).
For each page/component to port:
1. Find the source: pages in `_reference/src/routes/`, components in
   `_reference/src/lib/components/`.
2. Read it fully — props, state, interactivity, styling.
3. Map Svelte to Astro using the cheat sheet below.

### 3. Implement

Follow the conventions in `ASTRO_MIGRATION.md` §3 (architecture) and §4 (content model).
Key things to remember:

**Svelte -> Astro cheat sheet:**

| Svelte | Astro |
|---|---|
| `export let prop;` | `const { prop } = Astro.props;` |
| `{#if x}...{/if}` | `{x && (<>...</>)}` |
| `{#each items as item}...{/each}` | `{items.map(item => (<>...</>))}` |
| `{#each items as item, i}` | `{items.map((item, i) => (<>...</>))}` |
| `{@html raw}` | `<Fragment set:html={raw} />` |
| `<svelte:head>` | `<slot name="head" />` in Layout |
| `on:click={handler}` | `<button onclick="handler()">` in inline `<script>` |
| `bind:value` | `element.value` in vanilla JS `<script>` |
| `$: derived = ...` | Compute in frontmatter or inline JS |
| `import C from './F.svelte'` | `import C from './F.astro'` |

**Component porting checklist:**
1. JS/TS logic -> Astro frontmatter (`---` fences)
2. Template HTML stays; convert control flow to JSX-like expressions
3. Replace Svelte directives (`set:html`, `class:`, `style:`, `bind:`, `on:`)
4. Interactivity -> `<script>` at bottom of `.astro` file (Astro bundles it)
5. Multiple instances on one page? Generate unique DOM `id`s (e.g. from a data field)
6. Match old Tailwind classes; `@theme` tokens (main, secondary, turbo, puerto-rico)
   are available as utilities

**Common pitfalls:**
- Title double-suffix: `Layout.astro` appends ` — Rik Voorhaar`; don't include it in
  the `title` prop.
- `publicDir: 'static'` must be in `astro.config.mjs` or static assets silently 404.
- MDX component scope: components go via the `components` prop on `<Content />`, not
  per-file imports. The map is in `src/pages/blog/[...slug].astro`.
- Math braces in MDX: don't touch the `remark-mdx-math.mjs` pipeline from Phase 3.
- No `client:load` or hydration directives — this project ships zero framework JS.

### 4. Verify the build

```bash
npm run build
```

Must exit 0. The MDX `remarkPlugins` deprecation warning (from Phase 3) is known and
ignored. Then check the output:

```bash
ls dist/                     # top-level pages
ls dist/<new-route>/         # new route
```

Spot-check in `astro preview`. Checklist:
- Build exits 0 with no new errors/warnings
- New routes render correctly
- Dark mode works on new pages
- No framework JS (check `dist/` for unexpected `.js`)
- Interactive elements work without console errors

### 5. Record completion notes in `ASTRO_MIGRATION.md`

Append under the phase heading using the template from earlier phases:

```markdown
#### Phase N — Completion notes ✅

**What was built / changed:**
- ...

**Ported components** (if applicable):
| Astro component | Svelte source | Notes |
|---|---|---|

**Build baseline:**
| Metric | Value |
|---|---|
| Build time | ~X.Xs |
| Total pages | N |
| New pages vs previous phase | N |
| Framework JS | Zero |
| Errors/warnings | None |

**Design decisions** (numbered list)

**Handoff for Phase N+1** (concrete: files to port, data available, config needed,
ordering dependencies)
```

### 6. Communicate the outcome

Tell the user what was built (with paths), build numbers, decisions made, and what
Phase N+1 will need. Ask if they want to proceed or adjust.
