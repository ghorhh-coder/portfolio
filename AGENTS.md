<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Exceptional UX Builder & Product Engineering Directives

- **The "2px Standard" (Proactive Attention to Detail)**:
  - Catch and fix the 2px misalignment, unstyled loading states, awkwardly worded empty states, unwanted default browser tooltips, and clipping text *proactively before anyone asks*.
  - Eliminate layout shifts (CLS), unhandled edge cases, and rough visual edges.
  - Zero Corner Hugging: Never allow badges, indicator dots, or text baselines to collide with rounded container corners. Maintain proportional optical padding (`px-5 py-4` minimum on rounded containers) with generous breathing room.

- **Deep UX Craft (Think in Flows & States, Not Just Screens)**:
  - Never design or build just a static screen. Architect every component across its full lifecycle:
    - **The First Mile**: Onboarding, discovery, and first-run experiences that make the interface feel natural and obvious within seconds.
    - **Loading States**: Seamless crystal skeletons with subtle shimmer; never jarring blank gaps or raw spinners.
    - **Empty States**: Crafted with personality, clarity, and an immediate clear call-to-action (CTA).
    - **Error & Recovery**: Informative, elegant error feedback with one-click retry pathways.
    - **Data Density & Overflow**: Graceful multi-line wraps, truncation with optical tooltips, and responsive scaling from mobile (360px) to ultra-wide displays.
    - **Stacking & Z-Index Precision**: Popovers, tooltips, and dropdowns must elevate their entire parent branch (`z-30+` on parent section, `hover:z-50` on trigger, `z-[100]` on floating popover) to prevent child clipping by sibling stacking contexts.

- **Quiet Luxury & Design System Consistency**:
  - Maintain an evolving, high-end design language (refined glassmorphism, optical crystal badges, subtle ambient glow, and calibrated spring micro-interactions).
  - Every component must feel unified, tactile, and weightless (`active:scale-95`, 60fps transitions using Apple-grade curves). Avoid generic templates or raw, aggressive solid fills.
  - High Legibility Contrast: Never render faint semi-transparent text directly against high-frequency or dark gradient backdrops; use calibrated solid-tint glass backgrounds (`bg-[#09090b]/95` or `rgba(10,10,12,0.95)`) for absolute clarity.

- **Builder's Range & Full-Stack Completeness**:
  - Own features end-to-end (React, TypeScript, Next.js, CSS animations, and backend APIs/data layers).
  - Invest primary focus in crafting a delightful, unmatched user experience, backed by rock-solid, production-grade engineering.

- **Opinions, Openly Held**:
  - Proactively challenge unintuitive, clunky, or high-friction interactions. Propose and implement higher-fidelity, frictionless alternatives with clear rationale.
