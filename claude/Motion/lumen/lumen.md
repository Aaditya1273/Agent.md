---
targetModels:
  - "Claude Opus 5.5"
  - "Claude Fable 5.1"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
name: lumen
category: Motion
description: LUMEN, the launch-film system — keynote-grade product films built in code (Remotion, TTS, synthesised score, ffmpeg) with type cut to the spoken word, real footage and a credibility checklist.
license: MIT
author: Agent.md maintainers
last-verified: 2026-10-05
reviewed-by: unreviewed
---

# LUMEN — the Launch-Film System

> **Bright, keynote-grade product films, built in code.**
> One spec for story, visuals, motion, sound and pipeline. Hand this file to a person or an AI agent along with
> a product, and they can produce a 3–4 minute film of the same calibre as the COMMIT demo: white stages,
> type that lands on the spoken word, devices that open and get pushed into, a score that cuts on the beat,
> and every claim backed by real footage.

| | |
|---|---|
| **Output** | 1920×1080, 60 fps, H.264 CRF 16, AAC 192 k, −14 LUFS integrated, 3–4 min |
| **Stack** | Remotion 4 + React 19 · Kokoro-82M TTS · numpy/scipy synthesis · ffmpeg · Playwright · `script(1)` |
| **Cost** | Free and open source. No stock music, no stock footage, no paid APIs, no licences |
| **Reference build** | `commit-video/` (COMMIT, WeAreDevelopers × BAND Dark Factory). Every number in this file is taken from that build |
| **Time** | About a day for the first film, and half a day for each one after it |

---

## Contents

1. [The ten laws](#1-the-ten-laws)
2. [Story architecture](#2-story-architecture)
3. [Writing the voice-over](#3-writing-the-voice-over)
4. [Visual system](#4-visual-system)
5. [Motion system](#5-motion-system)
6. [The shot catalogue](#6-the-shot-catalogue)
7. [Devices and system UI](#7-devices-and-system-ui)
8. [Camera and cursor](#8-camera-and-cursor)
9. [Sound: voice, score, effects, mix](#9-sound)
10. [Pipeline and project layout](#10-pipeline-and-project-layout)
11. [Capturing real footage](#11-capturing-real-footage)
12. [Reference code](#12-reference-code)
13. [Quality loop](#13-quality-loop)
14. [Credibility rules](#14-credibility-rules)
15. [Adapting LUMEN to a new product](#15-adapting-lumen-to-a-new-product)
16. [Checklists](#16-checklists)
17. [Brief for an AI agent](#17-brief-for-an-ai-agent)

---

## 1. The ten laws

These are the reasons a LUMEN film holds attention. Every decision later in this file serves one of them.

1. **Bright by default, dark by exception.** The stage is white `#FFFFFF` or light grey `#F5F5F7` with near-black type. Darkness appears **once**, as a pattern interrupt (the "It tests itself" moment on black).
2. **One idea per screen.** A statement is two to four words at 150–220 px. If it needs a sentence, the voice says it and the screen shows the *payoff word*.
3. **Type lands on the spoken word.** Use word-level timestamps from the TTS, never "roughly when the line starts". This is the biggest single upgrade over a slideshow.
4. **Something changes every 1.5–3 seconds.** A reveal, a cut, a camera move or a counter ticking. A frame that is fully still for 3 s reads as a broken video.
5. **Never repeat a layout back to back.** Rotate through full-bleed type → device → card row → data viz → browser → type.
6. **Show, then prove.** Each claim gets a visceral illustration (an iPhone flooding with 27 payment notifications) followed by the receipt (`responses: {"201":27}`).
7. **The product lives on hardware.** A MacBook lid opens, the camera pushes into the screen, and the real terminal is readable. Real things on real devices outclass abstract diagrams.
8. **Physics, not keyframes.** Use critically damped springs for objects and expo-out curves for type. No cartoon bounce, and no linear motion anywhere except the clock.
9. **Cut on the beat.** Scene changes land on bar lines of a 120 BPM score that follows the story, and the music ducks under the voice.
10. **Everything is real or labelled.** Real recordings, real numbers, real screenshots. Compressed time is badged, and illustrations are labelled as illustrations. Credibility is part of the design.

---

## 2. Story architecture

Nine acts, 3:30–4:00 total. The durations come from the voice-over, not the other way round.

| # | Act | Job | Length | Emotional beat | Shots that work |
|---|---|---|---|---|---|
| 0 | **Hook** | State the comfortable lie, then ask the question | 8–12 s | "…wait." | Kinetic statement, notification stack, question with gradient payoff and edge glow |
| 1 | **Problem** | Make the pain concrete and *measured* | 25–35 s | Unease → shock | Card row, merging cards, device + push-in on the faulty line, ring counter, iPhone flood + big red number |
| 2 | **Reveal** | Name the product as the answer | 20–30 s | Relief | Brand reveal (icon + wordmark + glow), card row of components, focus cards, Dynamic Island verdicts |
| 3 | **How it works** | Show the mechanism working on real input | 20–30 s | Confidence | Checklist ticker, device + terminal replay + push-in, stat bento |
| 4 | **Differentiator** | The one thing nobody else does | 25–35 s | Respect | Black pattern interrupt (rings), terminal push, bar chart + hero number, browser evidence tour with cursor |
| 5 | **Conflict → resolution** | Failure caught, fixed, re-verified | 30–40 s | Tension → release | Terminal reject + red island, editor diff, re-run, inconclusive (orange), **Accepted** (green island, chime, glow) |
| 6 | **The real thing** | Unedited footage of it running | 15–25 s | Trust | Device with screen recording, island status beats |
| 7 | **Impact** | Why the world should care | 20–25 s | Ambition | Scrolling wall + headline, word-per-beat triad, proof bento, generality flow |
| 8 | **End card** | Brand + line + URL | 8–10 s | Memory | Icon, wordmark, two-line tagline, URL chip, fade to white |

**Rules for the arc**
- The hook ends on a **question**, and the end card answers it with the tagline.
- The problem act needs **one concrete, numeric disaster** (in COMMIT: "one payment, charged 27 times").
- The resolution must contain **both colours of verdict**: red, then orange or green. The release only lands if the viewer saw the rejection first.
- The differentiator act gets the **only black scene**. Contrast marks it as the important one.
- Keep a vocabulary of **three to four recurring objects** (the app icon, the three seat cards, the MacBook, the Dynamic Island) and bring them back. Repetition reads as design.

---

## 3. Writing the voice-over

- **Pace:** 150–165 words/min (Kokoro `af_heart` at speed 1.04). 32 lines produced 159 s of speech in the reference build.
- **Line length:** 6–22 words. One thought per line, so each line can own a shot.
- **Numbers are said in full words** ("one hundred and forty-seven") so the TTS reads them naturally. The screen shows the digits.
- **Concrete nouns beat adjectives.** Write "an audit log, written at the wrong moment", not "a subtle concurrency issue".
- **Every claim must be on screen as evidence within about 5 s.**
- **Write the screen words into the line.** If the screen will say "Measured. Reproducible. Auditable.", the voice must say those words, because the type is cut to them.
- **The payoff word ends the line** ("…earns one word: accept."), so the visual can hit on it.

`script.json` format:

```json
{
  "voice": "af_heart",
  "speed": 1.04,
  "scenes": [
    { "id": "hook", "title": "Cold open", "lines": [
      "Every AI agent will tell you its code works.",
      "The tests are green. The report says: done.",
      "So who checks the checker?"
    ]}
  ]
}
```

---

## 4. Visual system

### 4.1 Colour tokens

| Token | Value | Use |
|---|---|---|
| `white` | `#FFFFFF` | Primary stage, cards |
| `gray` | `#F5F5F7` | Alternate stage, bento backgrounds |
| `ink` | `#1D1D1F` | All headline type |
| `ink2` | `#6E6E73` | Secondary type, sub-lines |
| `ink3` | `#86868B` | Tertiary, de-emphasised half of a statement |
| `line` | `rgba(0,0,0,.08)` | Dividers |
| `blue` | `#0071E3` | Links, neutral accent, click ripples |
| `green` | `#34C759` | Pass, accept, success |
| `red` | `#FF3B30` | Fail, reject, the bug |
| `orange` | `#FF9500` | Inconclusive, warnings, **eyebrows** |
| `indigo` | `#5856D6` | Secondary actor (e.g. the Builder) |
| `purple` | `#AF52DE` | Tertiary actor |

**Gradients**, used on payoff words only and never on whole sentences:

| Name | Value | Meaning |
|---|---|---|
| **AI** | `linear-gradient(90deg, #0894FF, #C959DD 34%, #FF2E54 68%, #FF9004)` | The intelligent, magical, "this is the answer" moments |
| **Green** | `linear-gradient(90deg, #00C46A, #34C759 45%, #30B0C7)` | Success numbers (147, 95.4 %, Done.) |
| **Red** | `linear-gradient(90deg, #FF2E54, #FF3B30 50%, #FF9004)` | Disaster numbers (27×) |
| **Blue** | `linear-gradient(90deg, #0894FF, #0071E3 50%, #5856D6)` | Neutral metrics |

**Dark terminal palette** (inside devices only): background `#1C1C1E`, text `rgba(235,235,245,.78)`, prompt `#64D2FF`, pass `#30D158`, fail `#FF453A`, warn `#FFD60A`.

### 4.2 Typography

Inter stands in for SF Pro, and JetBrains Mono is used for code. Load both through `@remotion/google-fonts`.

| Role | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| Hero statement | 150–220 px | 700 | −0.045 em | 1.02 |
| Wordmark | 170–190 px | 700 | −0.055 em | 1.0 |
| Section headline | 96–110 px | 700 | −0.045 em | 1.02 |
| Card title | 44–60 px | 700 | −0.045 em | 1.05 |
| Sub-line | 44–52 px | 600 | −0.02 em | 1.2 |
| Eyebrow | 26 px | 600 | −0.2 px | 1.2, colour `orange` (or the act colour) |
| Body / card sub | 24–32 px | 500 | −0.2 px | 1.35 |
| Caption | 25 px | 500 | −0.2 px | 1.36 |
| Code in a device | 22–25 px | 400/700 | 0 | 1.55–1.75 |

**Two-tone statement:** put the first half in `ink` and the second half in `ink3`, as in "One agent. *End to end.*" It's the cheapest way to add hierarchy without adding size.

### 4.3 Surfaces

| Surface | Spec |
|---|---|
| **Card** | `#FFF`, radius 32–40, shadow `0 2px 6px rgba(0,0,0,.04), 0 24px 60px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)`. A focused card swaps the hairline for a 3 px ring in the actor colour |
| **Liquid Glass (light)** | `rgba(255,255,255,.62)`, `backdrop-filter: blur(30px) saturate(180%)`, inner rims `inset 0 1px 0 rgba(255,255,255,.95)`, `inset 0 0 0 1px rgba(255,255,255,.6)`, outer `0 0 0 1px rgba(0,0,0,.05), 0 20px 50px rgba(0,0,0,.12)` |
| **Chip** | Pill, padding `0.45em 0.9em`, background `color-mix(in srgb, <c> 11%, white)`, text `<c>`, weight 600. `solid` variant: background `<c>`, white text |
| **Glyph tile** | Squircle (radius = 22.37 % of size), gradient `color-mix(<c> 70%, white) → <c>` at 160°, white 2 px line icon at 56 % size, coloured shadow `0 10px 28px <c>/35%` |
| **App icon** | Squircle 22.37 %, gradient `#5AC8FA → #0A84FF → #5E5CE6 → #BF5AF2` (150°), top sheen `rgba(255,255,255,.32) → 0` over 55 %, a ring and a check that draw themselves |

### 4.4 Layout grid (1920×1080)

| Zone | Pixels | Holds |
|---|---|---|
| Dynamic Island | y 34–126, centred | System status only |
| Top band | y 60–140 | Eyebrows, the brand lockup at top-left (96, 70) |
| Stage | y 140–940, x 120–1800 | The shot |
| Caption | bottom 34 px, max width 1320 | Burned-in captions |
| Device placement | MacBook display top at y 136, scale 0.74 | Never collides with the island or captions |

Side margins are 120 px for content and 96 px for chrome.

### 4.5 Backgrounds

- `Stage` = solid tone + a soft top light (`radial-gradient(1200×700 at 50% −10%, #fff → transparent)`) + a faint floor shadow (`radial-gradient(900×600 at 50% 120%, rgba(0,0,0,.035))`).
- **Edge glow** (the Siri-style border) is used on AI moments only: hook question, brand reveal, acceptance, end card. Build it as a conic gradient rotating 1.2°/frame, masked to a 16 px ring, with a 26 px blur, plus a 5 px ring at 3 px blur on top.
- **Brand halo:** a 520 px conic-gradient disc behind the icon, blurred 90 px at 28–32 % opacity, rotating 0.8°/frame.

---

## 5. Motion system

### 5.1 Curves

| Name | Definition | Use |
|---|---|---|
| `expo` | `cubic-bezier(.16, 1, .3, 1)` | Everything that *arrives*: type, chips, sweeps |
| `io` | `cubic-bezier(.65, 0, .35, 1)` | Everything that *travels* or *leaves*: camera, cursor, exits, morphs |
| `spring` (default) | damping 30, stiffness 170, mass 1 | Objects settling: cards, notifications |

### 5.2 Springs

| Object | Damping | Stiffness | Feel |
|---|---|---|---|
| Card / chip rise | 30 | 170 | Crisp, no overshoot |
| Notification drop | 22 | 180 | Lively, slight settle |
| Burst items (dots, 27 notifications) | 18–24 | 200–260 | Fast and percussive |
| Device / browser entrance | 26 | 90 | Heavy, premium |
| Dynamic Island morph | 20–22 | 150–160 | Elastic, iOS-like |
| App icon | 16 | 120 | The only "bouncy" object (it's the hero) |
| Bars in charts | 22 | 110 | Weighty |

### 5.3 The motion vocabulary

| Primitive | What it does | Numbers |
|---|---|---|
| **Hero** | Scale 1.12 → 1, blur 18 → 0, opacity 0 → 1 | 0.7 s `expo`; exit 0.3 s `io` (scale −4 %, blur 14) |
| **MaskUp** | Text rises 105 % from behind an invisible clip edge | 0.8 s `expo` |
| **Rise** | Spring up 36 px + scale .98 → 1 | Default spring; exit 0.35 s blur 10 |
| **Layer exit** | Whole shot: opacity → 0, blur → 12, scale → 1.03 | 0.4 s `io` |
| **Count** | Number interpolates to target | 1.1–1.5 s `io`, tabular numerals |
| **Ring** | Stroke-dash fill, round caps, gradient | 1.8–2.4 s `io` |
| **Check / Cross** | Path draws via `pathLength=1` dash | 0.4 s / 0.3 s + 0.12 s stagger |
| **Stagger** | Lists | 0.07–0.13 s per item (checklists), 0.16–0.45 s (cards, docs) |
| **Drift** | Whole stage scales 1 → 1.03 over the scene | Linear; it never stops |
| **Scene transition** | Out: scale 1 → 1.06, blur 0 → 16, fade. In: scale .95 → 1, blur 16 → 0 | 0.5 s `io`, midpoint on the downbeat |

**Timing grammar**
- An element appears **on** its word (`wf(line, "word")`), never before.
- A follow-up element appears **0.2–0.6 s after** the word that names it.
- A shot exits **at** the next line's start (`Layer to={next.from}`), so exits overlap entries and nothing ever cuts to empty.
- Holds: give a reveal 0.6–1.3 s after its line ends, and a terminal replay as long as the replay needs. Hold values are configured per line in `timing.json` (seconds).

---

## 6. The shot catalogue

Twenty shots, each reusable for any product. The parameters are the ones used in the reference build.

| # | Shot | Recipe | Use for |
|---|---|---|---|
| 1 | **Kinetic statement** | 2–4 words, 190 px, Hero in/out per phrase, phrase groups cut on word timestamps, payoff word in a gradient | Cold open, slogans |
| 2 | **Notification stack** | iOS banners, 1.45× scale, 150 px pitch, each drops on its word with `notify` sfx, then a 160 px gradient verdict below | "Everything looks fine" |
| 3 | **Question + glow** | Two lines, 200 px, second line's last word in the AI gradient, edge glow fades in on it | End of hook |
| 4 | **Card row** | 4 × 340 px cards (glyph tile + word) rising on their words, then a gradient progress rule sweeping under them | Process, steps |
| 5 | **Merge** | Two 460×400 cards slide together (0.8 s `io`) and cross-fade into one card with a red ring | "These are the same thing" |
| 6 | **Device + push-in** | MacBook lid opens (1.1 s), editor or terminal inside, camera pushes to 1.6–1.9× onto one line, glass callout, cursor click | The exact faulty line, the exact passing line |
| 7 | **Ring counter** | N dots on a 330 px circle, staggered spring, 220 px gradient count in the centre, chip below | "All N passed" |
| 8 | **Phone flood** | iPhone lock screen, notifications every 5 frames (last 7 visible), counter `N×` 300 px red gradient, receipt + illustration label | Visceral failure |
| 9 | **Brand reveal** | Halo disc, app icon (spring 16/120), wordmark MaskUp +0.25 s, sub-line on its word, chip, edge glow, chime | The product name |
| 10 | **Brand to corner** | Hero lockup fades and blurs out as it lifts; a 52 px icon + 38 px wordmark lockup rises at top-left | Moving from reveal into explanation |
| 11 | **Focus cards** | Cards share 1580 px by weights `1 + 1.5·focus`; the focused card grows, rings, and shows its detail; the others dim to 50 % | Explaining parts one at a time |
| 12 | **Loop arrows** | Quadratic SVG arcs drawn in sequence (0.6 s each, 0.25 s apart), the return arc in red with a chip | Feedback loops |
| 13 | **Checklist ticker** | White card, 11 rows, each circle fills green with a drawn check every 0.13 s, `tick` sfx | Pipelines, gates |
| 14 | **Terminal replay** | Real `script -T` recording in a dark window inside the MacBook; commands typed at 46 cps; idle gaps compressed with a "Time-lapse · m:ss" badge; marked lines glow | Proof that it really ran |
| 15 | **Stat bento** | 3 × 540×600 cards, 128 px gradient count-ups on their spoken words, a micro-visual per card (grid, chart line, converging dots) | Numbers that matter |
| 16 | **Black interrupt** | Pure black, three activity rings (inner → outer reflect the story's numbers), 52 px white statement in the centre | The single most important idea |
| 17 | **Bar chart + hero number** | Rounded bars on a spring; the final bars in a teal→green gradient; a 176 px number interpolating old → new on the word | Improvement over time |
| 18 | **Evidence tour** | Safari window tilting in from 16° rotateX, camera over a 2× full-page screenshot, cursor clicks on the exact cells | Public, checkable proof |
| 19 | **Island status** | Dynamic Island morphs through states (blue spinner → red ✕ → indigo → orange ? → green ✓), each with a tinted glow | Narrating system state across shots |
| 20 | **Word triad** | One word per beat at 210 px, each replacing the last, the third in the AI gradient, followed by a 6-card proof bento | Value proposition |

Also available: **Wall + headline** (diagonal columns of mini cards scrolling at different speeds behind a radial white vignette, with a two-line headline), **Generality flow** (spec documents slide into the component cards and dissolve, then "Zero product names."), and the **End card** (halo, icon, wordmark, two MaskUp tagline lines on their words, URL chip, credit line, fade to white).

---

## 7. Devices and system UI

All of these are drawn in CSS. No images or mock-up PSDs, so everything stays sharp at any zoom.

**MacBook Pro**
- Display 1600×1000 (content is laid out at this size), bezel 18 px, lid radius 38, notch 184×30.
- Aluminium base 1880×34: `linear-gradient(#E8E9EB, #D1D2D5 45%, #A7A9AD)` with a centre thumb notch and a blurred floor shadow.
- **Lid-open entrance:** rotate the lid on X from −88° to 0° (origin at the bottom edge), 1.1 s `io`, while the machine rises 420 px on a 26/90 spring with 12° → 0° tilt. Use it once, the first time the device appears.
- **Placement:** `MAC = { cx: 960, top: 136, s: 0.74 }`. Convert display to stage coordinates with `x = cx + (dx − 800)·s`, `y = top + (dy + 18)·s`.

**iPhone**
- 430×932, radius 72, 14 px black frame with titanium rings (`#8E8E93`, `#3A3A3C`), Dynamic Island 124×36.
- Wallpaper pastel gradient `#FFD1E3 → #C7D2FE → #A5F3FC`, lock clock "9:41" at 112 px.

**Notification**
- Glass `rgba(250,250,252,.78)` + blur 30, radius 26, 42 px app tile.
- Upper-case app name (15 px), title 18/600, body 16 truncated with an ellipsis.

**Dynamic Island**
- Black pill at the top centre.
- States are `{ at, w, h, tint, content }`. Width and height spring between states; radius is h/2; content fades in after 0.12 s with blur 6 → 0; the tint becomes a coloured glow under the pill.
- Collapsed 180×54, typical expanded 420–780 × 72–92.

**Safari**
- Window at (160, 140), 1600 wide, 50 px toolbar (`#F6F6F6`), 760 px URL field, 790 px viewport.
- Enters by rising 140 px with rotateX 16° → 0 on a 26/90 spring.

**Editor (Xcode, light)**
- White, 52 px title bar `#F3F3F5`, line-number gutter 74 px in `#A4A4AA`.
- Syntax colours: keywords `#9B2393` bold, strings `#C41A16`, comments `#5D6C79` italic.
- Diff rows tinted 8–18 % (green for added, red for removed with strikethrough); hot rows get a 5 px bar that grows on Y.

---

## 8. Camera and cursor

**Camera.** Keys are `{ f, x, y, s }`, meaning "centre content point (x, y) at zoom s", interpolated with `io`. A push-in is three keys: rest → rest-until-the-moment → target 0.5–1.0 s later. Pull out with the same curve. Typical zooms are 1.55–1.95 for text in a device and 0.42 → 0.95 for a browser page.

Two kinds of push-in target:
- **A terminal line.** Ask the replay *when* and *where* a line first appears (`lineAt(rec, match)` returns `{ t, y }`), so the push lands exactly as the line prints.
- **A screenshot cell.** Find the cell's pixel coordinates in the 2880-px screenshot, then `screen = (960 + (x − cx)·s, 585 + (y − cy)·s)` for the Safari geometry above.

**Cursor (macOS arrow, black fill, white 1.4 px stroke, drop shadow)**
- **Paths are curved:** a quadratic Bézier whose control point is offset 20 % of the segment length perpendicular to it, eased with `io`. Straight lines read as robotic.
- **Motion trail:** three ghosts at −3, −6 and −9 frames, opacity 0.16 / 0.115 / 0.07, drawn only while the cursor moves (> 6 px).
- **Click:** press-squash to 86 % over ±0.12 s, a blue 3 px ripple growing to 88 px over 0.6 s (`expo`), and a `click` sound.
- **Rules:** the cursor appears 0.5–0.8 s before it is needed, travels for 0.6–1.0 s, and clicks **only on something real** (a line of code, a cell of evidence). It leaves with a 0.3 s fade.

---

## 9. Sound

### 9.1 Voice

Use Kokoro-82M (Apache-2.0) with the **`af_heart`** voice (its highest-rated) at speed **1.04**, on the GPU if one is available.

- Generate **one WAV per line** and trim silence (threshold 0.01, keeping 600 samples of pre-roll and 2400 of tail), so the film controls the pauses.
- **Capture word timestamps** from the pipeline (`result.tokens[].start_ts / end_ts`), offset by any chunk boundaries and the trimmed head. They drive every kinetic cut.

### 9.2 Score

An original 120 BPM score synthesised in numpy/scipy. One bar is 2 s, or 120 frames at 60 fps.

| Story act | Section | Parts |
|---|---|---|
| Hook | `intro` | Filtered pad only |
| Problem | `groove` | Four-on-the-floor kick, 8th hats, bass, dark pad |
| Reveal | `drop` | + claps on 2 & 4, 16th hats, open hats, chord stabs, 16th pluck arpeggio, bright pad |
| How it works | `drive` | Drop minus the arpeggio |
| Differentiator | `half` | Kick on 1, clap on 3, arpeggio, wide pad |
| Conflict | `tense` | Groove with a dark pad (cutoff 700 Hz); **switches to `drive` at the acceptance word** |
| Real thing | `drive` | |
| Impact | `drop` | |
| End card | `outro` | Pad + slow bell plucks, ring-out |

- **Progression:** Am – F – C – G (one chord per bar).
- **Sidechain:** the pad pumps to the kick (−65 % with a 0.11 s recovery).
- **Risers and impacts:** a one-bar noise riser into the problem, reveal, impact and end card, with a sub impact on each of those cuts.
- **Stereo:** two decorrelated reverb impulse responses (left and right seeds) on a reverb bus.
- **Ducking:** −6 dB (×0.5) on the score whenever a voice line plays, from 0.12 s before the line to 0.2 s after it, smoothed over 0.15 s.

### 9.3 Effects (all synthesised)

| Name | Sound | Where |
|---|---|---|
| `notify` | Two-note bell pluck | Each notification (thin them out in floods: play the first five, then every fourth) |
| `tick` | 3.4 kHz blip | Each checklist row |
| `click` | Short 2 kHz blip + noise | Every cursor click |
| `pop` | Pitch-dropping sine | Chips and verdict states |
| `chime` | E5 B5 E6 bell arpeggio + reverb | Brand reveal, a key pass, **acceptance** |
| `deny` | Detuned low dyad, falling | Rejection |
| `whoosh` | Band-swept noise | Optional; the score already marks cuts |

### 9.4 Master

Mix the score at 0.5 in the film. Render, then `ffmpeg -af loudnorm=I=-14:TP=-1.5:LRA=11`, which gives about **−14 LUFS** integrated (streaming standard).

---

## 10. Pipeline and project layout

```
film-project/
├── script.json            # the words (§3)
├── tts.py                 # script.json → film/public/vo/*.wav + film/src/vo.json (with word timestamps)
├── plan.py                # vo.json + timing.json → film/src/timeline.json (frames, cuts on bar lines)
├── music.py               # timeline.json → film/public/sfx/score.wav + effects
├── rec/                   # real footage: terminal recordings, screenshot capture, converters
│   ├── capture.py         # Playwright 2× full-page screenshots → film/public/*.png
│   └── convert.py         # `script -T` recordings → film/src/recordings.json
└── film/                  # Remotion project
    ├── src/ui.tsx         # tokens, curves, springs, type, surfaces, camera, cursor, captions
    ├── src/devices.tsx    # MacBook, iPhone, Notification, Island, Safari, Editor
    ├── src/term.tsx       # terminal replay + lineAt()
    ├── src/scenes.tsx     # one component per act
    ├── src/Film.tsx       # TransitionSeries from timeline.json + score
    ├── src/timing.json    # lead / gap / tail / transition / per-line holds (seconds)
    ├── stills.mjs         # review stills (two per line)
    └── sheet.sh           # contact sheet from stills
```

**Data flow**

```
script.json ─► tts.py ─► vo.json (+ words) ─┐
                                            ├─► plan.py ─► timeline.json ─┬─► music.py ─► score.wav
timing.json ────────────────────────────────┘                             └─► Remotion ─► render ─► loudnorm ─► film.mp4
```

**Commands**

```bash
# once
uv venv .tts --python 3.12 && VIRTUAL_ENV=.tts uv pip install "torch==2.6.0" "kokoro==0.9.4" "transformers>=4.45" "misaki[en]>=0.9" soundfile scipy
cd film && npm i remotion @remotion/cli @remotion/transitions @remotion/google-fonts @remotion/fonts @remotion/noise @remotion/paths react@19 react-dom@19

# every change of words or timing
VIRTUAL_ENV=$PWD/.tts PATH=$PWD/.tts/bin:$PATH .tts/bin/python tts.py
python3 plan.py
.tts/bin/python music.py

# review, then render
cd film && npx tsc -p . && node stills.mjs && ./sheet.sh hook
npx remotion render src/index.ts Film out/raw.mp4 --concurrency=6 --codec=h264 --crf=16 --x264-preset=slow
ffmpeg -i out/raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 out/film.mp4
```

The reference film (3:37, 13,000 frames at 60 fps) renders in about 25 minutes on a 12-thread laptop.

---

## 11. Capturing real footage

**Terminal runs.** Record with timing and replay them faithfully:

```bash
COLUMNS=104 script -q -T run.timing -O run.out -c 'echo "$ my-tool verify"; my-tool verify'
python3 rec/convert.py run      # → {name: {duration, events:[{t, text}]}}; strips ANSI, replaces $HOME with ~
```

The replay types `$ ` lines at 46 characters/s and prints everything else instantly. Gaps longer than a cap (0.6–3.2 s) are compressed, and while compressed the window badge turns **amber, "⏩ Time-lapse · m:ss"**, with the real clock running. Output is never reordered or rewritten.

**Web evidence.** Use Playwright at a 1440×900 viewport, `device_scale_factor=2`, full page, with sign-in banners hidden. Crop very tall pages to the region you'll tour (Chrome dislikes images over about 16k px).

**Screen recordings of long sessions.** Time-lapse to the scene length, with the factor burned in:

```bash
ffmpeg -i session.mp4 -an -vf "setpts=PTS/<factor>,fps=30,scale=1600:-2,drawtext=text='x<factor> time-lapse':x=w-tw-24:y=h-th-20:fontsize=22:fontcolor=white@0.85:box=1:boxcolor=black@0.5" -t <seconds> public/room.mp4
```

---

## 12. Reference code

The essentials, so the system can be rebuilt from this file alone. Full versions are in `commit-video/film/src/`.

**Curves and springs**

```ts
export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);
export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const io = Easing.bezier(0.65, 0, 0.35, 1);
export const sp = (f: number, at: number, o: { damping?: number; stiffness?: number } = {}) =>
  spring({ frame: f - at, fps: FPS, config: { damping: o.damping ?? 30, stiffness: o.stiffness ?? 170, mass: 1 } });
export const ramp = (f: number, at: number, dur: number, e = expo) =>
  interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
```

**Word timing.** The heart of "type lands on the word":

```ts
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9%-]/g, '');
export const wf = (l: Line, word: string, nth = 0) => {
  let hits = l.words.filter((w) => clean(w[0]) === clean(word));
  if (!hits.length) hits = l.words.filter((w) => clean(w[0]).startsWith(clean(word)));
  return hits[nth]?.[1] ?? l.from;          // frame the word is spoken (scene-relative)
};
// usage: <Hero at={wf(l2, 'checker')}>…</Hero>
```

**Hero and MaskUp**

```tsx
export const Hero = ({ at, out, children, style, from = 1.12 }) => {
  const f = useCurrentFrame();
  if (f < at - 1 || (out !== undefined && f > out + sec(0.35))) return null;
  const p = ramp(f, at, sec(0.7)), q = out === undefined ? 0 : ramp(f, out, sec(0.3), io);
  return <div style={{ ...style, opacity: Math.min(1, p * 2) * (1 - q),
    transform: `scale(${from - (from - 1) * p - q * 0.04})`, filter: `blur(${(1 - p) * 18 + q * 14}px)` }}>{children}</div>;
};
export const MaskUp = ({ at, children, style }) => {
  const p = ramp(useCurrentFrame(), at, sec(0.8));
  return <div style={{ overflow: 'hidden', paddingBottom: '0.08em', ...style }}>
    <div style={{ transform: `translateY(${(1 - p) * 105}%)`, opacity: p > 0 ? 1 : 0 }}>{children}</div></div>;
};
```

**Camera**

```tsx
export const Camera = ({ keys, w = 1920, h = 1080, vw = 1920, vh = 1080, children }) => {
  const { x, y, s } = track(keys, useCurrentFrame());       // io-eased interpolation between keys
  return <AbsoluteFill style={{ overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: w, height: h, transformOrigin: '0 0',
      transform: `translate(${vw / 2 - x * s}px, ${vh / 2 - y * s}px) scale(${s})` }}>{children}</div>
  </AbsoluteFill>;
};
```

**Curved cursor path**

```ts
const t = io((f - a.f) / (b.f - a.f));
const dx = b.x - a.x, dy = b.y - a.y;
const cx = (a.x + b.x) / 2 - dy * 0.2, cy = (a.y + b.y) / 2 + dx * 0.2;   // control point, 20 % perpendicular
const u = 1 - t;
const x = u * u * a.x + 2 * u * t * cx + t * t * b.x, y = u * u * a.y + 2 * u * t * cy + t * t * b.y;
```

**Edge glow**

```tsx
const ring = { position: 'absolute', inset: 0, padding: 16,
  background: `conic-gradient(from ${f * 1.2}deg, #0894FF, #C959DD, #FF2E54, #FF9004, #0894FF)`,
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' };
<><div style={{ ...ring, filter: 'blur(26px)', opacity: 0.9 }} /><div style={{ ...ring, padding: 5, filter: 'blur(3px)' }} /></>
```

**Dynamic Island morph**

```ts
const p = sp(f, cur.at, { damping: 20, stiffness: 150 });
const w = prev.w + (cur.w - prev.w) * p, h = prev.h + (cur.h - prev.h) * p;   // radius = h / 2
const content = ramp(f, cur.at + sec(0.12), sec(0.3));                       // fades + unblurs after the morph starts
```

**Cuts on bar lines** (`plan.py`)

```python
BAR = int(FPS * 60 / BPM * 4)                     # 120 frames at 60 fps, 120 BPM
natural = prev["start"] + prev["dur"] - T         # where the next scene would begin
start = math.ceil((natural + T / 2) / BAR) * BAR - T // 2   # transition midpoint on a downbeat
prev["dur"] = start - prev["start"] + T           # previous scene absorbs the wait
```

**Voice ducking** (`music.py`)

```python
duck = np.ones(n)
for line in all_lines:                             # absolute seconds from timeline.json
    duck[int((line.start - 0.12) * SR): int((line.end + 0.2) * SR)] = 0.5
duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
```

**Terminal push-in target**

```ts
const hit = lineAt('t-isolated', '147/147 passed', { cap: 3.2, rows: 22, font: 25 });   // { t: seconds, y: px in window }
const at = termStart + Math.round(hit.t * FPS);
const P = macPoint(760, hit.y);                                                        // stage coordinates
keys = [{ f: 0, x: 960, y: 540, s: 1 }, { f: at - sec(0.3), x: 960, y: 540, s: 1 }, { f: at + sec(0.6), x: P.x, y: P.y, s: 1.9 }];
```

---

## 13. Quality loop

1. **Stills before renders.** `node stills.mjs <scene>` renders two frames per spoken line (at 40 % and at the end of its hold) at half scale. `./sheet.sh <scene>` tiles them, so a whole scene can be reviewed in one image. Iterate here, because it's 30–60× cheaper than rendering.
2. **Then a full render, then a 6-second contact sheet of the real file.**
   `ffmpeg -i film.mp4 -vf "fps=1/6,scale=400:-1,tile=6x6" -frames:v 1 sheet.jpg`
   This catches what stills can't show: push-ins, morphs, transitions.
3. **Defects to hunt in every sheet:**
   - **Overflow:** big numbers clipping their card, words wrapping (use `whiteSpace: 'nowrap'` and smaller sizes).
   - **Collisions:** island vs device top, callout vs zoomed frame edge, label vs window, caption vs content.
   - **Contrast:** white text on glass over a white page (darken the tint), grey on grey.
   - **Mid-reveal clipping:** MaskUp lines wrapping into the mask.
   - **Dead time:** any 3 s with no change.
   - **Mismatch:** an on-screen word that the voice never says.
4. **Audio:** `ebur128` for loudness, plus one listen with headphones for the duck depth and how loud the effects sit.

---

## 14. Credibility rules

A beautiful film that overclaims is worse than an ugly honest one. LUMEN builds honesty into the visual language:

- **Real recordings only** for anything that "runs". If time is compressed, the amber time-lapse badge is visible for the whole compressed span.
- **Every number traces to a file** in the evidence (report, verdict, log). Keep a list of number → source while writing the script.
- **Illustrations are labelled** as illustrations, right next to the real receipt ("Notifications illustrate those 27 responses").
- **Name revisions and dates** on verdicts ("Full release gate · revision a899d17 · 2 Oct 2026") when two runs might be conflated.
- **Don't let the voice outrun the evidence.** If the repaired build was INCONCLUSIVE because steps were skipped, the script says so, and the drama of the honest version is better.
- **No impersonation:** generic app names in mock notifications, no real brands' logos, no fabricated testimonials.

---

## 15. Adapting LUMEN to a new product

1. **Find the disaster.** What concrete, measurable failure does your product prevent? Reproduce it for real and record it.
2. **Find the receipt.** Which artefact proves the product caught or fixed it (log, report, dashboard, public page)?
3. **Name three to four recurring objects.** The app icon plus the product's parts (seats, stages, modules) as glyph cards.
4. **Write the nine acts** in `script.json` using the §3 rules. Read it aloud; it should run 150–165 words/min and land at 3:15–3:45.
5. **Capture footage:** terminal recordings (§11), 2× screenshots of the evidence pages, and a screen recording of the real thing running.
6. **Generate the voice:** `tts.py`. Check the word list for the payoff words you'll cut to.
7. **Pick shots per line** from §6, never repeating a layout back to back, and use the black interrupt exactly once.
8. **Set holds** in `timing.json` wherever a shot needs time beyond its line (terminal replays, proof grids).
9. **Plan:** `plan.py`. Cuts snap to bar lines.
10. **Score:** `music.py`. Map your acts to sections (§9.2). The release lands on your acceptance word.
11. **Build the scenes** with the primitives (§5, §7, §8). Every `at=` should be a `wf(line, 'word')` or a measured `lineAt` frame, not a guessed number.
12. **Stills → fix → stills** until the sheets are clean (§13).
13. **Render, loudnorm, contact sheet, one full watch with sound.**
14. **Fact-check pass:** every on-screen number against its source file (§14).
15. **Export:** 1080p60 H.264 for submission, and optionally a 1080×1920 cut by re-laying out the scenes.

---

## 16. Checklists

**Pre-production**
- [ ] One measured disaster, reproduced and recorded
- [ ] Receipts for every number (path → value list)
- [ ] Script reads aloud in ≤ 4:00, one idea per line, payoff words at line ends
- [ ] Footage captured: terminals (timed), screenshots (2×), session recording

**Per scene**
- [ ] Opens on a different layout from the previous scene
- [ ] Every reveal is keyed to a spoken word
- [ ] Something changes at least every 3 s
- [ ] Exits overlap the next entry; nothing cuts to empty
- [ ] Captions readable and not covering the subject
- [ ] Nothing clips, wraps or collides (island, device, captions)

**Final**
- [ ] 1920×1080, 60 fps, −14 LUFS ±1, true peak ≤ −1.5 dBTP
- [ ] Music ducks under the voice; effects audible but not louder than the voice
- [ ] Only one black scene; edge glow only on AI/payoff moments
- [ ] Every time-lapse badged, every illustration labelled
- [ ] End card: icon, wordmark, tagline, URL, credit

---

## 17. Brief for an AI agent

Copy this block, fill in the brackets, and attach this file plus your footage:

```text
Make a LUMEN launch film for [PRODUCT], following LUMEN.md exactly.

Audience: [who watches — judges / customers / investors]. Length: 3:15–3:45.
The disaster it prevents (measured, reproducible): [one sentence + the number].
The receipt that proves it: [file / page / log path].
Recurring objects: [app icon], [3–4 parts of the product].
Real footage provided: [terminal recordings], [screenshots], [screen recording].

Deliver: script.json (nine acts, §2–§3), voice via tts.py (af_heart, 1.04, word timestamps),
timeline via plan.py, score via music.py (sections mapped to acts, release on the acceptance word),
scenes built only from LUMEN primitives and the shot catalogue (§5–§8),
review stills and contact sheets for every scene (§13), a 1080p60 render normalised to −14 LUFS,
and a list mapping every on-screen number to its source file (§14).
Never invent a number, never show unlabelled illustration as fact, badge every time-lapse.
```

---

*LUMEN was distilled from the COMMIT film (WeAreDevelopers × BAND Dark Factory, October 2026). Reference implementation: `commit-video/`. Everything in it is open source and generated locally.*
