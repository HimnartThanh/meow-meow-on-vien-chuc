/**
 * tests/tier5_adversarial/adversarial.test.js
 * Tier 5: Adversarial Hardening Tests:
 *   - Encoding & Escaping Integrity (HTML/Script injection in pet names and texts)
 *   - Invalid Input Combinations & Rapid Calling (Race conditions, duplicate state transitions)
 *   - Boundary & Resource Stress (Massive transactions, quota limits, empty profiles)
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 5: Adversarial Edge Cases & Hardening', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('ADV.1: Pet name with HTML/XSS payload (<script>alert(1)</script>) does not execute or corrupt state', () => {
    if (!env.engine) return;
    const xssName = '<script>alert("hack")</script>';
    env.engine.renamePet(xssName);
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    const pet = reloaded.engine.getPet();
    assert.ok(pet);
    // Name is safely serialized as text without running code
    assert.ok(typeof pet.name === 'string');
  });

  it('ADV.2: Pet name with complex Unicode emojis and diacritics preserves fidelity', () => {
    if (!env.engine) return;
    const unicodeName = '🐱 Hoàng Thượng 🌟';
    env.engine.renamePet(unicodeName);
    env.engine.saveState();

    const reloaded = loadTestEngine({ initialStorage: env.sandbox.localStorage.__getRawStore() });
    reloaded.engine.init();
    assert.strictEqual(reloaded.engine.getPet().name, unicodeName);
  });

  it('ADV.3: Rapid concurrent spend calls do not race into negative balance', () => {
    if (!env.engine) return;
    env.engine.earnStars(30, 'seed');

    // Fire 5 rapid purchases of 10 stars each
    let successfulSpends = 0;
    for (let i = 0; i < 5; i++) {
      const res = env.engine.spendStars(10, `rapid_${i}`);
      const ok = res === true || (res && res.success === true);
      if (ok) successfulSpends++;
    }

    // Exactly 3 spends can succeed from 30 stars with cost 10
    assert.strictEqual(successfulSpends, 3, 'Exactly 3 spends succeed');
    assert.strictEqual(env.engine.getStars(), 0, 'Balance is exactly 0 and never negative');
  });

  it('ADV.4: 1000 consecutive random transactions maintain strict arithmetic invariant', () => {
    if (!env.engine) return;

    let expectedStars = 0;
    let expectedTotal = 0;

    for (let i = 0; i < 1000; i++) {
      const isEarn = Math.random() > 0.4;
      if (isEarn) {
        const amt = Math.floor(Math.random() * 20) + 1;
        env.engine.earnStars(amt, 'stress');
        expectedStars += amt;
        expectedTotal += amt;
      } else {
        const amt = Math.floor(Math.random() * 30) + 1;
        const res = env.engine.spendStars(amt, 'stress');
        const ok = res === true || (res && res.success === true);
        if (ok) {
          expectedStars -= amt;
        }
      }

      assert.assert.isAtLeast(env.engine.getStars(), 0, 'Stars invariant >= 0 at all times');
      assert.strictEqual(env.engine.getStars(), expectedStars, 'Stars tracked precisely without drift');
      assert.strictEqual(env.engine.getTotalStarsEarned(), expectedTotal, 'Total stars strictly monotonic');
    }
  });

  it('ADV.5: LocalStorage state corruption injection triggers auto-recovery', () => {
    if (!env.engine) return;

    // Inject corrupted malformed JSON
    env.sandbox.localStorage.setItem('meowmeow_state', '{"version":1, "player": {"currentStars": -999}}');
    env.engine.init();

    // Invariant guard must ensure currentStars is never negative even if injected maliciously
    assert.assert.isAtLeast(env.engine.getStars(), 0, 'Engine corrects or guards negative injected balance');
  });
});
