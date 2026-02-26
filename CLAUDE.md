# CSS Color Playground

An interactive educational tool for exploring CSS Color Module Level 4 & 5 features — `color-mix()`, relative color syntax, color spaces, and `light-dark()`.

## Quick Start

```bash
npm install
npm run dev
```

Currently vanilla JS + CSS with Vite as the dev server/bundler. The architecture is designed so that a migration to React is feasible — the module-per-section pattern maps naturally to components, and the state objects can become hooks. If/when React is introduced, add it to this Vite setup (`npm install react react-dom @vitejs/plugin-react`) and migrate incrementally per-section rather than all at once. The shared utilities in `utils.js` are framework-agnostic and should stay that way.

## Project Structure

```
index.html                     # Single-page app, all four sections
src/
  main.js                      # Entry point, initializes modules + scroll-based nav
  modules/
    utils.js                   # Shared: resolveColor(), color space configs, copy, sync helpers
    colorMix.js                # color-mix() playground
    relativeColors.js          # Relative color syntax playground
    colorSpaces.js             # Perceptual uniformity comparison (lightness ramps)
    lightDark.js               # light-dark() playground
  styles/
    main.css                   # Import hub
    tokens.css                 # Design tokens (colors, type, spacing, radii)
    base.css                   # Reset, global element styles
    layout.css                 # Header, nav, sections, footer
    components.css             # Controls, swatches, chips, code output, palette
```

## Key Architecture Decisions

**Browser-native color resolution.** All color computation uses `resolveColor()` in `utils.js` — it applies a CSS color expression to a temporary DOM element and reads back `getComputedStyle`. This means results always match actual browser behavior rather than a JS approximation. The tradeoff is it only works for features the current browser supports.

**Module-per-section pattern.** Each playground section is a self-contained module with its own `state` object and `update()` function. Modules import shared utilities from `utils.js` but don't depend on each other. To add a new section: create a module, add HTML in `index.html`, import/init in `main.js`.

**No build-time CSS processing.** Styles are plain CSS with `@import` (resolved by Vite). Design tokens live in `tokens.css` as custom properties. The project intentionally avoids preprocessors since the whole point is demonstrating what native CSS can do now.

**`COLOR_SPACES` config in utils.js** defines channel metadata (names, ranges, units) and template functions for each color space. Both the relative colors module and potentially future modules consume this config. To add a new color space, add an entry here.

## Conventions

- **State management:** Each module uses a plain object (`let state = {...}`) at module scope. No reactivity library — `update()` is called explicitly after state changes.
- **DOM IDs:** Follow the pattern `{section}-{element}`, e.g., `mix-color-1`, `rcs-base-color`, `cs-steps`.
- **CSS classes:** BEM-ish but not strict. `.playground-section`, `.playground-panel`, `.control-group`, `.space-chips`, `.chip.active`.
- **Code output blocks:** Each section has a `<pre><code id="{section}-css-output">` that gets updated with generated CSS. Copy buttons target these by `data-target` attribute.

## Design Direction

Dark surface, restrained and editorial. Instrument Serif for display type, DM Mono for code/labels, DM Sans for body. Color swatches are the primary visual element — the UI stays out of the way. Refer to `tokens.css` for the full palette and spacing scale.

## Spec-First Development Philosophy

This project tracks the latest Editor's Drafts of the CSS Color specifications, not just what's currently shipping in browsers. When making changes or adding features:

- **Always consult the latest Editor's Drafts first** — not blog posts, not MDN (which may lag), not cached knowledge. The drafts at csswg.org are the canonical source of truth for syntax, behavior, and naming. If a function's signature or default behavior has changed in the latest draft, update accordingly.
- **Implement to the spec, degrade for browsers.** Write CSS and generated code output that matches the current spec. If a browser hasn't caught up yet, note it — but don't water down the educational content to match incomplete implementations.
- **Track spec changes actively.** The Color Level 5 spec is still an Editor's Draft and evolves. Key areas that are still in flux or not yet shipping: `contrast-color()`, `@color-profile` / custom ICC spaces, and multi-color `color-mix()` (3+ colors). When these stabilize or ship, they should be added as new playground sections.
- **Generated CSS output must be spec-correct.** The code snippets users copy from this tool should reflect current spec syntax. If the spec changes a default (e.g., `color-mix()` defaulting to oklab when no interpolation method is specified), the output must reflect that.
- **Use `@supports` and feature detection** where appropriate, both in the playground's own styles and in the generated CSS examples shown to users. This teaches good progressive enhancement habits.
- **New CSS color features to watch:** `contrast-color()`, `color-contrast()` (if it returns), gamut mapping (`in` keyword behavior), `@color-profile` for ICC profiles, and any changes to hue interpolation defaults.

## Spec References

Primary specs — always check the Editor's Draft (drafts.csswg.org), not the published Working Draft (w3.org/TR), as the Editor's Draft is more current:

- **CSS Color Module Level 5 (Editor's Draft):** https://drafts.csswg.org/css-color-5/
- **CSS Color Module Level 4 (Editor's Draft):** https://drafts.csswg.org/css-color-4/

Secondary references (useful but may not reflect latest spec changes):

- MDN Relative Colors guide: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Colors/Using_relative_colors
- Chrome blog on relative color syntax: https://developer.chrome.com/blog/css-relative-color-syntax/
- W3C CSS Color 5 changelog: https://drafts.csswg.org/css-color-5/#changes

## Browser Requirements

Requires a modern browser with support for `color-mix()` (baseline 2023), relative color syntax (baseline 2024), and `light-dark()` (baseline 2024). Chrome 119+, Safari 16.4+, Firefox 128+.

## Known Limitations / Future Work

**Current gaps:**
- Relative color channel slider ranges could be tighter per-space (e.g., oklch chroma rarely exceeds 0.3 in practice)
- No alpha channel controls yet in the relative colors section
- The `resolveColor()` approach means unsupported expressions silently fall back — could add feature detection warnings
- No gamut visualization (P3 vs sRGB boundary)

**New playground sections to add:**
- [ ] **Gradient Interpolation** — side-by-side comparison of `linear-gradient(in oklch, ...)` vs `in srgb` vs `in lab` etc. Shows how interpolation color space dramatically affects gradients (sRGB goes muddy, oklch stays vibrant). Builds on the color spaces section.
- [ ] **Wide Gamut / `color()` function** — demonstrate `color(display-p3 ...)`, `color(a98-rgb ...)`, `color(rec2020 ...)`. Show colors outside sRGB gamut, visualize gamut boundaries, and show browser gamut mapping behavior. High visual impact on P3 displays.
- [ ] **`hwb()` Color Function** — Hue, Whiteness, Blackness model with interactive sliders. Compare against HSL to show the more intuitive mental model. Level 4 feature, well-supported.
- [ ] **Contrast & Accessibility** — take two colors, calculate WCAG contrast ratios, then use `color-mix()` or relative colors to suggest accessible alternatives. Ties the other sections together practically.

**Pending spec features (add when browsers ship):**
- `contrast-color()` — automatically pick a contrasting text color. High value for the design systems audience. Not yet in any browser.
- `@color-profile` / custom ICC color spaces — very limited support, but would be a powerful advanced section.
- Multi-color `color-mix()` with 3+ colors — in the spec but watch for syntax changes.

**React migration path:**
- Each module in `src/modules/` maps to a future React component (e.g., `colorMix.js` → `<ColorMixPlayground />`)
- `utils.js` stays as a shared utility module — it's already framework-agnostic
- `COLOR_SPACES` and `MIX_SPACES` configs become shared constants
- Module-level `state` objects become `useState`/`useReducer` hooks
- The `resolveColor()` DOM-based approach still works in React via `useEffect` or refs — no need to rewrite it
- CSS stays as-is; no CSS-in-JS needed. The plain CSS + custom properties approach is part of the project's philosophy