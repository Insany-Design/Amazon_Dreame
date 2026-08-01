# Dreame L50 Ultra prototype

This directory is the canonical source for the product experience.

- `index.html`: semantic page structure and content
- `styles/prototype.css`: visual system, responsive rules and motion
- `scripts/component.js`: interface state and interaction behavior
- `scripts/boot.js`: lightweight runtime loader
- `scripts/early.js`: pre-render document modes
- `vendor/dc-runtime.js`: generated rendering runtime
- `assets/`: production media used by the page

The `prepare:prototype` task copies this source into `public/` before local development, tests and production builds. Files generated in `public/` are intentionally not versioned.
