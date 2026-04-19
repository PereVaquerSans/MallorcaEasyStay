import i18n from './i18n.js';
import { initScrollReveal } from './components.js';

/* Animated stat counters */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const textVal = el.getAttribute('data-text');
        if (textVal) {
          el.textContent = textVal;
          el.style.animation = 'countUp 0.6s ease both';
          observer.unobserve(el);
          return;
        }
        
        const target = parseInt(el.getAttribute('data-count') || '0');
        const suffix = el.getAttribute('data-suffix') || '+';
        const duration = 1500;
        const start = performance.now();
        
        function animate(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current + (progress >= 1 ? suffix : '');
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initStatCounters();
});
