/**
 * tests/tier5_adversarial/challenger_m5_1_stress.test.js
 * Comprehensive Adversarial Stress Test Suite by Challenger M5-1
 *
 * Scope:
 * 1. SRS mastery stages [1, 3, 7, 15, 30] days, interval progression, and clamping.
 * 2. Long-term simulated study progression across months with daily due question queries.
 * 3. Streak calculation under boundary conditions (same-day duplicate, consecutive, 2-day gap, month-end, leap year).
 * 4. Star economy invariants under 1,000 random transactions (non-negative guard, monotonic total stars).
 * 5. Corrupt/invalid localStorage state injection and graceful recovery.
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Challenger M5-1: Spaced Repetition System (SRS) Mastery & Progression', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine({ initialTime: '2026-01-01T10:00:00Z' });
    env.engine.init();
  });

  it('SRS-1.1: Progression advances exactly through [1, 3, 7, 15, 30] days on consecutive correct answers', () => {
    const qId = 'q_luatvc_001';
    const expectedIntervals = [1, 3, 7, 15, 30];
    const expectedDueDates = [
      '2026-01-02', // +1
      '2026-01-04', // +3
      '2026-01-08', // +7
      '2026-01-16', // +15
      '2026-01-31'  // +30
    ];

    for (let i = 0; i < expectedIntervals.length; i++) {
      const res = env.engine.markAnswered(qId, true);
      assert.strictEqual(res.correctCount, i + 1, `correctCount should be ${i + 1}`);
      assert.strictEqual(res.nextReview, expectedDueDates[i], `nextReview should match interval ${expectedIntervals[i]} days`);
      if (i < 4) {
        assert.strictEqual(res.status, 'learning', `status should be 'learning' at count ${i + 1}`);
      } else {
        assert.strictEqual(res.status, 'mastered', `status should be 'mastered' at count ${i + 1}`);
      }
    }
  });

  it('SRS-1.2: Correct count beyond 5 stays clamped at 30 days and remains "mastered"', () => {
    const qId = 'q_luatvc_002';

    // Reach mastered (5 correct answers)
    for (let i = 0; i < 5; i++) {
      env.engine.markAnswered(qId, true);
    }
    const masteredProg = env.engine.getProgress(qId);
    assert.strictEqual(masteredProg.status, 'mastered');
    assert.strictEqual(masteredProg.correctCount, 5);

    // Answer 5 more times consecutively (counts 6 to 10)
    for (let c = 6; c <= 10; c++) {
      const res = env.engine.markAnswered(qId, true);
      assert.strictEqual(res.correctCount, c);
      assert.strictEqual(res.status, 'mastered', 'Status must stay mastered beyond 5');
      assert.strictEqual(res.nextReview, '2026-01-31', 'Interval must remain clamped at 30 days');
    }
  });

  it('SRS-1.3: Incorrect answer resets correctCount to 0, status to "review", and nextReview to tomorrow at any stage', () => {
    const stages = [1, 3, 5, 8];

    for (const targetCount of stages) {
      const qId = `q_test_fail_${targetCount}`;
      // Advance to target stage
      for (let i = 0; i < targetCount; i++) {
        env.engine.markAnswered(qId, true);
      }
      assert.strictEqual(env.engine.getProgress(qId).correctCount, targetCount);

      // Now answer wrong
      const failed = env.engine.markAnswered(qId, false);
      assert.strictEqual(failed.correctCount, 0, `correctCount must reset to 0 after failure at stage ${targetCount}`);
      assert.strictEqual(failed.status, 'review', `status must become 'review' after failure at stage ${targetCount}`);
      assert.strictEqual(failed.nextReview, '2026-01-02', 'nextReview must be scheduled for tomorrow (+1 day)');
    }
  });

  it('SRS-1.4: Post-failure recovery correctly promotes question back to Stage 1 (1 day, learning)', () => {
    const qId = 'q_luatvc_003';
    // Master the question
    for (let i = 0; i < 5; i++) env.engine.markAnswered(qId, true);
    assert.strictEqual(env.engine.getProgress(qId).status, 'mastered');

    // Fail
    const failRes = env.engine.markAnswered(qId, false);
    assert.strictEqual(failRes.status, 'review');
    assert.strictEqual(failRes.correctCount, 0);

    // Answer correctly next
    const recoverRes = env.engine.markAnswered(qId, true);
    assert.strictEqual(recoverRes.correctCount, 1, 'correctCount recovers to 1');
    assert.strictEqual(recoverRes.status, 'learning', 'status recovers to learning');
    assert.strictEqual(recoverRes.nextReview, '2026-01-02', 'nextReview interval is 1 day');
  });

  it('SRS-1.5: SRS progress persists cleanly across localStorage save and reload', () => {
    const qId = 'q_daoduc_001';
    env.engine.markAnswered(qId, true);
    env.engine.markAnswered(qId, true);
    env.engine.markAnswered(qId, true);
    const before = env.engine.getProgress(qId);
    assert.strictEqual(before.correctCount, 3);
    assert.strictEqual(before.nextReview, '2026-01-08');

    // Reload engine from same storage
    const reloaded = loadTestEngine({
      initialTime: '2026-01-01T10:00:00Z',
      initialStorage: env.sandbox.localStorage.__getRawStore()
    });
    reloaded.engine.init();

    const after = reloaded.engine.getProgress(qId);
    assert.strictEqual(after.correctCount, 3);
    assert.strictEqual(after.status, 'learning');
    assert.strictEqual(after.nextReview, '2026-01-08');
  });
});

describe('Challenger M5-1: Long-Term Multi-Month Study Simulation', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine({ initialTime: '2026-01-01T08:00:00Z' });
    env.engine.init();
  });

  it('SIM-2.1: 90-day realistic spaced study simulation maintains queue tier integrity and mastery convergence', () => {
    const topicId = 'luat_vc';
    const allQuestions = env.data.questions.filter(q => q.topicId === topicId);
    assert.isAtLeast(allQuestions.length, 3, 'Need at least 3 questions to simulate');

    // Over 90 days, student reviews questions due on each day
    for (let day = 0; day < 90; day++) {
      const todayStr = env.engine.getState().createdAt ?
        env.engine.getState().streak.lastCheckIn || '2026-01-01' : '2026-01-01';

      const reviewQueue = env.engine.getTodayReview(topicId);
      assert.ok(Array.isArray(reviewQueue), 'Review queue must always be an array');
      assert.strictEqual(reviewQueue.length, allQuestions.length, 'Queue contains all topic questions');

      // Check tier invariant:
      // All questions with status == 'review' or nextReview <= current date must appear before un-due questions
      const currentCalDate = new env.sandbox.Date();
      const curY = currentCalDate.getFullYear();
      const curM = String(currentCalDate.getMonth() + 1).padStart(2, '0');
      const curD = String(currentCalDate.getDate()).padStart(2, '0');
      const curDateStr = `${curY}-${curM}-${curD}`;

      let sawNonDue = false;
      for (const q of reviewQueue) {
        const prog = env.engine.getProgress(q.id);
        const isDue = prog.status === 'review' || (prog.nextReview && prog.nextReview <= curDateStr);
        const isNew = prog.status === 'new';

        if (isDue) {
          assert.strictEqual(sawNonDue, false, `Due question ${q.id} must not appear after non-due items`);
        } else if (!isNew) {
          sawNonDue = true;
        }
      }

      // Simulate student answering the due questions (or 1 new question if none due)
      const dueQuestions = reviewQueue.filter(q => {
        const p = env.engine.getProgress(q.id);
        return p.status === 'review' || (p.nextReview && p.nextReview <= curDateStr);
      });

      const toStudy = dueQuestions.length > 0 ? dueQuestions : reviewQueue.slice(0, 1);
      for (const q of toStudy) {
        // 80% chance of correct, 20% wrong
        const isCorrect = (day % 5 !== 4);
        env.engine.markAnswered(q.id, isCorrect);
      }

      // Advance time by 1 day
      env.sandbox.advanceTimeDays(1);
    }

    // At end of 90 days, verify topic progress and invariants
    const stats = env.engine.getTopicProgress(topicId);
    assert.strictEqual(stats.total, allQuestions.length);
    assert.strictEqual(stats.mastered + stats.learning + stats.review + stats.new, stats.total);
    assert.between(stats.percentage, 0, 100);
    assert.isAbove(stats.mastered, 0, 'After 90 days of study, some questions must be mastered');
  });

  it('SIM-2.2: Mastered question becomes due after 30 days and moves from Tier 4 to Tier 1 in getTodayReview', () => {
    const qId = 'q_luatvc_001';
    // Master the question on 2026-01-01
    for (let i = 0; i < 5; i++) {
      env.engine.markAnswered(qId, true);
    }
    const prog = env.engine.getProgress(qId);
    assert.strictEqual(prog.status, 'mastered');
    assert.strictEqual(prog.nextReview, '2026-01-31');

    // Day 1 (2026-01-02): Not due yet, should be in Tier 4 (not first)
    env.sandbox.advanceTimeDays(1);
    let queue = env.engine.getTodayReview('luat_vc');
    let idx = queue.findIndex(q => q.id === qId);
    assert.isAbove(idx, 0, 'Mastered question not yet due must not be at the front of queue');

    // Advance 29 more days to 2026-01-31 (exactly 30 days from Jan 1)
    env.sandbox.advanceTimeDays(29);
    queue = env.engine.getTodayReview('luat_vc');
    idx = queue.findIndex(q => q.id === qId);
    assert.strictEqual(idx, 0, 'Mastered question now due (nextReview <= today) must be prioritized in Tier 1');
  });
});

describe('Challenger M5-1: Streak Calculation Under Boundary Conditions', () => {
  it('STR-3.1: Initial check-in creates streak = 1 and awards 5 stars', () => {
    const env = loadTestEngine({ initialTime: '2026-01-01T10:00:00Z' });
    env.engine.init();

    const res = env.engine.checkIn();
    assert.strictEqual(res.changed, true);
    assert.strictEqual(res.streak, 1);
    assert.strictEqual(res.starsEarned, 5);
    assert.strictEqual(env.engine.getStars(), 5);
    assert.strictEqual(env.engine.getStreak().current, 1);
    assert.strictEqual(env.engine.getStreak().longest, 1);
  });

  it('STR-3.2: Same-day duplicate check-in is strictly idempotent and awards zero duplicate stars', () => {
    const env = loadTestEngine({ initialTime: '2026-01-01T10:00:00Z' });
    env.engine.init();

    env.engine.checkIn();
    const initialStars = env.engine.getStars();

    // Call 10 rapid duplicate check-ins on the same day
    for (let i = 0; i < 10; i++) {
      const dup = env.engine.checkIn();
      assert.strictEqual(dup.changed, false, 'Duplicate checkIn must report changed: false');
      assert.strictEqual(dup.streak, 1, 'Duplicate checkIn streak remains 1');
      assert.strictEqual(dup.starsEarned, 0, 'Duplicate checkIn awards 0 stars');
    }

    assert.strictEqual(env.engine.getStars(), initialStars, 'Stars must not increase from duplicate checkIns');
  });

  it('STR-3.3: Consecutive daily check-ins increment streak and 7-day milestone awards 20 bonus stars', () => {
    const env = loadTestEngine({ initialTime: '2026-01-01T10:00:00Z' });
    env.engine.init();

    let expectedStars = 0;
    for (let day = 1; day <= 7; day++) {
      const res = env.engine.checkIn();
      assert.strictEqual(res.changed, true);
      assert.strictEqual(res.streak, day);

      if (day === 7) {
        // Day 7 bonus: 5 base + 20 bonus = 25 stars
        assert.strictEqual(res.starsEarned, 25, 'Day 7 awards 25 stars (5 base + 20 bonus)');
        expectedStars += 25;
      } else {
        assert.strictEqual(res.starsEarned, 5, `Day ${day} awards 5 stars`);
        expectedStars += 5;
      }

      assert.strictEqual(env.engine.getStars(), expectedStars);
      if (day < 7) env.sandbox.advanceTimeDays(1);
    }

    assert.strictEqual(env.engine.getStreak().current, 7);
    assert.strictEqual(env.engine.getStreak().longest, 7);
    // streak_7 badge should unlock
    assert.ok(env.engine.getBadges().includes('streak_7'), 'streak_7 badge unlocked on 7-day streak');
  });

  it('STR-3.4: 2-day gap (missed one day) resets current streak to 1 while preserving longest', () => {
    const env = loadTestEngine({ initialTime: '2026-01-01T10:00:00Z' });
    env.engine.init();

    // Check in Day 1, 2, 3
    env.engine.checkIn(); // Day 1
    env.sandbox.advanceTimeDays(1);
    env.engine.checkIn(); // Day 2
    env.sandbox.advanceTimeDays(1);
    env.engine.checkIn(); // Day 3
    assert.strictEqual(env.engine.getStreak().current, 3);
    assert.strictEqual(env.engine.getStreak().longest, 3);

    // Skip Day 4 (advance 2 days to Day 5)
    env.sandbox.advanceTimeDays(2);
    const res = env.engine.checkIn(); // Day 5
    assert.strictEqual(res.changed, true);
    assert.strictEqual(res.streak, 1, 'Streak must reset to 1 after 2-day gap');
    assert.strictEqual(env.engine.getStreak().current, 1);
    assert.strictEqual(env.engine.getStreak().longest, 3, 'Longest streak of 3 must be preserved');
  });

  it('STR-3.5: 30-day gap resets current streak to 1 while preserving longest', () => {
    const env = loadTestEngine({ initialTime: '2026-01-01T10:00:00Z' });
    env.engine.init();

    env.engine.checkIn(); // Day 1
    env.sandbox.advanceTimeDays(1);
    env.engine.checkIn(); // Day 2
    assert.strictEqual(env.engine.getStreak().current, 2);

    // Advance 30 days
    env.sandbox.advanceTimeDays(30);
    const res = env.engine.checkIn();
    assert.strictEqual(res.streak, 1);
    assert.strictEqual(env.engine.getStreak().current, 1);
    assert.strictEqual(env.engine.getStreak().longest, 2);
  });

  it('STR-3.6: Month-end boundary: Jan 31 -> Feb 01 consecutive check-in increments streak', () => {
    const env = loadTestEngine({ initialTime: '2026-01-31T10:00:00Z' });
    env.engine.init();

    const r1 = env.engine.checkIn(); // Jan 31
    assert.strictEqual(r1.streak, 1);

    env.sandbox.advanceTimeDays(1); // Feb 01
    const r2 = env.engine.checkIn();
    assert.strictEqual(r2.streak, 2, 'Consecutive streak across Jan 31 -> Feb 01 must increment to 2');
  });

  it('STR-3.7: Non-leap February: Feb 28 -> Mar 01 consecutive check-in increments streak', () => {
    const env = loadTestEngine({ initialTime: '2026-02-28T10:00:00Z' });
    env.engine.init();

    const r1 = env.engine.checkIn(); // Feb 28
    assert.strictEqual(r1.streak, 1);

    env.sandbox.advanceTimeDays(1); // Mar 01
    const r2 = env.engine.checkIn();
    assert.strictEqual(r2.streak, 2, 'Consecutive streak across Feb 28 -> Mar 01 in non-leap year must increment to 2');
  });

  it('STR-3.8: Leap year February: Feb 28 -> Feb 29 -> Mar 01 consecutive streak tracking', () => {
    const env = loadTestEngine({ initialTime: '2024-02-28T10:00:00Z' }); // 2024 is leap year
    env.engine.init();

    const r1 = env.engine.checkIn(); // Feb 28
    assert.strictEqual(r1.streak, 1);

    env.sandbox.advanceTimeDays(1); // Feb 29
    const r2 = env.engine.checkIn();
    assert.strictEqual(r2.streak, 2, 'Leap day Feb 29 checkIn increments streak to 2');

    env.sandbox.advanceTimeDays(1); // Mar 01
    const r3 = env.engine.checkIn();
    assert.strictEqual(r3.streak, 3, 'Mar 01 checkIn after leap day increments streak to 3');
  });

  it('STR-3.9: Year-end boundary: Dec 31 -> Jan 01 consecutive check-in increments streak', () => {
    const env = loadTestEngine({ initialTime: '2025-12-31T10:00:00Z' });
    env.engine.init();

    const r1 = env.engine.checkIn(); // Dec 31
    assert.strictEqual(r1.streak, 1);

    env.sandbox.advanceTimeDays(1); // Jan 01
    const r2 = env.engine.checkIn();
    assert.strictEqual(r2.streak, 2, 'Consecutive streak across Dec 31 -> Jan 01 must increment to 2');
  });
});

describe('Challenger M5-1: Star Economy Invariants Under 1,000 Transactions', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    env.engine.init();
  });

  it('ECO-4.1: 1,000 random transactions maintain non-negative and monotonic invariants', () => {
    let expectedCurrent = 0;
    let expectedTotal = 0;

    for (let i = 0; i < 1000; i++) {
      const isEarn = Math.random() < 0.55;

      if (isEarn) {
        const amt = Math.floor(Math.random() * 50) + 1;
        env.engine.earnStars(amt, 'stress_test');
        expectedCurrent += amt;
        expectedTotal += amt;
      } else {
        const amt = Math.floor(Math.random() * 60) + 1;
        const res = env.engine.spendStars(amt, 'stress_test');
        const success = res === true || (res && res.success === true);

        if (success) {
          expectedCurrent -= amt;
        } else {
          // Transaction rejected due to insufficient stars: expectedCurrent unchanged
        }
      }

      // Strict invariants at EVERY step:
      const current = env.engine.getStars();
      const total = env.engine.getTotalStarsEarned();

      assert.isAtLeast(current, 0, `currentStars must never be negative at step ${i}`);
      assert.strictEqual(current, expectedCurrent, `currentStars must equal exact ledger at step ${i}`);
      assert.strictEqual(total, expectedTotal, `totalStarsEarned must equal exact ledger at step ${i}`);
      assert.isAtLeast(total, current, `totalStarsEarned (${total}) >= currentStars (${current}) at step ${i}`);
    }
  });

  it('ECO-4.2: Invalid and malicious numeric inputs are safely rejected without altering balance', () => {
    env.engine.earnStars(50, 'seed');
    const initialStars = env.engine.getStars();
    const initialTotal = env.engine.getTotalStarsEarned();

    const invalidInputs = [
      -1, -100, 0, NaN, Infinity, -Infinity,
      '50', 'invalid', null, undefined, {}, []
    ];

    for (const invalid of invalidInputs) {
      // Test spendStars
      const spendRes = env.engine.spendStars(invalid);
      assert.strictEqual(spendRes.success, false, `spendStars must reject invalid input: ${invalid}`);
      assert.strictEqual(env.engine.getStars(), initialStars, 'Balance must remain unchanged after invalid spend');

      // Test earnStars
      env.engine.earnStars(invalid, 'invalid_test');
      assert.strictEqual(env.engine.getStars(), initialStars, 'Balance must remain unchanged after invalid earn');
      assert.strictEqual(env.engine.getTotalStarsEarned(), initialTotal, 'Total must remain unchanged after invalid earn');
    }
  });

  it('ECO-4.3: Floating-point amounts are truncated/floored to integers preventing fractional star drift', () => {
    env.engine.earnStars(10.75, 'float_earn');
    assert.strictEqual(env.engine.getStars(), 10, 'earnStars(10.75) must floor to 10');

    env.engine.spendStars(4.99, 'float_spend');
    assert.strictEqual(env.engine.getStars(), 6, 'spendStars(4.99) must floor to 4, leaving 6');
  });
});

describe('Challenger M5-1: Corrupt State Injection & Recovery Vulnerability Analysis', () => {
  it('CORRUPT-5.1: Malformed and truncated JSON in localStorage recovers cleanly without throwing', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', '{ truncated json string ...');
    assert.doesNotThrow(() => {
      env.engine.init();
    });
    assert.strictEqual(env.engine.getStars(), 0);
    assert.ok(env.engine.getPet());
  });

  it('CORRUPT-5.2: Injected negative stars in localStorage are normalized to non-negative values', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      player: { currentStars: -500, totalStarsEarned: -1000 }
    }));
    env.engine.init();
    assert.isAtLeast(env.engine.getStars(), 0, 'currentStars must be normalized to >= 0');
    assert.isAtLeast(env.engine.getTotalStarsEarned(), 0, 'totalStarsEarned must be normalized to >= 0');
  });

  it('CORRUPT-5.3: Injected non-numeric star values are sanitized to 0', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      player: { currentStars: 'infinite', totalStarsEarned: null }
    }));
    env.engine.init();
    assert.strictEqual(env.engine.getStars(), 0);
  });

  /**
   * ADVERSARIAL VULNERABILITY TESTS (EMPIRICAL FINDINGS)
   * The following tests challenge whether deepMerge allows null or malformed
   * core objects to bypass validation, causing downstream runtime crashes.
   */
  it('CORRUPT-5.4 [CHALLENGE]: Injection of null streak in localStorage must not crash checkIn or getStreak', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      streak: null
    }));
    env.engine.init();

    // Check whether engine recovers or crashes on streak operations
    let crashed = false;
    let errorMsg = '';
    try {
      env.engine.getStreak();
      env.engine.checkIn();
    } catch (err) {
      crashed = true;
      errorMsg = err.message;
    }

    assert.strictEqual(crashed, false, `Engine crashed on streak: null -> ${errorMsg}`);
  });

  it('CORRUPT-5.5 [CHALLENGE]: Injection of null room in localStorage must not crash getRoom or placeItem', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      room: null
    }));
    env.engine.init();

    let crashed = false;
    let errorMsg = '';
    try {
      env.engine.getRoom();
      env.engine.placeItem('desk_pink', 50, 50);
    } catch (err) {
      crashed = true;
      errorMsg = err.message;
    }

    assert.strictEqual(crashed, false, `Engine crashed on room: null -> ${errorMsg}`);
  });

  it('CORRUPT-5.6 [CHALLENGE]: Injection of null progress in localStorage must not crash getProgress or markAnswered', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      progress: null
    }));
    env.engine.init();

    let crashed = false;
    let errorMsg = '';
    try {
      env.engine.getProgress('q_luatvc_001');
      env.engine.markAnswered('q_luatvc_001', true);
    } catch (err) {
      crashed = true;
      errorMsg = err.message;
    }

    assert.strictEqual(crashed, false, `Engine crashed on progress: null -> ${errorMsg}`);
  });

  it('CORRUPT-5.7 [CHALLENGE]: Injection of non-array room.placedItems must not crash getRoom', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      room: { placedItems: 'not-an-array' }
    }));
    env.engine.init();

    let crashed = false;
    let errorMsg = '';
    try {
      env.engine.getRoom();
    } catch (err) {
      crashed = true;
      errorMsg = err.message;
    }

    assert.strictEqual(crashed, false, `Engine crashed on room.placedItems: 'not-an-array' -> ${errorMsg}`);
  });

  it('CORRUPT-5.8 [CHALLENGE]: Injection of null ownedPets must not crash getOwnedPets or switchPet', () => {
    const env = loadTestEngine();
    env.sandbox.localStorage.setItem('meowmeow_state', JSON.stringify({
      version: 1,
      ownedPets: null
    }));
    env.engine.init();

    let crashed = false;
    let errorMsg = '';
    try {
      env.engine.getOwnedPets();
      env.engine.switchPet('cat');
    } catch (err) {
      crashed = true;
      errorMsg = err.message;
    }

    assert.strictEqual(crashed, false, `Engine crashed on ownedPets: null -> ${errorMsg}`);
  });
});
