/**
 * js/study.js
 * Controller for study.html (Topic Selection, Review Priority, Mode Picker)
 */

(function() {
  'use strict';

  function initStudyHub() {
    if (typeof GameEngine !== 'undefined') {
      GameEngine.init();
    }

    updateHUD();
    renderPrioritySection();
    renderTopics();
    bindModalEvents();
  }

  function updateHUD() {
    if (typeof GameEngine === 'undefined') return;
    const starsEl = document.getElementById('stars-count');
    const streakEl = document.getElementById('streak-count');
    if (starsEl) starsEl.textContent = GameEngine.getStars();
    if (streakEl) streakEl.textContent = GameEngine.getStreak().current;
  }

  function getTodayIsoString() {
    return new Date().toISOString().split('T')[0];
  }

  function renderPrioritySection() {
    if (typeof GameEngine === 'undefined' || typeof DATA === 'undefined') return;

    const todayStr = getTodayIsoString();
    const allQuestions = DATA.questions || [];

    // Filter questions due for review today or marked for review
    const dueQuestions = allQuestions.filter(q => {
      const p = GameEngine.getProgress(q.id);
      return p.status === 'review' || (p.nextReview && p.nextReview <= todayStr);
    });

    const badgeEl = document.getElementById('priority-total-badge');
    const descEl = document.getElementById('priority-desc-text');
    const quickBtn = document.getElementById('btn-quick-review');

    if (dueQuestions.length > 0) {
      if (badgeEl) badgeEl.textContent = `${dueQuestions.length} câu cần ôn`;
      if (descEl) {
        descEl.innerHTML = `Bạn có <strong>${dueQuestions.length} câu hỏi</strong> đến lịch ôn hôm nay. Hãy ôn tập ngay để giữ vững trí nhớ nhé!`;
      }
      if (quickBtn) {
        quickBtn.textContent = `⚡ Ôn Ngay (${dueQuestions.length} câu)`;
        quickBtn.onclick = () => {
          GameEngine.playSound('tap');
          // Find the first topic with due questions, or fallback to first topic
          const firstDueTopicId = dueQuestions[0].topicId;
          const topic = DATA.topics.find(t => t.id === firstDueTopicId) || DATA.topics[0];
          openModeModal(topic);
        };
      }
    } else {
      if (badgeEl) {
        badgeEl.textContent = '0 câu';
        badgeEl.style.background = 'var(--green-main)';
      }
      if (descEl) {
        descEl.textContent = '🎉 Bạn không có câu nào cần ôn gấp hôm nay! Hãy chọn một chủ đề bên dưới để khám phá kiến thức mới.';
      }
      if (quickBtn) {
        quickBtn.textContent = '📚 Bắt Đầu Học Bài';
        quickBtn.onclick = () => {
          GameEngine.playSound('tap');
          if (DATA.topics && DATA.topics.length > 0) {
            openModeModal(DATA.topics[0]);
          }
        };
      }
    }
  }

  function renderTopics() {
    const container = document.getElementById('topic-grid');
    if (!container || typeof DATA === 'undefined' || !Array.isArray(DATA.topics)) return;

    container.innerHTML = '';

    DATA.topics.forEach(topic => {
      const stats = typeof GameEngine !== 'undefined'
        ? GameEngine.getTopicProgress(topic.id)
        : { total: 0, mastered: 0, learning: 0, review: 0, new: 0, percentage: 0 };

      const total = stats.total || 1;
      const pctMastered = ((stats.mastered / total) * 100).toFixed(1);
      const pctLearning = ((stats.learning / total) * 100).toFixed(1);
      const pctReview = ((stats.review / total) * 100).toFixed(1);
      const pctNew = ((stats.new / total) * 100).toFixed(1);

      const card = document.createElement('div');
      card.className = 'topic-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="topic-top">
          <div class="topic-icon">${topic.icon || '📖'}</div>
          <div class="topic-info">
            <h3 class="topic-name">${escapeHtml(topic.name)}</h3>
            <p class="topic-desc">${escapeHtml(topic.description || '')}</p>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-meta">
            <span>Tiến độ thuộc bài</span>
            <span><strong>${stats.percentage}%</strong> (${stats.mastered}/${stats.total})</span>
          </div>
          <div class="progress-bar-container">
            <div class="bar-seg bar-mastered" style="width: ${pctMastered}%;" title="Đã thuộc: ${stats.mastered}"></div>
            <div class="bar-seg bar-learning" style="width: ${pctLearning}%;" title="Đang học: ${stats.learning}"></div>
            <div class="bar-seg bar-review" style="width: ${pctReview}%;" title="Cần ôn: ${stats.review}"></div>
            <div class="bar-seg bar-new" style="width: ${pctNew}%;" title="Mới: ${stats.new}"></div>
          </div>
          <div class="progress-legend">
            <span class="legend-item"><span class="legend-dot" style="background: var(--green-main);"></span> Thuộc (${stats.mastered})</span>
            <span class="legend-item"><span class="legend-dot" style="background: var(--yellow-main);"></span> Đang học (${stats.learning})</span>
            <span class="legend-item"><span class="legend-dot" style="background: #FF9F45;"></span> Cần ôn (${stats.review})</span>
            <span class="legend-item"><span class="legend-dot" style="background: var(--blue-main);"></span> Mới (${stats.new})</span>
          </div>
        </div>
        <button type="button" class="btn-study-topic">Chọn Chế Độ Học 🐾</button>
      `;

      card.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        openModeModal(topic);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
          openModeModal(topic);
        }
      });

      container.appendChild(card);
    });
  }

  function openModeModal(topic) {
    const modal = document.getElementById('mode-modal');
    const titleEl = document.getElementById('modal-topic-title');
    const descEl = document.getElementById('modal-topic-desc');
    const container = document.getElementById('modal-modes-container');

    if (!modal || !topic) return;

    if (titleEl) titleEl.textContent = `${topic.icon || '📖'} ${topic.name}`;
    if (descEl) descEl.textContent = topic.description || 'Chọn một chế độ học để bắt đầu luyện tập:';

    if (container) {
      const topicIdParam = encodeURIComponent(topic.id);
      container.innerHTML = `
        <a href="flashcard.html?topic=${topicIdParam}" class="mode-btn">
          <div class="mode-left">
            <span class="mode-icon">🃏</span>
            <div class="mode-texts">
              <div class="mode-name">Thẻ Ghi Nhớ (Flashcard)</div>
              <div class="mode-sub">Lật thẻ 3D, tự đánh giá mức độ nhớ</div>
            </div>
          </div>
          <span class="mode-reward">+1 ⭐</span>
        </a>

        <a href="quiz.html?topic=${topicIdParam}" class="mode-btn">
          <div class="mode-left">
            <span class="mode-icon">❓</span>
            <div class="mode-texts">
              <div class="mode-name">Trắc Nghiệm (Quiz A/B/C/D)</div>
              <div class="mode-sub">4 lựa chọn, xem giải thích chi tiết</div>
            </div>
          </div>
          <span class="mode-reward">+2 ⭐</span>
        </a>

        <a href="matching.html?topic=${topicIdParam}" class="mode-btn">
          <div class="mode-left">
            <span class="mode-icon">🔗</span>
            <div class="mode-texts">
              <div class="mode-name">Ghép Đôi (Matching Pairs)</div>
              <div class="mode-sub">Nối khái niệm với định nghĩa tương ứng</div>
            </div>
          </div>
          <span class="mode-reward">+2 ⭐</span>
        </a>

        <a href="sorting.html?topic=${topicIdParam}" class="mode-btn">
          <div class="mode-left">
            <span class="mode-icon">🔀</span>
            <div class="mode-texts">
              <div class="mode-name">Sắp Xếp (Ordering / Sorting)</div>
              <div class="mode-sub">Kéo thả các bước theo đúng quy trình</div>
            </div>
          </div>
          <span class="mode-reward">+1 ⭐/bước</span>
        </a>
      `;

      // Sound on click
      container.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        });
      });
    }

    modal.style.display = 'flex';
  }

  function bindModalEvents() {
    const modal = document.getElementById('mode-modal');
    const closeBtn = document.getElementById('btn-close-modal');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (typeof GameEngine !== 'undefined') GameEngine.playSound('tap');
        if (modal) modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
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
    document.addEventListener('DOMContentLoaded', initStudyHub);
  } else {
    initStudyHub();
  }
})();
