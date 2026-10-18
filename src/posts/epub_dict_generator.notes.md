# Notes for the epub-dict-generator post

Working notes, not the post. Draft to be written by Rik.

## Framing

- **The story:** "I had a problem, I tried to solve it by vibecoding something, it took me
  ~4 hours, and it worked — which is kind of incredible."
- Short pulse, **not** the usual long-form. Target roughly **800–1,200 words**. Writing
  budget: 1–2 hours.
- Audience: **general technical**, not lexicography specialists.
- Tone: first person, concrete, honest about the trade-offs; no deep engineering
  post-mortem of every bug.

## Intro (user's own words, roughly)

> I have a problem. I want to learn Danish, but Danish dictionaries suck — at least on a
> Kobo e-reader. So I had this idea: put in an EPUB, pay roughly $3, and out comes a
> dictionary that is way better than the stock one — it has a good entry for every single
> word you click on.

## What the post should cover

### Dictionary concepts (short primer)

Introduce just enough vocabulary for the rest to make sense:

- **lemma** — the dictionary form of a word (*tage*, not *tager/tog/taget*).
- **surface form** — the exact string in the text that the reader taps (*tager*, *tog*).
- **entry** — what the dictionary shows for a headword.
- **senses** — the distinct meanings inside one entry (e.g. *gift* = poison / married).

Why it matters: the e-reader looks up the **surface form**, while a dictionary is organised
by **lemma**. Most of the work is bridging that gap.

### Decisions *I* made (keep these; they are the interesting part)

- **Use the DDO full-form list for lemmatization.** Noticed it made the output better than
  Stanza alone. This was a real turning point.
- **Workflow:** discuss the idea with Perplexity → write a plan as an HTML document →
  "grill" the plan to settle architectural details → then let the model vibe-code.
- **Cheap planner:** DeepSeek V4.1 Flash — good and cheap.
- **Judge model:** Mistral Large 4, on the hunch that it is good at European languages.
  Not evidence-based, but it gave a good enough signal — and that is enough.
- **Bake-off** between three models; **haiku came out on top**, within a budget set as a
  significant fraction of, but much less than, the price of the e-book.

### Things the agent decided autonomously (mention only if they serve the narrative)

The detailed engineering (library quirks, structured-output failures, rate limits,
rendering iterations) was mostly autonomous agent work and is **not** the point of the
post. Do not turn this into a bug catalogue.

## Teaser image

- Phone photo of the e-reader showing a dictionary entry. Simple and powerful.
- **To do by Rik.** Current placeholder: `static/blog/teasers/original/epub_dict_generator.svg`.

## Open items

- Final section order (proposed below).
- Whether to name the book.
- Final word count.

## Proposed section order

1. **The problem** — reading Danish on a Kobo; stock dictionary breaks the flow.
2. **A very short dictionary primer** — lemma vs. surface vs. entry vs. senses.
3. **The idea** — generate the dictionary from the book itself; every word you actually
   tap; Danish definition + English/Dutch glosses; target cost below the e-book price.
4. **How I built it** — Perplexity → plan document → grilling → agents implement. One or
   two decisions that mattered: DDO lemmatization, headword-as-generation-unit /
   surface-as-lookup-key, compact entries.
5. **Picking a model** — three-model bake-off, Mistral Large 4 as judge, haiku wins,
   stays in budget.
6. **The result** — installs on the device, every tapped word has an entry, photo, honest
   caveats, ~4 hours and ~$3.
7. **What I'd tell someone else** — three bullets: plan before generating, spend a little
   on a bake-off, the bottleneck is decisions rather than code.
