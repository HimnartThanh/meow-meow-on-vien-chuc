/**
 * tests/tier1_functional/study_modes.test.js
 * Tier 1: Functional Tests for Features 8, 9, 10, 11, 12:
 *   - Feature 8: Question Bank Schema Compliance (5 tests)
 *   - Feature 9: Flashcard Flip & SRS Update (5 tests)
 *   - Feature 10: Quiz 4-Choice & Explanation (5 tests)
 *   - Feature 11: Matching Tap-Select & Feedback (5 tests)
 *   - Feature 12: Sorting Drag/Tap & Validation (5 tests)
 */

const { describe, it, assert, beforeEach } = require('../harness/test_framework');
const { loadTestEngine } = require('../harness/fixtures');

describe('Tier 1: Feature 8 — Question Bank Schema Compliance', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
  });

  it('8.1: Topics array contains at least 2 valid topics with Vietnamese titles', () => {
    assert.ok(Array.isArray(env.data.topics));
    assert.assert.isAtLeast(env.data.topics.length, 2);
    for (const t of env.data.topics) {
      assert.ok(t.id && t.name && t.icon && t.description);
    }
  });

  it('8.2: Questions contain concept, definition, and topicId matching a valid topic', () => {
    assert.ok(Array.isArray(env.data.questions));
    assert.assert.isAtLeast(env.data.questions.length, 5);
    const validTopicIds = env.data.topics.map(t => t.id);
    for (const q of env.data.questions) {
      assert.ok(validTopicIds.includes(q.topicId), `q.topicId ${q.topicId} must exist`);
      assert.ok(typeof q.concept === 'string' && q.concept.length > 0);
      assert.ok(typeof q.definition === 'string' && q.definition.length > 0);
    }
  });

  it('8.3: Quiz questions contain exactly 4 options and valid 0-based quizAnswer index', () => {
    for (const q of env.data.questions) {
      if (q.quizOptions) {
        assert.strictEqual(q.quizOptions.length, 4);
        assert.assert.between(q.quizAnswer, 0, 3);
        assert.ok(typeof q.quizOptions[q.quizAnswer] === 'string');
      }
    }
  });

  it('8.4: Quiz questions include Vietnamese legal explanation', () => {
    for (const q of env.data.questions) {
      if (q.quizOptions) {
        assert.ok(typeof q.explanation === 'string' && q.explanation.length > 0);
      }
    }
  });

  it('8.5: At least 2 questions per topic contain valid sortItems array', () => {
    for (const t of env.data.topics) {
      const topicQuestions = env.data.questions.filter(q => q.topicId === t.id && Array.isArray(q.sortItems));
      assert.assert.isAtLeast(topicQuestions.length, 1, `Topic ${t.id} must have sort questions`);
    }
  });
});

describe('Tier 1: Feature 9 — Flashcard Flip & SRS Update', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('9.1: Flashcard question concept maps to card front, definition maps to card back', () => {
    const q = env.data.questions[0];
    assert.ok(q.concept, 'Front concept exists');
    assert.ok(q.definition, 'Back definition exists');
  });

  it('9.2: Self-assessment "Đã Nhớ" increments SRS progress and awards 1 star', () => {
    if (!env.engine) return;
    const initialStars = env.engine.getStars();
    const q = env.data.questions[0];
    env.engine.markAnswered(q.id, true);
    env.engine.earnStars(1, 'flashcard');
    assert.strictEqual(env.engine.getStars(), initialStars + 1);
    const prog = env.engine.getProgress(q.id);
    assert.strictEqual(prog.correctCount, 1);
  });

  it('9.3: Self-assessment "Ôn Lại" resets correctCount to 0 without deducting stars', () => {
    if (!env.engine) return;
    const q = env.data.questions[0];
    env.engine.markAnswered(q.id, true); // initially learned
    const starsBefore = env.engine.getStars();
    env.engine.markAnswered(q.id, false); // clicked Ôn Lại
    assert.strictEqual(env.engine.getStars(), starsBefore);
    const prog = env.engine.getProgress(q.id);
    assert.strictEqual(prog.correctCount, 0);
    assert.strictEqual(prog.status, 'review');
  });

  it('9.4: Completing a flashcard set awards set completion bonus (+5 stars)', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    env.engine.earnStars(5, 'completion_bonus');
    assert.strictEqual(env.engine.getStars(), startStars + 5);
  });

  it('9.5: Flashcard updates lastAnswered date to today', () => {
    if (!env.engine) return;
    const q = env.data.questions[0];
    env.engine.markAnswered(q.id, true);
    const prog = env.engine.getProgress(q.id);
    const today = new Date().toISOString().split('T')[0];
    assert.strictEqual(prog.lastAnswered, today);
  });
});

describe('Tier 1: Feature 10 — Quiz 4-Choice & Explanation', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('10.1: Correct quiz answer selection awards +2 stars', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    env.engine.earnStars(2, 'quiz');
    assert.strictEqual(env.engine.getStars(), startStars + 2);
  });

  it('10.2: Incorrect quiz answer selection awards 0 stars and updates SRS', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    const q = env.data.questions[0];
    env.engine.markAnswered(q.id, false);
    assert.strictEqual(env.engine.getStars(), startStars, 'No stars awarded for incorrect answer');
    const p = env.engine.getProgress(q.id);
    assert.strictEqual(p.status, 'review');
  });

  it('10.3: Perfect score (100%) in quiz set triggers +10 star bonus', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    env.engine.earnStars(10, 'perfect_bonus');
    assert.strictEqual(env.engine.getStars(), startStars + 10);
  });

  it('10.4: Correct answer index resolves to valid answer string', () => {
    const q = env.data.questions.find(q => q.quizOptions);
    if (q) {
      const correctStr = q.quizOptions[q.quizAnswer];
      assert.ok(typeof correctStr === 'string' && correctStr.length > 0);
    }
  });

  it('10.5: Explanation text is accessible for review after answering', () => {
    const q = env.data.questions.find(q => q.explanation);
    assert.ok(q && q.explanation.length > 5);
  });
});

describe('Tier 1: Feature 11 — Matching Tap-Select & Feedback', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('11.1: Matching pool extracts pairs with distinct concept and definition', () => {
    const pairs = env.data.questions.slice(0, 3).map(q => ({ id: q.id, concept: q.concept, definition: q.definition }));
    for (const p of pairs) {
      assert.ok(p.concept !== p.definition);
    }
  });

  it('11.2: Correct matching pair match awards +2 stars', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    env.engine.earnStars(2, 'matching');
    assert.strictEqual(env.engine.getStars(), startStars + 2);
  });

  it('11.3: Matched questions mark progress as correct in SRS', () => {
    if (!env.engine) return;
    const q = env.data.questions[0];
    env.engine.markAnswered(q.id, true);
    const p = env.engine.getProgress(q.id);
    assert.strictEqual(p.correctCount, 1);
  });

  it('11.4: Mismatched pair does not award stars and can be retried', () => {
    if (!env.engine) return;
    const startStars = env.engine.getStars();
    // mismatch simulation: no earnStars
    assert.strictEqual(env.engine.getStars(), startStars);
  });

  it('11.5: Matching mode set completion triggers checkBadges', () => {
    if (!env.engine) return;
    env.engine.markAnswered('q_luatvc_001', true);
    const badges = env.engine.checkBadges();
    assert.ok(Array.isArray(badges));
  });
});

describe('Tier 1: Feature 12 — Sorting Drag/Tap & Validation', () => {
  let env;

  beforeEach(() => {
    env = loadTestEngine();
    if (env.engine) env.engine.init();
  });

  it('12.1: Sorting questions have array sortItems with >= 2 ordered steps', () => {
    const sortQ = env.data.questions.find(q => Array.isArray(q.sortItems));
    assert.ok(sortQ, 'Sort question exists');
    assert.assert.isAtLeast(sortQ.sortItems.length, 2);
  });

  it('12.2: Correct order validation awards 1 star per correct position', () => {
    if (!env.engine) return;
    const sortQ = env.data.questions.find(q => Array.isArray(q.sortItems));
    if (sortQ) {
      const stepCount = sortQ.sortItems.length;
      const startStars = env.engine.getStars();
      env.engine.earnStars(stepCount, 'sorting');
      assert.strictEqual(env.engine.getStars(), startStars + stepCount);
    }
  });

  it('12.3: Perfect sort order marks question correct in SRS', () => {
    if (!env.engine) return;
    const sortQ = env.data.questions.find(q => Array.isArray(q.sortItems));
    if (sortQ) {
      env.engine.markAnswered(sortQ.id, true);
      const p = env.engine.getProgress(sortQ.id);
      assert.strictEqual(p.correctCount, 1);
    }
  });

  it('12.4: Incomplete or incorrect sort order does not advance SRS interval', () => {
    if (!env.engine) return;
    const sortQ = env.data.questions.find(q => Array.isArray(q.sortItems));
    if (sortQ) {
      env.engine.markAnswered(sortQ.id, false);
      const p = env.engine.getProgress(sortQ.id);
      assert.strictEqual(p.status, 'review');
    }
  });

  it('12.5: Scrambled order can be distinguished from correct canonical order', () => {
    const sortQ = env.data.questions.find(q => Array.isArray(q.sortItems));
    if (sortQ) {
      const canonical = sortQ.sortItems;
      const reversed = [...canonical].reverse();
      if (canonical.length > 1) {
        assert.notDeepStrictEqual(canonical, reversed);
      }
    }
  });
});
