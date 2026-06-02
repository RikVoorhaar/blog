# Rik's blog

Source code for [rikvoorhaar.com](https://rikvoorhaar.com).

**Stack:** [Astro](https://astro.build) 6.4 + [Tailwind CSS](https://tailwindcss.com) 4, hosted on [Cloudflare Pages](https://pages.cloudflare.com).

## Local development

```bash
npm install
npm run dev         # → http://localhost:4321
```

Other commands:

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run build`   | Production build (static output to `dist/`) |
| `npm run preview` | Preview the production build locally        |
| `npm run lint`    | Prettier + ESLint                           |
| `npm run format`  | Auto-format with Prettier                   |

## Adding a blog post

Create a new `.mdx` file in `src/posts/`:

```
src/posts/my-post.mdx
```

### Required frontmatter

```yaml
---
title: 'My Post Title'
date: '2025-06-02'
categories: [coding, math]
excerpt: 'A one-sentence summary shown in post cards.'
teaser: 'my-teaser.png'
---
```

### Frontmatter field reference

| Field        | Type     | Description                                                                       |
| ------------ | -------- | --------------------------------------------------------------------------------- |
| `title`      | string   | Post title. Displayed in the blog index and on the post page.                     |
| `date`       | string   | Publication date in `YYYY-MM-DD` format.                                          |
| `categories` | string[] | Lowercase, kebab-case strings. Used for related-posts scoring and category chips. |
| `excerpt`    | string   | One sentence displayed in post cards. Rendered with `line-clamp-3`.               |
| `teaser`     | string   | Image filename used as the card thumbnail and OG image. See below.                |
| `draft`      | boolean  | Optional (defaults to `false`). Set `true` to hide from production builds.        |

### Images

**Teaser images** must be placed in **two** locations:

1. `src/assets/teasers/` — processed by `astro:assets` for optimized WebP output.
2. `static/blog/teasers/original/` — fallback for non-raster images (e.g. SVGs).

Raster formats (png, jpg, webp) go through `astro:assets`; SVGs stay in `static/` only.

**In-post images:** Place raster images in `src/assets/blog/<post-slug>/` — they are processed by `astro:assets` for responsive WebP output. SVGs go in `static/blog/<post-slug>/`.

### Preview and deploy

Run `npm run dev` to preview locally. Cloudflare Pages auto-deploys on every push to the production branch.
