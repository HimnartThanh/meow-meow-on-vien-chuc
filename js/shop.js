/**
 * js/shop.js
 * Controller for Shop System with Category Tabs, Star Purchase Validation & Audio Feedback
 * Meow Meow Ôn Viên Chức
 */

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // 1. STATE & REFERENCES
  // ─────────────────────────────────────────────────────────────────────────
  let currentCategory = 'all';
  let shopGridEl = null;
  let toastContainerEl = null;
  let confettiContainerEl = null;
  let purchaseModalEl = null;

  // Category Names Mapping
  const CATEGORY_NAMES = {
    furniture: '🪑 Bàn Ghế',
    lighting: '💡 Đèn',
    plant: '🌿 Cây Cảnh',
    wall: '🖼️ Tường',
    wallpaper: '🎨 Hình Nền',
    floor: '🏠 Sàn Nhà',
    pets: '🐾 Thú Cưng'
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 2. INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Ensure GameEngine is initialized
    if (window.GameEngine && typeof window.GameEngine.init === 'function') {
      window.GameEngine.init();
    }

    // Cache DOM Elements
    shopGridEl = document.getElementById('shop-grid');
    toastContainerEl = document.getElementById('toast-container');
    confettiContainerEl = document.getElementById('confetti-container');
    purchaseModalEl = document.getElementById('purchase-modal');

    // Setup Category Tabs
    setupCategoryTabs();
    setupHUD();
    setupModal();

    // Listen to GameEngine events
    if (window.GameEngine && typeof window.GameEngine.on === 'function') {
      window.GameEngine.on('stars:earned', () => {
        updateHUD();
        renderShopCatalog();
      });
      window.GameEngine.on('stars:spent', () => {
        updateHUD();
        renderShopCatalog();
      });
      window.GameEngine.on('pet:changed', () => updateHUD());
    }

    // Initial Render
    updateHUD();
    renderShopCatalog();
  });

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
  // 4. CATEGORY TABS
  // ─────────────────────────────────────────────────────────────────────────
  function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category || 'all';

        if (window.GameEngine && window.GameEngine.playSound) {
          window.GameEngine.playSound('tap');
        }

        renderShopCatalog();
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. RENDER SHOP CATALOG
  // ─────────────────────────────────────────────────────────────────────────
  function renderShopCatalog() {
    if (!shopGridEl || !window.GameEngine) return;
    shopGridEl.innerHTML = '';

    const currentStars = window.GameEngine.getStars();
    const ownedItemIds = window.GameEngine.getOwnedItems();
    const ownedPetTypes = window.GameEngine.getOwnedPets();

    const shopItems = (window.DATA && window.DATA.shopItems) ? window.DATA.shopItems : [];
    const petCatalog = (window.DATA && window.DATA.petCatalog) ? window.DATA.petCatalog : [];

    let itemsToDisplay = [];

    if (currentCategory === 'all') {
      // Show all shop items + pets
      itemsToDisplay = [
        ...shopItems.map(i => ({ ...i, isPet: false })),
        ...petCatalog.map(p => ({ ...p, id: p.type, category: 'pets', isPet: true }))
      ];
    } else if (currentCategory === 'pets') {
      itemsToDisplay = petCatalog.map(p => ({ ...p, id: p.type, category: 'pets', isPet: true }));
    } else {
      itemsToDisplay = shopItems
        .filter(i => i.category === currentCategory)
        .map(i => ({ ...i, isPet: false }));
    }

    if (itemsToDisplay.length === 0) {
      shopGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-mid);">
          <span style="font-size: 2.5rem;">🛍️</span>
          <p style="margin-top: 0.5rem; font-weight: 700;">Không tìm thấy vật phẩm nào trong mục này.</p>
        </div>
      `;
      return;
    }

    itemsToDisplay.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';

      // Check ownership
      const isOwned = item.isPet ? ownedPetTypes.includes(item.type) : ownedItemIds.includes(item.id);
      const canAfford = currentStars >= item.price;
      const missing = item.price - currentStars;

      // Preview Element
      let previewHtml = '';
      if (item.isPet) {
        previewHtml = `
          <div class="pet pet-${item.type} happy pet-sm" style="transform: scale(1.15);">
            <div class="pet-character">
              <div class="pet-fx">❤️</div>
              <div class="pet-ear left"></div>
              <div class="pet-ear right"></div>
              <div class="pet-head">
                <div class="pet-eyes">
                  <div class="pet-eye"></div>
                  <div class="pet-eye"></div>
                </div>
                <div class="pet-cheeks">
                  <div class="pet-cheek"></div>
                  <div class="pet-cheek"></div>
                </div>
                <div class="pet-snout">
                  <div class="pet-nose"></div>
                  <div class="pet-mouth"></div>
                </div>
              </div>
              <div class="pet-tail"></div>
            </div>
          </div>
        `;
      } else {
        previewHtml = `
          <div class="item-visual ${item.cssClass || ''}" style="transform: scale(0.95);">
            ${(!item.cssClass || item.cssClass.includes('wp-') || item.cssClass.includes('floor-')) ? `<span style="font-size: 2.2rem;">${item.emoji || item.icon || '🎁'}</span>` : ''}
          </div>
        `;
      }

      // Action Button
      let actionBtnHtml = '';
      if (isOwned) {
        actionBtnHtml = `<button type="button" class="btn btn-secondary btn-sm" disabled style="width: 100%; opacity: 0.85;">✅ Đã Có</button>`;
      } else if (canAfford) {
        actionBtnHtml = `<button type="button" class="btn btn-primary btn-sm btn-buy" data-id="${item.id}" data-is-pet="${item.isPet}" style="width: 100%;">Mua ⭐ ${item.price}</button>`;
      } else {
        actionBtnHtml = `<button type="button" class="btn btn-secondary btn-sm" disabled style="width: 100%; opacity: 0.6;" title="Cần thêm ${missing} sao">Thiếu ${missing} ⭐</button>`;
      }

      const categoryLabel = CATEGORY_NAMES[item.category] || 'Vật phẩm';

      card.innerHTML = `
        <div class="shop-card-preview">${previewHtml}</div>
        <span style="font-size: 0.72rem; font-weight: 800; color: var(--pink-deep); background: var(--pink-light); padding: 0.15rem 0.5rem; border-radius: var(--radius-pill);">${categoryLabel}</span>
        <h4 class="shop-card-title">${item.name}</h4>
        <p class="shop-card-desc">${item.description || ''}</p>
        <div class="shop-card-price">⭐ ${item.price}</div>
        <div class="shop-card-action">${actionBtnHtml}</div>
      `;

      // Attach Click Event for Buy Button
      const buyBtn = card.querySelector('.btn-buy');
      if (buyBtn) {
        buyBtn.addEventListener('click', () => {
          handlePurchase(item);
        });
      }

      shopGridEl.appendChild(card);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. PURCHASE LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  function handlePurchase(item) {
    if (!window.GameEngine) return;

    let result = null;
    if (item.isPet) {
      result = window.GameEngine.unlockPet ? window.GameEngine.unlockPet(item.type) : window.GameEngine.buyPet(item.type);
    } else {
      result = window.GameEngine.buyItem(item.id);
    }

    if (result && result.success) {
      // Audio feedback
      if (window.GameEngine.playSound) {
        window.GameEngine.playSound('star');
      }

      // Confetti celebration
      launchConfetti();

      // Show Celebration Modal
      showPurchaseModal(item);

      // Re-render UI
      updateHUD();
      renderShopCatalog();
    } else {
      const msg = (result && result.message) ? result.message : 'Không thể mua vật phẩm!';
      showToast(msg, 'error');
      if (window.GameEngine.playSound) {
        window.GameEngine.playSound('wrong');
      }
    }
  }

  function showPurchaseModal(item) {
    if (!purchaseModalEl) {
      showToast(`Đã mua thành công ${item.name}!`);
      return;
    }

    const modalIcon = document.getElementById('modal-item-icon');
    const modalTitle = document.getElementById('modal-item-title');
    const modalDesc = document.getElementById('modal-item-desc');

    if (modalIcon) modalIcon.textContent = item.emoji || item.icon || '🎉';
    if (modalTitle) modalTitle.textContent = `Nhận Được ${item.name}!`;
    if (modalDesc) {
      modalDesc.textContent = item.isPet
        ? `Bé ${item.name} đã gia nhập gia đình của bạn! Hãy vào Phòng để chơi cùng bé nhé.`
        : `Món đồ ${item.name} đã được cất vào Kho Đồ. Hãy vào Phòng Của Em để trang trí ngay nhé!`;
    }

    purchaseModalEl.classList.add('active');
  }

  function setupModal() {
    const continueBtn = document.getElementById('btn-modal-continue');
    if (continueBtn && purchaseModalEl) {
      continueBtn.addEventListener('click', () => {
        purchaseModalEl.classList.remove('active');
      });

      purchaseModalEl.addEventListener('click', (e) => {
        if (e.target === purchaseModalEl) {
          purchaseModalEl.classList.remove('active');
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CONFETTI CELEBRATION EFFECT
  // ─────────────────────────────────────────────────────────────────────────
  function launchConfetti() {
    if (!confettiContainerEl) return;
    confettiContainerEl.innerHTML = '';

    const colors = ['#FF85A1', '#FFD93D', '#6BCB77', '#4D96FF', '#C9A8E0', '#FFB6C1', '#FFA978'];
    const count = 36;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';

      const left = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const drift = (Math.random() - 0.5) * 160;
      const rot = Math.floor(Math.random() * 720) - 360;
      const delay = Math.random() * 0.4;
      const duration = 2.2 + Math.random() * 1.2;

      piece.style.left = `${left}vw`;
      piece.style.backgroundColor = color;
      piece.style.setProperty('--drift', `${drift}px`);
      piece.style.setProperty('--rot', `${rot}deg`);
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${delay}s`;

      confettiContainerEl.appendChild(piece);
    }

    setTimeout(() => {
      if (confettiContainerEl) confettiContainerEl.innerHTML = '';
    }, 3500);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. TOAST NOTIFICATIONS
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
