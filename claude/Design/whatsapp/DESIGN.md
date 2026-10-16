---
brand: WhatsApp
category: messaging / communication
description: "A dark-emerald and crisp-mint messaging ecosystem built around maximum visual contrast and legibility. Unlike modern AI apps that lean heavily into cool slate or neutral gray, WhatsApp grounds its identity in a signature high-saturation deep teal (`#075E54`) and bright action green (`#25D366`), contrasted against high-density dark backgrounds (`#0B141A`) or ultra-clean light surfaces. Its visual signature lies in chat-bubble geometry (rounded corners with directional tail anchors), distinct message delivery states (single tick, double tick, blue read receipts), and subtle wallpaper patterns behind content streams."
colors:
  primary: "#25D366"           # WhatsApp Brand Green / Action / Floating Buttons
  primary-active: "#128C7E"    # Deep Teal Green / Active States
  primary-dark: "#075E54"      # Legacy Header / Dark Teal
  surface-light: "#FFFFFF"     # Light mode chat area / message cards
  surface-dark: "#0B141A"      # Dark mode root background
  surface-dark-card: "#111B21" # Dark mode message container / list item
  bubble-outgoing-light: "#E7FCE3" # Light mode outgoing message bubble
  bubble-outgoing-dark: "#005C4B"  # Dark mode outgoing message bubble
  bubble-incoming-light: "#FFFFFF" # Light mode incoming message bubble
  bubble-incoming-dark: "#202C33"  # Dark mode incoming message bubble
  ink: "#111B21"               # Primary body text in light mode
  ink-inverse: "#E9EDEF"       # Primary text in dark mode
  body: "#667781"              # Muted text / Timestamps / Status indicators
  check-read: "#53BDEB"        # Read receipt blue double-check
  check-delivered: "#8696A0"   # Delivered gray double-check
type:
  voice: "Direct, human, ultra-clear, and utility-focused. Prioritizes immediate readability, zero interface friction, and universal accessibility across devices."
  font-family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  headings: "font-weight: 600; letter-spacing: -0.01em;"
  body: "font-weight: 400; line-height: 1.45;"
spacing:
  container-max: "1200px"
  radius-bubble: "8px"
  radius-card: "12px"
  radius-pill: "24px"
---

# WhatsApp Visual Identity Guidelines

WhatsApp's design philosophy centers on universal clarity, low cognitive load, and high contrast communication.

## Core Elements

1. **Color Dynamics**:
   - High-contrast green actions (`#25D366`) paired with deep teal structural headers (`#075E54`).
   - Distinct dark mode using deep pitch-teal (`#0B141A` background, `#111B21` cards) rather than pure `#000000`.

2. **Chat Bubble Geometry**:
   - Message cards utilize compact 8px border-radius with distinct directional visual tails.
   - Distinct background fills for outgoing (`#E7FCE3` light / `#005C4B` dark) vs incoming messages.

3. **Status Indicators & Micro-typography**:
   - Double-check mark iconography for delivery (`#8696A0`) and read status (`#53BDEB`).
   - Inline right-aligned timestamps set in muted secondary text (`#667781`).