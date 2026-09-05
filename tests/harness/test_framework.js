/**
 * tests/harness/test_framework.js
 * Zero-dependency lightweight test runner for E2E and unit test suites.
 */

const assert = require('assert');

class Suite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  addTest(name, fn) {
    this.tests.push({ name, fn });
  }

  addBeforeEach(fn) {
    this.beforeEachHooks.push(fn);
  }

  addAfterEach(fn) {
    this.afterEachHooks.push(fn);
  }

  async run(reporter) {
    reporter.suiteStart(this.name);
    let suitePassed = true;

    for (const test of this.tests) {
      reporter.testStart(test.name);
      try {
        for (const hook of this.beforeEachHooks) {
          await hook();
        }
        await test.fn();
        for (const hook of this.afterEachHooks) {
          await hook();
        }
        reporter.testPass(test.name);
      } catch (err) {
        suitePassed = false;
        reporter.testFail(test.name, err);
      }
    }

    reporter.suiteEnd(this.name, suitePassed);
    return suitePassed;
  }
}

class TestRegistry {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
  }

  describe(name, fn) {
    const suite = new Suite(name);
    this.suites.push(suite);
    const prev = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = prev;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.it(name, fn);
      });
      return;
    }
    this.currentSuite.addTest(name, fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.addBeforeEach(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.addAfterEach(fn);
    }
  }

  async runAll() {
    let total = 0;
    let passed = 0;
    let failed = 0;
    const failures = [];

    const reporter = {
      suiteStart: (name) => {
        console.log(`\n\x1b[36m━━━ ${name} ━━━\x1b[0m`);
      },
      suiteEnd: () => {},
      testStart: () => {
        total++;
      },
      testPass: (name) => {
        passed++;
        console.log(`  \x1b[32m✔ PASS\x1b[0m ${name}`);
      },
      testFail: (name, err) => {
        failed++;
        failures.push({ name, err });
        console.log(`  \x1b[31m✖ FAIL\x1b[0m ${name}`);
        console.log(`    \x1b[31m↳ ${err.message || err}\x1b[0m`);
        if (process.env.DEBUG && err.stack) {
          console.log(`    \x1b[2m${err.stack.split('\n').slice(1, 4).join('\n')}\x1b[0m`);
        }
      }
    };

    const startTime = Date.now();
    for (const suite of this.suites) {
      await suite.run(reporter);
    }
    const duration = Date.now() - startTime;

    console.log(`\n\x1b[1m═════════════════════════════════════════════════════════════════════\x1b[0m`);
    console.log(`Total Tests: ${total} | \x1b[32mPassed: ${passed}\x1b[0m | \x1b[${failed > 0 ? '31m' : '32m'}Failed: ${failed}\x1b[0m | Duration: ${duration}ms`);
    console.log(`\x1b[1m═════════════════════════════════════════════════════════════════════\x1b[0m\n`);

    return { total, passed, failed, failures, duration, success: failed === 0 };
  }
}

// Custom assertions
const customAssert = {
  ...assert,
  isAbove: (val, limit, msg) => {
    assert.ok(val > limit, msg || `Expected ${val} > ${limit}`);
  },
  isBelow: (val, limit, msg) => {
    assert.ok(val < limit, msg || `Expected ${val} < ${limit}`);
  },
  isAtLeast: (val, limit, msg) => {
    assert.ok(val >= limit, msg || `Expected ${val} >= ${limit}`);
  },
  isAtMost: (val, limit, msg) => {
    assert.ok(val <= limit, msg || `Expected ${val} <= ${limit}`);
  },
  between: (val, min, max, msg) => {
    assert.ok(val >= min && val <= max, msg || `Expected ${val} between [${min}, ${max}]`);
  },
  isOneOf: (val, list, msg) => {
    assert.ok(list.includes(val), msg || `Expected ${val} to be one of ${JSON.stringify(list)}`);
  }
};
customAssert.assert = customAssert;

const registry = new TestRegistry();

module.exports = {
  describe: registry.describe.bind(registry),
  it: registry.it.bind(registry),
  test: registry.it.bind(registry),
  beforeEach: registry.beforeEach.bind(registry),
  afterEach: registry.afterEach.bind(registry),
  assert: customAssert,
  registry
};
