// WanderMind Multi-Tour Manager
// Handles multi-city selection and professional itinerary generation

(function () {
    'use strict';

    // Multi-City Tour Manager
    class MultiTourManager {
        constructor() {
            this.selectedCities = [];
            this.maxCities = 5;
            this.init();
        }

        init() {
            this.setupQuickCityButtons();
            this.setupCitySearch();
            this.setupGenerateButton();
            console.log('MultiTourManager initialized');
        }

        setupQuickCityButtons() {
            document.querySelectorAll('.quick-city-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cityKey = btn.dataset.city;
                    if (this.selectedCities.includes(cityKey)) {
                        this.removeCity(cityKey);
                        btn.classList.remove('selected');
                    } else {
                        this.addCity(cityKey);
                        btn.classList.add('selected');
                    }
                });
            });
        }

        setupCitySearch() {
            const searchInput = document.getElementById('city-search');
            const resultsContainer = document.getElementById('city-search-results');
            let searchTimeout = null;

            if (!searchInput) return;

            const performSearch = async (query) => {
                if (query.length < 2) {
                    resultsContainer.innerHTML = '';
                    resultsContainer.style.display = 'none';
                    return;
                }

                // Use global CityManager if available
                if (window.app && window.app.cityMgr) {
                    resultsContainer.innerHTML = '<div class="city-search-loading">Buscando...</div>';
                    resultsContainer.style.display = 'block';

                    const cities = await window.app.cityMgr.searchCities(query);

                    // Also include local hardcoded matches for "Expert" badge
                    const localMatches = Object.keys(CITIES_TRANSPORT).filter(key => {
                        const city = CITIES_TRANSPORT[key];
                        return city.name.toLowerCase().includes(query.toLowerCase());
                    }).map(key => ({ key, ...CITIES_TRANSPORT[key], isExpert: true }));

                    if (cities.length > 0 || localMatches.length > 0) {
                        // Merge lists (avoiding duplicates if possible, prioritizing expert)
                        const combined = [];
                        const seenNames = new Set();

                        // Add expert cities first
                        localMatches.forEach(c => {
                            combined.push(c);
                            seenNames.add(c.name.toLowerCase());
                        });

                        // Add dynamic cities if not already present
                        cities.forEach(c => {
                            if (!seenNames.has(c.name.toLowerCase())) {
                                combined.push(c);
                            }
                        });

                        resultsContainer.innerHTML = combined.map((city, index) => {
                            const isExpert = city.isExpert;
                            // Serialize data for click handler
                            const dataStr = encodeURIComponent(JSON.stringify(isExpert ? city.key : city));
                            const isSelected = this.isCitySelected(isExpert ? city.key : city);

                            return `
                                <div class="city-result ${isSelected ? 'selected' : ''}" data-city-obj="${dataStr}" data-is-expert="${isExpert}">
                                    <span class="city-name">${city.name}</span>
                                    <span class="city-country">${city.country} ${isExpert ? '⭐' : ''}</span>
                                    ${isSelected ? '<span class="check">✓</span>' : ''}
                                </div>
                            `;
                        }).join('');

                        resultsContainer.style.display = 'block';

                        // Add click handlers
                        resultsContainer.querySelectorAll('.city-result').forEach(result => {
                            result.addEventListener('click', () => {
                                const isExpert = result.dataset.isExpert === 'true';
                                const data = JSON.parse(decodeURIComponent(result.dataset.cityObj));

                                if (this.isCitySelected(data)) {
                                    this.removeCity(data);
                                } else {
                                    this.addCity(data);
                                }
                                searchInput.value = '';
                                resultsContainer.style.display = 'none';
                            });
                        });
                    } else {
                        resultsContainer.innerHTML = '<div class="no-results">No se encontraron ciudades</div>';
                    }
                }
            };

            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                searchTimeout = setTimeout(() => performSearch(query), 300);
            });

            // Close results on click outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.city-search-container')) {
                    resultsContainer.style.display = 'none';
                }
            });
        }

        setupGenerateButton() {
            const generateBtn = document.getElementById('generate-tour');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.generateItinerary());
            }
        }

        addCity(cityData) {
            if (this.selectedCities.length >= this.maxCities) {
                this.showToast('Máximo ' + this.maxCities + ' ciudades permitidas', 'warning');
                return;
            }

            if (!this.isCitySelected(cityData)) {
                this.selectedCities.push(cityData);
                this.updateCityChips();
                this.updateQuickButtons();
                this.showTourConfig();
            }
        }

        removeCity(cityData) {
            const nameToRemove = typeof cityData === 'object' ? cityData.name : (CITIES_TRANSPORT[cityData]?.name || cityData);

            this.selectedCities = this.selectedCities.filter(c => {
                const cName = typeof c === 'object' ? c.name : (CITIES_TRANSPORT[c]?.name || c);
                return cName !== nameToRemove;
            });

            this.updateCityChips();
            this.updateQuickButtons();

            if (this.selectedCities.length === 0) {
                this.hideTourConfig();
            }
        }

        isCitySelected(cityData) {
            const nameToCheck = typeof cityData === 'object' ? cityData.name : (CITIES_TRANSPORT[cityData]?.name || cityData);
            return this.selectedCities.some(c => {
                const cName = typeof c === 'object' ? c.name : (CITIES_TRANSPORT[c]?.name || c);
                return cName === nameToCheck;
            });
        }

        updateCityChips() {
            const container = document.getElementById('cities-chips');
            const hint = document.getElementById('cities-hint');

            if (this.selectedCities.length === 0) {
                container.innerHTML = '';
                hint.style.display = 'block';
                return;
            }

            hint.style.display = 'none';
            container.innerHTML = this.selectedCities.map(city => {
                const isObject = typeof city === 'object';
                const name = isObject ? city.name : CITIES_TRANSPORT[city].name;
                const dataStr = encodeURIComponent(JSON.stringify(city));

                return `
                    <div class="city-chip" data-city-obj="${dataStr}">
                        <span class="chip-name">${name}</span>
                        <button class="chip-remove">×</button>
                    </div>
                `;
            }).join('<span class="chip-arrow">→</span>');

            // Add remove handlers
            container.querySelectorAll('.city-chip').forEach(chip => {
                chip.querySelector('.chip-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const data = JSON.parse(decodeURIComponent(chip.dataset.cityObj));
                    this.removeCity(data);
                });
            });
        }

        updateQuickButtons() {
            document.querySelectorAll('.quick-city-btn').forEach(btn => {
                const cityKey = btn.dataset.city;
                if (this.isCitySelected(cityKey)) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }

        showTourConfig() {
            const config = document.getElementById('tour-config');
            if (config) {
                config.style.display = 'block';
            }
        }

        hideTourConfig() {
            const config = document.getElementById('tour-config');
            if (config) {
                config.style.display = 'none';
            }
        }

        async generateItinerary() {
            if (this.selectedCities.length === 0) {
                this.showToast('Selecciona al menos una ciudad', 'error');
                return;
            }

            const generateBtn = document.getElementById('generate-tour');
            const originalText = generateBtn ? generateBtn.innerHTML : '';
            if (generateBtn) {
                generateBtn.innerHTML = '<span>⏳ Generando...</span>';
                generateBtn.disabled = true;
            }

            try {
                const days = parseInt(document.getElementById('tour-days').value);
                const style = document.getElementById('tour-style').value;

                // Generate using ProfessionalItineraryGenerator
                const generator = new ProfessionalItineraryGenerator(this.selectedCities, days, style);
                const itinerary = await generator.generate();

                // Render itinerary
                this.renderItinerary(itinerary);

                // Scroll to itinerary section
                document.getElementById('itinerary').scrollIntoView({ behavior: 'smooth' });
                this.showToast('¡Itinerario generado con éxito!', 'success');
            } catch (error) {
                console.error('Error generating itinerary:', error);
                this.showToast('Error al generar el itinerario', 'error');
            } finally {
                if (generateBtn) {
                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;
                }
            }
        }

        renderItinerary(itinerary) {
            const emptyState = document.getElementById('itinerary-empty');
            const contentContainer = document.getElementById('itinerary-content');

            emptyState.style.display = 'none';
            contentContainer.style.display = 'block';

            // Generate HTML
            let html = `
                <div class="itinerary-header">
                    <h3 class="itinerary-title">${itinerary.title}</h3>
                    <div class="itinerary-meta">
                        <span class="meta-item">📅 ${itinerary.totalDays} días</span>
                        <span class="meta-item">${itinerary.style.icon} ${itinerary.style.name}</span>
                        <span class="meta-item">💰 ~${Math.round(itinerary.totalEstimatedCost)}€ estimado</span>
                    </div>
                </div>

                <div class="transport-links">
                    <h4>🚇 Enlaces de Transporte Oficial</h4>
                    <div class="transport-grid">
                        ${itinerary.transportLinks.map(t => this.renderTransportLinks(t)).join('')}
                    </div>
                </div>

                <div class="days-container">
                    ${itinerary.dailyPlans.map(day => this.renderDay(day)).join('')}
                </div>
            `;

            contentContainer.innerHTML = html;
        }

        renderTransportLinks(transportInfo) {
            const t = transportInfo.transport;
            let linksHtml = '';

            if (t.metro) {
                linksHtml += `
                    <a href="${t.metro.url}" target="_blank" class="transport-link metro">
                        <span class="transport-icon">🚇</span>
                        <span class="transport-name">${t.metro.name}</span>
                        <span class="transport-price">${t.metro.ticketPrice}</span>
                    </a>
                `;
            }
            if (t.bus) {
                linksHtml += `
                    <a href="${t.bus.url}" target="_blank" class="transport-link bus">
                        <span class="transport-icon">🚌</span>
                        <span class="transport-name">${t.bus.name}</span>
                        <span class="transport-price">${t.bus.ticketPrice || 'Ver web'}</span>
                    </a>
                `;
            }
            if (t.train) {
                linksHtml += `
                    <a href="${t.train.url}" target="_blank" class="transport-link train">
                        <span class="transport-icon">🚆</span>
                        <span class="transport-name">${t.train.name}</span>
                        <span class="transport-price">${t.train.ticketPrice}</span>
                    </a>
                `;
            }
            if (t.tram) {
                linksHtml += `
                    <a href="${t.tram.url}" target="_blank" class="transport-link tram">
                        <span class="transport-icon">🚊</span>
                        <span class="transport-name">${t.tram.name || 'Tram'}</span>
                        <span class="transport-price">${t.tram.ticketPrice}</span>
                    </a>
                `;
            }

            return `
                <div class="city-transport">
                    <h5>${transportInfo.city}</h5>
                    <div class="transport-links-list">
                        ${linksHtml}
                    </div>
                </div>
            `;
        }

        renderDay(day) {
            // Weather Badge
            let weatherHtml = '';
            if (day.weather) {
                weatherHtml = `
                    <div class="day-weather" title="${day.weather.min}°C - ${day.weather.max}°C">
                        <span class="weather-icon">${day.weather.icon}</span>
                        <span class="weather-text">${Math.round(day.weather.max)}°C</span>
                    </div>
                `;
            }

            // JOIN: Inter-City Transfer Card
            let transferHtml = '';
            if (day.arrivalInfo) {
                const t = day.arrivalInfo;
                transferHtml = `
                    <div class="inter-city-transfer">
                        <div class="transfer-header">
                            <span class="transfer-icon">${t.icon}</span>
                            <span class="transfer-title">Transferencia a ${day.city}</span>
                        </div>
                        <div class="transfer-details">
                            <div class="transfer-route">
                                <b>${t.name}</b>
                                <span>⏱️ ${t.duration}</span>
                            </div>
                            <div class="transfer-cost">
                                <span>💰 ~${t.price}€</span>
                            </div>
                        </div>
                        <div class="transfer-actions" style="margin-top: 10px;">
                            <a href="${t.url}" target="_blank" class="transfer-btn" style="
                                display: inline-block;
                                background: var(--accent-cyan);
                                color: white;
                                padding: 6px 12px;
                                border-radius: 6px;
                                text-decoration: none;
                                font-size: 0.9em;
                                font-weight: 500;
                            ">🎟️ Ver Tickets / Horarios</a>
                        </div>
                        <div class="transfer-tip">💡 ${t.tips}</div>
                    </div>
                `;
            }

            // City Description (Wiki)
            let descHtml = '';
            if (day.cityDescription) {
                descHtml = `<div class="day-wiki-summary">ℹ️ ${day.cityDescription}</div>`;
            }

            return `
                <div class="day-card">
                    ${transferHtml}
                    <div class="day-header">
                        <div class="day-header-main">
                            <span class="day-number">Día ${day.day}</span>
                            <span class="day-city">${day.city}, ${day.country}</span>
                        </div>
                        <div class="day-header-meta">
                            ${weatherHtml}
                            <span class="day-date">${day.date}</span>
                        </div>
                    </div>
                    ${descHtml}
                    <div class="day-sections">
                        ${day.sections.map(section => this.renderSection(section)).join('')}
                    </div>
                </div>
            `;
        }

        renderSection(section) {
            if (section.timeOfDay === 'lunch') {
                return `
                    <div class="day-section lunch-section">
                        <div class="section-header">
                            <span class="section-icon">${section.icon}</span>
                            <span class="section-title">${section.title}</span>
                            <span class="section-time">${section.timeRange}</span>
                        </div>
                        <div class="section-content">
                            <div class="food-recommendation">
                                <strong>🍽️ ${section.recommendation.name}</strong>
                                <p>📍 ${section.recommendation.where}</p>
                                <span class="food-price">${section.recommendation.price}</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="day-section ${section.timeOfDay}-section">
                    <div class="section-header">
                        <span class="section-icon">${section.icon}</span>
                        <span class="section-title">${section.title}</span>
                        <span class="section-time">${section.timeRange}</span>
                    </div>
                    <div class="section-content">
                        ${section.activities ? section.activities.map(act => this.renderActivity(act)).join('') : ''}
                        ${section.transport ? this.renderTransportTip(section.transport) : ''}
                    </div>
                </div>
            `;
        }

        renderActivity(activity) {
            const priceClass = activity.price === 0 ? 'free' : 'paid';
            const priceText = activity.price === 0 ? 'GRATIS' : (typeof activity.price === 'number' ? activity.price + '€' : activity.price);

            return `
                <div class="activity-item">
                    <div class="activity-main">
                        <span class="activity-name">${activity.name}</span>
                        <span class="activity-duration">⏱️ ${activity.duration || 60} min</span>
                    </div>
                    <div class="activity-details">
                        <span class="activity-price ${priceClass}">${priceText}</span>
                        ${activity.rating ? `<span class="activity-rating">⭐ ${activity.rating}</span>` : ''}
                    </div>
                    ${activity.tip ? `<p class="activity-tip">💡 ${activity.tip}</p>` : ''}
                    ${activity.url ? `<a href="${activity.url}" target="_blank" class="activity-link">🎟️ Tickets / Info</a>` : ''}
                </div>
            `;
        }

        renderTransportTip(transport) {
            return `
                <div class="transport-tip">
                    <span class="transport-label">🚇 Cómo llegar:</span>
                    <a href="${transport.url || '#'}" target="_blank" class="transport-link-inline">
                        ${transport.name} (${transport.estimatedTime}, ${transport.price})
                    </a>
                </div>
            `;
        }

        showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast - ${type} `;
            toast.textContent = message;
            container.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        window.multiTourManager = new MultiTourManager();
    });

})();
