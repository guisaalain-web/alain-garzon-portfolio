// WanderMind - Professional Itinerary Templates
// Premium travel agent style itineraries

const ITINERARY_TEMPLATES = {
    // Templates by city and style
    cultural: {
        name: 'Cultural & Histórico',
        icon: '🏛️',
        description: 'Museos, monumentos y patrimonio',
        dayStructure: {
            morning: { start: '09:00', end: '13:00', activities: 2 },
            lunch: { start: '13:30', end: '15:00' },
            afternoon: { start: '15:30', end: '19:00', activities: 2 },
            dinner: { start: '20:00', end: '21:30' },
            evening: { start: '21:30', end: '23:00', activities: 1 }
        }
    },
    gastronomic: {
        name: 'Gastronómico',
        icon: '🍽️',
        description: 'Lo mejor de la cocina local y mercados',
        dayStructure: {
            morning: { start: '10:00', end: '12:00', activities: 1 },
            brunch: { start: '12:00', end: '14:00' },
            afternoon: { start: '15:00', end: '18:00', activities: 2 },
            dinner: { start: '20:30', end: '22:30' },
            evening: { start: '22:30', end: '00:00', activities: 1 }
        }
    },
    adventure: {
        name: 'Aventura & Naturaleza',
        icon: '🏔️',
        description: 'Actividades al aire libre y parques',
        dayStructure: {
            morning: { start: '08:00', end: '12:00', activities: 2 },
            lunch: { start: '12:30', end: '14:00' },
            afternoon: { start: '14:30', end: '18:00', activities: 2 },
            dinner: { start: '19:30', end: '21:00' },
            evening: { start: '21:00', end: '22:30', activities: 1 }
        }
    },
    romantic: {
        name: 'Romántico',
        icon: '💑',
        description: 'Para parejas, momentos especiales',
        dayStructure: {
            morning: { start: '10:00', end: '12:30', activities: 1 },
            brunch: { start: '12:30', end: '14:30' },
            afternoon: { start: '15:00', end: '19:00', activities: 2 },
            dinner: { start: '20:30', end: '23:00' },
            evening: { start: '23:00', end: '00:30', activities: 1 }
        }
    },
    budget: {
        name: 'Low Cost',
        icon: '💰',
        description: 'Máximo disfrute, mínimo gasto',
        dayStructure: {
            morning: { start: '09:00', end: '13:00', activities: 3 },
            lunch: { start: '13:00', end: '14:30' },
            afternoon: { start: '14:30', end: '19:00', activities: 3 },
            dinner: { start: '19:30', end: '21:00' },
            evening: { start: '21:00', end: '23:00', activities: 1 }
        }
    }
};

// City-specific places and experiences
const CITY_EXPERIENCES = {
    madrid: {
        morning: [
            { name: 'Museo del Prado', type: 'museum', duration: 120, price: 15, freeDay: 'Lunes-Sábado 18-20h', rating: 4.8, tip: 'Entra por la puerta de Goya, menos cola' },
            { name: 'Retiro + Palacio de Cristal', type: 'park', duration: 90, price: 0, rating: 4.7, tip: 'Alquila una barca por 8€' },
            { name: 'Mercado de San Miguel', type: 'market', duration: 60, price: 0, rating: 4.5, tip: 'Ideal para tapas variadas' },
            { name: 'Palacio Real (exterior)', type: 'monument', duration: 45, price: 0, rating: 4.6, tip: 'Cambio de guardia a las 11:00 miércoles y sábados' }
        ],
        afternoon: [
            { name: 'Templo de Debod', type: 'monument', duration: 45, price: 0, rating: 4.5, tip: 'Atardecer increíble, llega 30min antes' },
            { name: 'Museo Reina Sofía', type: 'museum', duration: 90, price: 12, freeDay: 'Lunes, Miércoles-Sábado 19-21h', rating: 4.6, tip: 'El Guernica está en la planta 2' },
            { name: 'Barrio de Malasaña', type: 'neighborhood', duration: 90, price: 0, rating: 4.4, tip: 'Tiendas vintage en Calle Velarde' },
            { name: 'Gran Vía', type: 'street', duration: 60, price: 0, rating: 4.3, tip: 'El "Broadway madrileño", teatros y tiendas' }
        ],
        evening: [
            { name: 'Rooftop Círculo de Bellas Artes', type: 'viewpoint', duration: 60, price: 5, rating: 4.7, tip: 'Las mejores vistas de Madrid con copa' },
            { name: 'Cena en La Latina', type: 'dining', duration: 90, price: 25, rating: 4.6, tip: 'Cava Baja tiene los mejores restaurantes' },
            { name: 'Tablao Flamenco', type: 'show', duration: 90, price: 35, rating: 4.8, tip: 'Corral de la Morería es el más auténtico' }
        ],
        food: [
            { name: 'Bocadillo de calamares', where: 'Bar La Campana (Plaza Mayor)', price: '4-5€' },
            { name: 'Churros con chocolate', where: 'Chocolatería San Ginés', price: '5€' },
            { name: 'Cocido madrileño', where: 'La Bola', price: '25€' },
            { name: 'Vermut y aceitunas', where: 'Casa Camacho (Malasaña)', price: '3-5€' }
        ],
        transport: {
            fromAirport: 'Metro L8 + L10 (30min, 5€) o Aerobús (35min, 6€)',
            bestPass: 'Abono Turístico Zona A - 8.40€/día',
            tips: 'Sol es el centro de todo. Metro cierra a 01:30'
        }
    },

    barcelona: {
        morning: [
            { name: 'Sagrada Familia', type: 'monument', duration: 90, price: 26, rating: 4.9, tip: 'RESERVA ONLINE obligatoria, mejor a las 9:00' },
            { name: 'Park Güell', type: 'park', duration: 90, price: 10, freeDay: 'Antes de 9:30', rating: 4.7, tip: 'La zona monumental requiere entrada' },
            { name: 'La Boquería', type: 'market', duration: 60, price: 0, rating: 4.5, tip: 'Ve temprano (9-10h), luego es un caos' },
            { name: 'Casa Batlló', type: 'monument', duration: 60, price: 35, rating: 4.8, tip: 'Vale la pena entrar, arquitectura increíble' }
        ],
        afternoon: [
            { name: 'Barrio Gótico', type: 'neighborhood', duration: 90, price: 0, rating: 4.6, tip: 'Piérdete por las callejuelas, descubrirás plazas secretas' },
            { name: 'La Barceloneta & playa', type: 'beach', duration: 120, price: 0, rating: 4.4, tip: 'Chiringuitos con vistas' },
            { name: 'Bunkers del Carmel', type: 'viewpoint', duration: 60, price: 0, rating: 4.8, tip: 'Las mejores vistas de BCN, lleva bebida' },
            { name: 'El Born', type: 'neighborhood', duration: 90, price: 0, rating: 4.5, tip: 'Boutiques, galerías y el Picasso' }
        ],
        evening: [
            { name: 'Atardecer en W Hotel', type: 'viewpoint', duration: 60, price: 15, rating: 4.6, tip: 'Copa con vistas al mar' },
            { name: 'Cena en Gràcia', type: 'dining', duration: 90, price: 20, rating: 4.7, tip: 'Ambiente local, menos turístico' },
            { name: 'Flamenco en El Tablao de Carmen', type: 'show', duration: 90, price: 45, rating: 4.7, tip: 'En Poble Espanyol, incluye entrada' }
        ],
        food: [
            { name: 'Pa amb tomàquet', where: 'Cualquier bar', price: '2-3€' },
            { name: 'Fideuà', where: 'Can Paixano (La Barceloneta)', price: '12€' },
            { name: 'Bombas (patatas)', where: 'La Cova Fumada', price: '3€' },
            { name: 'Vermut', where: 'Bar Mut (Eixample)', price: '4€' }
        ],
        transport: {
            fromAirport: 'Aerobús (35min, 7.75€) o T2 Metro L9 (45min, 5.15€)',
            bestPass: 'T-Casual (10 viajes) 11.35€ o Hola BCN 17.50€/48h',
            tips: 'Muévete en metro, es muy eficiente. La L3 verde pasa por todo'
        }
    },

    paris: {
        morning: [
            { name: 'Torre Eiffel', type: 'monument', duration: 120, price: 29, rating: 4.8, tip: 'Reserva online, escaleras más barato (11€)' },
            { name: 'Museo del Louvre', type: 'museum', duration: 180, price: 17, freeDay: 'Primer domingo del mes', rating: 4.9, tip: 'Entrada por Carrousel du Louvre, sin cola' },
            { name: 'Montmartre + Sacré-Cœur', type: 'neighborhood', duration: 120, price: 0, rating: 4.7, tip: 'Sube caminando, baja en funicular' },
            { name: 'Jardines de Luxemburgo', type: 'park', duration: 60, price: 0, rating: 4.6, tip: 'Trae un croissant y siéntate a ver parisinos' }
        ],
        afternoon: [
            { name: 'Notre-Dame (exterior)', type: 'monument', duration: 30, price: 0, rating: 4.5, tip: 'En reconstrucción pero impresiona' },
            { name: 'Le Marais', type: 'neighborhood', duration: 90, price: 0, rating: 4.7, tip: 'El barrio más cool, falafel en L\'As du Fallafel' },
            { name: 'Museo d\'Orsay', type: 'museum', duration: 120, price: 16, rating: 4.8, tip: 'Impresionistas en la 5ª planta' },
            { name: 'Campos Elíseos', type: 'street', duration: 60, price: 0, rating: 4.3, tip: 'Paseo desde Concorde hasta Arc de Triomphe' }
        ],
        evening: [
            { name: 'Crucero por el Sena', type: 'activity', duration: 60, price: 15, rating: 4.6, tip: 'Bateaux Mouches al atardecer' },
            { name: 'Cena en Saint-Germain', type: 'dining', duration: 90, price: 35, rating: 4.5, tip: 'Bistros auténticos' },
            { name: 'Moulin Rouge', type: 'show', duration: 120, price: 90, rating: 4.4, tip: 'Reserva con semanas de antelación' }
        ],
        food: [
            { name: 'Croissant', where: 'Du Pain et des Idées', price: '2.50€' },
            { name: 'Crêpe', where: 'Breizh Café (Le Marais)', price: '8-12€' },
            { name: 'Falafel', where: 'L\'As du Fallafel', price: '8€' },
            { name: 'Macarons', where: 'Ladurée (Champs-Élysées)', price: '3€/ud' }
        ],
        transport: {
            fromAirport: 'RER B (CDG 35min, 11€) o Roissybus (Orly 60min, 14.50€)',
            bestPass: 'Paris Visite 13.95€/día (zonas 1-3)',
            tips: 'Métro muy extenso. RER para zonas alejadas (Versailles, aeropuertos)'
        }
    }
};

// Professional Itinerary Generator
class ProfessionalItineraryGenerator {
    constructor(cities, days, style, budget, contentGen) {
        this.cities = cities;
        this.days = days;
        this.style = style || 'cultural';
        this.budget = budget || 'medium';
        this.contentGen = contentGen || (window.app ? window.app.contentGen : null);
    }

    async generate() {
        // Fetch smart data for all cities in parallel
        const cityDetailsPromises = this.cities.map(async cityKey => {
            let name = typeof cityKey === 'object' ? cityKey.name : (CITIES_TRANSPORT[cityKey]?.name || cityKey);
            let lat, lng;

            if (typeof cityKey === 'object') {
                lat = cityKey.lat;
                lng = cityKey.lng;
            } else if (CITIES_TRANSPORT[cityKey]) {
                // Hardcoded fallback coords for demo (could be improved with database)
                const coords = {
                    madrid: { lat: 40.41, lng: -3.70 },
                    barcelona: { lat: 41.38, lng: 2.17 },
                    paris: { lat: 48.85, lng: 2.35 },
                    london: { lat: 51.50, lng: -0.12 },
                    rome: { lat: 41.90, lng: 12.49 },
                    berlin: { lat: 52.52, lng: 13.40 },
                    amsterdam: { lat: 52.36, lng: 4.90 },
                    newyork: { lat: 40.71, lng: -74.00 },
                    tokyo: { lat: 35.67, lng: 139.65 }
                }[cityKey] || { lat: 0, lng: 0 };
                lat = coords.lat;
                lng = coords.lng;
            }

            const [weather, wiki] = await Promise.all([
                this.fetchWeather(lat, lng),
                this.fetchWikiSummary(name)
            ]);

            return { key: cityKey, weather, wiki, lat, lng };
        });

        const citiesSmartData = await Promise.all(cityDetailsPromises);

        const itinerary = {
            title: this.generateTitle(),
            cities: this.cities,
            totalDays: this.days,
            style: ITINERARY_TEMPLATES[this.style],
            dailyPlans: [],
            totalEstimatedCost: 0,
            transportLinks: [],
            smartTips: [] // New Smart Advisor section
        };

        // Determine days per city
        const baseDays = Math.floor(this.days / this.cities.length);
        const extraDays = this.days % this.cities.length;

        let dayNumber = 1;

        for (let i = 0; i < this.cities.length; i++) {
            const cityKey = this.cities[i];
            const smartData = citiesSmartData[i];

            // JOIN Logic: Inter-city transport
            if (i > 0) {
                const prevCity = citiesSmartData[i - 1];
                const transportLink = await this.fetchInterCityTransport(prevCity, smartData);

                // Insert a "Travel Segment" into daily plans or as a special header for the first day of new city
                // We'll add it as a special transport note in the first day of the new city
                smartData.arrivalTransport = transportLink;
            }

            // Check if it's a known city or a dynamic one
            let cityData = CITIES_TRANSPORT[cityKey];
            let experiences = CITY_EXPERIENCES[cityKey];

            // If it's a dynamic city (passed as object or unknown key)
            if (!cityData && typeof cityKey === 'object') {
                cityData = {
                    name: cityKey.name,
                    country: cityKey.country,
                    cityObject: cityKey // Store full object for API calls
                };
            } else if (!cityData) {
                cityData = { name: cityKey, country: '' };
            }

            // Using Smart Data for description
            if (smartData.wiki) {
                cityData.description = smartData.wiki;
            }

            // If no curated experiences, generate them dynamically
            if (!experiences && this.contentGen) {
                if (cityData.cityObject) {
                    const prevCity = this.contentGen.cityMgr.getCity();
                    this.contentGen.cityMgr.saveCity(cityData.cityObject);
                    try {
                        const places = await this.contentGen.fetchRealPlaces();
                        const transport = await this.contentGen.fetchRealTransport();
                        experiences = this.mapDynamicToExperiences(places, transport);
                        cityData.transport = { metro: transport.metro[0] || null, bus: transport.bus[0] || null };
                    } catch (e) {
                        experiences = this.generateFallbackExperiences(cityData.name);
                    } finally {
                        this.contentGen.cityMgr.saveCity(prevCity);
                    }
                } else {
                    experiences = this.generateFallbackExperiences(cityData.name);
                }
            } else if (!experiences) {
                experiences = this.generateFallbackExperiences(cityData.name);
            }

            // Add transport link for this city
            if (cityData.transport) {
                itinerary.transportLinks.push({
                    city: cityData.name,
                    transport: cityData.transport
                });
            }

            const daysForThisCity = baseDays + (i < extraDays ? 1 : 0);

            for (let d = 0; d < daysForThisCity; d++) {
                const dayPlan = this.generateDayPlan(dayNumber, cityData, experiences, d);

                // Add Multi-City "Join" Info on first day of city
                if (d === 0 && smartData.arrivalTransport) {
                    dayPlan.arrivalInfo = smartData.arrivalTransport;
                }

                // Add Weather Info
                if (smartData.weather) {
                    dayPlan.weather = smartData.weather[d % smartData.weather.length]; // Cycle if days > forecast
                }

                // Add Wiki snippet to header
                if (d === 0 && smartData.wiki) {
                    dayPlan.cityDescription = smartData.wiki;
                }

                itinerary.dailyPlans.push(dayPlan);
                itinerary.totalEstimatedCost += dayPlan.estimatedCost;
                dayNumber++;
            }
        }

        // Add inter-city costs
        citiesSmartData.forEach(c => {
            if (c.arrivalTransport) itinerary.totalEstimatedCost += c.arrivalTransport.price;
        });

        return itinerary;
    }

    // Smart API: Weather (Open-Meteo)
    async fetchWeather(lat, lng) {
        if (!lat || !lng) return null;
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
            const data = await res.json();
            if (!data.daily) return null;

            return data.daily.time.map((t, i) => ({
                date: t,
                max: data.daily.temperature_2m_max[i],
                min: data.daily.temperature_2m_min[i],
                code: data.daily.weather_code[i],
                icon: this.getWeatherIcon(data.daily.weather_code[i])
            }));
        } catch (e) {
            console.warn('Weather fetch failed', e);
            return null;
        }
    }

    getWeatherIcon(code) {
        if (code === 0) return '☀️'; // Clear
        if (code <= 3) return '⛅'; // Partly cloudy
        if (code <= 48) return '🌫️'; // Fog
        if (code <= 67) return '🌧️'; // Rain
        if (code <= 77) return '❄️'; // Snow
        if (code <= 82) return '🚿'; // Showers
        if (code <= 99) return '⚡'; // Thunderstorm
        return '🌤️';
    }

    // Smart API: Wikipedia
    async fetchWikiSummary(cityName) {
        try {
            const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.extract; // Short summary
        } catch (e) {
            console.warn('Wiki fetch failed', e);
            return null;
        }
    }
    generateDayPlan(dayNumber, cityData, experiences, dayInCity) {
        const template = ITINERARY_TEMPLATES[this.style].dayStructure;

        const dayPlan = {
            day: dayNumber,
            city: cityData.name,
            country: cityData.country,
            date: this.getDateString(dayNumber),
            sections: [],
            estimatedCost: 0
        };

        // Morning
        const morningActivities = this.selectActivities(experiences.morning, template.morning.activities, dayInCity);
        dayPlan.sections.push({
            timeOfDay: 'morning',
            icon: '🌅',
            title: 'MAÑANA',
            timeRange: `${template.morning.start} - ${template.morning.end}`,
            activities: morningActivities,
            transport: this.getTransportBetween(morningActivities, cityData)
        });

        // Lunch
        const lunchOption = experiences.food[dayInCity % experiences.food.length];
        dayPlan.sections.push({
            timeOfDay: 'lunch',
            icon: '🍽️',
            title: 'ALMUERZO',
            timeRange: template.lunch ? `${template.lunch.start} - ${template.lunch.end}` : '13:30 - 15:00',
            recommendation: lunchOption
        });

        // Afternoon
        const afternoonActivities = this.selectActivities(experiences.afternoon, template.afternoon.activities, dayInCity);
        dayPlan.sections.push({
            timeOfDay: 'afternoon',
            icon: '🌆',
            title: 'TARDE',
            timeRange: `${template.afternoon.start} - ${template.afternoon.end}`,
            activities: afternoonActivities,
            transport: this.getTransportBetween(afternoonActivities, cityData)
        });

        // Evening
        const eveningActivities = this.selectActivities(experiences.evening, template.evening.activities, dayInCity);
        dayPlan.sections.push({
            timeOfDay: 'evening',
            icon: '🌙',
            title: 'NOCHE',
            timeRange: `${template.evening.start} - ${template.evening.end}`,
            activities: eveningActivities
        });

        // Calculate estimated cost
        [...morningActivities, ...afternoonActivities, ...eveningActivities].forEach(act => {
            dayPlan.estimatedCost += (typeof act.price === 'number' ? act.price : 15); // Fallback price
        });

        return dayPlan;
    }

    mapDynamicToExperiences(places, transport) {
        // Sort places by rating/category to fill Morning/Afternoon/Evening
        const sorted = {
            morning: [],
            afternoon: [],
            evening: [],
            food: []
        };

        places.forEach(p => {
            const item = {
                name: p.name,
                type: p.category,
                duration: p.duration,
                price: p.price === '€€€' ? 30 : p.price === '€€' ? 15 : 0,
                rating: p.rating,
                tip: p.description,
                url: p.url
            };

            if (p.category === 'food' || p.tags.includes('food')) {
                sorted.food.push({
                    name: p.name,
                    where: 'Centro ciudad', // Fallback location
                    price: p.price,
                    url: p.url
                });
            } else if (p.category === 'nightlife' || p.tags.includes('evening')) {
                sorted.evening.push(item);
            } else if (p.category === 'museum' || p.category === 'monument' || p.category === 'culture') {
                if (sorted.morning.length < 2) sorted.morning.push(item);
                else sorted.afternoon.push(item);
            } else {
                // Nature, parks, etc
                if (sorted.afternoon.length < 2) sorted.afternoon.push(item);
                else sorted.morning.push(item);
            }
        });

        // Fill gaps if not enough places
        while (sorted.morning.length < 3) sorted.morning.push(this.getGenericActivity('morning'));
        while (sorted.afternoon.length < 3) sorted.afternoon.push(this.getGenericActivity('afternoon'));
        while (sorted.evening.length < 2) sorted.evening.push(this.getGenericActivity('evening'));
        while (sorted.food.length < 3) sorted.food.push({ name: 'Restaurante Local', where: 'Centro', price: '15-25€' });

        return sorted;
    }

    getGenericActivity(time) {
        return {
            name: `Exploración de ${time === 'morning' ? 'Mañana' : time === 'afternoon' ? 'Tarde' : 'Noche'}`,
            type: 'walk',
            duration: 60,
            price: 0,
            rating: 4.5,
            tip: 'Paseo libre por la zona'
        };
    }

    generateFallbackExperiences(cityName) {
        return {
            morning: [
                { name: `Centro Histórico de ${cityName}`, type: 'walk', duration: 120, price: 0, rating: 4.5, tip: 'Tour a pie' },
                { name: `Museo Principal`, type: 'museum', duration: 90, price: 15, rating: 4.4, tip: 'Arte local' }
            ],
            afternoon: [
                { name: `Parque Central`, type: 'park', duration: 60, price: 0, rating: 4.6, tip: 'Relax' },
                { name: `Zona Comercial`, type: 'shopping', duration: 90, price: 0, rating: 4.3, tip: 'Compras' }
            ],
            evening: [
                { name: `Mirador / Plaza`, type: 'viewpoint', duration: 60, price: 0, rating: 4.5, tip: 'Vistas nocturnas' }
            ],
            food: [
                { name: 'Plato Típico', where: 'Restaurante Centro', price: '20€' },
                { name: 'Mercado Local', where: 'Mercado', price: '10€' }
            ]
        };
    }

    selectActivities(pool, count, offset) {
        const selected = [];
        if (!pool || pool.length === 0) return [this.getGenericActivity('day')];

        for (let i = 0; i < count; i++) {
            selected.push(pool[(i + offset) % pool.length]);
        }
        return selected;
    }

    getTransportBetween(activities, cityData) {
        if (activities.length < 2) return null;
        if (!cityData.transport || !cityData.transport.metro) return null;

        const metro = cityData.transport.metro;
        return {
            type: 'metro',
            name: metro.name || 'Metro',
            url: metro.url || '#',
            estimatedTime: '15-20 min',
            price: metro.ticketPrice || '2€'
        };
    }

    generateTitle() {
        if (this.cities.length === 1) {
            const name = typeof this.cities[0] === 'object' ? this.cities[0].name : (CITIES_TRANSPORT[this.cities[0]]?.name || this.cities[0]);
            return `${this.days} días en ${name}`;
        }
        const names = this.cities.map(c => typeof c === 'object' ? c.name : (CITIES_TRANSPORT[c]?.name || c));
        return `Tour ${names.join(' → ')} (${this.days} días)`;
    }

    getDateString(dayNumber) {
        const date = new Date();
        date.setDate(date.getDate() + dayNumber - 1);
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    }
}

// Export
window.ITINERARY_TEMPLATES = ITINERARY_TEMPLATES;
window.CITY_EXPERIENCES = CITY_EXPERIENCES;
window.ProfessionalItineraryGenerator = ProfessionalItineraryGenerator;
