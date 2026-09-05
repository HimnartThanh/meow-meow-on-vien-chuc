/**
 * tests/harness/reference_engine.js
 * Authoritative Reference Oracle implementation of GameEngine.
 * Strictly adheres to GAME_STATE.md, AGENT_BRIEF.md, and ARCHITECTURE.md.
 * Used as an oracle for differential testing and specification validation.
 */

function createReferenceEngine(sandbox) {
  const STORAGE_KEY_PRIMARY = 'meowmeow_state';
  const STORAGE_KEY_FALLBACK = 'meow_study_game_state';

  const SRS_INTERVALS = [1, 3, 7, 15, 30];

  function getTodayStr() {
    return new sandbox.Date().toISOString().split('T')[0];
  }

  function addDays(dateStr, days) {
    const d = new sandbox.Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
  }

  function createInitialState() {
    return {
      version: 1,
      initialized: false,
      createdAt: getTodayStr(),
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

  let state = null;
  let soundMuted = false;

  const engine = {
    init() {
      try {
        const raw = sandbox.localStorage.getItem(STORAGE_KEY_PRIMARY) || sandbox.localStorage.getItem(STORAGE_KEY_FALLBACK);
        if (raw) {
          state = JSON.parse(raw);
          if (state && typeof state.player === 'object') {
            if (state.player.currentStars < 0) state.player.currentStars = 0;
            return state;
          }
        }
      } catch {
        // Corrupt storage recovery
      }
      state = createInitialState();
      this.saveState();
      return state;
    },

    getState() {
      if (!state) this.init();
      return state;
    },

    saveState() {
      if (!state) return;
      const serialized = JSON.stringify(state);
      try {
        sandbox.localStorage.setItem(STORAGE_KEY_PRIMARY, serialized);
        sandbox.localStorage.setItem(STORAGE_KEY_FALLBACK, serialized);
      } catch (err) {
        console.error('Storage error:', err);
      }
    },

    resetGame(confirmed) {
      if (confirmed) {
        state = createInitialState();
        this.saveState();
      }
      return state;
    },

    resetState() {
      return this.resetGame(true);
    },

    isFirstTime() {
      if (!state) this.init();
      return !state.initialized;
    },

    completeOnboarding(petType, petName) {
      if (!state) this.init();
      const validPetType = (petType && typeof petType === 'string') ? petType : 'cat';
      const cleanName = (petName && typeof petName === 'string' && petName.trim()) ? petName.trim().slice(0, 25) : 'Miu';
      state.pet.type = validPetType;
      state.pet.name = cleanName;
      state.pet.state = 'idle';
      if (!state.ownedPets.includes(validPetType)) {
        state.ownedPets.push(validPetType);
      }
      state.initialized = true;
      this.saveState();
      return state;
    },

    getStars() {
      if (!state) this.init();
      return Math.max(0, state.player.currentStars);
    },

    getTotalStarsEarned() {
      if (!state) this.init();
      return state.player.totalStarsEarned;
    },

    earnStars(amount, source) {
      if (!state) this.init();
      if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
        return state.player.currentStars;
      }
      const safeAmount = Math.floor(amount);
      state.player.currentStars += safeAmount;
      state.player.totalStarsEarned += safeAmount;

      const today = getTodayStr();
      if (!state.stats.dailyLog[today]) {
        state.stats.dailyLog[today] = { answered: 0, correct: 0, starsEarned: 0 };
      }
      state.stats.dailyLog[today].starsEarned += safeAmount;

      this.checkBadges();
      this.saveState();
      return state.player.currentStars;
    },

    spendStars(amount, reason) {
      if (!state) this.init();
      if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
        return { success: false, message: 'Số sao không hợp lệ' };
      }
      const safeAmount = Math.floor(amount);
      if (state.player.currentStars < safeAmount) {
        return { success: false, message: `Thiếu ${safeAmount - state.player.currentStars} ⭐` };
      }
      state.player.currentStars -= safeAmount;
      this.saveState();
      return { success: true, message: 'Thành công' };
    },

    canAfford(amount) {
      return this.getStars() >= amount;
    },

    getPet() {
      if (!state) this.init();
      return { ...state.pet };
    },

    setPetState(newState) {
      if (!state) this.init();
      const validStates = ['idle', 'happy', 'sad', 'excited', 'sleeping'];
      state.pet.state = validStates.includes(newState) ? newState : 'idle';
      state.pet.stateChangedAt = new sandbox.Date().toISOString();
      this.saveState();
      return state.pet;
    },

    switchPet(petType) {
      if (!state) this.init();
      if (!state.ownedPets.includes(petType)) {
        return { success: false, message: 'Chưa sở hữu pet này' };
      }
      state.pet.type = petType;
      this.saveState();
      return { success: true, message: 'Đổi pet thành công' };
    },

    renamePet(newName) {
      if (!state) this.init();
      if (!newName || typeof newName !== 'string' || !newName.trim()) {
        return { success: false, message: 'Tên không hợp lệ', name: state.pet.name };
      }
      state.pet.name = newName.trim().slice(0, 25);
      this.saveState();
      return { success: true, name: state.pet.name };
    },

    updatePetReaction(event) {
      if (!state) this.init();
      let targetState = 'idle';
      if (event === 'quiz_correct' || event === 'flashcard_remembered' || event === 'set_completed') {
        targetState = 'happy';
      } else if (event === 'perfect_score' || event === 'boss_victory') {
        targetState = 'excited';
      } else if (event === 'wrong_answer_streak') {
        targetState = 'sad';
      } else if (event === 'idle_timeout') {
        targetState = 'sleeping';
      }
      this.setPetState(targetState);
      return targetState;
    },

    checkIn() {
      if (!state) this.init();
      const today = getTodayStr();
      const last = state.streak.lastCheckIn;

      if (last === today) {
        return { ...state.streak };
      }

      const yesterday = addDays(today, -1);
      if (last === yesterday) {
        state.streak.current++;
      } else {
        state.streak.current = 1;
      }

      state.streak.lastCheckIn = today;
      state.streak.longest = Math.max(state.streak.longest, state.streak.current);

      // Daily check-in reward
      this.earnStars(5, 'daily_checkin');
      if (state.streak.current % 7 === 0) {
        this.earnStars(20, 'streak_bonus');
      }

      this.checkBadges();
      this.saveState();
      return { ...state.streak };
    },

    getStreak() {
      if (!state) this.init();
      return { ...state.streak };
    },

    checkStreak() {
      return this.checkIn();
    },

    getRoom() {
      if (!state) this.init();
      return { ...state.room };
    },

    placeItem(itemId, x, y) {
      if (!state) this.init();
      const clampedX = Math.max(0, Math.min(100, Number(x) || 0));
      const clampedY = Math.max(0, Math.min(100, Number(y) || 0));

      const existingIndex = state.room.placedItems.findIndex(p => p.itemId === itemId);
      if (existingIndex !== -1) {
        state.room.placedItems[existingIndex].x = clampedX;
        state.room.placedItems[existingIndex].y = clampedY;
      } else {
        state.room.placedItems.push({ itemId, x: clampedX, y: clampedY });
      }
      this.saveState();
      return [...state.room.placedItems];
    },

    moveItem(itemId, x, y) {
      return this.placeItem(itemId, x, y);
    },

    removeItem(itemId) {
      if (!state) this.init();
      state.room.placedItems = state.room.placedItems.filter(p => p.itemId !== itemId);
      this.saveState();
      return [...state.room.placedItems];
    },

    changeWallpaper(wallpaperId) {
      if (!state) this.init();
      state.room.wallpaper = wallpaperId;
      this.saveState();
      return wallpaperId;
    },

    changeFloor(floorId) {
      if (!state) this.init();
      state.room.floor = floorId;
      this.saveState();
      return floorId;
    },

    buyItem(itemId) {
      if (!state) this.init();
      const data = sandbox.DATA || sandbox.window.DATA;
      const catalog = data && data.shopItems ? data.shopItems : [];
      const item = catalog.find(i => i.id === itemId);

      if (!item) {
        return { success: false, message: 'Món đồ không tồn tại' };
      }
      if (state.ownedItems.includes(itemId)) {
        return { success: false, message: 'Đã sở hữu món đồ này' };
      }
      const spendRes = this.spendStars(item.price, 'buy_item');
      if (!spendRes.success) {
        return spendRes;
      }
      state.ownedItems.push(itemId);
      this.checkBadges();
      this.saveState();
      return { success: true, message: 'Mua thành công!' };
    },

    buyPet(petType) {
      if (!state) this.init();
      const data = sandbox.DATA || sandbox.window.DATA;
      const catalog = data && data.petCatalog ? data.petCatalog : [];
      const pet = catalog.find(p => p.type === petType);

      if (!pet) {
        return { success: false, message: 'Pet không tồn tại' };
      }
      if (state.ownedPets.includes(petType)) {
        return { success: false, message: 'Đã sở hữu pet này' };
      }
      const spendRes = this.spendStars(pet.price, 'buy_pet');
      if (!spendRes.success) {
        return spendRes;
      }
      state.ownedPets.push(petType);
      this.checkBadges();
      this.saveState();
      return { success: true, message: 'Nhận nuôi thành công!' };
    },

    getOwnedItems() {
      if (!state) this.init();
      return [...state.ownedItems];
    },

    getOwnedPets() {
      if (!state) this.init();
      return [...state.ownedPets];
    },

    isItemOwned(itemId) {
      if (!state) this.init();
      return state.ownedItems.includes(itemId);
    },

    getInventory() {
      if (!state) this.init();
      const placedIds = new Set(state.room.placedItems.map(p => p.itemId));
      const unplaced = state.ownedItems.filter(id => !placedIds.has(id));
      const data = sandbox.DATA || sandbox.window.DATA;
      const catalog = data && data.shopItems ? data.shopItems : [];
      return unplaced.map(id => catalog.find(item => item.id === id) || { id });
    },

    markAnswered(questionId, isCorrect) {
      if (!state) this.init();
      const today = getTodayStr();

      state.stats.totalQuestionsAnswered++;
      if (isCorrect) state.stats.totalCorrect++;

      if (!state.stats.dailyLog[today]) {
        state.stats.dailyLog[today] = { answered: 0, correct: 0, starsEarned: 0 };
      }
      state.stats.dailyLog[today].answered++;
      if (isCorrect) state.stats.dailyLog[today].correct++;

      if (!state.progress[questionId]) {
        state.progress[questionId] = {
          status: 'new',
          correctCount: 0,
          lastAnswered: null,
          nextReview: null
        };
      }

      const qProg = state.progress[questionId];
      if (isCorrect) {
        qProg.correctCount++;
        const intervalIndex = Math.min(qProg.correctCount - 1, SRS_INTERVALS.length - 1);
        const days = SRS_INTERVALS[intervalIndex];
        qProg.nextReview = addDays(today, days);
        qProg.status = qProg.correctCount >= 5 ? 'mastered' : 'learning';
      } else {
        qProg.correctCount = 0;
        qProg.nextReview = addDays(today, 1);
        qProg.status = 'review';
      }

      qProg.lastAnswered = today;
      this.checkBadges();
      this.saveState();
      return { ...qProg };
    },

    getProgress(questionId) {
      if (!state) this.init();
      if (!state.progress[questionId]) {
        return { status: 'new', correctCount: 0, lastAnswered: null, nextReview: null };
      }
      return { ...state.progress[questionId] };
    },

    getTodayReview(topicId) {
      if (!state) this.init();
      const today = getTodayStr();
      const data = sandbox.DATA || sandbox.window.DATA;
      const questions = data && data.questions ? data.questions : [];
      const topicFiltered = topicId ? questions.filter(q => q.topicId === topicId) : questions;

      const due = [];
      for (const q of topicFiltered) {
        const p = state.progress[q.id];
        if (p && p.nextReview && p.nextReview <= today) {
          due.push(q);
        }
      }
      return due;
    },

    getTopicProgress(topicId) {
      if (!state) this.init();
      const data = sandbox.DATA || sandbox.window.DATA;
      const questions = data && data.questions ? data.questions.filter(q => q.topicId === topicId) : [];
      const total = questions.length;
      let mastered = 0, learning = 0, review = 0, newQ = 0;

      for (const q of questions) {
        const p = state.progress[q.id];
        if (!p || p.status === 'new') newQ++;
        else if (p.status === 'mastered') mastered++;
        else if (p.status === 'learning') learning++;
        else if (p.status === 'review') review++;
      }

      const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
      return { total, mastered, learning, review, new: newQ, percentage };
    },

    getAllProgress() {
      if (!state) this.init();
      const data = sandbox.DATA || sandbox.window.DATA;
      const questions = data && data.questions ? data.questions : [];
      const totalQuestions = questions.length;
      let mastered = 0, learning = 0, review = 0, newQ = 0;

      for (const q of questions) {
        const p = state.progress[q.id];
        if (!p || p.status === 'new') newQ++;
        else if (p.status === 'mastered') mastered++;
        else if (p.status === 'learning') learning++;
        else if (p.status === 'review') review++;
      }

      const overallPercentage = totalQuestions > 0 ? Math.round((mastered / totalQuestions) * 100) : 0;
      return { totalQuestions, mastered, learning, review, new: newQ, overallPercentage };
    },

    isChallengeUnlocked() {
      if (!state) this.init();
      return Boolean(state.challengeUnlocked);
    },

    unlockChallenge() {
      if (!state) this.init();
      state.challengeUnlocked = true;
      this.saveState();
      return true;
    },

    updateHighScore(mode, score) {
      if (!state) this.init();
      const validModes = ['speed', 'survival', 'combo', 'boss'];
      if (!validModes.includes(mode)) {
        return { isNewHighScore: false, highScore: 0 };
      }
      const safeScore = Math.floor(score) || 0;
      if (safeScore > (state.highScores[mode] || 0)) {
        state.highScores[mode] = safeScore;
        this.checkBadges();
        this.saveState();
        return { isNewHighScore: true, highScore: safeScore };
      }
      return { isNewHighScore: false, highScore: state.highScores[mode] };
    },

    getHighScores() {
      if (!state) this.init();
      return { ...state.highScores };
    },

    checkBadges() {
      if (!state) this.init();
      const newlyUnlocked = [];

      const checkBadge = (id, condition) => {
        if (condition && !state.badges.includes(id)) {
          state.badges.push(id);
          newlyUnlocked.push(id);
        }
      };

      checkBadge('first_lesson', state.stats.totalQuestionsAnswered >= 1);
      checkBadge('streak_7', state.streak.current >= 7);
      checkBadge('boss_hunter', state.highScores.boss >= 1);
      checkBadge('decorator_10', state.ownedItems.length >= 10);
      checkBadge('pet_lover_3', state.ownedPets.length >= 3);
      checkBadge('speed_demon', state.highScores.speed >= 20);
      checkBadge('survivor_20', state.highScores.survival >= 20);
      checkBadge('combo_10', state.highScores.combo >= 10);

      const masteredCount = Object.values(state.progress).filter(p => p.status === 'mastered').length;
      checkBadge('scholar_50', masteredCount >= 50);

      if (newlyUnlocked.length > 0) {
        this.saveState();
      }
      return newlyUnlocked;
    },

    getBadges() {
      if (!state) this.init();
      return [...state.badges];
    },

    hasBadge(badgeId) {
      if (!state) this.init();
      return state.badges.includes(badgeId);
    },

    getStats() {
      if (!state) this.init();
      return {
        totalQuestionsAnswered: state.stats.totalQuestionsAnswered,
        totalCorrect: state.stats.totalCorrect,
        dailyLog: { ...state.stats.dailyLog }
      };
    },

    getTodayStats() {
      if (!state) this.init();
      const today = getTodayStr();
      return state.stats.dailyLog[today] || { answered: 0, correct: 0, starsEarned: 0 };
    },

    playSound(name) {
      if (soundMuted) return;
      if (sandbox.audioEvents) {
        sandbox.audioEvents.push({ type: 'sound', name });
      }
    },

    toggleSound() {
      soundMuted = !soundMuted;
      return !soundMuted;
    },

    isSoundMuted() {
      return soundMuted;
    }
  };

  return engine;
}

module.exports = { createReferenceEngine };
