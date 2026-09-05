/**
 * js/stats.js
 * Stats Dashboard & Badges Controller for "Meow Meow Ôn Viên Chức"
 * Features:
 *   - Header HUD & sound toggle
 *   - Streak card (current, longest, today's check-in status)
 *   - Total stars earned counter & current balance
 *   - Per-topic progress bars for each topic in DATA.topics (mastered / total questions)
 *   - 10 Badges Grid (unlocked vs locked)
 *   - 7-Day Activity Chart (pure CSS bar chart from dailyLog)
 *   - Challenge High Scores summary table (Speed, Survival, Combo, Boss)
 */

(function() {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════
  // 1. DATE UTILITIES (LOCAL TIME PRESERVATION)
  // ═════════════════════════════════════════════════════════════════════════
  function getLocalDateStr(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatShortDate(dateStr) {
    // Converts "2026-09-05" -> "05/09"
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. TOAST NOTIFICATIONS
  // ═════════════════════════════════════════════════════════════════════════
  function showToast(message, type = 'info', duration = 2500) {
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
  // 3. RENDER HUD
  // ═════════════════════════════════════════════════════════════════════════
  function renderHUD() {
    if (typeof GameEngine === 'undefined') return;

    const starsEl = document.getElementById('hud-stars-count');
    if (starsEl) {
      starsEl.textContent = GameEngine.getStars();
    }

    const streakEl = document.getElementById('hud-streak-count');
    if (streakEl) {
      const streak = GameEngine.getStreak();
      streakEl.textContent = streak ? streak.current : 0;
    }

    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) {
      soundIcon.textContent = GameEngine.isSoundMuted() ? '🔇' : '🔊';
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. RENDER OVERVIEW: STREAK & STARS
  // ═════════════════════════════════════════════════════════════════════════
  function renderOverview() {
    if (typeof GameEngine === 'undefined') return;

    // Streak Information
    const streak = GameEngine.getStreak() || { current: 0, longest: 0, lastCheckIn: null };
    const currentStreakEl = document.getElementById('stat-current-streak');
    if (currentStreakEl) {
      currentStreakEl.textContent = streak.current;
    }

    const longestStreakEl = document.getElementById('stat-longest-streak');
    if (longestStreakEl) {
      longestStreakEl.textContent = streak.longest;
    }

    // Check-in status today
    const checkinStatusEl = document.getElementById('stat-checkin-status');
    if (checkinStatusEl) {
      const today = getLocalDateStr();
      const isCheckedIn = streak.lastCheckIn === today;

      if (isCheckedIn) {
        checkinStatusEl.className = 'checkin-tag checked';
        checkinStatusEl.innerHTML = '<span>✅</span><span>Đã điểm danh hôm nay (+5 ⭐)</span>';
      } else {
        checkinStatusEl.className = 'checkin-tag unchecked';
        checkinStatusEl.innerHTML = '<span>⏰</span><span>Chưa điểm danh hôm nay</span>';
      }
    }

    // Stars Information
    const totalStarsEl = document.getElementById('stat-total-stars');
    if (totalStarsEl) {
      totalStarsEl.textContent = GameEngine.getTotalStarsEarned();
    }

    const currentStarsEl = document.getElementById('stat-current-stars');
    if (currentStarsEl) {
      currentStarsEl.textContent = GameEngine.getStars();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. RENDER 7-DAY ACTIVITY CHART (PURE CSS)
  // ═════════════════════════════════════════════════════════════════════════
  function renderActivityChart() {
    if (typeof GameEngine === 'undefined') return;

    const chartContainer = document.getElementById('activity-chart-container');
    if (!chartContainer) return;

    const stats = GameEngine.getStats() || { totalQuestionsAnswered: 0, totalCorrect: 0, dailyLog: {} };
    const dailyLog = stats.dailyLog || {};

    // Generate past 7 days (oldest to today)
    const today = new Date();
    const daysData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = getLocalDateStr(d);
      const isToday = i === 0;

      const log = dailyLog[dateKey] || { answered: 0, correct: 0, starsEarned: 0 };
      daysData.push({
        dateKey,
        shortDate: formatShortDate(dateKey),
        isToday,
        answered: log.answered || 0,
        correct: log.correct || 0,
        stars: log.starsEarned || 0
      });
    }

    // Determine max answered for scaling (minimum scale ceiling of 10)
    const maxAnswered = Math.max(10, ...daysData.map(d => d.answered));

    // Clear and render 7 CSS columns
    chartContainer.innerHTML = '';
    let totalWeekAnswered = 0;
    let totalWeekCorrect = 0;

    daysData.forEach(day => {
      totalWeekAnswered += day.answered;
      totalWeekCorrect += day.correct;

      // Calculate bar height percentage (min 5% for visual visibility if answered > 0, 3% if 0)
      const heightPercent = day.answered > 0
        ? Math.max(8, Math.round((day.answered / maxAnswered) * 100))
        : 4;

      const col = document.createElement('div');
      col.className = 'chart-column';
      col.setAttribute('title', `${day.shortDate}: ${day.answered} câu (${day.correct} đúng, +${day.stars} ⭐)`);

      col.innerHTML = `
        <div class="chart-val-label">${day.answered > 0 ? day.answered : ''}</div>
        <div class="chart-bar-slot">
          <div class="chart-bar-fill ${day.isToday ? 'today' : ''}" style="height: ${heightPercent}%;"></div>
        </div>
        <div class="chart-day-label ${day.isToday ? 'today' : ''}">
          ${day.isToday ? 'Hôm nay' : day.shortDate}
        </div>
      `;

      chartContainer.appendChild(col);
    });

    // Summary totals below chart
    const totalAnsweredEl = document.getElementById('chart-total-answered');
    if (totalAnsweredEl) {
      totalAnsweredEl.textContent = `${totalWeekAnswered} câu`;
    }

    const accuracyEl = document.getElementById('chart-accuracy-rate');
    if (accuracyEl) {
      const rate = totalWeekAnswered > 0 ? Math.round((totalWeekCorrect / totalWeekAnswered) * 100) : 0;
      accuracyEl.textContent = `${rate}% chính xác`;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. RENDER PER-TOPIC PROGRESS BARS
  // ═════════════════════════════════════════════════════════════════════════
  function renderTopicProgress() {
    if (typeof GameEngine === 'undefined') return;

    const listContainer = document.getElementById('topics-progress-container');
    if (!listContainer) return;

    const topics = (typeof DATA !== 'undefined' && Array.isArray(DATA.topics)) ? DATA.topics : [
      { id: 'luat_vc', name: 'Luật Viên Chức', icon: '📜', description: 'Luật Viên chức số 58/2010/QH12 & sửa đổi 2019' },
      { id: 'luat_cbcc', name: 'Luật Cán Bộ, Công Chức', icon: '⚖️', description: 'Luật Cán bộ, công chức số 22/2008/QH12 & sửa đổi 2019' }
    ];

    listContainer.innerHTML = '';

    topics.forEach(topic => {
      const prog = GameEngine.getTopicProgress(topic.id) || { total: 0, mastered: 0, learning: 0, new: 0, percentage: 0 };
      const dueQuestions = GameEngine.getTodayReview(topic.id) || [];
      const dueCount = dueQuestions.length;

      const card = document.createElement('div');
      card.className = 'topic-progress-card';

      card.innerHTML = `
        <div class="topic-card-top">
          <div class="topic-card-info">
            <span class="topic-card-icon">${topic.icon || '📚'}</span>
            <div>
              <div class="topic-card-name">${topic.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-mid);">${topic.description || ''}</div>
            </div>
          </div>
          <div class="topic-card-fraction">
            <span>${prog.mastered}/${prog.total}</span>
            <span style="font-size: 0.85rem; color: var(--text-mid); font-weight: 700;">(${prog.percentage}%)</span>
          </div>
        </div>

        <div class="progress-track" title="Tỷ lệ đã thuộc: ${prog.percentage}%">
          <div class="progress-fill green" style="width: ${prog.percentage}%;"></div>
        </div>

        <div class="topic-breakdown-tags">
          <span class="status-badge mastered">🟢 Đã thuộc: ${prog.mastered}</span>
          <span class="status-badge learning">🟡 Đang học: ${prog.learning}</span>
          <span class="status-badge new">🔵 Chưa học: ${prog.new}</span>
          ${dueCount > 0 ? `<span class="status-badge" style="background: #FFEDD5; color: #C2410C;">🟠 Cần ôn hôm nay: ${dueCount}</span>` : ''}
        </div>
      `;

      listContainer.appendChild(card);
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. RENDER 10 BADGES GRID
  // ═════════════════════════════════════════════════════════════════════════
  function renderBadges() {
    if (typeof GameEngine === 'undefined') return;

    const gridContainer = document.getElementById('badges-grid-container');
    if (!gridContainer) return;

    // Check badges in engine to ensure newly qualified badges are awarded
    GameEngine.checkBadges();

    const badges = (typeof DATA !== 'undefined' && Array.isArray(DATA.badges)) ? DATA.badges : [
      { id: 'first_lesson', name: 'Người Mới', icon: '🌟', condition: 'Hoàn thành bài học đầu tiên' },
      { id: 'streak_7', name: 'Kiên Trì', icon: '🔥', condition: 'Chuỗi học liên tục 7 ngày' },
      { id: 'perfect_quiz', name: 'Hoàn Hảo', icon: '💯', condition: 'Đạt 100% điểm trong một bộ quiz' },
      { id: 'boss_hunter', name: 'Thợ Săn Boss', icon: '👹', condition: 'Đánh bại Boss lần đầu tiên' },
      { id: 'decorator_10', name: 'Kiến Trúc Sư', icon: '🏠', condition: 'Sở hữu 10 món đồ trang trí' },
      { id: 'pet_lover_3', name: 'Bạn Của Thú', icon: '🐾', condition: 'Nhận nuôi 3 bé pet trở lên' },
      { id: 'scholar_50', name: 'Học Giả', icon: '📚', condition: 'Có 50 câu đạt mức Đã Thuộc' },
      { id: 'speed_demon', name: 'Tia Chớp', icon: '⚡', condition: 'Đạt 20+ câu đúng trong Thi Tốc Độ' },
      { id: 'survivor_20', name: 'Bất Bại', icon: '🛡️', condition: 'Đạt 20+ câu đúng trong Sống Sót' },
      { id: 'combo_10', name: 'Combo Master', icon: '🔥', condition: 'Đạt chuỗi Combo 10 câu liên tiếp' }
    ];

    gridContainer.innerHTML = '';

    badges.forEach(badge => {
      const isUnlocked = GameEngine.hasBadge(badge.id);

      const card = document.createElement('div');
      card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const iconDisplay = isUnlocked ? (badge.icon || badge.emoji || '🏆') : '🔒';
      const statusText = isUnlocked ? '🎉 Đã Đạt' : 'Chưa Mở';
      const conditionText = badge.condition || badge.description || '';

      card.innerHTML = `
        <div class="badge-icon">${iconDisplay}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-condition">${conditionText}</div>
        <div class="badge-status-tag">${statusText}</div>
      `;

      card.addEventListener('click', () => {
        GameEngine.playSound('tap');
        if (isUnlocked) {
          showToast(`🏆 Danh hiệu: ${badge.name} — ${conditionText} (Đã hoàn thành!)`, 'success', 3000);
        } else {
          showToast(`🔒 Danh hiệu ${badge.name}: Cần hoàn thành: "${conditionText}" để mở khóa!`, 'info', 3000);
        }
      });

      gridContainer.appendChild(card);
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 8. RENDER CHALLENGE HIGH SCORES TABLE
  // ═════════════════════════════════════════════════════════════════════════
  function renderHighScores() {
    if (typeof GameEngine === 'undefined') return;

    const highScores = GameEngine.getHighScores() || { speed: 0, survival: 0, combo: 0, boss: 0 };

    const speedEl = document.getElementById('score-speed');
    if (speedEl) speedEl.textContent = `${highScores.speed || 0} câu`;

    const survivalEl = document.getElementById('score-survival');
    if (survivalEl) survivalEl.textContent = `${highScores.survival || 0} câu`;

    const comboEl = document.getElementById('score-combo');
    if (comboEl) comboEl.textContent = `x${highScores.combo || 0}`;

    const bossEl = document.getElementById('score-boss');
    if (bossEl) bossEl.textContent = `${highScores.boss || 0} lần`;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 9. EVENT LISTENERS
  // ═════════════════════════════════════════════════════════════════════════
  function setupEventListeners() {
    // Sound toggle
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
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 10. APP INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════
  function initStats() {
    if (typeof GameEngine === 'undefined') {
      console.error('[stats.js] GameEngine is not loaded.');
      return;
    }

    // Initialize Game Engine state
    GameEngine.init();

    // Render all stats components
    renderHUD();
    renderOverview();
    renderActivityChart();
    renderTopicProgress();
    renderBadges();
    renderHighScores();

    // Setup interactive handlers
    setupEventListeners();

    // Listen to real-time events
    if (typeof GameEngine.on === 'function') {
      GameEngine.on('stars:earned', () => { renderHUD(); renderOverview(); });
      GameEngine.on('streak:updated', () => { renderHUD(); renderOverview(); });
      GameEngine.on('badges:unlocked', renderBadges);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStats);
  } else {
    initStats();
  }
})();
