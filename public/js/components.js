import i18n from './i18n.js';

/* ========== SCROLL REVEAL (shared utility) ========== */
export function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add stagger delay for siblings
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale'));
          const i = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${i * 0.1}s`;
        }
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ========== NAVBAR ========== */
function renderNavbar() {
  const navbarHtml = `
    <nav class="navbar">
      <a href="index.html" class="nav-logo">MallorcaEasyStay</a>
      <div class="nav-links">
        <a href="index.html" data-i18n="nav.discover">Descubrir</a>
        <a href="map.html" data-i18n="nav.map">El Mapa</a>
        <a href="about.html" data-i18n="nav.about">Nosotros</a>
        <a href="contact.html" data-i18n="nav.contact">Contacto</a>
        
        <div class="lang-selector">
          <button class="lang-btn">
            <span id="current-lang">${i18n.currentLang.toUpperCase()}</span>
            ▼
          </button>
          <div class="lang-dropdown">
            <button onclick="window.i18n.setLanguage('es')">Español (ES)</button>
            <button onclick="window.i18n.setLanguage('ca')">Català (CA)</button>
            <button onclick="window.i18n.setLanguage('en')">English (EN)</button>
            <button onclick="window.i18n.setLanguage('de')">Deutsch (DE)</button>
          </div>
        </div>
      </div>

      <button class="hamburger" id="hamburger-btn" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu" id="mobile-menu">
      <a href="index.html" data-i18n="nav.discover">Descubrir</a>
      <a href="map.html" data-i18n="nav.map">El Mapa</a>
      <a href="about.html" data-i18n="nav.about">Nosotros</a>
      <a href="contact.html" data-i18n="nav.contact">Contacto</a>
      <div class="mobile-lang-selector">
        <button onclick="window.i18n.setLanguage('es')" ${i18n.currentLang === 'es' ? 'class="active"' : ''}>ES</button>
        <button onclick="window.i18n.setLanguage('ca')" ${i18n.currentLang === 'ca' ? 'class="active"' : ''}>CA</button>
        <button onclick="window.i18n.setLanguage('en')" ${i18n.currentLang === 'en' ? 'class="active"' : ''}>EN</button>
        <button onclick="window.i18n.setLanguage('de')" ${i18n.currentLang === 'de' ? 'class="active"' : ''}>DE</button>
      </div>
    </div>
  `;
  const container = document.getElementById('navbar-container');
  if (container) {
    container.innerHTML = navbarHtml;
    
    // Set active link — works with both root and subdirectory deployments (e.g. GitHub Pages)
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const allLinks = container.querySelectorAll('.nav-links a, .mobile-menu a');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (currentPage === href || (currentPage === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // Hamburger toggle
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close menu when clicking a link
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }
}

/* ========== FOOTER ========== */
function renderFooter() {
  const footerHtml = `
    <footer class="footer">
      <div class="footer-content">
        <div>
          <h2 class="nav-logo" style="margin-bottom: 1rem;">MallorcaEasyStay</h2>
          <p class="footer-quote" data-i18n="footer.quote">Dedicados a la preservación y celebración consciente de las Islas Baleares.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4 data-i18n="footer.links">Enlaces</h4>
            <a href="index.html" data-i18n="nav.discover">Descubrir</a>
            <a href="map.html" data-i18n="nav.map">El Mapa</a>
            <a href="about.html" data-i18n="nav.about">Nosotros</a>
            <a href="contact.html" data-i18n="nav.contact">Contacto</a>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.legal">Legal</h4>
            <a href="#" data-i18n="footer.privacy">Política de Privacidad</a>
            <a href="#" data-i18n="footer.terms">Términos de Uso</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span data-i18n="footer.rights">© 2026 Mallorca Sostenible. Todos los derechos reservados.</span>
      </div>
    </footer>
  `;
  const container = document.getElementById('footer-container');
  if (container) container.innerHTML = footerHtml;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
  i18n.applyTranslations();
  document.documentElement.lang = i18n.currentLang;
  initScrollReveal();
});
