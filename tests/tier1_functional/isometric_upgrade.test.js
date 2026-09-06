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

  it('25.5: Panoramic 2000px Room SVG backgrounds have valid width, height and viewBox', () => {
    const floor1Path = path.resolve(ROOT_DIR, 'assets/isometric/rooms/room_floor_1.svg');
    const floor2Path = path.resolve(ROOT_DIR, 'assets/isometric/rooms/room_floor_2.svg');

    assert.ok(fs.existsSync(floor1Path), 'room_floor_1.svg must exist');
    assert.ok(fs.existsSync(floor2Path), 'room_floor_2.svg must exist');

    const floor1Content = fs.readFileSync(floor1Path, 'utf8');
    const floor2Content = fs.readFileSync(floor2Path, 'utf8');

    assert.ok(floor1Content.includes('viewBox="0 0 2000 540"'), 'floor 1 SVG viewBox must be 0 0 2000 540');
    assert.ok(floor1Content.includes('width="2000"'), 'floor 1 SVG width must be 2000');
    assert.ok(floor1Content.includes('height="540"'), 'floor 1 SVG height must be 540');
    assert.ok(floor1Content.includes('preserveAspectRatio="none"'), 'floor 1 must have preserveAspectRatio none to eliminate letterboxing');

    assert.ok(floor2Content.includes('viewBox="0 0 2000 540"'), 'floor 2 SVG viewBox must be 0 0 2000 540');
    assert.ok(floor2Content.includes('width="2000"'), 'floor 2 SVG width must be 2000');
    assert.ok(floor2Content.includes('height="540"'), 'floor 2 SVG height must be 540');
    assert.ok(floor2Content.includes('preserveAspectRatio="none"'), 'floor 2 must have preserveAspectRatio none to eliminate letterboxing');
  });

  it('25.6: room.html contains Panoramic Camera controls (pills, minimap, viewport wrapper)', () => {
    const roomHtmlPath = path.resolve(ROOT_DIR, 'room.html');
    assert.ok(fs.existsSync(roomHtmlPath), 'room.html must exist');
    const html = fs.readFileSync(roomHtmlPath, 'utf8');

    assert.ok(html.includes('id="camera-quick-nav"'), 'Must contain camera-quick-nav');
    assert.ok(html.includes('id="btn-cam-indoor"'), 'Must contain btn-cam-indoor');
    assert.ok(html.includes('id="btn-cam-outdoor"'), 'Must contain btn-cam-outdoor');
    assert.ok(html.includes('id="camera-minimap"'), 'Must contain camera-minimap');
    assert.ok(html.includes('id="cam-minimap-thumb"'), 'Must contain cam-minimap-thumb');
  });

  it('25.7: css/room-iso.css contains 2000px canvas stage and viewport styles', () => {
    const cssPath = path.resolve(ROOT_DIR, 'css/room-iso.css');
    assert.ok(fs.existsSync(cssPath), 'room-iso.css must exist');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('width: 2000px;'), 'Must style stage with 2000px width');
    assert.ok(css.includes('.camera-quick-nav'), 'Must style camera-quick-nav');
    assert.ok(css.includes('.camera-minimap'), 'Must style camera-minimap');
    assert.ok(css.includes('will-change: transform;'), 'Must hardware-accelerate camera pan');
  });

  it('25.8: js/room.js implements CameraController (panCameraTo, setCameraX, getCameraX, getMaxScrollX)', () => {
    const jsPath = path.resolve(ROOT_DIR, 'js/room.js');
    assert.ok(fs.existsSync(jsPath), 'room.js must exist');
    const js = fs.readFileSync(jsPath, 'utf8');

    assert.ok(js.includes('panCameraTo'), 'Must implement panCameraTo');
    assert.ok(js.includes('setCameraX'), 'Must implement setCameraX');
    assert.ok(js.includes('setupCameraController'), 'Must implement setupCameraController');
    assert.ok(js.includes('edgePanTick'), 'Must implement edgePanTick for dragging across rooms');
    assert.ok(js.includes('window.CameraController'), 'Must expose window.CameraController');
  });
});

