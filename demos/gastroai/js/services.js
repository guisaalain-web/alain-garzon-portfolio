// GastroAI PRO - Services Module
// Handles Geolocation, City Detection, and Restaurant Data

// ===== CONFIGURATION =====
// ╔══════════════════════════════════════════════════════════════════════╗
// ║  🔧 CONFIGURACIÓN DE API - SIGUE ESTOS PASOS:                        ║
// ║                                                                       ║
// ║  1. Ve a https://aistudio.google.com/                                ║
// ║  2. Inicia sesión con tu cuenta de Google                            ║
// ║  3. Click en "Get API Key" (panel izquierdo)                         ║
// ║  4. Click en "Create API Key"                                        ║
// ║  5. Copia la key y pégala abajo en geminiApiKey                      ║
// ║                                                                       ║
// ║  ✅ GRATIS: 1,500 peticiones/día con Gemini                          ║
// ╚══════════════════════════════════════════════════════════════════════╝
const CONFIG = {
    // Set to 'mock' for demo mode, 'foursquare' or 'yelp' if you have API keys
    dataSource: 'mock',

    // API Keys (leave empty for mock mode)
    foursquareKey: '',
    yelpKey: '',

    // AI Chat API Configuration
    // Options: 'openai', 'gemini', 'huggingface', 'none' (uses fallback)
    aiProvider: 'gemini', // ✅ GEMINI = GRATIS (1,500 peticiones/día)

    // OpenAI API Key (de pago - no recomendado)
    openaiApiKey: '',

    // ⭐ Google Gemini API Key - GRATIS!
    // Obtén tu key en: https://aistudio.google.com/ → "Get API Key" → "Create API Key"
    geminiApiKey: 'TU_API_KEY_AQUI', // 👈 PEGA TU API KEY AQUÍ

    // Hugging Face API Key (get one at https://huggingface.co/settings/tokens)
    huggingfaceApiKey: '',

    // Nominatim API (free, no key needed)
    nominatimUrl: 'https://nominatim.openstreetmap.org/reverse',

    // Default location (fallback)
    defaultLocation: { lat: 40.4168, lng: -3.7038, city: 'Madrid' }
};

// ===== LOCATION SERVICE =====
const LocationService = {
    currentLocation: null,
    currentCity: null,

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            const successHandler = (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    isFallback: false
                };
                resolve(this.currentLocation);
            };

            const errorHandler = (error) => {
                console.warn('Geolocation failed or denied:', error.message);
                // Fallback to default but let the app know it's a fallback
                this.currentLocation = {
                    ...CONFIG.defaultLocation,
                    isFallback: true
                };
                resolve(this.currentLocation);
            };

            // Try high accuracy first
            navigator.geolocation.getCurrentPosition(
                successHandler,
                (error) => {
                    // If high accuracy fails, try low accuracy or just fail to handler
                    navigator.geolocation.getCurrentPosition(
                        successHandler,
                        errorHandler,
                        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
                    );
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    },

    async getCityName(lat, lng) {
        try {
            // Add a small random delay to simulate network if purely mocking, 
            // but we want real city names if possible.
            const response = await fetch(
                `${CONFIG.nominatimUrl}?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
                { headers: { 'User-Agent': 'GastroAI-PRO/1.0' } }
            );

            if (!response.ok) throw new Error('Nominatim error');

            const data = await response.json();

            this.currentCity = data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.municipality ||
                data.address?.county ||
                CONFIG.defaultLocation.city;

            return this.currentCity;
        } catch (error) {
            console.error('Error fetching city name:', error);
            // If we have coordinates but no city name, try to "guess" or just say "Tu Ubicación"
            return CONFIG.defaultLocation.city;
        }
    },

    async initialize() {
        const pos = await this.getCurrentPosition();
        // If it's the fallback location (Madrid), use that city name directly to save an API call
        // unless we want to verify connectivity.
        let city = CONFIG.defaultLocation.city;

        if (!pos.isFallback) {
            city = await this.getCityName(pos.lat, pos.lng);
        }

        this.currentCity = city; // Store globally
        return { ...pos, city };
    }
};

// ===== DYNAMIC DATA GENERATOR =====
// Generates relevant restaurants for any city
const DataGenerator = {
    adjectives: ['Royal', 'Golden', 'Tasty', 'Grand', 'Little', 'Urban', 'Spicy', 'Green', 'Sweet', 'Elite', 'Casa', 'Rincón', 'Sabor'],
    suffixes: ['Bistro', 'Kitchen', 'Place', 'Spot', 'Corner', 'Garden', 'Lounge', 'House', 'Bar', 'Grill', 'Fusion'],

    // Unsplash collections or keywords
    images: {
        'italiana': 'pizza,pasta,italian restaurant',
        'japonesa': 'sushi,ramen,japanese restaurant',
        'mexicana': 'tacos,mexican food,guacamole',
        'vegana': 'salad,vegan food,healthy bowl',
        'comida callejera': 'burger,street food,food truck',
        'mariscos': 'seafood,fish dish,paella',
        'hindú': 'curry,indian food,naan',
        'vasca': 'pintxos,tapas,gourmet food',
        'china': 'dumplings,peking duck,chinese food,dim sum',
        'argentina': 'steak,asado,parrilla,bbq',
        'americana': 'burger,diner,hot dog,fries',
        'cafetería': 'coffee,brunch,croissant,cake',
        'buffet': 'buffet,food variety,all you can eat',
        'default': 'restaurant,dining,food'
    },

    generate(city, lat, lng, count = 60) { // Increased count to 60 to ensure all 13 taxonomies appear
        const restaurants = [];
        // Expanded Cuisines list in full Spanish
        const cuisines = [
            'Italiana', 'Japonesa', 'Mexicana', 'Vegana', 'Comida Callejera',
            'Mariscos', 'Hindú', 'Vasca', 'China',
            'Argentina', 'Americana', 'Cafetería', 'Buffet'
        ];

        const tagsMap = {
            'Italiana': ['Pasta', 'Romántico', 'Casual'],
            'Japonesa': ['Sushi', 'Ramen', 'Gourmet'],
            'Mexicana': ['Tacos', 'Cantina', 'Picante'],
            'Vegana': ['Saludable', 'Bio', 'Fit'],
            'Comida Callejera': ['Hamburguesas', 'Rápida', 'Económica'],
            'Mariscos': ['Fresco', 'Premium', 'Terraza'],
            'Hindú': ['Curry', 'Especiado', 'Tradicional'],
            'Vasca': ['Pintxos', 'Taberna', 'Bar'],
            'China': ['Wok', 'Dim Sum', 'Familiar'],
            'Argentina': ['Parrilla', 'Carne', 'Asado'],
            'Americana': ['Diner', 'Hamburguesas', 'Familiar'],
            'Cafetería': ['Brunch', 'Merienda', 'Tranquilo'],
            'Buffet': ['Libre', 'Variedad', 'Familiar']
        };

        for (let i = 0; i < count; i++) {
            const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
            const adj = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
            const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];

            // Generate a name that might reference the city efficiently
            // e.g. "Madrid Bistro" or "Tasty Italian Spot"
            let name;
            if (i % 4 === 0) name = `${adj} ${city}`;
            else if (i % 3 === 0) name = `${city} ${suffix}`;
            else name = `${adj} ${cuisine.split(' ')[0]} ${suffix}`;

            // Random variance in location (approx 0-2km)
            const rLat = lat + (Math.random() - 0.5) * 0.02;
            const rLng = lng + (Math.random() - 0.5) * 0.02;
            const dist = this.calculateDistance(lat, lng, rLat, rLng);

            // Image URL (using Unsplash source for variety)
            const keywords = this.images[cuisine.toLowerCase()] || 'food';
            // Add random sig to prevent caching same image
            const image = `https://source.unsplash.com/400x300/?${keywords}&sig=${i + Date.now()}`;

            restaurants.push({
                id: `loc_${city}_${i}`,
                name: name,
                cuisine: cuisine,
                priceLevel: Math.floor(Math.random() * 4) + 1, // 1-4
                rating: (3.5 + Math.random() * 1.5).toFixed(1), // 3.5 - 5.0
                reviewCount: Math.floor(Math.random() * 500) + 50,
                address: `Calle de ${city}, ${Math.floor(Math.random() * 100)}`,
                distance: parseFloat(dist.toFixed(1)),
                image: image,
                tags: tagsMap[cuisine],
                isOpen: Math.random() > 0.2 // 80% open
            });
        }

        return restaurants.sort((a, b) => b.rating - a.rating);
    },

    // Haversine formula for distance
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};

// ===== PLACES SERVICE =====
const PlacesService = {
    restaurants: [],

    async fetchRestaurants(lat, lng, filters = {}) {
        let city = LocationService.currentCity || 'Ubicación';

        // 1. Try Fetching from Supabase
        if (window.supabaseClient) {
            try {
                // Example query: Fetch all restaurants (you can filter by city if you have that column)
                // We limit to 50 for performance
                let { data, error } = await window.supabaseClient
                    .from('restaurants')
                    .select('*')
                    .limit(50);

                if (!error && data && data.length > 0) {
                    console.log(`✅ Loaded ${data.length} restaurants from Supabase`);
                    this.restaurants = data;
                    return this.filterData(this.restaurants, filters);
                } else if (error) {
                    console.warn('⚠️ Supabase error (using mock):', error.message);
                }
            } catch (err) {
                console.warn('⚠️ Supabase fetch failed:', err);
            }
        }

        // 2. Fallback to Mock Data
        // Check if we need to regenerate data (empty or city mismatch)
        const needsData = this.restaurants.length === 0 ||
            (this.restaurants[0] && !this.restaurants[0].id.includes(city));

        if (needsData) {
            console.log('ℹ️ Using Mock Generator');
            this.restaurants = DataGenerator.generate(city, lat, lng);
        }

        return this.filterData(this.restaurants, filters);
    },

    filterData(allData, filters) {
        let results = [...allData];

        if (filters.cuisine && filters.cuisine !== 'all') {
            results = results.filter(r =>
                r.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase()) ||
                r.tags.some(t => t.toLowerCase().includes(filters.cuisine.toLowerCase()))
            );
        }

        if (filters.priceLevel && filters.priceLevel !== 'all') {
            const level = parseInt(filters.priceLevel);
            results = results.filter(r => r.priceLevel === level);
        }

        if (filters.maxDistance) {
            results = results.filter(r => r.distance <= filters.maxDistance);
        }

        results.sort((a, b) => b.rating - a.rating);
        return results;
    },

    getById(id) {
        return this.restaurants.find(r => r.id === id);
    }
};

// ===== FAVORITES SERVICE (Folders Support) =====
const FavoritesService = {
    STORAGE_KEY: 'gastroai_favorites_v2', // New version for structure change

    // Structure: { 
    //   "General": [ {restaurant}, ... ], 
    //   "Romántico": [ ... ] 
    // }

    getCollections() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            const initial = { "General": [] };
            this.saveCollections(initial);
            return initial;
        }
        return JSON.parse(data);
    },

    saveCollections(collections) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collections));
    },

    // Legacy support/Helper: Get all flat favorites for global check
    getAllFavorites() {
        const collections = this.getCollections();
        let all = [];
        Object.values(collections).forEach(list => {
            all = [...all, ...list];
        });
        return all;
    },

    createCollection(name) {
        const collections = this.getCollections();
        if (!collections[name]) {
            collections[name] = [];
            this.saveCollections(collections);
            return true;
        }
        return false;
    },

    deleteCollection(name) {
        if (name === "General") return false; // Cannot delete default
        const collections = this.getCollections();
        delete collections[name];
        this.saveCollections(collections);
        return true;
    },

    addToCollection(restaurant, collectionName = "General") {
        const collections = this.getCollections();
        if (!collections[collectionName]) collections[collectionName] = [];

        // Check if already in this specific collection
        if (!collections[collectionName].find(r => r.id === restaurant.id)) {
            collections[collectionName].push(restaurant);
            this.saveCollections(collections);
            return true;
        }
        return false;
    },

    removeFromCollection(restaurantId, collectionName) {
        const collections = this.getCollections();
        if (collections[collectionName]) {
            collections[collectionName] = collections[collectionName].filter(r => r.id !== restaurantId);
            this.saveCollections(collections);
            return true;
        }
        return false;
    },

    // Toggle for the "Heart" button (Defaults to "General" folder)
    toggleFavorite(restaurant) {
        // Check if it exists in ANY collection
        const all = this.getAllFavorites();
        const exists = all.find(r => r.id === restaurant.id);

        if (exists) {
            // If exists, remove from ALL collections (simplest UX for single heart toggle)
            const collections = this.getCollections();
            Object.keys(collections).forEach(key => {
                collections[key] = collections[key].filter(r => r.id !== restaurant.id);
            });
            this.saveCollections(collections);
            return { added: false, message: 'Eliminado de favoritos' };
        } else {
            // Add to General
            this.addToCollection(restaurant, "General");
            return { added: true, message: 'Guardado en General' };
        }
    },

    isFavorite(id) {
        const all = this.getAllFavorites();
        return all.some(r => r.id === id);
    }
};

// ===== CHAT SERVICE (Smart & Professional with Real AI) =====
const ChatService = {
    conversationHistory: [], // Mantener historial de conversación

    // Vocabulary Helpers (fallback)
    getVibe(r) {
        const n = r.name.toLowerCase();
        if (r.priceLevel === 1) return "informal, rápido y de buen ambiente";
        if (r.priceLevel === 3) return "elegante, exclusivo y memorable";
        if (n.includes('terraza')) return "abierto, relajado y perfecto para el día";
        if (n.includes('bodega')) return "clásico, acogedor y con solera";
        return "agradable, auténtico y con buena vibra";
    },

    getTip(cuisine) {
        const tips = {
            'Italiana': "Pregunta por la pasta fresca del día o si tienen burrata fuera de carta.",
            'Japonés': "La barra suele ser el mejor sitio para ver el producto fresco y pedir recomendaciones al chef.",
            'Mexicano': "Las salsas caseras son la clave; pide probarlas antes de bañar tu plato.",
            'Street Food': "Acompáñalo de un batido si te atreves, y pide muchas servilletas.",
            'Vasco': "Es ideal pedir 3-4 pintxos variados para probar de todo.",
            'Vegano': "Incluso si no eres vegano, sus postres suelen ser sorprendentes y ligeros.",
            'Hindú': "No te vayas sin probar el pan naan recién hecho.",
            'Mariscos': "El vino blanco de la casa suele maridar perfecto."
        };
        return tips[cuisine] || "Pregunta al camarero por el 'plato estrella' que no sale en las fotos.";
    },

    // Formatear restaurantes para el contexto de la IA
    formatRestaurantsForContext(restaurants) {
        if (!restaurants || restaurants.length === 0) return "No hay restaurantes disponibles en este momento.";

        return restaurants.slice(0, 10).map(r => {
            const priceSymbols = '€'.repeat(r.priceLevel);
            return `- ${r.name} (${r.cuisine}): ${r.rating}⭐ | ${priceSymbols} | ${r.distance.toFixed(1)}km | ${r.address} | Tags: ${r.tags.join(', ')}`;
        }).join('\n');
    },

    // Llamada a OpenAI API
    async callOpenAI(message, restaurants, city) {
        if (!CONFIG.openaiApiKey) {
            throw new Error('OpenAI API key no configurada');
        }

        const restaurantsContext = this.formatRestaurantsForContext(restaurants);

        const systemPrompt = `Eres un guía gastronómico LOCAL experto, directo y resolutivo.
Tu misión es responder SIEMPRE lo que el usuario pide, sin excusas.
No puedes negarte ni responder "no sé".

🎯 TU OBJETIVO ÚNICO: Que el usuario diga "wow, justo lo que necesitaba" y acabe reservando o yendo al sitio.

=== RESTAURANTES DISPONIBLES EN ${city || 'TU ZONA'} ===
${restaurantsContext}

=== REGLAS DE CONDUCTA ===
✔ RESPONDE SIEMPRE con una recomendación concreta del listado.
✔ Si faltan datos (ubicación, presupuesto), asume valores razonables y pregunta DESPUÉS.
✔ Si el usuario pide algo imposible, dale la versión más cercana útil.
✔ Si la pregunta es ambigua, ofrece 2–3 interpretaciones con recomendaciones.
✔ Nunca uses "no puedo", "no sé", "soy un modelo" o "no tengo acceso".
✔ Nunca digas "depende" sin dar al menos 1 opción clara.
✔ Eres proactivo: ofrece horarios, tips para reservar, alternativas.
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

=== REGLA DE ORO ===
🔥 Si no tienes restaurantes disponibles, NO digas "no tengo datos".
Responde con CONOCIMIENTO EXPERTO sobre ese tipo de cocina y cierra con:
"Dame tu ubicación y te encuentro uno concreto."

IMPORTANTE: Prioriza restaurantes de la lista. Si mencionas uno, usa su nombre EXACTO.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory.slice(-6), // Últimas 6 interacciones para contexto
            { role: 'user', content: message }
        ];

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error en la API de OpenAI');
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // Guardar en historial
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );

            // Mantener historial limitado
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return aiResponse;
        } catch (error) {
            console.error('Error llamando a OpenAI:', error);
            throw error;
        }
    },

    // Llamada a Google Gemini API (GRATIS - 1,500 peticiones/día)
    async callGemini(message, restaurants, city) {
        if (!CONFIG.geminiApiKey || CONFIG.geminiApiKey === 'TU_API_KEY_AQUI') {
            throw new Error('⚠️ Gemini API key no configurada. Abre js/services.js y sigue las instrucciones.');
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

        try {
            // Usando gemini-1.5-flash: más rápido y gratis
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
        } catch (error) {
            console.error('Error llamando a Gemini:', error);
            throw error;
        }
    },

    // Método principal que decide qué API usar
    async getResponse(message) {
        const restaurants = window.App?.restaurants || [];
        const city = window.App?.city || 'tu ciudad';

        // Si no hay API configurada, usar fallback
        if (CONFIG.aiProvider === 'none' ||
            (CONFIG.aiProvider === 'openai' && !CONFIG.openaiApiKey) ||
            (CONFIG.aiProvider === 'gemini' && !CONFIG.geminiApiKey)) {
            console.warn('⚠️ No hay API de IA configurada, usando sistema de respuestas básico');
            return this.processQuery(message, restaurants);
        }

        try {
            let response;

            if (CONFIG.aiProvider === 'openai') {
                response = await this.callOpenAI(message, restaurants, city);
            } else if (CONFIG.aiProvider === 'gemini') {
                response = await this.callGemini(message, restaurants, city);
            } else {
                // Fallback
                response = this.processQuery(message, restaurants);
            }

            // Si la respuesta menciona restaurantes, intentar agregar tarjetas visuales
            return this.enhanceResponseWithCards(response, restaurants);

        } catch (error) {
            console.error('Error obteniendo respuesta de IA:', error);
            // Fallback al sistema anterior si falla la API
            return `⚠️ Lo siento, hubo un problema con el servicio de IA. ${this.processQuery(message, restaurants)}`;
        }
    },

    // Mejorar respuesta de IA con tarjetas visuales si menciona restaurantes
    enhanceResponseWithCards(response, restaurants) {
        if (!restaurants || restaurants.length === 0) return response;

        // Buscar nombres de restaurantes mencionados en la respuesta
        const mentionedRestaurants = [];
        restaurants.forEach(r => {
            if (response.includes(r.name)) {
                mentionedRestaurants.push(r);
            }
        });

        // Si se mencionaron restaurantes, agregar tarjetas
        if (mentionedRestaurants.length > 0) {
            const mkCard = (r) => `
                <div class="chat-card mt-2 mb-2 p-2 bg-white/10 rounded-lg flex gap-3 items-center cursor-pointer hover:bg-white/20 transition border-l-2 border-purple-500">
                   <img src="${r.image}" class="w-12 h-12 rounded object-cover min-w-[3rem]">
                   <div>
                     <div class="font-bold text-sm text-white">${r.name}</div>
                     <div class="text-xs opacity-90 text-yellow-300">★ ${r.rating} · ${r.cuisine}</div>
                   </div>
                </div>`;

            let cardsHtml = '<div class="mt-3 space-y-2">';
            mentionedRestaurants.slice(0, 3).forEach(r => {
                cardsHtml += mkCard(r);
            });
            cardsHtml += '</div>';

            return response + cardsHtml;
        }

        return response;
    },

    // Sistema de fallback "Pseudo-IA" (Simula razonamiento experto)
    // Sistema de fallback "Pseudo-IA" (Simula razonamiento experto)
    processQuery(query, restaurants) {
        const q = query.toLowerCase();

        // === 1. SMART INTENT DETECTION ===
        const QUERY_KEYWORDS = {
            'kebab': 'Comida Callejera',
            'turco': 'Comida Callejera',
            'chino': 'China',
            'china': 'China',
            'wok': 'China',
            'pizza': 'Italiana',
            'pasta': 'Italiana',
            'sushi': 'Japonesa',
            'japo': 'Japonesa',
            'japonesa': 'Japonesa',
            'fideo': 'China',
            'ramen': 'Japonesa',
            'tacos': 'Mexicana',
            'taco': 'Mexicana',
            'mexicana': 'Mexicana',
            'burger': 'Comida Callejera',
            'hamburguesa': 'Comida Callejera',
            'brunch': 'Cafetería',
            'cafe': 'Cafetería',
            'café': 'Cafetería',
            'cafeteria': 'Cafetería',
            'parrilla': 'Argentina',
            'asador': 'Argentina',
            'argentina': 'Argentina',
            'vasca': 'Vasca',
            'vasco': 'Vasca',
            'pintxos': 'Vasca',
            'hindu': 'Hindú',
            'hindú': 'Hindú',
            'indio': 'Hindú',
            'curry': 'Hindú',
            'tikka': 'Hindú',
            'buffet': 'Buffet',
            'libre': 'Buffet',
            'vegana': 'Vegana',
            'vegano': 'Vegana',
            'vegetariano': 'Vegana',
            'mariscos': 'Mariscos',
            'pescado': 'Mariscos',
            'americana': 'Americana',
            'diner': 'Americana'
        };

        let detectedCuisine = null;
        for (let key in QUERY_KEYWORDS) {
            if (q.includes(key)) {
                detectedCuisine = QUERY_KEYWORDS[key];
                break;
            }
        }

        // DETECT CITY CHANGE (Global Mode)
        const cityMatch = q.match(/(?:en|in)\s+([a-zA-ZáéíóúñÁÉÍÓÚÑ]+)(?:\s|$)/i);
        let queryCity = cityMatch ? cityMatch[1].trim() : null;
        let effectiveCity = queryCity || (window.App && window.App.city) || 'tu ciudad';
        let candidates = [...restaurants];

        if (queryCity) {
            candidates = DataGenerator.generate(queryCity, 40.4168, -3.7038);
            effectiveCity = queryCity;
        }

        // === 2. DIRECT ROUTING LOGIC ===
        if (detectedCuisine) {
            candidates = candidates.filter(r => r.cuisine === detectedCuisine);

            // Distance warning if no city
            let prefix = "";
            if (!queryCity && !window.App?.location) {
                prefix = `⚠️ <b>Aviso:</b> No sé dónde estás (mostrando <b>${detectedCuisine}</b> genérico).<br><br>`;
            }

            if (candidates.length > 0) {
                // Return TOP 3 matches directly
                candidates.sort((a, b) => b.rating - a.rating);
                const main = candidates[0];
                const others = candidates.slice(1, 3).map(r => `• <b>${r.name}</b> (${r.rating}★)`).join('<br>');
                const tip = this.getTip(detectedCuisine) || 'Pregunta por el plato estrella de la casa.';

                return `${prefix}<b>🏆 ${main.name}</b> (${main.rating}★)<br>
                        📍 ${main.address}<br>
                        💡 <i>${tip}</i><br>
                        <br>
                        <b>Otras opciones de ${detectedCuisine}:</b><br>${others}`;
            } else {
                // REGLA DE ORO: Nunca decir "no tengo", dar conocimiento experto
                const knowledge = this.genericKnowledge[detectedCuisine];
                if (knowledge) {
                    return `No tengo ${detectedCuisine} registrado en ${effectiveCity} ahora, pero te cuento qué buscar:<br><br>
                            <b>Estilos típicos:</b> ${knowledge.styles.join(', ')}<br>
                            <b>💡 Tip de experto:</b> ${knowledge.tip}<br><br>
                            👉 <i>Dame tu ubicación exacta y te localizo uno bueno cerca.</i>`;
                }
                return `No tengo ${detectedCuisine} en mi lista ahora, pero aquí va mi consejo: busca sitios con buenas reseñas recientes y evita los que tienen menú turístico en la puerta.<br><br>👉 <i>Dame tu ubicación y te busco opciones concretas.</i>`;
            }
        }

        // === 3. FALLBACK LOGIC (For abstract intents like "cheap", "fancy") ===
        const intents = {
            cheap: q.match(/(barat|econom|buen precio|low cost)/),
            fancy: q.match(/(roman|lujo|elegan|cita|aniversario|caro)/),
            group: q.match(/(grupo|amigos|fiesta|cumple)/),
            quality: q.match(/(mejor|top|calidad|increib|buenis)/)
        };

        // Cuisine Map for fallback detection
        const cuisineMap = {
            // Estilos / Tipos Globales
            'Comida Callejera': ['fast food', 'rapida', 'kebab', 'hamburg', 'burger', 'food truck'],
            'Cafetería': ['cafe', 'coffee', 'brunch', 'desayuno', 'merienda'],
            'Buffet': ['buffet', 'libre', 'todo lo que puedas', 'all you can'],
            // Cocinas del Mundo
            'Japonesa': ['sushi', 'japon', 'ramen', 'izakaya', 'omakase'],
            'China': ['chino', 'china', 'wok', 'dim sum', 'pato'],
            'Italiana': ['ital', 'pizza', 'pasta', 'trattoria', 'milanesa'],
            'Mexicana': ['mex', 'taco', 'cantina', 'burrito', 'tex-mex'],
            'Argentina': ['argentin', 'asador', 'parrilla', 'carne', 'steak', 'brasa'],
            'Vegana': ['vegan', 'veget', 'sano', 'fit', 'healthy'],
            'Mariscos': ['marisc', 'pescado', 'paella', 'arroz'],
            'Vasca': ['vasco', 'pintxo', 'tapa', 'norte', 'sidreria'],
            'Hindú': ['hindu', 'curry', 'tandoori', 'tikka', 'india', 'indio'],
            'Americana': ['americana', 'diner', 'hot dog']
        };

        let targetCuisine = null;
        for (const [key, terms] of Object.entries(cuisineMap)) {
            if (terms.some(term => q.includes(term))) {
                targetCuisine = key;
                candidates = candidates.filter(r => r.cuisine === key);
                break;
            }
        }

        // Distance warning
        let distanceWarning = "";
        if (!queryCity && targetCuisine && !window.App?.location) {
            distanceWarning = `<div class="bg-yellow-500/10 p-2 mb-3 rounded border border-yellow-500/20 text-xs text-yellow-200">
                ⚠️ <b>Aviso:</b> No sé dónde estás, así que estos sitios podrían estar lejos. (Mostrando ejemplos de <b>${targetCuisine}</b>)
             </div>`;
        }

        // Apply intent filters
        if (intents.cheap) candidates = candidates.filter(r => r.priceLevel === 1);
        if (intents.fancy) candidates = candidates.filter(r => r.priceLevel >= 3);

        // Sort by Rating
        candidates.sort((a, b) => b.rating - a.rating);

        const main = candidates[0];

        // Generate expert response
        if (!main) {
            // REGLA DE ORO: Siempre dar algo útil
            const best = restaurants[0];
            if (best) {
                return `No tengo algo exactamente así, pero mi recomendación segura es <b>${best.name}</b> (${best.cuisine}, ${best.rating}★).<br><br>
                        Es de lo mejor valorado por aquí. ¿Quieres que busque algo más específico?`;
            }
            return `Cuéntame más sobre qué buscas (tipo de cocina, ambiente, presupuesto) y te doy opciones concretas. 👨‍🍳`;
        }

        const reason = this.getExpertReason(main, intents);
        const htmlCard = `
            <div class="chat-card mt-3 mb-1 p-3 bg-white/5 rounded-xl border-l-4 border-pink-500 shadow-sm hover:bg-white/10 transition-all cursor-pointer group">
               <div class="flex gap-4 items-center">
                   <img src="${main.image}" class="w-16 h-16 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform">
                   <div>
                     <div class="font-bold text-base text-white leading-tight">${main.name}</div>
                     <div class="text-xs text-pink-300 font-medium mt-1">★ ${main.rating} · ${main.cuisine} · ${'€'.repeat(main.priceLevel)}</div>
                     <div class="text-[10px] text-gray-400 mt-0.5 opacity-80">📍 ${effectiveCity}</div>
                   </div>
               </div>
            </div>`;

        return `${distanceWarning}${main.name}.<br><b>Por qué:</b> ${reason}<br>${htmlCard}`;
    },

    getExpertReason(r, intents) {
        if (r.tags.includes('Romántico') || intents.fancy) return `Ambiente íntimo y servicio de primera. Ideal citas.`;

        switch (r.cuisine) {
            case 'Argentina': return `Brasas auténticas y cortes de carne premium.`;
            case 'Cafetería': return `El café es de especialidad y el brunch muy completo.`;
            case 'Buffet': return `Rotación constante de platos y mucha variedad.`;
            case 'Japonesa': return `Corte de pescado excelente (sushi bar real).`;
            case 'China': return `Domina el wok y los dim sum caseros.`;
            case 'Italiana': return `Masa madre en las pizzas y pasta al dente.`;
            case 'Mexicana': return `Salsas caseras y tortillas de maíz de verdad.`;
            case 'Comida Callejera': return `Jugoso, rápido y con ingredientes frescos.`;
            case 'Vasca': return `Barra de pintxos espectacular y buen producto.`;
            case 'Hindú': return `Especias bien equilibradas y horno tandoor.`;
            case 'Vegana': return `Ingredientes frescos y opciones creativas.`;
            case 'Mariscos': return `Producto del día y cocina de mercado.`;
            case 'Americana': return `Porciones generosas y ambiente casual.`;
            default: return `Muy consistente y recomendado por locales.`;
        }
    },

    genericKnowledge: {
        'Japonesa': {
            styles: ['Sushi Bar con Nigiris frescos', 'Ramen House (caldos densos)', 'Izakaya (tapas japonesas)'],
            tip: 'Busca sitios donde el arroz esté a temperatura cuerpo, no frío de nevera.'
        },
        'China': {
            styles: ['Buffet Libre (variedad)', 'Cantonés (dim sum y vapor)', 'Hot Pot (cocina tú mismo)'],
            tip: 'Si ves clientes en las mesas comiendo patas de pollo, es un chino auténtico.'
        },
        'Italiana': {
            styles: ['Trattoria casera', 'Pizzería Napolitana (borde grueso)', 'Pasta Bar artesanal'],
            tip: 'La carbonara de verdad NO lleva nata. Huye si ves "salsa blanca".'
        },
        'Mexicana': {
            styles: ['Taquería callejera', 'Cantina tradicional', 'Tex-Mex (fusión USA)'],
            tip: 'Un buen taco lleva doble tortilla de maíz, no de trigo.'
        },
        'Argentina': {
            styles: ['Parrilla Clásica', 'Asador de Tira', 'Empanadas & Vino'],
            tip: 'Pide la carne "al punto" si quieres disfrutar el jugo real.'
        },
        'Comida Callejera': {
            styles: ['Kebab (Doner/Durum)', 'Smash Burger', 'Food Truck'],
            tip: 'En el kebab, mira que te corten la carne al momento, no que la saquen de un tupper.'
        },
        'Hindú': {
            styles: ['Curry House', 'Tandoori Grill', 'Thali (menú degustación)'],
            tip: 'El picante indio es serio. Pide "mild" si no eres experto.'
        },
        'Buffet': {
            styles: ['Wok Asiático', 'Rodizio Brasileño', 'Buffet de Hotel'],
            tip: 'Ve temprano (13:00 o 20:00) para pillar la comida recién sacada.'
        },
        'Cafetería': {
            styles: ['Specialty Coffee', 'Brunch Spot', 'Bakery Artesanal'],
            tip: 'Si no oyes el molinillo de café sonar, sospecha.'
        },
        'Vasca': {
            styles: ['Bar de Pintxos', 'Sidrería', 'Taberna Vasca'],
            tip: 'Los pintxos fríos deben estar cubiertos, los calientes se piden.'
        },
        'Vegana': {
            styles: ['Healthy Café', 'Raw Kitchen', 'Bio Bistro'],
            tip: 'Pregunta por los ingredientes de temporada, suelen variar el menú.'
        },
        'Mariscos': {
            styles: ['Marisquería clásica', 'Chiringuito', 'Arrocería'],
            tip: 'Si huele a mar está fresco; si huele a pescado, desconfía.'
        },
        'Americana': {
            styles: ['Diner clásico', 'Steakhouse', 'BBQ Smokehouse'],
            tip: 'Las porciones son enormes, considera compartir.'
        }
    }

};

export { LocationService, PlacesService, FavoritesService, ChatService, CONFIG };
