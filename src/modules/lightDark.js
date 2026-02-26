/**
 * light-dark() Playground Module
 */
import { syncColorInputs, setupChipGroup } from './utils.js';

let state = {
  lightColor: '#1a1a2e',
  darkColor: '#eaeaea',
  scheme: 'light',
};

function update() {
  const { lightColor, darkColor, scheme } = state;

  const preview = document.getElementById('ld-preview');
  const card = preview.querySelector('.ld-preview-card');

  // Set color-scheme so light-dark() resolves correctly
  preview.style.colorScheme = scheme;

  // Use native light-dark() via custom properties
  preview.style.setProperty('--ld-text', `light-dark(${lightColor}, ${darkColor})`);
  preview.style.setProperty('--ld-bg', 'light-dark(#ffffff, #111118)');
  preview.style.background = 'var(--ld-bg)';
  card.style.color = 'var(--ld-text)';

  // CSS output
  const output = document.getElementById('ld-css-output');
  output.textContent =
    `/* light-dark() adapts to the color-scheme */\n` +
    `:root {\n` +
    `  color-scheme: light dark;\n` +
    `}\n\n` +
    `.element {\n` +
    `  color: light-dark(${lightColor}, ${darkColor});\n` +
    `\n` +
    `  /* In ${scheme} mode, resolves to: ${scheme === 'light' ? lightColor : darkColor} */\n` +
    `}\n\n` +
    `/* You can also use it with color-mix() */\n` +
    `.surface {\n` +
    `  background: light-dark(#ffffff, #111118);\n` +
    `  border: 1px solid light-dark(\n` +
    `    color-mix(in oklch, ${lightColor} 20%, transparent),\n` +
    `    color-mix(in oklch, ${darkColor} 20%, transparent)\n` +
    `  );\n` +
    `}`;
}

export function initLightDark() {
  syncColorInputs(
    document.getElementById('ld-light-color'),
    document.getElementById('ld-light-color-text'),
    v => { state.lightColor = v; update(); }
  );

  syncColorInputs(
    document.getElementById('ld-dark-color'),
    document.getElementById('ld-dark-color-text'),
    v => { state.darkColor = v; update(); }
  );

  setupChipGroup(document.getElementById('ld-scheme-toggle'), scheme => {
    state.scheme = scheme;
    update();
  });

  update();
}
