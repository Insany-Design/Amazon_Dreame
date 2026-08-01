# Project architecture

## Product source

The complete landing page lives in `prototype/`. Markup, presentation, behavior, runtime and media are separated so each concern can evolve independently.

## Application shell

The `app/` directory owns the public routes and metadata. The root route points to the prepared static product experience, while `/figma` activates its static export mode.

## Build pipeline

`scripts/prepare-prototype.mjs` creates the deployable static files in `public/` from the canonical prototype source. The production build then packages the application shell and those assets for Sites.

## Quality controls

The tests verify routing, source separation, export mode, motion accessibility and the presence of essential product assets.
