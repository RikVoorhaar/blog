---
name: phase-executor
description: Execute a named phase from a project planning document. Use when the user specifies a planning document and a phase to execute. Reads the phase spec, implements only that phase, marks it done (or failed), and writes handoff context for downstream phases.
---

# Phase Executor

This skill is a general-purpose workflow for executing one phase from a structured
planning document (like `LAUNCH_PLAN.md`, `ASTRO_MIGRATION.md`, etc.). It is
**project-agnostic** — it does not assume any specific tech stack, framework, or
codebase. All domain knowledge comes from the planning document the user provides.

## Workflow

### 1. Identify the planning document and phase

The user must specify:
- **Planning document** — path to the markdown file (e.g., `LAUNCH_PLAN.md`)
- **Phase ID** — the phase label to execute (e.g., `Phase 1`, `3a`, `Phase 4`)

If the user only gives a phase name without a document, ask. If the document isn't
at the stated path, search for it with `find_path` or `grep`.

### 2. Read the planning document fully

Read the entire document. Key things to extract:

- **Phase spec:** find the section heading matching the phase ID. Read every line
  until the next phase heading or end of document.
- **What to do:** tasks, files to create/edit/delete, acceptance criteria.
- **Dependencies:** does this phase depend on another phase being complete first?
  If so, verify that phase is marked ✅ before proceeding. If not, warn the user.
- **Downstream phases:** which phases depend on this one? (Used later for handoff
  notes.)
- **Agentic vs human:** is this phase marked 🤖 (agentic) or 👤 (human)? If human,
  remind the user and do not execute — only provide guidance.

### 3. Execute the phase

Do **only** the work described in this phase. Do not drift into tasks from other
phases, even if they seem related. Follow these rules:

- **Read before writing:** read every file before editing it. Use targeted reads
  (line ranges) for large files.
- **Make minimal, focused changes:** each edit should be traceable to a specific
  task in the phase spec.
- **Respect existing patterns:** match code style, naming conventions, and project
  structure of the surrounding codebase.
- **Validate after each change:** run the build, lint, or test commands the project
  uses. If a task specifies a verification step, run it.
- **Stop on first unexpected failure:** if a build breaks or a test fails for a
  reason unrelated to your changes, pause and report to the user.

### 4. Mark completion in the planning document

After all tasks in the phase are done, edit the planning document to mark the phase:

- If the checklist item is `- [ ]` → change to `- [x]`
- If the phase heading has no status marker, append ` ✅` (or ` ❌` if failed)

Use the exact format already present in the document. Don't invent new markup.

### 5. Write handoff context

If there are downstream phases that depend on this one, append a brief handoff
section after the phase (or update the phase's existing section). Include:

- **Files created/modified/deleted** with full project-relative paths.
- **Design decisions** made during implementation that affect later phases.
- **Known caveats** — anything a future executor of a dependent phase should know
  (e.g., "the nav component now expects a `currentPath` prop", "deleted
  `_reference/` means Phase 3 porting instructions in the old doc are stale").
- **Build/output metrics** if relevant (build time, artifact size, number of files).

Format this as a bullet list or a subsection titled `**Handoff for Phase N+1**`
(or whichever phases depend on this one). Stay factual and brief — the planning
document is the source of truth, not a narrative.

### 6. Communicate the outcome

Tell the user:
- What was done (summary, not step-by-step replay)
- Files changed (paths)
- Anything that didn't work or needs human follow-up
- Which phase is now unblocked (if any)

Do **not** ask "want me to do the next phase?" unless the user explicitly said
they want to chain phases. Assume they'll review before continuing.

## Common patterns

### Checklists with sub-tasks

If a phase has sub-tasks like:
```
- [ ] 3a: Add published date
- [ ] 3b: Fix teaser aspect ratio
```
Treat each as an independent task within the phase. Mark them individually.

### Multi-file phases

If a phase touches many files, use `spawn_agent` to parallelize independent file
edits where the write sets don't overlap. Coordinate the results.

### Deletion-only phases

For cleanup phases (remove files, delete directories):
- Verify the file exists before attempting deletion
- Check that no remaining code imports or references the deleted file
- Run the build after all deletions to confirm nothing broke

### Human phases (👤)

If the phase is marked 👤, do NOT execute it. Only provide:
- What the user needs to do (summarize from the plan)
- Links/references to the relevant sections of the plan
- Any preparation the agent can do (e.g., open the file, show the current state)
