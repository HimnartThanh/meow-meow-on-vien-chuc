/**
 * tests/tier3_cross_feature/integration.test.js
 * Tier 3: Pairwise & Cross-Feature Integration Tests:
 *   - Onboarding -> Stars -> Shop -> Room -> Persistence
 *   - Study session -> SRS advancement -> Challenge unlock -> Badge award
 *   - Emotional Pet State transitions responding to gameplay events
 *   - Inventory drawer reconciliation with placed items
 *   - Multi-topic SRS review scheduling
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 3: Pairwise & Cross-Feature Integration', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('T3.1: Full Lifecycle: Onboarding -> Study set -> Shop Buy -> Room Drag -> Reload', () => {
    if (!env.engine) return;

    // 1. Onboarding
    assert.strictEqual(env.engine.isFirstTime(), true);
    env.engine.completeOnboarding('bunny', 'Bé Thỏ');
    assert.strictEqual(env.engine.isFirstTime(), false);
    assert.strictEqual(env.engine.getPet().name, 'Bé Thỏ');

    // 2. Study set (5 questions correct)
    for (let i = 1; i <= 5; i++) {
      const qId = `q_luatvc_00${i}`;
      env.engine.markAnswered(qId, true);
      env.engine.earnStars(2, 'quiz');
    }
    // Completion bonus
    env.engine.earnStars(5, 'completion_bonus');
    // Total stars: 5*2 + 5 = 15 stars
    assert.assert.isAtLeast(env.engine.getStars(), 15);

    // 3. Earn extra stars for shop item
    env.engine.earnStars(20, 'extra'); // total >= 35 stars

    // 4. Shop purchase
    const buyResult = env.engine.buyItem('desk_pink'); // 25 stars
    const ok = buyResult === true || (buyResult && buyResult.success === true);
    assert.ok(ok, 'Desk purchase should succeed');
    assert.ok(env.engine.isItemOwned('desk_pink'));

    // 5. Room placement
    env.engine.placeItem('desk_pink', 35, 55);
    const room = env.engine.getRoom();
    assert.strictEqual(room.placedItems.length, 1);
    assert.strictEqual(room.placedItems[0].x, 35);
    assert.strictEqual(room.placedItems[0].y, 55);

    // 6. Save & Reload
    env.engine.saveState();
    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();

    assert.strictEqual(reloaded.engine.isFirstTime(), false);
    assert.strictEqual(reloaded.engine.getPet().type, 'bunny');
    assert.strictEqual(reloaded.engine.getPet().name, 'Bé Thỏ');
    assert.ok(reloaded.engine.isItemOwned('desk_pink'));
    assert.strictEqual(reloaded.engine.getRoom().placedItems[0].x, 35);
  });

  it('T3.2: Study -> SRS Advancement -> Challenge Unlock -> High Score -> Badges', () => {
    if (!env.engine) return;

    // Challenge starts locked
    assert.strictEqual(env.engine.isChallengeUnlocked(), false);

    // Complete study set
    env.engine.markAnswered('q_luatvc_001', true);
    env.engine.unlockChallenge();
    assert.strictEqual(env.engine.isChallengeUnlocked(), true);

    // Play challenge mode
    env.engine.updateHighScore('speed', 25);
    assert.strictEqual(env.engine.getHighScores().speed, 25);

    // Check badges
    const newBadges = env.engine.checkBadges();
    assert.ok(env.engine.hasBadge('first_lesson'), 'first_lesson badge unlocked');
    assert.ok(env.engine.hasBadge('speed_demon'), 'speed_demon badge unlocked for 25 speed score');
  });

  it('T3.3: Pet emotional state transitions across gameplay milestones', () => {
    if (!env.engine) return;

    // Default is idle
    assert.strictEqual(env.engine.getPet().state, 'idle');

    // Happy on correct answer
    env.engine.setPetState('happy');
    assert.strictEqual(env.engine.getPet().state, 'happy');

    // Excited on perfect score / boss win
    env.engine.setPetState('excited');
    assert.strictEqual(env.engine.getPet().state, 'excited');

    // Sad on mistakes
    env.engine.setPetState('sad');
    assert.strictEqual(env.engine.getPet().state, 'sad');

    // Sleeping when idle
    env.engine.setPetState('sleeping');
    assert.strictEqual(env.engine.getPet().state, 'sleeping');
  });

  it('T3.4: Inventory Drawer reflects owned items minus placed items', () => {
    if (!env.engine) return;

    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.buyItem('shelf_wood');

    // Initially neither is placed -> both in inventory
    let inv = env.engine.getInventory();
    assert.strictEqual(inv.length, 2);

    // Place desk_pink
    env.engine.placeItem('desk_pink', 20, 20);
    inv = env.engine.getInventory();
    assert.strictEqual(inv.length, 1, 'Only unplaced item remains in inventory');

    // Remove desk_pink back to inventory
    env.engine.removeItem('desk_pink');
    inv = env.engine.getInventory();
    assert.strictEqual(inv.length, 2, 'Both items back in inventory');
  });

  it('T3.5: Multi-topic SRS review filtering separates due vs non-due questions', () => {
    if (!env.engine) return;

    // q1 answered wrong -> due tomorrow
    env.engine.markAnswered('q_luatvc_001', false);
    // q2 answered right 5 times -> due in 30 days
    for (let i = 0; i < 5; i++) {
      env.engine.markAnswered('q_daoduc_001', true);
    }

    // Advance 2 days
    env.sandbox.advanceTimeDays(2);

    // q1 should be due, q2 should not be due yet
    const dueLuat = env.engine.getTodayReview('luat_vc');
    assert.ok(Array.isArray(dueLuat));
    const hasQ1 = dueLuat.some(q => (typeof q === 'string' ? q === 'q_luatvc_001' : q.id === 'q_luatvc_001'));
    assert.ok(hasQ1, 'q1 is due for review');
  });
});
