# Product

## Register

product

## Users

Site reliability engineers and on-call DevOps engineers who monitor a fleet of servers (SSH + Prometheus) and triage live failures from one control tower. They are in a task: watch health, spot anomalies, understand root cause, and act fast. They use this on a desk monitor or laptop, usually in low-light operations contexts, and they want density and truthfulness — no ornament that hides state.

## Product Purpose

SREAI is a real-time infrastructure monitoring command center: it polls real SSH/Prometheus metrics, streams live logs over WebSocket, runs AI root-cause analysis on error telemetry, and offers one-click remediation execution against monitored hosts. Success looks like an operator trusting the dashboard enough to act from it: a red node means a real outage, a green node means verified health, and the RCA panel turns an ambiguous log dump into a confident next step.

## Brand Personality

Precise, calm, technically confident. Feels like a control instrument, not a game. Three words: **precise · calm · expert**.

References that capture the feel: Linear (density, keyboard-first calm, restrained violet accent), Raycast (fast dark shell, total focus), Stripe's dashboard (data-forward, unglamorous clarity), a cockpit or flight-instrument HUD (state equals color/position, nothing decorative). The terminal is a first-class citizen, not a skin.

## Anti-references

- Cyber-glass slop: heavy backdrop blur, cyan+purple glow on everything, gradient text, gradient CTA buttons, glass panels that float with glow shadows.
- The "cool dark tool" reflex: neon accents on inactive states, animated particle backgrounds, pulsing glows as default decoration.
- Navy-and-cyan template SaaS (Vercel-style exactness is fine as craft, not as a crutch).
- Dense-but-gimmicky "cyberpunk ops" dashboards: skewed panels, scan-line overlays, radial gauges that mean nothing.
- Cards with side-stripe borders (`border-left` accent), radius ≥ 20px on surfaces, hero-metric KPI clichés (giant number + gradient).

## Design Principles

- **State is legible, decoration is silent.** Color and motion should only ever report status. If a green dot is decorative, remove it; if an animation doesn't convey state, cut it.
- **Data-forward calm.** Surfaces recede; the metrics, logs, and topology carry the interface. Density is a feature for this user, never something to hide.
- **Earned familiarity.** Standard affordances (nav, tables, forms, select) done precisely — not reinvented. The tool disappears into the task.
- **One accent, used with intent.** A single operational accent (cyan) for active/primary/live states. All status (ok/warn/crit) is semantic color and nothing else.
- **Restraint under pressure.** On-call users operate under stress; the UI must not add noise, false urgency, or motion that competes with the signal.

## Accessibility & Inclusion

- WCAG AA contrast targets for body text and data (4.5:1 minimum; 3:1 for large text).
- Status is never conveyed by color alone: dot + label text, thresholds shown as values.
- `prefers-reduced-motion` honored — nonessential animation disabled, crossfades for reveals.
- Terminal/log streams remain readable at high density: mono font, crisp anti-aliasing, no decorative blurring of content.
- Focus states must be visible on all interactive elements (nav, buttons, selects).