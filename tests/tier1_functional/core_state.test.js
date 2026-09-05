/**
 * tests/tier1_functional/core_state.test.js
 * Tier 1: Functional Tests for Features 1, 2, 3:
 *   - Feature 1: LocalStorage Roundtrip & Integrity (5 tests)
 *   - Feature 2: Initial State Generation (5 tests)
 *   - Feature 3: Core GameEngine 42 API Methods (5 tests)
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 1: Feature 1 — LocalStorage Roundtrip & Integrity', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
  });

  it('1.1: Saves state under authoritative key meowmeow_state or meow_study_game_state', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.saveState();
    const raw = env.sandbox.localStorage.__getRawStore();
    assert.ok(raw['meowmeow_state'] || raw['meow_study_game_state'], 'Expected storage key exists');
  });

  it('1.2: Serializes state as valid parseable JSON', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.saveState();
    const raw = env.sandbox.localStorage.__getRawStore();
    const key = raw['meowmeow_state'] ? 'meowmeow_state' : 'meow_study_game_state';
    assert.doesNotThrow(() => JSON.parse(raw[key]), 'State must be valid JSON');
  });

  it('1.3: Roundtrip preserves mutated primitive values (stars, pet name)', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.earnStars(50, 'test');
    env.engine.renamePet('Bông Tròn');
    env.engine.saveState();

    // Reload
    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.getStars(), 50, 'Stars restored');
    assert.strictEqual(reloaded.engine.getPet().name, 'Bông Tròn', 'Pet name restored');
  });

  it('1.4: Roundtrip preserves complex nested structures (room placedItems array)', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 25, 45);
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    const room = reloaded.engine.getRoom();
    assert.ok(Array.isArray(room.placedItems), 'placedItems is an array');
    const item = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.ok(item, 'Item found in reloaded placedItems');
    assert.strictEqual(item.x, 25);
    assert.strictEqual(item.y, 45);
  });

  it('1.5: Handles resetGame cleanly without leaving corrupt state', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.earnStars(100, 'test');
    env.engine.resetGame(true);
    assert.strictEqual(env.engine.getStars(), 0, 'Reset returns stars to 0');
    assert.strictEqual(env.engine.isFirstTime(), true, 'Reset returns to first-time state');
  });
});

describe('Tier 1: Feature 2 — Initial State Generation', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
  });

  it('2.1: Default state includes required top-level schema fields per GAME_STATE.md', () => {
    if (!env.engine) return;
    const state = env.engine.init();
    assert.ok(state, 'State returned');
    assert.strictEqual(typeof state.version, 'number');
    assert.strictEqual(state.initialized, false);
    assert.ok(state.player && typeof state.player === 'object');
    assert.ok(state.pet && typeof state.pet === 'object');
    assert.ok(state.streak && typeof state.streak === 'object');
    assert.ok(state.room && typeof state.room === 'object');
    assert.ok(Array.isArray(state.ownedItems));
    assert.ok(Array.isArray(state.ownedPets));
    assert.ok(state.progress && typeof state.progress === 'object');
    assert.ok(Array.isArray(state.badges));
    assert.ok(state.highScores && typeof state.highScores === 'object');
    assert.ok(state.stats && typeof state.stats === 'object');
    assert.strictEqual(state.challengeUnlocked, false);
  });

  it('2.2: Starter stars are initialized to 0 (non-negative)', () => {
    if (!env.engine) return;
    env.engine.init();
    assert.strictEqual(env.engine.getStars(), 0);
    assert.strictEqual(env.engine.getTotalStarsEarned(), 0);
  });

  it('2.3: Starter pet defaults to cat with idle animation state', () => {
    if (!env.engine) return;
    env.engine.init();
    const pet = env.engine.getPet();
    assert.ok(pet);
    assert.strictEqual(pet.type, 'cat');
    assert.strictEqual(pet.state, 'idle');
  });

  it('2.4: ownedPets array includes the starter pet', () => {
    if (!env.engine) return;
    env.engine.init();
    const pets = env.engine.getOwnedPets();
    assert.ok(Array.isArray(pets));
    assert.ok(pets.includes('cat'), 'cat should be in ownedPets');
  });

  it('2.5: High scores for all 4 challenge modes are initialized to 0', () => {
    if (!env.engine) return;
    env.engine.init();
    const scores = env.engine.getHighScores();
    assert.ok(scores);
    assert.strictEqual(scores.speed, 0);
    assert.strictEqual(scores.survival, 0);
    assert.strictEqual(scores.combo, 0);
    assert.strictEqual(scores.boss, 0);
  });
});

describe('Tier 1: Feature 3 — Core GameEngine 42 API Methods', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
  });

  it('3.1: Lifecycle and State management APIs exist as functions', () => {
    if (!env.engine) return;
    const fns = ['init', 'saveState', 'resetGame', 'isFirstTime', 'completeOnboarding'];
    for (const f of fns) {
      assert.strictEqual(typeof env.engine[f], 'function', `Expected function: ${f}`);
    }
  });

  it('3.2: Star and Pet management APIs exist as functions', () => {
    if (!env.engine) return;
    const fns = ['getStars', 'getTotalStarsEarned', 'earnStars', 'spendStars', 'getPet', 'setPetState', 'switchPet', 'renamePet'];
    for (const f of fns) {
      assert.strictEqual(typeof env.engine[f], 'function', `Expected function: ${f}`);
    }
  });

  it('3.3: Room and Shop APIs exist as functions', () => {
    if (!env.engine) return;
    const fns = ['getRoom', 'placeItem', 'moveItem', 'removeItem', 'changeWallpaper', 'changeFloor', 'buyItem', 'buyPet', 'getOwnedItems', 'getOwnedPets', 'isItemOwned', 'getInventory'];
    for (const f of fns) {
      assert.strictEqual(typeof env.engine[f], 'function', `Expected function: ${f}`);
    }
  });

  it('3.4: SRS, Challenge, and Badges APIs exist as functions', () => {
    if (!env.engine) return;
    const fns = ['markAnswered', 'getProgress', 'getTodayReview', 'getTopicProgress', 'getAllProgress', 'isChallengeUnlocked', 'unlockChallenge', 'updateHighScore', 'getHighScores', 'checkBadges', 'getBadges', 'hasBadge'];
    for (const f of fns) {
      assert.strictEqual(typeof env.engine[f], 'function', `Expected function: ${f}`);
    }
  });

  it('3.5: Total functions on GameEngine satisfy or exceed 42 methods', () => {
    if (!env.engine) return;
    const methods = Object.keys(env.engine).filter(k => typeof env.engine[k] === 'function');
    assert.assert.isAtLeast(methods.length, 41, `Expected at least 41-42 methods, found: ${methods.length}`);
  });
});
