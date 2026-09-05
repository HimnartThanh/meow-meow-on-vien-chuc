/**
 * js/challenge.js
 * Controller for challenge.html (Speed, Survival, Combo, Boss Battle)
 */

(function() {
  'use strict';

  let currentMode = null; // 'speed' | 'survival' | 'combo' | 'boss'
  let speedTimerInterval = null;
  let speedTimeLeft = 60;
  let speedScore = 0;

  let survivalLives = 5;
  let survivalScore = 0;

  let comboCount = 0;
  let comboMax = 0;
  let comboScore = 0;
  let comboStarsTotal = 0;
  let comboQuestionCount = 0;

  let bossHp = 3;
  let bossQuestions = [];
  let bossCurrentIndex = 0;
  let bossName = '';
  let bossTitle = '';
  let bossEmoji = '👹';

  let currentQuestion = null;
  let answeredCurrent = false;

  function initChallenge() {
    if (typeof GameEngine !== 'undefined') {
      GameEngine.init();
    }

    updateHUD();

    const isUnlocked = (typeof GameEngine !== 'undefined')
      ? GameEngine.isChallengeUnlocked()
      : false;

    const lockScreen = document.getElementById('lock-screen');
    const hubScreen = document.getElementById('hub-screen');
    const gameplayScreen = document.getElementById('gameplay-screen');

    if (!isUnlocked) {
      if (lockScreen) lockScreen.style.display = 'flex';
      if (hubScreen) hubScreen.style.display = 'none';
      if (gameplayScreen) gameplayScreen.style.display = 'none';
      return;
    }

    if (lockScreen) lockScreen.style.display = 'none';
    if (hubScreen) hubScreen.style.display = 'flex';
    if (gameplayScreen) gameplayScreen.style.display = 'none';

    renderHighScores();
    bindHubEvents();
    bindResultEvents();
  }

  function updateHUD() {
    if (typeof GameEngine === 'undefined') return;
    const hudStars = document.getElementById('hud-stars');
    if (hudStars) hudStars.textContent = GameEngine.getStars();
  }

  function renderHighScores() {
    if (typeof GameEngine === 'undefined') return;
    const hs = GameEngine.getHighScores();

    const elSpeed = document.getElementById('hs-speed');
    const elSurv = document.getElementById('hs-survival');
    const elCombo = document.getElementById('hs-combo');
    const elBoss = document.getElementById('hs-boss');

    const cardSpeed = document.getElementById('card-hs-speed');
    const cardSurv = document.getElementById('card-hs-survival');
    const cardCombo = document.getElementById('card-hs-combo');
    const cardBoss = document.getElementById('card-hs-boss');

    if (elSpeed) elSpeed.textContent = `${hs.speed || 0} câu`;
    if (elSurv) elSurv.textContent = `${hs.survival || 0} câu`;
    if (elCombo) elCombo.textContent = `x${hs.combo || 0}`;
    if (elBoss) elBoss.textContent = `${hs.boss || 0} lần`;

    if (cardSpeed) cardSpeed.textContent = `Kỷ lục: ${hs.speed || 0} câu`;
    if (cardSurv) cardSurv.textContent = `Kỷ lục: ${hs.survival || 0} câu`;
    if (cardCombo) cardCombo.textContent = `Kỷ lục: x${hs.combo || 0}`;
    if (cardBoss) cardBoss.textContent = `Đã hạ: ${hs.boss || 0} lần`;
  }

  function getRandomQuestion(excludeId) {
    if (typeof DATA === 'undefined' || !Array.isArray(DATA.questions) || DATA.questions.length === 0) {
      return null;
    }
    const pool = excludeId ? DATA.questions.filter(q => q.id !== excludeId) : DATA.questions;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function getOptionsForQuestion(q) {
    if (Array.isArray(q.quizOptions) && q.quizOptions.length === 4 && typeof q.quizAnswer === 'number') {
      return {
        options: q.quizOptions,
        answerIndex: q.quizAnswer
      };
    }

    const correctDef = q.definition;
    const others = (DATA.questions || []).filter(o => o.id !== q.id && o.definition);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3).map(o => o.definition);

    const options = [correctDef, ...distractors].sort(() => 0.5 - Math.random());
    const answerIndex = options.indexOf(correctDef);
    return { options, answerIndex };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // START MODE DISPATCHER
  // ═══════════════════════════════════════════════════════════════════════════
  function startChallengeMode(mode) {
    currentMode = mode;

    const hub = document.getElementById('hub-screen');
    const gameplay = document.getElementById('gameplay-screen');
    const modal = document.getElementById('result-modal');

    if (hub) hub.style.display = 'none';
    if (modal) modal.style.display = 'none';
    if (gameplay) gameplay.style.display = 'flex';

    // Reset view specific elements
    const timerContainer = document.getElementById('speed-timer-container');
    const bossHud = document.getElementById('boss-hud-container');
    const stopComboBtn = document.getElementById('btn-stop-combo');

    if (timerContainer) timerContainer.style.display = 'none';
    if (bossHud) bossHud.style.display = 'none';
    if (stopComboBtn) stopComboBtn.style.display = 'none';

    if (mode === 'speed') {
      setupSpeedMode();
    } else if (mode === 'survival') {
      setupSurvivalMode();
    } else if (mode === 'combo') {
      setupComboMode();
    } else if (mode === 'boss') {
      setupBossMode();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SPEED MODE (60 Seconds)
  // ═══════════════════════════════════════════════════════════════════════════
  function setupSpeedMode() {
    speedScore = 0;
    speedTimeLeft = 60;

    const iconEl = document.getElementById('gp-mode-icon');
    const nameEl = document.getElementById('gp-mode-name');
    const statsArea = document.getElementById('gp-stats-area');
    const timerContainer = document.getElementById('speed-timer-container');
    const timerFill = document.getElementById('speed-timer-fill');
    const timerNum = document.getElementById('speed-timer-num');

    if (iconEl) iconEl.textContent = '⏱️';
    if (nameEl) nameEl.textContent = 'Thi Tốc Độ';
    if (statsArea) statsArea.innerHTML = `<span style="color: var(--pink-deep); font-size: 1.1rem;">Điểm: <strong id="gp-speed-score">0</strong></span>`;

    if (timerContainer) timerContainer.style.display = 'flex';
    if (timerFill) timerFill.style.width = '100%';
    if (timerNum) timerNum.textContent = '60s';

    if (speedTimerInterval) clearInterval(speedTimerInterval);

    speedTimerInterval = setInterval(() => {
      speedTimeLeft--;
      if (timerNum) timerNum.textContent = `${speedTimeLeft}s`;
      if (timerFill) {
        const pct = Math.max(0, (speedTimeLeft / 60) * 100);
        timerFill.style.width = `${pct}%`;
      }

      if (speedTimeLeft <= 0) {
        clearInterval(speedTimerInterval);
        endSpeedMode();
      }
    }, 1000);

    renderChallengeQuestion();
  }

  function handleSpeedAnswer(isCorrect) {
    if (speedTimeLeft <= 0) return;

    if (isCorrect) {
      speedScore++;
      const scoreEl = document.getElementById('gp-speed-score');
      if (scoreEl) scoreEl.textContent = speedScore;
      if (typeof GameEngine !== 'undefined') GameEngine.playSound('correct');
    } else {
      if (typeof GameEngine !== 'undefined') GameEngine.playSound('wrong');
    }

    // Immediately jump to next question
    renderChallengeQuestion();
  }

  function endSpeedMode() {
    if (speedTimerInterval) clearInterval(speedTimerInterval);

    const starsEarned = speedScore * 2;
    let isNewHigh = false;

    if (typeof GameEngine !== 'undefined') {
      GameEngine.earnStars(starsEarned, 'challenge_speed');
      const res = GameEngine.updateHighScore('speed', speedScore);
      isNewHigh = Boolean(res && res.isNewHighScore);
      GameEngine.checkBadges();
      GameEngine.checkIn();
      GameEngine.playSound('fanfare');
    }

    updateHUD();
    renderHighScores();

    showResultModal({
      emoji: '⏱️',
      title: 'Hết Giờ! Thi Tốc Độ',
      isNewHigh,
      desc: `Bạn đã trả lời đúng ${speedScore} câu trong 60 giây! Nhận thưởng nhân đôi (2x)!`,
      scoreLabel: 'Số câu đúng',
      scoreVal: `${speedScore} câu`,
      starsEarned: `+${starsEarned} ⭐`
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SURVIVAL MODE (5 Hearts)
  // ═══════════════════════════════════════════════════════════════════════════
  function setupSurvivalMode() {
    survivalLives = 5;
    survivalScore = 0;

    const iconEl = document.getElementById('gp-mode-icon');
    const nameEl = document.getElementById('gp-mode-name');
    const statsArea = document.getElementById('gp-stats-area');

    if (iconEl) iconEl.textContent = '❤️';
    if (nameEl) nameEl.textContent = 'Sống Sót';

    updateSurvivalHUD();
    renderChallengeQuestion();
  }

  function updateSurvivalHUD() {
    const statsArea = document.getElementById('gp-stats-area');
    if (!statsArea) return;

    const heartsStr = '❤️'.repeat(Math.max(0, survivalLives)) + '💔'.repeat(Math.max(0, 5 - survivalLives));
    statsArea.innerHTML = `
      <span class="lives-display">${heartsStr}</span>
      <span style="color: var(--pink-deep); font-size: 1.1rem; margin-left: 10px;">Điểm: <strong>${survivalScore}</strong></span>
    `;
  }

  function handleSurvivalAnswer(isCorrect) {
    if (survivalLives <= 0) return;
    if (isCorrect) {
      survivalScore++;
      if (typeof GameEngine !== 'undefined') GameEngine.playSound('correct');
      updateSurvivalHUD();
      renderChallengeQuestion();
    } else {
      survivalLives--;
      if (typeof GameEngine !== 'undefined') GameEngine.playSound('wrong');
      updateSurvivalHUD();

      if (survivalLives <= 0) {
        endSurvivalMode();
      } else {
        renderChallengeQuestion();
      }
    }
  }

  function endSurvivalMode() {
    const starsEarned = survivalScore * 3;
    let isNewHigh = false;

    if (typeof GameEngine !== 'undefined') {
      GameEngine.earnStars(starsEarned, 'challenge_survival');
      const res = GameEngine.updateHighScore('survival', survivalScore);
      isNewHigh = Boolean(res && res.isNewHighScore);
      GameEngine.checkBadges();
      GameEngine.checkIn();
      GameEngine.playSound('fanfare');
    }

    updateHUD();
    renderHighScores();

    showResultModal({
      emoji: '💀',
      title: 'Game Over! Hết Tim',
      isNewHigh,
      desc: `Bạn đã sống sót qua ${survivalScore} câu hỏi! Nhận thưởng nhân ba (3x)!`,
      scoreLabel: 'Câu trả lời đúng',
      scoreVal: `${survivalScore} câu`,
      starsEarned: `+${starsEarned} ⭐`
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. COMBO MODE (Multiplier x1 to x5)
  // ═══════════════════════════════════════════════════════════════════════════
  function setupComboMode() {
    comboCount = 0;
    comboMax = 0;
    comboScore = 0;
    comboStarsTotal = 0;
    comboQuestionCount = 0;

    const iconEl = document.getElementById('gp-mode-icon');
    const nameEl = document.getElementById('gp-mode-name');
    const stopBtn = document.getElementById('btn-stop-combo');

    if (iconEl) iconEl.textContent = '🔥';
    if (nameEl) nameEl.textContent = 'Chuỗi Combo';
    if (stopBtn) {
      stopBtn.style.display = 'inline-flex';
      stopBtn.onclick = () => endComboMode();
    }

    updateComboHUD();
    renderChallengeQuestion();
  }

  function updateComboHUD() {
    const statsArea = document.getElementById('gp-stats-area');
    if (!statsArea) return;

    statsArea.innerHTML = `
      <div class="combo-meter">🔥 Combo: x${comboCount}</div>
      <span style="font-size: 0.95rem; color: var(--text-mid);">Max: <strong>x${comboMax}</strong></span>
    `;
  }

  function handleComboAnswer(isCorrect) {
    comboQuestionCount++;

    if (isCorrect) {
      comboCount++;
      comboMax = Math.max(comboMax, comboCount);
      comboScore++;
      const multiplier = Math.min(5, comboCount);
      const starsAwarded = 2 * multiplier;
      comboStarsTotal += starsAwarded;

      if (typeof GameEngine !== 'undefined') {
        GameEngine.earnStars(starsAwarded, 'challenge_combo');
        GameEngine.playSound('correct');
      }
    } else {
      comboCount = 0; // Reset combo to 0 on wrong answer
      if (typeof GameEngine !== 'undefined') {
        GameEngine.playSound('wrong');
      }
    }

    updateHUD();
    updateComboHUD();

    // Finish automatically after 20 questions
    if (comboQuestionCount >= 20) {
      endComboMode();
    } else {
      renderChallengeQuestion();
    }
  }

  function endComboMode() {
    let isNewHigh = false;

    if (typeof GameEngine !== 'undefined') {
      const res = GameEngine.updateHighScore('combo', comboMax);
      isNewHigh = Boolean(res && res.isNewHighScore);
      GameEngine.checkBadges();
      GameEngine.checkIn();
      GameEngine.playSound('fanfare');
    }

    updateHUD();
    renderHighScores();

    showResultModal({
      emoji: '🔥',
      title: 'Hoàn Thành Chuỗi Combo!',
      isNewHigh,
      desc: `Chuỗi đúng dài nhất của bạn đạt x${comboMax}! Tổng cộng bạn kiếm được ${comboStarsTotal} sao!`,
      scoreLabel: 'Combo Cao Nhất',
      scoreVal: `x${comboMax}`,
      starsEarned: `+${comboStarsTotal} ⭐`
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. BOSS BATTLE (3 Consecutive Hard Questions)
  // ═══════════════════════════════════════════════════════════════════════════
  function setupBossMode() {
    bossHp = 3;
    bossCurrentIndex = 0;

    const iconEl = document.getElementById('gp-mode-icon');
    const nameEl = document.getElementById('gp-mode-name');
    const statsArea = document.getElementById('gp-stats-area');
    const bossHud = document.getElementById('boss-hud-container');

    if (iconEl) iconEl.textContent = '👹';
    if (nameEl) nameEl.textContent = 'Đại Chiến Boss';
    if (statsArea) statsArea.innerHTML = '';
    if (bossHud) bossHud.style.display = 'flex';

    // Daily Seed: Math.floor(Date.now() / 86400000)
    const daySeed = Math.floor(Date.now() / 86400000);

    const BOSS_NAMES = [
      { name: 'Đại Ma Vương Giáo Trình', title: 'Trùm Cuối Quy Chế — Khó Nhằn', emoji: '👹' },
      { name: 'Giáo Sư Mèo Hắc Ám', title: 'Tiến Sĩ Bẫy Đề Thi — Tinh Quái', emoji: '😼' },
      { name: 'Thần Hộ Mệnh Luật Pháp', title: 'Hộ Vệ Điều Khoản — Uy Nghiêm', emoji: '🐉' },
      { name: 'Hắc Miêu Tướng Quân', title: 'Đại Tướng Đề Thi — Bất Bại', emoji: '🐱‍👤' },
      { name: 'Thống Đốc Trắc Nghiệm', title: 'Vua Bẫy Đáp Án — Đáng Sợ', emoji: '🦁' }
    ];

    const chosenBoss = BOSS_NAMES[daySeed % BOSS_NAMES.length];
    bossName = chosenBoss.name;
    bossTitle = chosenBoss.title;
    bossEmoji = chosenBoss.emoji;

    const nameDisplay = document.getElementById('boss-display-name');
    const titleDisplay = document.getElementById('boss-display-title');
    const avatarDisplay = document.getElementById('boss-avatar-emoji');

    if (nameDisplay) nameDisplay.textContent = bossName;
    if (titleDisplay) titleDisplay.textContent = bossTitle;
    if (avatarDisplay) avatarDisplay.textContent = bossEmoji;

    // Pick 3 distinct hard questions strictly from hardPool (difficulty === 3) seeded by daySeed
    const hardPool = (DATA.questions || []).filter(q => q.difficulty === 3);
    const pool = hardPool.length >= 3 ? hardPool : (DATA.questions || []);

    bossQuestions = [];
    if (pool.length <= 3) {
      bossQuestions = [...pool];
    } else {
      const available = [...pool];
      for (let i = 0; i < 3; i++) {
        const idx = Math.abs((daySeed * 7 + i * 13) % available.length);
        bossQuestions.push(available.splice(idx, 1)[0]);
      }
    }

    updateBossHUD();
    renderBossQuestion();
  }

  function updateBossHUD() {
    const fillEl = document.getElementById('boss-hp-fill');
    const textEl = document.getElementById('boss-hp-num');

    if (fillEl) {
      const pct = Math.max(0, (bossHp / 3) * 100);
      fillEl.style.width = `${pct}%`;
    }
    if (textEl) {
      textEl.textContent = `${bossHp}/3 HP`;
    }
  }

  function renderBossQuestion() {
    if (bossCurrentIndex >= bossQuestions.length) {
      bossCurrentIndex = 0;
    }
    currentQuestion = bossQuestions[bossCurrentIndex];

    const qText = document.getElementById('c-question-text');
    const optionsGrid = document.getElementById('c-options-grid');

    if (qText) {
      qText.innerHTML = `<strong>Câu ${bossCurrentIndex + 1}/3:</strong> ${escapeHtml(currentQuestion.concept)}`;
    }

    const { options, answerIndex } = getOptionsForQuestion(currentQuestion);

    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'c-option-btn';
        btn.innerHTML = `
          <span class="c-option-letter">${letters[idx]}</span>
          <span>${escapeHtml(opt)}</span>
        `;

        btn.addEventListener('click', () => {
          if (answeredCurrent) return;
          answeredCurrent = true;

          const isCorrect = (idx === answerIndex);
          if (isCorrect) {
            btn.classList.add('opt-correct');
          } else {
            btn.classList.add('opt-wrong');
            const all = optionsGrid.querySelectorAll('.c-option-btn');
            if (all[answerIndex]) all[answerIndex].classList.add('opt-correct');
          }

          setTimeout(() => {
            answeredCurrent = false;
            handleBossAnswer(isCorrect);
          }, 600);
        });

        optionsGrid.appendChild(btn);
      });
    }
  }

  function showBossAlert(message) {
    if (typeof document === 'undefined') return;
    let toast = document.getElementById('boss-heal-banner');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'boss-heal-banner';
      toast.style.position = 'fixed';
      toast.style.top = '70px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #E85D8A 100%)';
      toast.style.color = '#FFFFFF';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '16px';
      toast.style.boxShadow = '0 8px 24px rgba(232, 93, 138, 0.4)';
      toast.style.zIndex = '200';
      toast.style.maxWidth = '90%';
      toast.style.width = '480px';
      toast.style.textAlign = 'center';
      toast.style.fontWeight = '800';
      toast.style.fontSize = '0.95rem';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        setTimeout(() => { if (toast) toast.style.display = 'none'; }, 300);
      }
    }, 3500);
  }

  function handleBossAnswer(isCorrect) {
    if (isCorrect) {
      bossHp--;
      updateBossHUD();
      if (typeof GameEngine !== 'undefined') GameEngine.playSound('correct');

      if (bossHp <= 0) {
        // Boss Defeated!
        endBossBattle(true);
      } else {
        bossCurrentIndex++;
        renderBossQuestion();
      }
    } else {
      // Wrong answer -> Boss recovers full 3 HP and resets to Question 1!
      bossHp = 3;
      bossCurrentIndex = 0;
      updateBossHUD();
      if (typeof GameEngine !== 'undefined') GameEngine.playSound('wrong');

      showBossAlert(`💥 ${bossName} cười lớn: "Hahaha! Sai rồi!" — Boss đã hồi phục toàn bộ 3 HP! Hãy chiến đấu lại từ đầu!`);
      renderBossQuestion();
    }
  }

  function endBossBattle(victory) {
    if (victory) {
      let isNewHigh = false;

      if (typeof GameEngine !== 'undefined') {
        GameEngine.earnStars(50, 'boss_victory');
        const prev = (GameEngine.getHighScores().boss || 0);
        const res = GameEngine.updateHighScore('boss', prev + 1);
        isNewHigh = Boolean(res && res.isNewHighScore);
        GameEngine.setPetState('excited');
        GameEngine.checkBadges();
        GameEngine.checkIn();
        GameEngine.playSound('fanfare');
      }

      updateHUD();
      renderHighScores();

      showResultModal({
        emoji: '👑',
        title: 'Chiến Thắng Boss!',
        isNewHigh,
        desc: `Bạn đã đánh bại ${bossName} với 3 câu hỏi khó liên tiếp! Thưởng cực lớn +50 ⭐!`,
        scoreLabel: 'Tổng số Boss hạ gục',
        scoreVal: `${(GameEngine ? GameEngine.getHighScores().boss : 1)} lần`,
        starsEarned: '+50 ⭐'
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERIC CHALLENGE QUESTION RENDERER (Speed, Survival, Combo)
  // ═══════════════════════════════════════════════════════════════════════════
  function renderChallengeQuestion() {
    answeredCurrent = false;
    currentQuestion = getRandomQuestion(currentQuestion ? currentQuestion.id : null);
    if (!currentQuestion) return;

    const qText = document.getElementById('c-question-text');
    const optionsGrid = document.getElementById('c-options-grid');

    if (qText) qText.textContent = currentQuestion.concept;

    const { options, answerIndex } = getOptionsForQuestion(currentQuestion);

    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'c-option-btn';
        btn.innerHTML = `
          <span class="c-option-letter">${letters[idx]}</span>
          <span>${escapeHtml(opt)}</span>
        `;

        btn.addEventListener('click', () => {
          if (answeredCurrent) return;
          answeredCurrent = true;

          const isCorrect = (idx === answerIndex);

          if (isCorrect) {
            btn.classList.add('opt-correct');
          } else {
            btn.classList.add('opt-wrong');
            const all = optionsGrid.querySelectorAll('.c-option-btn');
            if (all[answerIndex]) all[answerIndex].classList.add('opt-correct');
          }

          // Delay slightly so visual feedback is visible, but keep it rapid
          const delay = (currentMode === 'speed') ? 180 : 350;
          setTimeout(() => {
            answeredCurrent = false;
            if (currentMode === 'speed') {
              handleSpeedAnswer(isCorrect);
            } else if (currentMode === 'survival') {
              handleSurvivalAnswer(isCorrect);
            } else if (currentMode === 'combo') {
              handleComboAnswer(isCorrect);
            }
          }, delay);
        });

        optionsGrid.appendChild(btn);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULT MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  function showResultModal(data) {
    const modal = document.getElementById('result-modal');
    const emojiEl = document.getElementById('res-emoji');
    const titleEl = document.getElementById('res-title');
    const newHsEl = document.getElementById('res-new-hs');
    const descEl = document.getElementById('res-desc');
    const scoreValEl = document.getElementById('res-score-val');
    const scoreLblEl = document.getElementById('res-score-lbl');
    const starsValEl = document.getElementById('res-stars-val');

    if (emojiEl) emojiEl.textContent = data.emoji || '🎉';
    if (titleEl) titleEl.textContent = data.title || 'Kết Quả';
    if (newHsEl) newHsEl.style.display = data.isNewHigh ? 'inline-block' : 'none';
    if (descEl) descEl.textContent = data.desc || '';
    if (scoreLblEl) scoreLblEl.textContent = data.scoreLabel || 'Điểm';
    if (scoreValEl) scoreValEl.textContent = data.scoreVal || '0';
    if (starsValEl) starsValEl.textContent = data.starsEarned || '+0 ⭐';

    if (modal) modal.style.display = 'flex';
  }

  function bindHubEvents() {
    const speedCard = document.getElementById('card-mode-speed');
    const survCard = document.getElementById('card-mode-survival');
    const comboCard = document.getElementById('card-mode-combo');
    const bossCard = document.getElementById('card-mode-boss');

    if (speedCard) {
      speedCard.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        startChallengeMode('speed');
      });
    }

    if (survCard) {
      survCard.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        startChallengeMode('survival');
      });
    }

    if (comboCard) {
      comboCard.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        startChallengeMode('combo');
      });
    }

    if (bossCard) {
      bossCard.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        startChallengeMode('boss');
      });
    }
  }

  function bindResultEvents() {
    const replayBtn = document.getElementById('btn-res-replay');
    const hubBtn = document.getElementById('btn-res-hub');

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        const modal = document.getElementById('result-modal');
        if (modal) modal.style.display = 'none';
        if (currentMode) startChallengeMode(currentMode);
      });
    }

    if (hubBtn) {
      hubBtn.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        if (speedTimerInterval) clearInterval(speedTimerInterval);

        const modal = document.getElementById('result-modal');
        const hub = document.getElementById('hub-screen');
        const gameplay = document.getElementById('gameplay-screen');

        if (modal) modal.style.display = 'none';
        if (gameplay) gameplay.style.display = 'none';
        if (hub) hub.style.display = 'flex';

        renderHighScores();
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChallenge);
  } else {
    initChallenge();
  }
})();
