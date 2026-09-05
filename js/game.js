/**
 * js/game.js
 * Core Game Engine for "Meow Meow Ôn Viên Chức"
 * Revealing Module Pattern (IIFE) Singleton
 * Authoritative storage key: "meowmeow_state" (alias: "meow_study_game_state")
 * Zero external dependencies. Fully client-side and offline capable.
 */

const GameEngine = (function() {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════
  // 1. STORAGE ADAPTER (DUAL-KEY + IN-MEMORY FALLBACK)
  // ═════════════════════════════════════════════════════════════════════════
  const PRIMARY_KEY = 'meowmeow_state';
  const ALIAS_KEY = 'meow_study_game_state';

  const StorageAdapter = (function() {
    const _memoryStore = {};
    let _hasLocalStorage = false;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = '__meow_quota_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        _hasLocalStorage = true;
      }
    } catch (e) {
      _hasLocalStorage = false;
    }

    return {
      getItem(key) {
        if (_hasLocalStorage) {
          try {
            const val = window.localStorage.getItem(key);
            if (val !== null && val !== undefined) return val;
          } catch (e) {}
        }
        return Object.prototype.hasOwnProperty.call(_memoryStore, key) ? _memoryStore[key] : null;
      },
      setItem(key, value) {
        const valStr = String(value);
        _memoryStore[key] = valStr;
        if (_hasLocalStorage) {
          try {
            window.localStorage.setItem(key, valStr);
          } catch (e) {
            // QuotaExceeded or Private Browsing security block: in-memory preserved
          }
        }
      },
      removeItem(key) {
        delete _memoryStore[key];
        if (_hasLocalStorage) {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {}
        }
      },
      clear() {
        for (const k in _memoryStore) delete _memoryStore[k];
        if (_hasLocalStorage) {
          try {
            window.localStorage.clear();
          } catch (e) {}
        }
      }
    };
  })();

  // ═════════════════════════════════════════════════════════════════════════
  // 2. PRIVATE STATE & EVENT BUS
  // ═════════════════════════════════════════════════════════════════════════
  let _state = null;
  const _listeners = {};
  let _audioCtx = null;

  function on(eventName, callback) {
    if (typeof callback !== 'function') return () => {};
    if (!_listeners[eventName]) _listeners[eventName] = [];
    _listeners[eventName].push(callback);
    return () => off(eventName, callback);
  }

  function off(eventName, callback) {
    if (!_listeners[eventName]) return;
    _listeners[eventName] = _listeners[eventName].filter(cb => cb !== callback);
  }

  function emit(eventName, data) {
    if (!_listeners[eventName]) return;
    const subscribers = [..._listeners[eventName]];
    for (const cb of subscribers) {
      try {
        cb(data);
      } catch (err) {
        console.error(`[GameEngine] Error in event listener for ${eventName}:`, err);
      }
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. DATE UTILITIES (LOCAL TIME PRESERVATION)
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * Get today's local date as YYYY-MM-DD
   * Uses getFullYear(), getMonth()+1, getDate() to avoid UTC midnight rollover bugs.
   */
  function getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Add n days to a YYYY-MM-DD date string safely.
   */
  function addDays(dateStr, days) {
    if (!dateStr || typeof dateStr !== 'string') return getTodayStr();
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return getTodayStr();
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dt}`;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. INITIAL STATE FACTORY & DEEP MERGE
  // ═════════════════════════════════════════════════════════════════════════
  function createInitialState() {
    const today = getTodayStr();
    return {
      version: 1,
      initialized: false,
      createdAt: today,
      settings: {
        soundMuted: false
      },
      player: {
        totalStarsEarned: 0,
        currentStars: 0
      },
      pet: {
        type: 'cat',
        name: 'Miu',
        state: 'idle',
        stateChangedAt: null
      },
      streak: {
        current: 0,
        lastCheckIn: null,
        longest: 0
      },
      room: {
        wallpaper: 'default',
        floor: 'default',
        placedItems: []
      },
      ownedItems: [],
      ownedPets: ['cat'],
      progress: {},
      badges: [],
      highScores: {
        speed: 0,
        survival: 0,
        combo: 0,
        boss: 0
      },
      stats: {
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        dailyLog: {}
      },
      challengeUnlocked: false
    };
  }

  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    const output = { ...target };
    for (const key of Object.keys(source)) {
      const srcVal = source[key];
      const tgtVal = target ? target[key] : undefined;

      if (srcVal === null || srcVal === undefined) {
        if (tgtVal !== undefined) output[key] = tgtVal;
      } else if (typeof srcVal === 'object' && !Array.isArray(srcVal)) {
        output[key] = deepMerge(tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal) ? tgtVal : {}, srcVal);
      } else if (Array.isArray(tgtVal)) {
        output[key] = Array.isArray(srcVal) ? srcVal : tgtVal;
      } else {
        output[key] = srcVal;
      }
    }
    return output;
  }


  // ═════════════════════════════════════════════════════════════════════════
  // 5. WEB AUDIO SYNTHESIZER (ZERO ASSETS)
  // ═════════════════════════════════════════════════════════════════════════
  function getAudioContext() {
    if (_audioCtx) return _audioCtx;
    try {
      const AudioContextClass =
        (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
        (typeof globalThis !== 'undefined' && globalThis.AudioContext) ||
        null;
      if (AudioContextClass) {
        _audioCtx = new AudioContextClass();
      }
    } catch (e) {
      _audioCtx = null;
    }
    return _audioCtx;
  }

  function playTone(freq, type, startTime, duration, startGain = 0.2, endGain = 0.001) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      if (typeof freq === 'number') {
        osc.frequency.setValueAtTime(freq, startTime);
      }

      gain.gain.setValueAtTime(startGain, startTime);
      if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
        gain.gain.exponentialRampToValueAtTime(Math.max(endGain, 0.0001), startTime + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Gracefully ignore audio synthesis errors
    }
  }

  function playSound(name) {
    if (isSoundMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime || 0;

      switch (name) {
        case 'tap': {
          // Soft cheerful pop: 600Hz -> 800Hz, 60ms
          playTone(600, 'sine', now, 0.06, 0.25, 0.001);
          break;
        }
        case 'correct': {
          // Ascending 3-note chime: C5 (523.25) -> E5 (659.25) -> G5 (783.99)
          playTone(523.25, 'sine', now, 0.16, 0.3, 0.001);
          playTone(659.25, 'sine', now + 0.08, 0.16, 0.3, 0.001);
          playTone(783.99, 'sine', now + 0.16, 0.22, 0.35, 0.001);
          break;
        }
        case 'wrong': {
          // Low downward buzz: 220Hz -> 140Hz
          playTone(220, 'sawtooth', now, 0.22, 0.2, 0.001);
          break;
        }
        case 'star': {
          // Sparkly ascending coin shimmer: B5 (987.77) -> E6 (1318.51)
          playTone(987.77, 'triangle', now, 0.08, 0.28, 0.001);
          playTone(1318.51, 'sine', now + 0.06, 0.18, 0.32, 0.001);
          break;
        }
        case 'fanfare':
        case 'victory': {
          // Triumphant victory fanfare: C5 -> E5 -> G5 -> C6
          playTone(523.25, 'sine', now, 0.15, 0.3, 0.001);
          playTone(659.25, 'sine', now + 0.1, 0.15, 0.3, 0.001);
          playTone(783.99, 'sine', now + 0.2, 0.18, 0.3, 0.001);
          playTone(1046.5, 'sine', now + 0.35, 0.45, 0.35, 0.001);
          break;
        }
        default:
          playTone(600, 'sine', now, 0.05, 0.1, 0.001);
          break;
      }
    } catch (e) {}
  }

  function toggleSound() {
    if (!_state) init();
    _state.settings.soundMuted = !_state.settings.soundMuted;
    saveState();
    emit('sound:toggled', { muted: _state.settings.soundMuted });
    return _state.settings.soundMuted;
  }

  function isSoundMuted() {
    if (!_state) init();
    return Boolean(_state.settings && _state.settings.soundMuted);
  }

  function setSoundMuted(muted) {
    if (!_state) init();
    _state.settings.soundMuted = Boolean(muted);
    saveState();
    emit('sound:toggled', { muted: _state.settings.soundMuted });
  }

  function playVictory() {
    playSound('fanfare');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. LIFECYCLE & STATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════
  function init() {
    const rawPrimary = StorageAdapter.getItem(PRIMARY_KEY);
    const rawAlias = StorageAdapter.getItem(ALIAS_KEY);
    const rawData = rawPrimary !== null ? rawPrimary : rawAlias;

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed && typeof parsed === 'object') {
          _state = deepMerge(createInitialState(), parsed);
          // Defensive normalization
          if (!_state.player || typeof _state.player !== 'object') {
            _state.player = { totalStarsEarned: 0, currentStars: 0 };
          }
          if (typeof _state.player.currentStars !== 'number' || isNaN(_state.player.currentStars) || _state.player.currentStars < 0) {
            _state.player.currentStars = 0;
          }
          if (typeof _state.player.totalStarsEarned !== 'number' || isNaN(_state.player.totalStarsEarned) || _state.player.totalStarsEarned < 0) {
            _state.player.totalStarsEarned = _state.player.currentStars;
          }
          if (!_state.pet || typeof _state.pet !== 'object') {
            _state.pet = { type: 'cat', name: 'Miu', state: 'idle', stateChangedAt: null };
          }
          if (!_state.streak || typeof _state.streak !== 'object') {
            _state.streak = { current: 0, lastCheckIn: null, longest: 0 };
          } else {
            if (typeof _state.streak.current !== 'number' || isNaN(_state.streak.current) || _state.streak.current < 0) {
              _state.streak.current = 0;
            }
            if (typeof _state.streak.longest !== 'number' || isNaN(_state.streak.longest) || _state.streak.longest < 0) {
              _state.streak.longest = _state.streak.current;
            }
          }
          if (!_state.room || typeof _state.room !== 'object') {
            _state.room = { wallpaper: 'default', floor: 'default', placedItems: [] };
          } else {
            if (typeof _state.room.wallpaper !== 'string') _state.room.wallpaper = 'default';
            if (typeof _state.room.floor !== 'string') _state.room.floor = 'default';
            if (!Array.isArray(_state.room.placedItems)) {
              _state.room.placedItems = [];
            }
          }
          if (!_state.progress || typeof _state.progress !== 'object' || Array.isArray(_state.progress)) {
            _state.progress = {};
          }
          if (!Array.isArray(_state.ownedPets) || _state.ownedPets.length === 0) {
            _state.ownedPets = ['cat'];
          } else if (!_state.ownedPets.includes('cat')) {
            _state.ownedPets.unshift('cat');
          }
          if (!Array.isArray(_state.ownedItems)) {
            _state.ownedItems = [];
          }
          if (!Array.isArray(_state.badges)) {
            _state.badges = [];
          }
          if (!_state.highScores || typeof _state.highScores !== 'object' || Array.isArray(_state.highScores)) {
            _state.highScores = { speed: 0, survival: 0, combo: 0, boss: 0 };
          } else {
            if (typeof _state.highScores.speed !== 'number' || isNaN(_state.highScores.speed)) _state.highScores.speed = 0;
            if (typeof _state.highScores.survival !== 'number' || isNaN(_state.highScores.survival)) _state.highScores.survival = 0;
            if (typeof _state.highScores.combo !== 'number' || isNaN(_state.highScores.combo)) _state.highScores.combo = 0;
            if (typeof _state.highScores.boss !== 'number' || isNaN(_state.highScores.boss)) _state.highScores.boss = 0;
          }
          if (!_state.stats || typeof _state.stats !== 'object' || Array.isArray(_state.stats)) {
            _state.stats = { totalQuestionsAnswered: 0, totalCorrect: 0, dailyLog: {} };
          } else {
            if (typeof _state.stats.totalQuestionsAnswered !== 'number' || isNaN(_state.stats.totalQuestionsAnswered)) {
              _state.stats.totalQuestionsAnswered = 0;
            }
            if (typeof _state.stats.totalCorrect !== 'number' || isNaN(_state.stats.totalCorrect)) {
              _state.stats.totalCorrect = 0;
            }
            if (!_state.stats.dailyLog || typeof _state.stats.dailyLog !== 'object' || Array.isArray(_state.stats.dailyLog)) {
              _state.stats.dailyLog = {};
            }
          }
          return getState();
        }
      } catch (e) {
        console.warn('[GameEngine] Corrupt state detected in storage. Recovering clean initial state.');
      }
    }

    _state = createInitialState();
    saveState();
    return getState();
  }

  function getState() {
    if (!_state) init();
    return JSON.parse(JSON.stringify(_state));
  }

  function saveState() {
    if (!_state) return;
    const serialized = JSON.stringify(_state);
    StorageAdapter.setItem(PRIMARY_KEY, serialized);
    StorageAdapter.setItem(ALIAS_KEY, serialized);
    emit('state:changed', { state: getState() });
  }

  function resetGame(confirmed) {
    if (confirmed !== true) {
      return getState();
    }
    StorageAdapter.removeItem(PRIMARY_KEY);
    StorageAdapter.removeItem(ALIAS_KEY);
    _state = createInitialState();
    saveState();
    return getState();
  }

  function resetState(confirmed) {
    return resetGame(confirmed);
  }

  function isFirstTime() {
    if (!_state) init();
    return !_state.initialized;
  }

  function completeOnboarding(petType, petName) {
    if (!_state) init();
    const VALID_PETS = ['cat', 'bunny', 'bear', 'duck', 'hamster'];
    const validType = VALID_PETS.includes(petType) ? petType : 'cat';
    const trimmedName = typeof petName === 'string' ? petName.trim() : '';
    const finalName = trimmedName.length > 0 ? trimmedName.slice(0, 20) : 'Miu';

    _state.pet.type = validType;
    _state.pet.name = finalName;
    _state.pet.state = 'idle';
    _state.pet.stateChangedAt = new Date().toISOString();

    if (!_state.ownedPets.includes(validType)) {
      _state.ownedPets.push(validType);
    }

    _state.initialized = true;
    saveState();
    emit('pet:changed', { pet: getPet(), event: 'onboarding_complete' });
    return getState();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. STAR ECONOMY
  // ═════════════════════════════════════════════════════════════════════════
  function getStars() {
    if (!_state) init();
    return _state.player.currentStars;
  }

  function getTotalStarsEarned() {
    if (!_state) init();
    return _state.player.totalStarsEarned;
  }

  function canAfford(amount) {
    if (!_state) init();
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || !Number.isFinite(amount)) {
      return false;
    }
    return _state.player.currentStars >= Math.floor(amount);
  }

  function earnStars(amount, source) {
    if (!_state) init();
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || !Number.isFinite(amount)) {
      return _state.player.currentStars;
    }

    const intAmount = Math.floor(amount);
    _state.player.currentStars += intAmount;
    _state.player.totalStarsEarned += intAmount;

    const today = getTodayStr();
    if (!_state.stats.dailyLog[today]) {
      _state.stats.dailyLog[today] = { answered: 0, correct: 0, starsEarned: 0 };
    }
    _state.stats.dailyLog[today].starsEarned += intAmount;

    checkBadges();
    saveState();
    emit('stars:changed', {
      currentStars: _state.player.currentStars,
      totalStarsEarned: _state.player.totalStarsEarned,
      diff: intAmount,
      source: source || 'unknown'
    });

    return _state.player.currentStars;
  }

  function spendStars(amount, reason) {
    if (!_state) init();
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || !Number.isFinite(amount)) {
      return { success: false, message: 'Số sao chi tiêu không hợp lệ!' };
    }

    const intAmount = Math.floor(amount);
    if (_state.player.currentStars < intAmount) {
      const missing = intAmount - _state.player.currentStars;
      return {
        success: false,
        message: `Bạn còn thiếu ${missing} ⭐ để thực hiện giao dịch!`
      };
    }

    _state.player.currentStars -= intAmount;
    saveState();
    emit('stars:changed', {
      currentStars: _state.player.currentStars,
      totalStarsEarned: _state.player.totalStarsEarned,
      diff: -intAmount,
      source: reason || 'purchase'
    });

    return { success: true, message: 'Giao dịch thành công!' };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 8. PET SYSTEM
  // ═════════════════════════════════════════════════════════════════════════
  function getPet() {
    if (!_state) init();
    return { ..._state.pet };
  }

  function setPetState(newState) {
    if (!_state) init();
    const VALID_STATES = ['idle', 'happy', 'sad', 'excited', 'sleeping'];
    const targetState = VALID_STATES.includes(newState) ? newState : 'idle';
    _state.pet.state = targetState;
    _state.pet.stateChangedAt = new Date().toISOString();
    saveState();
    emit('pet:changed', { pet: getPet(), event: 'state_changed' });
  }

  function switchPet(petType) {
    if (!_state) init();
    if (!_state.ownedPets.includes(petType)) {
      return { success: false, message: 'Bạn chưa nhận nuôi bé pet này!' };
    }
    _state.pet.type = petType;
    _state.pet.state = 'idle';
    _state.pet.stateChangedAt = new Date().toISOString();
    saveState();
    emit('pet:changed', { pet: getPet(), event: 'switched' });
    return { success: true, message: 'Đổi pet thành công!' };
  }

  function setPetType(petType) {
    return switchPet(petType);
  }

  function renamePet(newName) {
    if (!_state) init();
    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return { success: false, name: _state.pet.name };
    }
    _state.pet.name = newName.trim().slice(0, 20);
    saveState();
    emit('pet:changed', { pet: getPet(), event: 'renamed' });
    return { success: true, name: _state.pet.name };
  }

  function setPetName(newName) {
    return renamePet(newName);
  }

  function updatePetReaction(event) {
    if (!_state) init();
    switch (event) {
      case 'quiz_correct':
      case 'flashcard_remembered':
      case 'set_completed':
        setPetState('happy');
        break;
      case 'perfect_score':
      case 'boss_victory':
        setPetState('excited');
        break;
      case 'wrong_answer_streak':
      case 'quiz_wrong':
      case 'heart_lost':
        setPetState('sad');
        break;
      case 'idle_timeout':
      case 'sleep':
        setPetState('sleeping');
        break;
      default:
        setPetState('idle');
        break;
    }
    return _state.pet.state;
  }

  function unlockPet(petType) {
    if (!_state) init();
    const catalog =
      (typeof DATA !== 'undefined' && DATA.petCatalog) ? DATA.petCatalog : [];
    const petDef = catalog.find(p => p.type === petType);
    if (!petDef) {
      return { success: false, message: 'Pet không tồn tại trong danh mục!' };
    }
    if (_state.ownedPets.includes(petType)) {
      return { success: false, message: 'Bạn đã nhận nuôi bé pet này rồi!' };
    }

    if (petDef.price > 0) {
      const payment = spendStars(petDef.price, 'buy_pet');
      if (!payment.success) return payment;
    }

    _state.ownedPets.push(petType);
    checkBadges();
    saveState();
    emit('pet:changed', { pet: getPet(), event: 'pet_unlocked' });
    return { success: true, message: 'Nhận nuôi thành công!' };
  }

  function buyPet(petType) {
    return unlockPet(petType);
  }

  function getOwnedPets() {
    if (!_state) init();
    return [..._state.ownedPets];
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 9. DAILY STREAK SYSTEM
  // ═════════════════════════════════════════════════════════════════════════
  function getStreak() {
    if (!_state) init();
    return { ..._state.streak };
  }

  function checkIn() {
    if (!_state) init();
    const today = getTodayStr();
    const yesterday = addDays(today, -1);
    const isoToday = new Date().toISOString().split('T')[0];
    const isoYesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const last = _state.streak.lastCheckIn;

    // Idempotent check: already checked in today
    if (last === today || last === isoToday) {
      return { changed: false, streak: _state.streak.current, starsEarned: 0 };
    }

    // Consecutive check-in
    if (last === yesterday || last === isoYesterday) {
      _state.streak.current++;
    } else {
      // First time or broken streak
      _state.streak.current = 1;
    }

    _state.streak.lastCheckIn = today;
    _state.streak.longest = Math.max(_state.streak.longest, _state.streak.current);

    let earned = 5;
    earnStars(5, 'daily_checkin');

    if (_state.streak.current % 7 === 0) {
      earned += 20;
      earnStars(20, 'streak_bonus');
    }

    checkBadges();
    saveState();

    return { changed: true, streak: _state.streak.current, starsEarned: earned };
  }

  function checkStreak() {
    return checkIn();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 10. ROOM DECORATION & CLAMPING
  // ═════════════════════════════════════════════════════════════════════════
  function getRoom() {
    if (!_state) init();
    return {
      ..._state.room,
      placedItems: _state.room.placedItems.map(p => ({ ...p }))
    };
  }

  function placeItem(itemId, x, y) {
    if (!_state) init();

    const numX = Number(x);
    const numY = Number(y);
    const safeX = isNaN(numX) ? 0 : numX;
    const safeY = isNaN(numY) ? 0 : numY;

    const clampedX = Math.max(0, Math.min(100, safeX));
    const clampedY = Math.max(0, Math.min(100, safeY));

    const existing = _state.room.placedItems.find(p => p.itemId === itemId);
    if (existing) {
      existing.x = clampedX;
      existing.y = clampedY;
    } else {
      _state.room.placedItems.push({ itemId, x: clampedX, y: clampedY });
    }

    saveState();
    emit('room:changed', { room: getRoom() });
    return [..._state.room.placedItems];
  }

  function moveItem(itemId, x, y) {
    return placeItem(itemId, x, y);
  }

  function removeItem(itemId) {
    if (!_state) init();
    _state.room.placedItems = _state.room.placedItems.filter(p => p.itemId !== itemId);
    saveState();
    emit('room:changed', { room: getRoom() });
    return _state.room.placedItems;
  }

  function changeWallpaper(wallpaperId) {
    if (!_state) init();
    _state.room.wallpaper = String(wallpaperId);
    saveState();
    emit('room:changed', { room: getRoom() });
  }

  function setWallpaper(wallpaperId) {
    changeWallpaper(wallpaperId);
  }

  function changeFloor(floorId) {
    if (!_state) init();
    _state.room.floor = String(floorId);
    saveState();
    emit('room:changed', { room: getRoom() });
  }

  function setFloor(floorId) {
    changeFloor(floorId);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 11. SHOP & INVENTORY
  // ═════════════════════════════════════════════════════════════════════════
  function getShopCatalog() {
    return (typeof DATA !== 'undefined' && DATA.shopItems) ? DATA.shopItems : [];
  }

  function isItemOwned(itemId) {
    if (!_state) init();
    return _state.ownedItems.includes(itemId);
  }

  function getOwnedItems() {
    if (!_state) init();
    return [..._state.ownedItems];
  }

  function buyItem(itemId) {
    if (!_state) init();
    const catalog = getShopCatalog();
    const item = catalog.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Vật phẩm không tồn tại trong cửa hàng!' };
    }
    if (isItemOwned(itemId)) {
      return { success: false, message: 'Bạn đã sở hữu vật phẩm này rồi!' };
    }

    const pay = spendStars(item.price, 'buy_item');
    if (!pay.success) return pay;

    _state.ownedItems.push(itemId);
    checkBadges();
    saveState();
    return { success: true, message: 'Mua thành công!' };
  }

  function getInventory() {
    if (!_state) init();
    const placedIds = new Set(_state.room.placedItems.map(p => p.itemId));
    const unplacedIds = _state.ownedItems.filter(id => !placedIds.has(id));
    const catalog = getShopCatalog();
    return unplacedIds.map(id => catalog.find(item => item.id === id) || { id, name: id });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 12. SPACED REPETITION (SRS) & LEARNING PROGRESS
  // ═════════════════════════════════════════════════════════════════════════
  const SRS_INTERVALS = [1, 3, 7, 15, 30];

  function markAnswered(questionId, isCorrect) {
    if (!_state) init();
    const today = getTodayStr();

    if (!_state.progress[questionId]) {
      _state.progress[questionId] = {
        status: 'new',
        correctCount: 0,
        lastAnswered: null,
        nextReview: null
      };
    }

    const p = _state.progress[questionId];
    _state.stats.totalQuestionsAnswered++;
    if (isCorrect) _state.stats.totalCorrect++;

    if (!_state.stats.dailyLog[today]) {
      _state.stats.dailyLog[today] = { answered: 0, correct: 0, starsEarned: 0 };
    }
    _state.stats.dailyLog[today].answered++;
    if (isCorrect) _state.stats.dailyLog[today].correct++;

    if (isCorrect) {
      p.correctCount++;
      const intervalIdx = Math.min(p.correctCount - 1, SRS_INTERVALS.length - 1);
      const days = SRS_INTERVALS[intervalIdx];
      p.nextReview = addDays(today, days);
      p.status = p.correctCount >= 5 ? 'mastered' : 'learning';
    } else {
      p.correctCount = 0;
      p.nextReview = addDays(today, 1);
      p.status = 'review';
    }

    p.lastAnswered = today;

    checkBadges();
    saveState();
    return { ...p };
  }

  function getProgress(questionId) {
    if (!_state) init();
    const p = _state.progress[questionId];
    if (p) return { ...p };
    return {
      status: 'new',
      correctCount: 0,
      lastAnswered: null,
      nextReview: null
    };
  }

  function getTodayReview(topicId) {
    if (!_state) init();
    const allQuestions = (typeof DATA !== 'undefined' && DATA.questions) ? DATA.questions : [];
    const pool = topicId ? allQuestions.filter(q => q.topicId === topicId) : [...allQuestions];
    const today = getTodayStr();

    const tier1 = []; // Due for review today or marked review
    const tier2 = []; // Brand new questions
    const tier3 = []; // Learning, not yet due
    const tier4 = []; // Mastered, not yet due

    for (const q of pool) {
      const p = _state.progress[q.id];
      if (!p || p.status === 'new') {
        tier2.push(q);
      } else if (p.status === 'review' || (p.nextReview && p.nextReview <= today)) {
        tier1.push(q);
      } else if (p.status === 'learning') {
        tier3.push(q);
      } else if (p.status === 'mastered') {
        tier4.push(q);
      } else {
        tier2.push(q);
      }
    }

    // Sort Tier 1 by nextReview date ascending (oldest due first)
    tier1.sort((a, b) => {
      const revA = (_state.progress[a.id] && _state.progress[a.id].nextReview) || '';
      const revB = (_state.progress[b.id] && _state.progress[b.id].nextReview) || '';
      return revA.localeCompare(revB);
    });

    return [...tier1, ...tier2, ...tier3, ...tier4];
  }

  function getTopicProgress(topicId) {
    if (!_state) init();
    const allQuestions = (typeof DATA !== 'undefined' && DATA.questions) ? DATA.questions : [];
    const pool = allQuestions.filter(q => q.topicId === topicId);
    const today = getTodayStr();

    let mastered = 0;
    let learning = 0;
    let review = 0;
    let newCount = 0;

    for (const q of pool) {
      const p = _state.progress[q.id];
      if (!p || p.status === 'new') {
        newCount++;
      } else if (p.status === 'mastered') {
        mastered++;
      } else if (p.status === 'review' || (p.nextReview && p.nextReview <= today)) {
        review++;
      } else {
        learning++;
      }
    }

    const total = pool.length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return {
      total,
      mastered,
      learning,
      review,
      new: newCount,
      percentage
    };
  }

  function getTopicStats(topicId) {
    return getTopicProgress(topicId);
  }

  function getAllProgress() {
    if (!_state) init();
    const allQuestions = (typeof DATA !== 'undefined' && DATA.questions) ? DATA.questions : [];
    const today = getTodayStr();

    let mastered = 0;
    let learning = 0;
    let review = 0;
    let newCount = 0;

    for (const q of allQuestions) {
      const p = _state.progress[q.id];
      if (!p || p.status === 'new') {
        newCount++;
      } else if (p.status === 'mastered') {
        mastered++;
      } else if (p.status === 'review' || (p.nextReview && p.nextReview <= today)) {
        review++;
      } else {
        learning++;
      }
    }

    const totalQuestions = allQuestions.length;
    const overallPercentage = totalQuestions > 0 ? Math.round((mastered / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      mastered,
      learning,
      review,
      new: newCount,
      overallPercentage
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 13. CHALLENGE MODES
  // ═════════════════════════════════════════════════════════════════════════
  function isChallengeUnlocked() {
    if (!_state) init();
    return Boolean(_state.challengeUnlocked);
  }

  function unlockChallenge() {
    if (!_state) init();
    _state.challengeUnlocked = true;
    saveState();
    emit('challenge:unlocked', {});
    return true;
  }

  function getHighScores() {
    if (!_state) init();
    return { ..._state.highScores };
  }

  function updateHighScore(mode, score) {
    if (!_state) init();
    const VALID_MODES = ['speed', 'survival', 'combo', 'boss'];
    if (!VALID_MODES.includes(mode)) {
      return { isNewHighScore: false, highScore: 0 };
    }

    const numScore = Number(score) || 0;
    const currentHigh = _state.highScores[mode] || 0;

    if (numScore > currentHigh) {
      _state.highScores[mode] = numScore;
      checkBadges();
      saveState();
      return { isNewHighScore: true, highScore: numScore };
    }

    return { isNewHighScore: false, highScore: currentHigh };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 14. BADGES & ACHIEVEMENTS
  // ═════════════════════════════════════════════════════════════════════════
  function checkBadges() {
    if (!_state) init();
    const newlyUnlocked = [];

    const badgeRules = [
      {
        id: 'first_lesson',
        meets: _state.stats.totalQuestionsAnswered >= 1
      },
      {
        id: 'streak_7',
        meets: _state.streak.current >= 7
      },
      {
        id: 'boss_hunter',
        meets: (_state.highScores.boss || 0) >= 1
      },
      {
        id: 'decorator_10',
        meets: _state.ownedItems.length >= 10
      },
      {
        id: 'pet_lover_3',
        meets: _state.ownedPets.length >= 3
      },
      {
        id: 'scholar_50',
        meets: Object.values(_state.progress).filter(p => p.status === 'mastered').length >= 50
      },
      {
        id: 'speed_demon',
        meets: (_state.highScores.speed || 0) >= 20
      },
      {
        id: 'survivor_20',
        meets: (_state.highScores.survival || 0) >= 20
      },
      {
        id: 'combo_10',
        meets: (_state.highScores.combo || 0) >= 10
      }
    ];

    for (const rule of badgeRules) {
      if (rule.meets && !_state.badges.includes(rule.id)) {
        _state.badges.push(rule.id);
        newlyUnlocked.push(rule.id);
        emit('badge:unlocked', { badgeId: rule.id });
      }
    }

    if (newlyUnlocked.length > 0) {
      saveState();
    }

    return newlyUnlocked;
  }

  function getBadges() {
    if (!_state) init();
    return [..._state.badges];
  }

  function hasBadge(badgeId) {
    if (!_state) init();
    return _state.badges.includes(badgeId);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 15. STATS & ANALYTICS
  // ═════════════════════════════════════════════════════════════════════════
  function getStats() {
    if (!_state) init();
    return {
      totalQuestionsAnswered: _state.stats.totalQuestionsAnswered,
      totalCorrect: _state.stats.totalCorrect,
      dailyLog: JSON.parse(JSON.stringify(_state.stats.dailyLog))
    };
  }

  function getTodayStats() {
    if (!_state) init();
    const today = getTodayStr();
    const entry = _state.stats.dailyLog[today];
    if (entry) return { ...entry };
    return { answered: 0, correct: 0, starsEarned: 0 };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 16. PUBLIC REVEALED API
  // ═════════════════════════════════════════════════════════════════════════
  return {
    // 1-5: Lifecycle & State
    init,
    getState,
    saveState,
    resetGame,
    resetState,
    isFirstTime,
    completeOnboarding,

    // 6-9: Stars
    getStars,
    getTotalStarsEarned,
    earnStars,
    spendStars,
    canAfford,

    // 10-14: Pet System
    getPet,
    setPetState,
    switchPet,
    setPetType,
    renamePet,
    setPetName,
    updatePetReaction,
    unlockPet,
    buyPet,
    getOwnedPets,

    // 15-16: Streak
    checkIn,
    checkStreak,
    getStreak,

    // 17-22: Room
    getRoom,
    placeItem,
    moveItem,
    removeItem,
    changeWallpaper,
    setWallpaper,
    changeFloor,
    setFloor,

    // 23-28: Shop & Inventory
    buyItem,
    getOwnedItems,
    isItemOwned,
    getInventory,
    getShopCatalog,

    // 29-33: Spaced Repetition (SRS)
    markAnswered,
    getProgress,
    getTodayReview,
    getTopicProgress,
    getTopicStats,
    getAllProgress,

    // 34-37: Challenge Modes
    isChallengeUnlocked,
    unlockChallenge,
    updateHighScore,
    getHighScores,

    // 38-40: Badges
    checkBadges,
    getBadges,
    hasBadge,

    // 41-42: Stats
    getStats,
    getTodayStats,

    // Audio Controls
    playSound,
    toggleSound,
    isSoundMuted,
    setSoundMuted,
    playVictory,

    // Event Bus
    on,
    off,
    emit
  };
})();

// Auto-initialize on script evaluation
try {
  GameEngine.init();
} catch (e) {
  console.warn('[GameEngine] Auto-init deferred:', e);
}

// Dual-environment export
if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}
if (typeof globalThis !== 'undefined') {
  globalThis.GameEngine = GameEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
