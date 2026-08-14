# DESIGN

## Summary

Premium, minimalist command center for a site-reliability monitoring tool. Dark, flat, high-density surfaces; a single cyan operational accent; status only ever communicated with semantic color. Styling reflects argo-control-instrument calm: surfaces recede, data and status lead.

## Color

Hard dark theme. Near-black flat canvas, subtle raised surfaces stepped by luminance, hairline borders. One cyan accent reserved for active/primary/live. Semantic palette for status only.

```
--bg-canvas:      #0A0C0E   (app background)
--bg-surface:     #12151A   (panels, cards)
--bg-surface-2:   #191D24   (raised: inputs, selects, toolbar)
--bg-elevated:    #1F242C   (modal, hover)

--border:         rgba(255,255,255,0.06)
--border-strong:  rgba(255,255,255,0.10)
--border-accent:  rgba(45,212,255,0.35)

--text-primary:   #E9EDF1
--text-secondary: #9BA6B3
--text-tertiary:  #6B7684

--accent:         #2DD4FF   (primary / active / live)
--ok:             #34D399
--warn:           #FBBF24
--crit:           #F87171
--info:           #60A5FA
```

- **Restrained strategy**: neutrals carry ~90% of surface; the accent appears on the active nav item, the primary "Add Server" action, live indicators, and focus rings. No accent on inactive states.
- Semantic status = `ok`/`warn`/`crit` only. Never decorative glow; at most a 1px status border on an anomaly that actually exists.
- Contrast: text-secondary `#9BA6B3` on surface `#12151A` ≈ 7:1; tertiary `#6B7684` held for captions only, never body text.

## Typography

- **Inter** (var(--font-body)) for everything: headings, labels, buttons, data.
- **JetBrains Mono** (var(--font-mono)) for terminals, log streams, IPs, raw metrics, and numeric-heavy data cells.
- System-stack fallbacks; no display-serif, no hand-drawn accents.
- Scale (product register, fixed rem):
  - Display / page title: 1.25rem / 600
  - Card heading: 0.8125rem / 600
  - Label / caption: 0.75rem / 500, letter-spacing 0.01em (never wide-tracked uppercase)
  - Body: 0.875rem / 400
  - Data / terminal: 0.8125rem mono / 450–500
- Line length for prose kept ≤ 75ch (only RCA explanation reads as prose).

## Components

- **Panels / cards**: flat `--bg-surface`, hairline `--border`, radius 12px. One border + no drop shadow (per anti-ghost-card rule). Hover: border slightly stronger + 1px lift only on interactive cards; no scale.
- **Buttons**: radius 8px, 0.8125rem/600. Primary: solid `--accent` with dark text overlay when needed, or white-text on accent only when contrast passes; Secondary: surface-2 + border. Disabled, loading, focus states all present. **No gradient, no glow shadow.**
- **Nav**: quiet icon+label rows on transparent; active = surface-2 pill + accent text, no left stripe, no glow.
- **Chips / status**: dot + text pair; ok/warn/crit colors; the critical chip may carry a subtle 1px crit border, never a permanent pulse unless the state is live-anomaly.
- **Inputs**: surface-2 background, hairline border, 8px radius, visible focus ring (2px accent offset).
- **Terminal**: flat black inset (`#0B0D10`), mono 0.8125rem, no blur; log level coloring only on the level token, quiet timestamps.
- **Tooltip / modal**: elevated surface, border-strong; modal over `rgba(0,0,0,0.6)` dim; radius 12px panels, 8px controls.

## Layout

- App shell: fixed left rail (~64px icon rail + 224px labeled nav) or a single 240px labeled rail; content padded 24px.
- Header: H1 (page name) left; right = Add Server (primary), system-crit count chip, live/healthy chip.
- Dashboard grid: KPI row (2×4 or 4-across) above 3D-topology + terminal split (topology 2/3, terminal 1/3).
- Density is a feature: tight spacing in inventory strip and log streams (py spacing 8–12px, not 16–24px).
- Responsive: sidebar collapses to icons ≤1024px; secondary nav in content; grids use gap 16px with minmax.

## Motion

- 150–250ms easings only (ease-out, expo for reveals of panels). No springy button bounces.
- Motion conveys state: stream updates, connection heartbeat, AI analyzing → subtle loader. No orchestrated page-load sequence; panels render, no staged choreography.
- `@media (prefers-reduced-motion: reduce)`: disable all nonessential animation, terminal pulsing, and spring transitions; keep opacity crossfades for tabs.

## Iconography

- lucide-react, default stroke 2, 16–20px. Icons carry meaning (server, terminal, shield-alert, cpu); never decorative duplicates. Accent-colored icons only where the state they represent is real (active anomaly).

## Empty / Loading / Error states

- Empty: teach the action ("No servers registered — add one to begin monitoring") rather than blank.
- Loading: skeletons/quiet spinners inside the panel; never a full-screen flash.
- Error: inline crit-tinted message with a retry affordance; terminal shows connection state (live / connecting / offline).