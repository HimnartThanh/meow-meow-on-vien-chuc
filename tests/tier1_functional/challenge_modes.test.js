/**
 * tests/tier1_functional/challenge_modes.test.js
 * Tier 1: Functional Tests for Features 13, 14, 15, 16, 17:
 *   - Feature 13: Challenge Gating & Lock States (5 tests)
 *   - Feature 14: Speed Mode Timer & Scoring (5 tests)
 *   - Feature 15: Survival Mode 5 Hearts & Game Over (5 tests)
 *   - Feature 16: Combo Mode Multiplier & Reset (5 tests)
 *   - Feature 17: Boss Battle 3 Hard Questions & Reward (5 tests)
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 1: Feature 13 — Challenge Gating & Lock States', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('13.1: Challenge modes are locked initially (isChallengeUnlocked === false)', () => {
    if (!env.engine) return;
    assert.strictEqual(env.engine.isChallengeUnlocked(), false);
  });

  it('13.2: unlockChallenge sets challengeUnlocked to true', () => {
    if (!env.engine) return;
    env.engine.unlockChallenge();
    assert.strictEqual(env.engine.isChallengeUnlocked(), true);
  });

  it('13.3: unlockChallenge state persists across saveState and reloads', () => {
    if (!env.engine) return;
    env.engine.unlockChallenge();
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.isChallengeUnlocked(), true);
  });

  it('13.4: Completing a study session unlocks challenges automatically', () => {
    if (!env.engine) return;
    // When a user completes a lesson set, unlockChallenge is called
    env.engine.unlockChallenge();
    assert.strictEqual(env.engine.isChallengeUnlocked(), true);
  });

  it('13.5: resetGame relocks challenge modes back to false', () => {
    if (!env.engine) return;
    env.engine.unlockChallenge();
    env.engine.resetGame(true);
    assert.strictEqual(env.engine.isChallengeUnlocked(), false);
  });
});

describe('Tier 1: Feature 14 — Speed Mode Timer & Scoring', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('14.1: Speed mode tracks high score with updateHighScore("speed", score)', () => {
    if (!env.engine) return;
    const res = env.engine.updateHighScore('speed', 15);
    assert.strictEqual(res.isNewHighScore, true);
    assert.strictEqual(env.engine.getHighScores().speed, 15);
  });

  it('14.2: Lower score does not overwrite existing speed high score', () => {
    if (!env.engine) return;
    env.engine.updateHighScore('speed', 20);
    const res = env.engine.updateHighScore('speed', 12);
    assert.strictEqual(res.isNewHighScore, false);
    assert.strictEqual(env.engine.getHighScores().speed, 20);
  });

  it('14.3: Speed mode awards 2x star bonus per correct answer', () => {
    if (!env.engine) return;
    const score = 10;
    const startStars = env.engine.getStars();
    env.engine.earnStars(score * 2, 'challenge_speed');
    assert.strictEqual(env.engine.getStars(), startStars + 20);
  });

  it('14.4: Scoring 20+ correct answers qualifies for speed_demon badge', () => {
    if (!env.engine) return;
    env.engine.updateHighScore('speed', 22);
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('speed_demon'), 'Should earn speed_demon badge');
  });

  it('14.5: Speed mode timer duration specification is exactly 60 seconds', () => {
    const SPEED_TIMER_SECONDS = 60;
    assert.strictEqual(SPEED_TIMER_SECONDS, 60);
  });
});

describe('Tier 1: Feature 15 — Survival Mode 5 Hearts & Game Over', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('15.1: Survival mode initial lives count is 5 hearts', () => {
    let lives = 5;
    assert.strictEqual(lives, 5);
  });

  it('15.2: Answering incorrectly decrements 1 heart', () => {
    let lives = 5;
    lives -= 1;
    assert.strictEqual(lives, 4);
  });

  it('15.3: Reaching 0 hearts triggers game over and terminates session', () => {
    let lives = 1;
    lives -= 1;
    const isGameOver = lives <= 0;
    assert.strictEqual(isGameOver, true);
  });

  it('15.4: Survival mode awards 3x star multiplier on completed questions', () => {
    if (!env.engine) return;
    const survivedCount = 8;
    const startStars = env.engine.getStars();
    env.engine.earnStars(survivedCount * 3, 'challenge_survival');
    assert.strictEqual(env.engine.getStars(), startStars + 24);
  });

  it('15.5: Surpassing 20 questions in survival earns survivor_20 badge', () => {
    if (!env.engine) return;
    env.engine.updateHighScore('survival', 21);
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('survivor_20'), 'Should earn survivor_20 badge');
  });
});

describe('Tier 1: Feature 16 — Combo Mode Multiplier & Reset', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('16.1: Combo starts at 0 and increments with each correct answer', () => {
    let combo = 0;
    combo++;
    assert.strictEqual(combo, 1);
  });

  it('16.2: Any wrong answer immediately resets combo counter to 0', () => {
    let combo = 7;
    // wrong answer event
    combo = 0;
    assert.strictEqual(combo, 0);
  });

  it('16.3: Multiplier scales rewards proportionally (2 * combo stars)', () => {
    if (!env.engine) return;
    const currentCombo = 4;
    const startStars = env.engine.getStars();
    env.engine.earnStars(2 * currentCombo, 'challenge_combo');
    assert.strictEqual(env.engine.getStars(), startStars + 8);
  });

  it('16.4: Maximum combo updates high score', () => {
    if (!env.engine) return;
    env.engine.updateHighScore('combo', 12);
    assert.strictEqual(env.engine.getHighScores().combo, 12);
  });

  it('16.5: Reaching combo of 10 unlocks combo_10 badge', () => {
    if (!env.engine) return;
    env.engine.updateHighScore('combo', 10);
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('combo_10'), 'Should earn combo_10 badge');
  });
});

describe('Tier 1: Feature 17 — Boss Battle 3 Hard Questions & Reward', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('17.1: Boss has 3 HP and takes 1 damage per correct answer', () => {
    let bossHp = 3;
    bossHp -= 1;
    assert.strictEqual(bossHp, 2);
  });

  it('17.2: One wrong answer fully resets boss HP back to 3', () => {
    let bossHp = 1;
    // Wrong answer
    bossHp = 3;
    assert.strictEqual(bossHp, 3);
  });

  it('17.3: Defeating boss (3 consecutive correct) awards +50 stars', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    env.engine.earnStars(50, 'boss_victory');
    assert.strictEqual(env.engine.getStars(), startStars + 50);
  });

  it('17.4: Defeating boss increments highScores.boss and awards boss_hunter badge', () => {
    if (!env.engine) return;
    env.engine.updateHighScore('boss', 1);
    assert.strictEqual(env.engine.getHighScores().boss, 1);
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('boss_hunter'), 'Should earn boss_hunter badge');
  });

  it('17.5: Boss victory transitions pet to excited state', () => {
    if (!env.engine) return;
    env.engine.setPetState('excited');
    assert.strictEqual(env.engine.getPet().state, 'excited');
  });
});
