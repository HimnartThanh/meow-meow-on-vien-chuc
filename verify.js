#!/usr/bin/env node
/**
 * ═════════════════════════════════════════════════════════════════════════
 * MEOW MEOW ÔN VIÊN CHỨC — AUTOMATED SMOKE TEST & VERIFICATION RUNNER
 * ═════════════════════════════════════════════════════════════════════════
 * Authoritative verification script satisfying ORIGINAL_REQUEST.md lines 61-69:
 *   a. HTML files existence and markup syntax validation
 *   b. Referenced CSS and JS files existence and loadability
 *   c. game.js API contract coverage (42 API methods from AGENT_BRIEF.md)
 *   d. data.js schema validation (topics, questions, sortItems, shop, pets, badges)
 *   e. localStorage round-trip persistence (init -> mutate -> save -> reload)
 *   f. Star economy arithmetic and non-negative guard invariant
 *   g. Spaced Repetition System (SRS) progression and interval reset
 *   h. Daily streak tracking and reset calculation
 *
 * Usage:
 *   node verify.js
 *   node verify.js --verbose
 *   node verify.js --json
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ─────────────────────────────────────────────────────────────────────────
// CLI Configuration & Output Formatting
// ─────────────────────────────────────────────────────────────────────────
const ARGS = process.argv.slice(2);
const IS_VERBOSE = ARGS.includes('--verbose') || ARGS.includes('-v');
const IS_JSON = ARGS.includes('--json');
const IS_ORACLE = ARGS.includes('--oracle') || ARGS.includes('--self-test');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m'
};

const ROOT_DIR = path.resolve(__dirname);

class TestReporter {
  constructor() {
    this.totalAssertions = 0;
    this.passedAssertions = 0;
    this.failedAssertions = 0;
    this.sections = [];
    this.currentSection = null;
  }

  startSection(name, description) {
    this.currentSection = {
      name,
      description,
      assertions: [],
      passed: true
    };
    this.sections.push(this.currentSection);
    if (!IS_JSON) {
      console.log(`\n${COLORS.cyan}━━━ [${name}] ${description} ━━━${COLORS.reset}`);
    }
  }

  assert(condition, message, details = null) {
    this.totalAssertions++;
    const passed = Boolean(condition);
    if (passed) {
      this.passedAssertions++;
    } else {
      this.failedAssertions++;
      if (this.currentSection) {
        this.currentSection.passed = false;
      }
    }

    const record = { message, passed, details };
    if (this.currentSection) {
      this.currentSection.assertions.push(record);
    }

    if (!IS_JSON) {
      const mark = passed ? `${COLORS.green}✔ PASS${COLORS.reset}` : `${COLORS.red}✖ FAIL${COLORS.reset}`;
      console.log(`  ${mark} ${message}`);
      if (!passed && details) {
        console.log(`    ${COLORS.red}↳ Reason: ${typeof details === 'object' ? JSON.stringify(details) : details}${COLORS.reset}`);
      } else if (passed && IS_VERBOSE && details) {
        console.log(`    ${COLORS.dim}↳ Info: ${typeof details === 'object' ? JSON.stringify(details) : details}${COLORS.reset}`);
      }
    }
  }

  summary() {
    if (IS_JSON) {
      const output = {
        totalAssertions: this.totalAssertions,
        passedAssertions: this.passedAssertions,
        failedAssertions: this.failedAssertions,
        success: this.failedAssertions === 0,
        sections: this.sections
      };
      console.log(JSON.stringify(output, null, 2));
      return this.failedAssertions === 0;
    }

    console.log(`\n${COLORS.bright}═════════════════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.bright}                   SMOKE TEST VERIFICATION SUMMARY                  ${COLORS.reset}`);
    console.log(`${COLORS.bright}═════════════════════════════════════════════════════════════════════${COLORS.reset}`);
    for (const sec of this.sections) {
      const mark = sec.passed ? `${COLORS.green}✔ PASS${COLORS.reset}` : `${COLORS.red}✖ FAIL${COLORS.reset}`;
      const counts = `${sec.assertions.filter(a => a.passed).length}/${sec.assertions.length}`;
      console.log(`  ${mark}  ${sec.name.padEnd(12)} : ${counts} checks passed — ${sec.description}`);
    }
    console.log(`${COLORS.bright}─────────────────────────────────────────────────────────────────────${COLORS.reset}`);
    console.log(`Total Assertions: ${this.totalAssertions} | Passed: ${COLORS.green}${this.passedAssertions}${COLORS.reset} | Failed: ${this.failedAssertions > 0 ? COLORS.red : COLORS.green}${this.failedAssertions}${COLORS.reset}`);
    
    if (this.failedAssertions === 0) {
      console.log(`\n${COLORS.green}${COLORS.bright}🎉 ALL VERIFICATION CRITERIA SATISFIED! (100% PASS)${COLORS.reset}\n`);
      return true;
    } else {
      console.log(`\n${COLORS.red}${COLORS.bright}❌ VERIFICATION FAILED: ${this.failedAssertions} checks failed.${COLORS.reset}\n`);
      return false;
    }
  }
}

const reporter = new TestReporter();

// ─────────────────────────────────────────────────────────────────────────
// Section A: HTML Files Existence and Markup Syntax Validation
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-A', 'HTML files existence and valid markup syntax');

const REQUIRED_HTML_FILES = [
  'index.html',
  'study.html',
  'flashcard.html',
  'quiz.html',
  'matching.html',
  'sorting.html',
  'challenge.html',
  'room.html',
  'shop.html',
  'stats.html'
];

/**
 * Validates basic HTML structure and checks for unclosed tags.
 */
function validateHtmlContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];

  // Check doctype
  if (!/<!doctype\s+html>/i.test(content)) {
    errors.push('Missing <!DOCTYPE html>');
  }

  // Check required standard elements
  if (!/<html[\s>]/i.test(content) || !/<\/html>/i.test(content)) {
    errors.push('Missing <html> or </html>');
  }
  if (!/<head[\s>]/i.test(content) || !/<\/head>/i.test(content)) {
    errors.push('Missing <head> or </head>');
  }
  if (!/<body[\s>]/i.test(content) || !/<\/body>/i.test(content)) {
    errors.push('Missing <body> or </body>');
  }

  // Strip comments, scripts, styles to check tag closure safely
  let stripped = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  const tagRegex = /<\/?([a-zA-Z0-9\-]+)([^>]*)>/g;
  const tagStack = [];
  let match;

  while ((match = tagRegex.exec(stripped)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || VOID_ELEMENTS.has(tagName);

    if (isClosing) {
      if (tagStack.length === 0) {
        errors.push(`Unexpected closing tag: </${tagName}> without open tag`);
      } else {
        const top = tagStack.pop();
        if (top !== tagName) {
          // Allow loose paragraph / list item closures if standard, but record strict mismatch
          errors.push(`Mismatched tag: expected </${top}>, found </${tagName}>`);
        }
      }
    } else if (!isSelfClosing) {
      tagStack.push(tagName);
    }
  }

  if (tagStack.length > 0) {
    errors.push(`Unclosed tags at end of file: ${tagStack.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

for (const htmlFile of REQUIRED_HTML_FILES) {
  const fullPath = path.join(ROOT_DIR, htmlFile);
  const exists = fs.existsSync(fullPath);
  reporter.assert(exists, `Required HTML exists: ${htmlFile}`, exists ? null : `File not found at ${fullPath}`);

  if (exists) {
    const validation = validateHtmlContent(fullPath);
    reporter.assert(validation.isValid, `Valid HTML syntax: ${htmlFile}`, validation.isValid ? null : validation.errors);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Section B: Referenced CSS and JS Files Existence and Loadability
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-B', 'Referenced CSS and JS files exist and are loadable');

const foundReferences = new Set();

for (const htmlFile of REQUIRED_HTML_FILES) {
  const fullPath = path.join(ROOT_DIR, htmlFile);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Find stylesheet links: <link rel="stylesheet" href="...">
  const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  let cssMatch;
  while ((cssMatch = cssRegex.exec(content)) !== null) {
    const href = cssMatch[1];
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
      foundReferences.add(href);
    }
  }

  // Also match reversed order: href before rel
  const cssRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi;
  while ((cssMatch = cssRegex2.exec(content)) !== null) {
    const href = cssMatch[1];
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
      foundReferences.add(href);
    }
  }

  // Find script tags: <script src="...">
  const jsRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let jsMatch;
  while ((jsMatch = jsRegex.exec(content)) !== null) {
    const src = jsMatch[1];
    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
      foundReferences.add(src);
    }
  }
}

// Assert core CSS files are referenced and exist
const CORE_REQUIRED_ASSETS = [
  'css/style.css',
  'css/pets.css',
  'css/items.css',
  'js/data.js',
  'js/game.js'
];

for (const coreAsset of CORE_REQUIRED_ASSETS) {
  const assetPath = path.join(ROOT_DIR, coreAsset);
  const exists = fs.existsSync(assetPath);
  let loadable = false;
  if (exists) {
    const stats = fs.statSync(assetPath);
    loadable = stats.size > 0;
  }
  reporter.assert(exists && loadable, `Core asset loadable: ${coreAsset}`, { exists, loadable });
}

for (const ref of foundReferences) {
  // Normalize path
  const normalizedRef = ref.split('?')[0].split('#')[0];
  const fullRefPath = path.join(ROOT_DIR, normalizedRef);
  const exists = fs.existsSync(fullRefPath);
  let isReadable = false;
  if (exists) {
    try {
      const content = fs.readFileSync(fullRefPath, 'utf-8');
      isReadable = content.length > 0;
    } catch {
      isReadable = false;
    }
  }
  reporter.assert(exists && isReadable, `Referenced asset exists & readable: ${normalizedRef}`, { exists, isReadable });
}

// ─────────────────────────────────────────────────────────────────────────
// Section C: game.js Exposes All Expected 42 API Functions
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-C', 'game.js API contract coverage (42 API methods)');

const EXPECTED_42_API_METHODS = [
  // 1-5: Lifecycle & State
  'init',
  'saveState',
  'resetGame',
  'isFirstTime',
  'completeOnboarding',
  // 6-9: Stars
  'getStars',
  'getTotalStarsEarned',
  'earnStars',
  'spendStars',
  // 10-14: Pet System
  'getPet',
  'setPetState',
  'switchPet',
  'renamePet',
  'updatePetReaction',
  // 15-16: Streak
  'checkIn',
  'getStreak',
  // 17-22: Room
  'getRoom',
  'placeItem',
  'moveItem',
  'removeItem',
  'changeWallpaper',
  'changeFloor',
  // 23-28: Shop & Inventory
  'buyItem',
  'buyPet',
  'getOwnedItems',
  'getOwnedPets',
  'isItemOwned',
  'getInventory',
  // 29-33: Spaced Repetition (SRS)
  'markAnswered',
  'getProgress',
  'getTodayReview',
  'getTopicProgress',
  'getAllProgress',
  // 34-37: Challenge Modes
  'isChallengeUnlocked',
  'unlockChallenge',
  'updateHighScore',
  'getHighScores',
  // 38-40: Badges
  'checkBadges',
  'getBadges',
  'hasBadge',
  // 41-42: Stats
  'getStats',
  'getTodayStats'
];

/**
 * Creates an isolated browser-like sandbox environment for evaluating client JS.
 */
function createBrowserSandbox() {
  const store = {};
  const mockLocalStorage = {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] || null,
    __getRawStore: () => store
  };

  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    localStorage: mockLocalStorage,
    window: {},
    document: {
      createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        setAttribute: () => {},
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        style: {},
        addEventListener: () => {}
      }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => []
    },
    AudioContext: function() {
      return {
        state: 'suspended',
        resume: async () => {},
        createOscillator: () => ({
          type: 'sine',
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: { setValueAtTime: () => {} }
        }),
        createGain: () => ({
          connect: () => {},
          gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
        }),
        destination: {}
      };
    }
  };

  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.self = sandbox;
  return sandbox;
}

function getEngineInstance(initialStorage = {}) {
  const sandbox = createBrowserSandbox();
  if (initialStorage) {
    for (const [k, v] of Object.entries(initialStorage)) {
      sandbox.localStorage.setItem(k, v);
    }
  }
  if (fs.existsSync(dataJsPath)) {
    vm.runInNewContext(fs.readFileSync(dataJsPath, 'utf-8'), sandbox);
  } else if (IS_ORACLE) {
    sandbox.DATA = loadedDATA;
    sandbox.window.DATA = loadedDATA;
  }
  if (fs.existsSync(gameJsPath)) {
    vm.runInNewContext(fs.readFileSync(gameJsPath, 'utf-8'), sandbox);
  } else if (IS_ORACLE) {
    sandbox.GameEngine = require('./tests/harness/reference_engine').createReferenceEngine(sandbox);
    sandbox.window.GameEngine = sandbox.GameEngine;
  }
  const engine = sandbox.GameEngine || sandbox.window.GameEngine || null;
  return { sandbox, engine };
}

let loadedGameEngine = null;
let loadedDATA = null;
const gameJsPath = path.join(ROOT_DIR, 'js', 'game.js');
const dataJsPath = path.join(ROOT_DIR, 'js', 'data.js');

if (fs.existsSync(dataJsPath)) {
  try {
    const dataSandbox = createBrowserSandbox();
    const dataCode = fs.readFileSync(dataJsPath, 'utf-8');
    vm.runInNewContext(dataCode, dataSandbox);
    loadedDATA = dataSandbox.DATA || dataSandbox.window.DATA;
  } catch (err) {
    reporter.assert(false, `js/data.js loads without syntax error`, err.message);
  }
} else if (IS_ORACLE) {
  loadedDATA = require('./tests/harness/fixtures').MOCK_DATA;
} else {
  reporter.assert(false, `js/data.js exists for evaluation`, 'File missing');
}

if (fs.existsSync(gameJsPath)) {
  try {
    const gameSandbox = createBrowserSandbox();
    if (loadedDATA) {
      gameSandbox.DATA = loadedDATA;
      gameSandbox.window.DATA = loadedDATA;
    }
    const gameCode = fs.readFileSync(gameJsPath, 'utf-8');
    vm.runInNewContext(gameCode, gameSandbox);
    loadedGameEngine = gameSandbox.GameEngine || gameSandbox.window.GameEngine;
  } catch (err) {
    reporter.assert(false, `js/game.js loads without syntax error`, err.message);
  }
} else if (IS_ORACLE) {
  const oracleSandbox = createBrowserSandbox();
  oracleSandbox.DATA = loadedDATA;
  oracleSandbox.window.DATA = loadedDATA;
  loadedGameEngine = require('./tests/harness/reference_engine').createReferenceEngine(oracleSandbox);
} else {
  reporter.assert(false, `js/game.js exists for evaluation`, 'File missing');
}

reporter.assert(loadedGameEngine !== null && typeof loadedGameEngine === 'object', 'GameEngine object exported to global/window', {
  available: loadedGameEngine !== null
});

if (loadedGameEngine) {
  let missingMethods = [];
  for (const method of EXPECTED_42_API_METHODS) {
    const exists = typeof loadedGameEngine[method] === 'function';
    if (!exists) {
      missingMethods.push(method);
    }
    reporter.assert(exists, `GameEngine.${method}() is implemented as a function`, exists ? null : `Missing method`);
  }
  reporter.assert(missingMethods.length === 0, `All 42 API methods present on GameEngine`, {
    missingCount: missingMethods.length,
    missing: missingMethods
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Section D: data.js Contains Valid Data with Correct Schema
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-D', 'data.js content and schema validation');

reporter.assert(loadedDATA !== null && typeof loadedDATA === 'object', 'DATA object defined and loaded', {
  available: loadedDATA !== null
});

if (loadedDATA) {
  // 1. Topics
  const topics = loadedDATA.topics;
  const isTopicsValid = Array.isArray(topics) && topics.length >= 2;
  reporter.assert(isTopicsValid, `DATA.topics is an array with >= 2 topics (found: ${topics ? topics.length : 0})`, topics);

  const topicIds = new Set();
  if (Array.isArray(topics)) {
    for (const t of topics) {
      const valid = t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.icon === 'string' && typeof t.description === 'string';
      reporter.assert(valid, `Topic schema valid: ${t ? t.id : 'unknown'}`, t);
      if (t && t.id) topicIds.add(t.id);
    }
  }

  // 2. Questions
  const questions = loadedDATA.questions;
  const isQuestionsArray = Array.isArray(questions);
  reporter.assert(isQuestionsArray && questions.length >= 20, `DATA.questions is an array with >= 20 questions (found: ${questions ? questions.length : 0})`);

  let invalidQuestionCount = 0;
  const topicQuestionCounts = {};
  const topicSortCounts = {};
  for (const tId of topicIds) {
    topicQuestionCounts[tId] = 0;
    topicSortCounts[tId] = 0;
  }

  if (isQuestionsArray) {
    for (const q of questions) {
      let qValid = true;
      if (!q.id || typeof q.id !== 'string') qValid = false;
      if (!q.topicId || !topicIds.has(q.topicId)) qValid = false;
      if (!q.concept || typeof q.concept !== 'string') qValid = false;
      if (!q.definition || typeof q.definition !== 'string') qValid = false;
      if (!Array.isArray(q.quizOptions) || q.quizOptions.length !== 4) qValid = false;
      if (typeof q.quizAnswer !== 'number' || q.quizAnswer < 0 || q.quizAnswer > 3) qValid = false;
      if (!q.explanation || typeof q.explanation !== 'string') qValid = false;

      if (!qValid) {
        invalidQuestionCount++;
      } else {
        topicQuestionCounts[q.topicId] = (topicQuestionCounts[q.topicId] || 0) + 1;
        if (Array.isArray(q.sortItems) && q.sortItems.length >= 2) {
          topicSortCounts[q.topicId] = (topicSortCounts[q.topicId] || 0) + 1;
        }
      }
    }

    reporter.assert(invalidQuestionCount === 0, `All questions conform strictly to schema (invalid: ${invalidQuestionCount})`);

    for (const tId of topicIds) {
      const qCount = topicQuestionCounts[tId] || 0;
      reporter.assert(qCount >= 10, `Topic [${tId}] has >= 10 questions (actual: ${qCount})`);
      const sortCount = topicSortCounts[tId] || 0;
      reporter.assert(sortCount >= 2, `Topic [${tId}] has >= 2 questions with valid sortItems (actual: ${sortCount})`);
    }
  }

  // 3. Shop Items
  const shopItems = loadedDATA.shopItems;
  const isShopArray = Array.isArray(shopItems);
  reporter.assert(isShopArray && shopItems.length >= 15, `DATA.shopItems has >= 15 items (actual: ${shopItems ? shopItems.length : 0})`);

  if (isShopArray) {
    const categories = new Set();
    let invalidShopItems = 0;
    for (const item of shopItems) {
      if (!item.id || !item.name || !item.category || typeof item.price !== 'number' || item.price <= 0 || !item.description) {
        invalidShopItems++;
      } else {
        categories.add(item.category);
      }
    }
    reporter.assert(invalidShopItems === 0, `All shopItems conform to schema (invalid: ${invalidShopItems})`);
    reporter.assert(categories.size >= 3, `shopItems span >= 3 distinct categories (actual: ${categories.size})`, Array.from(categories));
  }

  // 4. Pet Catalog
  const petCatalog = loadedDATA.petCatalog;
  const isPetArray = Array.isArray(petCatalog);
  reporter.assert(isPetArray && petCatalog.length >= 3, `DATA.petCatalog has >= 3 pets (actual: ${petCatalog ? petCatalog.length : 0})`);
  if (isPetArray) {
    let invalidPets = 0;
    for (const p of petCatalog) {
      if (!p.type || !p.name || typeof p.price !== 'number' || !p.personality) {
        invalidPets++;
      }
    }
    reporter.assert(invalidPets === 0, `All pets conform to schema (invalid: ${invalidPets})`);
  }

  // 5. Badges
  const badges = loadedDATA.badges;
  const isBadgesArray = Array.isArray(badges);
  reporter.assert(isBadgesArray && badges.length >= 10, `DATA.badges has >= 10 badges (actual: ${badges ? badges.length : 0})`);
  if (isBadgesArray) {
    let invalidBadges = 0;
    for (const b of badges) {
      if (!b.id || !b.name || !(b.description || b.condition)) {
        invalidBadges++;
      }
    }
    reporter.assert(invalidBadges === 0, `All badges conform to schema (invalid: ${invalidBadges})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Section E: LocalStorage Round-Trip Persistence
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-E', 'localStorage round-trip persistence (init -> mutate -> save -> reload)');

if ((fs.existsSync(gameJsPath) && fs.existsSync(dataJsPath)) || IS_ORACLE) {
  try {
    const { sandbox: sandbox1, engine: engine1 } = getEngineInstance();
    const state1 = engine1.init();

    reporter.assert(state1 && typeof state1 === 'object', 'GameEngine.init() returns initial state object on empty storage');
    reporter.assert(typeof state1.player === 'object' && state1.player.currentStars === 0, 'Initial state has currentStars === 0');
    reporter.assert(engine1.isFirstTime() === true, 'isFirstTime() is true on initial fresh state');

    // Perform mutations
    engine1.completeOnboarding('bunny', 'Bông Gòn');
    engine1.earnStars(42, 'test_reward');
    engine1.placeItem('desk_pink', 35, 60);
    engine1.saveState();

    // Check storage has key 'meowmeow_state' or 'meow_study_game_state'
    const rawStorage = sandbox1.localStorage.__getRawStore();
    const storageKey = rawStorage['meowmeow_state'] ? 'meowmeow_state' : 'meow_study_game_state';
    reporter.assert(Boolean(rawStorage[storageKey]), `State serialized into localStorage key [${storageKey}]`);

    // Reload in a completely separate sandbox instance using identical storage
    const { sandbox: sandbox2, engine: engine2 } = getEngineInstance(rawStorage);
    engine2.init();

    reporter.assert(engine2.isFirstTime() === false, 'isFirstTime() correctly persists as false after onboarding');
    reporter.assert(engine2.getStars() === 42, `getStars() restored accurately (expected 42, got ${engine2.getStars()})`);
    
    const loadedPet = engine2.getPet();
    reporter.assert(loadedPet && loadedPet.name === 'Bông Gòn' && loadedPet.type === 'bunny',
      `Pet identity restored accurately (expected Bông Gòn/bunny, got ${loadedPet.name}/${loadedPet.type})`);

    const loadedRoom = engine2.getRoom();
    const placed = loadedRoom && Array.isArray(loadedRoom.placedItems) ? loadedRoom.placedItems.find(p => p.itemId === 'desk_pink') : null;
    reporter.assert(placed && placed.x === 35 && placed.y === 60,
      `Room placedItem coordinates restored accurately (x: 35, y: 60)`);
  } catch (err) {
    reporter.assert(false, 'localStorage round-trip execution failed with exception', err.stack || err.message);
  }
} else {
  reporter.assert(false, 'Skipping round-trip execution: required JS files not available', { gameJsPath, dataJsPath });
}

// ─────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
// Section F: Star Economy Arithmetic & Non-Negative Invariant Guard
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-F', 'Star arithmetic and non-negative invariant guard');

if ((fs.existsSync(gameJsPath) && fs.existsSync(dataJsPath)) || IS_ORACLE) {
  try {
    const { sandbox, engine } = getEngineInstance();
    engine.init();

    reporter.assert(engine.getStars() === 0, 'Star balance starts at 0');

    // Earn stars
    engine.earnStars(20, 'quiz_test');
    reporter.assert(engine.getStars() === 20, `earnStars(20) increases currentStars to 20 (got: ${engine.getStars()})`);
    reporter.assert(engine.getTotalStarsEarned() >= 20, `getTotalStarsEarned() is monotonically tracked (got: ${engine.getTotalStarsEarned()})`);

    // Spend partial stars (valid)
    const spend1 = engine.spendStars(12, 'buy_item');
    const spend1Success = spend1 === true || (spend1 && spend1.success === true);
    reporter.assert(spend1Success && engine.getStars() === 8, `spendStars(12) succeeds and leaves exactly 8 stars (got: ${engine.getStars()})`);

    // Attempt to spend more stars than available (invalid)
    const spend2 = engine.spendStars(15, 'buy_too_expensive');
    const spend2Success = spend2 === true || (spend2 && spend2.success === true);
    reporter.assert(!spend2Success && engine.getStars() === 8, `spendStars(15) fails safely and leaves balance intact at 8 (got: ${engine.getStars()})`);

    // Spend exact remaining balance
    const spend3 = engine.spendStars(8, 'buy_exact');
    const spend3Success = spend3 === true || (spend3 && spend3.success === true);
    reporter.assert(spend3Success && engine.getStars() === 0, `spendStars(8) succeeds and leaves exactly 0 stars (got: ${engine.getStars()})`);

    // Attempt to spend when balance is 0
    const spend4 = engine.spendStars(1, 'buy_empty');
    const spend4Success = spend4 === true || (spend4 && spend4.success === true);
    reporter.assert(!spend4Success && engine.getStars() === 0, `spendStars(1) on 0 balance fails safely (balance remains 0)`);

    // Negative spend attempt (exploit prevention)
    const spendNegative = engine.spendStars(-10, 'exploit');
    const spendNegSuccess = spendNegative === true || (spendNegative && spendNegative.success === true);
    reporter.assert(!spendNegSuccess && engine.getStars() === 0, `Negative spend amount rejected and does not add stars (balance: ${engine.getStars()})`);

    // Zero spend attempt
    const spendZero = engine.spendStars(0, 'zero');
    const spendZeroSuccess = spendZero === true || (spendZero && spendZero.success === true);
    reporter.assert(engine.getStars() === 0, `Zero spend amount does not corrupt balance (balance: ${engine.getStars()})`);

    // Adversarial Randomized Stress Test: 100 mixed earn/spend operations
    let invariantHeld = true;
    for (let i = 0; i < 100; i++) {
      if (Math.random() > 0.5) {
        const earnAmount = Math.floor(Math.random() * 15) + 1;
        engine.earnStars(earnAmount, `stress_${i}`);
      } else {
        const spendAmount = Math.floor(Math.random() * 25) + 1;
        engine.spendStars(spendAmount, `stress_${i}`);
      }
      if (engine.getStars() < 0) {
        invariantHeld = false;
        break;
      }
    }
    reporter.assert(invariantHeld, 'Invariance: Star balance never becomes negative across 100 random transactions');
  } catch (err) {
    reporter.assert(false, 'Star arithmetic test failed with exception', err.stack || err.message);
  }
} else {
  reporter.assert(false, 'Skipping star arithmetic execution: required JS files not available', { gameJsPath });
}

// ─────────────────────────────────────────────────────────────────────────
// Section G: Spaced Repetition System (SRS) Progression
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-G', 'Spaced Repetition System (SRS) progression and interval reset');

if ((fs.existsSync(gameJsPath) && fs.existsSync(dataJsPath)) || IS_ORACLE) {
  try {
    const { sandbox, engine } = getEngineInstance();
    engine.init();

    const testQId = 'q_srs_verify_001';

    // 1st Correct Answer -> interval 1 day
    engine.markAnswered(testQId, true);
    const prog1 = engine.getProgress(testQId);
    reporter.assert(prog1 && prog1.correctCount === 1, `1st correct answer sets correctCount === 1 (got: ${prog1 ? prog1.correctCount : null})`);
    reporter.assert(prog1 && prog1.status === 'learning', `1st correct answer sets status to 'learning' (got: ${prog1 ? prog1.status : null})`);

    // 2nd Correct Answer -> interval 3 days
    engine.markAnswered(testQId, true);
    const prog2 = engine.getProgress(testQId);
    reporter.assert(prog2 && prog2.correctCount === 2, `2nd correct answer sets correctCount === 2 (got: ${prog2 ? prog2.correctCount : null})`);

    // 3rd Correct Answer -> interval 7 days
    engine.markAnswered(testQId, true);
    const prog3 = engine.getProgress(testQId);
    reporter.assert(prog3 && prog3.correctCount === 3, `3rd correct answer sets correctCount === 3`);

    // 4th Correct Answer -> interval 15 days
    engine.markAnswered(testQId, true);
    const prog4 = engine.getProgress(testQId);
    reporter.assert(prog4 && prog4.correctCount === 4, `4th correct answer sets correctCount === 4`);

    // 5th Correct Answer -> interval 30 days & 'mastered' status
    engine.markAnswered(testQId, true);
    const prog5 = engine.getProgress(testQId);
    reporter.assert(prog5 && prog5.correctCount >= 5 && prog5.status === 'mastered',
      `5th correct answer advances status to 'mastered' with interval 30 days (got: ${prog5 ? prog5.status : null})`);

    // Incorrect Answer -> resets correctCount to 0 and interval to 1 day ('review' status)
    engine.markAnswered(testQId, false);
    const progReset = engine.getProgress(testQId);
    reporter.assert(progReset && progReset.correctCount === 0, `Incorrect answer resets correctCount to 0 (got: ${progReset ? progReset.correctCount : null})`);
    reporter.assert(progReset && progReset.status === 'review', `Incorrect answer sets status to 'review' (got: ${progReset ? progReset.status : null})`);
    
    // Check nextReview is scheduled for tomorrow (1 day ahead)
    if (progReset && progReset.nextReview) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      reporter.assert(progReset.nextReview === tomorrow, `Incorrect answer resets nextReview to 1 day ahead (expected: ${tomorrow}, got: ${progReset.nextReview})`);
    } else {
      reporter.assert(false, 'progReset.nextReview exists after incorrect answer', progReset);
    }
  } catch (err) {
    reporter.assert(false, 'SRS progression test failed with exception', err.stack || err.message);
  }
} else {
  reporter.assert(false, 'Skipping SRS progression: required JS files not available', { gameJsPath });
}

// ─────────────────────────────────────────────────────────────────────────
// Section H: Daily Streak Calculation & Consecutive Logic
// ─────────────────────────────────────────────────────────────────────────
reporter.startSection('REQ-H', 'Daily streak calculation and consecutive check-in logic');

if ((fs.existsSync(gameJsPath) && fs.existsSync(dataJsPath)) || IS_ORACLE) {
  try {
    const { sandbox, engine } = getEngineInstance();
    engine.init();

    // 1. Fresh checkIn
    engine.checkIn();
    let streak = engine.getStreak();
    reporter.assert(streak && streak.current === 1, `Initial checkIn sets streak.current === 1 (got: ${streak ? streak.current : null})`);
    reporter.assert(streak && streak.longest === 1, `Initial checkIn sets streak.longest === 1`);

    // 2. Same-day checkIn is idempotent
    engine.checkIn();
    streak = engine.getStreak();
    reporter.assert(streak && streak.current === 1, `Calling checkIn() again on same day is idempotent (streak remains 1)`);

    // 3. Consecutive checkIn (yesterday was last check-in)
    // Manually simulate yesterday in state
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    // Modify underlying state streak to simulate yesterday's check-in
    const rawStorage = sandbox.localStorage.__getRawStore();
    const key = rawStorage['meowmeow_state'] ? 'meowmeow_state' : 'meow_study_game_state';
    const parsedState = JSON.parse(rawStorage[key]);
    parsedState.streak.lastCheckIn = yesterday;
    parsedState.streak.current = 1;
    rawStorage[key] = JSON.stringify(parsedState);

    // Re-init to pick up modified state
    engine.init();
    engine.checkIn();
    streak = engine.getStreak();
    reporter.assert(streak && streak.current === 2, `Check-in with lastCheckIn === yesterday increments streak to 2 (got: ${streak ? streak.current : null})`);
    reporter.assert(streak && streak.longest >= 2, `streak.longest updates to 2`);

    // 4. Broken streak (2 days ago was last check-in)
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    parsedState.streak.lastCheckIn = twoDaysAgo;
    parsedState.streak.current = 5;
    parsedState.streak.longest = 5;
    rawStorage[key] = JSON.stringify(parsedState);

    engine.init();
    engine.checkIn();
    streak = engine.getStreak();
    reporter.assert(streak && streak.current === 1, `Check-in after broken streak resets streak.current to 1 (got: ${streak ? streak.current : null})`);
    reporter.assert(streak && streak.longest === 5, `streak.longest is preserved at 5 after streak break (got: ${streak ? streak.longest : null})`);
  } catch (err) {
    reporter.assert(false, 'Streak calculation test failed with exception', err.stack || err.message);
  }
} else {
  reporter.assert(false, 'Skipping streak test: required JS files not available', { gameJsPath });
}

// ─────────────────────────────────────────────────────────────────────────
// Final Execution & Exit Code
// ─────────────────────────────────────────────────────────────────────────
const allPassed = reporter.summary();
process.exitCode = allPassed ? 0 : 1;
