/**
 * Shared utilities for the CSS Color Playground
 */

/**
 * Copy text to clipboard and flash a "Copied" state on the button
 */
export function setupCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const code = document.getElementById(targetId)?.textContent;
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1500);
      } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1500);
      }
    });
  });
}

/**
 * Sync a color picker and its text input
 */
export function syncColorInputs(colorInput, textInput, onChange) {
  colorInput.addEventListener('input', () => {
    textInput.value = colorInput.value;
    onChange(colorInput.value);
  });

  textInput.addEventListener('change', () => {
    // Validate by setting on an element
    const test = document.createElement('div');
    test.style.color = textInput.value;
    if (test.style.color) {
      colorInput.value = textInput.value.startsWith('#') ? textInput.value : colorInput.value;
      onChange(textInput.value);
    }
  });
}

/**
 * Setup chip/toggle button groups
 */
export function setupChipGroup(container, onChange) {
  const chips = container.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      onChange(chip.dataset.space || chip.dataset.scheme);
    });
  });
}

/**
 * Get the computed color from a CSS color-mix or relative color expression
 * by applying it to a temporary element and reading back the computed style.
 */
export function resolveColor(cssColorExpr) {
  const el = document.createElement('div');
  // Set a known initial color so we can detect if the expression fails
  el.style.color = 'rgb(0, 0, 0)';
  el.style.color = cssColorExpr;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);
  return computed;
}

/**
 * Convert a computed rgb(r, g, b) string to hex
 */
export function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '#000000';
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match.map(Number);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Color spaces with their channels and ranges for the relative color section
 */
export const COLOR_SPACES = {
  oklch: {
    channels: [
      { name: 'l', label: 'L', min: 0, max: 1, step: 0.01, unit: '', desc: 'Lightness' },
      { name: 'c', label: 'C', min: 0, max: 0.4, step: 0.005, unit: '', desc: 'Chroma' },
      { name: 'h', label: 'H', min: 0, max: 360, step: 1, unit: 'deg', desc: 'Hue' },
    ],
    fn: (l, c, h) => `oklch(${l} ${c} ${h})`,
    relativeFn: (base, lExpr, cExpr, hExpr) =>
      `oklch(from ${base} ${lExpr} ${cExpr} ${hExpr})`,
  },
  oklab: {
    channels: [
      { name: 'l', label: 'L', min: 0, max: 1, step: 0.01, unit: '', desc: 'Lightness' },
      { name: 'a', label: 'a', min: -0.4, max: 0.4, step: 0.005, unit: '', desc: 'Green–Red' },
      { name: 'b', label: 'b', min: -0.4, max: 0.4, step: 0.005, unit: '', desc: 'Blue–Yellow' },
    ],
    fn: (l, a, b) => `oklab(${l} ${a} ${b})`,
    relativeFn: (base, lExpr, aExpr, bExpr) =>
      `oklab(from ${base} ${lExpr} ${aExpr} ${bExpr})`,
  },
  lch: {
    channels: [
      { name: 'l', label: 'L', min: 0, max: 100, step: 1, unit: '%', desc: 'Lightness' },
      { name: 'c', label: 'C', min: 0, max: 150, step: 1, unit: '', desc: 'Chroma' },
      { name: 'h', label: 'H', min: 0, max: 360, step: 1, unit: 'deg', desc: 'Hue' },
    ],
    fn: (l, c, h) => `lch(${l}% ${c} ${h})`,
    relativeFn: (base, lExpr, cExpr, hExpr) =>
      `lch(from ${base} ${lExpr} ${cExpr} ${hExpr})`,
  },
  hsl: {
    channels: [
      { name: 'h', label: 'H', min: 0, max: 360, step: 1, unit: 'deg', desc: 'Hue' },
      { name: 's', label: 'S', min: 0, max: 100, step: 1, unit: '%', desc: 'Saturation' },
      { name: 'l', label: 'L', min: 0, max: 100, step: 1, unit: '%', desc: 'Lightness' },
    ],
    fn: (h, s, l) => `hsl(${h} ${s}% ${l}%)`,
    relativeFn: (base, hExpr, sExpr, lExpr) =>
      `hsl(from ${base} ${hExpr} ${sExpr} ${lExpr})`,
  },
  rgb: {
    channels: [
      { name: 'r', label: 'R', min: 0, max: 255, step: 1, unit: '', desc: 'Red' },
      { name: 'g', label: 'G', min: 0, max: 255, step: 1, unit: '', desc: 'Green' },
      { name: 'b', label: 'B', min: 0, max: 255, step: 1, unit: '', desc: 'Blue' },
    ],
    fn: (r, g, b) => `rgb(${r} ${g} ${b})`,
    relativeFn: (base, rExpr, gExpr, bExpr) =>
      `rgb(from ${base} ${rExpr} ${gExpr} ${bExpr})`,
  },
};

/**
 * Mixing color spaces used in the color-mix section
 */
export const MIX_SPACES = ['srgb', 'oklch', 'oklab', 'lch', 'lab', 'hsl', 'hwb'];
