/**
 * tests/tier1_functional/isometric_upgrade.test.js
 * Tests for Isometric 2.5D Room, Multi-floor system, Item Rotation, and Pet Poses
 */

const fs = require('fs');
const path = require('path');
const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine, ROOT_DIR } = require('../harness/fixtures');

describe('Tier 1: Feature 25 — Isometric 2.5D & Multi-Floor Upgrades', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('25.1: Required Isometric SVG assets exist on disk and have valid markup', () => {
    const assets = [
      'assets/isometric/rooms/room_floor_1.svg',
      'assets/isometric/rooms/room_floor_2.svg',
      'assets/isometric/furniture/sofa_yellow.svg',
      'assets/isometric/furniture/tea_table.svg',
      'assets/isometric/furniture/bed_single_pink.svg',
      'assets/isometric/furniture/desk_study.svg',
      'assets/isometric/furniture/chair_study.svg',
      'assets/isometric/furniture/garden_slide.svg',
      'assets/isometric/pets/cat_idle.svg',
      'assets/isometric/pets/cat_sit.svg',
      'assets/isometric/pets/cat_sleep.svg',
      'assets/isometric/pets/hamster_idle.svg',
      'assets/isometric/pets/hamster_sit.svg',
      'assets/isometric/pets/hamster_sleep.svg',
      'assets/isometric/pets/bunny_idle.svg'
    ];

    assets.forEach(assetPath => {
      const fullPath = path.resolve(ROOT_DIR, assetPath);
      assert.ok(fs.existsSync(fullPath), `Asset file must exist: ${assetPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(content.includes('<svg'), `Asset file must be valid SVG: ${assetPath}`);
    });
  });

  it('25.2: Item rotation cycles 0 -> 90 -> 180 -> 270 -> 0', () => {
    if (!env.engine) return;
    env.engine.placeItem('desk_pink', 40, 50, 0);
    let room = env.engine.getRoom();
    assert.strictEqual(room.placedItems[0].rotation, 0);

    let nextRot = env.engine.rotateItem('desk_pink');
    assert.strictEqual(nextRot, 90);

    nextRot = env.engine.rotateItem('desk_pink');
    assert.strictEqual(nextRot, 180);

    nextRot = env.engine.rotateItem('desk_pink');
    assert.strictEqual(nextRot, 270);

    nextRot = env.engine.rotateItem('desk_pink');
    assert.strictEqual(nextRot, 0);
  });

  it('25.3: Multi-floor switcher allows navigating between Floor 1 and Floor 2', () => {
    if (!env.engine) return;
    let room = env.engine.getRoom();
    assert.strictEqual(room.currentFloor, 'floor_1');

    // Place an item on Floor 1
    env.engine.placeItem('sofa_yellow', 30, 40);
    assert.strictEqual(env.engine.getRoom().placedItems.length, 1);

    // Switch to Floor 2
    const res = env.engine.switchFloor('floor_2');
    assert.strictEqual(res.success, true);
    assert.strictEqual(env.engine.getRoom().currentFloor, 'floor_2');
    assert.strictEqual(env.engine.getRoom().placedItems.length, 0);

    // Place an item on Floor 2
    env.engine.placeItem('bed_cozy', 50, 60);
    assert.strictEqual(env.engine.getRoom().placedItems.length, 1);

    // Switch back to Floor 1
    env.engine.switchFloor('floor_1');
    assert.strictEqual(env.engine.getRoom().currentFloor, 'floor_1');
    assert.strictEqual(env.engine.getRoom().placedItems.length, 1);
    assert.strictEqual(env.engine.getRoom().placedItems[0].itemId, 'sofa_yellow');
  });

  it('25.4: Pet pose setting and retrieval (idle, sit, sleep)', () => {
    if (!env.engine) return;
    assert.strictEqual(env.engine.getPetPose(), 'idle');

    env.engine.setPetPose('sit');
    assert.strictEqual(env.engine.getPetPose(), 'sit');

    env.engine.setPetPose('sleep');
    assert.strictEqual(env.engine.getPetPose(), 'sleep');

    // Invalid pose fallback
    env.engine.setPetPose('dancing_crazy');
    assert.strictEqual(env.engine.getPetPose(), 'idle');
  });
});
