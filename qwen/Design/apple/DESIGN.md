---
version: alpha
name: Apple-design-analysis
description: A photography-first interface that turns marketing into a museum gallery, updated for Apple's 2026 Liquid Glass design language. Edge-to-edge product tiles alternate light and dark canvases, framed by SF Pro Display headlines with negative letter-spacing and a single Action Blue (#0066cc) interactive color. UI chrome recedes so the product can speak — no decorative gradients, no shadows on chrome, only the one signature drop-shadow under product imagery resting on a surface. Native app surfaces now layer translucent Liquid Glass materials with refraction, depth, and light-responsive tinting over content. The web presence preserves the photography-first doctrine while the platform UI embraces the full Apple system color rainbow.

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
  background-blur: "saturate(180%) blur(20px)"
  tint-opacity-light: 0.72
  tint-opacity-dark: 0.64
  refraction-offset: 2px
  saturation-boost: 1.8
  noise-texture: "0.03 opacity white noise overlay"
  border-light: "1px solid rgba(255, 255, 255, 0.36)"
  border-dark: "1px solid rgba(255, 255, 255, 0.12)"
  inner-shadow: "inset 0 0.5px 0 rgba(255, 255, 255, 0.24)"
  specular-highlight: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)"

product-accents:
  iphone-natural-titanium: "#8F8A81"
  iphone-blue-titanium: "#3E4750"
  iphone-white-titanium: "#E3DDD6"
  iphone-black-titanium: "#3C3B37"
  iphone-desert-titanium: "#C4A882"
  macbook-space-black: "#2E2C2F"
  macbook-silver: "#E3E4E5"
  macbook-starlight: "#F0E4D3"
  macbook-midnight: "#2E3642"
  apple-watch-midnight: "#2B3139"
  apple-watch-starlight: "#F0E4D3"
  apple-watch-silver: "#E3E4E5"
  apple-watch-product-red: "#BF0013"
  imac-blue: "#6BA0D6"
  imac-green: "#5FAA72"
  imac-pink: "#E8919A"
  imac-silver: "#E3E4E5"
  imac-yellow: "#F7D052"
  imac-orange: "#E8743A"
  imac-purple: "#9B8EBF"

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

## Overview

Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result is a catalog that feels more like a museum gallery: the wall disappears and the artifact takes over.

Store and shop surfaces retain the same chassis but switch modes. The product configurator (iPhone 17 Pro, accessories grid) introduces a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. The environment page leans darker and more editorial. Across all five surfaces the typographic system, spacing rhythm, and the single blue accent are consistent — this is one design language expressed at different volumes.

**2026 Design Language Evolution — Liquid Glass.** Starting with iOS 26 and macOS Tahoe (WWDC 2025–2026), Apple introduced **Liquid Glass** — a translucent material system with real-time refraction, depth-aware tinting, and light-responsive surfaces. Liquid Glass replaces the flat/frosted dichotomy with a continuous spectrum of transparency controlled by a system-wide slider (0–100%). On the web, apple.com retains the photography-first doctrine; Liquid Glass appears primarily in native app UI (tab bars, toolbars, sidebars, modal sheets). The web equivalent uses the existing `backdrop-filter: saturate(180%) blur(20px)` frosted-glass pattern — Liquid Glass's refraction and per-pixel tinting require platform compositing not available in CSS. The `{liquid-glass}` tokens in the frontmatter define the reference material for native-targeted builds; for web, use `{component.sub-nav-frosted}`'s established backdrop-blur approach.

Alongside Liquid Glass, Apple's platform palette expanded from the monochrome web canon to a **full 13-color system rainbow** (`{system-colors}`). These system colors — red through brown — drive status indicators, tinted icons, semantic labels, and dynamic backgrounds across all Apple platforms. They shift automatically between light and dark appearances. On apple.com, the web surfaces remain constrained to Action Blue + grayscale; the system colors appear on product marketing pages only as product-finish swatches and occasional tinted highlights. The full rainbow is documented in `{system-colors}` for agents building native-feeling Apple experiences.

**Key Characteristics:**
- Photography-first presentation; UI recedes so the product can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element. No second brand color exists on the web. Product marketing pages may use `{product-accents}` finish colors as contextual highlights.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- SF Pro Display + SF Pro Text — negative letter-spacing at display sizes for the signature "Apple tight" headline feel.
- Whisper-soft elevation used only when a product image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + product-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm across multiple pages: light hero → dark product tile → light utility tile → dark tile → parchment footer — a predictable pulse.
- Full 13-color system rainbow (`{system-colors}`) for native/platform UI; constrained to Action Blue on the web.
- Liquid Glass translucent material (`{liquid-glass}`) for native app surfaces; frosted-glass backdrop-blur for web equivalents.

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
**No decorative gradients on the web.** Atmospheric depth on product photography (the iPhone 17 Pro camera plate, the Apple Watch bands, AirPods reflections) is inherent to the imagery, not a CSS gradient overlay. The environment page's hero uses photographic atmosphere (mountain vista at dawn) but no gradient tokens are defined. Apple is the rare luxury-brand site with zero gradient-based design tokens. On native platforms, Liquid Glass introduces a specular highlight gradient (`{liquid-glass.specular-highlight}`) on material surfaces — this is a compositing effect, not a design color.

## Apple System Colors

Apple's platform design system uses a **13-color rainbow palette** that adapts dynamically between light and dark appearances. These colors are the semantic backbone of iOS, iPadOS, macOS, watchOS, and visionOS — every system icon, status indicator, tinted control, and dynamic background draws from this set. On apple.com, these colors appear only as product-finish swatches; in native app or app-like web experiences targeting Apple platforms, they are the primary expressive palette.

### The Rainbow Palette

| Color | Light | Dark | Primary Use |
|---|---|---|---|
| Red | `{system-colors.red}` #FF3B30 | `{system-colors.red-dark}` #FF453A | Destructive actions, errors, badges, removal |
| Orange | `{system-colors.orange}` #FF9500 | `{system-colors.orange-dark}` #FF9F0A | Warnings, file types, weather |
| Yellow | `{system-colors.yellow}` #FFCC00 | `{system-colors.yellow-dark}` #FFD60A | Caution, stars/ratings, highlights |
| Green | `{system-colors.green}` #34C759 | `{system-colors.green-dark}` #30D158 | Success, toggles on-state, availability, health |
| Mint | `{system-colors.mint}` #00C7BE | `{system-colors.mint-dark}` #63E6E2 | Fresh/new indicators, secondary positive |
| Teal | `{system-colors.teal}` #30B0C7 | `{system-colors.teal-dark}` #40CBE0 | Communication, messaging, connectivity |
| Cyan | `{system-colors.cyan}` #32ADE6 | `{system-colors.cyan-dark}` #64D2FF | Information, links in HIG contexts |
| Blue | `{system-colors.blue}` #007AFF | `{system-colors.blue-dark}` #0A84FF | Default tint, primary actions (native; web uses Action Blue #0066cc) |
| Indigo | `{system-colors.indigo}` #5856D6 | `{system-colors.indigo-dark}` #5E5CE6 | Focus, meditation, Siri |
| Purple | `{system-colors.purple}` #AF52DE | `{system-colors.purple-dark}` #BF5AF2 | Creativity, downloads, personal |
| Pink | `{system-colors.pink}` #FF2D55 | `{system-colors.pink-dark}` #FF375F | Love/favorites, hearts, social |
| Brown | `{system-colors.brown}` #A2845E | `{system-colors.brown-dark}` #AC8E68 | Earth, outdoors, maps terrain |
| Gray 1–6 | `{system-colors.system-gray-1}` through `{system-colors.system-gray-6}` | See dark variants | Hierarchical backgrounds, separators, disabled states |

### Semantic Color Tokens (HIG)

Apple's Human Interface Guidelines define semantic tokens that resolve to different values in light vs dark:

- **label** → `{colors.ink}` (light) / `{colors.body-on-dark}` (dark) — primary text
- **secondaryLabel** → `{colors.ink-muted-80}` (light) / `{colors.body-muted}` (dark) — secondary text
- **tertiaryLabel** → `rgba(60, 60, 67, 0.30)` (light) / `rgba(235, 235, 245, 0.30)` (dark) — placeholder text
- **quaternaryLabel** → `rgba(60, 60, 67, 0.18)` (light) / `rgba(235, 235, 245, 0.16)` (dark) — disabled text
- **systemBackground** → `#FFFFFF` (light) / `#000000` (dark) — base background
- **secondarySystemBackground** → `{system-colors.system-gray-6}` #F2F2F7 (light) / `{system-colors.system-gray-6-dark}` #1C1C1E (dark) — grouped content background
- **tertiarySystemBackground** → `#FFFFFF` (light) / `{system-colors.system-gray-5-dark}` #2C2C2E (dark) — third-level grouping
- **separator** → `rgba(60, 60, 67, 0.29)` (light) / `rgba(84, 84, 88, 0.65)` (dark) — standard separator
- **opaqueSeparator** → `#C6C6C8` (light) / `#38383A` (dark) — opaque variant for scroll content

### Dynamic Color Adaptation Rules

1. Every system color has a light and dark variant. The dark variant is always slightly brighter/more saturated to maintain contrast on dark backgrounds.
2. Never hardcode light-mode system colors in a dark context or vice versa — always use the paired variant.
3. System colors are not for brand identity — they carry semantic meaning. `{system-colors.red}` means "destructive" or "error," not "brand accent."
4. On the web, map system colors to CSS custom properties and toggle them via `prefers-color-scheme` or a class-based theme switch.
5. The six system grays form a hierarchy: Gray 1 (darkest in light mode) through Gray 6 (lightest in light mode). In dark mode, this hierarchy inverts — Gray 1 stays the same mid-tone, but Gray 6 becomes the darkest.

## Product-Specific Color Accents

While apple.com's interactive palette is strictly Action Blue, individual **product marketing pages** introduce finish/color swatches as contextual accents. These are product identity colors, not UI colors — they tint product imagery, color-swatch selectors, and occasionally the tile background, but never replace Action Blue as the CTA color.

### iPhone Finish Colors
| Finish | Hex | Use on Page |
|---|---|---|
| Natural Titanium | `{product-accents.iphone-natural-titanium}` #8F8A81 | Default swatch, hero tile may use as tinted backdrop |
| Blue Titanium | `{product-accents.iphone-blue-titanium}` #3E4750 | Color swatch chip, product render variant |
| White Titanium | `{product-accents.iphone-white-titanium}` #E3DDD6 | Swatch chip, light tile variant |
| Black Titanium | `{product-accents.iphone-black-titanium}` #3C3B37 | Swatch chip, dark tile variant |
| Desert Titanium | `{product-accents.iphone-desert-titanium}` #C4A882 | Swatch chip, warm-tone tile |

### MacBook Finish Colors
| Finish | Hex |
|---|---|
| Space Black | `{product-accents.macbook-space-black}` #2E2C2F |
| Silver | `{product-accents.macbook-silver}` #E3E4E5 |
| Starlight | `{product-accents.macbook-starlight}` #F0E4D3 |
| Midnight | `{product-accents.macbook-midnight}` #2E3642 |

### Apple Watch Colors
| Finish | Hex |
|---|---|
| Midnight | `{product-accents.apple-watch-midnight}` #2B3139 |
| Starlight | `{product-accents.apple-watch-starlight}` #F0E4D3 |
| Silver | `{product-accents.apple-watch-silver}` #E3E4E5 |
| (PRODUCT)RED | `{product-accents.apple-watch-product-red}` #BF0013 |

### iMac Colors
Seven-color rainbow: `{product-accents.imac-blue}` #6BA0D6, `{product-accents.imac-green}` #5FAA72, `{product-accents.imac-pink}` #E8919A, `{product-accents.imac-silver}` #E3E4E5, `{product-accents.imac-yellow}` #F7D052, `{product-accents.imac-orange}` #E8743A, `{product-accents.imac-purple}` #9B8EBF.

### Usage Rules for Product Accents
1. Product accent colors appear **only** on that product's marketing page — never in global navigation, footer, or cross-product surfaces.
2. They tint the **background of color-swatch selector chips** (small circular or rounded-rect swatches) and optionally the **tile surface** when a specific color is selected.
3. The CTA button remains Action Blue (`{colors.primary}`) regardless of the selected product finish. The finish color never becomes the interactive color.
4. When a dark product color (Black Titanium, Space Black, Midnight) is selected, the tile may shift to a dark surface variant to match — but the tile structure and typography stay identical.

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

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, footer, body sections |
| Soft hairline | 1px `rgba(0, 0, 0, 0.08)` border | Utility cards, sub-nav frosted-glass separator |
| Backdrop blur | `backdrop-filter: blur(N)` on Parchment 80% | Sub-nav and the iPhone buy floating sticky bar |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | Product renders resting on a surface (the only true "shadow" in the system) |

**Shadow philosophy.** Apple uses **exactly one** drop-shadow, and it is applied to photographic product imagery — never to cards, never to buttons, never to text. Elevation in the UI comes from (a) surface-color change (light tile ↔ dark tile) and (b) backdrop-blur on sticky bars. The single shadow is about giving the product weight, not about UI hierarchy.

### Decorative Depth
- **Atmospheric imagery** on the environment page (photographic vista) supplies mood; no CSS gradient involved.
- **Edge-to-edge tile alternation** creates rhythm without borders or shadows — the color change itself is the divider.
- **Backdrop-filter blur** on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` creates a "floating over content" effect that's functional, not decorative.

## Liquid Glass Material System

Apple's **Liquid Glass** design language (iOS 26+, macOS Tahoe, watchOS 26, visionOS 3) replaces the binary frosted/flat material system with a continuous spectrum of translucent surfaces that refract, tint, and respond to ambient light. It is the most significant visual shift in Apple's UI since iOS 7's flat redesign.

### Core Properties

Liquid Glass surfaces are defined by five material properties:

1. **Background blur** (`{liquid-glass.background-blur}` — `saturate(180%) blur(20px)`): The content behind the surface is blurred and saturated, creating the impression of frosted glass with color bleed-through. The `saturate(180%)` step is critical — it makes the blurred background feel vibrant rather than washed-out.

2. **Tint opacity** (`{liquid-glass.tint-opacity-light}` 0.72 / `{liquid-glass.tint-opacity-dark}` 0.64): A semi-transparent fill color overlaid on the blurred background. In light mode, tint is white-biased at 72% opacity; in dark mode, it shifts to a dark tint at 64% opacity, letting more background color bleed through.

3. **Refraction offset** (`{liquid-glass.refraction-offset}` — 2px): Content behind the glass appears subtly displaced, simulating optical refraction through a thick glass surface. This is a platform compositing effect not reproducible in CSS — skip it for web targets.

4. **Saturation boost** (`{liquid-glass.saturation-boost}` — 1.8×): Colors behind the glass surface are boosted in saturation before blurring, preventing the material from appearing gray or lifeless.

5. **Noise texture** (`{liquid-glass.noise-texture}` — 0.03 opacity white noise): A faint noise overlay adds physical texture to the glass surface, preventing it from reading as a flat semi-transparent rectangle. On the web, apply as a repeating 200×200px noise PNG at 3% opacity.

### Edge Treatment

- **Border** (`{liquid-glass.border-light}` / `{liquid-glass.border-dark}`): A thin `rgba(255, 255, 255, 0.36)` border in light mode, `rgba(255, 255, 255, 0.12)` in dark mode. This catches the "light edge" that makes glass feel three-dimensional.
- **Inner shadow** (`{liquid-glass.inner-shadow}`): `inset 0 0.5px 0 rgba(255, 255, 255, 0.24)` — a single-pixel highlight at the top edge simulating light refraction at the glass surface boundary.
- **Specular highlight** (`{liquid-glass.specular-highlight}`): A subtle `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)` overlaid on the top portion of the glass surface, simulating a light source above the viewer.

### Transparency Slider (iOS 26+)

Users can control Liquid Glass transparency from 0% (fully opaque, resembling pre-iOS-26 flat UI) to 100% (maximum translucency). Design for both extremes:
- At 0%: the surface must remain legible with a solid background fallback. Text contrast must meet WCAG AA against the opaque tint color.
- At 100%: text must remain legible against a busy, blurred background. Use heavier font weights or text shadows as a contrast fallback.
- The default setting is approximately 65–70% transparency.

### Depth Layering Model

Liquid Glass operates at three depth tiers:

| Tier | Description | CSS Approximation |
|---|---|---|
| **Base** | The app's ground layer — no glass effect, solid background | `background: {colors.canvas}` or `{colors.surface-black}` |
| **Elevated** | Floating bars, tab bars, sidebars — glass with moderate blur | `backdrop-filter: saturate(180%) blur(20px); background: rgba(255,255,255,0.72)` |
| **Floating** | Sheets, popovers, dialogs — glass with stronger blur and border | Same as elevated + `{liquid-glass.border-light}` + `{liquid-glass.inner-shadow}` |

### Web Implementation

Liquid Glass's refraction and per-pixel tinting require compositing APIs not available in CSS. For web targets, approximate with the established Apple frosted-glass pattern:

```css
.glass-surface {
  background: rgba(245, 245, 247, 0.72);  /* {colors.canvas-parchment} at tint-opacity */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.36);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.24);
}

@media (prefers-color-scheme: dark) {
  .glass-surface {
    background: rgba(28, 28, 30, 0.64);  /* system-gray-6-dark at tint-opacity */
    border-color: rgba(255, 255, 255, 0.12);
  }
}
```

Always provide a solid `background-color` fallback for browsers that don't support `backdrop-filter`. The `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` already use this pattern and are the canonical Liquid Glass web reference.

### When NOT to Use Liquid Glass

- **Full-bleed product tiles** — these are opaque canvases by design. Glass competes with photography.
- **The global nav bar** — stays `{colors.surface-black}` opaque. The nav is the anchoring layer, not a floating surface.
- **Text-heavy editorial sections** — glass behind dense body copy reduces readability. Use solid surfaces.
- **Over video or animation** — glass over moving content creates visual noise. Use solid overlays.

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

Error and validation states were not surfaced on the analyzed pages.

### Footer

**`footer`** — Background `{colors.canvas-parchment}` (#f5f5f7), text `{colors.ink-muted-80}`. Link columns in `{typography.dense-link}` (17px / 400 / 2.41 line-height — the relaxed leading is what makes the dense columns scannable). Column headings in `{typography.caption-strong}` (14px / 600). Legal row at the very bottom in `{typography.fine-print}` (12px / 400) with `{colors.ink-muted-48}` text. Vertical padding 64px.

## Motion & Micro-interactions

Apple's motion design follows a physics-based philosophy: every animation should feel like a real object responding to force, not a tween between two states. The system is restrained — motion exists to confirm interaction and guide attention, never to decorate.

### Animation Philosophy

- **Spring-based physics.** All interactive transitions use spring dynamics rather than linear or ease-in-out curves. The canonical spring parameters are: `mass: 1, stiffness: 200, damping: 20` — producing a quick, slightly bouncy settle. In CSS, approximate with `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for the initial spring, or use the Web Animations API with a spring-type easing where supported.
- **Duration is emergent, not prescribed.** Springs don't have a fixed duration — they settle naturally. The perceptual duration of most Apple UI transitions is 250–350ms. Never hard-code `transition: 0.3s ease` when implementing Apple motion; use a spring curve that settles in a similar timeframe.
- **One animation per interaction.** Pressing a button triggers one response (scale down). Opening a sheet triggers one transition (slide up with spring overshoot). Apple never chains decorative animations.

### Button Press

The universal press response across all Apple interactive elements:

```css
.button:active {
  transform: scale(0.95);
  transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

- Scale factor: exactly 0.95 — not 0.9 (too dramatic), not 0.98 (invisible).
- Duration: ~100ms down, ~250ms spring-back on release.
- Applied to: every `{component.button-*}`, every `{component.configurator-option-chip}`, every `{component.store-utility-card}` on tap.
- Never combined with a color change on press — the scale IS the feedback.

### Scroll Reveal

Product tiles fade in as they enter the viewport during scroll:

- **Fade-in-up**: element starts at `opacity: 0; transform: translateY(20px)` and transitions to `opacity: 1; transform: translateY(0)` over 600ms with `cubic-bezier(0.16, 1, 0.3, 1)` (a decelerating curve).
- **Stagger**: when multiple elements reveal together (e.g., three utility cards in a row), each is delayed by 100ms: first card at 0ms, second at 100ms, third at 200ms.
- **Trigger**: `IntersectionObserver` at 15% visibility threshold. Elements animate once — they don't re-animate on scroll back.
- **Reduced motion**: wrap all scroll-triggered animation in `@media (prefers-reduced-motion: no-preference)`. At `prefers-reduced-motion: reduce`, elements render at their final state immediately.

### Parallax on Product Tiles

Hero product renders on dark tiles have a subtle parallax effect:

- The product image translates at 80% of the scroll speed relative to the tile's text content (text scrolls at 100%).
- Maximum displacement: ±20px vertical. The parallax is felt, not seen.
- Implementation: `transform: translateY(calc(var(--scroll-offset) * -0.2))` updated on `requestAnimationFrame`.
- Disabled at `prefers-reduced-motion: reduce`.

### Carousel / Swipe

Product image carousels (iPhone color variants, AirPods gallery):

- **Swipe physics**: momentum-based scroll with deceleration coefficient ~0.998. A fast swipe travels 2–3 cards; a gentle swipe moves exactly one.
- **Snap**: CSS `scroll-snap-type: x mandatory; scroll-snap-align: center`.
- **Indicator dots**: current dot is `{colors.ink}` (8px diameter), inactive dots are `{colors.ink-muted-48}` (6px diameter). Transition between states: 200ms.
- **Edge bounce**: a 16px elastic overscroll at the first and last items, implemented via `overscroll-behavior: contain` and a CSS spring transform.

### Page Transitions

- **Navigation**: no full-page transition animation on apple.com — pages load directly. The sub-nav persists across same-product pages, providing visual continuity.
- **Modal/sheet opening**: slides up from bottom with spring overshoot (~4px past final position, then settles). Background dims to `rgba(0, 0, 0, 0.4)` over 200ms.
- **Accordion expand**: content reveals with `height: auto` animated via CSS Grid (`grid-template-rows: 0fr → 1fr`) over 300ms with ease-out.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (Action Blue #0066cc) for every interactive element — links, pill CTAs, focus signals — and nothing else. The single accent is non-negotiable.
- Set headlines in `{typography.hero-display}` or `{typography.display-lg}` with negative letter-spacing (`-0.28 → -0.374px`) to get the signature "Apple tight" cadence.
- Run body copy at `{typography.body}` (17px / 400 / 1.47 / -0.374px) — not 16px. The extra pixel defines the brand's reading pace.
- Alternate `{component.product-tile-light}` (or parchment) and `{component.product-tile-dark}` for full-bleed section rhythm. The color change IS the divider.
- Reserve `{rounded.pill}` for the primary blue CTA and any other element that should read as an "action" (configurator chips, search input, sticky bar CTA).
- Apply the single product-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) only to product renders resting on a surface — never on cards, buttons, or text.
- Use `transform: scale(0.95)` as the active/press state on every button — it's the system-wide micro-interaction.
- Keep the global nav `{colors.surface-black}` (true black) — it's the only place pure black appears on most pages.
- Use `{system-colors}` for semantic indicators in app-like contexts: `{system-colors.red}` for destructive, `{system-colors.green}` for success, `{system-colors.orange}` for warning. Always pair light and dark variants.
- Use `{product-accents}` only on the relevant product's marketing page, and only for swatches/tinting — never as interactive colors.
- Approximate Liquid Glass on web with `backdrop-filter: saturate(180%) blur(20px)` plus a semi-transparent tint background. Always provide a solid fallback.
- Wrap all motion in `@media (prefers-reduced-motion: no-preference)`. Apple's motion is deliberate — but always optional.

### Don't
- Don't introduce a second accent color; every "click me" signal is `{colors.primary}` (Action Blue).
- Don't add shadows to cards, buttons, or text — shadow is reserved for product imagery.
- Don't use gradients as decorative backgrounds; atmosphere comes from photography.
- Don't set body copy at weight 500 — Apple's ladder is 300 / 400 / 600 / 700, with 500 deliberately absent. Body is always 400; strong inline is 600; display is 600.
- Don't round full-bleed tiles — tiles are rectangular and edge-to-edge; the color change is the divider.
- Don't tighten line-height below 1.47 for body copy — the editorial leading is part of the brand.
- Don't mix radii grammars — use `{rounded.sm}` for compact utility, `{rounded.lg}` for utility cards, `{rounded.pill}` for pills, and nothing in between (except the rare `{rounded.md}` Pearl Button).
- Don't use `{colors.primary-on-dark}` (Sky Link Blue) on light surfaces — it's the dark-tile-only variant. Action Blue is for light surfaces.
- Don't apply Liquid Glass to full-bleed product tiles or the global nav — these are opaque anchor layers.
- Don't use Liquid Glass over video or animated content — the blur creates visual noise that undermines readability.
- Don't use `{system-colors}` as brand accents or decorative elements — they carry semantic meaning (red = destructive, green = success).
- Don't hardcode light-mode system colors in dark contexts — always use the paired `-dark` variant.
- Don't chain animations — one interaction = one response. Scale OR fade, never both simultaneously on the same element.
- Don't use `{product-accents}` colors as CTA button fills — product finish colors are identity, not interaction.

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

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.product-tile-dark}`, `{component.search-input}`).
2. Variants of an existing component (`-active`, `-focus`, `-2`, `-3`) live as separate entries in `components:`.
3. Use `{token.refs}` everywhere — never inline hex.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay SF Pro Display 600 with negative letter-spacing. Body stays SF Pro Text 400 at 17px. The boundary is unbreakable.
6. The single drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) is reserved for product photography only.
7. When in doubt about emphasis: alternate surface (light → dark tile) before adding chrome.
8. For native/app-like surfaces: use `{liquid-glass}` tokens for floating bars, sheets, and popovers. For web: use `backdrop-filter: saturate(180%) blur(20px)` with a solid fallback.
9. System colors (`{system-colors}`) are for semantic states only — never decorative. Always provide both light and dark variants.
10. Product accent colors (`{product-accents}`) are scoped to their product's page — never cross-contaminate.

## Known Gaps

- Form validation and error states were not surfaced on the analyzed pages; only the neutral search input is documented.
- The homepage's embedded video/player frame uses `{colors.surface-black}`; interior player controls are not documented (they're a platform widget, not a web-design token).
- Some component imagery is dynamic (rotating product hero) and its specific copy varies per surface — component specs name the structure, not the rotating content.
- Dark-mode counterparts for store and accessories utility cards were not surfaced on the analyzed pages; the system documented is the daytime/light-dominant variant Apple ships by default.
- Atmospheric photography (environment page mountain vista) is a content asset, not a design token; the documented `{component.environment-quote-card}` describes the structural surface only.
- The exact backdrop-filter blur radius on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` is platform-dependent; production CSS uses `saturate(180%) blur(20px)` as a typical baseline but the value isn't formalized as a token.
- Liquid Glass refraction and per-pixel tinting cannot be replicated in CSS — the `{liquid-glass}` tokens document the native platform reference. Web implementations are approximations.
- The Liquid Glass transparency slider value (0–100%) is user-controlled and cannot be read via CSS or JavaScript — design for both extremes and the 65–70% default.
- Product accent hex values are sampled from current-generation product imagery and may shift with new product releases or regional color availability.
- SF Symbols integration (the icon system paired with SF Pro) is native-only and not documented here; web targets should use custom SVG icon sets that match SF Pro's optical weight.
