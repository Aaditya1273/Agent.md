---
targetModels:
  - "Claude Opus 5.5"
  - "Claude Fable 5.1"
  - "Claude Sonnet 5"
  - "Claude 5 Family"
name: truecut
category: Motion
description: TRUECUT, the live-proof demo — one honest screen recording of a real app or AI agent edited into a 60–120 s launch demo with a measured camera, labelled fast-forwards, voice-over and a ducked music bed.
license: MIT
author: Agent.md maintainers
last-verified: 2026-10-05
reviewed-by: unreviewed
---

# TRUECUT — the Live-Proof Demo System

> **Every frame is the real product. The edit is what makes it look expensive.**
> A complete spec for turning one honest screen recording of a working app or AI agent into a
> 60–120 second, launch-grade demo: bright branded canvas, a camera that glides to whatever matters,
> captions that never cover the product, compressed waiting time that admits it is compressed,
> a narrated voice and a ducked music bed. Hand this file and a product to a person or an AI agent
> and they can rebuild the RELAY demo for anything.

| | |
|---|---|
| **Output** | 1920×1080, 30 fps, H.264 (CRF 17), AAC 192 k, about −16 LUFS, 60–120 s |
| **Stack** | Playwright (record) · Python + numpy (measure, edit) · headless Chromium (design assets) · ffmpeg (everything else) · any TTS |
| **Cost** | Free. No editor timeline, no stock footage, no paid plug-ins |
| **Reference build** | RELAY demo, *OpenClaw 2.0 hackathon* (91 s, Final Five). Every number below comes from that build |
| **Time** | Half a day for the first film; about two hours for each re-cut |

---

## Contents

1. [The eight laws](#1-the-eight-laws)
2. [Story: the 90-second shape](#2-story-the-90-second-shape)
3. [Writing the voice-over](#3-writing-the-voice-over)
4. [Visual system](#4-visual-system)
5. [Camera system](#5-camera-system)
6. [Time system](#6-time-system)
7. [Sound](#7-sound)
8. [Pipeline and project layout](#8-pipeline-and-project-layout)
9. [Stage 1 — Record](#9-stage-1--record)
10. [Stage 2 — Measure](#10-stage-2--measure)
11. [Stage 3 — Design assets](#11-stage-3--design-assets)
12. [Stage 4 — Edit](#12-stage-4--edit)
13. [The thumbnail](#13-the-thumbnail)
14. [Pitfalls we hit, and the fixes](#14-pitfalls-we-hit-and-the-fixes)
15. [Quality gate](#15-quality-gate)
16. [Adapting TRUECUT to a new product](#16-adapting-truecut-to-a-new-product)
17. [Brief for an AI agent](#17-brief-for-an-ai-agent)

---

## 1. The eight laws

1. **Real or nothing.** Every pixel of product UI comes from one recording of the real product doing real work. Nothing is re-ordered, mocked or regenerated. If a step fails on camera, fix the product and record again.
2. **Never cover the product.** The app lives in a rounded window. Captions, badges and labels live in the band *below* the window, never on top of it.
3. **One camera grammar.** Every scene moves the same way: overview → input → answer → overview. Viewers learn the rhythm in scene one and then just watch.
4. **One speed for every move.** Each camera move takes 0.9 s with smoothstep easing. Nothing snaps, nothing drifts.
5. **Frame the content, not the screen.** Zoom targets are measured from the pixels (where the reply actually is), not guessed coordinates.
6. **Compress waiting, and say so.** Model thinking time is squeezed to 1.3 s and labelled with its real speed-up ("fast-forward · AI thinking 23×"). Honest speed-ups build trust; hidden ones destroy it.
7. **Voice leads, picture follows.** A scene lasts at least as long as its narration, plus breathing room. Extra time holds on the answer, never on a spinner.
8. **The film matches the product.** Light product → light film. Same fonts, same paper colour, same accent. The edit should feel like the product's own keynote.

---

## 2. Story: the 90-second shape

| Part | Length | Job |
|---|---|---|
| **Title card** | 7 s | Name, one-line promise, three proof chips ("real recording", platform, licence) |
| **Scenes 1–3: the core loop** | ~10 s each | The product's main value, shown with different people/inputs so it feels multiplayer and real |
| **Scene 4: closing the loop** | ~8 s | The task is resolved, with evidence |
| **Scene 5: the wow moment** | ~12 s | The thing nobody else does (RELAY: two teammates give conflicting deadlines, the agent catches it) |
| **Scenes 6–7: trust** | ~8 s each | Safety: it drafts but never acts without approval; it tells the truth when it cannot do something |
| **End card** | 8.5 s | Name, promise, repo and listing URLs, three chips |

Rules:
- **One idea per scene.** If a caption needs "and", split the scene.
- **Number the scenes** (1–7 tiles on the captions). Numbers make a demo feel structured and finite.
- **Put the wow moment at about 60 %.** Early enough that viewers who drop off see it, late enough to be earned.
- **End on trust, not features.** The last product scene should answer "can I let this loose on my team?"

Script the inputs as a table before recording. RELAY's was:

```
id          speaker   new session?  message
aaditya     Aaditya   yes           Aaditya here: I'll send Anu the investor update tonight.
priya       Priya     yes           Priya here: Acme says export is broken again.
meera       Meera     yes           Meera here: What are we on the hook for?
resolve     Aaditya   no            Sent Anu the update.
conflict_a  Meera     no            Meera here: Rahul said he'll send the signed term sheet by Friday.
conflict_b  Aaditya   no            Aaditya here: Rahul is sending the term sheet next Monday, not Friday.
draft       Meera     no            Draft a follow-up to Acme.
approve     Aaditya   no            Aaditya here: approve A-1
```

Short, human, specific names and objects. Inputs a real user would really type.

---

## 3. Writing the voice-over

- **One line per scene, 8–20 words.** It says *why it matters*; the picture already shows *what happens*.
- **Present tense, active voice, no hype words.** "RELAY keeps both versions and asks" beats "RELAY intelligently resolves conflicts".
- **Never narrate a claim the footage doesn't prove.** If the agent did not send the email, the voice does not say it did.
- **Title VO** states the problem; **end VO** states the promise and where to get it.
- **Store it as data**, one file per part (`vo/script.json` → `vo/trim/<part>.wav`), so timing is recomputed when words change.

TTS notes (from the reference build):
- Send **plain text only.** A style prompt ("say this warmly:") gets read aloud.
- Some TTS endpoints return **raw PCM**, not WAV. Decode with `ffmpeg -f s16le -ar 24000 -ac 1 -i out.pcm out.wav`.
- Free tiers can be ~10 requests/day per model. Generate every line once, cache the files, and only regenerate lines that change.
- Trim leading/trailing silence (`silenceremove`) so placement is exact.
- One deep, calm voice for the whole film (reference: Gemini TTS, voice *Charon*).

---

## 4. Visual system

### 4.1 Colour tokens

Take them from the product UI with a colour picker, then name them:

| Token | Reference value | Use |
|---|---|---|
| `INK` | `#1d1d1f` | Headlines, logo mark |
| `MUTED` | `#6e6a64` | Caption subtitles, URLs |
| `ACCENT` | `#f5654a` (coral) | Scene number tiles, fast-forward badge, one highlighted word |
| `PAPER` | `#f5f2ec` | Canvas base |
| Canvas gradient | `#f8f6f1 → #f5f2ec → #efe9df`, 160° | Background |
| Glow A | accent at 10 % alpha, 900 px radial, top-left, partly off-canvas | Warmth |
| Glow B | `rgba(74,124,245,.08)`, 1000 px radial, bottom-right | Depth |
| Live dot | `#e5484d` with a 5 px 15 % halo | "Live recording" badge |

### 4.2 Typography

- **Inter** 400–900 for everything human; **JetBrains Mono** 500/800 for badges, chips, numbers and code-ish labels.
- Load from Google Fonts with `display=block` and wait for `document.fonts.ready` before every screenshot. (Local `file://` fonts are blocked inside `setContent`, and you get a serif fallback.)
- Title: 170 px / 900 / letter-spacing −6 px. Tagline: 60 px / 800 / −1.5 px. Sub-line: 30 px / 500 muted.
- Caption title 31 px / 700; caption sub 22 px / 500 muted; badges 22 px mono.

### 4.3 Layout (1920×1080)

```
┌──────────────────────────────────────────────────────────────┐
│ canvas (gradient + two glows)                                │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ product window  x=160 y=40  w=1600 h=900  r=22       │   │
│   │ (recording, camera-moved, rounded by an alpha mask)  │   │
│   └──────────────────────────────────────────────────────┘   │
│   [3] Meera · a third chat          ● Live recording · real  │
│       asks what the team owes…        (or ▶▶ fast-forward)   │
└──────────────────────────────────────────────────────────────┘
```

- Window shadow: `0 2px 6px rgba(40,30,20,.06), 0 30px 80px rgba(40,30,20,.16)`; 1 px inner border `rgba(0,0,0,.07)` drawn as a separate overlay.
- **Caption card**, bottom-left at `y = 40+900+22`: 58 px accent tile with the scene number (radius 16), then title and sub. White, radius 22, shadow `0 8px 28px rgba(40,30,20,.12)`.
- **Status badge**, bottom-right: white pill "● Live recording · real <PRODUCT> agent", swapped for an accent pill "▶▶ fast-forward · AI thinking N×" while time is compressed.

### 4.4 Cards (title and end)

Centred column on the same canvas: logo mark + wordmark, tagline, sub-line, three chips. Each row rises 26 px and fades in over 0.9 s with `cubic-bezier(.16,1,.3,1)`, staggered at 0.15 / 0.55 / 0.85 / 1.15 s. The end card swaps the sub-line for `github.com/<you>/<repo> · <listing URL>`.

### 4.5 Logo mark (if the product has none)

Rounded square in `INK` (radius 26 % of size), a mono **first letter** in white at 60 % size nudged 3 % left, and an accent dot (17 % size) in the bottom-right corner with an `INK` ring. Reads at 16 px and at 150 px.

---

## 5. Camera system

Every product turn uses four keyframes:

| Keyframe | When | Target |
|---|---|---|
| `OVERVIEW` | turn start | `z=1.0`, centre `(960,540)`: the whole app |
| `COMPOSER` | 0.2 s before typing starts | the input box (measured), `zmax 1.6`, 40 px headroom above it |
| `REPLY` | 0.1 s after the compressed wait ends | the box from the newest user bubble down to the end of the reply (measured) |
| `OVERVIEW` | 0.9 s before the turn ends | back to the whole app |

**Framing a box** with identical padding everywhere:

```python
def frame_box(box, pad_x=110, pad_y=90, zmin=1.2, zmax=1.85):
    x0, y0, x1, y1 = box
    w, h = (x1 - x0) + 2 * pad_x, (y1 - y0) + 2 * pad_y
    z = max(zmin, min(zmax, 1920 / w, 1080 / h))
    return (round(z, 3), (x0 + x1) / 2, (y0 + y1) / 2)
```

**Moves are smoothstep curves**, written as one ffmpeg expression per axis, so the camera is computed per frame with no keyframe tool:

```python
MOVE = 0.9
def camera_expr(keys, off):
    """keys: [(t, (z, cx, cy))] in turn time; returns zoompan z/x/y for input time it+off."""
    T = f'(it+{off:.3f})'
    def track(i):
        e = f'{keys[0][1][i]}'
        for (t, v), (_, pv) in zip(keys[1:], keys[:-1]):
            d = v[i] - pv[i]
            if abs(d) > 1e-6:
                u = f'clip(({T}-{t:.3f})/{MOVE},0,1)'
                e += f'+({d:.4f})*({u}*{u}*(3-2*{u}))'
        return e
    z, cx, cy = track(0), track(1), track(2)
    x = f"max(0,min(iw-iw/zoom,2*({cx})-iw/zoom/2))"   # ×2: frames are supersampled
    y = f"max(0,min(ih-ih/zoom,2*({cy})-ih/zoom/2))"
    return z, x, y
```

Render chain for a camera-moved shot. Upscale ×2 first, so sub-pixel motion stays smooth and text stays sharp:

```
setpts=(PTS-STARTPTS)/SPEED, fps=30, scale=1920:1080,
scale=3840:2160:flags=lanczos,
zoompan=z='Z':x='X':y='Y':d=1:s=1920x1080:fps=30,
scale=1600:900:flags=lanczos, format=rgba
```

Do **not** animate with `crop` + `scale`. Per-frame size changes make ffmpeg clamp the crop to the left edge and the camera "slides" sideways.

---

## 6. Time system

| Constant | Value | Meaning |
|---|---|---|
| Typing speed | 1.15× | Recorded typing slightly sped up; still readable |
| `THINK` | 1.3 s | Every model wait, whatever its real length, compressed to this |
| Speed-up label | `max(1, real_wait / 1.3)` rounded | Shown on the fast-forward badge |
| Reply window | from `reply_done − 2.2 s` to `reply_done + 1.0 s` at 1× | The answer arriving, in real time |
| Hold | `max(0, VO + 1.1 s − natural length)` | Clone-pad the last frame (`tpad=stop_mode=clone`) |
| Gap between turns in one scene | 0.6 s | |
| Scene tail | 1.2 s | |
| Crossfade between parts | 0.45 s `xfade=fade` | |
| VO start | part start + 0.35 s | |

Each turn is cut into three segments, each rendered with the same camera expression shifted by its offset:

1. **a**: open/typing → sent, at 1.15×
2. **b**: sent → reply visible, at `real_wait / 1.3` speed, fast-forward badge
3. **c**: reply → end, at 1×, plus hold

Segments of a scene are concatenated with `-c copy`; scenes and cards are joined with an `xfade` chain, recording each part's start time in `build/timeline.json` for audio placement.

---

## 7. Sound

- **Voice** at full level, each line placed at its part start + 0.35 s (`adelay=ms:all=1`), mixed with `amix=normalize=0`.
- **Music bed** at 0.20 volume, 2 s fade in, 3 s fade out, **side-chain ducked under the voice**:

```
[music]volume=0.20,afade=t=in:d=2,afade=t=out:st=END-3:d=3[bed];
[vo]asplit[vo1][vo2];
[bed][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[duck];
[duck][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]
```

- Target about −16 LUFS integrated (reference measured −15.7). Check with `ffmpeg -i out.mp4 -af ebur128 -f null -`.
- No sound effects needed. Clicks and whooshes cheapen a calm product demo.
- Use music you own or generated yourself, never an unlicensed track.

---

## 8. Pipeline and project layout

```
<product>-video/
├── record.cjs        # Stage 1: drives the real app, writes raw.webm + marks.json
├── focus.py          # Stage 2: measures composer and reply boxes per turn → build/focus.json
├── assets/
│   ├── build.cjs     # Stage 3: canvas, mask, frame, captions, badges, title/end frame sequences
│   ├── badge.cjs     # renders one fast-forward badge with its real speed-up
│   └── music.wav
├── vo/
│   ├── script.json   # one line per part
│   ├── gen.mjs       # TTS → vo/trim/<part>.wav
│   └── trim/
├── edit.py           # Stage 4: segments, camera, captions, xfades, audio mix → final mp4
├── brand/thumb.cjs   # thumbnail
└── build/            # intermediate files (safe to delete)
```

```bash
node record.cjs                 # 1. record (needs the product running)
python3 focus.py                # 2. measure
node assets/build.cjs           # 3. design assets (re-run when copy changes)
node vo/gen.mjs                 #    voice (cached; re-run only for changed lines)
python3 edit.py                 # 4. edit → <PRODUCT>-demo.mp4
node brand/thumb.cjs            #    thumbnail
```

Change a word in a caption → re-run 3 and 4 only. Change a line of VO → regenerate that line, re-run 4. Re-record → re-run 2 and 4.

Secrets: the recorder and TTS read keys from a git-ignored `.env.local` through a loader that never prints values. The workspace is never committed with keys inside.

---

## 9. Stage 1 — Record

Goal: one continuous `raw.webm` at 1920×1080 of the real app, plus a `marks.json` of timestamped events.

**Event marks per turn** (seconds from recording start):

| Event | Meaning |
|---|---|
| `open_session` / `new_session` | the chat for this speaker is opened or created |
| `type_start` | first keystroke |
| `sent` | message submitted |
| `reply_done` | the agent's reply is complete on screen |

Plus one `intro.ready` mark when the app first settles. The editor is driven entirely by these marks.

Recorder rules:
- **Playwright with `recordVideo`** at the exact output size; light colour scheme; device scale 1.
- **Inject a custom cursor.** Recorded browser video has no pointer. Add a fixed-position SVG arrow that follows `mousemove` with a short CSS transition, and a small ring pulse on click. Move the mouse along eased paths, never teleport.
- **Type like a person**: `type(text, { delay: 35–55 ms })`, a short pause before sending.
- **Detect completion from the source of truth, not the DOM.** Streaming UIs re-render; poll the agent's session transcript (RELAY: `openclaw sessions tail`, polled, since `--follow` output was buffered) until the turn is final, then wait ~0.8 s for the UI to settle and stamp `reply_done`.
- **Match UI elements robustly**: by role and visible text, and match sidebar links by ID suffix (slugs change).
- **Hide the operator**: no devtools, no bookmarks bar, no personal tabs, clean seed data with fictional names.
- **Record the whole script in one take.** If one turn goes wrong, fix the product or prompt and re-record everything, so continuity holds.

---

## 10. Stage 2 — Measure

The camera should frame *what changed*, so measure it from pixels at the marked times.

- **Input box**: at `type_start + 1 s`, inside the chat column, find the longest run of rows that are near-white (`min(RGB) ≥ 246`) across at least 400 px. Its bounding columns are the box.
- **Reply box**: at `reply_done`, start from the newest user bubble (detect its tint, e.g. pink `r ≥ 244, r−g ≥ 14, b−g ≥ 5`) and extend down to the last row of "ink" (pixels differing from the page background by > 60) above the input box. Drop trailing marks narrower than 45 px; that's the parked cursor, not text.
- Write `{turn: {"composer": [x0,y0,x1,y1], "reply": [...]}}` to `build/focus.json` and print it. Eyeball the numbers once.

Grab a single frame as an array:

```python
def frame(t):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', RAW, '-frames:v', '1',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(out, np.uint8).reshape(1080, 1920, 3).astype(int)
```

Adapt the colour rules to your product's theme. The idea transfers; the thresholds don't.

---

## 11. Stage 3 — Design assets

All graphics are **HTML rendered to PNG by headless Chromium**, so they use real web fonts and CSS shadows and match the product exactly.

- Static layers (transparent PNG, `omitBackground: true`): `bg.png` (canvas + window shadow, opaque), `frame.png` (window border), `live.png`, `cap_<scene>.png`, `ff_<n>.png`.
- `mask.png`: 1600×900, black with a white rounded rectangle; used with `alphamerge` to round the window.
- **Animated cards as frame sequences**: load the card, then for each frame pause every animation and seek it:

```js
for (let f = 0; f < Math.round(dur * 30); f++) {
  await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), (f / 30) * 1000);
  await page.screenshot({ path: `${dir}/${String(f).padStart(4, '0')}.png` });
}
```

Then `ffmpeg -framerate 30 -i title/%04d.png -c:v libx264 -crf 17 -pix_fmt yuv420p title.mp4`. This is deterministic: the same frames every render, no dropped frames.

Card lengths must cover their voice-over: title 7.0 s, end 8.5 s in the reference. If the VO is longer, lengthen the card, not the speech rate.

---

## 12. Stage 4 — Edit

Per segment, one ffmpeg call composites, in order:

```
[0] raw.webm cut + retimed + camera → scaled to 1600×900, rgba  [scr]
[1] mask.png (gray)                                            [m]
[scr][m] alphamerge                                             [win]
[2] bg.png  ← overlay [win] at (160,40)
[3] frame.png overlay
[4] caption PNG overlay; on the scene's first segment: fade in 0.45 s and rise 18 px (cubic ease-out);
    on its last: fade out 0.35 s
[5] badge PNG overlay (live, or this turn's fast-forward badge)
→ yuv420p, libx264 CRF 17, 30 fps, no audio
```

Then:
1. Concatenate a scene's segments (`-f concat -c copy`).
2. Chain `title → scenes → end` with `xfade=transition=fade:duration=0.45`, logging each part's start.
3. Build the audio (Section 7) against those starts.
4. Mux with `-c copy -shortest -movflags +faststart`.

The final command prints `<file> <seconds>`; store `timeline.json` next to it for QA.

---

## 13. The thumbnail

1280×720, same palette and fonts, built with the same HTML → PNG step.

- **Left 55 %**: logo + wordmark (56 px), a three-line headline at 98 px / 900 / −4 px tracking, with **one word in the accent colour**, a 34 px payoff line, three pill chips (one inverted in `INK` reading "real demo").
- **Right 45 %**: a frosted card rotated 3°, showing **verbatim** messages and the agent's reply copied from the recording, never paraphrased.
- **A sticker**: an accent pill rotated −4°, bottom-right, asking the question the wow moment answers ("Friday or Monday?").
- Two soft glows (accent top-left, blue bottom-right) like the canvas.
- Check it at 320×180. If the headline isn't readable at that size, cut words.

---

## 14. Pitfalls we hit, and the fixes

| Symptom | Cause | Fix |
|---|---|---|
| Zoom slides to the left edge | `crop` with per-frame size changes clamps | Use `zoompan` on ×2 supersampled frames |
| Camera frames empty space | Guessed coordinates | Measure boxes from pixels (Stage 2) |
| Serif text in graphics | `file://` fonts blocked in `setContent` | Google Fonts + `display=block` + `document.fonts.ready` |
| VO reads "say this calmly" aloud | Style prompt sent to TTS | Plain text only |
| VO is static noise | Endpoint returned raw PCM | Decode as `s16le`, 24 kHz, mono |
| VO overlaps the next scene | Scene shorter than its line | Scene ≥ VO + 1.1 s; hold the reply frame |
| Recorder waits forever | Streaming CLI output buffered | Poll the transcript instead of following it |
| Agent claims something it didn't do | Prompt let the model narrate instead of act | Fix the product, re-record; never "fix it in the edit" |
| Thumbnail quotes don't match the video | Paraphrased copy | Copy replies character-for-character from the recording |
| Gateway won't restart between takes | Lease keyed on hostname | Pin the hostname in compose |

---

## 15. Quality gate

Watch the final file once, start to finish, at full screen, then check:

- [ ] Every product frame comes from `raw.webm`; nothing staged, mocked or re-ordered
- [ ] No caption or badge ever covers the app window
- [ ] Every camera move is 0.9 s and eased; no jumps at segment joins
- [ ] Each fast-forward badge shows the real speed-up
- [ ] No VO line overlaps another or runs past its scene
- [ ] Voice is clear over the music; loudness ≈ −16 LUFS; no clipping
- [ ] All text is readable on a phone (watch it at 360 px wide)
- [ ] Title and end cards: fonts loaded (no serif), chips aligned, URLs correct and live
- [ ] Names, emails and keys are fictional or absent
- [ ] The thumbnail quotes match the video word for word
- [ ] Length 60–120 s; the wow moment lands before 70 %

---

## 16. Adapting TRUECUT to a new product

1. **Pick the palette and fonts** from the product (Section 4) and update the tokens in `build.cjs` and `thumb.cjs`.
2. **Write the script table** (Section 2): 5–8 turns, one idea each, a wow moment, a trust ending.
3. **Write one VO line per part** (Section 3) and the caption title/sub for each scene.
4. **Point the recorder** at the product: selectors for the input, send button and new-session control; a reliable "turn finished" signal.
5. **Retune the measurement** colours (Section 10) to the product's background, bubbles and input box.
6. **Record → measure → assets → voice → edit**, and run the quality gate.
7. If the product isn't a chat: keep the grammar (overview → *where the user acts* → *where the result appears* → overview) and measure those two regions instead.

---

## 17. Brief for an AI agent

Paste this with the file:

> Build a demo video of **<PRODUCT>** using the TRUECUT system in `TRUECUT.md`. Follow its eight laws strictly:
> real recording only, nothing over the app window, one camera grammar with 0.9 s smoothstep moves,
> measured framing, compressed waits labelled with their real speed-up, scenes at least as long as their voice-over.
> Use the product's own colours and fonts. Script: <5–8 turns, the wow moment, the trust ending>.
> Deliver `<PRODUCT>-demo.mp4` (1920×1080, 30 fps, ≈ −16 LUFS, 60–120 s), a 1280×720 thumbnail quoting the
> recording verbatim, and the filled quality-gate checklist. If any step of the product fails on camera,
> stop and report it; do not fake it in the edit.

## Verify the render with numbers

Before you call the film done, measure it. Run:

```bash
npx activate-agentmd motion check out/film.mp4 --preset truecut
```

It checks this style's delivery targets (about −16 LUFS, no clipping, 30 fps) and the gates every Motion film shares: the render decodes and moves (G0), no empty frames mid-film (G1), a short end hold (G2), the final shot's share of the film (G3), and loudness (G4). It exits 1 on a failure, so it can gate a CI job. Passing is a floor, not taste: judge proof readability and one hero per frame by eye on a contact sheet. The timing and anti-slop rules behind these gates are in the `motion-craft` standard.
