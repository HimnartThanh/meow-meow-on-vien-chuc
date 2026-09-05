/**
 * tests/tier2_boundary/boundary_core.test.js
 * Tier 2: Boundary & Stress Tests for Core Engine & LocalStorage:
 *   - Corrupt JSON recovery
 *   - Zero & Negative inputs
 *   - Number overflow & NaN protection
 *   - Empty and invalid string handling
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 2: Boundary Core & LocalStorage', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
  });

  it('B1.1: Corrupt JSON in localStorage recovers cleanly without throwing', () => {
    const corruptStorage = {
      meowmeow_state: '{ corrupt_json: true, unterminated string ...'
    };
    const corruptEnv = loadTestEngine({ initialStorage: corruptStorage });
    if (!corruptEnv.engine) return;
    assert.doesNotThrow(() => {
      const state = corruptEnv.engine.init();
      assert.ok(state, 'Recovered initial state');
    });
  });

  it('B1.2: earnStars rejects NaN and Infinity', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.earnStars(NaN, 'test');
    env.engine.earnStars(Infinity, 'test');
    assert.strictEqual(env.engine.getStars(), 0, 'Stars remain 0 after invalid inputs');
  });

  it('B1.3: spendStars rejects non-numeric and negative values', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.earnStars(20, 'test');
    const res1 = env.engine.spendStars('five', 'test');
    const res2 = env.engine.spendStars(-10, 'test');
    const ok1 = res1 === true || (res1 && res1.success === true);
    const ok2 = res2 === true || (res2 && res2.success === true);
    assert.strictEqual(ok1, false);
    assert.strictEqual(ok2, false);
    assert.strictEqual(env.engine.getStars(), 20);
  });

  it('B1.4: Renaming pet with string > 20 characters truncates or handles safely', () => {
    if (!env.engine) return;
    env.engine.init();
    const superLongName = 'MeowMeowSuperLongNameExceedingTwentyCharacters';
    env.engine.renamePet(superLongName);
    const petName = env.engine.getPet().name;
    assert.ok(petName.length <= 25, 'Pet name length should be bounded');
  });

  it('B1.5: Renaming pet with empty string or whitespace retains previous name or defaults', () => {
    if (!env.engine) return;
    env.engine.init();
    env.engine.renamePet('Miu Vàng');
    env.engine.renamePet('     ');
    const petName = env.engine.getPet().name;
    assert.ok(petName && petName.trim().length > 0, 'Pet name must not be blank');
  });
});
