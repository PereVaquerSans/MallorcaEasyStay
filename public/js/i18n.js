import es from './translations/es.js';
import ca from './translations/ca.js';
import en from './translations/en.js';
import de from './translations/de.js';

const translations = { es, ca, en, de };

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('mallorca_lang') || 'es';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('mallorca_lang', lang);
      this.applyTranslations();
      document.documentElement.lang = lang;
      
      // Update language selector UI
      const currentLangUI = document.getElementById('current-lang');
      if (currentLangUI) {
        currentLangUI.textContent = lang.toUpperCase();
      }
    }
  }

  // Get translation by key path (e.g., 'home.hero_title')
  t(keyPath) {
    const keys = keyPath.split('.');
    let value = translations[this.currentLang];
    for (const key of keys) {
      if (value === undefined) break;
      value = value[key];
    }
    return value || keyPath;
  }

  applyTranslations() {
    // Handle data-i18n attributes (text content)
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text !== key) {
        if (el.tagName === 'INPUT' && el.type === 'submit') {
          el.value = text;
        } else if (el.hasAttribute('data-i18n-html')) {
          el.innerHTML = text;
        } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          // For input/textarea, only set textContent if they're not form fields
          // (e.g. they might be used as labels inside custom components)
          return;
        } else {
          el.textContent = text;
        }
      }
    });

    // Handle data-i18n-placeholder attributes (input placeholders)
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text !== key) {
        el.placeholder = text;
      }
    });

    // Dispatch event for components that need to re-render (like the map)
    const event = new CustomEvent('languageChanged', { detail: { lang: this.currentLang } });
    window.dispatchEvent(event);
  }
}

const i18n = new I18nManager();
window.i18n = i18n;

export default i18n;
