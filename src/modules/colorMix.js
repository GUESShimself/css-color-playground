/**
 * color-mix() Playground Module
 */
import { syncColorInputs, setupChipGroup, resolveColor, rgbToHex, MIX_SPACES } from './utils.js';

let state = {
  color1: '#6633ee',
  color2: '#ee6633',
  ratio: 50,
  space: 'oklch',
};

function getMixCSS(space, color1, color2, ratio) {
  return `color-mix(in ${space}, ${color1} ${ratio}%, ${color2})`;
}

function update() {
  const { color1, color2, ratio, space } = state;
  const mixExpr = getMixCSS(space, color1, color2, ratio);
  const resolved = resolveColor(mixExpr);
  const resolvedHex = rgbToHex(resolved);

  // Gradient bar — full spectrum from color1 to color2 in selected space
  const bar = document.getElementById('mix-gradient-bar');
  // Build gradient using multiple color-mix stops
  const stops = [];
  for (let i = 0; i <= 20; i++) {
    const p = i * 5;
    stops.push(resolveColor(getMixCSS(space, color1, color2, p)));
  }
  bar.style.background = `linear-gradient(to right, ${stops.join(', ')})`;

  // Swatches
  document.getElementById('mix-swatch-start').style.background = color1;
  document.getElementById('mix-swatch-end').style.background = color2;
  document.getElementById('mix-swatch-result').style.background = resolved;
  document.getElementById('mix-result-label').textContent = resolvedHex;

  // CSS output
  const cssOutput = document.getElementById('mix-css-output');
  cssOutput.textContent =
    `/* Mix ${ratio}% of color 1 with ${100 - ratio}% of color 2 in ${space} */\n` +
    `.element {\n` +
    `  background: ${mixExpr};\n` +
    `\n` +
    `  /* Computed: ${resolved} */\n` +
    `}`;

  // Comparison grid (if visible)
  updateCompareGrid();
}

function updateCompareGrid() {
  const grid = document.getElementById('mix-compare-grid');
  if (grid.classList.contains('hidden')) return;

  const { color1, color2, ratio } = state;
  grid.innerHTML = '';

  MIX_SPACES.forEach(space => {
    const expr = getMixCSS(space, color1, color2, ratio);
    const resolved = resolveColor(expr);
    const hex = rgbToHex(resolved);

    const item = document.createElement('div');
    item.className = 'compare-item';
    item.innerHTML = `
      <div class="compare-swatch" style="background: ${resolved}"></div>
      <span class="compare-label">${space}: ${hex}</span>
    `;
    grid.appendChild(item);
  });
}

export function initColorMix() {
  // Color inputs
  syncColorInputs(
    document.getElementById('mix-color-1'),
    document.getElementById('mix-color-1-text'),
    v => { state.color1 = v; update(); }
  );
  syncColorInputs(
    document.getElementById('mix-color-2'),
    document.getElementById('mix-color-2-text'),
    v => { state.color2 = v; update(); }
  );

  // Ratio slider
  const ratioSlider = document.getElementById('mix-ratio');
  const ratioOutput = document.getElementById('mix-ratio-output');
  ratioSlider.addEventListener('input', () => {
    state.ratio = parseInt(ratioSlider.value, 10);
    ratioOutput.textContent = `${state.ratio}%`;
    update();
  });

  // Space chips
  setupChipGroup(document.getElementById('mix-space-chips'), space => {
    state.space = space;
    update();
  });

  // Compare toggle
  document.getElementById('mix-compare-toggle').addEventListener('click', () => {
    const grid = document.getElementById('mix-compare-grid');
    const btn = document.getElementById('mix-compare-toggle');
    grid.classList.toggle('hidden');
    btn.textContent = grid.classList.contains('hidden')
      ? 'Compare across all spaces'
      : 'Hide comparison';
    if (!grid.classList.contains('hidden')) updateCompareGrid();
  });

  // Initial render
  update();
}
