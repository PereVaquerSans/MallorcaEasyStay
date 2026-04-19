import i18n from './i18n.js';
import { initScrollReveal } from './components.js';

// Fallback image for broken sources
const FALLBACK_IMG = 'https://i.ytimg.com/vi/mX3Gv9O_DvY/maxresdefault.jpg';

// Static demo data — no API calls in GitHub Pages version
const fallbackGems = [
  {
    name: "Cerámica Artà",
    city: "Artà",
    description: {
      es: "Taller artesanal de cerámica usando arcilla local del valle con técnicas ancestrales.",
      en: "Handmade ceramics workshop using local clay from the valley with ancestral techniques.",
      ca: "Taller artesanal de ceràmica usant argila local de la vall amb tècniques ancestrals.",
      de: "Handwerkliche Keramikwerkstatt mit lokalem Ton und traditionellen Techniken."
    },
    type: "artisan",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=350"
  },
  {
    name: "Ca'n Det Olive Mill",
    city: "Sóller",
    description: {
      es: "Molino histórico en el corazón de Sóller, produciendo aceite ecológico desde el siglo XVI.",
      en: "Historic mill in the heart of Sóller, producing organic oil since the 16th century.",
      ca: "Molí històric al cor de Sóller, produint oli ecològic des del segle XVI.",
      de: "Historische Mühle im Herzen von Sóller, die seit dem 16. Jahrhundert Bio-Öl produziert."
    },
    type: "farm",
    image: "https://www.conselldemallorca.es/documents/774813/4243025/20210608.JPG/242b2eba-b71a-2d92-2bd3-b8fa532b6053?t=1623153966256"
  },
  {
    name: "Forn des Teatre",
    city: "Palma",
    description: {
      es: "Preservando el secreto de la ensaimada de masa madre desde 1916.",
      en: "Preserving the secret of the slow-rise Ensaïmada since 1916.",
      ca: "Preservant el secret de l'ensaïmada de massa mare des de 1916.",
      de: "Bewahrt seit 1916 das Geheimnis der Ensaïmada."
    },
    type: "restaurant",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=350"
  },
  {
    name: "Mercat de Sineu",
    city: "Sineu",
    description: {
      es: "El mercado más antiguo de Mallorca, celebrado cada miércoles desde 1306.",
      en: "Mallorca's oldest market, held every Wednesday since 1306.",
      ca: "El mercat més antic de Mallorca, celebrat cada dimecres des de 1306.",
      de: "Mallorcas ältester Markt, jeden Mittwoch seit 1306."
    },
    type: "market",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=350"
  }
];

function resolveImg(url) {
  return (!url || url.startsWith('/images/') || !url.startsWith('http')) ? FALLBACK_IMG : url;
}

function loadFeaturedGems() {
  const container = document.getElementById('featured-gems');
  if (!container) return;

  // Render static data immediately — no API calls in demo
  renderGems(fallbackGems, container);

  // Re-render when language changes
  window.addEventListener('languageChanged', (e) => {
    renderGems(fallbackGems, container, e.detail.lang);
  });
}

function renderGems(gems, container, forceLang = null) {
  const lang = forceLang || window.i18n.currentLang;

  container.innerHTML = gems.map((gem, index) => {
    const imgUrl = resolveImg(gem.image);

    let desc = gem.description[lang] || gem.description['es'] || '';
    if (desc.length > 100) desc = desc.substring(0, 97) + '...';

    const translatedType = i18n.t(`map.type_${gem.type}`);

    return `
      <div class="card reveal" style="--i: ${index};">
        <div style="overflow: hidden;">
          <img src="${imgUrl}" alt="${gem.name}" class="card-img" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        </div>
        <div class="card-content">
          <span class="chip">${translatedType === `map.type_${gem.type}` ? gem.type : translatedType}</span>
          <h3 style="margin-top: 0.5rem; margin-bottom: 0.5rem; font-family: var(--font-display); font-size: 1.35rem;">${gem.name}</h3>
          <p class="text-sm" style="margin-bottom: 0.75rem; color: var(--primary); font-weight: 500;">📍 ${gem.city}</p>
          <p class="text-sm">${desc}</p>
        </div>
      </div>
    `;
  }).join('');

  // Re-init scroll reveal for new elements
  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedGems();
  initScrollReveal();
});
