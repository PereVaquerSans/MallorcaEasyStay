require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

const businesses = [
  {
    name: "Can Det Olive Mill",
    description: {
      es: "Molino de aceite histórico en el corazón de Sóller, produciendo aceite de oliva ecológico desde el siglo XVI.",
      ca: "Molí d'oli històric al cor de Sóller, produint oli d'oliva ecològic des del segle XVI.",
      en: "Historic olive mill in the heart of Sóller, producing organic olive oil since the 16th century.",
      de: "Historische Ölmühle im Herzen von Sóller, die seit dem 16. Jahrhundert Bio-Olivenöl produziert."
    },
    type: "farm",
    city: "Sóller",
    zone: "tramuntana",
    lat: 39.7667,
    lng: 2.7153,
    image: "https://images.unsplash.com/photo-1579549339395-5cb785ec30af?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Forn des Teatre",
    description: {
      es: "Panadería tradicional preservando el secreto de la ensaimada de masa madre desde 1916.",
      ca: "Forn tradicional que preserva el secret de l'ensaïmada de massa mare des de 1916.",
      en: "Traditional bakery preserving the secret of the slow-rise Ensaïmada since 1916.",
      de: "Traditionelle Bäckerei, die seit 1916 das Geheimnis der Ensaïmada bewahrt."
    },
    type: "restaurant",
    city: "Palma",
    zone: "center",
    lat: 39.5696,
    lng: 2.6502,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Cerámica Artà",
    description: {
      es: "Taller artesanal de cerámica usando arcilla local del valle de Artà con técnicas ancestrales.",
      ca: "Taller artesanal de ceràmica usant argila local de la vall d'Artà amb tècniques ancestrals.",
      en: "Handmade ceramics workshop using local clay from the Artà valley with ancestral techniques.",
      de: "Handwerkliche Keramikwerkstatt mit lokalem Ton aus dem Artà-Tal und traditionellen Techniken."
    },
    type: "artisan",
    city: "Artà",
    zone: "east",
    lat: 39.6961,
    lng: 3.3489,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Finca La Esperanza",
    description: {
      es: "Retiro zero-waste escondido en la montaña, ofreciendo turismo regenerativo y talleres ecológicos.",
      ca: "Retir zero-waste amagat a la muntanya, oferint turisme regeneratiu i tallers ecològics.",
      en: "A zero-waste retreat tucked into the mountainside, offering regenerative tourism and eco workshops.",
      de: "Ein Zero-Waste-Refugium in den Bergen mit regenerativem Tourismus und Öko-Workshops."
    },
    type: "accommodation",
    city: "Valldemossa",
    zone: "tramuntana",
    lat: 39.7103,
    lng: 2.6228,
    image: "https://images.unsplash.com/photo-1566848149861-12711bdad961?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Can Terrassa Groves",
    description: {
      es: "Producción ancestral de aceite de oliva centrada en la biodiversidad y el cultivo sostenible.",
      ca: "Producció ancestral d'oli d'oliva centrada en la biodiversitat i el cultiu sostenible.",
      en: "Ancient olive oil production focused on biodiversity and sustainable farming.",
      de: "Traditionelle Olivenölproduktion mit Fokus auf Biodiversität und nachhaltige Landwirtschaft."
    },
    type: "farm",
    city: "Esporles",
    zone: "tramuntana",
    lat: 39.6646,
    lng: 2.5751,
    image: "https://images.unsplash.com/photo-1579549339395-5cb785ec30af?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Mercat de Sineu",
    description: {
      es: "El mercado semanal más antiguo de Mallorca, celebrado cada miércoles desde 1306 con productos locales.",
      ca: "El mercat setmanal més antic de Mallorca, celebrat cada dimecres des de 1306 amb productes locals.",
      en: "Mallorca's oldest weekly market, held every Wednesday since 1306 with local produce.",
      de: "Mallorcas ältester Wochenmarkt, jeden Mittwoch seit 1306 mit lokalen Produkten."
    },
    type: "market",
    city: "Sineu",
    zone: "center",
    lat: 39.6447,
    lng: 3.0017,
    image: "https://images.unsplash.com/photo-1519500057417-29369d7bdf96?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Sa Fàbrica de Gelats",
    description: {
      es: "Heladería artesanal en Sóller que usa frutas locales de la comarca y recetas tradicionales.",
      ca: "Gelateria artesanal a Sóller que utilitza fruites locals de la comarca i receptes tradicionals.",
      en: "Artisan ice cream parlor in Sóller using local fruits and traditional recipes.",
      de: "Handwerkliche Eisdiele in Sóller mit lokalen Früchten und traditionellen Rezepten."
    },
    type: "restaurant",
    city: "Sóller",
    zone: "tramuntana",
    lat: 39.7660,
    lng: 2.7157,
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Raixa Estate",
    description: {
      es: "Finca histórica con jardines italianos y museo etnológico que muestra la vida rural mallorquina.",
      ca: "Finca històrica amb jardins italians i museu etnològic que mostra la vida rural mallorquina.",
      en: "Historic estate with Italian gardens and an ethnological museum showcasing rural Mallorcan life.",
      de: "Historisches Anwesen mit italienischen Gärten und ethnologischem Museum des ländlichen Mallorcas."
    },
    type: "experience",
    city: "Bunyola",
    zone: "tramuntana",
    lat: 39.6750,
    lng: 2.7083,
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Teixits Vicens",
    description: {
      es: "Taller textil fundado en 1854, creando las emblemáticas telas de lenguas mallorquinas a mano.",
      ca: "Taller tèxtil fundat el 1854, creant les emblemàtiques teles de llengües mallorquines a mà.",
      en: "Textile workshop founded in 1854, hand-weaving the iconic Mallorcan 'teles de llengües' fabrics.",
      de: "Textilwerkstatt gegründet 1854, die ikonischen mallorquinischen 'Teles de Llengües' handgewebt."
    },
    type: "artisan",
    city: "Pollença",
    zone: "north",
    lat: 39.8775,
    lng: 3.0163,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Bodega Ribas",
    description: {
      es: "Bodega familiar desde 1711, la más antigua de Mallorca, produciendo vinos con variedades autóctonas.",
      ca: "Bodega familiar des de 1711, la més antiga de Mallorca, produint vins amb varietats autòctones.",
      en: "Family winery since 1711, Mallorca's oldest, producing wines from indigenous grape varieties.",
      de: "Familienweingut seit 1711, das älteste Mallorcas, mit Weinen aus einheimischen Rebsorten."
    },
    type: "farm",
    city: "Consell",
    zone: "center",
    lat: 39.6844,
    lng: 2.8119,
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Mercat de l'Olivar",
    description: {
      es: "Mercado cubierto en el centro de Palma con los mejores productos frescos y artesanos locales.",
      ca: "Mercat cobert al centre de Palma amb els millors productes frescos i artesans locals.",
      en: "Covered market in central Palma with the finest fresh produce and local artisans.",
      de: "Überdachter Markt im Zentrum von Palma mit den besten frischen Produkten und Handwerkern."
    },
    type: "market",
    city: "Palma",
    zone: "center",
    lat: 39.5742,
    lng: 2.6500,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Santuari de Lluc",
    description: {
      es: "Monasterio y santuario espiritual en el corazón de la Serra de Tramuntana con rutas de senderismo.",
      ca: "Monestir i santuari espiritual al cor de la Serra de Tramuntana amb rutes de senderisme.",
      en: "Monastery and spiritual sanctuary in the heart of the Tramuntana mountains with hiking trails.",
      de: "Kloster und spirituelle Zuflucht im Herzen der Serra de Tramuntana mit Wanderwegen."
    },
    type: "experience",
    city: "Escorca",
    zone: "tramuntana",
    lat: 39.8228,
    lng: 2.8850,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Es Refugi",
    description: {
      es: "Restaurante sostenible en Deià que sirve cocina de temporada con ingredientes de huertos propios.",
      ca: "Restaurant sostenible a Deià que serveix cuina de temporada amb ingredients d'horts propis.",
      en: "Sustainable restaurant in Deià serving seasonal cuisine from their own kitchen gardens.",
      de: "Nachhaltiges Restaurant in Deià mit saisonaler Küche aus eigenem Gartenanbau."
    },
    type: "restaurant",
    city: "Deià",
    zone: "tramuntana",
    lat: 39.7486,
    lng: 2.6489,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Salines d'Es Trenc",
    description: {
      es: "Salinas naturales activas donde se recolecta flor de sal artesanalmente, la joya del sur de Mallorca.",
      ca: "Salines naturals actives on es recol·lecta flor de sal artesanalment, la joia del sud de Mallorca.",
      en: "Active natural salt flats where fleur de sel is artisanally harvested, a gem of southern Mallorca.",
      de: "Aktive Natursaline, in der Fleur de Sel handwerklich geerntet wird – ein Juwel des Südens Mallorcas."
    },
    type: "experience",
    city: "Campos",
    zone: "south",
    lat: 39.3539,
    lng: 2.9603,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Son Forés Agroturismo",
    description: {
      es: "Agroturismo ecológico en una possessió del siglo XVII con huerto, animales y talleres de permacultura.",
      ca: "Agroturisme ecològic en una possessió del segle XVII amb hort, animals i tallers de permacultura.",
      en: "Organic agrotourism at a 17th-century possessió with gardens, animals, and permaculture workshops.",
      de: "Bio-Agrotourismus in einer Possessió aus dem 17. Jh. mit Garten, Tieren und Permakultur-Workshops."
    },
    type: "accommodation",
    city: "Manacor",
    zone: "east",
    lat: 39.5697,
    lng: 3.2094,
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=400"
  }
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌ Set MONGO_URI in .env first');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Business.deleteMany({});
  console.log('🗑️  Cleared existing businesses');

  await Business.insertMany(businesses);
  console.log(`🌱 Seeded ${businesses.length} businesses`);

  await mongoose.disconnect();
  console.log('👋 Done');
}

seed();
