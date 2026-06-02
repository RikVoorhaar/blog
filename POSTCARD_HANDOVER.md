# PostCard handover — blog index card layout

## What this component does

`src/components/PostCard.astro` renders a single blog post card on the blog index page (`/blog`). Cards are displayed in a responsive CSS grid by `src/components/PostCardGallery.astro`:

```css
grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
gap: 1.5rem;
```

Each card is a flex-column that stretches to full row height (`h-full`) so cards in the same grid row have equal heights.

## Current state (after Phase 3 attempts)

**File:** `src/components/PostCard.astro`

### Structure

```
div.card (outer)
  ├── a (teaser link, block)
  │     └── Image / img (teaser image, w-full h-auto)
  └── div.content (flex flex-col flex-1 p-4 gap-1)
        ├── a (title, text-xl font-extrabold)
        ├── p (date, text-sm text-muted)
        ├── p (excerpt, pl-3, border-left teal, line-clamp-3)
        ├── div.flex-1 (spacer)
        └── div (category chips)
```

### Key CSS

| Element      | Classes/Styles                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Card outer   | `flex flex-col h-full`, `background: var(--surface-raised)`, `border-radius: var(--radius-lg)` (1rem) |
| Teaser `<a>` | `block`, `border-radius: var(--radius-lg) var(--radius-lg) 0 0`                                       |
| Teaser image | `w-full h-auto`, `display: block`                                                                     |
| Content area | `flex flex-col flex-1 p-4 gap-1` (gap-1 = 0.25rem vertical spacing)                                   |
| Title        | `text-xl font-extrabold`, color `var(--text-accent)` (crimson #f43f5e dark / #be123c light)           |
| Date         | `text-sm`, color `var(--text-muted)`                                                                  |
| Excerpt      | `pl-3 my-1 leading-snug line-clamp-3 text-sm`, `border-left: 2px solid var(--color-teal-500)`         |
| Categories   | `text-xs font-semibold uppercase`, crimson pill badges                                                |

### How teaser images are resolved

1. `astro:assets` imports all images matching `src/assets/teasers/*.{png,jpg,jpeg,webp}` eagerly
2. Looks up `post.data.teaser` filename in the import map
3. If found: renders via `<Image>` (Astro's optimized component, generates WebP srcsets, adds explicit `width`/`height` attrs)
4. If not found (SVGs): falls back to `<img>` pointing at `static/blog/teasers/original/<filename>`

### CSS variable values

| Variable           | Dark mode               | Light mode              |
| ------------------ | ----------------------- | ----------------------- |
| `--surface-raised` | `#141416` (dark gray)   | `#ffffff` (pure white)  |
| `--surface-base`   | `#0a0a0b`               | `#f4f4f2`               |
| `--text-accent`    | `#f43f5e` (crimson-500) | `#be123c` (crimson-700) |
| `--text-muted`     | `#a1a1aa`               | `#52525b`               |
| `--text-primary`   | `#fafafa`               | `#18181b`               |
| `--color-teal-500` | `#00b8a2`               | `#00b8a2`               |
| `--radius-lg`      | `1rem` (16px)           | `1rem`                  |
| `--radius-md`      | `0.625rem` (10px)       | `0.625rem`              |

## Problems the user wants fixed

The user has been going back and forth on the teaser image. Here's what they want:

1. **Teaser image fills card width completely** — no white/colored padding around the image. This rules out `object-contain` with a fixed aspect-ratio container, because non-16:10 images leave visible empty space (which is `var(--surface-raised)` = white in light mode).

2. **Teaser image is NOT cropped** — aspect ratio must be preserved. This rules out `object-cover` with a fixed-height or fixed-aspect-ratio container, because images of different shapes get cropped.

3. **Consistent card header height** — images shouldn't make some cards wildly taller than others. But this contradicts #1 and #2 for images with different aspect ratios.

4. **No gap between card top edge and image** — the image's top border-radius must match the card's exactly. (Fixed: both now use `var(--radius-lg)`.)

5. **Tight vertical spacing** between title, date, excerpt, and categories. (Currently `gap-1` = 0.25rem.)

6. **Excerpt left border** should not stretch below the text when the excerpt is short. (Fixed: spacer `div.flex-1` instead of `flex-1` on the excerpt `<p>`.)

7. **No "read more" link** — the teaser image and title are already links. (Fixed: removed.)

8. **Trim excerpt whitespace** — some excerpts have trailing newlines. (Fixed: `.trim()`.)

### The fundamental tension

Requirements 1 + 2 + 3 are mathematically incompatible for images with different aspect ratios displayed in a fixed-width card. The original code (before Phase 3) used `aspect-[16/10]` container + `object-cover`, which met #1 and #3 but violated #2 (cropping). The user rejected `object-cover`. The user also rejected `object-contain` because of visible padding (#1).

**Possible resolution paths:**

- **A:** Use `object-cover` with `object-position: top` or `object-position: center` — slight cropping, but consistent and clean. This is the original behavior, slightly refined.

- **B:** Require all teaser images to be exactly 16:10. Then `aspect-[16/10]` + `object-contain` works perfectly (no padding, no cropping, consistent height). Enforce this with image processing at build time.

- **C:** Let images set their own height (`w-full h-auto`, what's currently in the code), accept variable card header heights. Compensate by ensuring teaser images are landscape-oriented.

- **D:** Pre-process teaser images at build time: crop/resize them all to a uniform size. Then any image can be used as a teaser without layout issues.

## Where the relevant code lives

```
src/
├── components/
│   ├── PostCard.astro          ← The card component (main file to edit)
│   └── PostCardGallery.astro   ← Grid wrapper (gap-6, minmax(18rem, 1fr))
├── pages/blog/
│   └── index.astro             ← Blog index page (sorts posts, passes to gallery)
├── layouts/
│   └── BlogPostLayout.astro    ← Page layout (not card layout)
├── assets/teasers/             ← Teaser images (png/jpg/webp, processed by astro:assets)
├── static/blog/teasers/original/ ← SVG fallbacks (not processed)
└── styles/
    └── app.css                 ← CSS variables, theme definitions (lines 30-170)
```

## Other Phase 3 changes (complete, working)

These were applied and the user seems OK with them:

- **3a:** Publication date + categories moved from footer to below post title in `BlogPostLayout.astro`
- **3d:** CV role spacing — added `mb-4` wrapper around bullet points in `Experience.astro`
- **3e:** Nav link animations — active state uses `font-semibold scale-105`, hover uses `text-(--text-accent) scale-105` (underline removed)
