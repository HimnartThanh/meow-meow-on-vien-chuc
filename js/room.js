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
  let roomWrapperEl = null;
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

  let btnCamIndoor = null;
  let btnCamOutdoor = null;
  let minimapTrackEl = null;
  let minimapThumbEl = null;
  let minimapEl = null;

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
    roomWrapperEl = document.getElementById('room-wrapper');
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

    btnCamIndoor = document.getElementById('btn-cam-indoor');
    btnCamOutdoor = document.getElementById('btn-cam-outdoor');
    minimapTrackEl = document.getElementById('camera-minimap-track');
    minimapThumbEl = document.getElementById('cam-minimap-thumb');
    minimapEl = document.getElementById('camera-minimap');

    // Setup Event Listeners
    setupHUD();
    setupFloorSwitcher();
    setupCameraController();
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
  // 3. HUD & FLOOR SWITCHER CONTROLLERS
  // ─────────────────────────────────────────────────────────────────────────
  function setupFloorSwitcher() {
    const floorBar = document.getElementById('floor-switcher-bar');
    if (!floorBar) return;

    floorBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.floor-btn');
      if (!btn) return;
      const targetFloor = btn.dataset.floor;
      if (window.GameEngine && window.GameEngine.switchFloor) {
        window.GameEngine.switchFloor(targetFloor);
        if (window.GameEngine.playSound) {
          window.GameEngine.playSound('tap');
        }
        renderRoom();
        showToast(`Đã chuyển sang ${btn.textContent.trim()}!`);
      }
    });
  }

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
  // 4. RENDER ROOM & THEME (ISOMETRIC 2.5D)
  // ─────────────────────────────────────────────────────────────────────────
  function renderRoom() {
    if (!window.GameEngine || !roomStageEl) return;
    const room = window.GameEngine.getRoom();
    if (!room) return;

    // Apply Isometric Background based on Floor
    const currentFloor = room.currentFloor || 'floor_1';
    const bgUrl = currentFloor === 'floor_2'
      ? 'assets/isometric/rooms/room_floor_2.svg'
      : 'assets/isometric/rooms/room_floor_1.svg';
    roomStageEl.style.backgroundImage = `url('${bgUrl}')`;

    // Update Floor Switcher Active Button
    const floorBtns = document.querySelectorAll('.floor-btn');
    floorBtns.forEach(btn => {
      if (btn.dataset.floor === currentFloor) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Render Placed Items with Isometric Illustrations & Rotation
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
        itemEl.className = 'room-item iso-placed-item';
        itemEl.dataset.itemId = placed.itemId;
        itemEl.style.left = `${placed.x}%`;
        itemEl.style.top = `${placed.y}%`;
        itemEl.style.zIndex = Math.floor(placed.y * 10) + 10;
        itemEl.setAttribute('tabindex', '0');
        itemEl.setAttribute('role', 'button');
        itemEl.setAttribute('aria-label', itemData.name);

        const rot = placed.rotation || 0;

        // Visual Representation: High-res SVG or CSS Class
        if (itemData.image) {
          const img = document.createElement('img');
          img.src = itemData.image;
          img.className = 'iso-item-img';
          img.alt = itemData.name;
          const w = itemData.width || 120;
          const h = itemData.height || 100;
          img.style.width = `${w}px`;
          img.style.height = `${h}px`;
          img.style.objectFit = 'contain';
          img.onerror = () => {
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = `item-visual ${itemData.cssClass || ''}`;
            fallback.innerHTML = `<span style="font-size: 2.2rem;">${itemData.emoji || '🎁'}</span>`;
            itemEl.appendChild(fallback);
          };
          if (rot !== 0) {
            img.style.transform = `rotate(${rot}deg)`;
          }
          itemEl.appendChild(img);
        } else {
          const visual = document.createElement('div');
          visual.className = `item-visual ${itemData.cssClass || ''}`;
          if (rot !== 0) {
            visual.style.transform = `rotate(${rot}deg)`;
          }
          itemEl.appendChild(visual);
        }

        // Stow Button
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

        // Click on item toggles floating control bubble
        itemEl.addEventListener('click', (e) => {
          if (e.target.closest('.item-stow-btn') || e.target.closest('.item-control-bubble')) return;
          toggleItemControlBubble(itemEl, placed, itemData);
        });

        itemsLayerEl.appendChild(itemEl);
      });
    }

    // Refresh inventory drawer if opened
    if (inventoryDrawerEl && inventoryDrawerEl.classList.contains('open')) {
      renderInventoryGrid();
    }
  }

  function toggleItemControlBubble(itemEl, placed, itemData) {
    const existing = itemEl.querySelector('.item-control-bubble');
    if (existing) {
      existing.remove();
      return;
    }

    // Remove any other control bubbles
    document.querySelectorAll('.item-control-bubble').forEach(b => b.remove());

    const bubble = document.createElement('div');
    bubble.className = 'item-control-bubble';

    // 1. Rotate Button (Xoay 90 độ)
    const rotateBtn = document.createElement('button');
    rotateBtn.type = 'button';
    rotateBtn.className = 'item-btn-action';
    rotateBtn.title = 'Xoay 90°';
    rotateBtn.innerHTML = '🔄';
    rotateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.GameEngine && window.GameEngine.rotateItem) {
        window.GameEngine.rotateItem(placed.itemId);
        if (window.GameEngine.playSound) window.GameEngine.playSound('tap');
        renderRoom();
      }
    });
    bubble.appendChild(rotateBtn);

    // 2. Invite Pet Button (Mời pet ngồi/ngủ)
    const petBtn = document.createElement('button');
    petBtn.type = 'button';
    petBtn.className = 'item-btn-action';
    petBtn.title = itemData.anchor === 'bed' ? 'Mời pet nằm ngủ' : 'Mời pet ngồi học';
    petBtn.innerHTML = itemData.anchor === 'bed' ? '🛏️' : '🐾';
    petBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      invitePetToItem(placed, itemData);
      bubble.remove();
    });
    bubble.appendChild(petBtn);

    // 3. Stow Button (Cất vào kho)
    const stowBtn = document.createElement('button');
    stowBtn.type = 'button';
    stowBtn.className = 'item-btn-action';
    stowBtn.title = 'Cất vào kho';
    stowBtn.innerHTML = '🗑️';
    stowBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stowItem(placed.itemId);
    });
    bubble.appendChild(stowBtn);

    itemEl.appendChild(bubble);
  }

  function invitePetToItem(placed, itemData) {
    if (!petAnchorEl || !window.GameEngine) return;
    petAnchorEl.style.left = `${placed.x}%`;
    petAnchorEl.style.top = `${Math.max(15, placed.y - 4)}%`;

    // Smoothly pan camera to center the item and pet
    if (roomWrapperEl) {
      const itemPx = (placed.x / 100) * STAGE_WIDTH;
      const targetCamX = itemPx - (roomWrapperEl.clientWidth / 2);
      panCameraTo(targetCamX, 450);
    }

    if (itemData.anchor === 'bed') {
      window.GameEngine.setPetPose('sleep');
      showToast('Bé cưng đã cuộn tròn ngủ say trên giường rồi! 💤');
    } else if (itemData.anchor === 'seat') {
      window.GameEngine.setPetPose('sit');
      showToast('Bé cưng đang ngồi học bài cực chăm chỉ nè! 📖✨');
    } else {
      window.GameEngine.setPetPose('idle');
      showToast('Bé cưng đang vui vẻ chơi đùa cùng món đồ mới! 💕');
    }

    if (window.GameEngine.playSound) window.GameEngine.playSound('tap');
    renderPet();
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
  // 4B. CAMERA CONTROLLER (PANORAMIC CAMERA PAN 2000px)
  // ─────────────────────────────────────────────────────────────────────────
  const STAGE_WIDTH = 2000;
  let cameraX = 0;
  let maxScrollX = 0;
  let isPanningCamera = false;
  let panStartX = 0;
  let panStartCameraX = 0;
  let lastPointerX = 0;
  let lastPointerTime = 0;
  let velocityX = 0;
  let momentumAnimId = null;

  function updateMaxScroll() {
    if (!roomWrapperEl) return;
    const viewWidth = roomWrapperEl.clientWidth || 960;
    maxScrollX = Math.max(0, STAGE_WIDTH - viewWidth);
    updateMinimapThumbWidth(viewWidth);
  }

  function updateMinimapThumbWidth(viewWidth) {
    if (!minimapThumbEl) return;
    const widthPct = Math.max(22, Math.min(60, (viewWidth / STAGE_WIDTH) * 100));
    minimapThumbEl.style.width = `${widthPct}%`;
  }

  function setCameraX(targetX, updateButtons = true) {
    updateMaxScroll();
    cameraX = Math.max(0, Math.min(maxScrollX, targetX));
    if (roomStageEl) {
      roomStageEl.style.transform = `translate3d(-${cameraX}px, 0, 0)`;
    }
    updateMinimap();
    if (updateButtons) {
      updateNavButtons();
    }
  }

  function updateMinimap() {
    if (!minimapThumbEl || !minimapTrackEl) return;
    const trackWidth = minimapTrackEl.clientWidth;
    const thumbWidth = minimapThumbEl.clientWidth;
    const maxTranslate = Math.max(0, trackWidth - thumbWidth);
    const ratio = maxScrollX > 0 ? (cameraX / maxScrollX) : 0;
    minimapThumbEl.style.transform = `translate3d(${ratio * maxTranslate}px, 0, 0)`;
  }

  function updateNavButtons() {
    if (!btnCamIndoor || !btnCamOutdoor) return;
    if (maxScrollX <= 0) {
      btnCamIndoor.classList.add('active');
      btnCamOutdoor.classList.remove('active');
      return;
    }
    const ratio = cameraX / maxScrollX;
    if (ratio < 0.45) {
      btnCamIndoor.classList.add('active');
      btnCamOutdoor.classList.remove('active');
    } else if (ratio > 0.55) {
      btnCamOutdoor.classList.add('active');
      btnCamIndoor.classList.remove('active');
    }
  }

  function stopMomentum() {
    if (momentumAnimId) {
      cancelAnimationFrame(momentumAnimId);
      momentumAnimId = null;
    }
  }

  function panCameraTo(targetX, duration = 350) {
    stopMomentum();
    updateMaxScroll();
    const clampedTarget = Math.max(0, Math.min(maxScrollX, targetX));
    if (duration <= 0 || Math.abs(clampedTarget - cameraX) < 1) {
      setCameraX(clampedTarget, true);
      return;
    }

    const startX = cameraX;
    const deltaX = clampedTarget - startX;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      setCameraX(startX + deltaX * eased, false);

      if (progress < 1) {
        momentumAnimId = requestAnimationFrame(step);
      } else {
        setCameraX(clampedTarget, true);
        momentumAnimId = null;
      }
    }

    momentumAnimId = requestAnimationFrame(step);
  }

  function isInteractiveElement(target) {
    if (!target) return false;
    return !!target.closest(
      '.room-item, .iso-placed-item, .item-control-bubble, .item-stow-btn, ' +
      '.floor-switcher-bar, .camera-quick-nav, .camera-minimap, ' +
      '.room-pet-anchor, button, a, input'
    );
  }

  function onCameraPointerDown(e) {
    if (isInteractiveElement(e.target)) return;

    stopMomentum();
    isPanningCamera = true;
    panStartX = e.clientX;
    panStartCameraX = cameraX;
    lastPointerX = e.clientX;
    lastPointerTime = performance.now();
    velocityX = 0;

    if (roomStageEl) {
      roomStageEl.classList.add('is-panning');
    }
  }

  function onCameraPointerMove(e) {
    if (!isPanningCamera) return;
    const dx = e.clientX - panStartX;
    setCameraX(panStartCameraX - dx, false);

    const now = performance.now();
    const dt = now - lastPointerTime;
    if (dt > 10) {
      velocityX = (lastPointerX - e.clientX) / dt;
      lastPointerX = e.clientX;
      lastPointerTime = now;
    }
  }

  function onCameraPointerUp(e) {
    if (!isPanningCamera) return;
    isPanningCamera = false;

    if (roomStageEl) {
      roomStageEl.classList.remove('is-panning');
    }
    updateNavButtons();

    // Inertia Glide if swiped with sufficient speed
    if (Math.abs(velocityX) > 0.12) {
      let currentVel = velocityX * 15;
      function momentumGlide() {
        currentVel *= 0.92;
        if (Math.abs(currentVel) > 0.4) {
          setCameraX(cameraX + currentVel, false);
          if (cameraX <= 0 || cameraX >= maxScrollX) {
            updateNavButtons();
            momentumAnimId = null;
            return;
          }
          momentumAnimId = requestAnimationFrame(momentumGlide);
        } else {
          updateNavButtons();
          momentumAnimId = null;
        }
      }
      momentumAnimId = requestAnimationFrame(momentumGlide);
    }
  }

  function setupCameraController() {
    updateMaxScroll();
    setCameraX(0, true);

    window.addEventListener('resize', () => {
      updateMaxScroll();
      setCameraX(cameraX, true);
    });

    if (btnCamIndoor) {
      btnCamIndoor.addEventListener('click', (e) => {
        e.stopPropagation();
        panCameraTo(0, 400);
        if (window.GameEngine && window.GameEngine.playSound) {
          window.GameEngine.playSound('tap');
        }
      });
    }

    if (btnCamOutdoor) {
      btnCamOutdoor.addEventListener('click', (e) => {
        e.stopPropagation();
        updateMaxScroll();
        panCameraTo(maxScrollX, 400);
        if (window.GameEngine && window.GameEngine.playSound) {
          window.GameEngine.playSound('tap');
        }
      });
    }

    if (minimapEl) {
      minimapEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!minimapTrackEl) return;
        const rect = minimapTrackEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        updateMaxScroll();
        panCameraTo(ratio * maxScrollX, 300);
      });
    }

    if (roomWrapperEl) {
      roomWrapperEl.addEventListener('pointerdown', onCameraPointerDown);
      window.addEventListener('pointermove', onCameraPointerMove);
      window.addEventListener('pointerup', onCameraPointerUp);
      window.addEventListener('pointercancel', onCameraPointerUp);
    }

    // Expose for testing and external access
    window.CameraController = {
      panCameraTo,
      setCameraX,
      getCameraX: () => cameraX,
      getMaxScrollX: () => maxScrollX
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. FREE DRAG & DROP SYSTEM WITH EDGE-PANNING (MOUSE & TOUCH)
  // ─────────────────────────────────────────────────────────────────────────
  function setupRoomDrag() {
    if (!itemsLayerEl || !roomStageEl) return;

    let activeDragEl = null;
    let activePointerId = null;
    let lastMoveEvent = null;
    let edgePanRafId = null;

    function updateItemPosition(e) {
      if (!activeDragEl || !roomStageEl) return;
      const rect = roomStageEl.getBoundingClientRect();
      let xPct = ((e.clientX - rect.left) / rect.width) * 100;
      let yPct = ((e.clientY - rect.top) / rect.height) * 100;

      // Boundary Clamping [2%, 98%] for wide panoramic canvas
      xPct = Math.max(2, Math.min(98, xPct));
      yPct = Math.max(10, Math.min(95, yPct));

      activeDragEl.style.left = `${xPct}%`;
      activeDragEl.style.top = `${yPct}%`;
      activeDragEl.style.zIndex = Math.floor(yPct * 10) + 10;
    }

    function edgePanTick() {
      if (!activeDragEl || !lastMoveEvent || !roomWrapperEl) return;

      const wrapRect = roomWrapperEl.getBoundingClientRect();
      const clientX = lastMoveEvent.clientX;
      const edgeThreshold = 75;
      let panDelta = 0;

      if (clientX < wrapRect.left + edgeThreshold) {
        const intensity = (wrapRect.left + edgeThreshold - clientX) / edgeThreshold;
        panDelta = -Math.min(18, Math.max(2, intensity * 18));
      } else if (clientX > wrapRect.right - edgeThreshold) {
        const intensity = (clientX - (wrapRect.right - edgeThreshold)) / edgeThreshold;
        panDelta = Math.min(18, Math.max(2, intensity * 18));
      }

      if (panDelta !== 0) {
        setCameraX(cameraX + panDelta, true);
        updateItemPosition(lastMoveEvent);
      }

      if (activeDragEl) {
        edgePanRafId = requestAnimationFrame(edgePanTick);
      }
    }

    itemsLayerEl.addEventListener('pointerdown', (e) => {
      // Ignore if clicking the stow button or control bubble
      if (e.target.closest('.item-stow-btn') || e.target.closest('.item-control-bubble')) return;

      const itemEl = e.target.closest('.room-item');
      if (!itemEl) return;

      e.preventDefault();
      e.stopPropagation();
      activeDragEl = itemEl;
      activePointerId = e.pointerId;
      lastMoveEvent = e;
      activeDragEl.setPointerCapture(e.pointerId);
      activeDragEl.classList.add('dragging');
      activeDragEl.classList.add('is-dragging');

      if (window.GameEngine && window.GameEngine.playSound) {
        window.GameEngine.playSound('tap');
      }

      if (edgePanRafId) cancelAnimationFrame(edgePanRafId);
      edgePanRafId = requestAnimationFrame(edgePanTick);
    });

    itemsLayerEl.addEventListener('pointermove', (e) => {
      if (!activeDragEl || e.pointerId !== activePointerId) return;
      e.preventDefault();
      lastMoveEvent = e;
      updateItemPosition(e);
    });

    const endDrag = (e) => {
      if (!activeDragEl || e.pointerId !== activePointerId) return;

      if (edgePanRafId) {
        cancelAnimationFrame(edgePanRafId);
        edgePanRafId = null;
      }

      activeDragEl.classList.remove('dragging');
      activeDragEl.classList.remove('is-dragging');
      const itemId = activeDragEl.dataset.itemId;
      const x = parseFloat(activeDragEl.style.left);
      const y = parseFloat(activeDragEl.style.top);

      try {
        activeDragEl.releasePointerCapture(e.pointerId);
      } catch (err) {}

      activeDragEl = null;
      activePointerId = null;
      lastMoveEvent = null;

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
      const iconHtml = item.image
        ? `<img src="${item.image}" alt="${item.name}" style="width: 38px; height: 38px; object-fit: contain;">`
        : `<span style="font-size: 1.6rem;">${item.emoji || item.icon || '🛋️'}</span>`;
      card.innerHTML = `
        <div class="inventory-card-icon" style="display: flex; align-items: center; justify-content: center; height: 42px;">${iconHtml}</div>
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
    // Calculate placement centered in the user's current camera view
    updateMaxScroll();
    const viewWidth = roomWrapperEl ? roomWrapperEl.clientWidth : 960;
    const viewCenterX = cameraX + (viewWidth / 2);
    const centerPct = (viewCenterX / STAGE_WIDTH) * 100;

    const x = Math.max(5, Math.min(95, Math.round(centerPct + (Math.random() * 8 - 4))));
    const y = 65 + Math.floor(Math.random() * 18);

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

    // Cycle pet pose: idle -> sit -> sleep -> idle
    const currentPose = window.GameEngine.getPetPose ? window.GameEngine.getPetPose() : 'idle';
    let nextPose = 'idle';
    if (currentPose === 'idle') nextPose = 'sit';
    else if (currentPose === 'sit') nextPose = 'sleep';
    else nextPose = 'idle';

    if (window.GameEngine.setPetPose) {
      window.GameEngine.setPetPose(nextPose);
    }
    window.GameEngine.setPetState('happy');
    if (window.GameEngine.playSound) {
      window.GameEngine.playSound('tap');
    }

    // Dynamic quote according to pose
    let randomQuote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
    if (nextPose === 'sit') {
      randomQuote = "Tớ đang ngồi chăm chỉ đọc sách ôn thi cùng bạn nè! 📖✨";
    } else if (nextPose === 'sleep') {
      randomQuote = "Khò khò... Bạn ôn thi mệt thì cùng tớ chợp mắt xíu nhé! 💤💕";
    }

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
    if (!window.GameEngine) return;
    const petObj = window.GameEngine.getPet ? window.GameEngine.getPet() : { type: 'cat', state: 'idle' };
    const pose = window.GameEngine.getPetPose ? window.GameEngine.getPetPose() : 'idle';

    const type = petObj.type || 'cat';
    const state = petObj.state || 'idle';

    // Update fallback CSS pet (preserves test backwards-compatibility)
    if (roomPetEl) {
      roomPetEl.className = `pet pet-${type} ${state} pet-lg`;
      const fxEl = roomPetEl.querySelector('.pet-fx');
      if (fxEl) {
        if (state === 'happy') fxEl.textContent = '❤️';
        else if (state === 'excited') fxEl.textContent = '✨';
        else if (state === 'sad') fxEl.textContent = '💧';
        else if (state === 'sleeping') fxEl.textContent = '💤';
        else fxEl.textContent = '❤️';
      }
    }

    // Update Full-Body Vector SVG Graphic from Catalog
    const isoPetGraphic = document.getElementById('iso-pet-graphic');
    if (isoPetGraphic && window.DATA && window.DATA.petCatalog) {
      const petDef = window.DATA.petCatalog.find(p => p.type === type);
      if (petDef && petDef.poses) {
        const svgSrc = petDef.poses[pose] || petDef.poses['idle'] || petDef.image;
        if (svgSrc) {
          isoPetGraphic.src = svgSrc;
        }
      }
    }

    // Update container z-index and pose classes
    if (petAnchorEl) {
      petAnchorEl.classList.remove('pet-pose-idle', 'pet-pose-sit', 'pet-pose-sleep', 'pet-pose-walk');
      petAnchorEl.classList.add(`pet-pose-${pose}`);
      const curY = parseFloat(petAnchorEl.style.top || '72');
      petAnchorEl.style.zIndex = Math.floor(curY * 10) + 15;
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
