/**
 * contrast-color() Playground Module
 */
import { syncColorInputs, resolveColor } from './utils.js';

let state = {
  bgColor: '#6633ee',
  tintAmount: 20,
  isSupported: false,
};

// --- WCAG 2.0 contrast math ---

function linearize(c8bit) {
  const c = c8bit / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(L1, L2) {
  const lighter = Math.max(L1, L2);
  const darker  = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(computed) {
  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return { r: 0, g: 0, b: 0 };
  return { r: +m[1], g: +m[2], b: +m[3] };
}

function jsContrastColor(bgRgb) {
  const L = relativeLuminance(bgRgb);
  return contrastRatio(1.0, L) >= contrastRatio(L, 0.0) ? 'white' : 'black';
}

// ---

function updateCssOutput(bgColor, tintAmount, contrastKeyword) {
  const tintExpr = `color-mix(in oklch, ${bgColor} ${tintAmount}%, contrast-color(${bgColor}))`;
  document.getElementById('cc-css-output').textContent =
    `/* contrast-color() — automatic high-contrast text */\n` +
    `.element {\n` +
    `  background: ${bgColor};\n` +
    `  color: contrast-color(${bgColor});\n` +
    `}\n\n` +
    `/* With @supports fallback for older browsers */\n` +
    `.element {\n` +
    `  background: ${bgColor};\n` +
    `  color: ${contrastKeyword}; /* fallback */\n` +
    `\n` +
    `  @supports (color: contrast-color(red)) {\n` +
    `    color: contrast-color(${bgColor});\n` +
    `  }\n` +
    `}\n\n` +
    `/* Brand color recovery with color-mix() tinting */\n` +
    `.element {\n` +
    `  background: ${bgColor};\n` +
    `  /* Blend ${tintAmount}% of the bg hue back in for brand identity */\n` +
    `  color: ${tintExpr};\n` +
    `}`;
}

function update() {
  const { bgColor, tintAmount, isSupported } = state;

  const resolvedBg = resolveColor(bgColor);
  const bgRgb = parseRgb(resolvedBg);

  const L = relativeLuminance(bgRgb);
  const ratioVsWhite = contrastRatio(1.0, L);
  const ratioVsBlack = contrastRatio(L, 0.0);
  const contrastKeyword = jsContrastColor(bgRgb);

  // Swatch background
  const swatch = document.getElementById('cc-bg-swatch');
  swatch.style.background = bgColor;

  // Result text — use native contrast-color() on supporting browsers
  const resultText = document.getElementById('cc-result-text');
  if (isSupported) {
    swatch.style.setProperty('--cc-bg', bgColor);
    resultText.style.color = 'contrast-color(var(--cc-bg))';
  } else {
    resultText.style.color = contrastKeyword;
  }

  // Badge
  document.getElementById('cc-result-badge').textContent = contrastKeyword;

  // Ratio bars (max meaningful ratio is 21:1)
  const MAX_RATIO = 21;
  document.getElementById('cc-ratio-white').textContent = ratioVsWhite.toFixed(2) + ':1';
  document.getElementById('cc-ratio-black').textContent = ratioVsBlack.toFixed(2) + ':1';
  document.getElementById('cc-ratio-bar-white').style.width =
    Math.min(100, (ratioVsWhite / MAX_RATIO) * 100) + '%';
  document.getElementById('cc-ratio-bar-black').style.width =
    Math.min(100, (ratioVsBlack / MAX_RATIO) * 100) + '%';

  // Mid-tone warning: neither black nor white achieves WCAG AAA (7:1).
  // Note: both failing AA (4.5:1) simultaneously is mathematically impossible —
  // the crossover point (L ≈ 0.179) always yields ≥ 4.5:1 for the winning option.
  // The real limitation is AAA: colors with luminance between ~0.1 and ~0.3
  // can't achieve 7:1 against either black or white.
  const bestRatio = Math.max(ratioVsWhite, ratioVsBlack);
  document.getElementById('cc-midtone-warning').hidden = bestRatio >= 7.0;

  // Tinting preview
  const tintSwatchPure   = document.getElementById('cc-tint-swatch-pure');
  const tintSwatchTinted = document.getElementById('cc-tint-swatch-tinted');
  tintSwatchPure.style.background   = bgColor;
  tintSwatchTinted.style.background = bgColor;
  document.getElementById('cc-tint-sample-pure').style.color = contrastKeyword;
  const tintExpr = `color-mix(in oklch, ${bgColor} ${tintAmount}%, ${contrastKeyword})`;
  document.getElementById('cc-tint-sample-tinted').style.color = resolveColor(tintExpr);

  updateCssOutput(bgColor, tintAmount, contrastKeyword);
}

export function initContrastColor() {
  state.isSupported = CSS.supports('color', 'contrast-color(red)');

  document.getElementById('cc-support-warning').hidden = state.isSupported;

  syncColorInputs(
    document.getElementById('cc-bg-color'),
    document.getElementById('cc-bg-color-text'),
    v => { state.bgColor = v; update(); }
  );

  const tintSlider = document.getElementById('cc-tint-amount');
  const tintOutput = document.getElementById('cc-tint-output');
  tintSlider.addEventListener('input', () => {
    state.tintAmount = parseInt(tintSlider.value, 10);
    tintOutput.textContent = `${state.tintAmount}%`;
    update();
  });

  update();
}
