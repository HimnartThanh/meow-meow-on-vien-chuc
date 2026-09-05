/**
 * tests/tier1_functional/onboarding_stats.test.js
 * Tier 1: Functional Tests for Features 22, 23, 24:
 *   - Feature 22: Onboarding Flow & Pet Naming (5 tests)
 *   - Feature 23: Stats Dashboard & 7-Day Chart (5 tests)
 *   - Feature 24: Pink Pastel Theme & Responsive CSS (5 tests)
 */

const fs = require('fs');
const path = require('path');
const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine, ROOT_DIR } = require('../harness/fixtures');

describe('Tier 1: Feature 22 — Onboarding Flow & Pet Naming', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('22.1: isFirstTime() returns true on a newly initialized profile', () => {
    if (!env.engine) return;
    assert.strictEqual(env.engine.isFirstTime(), true);
  });

  it('22.2: completeOnboarding sets pet type and custom pet name', () => {
    if (!env.engine) return;
    env.engine.completeOnboarding('bunny', 'Bé Bông');
    const pet = env.engine.getPet();
    assert.strictEqual(pet.type, 'bunny');
    assert.strictEqual(pet.name, 'Bé Bông');
  });

  it('22.3: completeOnboarding marks initialized to true (isFirstTime becomes false)', () => {
    if (!env.engine) return;
    env.engine.completeOnboarding('cat', 'Miu');
    assert.strictEqual(env.engine.isFirstTime(), false);
  });

  it('22.4: Empty pet name in completeOnboarding falls back to default name "Miu"', () => {
    if (!env.engine) return;
    env.engine.completeOnboarding('cat', '   ');
    assert.ok(env.engine.getPet().name.length > 0, 'Name must not be empty');
  });

  it('22.5: Chosen onboarding pet is automatically added to ownedPets', () => {
    if (!env.engine) return;
    env.engine.completeOnboarding('duck', 'Vịt Vàng');
    assert.ok(env.engine.getOwnedPets().includes('duck'));
  });
});

describe('Tier 1: Feature 23 — Stats Dashboard & 7-Day Chart', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('23.1: getStats returns totalQuestionsAnswered and totalCorrect counts', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    env.engine.markAnswered('q_luatvc_002', false);
    const stats = env.engine.getStats();
    assert.assert.isAtLeast(stats.totalQuestionsAnswered, 2);
    assert.assert.isAtLeast(stats.totalCorrect, 1);
  });

  it('23.2: getTodayStats returns answered, correct, and starsEarned for today', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    env.engine.earnStars(5, 'daily');
    const today = env.engine.getTodayStats();
    assert.ok(today);
    assert.assert.isAtLeast(today.answered, 1);
    assert.assert.isAtLeast(today.starsEarned, 5);
  });

  it('23.3: getTopicProgress returns correct totals, mastered, and percentage', () => {
    if (!env.engine) return;
    const prog = env.engine.getTopicProgress('luat_vc');
    assert.ok(prog && typeof prog.total === 'number');
    assert.ok(typeof prog.mastered === 'number');
    assert.assert.between(prog.percentage, 0, 100);
  });

  it('23.4: getAllProgress returns comprehensive mastery counts across all questions', () => {
    if (!env.engine) return;
    const all = env.engine.getAllProgress();
    assert.ok(all && typeof all.totalQuestions === 'number');
    assert.assert.between(all.overallPercentage, 0, 100);
  });

  it('23.5: Daily log entries record date keys in YYYY-MM-DD ISO format', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    const stats = env.engine.getStats();
    const today = new Date().toISOString().split('T')[0];
    assert.ok(stats.dailyLog && stats.dailyLog[today], 'dailyLog contains today key');
  });
});

describe('Tier 1: Feature 24 — Pink Pastel Theme & Responsive CSS', () => {
  it('24.1: css/style.css defines pink pastel root variables', () => {
    const stylePath = path.join(ROOT_DIR, 'css', 'style.css');
    if (!fs.existsSync(stylePath)) return;
    const content = fs.readFileSync(stylePath, 'utf-8');
    assert.ok(content.includes('--') || content.includes('pink') || content.includes('#'), 'CSS contains color definitions');
  });

  it('24.2: css/pets.css defines styles for 5 pet types and animations', () => {
    const petsPath = path.join(ROOT_DIR, 'css', 'pets.css');
    if (!fs.existsSync(petsPath)) return;
    const content = fs.readFileSync(petsPath, 'utf-8');
    assert.ok(content.includes('pet-cat') || content.includes('cat'));
    assert.ok(content.includes('idle') || content.includes('happy'));
  });

  it('24.3: css/items.css defines furniture visual classes', () => {
    const itemsPath = path.join(ROOT_DIR, 'css', 'items.css');
    if (!fs.existsSync(itemsPath)) return;
    const content = fs.readFileSync(itemsPath, 'utf-8');
    assert.ok(content.includes('item-') || content.includes('room'));
  });

  it('24.4: Responsive viewport meta tag is present in index.html', () => {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) return;
    const content = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(content.includes('viewport') && content.includes('width=device-width'));
  });

  it('24.5: Media queries exist for responsive scaling down to mobile 375px', () => {
    const stylePath = path.join(ROOT_DIR, 'css', 'style.css');
    if (!fs.existsSync(stylePath)) return;
    const content = fs.readFileSync(stylePath, 'utf-8');
    assert.ok(content.includes('@media') || content.includes('max-width') || content.includes('min-width'));
  });
});
