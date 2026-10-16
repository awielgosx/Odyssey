# Council brief: redesign of "Odyssey 3.14: The Voyage"

## What this is
An individual assignment for HEC Paris, Master in Marketing, course "Reinventing your business model with Odyssey 3.14"
(Prof. Laurence Lehmann-Ortega). Option 2 of Assignment 3: "Develop a pedagogical AI agent/webapp designed to help students
learn and apply the Odyssey 3.14 approach. Share the tool, and write a short reflection (200 words) on whether (and how)
this tool could enhance the learning experience for next year's students."
Grading: Functionality and originality (10), Pedagogical value (10), Reflection and critical analysis (5).
Deadline: 4 days from now (Tue 20 Oct 2026). Student: Adam Wielgos. English only. No login. AI must coach, not give answers.
Target play time: ~20 minutes for a full voyage, but all content must be present; educational value is key.
Audience: assume players know NOTHING about Odyssey 3.14 at the start.

## The Odyssey 3.14 method (as taught in this course)
Business model = 3 pillars:
1. Value proposition: what is offered, to whom (user, decision-maker, payer can differ, e.g. JCDecaux), at what price.
   Tools: the value curve (list value attributes from the customer's view, plot reference offer vs new offer; "not everything
   can be better"; a two-sided market needs two curves); perceived value vs price map (high-end differentiation,
   low-end differentiation, cost leadership, game-changing, non-viable zone).
2. Value architecture: how it is built and delivered: value chain (internal / extended / industry value system), partners
   (value network: suppliers, distributors, competitors, NGOs, governments), strategic resources and competencies
   (tangible / intangible / human; valuable, rare, hard to imitate: "what makes you inimitable?").
3. Contributions (new edition, replaces "profit equation"): financial (revenue, costs, capital employed = fixed assets +
   working capital requirement; EBIT; ROCE = EBIT / capital employed), environmental (3 indicators: direct & indirect GHG
   emissions scopes 1-3, release of pollutants, use of scarce resources), societal (3 indicators: employability, quality of
   life, fair value sharing). Antagonisms: financial vs environmental vs societal, local vs global, short vs long term.
   The book's case format rates each indicator +, 0 or -.
Core idea: performance comes from a unique, coherent combination of value proposition and value architecture.

Three prerequisites before exploring directions: anticipate trends, build on customer insights (jobs to be done, start with
a problem/frustration, not a solution), challenge industry beliefs (orthodoxies).

14 directions (course names and numbering):
Value proposition: 1 Reduce customer overall costs; 2 Reduce customer hassles; 3 Find non-customers; 4 Add more
functionality or more emotion; 5 Explore other segments or industries; 6 Introduce other stakeholders; 7 Modify the revenue
stream.
Value architecture: 8 Introduce a technology; 9 Modify one or several steps in the value chain; 10 Eliminate or add one or
more steps to the value chain; 11 Identify new inputs; 12 Associate with competitors or clients or suppliers; 13 Identify
complementors; 14 Leverage strategic resources.
Each direction has 2-4 guiding questions (see src/content/directions.ts) and course examples.

Innovation process (session 11): ideation (generate, capture; structured brainstorming), idea selection (impact on
profitability x ease of implementation: quick win / bold move / jackpot), experimentation (MVP: low tech, low scale, low
risk; test one hypothesis at a time; true proof = users put something at stake; protocol = hypothesis, what to learn, what
to measure, how to measure; fail fast, fail small, learn big), scaling up. Exploitation vs exploration (Netflix vs
Blockbuster), ambidexterity, conflicting business models (Michelin Fleet Solutions vs product sales force).
Innovative leader (session 12): 5 behaviours: question, observe, associate, experiment, network. Reflection in action vs
reflection on action (Schön).
Course cases: Michelin Fleet Solutions (from selling tires to selling km), Fairphone, Hermès Petit h (upcycled rejects),
Perfect Day (cow-free milk protein), Pinduoduo (platform, chicken-and-egg), Netflix vs Blockbuster, JCDecaux, BlaBlaCar,
Zipcar, Hello Fresh, Graze, Embrace, Ryanair, Nickel, ACRE Africa, Desso, Rolls-Royce Power by the Hour, Topcoder, IONITY,
Cirque du Soleil, Grameen, Airbnb, Amazon AWS.
The professor already uses an official "Odyssey 3.14 webapp" that GENERATES ideas, and asked teams to "use it wisely and
report back about your ideas vs the app's ideas". She says "No shadow AI!" and values learning how to learn, teamwork,
critical thinking, reflection. Our positioning: the official app generates ideas, ours makes students produce and defend
their own.
Team assignment 2 format: start from a frustration, describe reference offer + value curve + business model, explore 14
directions, crystallize new value curve + new business model with financials (break-even year, key numbers, sensitivity),
fun name, 8-min pitch + 7-min Q&A.

## Current prototype (repo root /home/claude/odyssey, React + React Three Fiber + drei + rapier + postprocessing, Vite)
- Map: circle of 14 islands around a centre, Ithaca south, Olympus north. Islands = jittered cylinders with a terracotta
  meander cliff band, olive top, landmark per direction (lighthouse, forge, mill...). Clouds over unvisited islands.
- Ship (trireme with apotropaic eye sail) sails on click to ANY island directly, through other islands.
- Docking shows a clay panel listing the guiding questions. No task.
- "Summon Aeolus' storm" opens a separate scene where two d8 dice (1-7 + Contributions wildcard; 8-14 + wildcard) roll in a
  kylix and the result says "fuse both into your idea".
- Buttons: Return to Ithaca, Summon storm, Graphics: cinematic/fast.
- Style: colourised Greek black-figure pottery + low-poly, golden hour. Fonts: Marcellus (display), Alegreya Sans (body).

## Adam's feedback (verbatim points)
- Make it more like a journey from LEFT TO RIGHT, with up and down, less of a circle.
- Include easter eggs (research cool elements; details like those that make GTA V great, that nobody will ever notice).
- There should be sound.
- Islands need to be more irregular, shaped like real Greek islands might be.
- The dice part must be simplified as much as possible.
- Zooming out turns the sea black (black irregular blobs) - rendering bug.
- He LIKES the style (low poly + Greek elements as details).
- Unclear what to do once you get in: needs step-by-step, an intro, a short tutorial, directions.
- Unclear what the numbered tags mean; unclear how the game works.
- Why can I go from home to island 8 immediately? Feels unpolished.
- Aged paper / parchment look for the UI.
- Purpose of the storm and the dice is unclear (assume players know nothing about Odyssey).
- More gamified: at an island it just showed a list with nothing to do. Wants a clear, GRADEABLE task, with coaching on what
  to do.
- "Return to Ithaca" purpose unclear (underlying issue: purpose of things unclear).
- The boat must not sail through islands.
- Keep the cinematic graphics (better looking).
- Better space management (lots of empty space).
- What happens at each island? Odyssey 3.14 knowledge must be applied more clearly.
- Work on reasoning, logic and layout: what happens where, and what connects how.

## Working assumptions already decided
- Hosting: Vercel (free) + one serverless function calling Google Gemini API (free tier key from AI Studio) for coaching
  and grading, with a scripted/heuristic fallback when AI is unavailable. Optional backup as a claude.ai artifact.
- Practice voyages: Fairphone, Hermès Petit h, Perfect Day, Michelin Fleet Solutions (start from the conventional
  business, end with an "Oracle" reveal of what the real company did). Or sail with your own project.
- Ending: export a "Captain's Log" structured like the course's Assignment 1 template (context, innovation, value
  proposition + value curve, value architecture, contributions with +/0/- indicators).
- Book text must not be copied; everything paraphrased.
