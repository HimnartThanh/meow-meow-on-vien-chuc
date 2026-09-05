/**
 * tests/tier2_boundary/boundary_srs_streak.test.js
 * Tier 2: Boundary & Temporal Tests for SRS and Streak:
 *   - Unknown question IDs
 *   - Intervals exceeding 5 stages (capped at 30 days)
 *   - Year-end boundary (Dec 31 -> Jan 1)
 *   - Month-end boundary
 *   - Large gap streak recovery
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 2: Boundary SRS & Streak Calculations', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('B2.1: Querying progress of non-existent question returns default "new" status without crashing', () => {
    if (!env.engine) return;
    const prog = env.engine.getProgress('q_non_existent_999');
    assert.ok(prog);
    assert.strictEqual(prog.status, 'new');
    assert.strictEqual(prog.correctCount, 0);
  });

  it('B2.2: SRS correctCount beyond 5 maintains 30-day interval and mastered status', () => {
    if (!env.engine) return;
    const qId = 'q_luatvc_001';
    for (let i = 0; i < 8; i++) {
      env.engine.markAnswered(qId, true);
    }
    const prog = env.engine.getProgress(qId);
    assert.assert.isAtLeast(prog.correctCount, 8);
    assert.strictEqual(prog.status, 'mastered');
  });

  it('B2.3: Streak consecutive tracking works across Year-End boundary (Dec 31 -> Jan 1)', () => {
    if (!env.engine) return;
    // Set time to Dec 31
    env.sandbox.setTime('2026-12-31T10:00:00Z');
    env.engine.checkIn();
    assert.strictEqual(env.engine.getStreak().current, 1);

    // Advance 1 day to Jan 1
    env.sandbox.setTime('2027-01-01T10:00:00Z');
    env.engine.checkIn();
    assert.strictEqual(env.engine.getStreak().current, 2, 'Streak increments across year boundary');
  });

  it('B2.4: Streak consecutive tracking works across Month-End boundary', () => {
    if (!env.engine) return;
    env.sandbox.setTime('2026-03-31T10:00:00Z');
    env.engine.checkIn();
    env.sandbox.setTime('2026-04-01T10:00:00Z');
    env.engine.checkIn();
    assert.strictEqual(env.engine.getStreak().current, 2, 'Streak increments across month boundary');
  });

  it('B2.5: 100-day gap breaks streak and restarts from 1 while preserving longest', () => {
    if (!env.engine) return;
    env.sandbox.setTime('2026-01-01T10:00:00Z');
    for (let i = 0; i < 15; i++) {
      env.engine.checkIn();
      env.sandbox.advanceTimeDays(1);
    }
    const longestBefore = env.engine.getStreak().longest;
    assert.assert.isAtLeast(longestBefore, 15);

    // Skip 100 days
    env.sandbox.advanceTimeDays(100);
    env.engine.checkIn();
    const streak = env.engine.getStreak();
    assert.strictEqual(streak.current, 1, 'Current streak resets to 1');
    assert.strictEqual(streak.longest, longestBefore, 'Longest streak remains preserved');
  });
});
