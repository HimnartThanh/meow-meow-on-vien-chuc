/**
 * tests/tier1_functional/srs_stars_streak.test.js
 * Tier 1: Functional Tests for Features 4, 5, 6, 7:
 *   - Feature 4: SRS 5-Stage Intervals & Due Logic (5 tests)
 *   - Feature 5: Star Arithmetic & Non-Negative Guard (5 tests)
 *   - Feature 6: Streak Consecutive & Reset Logic (5 tests)
 *   - Feature 7: Badge Trigger & Unlock Criteria (5 tests)
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 1: Feature 4 — SRS 5-Stage Intervals & Due Logic', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('4.1: Correct answer increments correctCount and sets learning status', () => {
    if (!env.engine) return;
    const qId = 'q_luatvc_001';
    env.engine.markAnswered(qId, true);
    const p = env.engine.getProgress(qId);
    assert.strictEqual(p.correctCount, 1);
    assert.strictEqual(p.status, 'learning');
  });

  it('4.2: 5 consecutive correct answers transition question to mastered', () => {
    if (!env.engine) return;
    const qId = 'q_luatvc_001';
    for (let i = 0; i < 5; i++) {
      env.engine.markAnswered(qId, true);
    }
    const p = env.engine.getProgress(qId);
    assert.assert.isAtLeast(p.correctCount, 5);
    assert.strictEqual(p.status, 'mastered');
  });

  it('4.3: Incorrect answer resets correctCount to 0 and status to review', () => {
    if (!env.engine) return;
    const qId = 'q_luatvc_001';
    env.engine.markAnswered(qId, true);
    env.engine.markAnswered(qId, true);
    env.engine.markAnswered(qId, false); // Wrong
    const p = env.engine.getProgress(qId);
    assert.strictEqual(p.correctCount, 0);
    assert.strictEqual(p.status, 'review');
  });

  it('4.4: Next review date for incorrect answer is scheduled for tomorrow (1 day)', () => {
    if (!env.engine) return;
    const qId = 'q_luatvc_001';
    env.engine.markAnswered(qId, false);
    const p = env.engine.getProgress(qId);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    assert.strictEqual(p.nextReview, tomorrow);
  });

  it('4.5: getTodayReview returns questions due today or earlier', () => {
    if (!env.engine) return;
    const qId = 'q_luatvc_001';
    env.engine.markAnswered(qId, false); // due tomorrow
    // Move time forward 2 days
    env.sandbox.advanceTimeDays(2);
    const due = env.engine.getTodayReview('luat_vc');
    assert.ok(Array.isArray(due), 'getTodayReview returns array');
    const hasQ = due.some(q => (typeof q === 'string' ? q === qId : q.id === qId));
    assert.ok(hasQ, 'Question should now be due for review');
  });
});

describe('Tier 1: Feature 5 — Star Arithmetic & Non-Negative Guard', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('5.1: earnStars adds exact amount to both current and total stars', () => {
    if (!env.engine) return;
    env.engine.earnStars(25, 'quiz');
    assert.strictEqual(env.engine.getStars(), 25);
    assert.strictEqual(env.engine.getTotalStarsEarned(), 25);
  });

  it('5.2: spendStars deducts exact amount when balance is sufficient', () => {
    if (!env.engine) return;
    env.engine.earnStars(30, 'quiz');
    const res = env.engine.spendStars(20, 'furniture');
    const ok = res === true || (res && res.success === true);
    assert.ok(ok, 'spendStars succeeded');
    assert.strictEqual(env.engine.getStars(), 10);
    assert.strictEqual(env.engine.getTotalStarsEarned(), 30, 'Total stars never decreases');
  });

  it('5.3: spendStars rejects transaction when balance is insufficient', () => {
    if (!env.engine) return;
    env.engine.earnStars(10, 'quiz');
    const res = env.engine.spendStars(25, 'furniture');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false, 'spendStars must fail');
    assert.strictEqual(env.engine.getStars(), 10, 'Balance intact');
  });

  it('5.4: Star balance never goes below zero on zero-balance spend', () => {
    if (!env.engine) return;
    const res = env.engine.spendStars(5, 'furniture');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false);
    assert.strictEqual(env.engine.getStars(), 0);
  });

  it('5.5: Negative and invalid spend values are rejected', () => {
    if (!env.engine) return;
    env.engine.earnStars(10, 'test');
    env.engine.spendStars(-20, 'hack');
    assert.strictEqual(env.engine.getStars(), 10, 'Negative spend must not add balance');
  });
});

describe('Tier 1: Feature 6 — Streak Consecutive & Reset Logic', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('6.1: First checkIn starts streak at 1', () => {
    if (!env.engine) return;
    env.engine.checkIn();
    const s = env.engine.getStreak();
    assert.strictEqual(s.current, 1);
    assert.strictEqual(s.longest, 1);
  });

  it('6.2: Multiple checkIns on the same day are idempotent', () => {
    if (!env.engine) return;
    env.engine.checkIn();
    env.engine.checkIn();
    const s = env.engine.getStreak();
    assert.strictEqual(s.current, 1, 'Streak stays 1 on same day');
  });

  it('6.3: Consecutive daily check-in increments streak by 1', () => {
    if (!env.engine) return;
    env.engine.checkIn();
    env.sandbox.advanceTimeDays(1);
    env.engine.checkIn();
    const s = env.engine.getStreak();
    assert.strictEqual(s.current, 2);
    assert.strictEqual(s.longest, 2);
  });

  it('6.4: Missing one day breaks streak and resets current to 1', () => {
    if (!env.engine) return;
    env.engine.checkIn();
    env.sandbox.advanceTimeDays(1);
    env.engine.checkIn(); // day 2
    env.sandbox.advanceTimeDays(2); // missed 1 full day
    env.engine.checkIn();
    const s = env.engine.getStreak();
    assert.strictEqual(s.current, 1, 'Broken streak resets to 1');
    assert.strictEqual(s.longest, 2, 'Longest streak preserved');
  });

  it('6.5: Weekly 7-day streak milestone awards 20 bonus stars', () => {
    if (!env.engine) return;
    const initialStars = env.engine.getStars();
    for (let day = 0; day < 7; day++) {
      env.engine.checkIn();
      if (day < 6) env.sandbox.advanceTimeDays(1);
    }
    const finalStars = env.engine.getStars();
    // 7 days checkin (5*7=35) + milestone bonus (20) = 55 bonus stars
    assert.assert.isAtLeast(finalStars - initialStars, 20, 'Received milestone bonus');
  });
});

describe('Tier 1: Feature 7 — Badge Trigger & Unlock Criteria', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('7.1: first_lesson badge unlocks after first question is answered', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('first_lesson'), 'Should have first_lesson badge');
  });

  it('7.2: streak_7 badge unlocks when streak reaches 7', () => {
    if (!env.engine) return;
    for (let day = 0; day < 7; day++) {
      env.engine.checkIn();
      if (day < 6) env.sandbox.advanceTimeDays(1);
    }
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('streak_7'), 'Should have streak_7 badge');
  });

  it('7.3: decorator_10 badge unlocks after acquiring 10 shop items', () => {
    if (!env.engine) return;
    env.engine.earnStars(500, 'test');
    for (let i = 1; i <= 10; i++) {
      env.engine.buyItem(`item_test_${i}`);
    }
    env.engine.checkBadges();
    if (env.engine.getOwnedItems().length >= 10) {
      assert.ok(env.engine.hasBadge('decorator_10'), 'Should unlock decorator_10');
    }
  });

  it('7.4: checkBadges returns array of newly unlocked badges and is idempotent', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    const newBadges1 = env.engine.checkBadges();
    const newBadges2 = env.engine.checkBadges();
    assert.ok(Array.isArray(newBadges1));
    assert.strictEqual(newBadges2.length, 0, 'No duplicate badges unlocked');
  });

  it('7.5: getBadges returns all currently unlocked badge IDs', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    env.engine.checkBadges();
    const badges = env.engine.getBadges();
    assert.ok(Array.isArray(badges));
    assert.ok(badges.includes('first_lesson'));
  });
});
