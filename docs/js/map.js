import i18n from './i18n.js';

let map, markerLayerGroup, allBusinesses = [], currentMarkers = {};
let nearbyCircle = null, routePolyline = null, routeStops = [];

const MALLORCA_CENTER = [39.6153, 2.9520];
const MALLORCA_ZOOM = 10;
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1549487532-6fe9d0c64893?auto=format&fit=crop&q=80&w=350';

// Sanitize strings before injecting into innerHTML to prevent XSS
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Pre-cached icon instances per type
const ICON_CACHE = {};
const TYPE_COLORS = {
  artisan: '#D4A373', restaurant: '#005F73', market: '#5a3811',
  farm: '#6B8E23', experience: '#7B68AE', accommodation: '#E07A5F'
};

function getIconForType(type) {
  if (!ICON_CACHE[type]) {
    const c = TYPE_COLORS[type] || '#005F73';
    ICON_CACHE[type] = L.divIcon({
      html: `<div style="background:${c};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: '', iconSize: [24, 24], iconAnchor: [12, 12]
    });
  }
  return ICON_CACHE[type];
}

function resolveImg(url) {
  return (!url || url.startsWith('/images/') || !url.startsWith('http')) ? FALLBACK_IMG : url;
}

const CITY_COORDS = {
  'palma': [39.5696, 2.6502], 'sóller': [39.7667, 2.7153], 'soller': [39.7667, 2.7153],
  'valldemossa': [39.7103, 2.6228], 'artà': [39.6961, 3.3489], 'arta': [39.6961, 3.3489],
  'sineu': [39.6447, 3.0017], 'pollença': [39.8775, 3.0163], 'pollensa': [39.8775, 3.0163],
  'manacor': [39.5697, 3.2094], 'inca': [39.7214, 2.9112], 'alcúdia': [39.8533, 3.1212],
  'alcudia': [39.8533, 3.1212], 'felanitx': [39.4697, 3.1486], 'campos': [39.4302, 2.9988],
  'deià': [39.7486, 2.6489], 'deia': [39.7486, 2.6489], 'bunyola': [39.6750, 2.7083],
  'esporles': [39.6646, 2.5751], 'consell': [39.6844, 2.8119], 'escorca': [39.8228, 2.8850],
  'andratx': [39.5741, 2.4214], 'calvià': [39.5647, 2.5063], 'calvia': [39.5647, 2.5063],
  'llucmajor': [39.4892, 2.8908], 'sa pobla': [39.7651, 3.0208], 'muro': [39.7875, 3.0089],
  'petra': [39.5913, 3.1086], 'santa maria': [39.6778, 2.7614], 'binissalem': [39.6875, 2.8422],
  'portocolom': [39.4181, 3.2594], "cala d'or": [39.3744, 3.2297],
  'porto cristo': [39.5403, 3.3339], 'santanyí': [39.3547, 3.1250], 'santanyi': [39.3547, 3.1250],
};

const fallbackList = [
  { _id: '1', name: "Cerámica Artà", city: "Artà", zone: "east", type: "artisan", lat: 39.6961, lng: 3.3489, description: { es: "Taller artesanal de cerámica usando arcilla local del valle de Artà con técnicas ancestrales.", en: "Handmade ceramics workshop using local clay from the Artà valley with ancestral techniques.", ca: "Taller artesanal de ceràmica usant argila local de la vall d'Artà amb tècniques ancestrals.", de: "Handwerkliche Keramikwerkstatt mit lokalem Ton aus dem Artà-Tal." }, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=350" },
  { _id: '2', name: "Ca'n Det Olive Mill", city: "Sóller", zone: "tramuntana", type: "farm", lat: 39.7667, lng: 2.7153, description: { es: "Molino de aceite histórico en Sóller, produciendo aceite ecológico desde el siglo XVI.", en: "Historic olive mill in Sóller, producing organic olive oil since the 16th century.", ca: "Molí d'oli històric a Sóller, produint oli ecològic des del segle XVI.", de: "Historische Ölmühle in Sóller, Bio-Olivenöl seit dem 16. Jh." }, image: "https://www.conselldemallorca.es/documents/774813/4243025/20210608.JPG/242b2eba-b71a-2d92-2bd3-b8fa532b6053?t=1623153966256" },
  { _id: '3', name: "Forn des Teatre", city: "Palma", zone: "center", type: "restaurant", lat: 39.5696, lng: 2.6502, description: { es: "Panadería tradicional con la ensaimada de masa madre desde 1916.", en: "Traditional bakery preserving Ensaïmada since 1916.", ca: "Forn tradicional amb l'ensaïmada de massa mare des de 1916.", de: "Traditionelle Bäckerei mit Ensaïmada seit 1916." }, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=350" },
  { _id: '4', name: "Mercat de Sineu", city: "Sineu", zone: "center", type: "market", lat: 39.6447, lng: 3.0017, description: { es: "El mercado semanal más antiguo de Mallorca desde 1306.", en: "Mallorca's oldest weekly market since 1306.", ca: "El mercat setmanal més antic de Mallorca des de 1306.", de: "Mallorcas ältester Wochenmarkt seit 1306." }, image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=350" },
  { _id: '5', name: "Finca La Esperanza", city: "Valldemossa", zone: "tramuntana", type: "accommodation", lat: 39.7103, lng: 2.6228, description: { es: "Retiro zero-waste en la montaña con turismo regenerativo.", en: "Zero-waste mountain retreat with regenerative tourism.", ca: "Retir zero-waste a la muntanya amb turisme regeneratiu.", de: "Zero-Waste-Refugium in den Bergen." }, image: "https://picsum.photos/seed/finca-esperanza/350/240" },
  { _id: '6', name: "Can Terrassa Groves", city: "Esporles", zone: "tramuntana", type: "farm", lat: 39.6646, lng: 2.5751, description: { es: "Producción ancestral de aceite de oliva con cultivo sostenible.", en: "Ancient olive oil production with sustainable farming.", ca: "Producció ancestral d'oli d'oliva amb cultiu sostenible.", de: "Traditionelle Olivenölproduktion mit nachhaltigem Anbau." }, image: "https://picsum.photos/seed/can-terrassa/350/240" },
  { _id: '7', name: "Sa Fàbrica de Gelats", city: "Sóller", zone: "tramuntana", type: "restaurant", lat: 39.7660, lng: 2.7157, description: { es: "Heladería artesanal en Sóller con frutas locales.", en: "Artisan ice cream parlor in Sóller with local fruits.", ca: "Gelateria artesanal a Sóller amb fruites locals.", de: "Handwerkliche Eisdiele in Sóller mit lokalen Früchten." }, image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=350" },
  { _id: '8', name: "Raixa Estate", city: "Bunyola", zone: "tramuntana", type: "experience", lat: 39.6750, lng: 2.7083, description: { es: "Finca histórica con jardines italianos y museo etnológico.", en: "Historic estate with Italian gardens and ethnological museum.", ca: "Finca històrica amb jardins italians i museu etnològic.", de: "Historisches Anwesen mit italienischen Gärten." }, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=350" },
  { _id: '9', name: "Teixits Vicens", city: "Pollença", zone: "north", type: "artisan", lat: 39.8775, lng: 3.0163, description: { es: "Taller textil desde 1854, telas de lenguas mallorquinas a mano.", en: "Textile workshop since 1854, hand-weaving Mallorcan fabrics.", ca: "Taller tèxtil des de 1854, teles de llengües mallorquines a mà.", de: "Textilwerkstatt seit 1854 mit handgewebten Stoffen." }, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=350" },
  { _id: '10', name: "Bodega Ribas", city: "Consell", zone: "center", type: "farm", lat: 39.6844, lng: 2.8119, description: { es: "Bodega familiar desde 1711, la más antigua de Mallorca.", en: "Family winery since 1711, Mallorca's oldest.", ca: "Bodega familiar des de 1711, la més antiga de Mallorca.", de: "Familienweingut seit 1711, das älteste Mallorcas." }, image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=350" },
  { _id: '11', name: "Mercat de l'Olivar", city: "Palma", zone: "center", type: "market", lat: 39.5742, lng: 2.6500, description: { es: "Mercado cubierto en Palma con los mejores productos frescos.", en: "Covered market in Palma with the finest fresh produce.", ca: "Mercat cobert a Palma amb els millors productes frescos.", de: "Überdachter Markt in Palma mit besten frischen Produkten." }, image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=350" },
  { _id: '12', name: "Santuari de Lluc", city: "Escorca", zone: "tramuntana", type: "experience", lat: 39.8228, lng: 2.8850, description: { es: "Monasterio y santuario espiritual con rutas de senderismo.", en: "Monastery and sanctuary with hiking trails.", ca: "Monestir i santuari espiritual amb rutes de senderisme.", de: "Kloster und Wallfahrtsort mit Wanderwegen." }, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=350" },
  { _id: '13', name: "Es Refugi", city: "Deià", zone: "tramuntana", type: "restaurant", lat: 39.7486, lng: 2.6489, description: { es: "Restaurante sostenible con cocina de temporada de huerto propio.", en: "Sustainable restaurant with seasonal cuisine from own gardens.", ca: "Restaurant sostenible amb cuina de temporada d'hort propi.", de: "Nachhaltiges Restaurant mit saisonaler Küche." }, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=350" },
  { _id: '14', name: "Salines d'Es Trenc", city: "Campos", zone: "south", type: "experience", lat: 39.3539, lng: 2.9603, description: { es: "Salinas naturales donde se recolecta flor de sal artesanalmente.", en: "Natural salt flats with artisanal fleur de sel harvesting.", ca: "Salines naturals amb recol·lecció artesanal de flor de sal.", de: "Natursaline mit handwerklicher Fleur de Sel Ernte." }, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=350" },
  { _id: '15', name: "Son Forés Agroturismo", city: "Manacor", zone: "east", type: "accommodation", lat: 39.5697, lng: 3.2094, description: { es: "Agroturismo ecológico en una possessió del siglo XVII.", en: "Organic agrotourism at a 17th-century estate.", ca: "Agroturisme ecològic en una possessió del segle XVII.", de: "Bio-Agrotourismus in einem Anwesen aus dem 17. Jh." }, image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=350" }
];

/* ========== LOADING INDICATOR ========== */
function showLoadingIndicator() {
  const el = document.getElementById('business-list');
  if (!el) return;
  el.innerHTML = `
    <div class="map-loading-indicator">
      <div class="map-loading-spinner"></div>
      <p class="map-loading-text" data-i18n="map.loading_businesses">Cargando negocios locales...</p>
      <p class="map-loading-subtext">Descubriendo las joyas de Mallorca</p>
    </div>`;
  // Apply translations to the new element
  i18n.applyTranslations();
}

function hideLoadingIndicator() {
  const indicator = document.querySelector('.map-loading-indicator');
  if (indicator) {
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateY(-10px)';
    setTimeout(() => indicator.remove(), 300);
  }
}

// ========== INIT ==========
async function initMap() {
  // Show loading indicator while setting up
  showLoadingIndicator();

  map = L.map('map-container', { preferCanvas: true }).setView(MALLORCA_CENTER, MALLORCA_ZOOM);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 19
  }).addTo(map);
  markerLayerGroup = L.layerGroup().addTo(map);

  // 1) Render fallback data IMMEDIATELY — static demo, no API
  allBusinesses = fallbackList;
  applyFilters();

  // 2) Init all UI interactions (no API fetch in demo mode)
  initTabs(); initFilters(); initNearby(); initRouteBuilder(); initSidebarToggle();
  window.addEventListener('languageChanged', () => { applyFilters(); renderRouteList(); });
}

async function fetchBusinessesInBackground() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch('/api/businesses', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const d = await res.json();
      if (d && d.length > 0) {
        allBusinesses = d;
        applyFilters(); // Re-render with API data
        console.log(`✅ Loaded ${d.length} businesses from API`);
      }
    }
  } catch (err) {
    // Silently use fallback data — already displayed
    console.log('Using fallback business data', err.name === 'AbortError' ? '(API timeout)' : '');
  }
}

function initTabs() {
  document.querySelectorAll('.map-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.map-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

function initFilters() {
  document.getElementById('filter-zone').addEventListener('change', applyFilters);
  document.getElementById('filter-type').addEventListener('change', applyFilters);
  const si = document.getElementById('search-input');
  let dt;
  si.addEventListener('input', () => { clearTimeout(dt); dt = setTimeout(applyFilters, 250); });
}

function applyFilters() {
  const zone = document.getElementById('filter-zone').value;
  const type = document.getElementById('filter-type').value;
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const lang = window.i18n.currentLang;
  const filtered = allBusinesses.filter(b => {
    if (zone && b.zone !== zone) return false;
    if (type && b.type !== type) return false;
    if (search) {
      const nm = b.name.toLowerCase().includes(search);
      const cm = b.city.toLowerCase().includes(search);
      const dm = b.description && b.description[lang] && b.description[lang].toLowerCase().includes(search);
      if (!nm && !cm && !dm) return false;
    }
    return true;
  });
  requestAnimationFrame(() => { renderMarkers(filtered); renderList(filtered); });
}

function popupHTML(b) {
  const lang = window.i18n.currentLang;
  const img = resolveImg(b.image);
  const desc = b.description && b.description[lang] || b.description && b.description.es || '';
  const tt = i18n.t(`map.type_${b.type}`);
  const dt = tt.startsWith('map.type_') ? b.type : tt;
  const inRoute = routeStops.some(s => s._id === b._id);
  const rTxt = inRoute ? '✓ ' + i18n.t('map.route_added') : '+ ' + i18n.t('map.route_add');
  const rCls = inRoute ? 'popup-btn popup-btn-secondary' : 'popup-btn popup-btn-primary';
  return `<div>
    <img src="${img}" class="popup-img" alt="${esc(b.name)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
    <div class="popup-body">
      <span class="chip" style="margin-bottom:0.5rem;">${esc(dt)}</span>
      <h3 class="popup-title">${esc(b.name)}</h3>
      <p class="popup-desc">${esc(desc.substring(0, 100))}${desc.length > 100 ? '...' : ''}</p>
      <div class="popup-actions">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}" target="_blank" class="popup-btn popup-btn-secondary">📍 ${i18n.t('map.directions')}</a>
        <button class="${rCls}" onclick="window.toggleRouteStop('${b._id}')">${rTxt}</button>
      </div>
    </div>
  </div>`;
}

function renderMarkers(businesses) {
  markerLayerGroup.clearLayers();
  currentMarkers = {};
  businesses.forEach(b => {
    const marker = L.marker([b.lat, b.lng], { icon: getIconForType(b.type) });
    marker.on('click', () => {
      if (!marker.getPopup()) marker.bindPopup(popupHTML(b), { minWidth: 260, maxWidth: 280, autoPanPadding: [50, 50] });
      else marker.getPopup().setContent(popupHTML(b));
      marker.openPopup();
    });
    markerLayerGroup.addLayer(marker);
    currentMarkers[b._id] = marker;
  });
}

function renderList(businesses) {
  const el = document.getElementById('business-list');
  const lang = window.i18n.currentLang;
  if (!businesses.length) {
    el.innerHTML = `<p style="padding:2rem 1rem;text-align:center;color:var(--on-surface-variant);"><em>${i18n.t('map.no_results')}</em></p>`;
    return;
  }
  let h = '';
  for (const b of businesses) {
    const desc = b.description && b.description[lang] || b.description && b.description.es || '';
    const tt = i18n.t(`map.type_${b.type}`);
    const dt = tt.startsWith('map.type_') ? b.type : tt;
    const c = TYPE_COLORS[b.type] || '#005F73';
    const imgUrl = resolveImg(b.image);
    h += `<div class="list-item" onclick="window.focusMarker('${b._id}')">
      <div style="display:flex;gap:0.75rem;align-items:flex-start;">
        <img src="${imgUrl}" alt="${esc(b.name)}" style="width:56px;height:56px;border-radius:var(--rounded-md);object-fit:cover;flex-shrink:0;" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
            <h3 style="font-family:var(--font-display);font-size:1rem;color:var(--primary);margin:0;">${esc(b.name)}</h3>
            <span class="chip" style="font-size:0.6rem;margin:0;flex-shrink:0;">${esc(dt)}</span>
          </div>
          <p style="font-size:0.8rem;color:var(--secondary);font-weight:600;margin:0.15rem 0 0.3rem;">${esc(b.city)}</p>
          <p style="font-size:0.82rem;color:var(--on-surface-variant);margin:0;">${esc(desc.substring(0, 70))}${desc.length > 70 ? '...' : ''}</p>
        </div>
      </div>
    </div>`;
  }
  el.innerHTML = h;
}

window.focusMarker = (id) => {
  const marker = currentMarkers[id];
  if (!marker) return;
  const ll = marker.getLatLng();
  const off = window.innerWidth <= 768 ? 0 : 0.04;
  map.setView([ll.lat, ll.lng + off], 13, { animate: true, duration: 0.5 });
  const b = allBusinesses.find(x => x._id === id);
  if (b) {
    if (!marker.getPopup()) marker.bindPopup(popupHTML(b), { minWidth: 260, maxWidth: 280, autoPanPadding: [50, 50] });
    else marker.getPopup().setContent(popupHTML(b));
    marker.openPopup();
  }
};

function initNearby() {
  const rs = document.getElementById('nearby-radius');
  const rv = document.getElementById('radius-value');
  rs.addEventListener('input', () => { rv.textContent = rs.value; });
  document.getElementById('btn-nearby-search').addEventListener('click', searchNearby);
  document.getElementById('btn-geolocate').addEventListener('click', geolocateUser);
}

function geolocateUser() {
  if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
  const btn = document.getElementById('btn-geolocate');
  btn.textContent = '⏳';
  navigator.geolocation.getCurrentPosition(
    p => { document.getElementById('nearby-location').value = `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`; btn.textContent = '📍'; searchNearby(); },
    () => { btn.textContent = '📍'; alert('Unable to get location'); },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function searchNearby() {
  const input = document.getElementById('nearby-location').value.trim().toLowerCase();
  const radius = parseInt(document.getElementById('nearby-radius').value);
  const rEl = document.getElementById('nearby-results');
  let cLat, cLng;
  const cm = input.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (cm) { cLat = parseFloat(cm[1]); cLng = parseFloat(cm[2]); }
  else if (CITY_COORDS[input]) { [cLat, cLng] = CITY_COORDS[input]; }
  else {
    const k = Object.keys(CITY_COORDS).find(k => k.includes(input) || input.includes(k));
    if (k) [cLat, cLng] = CITY_COORDS[k];
    else { rEl.innerHTML = `<p style="text-align:center;color:var(--on-surface-variant);padding:1rem;font-size:0.9rem;">${i18n.t('map.nearby_not_found')}</p>`; return; }
  }
  if (nearbyCircle) map.removeLayer(nearbyCircle);
  nearbyCircle = L.circle([cLat, cLng], { radius: radius * 1000, color: '#005F73', fillColor: '#005F73', fillOpacity: 0.08, weight: 2, dashArray: '8 4' }).addTo(map);
  map.setView([cLat, cLng], getZoom(radius), { animate: true });
  const wd = allBusinesses.map(b => ({ ...b, distance: haversine(cLat, cLng, b.lat, b.lng) })).filter(b => b.distance <= radius).sort((a, b) => a.distance - b.distance);
  renderMarkers(wd);
  if (!wd.length) { rEl.innerHTML = `<p style="text-align:center;color:var(--on-surface-variant);padding:1rem;font-size:0.9rem;">${i18n.t('map.no_results')}</p>`; return; }
  rEl.innerHTML = `<p class="text-sm" style="margin-bottom:0.75rem;font-weight:600;color:var(--primary);">${wd.length} ${i18n.t('map.nearby_found')}</p>` +
    wd.map(b => {
      const tt = i18n.t(`map.type_${b.type}`); const dt = tt.startsWith('map.type_') ? b.type : tt;
      return `<div class="nearby-item" onclick="window.focusMarker('${b._id}')"><div><strong style="font-size:0.9rem;color:var(--on-surface);">${b.name}</strong><p class="text-xs" style="color:var(--on-surface-variant);margin:0;">${dt} · ${b.city}</p></div><span class="nearby-dist">${b.distance.toFixed(1)} km</span></div>`;
    }).join('');
}

function getZoom(km) { return km <= 3 ? 14 : km <= 5 ? 13 : km <= 10 ? 12 : km <= 20 ? 11 : km <= 30 ? 10 : 9; }

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function initRouteBuilder() {
  document.getElementById('btn-draw-route').addEventListener('click', drawRoute);
  document.getElementById('btn-clear-route').addEventListener('click', clearRoute);
}

window.toggleRouteStop = (id) => {
  const idx = routeStops.findIndex(s => s._id === id);
  if (idx >= 0) routeStops.splice(idx, 1);
  else { const b = allBusinesses.find(x => x._id === id); if (b) routeStops.push(b); }
  renderRouteList(); applyFilters();
  if (routeStops.length > 0) document.querySelector('.map-tab[data-tab="route"]').click();
};

window.removeRouteStop = (id) => { routeStops = routeStops.filter(s => s._id !== id); renderRouteList(); applyFilters(); };

function renderRouteList() {
  const lEl = document.getElementById('route-list'), aEl = document.getElementById('route-actions'), sEl = document.getElementById('route-summary');
  if (!routeStops.length) {
    lEl.innerHTML = `<p style="text-align:center;color:var(--on-surface-variant);font-size:0.9rem;padding:2rem 0;">${i18n.t('map.route_empty')}</p>`;
    aEl.style.display = 'none';
    if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
    return;
  }
  aEl.style.display = 'block';
  let td = 0; for (let i = 1; i < routeStops.length; i++) td += haversine(routeStops[i - 1].lat, routeStops[i - 1].lng, routeStops[i].lat, routeStops[i].lng);
  sEl.textContent = `${routeStops.length} ${i18n.t('map.route_stops')} · ~${td.toFixed(1)} km ${i18n.t('map.route_total')}`;
  lEl.innerHTML = routeStops.map((s, i) => `<div class="route-stop"><span class="route-stop-number">${i + 1}</span><div><strong style="font-size:0.9rem;">${s.name}</strong><p class="text-xs" style="margin:0;color:var(--on-surface-variant);">${s.city}</p></div><button class="route-stop-remove" onclick="window.removeRouteStop('${s._id}')" title="Remove">✕</button></div>`).join('');
}

function drawRoute() {
  if (routeStops.length < 2) return;
  if (routePolyline) map.removeLayer(routePolyline);
  const pts = routeStops.map(s => [s.lat, s.lng]);
  routePolyline = L.polyline(pts, { color: '#005F73', weight: 4, opacity: 0.8, dashArray: '12 6', lineCap: 'round' }).addTo(map);
  routeStops.forEach((s, i) => {
    const ni = L.divIcon({ html: `<div style="background:#005F73;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.8rem;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${i + 1}</div>`, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
    L.marker([s.lat, s.lng], { icon: ni }).addTo(markerLayerGroup);
  });
  map.fitBounds(routePolyline.getBounds().pad(0.15), { animate: true, duration: 0.5 });
}

function clearRoute() { routeStops = []; if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; } renderRouteList(); applyFilters(); }

function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle'), sidebar = document.getElementById('map-sidebar');
  if (!toggle || !sidebar) return;
  if (window.innerWidth <= 768) sidebar.classList.add('collapsed');
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggle.textContent = sidebar.classList.contains('collapsed') ? '📋 ' + i18n.t('map.toggle_list') : '🗺️ ' + i18n.t('map.toggle_map');
    setTimeout(() => map.invalidateSize(), 400);
  });
}

document.addEventListener('DOMContentLoaded', initMap);
