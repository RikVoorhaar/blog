# Notes for the epub-dict-generator post

Working notes, not the post. Draft to be written by Rik.

## Framing

- **The story:** "I had a problem, I tried to solve it by vibecoding something, it took me
  ~4 hours, and it worked — which is kind of incredible."
- Short pulse, **not** the usual long-form. Target **~900 words** (hard cap ~1,200).
- Audience: **general technical**, not lexicography specialists.
- First person, concrete, honest. Not a bug catalogue.

## Settled decisions

- **No book title.** Call it "a Danish book".
- **Primer comes *after* the idea** (hook first, then the vocabulary).
- **No separate "working with agents" section** — fold it into "How I built it".
- **Include the ~$3**, with the caveat: that is the **marginal cost to produce a dictionary
  for another book**, not the total cost of the project. There were **two full runs**
  (v1, then a v2 rebuild) plus a **judge model** for the bake-off.
- **Teaser:** phone photo of the e-reader showing an entry. To do by Rik.
  Placeholder: `static/blog/teasers/original/epub_dict_generator.svg`.

## Actual numbers (for the draft)

- Marginal cost per book (v2): generation **~$2.20** + collision compose **~$0.30** ≈ **$2.50**
  → say "about $3".
- Total spent over the project ≈ **$5.70**: v1 full run $2.71, bake-off $0.29, focused
  judge $0.16, v2 $2.50, plus smoke tests.
- Elapsed effort: **~4 hours** of human time (agents doing the typing).
- Output: ~7,500 headwords → **~9,900 surface entries** installed on the device.

## Section order and what each must say

### 1. The problem (~100 words)

- Learning Danish; reading a Danish book on a Kobo.
- The stock dictionary is bad: misses words, poor on compounds and inflected forms, and
  interrupts reading every time it fails.
- Tapping a word and getting nothing is the worst part of reading in a foreign language.

### 2. The idea (~150 words)

- What if the dictionary were generated **from the book itself**?
- Then every word you actually tap has an entry: a short Danish definition plus English
  and Dutch glosses.
- Economics: the whole thing should cost less than the book.
- Input: one EPUB. Output: a `dicthtml` file you copy onto the device.

### 3. A very short dictionary primer (~150 words)

- **lemma** — the dictionary form (*tage*, not *tager/tog/taget*).
- **surface form** — the exact string on the page that the reader taps (*tager*, *tog*).
- **entry** — what the dictionary shows for a headword.
- **senses** — the distinct meanings inside an entry (*gift* = poison / married).
- Why it matters: the e-reader looks up the **surface**, while dictionaries are organised
  by **lemma**. One surface can even point at several headwords. Bridging that gap is most
  of the work.

### 4. How I built it (~220 words)

- Workflow: talked it through with Perplexity → wrote the plan as an **HTML document** →
  **grilled** the plan to settle the architecture → let the agents implement ("vibe-code").
- Planner model: **DeepSeek V4.1 Flash** — good and cheap.
- The decisions that actually mattered:
  - **DDO full-form list for lemmatization.** Noticed it made the output better than
    Stanza alone; a real turning point.
  - **Generation unit = headword, lookup key = surface.** Entries are generated once per
    headword, then assembled per surface for the device.
  - **Compact entries.** Tried morphology/cognates first; removed them because they were
    noisy and ate the popup.
- Honest note: many implementation details were autonomous agent choices, but the
  architecture was settled up front — that is what made the four hours possible.

### 5. Picking a model (~150 words)

- Three candidate models, compared on real words from the book.
- Judge: **Mistral Large 4**, picked on the hunch that it is good at European languages.
  Not evidence-based — but it gave a good enough signal, and that is enough.
- **Haiku won**, and came in within budget.
- Cost framing: ~$2.50–3 per book; ~$6 total for the whole project (two runs + judging).

### 6. The result (~120 words)

- Photo of the device showing an entry.
- Every word tapped so far has an entry; clearly better than the stock dictionary.
- ~4 hours, ~$3 marginal.
- Honest caveats: some entries are imperfect; proper names are missing; the odd sense is
  off.

### 7. What I'd tell someone else (~100 words)

- Plan before you generate; the plan is the cheap part.
- Use a cheap model for planning.
- Spend a little on a bake-off — judging is cheap compared with the build.
- The bottleneck is decisions, not code.

## Not in the post

Bug-level war stories (library quirks, structured-output failures, rate limits, rendering
iterations) — they were mostly autonomous agent work and would pull the piece away from the
"how this kind of project works" narrative.
