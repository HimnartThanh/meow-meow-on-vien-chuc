/**
 * tests/tier2_boundary/boundary_room_pet.test.js
 * Tier 2: Boundary Tests for Room Decoration & Pet Customization:
 *   - Extreme drag coordinates clamping
 *   - Precision floating point coordinates
 *   - Removing non-existent item
 *   - Invalid shop item IDs
 *   - Non-existent pet types
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 2: Boundary Room & Pet Customization', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('B4.1: Coordinates far beyond bounds (x: 999%, y: -999%) are clamped to [0, 100]', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 999, -999);
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.ok(placed);
    assert.assert.isAtMost(placed.x, 100);
    assert.assert.isAtLeast(placed.x, 0);
    assert.assert.isAtMost(placed.y, 100);
    assert.assert.isAtLeast(placed.y, 0);
  });

  it('B4.2: Floating-point percentage coordinates are rounded or stored safely without NaN', () => {
    if (!env.engine) return;
    env.engine.earnStars(100, 'test');
    env.engine.buyItem('desk_pink');
    env.engine.placeItem('desk_pink', 33.333333, 66.666666);
    const room = env.engine.getRoom();
    const placed = room.placedItems.find(p => p.itemId === 'desk_pink');
    assert.ok(placed);
    assert.ok(!isNaN(placed.x));
    assert.ok(!isNaN(placed.y));
  });

  it('B4.3: Calling removeItem for an item not placed in room is a safe no-op', () => {
    if (!env.engine) return;
    assert.doesNotThrow(() => {
      env.engine.removeItem('non_existent_item_id');
    });
  });

  it('B4.4: Attempting to buy a non-existent item ID returns failure gracefully', () => {
    if (!env.engine) return;
    env.engine.earnStars(1000, 'test');
    const res = env.engine.buyItem('completely_fake_item_9999');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false, 'Fake item purchase must fail');
  });

  it('B4.5: Attempting to switch to an unowned pet type fails without crashing', () => {
    if (!env.engine) return;
    const res = env.engine.switchPet('dragon');
    const ok = res === true || (res && res.success === true);
    assert.strictEqual(ok, false);
    assert.strictEqual(env.engine.getPet().type, 'cat', 'Active pet remains default cat');
  });
});
