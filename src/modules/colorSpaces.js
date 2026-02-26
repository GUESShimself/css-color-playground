/**
 * Color Spaces Comparison Module
 * Shows how different spaces handle lightness ramps to illustrate perceptual uniformity
 */
import { syncColorInputs, resolveColor, rgbToHex } from './utils.js';

let state = {
  baseColor: '#e63946',
  steps: 9,
};

const SPACES_TO_COMPARE = [
  {
    id: 'oklch',
    label: 'oklch',
    desc: 'Perceptually uniform (recommended)',
    rampFn: (base, i, total) => {
      const lightness = (i / (total - 1));
      return `oklch(from ${base} ${lightness} c h)`;
    },
  },
  {
    id: 'lch',
    label: 'lch',
    desc: 'CIE perceptual model',
    rampFn: (base, i, total) => {
      const lightness = (i / (total - 1)) * 100;
      return `lch(from ${base} ${lightness}% c h)`;
    },
  },
  {
    id: 'hsl',
    label: 'hsl',
    desc: 'Non-perceptual — notice uneven brightness',
    rampFn: (base, i, total) => {
      const lightness = (i / (total - 1)) * 100;
      return `hsl(from ${base} h s ${lightness}%)`;
    },
  },
  {
    id: 'color-mix-oklch',
    label: 'color-mix in oklch',
    desc: 'Mixing with black → white via oklch',
    rampFn: (base, i, total) => {
      const pct = (i / (total - 1)) * 100;
      // At 0% → full black, at 100% → full white
      if (pct <= 50) {
        const blackAmount = 100 - (pct * 2);
        return `color-mix(in oklch, ${base}, black ${blackAmount}%)`;
      } else {
        const whiteAmount = (pct - 50) * 2;
        return `color-mix(in oklch, ${base}, white ${whiteAmount}%)`;
      }
    },
  },
  {
    id: 'color-mix-srgb',
    label: 'color-mix in sRGB',
    desc: 'Mixing with black → white via sRGB',
    rampFn: (base, i, total) => {
      const pct = (i / (total - 1)) * 100;
      if (pct <= 50) {
        const blackAmount = 100 - (pct * 2);
        return `color-mix(in srgb, ${base}, black ${blackAmount}%)`;
      } else {
        const whiteAmount = (pct - 50) * 2;
        return `color-mix(in srgb, ${base}, white ${whiteAmount}%)`;
      }
    },
  },
];

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 1500);
  });
}

function update() {
  const container = document.getElementById('cs-comparison');
  const { baseColor, steps } = state;
  container.innerHTML = '';

  SPACES_TO_COMPARE.forEach(space => {
    const row = document.createElement('div');
    row.className = 'cs-row';

    // Header: label left, toggle right
    const header = document.createElement('div');
    header.className = 'cs-row-header';

    const label = document.createElement('div');
    label.className = 'cs-row-label';
    label.innerHTML = `<strong>${space.label}</strong> <span class="cs-row-desc">— ${space.desc}</span>`;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.textContent = 'Show CSS';

    header.appendChild(label);
    header.appendChild(toggleBtn);

    const ramp = document.createElement('div');
    ramp.className = 'color-ramp color-ramp--sm';

    const props = [];
    for (let i = 0; i < steps; i++) {
      const expr = space.rampFn(baseColor, i, steps);
      const resolved = resolveColor(expr);

      const step = document.createElement('div');
      step.className = 'ramp-step';
      step.style.background = resolved;
      step.title = `${rgbToHex(resolved)} — ${expr}`;
      ramp.appendChild(step);

      props.push(`  --${space.id}-${i + 1}: ${expr};`);
    }

    // Per-ramp code output (hidden by default)
    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'code-output hidden';

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent =
      `/* ${space.label} — ${steps}-step lightness ramp */\n` +
      `:root {\n${props.join('\n')}\n}`;
    pre.appendChild(code);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.setAttribute('aria-label', `Copy ${space.label} CSS`);
    copyBtn.addEventListener('click', () => {
      copyToClipboard(code.textContent, copyBtn);
    });

    codeWrapper.appendChild(pre);
    codeWrapper.appendChild(copyBtn);

    toggleBtn.addEventListener('click', () => {
      codeWrapper.classList.toggle('hidden');
      toggleBtn.textContent = codeWrapper.classList.contains('hidden')
        ? 'Show CSS'
        : 'Hide CSS';
    });

    row.appendChild(header);
    row.appendChild(ramp);
    row.appendChild(codeWrapper);
    container.appendChild(row);
  });
}

export function initColorSpaces() {
  syncColorInputs(
    document.getElementById('cs-base-color'),
    document.getElementById('cs-base-color-text'),
    v => { state.baseColor = v; update(); }
  );

  const stepsSlider = document.getElementById('cs-steps');
  const stepsOutput = document.getElementById('cs-steps-output');
  stepsSlider.addEventListener('input', () => {
    state.steps = parseInt(stepsSlider.value, 10);
    stepsOutput.textContent = state.steps;
    update();
  });

  update();
}
