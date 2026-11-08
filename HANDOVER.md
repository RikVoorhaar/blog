# Handover — blog-post-authoring skill

Branch: `feature/blog-writing-skill-11`, from issue
[#11](https://github.com/RikVoorhaar/blog/issues/11) ("Add a skill for planning and writing
blog posts"). The branch is local; nothing is pushed and no PR exists yet.

## What is on the branch

- `.agents/skills/blog-post-authoring/SKILL.md` — the skill draft.
- `.agents/skills/blog-post-authoring/references/plan-template.html` — the plan skeleton.
- `.github/workflows/ci.yml` — a new `ai-docs` job that fails when anything under
  `ai-docs/` is tracked.
- This handover.

The skill lives in `.agents/skills` because the repo already has
`.agents/skills/phase-executor`, and OpenCode discovers project skills from that source.

## Decisions the draft is built on

- **The user owns the ideas.** The agent is an editor, not an inventor. It may turn a
  rough, dictated rant into a draft, but every claim, joke, anecdote and opinion comes
  from the user. When the material is missing, ask.
- **One section at a time.** A section is one logically connected topic, usually a couple
  of short paragraphs.
- **Rant → questions → draft → refine.** The user may dictate on mobile; the rant is raw
  material, not final text. The agent asks only about omissions, missing facts, figures,
  cuts and unclear intent, and looks facts up rather than asking.
- **Voice rules live inline in `SKILL.md`.** No quote bank, no statistics, no tics list,
  no LLM-ism list. The target is simply "a person wrote this, not a model."
- **The plan is a living document.** Single static HTML file, Tailwind CDN, opened with
  the browser tool. Update it after every accepted change; rewrite affected beats on a
  pivot and add a one-line summary of what changed; the post wins when they disagree.
- **Plan location and lifecycle.** `ai-docs/<title>-plan.html`. Committed by default so
  the branch has the history; deleted before merge. CI rejects tracked AI docs. Squash
  merges drop the history from `main`.
- **The post stub is created immediately** after planning: `src/posts/<slug>.mdx` with
  frontmatter. The teaser can be a placeholder.
- **Commits are cheap.** Commit the plan and the post after every change, including
  drafts. Do not wait for approval to commit.
- **Preview default.** Push the branch and open a draft PR so Cloudflare Pages builds a
  readable version. The branch alias is
  `https://<branch>.rikvoorhaar.pages.dev` (slashes become dashes); the PR also gets a
  Cloudflare comment with the URL. Post the URL back in chat. The local dev server
  (`npm run dev -- --host 0.0.0.0`, background process) is the faster alternative.
- **Figures are collaborative.** The agent proposes; the user decides.
- **Title and excerpt.** The user may supply them. No menu of options. They must be in
  place before the PR.
- **Publish.** `npm run build` and `npm run lint` green, delete `ai-docs/`, open the PR,
  never merge.
- **Existing posts are out of scope.** This skill is for new posts.

## Open questions / things to check

1. **The `ai-docs` check on draft PRs.** If the plan is committed (the default), the job
   fails on every push, including the draft PR used for previews. Decide whether that red
   check is acceptable or whether the job should be skipped on draft PRs and run when the
   PR is marked ready. The current workflow runs it always.
2. **Preview URL retrieval.** PRs #13, #15 and #16 show the branch alias in the Cloudflare
   Pages comment. Confirm the exact way to pull it out and post it back (for example
   `gh pr view <n> --json comments` and grep for `pages.dev`).
3. **Skill loading.** Test that `blog-post-authoring` is advertised when a session is
   rooted in `~/repos/blog`, and that it does not fire for unrelated work.
4. **Plan template.** Check the sections and status badge colours. The template is a
   first pass.
5. **Description/triggers.** Tune after one real run.

## Next steps

1. Review `SKILL.md` and the template against the decisions above.
2. `npm ci`, then `npm run build` and `npm run lint`.
3. Test the CI guard on a scratch branch: add `ai-docs/x-plan.html`, commit, watch the job
   fail; delete it, watch it pass.
4. Test one real section through the preview workflow.
5. Remove this handover and `ai-docs/` before opening the PR.
