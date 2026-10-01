# REFERENCES — external sources, allowed and banned use

CLAUDE.md and DESIGN.md override everything here. Nothing below may add a
colour, a rounded corner, a new easing curve or a claim.

- **Motion (framer-motion)** — allowed: all UI animation (reveals, springs, layout transitions, presence). Banned: adding anime.js, react-spring or any second UI animation runtime.
- **Lenis** — allowed: desktop smooth scroll, driven from `lib/ticker.js`. Banned: running it on touch, under reduced motion, or with its own `autoRaf` (one ticker only).
- **GSAP + ScrollTrigger** (npm `gsap`, standard no-charge licence) — allowed: pinned or scroll-scrubbed sequences only, dynamically imported by the component that needs them (today: `CompoundingScrub`). Banned: hover/reveal animation (that's Motion), importing it statically, any page-wide use.
- **ThreeUI** (threeui.com, MengTo/threeui) — allowed: reference for WebGL fields and keycap feel. Banned: copying its source (licence not verified in this repo), adding three.js, its paid MCP. Our field is raw WebGL in `HeroField.jsx`.
- **21st.dev** — allowed: behaviour and accessibility patterns (dialog focus trap, Esc, scroll lock, focus return; combobox/listbox palette). Banned: its visual styling (rounded cards, shadows, gradients); everything restyled to square corners and hairlines. Its Magic MCP needs an API key and is not installed.
- **Taste Skill** (Leonxlnx/taste-skill) — allowed: advisory audit and pre-flight checklist. Banned: overriding the rulebook (e.g. its defaults on light themes, rounded UI or palettes). Not installed in this repo; install needs the owner's approval.
- **Unicorn Studio** — inspiration only for shader-field mood. Banned: embeds or any runtime dependency.
- **basement.studio** — inspiration only for type scale and restraint. Banned: copying assets or code.
- **shadergradient** — banned (gradients as decoration are against the design rules).
