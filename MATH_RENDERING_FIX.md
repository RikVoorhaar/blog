# Plan: Restore Clean Math Source in Blog Posts

**Status:** Ready for implementation
**Owner:** (handoff to implementing agent)
**Scope:** Remove the `LB`/`RB`/`US`/`ST` placeholder mangling from `.mdx` posts and the
build pipeline; render math from clean, human-readable LaTeX (`{ } _ ^ * \begin{...}` etc.),
matching the original blog source.

---

## 1. Problem statement

The current pipeline rewrites the **source** `.mdx` files so that, inside math, every
special character is replaced with a literal placeholder token:

| In source file | Should be |
|---|---|
| `LB` | `{` |
| `RB` | `}` |
| `US` | `_` |
| `ST` | `*` |

So a line that should read:

```latex
$$f(x|\theta) = \frac{1}{\sigma_1 \sqrt{2\pi}}\exp\left(-\frac12\left(\frac{x-\mu_1}{\sigma_1}\right)^2\right)$$
```

is currently stored on disk as:

```latex
$$f(x|\theta) = \fracLB1RBLB\sigmaUS1 \sqrtLB2\piRBRB\expLB...
```

This is **unreadable and unmaintainable** — authors cannot write or edit math, and the
source no longer matches the original posts. This is a regression introduced by the
SvelteKit→Astro migration and must be reversed. The math source should look exactly like the
original `.md` posts (still available in git on the `main` branch).

---

## 2. Root cause (verified)

MDX parses `{ ... }` as **JSX expressions** and `_` / `*` as **markdown emphasis** during
its micromark tokenization pass — which runs **before** any `remark` (mdast) plugin. The
custom `remark-mdx-math.mjs` plugin operates on the mdast tree, i.e. too late: by the time it
runs, MDX has already split `\frac{1}{2}` into text + JSX-expression nodes and wrapped `x_k`
in `<em>`. The placeholder mangling in `escape-math-braces.mjs` was a workaround to hide
those characters from the MDX tokenizer.

The reason the standard `remark-math` approach was never used: the installed version is
**legacy and incompatible with this use case**.

Evidence gathered from the current project:

```
remark-math:               3.0.1   (legacy — mdast-only, no micromark tokenizer)
micromark-extension-math:  not installed
@mdx-js/mdx:               3.1.1
```

`remark-math@3` is the old implementation that relies on remark's deprecated tokenizer and
does **not** register a micromark extension. In an MDX pipeline it cannot tokenize math
before MDX claims the braces, which is exactly why the author fell back to source mangling.

Modern `remark-math` (v4+, current v6) ships `micromark-extension-math`, which registers a
**micromark-level** tokenizer. When passed through `@astrojs/mdx`'s `remarkPlugins`, this
extension tokenizes `$...$` / `$$...$$` **before** MDX's expression/emphasis tokenizers run,
so `{ } _ ^ *` inside math are treated as opaque math content and never parsed as JSX or
emphasis. No escaping is needed.

### Verification performed

A standalone compile test was run against the project's own `@mdx-js/mdx@3.1.1` with
`remark-math@6` + `rehype-katex@7`, feeding **raw, unescaped** math:

```latex
Inline $x_k$ and $\frac{a}{b}$.
$$ \begin{align*} \hat x_k &\leftarrow x_{k-1}+v_{k-1}t \end{align*} $$
```

Result: **compiles cleanly, renders 10 KaTeX spans, zero `<em>` injection, zero JSX
expression errors.** This confirms the recommended approach works with the existing MDX
version. (The scratch test was removed after verification.)

---

## 3. Recommended solution

Replace the entire custom escaping mechanism with the standard, well-supported toolchain:

1. **Upgrade** `remark-math` to `^6` (brings `micromark-extension-math`).
2. **Use `remark-math` directly** in `astro.config.mjs` in place of the custom
   `remark-mdx-math.mjs`.
3. **Keep** `rehype-katex` (already v7, compatible).
4. **De-mangle** all post source files back to clean LaTeX.
5. **Delete** the now-obsolete `remark-mdx-math.mjs` and `escape-math-braces.mjs`.

This removes ~80 lines of fragile custom code, deletes a destructive prebuild script, and
restores readable source — while keeping the existing `.mdx` format (so the `<Output>`,
`<Details>`, `<ImgSmall>` MDX components keep working untouched).

> Note: staying on `.mdx` is intentional. The posts use MDX components
> (`<Output>`/`<Details>`/`<ImgSmall>` — see `src/pages/blog/[...slug].astro`), so converting
> back to plain `.md` would require reimplementing those as remark directives. That is out of
> scope; the math fix does not require it.

---

## 4. Implementation steps

### Step 1 — Dependencies

```bash
npm install remark-math@^6
```

Confirm `micromark-extension-math` is pulled in transitively:

```bash
ls node_modules/micromark-extension-math/package.json   # should exist
```

`rehype-katex@^7` and `katex@^0.16` are already correct; no change needed.

### Step 2 — Wire up the standard plugin

In `astro.config.mjs`:

- Remove `import remarkMdxMath from './remark-mdx-math.mjs';`
- Add `import remarkMath from 'remark-math';`
- In the `mdx({ ... })` integration, change `remarkPlugins: [remarkMdxMath]` to
  `remarkPlugins: [remarkMath]`.
- Leave `rehypePlugins: [[rehypeKatex, { fleqn: true, throwOnError: false }], rehypeSlug, rehypeAutolinkHeadings]` as-is.

> `fleqn: true` was used by the original; keep it so display math stays left-aligned and the
> visual layout is unchanged.

### Step 3 — De-mangle the source files (the critical step)

All `src/posts/*.mdx` (and `*.unpublish`) currently contain `LB`/`RB`/`US`/`ST` tokens
**only inside math delimiters**. They must be reversed **only within math regions** so that
literal occurrences elsewhere (e.g. "MNI**ST**", a variable named `US`) are not corrupted.

**Recommended approach — reverse transform scoped to math, then diff against git:**

1. Write a one-shot script that, for each post, matches math regions
   (`/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g`) and inside each match applies:
   `ST→*`, `US→_`, `RB→}`, `LB→{` (reverse order of the original; braces last).
2. **Cross-check correctness against the original clean source**, which still exists in git:

   ```bash
   git show main:src/posts/normal_data.md   # original, clean math
   ```

   For every post, diff the de-mangled math blocks against the `main` `.md` equivalent. The
   math content should match character-for-character (ignoring the Svelte `<script>` →
   MDX-component differences that are outside math). This catches any ambiguous reversal.
3. Spot-check the trickiest posts manually: `ukf.mdx` (uses `\begin{align*}`, nested braces,
   `\overline{x_{k-1}}`), `normal_data.mdx`, `gmres.mdx`, `deconvolution_part*`,
   `discrete_function_tensor.mdx`, `low_rank_matrix.mdx`.

**Why scoping matters:** outside math, `ST`/`US`/`LB`/`RB` are ordinary letters and must be
left alone. The original escape script only touched text inside `$...$`/`$$...$$`, so the
inverse must do the same.

**Ambiguity note:** inside a math region, a literal `LB`/`RB`/`US`/`ST` as actual LaTeX text
(e.g. `\text{LB}`) is essentially nonexistent in these posts, but the git cross-check in (2)
is the authoritative safeguard. If any post's de-mangled math does not match `main`, prefer
copying the math verbatim from the `main` `.md` file.

### Step 4 — Delete obsolete pipeline code

```bash
rm remark-mdx-math.mjs
rm escape-math-braces.mjs
```

Grep to ensure nothing else references them:

```bash
grep -rn "remark-mdx-math\|escape-math-braces" --include="*.mjs" --include="*.js" --include="*.ts" --include="*.json" .
```

(The build script in `package.json` is just `astro build`; `escape-math-braces.mjs` was only
ever run manually, so removing it has no build impact.)

### Step 5 — Optional cleanup

`remark-math@3.0.1` currently sits in `devDependencies` unused (the project used the custom
plugin instead). After upgrading, it moves to being actually used — verify it is listed once
at `^6` and there is no stale `^3` entry.

---

## 5. Validation checklist

Run after each of Steps 2–4:

- [ ] `npm run build` exits 0 with **no** KaTeX `unknownSymbol` / `No character metrics`
      warnings (those warnings were the symptom of mangled tokens reaching KaTeX).
- [ ] No leftover placeholders in **output**:
      `grep -rE '\b(LB|RB|US|ST)\b' dist/blog/*/index.html` returns only legitimate words
      (e.g. inside "MNIST", prose), never inside `<annotation encoding="application/x-tex">`.
- [ ] No leftover placeholders in **source math**: for each `src/posts/*.mdx`, math regions
      contain real `{ } _ ^ *`, not `LB`/`RB`/`US`/`ST`.
- [ ] Source is readable: open `normal_data.mdx`, `ukf.mdx` — math should look like normal
      LaTeX, identical in spirit to `git show main:src/posts/<name>.md`.
- [ ] Visual spot check via `astro preview` (or built HTML) of math-heavy posts in **both**
      light and dark themes: `bayes_exam`, `deconvolution_part1..4`, `ukf`, `gmres`,
      `normal_data`, `low_rank_matrix`, `discrete_function_tensor`, `thesis`,
      `validation_size`. Display + inline math render correctly, including fractions,
      subscripts/superscripts, `\begin{align*}` blocks, and nested braces.
- [ ] MDX components still work (`<Output>`, `<Details>`, `<ImgSmall>`) — these are unrelated
      to math but the same files are being edited, so confirm no accidental breakage.

---

## 6. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| De-mangle corrupts a literal `LB`/`US`/etc. inside math | Low | Scope replacement to math regions only; diff every post against `main` `.md`. |
| `remark-math@6` changes class names / markup `rehype-katex` expects | Very low | v6 + rehype-katex v7 are the matched current pair; verified compiling cleanly. KaTeX CSS already imported in `Layout.astro`. |
| Display vs inline detection differs from custom plugin | Low | `remark-math` uses standard CommonMark rules (`$$` block vs `$` inline); the original `.md` posts were authored for exactly this, so behavior should match the pre-migration site. Keep `fleqn: true`. |
| Some posts use single-`$` vs `$$` inconsistently | Medium | The original `.md` files are the source of truth — `remark-math` handles both `$inline$` and `$$display$$`. Verify against `main` if a post looks off. |

---

## 7. Rollback

All changes are isolated and git-tracked:

- Revert `astro.config.mjs`, restore `remark-mdx-math.mjs` + `escape-math-braces.mjs`, and
  `git checkout` the post source files to return to the current (mangled-but-rendering) state.
- Because the de-mangle is a scripted, reviewable transform with a git cross-check, prefer
  committing Step 3 separately so it can be reverted independently of the config change.

---

## 8. Summary of files touched

| File | Action |
|---|---|
| `package.json` | Bump `remark-math` `^3` → `^6` |
| `astro.config.mjs` | Swap custom plugin for `remark-math` |
| `remark-mdx-math.mjs` | **Delete** |
| `escape-math-braces.mjs` | **Delete** |
| `src/posts/*.mdx` (12 with math) | De-mangle math regions to clean LaTeX |
| `src/posts/*.unpublish` | De-mangle if they contain math |

Net effect: less code, no prebuild mangling step, and source math that reads exactly like the
original blog posts — supporting `{ } _ ^ *` and `\begin{...}` natively.
