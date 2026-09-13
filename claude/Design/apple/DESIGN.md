---
version: alpha
name: Apple-design-analysis
description: A photography-first interface that turns marketing into a museum gallery, updated for Apple's 2026 Liquid Glass design language. Edge-to-edge product tiles alternate light and dark canvases, framed by SF Pro Display headlines with negative letter-spacing and a single Action Blue (#0066cc) interactive color. UI chrome recedes so the product can speak — no decorative gradients, no shadows on chrome, only the one signature drop-shadow under product imagery. Liquid Glass translucent materials add depth through refraction and dynamic tinting on iOS 26+ and visionOS surfaces.

colors:
  primary: "#0066cc"
  primary-focus: "#0071e3"
  primary-on-dark: "#2997ff"
  ink: "#1d1d1f"
  body: "#1d1d1f"
  body-on-dark: "#ffffff"
  body-muted: "#cccccc"
  ink-muted-80: "#333333"
  ink-muted-48: "#7a7a7a"
  divider-soft: "#f0f0f0"
  hairline: "#e0e0e0"
  canvas: "#ffffff"
  canvas-parchment: "#f5f5f7"
  surface-pearl: "#fafafc"
  surface-tile-1: "#272729"
  surface-tile-2: "#2a2a2c"
  surface-tile-3: "#252527"
  surface-black: "#000000"
  surface-chip-translucent: "#d2d2d7"
  on-primary: "#ffffff"
  on-dark: "#ffffff"

system-colors:
  red: "#FF3B30"
  red-dark: "#FF453A"
  orange: "#FF9500"
  orange-dark: "#FF9F0A"
  yellow: "#FFCC00"
  yellow-dark: "#FFD60A"
  green: "#34C759"
  green-dark: "#30D158"
  mint: "#00C7BE"
  mint-dark: "#63E6E2"
  teal: "#30B0C7"
  teal-dark: "#40CBE0"
  cyan: "#32ADE6"
  cyan-dark: "#64D2FF"
  blue: "#007AFF"
  blue-dark: "#0A84FF"
  indigo: "#5856D6"
  indigo-dark: "#5E5CE6"
  purple: "#AF52DE"
  purple-dark: "#BF5AF2"
  pink: "#FF2D55"
  pink-dark: "#FF375F"
  brown: "#A2845E"
  brown-dark: "#AC8E68"
  system-gray-1: "#8E8E93"
  system-gray-2: "#AEAEB2"
  system-gray-3: "#C7C7CC"
  system-gray-4: "#D1D1D6"
  system-gray-5: "#E5E5EA"
  system-gray-6: "#F2F2F7"
  system-gray-1-dark: "#8E8E93"
  system-gray-2-dark: "#636366"
  system-gray-3-dark: "#48484A"
  system-gray-4-dark: "#3A3A3C"
  system-gray-5-dark: "#2C2C2E"
  system-gray-6-dark: "#1C1C1E"

liquid-glass:
  background-blur: "20px"
  tint-opacity: "0.45"
  refraction-intensity: "0.8"
  saturation: "180%"
  noise-texture: "0.02"
  transparency-range: "0–100%"
  depth-base-blur: "8px"
  depth-elevated-blur: "20px"
  depth-floating-blur: "40px"
  tint-adaptation: "samples dominant background color"

product-accents:
  iphone-natural-titanium: "#A8A7A2"
  iphone-blue-titanium: "#394C5F"
  iphone-white-titanium: "#F0ECE5"
  iphone-black-titanium: "#3C3B37"
  iphone-desert-titanium: "#BFA48F"
  macbook-space-black: "#1E1E1E"
  macbook-silver: "#E3E4E5"
  macbook-starlight: "#F0E4D3"
  macbook-midnight: "#2E3642"
  imac-blue: "#6B9CDB"
  imac-green: "#AAD4B5"
  imac-pink: "#EAAFB5"
  imac-silver: "#E3E4E5"
  imac-yellow: "#F2D58F"
  imac-orange: "#E8956D"
  imac-purple: "#B4A7D6"
  watch-midnight: "#2B2D33"
  watch-starlight: "#E8DDD0"
  watch-silver: "#D4D4D8"
  watch-product-red: "#C1272D"

typography:
  hero-display:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: -0.28px
  display-lg:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0
  display-md:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.47
    letterSpacing: -0.374px
  lead:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: 0.196px
  lead-airy:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 24px
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0
  tagline:
    fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif"
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.19
    letterSpacing: 0.231px
  body-strong:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.24
    letterSpacing: -0.374px
  body:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.374px
  dense-link:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 2.41
    letterSpacing: 0
  caption:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.224px
  caption-strong:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.29
    letterSpacing: -0.224px
  button-large:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 1.0
    letterSpacing: 0
  button-utility:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.29
    letterSpacing: -0.224px
  fine-print:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.12px
  micro-legal:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: -0.08px
  nav-link:
    fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.12px

rounded:
  none: 0px
  xs: 5px
  sm: 8px
  md: 11px
  lg: 18px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 17px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 11px 22px
  button-primary-focus:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  button-primary-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  button-secondary-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 11px 22px
  button-dark-utility:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-utility}"
    rounded: "{rounded.sm}"
    padding: 8px 15px
  button-pearl-capsule:
    backgroundColor: "{colors.surface-pearl}"
    textColor: "{colors.ink-muted-80}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  button-store-hero:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-large}"
    rounded: "{rounded.pill}"
    padding: 14px 28px
  button-icon-circular:
    backgroundColor: "{colors.surface-chip-translucent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 44px
  text-link:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.body}"
  text-link-on-dark:
    backgroundColor: transparent
    textColor: "{colors.primary-on-dark}"
    typography: "{typography.body}"
  global-nav:
    backgroundColor: "{colors.surface-black}"
    textColor: "{colors.on-dark}"
    typography: "{typography.nav-link}"
    height: 44px
  sub-nav-frosted:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.ink}"
    typography: "{typography.tagline}"
    height: 52px
  product-tile-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  product-tile-parchment:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  product-tile-dark:
    backgroundColor: "{colors.surface-tile-1}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  product-tile-dark-2:
    backgroundColor: "{colors.surface-tile-2}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
  product-tile-dark-3:
    backgroundColor: "{colors.surface-tile-3}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.none}"
  store-utility-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.lg}"
    padding: 24px
  configurator-option-chip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 12px 16px
  configurator-option-chip-selected:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  search-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: 12px 20px
    height: 44px
  floating-sticky-bar:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: 64px
    padding: 12px 32px
  environment-quote-card:
    backgroundColor: "{colors.surface-tile-1}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-lg}"
    rounded: "{rounded.none}"
    padding: 80px
  footer:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.ink-muted-80}"
    typography: "{typography.fine-print}"
    padding: 64px
---

<overview>

## Overview

Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result is a catalog that feels more like a museum gallery: the wall disappears and the artifact takes over.

Store and shop surfaces retain the same chassis but switch modes. The product configurator (iPhone 17 Pro, accessories grid) introduces a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. The environment page leans darker and more editorial. Across all five surfaces the typographic system, spacing rhythm, and the single blue accent are consistent — this is one design language expressed at different volumes.

**2026 Design Language Evolution — Liquid Glass.** Starting with iOS 26 and macOS Tahoe (WWDC 2025–2026), Apple introduced **Liquid Glass** — a translucent material system that replaces flat opaque chrome with refractive, depth-aware surfaces. On-device UI elements (tab bars, navigation bars, sidebars, floating panels) render as glass-like layers that sample and tint the content beneath them, creating a sense of physical depth. The web presence on apple.com has not adopted Liquid Glass wholesale — the marketing site retains its photography-first, flat-tile aesthetic — but product demo pages, embedded app previews, and iOS/visionOS documentation surfaces increasingly reference the material. The `{liquid-glass}` tokens in this package capture the material's properties for use in app-like web surfaces that need to match Apple's native platform feel.

**Key Characteristics:**
- Photography-first presentation; UI recedes so the product can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element on apple.com. No second brand color exists.
- Apple's system color rainbow (`{system-colors}`) powers iOS/macOS app UI — 13 hues plus 6 grays, each with light and dark variants.
- Product marketing pages break the single-accent rule with product-specific finish colors (`{product-accents}`) — titanium, space black, starlight.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- SF Pro Display + SF Pro Text — negative letter-spacing at display sizes for the signature "Apple tight" headline feel.
- Whisper-soft elevation used only when a product image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + product-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm across multiple pages: light hero → dark product tile → light utility tile → dark tile → parchment footer — a predictable pulse.

</overview>

<colors>

## Colors

> **Source pages analyzed:** homepage, environment, store, iPhone 17 Pro buy page, accessories index. The color system is identical across all five surfaces; only the surface-mode mix differs.

### Brand & Accent
- **Action Blue** (`{colors.primary}` — #0066cc): The single brand-level interactive color. All text links, all blue pill CTAs ("Learn more", "Buy"), and the focus ring root. This is Apple's quiet but universal "click me" signal. Press state shifts to a slightly darker variant via the active scale transform rather than a hex change.
- **Focus Blue** (`{colors.primary-focus}` — #0071e3): A marginally brighter sibling of Action Blue, reserved for the keyboard focus ring on buttons (`outline: 2px solid`).
- **Sky Link Blue** (`{colors.primary-on-dark}` — #2997ff): A brighter blue used on dark surfaces for in-copy links and inline callouts, where Action Blue would disappear against the tile background.

### Surface
- **Pure White** (`{colors.canvas}` — #ffffff): The dominant canvas. Content, utility cards, store tiles, configurator grids.
- **Parchment** (`{colors.canvas-parchment}` — #f5f5f7): The signature Apple off-white. Used for alternating light tiles, footer region, and the default page canvas in store utility sections. Just different enough from white to create rhythm.
- **Pearl Button** (`{colors.surface-pearl}` — #fafafc): A near-white used as the fill for secondary "ghost" buttons — lighter than the parchment canvas so the button still reads as a button against `{colors.canvas-parchment}`.
- **Near-Black Tile 1** (`{colors.surface-tile-1}` — #272729): The primary dark-tile surface on the homepage product grid.
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2a2a2c): A micro-step lighter — used where a dark tile sits directly above or below Tile 1 to create the faintest separation.
- **Near-Black Tile 3** (`{colors.surface-tile-3}` — #252527): A micro-step darker — used at the bottom of the stack and in embedded video/player frames.
- **Pure Black** (`{colors.surface-black}` — #000000): Reserved for true void — video player backgrounds, edge-to-edge photographic overlays, the global nav bar background.
- **Translucent Chip Gray** (`{colors.surface-chip-translucent}` — #d2d2d7): The base hex of the translucent gray chip used over photography for circular control buttons. In production, applied at ~64% alpha as `rgba(210, 210, 215, 0.64)`.

### Text
- **Near-Black Ink** (`{colors.ink}` — #1d1d1f): The voice of every headline, every body paragraph, and the dark utility button's fill. Chosen instead of pure black to keep the page feeling photographic rather than printed.
- **Body** (`{colors.body}` — #1d1d1f): Same hex as ink — Apple uses one near-black tone for all text on light surfaces.
- **Body On Dark** (`{colors.body-on-dark}` — #ffffff): All text on dark tiles and on the global nav bar.
- **Body Muted** (`{colors.body-muted}` — #cccccc): Secondary copy on dark tiles where pure white would be too loud.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Body text on the white Pearl Button surface — slightly softer than pure black.
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7a7a7a): Disabled button text and legal fine-print.

### Hairlines & Borders
- **Divider Soft** (`{colors.divider-soft}` — #f0f0f0): The "border" tone on secondary buttons — functions as a ring shadow rather than a hard line. In production, often applied as `rgba(0, 0, 0, 0.04)`.
- **Hairline** (`{colors.hairline}` — #e0e0e0): The 1px hairline border on store utility cards and configurator chips.

### Brand Gradient
**No decorative gradients.** Atmospheric depth on product photography (the iPhone 17 Pro camera plate, the Apple Watch bands, AirPods reflections) is inherent to the imagery, not a CSS gradient overlay. The environment page's hero uses photographic atmosphere (mountain vista at dawn) but no gradient tokens are defined. Apple is the rare luxury-brand site with zero gradient-based design tokens.

</colors>

<system-colors>

## System Colors — Apple's Rainbow Palette

Apple's platform design (iOS, macOS, iPadOS, watchOS, visionOS) uses a **13-hue rainbow system** plus **6 neutral grays**, each with separate light-mode and dark-mode variants. These are the semantic color tokens that power every native app. On the web, they appear on product demo pages, embedded app previews, and any surface aiming to match native platform feel.

### The 13 System Hues

| Name | Light | Dark | Typical Use |
|---|---|---|---|
| **Red** | `{system-colors.red}` #FF3B30 | `{system-colors.red-dark}` #FF453A | Destructive actions, errors, badges |
| **Orange** | `{system-colors.orange}` #FF9500 | `{system-colors.orange-dark}` #FF9F0A | Warnings, activity indicators |
| **Yellow** | `{system-colors.yellow}` #FFCC00 | `{system-colors.yellow-dark}` #FFD60A | Stars, highlights, caution states |
| **Green** | `{system-colors.green}` #34C759 | `{system-colors.green-dark}` #30D158 | Success, completion, health, FaceTime |
| **Mint** | `{system-colors.mint}` #00C7BE | `{system-colors.mint-dark}` #63E6E2 | Fresh/new indicators, wellness |
| **Teal** | `{system-colors.teal}` #30B0C7 | `{system-colors.teal-dark}` #40CBE0 | Communication, connectivity |
| **Cyan** | `{system-colors.cyan}` #32ADE6 | `{system-colors.cyan-dark}` #64D2FF | Information, links in native UI |
| **Blue** | `{system-colors.blue}` #007AFF | `{system-colors.blue-dark}` #0A84FF | Primary actions, navigation, default tint |
| **Indigo** | `{system-colors.indigo}` #5856D6 | `{system-colors.indigo-dark}` #5E5CE6 | Focus, concentration, deep work |
| **Purple** | `{system-colors.purple}` #AF52DE | `{system-colors.purple-dark}` #BF5AF2 | Creativity, personal, Shortcuts |
| **Pink** | `{system-colors.pink}` #FF2D55 | `{system-colors.pink-dark}` #FF375F | Hearts, favorites, feminine accents |
| **Brown** | `{system-colors.brown}` #A2845E | `{system-colors.brown-dark}` #AC8E68 | Outdoors, natural, Maps terrain |

### The 6 System Grays

| Token | Light | Dark |
|---|---|---|
| `{system-colors.system-gray-1}` | #8E8E93 | #8E8E93 |
| `{system-colors.system-gray-2}` | #AEAEB2 | #636366 |
| `{system-colors.system-gray-3}` | #C7C7CC | #48484A |
| `{system-colors.system-gray-4}` | #D1D1D6 | #3A3A3C |
| `{system-colors.system-gray-5}` | #E5E5EA | #2C2C2E |
| `{system-colors.system-gray-6}` | #F2F2F7 | #1C1C1E |

Gray-1 is constant across appearances; grays 2–6 invert — lighter in light mode, darker in dark mode.

### Semantic Label Colors

These are not fixed hexes — they adapt to the current appearance, contrast level, and vibrancy setting.

| Token | Light | Dark | Use |
|---|---|---|---|
| `label` | #000000 | #FFFFFF | Primary text |
| `secondaryLabel` | rgba(60,60,67,0.60) | rgba(235,235,245,0.60) | Subtitles, secondary info |
| `tertiaryLabel` | rgba(60,60,67,0.30) | rgba(235,235,245,0.30) | Placeholder text |
| `quaternaryLabel` | rgba(60,60,67,0.18) | rgba(235,235,245,0.18) | Disabled text |
| `systemBackground` | #FFFFFF | #000000 | Root background |
| `secondarySystemBackground` | #F2F2F7 | #1C1C1E | Grouped content |
| `tertiarySystemBackground` | #FFFFFF | #2C2C2E | Elevated grouped content |
| `separator` | rgba(60,60,67,0.29) | rgba(84,84,88,0.65) | Hairlines, dividers |
| `opaqueSeparator` | #C6C6C8 | #38383A | Non-transparent dividers |

### Dynamic Color Adaptation Rules
- System colors automatically adjust for **accessibility contrast settings** (Increase Contrast) by increasing saturation and darkening light-mode variants.
- On **vibrant backgrounds** (Liquid Glass surfaces), system colors increase saturation to remain legible against blurred underlays.
- In **dark mode**, warm hues (red, orange, yellow) shift slightly toward brighter, more saturated variants to maintain perceived brightness.
- The web equivalent: use CSS `@media (prefers-color-scheme: dark)` to switch between light and dark hex values; use `@media (prefers-contrast: more)` to apply the high-contrast variants.

</system-colors>

<product-accents>

## Product-Specific Color Accents

Apple's web marketing pages break the single-accent rule on **product configurator and hero surfaces**. When a customer is choosing a finish, color, or band, the page adopts that product's actual color palette. These are not brand accent colors — they are photographic finish representations used in color swatches, device renders, and configurator chips.

### iPhone Titanium Finishes
| Finish | Token | Hex | Swatch Use |
|---|---|---|---|
| Natural Titanium | `{product-accents.iphone-natural-titanium}` | #A8A7A2 | Configurator chip fill, hero render tint |
| Blue Titanium | `{product-accents.iphone-blue-titanium}` | #394C5F | Muted steel-blue, reads dark in small swatches |
| White Titanium | `{product-accents.iphone-white-titanium}` | #F0ECE5 | Warm off-white, needs a hairline border on white canvas |
| Black Titanium | `{product-accents.iphone-black-titanium}` | #3C3B37 | Near-black, distinct from `{colors.surface-tile-1}` |
| Desert Titanium | `{product-accents.iphone-desert-titanium}` | #BFA48F | Warm sand tone |

### MacBook Finishes
| Finish | Token | Hex |
|---|---|---|
| Space Black | `{product-accents.macbook-space-black}` | #1E1E1E |
| Silver | `{product-accents.macbook-silver}` | #E3E4E5 |
| Starlight | `{product-accents.macbook-starlight}` | #F0E4D3 |
| Midnight | `{product-accents.macbook-midnight}` | #2E3642 |

### iMac Colors
Seven-color range: `{product-accents.imac-blue}` #6B9CDB · `{product-accents.imac-green}` #AAD4B5 · `{product-accents.imac-pink}` #EAAFB5 · `{product-accents.imac-silver}` #E3E4E5 · `{product-accents.imac-yellow}` #F2D58F · `{product-accents.imac-orange}` #E8956D · `{product-accents.imac-purple}` #B4A7D6.

### Apple Watch Case & Band Finishes
| Finish | Token | Hex |
|---|---|---|
| Midnight | `{product-accents.watch-midnight}` | #2B2D33 |
| Starlight | `{product-accents.watch-starlight}` | #E8DDD0 |
| Silver | `{product-accents.watch-silver}` | #D4D4D8 |
| (PRODUCT)RED | `{product-accents.watch-product-red}` | #C1272D |

**Usage rules:**
- Product accent colors appear **only** on product configurator pages, hero renders, and color swatch chips — never as UI accent or link colors.
- On a configurator page, the selected finish color may tint the page hero background to create an immersive product-color-forward experience.
- Color swatch chips are rendered as circular fills (`{rounded.full}`) at 28–36px diameter, with a 2px `{colors.primary-focus}` ring on the selected swatch.
- The interactive "click me" signal remains `{colors.primary}` (Action Blue) even on configurator pages — product accents are visual, not functional.

</product-accents>

<liquid-glass>

## Liquid Glass Material System

**Liquid Glass** is Apple's translucent material design language introduced with iOS 26, macOS Tahoe, and visionOS 2 (WWDC 2025–2026). It replaces flat, opaque chrome with refractive glass-like surfaces that dynamically sample, blur, and tint the content behind them.

### Core Properties

| Property | Token | Value | Description |
|---|---|---|---|
| Background blur | `{liquid-glass.background-blur}` | 20px | Gaussian blur applied to the underlying content |
| Tint opacity | `{liquid-glass.tint-opacity}` | 0.45 | Opacity of the adaptive tint layer |
| Refraction intensity | `{liquid-glass.refraction-intensity}` | 0.8 | Degree of light-bending distortion at material edges |
| Saturation boost | `{liquid-glass.saturation}` | 180% | Vibrancy increase applied to sampled background |
| Noise texture | `{liquid-glass.noise-texture}` | 0.02 | Subtle grain for physical glass feel |
| Transparency range | `{liquid-glass.transparency-range}` | 0–100% | User-adjustable via Settings > Accessibility > Display |

### Depth Layering Model

Liquid Glass defines three depth tiers, each with progressively stronger blur and tint:

| Tier | Blur | Tint Opacity | Use |
|---|---|---|---|
| **Base** | `{liquid-glass.depth-base-blur}` 8px | 0.30 | Inline panels, segmented controls, minor chrome |
| **Elevated** | `{liquid-glass.depth-elevated-blur}` 20px | 0.45 | Navigation bars, tab bars, sidebars, sheets |
| **Floating** | `{liquid-glass.depth-floating-blur}` 40px | 0.60 | Modals, popovers, floating action buttons |

### Tint Adaptation
- `{liquid-glass.tint-adaptation}`: The material samples the dominant color from the content beneath it and applies that as a tint — a photo of a sunset produces warm amber glass; a dark code editor produces smoky gray glass.
- The tint layer sits between the blur and the surface content: `[content below] → [blur] → [tint] → [surface content above]`.
- On light backgrounds, the glass reads as frosted white. On dark backgrounds, it reads as smoky translucent black. On colorful backgrounds, it picks up the color.

### Transparency Slider (Accessibility)
Apple introduced a system-wide **Transparency slider** (Settings > Accessibility > Display & Text Size) that lets users dial the glass effect from fully transparent (0% — maximum glass effect) to fully opaque (100% — solid backgrounds, no blur). Designs must degrade gracefully across this range:
- At 0%: Full Liquid Glass with blur, refraction, and tint.
- At 50%: Reduced blur, increased tint opacity, material reads as semi-frosted.
- At 100%: Solid opaque background, no blur, no tint — equivalent to pre-Liquid-Glass chrome.

### Web Approximation
The closest CSS approximation of Liquid Glass for web surfaces:

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.45);   /* tint color + opacity */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;                      /* Apple's native glass uses continuous corners */
  box-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.04);
}

.liquid-glass-dark {
  background: rgba(28, 28, 30, 0.55);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
}

@media (prefers-reduced-transparency) {
  .liquid-glass,
  .liquid-glass-dark {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(242, 242, 247, 0.97);  /* near-opaque fallback */
  }
}
```

### Where Liquid Glass Appears
- **Native apps (iOS 26+):** Tab bars, navigation bars, sidebars, toolbars, segmented controls, floating panels, notification cards.
- **apple.com:** The existing `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` are proto-Liquid-Glass — they use `backdrop-filter: saturate(180%) blur(20px)` on parchment-tinted backgrounds. Full Liquid Glass (with refraction and tint adaptation) has not yet replaced these on the marketing site.
- **App Store / product demo embeds:** Embedded iOS app previews on apple.com render with Liquid Glass materials when showing native UI.
- **visionOS:** Every surface in visionOS is a glass panel — Liquid Glass is the *only* material in spatial computing.

</liquid-glass>

<typography>

## Typography

### Font Family
- **Display**: `SF Pro Display, system-ui, -apple-system, sans-serif` — Apple's proprietary display face, optimized for sizes ≥ 19px. Defines the voice of every headline.
- **Body / UI**: `SF Pro Text, system-ui, -apple-system, sans-serif` — the text-optimized variant used for body copy, captions, buttons, and links below 20px.
- **OpenType features**: `font-variant-numeric: numerator` is enabled on numeric links (pricing tables, spec sheets). Display sizes rely on tight tracking rather than contextual ligatures.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.07 | -0.28px | Hero headline; the signature "Apple tight" tracking |
| `{typography.display-lg}` | 40px | 600 | 1.10 | 0 | Tile headlines atop every product tile |
| `{typography.display-md}` | 34px | 600 | 1.47 | -0.374px | Section heads (SF Pro Text at display proportions) |
| `{typography.lead}` | 28px | 400 | 1.14 | 0.196px | Product tile subcopy |
| `{typography.lead-airy}` | 24px | 300 | 1.5 | 0 | Environment-page lead paragraphs (the rare weight 300) |
| `{typography.tagline}` | 21px | 600 | 1.19 | 0.231px | Sub-tile tagline; sub-nav category name |
| `{typography.body-strong}` | 17px | 600 | 1.24 | -0.374px | Inline strong emphasis |
| `{typography.body}` | 17px | 400 | 1.47 | -0.374px | Default paragraph |
| `{typography.dense-link}` | 17px | 400 | 2.41 | 0 | Footer / store utility link lists (relaxed leading) |
| `{typography.caption}` | 14px | 400 | 1.43 | -0.224px | Secondary captions, button text |
| `{typography.caption-strong}` | 14px | 600 | 1.29 | -0.224px | Emphasized captions |
| `{typography.button-large}` | 18px | 300 | 1.0 | 0 | Store hero CTAs (the rare weight 300) |
| `{typography.button-utility}` | 14px | 400 | 1.29 | -0.224px | Utility/nav button labels |
| `{typography.fine-print}` | 12px | 400 | 1.0 | -0.12px | Fine-print, footer body |
| `{typography.micro-legal}` | 10px | 400 | 1.3 | -0.08px | Micro legal disclaimers |
| `{typography.nav-link}` | 12px | 400 | 1.0 | -0.12px | Global nav menu items |

### Principles

- **Negative letter-spacing at display sizes.** Every headline at 17px and up carries a slight tracking tighten (`-0.12 → -0.374px`). This produces the iconic "Apple tight" headline cadence. Never used at 12px or below.
- **Body copy at 17px, not 16px.** Apple breaks the SaaS convention and runs paragraph text at 17px. The extra pixel gives the page an unmistakable "reading, not scanning" pace.
- **Weight 300 is real and rare.** Used deliberately on a handful of large-size reads (`{typography.button-large}` at 18px/300 and `{typography.lead-airy}` at 24px/300). It's not an accident — it's a light-atmosphere cue reserved for moments where the content should feel airy.
- **Weight 600, not 700, for headlines.** Apple's headlines sit at weight 600. Weight 700 is used sparingly for `{typography.tagline}` (21px) when a touch more assertion is needed.
- **Line-height is context-specific.** Display sizes use 1.07–1.19 (tight). Body uses 1.47. Utility link stacks in the footer/store use an unusually relaxed 2.41 (`{typography.dense-link}`). The 2.41 is not a bug — it's how the footer's dense link columns breathe.
- **Weight 500 is deliberately absent.** The ladder is 300 / 400 / 600 / 700. Mid-weight readings always use 600.

### Note on Font Substitutes
SF Pro is Apple's proprietary system font. When building off-system:

- Use `system-ui, -apple-system, BlinkMacSystemFont` as the first stack entry — on macOS/iOS/Safari this resolves to the real SF Pro.
- For non-Apple platforms, **Inter** (Google Fonts, variable) is the closest open-source equivalent. Inter at weight 600 with `font-feature-settings: "ss03"` approximates SF Pro's rounded "a" character.
- Nudge `letter-spacing` down by `-0.01em` on display sizes to re-create the Apple tight feel; Inter's default tracking runs slightly wider than SF Pro.
- For body text, tighten line-height by `0.03` (from 1.47 → 1.44) when substituting Inter — Inter's taller x-height needs less leading.

</typography>

<layout>

## Layout

### Spacing System
- **Base unit:** 8px. Sub-base values (2, 4, 5, 6, 7) are used for tight typographic adjustments; structural layout snaps to 8/12/16/20/24.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 17px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section vertical padding:** `{spacing.section}` (80px) inside a product tile; tiles stack edge-to-edge with 0 gap (the color change provides the break).
- **Card padding:** `{spacing.lg}` (24px) inside utility grid cards.
- **Button padding:** 8–11px vertical, 15–22px horizontal.
- **Universal rhythm constants:** the 17px body line-height multiplier (~25px line) and 21px tagline size show up on every analyzed page.

### Grid & Container
- **Max content width:** ~980px on text-heavy sections (environment), ~1440px on product grids (store, accessories), full-bleed for product tiles (homepage).
- **Column patterns:** 3 to 5 column utility card grid on store/accessories; 2-column side-by-side tiles on homepage occasional sections; single-column centered stack on product tile heroes.
- **Gutters:** 20–24px between cards in a utility grid.

### Whitespace Philosophy
Apple's whitespace is the product's pedestal. Every tile begins with at least 64px of air above its headline and 48–64px below. Product renders are never crowded; the nearest content to a product image is at least 40px away. The footer is the only area that breaks this — there, Apple goes deliberately dense to make the full information architecture visible at a glance.

</layout>

<elevation>

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, footer, body sections |
| Soft hairline | 1px `rgba(0, 0, 0, 0.08)` border | Utility cards, sub-nav frosted-glass separator |
| Backdrop blur | `backdrop-filter: blur(N)` on Parchment 80% | Sub-nav and the iPhone buy floating sticky bar |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | Product renders resting on a surface (the only true "shadow" in the system) |
| Liquid Glass Base | `backdrop-filter: saturate(180%) blur(8px)` | Inline chrome, segmented controls (native app surfaces) |
| Liquid Glass Elevated | `backdrop-filter: saturate(180%) blur(20px)` | Navigation bars, tab bars, sidebars (native app surfaces) |
| Liquid Glass Floating | `backdrop-filter: saturate(180%) blur(40px)` | Modals, popovers, floating panels (native app surfaces) |

**Shadow philosophy.** Apple uses **exactly one** drop-shadow, and it is applied to photographic product imagery — never to cards, never to buttons, never to text. Elevation in the UI comes from (a) surface-color change (light tile ↔ dark tile) and (b) backdrop-blur on sticky bars. The single shadow is about giving the product weight, not about UI hierarchy.

**Liquid Glass depth model.** On native platforms (iOS 26+), the Liquid Glass material system replaces the color-change elevation model with a blur-depth model. Deeper surfaces use more blur and stronger tint, creating a z-axis hierarchy through optical density rather than shadow or border. On the web (apple.com marketing), the existing `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` are the only surfaces using blur-based elevation — the rest of the site relies on color alternation. Use the Liquid Glass depth tiers when building app-like web experiences that need to match native platform feel.

### Decorative Depth
- **Atmospheric imagery** on the environment page (photographic vista) supplies mood; no CSS gradient involved.
- **Edge-to-edge tile alternation** creates rhythm without borders or shadows — the color change itself is the divider.
- **Backdrop-filter blur** on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` creates a "floating over content" effect that's functional, not decorative.

</elevation>

<shapes>

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed product tiles (no corner rounding) |
| `{rounded.xs}` | 5px | Inline links when styled as subtle chips (rare) |
| `{rounded.sm}` | 8px | Dark utility buttons (Sign In, Bag), inline card imagery |
| `{rounded.md}` | 11px | White Pearl Button capsules |
| `{rounded.lg}` | 18px | Store utility cards, accessories grid cards |
| `{rounded.pill}` | 9999px | Primary blue pill CTAs, sub-nav buy button, configurator option chips, search input — the signature Apple pill |
| `{rounded.full}` | 9999px / 50% | Circular control chips floating over photography |

### Photography Geometry
- **Hero imagery**: full-bleed, 21:9 or taller on the homepage; 16:9 on environment and shop pages. Product renders are photographic-realistic, often shot on a tinted surface that becomes the tile background.
- **Product renders**: PNG/WebP with transparency; rest on a surface tile and pick up the system shadow.
- **Accessory grid**: square 1:1 crops at `{rounded.lg}` (18px) radius, light neutral backgrounds, product centered with 20–40px internal padding.
- **No rounded imagery in hero tiles** — images are full-bleed rectangular. Rounding (`{rounded.sm}`, `{rounded.lg}`) appears only on inline card imagery.
- Lazy-loading via responsive `srcset` and `sizes` across all breakpoints; CDN-optimized WebP.

</shapes>

<components>

## Components

### Top Navigation

**`global-nav`** — Persistent, ultra-thin black nav bar pinned to the top of every page. Background `{colors.surface-black}`, height 44px, text `{colors.on-dark}` in `{typography.nav-link}` (12px / 400 / -0.12px tracking). Links are quiet, spaced ~20px apart, running edge-to-edge across the top. Right-aligned cluster: Search, Bag icons — always visible. On mobile, collapses to hamburger at ~834px and the Apple logo centers.

**`sub-nav-frosted`** — Surface-specific nav that sticks below the global nav. Background `{colors.canvas-parchment}` at 80% opacity with backdrop-filter blur, creating a frosted-glass effect. Height 52px. Content on left: product category name ("iPhone", "Store", "Accessories") in `{typography.tagline}` (21px / 600). Content right: inline nav links in `{typography.button-utility}` (14px), ending in a persistent `{component.button-primary}` ("Buy") or a utility link.

### Buttons

**`button-primary`** — The signature Apple action. Background `{colors.primary}` (Action Blue #0066cc), text `{colors.on-primary}` in `{typography.body}` (SF Pro Text 17px / 400), rounded `{rounded.pill}` (full pill — capsule-shaped), padding 11px × 22px. The full-pill radius IS the brand action signal.
- Active state: `{component.button-primary-active}` — `transform: scale(0.95)` (the system-wide micro-interaction).
- Focus state: `{component.button-primary-focus}` — 2px solid `{colors.primary-focus}` outline.

**`button-secondary-pill`** — Used as the second CTA when two blue pills appear together ("Learn more" / "Buy"). Background transparent, text `{colors.primary}`, 1px solid `{colors.primary}` border, rounded `{rounded.pill}`, padding 11px × 22px. Reads as a "ghost pill."

**`button-dark-utility`** — Global nav actions (Sign In, Bag, language selector). Background `{colors.ink}` (#1d1d1f), text `{colors.on-dark}` in `{typography.button-utility}` (14px / 400 / -0.224px tracking), rounded `{rounded.sm}` (8px), padding 8px × 15px. Active state shrinks via `transform: scale(0.95)`.

**`button-pearl-capsule`** — Product-card secondary button. Background `{colors.surface-pearl}` (#fafafc), text `{colors.ink-muted-80}` in `{typography.caption}` (14px), 3px solid `{colors.divider-soft}` border (functions as a soft ring rather than a visible line), rounded `{rounded.md}` (11px), padding 8px × 14px.

**`button-store-hero`** — A larger primary CTA used on store hero surfaces. Same Action Blue + Paper White as `{component.button-primary}`, but with `{typography.button-large}` (18px / 300 — note the rare weight 300) and slightly more padding (14px × 28px). Used sparingly on the store landing.

**`button-icon-circular`** — Floats over photography. 44 × 44px, background `{colors.surface-chip-translucent}` at ~64% alpha, icon in `{colors.ink}`, rounded `{rounded.full}`. Used for carousel controls, close buttons, and in-image controls (product image thumbnails on the iPhone buy page).

**`text-link`** — Inline body links in `{colors.primary}` (Action Blue). Underlined or non-underlined per context.

**`text-link-on-dark`** — Inline body links on dark tiles in `{colors.primary-on-dark}` (Sky Link Blue #2997ff) — Action Blue would disappear against `{colors.surface-tile-1}`.

### Cards & Containers

**`product-tile-light`** — Full-bleed light tile. Background `{colors.canvas}` (white), text `{colors.ink}`, rounded `{rounded.none}` (0 — tiles touch edges), vertical padding `{spacing.section}` (80px). Centered stack: product name in `{typography.display-lg}` (40px / 600) → one-line tagline in `{typography.lead}` (28px / 400) → two `{component.button-primary}` CTAs ("Learn more" / "Buy") → product render resting on the surface with the system shadow.

**`product-tile-parchment`** — Same as `{component.product-tile-light}` but on `{colors.canvas-parchment}` (#f5f5f7). Used to break two consecutive white tiles.

**`product-tile-dark`** — Full-bleed dark tile. Background `{colors.surface-tile-1}` (#272729), text `{colors.on-dark}`, rounded `{rounded.none}`, vertical padding `{spacing.section}` (80px). Same content stack as the light tile but with `{component.text-link-on-dark}` for inline copy and `{component.button-primary}` (Action Blue still works on the dark surface). Used on the homepage product grid as the alternating dark band.

**`product-tile-dark-2`** — Variant on `{colors.surface-tile-2}` (#2a2a2c). Used where a dark tile sits directly above or below `{component.product-tile-dark}` to create the faintest separation through micro-step lightness change.

**`product-tile-dark-3`** — Variant on `{colors.surface-tile-3}` (#252527). Used at the bottom of the stack and in embedded video/player frames.

**`store-utility-card`** — Used in store grid and accessories grid. Background `{colors.canvas}` (white), 1px solid `{colors.hairline}` border, rounded `{rounded.lg}` (18px), padding `{spacing.lg}` (24px). Top: product image (1:1 crop with `{rounded.sm}` (8px) inner image radius). Below: product name in `{typography.body-strong}` (17px / 600), price in `{typography.body}` (17px / 400), and a `{component.text-link}` ("Buy" or "Learn more"). No shadow by default; product render itself carries the system product-shadow.

**`configurator-option-chip`** — Pill-shaped tappable cell used in the iPhone 17 Pro buy page. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.caption}`, rounded `{rounded.pill}`, padding 12px × 16px. Contains a small product thumbnail + label + price delta. Arranged in a grid of 4–5 options per row.

**`configurator-option-chip-selected`** — Selected state. Border upgrades to 2px solid `{colors.primary-focus}`. Same shape, same content.

**`environment-quote-card`** — A photographic-canvas hero specific to the environment page. Dark photographic backdrop (mountain vista at dawn) with `{colors.surface-tile-1}` as the fallback color, centered white-text headline in `{typography.display-lg}` (40px), small green "Apple 2030" pictographic logo above the headline, single `{component.button-primary}` below. Padding `{spacing.section}` (80px).

**`floating-sticky-bar`** — Floats at the bottom of the viewport on the iPhone 17 Pro buy page during scroll. Background `{colors.canvas-parchment}` at 80% opacity with `backdrop-filter: blur(N)`, height 64px, padding 12px × 32px. Left: running price total in `{typography.body}`. Right: `{component.button-primary}` ("Add to Bag").

### Inputs & Forms

**`search-input`** — The accessories search input. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.body}` (17px), 1px solid `rgba(0, 0, 0, 0.08)` border, rounded `{rounded.pill}` (full pill — search is also pill-shaped, matching the CTA grammar), padding 12px × 20px, height 44px. Leading icon: search glyph at 14px, muted tint.

Error and validation states were not surfaced in the analyzed pages.

### Footer

**`footer`** — Background `{colors.canvas-parchment}` (#f5f5f7), text `{colors.ink-muted-80}`. Link columns in `{typography.dense-link}` (17px / 400 / 2.41 line-height — the relaxed leading is what makes the dense columns scannable). Column headings in `{typography.caption-strong}` (14px / 600). Legal row at the very bottom in `{typography.fine-print}` (12px / 400) with `{colors.ink-muted-48}` text. Vertical padding 64px.

</components>

<motion>

## Motion & Micro-interactions

Apple's motion design follows **spring-based physics** — every animation feels like it has mass and responds to inertia rather than following a linear or ease-in-out curve.

### Universal Press State
- **`transform: scale(0.95)`** on every button press. This is the single most consistent micro-interaction on apple.com. Duration: 100ms ease-out on press, 200ms spring-back on release.
- Buttons do not change color on press — they physically shrink. The color stays constant; the motion carries the feedback.

### Scroll Reveals
- **Fade-in-up:** Content tiles reveal as the user scrolls into them. Elements translate from `translateY(20px)` + `opacity: 0` to their resting position. Triggered at ~80% viewport intersection.
- **Stagger:** When multiple elements in a tile reveal together, they stagger by 60–100ms each. Left-to-right or top-to-bottom order.
- **Duration:** 600–800ms per element, using a cubic-bezier curve approximating a critically damped spring: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.

### Parallax
- Hero product renders exhibit subtle parallax on scroll — the product image scrolls at ~0.85× the page speed, creating a gentle depth effect.
- Parallax is disabled at `prefers-reduced-motion: reduce`.

### Carousel / Swipe
- Product image carousels (iPhone buy page) use momentum-based swipe with deceleration matching iOS scroll physics.
- Snap points align to each product image center.
- Carousel dots indicate position but are not interactive on mobile — swipe is the primary control.

### Page Transitions
- apple.com does not use SPA-style page transitions — each page is a full load. Navigation feels instant because above-fold content is pre-rendered and hero images are eagerly loaded.
- Sub-nav persistence across product pages (iPhone overview → iPhone specs → iPhone buy) creates continuity without animation.

### Accessibility
- All motion respects `prefers-reduced-motion: reduce`. When enabled: scroll reveals appear immediately (no translate, no opacity transition), parallax is disabled, and button press states use `opacity: 0.7` instead of `scale(0.95)`.

</motion>

<rules>

## Do's and Don'ts

<do>

### Do
- Use `{colors.primary}` (Action Blue #0066cc) for every interactive element — links, pill CTAs, focus signals — and nothing else. The single accent is non-negotiable.
- Set headlines in `{typography.hero-display}` or `{typography.display-lg}` with negative letter-spacing (`-0.28 → -0.374px`) to get the signature "Apple tight" cadence.
- Run body copy at `{typography.body}` (17px / 400 / 1.47 / -0.374px) — not 16px. The extra pixel defines the brand's reading pace.
- Alternate `{component.product-tile-light}` (or parchment) and `{component.product-tile-dark}` for full-bleed section rhythm. The color change IS the divider.
- Reserve `{rounded.pill}` for the primary blue CTA and any other element that should read as an "action" (configurator chips, search input, sticky bar CTA).
- Apply the single product-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) only to product renders resting on a surface — never on cards, buttons, or text.
- Use `transform: scale(0.95)` as the active/press state on every button — it's the system-wide micro-interaction.
- Keep the global nav `{colors.surface-black}` (true black) — it's the only place pure black appears on most pages.
- Use `{system-colors}` for app-like UI surfaces that need to match iOS/macOS native conventions — red for errors, green for success, yellow for warnings.
- Use `{product-accents}` only on configurator pages to represent actual product finishes — never as decorative UI color.
- Apply Liquid Glass (`backdrop-filter: saturate(180%) blur(20px)`) on floating/sticky chrome that needs to feel native-platform-contemporary. Always provide a `prefers-reduced-transparency` fallback.
- Respect `prefers-reduced-motion` on all scroll reveals and parallax effects.

</do>

<dont>

### Don't
- Don't introduce a second accent color; every "click me" signal is `{colors.primary}` (Action Blue).
- Don't add shadows to cards, buttons, or text — shadow is reserved for product imagery.
- Don't use gradients as decorative backgrounds; atmosphere comes from photography.
- Don't set body copy at weight 500 — Apple's ladder is 300 / 400 / 600 / 700, with 500 deliberately absent. Body is always 400; strong inline is 600; display is 600.
- Don't round full-bleed tiles — tiles are rectangular and edge-to-edge; the color change is the divider.
- Don't tighten line-height below 1.47 for body copy — the editorial leading is part of the brand.
- Don't mix radii grammars — use `{rounded.sm}` for compact utility, `{rounded.lg}` for utility cards, `{rounded.pill}` for pills, and nothing in between (except the rare `{rounded.md}` Pearl Button).
- Don't use `{colors.primary-on-dark}` (Sky Link Blue) on light surfaces — it's the dark-tile-only variant. Action Blue is for light surfaces.
- Don't use `{system-colors}` as decorative accents — they are semantic: red means destructive/error, green means success/go, yellow means caution.
- Don't apply Liquid Glass blur to full-bleed content tiles — blur is for floating chrome (nav bars, sticky bars, modals), not for content surfaces.
- Don't use `{product-accents}` as button or link colors — they represent physical materials, not interactive states.
- Don't override the transparency slider fallback — users who set `prefers-reduced-transparency` have chosen opaque surfaces for accessibility reasons.

</dont>

</rules>

<responsive>

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 419px | Single-column tiles; sub-nav collapses to category name + primary CTA only; hero typography drops to 28px |
| Phone | 420–640px | Single-column stack; product renders scale to 80% of tile width; hero h1 drops to 34px |
| Large phone | 641–735px | Tiles transition to tighter padding (48px vertical vs 80px); fine-print wraps |
| Tablet portrait | 736–833px | Global nav collapses to hamburger; sub-nav hides category chips, keeps primary CTA |
| Tablet landscape | 834–1023px | Global nav returns fully expanded; 3-column utility grids become 2-column |
| Small desktop | 1024–1068px | Product tiles use 2/3 width with margin gutters; hero h1 stays at 40px |
| Desktop | 1069–1440px | Full layout; 4–5 column store grids; 1440px content max |
| Wide desktop | ≥ 1441px | Content locks at 1440px, margins absorb extra width |

The structural breakpoints that matter for agents: 1440px (content lock), 1068px (small-desktop), 833px (tablet landscape switch), 734px (tablet portrait), 640px (phone), 480px (small phone).

### Touch Targets
- Minimum 44 × 44px. `{component.button-primary}` lands at ~44 × 100px (with the full-pill radius making the visible hit area more generous than the label suggests).
- `{component.button-icon-circular}` is exactly 44 × 44px.
- Global nav utility links are smaller (~32 × 80px) — they deliberately sit at a tighter target because they're precision desktop actions, and the mobile hamburger replaces them at ≤ 833px.

### Collapsing Strategy
- **Global nav**: full horizontal link row on desktop → collapses to Apple logo + hamburger + bag icon at 834px and below.
- **Sub-nav**: category name + inline links + primary CTA → category name + primary CTA only at mobile; inline links move into a hamburger tray.
- **Product tiles**: stack from 2-column to 1-column at 834px; vertical padding tightens from 80px → 48px at small-phone.
- **Utility grids** (store, accessories): 5-col → 4-col (1440px) → 3-col (1068px) → 2-col (834px) → 1-col (640px).
- **Hero typography**: `{typography.hero-display}` (56px) → `{typography.display-lg}` (40px) at 1068px → 34px at 640px → 28px at 419px.

### Image Behavior
- All product imagery uses responsive `srcset` with breakpoint-matched crops.
- Hero photography may switch art direction at mobile (e.g., the environment page's vista crops to a taller aspect ratio on mobile, framing the subject differently).
- Product renders maintain their 1:1 or 4:3 aspect ratios across breakpoints; only scale changes.
- Lazy-loading is default; the above-fold hero loads eagerly.

</responsive>

<checklist>

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.product-tile-dark}`, `{component.search-input}`).
2. Variants of an existing component (`-active`, `-focus`, `-2`, `-3`) live as separate entries in `components:`.
3. Use `{token.refs}` everywhere — never inline hex.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay SF Pro Display 600 with negative letter-spacing. Body stays SF Pro Text 400 at 17px. The boundary is unbreakable.
6. The single drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) is reserved for product photography only.
7. When in doubt about emphasis: alternate surface (light → dark tile) before adding chrome.
8. For native-platform-feel surfaces: use Liquid Glass depth tiers (`base` → `elevated` → `floating`) instead of shadows or borders.
9. Product accent colors belong in configurator UIs only — never in buttons, links, or navigation.
10. System rainbow colors are semantic — match them to meaning (red = destructive, green = success), not to aesthetics.
11. Always provide `prefers-reduced-motion` and `prefers-reduced-transparency` fallbacks.

</checklist>

<gaps>

## Known Gaps

- Form validation and error states were not surfaced on the analyzed pages; only the neutral search input is documented.
- The homepage's embedded video/player frame uses `{colors.surface-black}`; interior player controls are not documented (they're a platform widget, not a web-design token).
- Some component imagery is dynamic (rotating product hero) and its specific copy varies per surface — component specs name the structure, not the rotating content.
- Dark-mode counterparts for store and accessories utility cards were not surfaced on the analyzed pages; the system documented is the daytime/light-dominant variant Apple ships by default.
- Atmospheric photography (environment page mountain vista) is a content asset, not a design token; the documented `{component.environment-quote-card}` describes the structural surface only.
- The exact backdrop-filter blur radius on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` is platform-dependent; production CSS uses `saturate(180%) blur(20px)` as a typical baseline but the value isn't formalized as a token.
- Liquid Glass refraction and noise texture effects cannot be fully replicated in CSS — the web approximation uses `backdrop-filter` which covers blur and saturation but not light-bending distortion or grain. Native-fidelity Liquid Glass requires platform rendering (UIKit, SwiftUI, RealityKit).
- Product accent hex values are sampled from product photography and marketing materials — actual hardware finishes vary under different lighting conditions. Treat these as representative, not colorimetrically exact.
- The `{system-colors}` light/dark pairs are from Apple's Human Interface Guidelines (2026 revision). High-contrast accessibility variants exist but are not documented here — they increase saturation and shift lightness by ~10–15%.
- Apple Watch band colors expand seasonally; the `{product-accents}` section documents the permanent case finishes, not seasonal bands.

</gaps>
