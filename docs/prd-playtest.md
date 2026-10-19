# PRD: playtest round (6 AI testers, 3 pairs)

**Product:** Odyssey 3.14, The Voyage (https://odyssey-three-mu.vercel.app/)
**Author:** Adam Wielgos · **Date:** 19 October 2026 · **Status:** shipped

## 1. Why this round

The voyage now uses "explore widely, then go deep" scoring:
- Islands count for 20% of the score, and a reasoned "doesn't fit" is a valid answer.
- 60% rides on the ideas chosen at Aeolus, Lemnos and Olympus.

We needed to know three things before students use it for a graded assignment:
- Can a student reach Ithaca and hand in a clean PDF?
- Can the score be gamed?
- Does the flow still teach the method?

## 2. Method

Six simulated students played the non-demo game headless, in three pairs run one after the other.

| Pair | Tester | Persona and focus | Reached |
|---|---|---|---|
| 1 | SaaS | Rushed student trying to game the scoring (junk, lorem ipsum, copied text) | Ithaca, 12.8/20 in 5.6 min |
| 1 | Professor | Odyssey 3.14 teacher checking pedagogy and method fidelity | Ithaca, 15.4/20 |
| 2 | Bikeshare | Three-person team, focus on the PDF export | Ithaca, 15.4/20 |
| 2 | EpiPen network | Startup that answers "doesn't fit" often | Ithaca, 15.2/20 |
| 3 | Newspaper | Sceptic trying to break state, reloads and navigation | Ithaca, 13.8/20 |
| 3 | Clinic chain | Keyboard-only user on a 13" laptop and a phone (accessibility) | Aeolus |

**Results:** about 120 findings, including 4 blockers. The third pair mostly re-found known issues (4 of newspaper's 5 majors were duplicates), so a fourth pair was not run. Instead, a scripted regression pass of 57 checks covers every fix below.

## 3. Requirements and how each was met

### 3.1 Blockers

| ID | Problem | Requirement | Fix |
|---|---|---|---|
| S1, E3, N5 | An offline estimate of 0 locked the voyage, and estimates offered no way to edit | A provisional score never traps the player | "Edit my answer" next to "Ask Athena again"; editing after an estimate doesn't use up the revision; an estimate can't be 0 for an answer that passed the gates |
| B1 | Page 1 of the PDF overflowed by default (2,012 of 1,500 characters) and Results were cut off | The default document fits the template | Results moved under the value curve; Context written as labelled sentences; the pitch is no longer duplicated; per-section counter; confirmation before printing an overflowing page. Regression: 1,451 of 1,500 characters, no overflow |
| S6, S7, F1, N1 | Typing "m" or "p" in the export (or after a review) opened the map or sailed away, and edits were lost | Shortcuts never fire while typing or inside a dialog | Shortcuts are skipped in editable text, form controls and sliders, with a modifier key, within 2.5 s of typing, and while any dialog is open. They are case-insensitive and listed in the Menu |
| P15, N4 | A reload mid-sail left `furthest` behind and "Sail on" silently did nothing | A reload counts as arrived | `furthest = max(furthest, stopIndex)` on hydrate and on mount; N on an unfinished stop now explains why |

### 3.2 Scoring integrity

| ID | Problem | Fix |
|---|---|---|
| S2, P22 | Estimates rewarded structure; pure junk could reach about 77% | An estimate counts for at most half marks until Athena reviews it. The request is stored with the estimate, and Ithaca lists pending answers with "Send pending answers to Athena". The score chip shows "n pending", and the score is marked provisional |
| S4 | Lorem ipsum, keyboard mash with vowels and copied case text all passed | Lorem vocabulary, keyboard runs, repeated chunks and five-consonant clusters are caught. Copying is caught too: 75% or more of an answer's content words matching the case, definition or questions. Mirrored on the server |
| S11 | The same answer was accepted on several islands | Blocked when 80% of the content words match another island |
| S15, E6 | A lazy "not relevant" no-fit scored 4/6 offline | No-fit estimates need the direction's own vocabulary and a condition ("if", "would", "unless"); lazy ones score 1 |
| S8, F8, P14 | The Troy estimate gave 4/4, contradicting the "below full marks" copy | Every estimate cap is now below the maximum |
| E15 | The cap trimmed the wrong criterion | It trims the last of the top-scoring criteria |
| S10 | "ai" matched "maintain"; any capital letter counted as a name | Whole-word matching; names are only counted mid-sentence |
| S5, P7 | The right answer was the longest in 13 of 14 quizzes, in the same place for everyone | Distractors rewritten to equal or greater length; options shuffled per voyage |
| P6 | The island 14 quiz explanation mislabelled the distractors | Rewritten (a price cut is not direction 1); island 1 and 2 explanations now cover every distractor |
| S3 | A whole class on one campus IP would hit the rate limit | Per-tab limit of 120 calls per 10 minutes; IP limit raised to 800 |
| S14 | "Swift keel" was awarded to a junk run | Now requires at least 70%, no pending reviews and under 30 minutes |

### 3.3 Pedagogy (method fidelity)

| ID | Problem | Fix |
|---|---|---|
| P1 | Lemnos could not create or eliminate attributes | Up to 3 new attributes (Troy = 0) and level 0 = eliminated, i.e. the four Blue Ocean moves. The PDF lists Created, Raised, Reduced and Eliminated |
| P2, B4 | The new value architecture was never designed, and the PDF showed Troy's chain | New value-chain builder at Lemnos, prefilled from the Narrows; blocked if unchanged. The PDF shows the new chain, with Troy's below it |
| P3 | No new revenue model | "How does the new model earn money, and at what price?" at Lemnos, prefilled from island 7. The coach checks price, curve and zone for consistency |
| P4 | Experimentation was thin | Three hypotheses (one per pillar), the riskiest marked, then the test. New rubric criterion; Olympus is worth 6 like an island |
| P5 | Selection was driven by island scores | Scores hidden at Aeolus. The advice is now three criteria: attacks the Troy frustration, necessity of the enabler, hard to copy |
| P12 | No roll-out or cannibalisation question | New god: "Ares, your own troops" |
| P9, P10, P8, P11 | Copy issues | "A few directions that reinforce each other"; VRIO adds "Organised"; island 12/13 overlap explained; Petit h case corrected |
| P13 | The Troy rubric ignored the value curve | The framing anchor now requires customer-side attributes |
| P16 | "+ better" on costs or GHG was misread | "+ improves / − worsens", and "improving costs means going down" |
| P19 | Island 4 offered attributes already at 1 to lower | Only attributes that can still go down are offered |
| P17 | The demo answers had six inconsistencies | Fixed (phone zone, dairy B2B, luxury island 10, tyres islands 3 and 4); new Lemnos and Olympus fields prefilled; every demo draft validated by the gates |
| E11 | Startups were framed as incumbents | Setup asks "existing company or startup". Troy, the Narrows, the coach context and the PDF adapt |

### 3.4 "Doesn't fit" flow

| ID | Problem | Fix |
|---|---|---|
| E1, E10 | No warning that no-fits don't go forward to Aeolus | Note under the toggle with the number of ideas in this sea (a warning on the last island); briefing copy updated |
| E2, E8 | Aeolus could block with no way out | "Turn this into an idea instead" on any graded no-fit (no revision used). When blocked, Aeolus lists that sea's islands as buttons |
| E4, B8 | The PDF listed no-fit islands as changes; the appendix said "NO FIT: the student argues…" | Only the two chosen ideas appear. The appendix says "Does not fit our business. Why, and what would have to change" |
| E7, E9 | Ideas-oriented heading and nudges | "Why direction N does not fit Troy" heading; no-fit nudges offline |

### 3.5 Export (PDF)

- **Edits:** edits persist across Close, Escape and reload (B5, N2). "Rebuild from answers" resets them.
- **Grammar and length:**
  - Context and Innovation are grammatical (B2, B3, E17).
  - The Aeolus sentence lower-cases mid-sentence fragments and drops step labels (F9, N7, P20).
  - The Lemnos pitch starts empty, with a 45-word cap (E16, S12).
- **Authors (B10, B11, B12):**
  - An invented Greek captain is never printed as an author.
  - Crew inputs are labelled.
  - There is no stray " · ".
  - The celebration greets the whole crew.
- **Layout and print:**
  - The "Captain's Log ·" prefix is removed (B7).
  - The appendix is split into two fixed pages, one per sea, so borders and corners print on each (B9).
  - Scores are hidden unless ticked (B8).
  - A print-settings hint is shown (B18).
  - Long Troy inputs wrap (B17).

### 3.6 State and navigation

- **Revisions (N3, N17):**
  - A locked view always shows the reviewed answer, never an abandoned revision.
  - A revision stays open if you leave, with a "Cancel and keep my reviewed answer" option.
  - "Sail on" is hidden while revising, including Narrows "Edit the chart".
- **Title (N13, N14):** the title offers "Continue your voyage" and "Start a new voyage". Mid-voyage, "How to play" ends with "Back to the voyage".
- **Celebration (N15, N16):** only shown after Olympus. It is a proper modal with a dark backdrop, and Escape closes it.
- **Performance (N18, E20):**
  - Only the selected ship is a live 3D view; the others become still images.
  - Storage writes are debounced (400 ms) and flushed when the tab is hidden.

### 3.7 Accessibility and small screens (clinic)

- **Layout (F3, F2):**
  - The panel title scrolls with the task (it used to eat 230 px at 1280×720).
  - Phones get a 62vh sheet, a compact Athena strip, a ribbon scrolled to the current stop, and HUD chips that wrap.
- **Focus (F4, F14, F15):**
  - Focus moves to Athena's review after submit, to the explanation after a right quiz answer, and to the title on arrival.
  - It also moves to new crew rows and list rows, and follows moved rows.
- **Dialogs (F5, F16):**
  - Briefing, intro, setup and celebration trap focus, autofocus the main button and close on Escape, with `aria-modal`.
  - The Menu closes on Escape or an outside click.
- **Visibility and contrast:**
  - A gold focus ring on every control, and a halo on value-curve points (F6).
  - Contrast fixes for selected cards, locked ribbon stops and placeholders (F10, F11).
  - Click targets of at least 24 px (F17).
- **Value curve (F12, F13):** Home, End and PageUp/PageDown keys, `aria-valuetext`, and attribute names that wrap at whole words.
- **Announcements and messages:**
  - One live region on Athena's line (F18).
  - Toasts stay longer and have a close button (F19).
  - The quiz result is announced (F24).
  - Missing-field messages name the question and scroll into view; short fields show a word counter (F7).
- **Other:**
  - Confetti respects reduced motion, and the ribbon pulse stops after 4 cycles (F20).
  - "Skip to the task" link (F21).
  - The score chip is labelled and focusable (F23).

## 4. Deferred, with reasons

| Item | Why deferred |
|---|---|
| B6: rename the export styles | The user chose "Contemporary" and "Scholar" |
| F21: ribbon as one roving-tabindex stop | The skip link covers the main cost; a full roving ribbon is a larger refactor |
| F22: label collisions on the full 3D map | Polish only; needs per-label offsets in the 3D scene |
| P5: re-grade the chosen ideas at Aeolus | Aeolus's own review already judges the pair; a second grading pass would double the AI calls |
| S16: richer offline nudges | Offline mode is a fallback; the live coach handles nudges |

## 5. Verification

- **Regression script:** `scratchpad/pw/regress.mjs` runs headless at 1280×720 and 375×667. All 57 checks pass, covering every blocker and major above.
- **Demo drafts:** all four demo voyages pass the island gates.
- **Builds:** typecheck passes for the app and the serverless function, and the production build succeeds.
- **3D smoke test:** setup and Troy render with no page errors.
