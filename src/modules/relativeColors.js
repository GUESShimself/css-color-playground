/**
 * Relative Colors Playground Module
 */
import { syncColorInputs, setupChipGroup, resolveColor, rgbToHex, COLOR_SPACES } from './utils.js';

let state = {
  baseColor: '#2563eb',
  space: 'oklch',
  channelOffsets: {}, // { channelName: offset value }
};

function getSpaceConfig() {
  return COLOR_SPACES[state.space];
}

/**
 * Build channel control sliders for the current space
 */
function buildChannelControls() {
  const container = document.getElementById('rcs-channel-controls');
  const config = getSpaceConfig();
  container.innerHTML = '';

  // Reset offsets for new space
  state.channelOffsets = {};

  config.channels.forEach(ch => {
    // The offset range: allow shifting from -range to +range
    const range = ch.max - ch.min;
    const offsetMin = -range;
    const offsetMax = range;

    state.channelOffsets[ch.name] = 0;

    const slider = document.createElement('div');
    slider.className = 'channel-slider';
    const inputId = `rcs-ch-${ch.name}`;
    slider.innerHTML = `
      <label for="${inputId}" title="${ch.desc}">${ch.label}</label>
      <input type="range" id="${inputId}"
             min="${offsetMin}" max="${offsetMax}" value="0"
             step="${ch.step}"
             data-channel="${ch.name}" />
      <output>${ch.name} + 0</output>
    `;
    container.appendChild(slider);

    const input = slider.querySelector('input');
    const output = slider.querySelector('output');

    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      state.channelOffsets[ch.name] = val;
      const sign = val >= 0 ? '+' : '−';
      const absVal = Math.abs(val);
      output.textContent = `${ch.name} ${sign} ${absVal}`;
      updatePalette();
    });
  });
}

/**
 * Generate a palette of ~9 swatches by applying the offset in steps
 */
function updatePalette() {
  const container = document.getElementById('rcs-palette');
  const config = getSpaceConfig();
  const { baseColor, channelOffsets } = state;

  const steps = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  container.innerHTML = '';

  const cssLines = [];

  steps.forEach((step, i) => {
    const channelExprs = config.channels.map(ch => {
      const offset = channelOffsets[ch.name] * step;
      if (offset === 0) return ch.name;
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      // All channel keywords in relative color syntax are unitless numbers
      // in browsers, so calc() expressions must also be unitless — no deg, %, etc.
      const unitStr = `${absOffset}`;
      return `calc(${ch.name} ${sign} ${unitStr})`;
    });

    const cssExpr = config.relativeFn(baseColor, ...channelExprs);
    const resolved = resolveColor(cssExpr);
    const hex = rgbToHex(resolved);

    const swatch = document.createElement('div');
    swatch.className = `ramp-step ${step === 0 ? 'is-origin' : ''}`;
    swatch.style.background = resolved;
    swatch.innerHTML = `<span class="swatch-info">${step === 0 ? 'origin' : step > 0 ? `+${step}` : step}<br>${hex}</span>`;
    container.appendChild(swatch);

    // Build CSS variable lines
    const varName = step === 0 ? '--color-base' : step > 0 ? `--color-light-${step}` : `--color-dark-${Math.abs(step)}`;
    cssLines.push(`  ${varName}: ${cssExpr};`);
  });

  // CSS output
  const output = document.getElementById('rcs-css-output');
  output.textContent =
    `/* Relative color palette using ${state.space}() */\n` +
    `:root {\n` +
    `  --base: ${baseColor};\n\n` +
    cssLines.join('\n') +
    `\n}`;
}

export function initRelativeColors() {
  // Base color input
  syncColorInputs(
    document.getElementById('rcs-base-color'),
    document.getElementById('rcs-base-color-text'),
    v => { state.baseColor = v; updatePalette(); }
  );

  // Space chips
  setupChipGroup(document.getElementById('rcs-space-chips'), space => {
    state.space = space;
    buildChannelControls();
    updatePalette();
  });

  // Reset button
  document.getElementById('rcs-reset-btn').addEventListener('click', () => {
    buildChannelControls();
    updatePalette();
  });

  // Initial build
  buildChannelControls();
  updatePalette();
}
