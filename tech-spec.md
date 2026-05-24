# Tech Spec — Ylenia Studio Portfolio

## Overview

Single-page portfolio for a 3D Environment Artist with scroll-driven 3D hero, horizontal work gallery, animated skill charts, and bilingual FR/EN support.

## Dependencies

- **Runtime**: `three`, `gsap` (with ScrollTrigger), `d3`, `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- **Build**: Vite + React + TypeScript + Tailwind CSS (pre-configured)

## Component Inventory

### Layout
- **Header** — Fixed overlay, transparent, nav links + language toggle
- **Footer** — Full-width, logo + links + language toggle

### Sections
- **Hero3D** — Fullscreen Three.js scene pinned via GSAP ScrollTrigger (800vh). 7-phase scroll-driven 3D movie with camera animation, 3D text, particles, image cubes, starburst. HTML HUD overlay with phase labels and progress bar.
- **Work** — Standard flow section with horizontal scroll gallery (CSS scroll-snap). 10 project cards with 3D perspective effect.
- **Skills** — Two-column layout. Left: heading + description. Right: category tabs + radial skill meters (SVG) + bar chart. D3.js for radial arcs. GSAP for entrance animations. Google Sheets integration.
- **Contact** — Two-column layout. Left: heading + description + social links. Right: contact form.

### Reusable Components
- **RadialSkillMeter** — SVG circle with animated stroke-dashoffset
- **SkillBar** — Animated width bar with gradient fill
- **ProjectCard** — Image card with overlay and hover effects

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| Hero 3D scroll-driven scene | Three.js + GSAP ScrollTrigger | Pin hero for 800vh, map progress to timeline controlling camera path, object animations, shader uniforms | High |
| Hero 3D text curtain reveal | Three.js custom shader | Vertex shader offsets vertices based on progress uniform | High |
| Hero 3D camera path | GSAP + custom binary search | Predefined position array, interpolate camera position by progress | Medium |
| Hero dust particles | Three.js Points + ShaderMaterial | 500 additive-blended sprites with custom vertex/fragment shaders | Medium |
| Hero starburst | Three.js custom geometry | 12-point star shape with ring, rotate on scroll | Medium |
| Hero HUD phase transitions | GSAP | Update HTML text content based on progress ranges | Low |
| Section scroll reveals | GSAP ScrollTrigger | Opacity + translateY entrance animations, stagger siblings | Low |
| Work gallery 3D perspective | Custom JS + CSS | Apply rotateY transform based on card position relative to viewport center | Low |
| Skill radial meter fill | GSAP | Animate stroke-dashoffset from circumference to target | Low |
| Skill bar width animation | GSAP | Animate width from 0% to target% on scroll enter | Low |
| Header opacity on scroll | GSAP ScrollTrigger | Fade to 0.8 when scrollY > 200 | Low |

## State & Logic

### i18n System
- `react-i18next` with `i18next-browser-languagedetector`
- Translation keys for all UI text, skill names, project titles
- Language stored in localStorage, toggled via header/footer buttons
- 3D scene HTML overlays update reactively on language change

### Scroll Architecture
- **Hero**: GSAP ScrollTrigger pins section for 800vh, scrub drives Three.js timeline
- **Content sections**: Standard scroll flow, ScrollTrigger for entrance animations
- **Work gallery**: CSS scroll-snap horizontal container, drag-to-scroll via mouse events
- **Scroll snapping**: GSAP ScrollTrigger `snap` on global level to snap to section starts after hero unpin

### Data Flow
- **Skills**: Fetched from Google Sheets CSV on mount → parsed → stored in state → passed to charts
- **Fallback**: Hardcoded skill data used if fetch fails
- **Projects**: Static data array with image paths

### Google Sheets Integration
- URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv`
- Columns: Category, Skill_EN, Skill_FR, Level
- Parsed with native CSV splitting (no external parser needed)
- Fetch once on page load, cache in component state

## Other Key Decisions

- **Three.js vanilla** (not R3F) for direct control over shaders, render loop, and GSAP integration
- **No router** needed — single page with anchor scrolling
- **Hero 3D**: Custom render loop with `requestAnimationFrame`, paused when hero not visible (IntersectionObserver)
- **Mobile**: Reduce particle count by 50%, simplify camera path, stack layouts vertically
- **Reduced motion**: Disable scroll-driven 3D animation, show static gallery view, instant transitions
