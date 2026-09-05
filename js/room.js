/**
 * js/room.js
 * Controller for Virtual Room with Free-Drag Furniture Decoration
 * Meow Meow Ôn Viên Chức
 */

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // 1. STATE & REFERENCES
  // ─────────────────────────────────────────────────────────────────────────
  let roomStageEl = null;
  let itemsLayerEl = null;
  let roomWallEl = null;
  let roomFloorEl = null;
  let petAnchorEl = null;
  let petBubbleEl = null;
  let petBubbleTextEl = null;
  let roomPetEl = null;
  let inventoryDrawerEl = null;
  let inventoryGridEl = null;
  let toastContainerEl = null;

  // Encouraging Civil Servant Study Quotes for Pet
  const PET_QUOTES = [
    "Cố lên nhé! Hôm nay cùng ôn bài thật chăm chỉ nào! ✨",
    "Em đã học rất giỏi rồi, nhớ uống nước nghỉ ngơi xíu nha! 🥤",
    "Quyết tâm đỗ thủ khoa kỳ thi viên chức nhé! 🎓🎉",
    "Mỗi ngày một chút kiến thức là nắm chắc vé đỗ! 📚",
    "Đừng nản trước câu khó, có tớ luôn ở đây cổ vũ bạn nè! 💕",
    "Hôm nay bạn học được bao nhiêu sao rồi? Tớ tự hào lắm! 🐱",
    "Viên chức mẫn cán, phục vụ nhân dân tận tụy nhé! ⚖️",
    "Tớ tin bạn nhất định sẽ làm được! Moah! 🐾"
  ];

  let quoteTimeout = null;

  // ─────────────────────────────────────────────────────────────────────────
  // 2. INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────
  function init() {
    // Ensure GameEngine is initialized
    if (window.GameEngine && typeof window.GameEngine.init === 'function') {
      window.GameEngine.init();
    }

    // Cache DOM Elements
    roomStageEl = document.getElementById('room-stage');
    itemsLayerEl = document.getElementById('room-items-layer');
    roomWallEl = document.getElementById('room-wall');
    roomFloorEl = document.getElementById('room-floor');
    petAnchorEl = document.getElementById('room-pet-anchor');
    petBubbleEl = document.getElementById('room-pet-bubble');
    petBubbleTextEl = document.getElementById('pet-bubble-text');
    roomPetEl = document.getElementById('room-pet');
    inventoryDrawerEl = document.getElementById('inventory-drawer');
    inventoryGridEl = document.getElementById('inventory-grid');
    toastContainerEl = document.getElementById('toast-container');

    // Setup Event Listeners
    setupHUD();
    setupRoomDrag();
    setupPetInteraction();
    setupInventoryDrawer();
    setupThemeModal();
    setupPetModal();

    // Listen to GameEngine events
    if (window.GameEngine && typeof window.GameEngine.on === 'function') {
      window.GameEngine.on('room:changed', () => renderRoom());
      window.GameEngine.on('pet:changed', () => renderPet());
      window.GameEngine.on('stars:earned', () => updateHUD());
      window.GameEngine.on('stars:spent', () => updateHUD());
    }

    // Initial Render
    updateHUD();
    renderRoom();
    renderPet();
  }

  document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. HUD CONTROLLER
  // ─────────────────────────────────────────────────────────────────────────
  function setupHUD() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.GameEngine) {
          const isMuted = window.GameEngine.toggleSound();
          soundBtn.textContent = isMuted ? '🔇' : '🔊';
          showToast(isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
        }
      });
    }
  }

  function updateHUD() {
    if (!window.GameEngine) return;
    const stars = window.GameEngine.getStars();
    const streakObj = window.GameEngine.getStreak ? window.GameEngine.getStreak() : { current: 0 };
    const petObj = window.GameEngine.getPet ? window.GameEngine.getPet() : { name: 'Miu', type: 'cat' };

    const hudStars = document.getElementById('hud-stars');
    const hudStreak = document.getElementById('hud-streak');
    const hudPetName = document.getElementById('hud-pet-name');
    const hudPetIcon = document.getElementById('hud-pet-icon');
    const soundBtn = document.getElementById('btn-sound-toggle');

    if (hudStars) hudStars.textContent = stars;
    if (hudStreak) hudStreak.textContent = streakObj.current || 0;
    if (hudPetName) hudPetName.textContent = petObj.name || 'Miu';
    if (hudPetIcon) {
      const petIcons = { cat: '🐱', bunny: '🐰', bear: '🐻', duck: '🦆', hamster: '🐹' };
      hudPetIcon.textContent = petIcons[petObj.type] || '🐱';
    }
    if (soundBtn && window.GameEngine.isSoundMuted) {
      soundBtn.textContent = window.GameEngine.isSoundMuted() ? '🔇' : '🔊';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RENDER ROOM & THEME
  // ─────────────────────────────────────────────────────────────────────────
  function renderRoom() {
    if (!window.GameEngine || !roomStageEl) return;
    const room = window.GameEngine.getRoom();
    if (!room) return;

    // Apply Wallpaper
    const wpClass = normalizeWallpaperClass(room.wallpaper);
    if (roomWallEl) {
      roomWallEl.className = `room-wall ${wpClass}`;
    }

    // Apply Floor
    const floorClass = normalizeFloorClass(room.floor);
    if (roomFloorEl) {
      roomFloorEl.className = `room-floor ${floorClass}`;
    }

    // Render Placed Items
    if (itemsLayerEl) {
      itemsLayerEl.innerHTML = '';
      const catalog = (window.DATA && window.DATA.shopItems) ? window.DATA.shopItems : [];

      (room.placedItems || []).forEach(placed => {
        const itemData = catalog.find(i => i.id === placed.itemId) || {
          id: placed.itemId,
          name: placed.itemId,
          cssClass: 'item-desk-pink',
          emoji: '📦'
        };

        const itemEl = document.createElement('div');
        itemEl.className = 'room-item';
        itemEl.dataset.itemId = placed.itemId;
        itemEl.style.left = `${placed.x}%`;
        itemEl.style.top = `${placed.y}%`;
        itemEl.setAttribute('tabindex', '0');
        itemEl.setAttribute('role', 'button');
        itemEl.setAttribute('aria-label', itemData.name);

        // Visual Representation
        const visual = document.createElement('div');
        visual.className = `item-visual ${itemData.cssClass || ''}`;
        itemEl.appendChild(visual);

        // Stow / Delete Button
        const stowBtn = document.createElement('button');
        stowBtn.type = 'button';
        stowBtn.className = 'item-stow-btn';
        stowBtn.title = 'Cất vào kho';
        stowBtn.textContent = '✕';
        stowBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          stowItem(placed.itemId);
        });
        itemEl.appendChild(stowBtn);

        itemsLayerEl.appendChild(itemEl);
      });
    }

    // Refresh inventory drawer if opened
    if (inventoryDrawerEl && inventoryDrawerEl.classList.contains('open')) {
      renderInventoryGrid();
    }
  }

  function normalizeWallpaperClass(wp) {
    if (!wp || wp === 'default' || wp === 'wp_pink') return 'wp-pink';
    if (wp === 'wp_blue') return 'wp-blue';
    if (wp === 'wp_cream') return 'wp-cream';
    return wp.replace('_', '-');
  }

  function normalizeFloorClass(fl) {
    if (!fl || fl === 'default' || fl === 'floor_wood') return 'floor-wood';
    if (fl === 'floor_tile') return 'floor-tile';
    return fl.replace('_', '-');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. FREE DRAG & DROP SYSTEM (POINTER EVENTS FOR MOUSE & TOUCH)
  // ─────────────────────────────────────────────────────────────────────────
  function setupRoomDrag() {
    if (!itemsLayerEl || !roomStageEl) return;

    let activeDragEl = null;
    let activePointerId = null;

    itemsLayerEl.addEventListener('pointerdown', (e) => {
      // Ignore if clicking the stow button
      if (e.target.closest('.item-stow-btn')) return;

      const itemEl = e.target.closest('.room-item');
      if (!itemEl) return;

      e.preventDefault();
      activeDragEl = itemEl;
      activePointerId = e.pointerId;
      activeDragEl.setPointerCapture(e.pointerId);
      activeDragEl.classList.add('dragging');

      if (window.GameEngine && window.GameEngine.playSound) {
        window.GameEngine.playSound('tap');
      }
    });

    itemsLayerEl.addEventListener('pointermove', (e) => {
      if (!activeDragEl || e.pointerId !== activePointerId) return;
      e.preventDefault();

      const rect = roomStageEl.getBoundingClientRect();
      let xPct = ((e.clientX - rect.left) / rect.width) * 100;
      let yPct = ((e.clientY - rect.top) / rect.height) * 100;

      // Boundary Clamping [0, 100]
      xPct = Math.max(5, Math.min(95, xPct));
      yPct = Math.max(10, Math.min(95, yPct));

      activeDragEl.style.left = `${xPct}%`;
      activeDragEl.style.top = `${yPct}%`;
    });

    const endDrag = (e) => {
      if (!activeDragEl || e.pointerId !== activePointerId) return;

      activeDragEl.classList.remove('dragging');
      const itemId = activeDragEl.dataset.itemId;
      const x = parseFloat(activeDragEl.style.left);
      const y = parseFloat(activeDragEl.style.top);

      try {
        activeDragEl.releasePointerCapture(e.pointerId);
      } catch (err) {}

      activeDragEl = null;
      activePointerId = null;

      // Save to GameEngine
      if (window.GameEngine && itemId) {
        window.GameEngine.placeItem(itemId, x, y);
      }
    };

    itemsLayerEl.addEventListener('pointerup', endDrag);
    itemsLayerEl.addEventListener('pointercancel', endDrag);
  }

  function stowItem(itemId) {
    if (!window.GameEngine) return;
    window.GameEngine.removeItem(itemId);
    if (window.GameEngine.playSound) {
      window.GameEngine.playSound('tap');
    }
    renderRoom();
    showToast('Đã cất vật phẩm vào kho!');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. INVENTORY DRAWER SYSTEM
  // ─────────────────────────────────────────────────────────────────────────
  function setupInventoryDrawer() {
    const openBtn = document.getElementById('btn-open-inventory');
    const closeBtn = document.getElementById('btn-close-inventory');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        if (inventoryDrawerEl) {
          inventoryDrawerEl.classList.add('open');
          renderInventoryGrid();
          if (window.GameEngine && window.GameEngine.playSound) {
            window.GameEngine.playSound('tap');
          }
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (inventoryDrawerEl) {
          inventoryDrawerEl.classList.remove('open');
        }
      });
    }
  }

  function renderInventoryGrid() {
    if (!inventoryGridEl || !window.GameEngine) return;
    inventoryGridEl.innerHTML = '';

    // Get unplaced items
    const inventory = window.GameEngine.getInventory();

    // Filter out wallpaper and floor items from free-drag furniture inventory
    const furnitureItems = inventory.filter(item => {
      return item.category !== 'wallpaper' && item.category !== 'floor';
    });

    if (furnitureItems.length === 0) {
      inventoryGridEl.innerHTML = `
        <div class="inventory-empty">
          <span style="font-size: 2.5rem;">📦</span>
          <span>Kho đồ của bạn đang trống!</span>
          <a href="shop.html" class="btn btn-primary btn-sm">Ghé Cửa Hàng Sắm Đồ</a>
        </div>
      `;
      return;
    }

    furnitureItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'inventory-card';
      card.innerHTML = `
        <div class="inventory-card-icon">${item.emoji || item.icon || '🛋️'}</div>
        <div class="inventory-card-name">${item.name}</div>
        <button type="button" class="btn btn-primary btn-sm" style="margin-top: 0.35rem; width: 100%; padding: 0.3rem 0.6rem;">Đặt ra</button>
      `;

      card.addEventListener('click', () => {
        placeItemFromInventory(item.id);
      });

      inventoryGridEl.appendChild(card);
    });
  }

  function placeItemFromInventory(itemId) {
    if (!window.GameEngine) return;
    // Generate a pleasant initial placement near the center-bottom floor
    const x = 30 + Math.floor(Math.random() * 40);
    const y = 65 + Math.floor(Math.random() * 20);

    window.GameEngine.placeItem(itemId, x, y);
    if (window.GameEngine.playSound) {
      window.GameEngine.playSound('tap');
    }
    renderRoom();
    showToast('Đã đặt vào phòng! Hãy kéo đồ đến vị trí bạn muốn.');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. PET INTERACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  function setupPetInteraction() {
    if (!petAnchorEl) return;

    petAnchorEl.addEventListener('click', (e) => {
      e.stopPropagation();
      onPetTapped();
    });
  }

  function onPetTapped() {
    if (!window.GameEngine) return;

    // React with happy state
    window.GameEngine.setPetState('happy');
    if (window.GameEngine.playSound) {
      window.GameEngine.playSound('tap');
    }

    // Pick random sweet encouragement quote
    const randomQuote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
    if (petBubbleTextEl && petBubbleEl) {
      petBubbleTextEl.textContent = randomQuote;
      petBubbleEl.style.display = 'block';

      if (quoteTimeout) clearTimeout(quoteTimeout);
      quoteTimeout = setTimeout(() => {
        petBubbleEl.style.display = 'none';
        if (window.GameEngine.setPetState) {
          window.GameEngine.setPetState('idle');
        }
      }, 4000);
    }

    renderPet();
  }

  function renderPet() {
    if (!window.GameEngine || !roomPetEl) return;
    const petObj = window.GameEngine.getPet ? window.GameEngine.getPet() : { type: 'cat', state: 'idle' };

    const type = petObj.type || 'cat';
    const state = petObj.state || 'idle';

    // Update class on room pet element
    roomPetEl.className = `pet pet-${type} ${state} pet-lg`;

    // Update status FX emoji
    const fxEl = roomPetEl.querySelector('.pet-fx');
    if (fxEl) {
      if (state === 'happy') fxEl.textContent = '❤️';
      else if (state === 'excited') fxEl.textContent = '✨';
      else if (state === 'sad') fxEl.textContent = '💧';
      else if (state === 'sleeping') fxEl.textContent = '💤';
      else fxEl.textContent = '❤️';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. THEME MODAL (WALLPAPERS & FLOORS)
  // ─────────────────────────────────────────────────────────────────────────
  function setupThemeModal() {
    const modalEl = document.getElementById('theme-modal');
    const openBtn = document.getElementById('btn-open-theme-modal');
    const closeBtn = document.getElementById('btn-close-theme-modal');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateThemeOptions();
        if (modalEl) modalEl.classList.add('active');
        if (window.GameEngine && window.GameEngine.playSound) {
          window.GameEngine.playSound('tap');
        }
      });
    }

    if (closeBtn && modalEl) {
      closeBtn.addEventListener('click', () => modalEl.classList.remove('active'));
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modalEl.classList.remove('active');
      });
    }
  }

  function populateThemeOptions() {
    const wpContainer = document.getElementById('wallpaper-options');
    const floorContainer = document.getElementById('floor-options');
    if (!window.GameEngine || !wpContainer || !floorContainer) return;

    const currentRoom = window.GameEngine.getRoom();
    const ownedItems = window.GameEngine.getOwnedItems();

    // Wallpapers
    const wallpapers = [
      { id: 'wp_pink', name: 'Hồng Pastel', css: 'wp-pink' },
      { id: 'wp_blue', name: 'Xanh Mint', css: 'wp-blue' },
      { id: 'wp_cream', name: 'Kem Vintage', css: 'wp-cream' }
    ];

    wpContainer.innerHTML = '';
    wallpapers.forEach(wp => {
      const isOwned = wp.id === 'wp_pink' || ownedItems.includes(wp.id);
      const isCurrent = currentRoom.wallpaper === wp.id || (wp.id === 'wp_pink' && currentRoom.wallpaper === 'default');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.flexDirection = 'column';
      btn.style.height = '68px';
      btn.innerHTML = `
        <div style="width: 24px; height: 16px; border-radius: 4px; border: 1px solid #CCC;" class="${wp.css}"></div>
        <span style="font-size: 0.75rem;">${wp.name}</span>
      `;

      if (!isOwned) {
        btn.disabled = true;
        btn.title = 'Mua trong Cửa Hàng để mở khóa!';
      } else {
        btn.addEventListener('click', () => {
          window.GameEngine.setWallpaper(wp.id);
          renderRoom();
          populateThemeOptions();
          showToast(`Đã đổi sang ${wp.name}!`);
        });
      }

      wpContainer.appendChild(btn);
    });

    // Floors
    const floors = [
      { id: 'floor_wood', name: 'Sàn Gỗ', css: 'floor-wood' },
      { id: 'floor_tile', name: 'Gạch Ca Rô', css: 'floor-tile' }
    ];

    floorContainer.innerHTML = '';
    floors.forEach(fl => {
      const isOwned = fl.id === 'floor_wood' || ownedItems.includes(fl.id);
      const isCurrent = currentRoom.floor === fl.id || (fl.id === 'floor_wood' && currentRoom.floor === 'default');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.flexDirection = 'column';
      btn.style.height = '68px';
      btn.innerHTML = `
        <div style="width: 24px; height: 16px; border-radius: 4px; border: 1px solid #CCC;" class="${fl.css}"></div>
        <span style="font-size: 0.75rem;">${fl.name}</span>
      `;

      if (!isOwned) {
        btn.disabled = true;
        btn.title = 'Mua trong Cửa Hàng để mở khóa!';
      } else {
        btn.addEventListener('click', () => {
          window.GameEngine.setFloor(fl.id);
          renderRoom();
          populateThemeOptions();
          showToast(`Đã đổi sang ${fl.name}!`);
        });
      }

      floorContainer.appendChild(btn);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. PET MODAL (SWITCH & RENAME)
  // ─────────────────────────────────────────────────────────────────────────
  function setupPetModal() {
    const modalEl = document.getElementById('pet-modal');
    const openBtn = document.getElementById('btn-open-pet-modal');
    const closeBtn = document.getElementById('btn-close-pet-modal');
    const saveNameBtn = document.getElementById('btn-save-pet-name');
    const nameInput = document.getElementById('pet-rename-input');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        if (!window.GameEngine) return;
        const pet = window.GameEngine.getPet();
        if (nameInput) nameInput.value = pet.name || '';
        populateOwnedPets();
        if (modalEl) modalEl.classList.add('active');
        if (window.GameEngine.playSound) window.GameEngine.playSound('tap');
      });
    }

    if (closeBtn && modalEl) {
      closeBtn.addEventListener('click', () => modalEl.classList.remove('active'));
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modalEl.classList.remove('active');
      });
    }

    if (saveNameBtn && nameInput) {
      saveNameBtn.addEventListener('click', () => {
        const val = nameInput.value.trim();
        if (!val) {
          showToast('Vui lòng nhập tên cho bé Pet!', 'error');
          return;
        }
        if (window.GameEngine) {
          window.GameEngine.renamePet(val);
          updateHUD();
          showToast('Đã đổi tên bé Pet thành công!');
          if (modalEl) modalEl.classList.remove('active');
        }
      });
    }
  }

  function populateOwnedPets() {
    const grid = document.getElementById('owned-pets-grid');
    if (!grid || !window.GameEngine) return;
    grid.innerHTML = '';

    const ownedPets = window.GameEngine.getOwnedPets();
    const currentPet = window.GameEngine.getPet();
    const catalog = (window.DATA && window.DATA.petCatalog) ? window.DATA.petCatalog : [];

    ownedPets.forEach(type => {
      const petDef = catalog.find(p => p.type === type) || { type, name: type, emoji: '🐾' };
      const isCurrent = currentPet.type === type;

      const card = document.createElement('div');
      card.className = `card card-hover ${isCurrent ? 'card-pink' : ''}`;
      card.style.padding = '0.75rem';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.cursor = 'pointer';
      card.style.border = isCurrent ? '2.5px solid var(--pink-main)' : '2px solid var(--pink-light)';

      card.innerHTML = `
        <span style="font-size: 2rem;">${petDef.emoji || petDef.icon || '🐾'}</span>
        <span style="font-size: 0.85rem; font-weight: 800; margin-top: 0.25rem;">${petDef.name}</span>
        ${isCurrent ? '<span style="font-size: 0.7rem; color: var(--pink-deep); font-weight: 900;">Đang chọn</span>' : ''}
      `;

      card.addEventListener('click', () => {
        window.GameEngine.switchPet(type);
        updateHUD();
        renderPet();
        populateOwnedPets();
        showToast(`Đã đổi sang bé ${petDef.name}!`);
      });

      grid.appendChild(card);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. TOAST NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    if (!toastContainerEl) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'error' ? '❌' : '✨';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    toastContainerEl.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

})();
