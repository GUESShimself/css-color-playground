/**
 * CSS Color Playground — Main Entry
 */
import { setupCopyButtons } from './modules/utils.js';
import { initColorMix } from './modules/colorMix.js';
import { initRelativeColors } from './modules/relativeColors.js';
import { initColorSpaces } from './modules/colorSpaces.js';
import { initLightDark } from './modules/lightDark.js';

// Init all playgrounds
document.addEventListener('DOMContentLoaded', () => {
  initColorMix();
  initRelativeColors();
  initColorSpaces();
  initLightDark();
  setupCopyButtons();
  initNav();
});

/**
 * Sticky nav active state based on scroll position
 */
function initNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.playground-section');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
}
