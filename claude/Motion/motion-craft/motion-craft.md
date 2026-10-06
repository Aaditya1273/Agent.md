---
targetModels:
  - "Claude Opus 5.5"
  - "Claude Fable 5.1"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
name: motion-craft
category: Motion
description: Measured timing, eases and anti-slop rules for motion graphics in any renderer, with frame numbers from ~4,300 timed pro moves and a render check you can run.
license: Apache-2.0
author: Agent.md maintainers, adapted from motionmaxxing by Tejas Makwana
last-verified: 2026-10-07
reviewed-by: unreviewed
---

# Motion Craft: measured timing for motion that looks designed

> Adapted from motionmaxxing (github.com/Tejashmakwana/motionmaxxing), Apache-2.0, © Tejas Makwana. Numbers are restated from its measurements of 53 professional motion pieces (~4,300 timed moves); wording, structure and the verification section are ours. Changes: condensed, made renderer-agnostic, mapped to `agentmd motion check`.

**Conventions.** Time is in frames at 30 fps, with seconds beside it: 1 f = 0.033 s, 3 f = 0.10 s, 6 f = 0.20 s, 10 f = 0.33 s, 15 f = 0.50 s, 30 f = 1.0 s. At 60 fps, double the frame counts. Sizes are a share of frame height (H) or frame width (W). Pixel values assume a 1280x720 stage; multiply by 1.5 at 1920x1080. "Measured" means the median over the sample unless a range is given.

---

## 1. When to use this standard

Use it whenever you make, plan, fix or review a motion graphic: a launch film, product promo, feature reveal, brand sting, kinetic-type piece, social ad, CTA or UI demo.

| Question | Where it is answered |
|---|---|
| How long should this move take? | Section 2 |
| Which curve? | Section 3 |
| Should it move, fade or cut? | Section 4 |
| How fast do words arrive, how long do they stay? | Section 5 |
| Where does it go, how big? | Section 6 |
| How does beat A become beat B? | Section 7 |
| How do the cursor and clicks behave? | Section 8 |
| What lands on the beat? | Section 9 |
| How does it end? | Section 10 |
| Is this a known AI default? | Section 11 |
| Did the render come out right? | Section 12 |

**How it pairs with the film styles.** The Motion category also has `lumen`, `hanami`, `hanko-reel` and `truecut`. Those give a film a look: palette, type, stage, pipeline. This standard gives the timing and the anti-slop rules underneath any look. When a style sets its own number for its own look, follow the style. Use this standard for everything the style leaves open. `motion check --preset <style>` uses that style's targets.

**Works with any renderer.** Plain HTML with `requestAnimationFrame`, a `seek(t)` render loop, Remotion, GSAP you install yourself, or CSS. One rule holds for all of them:

- Every frame is a pure function of `t`. No `setTimeout`, `Math.random`, `Date.now()` or wall-clock CSS animation in the render path. Seed any randomness. If you use CSS animations, pause them and drive `currentTime` (Web Animations) or a negative `animation-delay` from `t`.
- Never run two tweens on the same property of the same element at once. Put one of them on a parent.
- Build one camera group. Move that group, not each child (section 8).

**Scope of the evidence.** The sample is short (3-7 s) UI-forward launch moments. The numbers are strong defaults for how things move. They are not a recipe for what a film is about. Where your idea needs something else, do it and write the reason in one sentence.

---

## 2. The measured defaults

### 2.1 Duration by property

| Property | p25 | Median | p75 | Typical travel (p25 / median / p75) |
|---|---|---|---|---|
| Translate x | 6 f (0.20 s) | **12 f (0.40 s)** | 24 f (0.80 s) | 1.5 / 4.8 / 15% W |
| Translate y | 6 f (0.20 s) | **12 f (0.40 s)** | 22 f (0.73 s) | 2 / 8.5 / 25% H |
| Scale | 5 f (0.17 s) | **10 f (0.33 s)** | 22 f (0.73 s) | delta 0.11 / 0.25 / 0.55 |
| Rotation | 6 f (0.20 s) | **11 f (0.37 s)** | 21 f (0.70 s) | 11 / 25 / 124 deg |
| Opacity | 4 f (0.13 s) | **6 f (0.20 s)** | 12 f (0.40 s) | 0.73 / 0.96 / 1.0 |
| Blur | 4 f (0.13 s) | **7 f (0.23 s)** | 10 f (0.33 s) | 2.5 / 5 / 10 px |
| Width / height | 4 f (0.13 s) | **8 f (0.27 s)** | 16 f (0.53 s) | 15 / 56 / 228 px |

All moves pooled: median **10 f (0.33 s)**. 13% are 2-3 f snaps. Only 12% run longer than 1 s.

**Default with no other information:** translate and scale entries 12 f, opacity 6 f, blur 7 f, translate exits 13-14 f, scale exits 10 f. Treat 6 f and 24 f as the normal edges. A film built on 20-30 f ease-outs for everything is slower than the whole sample.

### 2.2 Entry versus exit

| Property | Entry median (p25 / p75) | Exit median (p25 / p75) |
|---|---|---|
| Translate x | 12 f (6 / 23) | 14 f (7 / 27) |
| Translate y | 12 f (6 / 22) | 13 f (7 / 24) |
| Scale | 11 f (6 / 22) | 10 f (5 / 24) |
| Rotation | 10 f (5 / 25) | 10 f (5 / 20) |
| Opacity | 6 f (4 / 12) | 7 f (4 / 12) |
| Blur | 8 f (5 / 11) | 7 f (4 / 9) |

### 2.3 By beat role

Every beat has one job. **Hook**: a concrete promise is made. **Turn**: the problem gets an answer and a name. **Proof**: the product visibly does the thing. **CTA**: the next action belongs to the viewer.

| Role | Beat length (measured range, median) | Translate / scale entry | Translate / scale exit | Opacity in / out | Snap curves | Ease-in share | Overshoot share |
|---|---|---|---|---|---|---|---|
| Hook | 3.1-6.3 s, 5.0 s | 12-14 f | 10-12 f | 6 / 6 f | 17% | 23% | 12.3% |
| Turn | 3.5-5.6 s, 4.6 s | 12-15 f | **14-16 f** | 5 / 6 f | 10% | **33%** | 11.3% |
| Proof | 3.2-7.5 s, 5.0 s | 12-14 f | 12-16 f | 7 / 7 f | 11% | 27% | 5.7% |
| CTA | 2.2-6.4 s, 4.9 s | **6 f** | 9-13 f | 4 / 6 f | **39%** | 30% | 4.3% |

- **CTA is the most staccato part.** Supporting moves (stack, pills, copy) enter in 6 f. The hero mark or button still runs 18-30 f on `snapSettle`. Keep overshoot out.
- **Turns pull things away.** Give them the longest exits and lean on acceleration.
- **Proof is the largest share of any film.** Use about one proof per 8-10 s of film, never zero.
- **At most 25% of beats are "the point".** Give each beat an importance of 1, 2 or 3. Only the 3s get scale, a camera move and their own sound.

### 2.4 Stagger and overlap

| Gap between sibling onsets | 1 f | 2 f | 3 f | 4 f | 5 f | 6 f | 7-9 f | 10-14 f | 15-24 f |
|---|---|---|---|---|---|---|---|---|---|
| Share of all gaps | **56%** | 13% | 8% | 6% | 7% | 2% | 3% | 1% | 4% |

- Per-group median gap 3 f (p25-p75: 1-5 f). By role: hook 3.0 f, turn 1.5 f, proof 2.2 f, **CTA 8.0 f** (the only role that slows down).
- Gaps are uneven in 55% of groups. Use a hand-written list like 3, 2, 2, 2, 2, 2, never one fixed delay.
- Siblings overlap. Gap divided by move length has a median of **0.5** (0.27-0.83). Run each move about twice as long as the gap.
- A whole wave under ~0.6 s reads as one gesture. A slower, even wave reads as a loading list.
- 1 f gaps are for letters, tiles and rows. Whole words run slower: 2-5 f, or 8-12 f when led by a voice (section 5).

### 2.5 Overshoot: rare, late, small

- 8.8% of moves overshoot by more than 3%. Median overshoot is 19% of that move's own travel.
- 88% of overshoots peak **after** 35% of the move, around t = 0.65-0.70: a slow lean past the mark, not a fast spring.
- Allow one small late lean (`popOver`) per beat at most. Spend **one visible spring per film**, on the payoff, at a few percent up to about 12%.

### 2.6 Holds, drift and breath

- **A hold after a key line is good craft.** Readable list ~0.8 s, single number 0.5-1.2 s, payoff pile 0.8-1.0 s, resolved lockup 0.6-1.4 s.
- **A designed breath** of 0.6-1.5 s before a payoff, with a reason you can state, is wanted.
- **On longer holds keep one living thing:** linear drift of 1-3 px/f, a 0.5-1% scale creep, a caret, a counter tick, light moving across the ground. Measured drifts run a median 26 f at ~2.5 px/f.
- The sample's "motion on ~99% of frames" figure comes from 3-7 s moments. It is not a target for a whole film. Human-made whole films are calmer (section 12, motion note).
- **Cut cadence:** inside a beat, cut every 0.3-2.3 s. Shorten scenes toward the end, then let the last one linger.

---

## 3. The 12 eases

These were fitted to the median curves of clusters of real moves. 89% of measured moves lie within 0.12 of one of them, 53% within 0.06. Treat them as anchors and blend between them when needed. "Share" is the share of moves nearest each ease.

| Ease | Shape in one phrase | % done at 10 / 25 / 50 / 75% of time | Frames (p25 / median / p75) | Share | Use it for |
|---|---|---|---|---|---|
| `cruise` | linear | 10 / 25 / 50 / 75 | 6 / 9 / 16 | 18% | fades, drift, camera creep, counters off a timer, every ambient move |
| `glide` | gentle ease-out | 16 / 39 / 69 / 91 | 7 / 10 / 18 | 14% | all-purpose medium moves, entries and exits alike, camera pushes |
| `softInOut` | soft S-curve | 4 / 17 / 50 / 83 | 6 / 9 / 16 | 14% | opacity, blur, ground and colour ramps, numbers tied to a handle |
| `softLand` | firm decelerate | 30 / 59 / 85 / 95 | 6 / 12 / 21 | 9% | text rises, panel slides, scale-ins; the hook and proof workhorse |
| `gentleIn` | mild acceleration | 1 / 6 / 24 / 55 | 6 / 9 / 17 | 9% | exits, blur-outs, fade-out starts, push-ins running into a cut |
| `snapSettle` | instant snap, long soft tail | 54 / 84 / 96 / 98 | 6 / 11 / 29 | 6% | hero entries, logo crash-ins, 23% of CTA moves |
| `whip` | hard decelerate | 23 / 52 / 83 / 97 | 8 / 13 / 21 | 6% | big fast moves, the arriving half of a whip pan |
| `accelExit` | the leaving curve | 0 / 3 / 16 / 47 | 9 / 13 / 19 | 5% | scale exits, pans off-frame; peak speed near t = 0.9 |
| `crashOut` | hard acceleration into a cut | 0 / 0 / 6 / 32 | 11 / 17 / 31 | 4% | camera pull-offs and exits that end on a hard cut at full speed |
| `popOver` | slow late lean past the mark | 10 / 46 / 96 / 108 (peak 1.08 at t 0.72) | 11 / 15 / 27 | 2% | the small overshoot; scale and translate entries |
| `crashIn` | slam that passes the mark at once | 91 / 118 / 110 / 103 (peak 1.18 at t 0.27) | 9 / 10 / 27 | 1% | drops that hit, pass and relax back by t 0.9 |
| `bounceHard` | big overshoot | 13 / 62 / 138 / 139 (peak 1.48 at t 0.62) | 11 / 22 / 28 | <1% | one ty drop or scale pop in a film that is otherwise ease-out |

### 3.1 Exact definitions

Each ease maps `t` in [0, 1] to progress, with f(0) = 0 and f(1) = 1. Copy this block; it has no dependencies.

```js
const clamp = f => t => (t <= 0 ? 0 : t >= 1 ? 1 : f(t));
const powerOut = p => t => 1 - (1 - t) ** p;
const powerIn = p => t => t ** p;
const expoOut = k => t => (1 - Math.exp(-k * t)) / (1 - Math.exp(-k));
const smoothS = p => t => t ** p / (t ** p + (1 - t) ** p);
const snapRamp = (w, tau) => {               // fast exponential snap blended with a linear tail
  const n = w * (1 - Math.exp(-1 / tau)) + (1 - w);
  return t => (w * (1 - Math.exp(-t / tau)) + (1 - w) * t) / n;
};
const snapOver = (a, rise, decay) => {       // rises at once, overshoots, relaxes
  const f = t => (1 + a * Math.exp(-t / decay)) * (1 - Math.exp(-t / rise));
  const n = f(1);
  return t => f(t) / n;
};
const spring = (damp, freq) => {             // damped spring, normalised to end at 1
  const f = t => 1 - Math.exp(-damp * t) * (Math.cos(freq * t) + (damp / freq) * Math.sin(freq * t));
  const n = f(1);
  return t => f(t) / n;
};

export const EASE = {
  cruise:     clamp(t => t),
  glide:      clamp(powerOut(1.7)),
  softInOut:  clamp(smoothS(1.42)),
  softLand:   clamp(expoOut(3.41)),
  gentleIn:   clamp(powerIn(2.07)),
  snapSettle: clamp(snapRamp(0.942, 0.118)),
  whip:       clamp(powerOut(2.52)),
  accelExit:  clamp(powerIn(2.6)),
  crashOut:   clamp(powerIn(3.97)),
  popOver:    clamp(spring(2.67, 4.36)),
  crashIn:    clamp(snapOver(2.0, 0.19, 0.218)),
  bounceHard: clamp(spring(1.34, 5.07)),
};
// Default length in frames @30 for each ease, from the measured medians.
export const EASE_FRAMES = { cruise: 9, glide: 10, softInOut: 9, softLand: 12, gentleIn: 9, snapSettle: 11,
  whip: 7, accelExit: 13, crashOut: 17, popOver: 15, crashIn: 10, bounceHard: 22 };
```

**Using them.** Plain JS: `value = from + (to - from) * EASE.softLand(localT)`. GSAP: pass the function, `ease: EASE.softLand, duration: 12 / 30`. Remotion: `interpolate(frame, [start, start + 12], [0, 1], { easing: EASE.softLand, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`.

### 3.2 CSS cubic-bezier

Only `cruise` is exactly a cubic-bezier: `cubic-bezier(0, 0, 1, 1)`. For the others, these are our least-squares fits to the definitions above. The worst error is under 0.01 of travel anywhere on the curve, which is invisible at 30 fps.

| Ease | `cubic-bezier(...)` | Max error |
|---|---|---|
| `glide` | 0.16, 0.28, 0.60, 0.97 | 0.002 |
| `softInOut` | 0.34, 0.07, 0.66, 0.93 | 0.001 |
| `softLand` | 0.23, 0.82, 0.55, 0.94 | 0.001 |
| `gentleIn` | 0.52, -0.01, 0.89, 0.79 | 0.004 |
| `snapSettle` | 0.14, 1.06, 0.31, 0.94 | 0.009 |
| `whip` | 0.21, 0.52, 0.48, 1.03 | 0.003 |
| `accelExit` | 0.45, -0.02, 0.72, 0.28 | 0.004 |
| `crashOut` | 0.66, -0.05, 0.80, 0.28 | 0.009 |

`popOver`, `crashIn` and `bounceHard` cannot be one cubic-bezier. In CSS, sample the JS function into a `linear()` easing with 20-30 stops, or drive the value from JS.

### 3.3 Landing decelerates, leaving accelerates

| Direction of the move | Ease-out | Linear | In-out | Ease-in |
|---|---|---|---|---|
| Landing (ends closer to rest) | **58%** | 14% | 10% | 16% |
| Leaving (ends farther from rest) | 35% | 17% | 11% | **37%** |
| Scale leaving | 33% | 15% | 9% | **42%** |
| Blur leaving | 3% | 19% | 15% | **63%** |
| Translate exits | 26-29% | 14% | - | **47-48%** |

- **Landing:** ease out. Use `softLand` 12 f, `glide` 10 f, or `snapSettle` 11 f for a hero or CTA. In the strongest entries 60-72% of the travel happens in the first 4 f, then a 0.4-0.6 s tail. No bounce.
- **Leaving:** accelerate with `accelExit` 13 f, `crashOut` 17 f or `gentleIn` 9 f, and end at peak speed. Peak speed sits near t = 0.9.
- **Not every exit.** 23-29% of exits still ease out or run linear: shrinking to centre, blur-outs, things swept along by a camera move. Do not force ease-in on all of them.
- **One curve for everything is the loudest tell.** A finished film uses at least four curve roles: entry, exit, drift and stepped (counters, typing).

### 3.4 Pick the ease

| What is moving | Ease | Frames |
|---|---|---|
| Card, panel or modal landing | `softLand` (hero card: `snapSettle`) | 12 (6-21) |
| Card inside a CTA | `snapSettle` | 6 |
| Whole word arriving | `softLand` (hero first word: `snapSettle`) | 12-15 |
| Logo crashing in from 3.5x | `snapSettle`, then `cruise` creep 1.0 to 0.93 | 18-30 |
| Camera push | `glide` or `cruise` | 10-22 |
| Camera pull or exit | `accelExit` or `crashOut` | 13-17 |
| Whip, arriving half | `whip` | 7-8 |
| Whip, departing half | `accelExit` | 6-10 |
| Drift, creep, ambient | `cruise` | 26+ |
| Press down | `glide` | 2-6 |
| Release | `popOver`, or `softLand` for no rebound | 6-10 |
| Fade | `cruise`; `gentleIn` to start a fade-out | 4-7 |
| Blur-in focus reveal | `glide` or `softInOut` | 4-8 |
| Blur-out | `gentleIn` | 7 |
| One-off physical reward | `popOver`, rarely `bounceHard` | 15 / 22 |

---

## 4. Cuts versus fades

Things arrive and leave by **moving**, not fading.

| Measured | Share |
|---|---|
| Entries carried by a transform (offset, scale, rotation) | 71% |
| Entries by blur-in | 8% |
| Entries by opacity only | 12% |
| Entries as a hard 1-frame cut | 16% |
| Exits by moving / by fading / by a hard step | 60% / 15% / 25% |
| Where something just appears: hard cut / fade | 57% / 43% |
| Where something just disappears: hard cut / fade | 63% / 37% |
| Moments that use hard visibility switches | 96% (median 20 cut-frames per moment) |
| Scene-to-scene crossfades in the whole sample | none; one single 50% double-exposed frame |

**Rules.**

- **An entry spends two or more decaying channels at once:** offset plus blur, or scale plus opacity. Opacity alone is the AI default.
- **Opacity is a helper.** Ramp it 0.12-0.3 to 1 over 4-6 f under a move. Opacity shapes measured: linear 32%, `softInOut` 27%, `glide` 19%, `gentleIn` 10%.
- **Hard-cut a UI piece, row or word when it should read as a system event.** A step reads as state, not animation.
- **Exits are faster than entries.** A word exits in 3-4 f, words 1 f apart, overlapping the next entrance by ~2 f.
- **Exits are new motion,** not the entry played backwards. A reversed entry reads as an undo.
- **Fade a single object, never a scene.** For example: one headline line, or the last phrase going to black linearly over 10 f.
- **One blur grammar per film,** never mixed:
  - **Smear:** directional blur on the first frame of each fast move, roughly halving each frame over 2-4 f. Lengths run 3-65 px, up to 100-140 px on whips. Keep it under ~0.15 W.
  - **Crisp steps:** no motion blur at all. Content changes during the move instead.
  - **Shutter:** real per-frame motion blur at render time, by averaging 8 sub-frames over a 180-degree shutter. Smooth films only.
  - Never stack shutter blur on smear. Never put shutter blur on a stepped film.

**When a fade is right:** the brand voice is calm and reassuring; the dissolve *is* the meaning (privacy, forgetting); the blur copies a real focus pull, scroll or whip with a direction. Never as the join between every scene.

---

## 5. Type and reading time

### 5.1 Word cadence

| Situation | Gap between word onsets |
|---|---|
| Fast hook, inside a phrase | 2-4 f (0.07-0.12 s), steady or speeding up |
| Standard headline | 4-6 f (0.12-0.20 s), speeding up toward the end |
| Voice-led, thoughtful | 8-12 f (0.25-0.40 s), irregular |
| Before the payoff word | 1.5-2x the base gap, once |
| Stacking identical-role words | 2 f |
| Technical ident on a music grid | constant 10 f: the one place even gaps are right |

- With no voice, use the base gap above with about ±40% jitter in a speech pattern (e.g. 5, 5, 3, 3 f). Never use a constant interval.
- **Word entry:** start 0.03-0.07 H below the slot (or 0.03 W to the side) and decelerate on `softLand` over 12-15 f. No overshoot, no opacity ramp. A measured hero word did 59% of its travel in 5 f, 80% by 10 f and 91% by 16 f, then a 0.4-1.2 s tail. Shrink the offset word by word so the build speeds up.
- **Words arrive whole.** Letter-by-letter typing with a caret belongs only inside the product's own input field. A story reason ("the film is about typing") is not an exception.
- **Survivors stay put.** When leading words drop, do not re-centre the rest.

### 5.2 Minimum time on screen

| Copy | Hold after the line is complete |
|---|---|
| Any line, voice carrying it | floor 0.45 s |
| 2-5 words | ~0.2 s per word (3 words 0.6-0.9 s, 5 words 1.0 s) |
| 2-word phrase | at least 0.5 s total |
| ~20 characters | at least 1.2 s total, assembly plus hold |
| 6-8 words on two lines | 1.7-2.0 s |
| Single number | 0.5-1.2 s |
| UI text set as texture | none; nobody is asked to read it |

Total life per phrase runs about 0.25-0.35 s per word, because viewers read along as words arrive.

### 5.3 Sizes (font-size as % of frame height)

| Role | Size | Notes |
|---|---|---|
| Texture text inside UI | 1.3-1.9% | unreadable on purpose; never a free-standing label |
| UI card and menu text | 2.2-4% | |
| UI prompt, the one readable UI object | 4-5% | 6% when the line is the hero |
| Supporting phrase | 5-7% | |
| Headline / statement | 7-11%, 9% typical | |
| Act-two emphasis word | 16% | after 11% in act one |
| Hero number | 22-29% | spend once |
| Opening thesis word | 33% | once, with a cause |
| Wordmark | 9-14% | ink 0.22-0.38 W |

- Anything that must be read is at least 4% H. Below 2% H it is texture.
- Hierarchy comes from size, not weight. Use one family: the brand's own face, else one neo-grotesk. Weights 400-550, 600 only on the wordmark, 650 on one word at most.
- Sentence case. Tighten display tracking by -1.5% to -5% em. Use charcoal ink, not pure black; keep pure black for the hero figure or wordmark.
- A new word may take the film's one accent colour for 0.13-0.28 s on arrival, then decay to ink. Never give each line a new hue.

### 5.4 Numbers and typing

- **Counters step one value per frame,** 15-23 steps over 0.5-0.9 s. Steps shrink toward the end (the last steps around 0.07 of a unit) and skip values. Never tween the digits.
- A **claim** lands on a round value (100.00, 10%). **Product data** lands un-round (522.14, $194.67).
- A number that is texture, not the claim, appears whole with no count-up.
- **Typing rate depends on the viewer's task.** Content to read: 14-30 chars/s. A long prompt where reading is not the point: 70-85 chars/s in bursts of 3-6 chars per frame.
- **Hand-author the rhythm.** Pause 6-10 f after spaces, skip some in-between states, slow the last word. The caret appears 1 f before the first character and stays solid while typing. It blinks only in an idle wait afterwards.

---

## 6. Layout and the frame

| Rule | Numbers |
|---|---|
| One hero per frame | 1 hero + at most 2 supporting groups. Up to 4 groups only at a hook peak under 0.5 s |
| Two panels in one frame | only if one is at least 2x the other's area, or the camera moves between them. Otherwise one object per frame and a cut |
| Readable proof | the readable object's text at least 0.04 H, and the fragment at least 0.55 W or cropped by the frame edge |
| Centred statement | baseline at y 0.52-0.54; 3-5 words span 0.30-0.56 W; cap any held line at ~0.8 W, else break to two lines |
| Final title | slightly off-centre, x 0.46-0.47, y 0.50-0.53 |
| Left-aligned phrase | only one line at x 0.10-0.14, no sub-line, no kicker, gone within 1.2 s and handing off to an object on the right |
| Text-safe margin | no text, label or logo in the outer 0.12 W / 0.10 H band, unless the crop is the point. Content (figures, cards, a device) may be cropped by the edge |
| Density | ink plus objects cover 5-44% of the frame. Statement frames leave 85-95% free of ink |
| Lockup | wordmark ink 0.22-0.38 W (typical 0.27-0.28 W); icon 0.05-0.14 W; gap 0.02-0.06 W; whole group centred at y 0.50 |

- **Empty is not flat.** The free part of the frame is a ground made of something: a captured screen, a material, a lit surface, texture. A flat colour is fine only for a flood or dive under ~1 s, or for a brand that is genuinely flat. More than three flat grounds in one film reads as a deck.
- **Emptiness must do a job:** a breath before a payoff, or isolation after a matched cut, under ~1.5 s.
- **Layer order, back to front:** ground; screen-fixed texture; background UI defocused 4-11 px; the hero or camera group; the claim text (screen-fixed, never blurred); in-front accents; the cursor on its own top layer.
- **Colour:** one saturated accent with one written meaning ("the AI is acting", "this is arriving", "on"). Add at most one signal colour, usually green for "done". Never put both on one object at once.
- **Crop to imply more:** an avatar grid cut by the edge, a device with its top corners off-frame, a second figure leaving cropped and still moving.
- **Vertical 9:16** (extrapolated, not in the sample): set headlines at 8-10% of W. Keep the centre band at y 0.40-0.52 so platform UI (top ~0.10 H, bottom ~0.20 H) never covers it. Stack instead of splitting.

---

## 7. Transitions between beats

Nearly every join in the sample is a hard cut, hidden by something else. Listed here in order of first resort.

| # | Join | Mechanics | Use when |
|---|---|---|---|
| 1 | **Hard cut on motion** | A accelerates over its last 3-8 f; cut on its fastest frame; B's first frame is already moving (a card 105 px into its slide, a modal at 1.42x already zooming out). 0-3 empty frames allowed if the vector continues | any boundary, by default |
| 2 | **Carried-object match cut** | one object at the same position (within ~0.02-0.03), scale, colour and velocity on both sides: a caret, dot, card, headline, cursor spot or ground colour | you want two shots to read as one take |
| 3 | **The effect becomes the next ground** | A's last action grows to fill the frame: a bead growing 1.5-2.2x per 0.05 s (17x total) into a disk, a band sweeping across, a feathered wash | the ground or act changes |
| 4 | **Feathered wipe painted in B's ground** | feather 0.31-0.42 of the axis, 0.56-0.6 s; starts 0.1-0.2 s before the voice line ends; B's hero enters 0.1-0.12 s before the wipe completes; rotate wipe directions across the film | two content-heavy scenes meet |
| 5 | **Scale cut or camera snap** | scale changes in one frame (e.g. 3.7x) with a content change in the same frame; or a one-frame snap at ratio 0.56-0.77, then a 0.3-0.6 s `softLand` tail | a new distance on the same subject |
| 6 | **Whip** | median 8 f, peak speed at t 0.25, peak ~13% W per frame; the cut lands at peak speed and B continues the vector; a constant-size anchor rides the pan | moving between regions of one UI |
| 7 | **Container replacement** | A's box contracts ~9% on `gentleIn` (biggest step last), then the new container appears at full size; a 1-frame empty card may hold the slot | a list or input becomes a result |
| 8 | **Clip-edge wipe through text** | a clip edge sweeps through the line in 5 f, accelerating, cutting mid-glyph; or two soft masks with the erase front ~0.1 s ahead of the reveal | a line is replaced by its continuation |
| 9 | **Blur-matched cut** | A's blur ramps over 3-8 f to ~18 px; B starts at least as blurred and resolves over ~8 f | smear films only |
| 10 | **Stepped cell dissolve** | real hard-edged cells 1.5-2.5% W, coverage 90, 60, 35, 10, 0% over ~0.33 s, bottom-up | the brand's texture is pixels or a lattice |
| 11 | **Flat grey dip** | 4 frames: contrast wash 30%, 65%, one flat grey frame, a veil clearing; the object's motion carries across | hiding a light-to-dark flip |

- **Plan each cut as a pair.** Write A's last 6 frames and B's first 6 together: object, position, scale, colour, blur, ground, velocity.
- **Build transitions from shapes already in the film:** the logo's own wave, a cell grid in the brand colour, a dot that is the brand. A generic wipe bar reads as a template.
- **Never** crossfade scenes, flash white or dip to black between scenes. A chapter break is a ground change plus a carried object, never a number or a label.
- **Cut cadence:** music-led films cut on one beat unit (for example 10 f, four times in a row). Voice-led films cut on spoken words.

---

## 8. UI demos

**Content first.** Follow one specific case with stakes, from trigger to result. Use real or plausibly specific content: the real icon, sender, time and sentence. When the product "thinks", show an object from the customer's world or the real log, never an orb or sparkle. A feature tour of equal cards is a slide deck.

### 8.1 Camera

| Move | Numbers |
|---|---|
| Magnify the proof | a modal, rail or dashboard at 1.4-2x; one card or button at 2.3-4.4x. Keep the top and bottom ~28% of the frame free |
| Reveal by pulling back | a slow creep (3.31x to 3.01x over ~12 f), then a one-frame snap at ratio 0.56-0.77, then a 9-18 f `softLand` tail. Release the pull ~12 f (0.40 s) after the last completion beat |
| Push or pull size by length | punch of 6 f or less: 1.26x; 7-18 f: 1.39x; 19-45 f: 1.52x; slow drift: 2.4x; reveal pull: ~1.8x on an ease-in |
| Pan | two pushes with different accelerations, never one ease. Layers move at 2-2.4x speed ratios for parallax |
| Never fully still | the camera or UI plane keeps moving at least ~0.003 H/f (~1 px/f), or something else moves |
| Backdrop UI | blur 4 px (still readable), 7-15 px for non-hero panels, at most ~11 px behind a headline. The headline is never blurred. Defocus by blur, not opacity |

- **One camera group.** Card, panels, chips and video move as one transform. The background stays screen-fixed. Text is never zoomed on its own track.
- **No browser chrome:** no title bar, URL bar, traffic lights or bezel. The plane still carries the product's identity.

### 8.2 Cursor

- **Custom art, one family per film,** 0.04-0.06 W at rest. Choose arrow-only or pose-swap, never both. Never the OS cursor or an I-beam.
- **Enter oversized:** 1.5-5x, scaled about the tip. ~60% of the travel happens in the first frame, then a `snapSettle` tail. Total 0.5-0.9 s.
- **Curve the path** and rotate the heading with it. A straight constant-speed line is the macro tell. Straight lines are only for drags.
- **Park before acting:** 2 f for an obvious button, 3-5 f for a switch, 5-15 f when the camera must zoom first. Finish any zoom before the press.
- **Layering:** the cursor lives on its own top layer, outside the camera group, with its own scale (for example 1.5x when the UI zooms 2.33x). Exactly one instance at a time.

### 8.3 Press feedback

| Part | Numbers |
|---|---|
| Cursor | 2 f down to 0.71-0.90 scale, tip pushed down ~0.03 H, 3 f back to 1.0 |
| Target | reacts 0-1 f after the cursor's lowest frame, squeezing to 0.63-0.81 (0.97 for a quiet close-up) |
| Shape | fast squeeze, slower release. At most one rebound style per film (to 1.05 over ~10 f on `popOver`) |
| Response | a hard colour step on the target, a glow peaking at 35 px blur and 40% ~7 f after the press then decaying over ~0.3 s, or a sheen crossing the button in 7-16 f |
| Never | a ripple ring or a white flash as the default click |
| CTA click | cut at maximum compression or before the release. The release is never shown |

### 8.4 Other UI mechanics

| Element | Numbers |
|---|---|
| Toggle | 2 frames: the knob moves, one pale in-between frame, then full colour. No glow, no bounce |
| Cascade off one action | starts ~5 f after the master; 2-3 f per item with uneven gaps (e.g. 4, 3, 3, 3, 2, 2); whole wave 0.6 s or less |
| Checklist | ~0.9 s per row; the icon swaps in one frame; the next row's spinner starts 2-3 f before the previous check |
| Agent "thinking" | status words blur in from 12 px over 4-5 f each, back to back; then two shimmer passes, ~13 f each with a ~6 f gap. No spinner, no dots |
| Dense log as proof of volume | scroll accelerates from ~6 to ~250 px/f over ~1.8 s, no blur; decelerate over ~9 f onto one readable block and hold it ~0.8 s |
| Numbers driven by a control | every number moves every frame on `softInOut`, no overshoot |

---

## 9. Sound sync

Picture follows the voice, never the other way round. If voice and picture disagree, move the picture. Retimed speech sounds wrong.

| Rule | Numbers |
|---|---|
| A word or row tied to a spoken word | lands 0-2 f before the word starts |
| A reveal that must be complete when heard (a name, a wipe) | completes up to 5 f (0.16 s) early |
| A scene transition | starts 3-6 f before the voice line ends |
| Speaking rate | content lines 2.5-3 words/s; sign-off lines 1.2-1.7 words/s |
| On-screen text | never the transcript; show the one or two words that matter |
| Emphasis word | gets a longer gap before it |

- **Pick one mode.** Voice-led: cut on words. Music-led kinetic: cut on a beat grid. Hybrid: grid for cuts, word times for the one spoken line.
- **Beat grid.** Choose one unit g in frames. Every cut and big hit falls on a multiple of g. At 30 fps: 90 BPM = 20 f, 100 BPM = 18 f, 120 BPM = 15 f, 150 BPM = 12 f, 180 BPM = 10 f.

**Phrase-level sound.** These are judged on finished films and set as practice; the sample's audio was mostly not measured.

- **Hits.** Land one to three hand-picked hits: the click, the name, the turn. A hit on every cut makes the few that matter disappear.
- **First big sound.** Tie it to something visible, a click or a lift, or tie the silence to it.
- **Reading.** Pull the music down 6-10 dB while the viewer reads.
- **Before the biggest move.** Drop the music 8-15 dB, or cut it out, for 0.2-0.5 s, and let the move bring it back.
- **Under a voice.** Duck the music ~9 dB under speech: ~80 ms ramp in, ~300 ms ramp out.
- **Sound palette.** Use 3-5 sound kinds and reuse them: one click, one whoosh, one hit, one tick family. Typing gets one quiet texture or a tick per word, never one per character.
- **Placement.** Each sound's transient sits on its event frame. A whoosh starts 3-4 f before peak speed.
- **Delivery.** -14 LUFS integrated, true peak at or below -1 dBTP. The score covers the whole cut, with no silent tail. Re-fit the music after any trim.
- **Silence** is a valid choice for a muted social piece. Decide it; never default to it.

---

## 10. The close

| Rule | Numbers |
|---|---|
| End hold (the lockup has landed, nothing new happens) | 0.6-1.4 s. Under 0.6 s ends mid-motion, which is fine when intended |
| Final shot / CTA beat | at most 25% of the film (4.0 s of 16 s) |
| Mark arrival | starts at 1.5-3.75x its rest size and comes down; never grows from zero, never fades up |
| Measured crash-in | 3.75x, 39% of the drop in frame 1, 86% by frame 6, 1.0 at frame 20 (0.67 s), then a creep to ~0.93 |
| Calm brand | the mark may arrive at ~1.1x on a long ease |
| Something alive during the hold | a creep (1.008 to 1.001 over 2 s), an accelerating contraction in the last 0.2 s, a ±1% W sway, a sweep on a fixed period |
| Tagline | none, or one line at 0.05 H in light grey under the name at y 0.57-0.61 |
| Lockup space | the frame stays ~95% empty around the lockup |

- **The logo arrives by cause:** a click, a result, a camera move, the end of a motion. Never by default.
- **The ending is one beat, usually smaller than the climax.** Spend scale once.
- **Lead into it:** scenes shorten, then the last one lingers (e.g. 1.7, 1.5, 0.8 s, then 1.44 s).
- **End mid-motion or on a designed stillness.** No fade to black by default. A calm brand may end calmly after sustained motion, with the mark already arrived; about 22 of 51 judged human films did.
- **If the film must run longer,** add a proof beat. Never add logo time.
- **No web footer:** logo + tagline + button + URL is a landing page, not an ending.

---

## 11. The slop catalogue

These are what an AI produces when no decision was made. Delete the element; do not argue for it.

| Pattern | Why it reads as slop | Do instead |
|---|---|---|
| **Corner labels:** brand or film name, scene name, timecode, "30 FPS", "BAR 1/8" pinned to an edge | the look of an editing tool, not a film; the viewer does not need your storyboard | nothing in the outer band; identity comes from the world and the logo, once |
| **Chapter counters** like "02 / 05", "01 - THE WAIT", "Step 2" | decks have page numbers; it turns time into pagination | a ground change plus a carried object |
| **Tracked-caps kickers and taglines** above or under a headline | the stock "editorial" eyebrow from web templates | no kicker; one sentence-case line at role size |
| **Held left headline + card deck layout:** a headline block at x < 0.2 with media on the right, or title then content | web-hero and keynote priors; it reads as a slide | one centred line paced to speech, or a split phrase whose far half becomes an object, gone within 1.2 s |
| **Progress bars and hairlines** that fill as the film plays | player chrome stuck on the picture | nothing; rhythm shows progress |
| **Letter-typed headlines** with a caret | makes titles look like a terminal, at a metronomic one char per frame | whole words on the speech rhythm; typing only in the product's own field |
| **Vibe-coded UI cards:** "Good morning" greeting, status dot with "label · value", zinc greys, three-circle toolbar, skeleton bars, invented names | the cheapest signal of "a real product", so it signals the opposite | a magnified fragment of the real UI with its real icon, sender, time and sentence |
| **Fades between every beat** | a crossfade is the default join; the sample has none between scenes | hard cut on motion with a carried object (section 7) |
| **Dead frames:** everything frozen for over ~0.6 s with no payoff and no reason | a locked frame with nothing to read reads as a slide waiting for a click | one living thing (drift, caret, light); or a designed breath of 0.6-1.5 s before a payoff; or cut |
| **Long held end cards:** a logo sitting 3-5 s | a mark registers in ~0.5 s and a name in ~1 s; the rest is waiting | resolved hold 0.6-1.4 s, final shot at most 25% of the film |
| One ease (e.g. 0.6 s ease-out) on every tween | no role decided for anything | a curve per role (section 3) |
| Opacity 0-to-1 fade on every entrance | states shown instead of events | offset, scale or blur decaying over ~12 f; opacity only as a 4-6 f helper |
| A bounce on every pop | overshoot spent everywhere is spent nowhere | under 9% of moves, late `popOver` leans, one visible spring per film |
| A constant 0.1 s stagger | a timer delay reads as a loading list | uneven 1-3 f gaps, overlap ~0.5 |
| Logo grows from scale 0 and fades in | no weight, no cause | starts 1.5-3.75x, scales down on `snapSettle` |
| Smooth global ease-out zoom | reads as a keyframe, not a lens | one-frame snap plus tail; scale cut; two-push pan |
| Ripple ring on every click | the stock click icon | the target squashes 0.63-0.81 one frame later |
| Count-up tween to a round number | looks like a preset | per-frame decaying steps, skipped values, un-round data |
| Invented stats, stat wall, big centred number over a small label | invented proof; a stat slide | show the thing; a number only inside a physical beat with a cause |
| Flat swatch per scene; a small card (~0.3 W) on a void | a deck of colours; "minimalism as a hiding place" | a ground made of something; magnify the fragment |
| Near-black, radial glow, gold spark, serif-italic accent word | "premium" pastiche | the brand's own ground (light grounds are as premium); one type family |
| A pill or dock pinned at the same spot across 3+ shots | a "carrier" taken literally | a carrier that moves, scales or changes role at every seam |
| Slogan copy: "Not just X. It's Y.", one-word triplets, "Meet X", "the future of" | the copy of every launch film | write how the brand speaks, then cut half |
| The name's first association (stars for a star-like name, a rocket for "launch") | the category's costume | one true feature or user moment only this brand owns |
| The overcorrected house style: giant cropped word in every film, a colour flood or circle wipe between beats, a dot that becomes the logo | the second-order default, told "be bold" | legitimate only when it *is* this brand's idea; spend it once |

### 11.1 Honest exceptions

| Usually a tell | Works when |
|---|---|
| Typewriter text with a caret | the product *is* something you type into and the typing happens in its own field, or the caret becomes something (a divider, a letter of the logo). Never a headline |
| Centred still end card | it follows sustained motion, echoes the opening, the logo arrived by cause, and it holds 0.6-1.4 s |
| Dissolve or blur transition | it copies a real focus pull, scroll or whip; or the dissolve is the meaning; or the brand is calm. Never between every scene |
| Fade to black, calm ending | the brand is calm and the film breathed throughout |
| Mostly empty frame, small text | exactly one subject, something leads the eye, it lasts under ~1.5 s, and it is not at phone size |
| Slide grammar: centred line, flat field, cuts | paced to a voice, the type never moves position, and a second visual voice (a cursor, an object) adds wit |
| A number counting up | it is the real offer, its size is the point, and it is tied to the control that causes it |
| Glow or soft gradient | it is the brand's own material, or one light source with a job. Never wallpaper under every scene |
| Serif in a sans film | it is the brand's own heading face, or one deliberate second voice used rarely and large |
| Giant cropped word | the idea wants that word huge, it arrives once with a cause, and scale is not spent again |
| Low frame rate, no blur | used consistently as a chosen texture (an on-twos film) |
| A held frame | a designed breath of 0.6-1.5 s with a stated reason, before a payoff or after a matched cut |
| Page chrome (labels, counters, timecodes, kickers, progress bars) | **never**; there is no condition |

---

## 12. Verify with numbers

Run the check on every render, draft and final:

```bash
npx activate-agentmd motion check film.mp4
npx activate-agentmd motion check film.mp4 --json                 # machine-readable output
npx activate-agentmd motion check film.mp4 --lufs -16             # change the loudness target
npx activate-agentmd motion check film.mp4 --preset truecut       # a film style's targets: lumen | hanami | hanko-reel | truecut
npx activate-agentmd motion check film.mp4 --hold 1.0             # change the end-hold limit in seconds
```

| Gate | Passes when | If it fails |
|---|---|---|
| **G0 render** | the file decodes; it is not blank (at least 5% of frames have picture content); the picture moves (at least 5% of frames change). It also reports resolution, fps, duration and whether audio is present | there is no film to review yet. Fix the render first |
| **G1 no empty frames** | no run of **more than 3** consecutive flat-field frames (one flat colour, black included) in the middle of the film. A fade from black at the very start or to black at the very end is allowed, and reported | put the next scene's first object on screen before the dive or wipe ends; overlap the entrance and exit by ~2 f |
| **G2 end hold** | the picture is unchanged at the end for **at most 1.4 s**. A trailing fade to black does not count as hold | trim the hold. If the film is too short, add a proof beat, not logo time. A slow contraction does not excuse a long hold |
| **G3 final shot** | the last shot (last detected cut to the end) is **at most 25%** of the film. Cut detection is an estimate | shorten the close, or cut inside it on motion |
| **G4 loudness** | integrated loudness within **±1 LU** of the target (default -14 LUFS; `truecut` uses -16) and true peak **at or below -1 dBTP**. Skipped when the film has no audio | re-mix to the target; pull the loudest hit down |

**A held picture is not an empty frame.** G1 looks for flat fields: one colour, nothing on screen. A held, unchanging shot after a key line is good craft and passes.

**Motion note (never a gate).** The check prints the film's mean frame-to-frame change and compares it with the measured human band: median 6.8, IQR 4.4-9.8, on a 96x54 luma frame. Below the band, ask what is alive between beats. Above it, ask whether the film is too busy to read. Calm brand films sit below the band on purpose.

**Passing is a floor, not taste.** The gates catch broken renders, empty frames, long end cards and bad loudness. They cannot see readability or composition. Judge two things by eye on a contact sheet:

```bash
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 film.mp4); ffmpeg -v error -i film.mp4 -vf "fps=16/$d,scale=480:-1,tile=4x4" -frames:v 1 -y sheet.jpg
```

That gives 16 evenly spaced frames on one image. Then:

1. **Describe every frame in one sentence:** what is on screen, what is the hero, would it pass as a slide? A frame you cannot describe has no hero. A sentence that starts "a card on a flat colour" is a deck frame.
2. **Proof readability:** in each proof frame, is the readable text at least 0.04 H, and does the fragment fill at least 0.55 W or get cropped by the edge?
3. **One hero per frame:** count the panels. Two are allowed only if one is at least 2x the other's area, or the camera moves between them.
4. **Page chrome:** scan the outer band of every frame for labels, counters, kickers and progress bars.
5. **Cover tests:** cover the text; does each frame still show a picture? Cover the logo; could this be a competitor's film?
6. **Real speed:** watch once at speed. Is the reading time enough, and where does the film breathe?

Report what you checked and quote the numbers the check printed. Never call your own film good.

---

## 13. Checklist

- [ ] Every frame is a pure function of `t`; no timers, unseeded randomness or wall-clock animation.
- [ ] Each beat has one role (hook, turn, proof, CTA) and one written belief; at most 25% are "the point".
- [ ] Default durations: translate and scale 12 f, opacity 6 f, blur 7 f, exits 10-14 f; CTA supporting moves 6 f.
- [ ] At least four curve roles: landings ease out, exits accelerate, drift is linear, counters and typing are stepped.
- [ ] Overshoot on under ~9% of moves, late; one visible spring in the whole film at most.
- [ ] Staggers are uneven 1-3 f (words 2-12 f), overlapping ~0.5; CTA groups ~8 f.
- [ ] Entries move (offset, scale, blur); opacity is only a 4-6 f helper; no scene crossfades.
- [ ] One blur grammar (smear, crisp or shutter) and one frame clock for the whole film.
- [ ] Words arrive whole; holds meet the reading floor (0.45 s, ~0.2 s per word).
- [ ] Readable text at least 4% H; headlines 7-11% H; hierarchy by size, not weight; one accent with one meaning.
- [ ] One hero per frame; proof text at least 0.04 H and the fragment at least 0.55 W or edge-cropped.
- [ ] No text in the outer 0.12 W / 0.10 H band; grounds are surfaces, not swatches.
- [ ] Every cut is planned as a pair, lands on motion and carries one object across.
- [ ] Cursor is custom, enters oversized, curves, parks, then presses; target reacts 0-1 f later; no ripple ring.
- [ ] Text lands 0-2 f before its spoken word; 1-3 hand-picked hits; music down while reading, cleared before the biggest move.
- [ ] The logo arrives by cause from oversize; end hold 0.6-1.4 s; final shot at most 25% of the film.
- [ ] Nothing from the slop catalogue unless a listed exception applies, and never page chrome.
- [ ] `motion check` G0-G4 pass, the motion note is answered, and the contact sheet was read frame by frame.
