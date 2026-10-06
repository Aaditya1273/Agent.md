---
targetModels:
  - "Claude Opus 5.5"
  - "Claude Fable 5.1"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
name: hanami
category: Motion
description: HANAMI, the cherry-blossom product film — a 2–3 minute cinematic film for any product, made in code with a Japanese visual system, voice-first timing, hanko verdicts and real receipts as the climax.
license: MIT
author: Agent.md maintainers
last-verified: 2026-10-05
reviewed-by: unreviewed
---

# 花見 HANAMI

### The Hanami Method: cherry-blossom product films, rendered from code

> *Hanami* (花見) is the Japanese custom of gathering under cherry blossoms to watch them fall.
> A Hanami film works the same way: calm, bright and beautiful, until one moment of tension.
> Then the product blooms, and the viewer stays to watch.

This file is a complete, tool-agnostic playbook for a **2–3 minute cinematic product film**. It
covers the story, the cherry-blossom Japanese visual system, the motion grammar, the voice and score,
the proof shots and the quality loop. The films are made from **code and open-source tools only**.

Give this file to a person or an AI agent along with three inputs: a **product brief**, a **fact sheet**
and an **asset folder**. Follow it end to end and the result will reach the same level as the film it
was extracted from.

---

## Contents

1. [The five vows](#1-the-five-vows)
2. [Inputs you need](#2-inputs-you-need)
3. [The story: twelve beats](#3-the-story-twelve-beats)
4. [The pipeline: voice first](#4-the-pipeline-voice-first)
5. [The Sakura design system](#5-the-sakura-design-system)
6. [Motion grammar](#6-motion-grammar)
7. [The component kit](#7-the-component-kit)
8. [Scene recipes](#8-scene-recipes)
9. [The Japanese layer](#9-the-japanese-layer)
10. [Sound: voice, score and effects](#10-sound-voice-score-and-effects)
11. [Receipts: proof on screen](#11-receipts-proof-on-screen)
12. [The quality loop](#12-the-quality-loop)
13. [Render and delivery spec](#13-render-and-delivery-spec)
14. [The agent prompt](#14-the-agent-prompt)
15. [Final checklist](#15-final-checklist)

---

## 1. The five vows

These five rules apply to every frame. When a creative choice is unclear, the rules settle it.

| Vow | Japanese idea | Meaning in the film |
| --- | --- | --- |
| **Visuals over text** | 見せる *miseru*, "to show" | If a sentence can be a chart, a grid, a stamp or a live UI, it becomes one. On-screen text is at most 8 words. The voice carries the rest. |
| **Space is a material** | 間 *ma*, the meaningful pause | One idea per frame. Leave at least 35% of the canvas empty. Silence after a big line is planned, not left over. |
| **Warm imperfection** | 侘寂 *wabi-sabi* | Cream paper, faint grain, soft vignette, drifting light. Never pure white or flat black. |
| **Every motion means something** | 一期一会 *ichigo ichie*, each moment once | Nothing moves just to look busy. An element moves because the narration says something about it at that exact moment. |
| **Truth is the climax** | 誠 *makoto*, sincerity | The emotional peak is a **real receipt**: a live run, a real dashboard, a log line, a dated source. Illustrations are labelled as illustrations. Numbers are never invented. |

---

## 2. Inputs you need

Collect all three before writing anything.

**A. Product brief**, one paragraph each:
- the painful problem, stated as a *scene* ("It's Friday, 6 PM. The release just went out…"), not as a category;
- who gets hurt and how much;
- the product's single unfair insight, as one sentence a 12-year-old could repeat;
- the three or four product moments worth showing.

**B. Fact sheet.** Every number that will appear on screen or in the voiceover, each with:
- the value;
- the source (publication and date);
- whether it's **measured**, **reported** or **illustrative**.

**C. Asset folder:**
- logo mark (transparent PNG or WEBP) and wordmark font;
- one hero image (landscape, high resolution; a cherry-blossom scene fits this theme best);
- product UI facts: exact copy, colours, radii and real values to rebuild screens;
- **receipts**: screenshots of live proof (dashboards, logs, analytics, public status pages), captured at 1600×1000 CSS px with a headless browser.

> **Rule:** if a number isn't in the fact sheet, it doesn't go in the film.

---

## 3. The story: twelve beats

A Hanami film follows a fixed arc. The timings below are for a ~3:00 cut; scale them proportionally.

| # | Beat | Job | Length | Feeling |
| --- | --- | --- | --- | --- |
| 1 | **Hook** | Drop the viewer into one specific moment of the problem, then ask a question | 0:00–0:10 | Curiosity |
| 2 | **Scale** | One visual that makes the size of the problem undeniable (a grid, a counter, a map) | 0:10–0:20 | "Oh." |
| 3 | **Mechanism** | Show *how* the harm happens, step by step, on one chart | 0:20–0:40 | Unease |
| 4 | **It's real** | Dated, sourced evidence that this is happening right now | 0:40–0:58 | Urgency |
| 5 | **Bloom** (reveal) | Iris-open on the hero image; logo, promise, platform | 0:58–1:05 | Relief |
| 6 | **Walkthrough** | Two or three product moments in a rebuilt UI, with cursor and camera | 1:05–1:43 | Confidence |
| 7 | **The engine** | The thing underneath, shown as inputs → one answer | 1:43–1:56 | Respect |
| 8 | **The answer** | The product solving *exactly* the hook's scenario, live | 1:56–2:10 | Payoff |
| 9 | **The refusal** | The system saying **no** to something unsafe, with the reason on screen | 2:10–2:18 | Trust |
| 10 | **Edge case** | The subtle moment others miss (a reopen, a retry, a grace window) | 2:18–2:27 | Depth |
| 11 | **Receipts** | Real activity: a live dashboard, logs or results, with zoom and callouts | 2:27–2:36 | Belief |
| 12 | **Thesis and end card** | Why now and who needs it; one quotable line; logo and links | 2:36–3:00 | Memory |

**Writing the voiceover:**
- Lines are 6–20 words. Prefer short declaratives: "The build passes." "The customer leaves."
- Each scene gets one to four lines. The *first words* of a line are what trigger the visuals.
- Use spoken numbers: "thirty-two hours", "eleven oh seven Eastern".
- End the hook with a **question** and the film with an **inversion** ("A green checkmark is not a guarantee.").
- Read the script aloud once. Rewrite any line you stumble over.

---

## 4. The pipeline: voice first

The narration is the clock. Visuals never set the timing; they follow the voice.

```
script.json ──TTS──► audio/<line>.wav + timings.json ──► timeline (scene ranges, cues)
                                     │                              │
                                     └──► score.wav (built on the same timings)
                                                                    ▼
                                           React scenes ──► Remotion render ──► loudnorm ──► final.mp4
```

**Toolchain (all free or open source):**

| Job | Tool |
| --- | --- |
| Motion graphics and UI | [Remotion](https://www.remotion.dev) (React, 1920×1080 at 30 fps) |
| Voice | [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) via `kokoro-onnx`, run locally. Voice `af_heart`, speed 1.05–1.08. |
| Score and sound effects | NumPy synthesis (pads, plucks, bells, kicks, whoosh), no samples |
| Receipts | A Playwright headless browser at 1600×1000 |
| Mastering | `ffmpeg` two-pass `loudnorm` |

**`script.json`**: one entry per line, with the pause that follows it:

```json
[
  { "id": "hook1", "pause": 0.4, "text": "It's Friday, six PM. The release just went out." },
  { "id": "hook2", "pause": 0.4, "text": "Your dashboard is green. Your customers are not." }
]
```

**The TTS step** trims silence from each line and records how long the speech actually lasts:

```python
samples, sr = kokoro.create(line["text"], voice="af_heart", speed=1.08, lang="en-us")
idx = np.where(np.abs(samples) > 0.01)[0]
samples = samples[max(idx[0] - int(0.03 * sr), 0): idx[-1] + int(0.08 * sr)]
timings.append({"id": line["id"], "text": line["text"],
                "speech": len(samples) / sr, "total": len(samples) / sr + line["pause"]})
```

**The timeline** turns `timings.json` into scene ranges and **word-level cues**:

```ts
export const LEAD = Math.round(0.9 * FPS);   // visuals before the first word
export const TAIL = Math.round(3.2 * FPS);   // hold after the last word

/** Scene-relative frame at which `phrase` is spoken in `lineId`. */
export function cue(scene: SceneId, lineId: string, phrase?: string): number {
  const l = LINES.find((x) => x.id === lineId)!;
  const at = phrase ? (l.text.toLowerCase().indexOf(phrase.toLowerCase()) / l.text.length) * l.speech * FPS : 0;
  return Math.round(starts[lineId] + at - sceneRange(scene).from);
}
```

Each animation is pinned to a spoken word, for example `pop(f, cue("hook", "hook1", "closed"))`. If you
change the script, every animation re-times itself.

---

## 5. The Sakura design system

### Palette

| Token | Hex | Use |
| --- | --- | --- |
| `cream` (和紙 washi) | `#F7F3EC` | Canvas, the default background |
| `surface` | `#FFFCF8` | Cards and windows |
| `sunken` | `#EFE9DF` | Wells, inactive cells, input fields |
| `ink` (墨 sumi) | `#111111` | Headlines, dark pills |
| `muted` | `#716C67` | Labels, captions, sources |
| `pink` (桜 sakura) | `#F3A6B8` | Glows, gradients, petals |
| `pinkStrong` | `#E9829C` | Accents, highlighted words, the cursor ring |
| `pinkSoft` | `#FCE8ED` | Accent backgrounds, highlighted cells |
| `success` (抹茶 matcha) | `#668B72` / text `#4A6B55` / soft `#E8EFE8` | "Normal", "Open", passed checks |
| `danger` (朱 shu, vermilion) | `#C94C4C` / text `#A63A3A` / soft `#F8E6E2` | Risk, closed, refused, hanko seals |
| `line` | `rgba(17,17,17,0.08)` | Hairlines and card borders |

Red only ever means **risk**, and green only ever means **safe**. Pink is the brand colour, never a
warning. Every colour that carries meaning also gets an icon or a word, so it still reads in greyscale.

### Typography

| Role | Face | Spec |
| --- | --- | --- |
| Display and UI | **Inter** (variable) | Headlines 64–92 px at weight 700–800, tracking −0.035 em to −0.045 em |
| Emotional accent | **Dancing Script** | 84–120 px at 700, pink, used once or twice per film ("and actions.", the closing line) |
| Data and receipts | System mono (`ui-monospace, SF Mono, Menlo`) | 17–24 px; IDs, timestamps, sources in UPPER CASE |
| Kanji accents (optional) | **Shippori Mincho** or **Noto Serif JP** | 160–260 px chapter marks at 6–10% opacity; see §9 |

Use a scale of five sizes at most per scene. Emphasise with weight or colour, never with a new size.

### Surfaces

- **Paper:** cream base, two drifting radial gradients (pink and peach) that orbit slowly, a warm vignette and animated grain at 5% opacity.
- **Card:** `surface`, radius 24, a `line` border, shadow `0 16px 50px rgba(17,17,17,0.07)`.
- **App window:** 1600×920, centred, radius 30, deep soft shadow, an 80 px top bar copied from the real product.
- **Pill:** radius 999, 20 px semibold; tones are ink, pink, success, danger and plain.

### Layout

- Canvas 1920×1080, with 160–200 px side margins for the main content.
- Headlines sit at the top (y ≈ 80–120) or at the bottom third (y ≈ 760–860), never in the dead centre over content.
- Footer receipt band: mono, 17 px, `muted`, right-aligned at `bottom: 30`, e.g. `[PRODUCT] · LIVE DATA · RECORDED [DATE]`.

---

## 6. Motion grammar

### Curves

| Name | Definition | Use |
| --- | --- | --- |
| `EASE` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default for every entrance |
| `EASE_IN_OUT` | `cubic-bezier(0.65, 0, 0.35, 1)` | Camera moves, cursor paths, keyframed tracks |
| `pop` | spring, damping 14, stiffness 170, mass 0.7 | Stamps, pills, numbers: things that *land* |
| `smooth` | spring, damping 200 | Cards and windows: things that *arrive* |

### Signature moves

| Move | Recipe |
| --- | --- |
| **Word bloom** | Each word fades in from `opacity 0`, `translateY(0.45em)` and `blur(10px)` over 18 frames, staggered by 3 frames. The headline always enters this way. |
| **Hanko slam** | The stamp scales from 2.2 to 1 on `pop`, rotated −3° to −6°, with a 5 px vermilion border and letter-spacing 0.12 em. Used for verdicts like *FAILED*, *BLOCKED* or *SHIPPED*. |
| **Petal drift** | 18–30 procedural petals, each with a seeded size, speed, rotation and occasional blur. They drift diagonally and loop. |
| **Iris open** | `clip-path: circle()` grows from 0 to 1500 px in 26 frames to reveal the hero image, with a slow 1.12 → 1.02 zoom behind it. |
| **Screen-Studio camera** | Keyframes `{f, x, y, s}`, interpolated with `EASE_IN_OUT`. Zoom 1.0–1.6 onto the element being talked about, then ease back. |
| **Live line** | The chart path reveals point by point; a dot rides the tip; a gradient fill sits under it. |
| **Flip** | A state cell swaps its value on a `pop` scale of 0.7 → 1, plus a ring pulse around the row: `box-shadow 0 0 0 6px → 0`. |
| **Packet** | A signed-message card flies along a curve into its target, then fades out on impact. |
| **Count-up** | Numbers count with tabular figures over 30–50 frames, eased. |
| **Typed** | Prompts type at 22 characters per second with a pink caret. |
| **Grid sweep** | Cells appear in a diagonal wave (delay = (col + row) × 0.6 frames), then the meaningful cells fill in from left to right. |

### Timing rules

- An element starts **2–4 frames before** its word is spoken. This lead makes it feel in sync.
- Every scene fades in over 10 frames and out over 10 frames. There are no hard cuts, except a single deliberate one before the reveal.
- Hold the final state of each scene for at least 15 frames before it leaves.
- At most **two** moving focal points at once. If the camera moves, the content holds still.

---

## 7. The component kit

These are the core helpers. Everything else in a Hanami film is built from them.

```tsx
// ── motion ──
export const ez = (f: number, a: number, b: number, from = 0, to = 1, easing = EASE) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
export const pop = (f: number, delay: number, fps = 30) =>
  spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
export const smooth = (f: number, delay: number, fps = 30) =>
  spring({ frame: f - delay, fps, config: { damping: 200 } });

// ── word bloom ──
export const Words: React.FC<{ text: string; start: number; stagger?: number; accent?: string[]; accentStyle?: React.CSSProperties }> =
  ({ text, start, stagger = 3, accent = [], accentStyle }) => {
    const f = useCurrentFrame();
    return <span>{text.split(" ").map((w, i) => {
      const t = ez(f, start + i * stagger, start + i * stagger + 18);
      return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: t,
        transform: `translateY(${(1 - t) * 0.45}em)`, filter: `blur(${(1 - t) * 10}px)`,
        ...(accent.includes(w.replace(/[.,!?]/g, "")) ? accentStyle : null) }}>{w + " "}</span>;
    })}</span>;
  };

// ── paper (washi) ──
export const Paper: React.FC<{ children?: React.ReactNode; glow?: number }> = ({ children, glow = 1 }) => {
  const f = useCurrentFrame();
  const a = `rgba(243,166,184,${0.28 * glow})`, b = `rgba(255,214,190,${0.35 * glow})`;
  return <AbsoluteFill style={{ background: "#F7F3EC" }}>
    <AbsoluteFill style={{ background: `radial-gradient(900px 700px at ${30 + Math.sin(f / 90) * 8}% ${25 + Math.cos(f / 110) * 6}%, ${a}, transparent 70%),
      radial-gradient(1000px 800px at ${72 + Math.cos(f / 100) * 7}% ${78 + Math.sin(f / 120) * 6}%, ${b}, transparent 70%)` }} />
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(80,50,40,0.10) 100%)" }} />
    <Grain opacity={0.05} />   {/* feTurbulence noise, seed changes every 2 frames */}
  </AbsoluteFill>;
};

// ── petals (sakura) ──
export const Petals: React.FC<{ count?: number; seed?: string }> = ({ count = 26, seed = "p" }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{Array.from({ length: count }).map((_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`), s = 0.6 + r("s") * 1.2, z = 14 + r("z") * 26;
    const x = ((r("x") * 2320 + f * s * 1.6) % 2320) - 200, y = ((r("y") * 1380 + f * s * 1.1) % 1380) - 150 + Math.sin(f / 30 + i) * 20;
    return <svg key={i} width={z} height={z * 0.7} viewBox="0 0 20 14" style={{ position: "absolute", left: x, top: y,
      transform: `rotate(${f * (1 + r("r") * 2) + r("a") * 360}deg)`, filter: r("b") > 0.7 ? "blur(3px)" : undefined }}>
      <path d="M1 7 C 5 0, 15 0, 19 7 C 15 14, 5 14, 1 7 Z" fill={r("c") > 0.5 ? "#F3A6B8" : "#F7C1CD"} />
    </svg>;
  })}</AbsoluteFill>;
};

// ── camera ──
export const Camera: React.FC<{ keys: { f: number; x: number; y: number; s: number }[]; children: React.ReactNode }> = ({ keys, children }) => {
  const f = useCurrentFrame();
  const s = track(f, keys.map((k) => [k.f, k.s])), x = track(f, keys.map((k) => [k.f, k.x])), y = track(f, keys.map((k) => [k.f, k.y]));
  return <AbsoluteFill style={{ overflow: "hidden" }}><div style={{ position: "absolute", width: 1920, height: 1080, transformOrigin: "0 0",
    transform: `translate(${960 - x * s}px, ${540 - y * s}px) scale(${s})` }}>{children}</div></AbsoluteFill>;
};
```

Also build these: `Card`, `Pill`, `Icon` (24 px line icons), `Check` (a stroke that draws in), `Cursor`
(keyframed, with a click ring), `Typed`, `Counter`, `Stamp` (hanko), `Live` (pulsing dot), `AppWindow`,
`SceneFade` and `SourceTag` (the footer receipt band).

---

## 8. Scene recipes

Each recipe gives the **visual**, the **motion** and the **cue words**. Replace the bracketed content with your own.

### Beat 1: Hook, "the specific moment"
- **Visual:** a 7-day strip across the top with the current day highlighted in pink. Below it, two cards side by side: *[the thing that stopped]* with a **STOPPED** hanko stamped over its icon, and *[the thing still running]* with a live sparkline, a ticking counter and a gradient "24/7".
- **Motion:** the day pills pop in a cascade; the stamp slams on "*closed*"; the live card rises on line 2. On the question line, both cards shrink to 0.88 and lift, and the question blooms in at y ≈ 830.
- **Cue words:** the noun that names the problem; the word "*isn't*"; the question.

### Beat 2: Scale, "the grid of truth"
- **Visual:** a 7 × 24 grid of rounded cells (52 px, gap 6) with day labels on the left and hours along the bottom. *[Good cells]* fill pink; at the turn, every other cell tints vermilion.
- **Numbers:** three big figures underneath, counting up: *[good amount]* in pink, *[total]* in ink, and *[bad share %]* landing in vermilion on a `pop`.
- **Footer:** a mono source line.

### Beat 3: Mechanism, "one chart, one crime"
- **Visual:** a full-width chart with dashed time markers. Two lines:
  - *reality*: an ink line drawn live, with a sharp event drop;
  - *the system's belief*: a dashed pink line, frozen.
- **Annotations:** shade the gap between the lines in vermilion at 16% and label it with *[the size of the gap]*. An ink event pill marks the moment ("⚡ *[time]* · *[what happened]*").
- **The steps:** a row of 3–4 step cards (*[cause → spread → missed → damage]*) with arrows, each popping on its spoken verb.
- **Verdict:** a full-width hanko stamp naming the cost, e.g. **[WHO] LOSES [MEASURED AMOUNT]**.
- **Label:** "illustration" in the eyebrow.

### Beat 4: It's real, "evidence cards"
- **Visual:** the headline "This isn't hypothetical." with the word *isn't* in pink. An evidence card with a "LIVE IN PRODUCTION · since [date]" badge holds 4–5 label/value rows. Values that are risky get vermilion "OPEN" pills.
- **Second incident:** a second card slides in, with a big count-up figure and a typed mono prompt (`> one hidden prompt…`).
- **Sources:** each card ends with a mono source line.

### Beat 5: Bloom, the reveal
- **Visual:** the iris opens on the hero image; cream fog in the centre; 30 petals; the logo pops; the promise blooms in.
- **Script-font accent:** the last two words in Dancing Script, pink.
- **Platform pills:** "Built on [platform]" pills fade in last.
- This is the one beat with no UI and no data: pure brand.

### Beat 6: Walkthrough, "real UI, rebuilt"
- **Visual:** rebuild the real product screens in React with the exact copy and values from the product. The cursor travels on eased keyframes and clicks with a pink ring. The camera zooms to 1.1–1.4 on the element being named.
- **Check rows:** spinner → "Checking" → animated check → "Passed", each timed to its spoken check.
- Tag every frame with the honest footer band.

### Beat 7: The engine, "many inputs, one answer"
- **Visual:** the input chips (one per signal) light up as each is named, flow into a dark engine block, and resolve into one big answer card ("Is it safe? **Yes / No**").

### Beat 8: The answer, "the hook, solved"
- **Visual:** the product's real status screen. A clock pill ticks to the critical time. A signal *packet* flies in, a banner drops, and every affected row flips one by one, 7 frames apart (green "Normal" → vermilion "*[Stopped]*").
- **Columns:** as the narration names each consequence, its column gets a highlight box. The one thing that stays allowed (e.g. "*[safe action]*: Allowed") is highlighted in matcha green.

### Beat 9: The refusal, "no, and here's why"
- **Visual:** a chat window. The user's request types out; an agent card runs its checks (a policy check passes, a risk check fails); then a vermilion "Not executed." box quotes the system's real refusal text.
- **The closing contrast:** a ~~"a prompt"~~ pill, crossed out, next to an ink chip in mono: `Policy · risk ≠ NORMAL → revert REASON_CODE`.

### Beat 10: Edge case, "the subtle moment"
- **Visual:** a horizontal timeline of segments: Closed (vermilion) → Grace (pink) → Normal (matcha). A playhead moves across it with a state pill riding on top.
- **Caption:** "*[One sentence on why the edge case is handled]*." Add a mono line saying **"NOT TO SCALE"** when it isn't to scale.

### Beat 11: Receipts, "the real thing"
1. **The headline card:** a "LIVE" pill and the date and time. One row per event, `STATE → STATE` with the time and a short ID, flipping in sequence.
2. **The detail page:** a browser frame (traffic lights, a URL bar with the full real URL) around the real screenshot. Camera keys zoom onto the three fields that prove the claim (who or what acted, when, the result). Pink callout rings with ink label pills: "*[Actor]*", "*[System · runtime]*", "Success · *[time]*".
3. **The stream:** the full activity list, scrolling slowly, with a pill like "*[Event]* every *[interval]* · *[where it can be checked]*".

### Beat 12: Thesis and end card
- **Thesis:** a wall of *[the many inputs or users]* funnels into a single pink gradient bar labelled "[Product]", with *[the audiences it serves]* connected above it by dashed lines.
- **Close:** a 92 px ink inversion line, then the promise in pink script on two lines.
- **End card:** the hero image at 35% under cream fog, petals, the logo, "Live at [URL or platform]", URL pills and any credit. Fade out over 24 frames.

---

## 9. The Japanese layer

These are optional touches that make the theme unmistakable. Use **three or four**, not all of them.

| Element | How |
| --- | --- |
| **Chapter kanji** | A huge, faint kanji (6–10% ink opacity, 220 px, Shippori Mincho) bottom-left of the first frame of each act: 問 *problem* · 証 *evidence* · 咲 *bloom* · 解 *solution* · 誠 *proof*. It fades in over 20 frames and sits still. |
| **Hanko verdicts** | Every final verdict is a vermilion seal-style stamp (§6). It may carry a small kanji tag such as 否 (*no*) or 済 (*done*) in a square seal next to the English. |
| **Sakura weather** | Petals in the reveal, the end card and calm transitions only. **Never** during the problem beats: the problem is winter, the product is spring. |
| **Ma pauses** | Put a 0.6–0.8 s pause after each act's final line. The music breathes and the frame holds. |
| **Washi texture** | Paper grain plus a faint warm vignette on every scene. No pure white anywhere. |
| **Enso ring** | Draw the "engine" or the "answer" inside an ink brush circle (an SVG stroke with a tapered `strokeDasharray` drawn over 30 frames). |
| **Seasonal colour arc** | The problem beats lean grey-cream with vermilion. From the reveal onward, pink and matcha warm the palette. |
| **Vertical eyebrow** | Section eyebrows can be set vertically (`writing-mode: vertical-rl`) on the left edge for chapter openers. |

> Use Japanese characters only with their correct meaning. Every kanji in the film must be checked, and must be decorative, never essential to understanding.

---

## 10. Sound: voice, score and effects

**Voice.** Kokoro `af_heart` at speed 1.05–1.08: warm, clear and unhurried. Generate one WAV per line
so the timing stays exact. Re-generate rather than edit audio.

**Score.** Synthesise it in sections that follow the beats, using the same timings file:

| Section | Recipe |
| --- | --- |
| Problem (beats 1–4) | Low drone (D2/A2/D3 pad, dark low-pass), a heartbeat kick pair every 0.95 s, a noise swell into the reveal |
| Reveal | Soft impact, then a bright Dmaj9 pad and a 6-note bell arpeggio rising (the bloom) |
| Product (beats 6–7) | Dmaj7 → Bm7 → Gmaj7 → A(add9), 2.4 s bars, a soft pluck arpeggio in eighths, a light kick every other bar |
| Tension (beats 8–9) | A Bm pad, an impact on the key word ("*flips*"), a steady kick every 0.8 s |
| Lift (beats 10–12) | The product progression an octave up, a kick on every half bar, a swell into the close |
| Close and end | A wide Dmaj9 pad, four falling bells, a final soft impact, a 2.5 s fade |

All of it gets a 3 s reverb at 0.35 mix, a normalised peak and a 0.4 s fade-in.

**Mix:**
- **Music ducking:** volume 0.15 while the voice speaks (4 frames lead, 6 frames tail), 0.30 otherwise.
- **Whoosh** (filtered noise, 0.9 s) 8 frames before every scene change, at 0.16.
- **Impacts** on two or three key words in the whole film.

---

## 11. Receipts: proof on screen

The receipt is the climax, so capture it properly.

1. Find the real event: the exact log line, run, record or dashboard moment where the state changed.
2. Capture the page with a headless browser at **1600×1000 CSS px**, device scale 1, with the page fully loaded.
3. Capture **two** views:
   - the single event's detail view (status, actor, time, result);
   - the list or history view (proves the activity is continuous, not staged).
4. Place the screenshot at scale 0.9 inside a browser frame. Map each callout target from screenshot coordinates: `X = 240 + x × 0.9`, `Y = 140 + y × 0.9`.
5. Say the **time in the viewer's terms** (e.g. "11:07 AM ET") and put the same time in the callout label. If the page shows another timezone, the callout carries the conversion.

**Honesty rules (non-negotiable):**
- Illustrations carry the word **"illustration"** on screen.
- Every external number shows a mono source line on screen.
- Demo environments and sample data are labelled on every frame that shows them.
- Never claim "production-ready", "audited" or "verified" unless it is, and say which.

---

## 12. The quality loop

Never render the full film blind.

1. **Typecheck** the project.
2. **Stills pass:** render ~20 frames at 0.5 scale, at the key moment of each beat (the cue frame plus 30).
3. Tile them 2×2 into contact sheets and **look at every one** for:
   - overlaps (text on charts, labels on lines);
   - crops (the camera cutting off the left column or the top bar);
   - wrapped one-liners (fix with `whiteSpace: nowrap` or shorter copy);
   - more than eight words of text on screen;
   - red or green used for anything other than risk or safety.
4. Fix, then re-render only the affected stills.
5. Check the runtime: the voice total plus 4 s should be ≤ 3:00. If it runs over, cut words first and beats second; never speed the voice past 1.10.
6. Run the full render, then the audio master, then watch the whole thing once at 1× with sound.

---

## 13. Render and delivery spec

| Property | Value |
| --- | --- |
| Resolution and frame rate | 1920×1080, 30 fps |
| Codec | H.264, `-movflags +faststart` |
| Audio | AAC 256 kbps, 48 kHz |
| Loudness | **−14 LUFS integrated, −1 dBTP true peak** (two-pass `loudnorm`, linear) |
| Length | 2:00–3:00 |
| Thumbnail | The beat-3 hanko frame or the beat-11 receipt callout frame |

**Master command:**

```bash
F=$(ffmpeg -nostats -i film.mp4 -af loudnorm=I=-14:TP=-1:LRA=7:print_format=json -f null - 2>&1 \
  | sed -n '/{/,/}/p' | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"loudnorm=I=-14:TP=-1:LRA=7:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true\")")
ffmpeg -y -i film.mp4 -c:v copy -af "$F" -ar 48000 -c:a aac -b:a 256k -movflags +faststart film-final.mp4
```

---

## 14. The agent prompt

Paste this, with this file and your three inputs, to an AI coding agent:

```text
You are directing a Hanami film (HANAMI.md attached). Follow it exactly.

Product brief: <paste>
Fact sheet (value · source · measured/reported/illustrative): <paste>
Assets: <paths: logo, hero image, UI facts, receipt URLs>

Steps:
1. Write script.json across the twelve beats (§3). Total speech ≤ 2:55. Show me the script and wait for my OK.
2. Generate the voice (§4) and print per-line durations and the total.
3. Build the Sakura design system and the component kit (§5–§7). Use three or four Japanese-layer elements (§9).
4. Build every scene from the recipes (§8), pinning every animation to a cue word.
5. Capture the receipts with a headless browser (§11).
6. Run the quality loop (§12) and show me the contact sheets before the full render.
7. Render, master to −14 LUFS (§13), and report: runtime, loudness, and every on-screen number with its source.
Never invent a number. Label illustrations. Label demo or sample data.
```

---

## 15. Final checklist

**Story**
- [ ] The hook is a specific moment and ends with a question.
- [ ] The problem is *shown* (grid, chart), not described.
- [ ] One beat proves the problem is real today, with a dated source.
- [ ] The product solves the **exact** hook scenario on screen.
- [ ] The system refuses something unsafe, with the reason visible.
- [ ] One edge case shows depth.
- [ ] A real receipt (live run, log or dashboard) is the emotional peak.
- [ ] The film closes with a quotable inversion line.

**Design**
- [ ] Cream paper, grain and vignette on every scene; no pure white or black.
- [ ] Pink is the brand; vermilion is risk only; matcha is safe only.
- [ ] Headlines ≤ 8 words, entering by word bloom.
- [ ] Petals only in calm beats.
- [ ] Every Japanese element is used correctly and is decorative only.

**Motion**
- [ ] Every movement is pinned to a spoken word (2–4 frame lead).
- [ ] At most two moving focal points at once.
- [ ] 10-frame scene fades; ≥ 15-frame holds.

**Truth**
- [ ] Every number is on the fact sheet with a source.
- [ ] Illustrations, demo environments and sample data are labelled on screen.

**Delivery**
- [ ] Contact sheets reviewed: no overlaps, crops or wraps.
- [ ] −14 LUFS / −1 dBTP, 1080p30, faststart, ≤ 3:00.

---

*Hanami: let the problem feel like winter, let the product arrive like spring, and let the receipts prove it really bloomed.* 🌸

## Verify the render with numbers

Before you call the film done, measure it. Run:

```bash
npx activate-agentmd motion check out/film.mp4 --preset hanami
```

It checks this style's delivery targets (−14 LUFS, true peak ≤ −1 dBTP, 30 fps) and the gates every Motion film shares: the render decodes and moves (G0), no empty frames mid-film (G1), a short end hold (G2), the final shot's share of the film (G3), and loudness (G4). It exits 1 on a failure, so it can gate a CI job. Passing is a floor, not taste: judge proof readability and one hero per frame by eye on a contact sheet. The timing and anti-slop rules behind these gates are in the `motion-craft` standard.
