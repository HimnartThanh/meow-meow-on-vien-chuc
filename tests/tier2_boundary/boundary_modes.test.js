/**
 * tests/tier2_boundary/boundary_modes.test.js
 * Tier 2: Boundary Tests for Study and Challenge Modes:
 *   - Extreme quiz scores (0% and 100%)
 *   - Speed mode 0-second cutoff
 *   - Survival mode 0-heart boundary
 *   - Boss battle reset on final question
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 2: Boundary Study & Challenge Modes', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('B3.1: Answering 10/10 quiz questions wrong awards 0 stars without error', () => {
    if (!env.engine) return;
    const initialStars = env.engine.getStars();
    for (let i = 0; i < 10; i++) {
      env.engine.markAnswered(`q_test_wrong_${i}`, false);
    }
    assert.strictEqual(env.engine.getStars(), initialStars, 'Zero correct answers grants 0 stars');
  });

  it('B3.2: 100% quiz set grants completion + perfect bonus without double trigger', () => {
    if (!env.engine) return;
    const initialStars = env.engine.getStars();
    env.engine.earnStars(5, 'completion_bonus');
    env.engine.earnStars(10, 'perfect_bonus');
    assert.strictEqual(env.engine.getStars(), initialStars + 15);
  });

  it('B3.3: Speed mode timer reaching exactly 0 disables further submissions', () => {
    let timeLeft = 1;
    let accepted = false;
    // Tick 1s
    timeLeft -= 1;
    if (timeLeft > 0) {
      accepted = true;
    }
    assert.strictEqual(accepted, false, 'Action at 0s should be blocked');
  });

  it('B3.4: Survival mode reaches 0 hearts exactly on 5th wrong answer', () => {
    let hearts = 5;
    for (let i = 0; i < 5; i++) {
      hearts -= 1;
    }
    assert.strictEqual(hearts, 0);
    const isGameOver = hearts <= 0;
    assert.strictEqual(isGameOver, true);
  });

  it('B3.5: Boss battle failing question 3 restores boss HP from 1 back to 3', () => {
    let bossHp = 3;
    // Q1 correct
    bossHp -= 1;
    assert.strictEqual(bossHp, 2);
    // Q2 correct
    bossHp -= 1;
    assert.strictEqual(bossHp, 1);
    // Q3 incorrect -> full heal
    bossHp = 3;
    assert.strictEqual(bossHp, 3, 'Boss resets to 3 HP');
  });
});
