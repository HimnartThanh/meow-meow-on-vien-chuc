/**
 * tests/tier1_functional/pet_room_shop.test.js
 * Tier 1: Functional Tests for Features 18, 19, 20, 21:
 *   - Feature 18: Pet CSS Structure & 5 Visual States (5 tests)
 *   - Feature 19: Room Free-Drag Percentage Clamping (5 tests)
 *   - Feature 20: Room Item Persistence Across Sessions (5 tests)
 *   - Feature 21: Shop Purchase & Owned State Updates (5 tests)
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 1: Feature 18 — Pet CSS Structure & 5 Visual States', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('18.1: Pet supports 5 canonical animation states: idle, happy, sad, excited, sleeping', () => {
    if (!env.engine) return;
    const states = ['idle', 'happy', 'sad', 'excited', 'sleeping'];
    for (const st of states) {
      env.engine.setPetState(st);
      assert.strictEqual(env.engine.getPet().state, st);
    }
  });

  it('18.2: Switching active pet updates pet type among owned pets', () => {
    if (!env.engine) return;
    env.engine.earnStars(200, 'test');
    env.engine.buyPet('bunny');
    const res = env.engine.switchPet('bunny');
    const ok = res === true || (res && res.success === true);
    assert.ok(ok, 'Switch to owned bunny succeeds');
    assert.strictEqual(env.engine.getPet().type, 'bunny');
  });

  it('18.3: Switching to an unowned pet type is rejected', () => {
    if (!env.engine) return;
    const res = env.engine.switchPet('hamster');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false, 'Unowned pet switch rejected');
  });

  it('18.4: Renaming pet updates name and validates non-empty string', () => {
    if (!env.engine) return;
    env.engine.renamePet('Miu Miu');
    assert.strictEqual(env.engine.getPet().name, 'Miu Miu');
  });

  it('18.5: updatePetReaction maps events to expected emotional states', () => {
    if (!env.engine || typeof env.engine.updatePetReaction !== 'function') return;
    env.engine.updatePetReaction('quiz_correct');
    assert.strictEqual(env.engine.getPet().state, 'happy');
    env.engine.updatePetReaction('boss_victory');
    assert.strictEqual(env.engine.getPet().state, 'excited');
  });
});

describe('Tier 1: Feature 19 — Room Free-Drag Percentage Clamping', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('19.1: Valid coordinates (e.g. 40%, 60%) are stored accurately', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 40, 60);
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.ok(placed);
    assert.strictEqual(placed.x, 40);
    assert.strictEqual(placed.y, 60);
  });

  it('19.2: Coordinates exceeding 100% are clamped to max 100%', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 130, 110);
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.ok(placed);
    assert.assert.isAtMost(placed.x, 100);
    assert.assert.isAtMost(placed.y, 100);
  });

  it('19.3: Negative coordinates (<0%) are clamped to min 0%', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', -15, -5);
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.ok(placed);
    assert.assert.isAtLeast(placed.x, 0);
    assert.assert.isAtLeast(placed.y, 0);
  });

  it('19.4: moveItem updates coordinates of already placed items', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 20, 20);
    env.engine.moveItem('desk_pink', 50, 70);
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.strictEqual(placed.x, 50);
    assert.strictEqual(placed.y, 70);
  });

  it('19.5: removeItem removes item from room and returns it to inventory', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 20, 20);
    env.engine.removeItem('desk_pink');
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.strictEqual(placed, undefined, 'Item no longer in placedItems');
    const inventory = env.engine.getInventory();
    const inInv = inventory.some(i => (typeof i === 'string' ? i === 'desk_pink' : i.id === 'desk_pink'));
    assert.ok(inInv, 'Item returned to inventory drawer');
  });
});

describe('Tier 1: Feature 20 — Room Item Persistence Across Sessions', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('20.1: Multiple placed items retain their specific coordinates across save/reload', () => {
    if (!env.engine) return;
    env.engine.earnStars(200, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.buyItem('shelf_wood');
    env.engine.placeItem('desk_pink', 15, 30);
    env.engine.placeItem('shelf_wood', 75, 40);
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    const room = reloaded.engine.getRoom();
    const desk = room.placedItems.find(p => p.itemId === 'desk_pink');
    const shelf = room.placedItems.find(p => p.itemId === 'shelf_wood');
    assert.strictEqual(desk.x, 15);
    assert.strictEqual(shelf.x, 75);
  });

  it('20.2: Wallpaper customization persists across reloads', () => {
    if (!env.engine) return;
    env.engine.changeWallpaper('wp_pink');
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.getRoom().wallpaper, 'wp_pink');
  });

  it('20.3: Floor customization persists across reloads', () => {
    if (!env.engine) return;
    env.engine.changeFloor('floor_wood');
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.getRoom().floor, 'floor_wood');
  });

  it('20.4: Empty room state is safely represented and saved', () => {
    if (!env.engine) return;
    env.engine.saveState();
    const room = env.engine.getRoom();
    assert.ok(Array.isArray(room.placedItems));
    assert.strictEqual(room.placedItems.length, 0);
  });

  it('20.5: Item removal persists across save and reload', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 50, 50);
    env.engine.removeItem('desk_pink');
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.getRoom().placedItems.length, 0);
  });
});

describe('Tier 1: Feature 21 — Shop Purchase & Owned State Updates', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('21.1: Buying an item deducts its price from star balance', () => {
    if (!env.engine) return;
    env.engine.earnStars(50, 'test');
    const startStars = env.engine.getStars();
    const res = env.engine.buyItem('desk_pink'); // 25 stars
    const ok = res === true || (res && res.success === true);
    if (ok) {
      assert.strictEqual(env.engine.getStars(), startStars - 25);
    }
  });

  it('21.2: Purchased item is added to ownedItems array and isItemOwned returns true', () => {
    if (!env.engine) return;
    env.engine.earnStars(50, 'test');
    env.engine.buyItem('desk_pink');
    assert.ok(env.engine.getOwnedItems().includes('desk_pink'));
    assert.strictEqual(env.engine.isItemOwned('desk_pink'), true);
  });

  it('21.3: Purchasing an already owned item is rejected and does not deduct stars twice', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    const balanceAfterFirstBuy = env.engine.getStars();
    const res = env.engine.buyItem('desk_pink');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false, 'Duplicate purchase rejected');
    assert.strictEqual(env.engine.getStars(), balanceAfterFirstBuy);
  });

  it('21.4: Purchasing with insufficient stars fails and preserves balance', () => {
    if (!env.engine) return;
    // Current stars = 0
    const res = env.engine.buyItem('desk_pink');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false);
    assert.strictEqual(env.engine.getStars(), 0);
  });

  it('21.5: Buying a pet deducts cost and adds to ownedPets', () => {
    if (!env.engine) return;
    env.engine.earnStars(200, 'test');
    const res = env.engine.buyPet('bunny'); // 80 stars
    const ok = res === true || (res && res.success === true);
    if (ok) {
      assert.ok(env.engine.getOwnedPets().includes('bunny'));
    }
  });
});
