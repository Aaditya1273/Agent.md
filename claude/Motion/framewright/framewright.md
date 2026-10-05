---
targetModels:
  - "Claude Opus 5.5"
  - "Claude Fable 5.1"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
name: framewright
category: Motion
description: FRAMEWRIGHT, code-rendered cinematic product films for any product — every frame a function of time, a scripted real take, a virtual camera and cursor, original score and a quality gate.
license: MIT
author: Agent.md maintainers
last-verified: 2026-10-05
reviewed-by: unreviewed
---

# FRAMEWRIGHT

**A playbook for code-rendered cinematic product films.**
*Every frame is a function of time. Every second earns its place.*

FRAMEWRIGHT is how to make a 1–3 minute product film that looks like a studio cut it: a story with a hook, a visual theme with its own material and texture, motion design with intent, real product footage under a smooth virtual camera and an animated cursor, voiceover, an original score, and broadcast-level loudness. It needs no After Effects, no Premiere and no stock music. Everything is plain files (HTML, JS, Python, JSON) rendered by a headless browser and finished with ffmpeg. It works for any product: an app, a SaaS tool, a device, a dev tool, a service, a research result.

Use it two ways:

1. **Hand it to an AI coding agent.** Fill in the brief (§1), paste the master prompt (§14), and attach this file. The agent builds the whole pipeline.
2. **Follow it yourself.** Each section is one stage, in production order.

---

## Contents

0. [The non-negotiables](#0-the-non-negotiables)
1. [The brief](#1-the-brief)
2. [Story architecture](#2-story-architecture)
3. [The script](#3-the-script)
4. [The visual theme system](#4-the-visual-theme-system)
5. [Motion language](#5-motion-language)
6. [Signature moves](#6-signature-moves)
7. [Product footage: the real take](#7-product-footage-the-real-take)
8. [The virtual camera](#8-the-virtual-camera)
9. [The cursor](#9-the-cursor)
10. [Sound: voice, score, mix](#10-sound-voice-score-mix)
11. [The render pipeline](#11-the-render-pipeline)
12. [Quality gate](#12-quality-gate)
13. [Publishing kit](#13-publishing-kit)
14. [The master prompt](#14-the-master-prompt)

---

## 0. The non-negotiables

Six rules. Each one exists because breaking it produced a visibly worse film.

| # | Rule | Why |
|---|---|---|
| 1 | **Every frame is a pure function of time.** `render(t)` sets every pixel from `t` alone: no `Date.now()`, no `Math.random()`, no CSS animations or transitions, no state carried between frames. | Frames can render in any order, in parallel, and re-render identically. Anything that depends on wall-clock time stutters or drifts. |
| 2 | **One timeline file is the single source of truth.** Scene ranges, voice-line placements, camera keyframes, chapter cards and the footage time-remap all live in `timeline.json`. Picture and sound both read it. | Change one number and picture and sound move together. Nothing goes out of sync by hand. |
| 3 | **Story before motion.** Write the script and timing before any animation. Motion serves a sentence; it is never decoration. | Motion without a sentence behind it reads as a template. |
| 4 | **Visuals ≫ text.** On screen: one idea, at most about 8 words, at a size readable on a phone. The voice carries the explanation and the picture carries the feeling. | Viewers can't read and listen at once. Paragraphs on screen get skipped. |
| 5 | **Real footage, never mockups.** Record the real product doing the real thing. Edit out the dead time; never fake the result. | Audiences and judges can tell. Real footage is the strongest proof you have. |
| 6 | **Every claim is true.** Every number on screen and in the voiceover has a source: your own measurement or a citation. Simulated or mocked parts are labelled. | One false number discredits every true one. |

---

## 1. The brief

Fill this in before anything else. If a field can't be filled, the film isn't ready to be made.

```yaml
product:        # name + one-line description
audience:       # who watches, where (YouTube, a pitch, a landing page, a booth loop)
length:         # 60s | 90s | 150s (see §2 for each)
the_lie:        # the false belief or broken status quo the hook attacks
the_truth:      # the one sentence the viewer must remember
proof:          # the real, verifiable moment the footage shows (a result, an output, a number)
three_benefits: # what changes for the user, in 3 short phrases
tagline:        # 2–4 words, rhythmic (e.g. "Scan. Prove. Own.")
theme:          # material metaphor (see §4), e.g. "Japanese ink on washi"
voice:          # TTS voice or human VO; pace; accent
music:          # mood + instruments that belong to the theme
must_show:      # product screens/flows that must appear, in order
must_not:       # anything off-limits (private data, unreleased features, competitor names)
```

---

## 2. Story architecture

Six acts. The proportions hold at any length; scale the seconds.

| Act | Job | 150 s | 90 s | 60 s |
|---|---|---|---|---|
| **1. Hook** | Break a belief in under 5 seconds. Show, don't tell. | 0–13 | 0–8 | 0–6 |
| **2. Problem** | Make it measurable and personal: one hard number, one human cost. | 13–36 | 8–22 | 6–15 |
| **3. Painkiller** | The turn. The idea in one sentence, then the product name. | 36–57 | 22–33 | 15–22 |
| **4. Product** | The real take: 3–5 chapters, each one verb. The proof moment lands here. | 57–106 | 33–68 | 22–45 |
| **5. Depth / Impact** | Why it's better (one measured fact), then who wins and how. | 106–136 | 68–82 | 45–54 |
| **6. Outro** | Name, tagline, one call to action. Silence before the last beat. | 136–150 | 82–90 | 54–60 |

**Overlap the acts.** Scenes cross by 0.4–1.2 s. The next scene is already moving underneath when the previous one leaves. Hard cuts between acts feel like slides.

### The hook

The hook is the film. Patterns that work:

- **The reveal-the-lie.** Show something that looks normal, then expose it in one line ("This receipt is fake."). Circle or strike the evidence on screen.
- **The impossible number.** One number, huge, alone, then the reason it matters.
- **The before/after slam.** The old way and the new way, half a second apart.
- **The question they can't answer.** Then the answer, in the product.

Hook rules: the first words are spoken by 3–4 s; the first motion happens by frame 1 (never open on a static title); the viewer understands *what's wrong* before they learn *who you are*. Say your name in act 3, not act 1.

### Chapters inside the product act

Label each beat with a small card: number + 3–5 word verb phrase ("01 · Issue the receipt", "02 · Verify the seal"). Chapters turn a screen recording into a story with progress, and they double as YouTube chapter markers.

---

## 3. The script

**Pace.** Measured on a finished 150 s film: 233 words over 19 lines, about **1.5 words per second of film**. While speaking the voice runs near 2.5 words/s; the rest is breathing room for picture and music. More words than that and the film stops feeling cinematic.

**Line rules.**

- One idea per line. Most lines are 4–14 words. Fragments are allowed ("A coin flip.").
- Concrete over abstract: "Change one digit and the seal breaks" beats "ensures integrity".
- Rhythm: short, short, long. Land the long line on the visual payoff.
- Every number gets a source in the description or an on-screen footnote.
- **Write for the TTS engine:** spell numbers the way they should be said ("twenty twenty-six", "fifty point one percent"), avoid abbreviations, use commas for breaths and full stops for pauses.

**Script format** (`script.json`):

```json
{ "voice": "af_heart", "speed": 1.0,
  "lines": [
    { "id": "hook1", "text": "This receipt is fake." },
    { "id": "hook2", "text": "It took less than a second to make. And you couldn't tell." }
  ] }
```

Placement lives in the timeline, not the script: `"vo": [["hook1", 3.6], ["hook2", 6.0], …]`. Render the voice first, measure each line's duration, then time the picture to the voice. Never the other way around.

---

## 4. The visual theme system

A theme is a **material metaphor**, not a colour scheme. Pick a physical world the brand could plausibly be made of. Then everything follows from it: palette, type, texture, the signature mark, the transitions, even the instruments in the score.

### Pick a world

| Theme | Palette | Type | Texture | Signature mark | Transition | Sound |
|---|---|---|---|---|---|---|
| **Ink on washi** (Japanese) | cream paper, sumi black, vermilion | high-contrast serif + clean grotesk | paper fibre, ink bleed | hanko seal, brush circle | brush-stroke wipe | koto, taiko, temple bell |
| **Swiss print** | white, black, one signal red | neo-grotesk, tight | none; grid lines | the grid itself | hard slide on the grid | minimal piano, clicks |
| **Blueprint** | navy, cyan line, white | technical mono + condensed sans | drafting grid | dimension lines, callouts | line-draw reveal | pencil, soft synth pulses |
| **Risograph** | 2–3 spot inks on off-white | chunky display + mono | misregistration, halftone | overprint shapes | ink-roll slide | lo-fi drums, tape hiss |
| **Terminal noir** | black, phosphor green or amber | monospace only | scanlines, glow | blinking cursor | type-on, glitch cut | analog synth, keyboard |
| **Editorial** | warm white, ink, one accent | display serif + text serif | paper grain | drop cap, rule lines | page turn, column slide | strings, light percussion |
| **Bauhaus** | primary red/blue/yellow on cream | geometric sans | flat | circle, square, triangle | shape morph | marimba, claps |

### Build the system as tokens

```css
:root {
  --paper: #f4efe3;   /* background: never pure white */
  --ink:   #171717;   /* text: never pure black */
  --accent:#c83a2f;   /* ONE accent, used for emphasis and the signature mark only */
  --muted: #3a3632;   /* secondary text */
  --display: "Your Serif", serif;
  --text:    "Your Sans", sans-serif;
  --mono:    "Your Mono", monospace;
}
```

Theme rules:

- **One accent colour.** If everything is accent, nothing is.
- **Never pure white or pure black.** Off-white paper and near-black ink read as material; #fff and #000 read as software.
- **Living grain.** A noise layer over everything, its offset jumping about 12 times a second (still deterministic: seed it from `floor(t*12)`). It stops large flat areas from looking dead and hides compression banding.
- **One signature mark** that recurs: in the hook, at the turn, on the proof moment, in the outro. Repetition builds the brand in 150 seconds.
- **Make the art in code**: SVG with seeded randomness for roughness (a "hand-drawn" circle is a path with jittered radii). Then it is resolution-independent, themeable and deterministic.

---

## 5. Motion language

### Time primitives

```js
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => clamp((t - a) / (b - a));          // progress of t through [a, b]
const lerp = (a, b, u) => a + (b - a) * u;
const E = {
  out3:   u => 1 - (1 - u) ** 3,                           // default entrance
  out5:   u => 1 - (1 - u) ** 5,                           // snappy entrance
  inOut:  u => u < .5 ? 4*u*u*u : 1 - (-2*u + 2) ** 3 / 2, // moves between two places
  outExpo:u => u >= 1 ? 1 : 1 - 2 ** (-10 * u),            // big reveals
  outBack:u => { const c = 1.70158; return 1 + (c+1)*(u-1)**3 + c*(u-1)**2; }, // stamps, pops
};
const A = (t, a, b, ease = E.out3) => ease(P(t, a, b));   // animated value 0→1
const env = (t, a, b, fi = .4, fo = .4) =>                // fade in over fi, hold, fade out over fo
  Math.min(A(t, a, a + fi), 1 - A(t, b - fo, b));
let seed = 7;
const rnd = (i, k = 0) => { const x = Math.sin(i*127.1 + k*311.7 + seed) * 43758.5453; return x - Math.floor(x); };
```

Every element is then one line: `el.style.opacity = env(t, 14.2, 21.0)`, `el.style.transform = \`translateY(${(1 - A(t, 14.2, 14.9)) * 40}px)\``.

### Timing table

| Motion | Duration | Ease |
|---|---|---|
| Text line entrance | 0.5–0.8 s | out3 / out5, rising 30–60 px |
| Stagger between lines/items | 0.08–0.15 s | n/a |
| Big number count-up | 1.2–2.0 s | outExpo |
| Element moving between two places | 0.8–1.4 s | inOut |
| Camera glide | ≥ 1.3 s | smootherstep (§8) |
| Stamp / impact | 0.25–0.4 s scale-down from 1.3 | outBack, plus 0.45 s decaying shake |
| Scene crossfade / overlap | 0.4–1.2 s | inOut |
| Hold after a key line lands | ≥ 1.0 s | nothing moves |

### Motion rules

- **Motivated motion only.** Things move because the voice just said something, or the sound just hit. Sync entrances to word onsets (± 2 frames).
- **Ease everything.** Linear motion is only for the grain and for constant drifts (a slow 1–2 % push-in during a long hold keeps a frame alive).
- **Stagger, don't batch.** Five items appearing together is a slide; five items at 0.1 s intervals is choreography.
- **Shake only on impact**, decaying and brief: `amp * d²` with `d` falling from 1 to 0 over 0.45 s.
- **Stillness is a tool.** After the strongest line, freeze everything for a beat.

---

## 6. Signature moves

Reusable effects that make a film feel designed. Each is a pure function of `t`.

- **Line-by-line clip reveal.** Each text line sits in its own `overflow` mask and slides up into view. *Gotcha:* remove the clip (`clip-path: none`) once the reveal completes, or any annotation that extends past the line (a circle, an underline, a stamp) gets cut off.
- **Draw-on annotation.** A hand-drawn circle or strike-through around evidence: SVG path with `stroke-dasharray = length`, animate `stroke-dashoffset` from length to 0 with out3. Give the path jitter so it looks human, and **overshoot**: end slightly past the start point, like a real pen.
- **The stamp.** The signature mark scales from 1.3 → 1.0 with outBack in 0.3 s, a few ink-splat dots appear at random radii, the frame shakes, and a low thud plays on the exact frame.
- **Count-up.** Numbers count with outExpo and tabular figures (`font-variant-numeric: tabular-nums`) so the width doesn't jitter.
- **Brush / shape wipe.** A theme-shaped band (ragged brush edge, grid block, ink roll) crosses the frame and fully covers it at its midpoint; swap scenes underneath at that instant.
- **Tamper demo.** Show the product rejecting a manipulated input: change one character, the accent colour drains, the mark cracks, a "rejected" state appears. Proof by failure is as convincing as proof by success.
- **Split-flap / ticker.** For metrics: characters flip through a few random glyphs (seeded) before settling.
- **Push-in on proof.** When the real result appears in the footage, the camera eases in 1.3–1.6× on it and holds for at least a full second.

---

## 7. Product footage: the real take

Don't screen-record by hand. **Script the take** so it is repeatable, then edit in time, not in pixels.

### Record

Drive the real product with Playwright (or an equivalent automation tool) and capture two things:

1. **Frames:** the Chrome DevTools Protocol screencast (`Page.startScreencast`) at full resolution, each frame saved with its timestamp.
2. **An event log:** every cursor move (`from`, `to`, `t0`, `t1`), click (`t`, `x`, `y`), keystroke and scroll, with timestamps on the same clock.

```json
{ "t0": 1727000000.0, "viewport": [1440, 900],
  "frames": [{ "t": 0.000, "file": "f00000.jpg" }, …],
  "events": [{ "type": "move", "from": [400,300], "to": [812,540], "t0": 2.1, "t1": 2.9 },
             { "type": "click", "t": 3.0, "x": 812, "y": 540 }] }
```

Rules for the take:

- **Move the real cursor slowly and deliberately** (0.6–1.0 s per move) so the drawn cursor has meaningful paths to follow.
- **Pause 1–2 s on every result** so the edit has room to breathe.
- **Do setup off-camera**: logins, auth prompts, connecting accounts, seeding data. Start recording when the product is ready to perform.
- **Use real data and a real outcome.** If the product produces an ID, a receipt, an output or a link, show it, and put it in the video description so anyone can check it.

### Edit with a time remap

The recording is never cut by hand. A remap table maps film time onto take time, segment by segment:

```json
"remap": [[0, 29.0, 1.0], [29.0, 30.15, 1.0], [30.15, 44.0, 6.0]]
//         [take_from, take_to, speed]: speed 6 compresses a loading wait 6×
```

Use it to compress waiting, skip loading screens and remove flashes of intermediate states. If the recorder captured a scroll as a jump, add a **synthetic smooth scroll**: draw the frame before and the frame after, offset by an eased scroll value, for 0.4–0.6 s.

---

## 8. The virtual camera

The difference between "screen recording" and "film" is the camera. It is also where most code-rendered films get a visible **shake**. Build it like this:

1. **Place the footage in a window** on the stage (a browser frame, device bezel or card), smaller than the full frame, so the camera has room to move.
2. **Keyframes are shots, not zooms.** Each keyframe is `[t_start, t_end, zoom, x, y]` in footage coordinates. Convert it once to a **visible rectangle** `{cx, cy, w}` in stage space.
3. **Clamp each shot once, at the keyframe**, so its rectangle stays inside the footage. *Never clamp per frame*: per-frame clamping makes the edge "catch" and the image jitter.
4. **Interpolate the rectangles linearly in (cx, cy, w)** with a **smootherstep** curve `u³(u(6u − 15) + 10)`. Between two in-bounds rectangles every intermediate rectangle is also in bounds, so no clamp is ever needed mid-move.
5. **Every glide lasts at least 1.3 s.** Stretch quick moves; fast zooms read as nervous.
6. **Draw the footage on a `<canvas>`** with `imageSmoothingQuality = "high"` at the exact sub-pixel transform. A CSS-scaled `<img>` resamples differently frame to frame and shimmers.

```js
const smoother = u => u*u*u*(u*(u*6 - 15) + 10);
function camera(t) {
  let st = SHOTS[0].r;
  for (const s of SHOTS) {
    if (t < s.a) break;
    const b = Math.max(s.b, s.a + 1.3);
    const u = smoother(P(t, s.a, b));
    st = { cx: lerp(st.cx, s.r.cx, u), cy: lerp(st.cy, s.r.cy, u), w: lerp(st.w, s.r.w, u) };
  }
  return st;   // zoom = 1920 / st.w; translate so (cx, cy) lands at frame centre
}
```

Camera grammar: wide to establish → push in on the action → hold on the result → pull out before the chapter changes. Keep zoom between 1.0 and about 1.8; above that, footage pixels show.

---

## 9. The cursor

The recorded cursor is hidden; a **drawn cursor** replaces it. It is what makes the product act feel crafted.

- **Path:** follow the logged moves with the inOut ease, bent into a gentle arc (perpendicular offset `sin(πu) × 8 %` of the distance). Hands never move in straight lines.
- **Click:** the arrow presses to 82 % scale and back over 0.22 s, and a ripple ring expands 8 → 50 px and fades over 0.5 s. A soft click sound plays on the same frame.
- **Scale with the camera, but less:** multiply size by `√zoom`, not `zoom`. A cursor that grows at the camera's full rate looks cartoonish when zoomed.
- **Same matrix as the footage:** transform the cursor through the exact camera transform so it never drifts off its target.
- **Style it to the theme:** solid ink arrow with a thin paper-coloured outline and a soft shadow. The ripple uses the accent colour.

---

## 10. Sound: voice, score, mix

### Voice

- An open-source neural TTS (e.g. Kokoro, Piper) generates one WAV per line, or record a human. Measure every line's duration and feed it to the timeline.
- Keep one voice and one speed for the whole film. Let pauses do the work.

### Score: original, matching the theme

Synthesize it (NumPy/SciPy) or compose it in a DAW. Build from a few theme-native instruments:

| Element | Role |
|---|---|
| **Pad** (slow attack, 1.5 s+) | Bed under each act, a different chord per act |
| **Plucked lead** (koto, piano, marimba: match the theme) | Melody fragments in the gaps between voice lines |
| **Low hit** (taiko, kick, thud) | The hook reveal, the turn, the stamp, the final title |
| **Riser + whoosh** | Into the turn, and for every brush wipe or camera push |
| **UI foley** (clicks, ticks, soft bells) | Synced to every cursor click and every success state in the footage, using the event log |
| **Silence** | Half a second before the tagline. The most powerful sound in the film. |

Score rules:

- **Musical arc = story arc.** Tense and sparse in the problem, warm at the turn, a steady pulse under the product, fullest at impact, resolving at the outro.
- **Sync hits to timeline events**, read from `timeline.json` and the take's event log, never placed by ear.
- **Sidechain-duck the music under the voice** (about −8 dB; fast attack, ~350 ms release) so the voice always sits on top.
- **One shared reverb** (a synthetic impulse response is fine) gives the whole mix a room.

### Mix and master

- Loudness: **−14 LUFS integrated, −1 dBTP true peak** (what YouTube and most platforms normalize to), using **two-pass** `loudnorm` in ffmpeg: measure, then apply with the measured values and `linear=true`.
- 48 kHz, 24-bit master; AAC 320 kbps in the final file.

```bash
ffmpeg -i mix_raw.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -   # pass 1: read measured_*
ffmpeg -i mix_raw.wav -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:linear=true,aresample=48000" -c:a pcm_s24le mix.wav
```

---

## 11. The render pipeline

### Layout

```
film/
  script.json        # voice lines
  timeline.json      # THE source of truth: fps, duration, scenes, vo placement, camera, remap, chapters
  record.mjs         # drives the real product, writes rec/take.json + rec/*.jpg
  vo.py              # script.json -> audio/vo/*.wav + durations
  score.py           # timeline + take events -> audio/mix_raw.wav (music, foley, voice, duck, reverb)
  index.html         # the stage: 1920×1080, all scenes as layers, fonts, tokens
  film.js            # render(t): one function per scene + transitions + global grain
  render.mjs         # headless Chromium: render(t) -> screenshot, N workers in parallel
  finish.sh          # loudness, encode, captions
```

### The `render(t)` contract

```js
window.render = async (t) => {
  // 1. each scene owns a time range; overlapping scenes both draw, z-order decides
  if (t < 13.2) hook(t);
  if (t >= 12.6 && t < 36.2) problem(t);
  // …
  // 2. visibility switches at crossfade midpoints
  // 3. transitions (wipes) and global layers (grain, fade to black)
};
window.READY = document.fonts.ready;  // never screenshot before fonts load
```

Inside a scene, an element's appearance comes from `t` alone. Lazily created DOM must be built identically in every worker, so warm every scene once before rendering.

### Render

```bash
node render.mjs --at 3.5,40,80                 # stills for review: always look before a full render
node render.mjs --workers 6                    # all frames: 150 s × 30 fps = 4,500 JPEGs (quality 93)
./finish.sh                                    # loudness → encode → captions
```

Give each worker a **contiguous chunk** of frames, not every Nth frame, so image caches stay warm.

### Encode

```bash
ffmpeg -framerate 30 -i frames/%05d.jpg -i audio/mix.wav \
  -c:v libx264 -preset slow -crf 15 -profile:v high -pix_fmt yuv420p -tune film \
  -c:a aac -b:a 320k -shortest -movflags +faststart  out/film.mp4
```

- **Master:** CRF 15 (large, archival). **Release:** re-encode at CRF 20–23 for upload or sharing.
- `+faststart` puts metadata first so the video starts playing before it fully downloads.
- **Captions:** generate the `.srt` from the timeline (start = placement, end = placement + measured duration). Upload them; don't burn them in.

---

## 12. Quality gate

Check every item before publishing. Each one has failed in a real render.

**Picture**
- [ ] Annotations (circles, underlines, stamps) are never cut off by a text mask.
- [ ] No camera shake or jitter: watch every zoom at full size, frame by frame if needed.
- [ ] No loading screens, spinners, auth prompts or blank flashes in the footage.
- [ ] Fonts are loaded on frame 0: no fallback-font frames.
- [ ] Nothing is time-dependent except `t`: re-render 5 random frames and diff them.
- [ ] Text is readable on a phone (body ≥ 36 px at 1080p) and stays inside the 90 % title-safe area.
- [ ] One accent colour, used with intent.

**Sound**
- [ ] Each voice line starts within 2 frames of its visual cue.
- [ ] UI foley lands on the click frame, not near it.
- [ ] The music never fights the voice (listen on laptop speakers *and* headphones).
- [ ] −14 LUFS integrated, ≤ −1 dBTP (check with a measurement pass on the final file).

**Truth**
- [ ] Every number has a source.
- [ ] Simulated or mocked parts are labelled (on screen or in the description).
- [ ] No private data in any frame (emails, keys, addresses that matter, personal names).

**Story**
- [ ] A stranger can say what the product does after one viewing.
- [ ] The hook works with the sound off.
- [ ] The tagline is the last thing heard *and* seen.

---

## 13. Publishing kit

- **Title:** a curiosity gap plus the product. Under 70 characters. *"This Receipt Is Fake. Here's How We Proved It."*
- **Thumbnail:** make three variants from the film's own frames and art: the hook image, the reveal, and the "made with code" angle. Use the largest readable text (≤ 4 words) and one accent colour, and test them at 160 px wide.
- **Description:** line 1 is the hook; then the links (product, code, proof); then chapters as timestamps (`0:00 Hook`, `0:13 The problem`, …), straight from `timeline.json`; then a "How this film was made" paragraph and the sources for every number.
- **Tags:** product category, the problem, the technology, plus the craft (motion design, code-rendered video, generative video, design engineering).
- **Formats:** 16:9 master, then 1:1 and 9:16 cuts for social. Re-frame them with the same camera system; don't just crop.

---

## 14. The master prompt

Copy this, fill in the brackets, and give it to an AI coding agent along with this file.

```text
You are a motion designer, film editor, sound designer and engineer in one.
Make a [LENGTH]-second cinematic product film for [PRODUCT]: [ONE-LINE DESCRIPTION].
Follow FRAMEWRIGHT.md exactly: its non-negotiables, six-act structure, motion
language, camera system and quality gate.

Brief:
- Audience and where it plays: [AUDIENCE / PLATFORM]
- The lie the hook breaks: [THE_LIE]
- The one truth to remember: [THE_TRUTH]
- The proof moment in the real footage: [PROOF]
- Three benefits: [B1], [B2], [B3]
- Tagline: [TAGLINE]
- Theme (material metaphor): [THEME]. Derive palette tokens, type, texture,
  signature mark, transition style and the score's instruments from it.
- Voice: [TTS VOICE or "human VO provided"], one voice, one speed.
- Must show, in order: [SCREENS / FLOWS]
- Must not show: [OFF-LIMITS]
- Product to record: [URL / APP / COMMAND]. Setup that happens off-camera: [SETUP].

Deliver, in this order, and show me each before moving on:
1. script.json, with words-per-second checked against the length.
2. timeline.json: scenes, voice placement, chapter cards.
3. A scripted, repeatable recording of the real product: frames + event log.
4. Stills at 6–8 key moments (render.mjs --at …) for review.
5. The full render, score and mix, the final MP4 at -14 LUFS, and SRT captions.
6. Title, description with chapters and sources, tags, three thumbnails.

Rules: every frame a pure function of t; real footage only; every number sourced;
anything simulated is labelled; open-source tools only; run the quality gate and
report each item as pass or fail with evidence before calling the film done.
```

---

*FRAMEWRIGHT was distilled from building the [STOCKBACK demo film](https://youtu.be/70fX_mN6MuE), a 2:30 code-rendered film: 4,500 frames, an original synthesized score, and a real recorded product session.*
