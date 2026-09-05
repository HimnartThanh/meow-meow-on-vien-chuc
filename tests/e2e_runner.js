#!/usr/bin/env node
/**
 * ═════════════════════════════════════════════════════════════════════════
 * MEOW MEOW ÔN VIÊN CHỨC — E2E TEST SUITE RUNNER (TIERS 1-5)
 * ═════════════════════════════════════════════════════════════════════════
 * Executes all automated test suites covering Tiers 1 to 5 per TEST_INFRA.md:
 *   - Tier 1: Functional Baseline (Features 1 - 24)
 *   - Tier 2: Boundary & Edge Cases
 *   - Tier 3: Cross-Feature Combinations & Pairwise Integrations
 *   - Tier 4: Real-World Application Scenarios (5 User Journeys)
 *   - Tier 5: Adversarial Hardening & Invariant Stress Tests
 *
 * Usage:
 *   node tests/e2e_runner.js
 *   node tests/e2e_runner.js --tier=1
 *   node tests/e2e_runner.js --verbose
 */

const path = require('path');
const fs = require('fs');
const { registry } = require('./harness/test_framework');

const ARGS = process.argv.slice(2);
const TIER_FILTER = ARGS.find(a => a.startsWith('--tier=')) ? ARGS.find(a => a.startsWith('--tier=')).split('=')[1] : null;

console.log('\x1b[1m\x1b[35m');
console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     🐾 MEOW MEOW ÔN VIÊN CHỨC — E2E TEST HARNESS RUNNER 🐾        ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝');
console.log('\x1b[0m');

const TEST_DIRS = [
  { tier: '1', dir: path.join(__dirname, 'tier1_functional'), label: 'Tier 1: Functional Baseline' },
  { tier: '2', dir: path.join(__dirname, 'tier2_boundary'), label: 'Tier 2: Boundary & Edge Cases' },
  { tier: '3', dir: path.join(__dirname, 'tier3_cross_feature'), label: 'Tier 3: Cross-Feature Integration' },
  { tier: '4', dir: path.join(__dirname, 'tier4_scenarios'), label: 'Tier 4: Application Scenarios' },
  { tier: '5', dir: path.join(__dirname, 'tier5_adversarial'), label: 'Tier 5: Adversarial Hardening' }
];

// Load test files matching filter
let loadedFiles = 0;
for (const item of TEST_DIRS) {
  if (TIER_FILTER && item.tier !== TIER_FILTER) continue;

  if (fs.existsSync(item.dir)) {
    const files = fs.readdirSync(item.dir).filter(f => f.endsWith('.test.js')).sort();
    for (const file of files) {
      const fullPath = path.join(item.dir, file);
      require(fullPath);
      loadedFiles++;
    }
  }
}

console.log(`\x1b[36mLoaded ${loadedFiles} test suite files across target tiers.\x1b[0m`);

async function run() {
  const result = await registry.runAll();
  process.exitCode = result.success ? 0 : 1;
}

run().catch(err => {
  console.error('\x1b[31mFatal test runner exception:\x1b[0m', err);
  process.exitCode = 1;
});
