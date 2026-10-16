# AGENTS.md — M7 GRAND PRIX

## Project Overview
"M7 GRAND PRIX" is an interactive, Formula 1 broadcast-style 7th Birthday Invitation, 3D Venue Circuit Guide, and Guest RSVP + Pit Wall Admin System for **Mattheu Amari**.

---

## Agent Skills Available in this Project (`.agents/skills/`)

The following skills are installed directly in `.agents/skills/` to guide frontend engineering, UI/UX refinement, and responsive mobile optimization:

1. **`ui-ux-pro-max`**: Design system best practices, typography scales, contrast checking, component states, and micro-animations.
2. **`mobile-design`**: Touch targets (>= 44x44px), mobile portrait layouts, viewport-fit, mobile in-app browser webviews (Messenger, Viber, WhatsApp), safe area padding.
3. **`web-design-guidelines`**: Accessibility, semantic markup, visual hierarchy, grid systems, and spacing tokens.
4. **`3d-web-experience`**: React Three Fiber, WebGL procedural geometries, lighting, camera rigs, and performance optimization on mobile GPUs.
5. **`ux-audit`**: Heuristic evaluation, frictionless RSVP forms, clear CTA signposts, error prevention, and live telemetry feedback.
6. **`frontend-ui-ux-design`**: Official Formula 1 TV broadcast aesthetics, carbon fiber motifs, chamfered angles, alternating kerb accents, and telemetry styling.

---

## UI/UX & Mobile Responsiveness Verification Checklist

Before making frontend changes, verify against the following standards:

### 1. Viewports & Safe Areas
- Test responsive breakpoints: Small Mobile (360px - 390px), Mobile Large (414px - 430px), Tablet (768px), and Desktop (1024px+).
- Use `viewport-fit=cover` and safe area padding (`env(safe-area-inset-bottom)`) so bottom buttons are never obscured by iPhone home indicator bars.
- Ensure no horizontal scrolling or unintended viewport overflow occurs.

### 2. Touch Targets & Input Ergonomics
- All interactive buttons and toggles must have a minimum tap area of 44×44px.
- Form inputs must have minimum font size of 16px on mobile (or proper meta zoom configuration) to prevent iOS Safari auto-zooming on focus.
- Add/Remove buttons for Pit Crew companions must be easily tappable on touchscreen devices without fat-finger errors.

### 3. 3D WebGL Performance
- Cap device pixel ratio to `Math.min(window.devicePixelRatio, 2)` to preserve mobile battery and frame rate.
- Avoid DOM-based HTML overlays inside Three.js Canvas to eliminate React 19 unmount race conditions; use native 3D billboards or 2D HUD layers instead.
- Provide smooth damping on OrbitControls for mobile pinch-to-zoom and one-finger rotation.

### 4. Accessibility & Contrast
- Maintain WCAG AA contrast ratio between text and dark asphalt/carbon backgrounds.
- Telemetry cyan (`#00D2BE`) and F1 Red (`#E10600`) used strategically with high-contrast font weights.
