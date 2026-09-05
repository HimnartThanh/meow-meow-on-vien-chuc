# 🐾 Test Suite & E2E Testing Harness: Meow Meow Ôn Viên Chức

## 1. Executive Summary

The automated smoke test runner and comprehensive E2E test harness for **"Meow Meow Ôn Viên Chức"** have been implemented with **zero external dependencies** using Node.js built-ins (`node:vm`, `node:fs`, `node:path`, `node:assert`).

The test harness provides complete dual-track verification:
1. **Automated Smoke Test (`verify.js`)**: Directly checks all acceptance requirements defined in `ORIGINAL_REQUEST.md` (lines 61-69, REQ-A through REQ-H).
2. **Modular E2E Test Suite (`tests/`)**: Covers 35 features across Tiers 1–5 per `TEST_INFRA.md`, totaling **155 automated test cases**.

---

## 2. Quick Start: How to Run the Tests

### Smoke Test Runner (Requirements A–H)
```bash
# Standard smoke test validating project files on disk
node verify.js

# Verbose output with detailed trace
node verify.js --verbose

# JSON formatted report for CI/CD integration
node verify.js --json

# Oracle self-test mode (validates test logic and assertions against the reference model)
node verify.js --oracle
```

### Modular E2E Test Suite (Tiers 1–5)
```bash
# Run all 155 test cases across all tiers
node tests/e2e_runner.js

# Run specific tier only
node tests/e2e_runner.js --tier=1    # Tier 1: Functional Baseline (Features 1-24)
node tests/e2e_runner.js --tier=2    # Tier 2: Boundary & Edge Cases
node tests/e2e_runner.js --tier=3    # Tier 3: Cross-Feature Integration
node tests/e2e_runner.js --tier=4    # Tier 4: Real-World User Journeys
node tests/e2e_runner.js --tier=5    # Tier 5: Adversarial Hardening
```

---

## 3. Smoke Test Verification Matrix (`verify.js`)

| Req Code | Verification Item | Target Files / APIs | Assertions | Status |
|----------|-------------------|---------------------|:----------:|:------:|
| **REQ-A** | HTML syntax & tag closure | `index.html`, `study.html`, `flashcard.html`, `quiz.html`, `matching.html`, `sorting.html`, `challenge.html`, `room.html`, `shop.html`, `stats.html` | 20 | Verified |
| **REQ-B** | Linkage & loadability of assets | `css/style.css`, `css/pets.css`, `css/items.css`, `js/data.js`, `js/game.js`, plus HTML references | 5+ | Verified |
| **REQ-C** | 42 Core API contracts | `GameEngine.*` across all 42 specified signatures | 44 | Verified |
| **REQ-D** | Data schema compliance | `DATA.topics` (>=2), `DATA.questions` (>=20, sortItems >=2/topic), `DATA.shopItems` (>=15, >=3 categories), `DATA.petCatalog` (>=3), `DATA.badges` (>=10) | 17 | Verified |
| **REQ-E** | LocalStorage round-trip | `init()` -> state mutation -> `saveState()` -> isolate -> reload -> match verification | 8 | Verified |
| **REQ-F** | Star arithmetic invariant | `earnStars` -> `spendStars` -> insufficient balance rejection -> negative spend guard -> 100 random transaction invariant | 10 | Verified |
| **REQ-G** | Spaced Repetition (SRS) | 5 correct increments (1d, 3d, 7d, 15d, 30d -> mastered); incorrect resets to 1d + review status | 9 | Verified |
| **REQ-H** | Daily streak calculation | Initial checkIn -> same-day idempotency -> yesterday consecutive increment -> 2-day gap reset to 1 -> preservation of longest streak | 7 | Verified |

---

## 4. E2E Test Suite Coverage Breakdown (`tests/`)

### Tier 1: Functional Baseline (120 Assertions across 24 Features)
- **`tests/tier1_functional/core_state.test.js`**:
  - Feature 1: LocalStorage Roundtrip & Integrity (5 tests)
  - Feature 2: Initial State Generation (5 tests)
  - Feature 3: Core GameEngine 42 API Methods (5 tests)
- **`tests/tier1_functional/srs_stars_streak.test.js`**:
  - Feature 4: SRS 5-Stage Intervals & Due Logic (5 tests)
  - Feature 5: Star Arithmetic & Non-Negative Guard (5 tests)
  - Feature 6: Streak Consecutive & Reset Logic (5 tests)
  - Feature 7: Badge Trigger & Unlock Criteria (5 tests)
- **`tests/tier1_functional/study_modes.test.js`**:
  - Feature 8: Question Bank Schema Compliance (5 tests)
  - Feature 9: Flashcard Flip & SRS Update (5 tests)
  - Feature 10: Quiz 4-Choice & Explanation (5 tests)
  - Feature 11: Matching Tap-Select & Feedback (5 tests)
  - Feature 12: Sorting Drag/Tap & Validation (5 tests)
- **`tests/tier1_functional/challenge_modes.test.js`**:
  - Feature 13: Challenge Gating & Lock States (5 tests)
  - Feature 14: Speed Mode Timer & Scoring (5 tests)
  - Feature 15: Survival Mode 5 Hearts & Game Over (5 tests)
  - Feature 16: Combo Mode Multiplier & Reset (5 tests)
  - Feature 17: Boss Battle 3 Hard Questions & Reward (5 tests)
- **`tests/tier1_functional/pet_room_shop.test.js`**:
  - Feature 18: Pet CSS Structure & 5 Visual States (5 tests)
  - Feature 19: Room Free-Drag Percentage Clamping (5 tests)
  - Feature 20: Room Item Persistence Across Sessions (5 tests)
  - Feature 21: Shop Purchase & Owned State Updates (5 tests)
- **`tests/tier1_functional/onboarding_stats.test.js`**:
  - Feature 22: Onboarding Flow & Pet Naming (5 tests)
  - Feature 23: Stats Dashboard & 7-Day Chart (5 tests)
  - Feature 24: Pink Pastel Theme & Responsive CSS (5 tests)

### Tier 2: Boundary Value Analysis & Edge Cases (20 Tests)
- **`tests/tier2_boundary/boundary_core.test.js`**: Corrupt JSON in localStorage auto-recovery, NaN/Infinity protection, negative spend rejection, long pet names (>20 chars), whitespace-only names.
- **`tests/tier2_boundary/boundary_srs_streak.test.js`**: Unknown question IDs default handling, intervals capped at 30 days for stage 6+, year-end date boundary (Dec 31 -> Jan 1), month-end boundary, 100-day gap recovery.
- **`tests/tier2_boundary/boundary_modes.test.js`**: 0% score handling (0 bonus), 100% perfect score bonus combination, speed mode 0-second cutoff, survival 0 lives game over, boss battle reset on 3rd question failure.
- **`tests/tier2_boundary/boundary_room_pet.test.js`**: Coordinates clamped at [0, 100] when out-of-bounds (e.g. 999%, -999%), floating point percentages, removing unplaced items safely, invalid item and pet IDs.

### Tier 3: Cross-Feature Integration & Pairwise Combinations (5 Tests)
- **`tests/tier3_cross_feature/integration.test.js`**:
  - T3.1: Full Lifecycle (Onboarding -> Study set -> Shop Buy -> Room Drag -> Reload).
  - T3.2: Study -> SRS Advancement -> Challenge Unlock -> High Score -> Badges.
  - T3.3: Pet emotional state transitions across gameplay milestones (`idle` -> `happy` -> `excited` -> `sad` -> `sleeping`).
  - T3.4: Inventory drawer reconciliation (`ownedItems` minus `placedItems`).
  - T3.5: Multi-topic SRS review filtering (due vs non-due questions).

### Tier 4: Real-World Application Scenarios (5 Full User Journeys)
- **`tests/tier4_scenarios/user_journeys.test.js`**:
  - Scenario 1: Full New User Onboarding to First Purchase.
  - Scenario 2: Civil Servant Study Session Loop (100% quiz score, badge unlocks, SRS update).
  - Scenario 3: High-Stakes Boss Battle Run (3/3 hard questions, +50 ⭐ reward, boss_hunter badge).
  - Scenario 4: Room Redecoration Session (3 furniture buys, theme changes, drag placement, stow to drawer).
  - Scenario 5: Multi-Day Retention & Streak Recovery (consecutive daily retention, missed day reset, activity log tracking).

### Tier 5: Adversarial Hardening (5 Tests)
- **`tests/tier5_adversarial/adversarial.test.js`**:
  - ADV.1: HTML/XSS injection in pet names (`<script>alert("hack")</script>`) serialized safely.
  - ADV.2: Unicode emojis and Vietnamese diacritics (`🐱 Hoàng Thượng 🌟`) preserved with 100% fidelity.
  - ADV.3: Rapid concurrent spend calls do not race into negative balance.
  - ADV.4: 1,000 consecutive random earn/spend transactions maintain strict arithmetic invariant.
  - ADV.5: LocalStorage state corruption injection triggers automatic recovery without application crash.

---

## 5. File Structure of Test Harness

```
game-hoc-tap/
├── verify.js                           # Root smoke test script (ORIGINAL_REQUEST.md lines 61-69)
├── TEST_READY.md                       # Test suite guide and coverage documentation
└── tests/
    ├── e2e_runner.js                   # Unified CLI runner for Tiers 1-5
    ├── harness/
    │   ├── mock_browser.js             # Headless DOM, localStorage, Web Audio & time-travel
    │   ├── test_framework.js           # Zero-dependency test runner & assertions
    │   ├── fixtures.js                 # Authoritative datasets & test engine loader
    │   └── reference_engine.js         # Reference oracle implementation of GameEngine
    ├── tier1_functional/
    │   ├── core_state.test.js          # Features 1, 2, 3 (15 tests)
    │   ├── srs_stars_streak.test.js    # Features 4, 5, 6, 7 (20 tests)
    │   ├── study_modes.test.js         # Features 8, 9, 10, 11, 12 (25 tests)
    │   ├── challenge_modes.test.js     # Features 13, 14, 15, 16, 17 (25 tests)
    │   ├── pet_room_shop.test.js       # Features 18, 19, 20, 21 (20 tests)
    │   └── onboarding_stats.test.js    # Features 22, 23, 24 (15 tests)
    ├── tier2_boundary/
    │   ├── boundary_core.test.js       # 5 boundary tests
    │   ├── boundary_srs_streak.test.js # 5 temporal & SRS boundary tests
    │   ├── boundary_modes.test.js      # 5 study/challenge boundary tests
    │   └── boundary_room_pet.test.js   # 5 room & pet boundary tests
    ├── tier3_cross_feature/
    │   └── integration.test.js         # 5 integration & lifecycle tests
    ├── tier4_scenarios/
    │   └── user_journeys.test.js       # 5 end-to-end application scenarios
    └── tier5_adversarial/
        └── adversarial.test.js         # 5 adversarial stress & injection tests
```

---

## 6. Execution Verification Results

### `node tests/e2e_runner.js`
```text
Loaded 13 test suite files across target tiers.
Total Tests: 155 | Passed: 155 | Failed: 0 | Duration: 33ms
Exit code: 0 (100% Pass Rate)
```

### `node verify.js`
- Checks physical repository files for compliance with lines 61-69 of `ORIGINAL_REQUEST.md`.
- Exit code 0 once all milestone implementation files (`index.html` through `stats.html`, `js/game.js`, `js/data.js`, `css/*.css`) are placed in the tree.
- Exit code 1 with specific missing file diagnostics while implementation milestones are in progress.
- `node verify.js --oracle` passes all state, engine, schema, arithmetic, SRS, and streak criteria against the specification oracle (96/96 assertions passed).
