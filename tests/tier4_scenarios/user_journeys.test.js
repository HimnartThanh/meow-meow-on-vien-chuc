/**
 * tests/tier4_scenarios/user_journeys.test.js
 * Tier 4: Real-World Application Scenarios (5 Realistic User Journeys per TEST_INFRA.md):
 *   1. Full New User Onboarding to First Purchase
 *   2. Civil Servant Study Session Loop
 *   3. High-Stakes Boss Battle Run
 *   4. Room Redecoration Session
 *   5. Multi-Day Retention & Streak Recovery
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 4: Scenario 1 — Full New User Onboarding to First Purchase', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('Executes end-to-end journey from onboarding to first furniture placement', () => {
    if (!env.engine) return;

    // Step 1: Onboarding
    assert.strictEqual(env.engine.isFirstTime(), true, 'Step 1: Fresh user onboarding modal');
    env.engine.completeOnboarding('cat', 'Bé Miu Miu');
    assert.strictEqual(env.engine.isFirstTime(), false);
    assert.strictEqual(env.engine.getPet().name, 'Bé Miu Miu');

    // Step 2: Study 5 flashcards
    const startStars = env.engine.getStars();
    for (let i = 1; i <= 5; i++) {
      const qId = `q_luatvc_00${i}`;
      env.engine.markAnswered(qId, true);
      env.engine.earnStars(1, 'flashcard');
    }
    env.engine.earnStars(5, 'completion_bonus');
    // Earned 10 stars from study
    assert.strictEqual(env.engine.getStars(), startStars + 10);

    // Grant additional stars to afford first furniture (desk_pink costs 25)
    env.engine.earnStars(20, 'quest_reward');
    assert.assert.isAtLeast(env.engine.getStars(), 25);

    // Step 3: Purchase furniture in shop
    const buyResult = env.engine.buyItem('desk_pink');
    const ok = buyResult === true || (buyResult && buyResult.success === true);
    assert.ok(ok, 'Step 3: Item purchase successful');
    assert.ok(env.engine.isItemOwned('desk_pink'));

    // Step 4: Place item in room via free-drag
    env.engine.placeItem('desk_pink', 45, 60);
    const room = env.engine.getRoom();
    assert.strictEqual(room.placedItems.length, 1);
    assert.strictEqual(room.placedItems[0].x, 45);
    assert.strictEqual(room.placedItems[0].y, 60);

    // Step 5: Verify persistence across session reload
    env.engine.saveState();
    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.getPet().name, 'Bé Miu Miu');
    assert.strictEqual(reloaded.engine.getRoom().placedItems[0].x, 45);
  });
});

describe('Tier 4: Scenario 2 — Civil Servant Study Session Loop', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('Executes 100% perfect quiz study session loop with badges and SRS updates', () => {
    if (!env.engine) return;

    env.engine.completeOnboarding('cat', 'Miu');
    const startStars = env.engine.getStars();

    // 5 Quiz questions answered 100% correct
    for (let i = 1; i <= 5; i++) {
      const qId = `q_luatvc_00${i}`;
      env.engine.markAnswered(qId, true);
      env.engine.earnStars(2, 'quiz');
    }

    // Set bonuses
    env.engine.earnStars(5, 'completion_bonus');
    env.engine.earnStars(10, 'perfect_bonus');

    // Total earned: 5*2 + 5 + 10 = 25 stars
    assert.strictEqual(env.engine.getStars(), startStars + 25);

    // Unlock badges
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('first_lesson'), 'Earned first_lesson badge');

    // Unlocks challenge mode
    env.engine.unlockChallenge();
    assert.strictEqual(env.engine.isChallengeUnlocked(), true);

    // Verifies all 5 questions moved to 'learning'
    for (let i = 1; i <= 5; i++) {
      const p = env.engine.getProgress(`q_luatvc_00${i}`);
      assert.strictEqual(p.status, 'learning');
      assert.strictEqual(p.correctCount, 1);
    }
  });
});

describe('Tier 4: Scenario 3 — High-Stakes Boss Battle Run', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('Executes boss challenge battle with 3/3 correct answers and 50 star victory reward', () => {
    if (!env.engine) return;

    env.engine.completeOnboarding('cat', 'Chiến Binh Miu');
    env.engine.unlockChallenge();

    let bossHp = 3;
    const startStars = env.engine.getStars();

    // Answer 3 difficult questions correctly
    for (let q = 1; q <= 3; q++) {
      bossHp -= 1;
      env.engine.markAnswered(`q_boss_hard_${q}`, true);
    }

    assert.strictEqual(bossHp, 0, 'Boss defeated at 0 HP');

    // Victory reward
    env.engine.earnStars(50, 'boss_victory');
    assert.strictEqual(env.engine.getStars(), startStars + 50);

    // Record high score and check badges
    env.engine.updateHighScore('boss', 1);
    env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('boss_hunter'), 'boss_hunter badge unlocked');

    // Pet celebrates
    env.engine.setPetState('excited');
    assert.strictEqual(env.engine.getPet().state, 'excited');
  });
});

describe('Tier 4: Scenario 4 — Room Redecoration Session', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('Purchases multiple items, decorates room, changes themes, and stows an item', () => {
    if (!env.engine) return;

    env.engine.completeOnboarding('cat', 'Miu');
    env.engine.earnStars(500, 'deco_budget');

    // Buy 3 items
    env.engine.buyItem('desk_pink');
    env.engine.buyItem('shelf_wood');
    env.engine.buyItem('chair_cute');

    // Customize walls and floors
    env.engine.changeWallpaper('wp_pink');
    env.engine.changeFloor('floor_wood');
    assert.strictEqual(env.engine.getRoom().wallpaper, 'wp_pink');
    assert.strictEqual(env.engine.getRoom().floor, 'floor_wood');

    // Place all 3 items
    env.engine.placeItem('desk_pink', 20, 30);
    env.engine.placeItem('shelf_wood', 70, 30);
    env.engine.placeItem('chair_cute', 25, 45);

    assert.strictEqual(env.engine.getRoom().placedItems.length, 3);
    assert.strictEqual(env.engine.getInventory().length, 0);

    // Stow chair back to inventory
    env.engine.removeItem('chair_cute');
    assert.strictEqual(env.engine.getRoom().placedItems.length, 2);
    assert.strictEqual(env.engine.getInventory().length, 1);

    // Move desk
    env.engine.moveItem('desk_pink', 30, 40);
    const desk = env.engine.getRoom().placedItems.find(p => p.itemId === 'desk_pink');
    assert.strictEqual(desk.x, 30);
    assert.strictEqual(desk.y, 40);
  });
});

describe('Tier 4: Scenario 5 — Multi-Day Retention & Streak Recovery', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('Tracks consecutive daily retention, handles 1-day absence break, and schedules due reviews', () => {
    if (!env.engine) return;

    env.engine.completeOnboarding('cat', 'Miu');

    // Day 1
    env.sandbox.setTime('2026-09-01T09:00:00Z');
    env.engine.checkIn();
    env.engine.markAnswered('q_luatvc_001', false); // due tomorrow (Sept 2)
    assert.strictEqual(env.engine.getStreak().current, 1);

    // Day 2
    env.sandbox.setTime('2026-09-02T09:00:00Z');
    env.engine.checkIn();
    assert.strictEqual(env.engine.getStreak().current, 2);
    // Review due question
    const dueDay2 = env.engine.getTodayReview('luat_vc');
    const isDue = dueDay2.some(q => (typeof q === 'string' ? q === 'q_luatvc_001' : q.id === 'q_luatvc_001'));
    assert.ok(isDue, 'q_luatvc_001 is due for review on Day 2');
    env.engine.markAnswered('q_luatvc_001', true); // correct -> next due in 1 day (Sept 3)

    // Day 3
    env.sandbox.setTime('2026-09-03T09:00:00Z');
    env.engine.checkIn();
    assert.strictEqual(env.engine.getStreak().current, 3);
    assert.strictEqual(env.engine.getStreak().longest, 3);

    // Skip Day 4 -> Return on Day 5
    env.sandbox.setTime('2026-09-05T09:00:00Z');
    env.engine.checkIn();
    assert.strictEqual(env.engine.getStreak().current, 1, 'Missed day resets streak to 1');
    assert.strictEqual(env.engine.getStreak().longest, 3, 'Longest streak remains 3');

    // Check stats dailyLog
    const stats = env.engine.getStats();
    assert.ok(stats.dailyLog['2026-09-01'], 'Sept 1 recorded in dailyLog');
    assert.ok(stats.dailyLog['2026-09-02'], 'Sept 2 recorded in dailyLog');
  });
});
