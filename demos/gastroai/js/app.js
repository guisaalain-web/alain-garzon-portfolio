// GastroAI PRO - Main Application
// Entry point that orchestrates all modules

import { LocationService, PlacesService, FavoritesService, ChatService } from './services.js';
import { UI } from './ui.js';

// ===== APP STATE =====
const App = {
    location: null,
    city: null,
    restaurants: [],
    filters: {
        cuisine: 'all',
        priceLevel: 'all',
        maxDistance: null
    },

    // Global Methods for UI interaction
    createFolder(name = null) {
        if (!name) {
            name = prompt('Nombre de la nueva carpeta:');
        }
        if (name && name.trim()) {
            if (FavoritesService.createCollection(name.trim())) {
                UI.showToast(`Carpeta "${name}" creada`);
                UI.renderCollections();
            } else {
                UI.showToast('La carpeta ya existe');
            }
        }
    },

    openFolder(name) {
        UI.renderFolderContents(name);
    },

    deleteFolder(name) {
        if (confirm(`¿Seguro que quieres eliminar la carpeta "${name}"?`)) {
            if (FavoritesService.deleteCollection(name)) {
                UI.showToast('Carpeta eliminada');
                UI.renderCollections();
            } else {
                UI.showToast('No se puede eliminar esta carpeta');
            }
        }
    },

    showFolders() {
        UI.renderCollections();
    }
};

// Make App globally accessible for event handlers
window.App = App;

// ===== FILTER DEFINITIONS =====
const FILTERS = {
    cuisines: [
        { id: 'all', label: 'Todos', icon: '🍽️' },
        { id: 'italiana', label: 'Italiana', icon: '🍕' },
        { id: 'japonés', label: 'Japonesa', icon: '🍣' },
        { id: 'chino', label: 'China', icon: '🥡' },
        { id: 'mexicano', label: 'Mexicana', icon: '🌮' },
        { id: 'vegano', label: 'Vegana', icon: '🥗' },
        { id: 'comida callejera', label: 'Comida Callejera', icon: '🍔' },
        { id: 'mariscos', label: 'Mariscos', icon: '🦐' },
        { id: 'hindú', label: 'Hindú', icon: '🍛' },
        { id: 'vasco', label: 'Vasca', icon: '🍢' },
        { id: 'argentino', label: 'Argentina', icon: '🥩' },
        { id: 'café', label: 'Cafetería', icon: '☕' }
    ],
    prices: [
        { id: 'all', label: 'Cualquier precio', short: '€-€€€€' },
        { id: '1', label: 'Económico', short: '€' },
        { id: '2', label: 'Moderado', short: '€€' },
        { id: '3', label: 'Premium', short: '€€€' },
        { id: '4', label: 'Lujo', short: '€€€€' }
    ]
};

// ===== INITIALIZATION =====
async function initApp() {
    console.log('🚀 GastroAI PRO initializing...');

    // Initialize UI elements
    UI.init();

    // Show loading skeleton
    UI.renderSkeletons(8);

    // Setup event listeners
    setupEventListeners();

    // Render filters
    renderFilters();

    // Update favorites counter
    UI.updateFavoritesCount();

    try {
        // Get user location
        console.log('📍 Detecting location...');
        const location = await LocationService.initialize();
        App.location = location;
        App.city = location.city;

        console.log(`📍 Location: ${App.city} (${location.lat}, ${location.lng})`);

        // Update hero with city name
        UI.updateHero(App.city);

        // Fetch restaurants
        await refreshRestaurants();

        // Add welcome message to chat
        UI.addChatMessage(`¡Hola! Soy tu guía local en ${App.city}. Pregúntame lo que quieras. 🍽️`);

        // Notify if using fallback
        if (location.isFallback) {
            UI.showToast('Ubicación aproximada (Simulación)');
        }

    } catch (error) {
        console.error('Initialization error:', error);
        UI.updateHero('Tu ciudad');
        await refreshRestaurants();
    }
}

// ===== RESTAURANT REFRESH =====
async function refreshRestaurants() {
    UI.renderSkeletons(8);

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 600));

    const restaurants = await PlacesService.fetchRestaurants(
        App.location?.lat,
        App.location?.lng,
        App.filters
    );

    App.restaurants = restaurants;
    UI.renderRestaurants(restaurants);
}

// ===== FILTER RENDERING =====
function renderFilters() {
    const container = document.getElementById('filters-container');
    if (!container) return;

    container.innerHTML = `
    <!-- Cuisine Filters -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      ${FILTERS.cuisines.map(c => `
        <button class="filter-chip flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm whitespace-nowrap transition-all ${App.filters.cuisine === c.id ? 'active' : ''}" 
                data-filter="cuisine" data-value="${c.id}">
          <span>${c.icon}</span>
          <span>${c.label}</span>
        </button>
      `).join('')}
    </div>
    
    <!-- Price Filters -->
    <div class="flex gap-2 overflow-x-auto pb-2 mt-3 scrollbar-hide">
      ${FILTERS.prices.map(p => `
        <button class="filter-chip flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm whitespace-nowrap transition-all ${App.filters.priceLevel === p.id ? 'active' : ''}" 
                data-filter="priceLevel" data-value="${p.id}">
          <span>${p.short}</span>
        </button>
      `).join('')}
    </div>
  `;

    // Attach filter listeners
    container.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const filterType = btn.dataset.filter;
            const value = btn.dataset.value;

            // Update state
            App.filters[filterType] = value;

            // Update UI
            container.querySelectorAll(`[data-filter="${filterType}"]`).forEach(b => {
                b.classList.toggle('active', b.dataset.value === value);
            });

            // Refresh restaurants
            await refreshRestaurants();
        });
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Chat toggle
    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) {
        chatToggle.addEventListener('click', () => UI.toggleChat());
    }

    // Chat close
    const chatClose = document.getElementById('chat-close');
    if (chatClose) {
        chatClose.addEventListener('click', () => UI.toggleChat());
    }

    // Chat input
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');

    const handleChatSend = async () => {
        const message = chatInput?.value?.trim();
        if (!message) return;

        // Add user message
        UI.addChatMessage(message, true);
        chatInput.value = '';

        // Show typing indicator
        const typingId = UI.showTypingIndicator();

        try {
            // Get AI response (now async)
            const response = await ChatService.getResponse(message);
            UI.hideTypingIndicator(typingId);
            UI.addChatMessage(response);
        } catch (error) {
            UI.hideTypingIndicator(typingId);
            console.error('Error en chat:', error);
            UI.addChatMessage('⚠️ Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
        }
    };

    if (chatSend) {
        chatSend.addEventListener('click', handleChatSend);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSend();
        });
    }

    // Favorites button (Now opens Collections/Folders)
    const favoritesBtn = document.getElementById('favorites-btn');
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', () => {
            UI.renderCollections();
        });
    }

    // Show All button (Resets view to restaurants)
    const showAllBtn = document.getElementById('show-all-btn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', async () => {
            App.filters = { cuisine: 'all', priceLevel: 'all', maxDistance: null };
            renderFilters();
            await refreshRestaurants();
        });
    }
}

// ===== START APP =====
document.addEventListener('DOMContentLoaded', initApp);
