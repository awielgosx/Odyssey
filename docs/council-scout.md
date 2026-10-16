# Scout (cyan): easter eggs and procedural sound

## A. Easter eggs

### A1. What makes hidden details feel alive: principles from prior art

1. **Pull, don't push.** Smith & Worch (GDC 2010) separate "push" narrative (told to you) from "pull" narrative (clues you may miss and have to interpret). Interpretation creates investment. **For us:** no tooltip announces an egg; noticing it is the reward, followed by a reply of one line at most.
2. **Tie every detail to the premise.** A generic detail is a wasted one (same talk). Every egg points either to Homer or to the course.
3. **Gate by state, time and viewpoint.** GTA V's Mount Gordo ghost appears only around 23:00 to midnight game time and vanishes if you approach, but stays visible through a sniper scope. RDR2's details respond to the world's state (even horse anatomy reacts to cold). **For us:** gate eggs by real local time, by zoom, by idle time or by repeated clicks.
4. **The system handles small things.** Townscaper's hidden "recipes" add gardens, benches and stairs. Its birds are simple AI that circle a nearby object, and Stålberg made the rules learnable on purpose. **For us:** gulls that perch on landmarks and scatter as the ship passes.
5. **A find needs a response.** Fujibayashi said BotW's hidden rocks weren't "intriguing or challenging enough to be rewarding" until a Korok popped out (the rock itself was a *Skyward Sword* nod). **For us:** every egg answers with a sound, a motion or a line of text.
6. **Allude, don't quote.** AC Odyssey layers Homeric allusions onto its world and hero (Vandewalle 2023), and Sea of Thieves carries lore in found objects. Paraphrase plus visual allusion also satisfies our "no copied text" rule.

**House rules for our eggs.** Eggs are never needed for grading. Each is S or M in cost. They respect `prefers-reduced-motion` (skip the motion, keep the text). They use no logos or brand names; course companies are nodded to through their *stories*. Optional: one closing line in the Captain's Log ("The gods saw you notice 6 things"). Never show a checklist.

### A2. The ideas (★ = the recommended 8)

Cost assumes the current R3F stack. **S** < 1 h (a primitive mesh, `onClick`, a `useFrame` tween). **M** is a few hours (a shader, a render target, or audio-bus work). **L** is a day or more.

| # | What the player sees, hears or clicks | Where | Trigger | Reference | Cost |
|---|---|---|---|---|---|
| 1 ★ | **Argos.** A tiny low-poly hound lies by the Ithaca quay. Hover: his ear twitches. When the ship returns to Ithaca he lifts his head and his tail thumps (soft procedural thud). After the final voyage he walks to the end of the jetty. | Ithaca harbour | Hover; ship arrival | *Od.* 17: the old dog is the only one who recognises Odysseus after 20 years. Keep him alive: we choose a happier ending. | S |
| 2 ★ | **The eye on the bow blinks** about once every 60 to 90 s, and it glances toward whichever island the cursor hovers. | Ship (bow or sail eye) | Timer; hover | Ancient ships carried eyes (*ophthalmoi*) on the bow: the ship as a watchful being, divine protection, or apotropaic protection against envy. Marble eyes were found at Piraeus and with the Tektaş Burnu wreck. | S |
| 3 ★ | **Wax in the ears.** Near the Sirens' rocks, a faint three-voice song rises with proximity. A small beeswax ball appears beside the mute button. Clicking it muffles all audio (master low-pass at 400 Hz) and a rope coils round the mast. | Sirens' rocks, plus the UI | Ship within radius | *Od.* 12: the crew plug their ears with softened beeswax; Odysseus is bound to the mast. | M (audio), S (visual) |
| 4 ★ | **"Nobody."** A dark cave mouth on a craggy islet. Zoom in close: a single eye glows and blinks. Click: "Who's there?" / "Nobody." Click again and a weathered plaque appears: *"If I had asked people what they wanted, they would have said faster horses." Signed: Nobody.* | Rough islet near direction 3 (Find non-customers) | Zoom threshold; click | *Od.* 9 (Polyphemus, *Outis*). Quote Investigator found no evidence Ford ever said the "faster horse" line; the earliest version is from 1999. The pun teaches source criticism, a course value. | S |
| 5 ★ | **The 7 + 7 cattle of the Sun.** A golden meadow with exactly 7 cattle and 7 sheep (instanced). Click a cow: it lows, and one line reads "Seven herds, seven flocks. Leave them be." Eat one (click 3x fast) and the hide crawls a little and the meat lows (a gentle, comic nod). | Thrinacia islet, between the value-proposition and value-architecture halves of the route | Click | *Od.* 12: Helios owns 7 herds of cattle and 7 flocks of sheep, 50 each (350, read by some as days of the year). This mirrors the 7 + 7 directions. Archimedes' *Cattle Problem* (pi's patron saint) is about these same cattle. | S |
| 6 ★ | **Exekias' dolphins.** Every few minutes a pod of exactly **7 dolphins** arcs past the ship. Roughly 1 time in 15, a grapevine sprouts up the mast for 10 s. | Open sea near the ship | Random timer | Exekias' Dionysus cup (Munich, c. 530 BC): Dionysus sails with vines growing from the mast and **seven** dolphins (the transformed pirates) below. The Knossos Queen's Megaron dolphin fresco shows the same Aegean love of dolphins. | S to M |
| 7 ★ | **Tiresias' oar.** On an inland hilltop, far from the shore, a farmer holds a ship's oar. Click: "Fine winnowing fan you've got there, stranger." | Hill on the biggest island; best on direction 5 (Explore other segments) | Click | *Od.* 11: Tiresias tells Odysseus to walk inland until someone mistakes his oar for a winnowing fan. Course link: the same object has a different value to a different customer, which is the logic of the value curve. | S |
| 8 ★ | **3:14.** A bronze sundial on Olympus. At 3:14 (am or pm, local time) its shadow lands on a carved **π**, and every gull on the map circles once. Any other time, clicking it shows the time in Greek numerals. | Olympus | Real clock (`new Date()`) | The course name; GTA-style time gating | S |
| 9 | **Penelope's loom.** A loom in the Ithaca courtyard. In the daytime (local clock) the cloth grows row by row; after 21:00 it slowly *unravels*. | Ithaca palace | Real clock | *Od.* 2/19/24: she wove Laertes' shroud by day and unpicked it by night for three years. A maid betrayed the trick in the fourth year. | S (scale a plane plus a texture offset) |
| 10 | **The olive-tree bed.** In a cut-away corner of the palace, a bed's post is a living olive trunk with roots running into the rock. Click: "Try moving it." | Ithaca palace | Click | *Od.* 23: Odysseus built the bed around a rooted olive; only he and Penelope know. Course link: it can't be moved, so it is a hard-to-imitate resource (direction 14). | S |
| 12 | **The bag of winds.** A tied leather bag on deck. Click it 3 times: it bursts, gusts hiss, and the ship drifts back a few metres. "Your crew was curious too." | Ship deck | Repeated click | *Od.* 10: Aeolus' bag, opened by the crew within sight of Ithaca. It could also replace the dice as the storm's trigger. | S |
| 13 | **Lotus drift.** Idle for more than 2 minutes and lotus petals drift across the screen: "Forgetting your way home?" Doubles as a soft re-engagement nudge. | Global | Idle timer | *Od.* 9: the Lotus-eaters | S |
| 14 | **Charybdis breathes.** A whirlpool shader opens and closes three times each real minute. Scylla's cliff has six tiny cave mouths. | Narrow strait on the route | Time | *Od.* 12: Charybdis swallows three times a day; Scylla has six heads. | M |
| 15 | **The stone ship.** A rock off the Phaeacian harbour shaped exactly like a ship under sail. | Scheria | None | *Od.* 13: Poseidon turns the returning Phaeacian ship to stone. Corfu claims Pontikonisi as that rock. | S |
| 18 | **Calypso's stars.** At real local night the sky shows the Pleiades and the Great Bear, with the Bear on the ship's **left**, as Calypso instructed. | Sky | Local time 20:00–06:00 | *Od.* 5: Odysseus sails 17 days keeping the Bear on his left | M |
| 19 | **The slow camera.** A wooden box with a lens on the technology island. Click: a 100×100 grey snapshot of the scene "develops" for 23 seconds. "Invented here in 1975. Shelved. Film was too profitable." | Direction 8 island (forge) | Click | Kodak's Steve Sasson built the first digital camera in 1975: 0.01 MP, 23 s per image, recorded to cassette | M (render target plus a pixelate shader) |
| 20 | **The late-fee shop.** A shuttered scroll-lending stall with a sign: "Returned late: 40 drachmas." Click: "Legend says a fine like this started a rival. His co-founder calls it a convenient fiction." | Direction 7 island (treasury) | Click | Hastings told the $40 *Apollo 13* late-fee story; Marc Randolph called it a "convenient fiction". This adds a critical-thinking twist. | S |
| 21 | **Sold by the stadion.** Milestones along the sea lane carry stadia counts. A wheelwright's sign reads "We rent distance, not wheels." A roadside taverna has three stars carved over its door. | Along the route; direction 7 or 13 | None | Michelin Fleet Solutions (tyres sold per km). The Michelin Guide (1900) was created to make motorists drive more, and so wear out more tyres: a complementor. | S |
| 22 | **The group-buy stall.** A farmer's fruit stall. As more villager figures gather, the price chalked on the board drops (3 → 2 → 1 obols). | Direction 12 island (circle) | Hover, or plays automatically | Pinduoduo's team purchase and its farmer links (it says it reaches 16 M farmers) | S |
| 23 | **Gulls with Townscaper rules.** Gulls land on the most recently "completed" landmark and scatter when the ship passes within a few units. | Global | Proximity | Townscaper's bird AI | S |

**Why these 8:** they have the highest delight per hour of work. Five are pure Homer, three nod to the course (Nobody/faster horse, 7 + 7 cattle, 3:14). Two of them double as UX (the wax ball is the mute toggle; Argos marks "home"). They also teach a course habit, such as checking sources or seeing value through the customer's eyes. Runners-up: #9 loom, #12 bag of winds (it could even become the simplified storm trigger), #20 late-fee shop.

**Implementation notes (R3F).** Put eggs in one `<Secrets/>` group so they can be culled with the "fast" graphics setting. Use `drei` `<Instances>` for the cattle and dolphins. Gate time eggs by reading `new Date()` once a minute, not every frame. Store "noticed" flags in the zustand store, and in `localStorage` wrapped in try/catch. Coastlines for Ithaca (two lobes joined by the narrow Aetos isthmus) and a Santorini-style broken caldera ring can be hand-traced as 2D polygons and extruded. If you trace them from OpenStreetMap, the data is ODbL and needs attribution in the credits.

---

## B. Procedural sound (Web Audio API only, no files)

### B1. Architecture

```
AudioContext
 └ master Gain ─ "wax" BiquadFilter(lowpass, 20 kHz → 400 Hz) ─ DynamicsCompressor ─ destination
     ├ ambienceBus Gain (0.5)   ocean, wind, gulls, creaks
     ├ musicBus Gain (0.25)     lyre loop, drone
     └ sfxBus Gain (0.7)        UI, dice, thunder, splashes
```

- **Autoplay.** Chrome blocks audio until the user interacts. A context created outside a gesture starts `suspended`, so call `ctx.resume()` from the click handler. Chrome now also auto-resumes once the user has interacted *and* a source's `start()` has been called. Our intro "Set sail" button is the natural gesture: create or resume the context there, then start the ambience. [Chrome Developers blog; MDN best practices]
- **Mute.** Ramp `master.gain` to 0 over 50 ms with `setTargetAtTime`, then `ctx.suspend()` to free CPU. Do the same on `visibilitychange` when the tab is hidden. Persist the choice in `localStorage` (inside try/catch). Show a speaker icon, plus the wax ball easter egg (#3), which only touches the filter.
- **iOS.** Web Audio is silenced by the hardware mute switch. Where supported, set `navigator.audioSession.type = 'playback'` (Safari's AudioSession API; feature-detect it). [MDN AudioSession.type]
- **CPU budget.** Use **one** shared 4 s white-noise `AudioBuffer`, created once and reused by every noise source with a random `offset`. Keep at most about 12 always-on nodes. One-shots build tiny graphs that disconnect `onended`. Use no `ScriptProcessorNode`. Skip `ConvolverNode` or keep it short; a 0.25 s feedback `DelayNode` at gain 0.3 through a lowpass makes a cheap "space". Schedule everything on `ctx.currentTime` with a lookahead scheduler (setInterval 25 ms, schedule 100 ms ahead), per "A Tale of Two Clocks". [web.dev]
- **Parameters.** Use `setValueAtTime`, `linearRampToValueAtTime` and `setTargetAtTime`, never raw `.value`, for anything timed. [MDN best practices]

### B2. Recipes

**Ocean bed (always on).** Noise → `lowpass` (f 500 Hz, Q 0.7) → gain. Slow swell: an `OscillatorNode` (sine, 0.09 Hz) → gain(250) → `filter.frequency`, and a second sine (0.07 Hz, phase-offset) → gain(0.15) → `bedGain.gain` (base 0.3). Two detuned LFOs give a non-repeating rhythm.
*Breakers (one-shot, every 6 to 11 s at random):* noise → `bandpass` (f 1200 Hz, Q 0.8) → gain envelope (0 → 0.25 over 0.8 s, then `setTargetAtTime(0, t+0.8, 1.2)`). Sweep the filter 2500 → 600 Hz over 2 s for the hiss of the draw-back. Tie loudness to camera height: closer means louder. This extends the dev.to noise recipe (looped noise, lowpass 1 kHz, 0.2 Hz LFO × 500 on cutoff).

**Wind.** Noise → `bandpass` (Q 6, f 400 Hz) → gain 0.12. Random walk: every 200 ms, `setTargetAtTime(f = 300 + rand*600, now, 0.4)` and gain to 0.06–0.18. Use a second bandpass at about 2.3× the frequency at gain 0.4 for the whistle. Raise the gain with zoom-out altitude and during the storm. A `StereoPanner` drifting slowly gives width.

**Seagull "kee-ow".** A `triangle` oscillator, frequency 2200 → 1400 Hz over 0.25 s (exponential ramp) with a quick upward blip at the start (1900 → 2300 in 30 ms). Add an FM wobble: sine 35 Hz → gain(60) → `osc.frequency`. Then `bandpass` 1800 Hz (Q 3) → envelope (attack 20 ms, hold, release 150 ms). Play 2 to 4 calls 0.3 s apart, panned to a gull's screen position, every 8 to 25 s near islands only.

**Hull creak.** This is Farnell's stick-slip model simplified. A burst of 15 to 40 clicks (each a 3 ms noise grain, or a 1-sample impulse buffer) at a rate rising 25 → 70 Hz with ±15% jitter, fed into **parallel bandpasses at 250, 395, 560 and 790 Hz (Q about 12)**, summed with 0.2 dry. Trigger on turns and on every 3rd swell peak. Cheaper alternative: a `sawtooth` at 90 Hz with a jittered frequency through one bandpass at 400 Hz (Q 10), with a 0.4 s envelope. [Designing Sound in SuperCollider: creaking door]

**Oar splash (per stroke, synced to the ship's oar animation).** (a) Noise → highpass 900 Hz → bandpass 2500 Hz (Q 1) with an envelope of 5 ms attack and 250 ms decay at gain 0.15. (b) A "plop": sine 180 → 60 Hz over 80 ms at gain 0.2. Randomise each by ±10% so 30 oars never sound identical.

**Lyre or kithara pluck (Karplus-Strong).** KS is a noise burst fed through a delay line whose length sets the pitch (`f = sampleRate / N`), with a lowpass loop filter (an average of two samples) that makes the decay darker. Lowpassing the initial burst gives a softer, quieter pluck. [Smith, *Physical Audio Signal Processing*]
**Gotcha:** a `DelayNode` inside a feedback cycle is clamped to at least **128 samples** (one render quantum). At 48 kHz that caps the pitch at about 375 Hz, so a pure-node KS can't play the upper strings. [WPT `delay-time-clamping`] **Recommended:** precompute in plain JS at start-up. Fill an `AudioBuffer` (1.8 s) per note with the KS loop:
`buf[i] = (i<N ? noise_lp : 0.996 * 0.5*(buf[i-N] + buf[i-N-1]))`.
Eight to fifteen notes take about 1 MB in total and render once in a few ms. Then each pluck is a `BufferSource` with `playbackRate` and gain, which costs almost nothing. Add a body resonance: one peaking filter at 220 Hz (+4 dB) on the music bus. (An AudioWorklet is the alternative if live pitch-bending is ever needed.)

**Generative music loop (Greek-flavoured).** Use the **Dorian harmonia**: two disjunct diatonic tetrachords, read descending E–D–C–B | A–G–F–E (each tetrachord is tone, tone, semitone, Pythagorean 9/8, 9/8, 256/243). With *mese* A = 220 Hz:
E4 330.0 · D4 293.3 · C4 260.7 · B3 247.5 · **A3 220.0** · G3 195.6 · F3 173.8 · E3 165.0. [Wikipedia: Tetrachord]
(In modern terms this sounds like E Phrygian.)
- **Drone:** two sines at A2 110 Hz and E3 165 Hz, detuned by 0.5 Hz, at gain 0.04, through lowpass 600 Hz. That gives an aulos-like bed.
- **Melody:** a random walk over the scale indices (step ±1 at 70%, ±2 at 20%, a leap to A at 10%). Use durations from {0.5, 0.75, 1, 1.5} s at about 60 BPM, rest after a 5 to 9 note phrase, and end phrases on A or E. Use the precomputed KS buffers, at velocity 0.3 to 0.6.
- **Moods:** on calm sea use the diatonic genus. Near the Sirens or in the storm, swap the upper tetrachord to the **chromatic** genus (≈90 + 114 + 294 cents), or the eerie **enharmonic** genus (≈63 + 49 + 386 cents, Archytas). It is the same scale engine with different ratios, a cheap and authentic way to shift the mood.

**Sirens' song.** Use 2 to 3 voices, each a `sawtooth` at the melody pitch (one octave up, enharmonic tetrachord) with a 5.5 Hz vibrato (sine → gain(4 Hz) → frequency). Each voice goes through two parallel bandpass "formants" for an "ah" vowel (≈800 Hz and ≈1150 Hz, Q 8), crossfading slowly to "oo" (≈300 Hz and ≈870 Hz). Notes glide (`setTargetAtTime`, 0.15 s). Gain = `smoothstep` of distance to the rocks × 0.15. The wax ball (#3) drops the master low-pass to 400 Hz, which leaves only a muffled hum.

**Storm thunder.** The crack is noise → highpass 2 kHz, with an envelope of 5 ms attack and 60 ms decay at gain 0.5. The rumble is noise → lowpass 180 Hz (Q 0.5), with an envelope of 0.1 s attack then `setTargetAtTime(0, t, 1.5)`. Its "rolling" comes from 3 to 5 delayed rumble re-triggers (0.3 to 1.5 s apart, each 60% as loud), plus a sine LFO at 3 to 7 Hz on the rumble gain (depth 0.3). Delay the crack after the lightning flash by distance / 343 × a scale factor.

**Dice clack (d8 on wood or clay).** Each impact is a 4 ms noise grain → `bandpass` 3200 Hz (Q 15) plus a sine ping at 2800 Hz decaying in 40 ms. A roll is 5 to 7 impacts with gaps shrinking geometrically (0.18 s × 0.62ⁿ), gain × 0.75 each time, and random ±8% pitch so each clack differs. On a clay kylix, lower the filter to 1800 Hz and add a 0.12 s ring.

**UI set (all built from the KS buffers, so the UI shares the music's timbre):**
- *Click / hover:* a short pluck on E4 at velocity 0.15. Alternative: a triangle at 1200 Hz, 25 ms.
- *Task submitted:* two plucks, A3 → E4.
- *Success fanfare:* a rising arpeggio E3–A3–C4–E4, 90 ms apart, then the A drone swells 0.3 s.
- *Laurel earned:* the fanfare plus a shimmer (noise → highpass 7 kHz at gain 0.03, 1.2 s decay) and a high octave E5 pluck.
- *Failure / "try again":* B3 → A3 (the semitone of the tetrachord), damped (feedback 0.985, so it dies fast) and quiet. Gentle, never a buzzer, because the AI coaches rather than punishes.

### B3. Build-versus-buy check

**Tone.js** offers a `PluckSynth` (KS) and a transport, but it adds about 150 kB of minified JS for features we can write in about 300 lines. **ZzFX** (under 1 kB) is excellent for retro SFX but sounds chiptune, not Aegean. **Recommendation:** hand-write a small `audio/engine.ts` with the recipes above: no dependency, no licensing, and full control. Revisit Tone.js only if the music grows beyond one loop.

---

## Sources

- Smith & Worch, environmental storytelling: [Nieman Storyboard](https://niemanstoryboard.org/2011/01/14/harvey-smith-on-environmental-storytelling-and-embedding-narrative/) · [GDC Vault, "What Happened Here?"](https://gdcvault.com/play/1012647/What-Happened-Here-Environmental)
- Townscaper: [Game Developer, "How Townscaper works"](https://www.gamedeveloper.com/game-platforms/how-townscaper-works-a-story-four-games-in-the-making)
- BotW Koroks: [DualShockers](https://www.dualshockers.com/breath-of-the-wild-korok-seeds/)
- GTA V Mount Gordo ghost: [Game Informer](https://www.gameinformer.com/b/features/archive/2013/09/25/how-to-find-the-ghost-in-grand-theft-auto-v.aspx)
- RDR2 systemic details: [Aftermath](https://aftermath.site/you-are-error-horses-red-dead-redemption-2-horse-testicles)
- Sea of Thieves bottles: [Sea of Thieves wiki](https://seaofthieves.wiki.gg/wiki/Bottle_Quest)
- AC Odyssey and Homer: [Vandewalle 2023](https://ojs.bibl.u-szeged.hu/index.php/suc/article/view/45695)
- Ship eyes: [Peter Sommer Travels, Bodrum ship eyes](https://www.petersommer.com/blog/another-thing/ships-eyes-bodrum)
- Exekias' Dionysus cup: [Wikipedia](https://en.wikipedia.org/wiki/Dionysus_Cup) · Knossos dolphins: [ancient-greece.org](https://ancient-greece.org/?p=10458)
- Cattle of Helios (7 + 7 × 50): [Greek Myths & Greek Mythology](https://www.greekmyths-greekmythology.com/odysseus-cattle-of-helios/) · [Archimedes' Cattle Problem, NYU](https://math.nyu.edu/Archimedes/Cattle/Statement.html)
- Penelope's web: [Sententiae Antiquae](https://sententiaeantiquae.com/2016/10/11/the-design-of-penelopes-web/) · Winnowing oar: [Wikipedia](https://en.wikipedia.org/wiki/Winnowing_Oar) · Pontikonisi: [Greek Reporter](https://greekreporter.com/2023/06/05/mouse-island-corfu-greece/) · Argos: [Shmoop, Book 17](https://www.shmoop.com/study-guides/literature/odyssey/summary/book-17) · Calypso's stars: [Perseids, Od. 5](https://cts.perseids.org/read/greekLit/tlg0012/tlg002/perseus-eng3/5.145-5.451)
- "Faster horses": [Quote Investigator](https://quoteinvestigator.com/2011/07/28/ford-faster-horse/) · Netflix late fee: [CNBC](https://www.cnbc.com/2017/05/23/netflix-ceo-reed-hastings-on-how-the-company-was-born.html) · Kodak 1975 camera: [PetaPixel](https://petapixel.com/2010/08/05/the-worlds-first-digital-camera-by-kodak-and-steve-sasson/) · Michelin Guide: [Wikipedia](https://en.wikipedia.org/wiki/Michelin_Guide) · Pinduoduo: [Productmint](https://productmint.com/pinduoduo-business-model-how-does-pinduoduo-make-money/)
- Autoplay: [Chrome Developers, "Web Audio, Autoplay Policy and Games"](https://developer.chrome.com/blog/web-audio-autoplay?hl=en) · [Web Audio best practices (MDN mirror)](https://docs.w3cub.com/dom/web_audio_api/best_practices) · [MDN AudioSession.type](https://developer.mozilla.org/docs/Web/API/AudioSession/type)
- Scheduling: [web.dev, "A tale of two clocks"](https://web.dev/articles/audio-scheduling)
- Karplus-Strong: [J.O. Smith, PASP](https://www.dsprelated.com/freebooks/pasp/Karplus_Strong_Algorithm.html) · DelayNode cycle clamp: [WPT delay-time-clamping](https://searchfox.org/firefox-main/source/testing/web-platform/tests/webaudio/the-audio-api/processing-model/delay-time-clamping.html)
- Noise textures: [dev.to procedural audio textures](https://dev.to/hexshift/how-to-generate-procedural-audio-textures-in-the-browser-no-samples-needed-332l) · Creak model (Farnell): [Wikibooks, Designing Sound in SuperCollider](https://en.wikibooks.org/wiki/Designing_Sound_in_SuperCollider/Creaking_door)
- Greek tetrachords and genera: [Wikipedia, Tetrachord](https://en.wikipedia.org/wiki/Tetrachord)
