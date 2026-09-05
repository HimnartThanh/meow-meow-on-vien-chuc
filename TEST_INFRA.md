# E2E Test Infra: Meow Meow Ôn Viên Chức

## Test Philosophy
- Opaque-box, requirement-driven, zero external dependencies (Node.js built-in runtime / browser environment).
- Complete coverage of all 35 features across 4 tiers of test cases.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinations + Real-World Workload Scenarios.

## Feature Inventory & Test Mapping
| # | Feature | Requirement Source | Tier 1 (Count) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) |
|---|---------|-------------------|:--------------:|:-----------------:|:---------------------:|
| 1 | LocalStorage Roundtrip & Integrity | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 2 | Initial State Generation | GAME_STATE.md §1 | 5 | 5 | ✓ |
| 3 | Core GameEngine 42 API Methods | AGENT_BRIEF.md §2 | 5 | 5 | ✓ |
| 4 | SRS 5-Stage Intervals & Due Logic | GAME_STATE.md §7 | 5 | 5 | ✓ |
| 5 | Star Arithmetic & Non-Negative Guard | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 6 | Streak Consecutive & Reset Logic | GAME_STATE.md §4 | 5 | 5 | ✓ |
| 7 | Badge Trigger & Unlock Criteria | GAME_STATE.md §6 | 5 | 5 | ✓ |
| 8 | Question Bank Schema Compliance | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 9 | Flashcard Flip & SRS Update | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 10 | Quiz 4-Choice & Explanation | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 11 | Matching Tap-Select & Feedback | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 12 | Sorting Drag/Tap & Validation | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 13 | Challenge Gating & Lock States | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 14 | Speed Mode Timer & Scoring | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 15 | Survival Mode 5 Hearts & Game Over | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 16 | Combo Mode Multiplier & Reset | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 17 | Boss Battle 3 Hard Questions & Reward | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 18 | Pet CSS Structure & 5 Visual States | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |
| 19 | Room Free-Drag Percentage Clamping | ORIGINAL_REQUEST R5 | 5 | 5 | ✓ |
| 20 | Room Item Persistence Across Sessions | ORIGINAL_REQUEST R5 | 5 | 5 | ✓ |
| 21 | Shop Purchase & Owned State Updates | ORIGINAL_REQUEST R5 | 5 | 5 | ✓ |
| 22 | Onboarding Flow & Pet Naming | ORIGINAL_REQUEST R6 | 5 | 5 | ✓ |
| 23 | Stats Dashboard & 7-Day Chart | ORIGINAL_REQUEST R6 | 5 | 5 | ✓ |
| 24 | Pink Pastel Theme & Responsive CSS | ORIGINAL_REQUEST R7 | 5 | 5 | ✓ |

## Test Architecture
- **Smoke Test Runner (`verify.js`)**:
  - Validates all 10 HTML files for syntax, non-empty tags, script/stylesheet linkage.
  - Validates `js/data.js` for schema correctness, minimum question counts per topic, sortItems existence, shop catalog.
  - Validates `js/game.js` method existence, state roundtrip in mock localStorage, star balance guards.
- **Automated E2E Suite (`tests/e2e_runner.js`)**:
  - Exercises full headless simulated user journeys:
    1. New player -> Onboarding -> Pet selected -> Initial stars granted.
    2. Study set completed -> Challenge unlocked -> Speed / Survival played -> High score recorded.
    3. Stars earned -> Shop item bought -> Room placed -> Coordinates verified.
    4. SRS incorrect answer -> stage reset -> review date = tomorrow.
- **Pass/Fail Criteria**:
  - Exit code 0, all assertions pass, zero exceptions.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full New User Onboarding to First Purchase | Onboarding, Study Flashcard, Star Earn, Shop Buy, Room Drag | High |
| 2 | Civil Servant Study Session Loop | Topic Select, 5 Quizzes (100%), Badge Unlock, SRS Advancement | High |
| 3 | High-Stakes Boss Battle Run | Challenge Unlock, Daily Boss Seed, 3/3 Correct Answers, 50 ⭐ Reward | High |
| 4 | Room Redecoration Session | Multiple Furniture Buys, Clamped Placement, Removal to Inventory | Medium |
| 5 | Multi-Day Retention & Streak Recovery | Streak Check, Due SRS Questions Review, Activity Log Tracking | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (boundary conditions, overflow, negative values, empty strings)
- Tier 3: Pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
- Tier 5: Adversarial edge cases and coverage hardening
