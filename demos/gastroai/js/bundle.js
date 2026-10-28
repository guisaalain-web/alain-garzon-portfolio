/**
 * GASTROAI PRO - THE COMPLETE "VIAJEREAL" EXPERIENCE
 * 1. REAL RESTAURANTS (OSM)
 * 2. REAL WEATHER (Open-Meteo)
 * 3. REAL LOCATION (Geo)
 * 4. AI CHAT (Gemini FREE)
 */

(function () {
    'use strict';

    // ╔══════════════════════════════════════════════════════════════════════╗
    // ║  🔧 CONFIGURACIÓN - OBTÉN TU API KEY GRATIS:                         ║
    // ║                                                                       ║
    // ║  1. Ve a https://aistudio.google.com/                                ║
    // ║  2. Inicia sesión con tu cuenta de Google                            ║
    // ║  3. Click en "Get API Key" (panel izquierdo)                         ║
    // ║  4. Click en "Create API Key"                                        ║
    // ║  5. Copia la key y pégala abajo en geminiApiKey                      ║
    // ║                                                                       ║
    // ║  ✅ GRATIS: 1,500 peticiones/día con Gemini 1.5 Flash               ║
    // ╚══════════════════════════════════════════════════════════════════════╝
    const CONFIG = {
        googleApiKey: '',
        defaultImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
        nominatimUrl: 'https://nominatim.openstreetmap.org/reverse',
        ipLocationUrl: 'https://ipapi.co/json/',
        overpassUrl: 'https://overpass-api.de/api/interpreter',
        weatherUrl: 'https://api.open-meteo.com/v1/forecast',
        defaultLocation: { lat: 43.236, lng: -2.891, city: 'Basauri' },

        // AI Configuration - GEMINI (GRATIS)
        aiProvider: 'gemini',  // Opciones: 'gemini', 'openai', 'none'

        // ⭐ PEGA TU API KEY AQUÍ (obtén una en https://aistudio.google.com/)
        geminiApiKey: '',  // desactivada en esta demo

        // OpenAI (de pago - no recomendado)
        openaiApiKey: ''
    };

    const Utils = {
        calcDistance(lat1, lon1, lat2, lon2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return parseFloat((R * c).toFixed(2));
        },
        renderStars(r) { return '★★★★★'.substring(0, Math.round(r)) + '<span class="opacity-30">★★★★★</span>'.substring(Math.round(r)); },
        getWeatherIcon(code) {
            // WMO Weather interpretation codes (WW)
            if (code === 0) return '☀️'; // Clear sky
            if (code >= 1 && code <= 3) return '⛅'; // Partly cloudy
            if (code >= 45 && code <= 48) return '🌫️'; // Fog
            if (code >= 51 && code <= 57) return '🌧️'; // Drizzle
            if (code >= 61 && code <= 67) return '🌧️'; // Rain
            if (code >= 71 && code <= 77) return '❄️'; // Snow
            if (code >= 80 && code <= 82) return '🌦️'; // Showers
            if (code >= 95) return '⚡'; // Thunderstorm
            return '☁️';
        }
    };

    const LocationService = {
        currentLocation: null,
        currentCity: null,

        async initialize() {
            try {
                const pos = await this.getBrowserLocation();
                this.currentCity = await this.getCityName(pos.lat, pos.lng);
                return { ...pos, city: this.currentCity };
            } catch (error) {
                try {
                    const ipPos = await this.getIpLocation();
                    this.currentCity = ipPos.city;
                    return ipPos;
                } catch (ipError) {
                    this.currentCity = CONFIG.defaultLocation.city;
                    return { ...CONFIG.defaultLocation, isFallback: true };
                }
            }
        },

        getBrowserLocation() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) { reject(new Error('No Geo')); return; }
                navigator.geolocation.getCurrentPosition(
                    (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, isFallback: false }),
                    (e) => reject(e),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            });
        },

        async getIpLocation() {
            const res = await fetch(CONFIG.ipLocationUrl);
            const data = await res.json();
            return { lat: data.latitude, lng: data.longitude, city: data.city, isFallback: false };
        },

        async getCityName(lat, lng) {
            try {
                const r = await fetch(`${CONFIG.nominatimUrl}?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
                const d = await r.json();
                return d.address?.suburb || d.address?.neighbourhood || d.address?.city || d.address?.town || CONFIG.defaultLocation.city;
            } catch (e) { return CONFIG.defaultLocation.city; }
        }
    };

    // ===== WEATHER SERVICE (NEW) =====
    const WeatherService = {
        async getWeather(lat, lng) {
            try {
                const url = `${CONFIG.weatherUrl}?latitude=${lat}&longitude=${lng}&current_weather=true`;
                const r = await fetch(url);
                const d = await r.json();
                return {
                    temp: Math.round(d.current_weather.temperature),
                    code: d.current_weather.weathercode,
                    icon: Utils.getWeatherIcon(d.current_weather.weathercode)
                };
            } catch (e) {
                console.warn('Weather Error', e);
                return null;
            }
        }
    };

    const DataRepository = {
        // Imágenes de alta calidad para cada tipo de establecimiento
        images: {
            // Cocinas internacionales
            'italiana': 'https://images.unsplash.com/photo-1595854341625-f33ee10432fa?w=600&h=400&fit=crop',
            'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
            'pasta': 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=600&h=400&fit=crop',
            'japonesa': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop',
            'sushi': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop',
            'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop',
            'mexicana': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop',
            'tacos': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop',
            'china': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop',
            'asian': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop',
            'thai': 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&h=400&fit=crop',
            'indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
            'hindú': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
            'kebab': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop',
            'turca': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop',
            'greek': 'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=600&h=400&fit=crop',

            // Cocina vasca y española
            'vasca': 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&h=400&fit=crop',
            'pintxos': 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&h=400&fit=crop',
            'sidrería': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
            'sidra': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
            'tapas': 'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600&h=400&fit=crop',
            'española': 'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600&h=400&fit=crop',
            'spanish': 'https://images.unsplash.com/photo-1515669097368-22e68427d265?w=600&h=400&fit=crop',
            'argentina': 'https://images.unsplash.com/photo-1544025162-d76690b6d029?w=600&h=400&fit=crop',
            'parrilla': 'https://images.unsplash.com/photo-1544025162-d76690b6d029?w=600&h=400&fit=crop',
            'asador': 'https://images.unsplash.com/photo-1544025162-d76690b6d029?w=600&h=400&fit=crop',

            // Mariscos y pescado
            'mariscos': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop',
            'seafood': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop',
            'pescado': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop',
            'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop',

            // Bares y cafés
            'bar': 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&h=400&fit=crop',
            'pub': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
            'café': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
            'cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
            'cafetería': 'https://images.unsplash.com/photo-1554679665-f5537f187268?w=600&h=400&fit=crop',
            'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
            'brunch': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&h=400&fit=crop',

            // Fast food
            'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
            'hamburguesa': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
            'fast_food': 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&h=400&fit=crop',
            'comida callejera': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
            'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop',
            'bocadillo': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop',

            // Saludable
            'vegana': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
            'vegetariana': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
            'healthy': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
            'ensalada': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',

            // Postres y dulces
            'ice_cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&h=400&fit=crop',
            'heladería': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&h=400&fit=crop',
            'bakery': 'https://images.unsplash.com/photo-1517433670267-30f41c6f9ad6?w=600&h=400&fit=crop',
            'panadería': 'https://images.unsplash.com/photo-1517433670267-30f41c6f9ad6?w=600&h=400&fit=crop',
            'pastelería': 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=400&fit=crop',

            // Otros
            'regional': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
            'internacional': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
            'default': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'
        },

        // Traductor de categorías OSM al español bonito
        cuisineTranslations: {
            'basque_ciderhouse': 'Sidrería Vasca',
            'basque': 'Cocina Vasca',
            'spanish': 'Española',
            'regional': 'Cocina Regional',
            'pizza': 'Pizzería',
            'italian': 'Italiana',
            'japanese': 'Japonesa',
            'sushi': 'Sushi',
            'chinese': 'China',
            'asian': 'Asiática',
            'thai': 'Tailandesa',
            'vietnamese': 'Vietnamita',
            'korean': 'Coreana',
            'indian': 'Hindú',
            'mexican': 'Mexicana',
            'american': 'Americana',
            'burger': 'Hamburguesería',
            'kebab': 'Kebab',
            'turkish': 'Turca',
            'greek': 'Griega',
            'french': 'Francesa',
            'seafood': 'Marisquería',
            'fish': 'Pescados',
            'steak_house': 'Asador',
            'grill': 'Parrilla',
            'barbecue': 'Barbacoa',
            'vegetarian': 'Vegetariana',
            'vegan': 'Vegana',
            'coffee_shop': 'Cafetería',
            'cafe': 'Café',
            'sandwich': 'Bocadillos',
            'tapas': 'Tapas',
            'pintxos': 'Pintxos',
            'fast_food': 'Comida Rápida',
            'ice_cream': 'Heladería',
            'dessert': 'Postres',
            'bakery': 'Panadería',
            'breakfast': 'Desayunos',
            'brunch': 'Brunch',
            'fine_dining': 'Alta Cocina',
            'wine_bar': 'Vinoteca',
            'pub': 'Pub',
            'bar': 'Bar'
        },

        translateCuisine(cuisine) {
            if (!cuisine) return 'Restaurante';
            const lower = cuisine.toLowerCase().replace(/_/g, '_');
            // Buscar traducción directa
            if (this.cuisineTranslations[lower]) {
                return this.cuisineTranslations[lower];
            }
            // Buscar traducción parcial
            for (const [key, value] of Object.entries(this.cuisineTranslations)) {
                if (lower.includes(key) || key.includes(lower)) {
                    return value;
                }
            }
            // Si no hay traducción, capitalizar y limpiar
            return cuisine.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        },

        // Generate dynamic restaurants for any city
        generateRestaurants(city, lat, lng, count = 30) {
            const cuisines = [
                { name: 'Italiana', tags: ['Pasta', 'Pizza', 'Romántico'] },
                { name: 'Japonesa', tags: ['Sushi', 'Ramen', 'Zen'] },
                { name: 'China', tags: ['Wok', 'Dim Sum', 'Familiar'] },
                { name: 'Mexicana', tags: ['Tacos', 'Picante', 'Festivo'] },
                { name: 'Vasca', tags: ['Pintxos', 'Tradicional', 'Auténtico'] },
                { name: 'Argentina', tags: ['Parrilla', 'Carne', 'Familiar'] },
                { name: 'Comida Callejera', tags: ['Hamburguesas', 'Rápida', 'Económica'] },
                { name: 'Mariscos', tags: ['Fresco', 'Pescado', 'Terraza'] },
                { name: 'Hindú', tags: ['Curry', 'Especiado', 'Exótico'] },
                { name: 'Cafetería', tags: ['Brunch', 'Café', 'Tranquilo'] },
                { name: 'Vegana', tags: ['Saludable', 'Fit', 'Bio'] }
            ];

            const adjectives = ['Casa', 'Rincón', 'Sabor', 'Golden', 'Urban', 'La Tasca', 'El Fogón', 'Taberna', 'Mesón'];
            const streets = ['Gran Vía', 'Calle Mayor', 'Plaza España', 'Av. Libertad', 'Paseo del Prado', 'Calle San Juan', 'Plaza Mayor', 'Calle Real', 'Av. de la Constitución', 'Calle del Sol'];
            const restaurants = [];

            for (let i = 0; i < count; i++) {
                const cuisine = cuisines[i % cuisines.length];
                const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                const street = streets[Math.floor(Math.random() * streets.length)];

                // Vary location slightly
                const rLat = lat + (Math.random() - 0.5) * 0.02;
                const rLng = lng + (Math.random() - 0.5) * 0.02;
                const dist = Utils.calcDistance(lat, lng, rLat, rLng);

                restaurants.push({
                    id: `gen_${city}_${i}`,
                    name: `${adj} ${cuisine.name.split(' ')[0]}`,
                    cuisine: cuisine.name,
                    rating: (3.5 + Math.random() * 1.5).toFixed(1),
                    reviewCount: Math.floor(Math.random() * 300) + 20,
                    address: `${street}, ${Math.floor(Math.random() * 50) + 1}`,
                    lat: rLat,
                    lon: rLng,
                    distance: parseFloat(dist.toFixed(2)),
                    image: this.images[cuisine.name.toLowerCase()] || this.images['default'],
                    tags: cuisine.tags,
                    priceLevel: Math.floor(Math.random() * 3) + 1,
                    isOpen: Math.random() > 0.2
                });
            }

            return restaurants.sort((a, b) => a.distance - b.distance);
        },

        getImageForCuisine(c) {
            if (!c) return this.images['default'];
            const l = c.toLowerCase();
            for (let key in this.images) {
                if (l.includes(key)) return this.images[key];
            }
            return this.images['default'];
        },

        // Genera imagen de Street View (fachada real del local)
        getStreetViewImage(lat, lon, name) {
            // Street View Static API (requiere API key de Google Cloud)
            // Como alternativa gratuita, usamos Mapillary o imagen por categoría
            return null; // Retornamos null para usar imagen por categoría
        }
    };


    const PlacesService = {
        restaurants: [],

        async fetchRestaurants(lat, lng, filters = {}) {
            this.restaurants = [];
            const city = LocationService.currentCity || 'Tu Ciudad';

            // 1. Google API
            if (CONFIG.googleApiKey.length > 10) {
                try { const gd = await this.fetchFromGoogle(lat, lng); if (gd.length > 0) this.restaurants = gd; } catch (e) { }
            }
            // 2. OSM
            if (this.restaurants.length === 0) {
                try { const osmData = await this.fetchFromOverpass(lat, lng); if (osmData.length > 0) this.restaurants = osmData; } catch (e) { console.log('OSM failed, using fallback'); }
            }
            // 3. Fallback - Always generate restaurants if nothing loaded
            if (this.restaurants.length === 0) {
                console.log('Using generated restaurants fallback');
                this.restaurants = DataRepository.generateRestaurants(city, lat, lng, 30);
            }
            return this.filterData(this.restaurants, filters);
        },


        async fetchFromGoogle(lat, lng) { return []; },

        async fetchFromOverpass(lat, lng) {
            // Buscar TODOS los restaurantes de la ciudad (radio 10km = ciudad entera)
            // Incluye: restaurantes, cafés, bares, fast food, pubs
            const query = `[out:json][timeout:30];(
                node["amenity"="restaurant"](around:10000,${lat},${lng});
                node["amenity"="cafe"](around:10000,${lat},${lng});
                node["amenity"="bar"](around:10000,${lat},${lng});
                node["amenity"="fast_food"](around:10000,${lat},${lng});
                node["amenity"="pub"](around:10000,${lat},${lng});
            );out body 150;`;
            const url = `${CONFIG.overpassUrl}?data=${encodeURIComponent(query)}`;

            console.log('🗺️ Buscando TODOS los restaurantes de la ciudad (10km)...');

            const r = await fetch(url);

            if (!r.ok) {
                console.warn('OSM HTTP Error:', r.status, '- intentando búsqueda reducida...');
                // Fallback: solo restaurantes en 5km
                const fallbackQuery = `[out:json][timeout:20];node["amenity"="restaurant"](around:5000,${lat},${lng});out body 80;`;
                const fallbackUrl = `${CONFIG.overpassUrl}?data=${encodeURIComponent(fallbackQuery)}`;
                const fr = await fetch(fallbackUrl);
                if (!fr.ok) throw new Error('OSM unavailable');
                const fd = await fr.json();
                if (!fd.elements) return [];
                return this.processOSMElements(fd.elements, lat, lng);
            }

            const d = await r.json();
            if (!d.elements || d.elements.length === 0) {
                console.log('No se encontraron restaurantes en la zona');
                return [];
            }

            console.log(`✅ Encontrados ${d.elements.length} restaurantes en la ciudad`);
            return this.processOSMElements(d.elements, lat, lng);
        },

        // Procesa los elementos de OSM y les añade direcciones reales
        async processOSMElements(elements, lat, lng) {
            const results = await Promise.all(elements.map(async e => {
                // Obtener tipo de cocina o tipo de establecimiento
                let rawCuisine = e.tags.cuisine ? e.tags.cuisine.split(';')[0] : '';
                const amenity = e.tags.amenity || 'restaurant';

                // Si no hay cuisine, usar el tipo de amenity
                if (!rawCuisine) {
                    if (amenity === 'bar') rawCuisine = 'bar';
                    else if (amenity === 'cafe') rawCuisine = 'cafe';
                    else if (amenity === 'pub') rawCuisine = 'pub';
                    else if (amenity === 'fast_food') rawCuisine = 'fast_food';
                    else rawCuisine = 'restaurant';
                }

                // Traducir al español bonito
                const cuisine = DataRepository.translateCuisine(rawCuisine);
                const Dist = Utils.calcDistance(lat, lng, e.lat, e.lon);

                // Obtener dirección REAL
                let address = '';
                if (e.tags['addr:street']) {
                    address = `${e.tags['addr:street']}${e.tags['addr:housenumber'] ? ' ' + e.tags['addr:housenumber'] : ''}`;
                } else {
                    // Usar el barrio o zona si está disponible
                    if (e.tags['addr:city'] || e.tags['addr:suburb']) {
                        address = e.tags['addr:suburb'] || e.tags['addr:city'] || '';
                    } else {
                        // Geocoding inverso - con rate limit
                        try {
                            await new Promise(r => setTimeout(r, 50)); // Evitar rate limit
                            const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${e.lat}&lon=${e.lon}&format=json&zoom=18`;
                            const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'GastroAI-PRO/1.0' } });
                            const geoData = await geoRes.json();
                            address = geoData.address?.road || geoData.address?.pedestrian || '';
                            if (geoData.address?.house_number) address += ' ' + geoData.address.house_number;
                            if (!address) address = geoData.address?.suburb || geoData.address?.neighbourhood || '';
                        } catch (err) {
                            address = '';
                        }
                    }
                }

                // === OBTENER FOTO REAL ===
                let image = null;
                const restaurantName = e.tags.name || '';

                // 1. Comprobar si OSM tiene imagen directa
                if (e.tags.image) {
                    image = e.tags.image;
                }
                // 2. Comprobar Wikimedia Commons
                else if (e.tags['wikimedia_commons']) {
                    const wikiFile = e.tags['wikimedia_commons'].replace('File:', '');
                    image = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(wikiFile)}?width=600`;
                }

                // 3. Si no hay imagen real, usar imagen de alta calidad por categoría
                if (!image) {
                    const imageKey = rawCuisine.toLowerCase() || amenity;
                    image = DataRepository.getImageForCuisine(imageKey);
                }

                return {
                    id: `osm_${e.id}`,
                    name: restaurantName || 'Restaurante local',
                    cuisine: cuisine,
                    rating: (4.0 + (Math.random() * 0.9)).toFixed(1),
                    reviewCount: Math.floor(Math.random() * 100) + 10,
                    address: address || `📍 ${Dist < 1 ? (Dist * 1000).toFixed(0) + 'm' : Dist.toFixed(1) + 'km'}`,
                    lat: e.lat,
                    lon: e.lon,
                    image: image,
                    tags: ['Real', 'OSM'],
                    distance: Dist,
                    source: 'osm',
                    isOpen: true,
                    amenityType: amenity,
                    website: e.tags.website || null,
                    phone: e.tags.phone || e.tags['contact:phone'] || null
                };
            }));

            return results.filter(r => r.name !== 'Restaurante local');
        },

        filterData(allData, filters) {
            let res = [...allData];
            if (filters.cuisine && filters.cuisine !== 'all') {
                const f = filters.cuisine.toLowerCase();
                res = res.filter(r => r.cuisine.toLowerCase().includes(f));
            }
            res.sort((a, b) => a.distance - b.distance);
            return res;
        }
    };

    const ChatService = {
        state: { asking: false },

        // --- CLASSIFICATION MODULE (Mental Model) ---
        classifyVenue(r) {
            let type = r.cuisine;
            let vibe = 'casual';
            let ideal = 'comer bien';

            // Infer Vibe from Price
            if (r.priceLevel === 1) { vibe = 'económico y rápido'; ideal = 'ahorrar'; }
            else if (r.priceLevel === 3) { vibe = 'romántico / premium'; ideal = 'una cita'; }

            // Infer Ideal from Cuisine
            const cuisineLower = type.toLowerCase();
            if (cuisineLower.includes('street') || cuisineLower.includes('burger') || cuisineLower.includes('comida callejera')) {
                ideal = 'hamburguesas con amigos';
            }
            if (cuisineLower.includes('pintxos') || cuisineLower.includes('vasco') || cuisineLower.includes('vasca')) {
                vibe = 'auténtico';
                ideal = 'potear con la cuadrilla';
            }
            if (cuisineLower.includes('cafe') || cuisineLower.includes('cafetería')) {
                vibe = 'tranquilo';
                ideal = 'un café o brunch';
            }
            if (cuisineLower.includes('asador') || cuisineLower.includes('argentina') || cuisineLower.includes('parrilla')) {
                vibe = 'familiar';
                ideal = 'fuego y brasas';
            }
            if (cuisineLower.includes('japo') || cuisineLower.includes('sushi') || cuisineLower.includes('japonesa')) {
                vibe = 'zen';
                ideal = 'sushi y ramen';
            }
            if (cuisineLower.includes('china') || cuisineLower.includes('chino')) {
                vibe = 'familiar';
                ideal = 'wok y dim sum';
            }
            if (cuisineLower.includes('mexi') || cuisineLower.includes('taco')) {
                vibe = 'festivo';
                ideal = 'tacos y margaritas';
            }

            return { type, vibe, ideal };
        },

        // --- FALLBACK SYSTEM (REGLA DE ORO: "Nunca decir no sé") ---
        getFallback(list, originalFilters) {
            // Strategy 1: Relax Price, Keep Cuisine
            if (originalFilters.cuisine) {
                const alt = list.filter(r => r.cuisine.toLowerCase().includes(originalFilters.cuisine.toLowerCase()));
                if (alt.length > 0) return { data: alt, msg: `No encuentro exactamente de ese precio, pero estos de <b>${originalFilters.cuisine}</b> te van a encantar:` };
            }
            // Strategy 2: Relax Cuisine, Keep Price
            if (originalFilters.price) {
                const alt = list.filter(r => originalFilters.price === 1 ? r.priceLevel <= 2 : r.priceLevel >= 2);
                if (alt.length > 0) return { data: alt, msg: `No hay de ese tipo exacto, pero estos son <b>${originalFilters.price === 1 ? 'económicos' : 'premium'}</b> y están bien:` };
            }
            // Strategy 3: Expert Knowledge + Closest
            return { data: list.slice(0, 3), msg: `No tengo eso exacto ahora, pero <b>mi recomendación segura</b> son estos (los mejores valorados cerca):` };
        },

        // Conocimiento experto para cuando no hay restaurantes que encajen
        getExpertTip(cuisine) {
            const tips = {
                'Italiana': 'En un buen italiano, la pasta debe estar al dente y la carbonara NUNCA lleva nata.',
                'Japonesa': 'En sushi, fíjate que el arroz esté a temperatura cuerpo, no frío de nevera.',
                'China': 'Si ves clientes comiendo patas de pollo, es señal de chino auténtico.',
                'Mexicana': 'Las tortillas de verdad son de maíz y dobles. Huye del trigo industrial.',
                'Vasca': 'Los pintxos fríos deben estar cubiertos, los calientes se piden.',
                'Argentina': 'Pide la carne "al punto" para disfrutar el jugo real.',
                'Hindú': 'Pide "mild" si no eres experto con el picante indio.',
                'Cafetería': 'Si no oyes el molinillo de café, sospecha del café.',
                'Comida Callejera': 'En kebab, mira que corten la carne al momento.',
                'Mariscos': 'Si huele a mar está fresco; si huele a pescado, desconfía.',
                'Vegana': 'Pregunta por ingredientes de temporada, suelen variar el menú.'
            };
            return tips[cuisine] || 'Busca sitios con buenas reseñas recientes y evita los menús turísticos.';
        },

        // Formatear restaurantes para contexto de IA
        formatRestaurantsForContext(restaurants) {
            if (!restaurants || restaurants.length === 0) return "No hay restaurantes disponibles.";
            return restaurants.slice(0, 10).map(r => {
                const priceSymbols = '€'.repeat(r.priceLevel || 1);
                return `- ${r.name} (${r.cuisine}): ${r.rating}⭐ | ${priceSymbols} | ${(r.distance * 1000).toFixed(0)}m | ${r.address}`;
            }).join('\n');
        },

        // Llamada a OpenAI API
        async callOpenAI(message, restaurants, city) {
            const restaurantsContext = this.formatRestaurantsForContext(restaurants);

            const systemPrompt = `Eres un guía gastronómico LOCAL experto, directo y resolutivo.
Tu misión es responder SIEMPRE lo que el usuario pide, sin excusas.
No puedes negarte ni responder "no sé".

🎯 TU OBJETIVO ÚNICO: Que el usuario diga "wow, justo lo que necesitaba" y acabe yendo al sitio.

=== RESTAURANTES DISPONIBLES EN ${city || 'TU ZONA'} ===
${restaurantsContext}

=== REGLAS DE CONDUCTA ===
✔ RESPONDE SIEMPRE con una recomendación concreta del listado.
✔ Si faltan datos, asume valores razonables y pregunta DESPUÉS.
✔ Si el usuario pide algo imposible, dale la versión más cercana útil.
✔ Nunca uses "no puedo", "no sé", "soy un modelo" o "no tengo acceso".
✔ Nunca digas "depende" sin dar al menos 1 opción clara.
✔ Si no hay restaurantes que encajen, da consejos expertos sobre ese tipo de cocina.

=== FORMATO OBLIGATORIO ===
DIRECTO, sin saludos ("Hola", "Claro", "¡Por supuesto!"):
1) RECOMENDACIÓN → Nombre + por qué
2) TIP EXTRA → Consejo de local (qué pedir, cuándo ir)
3) ALTERNATIVA → 1-2 opciones más
4) PREGUNTA → Solo si es imprescindible

=== MODO EXPERTO PERSISTENTE ===
- Hablas como un foodie local que conoce cada rincón.
- Sabes de técnicas, platos estrella, trucos y qué sitios son "trap turístico".
- Tono: profesional pero cercano, como un amigo con buen paladar.
- No mencionas que eres IA.

IMPORTANTE: Prioriza restaurantes de la lista. Si mencionas uno, usa su nombre EXACTO.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error en la API de OpenAI');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        },

        // Llamada a Google Gemini API (GRATIS - 1,500 peticiones/día)
        async callGemini(message, restaurants, city) {
            if (!CONFIG.geminiApiKey || CONFIG.geminiApiKey === 'TU_API_KEY_AQUI') {
                throw new Error('API key de Gemini no configurada');
            }

            const restaurantsContext = this.formatRestaurantsForContext(restaurants);

            const prompt = `Eres un guía gastronómico LOCAL experto en ${city || 'la ciudad'}.
Tu misión: responder SIEMPRE con recomendaciones concretas. Nunca digas "no sé".

RESTAURANTES DISPONIBLES:
${restaurantsContext}

REGLAS:
✔ Siempre da 1-3 recomendaciones concretas del listado
✔ Formato: Nombre → Por qué → Tip local → Alternativa
✔ Sin saludos, directo al grano
✔ Si no encaja nada, da consejos expertos sobre esa cocina
✔ Nunca "no puedo", "no sé", "soy IA"
✔ Tono: foodie local, cercano pero profesional
✔ Incluye SIEMPRE la dirección exacta del restaurante

Usuario: ${message}
Asistente (responde directo):`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${CONFIG.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error:', errorData);
                throw new Error(errorData.error?.message || 'Error en la API de Gemini');
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0]) {
                throw new Error('Respuesta vacía de Gemini');
            }

            return data.candidates[0].content.parts[0].text;
        },

        // Método principal - soporta Gemini (gratis) y OpenAI
        async getResponse(msg) {
            const list = window.App?.restaurants || [];
            const city = window.App?.location?.city || 'tu ciudad';

            // 1. Intentar con Gemini (GRATIS)
            if (CONFIG.aiProvider === 'gemini' && CONFIG.geminiApiKey && CONFIG.geminiApiKey !== 'TU_API_KEY_AQUI') {
                try {
                    console.log('🤖 Llamando a Gemini (GRATIS)...');
                    const aiResponse = await this.callGemini(msg, list, city);
                    return `<div class="space-y-2"><p class="text-gray-200">${aiResponse.replace(/\n/g, '<br>')}</p></div>`;
                } catch (error) {
                    console.error('Error Gemini:', error);
                    return this.getResponseFallback(msg);
                }
            }

            // 2. Intentar con OpenAI (de pago)
            if (CONFIG.aiProvider === 'openai' && CONFIG.openaiApiKey) {
                try {
                    console.log('🤖 Llamando a ChatGPT...');
                    const aiResponse = await this.callOpenAI(msg, list, city);
                    return `<div class="space-y-2"><p class="text-gray-200">${aiResponse.replace(/\n/g, '<br>')}</p></div>`;
                } catch (error) {
                    console.error('Error OpenAI:', error);
                    return this.getResponseFallback(msg);
                }
            }

            // 3. Sin API configurada - usar fallback inteligente
            console.log('ℹ️ Usando sistema de respuestas local (configura Gemini para IA real)');
            return this.getResponseFallback(msg);
        },

        getResponseFallback(msg) {
            const q = msg.toLowerCase();
            const list = window.App?.restaurants || [];
            const city = window.App?.location?.city || 'tu zona';

            // === 1. SALUDO MEJORADO ===
            if (/^(hola|ola|buenas|hey|ey|que tal|buenos dias|buenas tardes|buenas noches)/i.test(q)) {
                return `
                    <div class="space-y-2">
                        <p class="text-gray-200">¡Hola! 👋 Soy tu <strong>guía gastronómico</strong> en ${city}.</p>
                        <p class="text-gray-300">Dime qué te apetece y te recomiendo al instante:</p>
                        <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div class="bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">🍣 "Sushi"</div>
                            <div class="bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">🍔 "Burger"</div>
                            <div class="bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">🥡 "Chino"</div>
                            <div class="bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10">❤️ "Romántico"</div>
                        </div>
                    </div>
                `;
            }

            // === 2. DETECCIÓN DE INTENCIÓN AVANZADA ===
            let intent = { occasion: null, priceLevel: null, cuisine: null, cuisineLabel: null };

            // Detectar ocasión/contexto
            if (/romanti|cita|pareja|aniversario|especial|intim|amor/.test(q)) { intent.occasion = 'romántico'; intent.priceLevel = 3; }
            if (/amigo|cuadrilla|grupo|quedada|colegas|plan|cumple|fiesta/.test(q)) { intent.occasion = 'amigos'; }
            if (/familia|niño|hijo|padre|abuelo|todos/.test(q)) { intent.occasion = 'familia'; }
            if (/solo|rapido|trabajo|prisa|llevar|delivery/.test(q)) { intent.occasion = 'rápido'; intent.priceLevel = 1; }

            // Detectar precio
            if (/barat|economic|tirad|low cost|poco dinero|sin gastar|ahorrar/.test(q)) intent.priceLevel = 1;
            if (/caro|lujo|premium|exclusiv|mejor|top|elegante|fino/.test(q)) intent.priceLevel = 3;

            // === 3. DETECCIÓN DE COCINA EXPANDIDA ===
            const cuisinePatterns = {
                'Japonesa': /japo|sushi|ramen|maki|tempura|japonesa/,
                'China': /chin[ao]|wok|dim.?sum|arroz.?frito|tallarines/,
                'Italiana': /italian|pizza|pasta|lasaña|risotto|carbonara/,
                'Mexicana': /mexic|taco|burrito|enchilada|guacamole|nachos/,
                'Vasca': /vasc[ao]|pintx|sidr|bacalao|txuleta/,
                'Argentina': /argentin|asado|parrilla|empanada|bife|carne/,
                'Comida Callejera': /burger|hamburguesa|kebab|doner|durum|perrito|hot.?dog|fast/,
                'Mariscos': /marisc|pescad|gamba|pulpo|paella/,
                'Hindú': /hind[uú]|indi[ao]|curry|tandoori|tikka|naan/,
                'Cafetería': /cafe|brunch|desayun|merienda|croissant/,
                'Vegana': /vegan|vegetarian|sin.?carne|saludable|fit|bio/
            };

            // Asiático especial (combina japonés y chino)
            if (/asiat|oriental|asia/.test(q)) {
                intent.cuisine = ['Japonesa', 'China'];
                intent.cuisineLabel = 'Asiática';
            } else {
                for (const [cuisine, pattern] of Object.entries(cuisinePatterns)) {
                    if (pattern.test(q)) {
                        intent.cuisine = cuisine;
                        intent.cuisineLabel = cuisine;
                        break;
                    }
                }
            }

            // === 4. FILTRAR RESTAURANTES ===
            let candidates = [...list];

            if (intent.cuisine) {
                if (Array.isArray(intent.cuisine)) {
                    candidates = candidates.filter(r => intent.cuisine.includes(r.cuisine));
                } else {
                    candidates = candidates.filter(r => r.cuisine === intent.cuisine);
                }
            }

            if (intent.priceLevel === 1) candidates = candidates.filter(r => r.priceLevel <= 1);
            if (intent.priceLevel === 3) candidates = candidates.filter(r => r.priceLevel >= 2);

            // Ordenar
            if (/mejor|top|recomiend/.test(q)) {
                candidates.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            } else {
                candidates.sort((a, b) => a.distance - b.distance);
            }

            // === 5. CONSTRUIR RESPUESTA ===
            let top3 = candidates.slice(0, 3);

            // Si no hay resultados, relajar filtros
            if (top3.length === 0 && intent.cuisine) {
                const relaxed = list.filter(r =>
                    Array.isArray(intent.cuisine) ? intent.cuisine.includes(r.cuisine) : r.cuisine === intent.cuisine
                ).slice(0, 3);
                if (relaxed.length > 0) top3 = relaxed;
            }

            // Si aún nada, dar los mejores generales
            if (top3.length === 0) {
                top3 = list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 3);
            }

            // Último recurso
            if (top3.length === 0) {
                return `<p class="text-gray-200">Dime qué tipo de comida te apetece (sushi, burger, pizza...) y te recomiendo algo bueno. 👨‍🍳</p>`;
            }

            // Header personalizado según intención
            let header;
            if (intent.occasion === 'romántico') {
                header = `💕 Para tu <b>cita romántica</b>:`;
            } else if (intent.occasion === 'amigos') {
                header = `🎉 Para <b>quedar con amigos</b>:`;
            } else if (intent.occasion === 'familia') {
                header = `👨‍👩‍👧‍👦 <b>Para toda la familia</b>:`;
            } else if (intent.occasion === 'rápido') {
                header = `⚡ <b>Rápido y bueno</b>:`;
            } else if (intent.cuisineLabel) {
                header = `🏆 Lo mejor de <b>${intent.cuisineLabel}</b>:`;
            } else {
                header = `🏆 <b>Mi recomendación</b>:`;
            }

            // Construir tarjetas
            const cardsHtml = top3.map((r, i) => {
                const info = this.classifyVenue(r);
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                const highlight = i === 0 ? 'border-yellow-400' : 'border-purple-500';
                // Para OSM: buscar nombre del restaurante cerca de las coordenadas para mostrar ficha real
                const city = window.App?.location?.city || '';
                const mapsUrl = (r.source === 'osm' && r.lat && r.lon)
                    ? `https://www.google.com/maps/search/${encodeURIComponent(r.name)}/@${r.lat},${r.lon},17z`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' restaurante ' + city)}`;
                return `
                <div class="chat-card glass-light p-3 rounded-2xl mb-3 cursor-pointer hover-lift border-l-4 ${highlight} transition-all duration-300" onclick="window.open('${mapsUrl}','_blank')">
                    <div class="flex justify-between items-start mb-2">
                        <div class="font-bold text-white text-base">${medal} ${r.name}</div>
                        <div class="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                            ${Math.round(r.distance * 1000)}m
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 italic mb-2">${info.ideal} · ${info.vibe}</div>
                    <div class="flex items-center gap-3 text-[11px]">
                        <span class="text-gray-300 flex items-center gap-1">📍 ${r.address}</span>
                        <span class="text-yellow-400 font-bold flex items-center gap-1">★ ${parseFloat(r.rating).toFixed(1)}</span>
                        <span class="text-green-400 font-medium">${'€'.repeat(r.priceLevel || 1)}</span>
                    </div>
                </div>`;
            }).join('');

            // Tip experto
            let tipHtml = '';
            if (intent.cuisineLabel) {
                tipHtml = `<p class="text-xs text-yellow-200/80 mt-2 bg-yellow-500/5 p-2 rounded">💡 ${this.getExpertTip(intent.cuisineLabel)}</p>`;
            }

            return `
                <div class="space-y-2">
                    <p class="text-gray-200">${header}</p>
                    ${cardsHtml}
                    <p class="text-xs text-gray-400">👆 Toca para abrir en Maps</p>
                    ${tipHtml}
                </div>
            `;
        }
    };

    // ===== FAVORITES SERVICE (NEW) =====
    const FavoritesService = {
        STORAGE_KEY: 'gastroai_favs_v2',

        async load() {
            // Priority 1: Supabase
            if (window.supabaseClient) {
                try {
                    const { data, error } = await window.supabaseClient.from('favorites').select('*');
                    if (!error && data) return data.map(f => f.restaurant_data);
                } catch (e) { console.warn('Supabase fetch failed', e); }
            }
            // Priority 2: LocalStorage
            const local = localStorage.getItem(this.STORAGE_KEY);
            return local ? JSON.parse(local) : [];
        },

        async save(list) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            if (window.supabaseClient && window.SUPABASE_URL && !window.SUPABASE_URL.includes('YOUR_SUPABASE')) {
                try {
                    // Sincronización real: Borramos y re-insertamos (o upsert si tienes ID)
                    // Para este MVP, guardamos el array completo de favoritos del usuario
                    // Asumimos una tabla 'favorites' con columnas: id (auth.uid), restaurant_data (jsonb)
                    const { data: userData } = await window.supabaseClient.auth.getUser();
                    const userId = userData?.user?.id || 'anonymous';

                    await window.supabaseClient
                        .from('favorites')
                        .upsert({
                            id: userId,
                            restaurant_data: list,
                            updated_at: new Date()
                        });

                    console.log('✅ Sincronizado con Supabase');
                } catch (e) {
                    console.warn('❌ Error sincronizando con Supabase:', e);
                }
            }
        },

        async toggle(restaurant) {
            let list = await this.load();
            const exists = list.find(r => r.id === restaurant.id);
            if (exists) {
                list = list.filter(r => r.id !== restaurant.id);
            } else {
                list.push(restaurant);
            }
            await this.save(list);
            return !exists; // true si se añadió, false si se quitó
        },

        async isFavorite(id) {
            const list = await this.load();
            return list.some(r => r.id === id);
        }
    };

    const UI = {
        init() { this.grid = document.getElementById('restaurant-grid'); this.msg = document.getElementById('chat-messages'); },
        async paint(data) {
            if (!this.grid) return;
            this.grid.innerHTML = (await Promise.all(data.map(async (r, i) => {
                const isFav = await FavoritesService.isFavorite(r.id);
                return `
            <div class="card-glow card-hover glass-premium rounded-2xl overflow-hidden animate-slide-up group" style="animation-delay:${i * 0.05}s">
                <div class="relative h-56 overflow-hidden">
                    <img src="${r.image}" onerror="this.src='${CONFIG.defaultImage}'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <div class="card-image-overlay"></div>
                    <div class="absolute top-3 right-3 glass-light px-2.5 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                        ${r.distance < 1 ? Math.round(r.distance * 1000) + 'm' : r.distance + 'km'}
                    </div>
                    <div class="absolute bottom-3 left-3 flex gap-1">
                        <span class="badge badge-success text-[10px]">Abierto</span>
                        <span class="badge badge-info text-[10px]">${r.cuisine}</span>
                    </div>
                </div>
                <div class="p-5">
                    <div class="flex justify-between items-start mb-1">
                        <div class="font-bold text-white text-xl leading-tight group-hover:text-purple-300 transition-colors">${r.name}</div>
                        <div class="flex text-yellow-400 text-xs">
                            ${'★'.repeat(Math.round(r.rating))}
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mb-4 line-clamp-1 flex items-center gap-1">
                        <svg class="w-3 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        ${r.address}
                    </p>
                    <div class="flex gap-2">
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}" target="_blank" 
                           class="flex-1 text-center btn-primary py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20">
                           Reservar Mesa
                        </a>
                        <button onclick="window.App.toggleFavorite('${r.id}')" class="p-3 glass-light rounded-xl hover:bg-pink-500/20 ${isFav ? 'text-pink-500 bg-pink-500/10' : 'text-pink-400'} transition-all">
                            <svg class="w-5 h-5" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>`;
            }))).join('');
            this.updateFavoritesCount();
        },

        updateFavoritesCount() {
            FavoritesService.load().then(list => {
                const count = document.getElementById('favorites-count');
                if (count) {
                    count.textContent = list.length;
                    count.classList.toggle('hidden', list.length === 0);
                }
            });
        },
        // Updated Hero to include Weather
        updateHero(city, weather) {
            const heroSub = document.getElementById('hero-subtitle');
            const badge = document.getElementById('city-badge');

            let weatherHtml = '';
            if (weather) {
                weatherHtml = `<span class="ml-2 px-2 py-1 bg-white/20 rounded-lg text-sm font-normal backdrop-blur-sm shadow-sm inline-flex items-center gap-1 animate-pulse-slow" title="Clima actual">
                ${weather.icon} ${weather.temp}°C
            </span>`;
            }

            if (heroSub) heroSub.innerHTML = `Cerca de <span class="gradient-text font-bold">${city}</span>`;
            if (badge) badge.innerHTML = `<span>📍 ${city}</span> ${weatherHtml}`;
        },
        addMsg(txt, isUser) {
            const d = document.createElement('div'); d.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`;
            d.innerHTML = `<div class="px-4 py-2 rounded-xl max-w-[85%] text-sm ${isUser ? 'bg-purple-600' : 'glass-light'}">${txt}</div>`;
            this.msg.appendChild(d); this.msg.scrollTop = this.msg.scrollHeight;
            return d; // Devolver elemento para poder actualizarlo
        }
    };

    window.App = {
        restaurants: [],
        location: null,

        async init() {
            console.log('🚀 GastroAI PRO iniciando...');
            UI.init();

            // Re-bind Chat Toggle logic
            document.getElementById('chat-toggle')?.addEventListener('click', () => {
                const w = document.getElementById('chat-widget');
                w.classList.toggle('hidden');
                if (!w.classList.contains('hidden')) document.getElementById('chat-input')?.focus();
            });
            document.getElementById('chat-close')?.addEventListener('click', () => document.getElementById('chat-widget').classList.add('hidden'));

            document.getElementById('chat-send')?.addEventListener('click', this.sendChat.bind(this));
            document.getElementById('chat-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendChat(); });

            // Button "Ver Todos"
            document.getElementById('show-all-btn')?.addEventListener('click', () => {
                UI.paint(this.restaurants);
                window.scrollTo({ top: document.querySelector('main').offsetTop - 100, behavior: 'smooth' });
            });

            // Favorites Button in Header
            document.getElementById('favorites-btn')?.addEventListener('click', async () => {
                const favs = await FavoritesService.load();
                UI.paint(favs);
                document.getElementById('hero-title').innerHTML = '<span class="gradient-text">Tus</span> Favoritos';
                window.scrollTo({ top: document.querySelector('main').offsetTop - 100, behavior: 'smooth' });
            });

            // Always ensure we have restaurants
            try {
                const loc = await LocationService.initialize();
                this.location = loc;
                console.log('📍 Ubicación:', loc.city);

                // Update UI
                UI.updateHero(loc.city, null);

                // Fetch Weather in background
                WeatherService.getWeather(loc.lat, loc.lng).then(w => {
                    UI.updateHero(loc.city, w);
                }).catch(() => { });

                await this.load(loc);

                // Welcome message in chat
                UI.addMsg(`¡Hola! Soy tu guía local en <b>${loc.city}</b>. Pregúntame por cualquier tipo de cocina: asiática, japonesa, mexicana, italiana... 🍽️`, false);

            } catch (e) {
                console.error('Init error, using fallback:', e);
                // ALWAYS generate fallback restaurants
                const fallbackLoc = { lat: 40.4168, lng: -3.7038, city: 'Tu Ciudad' };
                this.location = fallbackLoc;
                UI.updateHero(fallbackLoc.city, null);
                await this.load(fallbackLoc);
                UI.addMsg('¡Hola! Pregúntame por cualquier tipo de cocina 🍽️', false);
            }
        },

        async load(loc) {
            if (!loc) loc = { lat: 40.4168, lng: -3.7038, city: 'Tu Ciudad' };

            try {
                this.restaurants = await PlacesService.fetchRestaurants(loc.lat, loc.lng);
            } catch (e) {
                console.log('PlacesService failed, generating fallback');
                this.restaurants = DataRepository.generateRestaurants(loc.city, loc.lat, loc.lng, 30);
            }

            // Always ensure we have restaurants
            if (this.restaurants.length === 0) {
                console.log('No restaurants loaded, generating fallback');
                this.restaurants = DataRepository.generateRestaurants(loc.city || 'Tu Ciudad', loc.lat, loc.lng, 30);
            }

            console.log('✅ Restaurantes cargados:', this.restaurants.length);
            UI.paint(this.restaurants);
        },

        async sendChat() {
            const i = document.getElementById('chat-input');
            const t = i.value.trim();
            if (t) {
                UI.addMsg(t, true);
                i.value = '';
                // Mostrar indicador de "escribiendo..."
                UI.addMsg('<span class="animate-pulse">✨ Pensando...</span>', false);
                try {
                    const response = await ChatService.getResponse(t);
                    // Remover el mensaje de "pensando"
                    const msgs = document.getElementById('chat-messages');
                    if (msgs && msgs.lastChild) msgs.removeChild(msgs.lastChild);
                    UI.addMsg(response, false);
                } catch (error) {
                    console.error('Chat error:', error);
                    const msgs = document.getElementById('chat-messages');
                    if (msgs && msgs.lastChild) msgs.removeChild(msgs.lastChild);
                    UI.addMsg('⚠️ Error. Intentando respuesta local...', false);
                }
            }
        },

        async toggleFavorite(id) {
            const r = this.restaurants.find(res => res.id === id);
            if (!r) return;
            await FavoritesService.toggle(r);
            UI.paint(this.restaurants); // Repintar para actualizar estado visual del corazón
        }
    };

    document.addEventListener('DOMContentLoaded', () => window.App.init());

})();

