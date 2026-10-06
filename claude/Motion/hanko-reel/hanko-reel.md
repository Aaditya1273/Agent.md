---
targetModels:
  - "Claude Opus 5.5"
  - "Claude Fable 5.1"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
name: hanko-reel
category: Motion
description: HANKO REEL, the ink-and-seal film — cream paper, sumi ink and one vermilion seal; hand-pressed seals, kanji triad, ink transitions, koto and taiko score, a real product take, every frame a function of time.
license: MIT
author: Agent.md maintainers
last-verified: 2026-10-05
reviewed-by: unreviewed
---

# HANKO REEL

**The ink-and-seal film system.** *Cream paper. Sumi ink. One vermilion seal.*

HANKO REEL describes one exact visual language and how to rebuild it for any product. It covers the colours, fonts, seals, kanji, ink transitions, motion recipes, camera, cursor, Japanese-scale score and render pipeline of a 2:30 code-rendered product film. In Japan a *hanko* (判子) seal **is** a signature: pressing it means "this is real, I stand behind it". Every film in this style is built around that single act: something is unverified, the seal comes down, and now it is true.

There is no After Effects and no stock music. The film is HTML, JS and Python, rendered frame by frame in headless Chromium and finished with ffmpeg. It works for any product: an app, a tool, a device, a service, a study.

**Reference cut:** [the original film](https://youtu.be/70fX_mN6MuE).

**How to use it:** fill in [§1](#1-the-brief), then give [§15](#15-the-master-prompt) plus this file to an AI coding agent. Or build it yourself in section order.

---

## Contents

0. [The five laws](#0-the-five-laws)
1. [The brief](#1-the-brief)
2. [The palette](#2-the-palette)
3. [Type](#3-type)
4. [Paper, grain and light](#4-paper-grain-and-light)
5. [The seals](#5-the-seals)
6. [The kanji triad](#6-the-kanji-triad)
7. [Motion grammar](#7-motion-grammar)
8. [The seven scenes, beat by beat](#8-the-seven-scenes-beat-by-beat)
9. [Ink transitions](#9-ink-transitions)
10. [The product take: camera and cursor](#10-the-product-take-camera-and-cursor)
11. [The score: koto, taiko, bell](#11-the-score-koto-taiko-bell)
12. [Voice](#12-voice)
13. [Render and finish](#13-render-and-finish)
14. [Quality gate](#14-quality-gate)
15. [The master prompt](#15-the-master-prompt)

---

## 0. The five laws

1. **Vermilion is the seal and nothing else.** 朱 *shu* marks what is true, verified, or the one thing to look at: the seal, a circled number, a check, the cursor's ripple, the last word of the tagline. If it isn't being sealed, it isn't red.
2. **Ink is paper's opposite, not a background.** Black scenes are *darkness*: the problem, the lie, the old world. The film moves from cream → ink (problem) → cream (the seal) and ends on cream. Paper means truth.
3. **Everything is pressed, poured or brushed.** Nothing simply fades in. Seals slam, ink floods, brushes wipe, text is revealed like a stroke. Each entrance has a physical cause.
4. **Every frame is a pure function of time.** `render(t)` alone sets the picture: no `Date.now()`, no `Math.random()` (use the seeded `rnd`), no CSS animations or transitions. Frames render in any order, in parallel, identically.
5. **Real product, true numbers.** The product scene is a real recording. Every number on screen has a source footnote. Simulated parts are labelled in the outro.

---

## 1. The brief

```yaml
product:          # name + one line
the_artifact:     # the physical-feeling object the hook shows: a receipt, ticket, certificate,
                  #   report, ID card, invoice, photo, label. It gets printed, faked, sealed.
the_lie:          # how the artifact is faked or broken today (one visual act: a digit changes)
the_number:       # one sourced statistic that makes the lie measurable
the_second_pain:  # a second, human-scale pain (forgotten, expired, wasted, lost)
the_seal:         # what your product does that "seals" it: verify, sign, certify, protect, prove
three_verbs:      # your 3-step tagline, e.g. "Scan. Prove. Own." → one kanji each (§6)
depth_fact:       # one measured technical/business fact, shown as a race (old vs new)
tamper_demo:      # what failure looks like when someone cheats (the seal breaks)
two_winners:      # two audiences + 3 short benefits each (e.g. Users | Teams)
wordmark:         # product name in caps, letter-spaced
url:              # where to try it
disclaimer:       # one honest line: what is demo, simulated or mocked
```

---

## 2. The palette

Nine tokens. Never pure white, never pure black.

| Token | Hex | Name | Use |
|---|---|---|---|
| `--washi` | `#f4efe3` | washi paper | Main background; text on ink |
| `--washi2` | `#ebe3d2` | aged washi | Gradient edge, browser chrome |
| `--sumi` | `#171717` | sumi ink | Text, rules, cursor, the "old" thing |
| `--char` | `#3a3632` | charcoal | Secondary text |
| `--stone` | `#8a8378` | stone | Footnotes, sources, disclaimers, "forgotten" outlines |
| `--shu` | `#c83a2f` | 朱 vermilion | The seal: verified, emphasis, signature mark |
| `--shu2` | `#8f211d` | deep vermilion | Alerts, "edited", "invalid", tampered numbers |
| `--ai` | `#2f6f9f` | 藍 indigo | The competitor/old way in comparisons; glitch split |
| darkroom | `#0d0d0d` | night ink | Ink floods, black scenes, final fade |

Supporting tints: artifact paper `#fbf8f1` (slightly brighter than washi so the object lifts off the page), sakura `#e58a80` (falling petals, outro only).

```css
:root{
  --washi:#f4efe3; --washi2:#ebe3d2; --sumi:#171717; --char:#3a3632; --stone:#8a8378;
  --shu:#c83a2f; --shu2:#8f211d; --ai:#2f6f9f;
  --d:"Shippori Mincho",serif; --s:"Instrument Sans",system-ui,sans-serif; --m:"IBM Plex Mono",monospace;
}
```

**Ratio on screen:** about 80 % washi, 15 % sumi, 5 % shu. If red covers more than a twentieth of a frame, it stops meaning anything.

---

## 3. Type

| Role | Font | Weight | Treatment |
|---|---|---|---|
| Display (headlines, numbers, wordmark, kanji) | **Shippori Mincho** | 800 (700 for wordmark) | `letter-spacing:-.015em; line-height:.95`. Wordmark: caps, `.2em` tracking |
| Body, captions, UI labels | **Instrument Sans** | 400 / 500 / 600 | Plain, never bold-heavy |
| Data, sources, labels, artifact text | **IBM Plex Mono** | 400 / 500 | Labels in caps with `.12–.14em` tracking, coloured `--shu2` |

Load with `&display=block` and never capture a frame before `document.fonts.ready`. A fallback-font frame ruins the look.

```html
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
```

**Sizes at 1920×1080:** hero number 300 px · kanji 260 px · section numbers 160–210 px · headline 64–96 px · wordmark 92–110 px · body 30–40 px · mono labels 22–26 px · footnotes 17–18 px (stone).

Mincho at 800 has thick verticals and hairline horizontals, like a brush, so it carries the theme even in plain English.

---

## 4. Paper, grain and light

Three global layers sit above every scene:

```css
#grain{position:absolute;inset:-200px;pointer-events:none;mix-blend-mode:multiply;opacity:.38;z-index:90;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .6 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>")}
#vignette{position:absolute;inset:0;pointer-events:none;z-index:89;
  background:radial-gradient(ellipse at center,transparent 55%,rgba(40,30,20,.16) 100%)}
#black{position:absolute;inset:0;background:#0d0d0d;z-index:95;opacity:0}
```

- **Living grain.** The noise tile jumps 12 times a second, deterministically: `translate(rnd(floor(t*12),1)*120-60px, rnd(floor(t*12),2)*120-60px)`. The paper feels alive and compression banding disappears.
- **Warm vignette.** Brown, not black, so the edges age like old paper.
- **Artifacts float.** Paper objects use a long, soft, low shadow: `0 60px 90px -50px rgba(23,23,23,.55)`. A receipt-style object gets a torn edge: `radial-gradient(circle at 7px 0, transparent 6px, #fbf8f1 6.5px) 0 0/14px 12px`.
- **Product backdrop:** `radial-gradient(ellipse at 50% 40%, #f7f2e7 0%, #ebe3d2 100%)`, like a lit desk.

---

## 5. The seals

Two seals, both drawn in SVG with **turbulence displacement plus ink-dropout masking**, so they look pressed by hand, not rendered.

### 丸印 *maru-in*: the round brand seal

A vermilion disc with your initial knocked out in paper colour. It is the logo, the "verified" moment and the outro.

```js
function sealSVG(size, { paper = "#f4efe3", rough = true, id = "s" } = {}) {
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="overflow:visible">
  <defs><filter id="${id}f" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="3" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="e"/>
    <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="9" result="f"/>
    <feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -18 13.1" result="m"/>
    <feComposite in="e" in2="m" operator="in"/></filter></defs>
  <g ${rough ? `filter="url(#${id}f)"` : ""}>
    <path d="M32 3.5c15.9 0 28.6 12.6 28.4 28.6-.2 15.7-12.8 28.3-28.6 28.4C16.1 60.6 3.4 47.9 3.5 32 3.6 16.2 16.2 3.4 32 3.5z" fill="#c83a2f"/>
    <!-- YOUR INITIAL: one brush-weight stroke path in paper colour, stroke-width ≈ 4.2 -->
    <path d="M42 21.5c-2.6-2.4-6-3.6-9.6-3.6-5.6 0-9.4 2.9-9.4 7.1 0 9.2 19.3 5.5 19.3 14.6 0 4.5-4.2 7.6-10.1 7.6-4 0-7.8-1.4-10.6-4.1"
          fill="none" stroke="${paper}" stroke-width="4.2" stroke-linecap="round"/>
  </g></svg>`;
}
```

How the filter works: the first turbulence (low frequency) **wobbles the edge** like ink spreading into fibre; the second (high frequency) passes through a steep alpha matrix (`-18 … 13.1`) to punch **tiny dropouts** where the paper didn't take ink. Give every instance a unique `id`.

### 角印 *kakuin*: the square stamp

A double-ruled square with 印 ("seal") in the centre. It stands for *someone else's* signature: the issuer, a partner, an authority. It gets stamped onto the artifact.

```js
function kakuinSVG(size, id = "k") {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="overflow:visible"><defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="5" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" result="e"/>
    <feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" seed="11" result="f"/><feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -15 10.9" result="m"/>
    <feComposite in="e" in2="m" operator="in"/></filter></defs>
    <g filter="url(#${id})" fill="none" stroke="#c83a2f"><rect x="6" y="6" width="88" height="88" rx="6" stroke-width="6"/><rect x="15" y="15" width="70" height="70" rx="2" stroke-width="1.6"/>
    <text x="50" y="53" text-anchor="middle" dominant-baseline="central" font-family="Shippori Mincho" font-weight="800" font-size="54" fill="#c83a2f" stroke="none">印</text></g></svg>`;
}
```

### The stamp, as motion

Every seal lands the same way. This is the signature move of the style:

```js
const slam = P(t, T - 0.25, T);                          // 0.22–0.25 s fall
const [sx, sy] = shake(t, T, 26, 0.55);                  // impact shake, decays as d²
el.style.transform =
  `translate(${sx}px,${sy}px) scale(${lerp(4, 1, E.in3(slam))}) rotate(${lerp(-24, -6, E.out3(slam))}deg)`;
// + vermilion splatter bursting from the impact point (§7), + taiko + stamp sound on frame T
```

- **Fall:** scale from 2.2–4× down to 1 with `in3` (accelerating, like a hand pressing down).
- **Rotation settles** from about −24° to −6° to −8°. A seal is never perfectly straight.
- **Shake amplitude:** 26 px for the hero seal, 12–14 px for small stamps.
- **Never bounce.** No `outBack` on a seal: ink doesn't rebound.

---

## 6. The kanji triad

Your three-verb tagline gets one kanji each, revealed like a brush stroke from top to bottom, with the English beneath. In the reference film it was 読 証 有: *read · prove · own* → "Scan. Prove. Own."

| Kanji | Reading | Meaning | Fits verbs like |
|---|---|---|---|
| 読 | yomu | read | scan, read, capture |
| 見 | miru | see | see, watch, discover |
| 証 | shō | proof, evidence | prove, verify, certify |
| 真 | shin | true, genuine | verify, trust |
| 信 | shin | trust, faith | trust, rely |
| 守 | mamoru | protect | protect, secure, guard |
| 有 | yū | possess, exist | own, keep, hold |
| 作 | tsukuru | make | make, build |
| 創 | sō | create, originate | create, launch, design |
| 結 | musubu | bind, tie | connect, join, sign |
| 繋 | tsunagu | connect | link, connect |
| 届 | todoku | deliver, reach | send, deliver, ship |
| 速 | haya | fast | speed up, accelerate |
| 学 | manabu | learn | learn, study |
| 光 | hikari | light | shine, reveal, illuminate |
| 始 | hajime | begin | start, begin |
| 偽 | nise | fake, false | (the lie: the back of the coin in §8) |

Check any new kanji with a native reader before release. One wrong character is worse than none.

```js
// 260 px Mincho 800 in --shu, English 76 px Mincho 800 in --sumi, 210 px gap
kanji.forEach((el, i) => {
  const u = A(t, T0 + i * 0.35, T0 + 0.8 + i * 0.35, E.out3);        // brush stroke, top → bottom
  const e = A(t, T0 + 2.0 + i * 0.3, T0 + 2.6 + i * 0.3, E.out3);    // English follows
  el.firstElementChild.style.clipPath = `inset(0 0 ${(1 - u) * 100}% 0)`;
  el.lastElementChild.style.opacity = e;
});
// each kanji lands with a downward whoosh + a soft taiko 0.5 s later
```

---

## 7. Motion grammar

### Primitives

```js
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const E = {
  in3:   u => u ** 3,                                        // seals falling, ink pouring
  out3:  u => 1 - (1 - u) ** 3,                              // default entrance
  out5:  u => 1 - (1 - u) ** 5,                              // text rising, letters, rows
  inOut: u => u < .5 ? 4*u*u*u : 1 - (-2*u + 2) ** 3 / 2,    // moves, wipes, brush strokes
  outExpo: u => u >= 1 ? 1 : 1 - 2 ** (-10 * u),             // ink/paper opening outward
  outBack: u => { const c = 1.70158; return 1 + (c+1)*(u-1)**3 + c*(u-1)**2; }, // cards, coins (never seals)
};
const A = (t, a, b, ease = E.out3) => ease(P(t, a, b));
const env = (t, a, b, fi = .4, fo = .4) => Math.min(A(t, a, a + fi), 1 - A(t, b - fo, b));
let seed = 7;
const rnd = (i, k = 0) => { const x = Math.sin(i*127.1 + k*311.7 + seed) * 43758.5453; return x - Math.floor(x); };
const shake = (t, t0, amp = 16, dur = 0.45) => {
  if (t < t0 || t > t0 + dur) return [0, 0];
  const d = 1 - (t - t0) / dur;
  return [Math.sin(t * 91) * amp * d * d, Math.cos(t * 77) * amp * d * d];
};
```

### The vocabulary

| Move | Recipe |
|---|---|
| **Text rises** | `translateY((1-u)*20–40px)`, `out5`, 0.5–0.8 s |
| **Wordmark assembles** | letters stagger 0.045–0.05 s, rise 36–40 px, tracking tightens **0.6em → 0.2em** |
| **Line-by-line print** | each line `clipPath: inset(-60px X% -60px -60px)` with X going 100 → 0, 0.13 s stagger, a tick sound per line. **Set `clipPath: none` once done**, or circles drawn over the line get cut off |
| **Brush circle** | hand-drawn ellipse path, `pathLength="1" stroke-dasharray="1"`, `strokeDashoffset: 1 - A(t, a, a+.6, inOut)`, `--shu`, width 6, round caps; the path starts and ends slightly apart, like a pen lifting |
| **Brush arrow** | same draw-on technique for a curved shaft, then the head 0.25 s later |
| **Count-up** | number counts with `out5` over 3–3.5 s with a tick per step, in the 300 px Mincho, `--shu` |
| **Stamp word** | `EXPIRED` / `VOID` / `INVALID`: 10 px vermilion border, rounded 14 px, Mincho 800 caps, rotated −14°, scale 2.6 → 1 with `in3` in 0.22 s, plus a 14 px shake |
| **Splatter** | 26–60 vermilion dots/ellipses at seeded angles and radii (`r = lerp(r0, r1, rnd^0.7)`), flying out from the impact with `out5` in 0.45–0.5 s, then fading over 1.0–1.4 s |
| **Check stamp** | vermilion disc with a paper-coloured tick, scale 2 → 1 in 0.18 s, rotate −8° |
| **Glitch (the lie)** | 0.55 s: the digit alternates between broken glyphs at 30 fps, colour → `--shu2`, RGB split `±7px` vermilion / indigo `text-shadow`, `skewX(±6deg)`, a seeded jitter per frame |
| **Slow life** | in long holds, drift 1–2 % scale or rotate a coin `12*sin(t*1.3)` on X. Nothing is ever perfectly still except after the key line |

### Timing

Text entrance 0.5–0.8 s · stagger 0.05–0.15 s · stamp fall 0.22–0.25 s · impact shake 0.35–0.55 s · ink/paper opening 0.85–1.15 s · brush wipe 1.1 s · scene overlap 0.4–1.2 s · hold after a key line ≥ 1 s.

---

## 8. The seven scenes, beat by beat

Times are for a 150 s cut. Scale proportionally for 60 s or 90 s.

### 一 Hook (0–13 s): *the lie*

1. **Ink drop** (0.25–0.75 s): a vermilion teardrop (24×30 px) falls into the centre with `in3`, stretching `scaleY(1 + 0.5u)`.
2. **The page opens** (0.75–1.9 s): on impact the night-ink screen opens from the drop point. A radial mask `radial-gradient(circle at 960px 540px, transparent R, black R+2px)` grows R with `outExpo` while 26 vermilion splat dots burst out and fade. *Sound:* small bell → big taiko → falling whoosh.
3. **The artifact prints** (1.35–2.2 s): it rises 90 px and un-rotates from −4°, with its lines revealing one by one, one tick each.
4. **The lie** (4.4–4.95 s): the key number glitches and settles at a different value, now in `--shu2`. *Sound:* digital glitch.
5. **The circle** (5.0–5.6 s): a vermilion brush circle draws around it. A mono annotation in `--shu2` appears beside it: *"edited in < 1 s / for a few cents"*.
6. **Which one is real?** (9.0–10.5 s): the artifact splits into two identical copies (scale 0.74), the headline *"Which one is real?"* rises, and A and B appear in thin sumi circles. *Sound:* heartbeat under it (9.6, 10.45, 11.3, 12.1 s).
7. **Brush wipe** (12.3–13.4 s) into the problem.

### 二 Problem (13–36 s): *measure it*

1. **The coin** (13.2–21 s): a 400 px coin, 真 (true) on a vermilion face, 偽 (false) on a sumi face, spins in 3D (`rotateY`, 720°/s, hopping `|sin|·70px`) and lands with `outBack` at 20.6–21.0 s with a bright bell. Beside it **the number counts up** in 300 px vermilion Mincho.
2. **The bar race** (21.7–25.4 s): horizontal vermilion bars grow (`out5`, 0.25 s stagger) toward a **dashed sumi "chance" line**, with mono values counting. Use it for any comparison against a baseline.
3. **The second pain** (25.4–34 s): 15 sumi cards drop in with `outBack` (0.07 s stagger, random tilt). The unused ones fade to **stone dashed outlines**. A big Mincho stat appears beside them.
4. **The stamp** (30.4 s): `EXPIRED` (or your word) slams onto the grid. *Sound:* stamp + taiko.
5. **Source footnote** throughout: stone, 18 px, bottom-left, changing with each claim.
6. **Ink flood** (33.5–35.4 s): a black circle with a displacement filter (ragged, bleeding edge) grows from off-centre to cover the frame. *Sound:* riser → big taiko.

### 三 Painkiller (35–57 s): *the seal*

1. **Pixels dissolve** (36–39 s): on black, a 12×16 tile mosaic of the artifact (a few tiles vermilion) scatters outward, rotating and shrinking (`in3`, seeded per tile). The line in washi Mincho: *"So we stopped trusting pixels."* (or your equivalent: *"So we stopped trusting ___."*)
2. **THE SEAL** (39.0–39.25 s): the 400 px maru-in slams from 4× (§5) with a 26 px shake. **Paper floods out from the seal**: a radial mask opens washi over black with `outExpo` in 0.85 s, and 60 vermilion splats burst. *Sound:* the biggest taiko + stamp + shimmer. This is the turn of the film, and the music switches here.
3. **Wordmark** (39.8–40.6 s): letters rise and tighten under the seal, which lifts 70 px and shrinks to 0.62. The tagline appears in Mincho 500, charcoal.
4. **How it works, in three seals** (42.3–51.4 s): three columns rise with `outBack` on the beats.
   - The artifact gets a **kakuin stamped** on its corner.
   - A sumi ring **turns vermilion** and pulses a 26 px halo, with a bell.
   - A **maru-in drops** in.
   - **Brush arrows** draw between the columns.
   - Mincho captions sit below each: *"___ seals" → "___ verifies" → "You ___"*.
5. **The kanji triad** (51.6–56.2 s), see §6. Then it lifts away, scaling 1.15 and rising 40 px.

### 四 Product (55–107 s): *the real thing*

1. **A browser/device window** rises in from scale 0.82 and +160 px over the desk gradient. The recording plays inside it under the virtual camera and drawn cursor (§10).
2. **LIVE pill**, bottom-right: a sumi capsule, washi text, vermilion dot, with the URL in muted text.
3. **Chapter cards**, bottom-left: a washi card with a **5 px vermilion left border**, mono number in `--shu` (`01`), Mincho 34 px title (*"Issue the receipt"*). It slides in 60 px with `out5`, one per beat, 3–5 in total.
4. **Proof push-in:** when the real result appears, the camera eases in to 1.5–1.6× and holds.
5. **Exit:** the window recedes to 0.7 and fades as the next scene appears beneath it.

### 五 Depth (105–122 s): *why it's better, and what cheating looks like*

1. **The race:** a mono caps label in `--shu2` and a Mincho headline (*"50 operations"*). Two bars: **the old way in indigo**, **yours in vermilion**, with a **dashed sumi limit line**. Values count in mono on a washi chip. Then scale the problem up (*"100 operations"*): the indigo bar overruns the limit and turns **striped** (`repeating-linear-gradient(45deg, #2f6f9f 0 14px, rgba(47,111,159,.35) 14px 28px)`), and its label becomes *"doesn't fit"* in `--shu2`, while yours shows *"✓ fits"*.
2. **The big number** slams in at 210 px vermilion Mincho (*"9.2×"*), scale 2.2 → 1, with a mono caption.
3. **The seal breaks (tamper demo):** the artifact reappears, a kakuin stamps it, and one digit glitches and changes. Then the **kakuin splits in two** along a jagged vertical crack, using two copies with complementary `clip-path: polygon(0 0,52% 0,44% 38%,58% 61%,47% 100%,0 100%)` and its mirror. The halves drift apart (±40 px, rotating −14° / +16°) with a 12 px shake. Then `SIGNATURE INVALID · REJECTED` appears in mono caps, `--shu2`. *Sound:* glitch → crack.

### 六 Impact (122–136 s): *who wins*

A sumi **divider draws down** the middle (`scaleY` 0 → 1, `inOut`). On the left, **maru-in + "Users"** (96 px Mincho); on the right, **kakuin + "Partners"**. Three benefits per side, each with a **vermilion check stamp** (2 → 1 in 0.18 s, −8°), revealed on the voice beats. The left side finishes before the right begins.

### 七 Outro (136–150 s): *the signature*

1. A soft **ink-wash landscape** fades up behind a washi glow (`radial-gradient(ellipse 58% 62% at 50% 44%, rgba(244,239,227,.97) 50%, transparent)`).
2. **26 sakura petals** fall: `y = ((t + phase) * speed) % 1300 − 120`, `x` sways `sin((t+phase)·k)·60`, drifting left 18 px/s, at 70 % opacity, a mix of `#e58a80` and `--shu`.
3. **The final seal** slams from 3.2× (137.35–137.6 s). The **wordmark** assembles beneath it (110 px). The **three verbs** rise one by one, 0.45 s apart, with the **last one in vermilion**.
4. URL (Instrument Sans 600, 40 px) → a credibility line (26 px, charcoal) → the **disclaimer** (17 px, stone, bottom).
5. **Fade to night ink** over 147.6–149.6 s. The koto and breath melody ring out into silence.

---

## 9. Ink transitions

Three transitions, each with a meaning. Don't use any other kind.

| Transition | Meaning | Recipe |
|---|---|---|
| **Brush wipe** | "next chapter" | A ragged-edged black band 2600 px wide (41 seeded points down each edge, ±120–140 px roughness) crosses left → right in 1.1 s with `inOut`, fully covering the frame at the midpoint, where the scenes swap. *Sound:* rising whoosh. |
| **Ink flood** | "it gets darker" | `<circle>` filtered by `feTurbulence baseFrequency=.012 numOctaves=4` + `feDisplacementMap scale=140`, radius 0 → 1500 with `in3` over ~1.9 s. The edge bleeds like ink in water. |
| **Paper from the seal** | "now it's true" | A washi layer revealed by a radial mask growing from the seal's centre, `outExpo` over 0.85 s, triggered on the stamp's impact frame. |

The hook uses the inverse of the paper reveal: the ink opens from the drop.

```js
const BRUSH = (() => { const pts = [], H = 1080;
  for (let i = 0; i <= 40; i++) pts.push([2600 - 120 + rnd(i, 11) * 120, (i / 40) * H]);
  for (let i = 40; i >= 0; i--) pts.push([rnd(i, 12) * 140, (i / 40) * H]);
  return pts; })();
function wipe(t, a, b) {
  const u = P(t, a, b); if (u <= 0 || u >= 1) return path.setAttribute("d", "");
  const x = lerp(-2700, 2020, E.inOut(u));
  path.setAttribute("d", "M" + BRUSH.map(([px, py]) => `${px + x},${py}`).join("L") + "Z");
}
```

---

## 10. The product take: camera and cursor

### Record the real thing

Drive the real product with Playwright and record two things on the same clock:

- the CDP screencast (`Page.startScreencast`), one JPEG per frame with timestamps
- an event log of every cursor move (`from`, `to`, `t0`, `t1`), click, keystroke and scroll

Move slowly (0.6–1.0 s per move), pause 1–2 s on each result, and do logins and setup **off-camera** before recording starts.

### Edit with a remap, not a razor

`timeline.json → product.remap: [[take_from, take_to, speed], …]` maps film time onto take time. Speed 1 is real time; speed 4–8 compresses waiting. Skip loading screens and blank flashes entirely. Where the recorder captured a scroll as a jump, draw the frames before and after with an eased offset for 0.4–0.6 s (a synthetic smooth scroll).

### The camera: no shake

1. **Shots are rectangles.** Each keyframe `[t_start, t_end, zoom, x, y]` becomes a visible rectangle `{cx, cy, w}` in stage space.
2. **Clamp once per keyframe**, so each rectangle sits inside the footage. **Never clamp per frame**: that is what makes zooms judder against the edge.
3. **Interpolate linearly in (cx, cy, w) with smootherstep** `u³(u(6u−15)+10)`. Between two in-bounds rectangles, every in-between rectangle is also in bounds.
4. **Every glide lasts at least 1.3 s.**
5. **Draw the footage on `<canvas>`** with `imageSmoothingQuality = "high"` at the exact sub-pixel transform. CSS-scaling an `<img>` shimmers.
6. Zoom range 1.0–1.8. Grammar: wide → push in on the action → hold on the result → pull out before the chapter changes.

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
  return st;   // zoom = 1920 / st.w
}
```

### The cursor: sumi arrow, vermilion ripple

```html
<svg id="cursor" style="overflow:visible">
  <circle id="ripple" fill="none" stroke="#c83a2f" stroke-width="3"/>
  <g id="arrow"><path d="M0 0 L0 23 L6 17.5 L10 26.5 L13.6 25 L9.8 16.2 L17.5 16.2 Z"
     fill="#171717" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></g>
</svg>
```

- **Path:** each logged move with `inOut`, bent into an arc: perpendicular offset `sin(πu) × 8 %` of the move. Hands don't travel in straight lines.
- **Press:** scale to 0.82 and back over 0.22 s. **Ripple:** vermilion ring, radius 8 → 50 px with `out3`, fading over 0.5 s, plus a soft click sound on the frame.
- **Size × √zoom**, not × zoom. Same transform matrix as the footage, so it never slips off its target.

---

## 11. The score: koto, taiko, bell

An original score synthesized in NumPy/SciPy at 48 kHz. No samples and no licences. The story's turn is a **change of scale**.

### Two scales

```python
IN = [62, 63, 67, 69, 70]   # In scale (miyako-bushi): D Eb G A Bb  → darkness, the lie, the problem
BR = [62, 64, 66, 69, 71]   # D major pentatonic: D E F# A B        → the seal, the product, the outro
```

The **In scale**'s half-steps (D→E♭, A→B♭) sound uneasy and old. The **major pentatonic** sounds open and bright. The switch happens on the seal's impact frame.

### The instruments

| Instrument | Synthesis | Role |
|---|---|---|
| **Koto** | 10 slightly inharmonic partials (`fk = f·k·√(1+0.00035k²)`), per-partial decay rising with k, a tiny pitch bend on the attack, a 2 ms noise pluck | Melody, ostinato, arpeggios |
| **Taiko** | sine with pitch dropping 147 → 52 Hz (`52+95·e^(−22t)`), plus a 38 Hz sub on big hits, plus low-passed skin noise | Pulse, impacts, the turn |
| **Stamp** | pitch-drop thud (130 → 60 Hz) + band-passed paper slap + a 2.6 kHz click | Every seal and stamp |
| **Temple bell** | FM: carrier `f`, modulator `f·3.5`, index 3 decaying | Reveals, the coin landing, verification |
| **Breath lead** | sine + 2nd/3rd harmonics, 5.2 Hz vibrato fading in, band-passed breath noise | Shakuhachi-like phrases at the turn and outro |
| **Pad** | 3 detuned saws per note, 13 partials, slow tremolo, long attack | Bed under each act |
| **Heartbeat** | two 55 Hz thumps 0.18 s apart | Tension under "which one is real?" |
| **Shimmer** | dozens of tiny 2.2–6.5 kHz pings | Magic and transformation moments |
| **Whoosh / riser** | band-passed noise swept up or down; noise + pitch sweep | Wipes, camera pushes, into the turn |
| **Glitch / crack** | stepped square-wave bursts; high-passed crackle + low thump | The lie; the seal breaking |

```python
def koto(f, dur=2.2, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    bend = 1 + 0.004 * np.exp(-t * 25)
    for k in range(1, 11):
        a = (1 / k ** 1.05) * abs(np.sin(k * np.pi * 0.21)) + 0.02
        fk = f * k * np.sqrt(1 + 0.00035 * k * k)
        s += a * np.sin(2 * np.pi * fk * np.cumsum(bend) / SR) * np.exp(-t * (1.6 + 1.25 * k) * (f / 400) ** 0.3)
    s += 0.25 * hp(1500, rng.standard_normal(n)) * np.exp(-t * 180)
    return 0.35 * vel * s * np.minimum(1, t / 0.002)

def taiko(vel=1.0, big=False):
    dur = 2.4 if big else 1.2; n = int(dur * SR); t = np.arange(n) / SR
    f = 52 + 95 * np.exp(-t * 22)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (2.2 if big else 4.2))
    sub = (np.sin(2 * np.pi * 38 * t) * np.exp(-t * 2.0)) if big else 0
    skin = lp(1400, rng.standard_normal(n)) * np.exp(-t * 55) * 0.5
    return vel * (body + 0.8 * sub + skin) * 0.9

def stamp(vel=1.0):
    n = int(0.5 * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-t * 40)) / SR) * np.exp(-t * 14)
    slap = bp(300, 2600, rng.standard_normal(n)) * np.exp(-t * 70) * 0.8
    click = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 900) * 0.3
    return vel * (thud + slap + click) * 0.8
```

### The musical arc

| Act | Music |
|---|---|
| Hook | Low dark drone (D, A, E♭), sparse **In-scale** koto notes, heartbeat |
| Problem | **76 bpm** koto ostinato in eighths (`0,3,4,3,0,3,2,3`), a taiko every bar, a shifting pad, a **riser** into the ink flood |
| **The seal** | **Big taiko + stamp.** Switch to **pentatonic**, **90 bpm**: koto arpeggio (`0,2,3,4,5,4,3,2`), taiko pulse, hi-hat-like noise ticks, a **breath-lead** phrase |
| Product | Light bed: D–Bm–G–A pads, quiet koto, soft taiko every other beat, **ducked under the voice** |
| Depth | Taiko builds on the 8ths, rising pads, a riser into the big number, then a drop to a low drone for the tamper demo |
| Impact | Warm and lifting: the full progression, koto, taiko on the beat |
| Outro | One long open chord, a descending koto line (A–F♯–E–D–A–D), a final breath note, then silence |

### Sound design is placed by timeline, never by ear

Every hit is scheduled at the same time constant the picture uses: the seal frame, each kanji, each stamp. In the product scene, **every recorded click and keystroke** from the take's event log is mapped through the same remap into a soft click, so the cursor and the sound always agree.

### Mix

- One shared synthetic reverb (an IR of decaying noise, about 2.6 s, damped at 3 kHz). Music and effects get sends; the voice gets a touch.
- **Sidechain duck:** the music drops about 8 dB under the voice (`1 − 0.62·clip(env/0.035)`), with a 120 ms envelope smoothing and ~350 ms release. Effects duck only a quarter as much.
- Master at **−14 LUFS integrated, −1 dBTP**, with two-pass `loudnorm` (§13).

---

## 12. Voice

- **Pace:** the reference film has 233 words in 19 lines over 150 s (about **1.5 words per second of film**). The silence belongs to the music and the seals.
- **Shape:** short, short, long. Land the long line on the visual payoff. Fragments are welcome (*"A coin flip."*).
- **The arc in lines:** hook (2 lines) → problem (3) → painkiller (3: the turn, the name, the how) → product (4–5, one per chapter) → depth (2) → impact (2) → outro (2: name, then three verbs).
- **TTS:** Kokoro (`af_heart`) or another open model; one voice, one speed. Write numbers the way they should be spoken ("twenty twenty-six", "fifty point one percent").
- Render the voice **first**, measure each line, then time the picture to the voice.

```json
{ "lines": [
  { "id": "hook1", "text": "This receipt is fake." },
  { "id": "hook2", "text": "It took less than a second to make. And you couldn't tell." },
  { "id": "pain1", "text": "So we stopped trusting pixels." },
  { "id": "out2",  "text": "Scan. Prove. Own." } ] }
```

---

## 13. Render and finish

```
film/
  script.json     voice lines
  timeline.json   fps, duration, scenes {name:[a,b]}, vo [[id,t]], product {start, remap, scrollJumps, urls, camera, chapters}
  record.mjs      Playwright: real product → rec/take.json + rec/*.jpg
  vo.py           script → audio/vo/*.wav + durations
  score.py        timeline + take events → audio/mix_raw.wav
  index.html      1920×1080 stage: tokens, fonts, every scene as a layer, grain/vignette/black/wipe on top
  film.js         render(t): one function per scene, seals, transitions, grain
  render.mjs      headless Chromium, N workers → frames/%05d.jpg
  finish.sh       loudness, encode, captions
```

- **Scene ownership:** each scene draws only inside its range; ranges overlap 0.4–1.2 s; visibility switches at the crossfade midpoint; the later scene has the higher z-index.
- **Warm-up:** render one frame from each scene in every worker before starting, so lazily built DOM is identical everywhere.
- **Review stills before any full render:** `node render.mjs --at 1.0,5.4,39.3,60,119.3,141`
- **Full render:** `node render.mjs --workers 6`. 150 s × 30 fps = 4,500 JPEGs at quality 93. Each worker takes a contiguous chunk.

```bash
# two-pass loudness
ffmpeg -i audio/mix_raw.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
ffmpeg -i audio/mix_raw.wav -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:linear=true,aresample=48000" -c:a pcm_s24le audio/mix.wav
# master (CRF 15), then re-encode a CRF 20–23 copy for sharing
ffmpeg -framerate 30 -i frames/%05d.jpg -i audio/mix.wav -c:v libx264 -preset slow -crf 15 -profile:v high \
  -pix_fmt yuv420p -tune film -c:a aac -b:a 320k -shortest -movflags +faststart out/film.mp4
```

Captions: build the `.srt` from `timeline.vo` and the measured line durations. Upload them as a separate captions file rather than burning them into the picture.

---

## 14. Quality gate

**Theme**
- [ ] Vermilion appears only on seals, verified states, emphasis and the last tagline word, at no more than about 5 % of any frame.
- [ ] No pure white or pure black anywhere (check the artifact, the cursor outline aside).
- [ ] Every seal lands rotated (−6° to −8°), never straight, and never bounces.
- [ ] Grain moves; the vignette is warm brown.
- [ ] Every kanji has been checked for meaning.

**Picture**
- [ ] Brush circles and stamps are never clipped by a text mask (`clipPath: none` after each reveal).
- [ ] No camera judder at any zoom: watch every push at 100 %.
- [ ] No loading screens, auth prompts or blank flashes in the product take.
- [ ] Mincho is loaded on frame 0.
- [ ] Re-rendering five random frames produces identical images.

**Sound**
- [ ] The scale switches from In to pentatonic on the seal's impact frame.
- [ ] Every stamp, check and click sound lands on its exact frame.
- [ ] The music never covers the voice (check on laptop speakers).
- [ ] The final file measures −14 LUFS and ≤ −1 dBTP.

**Truth**
- [ ] Every number on screen has a source footnote.
- [ ] The outro disclaimer states what is demo, simulated or mocked.
- [ ] No private data in any frame.

---

## 15. The master prompt

```text
You are a motion designer, editor, composer and engineer in one. Build a [LENGTH]-second
product film for [PRODUCT] in the HANKO REEL style, following HANKO-REEL.md exactly:
washi cream, sumi ink and one vermilion seal; Shippori Mincho / Instrument Sans / IBM Plex Mono;
hand-pressed maru-in and kakuin seals; ink transitions; the seven scenes; the In→pentatonic
koto/taiko score; every frame a pure function of t.

Brief:
- The artifact (hook object): [ARTIFACT]
- The lie (how it's faked or broken): [THE_LIE]
- The number (with source): [STAT + SOURCE]
- The second pain: [PAIN_2]
- The seal (what the product does): [THE_SEAL]
- Three verbs + kanji: [V1 / K1], [V2 / K2], [V3 / K3]
- Depth fact (old vs new, measured): [FACT]
- Tamper demo: [WHAT FAILURE LOOKS LIKE]
- Two winners + 3 benefits each: [A: …], [B: …]
- Wordmark / URL / disclaimer: [NAME] / [URL] / [DISCLAIMER]
- Product to record: [URL / APP / COMMAND]. Off-camera setup: [SETUP]. Chapters: [3–5 VERB PHRASES]
- Voice: [TTS VOICE], ~1.5 words per second of film.

Deliver in order, and show me each before moving on:
1. script.json  2. timeline.json  3. the recorded take (frames + event log)
4. review stills at the hook lie, the seal, the product push-in, the tamper break and the outro
5. full render, score, mix and final MP4 (-14 LUFS) with SRT captions
6. a title, a description with chapters and sources, and three thumbnails in the same style.

Run the §14 quality gate and report each item as pass or fail with evidence.
```

## Verify the render with numbers

Before you call the film done, measure it. Run:

```bash
npx activate-agentmd motion check out/film.mp4 --preset hanko-reel
```

It checks this style's delivery targets (−14 LUFS, true peak ≤ −1 dBTP, 30 fps) and the gates every Motion film shares: the render decodes and moves (G0), no empty frames mid-film (G1), a short end hold (G2), the final shot's share of the film (G3), and loudness (G4). It exits 1 on a failure, so it can gate a CI job. Passing is a floor, not taste: judge proof readability and one hero per frame by eye on a contact sheet. The timing and anti-slop rules behind these gates are in the `motion-craft` standard.

---

*HANKO REEL was distilled from the [STOCKBACK demo film](https://youtu.be/70fX_mN6MuE): 4,500 code-rendered frames, an original synthesized score and a real product take.*
