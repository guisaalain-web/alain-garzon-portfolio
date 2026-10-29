// WanderMind Enhancements - 7 New Features
(function () {
    'use strict';

    // =========================================
    // 1. UNSPLASH IMAGES FOR ROUTES
    // =========================================
    const categoryImages = {
        culture: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=250&fit=crop',
        food: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
        nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop',
        art: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=400&h=250&fit=crop',
        adventure: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&h=250&fit=crop',
        shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
        nightlife: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=250&fit=crop',
        local: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
    };

    function getRouteImage(category) {
        return categoryImages[category] || categoryImages.culture;
    }

    // =========================================
    // CITY HISTORY (últimas 5 ciudades)
    // =========================================
    const CityHistory = {
        key: 'wandermind_city_history',

        getAll() {
            return JSON.parse(localStorage.getItem(this.key) || '[]');
        },

        add(city) {
            let history = this.getAll();
            // Remove if already exists
            history = history.filter(c => c.name !== city.name);
            // Add to beginning
            history.unshift({
                name: city.name,
                country: city.country,
                lat: city.lat,
                lng: city.lng,
                visitedAt: new Date().toISOString()
            });
            // Keep only last 5
            history = history.slice(0, 5);
            localStorage.setItem(this.key, JSON.stringify(history));
        },

        render() {
            const history = this.getAll();
            if (history.length === 0) return;

            // Create history chips below search
            const searchPanel = document.querySelector('.search-panel');
            if (!searchPanel) return;

            let historyEl = document.getElementById('city-history');
            if (!historyEl) {
                historyEl = document.createElement('div');
                historyEl.id = 'city-history';
                historyEl.className = 'city-history';
                searchPanel.parentNode.insertBefore(historyEl, searchPanel.nextSibling);
            }

            historyEl.innerHTML = `
                <span class="history-label">Recientes:</span>
                ${history.map(c => `
                    <button class="history-chip" data-city='${JSON.stringify(c)}'>
                        📍 ${c.name}
                    </button>
                `).join('')}
            `;

            historyEl.querySelectorAll('.history-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const city = JSON.parse(chip.dataset.city);
                    if (window.app) {
                        window.app.selectCity(city);
                    }
                });
            });
        }
    };

    // =========================================
    // FILTERS PERSISTENCE
    // =========================================
    const FiltersPersistence = {
        key: 'wandermind_filters',

        save(type, value) {
            const filters = JSON.parse(localStorage.getItem(this.key) || '{}');
            filters[type] = value;
            localStorage.setItem(this.key, JSON.stringify(filters));
        },

        get(type) {
            const filters = JSON.parse(localStorage.getItem(this.key) || '{}');
            return filters[type] || 'all';
        },

        restore() {
            // Restore route filter
            const routeFilter = this.get('routes');
            const routeBtn = document.querySelector(`.filter-btn[data-filter="${routeFilter}"]`);
            if (routeBtn) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                routeBtn.classList.add('active');
                if (window.app) window.app.filterRoutes(routeFilter);
            }

            // Restore event filter
            const eventFilter = this.get('events');
            const eventBtn = document.querySelector(`.event-filter[data-category="${eventFilter}"]`);
            if (eventBtn) {
                document.querySelectorAll('.event-filter').forEach(b => b.classList.remove('active'));
                eventBtn.classList.add('active');
                if (window.app) window.app.filterEvents(eventFilter);
            }
        },

        init() {
            // Listen for filter changes
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.save('routes', btn.dataset.filter);
                });
            });

            document.querySelectorAll('.event-filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.save('events', btn.dataset.category);
                });
            });

            // Restore saved filters
            setTimeout(() => this.restore(), 1500);
        }
    };

    // =========================================
    // TAB STATE PERSISTENCE
    // =========================================
    const TabPersistence = {
        key: 'wandermind_active_tab',

        save(tab) {
            localStorage.setItem(this.key, tab);
        },

        get() {
            return localStorage.getItem(this.key) || 'routes';
        },

        init() {
            document.querySelectorAll('.search-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.save(tab.dataset.tab);
                });
            });

            // Restore active tab
            const savedTab = this.get();
            const tabBtn = document.querySelector(`.search-tab[data-tab="${savedTab}"]`);
            if (tabBtn) {
                document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
                tabBtn.classList.add('active');
            }
        }
    };

    // =========================================
    // GENERATED ROUTES PERSISTENCE
    // =========================================
    const RoutesPersistence = {
        key: 'wandermind_generated_routes',

        save(routes, city) {
            localStorage.setItem(this.key, JSON.stringify({ routes, city, savedAt: new Date().toISOString() }));
        },

        get() {
            return JSON.parse(localStorage.getItem(this.key) || 'null');
        }
    };
    const FavoritesManager = {
        key: 'wandermind_favorites',

        getAll() {
            return JSON.parse(localStorage.getItem(this.key) || '[]');
        },

        add(route) {
            const favorites = this.getAll();
            const exists = favorites.find(f => f.id === route.id && f.city === route.city);
            if (!exists) {
                favorites.push({
                    ...route,
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem(this.key, JSON.stringify(favorites));
                return true;
            }
            return false;
        },

        remove(routeId, city) {
            let favorites = this.getAll();
            favorites = favorites.filter(f => !(f.id === routeId && f.city === city));
            localStorage.setItem(this.key, JSON.stringify(favorites));
        },

        isFavorite(routeId, city) {
            return this.getAll().some(f => f.id === routeId && f.city === city);
        }
    };

    // =========================================
    // 3. SHARE ROUTES (WhatsApp/Copy Link)
    // =========================================
    function shareRoute(route, city) {
        const stops = route.stops.map(s => `• ${s.startTime} - ${s.name}`).join('\n');
        const text = `🗺️ Mi ruta en ${city}:\n\n${route.name}\n\n${stops}\n\n📍 Creado con WanderMind`;

        // WhatsApp share
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    }

    function copyRouteLink(route, city) {
        const text = `Mira esta ruta en ${city}: ${route.name} - ${route.stops.length} paradas`;
        navigator.clipboard.writeText(text).then(() => {
            showEnhancedToast('¡Enlace copiado!', 'success');
        });
    }

    // =========================================
    // 4. PWA - Progressive Web App
    // =========================================
    // Service Worker registration will be added separately

    // =========================================
    // 5. SKELETON LOADERS
    // =========================================
    function showSkeletons(containerId, count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeletonHTML = Array(count).fill(`
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        `).join('');

        container.innerHTML = skeletonHTML;
    }

    function hideSkeletons(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.querySelectorAll('.skeleton-card').forEach(el => el.remove());
        }
    }

    // =========================================
    // 6. SCROLL ANIMATIONS
    // =========================================
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.section, .route-card, .event-card, .transport-line').forEach(el => {
            el.classList.add('animate-ready');
            observer.observe(el);
        });
    }

    // =========================================
    // 7. DARK/LIGHT MODE TOGGLE
    // =========================================
    const ThemeManager = {
        key: 'wandermind_theme',

        init() {
            const saved = localStorage.getItem(this.key);
            if (saved === 'light') {
                document.body.classList.add('light-mode');
            }
            this.createToggle();
        },

        createToggle() {
            const toggle = document.createElement('button');
            toggle.id = 'theme-toggle';
            toggle.innerHTML = document.body.classList.contains('light-mode') ? '🌙' : '☀️';
            toggle.setAttribute('aria-label', 'Cambiar tema');
            toggle.addEventListener('click', () => this.toggle());
            document.body.appendChild(toggle);
        },

        toggle() {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem(this.key, isLight ? 'light' : 'dark');
            document.getElementById('theme-toggle').innerHTML = isLight ? '🌙' : '☀️';
        }
    };

    // =========================================
    // ENHANCED TOAST
    // =========================================
    function showEnhancedToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // =========================================
    // ENHANCED ROUTE CARDS WITH IMAGES & ACTIONS
    // =========================================
    function enhanceRouteCards() {
        // Override the original renderRoutes if app exists
        if (window.app && window.app.renderRoutes) {
            const originalRender = window.app.renderRoutes.bind(window.app);

            window.app.renderRoutes = function (routes) {
                const grid = document.getElementById('routes-grid');
                if (!routes.length || !routes[0].stops.length) {
                    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">Configura tus preferencias para generar rutas personalizadas</p>';
                    return;
                }

                const city = this.cityMgr.getCity();

                grid.innerHTML = routes.map(route => {
                    const mainCategory = route.stops[0]?.category || 'culture';
                    const imageUrl = getRouteImage(mainCategory);
                    const isFav = FavoritesManager.isFavorite(route.id, city.name);

                    return `
                        <div class="route-card animate-ready" data-time="${route.timeOfDay}">
                            <div class="route-image" style="background-image: url('${imageUrl}')">
                                <button class="fav-btn ${isFav ? 'active' : ''}" data-route-id="${route.id}" title="Guardar favorito">
                                    ${isFav ? '❤️' : '🤍'}
                                </button>
                            </div>
                            <div class="route-header">
                                <h3 class="route-title">${route.name}</h3>
                                <div class="route-meta">
                                    <span>📍 ${route.stops.length} paradas</span>
                                    <span>⏱️ ${this.prefs.data.hours}h</span>
                                </div>
                            </div>
                            <div class="route-body">
                                <ul class="route-stops">
                                    ${route.stops.slice(0, 3).map(stop => `
                                        <li class="route-stop">
                                            <span class="stop-time">${stop.startTime}</span>
                                            <div>
                                                <div class="stop-name">${stop.name}</div>
                                            </div>
                                        </li>
                                    `).join('')}
                                    ${route.stops.length > 3 ? `<li class="route-stop"><span class="stop-time">...</span><div class="stop-name">+${route.stops.length - 3} más</div></li>` : ''}
                                </ul>
                            </div>
                            <div class="route-footer">
                                <span class="route-match">🎯 ${route.matchScore}% match</span>
                                <div class="route-actions">
                                    <button class="btn-icon share-btn" data-route-id="${route.id}" title="Compartir">📤</button>
                                    <button class="btn btn-secondary" onclick="app.viewRoute(${route.id})">Ver mapa</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                // Add event listeners
                grid.querySelectorAll('.fav-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const routeId = parseInt(btn.dataset.routeId);
                        const route = routes.find(r => r.id === routeId);
                        if (route) {
                            if (FavoritesManager.isFavorite(routeId, city.name)) {
                                FavoritesManager.remove(routeId, city.name);
                                btn.innerHTML = '🤍';
                                btn.classList.remove('active');
                                showEnhancedToast('Eliminado de favoritos', 'info');
                            } else {
                                FavoritesManager.add({ ...route, city: city.name });
                                btn.innerHTML = '❤️';
                                btn.classList.add('active');
                                showEnhancedToast('¡Guardado en favoritos!', 'success');
                            }
                        }
                    });
                });

                grid.querySelectorAll('.share-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const routeId = parseInt(btn.dataset.routeId);
                        const route = routes.find(r => r.id === routeId);
                        if (route) {
                            shareRoute(route, city.name);
                        }
                    });
                });

                // Animate cards
                setTimeout(() => initScrollAnimations(), 100);
            };
        }
    }

    // =========================================
    // INIT ALL ENHANCEMENTS
    // =========================================
    function initEnhancements() {
        console.log('🚀 Loading WanderMind Enhancements...');

        // Theme toggle
        ThemeManager.init();

        // Scroll animations
        setTimeout(initScrollAnimations, 500);

        // Enhanced route cards
        setTimeout(enhanceRouteCards, 1000);

        // Filter persistence
        setTimeout(() => FiltersPersistence.init(), 1200);

        // Tab persistence
        setTimeout(() => TabPersistence.init(), 300);

        // City history
        setTimeout(() => CityHistory.render(), 1500);

        // Hook into city selection
        if (window.app && window.app.selectCity) {
            const originalSelectCity = window.app.selectCity.bind(window.app);
            window.app.selectCity = async function (city) {
                CityHistory.add(city);
                await originalSelectCity(city);
                CityHistory.render();
            };
        }

        console.log('✅ All enhancements loaded!');
    }

    // Wait for DOM and app
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancements);
    } else {
        setTimeout(initEnhancements, 100);
    }

    // Expose to global
    window.WanderMindEnhancements = {
        FavoritesManager,
        CityHistory,
        FiltersPersistence,
        TabPersistence,
        RoutesPersistence,
        shareRoute,
        copyRouteLink,
        showSkeletons,
        hideSkeletons,
        ThemeManager,
        getRouteImage
    };
})();
