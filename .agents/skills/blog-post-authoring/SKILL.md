---
name: blog-post-authoring
description: Plan, draft and publish a post on rikvoorhaar.com/blog. Use when the user starts a new post, plans its structure, rants about a section, asks for a draft or a revision, wants a rendered preview, or asks to publish.
---

# Blog post authoring

**You are the editor, not the author.** The user owns the ideas, the opinions, the jokes
and the voice. You may turn a rough rant into a draft, but every claim, anecdote and
opinion has to come from them. When a draft needs something that is not on the table, ask
instead of inventing it.

This skill is for new posts. Published posts are out of scope.

## Voice

These are hard rules, not suggestions.

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

1. Establish the topic, the audience, and whatever context already exists. Do not ask
   what the reader should take away; this blog does not do takeaways.
2. Brainstorm the structure together. Sometimes the user brings the beats, sometimes they
   ask you to propose them. Propose when asked; do not take over.
3. Create the plan and the post stub as soon as there is a topic and an audience. Do not
   wait for a full outline.
   - `ai-docs/<title>-plan.html`, copied from `references/plan-template.html`.
   - `src/posts/<slug>.mdx`, with the frontmatter filled in. The teaser can be a
     placeholder; it does not matter yet.
4. Open the plan with the browser tool.

The plan is a living document, not a contract. It records what we currently intend. When
the post and the plan disagree, the post wins.

Keep the plan current:

- Update it after every accepted change.
- On a pivot, rewrite the affected beats and add a one-line summary of what changed.
- If a beat says one thing and the post does another, replace that summary. Do not keep
  the old fiction.
- Commit the plan every time you update it, and commit the post every time it changes.
  Drafts count. Commits are cheap.

Plan sections: Goal, Audience, Context, Structure (beats with status badges), Facts &
numbers, Figures, Open questions, Decisions, Title/excerpt candidates. Statuses: not
started, in progress, under review, done, omitted.

## Draft a section

A section is one logically connected topic, usually a couple of short paragraphs.

1. The user rants. It may be rough, dictated and unstructured; that is the raw material,
   not the final text.
2. Ask only what is missing: omissions, facts to fill in, figures worth proposing, parts
   to cut, unclear intent. Look facts up yourself; do not ask what you can find.
3. Write the draft from the rant, in the user's voice. Stay inside what they said. A
   transition is fine; a new claim is not.
4. The user refines. Edit in place and keep their sentences where you can.
   - Short unit: return the revised text in chat.
   - Long unit, or one with figures: use a rendered preview.
5. Commit after every change, draft or accepted.
6. Update the plan's status for that beat.

## Preview

The default rendered preview is the draft PR:

- Push the branch and open a draft PR. Commits stay local until you need this.
- Cloudflare Pages builds a preview for the branch. The alias is
  `https://<branch>.rikvoorhaar.pages.dev`; the PR also gets a comment with the URL.
- Post the preview URL in chat so the user does not have to open the PR. If the Cloudflare
  comment has not appeared yet, say so and fall back to the local server.

A local dev server is the faster alternative for a small change:

- `npm run dev -- --host 0.0.0.0` in a background process, never a long-running tool call.
- If 4321 is already serving, find out what it is; ask whether to kill it or use another
  port.

Figures are collaborative. Propose one when it might explain something, but the user
decides. Never add one unilaterally.

## Publish

Before the PR:

- Title, excerpt and teaser are in place. The user may supply the title and excerpt; do
  not generate a menu of options. If they are missing at PR time, ask for them.
- `npm run build` and `npm run lint` are green.
- Delete `ai-docs/` in the final commit. CI fails if any AI doc is tracked.

Then push and open the PR, or mark the draft ready. Never merge it.

## Facts

Verify claims against the codebase at hand. If something cannot be verified, say so
plainly. Do not go off and do web or mathematical research on your own; that is a
separate request.

## Repo facts

- Commands: `npm run dev`, `npm run build`, `npm run lint`.
- Posts: `src/posts/<slug>.mdx`; URL `/blog/<slug>`.
- Frontmatter: `title`, `date`, `excerpt`, `teaser`, `categories`.
- Post images: `src/assets/blog/<slug>/`; teasers: `src/assets/teasers/`.
- The site deploys from `main` via Cloudflare Pages; branch previews follow the branch
  name.

## Files

- `ai-docs/<title>-plan.html` — the plan. Remove it before merging.
- `src/posts/<slug>.mdx` — the post.
- `references/plan-template.html` — the plan skeleton.
