// GastroAI PRO - UI Rendering Module
// Handles all DOM manipulation and visual updates

import { FavoritesService } from './services.js';

// ===== HELPERS =====
const Utils = {
  // Generate star rating HTML
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let html = '';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        html += '<svg class="w-4 h-4 star-filled inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
      } else if (i === fullStars && hasHalf) {
        html += '<svg class="w-4 h-4 star-filled inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity="0.5"></path></svg>';
      } else {
        html += '<svg class="w-4 h-4 star-empty inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
      }
    }
    return html;
  },

  // Generate price level HTML
  renderPrice(level) {
    let html = '';
    for (let i = 0; i < 4; i++) {
      if (i < level) {
        html += '<span class="price-active">€</span>';
      } else {
        html += '<span class="price-inactive">€</span>';
      }
    }
    return html;
  },

  // Format distance
  formatDistance(km) {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  }
};

// ===== UI RENDERER =====
const UI = {
  elements: {},

  init() {
    this.elements = {
      heroTitle: document.getElementById('hero-title'),
      heroSubtitle: document.getElementById('hero-subtitle'),
      cityBadge: document.getElementById('city-badge'),
      restaurantGrid: document.getElementById('restaurant-grid'),
      filtersContainer: document.getElementById('filters-container'),
      chatMessages: document.getElementById('chat-messages'),
      chatInput: document.getElementById('chat-input'),
      chatToggle: document.getElementById('chat-toggle'),
      chatWidget: document.getElementById('chat-widget'),
      loadingOverlay: document.getElementById('loading-overlay'),
      favoritesCount: document.getElementById('favorites-count'),
    };
  },

  // Update hero section with city
  updateHero(city) {
    if (this.elements.heroTitle) {
      this.elements.heroTitle.innerHTML = `Hola viajero 🍽️`;
    }
    if (this.elements.heroSubtitle) {
      this.elements.heroSubtitle.innerHTML = `Estás en <span class="gradient-text font-bold">${city}</span>. Aquí tienes sugerencias únicas.`;
    }
    if (this.elements.cityBadge) {
      this.elements.cityBadge.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span>${city}</span>
      `;
    }
  },

  // Render Folders/Collections
  renderCollections() {
    if (!this.elements.restaurantGrid) return;

    const collections = FavoritesService.getCollections();
    const collectionNames = Object.keys(collections);

    this.elements.restaurantGrid.innerHTML = `
            <div class="col-span-full flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">🗂️ Mis Carpetas</h2>
                <button onclick="window.App.createFolder()" class="btn-secondary px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-all">+ Nueva Carpeta</button>
            </div>
        `;

    // Hide standard filters in folder mode
    if (this.elements.filtersContainer) this.elements.filtersContainer.classList.add('hidden');

    if (collectionNames.length === 0) {
      this.renderEmptyState('No tienes carpetas aún.');
      return;
    }

    const collectionsGrid = document.createElement('div');
    collectionsGrid.className = 'col-span-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';

    collectionNames.forEach((name, index) => {
      const count = collections[name].length;
      const delay = index * 0.05;

      const folderDiv = document.createElement('div');
      folderDiv.className = `glass p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition-all animate-slide-up flex flex-col items-center justify-center gap-3 border border-white/5`;
      folderDiv.style.animationDelay = `${delay}s`;
      folderDiv.onclick = () => window.App.openFolder(name);

      folderDiv.innerHTML = `
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <span class="text-3xl">📁</span>
                </div>
                <h3 class="font-bold text-lg text-white">${name}</h3>
                <span class="text-xs text-gray-400">${count} items</span>
            `;
      collectionsGrid.appendChild(folderDiv);
    });

    this.elements.restaurantGrid.appendChild(collectionsGrid);
  },

  renderFolderContents(folderName) {
    if (!this.elements.restaurantGrid) return;
    const allCollections = FavoritesService.getCollections();
    const items = allCollections[folderName] || [];

    // Header with Back Button
    this.elements.restaurantGrid.innerHTML = `
             <div class="col-span-full flex items-center gap-4 mb-6">
                <button onclick="window.App.showFolders()" class="p-2 glass rounded-full hover:bg-white/10 transition-all">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-white">📁 ${folderName}</h2>
                    <p class="text-xs text-gray-400">${items.length} restaurantes guardados</p>
                </div>
                ${folderName !== 'General' ? `<button onclick="window.App.deleteFolder('${folderName}')" class="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all">Eliminar Carpeta</button>` : ''}
            </div>
        `;

    // Hide standard filters in folder view
    if (this.elements.filtersContainer) this.elements.filtersContainer.classList.add('hidden');

    if (items.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'col-span-full text-center py-12 text-gray-500 glass rounded-xl';
      emptyMsg.innerHTML = '<p>Esta carpeta está vacía.</p>';
      this.elements.restaurantGrid.appendChild(emptyMsg);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

    grid.innerHTML = items.map((r, index) => this.generateCardHTML(r, index)).join('');
    this.elements.restaurantGrid.appendChild(grid);
    this.attachFavoriteListeners();
  },

  // Render restaurant cards (Standard view)
  renderRestaurants(restaurants) {
    if (!this.elements.restaurantGrid) return;

    // Ensure filters are visible
    if (this.elements.filtersContainer) this.elements.filtersContainer.classList.remove('hidden');

    if (restaurants.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.elements.restaurantGrid.innerHTML = restaurants.map((r, index) => this.generateCardHTML(r, index)).join('');
    this.attachFavoriteListeners(); // Re-attach listeners for hearts
  },

  generateCardHTML(r, index) {
    const isFav = FavoritesService.isFavorite(r.id);
    const delay = index * 0.05;

    // Use a generic food placeholder if image fails
    // Using "food" keyword on mock site or unsplash source
    const fallbackImage = `https://source.unsplash.com/400x300/?food,restaurant&sig=fallback`;

    return `
        <div class="card-hover glass rounded-2xl overflow-hidden animate-slide-up" style="animation-delay: ${delay}s" data-id="${r.id}">
          <!-- Image -->
          <div class="relative h-48 overflow-hidden bg-gray-900 group">
            <img src="${r.image}" 
                 alt="${r.name}" 
                 class="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${fallbackImage}'">
            
            <div class="absolute top-3 right-3 z-10">
              <button class="heart-btn w-10 h-10 glass rounded-full flex items-center justify-center ${isFav ? 'favorited' : ''} hover:scale-110 transition-transform active:scale-95" data-favorite="${r.id}">
                <svg class="w-5 h-5 transition-colors duration-300" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </button>
            </div>

            <div class="absolute bottom-3 left-3 flex gap-2">
              ${r.isOpen
        ? '<span class="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">Abierto</span>'
        : '<span class="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">Cerrado</span>'
      }
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-5 flex flex-col h-[280px]"> <!-- Fixed height for consistency -->
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold text-white truncate pr-2 w-full leading-tight" title="${r.name}">${r.name}</h3>
              <span class="text-xs text-gray-400 whitespace-nowrap pt-1 bg-white/5 px-2 py-0.5 rounded-full">${Utils.formatDistance(r.distance)}</span>
            </div>
            
            <p class="text-sm text-purple-400 mb-3 font-medium">${r.cuisine}</p>
            
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-1 text-yellow-500">
                ${Utils.renderStars(r.rating)}
                <span class="text-sm text-gray-300 ml-1 font-semibold">${r.rating}</span>
              </div>
              <span class="text-xs text-gray-500">(${r.reviewCount})</span>
              <div class="ml-auto text-sm font-medium text-gray-300">
                ${Utils.renderPrice(r.priceLevel)}
              </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-4 h-14 overflow-hidden content-start">
              ${r.tags.slice(0, 3).map(tag => `
                <span class="px-2 py-1 text-[10px] uppercase tracking-wider bg-white/5 text-gray-400 rounded-md border border-white/5">${tag}</span>
              `).join('')}
            </div>
            
            <div class="mt-auto"> <!-- Push to bottom -->
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-4 truncate">
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                <span class="truncate">${r.address}</span>
                </div>
                
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.address)}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn-primary w-full py-3 rounded-xl text-white font-bold text-sm text-center flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-500/20">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                Ver en Mapa
                </a>
            </div>
          </div>
        </div>
      `;
  },

  renderEmptyState(message = 'No encontramos restaurantes.') {
    this.elements.restaurantGrid.innerHTML = `
        <div class="col-span-full text-center py-16 animate-fade-in">
          <div class="text-7xl mb-6 opacity-80">🍽️</div>
          <h3 class="text-2xl font-bold text-white mb-2">${message}</h3>
          <p class="text-gray-500 max-w-md mx-auto">Prueba ajustando los filtros o explora otra zona para encontrar nuevas opciones gastronómicas.</p>
        </div>
      `;
  },

  // Attach event listeners to favorite buttons
  attachFavoriteListeners() {
    // Remove old listeners to avoid duplicates if re-rendering? 
    // Logic handles replacement of innerHTML so safe.
    document.querySelectorAll('[data-favorite]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click if any

        const id = btn.dataset.favorite;
        // Look in both main restaurants list and favorites service to find data
        // This ensures we have the object even if we are in Folder view
        let restaurant = window.App?.restaurants?.find(r => r.id === id);
        if (!restaurant) {
          // Try to find in favorites
          restaurant = FavoritesService.getAllFavorites().find(r => r.id === id);
        }

        if (restaurant) {
          const { added, message } = FavoritesService.toggleFavorite(restaurant);
          btn.classList.toggle('favorited', added);
          btn.querySelector('svg').setAttribute('fill', added ? 'currentColor' : 'none');
          this.updateFavoritesCount();
          this.showToast(message); // e.g., "Guardado en General"
        }
      });
    });
  },

  // Update favorites counter
  updateFavoritesCount() {
    const count = FavoritesService.getAllFavorites().length;
    if (this.elements.favoritesCount) {
      this.elements.favoritesCount.textContent = count;
      this.elements.favoritesCount.classList.toggle('hidden', count === 0);

      // Pop animation
      this.elements.favoritesCount.style.transform = 'scale(1.2)';
      setTimeout(() => this.elements.favoritesCount.style.transform = 'scale(1)', 200);
    }
  },

  // Show toast notification
  showToast(message) {
    // Remove existing toast if any
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 glass px-6 py-3 rounded-full text-white font-medium z-50 animate-bounce-in flex items-center gap-2 shadow-xl border border-white/10';
    toast.innerHTML = `<span>✨</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 20px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },

  // Show typing indicator
  showTypingIndicator() {
    if (!this.elements.chatMessages) return null;

    const typingId = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = typingId;
    msgDiv.className = 'flex justify-start animate-slide-up';

    msgDiv.innerHTML = `
      <div class="glass-light text-gray-200 px-4 py-3 rounded-2xl max-w-[80%] rounded-bl-md shadow-md">
        <div class="flex gap-1">
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    `;

    this.elements.chatMessages.appendChild(msgDiv);
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    return typingId;
  },

  // Hide typing indicator
  hideTypingIndicator(typingId) {
    if (!typingId) return;
    const typingElement = document.getElementById(typingId);
    if (typingElement) {
      typingElement.remove();
    }
  },

  // Add chat message
  addChatMessage(text, isUser = false) {
    if (!this.elements.chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`;

    msgDiv.innerHTML = `
      <div class="${isUser
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
        : 'glass-light text-gray-200'
      } px-4 py-3 rounded-2xl max-w-[80%] ${isUser ? 'rounded-br-md' : 'rounded-bl-md'} shadow-md">
        ${text}
      </div>
    `;

    this.elements.chatMessages.appendChild(msgDiv);
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
  },

  // Toggle chat visibility
  toggleChat() {
    if (this.elements.chatWidget) {
      const isOpen = !this.elements.chatWidget.classList.contains('hidden');
      this.elements.chatWidget.classList.toggle('hidden', isOpen);
      this.elements.chatWidget.classList.toggle('animate-slide-up', !isOpen);
    }
  },

  // Show/hide loading
  setLoading(show) {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.toggle('hidden', !show);
    }
  },

  // Render skeleton loading cards
  renderSkeletons(count = 6) {
    if (!this.elements.restaurantGrid) return;

    // Hide filters if we want to show pure loading state? 
    // Usually good to keep filters visible so user knows what's happening.

    this.elements.restaurantGrid.innerHTML = Array(count).fill(0).map((_, i) => `
      <div class="glass rounded-2xl overflow-hidden animate-pulse" style="animation-delay: ${i * 0.1}s">
        <div class="h-48 bg-white/5"></div>
        <div class="p-5 space-y-3">
          <div class="h-6 w-3/4 bg-white/10 rounded"></div>
          <div class="h-4 w-1/2 bg-white/5 rounded"></div>
          <div class="h-4 w-full bg-white/5 rounded"></div>
          <div class="h-10 w-full bg-white/10 rounded-xl mt-4"></div>
        </div>
      </div>
    `).join('');
  }
};

export { UI, Utils };
