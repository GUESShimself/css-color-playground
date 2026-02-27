# CSS Color Playground

An interactive exploration of modern CSS Color Level 4 & 5 features.

This playground lets you experiment with:
- `color-mix()`
- Relative color syntax (`oklch(from …)`)
- Perceptual color spaces (OKLCH / OKLAB)
- Light-dark system-aware theming

Built to better understand how modern CSS handles color — and how that impacts design systems.

## Sections

- **color-mix()** — Blend two colors in any color space at any ratio and see how the mixing space affects the result
- **Relative Colors** — Decompose a color into its channels, manipulate them with `calc()`, and generate full palettes
- **Color Spaces** — Compare lightness ramps across oklch, lch, hsl, and color-mix to see perceptual uniformity in action
- **light-dark()** — Preview the native CSS function that resolves to one of two colors based on `color-scheme`

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in a supported browser.

### Build for production

```bash
npm run build
npm run preview   # preview the build locally
```

The output is a static site in `dist/` — deploy it anywhere.

## Browser support

Requires a browser that supports CSS Color Level 4 & 5 features:

- Chrome 119+
- Safari 16.4+
- Firefox 128+

## Project structure

```
src/
├── main.js                 Entry point, initializes modules + scroll-based nav
├── modules/
│   ├── colorMix.js         color-mix() playground
│   ├── relativeColors.js   Relative color syntax playground
│   ├── colorSpaces.js      Color space comparison
│   ├── lightDark.js        light-dark() playground
│   └── utils.js            Shared utilities (resolveColor, color space configs)
└── styles/
    ├── main.css            Import hub
    ├── tokens.css          Design tokens (colors, type scale, spacing)
    ├── base.css            Reset and global styles
    ├── layout.css          Sidebar, nav, sections, footer
    └── components.css      Controls, swatches, chips, code output
```

## How it works

Colors are resolved natively by the browser using a `resolveColor()` utility that applies a CSS color expression to a temporary DOM element and reads back the computed value. There are no JavaScript color libraries — what you see is exactly what the browser produces.

Each playground section is a self-contained module with its own state and update cycle. The `COLOR_SPACES` config in `utils.js` defines channel metadata (ranges, units, labels) used by the relative colors and color spaces sections.

## Tech stack

- **Vite** — Dev server and bundler
- **Vanilla JS** — ES modules, no framework
- **Plain CSS** — Custom properties, `@import`, no preprocessor

## License

MIT
