---
name: blog-post-authoring
description: Plan, draft and publish a new post on rikvoorhaar.com/blog. Use when the user starts a post, plans its structure, rants about a section, asks for a draft or a revision, wants a rendered preview, or asks to publish.
---

# Blog post authoring

**You are the editor, not the author.** The user owns the ideas, the opinions, the jokes
and the voice. You may turn a rough rant into a draft, but every claim, anecdote and
opinion has to come from them. When a draft needs something that is not on the table, ask
instead of inventing it.

This skill is for new posts. Published posts are out of scope.

## Voice

These are hard rules, not suggestions. When in doubt, read a recent post in `src/posts/`;
that is the voice.

- It has to read like a person wrote it, not a model. If a sentence sounds like an LLM
  wrote it, it is wrong.
- American spelling, contractions throughout.
- `I` for what happened; `we` for walking the reader through the reasoning. That `we` is
  reader-inclusive, never royal.
- Spaced `--` for dashes. No em dashes.
- Active and passive voice mixed freely, the way the user mixes them.
- Parentheticals are normal. Rhetorical questions are normal, and some of them get
  answered.
- Humor and self-deprecation are welcome. No profanity.
- No takeaways, no recaps, no "key takeaways", no LinkedIn ending. End on something
  concrete or forward-looking.
- Sentence-case headings. Question headings are fine.
- Math: define it in words first, then the notation. Display equations unnumbered.
- Figures are bare by default. No caption unless the figure genuinely needs one; the
  prose does the work.
- No length target.
- Do not flatter the user's writing or grade it. When you fix a factual error, state the
  fix neutrally.
- Do not sand off the voice. Small words, asides and rhythm are the point.

## Start a post

1. Establish the topic and the audience, and whatever context already exists. Do not ask
   what the reader should take away; this blog does not do takeaways.
2. Brainstorm the beats together. Sometimes the user brings them, sometimes they ask you
   to propose them. Propose when asked; do not take over. Agree the shape in beats, not in
   words; there is no length target.
3. Create the branch, the plan and the post stub as soon as there is a topic and an
   audience. Do not wait for a full outline.
   - Branch from `main`: `post/<slug>`.
   - `ai-docs/<slug>-plan.html`, copied from `references/plan-template.html`.
   - `src/posts/<slug>.mdx`, frontmatter only, empty body.

     ```yaml
     ---
     title: 'Working title'
     date: 'YYYY-MM-DD'
     categories: [mathematics, code]
     excerpt: 'One or two sentences. A placeholder is fine for now.'
     teaser: 'test.png'
     ---
     ```

     `teaser` is a filename in `src/assets/teasers/`; point it at an existing image until
     there is a real one. Do not set `draft: true`: it removes the route, so the post
     cannot be previewed.
4. Show the plan with the browser preview tool (`ai-docs/<slug>-plan.html`). A `file://`
   tab does not work; re-show it after each edit.

The plan is a living document, not a contract. It records what we currently intend. When
the post and the plan disagree, the post wins.

Keep the plan current:

- Update it in the same commit as every accepted change.
- On a pivot, rewrite the affected beats and add a line to the change log.
- If a beat says one thing and the post does another, fix the beat. Do not keep the old
  fiction.
- Commit the plan and the post after every change. Drafts count. Commits are cheap.

Plan sections: Goal, Audience, Context, Structure (beats with status badges), Facts &
numbers, Figures, Open questions, Decisions, Title and excerpt, Change log. Statuses: not
started, in progress, under review, done, omitted.

## Draft a section

A section is one logically connected topic, usually a couple of short paragraphs. In the
post it is a `##` heading; `###` is for a subsection inside a long section.

1. The user rants. It may be rough, dictated and unstructured; that is the raw material,
   not the final text.
2. Ask only what is missing: omissions, facts to fill in, figures worth proposing, parts
   to cut, unclear intent. Anything already in the repo or in the conversation you check
   yourself; anything that needs outside research you ask about.
3. Write the draft from the rant, in the user's voice. Stay inside what they said. A
   transition is fine; a new claim is not.
4. The user refines. Edit in place and keep their sentences where you can.
   - Short unit: return the revised text in chat.
   - Long unit, or one with figures: send a rendered preview.
5. Commit after every change, draft or accepted.
6. Update the plan's status for that beat.

## Preview

Use the draft PR by default. The local server is faster for a small change.

**Draft PR.**

- Push the branch. Commits stay local until you need this.
- Open the PR as a draft (`gh pr create --draft`), or reuse the one from an earlier push.
- Cloudflare Pages comments on the PR once it has built. Read the branch URL from that
  comment; long branch names are truncated in the alias, so do not build the URL by hand:

  ```sh
  gh pr view <n> --json comments --jq '.comments[].body' \
    | grep -A2 "Branch Preview URL" | grep -o "https://[a-z0-9.-]*\.pages\.dev" | head -1
  ```

  Deploys take a minute or two. If the comment has not arrived yet, say so and fall back
  to the local server.

- Point the user at `<that URL>/blog/<slug>` in chat, so they do not have to open the PR.

**Local server.**

- `npm run dev -- --host 0.0.0.0` in a background process, never a long-running tool call.
- Pages are at `http://localhost:4321/blog/<slug>`.
- If 4321 is already serving, find out what it is; ask whether to kill it or use another
  port.

Figures are collaborative. Propose one when it might explain something, but the user
decides. Never add one unilaterally. Anything heavier than an image is imported in the post
itself, not registered globally.

## Publish

Before the PR:

- Title, excerpt and teaser are in place. The user may supply the title and excerpt; do
  not generate a menu of options. If they are missing at PR time, ask for them.
- `npm run build` and `npm run lint` are green.
- Delete `ai-docs/` (and any scratch notes) in the final commit. CI fails if an AI doc is
  tracked. That check is skipped while the PR is a draft, so it first runs when you mark
  the PR ready. The plan lives in the branch history only.

Then push and mark the PR ready (`gh pr ready`), or open it. Never merge it.

## Facts

Verify claims against the codebase at hand. If something cannot be verified, say so
plainly. Research outside the repo (web, literature, a derivation) is a separate request;
ask before going off on one.

## Repo facts

- Commands: `npm run dev`, `npm run build`, `npm run lint`.
- Posts: `src/posts/<slug>.mdx`; URL `/blog/<slug>`.
- Frontmatter: `title`, `date`, `excerpt`, `teaser`, `categories`. No `draft` key.
- Post images: `src/assets/blog/<slug>/`; teasers: `src/assets/teasers/`.
- Branches: `post/<slug>`.
- The site deploys from `main` via Cloudflare Pages; every branch gets a preview alias.

## Files

- `ai-docs/<slug>-plan.html` — the plan. Remove it before merging.
- `src/posts/<slug>.mdx` — the post.
- `references/plan-template.html` — the plan skeleton.
