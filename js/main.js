/**
 * js/main.js
 * Main Menu & Onboarding Controller for "Meow Meow Ôn Viên Chức"
 * Features:
 *   - Auto GameEngine.init() and auto check-in
 *   - Top HUD bar (stars, streak, sound toggle)
 *   - Interactive pet card with happy state, floating hearts, tap sound, cute greetings
 *   - 5 Navigation cards with locked state gating for Challenge mode
 *   - 3-Step Onboarding Modal for first-time players (pet selection, naming, starter bonus)
 */

(function() {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════
  // 1. DOM REFERENCES & STATE
  // ═════════════════════════════════════════════════════════════════════════
  let selectedOnboardingPet = 'cat';
  let isPetHappyTimeout = null;

  const PET_DEFAULT_NAMES = {
    cat: 'Miu',
    bunny: 'Bé Bông',
    bear: 'Gấu Nâu',
    duck: 'Vịt Vàng',
    hamster: 'Bé Hammy'
  };

  const PET_GREETINGS = [
    'Chào bạn! Cùng ôn bài để đỗ viên chức nhé! 💕',
    'Miu luôn ở cạnh đồng hành cùng bạn học tập nè! 🐾',
    'Hôm nay bạn đã ôn tập chăm chỉ chưa ta? ⭐',
    'Nỗ lực mỗi ngày một chút, ước mơ sẽ thành hiện thực! 🌸',
    'Cố lên nha! Tớ tin chắc bạn sẽ làm được! ✨',
    'Học xong nhớ nghỉ ngơi và uống nước nha bạn ơi! 🥛',
    'Mỗi bài ôn tập là một bước gần hơn đến kỳ thi! 🎯',
    'Bạn vất vả rồi, ôm tớ một cái lấy năng lượng nào! 🥰'
  ];

  const PET_HAPPY_QUOTES = [
    'Yay! Được nựng thích quá đi à! (≧◡≦) ❤️',
    'Miu iu bạn nhất trần đời luônn! 💖',
    'Năng lượng học tập tăng 200% rồi nè! 🚀✨',
    'Hihi nhột quá nhột quá! Cùng học tiếp thôi! 🐾',
    'Tớ có thêm sức mạnh để cổ vũ bạn rồi! 🌟'
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // 2. PET RENDERING HELPER (PURE CSS DOM)
  // ═════════════════════════════════════════════════════════════════════════
  function renderPetDOM(container, petType, petState) {
    if (!container) return;
    const type = ['cat', 'bunny', 'bear', 'duck', 'hamster'].includes(petType) ? petType : 'cat';
    const state = ['idle', 'happy', 'sad', 'excited', 'sleeping'].includes(petState) ? petState : 'idle';

    container.className = `pet pet-${type} ${state}`;

    const fxMap = {
      happy: '❤️',
      excited: '✨',
      sad: '💧',
      sleeping: '💤',
      idle: ''
    };

    container.innerHTML = `
      <div class="pet-fx">${fxMap[state] || ''}</div>
      <div class="pet-character">
        <div class="pet-ear left"></div>
        <div class="pet-ear right"></div>
        <div class="pet-head">
          <div class="pet-eyes">
            <div class="pet-eye left"></div>
            <div class="pet-eye right"></div>
          </div>
          <div class="pet-cheeks">
            <div class="pet-cheek left"></div>
            <div class="pet-cheek right"></div>
          </div>
          <div class="pet-snout">
            <div class="pet-nose"></div>
            <div class="pet-mouth"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. TOAST NOTIFICATION SYSTEM
  // ═════════════════════════════════════════════════════════════════════════
  function showToast(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;

    const icon = type === 'success' ? '🎉' : type === 'error' ? '⚠️' : '💡';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 260);
    }, duration);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. FLOATING HEARTS EMOTE
  // ═════════════════════════════════════════════════════════════════════════
  function spawnFloatingHeart(originElement) {
    const container = document.getElementById('floating-hearts-container');
    if (!container) return;

    const heart = document.createElement('span');
    heart.className = 'floating-heart';

    const emojis = ['❤️', '💖', '💕', '✨', '🐾', '🥰'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Randomize initial position and drift
    const driftX = (Math.random() - 0.5) * 60;
    const rotation = (Math.random() - 0.5) * 45;
    heart.style.left = `calc(50% + ${(Math.random() - 0.5) * 40}px)`;
    heart.style.top = '40%';
    heart.style.setProperty('--drift-x', `${driftX}px`);
    heart.style.setProperty('--rot', `${rotation}deg`);

    container.appendChild(heart);

    setTimeout(() => {
      if (heart.parentNode) {
        heart.parentNode.removeChild(heart);
      }
    }, 1200);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. UPDATE HUD & MAIN SCREEN
  // ═════════════════════════════════════════════════════════════════════════
  function updateHUD() {
    if (typeof GameEngine === 'undefined') return;

    // Stars & Streak
    const starsEl = document.getElementById('hud-stars-count');
    if (starsEl) {
      starsEl.textContent = GameEngine.getStars();
    }

    const streakEl = document.getElementById('hud-streak-count');
    if (streakEl) {
      const streak = GameEngine.getStreak();
      streakEl.textContent = streak ? streak.current : 0;
    }

    // Sound toggle state
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) {
      soundIcon.textContent = GameEngine.isSoundMuted() ? '🔇' : '🔊';
    }

    // Update pet presentation
    const pet = GameEngine.getPet();
    if (pet) {
      const petNameEl = document.getElementById('pet-display-name');
      if (petNameEl) {
        petNameEl.textContent = pet.name || 'Bé Miu';
      }

      const moodEl = document.getElementById('pet-mood-tag');
      if (moodEl) {
        const moodLabels = {
          idle: 'Đang thư giãn 🌿',
          happy: 'Rất vui vẻ 💕',
          excited: 'Hào hứng học bài 🌟',
          sad: 'Cần được yêu thương 🥺',
          sleeping: 'Đang ngủ khò 💤'
        };
        moodEl.textContent = moodLabels[pet.state] || 'Đang sẵn sàng 🐾';
      }

      const petCharEl = document.getElementById('main-pet-character');
      if (petCharEl) {
        renderPetDOM(petCharEl, pet.type, pet.state);
      }
    }

    // Challenge Unlock state
    const challengeBadge = document.getElementById('challenge-lock-badge');
    const challengeNav = document.getElementById('nav-challenge');
    const isUnlocked = GameEngine.isChallengeUnlocked();

    if (challengeBadge && challengeNav) {
      if (!isUnlocked) {
        challengeBadge.style.display = 'flex';
        challengeNav.classList.add('locked');
      } else {
        challengeBadge.style.display = 'none';
        challengeNav.classList.remove('locked');
      }
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. PET CARD INTERACTION
  // ═════════════════════════════════════════════════════════════════════════
  function triggerPetHappyReaction() {
    if (typeof GameEngine === 'undefined') return;

    // 1. Play tap sound
    GameEngine.playSound('tap');

    // 2. Set pet state to happy
    GameEngine.setPetState('happy');

    // 3. Render happy animation
    const pet = GameEngine.getPet();
    const petCharEl = document.getElementById('main-pet-character');
    if (petCharEl) {
      renderPetDOM(petCharEl, pet.type, 'happy');
    }

    // 4. Spawn floating heart emotes
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnFloatingHeart(petCharEl), i * 140);
    }

    // 5. Update speech bubble with cute happy quote
    const bubble = document.getElementById('pet-speech-bubble');
    if (bubble) {
      const quote = PET_HAPPY_QUOTES[Math.floor(Math.random() * PET_HAPPY_QUOTES.length)];
      bubble.textContent = quote;
      bubble.style.animation = 'none';
      void bubble.offsetWidth; // trigger reflow
      bubble.style.animation = 'pulse 0.4s ease';
    }

    // 6. Revert to idle state after 3.5 seconds
    if (isPetHappyTimeout) {
      clearTimeout(isPetHappyTimeout);
    }
    isPetHappyTimeout = setTimeout(() => {
      GameEngine.setPetState('idle');
      updateHUD();
      if (bubble) {
        bubble.textContent = PET_GREETINGS[Math.floor(Math.random() * PET_GREETINGS.length)];
      }
    }, 3500);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. ONBOARDING MODAL CONTROLLER
  // ═════════════════════════════════════════════════════════════════════════
  function setupOnboardingModal() {
    if (typeof GameEngine === 'undefined') return;

    const modal = document.getElementById('onboarding-modal');
    if (!modal) return;

    // Check if user is first-time
    if (!GameEngine.isFirstTime()) {
      modal.classList.remove('active');
      return;
    }

    // Display modal
    modal.classList.add('active');

    // Populate pet catalog from DATA.petCatalog
    const grid = document.getElementById('onboarding-pet-grid');
    const petDesc = document.getElementById('selected-pet-desc');
    const petEmoji = document.getElementById('selected-pet-emoji');
    const nameInput = document.getElementById('onboarding-pet-name');
    const charCount = document.getElementById('pet-name-count');
    const errorMsg = document.getElementById('name-error-msg');

    const catalog = (typeof DATA !== 'undefined' && Array.isArray(DATA.petCatalog)) ? DATA.petCatalog : [
      { type: 'cat', name: 'Mèo Con', emoji: '🐱', description: 'Bé mèo tam thể tinh nghịch, luôn quanh quẩn bên bạn mỗi khi học bài.' },
      { type: 'bunny', name: 'Thỏ Con', emoji: '🐰', description: 'Bé thỏ trắng tai dài đáng yêu, thích ăn cà rốt và chăm chỉ làm flashcard.' },
      { type: 'bear', name: 'Gấu Bông', emoji: '🐻', description: 'Chú gấu nâu tròn trĩnh ấm áp, luôn kiên nhẫn cổ vũ bạn vượt qua câu khó.' },
      { type: 'duck', name: 'Vịt Con', emoji: '🦆', description: 'Chú vịt vàng lí lắc, biết nhảy múa ăn mừng mỗi khi bạn làm đúng 100% quiz.' },
      { type: 'hamster', name: 'Hamster', emoji: '🐹', description: 'Bé chuột hamster má phúng phính, biểu tượng cho sự nỗ lực bền bỉ mỗi ngày.' }
    ];

    selectedOnboardingPet = 'cat';

    if (grid) {
      grid.innerHTML = '';
      catalog.forEach(item => {
        const petCard = document.createElement('div');
        petCard.className = `pet-select-item ${item.type === selectedOnboardingPet ? 'selected' : ''}`;
        petCard.setAttribute('data-pet-type', item.type);
        petCard.innerHTML = `
          <div class="pet-select-emoji">${item.emoji || '🐾'}</div>
          <div class="pet-select-name">${item.name}</div>
        `;

        petCard.addEventListener('click', () => {
          selectedOnboardingPet = item.type;
          GameEngine.playSound('tap');

          // Highlight selection
          document.querySelectorAll('.pet-select-item').forEach(el => el.classList.remove('selected'));
          petCard.classList.add('selected');

          // Update preview
          if (petEmoji) petEmoji.textContent = item.emoji || '🐾';
          if (petDesc) petDesc.textContent = item.description || '';

          // Auto-fill default name if user hasn't typed custom name
          if (nameInput) {
            nameInput.value = PET_DEFAULT_NAMES[item.type] || 'Miu';
            if (charCount) charCount.textContent = `${nameInput.value.length}/20`;
            if (errorMsg) errorMsg.style.display = 'none';
          }
        });

        grid.appendChild(petCard);
      });
    }

    // Name input validation and character count
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const val = nameInput.value;
        if (charCount) charCount.textContent = `${val.length}/20`;
        if (errorMsg && val.trim().length > 0 && val.trim().length <= 20) {
          errorMsg.style.display = 'none';
        }
      });
    }

    // Complete onboarding button handler
    const btnComplete = document.getElementById('btn-complete-onboarding');
    if (btnComplete) {
      btnComplete.addEventListener('click', () => {
        const rawName = nameInput ? nameInput.value : '';
        const trimmed = rawName.trim();

        if (trimmed.length < 1 || trimmed.length > 20) {
          if (errorMsg) {
            errorMsg.textContent = 'Vui lòng nhập tên từ 1 đến 20 ký tự nhé!';
            errorMsg.style.display = 'block';
          }
          if (nameInput) nameInput.focus();
          return;
        }

        // Set pet type & name
        GameEngine.setPetType(selectedOnboardingPet);
        GameEngine.setPetName(trimmed);

        // Complete onboarding in engine
        GameEngine.completeOnboarding(selectedOnboardingPet, trimmed);

        // Award starter bonus if starting fresh with 0 stars
        if (GameEngine.getStars() === 0) {
          GameEngine.earnStars(10, 'starter_bonus');
        }

        // Play victory sound and close modal
        GameEngine.playSound('star');
        modal.classList.remove('active');

        // Update HUD & pet display
        updateHUD();

        // Congratulatory toast
        showToast(`🎉 Chào mừng bé ${trimmed} về nhà mới! Bạn nhận được 10 ⭐ quà tân thủ!`, 'success', 4500);
      });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 8. EVENT LISTENERS SETUP
  // ═════════════════════════════════════════════════════════════════════════
  function setupEventListeners() {
    // 1. Interactive Pet click
    const petArea = document.getElementById('pet-interactive-area');
    if (petArea) {
      petArea.addEventListener('click', triggerPetHappyReaction);
      petArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerPetHappyReaction();
        }
      });
    }

    // 2. Audio Toggle button
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') {
          const isMuted = GameEngine.toggleSound();
          const soundIcon = document.getElementById('sound-icon');
          if (soundIcon) {
            soundIcon.textContent = isMuted ? '🔇' : '🔊';
          }
          if (!isMuted) {
            GameEngine.playSound('tap');
          }
          showToast(isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh 🎵', 'info', 1800);
        }
      });
    }

    // 3. Challenge navigation guard
    const challengeNav = document.getElementById('nav-challenge');
    if (challengeNav) {
      challengeNav.addEventListener('click', (e) => {
        if (typeof GameEngine !== 'undefined' && !GameEngine.isChallengeUnlocked()) {
          e.preventDefault();
          GameEngine.playSound('wrong');
          showToast('🔒 Chế độ Thử Thách chưa mở khóa! Hãy hoàn thành ít nhất 1 bài Ôn Bài nhé!', 'error', 3600);
        }
      });
    }

    // 4. Random greeting cycle on speech bubble click
    const bubble = document.getElementById('pet-speech-bubble');
    if (bubble) {
      bubble.addEventListener('click', () => {
        GameEngine.playSound('tap');
        const quote = PET_GREETINGS[Math.floor(Math.random() * PET_GREETINGS.length)];
        bubble.textContent = quote;
      });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 9. APP LIFECYCLE INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════
  function initApp() {
    if (typeof GameEngine === 'undefined') {
      console.error('[main.js] GameEngine is not loaded.');
      return;
    }

    // Initialize Game Engine
    GameEngine.init();

    // Auto Daily Check-in
    const prevStreak = GameEngine.getStreak() ? GameEngine.getStreak().current : 0;
    GameEngine.checkIn();
    const newStreak = GameEngine.getStreak() ? GameEngine.getStreak().current : 0;

    // Check if new day check-in was awarded
    if (newStreak > prevStreak) {
      showToast(`🔥 Điểm danh ngày mới thành công! Chuỗi streak: ${newStreak} ngày (+5 ⭐)`, 'success', 4000);
    }

    // Setup UI and Modals
    setupEventListeners();
    setupOnboardingModal();
    updateHUD();

    // Listen to engine events for real-time reactive updates
    if (typeof GameEngine.on === 'function') {
      GameEngine.on('stars:earned', updateHUD);
      GameEngine.on('stars:spent', updateHUD);
      GameEngine.on('pet:changed', updateHUD);
      GameEngine.on('challenge:unlocked', updateHUD);
    }
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
