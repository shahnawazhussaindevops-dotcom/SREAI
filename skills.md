# Gaur City Centre · Design & Animation Skills Library

A permanent registry of every design/animation skill and UI component library available to this project. Skills marked **INSTALLED** live in `C:\Users\ASUS\.config\opencode\skills\<name>\SKILL.md` and load automatically. Libraries are recorded here with commands so they can be added to any project forever.

---

## Installed Skills

| Skill | Location | What it does |
| --- | --- | --- |
| `apple-design` | `.config/opencode/skills/apple-design/SKILL.md` | Apple's fluid-interface principles: springs, interruptibility, momentum, materials, typography. Full body stored below |
| `motion` | `.config/opencode/skills/motion/SKILL.md` | Motion / Framer Motion library coverage (springs, variants, gestures, layout, scroll) |
| `21st-registry` | `.config/opencode/skills/21st-dev-registry/SKILL.md` | Publish/install React components to/from the team library on 21st.dev |
| `design-taste-frontend` | `.config/opencode/skills/design-taste-frontend/SKILL.md` | Anti-slop frontend skill for landing pages, portfolios, redesigns |
| `impeccable` | `.config/opencode/skills/impeccable/SKILL.md` | UI polish, hierarchy, typography, motion, accessible frontend work |
| `emil-design-eng` | `.agents/skills/emil-design-eng/SKILL.md` | Emil Kowalski's UI polish, component design and animation judgement |

---

## Apple Design — fluid interfaces (INSTALLED)

```yaml
---
name: apple-design
description: Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible transitions, translucent materials and depth, typography (optical sizing, tracking, leading), reduced-motion, or the design foundations behind Apple-style interfaces.
---
```

The through-line: **an interface feels alive when motion starts from the current on-screen value, inherits the user's velocity, projects momentum forward, and can be grabbed and reversed at any instant.** Springs do this naturally — they are inherently interruptible and velocity-aware.

### Quick Reference (full body: `apple-design/SKILL.md`)

| Need | Technique | Concrete value |
| --- | --- | --- |
| Default UI spring | Critically damped, no overshoot | `damping 1.0`, `response 0.3–0.4` |
| Momentum / flick spring | Under-damped, slight bounce | `damping ~0.8`, `response 0.3–0.4` |
| Gesture → spring velocity | Hand off release velocity | `gestureVelocity / (target − current)` if normalized |
| Flick landing point | Project momentum | `current + (v/1000)·0.998/(1−0.998)` |
| Interrupt cleanly | Start from presentation (live) value | read the on-screen transform |
| Reversible transition | Mirror the easing curve | inverse cubic-bézier |
| 1:1 drag | Pointer Events + capture | respect the grab offset |
| Feedback | On pointer-down, continuous | never only at the end |
| Boundary | Rubber-band, don't hard-stop | progressive resistance |
| Translucent chrome | `backdrop-filter` layer | content scrolls under |
| Type tracking | Size-specific, never fixed | tighten large text (`-0.02em`), body near `0` |
| Reduced motion | Cross-fade, not slide/spring | `@media (prefers-reduced-motion)` |

**House rules for this project:**
- Feedback on pointer-**down**, never only on click/up.
- Every animation starts from the live, on-screen value.
- Springs by default (`damping 1.0`); bounce only after a physical flick.
- Hand off gesture `velocity` into the follow-up spring; project momentum to pick snap targets.
- Animate **transform + opacity only** (`will-change` where motion is imminent).
- Nav/toolbars/cards are **translucent materials** (`backdrop-filter: blur()` + saturate), content scrolls beneath; edge-fade instead of hard dividers.
- Typography: negative tracking on display (≈ `-0.02em`), tight leading on h1–h3, body near `0` tracking. Scale with `clamp()` + `rem`.
- `prefers-reduced-motion` → short opacity cross-fades; `prefers-reduced-transparency` → solid surfaces.

---

## Motion / Framer Motion (INSTALLED)

Full reference: `.config/opencode/skills/motion/SKILL.md`.

```bash
npm i motion      # modern, smaller lib  (~/frame-motion)
npm i framer-motion
```

Core building blocks:
- `motion.div` components + `initial` / `animate` / `exit` / `transition`.
- **Variants** — named states with parent→child propagation and `staggerChildren`.
- **Gestures** — `whileHover`, `whileTap`, `whileInView`, `whileDrag`; events `onDrag`, `onDragStart`, `onDragEnd` (info carries `point`, `offset`, `velocity`).
- **Springs** — `transition={{ type: "spring", stiffness, damping, mass }}` or `{ bounce, visualDuration }`.
- **Layout** — `layout`, `layoutId` for shared-element transitions, `AnimatePresence` for exit animations (children need unique `key`).
- **Scroll** — `useScroll`, `useTransform`, `whileInView`.
- **Hooks** — `useSpring`, `useInView`, `useAnimate`, `useReducedMotion`.
- Performance: transform/opacity only; individual transform props (`x`, `scale`); avoid `left`/`top`/`width` tweening; `layoutId <->` sparingly.

```jsx
import { motion, AnimatePresence } from "framer-motion";
<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.5 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} />
```

---

## UI / Component Libraries (recorded for every project)

Install commands + quick usage. These pair best with the `motion` / `framer-motion` skills above.

### anime.js (JS animation engine)
```bash
npm i animejs
# or single file: https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js
```
```js
import anime from "animejs";
anime({ targets: ".stat__num", innerText: 12, round: 1, duration: 1400, easing: "easeOutExpo" });
anime({ targets: ".card", translateY: [24, 0], opacity: [0, 1], delay: anime.stagger(80), easing: "easeOutCubic" });
```

### Magic UI (React/Tailwind components, Next.js-first)
```bash
npx shadcn@latest add https://components.magicui.dev/r/...
# registry style
npx jsrepo@latest add https://components.magicui.dev/r/<component>
```
Components: magic card, sparkles text, marquees, bento grids, aurora background, beam, flashlight, animated number.

### reactbits.dev (React/Tailwind component marketplace)
```bash
npx shadcn@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>
npx jsrepo@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>
# shadcn registry config
{
  "registries": { "@react-bits": "https://reactbits.dev/r/{name}.json" }
}
```
Components: animated backgrounds, border animations, magnetic buttons, text animations, carousels, particles (tsParticles), animated grids.

### shadcn/ui (base component system)
```bash
npx shadcn@latest init
npx shadcn@latest add button card input sheet dialog accordion sonner ...
npx shadcn@latest mcp init --client claude
npx shadcn add @skiper-ui/skiper40
```
```jsx
import { Skiper40 } from "@/components/v1/skiper40";
```

### 21st.dev (publish/share React components)
- Install web UI components from the team library with one command; publish your own to reuse. Skill: `21st-registry`.
```bash
npx 21st add <component>
```

### uiverse.io (free copy-paste CSS/UI components)
- Open Source CSS/HTML component gallery — buttons, loaders, cards, glassmorphism. Copy the CSS block straight into any project; pairs with anime.js for the micro-interaction.

### Motion helpers handy in every React build
```bash
pnpm add clsx framer-motion lucide-react tailwind-merge
```
```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs) => twMerge(clsx(inputs));
```

### Other reference libraries
- `@react-three/fiber` + `three` — 3D scenes (expo: `<mesh><boxGeometry/></mesh>`).
- `gsap` — complex timelines (pair with Motion for state-driven UI).
- `vaul` / `@radix-ui` — draw-transition sheets & dialogs with momentum ("Apple accent" feel).
- `embla-carousel` — momentum scroll carousels using Apple's projection math (`decelerationRate ≈ 0.998`).
- `particles.js` / `tsparticles` — particle backgrounds for hero sections.
- `swiper` — touch carousels (10px hysteresis before direction lock).

---

## Project conventions (Gaur City Centre site)

- **Accent:** teal `#2fe6c2` on near-black `#05070a`. Deep material surfaces `#0d141b`.
- **Hero:** scroll-scrubbed video (`scrub_allkey.mp4` — all-keyframe, Range-supported server required). Lerp scrub `factor ≈ 0.12`, wait for `loadeddata`, mute + pause. `prefers-reduced-motion` → quiet autoplay, static content.
- **Enhancement only:** `anime.js` from CDN with a vanilla fallback; never let a library block core content.
- **Fonts:** Space Grotesk display + Inter body (premium); negative tracking on headings, `clamp()` fluid scale.

Recipe reminder: `npx impeccable init` / `npx impeccable install` and `npx ui-pro` (uipro init) are optional enhancement kits for polish passes.