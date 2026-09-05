# Project: Meow Meow Ôn Viên Chức

## Architecture
"Meow Meow Ôn Viên Chức" is a client-side gamified study web application for Vietnamese civil servant exam preparation. The app has zero external dependencies, operates completely offline after initial load, and uses pure vanilla JavaScript, modern CSS, and HTML5.

### Module Boundaries & Data Flow
1. **Data Layer (`js/data.js`)**:
   - Holds the static question bank (`DATA.topics`, `DATA.questions`), shop catalog (`DATA.shopItems`), pet definitions (`DATA.petCatalog`), and badges (`DATA.badges`).
   - Pure declarative data object, no logic.
2. **Core Engine Layer (`js/game.js`)**:
   - `GameEngine` singleton exposed globally as `window.GameEngine`.
   - Manages single persistent state object in `localStorage` under authoritative key `meowmeow_state` (with `meow_study_game_state` alias).
   - Manages Spaced Repetition System (SRS) using Ebbinghaus intervals `[1, 3, 7, 15, 30]` days.
   - Enforces star economy invariants (`currentStars >= 0`, monotonic `totalStarsEarned`).
   - Manages pet states (`idle`, `happy`, `sad`, `excited`, `sleeping`), daily streaks, inventory, and challenge records.
   - Synthesizes audio using Web Audio API (`AudioContext`).
3. **Presentation & Interaction Layer**:
   - `index.html` + `js/main.js`: Main hub, onboarding modal (first-time pet selection & naming), pet HUD, navigation.
   - `study.html` + `js/study.js`: Topic selection, SRS due review counters, mode picker.
   - `flashcard.html`: 3D card flip, self-assessment, queue management, SRS update.
   - `quiz.html`: 4-choice quiz, immediate green/red feedback, explanation banner, perfect score bonus.
   - `matching.html`: 2-column concept-definition matching, tap selection, shake on error.
   - `sorting.html`: Chronological/procedural drag/tap ordering, validation, step rewards.
   - `challenge.html` + `js/challenge.js`: 4 challenge modes (Speed 60s, Survival 5 lives, Combo multiplier, Boss battle 3 HP), unlock gating.
   - `room.html` + `js/room.js`: Free-drag room decoration with percentage coordinates, boundary clamping, inventory drawer, pet placement.
   - `shop.html` + `js/shop.js`: Furniture/wallpaper/pet catalog, category tabs, star purchase validation, owned indicators.
   - `stats.html` + `js/stats.js`: Streak counter, mastery progress bars, badges grid, 7-day activity chart.
4. **Styling & Visual Layer**:
   - `css/style.css`: Cute pink pastel design tokens, typography (`Nunito`), cards, buttons, modals, navigation.
   - `css/pets.css`: Pure CSS pets (Cat, Bunny, Bear, Duck, Hamster) and 5 animation states (`idle`, `happy`, `sad`, `excited`, `sleeping`).
   - `css/items.css`: Room canvas, furniture CSS shapes/sprites, inventory drawer.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | LocalStorage Persistence | Single-key state persistence (`meowmeow_state`) with schema validation & round-trip safety | M1 | GAME_STATE.md / Spec Miner 1 |
| 2 | Initial State Factory | Generates default state on first launch with default pet, room, and starter stars | M1 | GAME_STATE.md / Spec Miner 1 |
| 3 | Core API Contracts | 42 API methods on `GameEngine` across all lifecycle, stars, pet, room, SRS, and stats | M1 | AGENT_BRIEF.md / Spec Miner 1 |
| 4 | Spaced Repetition (SRS) | 5-stage mastery model, Ebbinghaus intervals [1, 3, 7, 15, 30] days, due review queries | M1 | GAME_STATE.md / Spec Miner 1 |
| 5 | Star Economy Invariants | Base rewards, spending validation (`currentStars >= amount`), non-negative guard | M1 | ORIGINAL_REQUEST R1 / Spec Miner 1 |
| 6 | Daily Streak System | ISO date comparison, consecutive tracking, daily check-in trigger | M1 | GAME_STATE.md / Spec Miner 1 |
| 7 | Badge Tracking System | 10 badges with programmatic unlock criteria and toast notifications | M1 | GAME_STATE.md / Spec Miner 1 |
| 8 | Web Audio Synthesizer | Zero-asset Web Audio API sound synthesis (tap, correct, wrong, star, victory) with mute toggle | M1 | Spec Miner 3 |
| 9 | Question Bank Data | Structured topics and questions (concept, definition, quizOptions, quizAnswer, explanation, sortItems) | M1 | ORIGINAL_REQUEST R2 / Spec Miner 1 |
| 10 | Catalog Data | 20+ shop items across 6 categories, 5 pet definitions | M1 | GAME_STATE.md / Spec Miner 1 |
| 11 | Flashcard Study Mode | 3D card flip, front/back, "Đã Nhớ" / "Ôn Lại" self-assessment, SRS update, +1 ⭐ | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 12 | Quiz Study Mode | 4 multiple-choice options, instant feedback, explanation banner, +2 ⭐, perfect bonus +10 ⭐ | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 13 | Matching Study Mode | 2-column tap-to-select concept/definition pairs, visual glow, error shake, +2 ⭐ | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 14 | Sorting Study Mode | Reordering scrambled steps into numbered slots, validation, step rewards, +1 ⭐ | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 15 | Topic Selection Hub | Topic cards, SRS mastery counts (New, Learning, Review, Mastered), review today priority | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 16 | Challenge Unlock Gating | Challenge hub locked until completing >= 1 study set, lock overlay, unlock toast | M2 | ORIGINAL_REQUEST R3 / Spec Miner 2 |
| 17 | Speed Challenge Mode | 60s countdown timer, rapid-fire questions, high score persistence, 2x star bonus | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 18 | Survival Challenge Mode | 5 hearts (lives), life loss on wrong answer, game over on 0 lives, 3x star bonus | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 19 | Combo Challenge Mode | Streak multiplier meter (1x to 5x), reset on wrong answer, high score tracking | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 20 | Boss Battle Challenge Mode | Daily seeded boss (3 HP), 3 hard questions, must get 3/3 right, +50 ⭐ victory reward | M2 | GAMEPLAY_GUIDE / Spec Miner 2 |
| 21 | Pure CSS Pet System | 5 pets (Cat, Bunny, Bear, Duck, Hamster), pure CSS shapes, zero raster image dependencies | M3 | ORIGINAL_REQUEST R4 / Spec Miner 3 |
| 22 | 5 Pet Animation States | CSS keyframes for `idle`, `happy`, `sad`, `excited`, `sleeping` with auto-idle timeouts | M3 | AGENT_BRIEF / Spec Miner 3 |
| 23 | Free-Drag Room Canvas | Percentage-based free drag (`x: %, y: %`), Pointer Events (mouse & touch), boundary clamping | M3 | ORIGINAL_REQUEST R5 / Spec Miner 3 |
| 24 | Room State Persistence | Save placed furniture items (itemId, x, y) to localStorage, persist across reloads | M3 | ORIGINAL_REQUEST R5 / Spec Miner 3 |
| 25 | Inventory Drawer | Drawer UI for purchased unplaced items, drag to room, hold/click to stow back | M3 | GAMEPLAY_GUIDE / Spec Miner 3 |
| 26 | Shop System | Category filtering (furniture, lighting, plant, wall, wallpaper, floor, pets), star balance check | M3 | GAMEPLAY_GUIDE / Spec Miner 3 |
| 27 | First-time Onboarding | First-launch detection, pet selector carousel, pet naming input, validation, start game | M4 | ORIGINAL_REQUEST R6 / Spec Miner 3 |
| 28 | Main Menu Hub | Pet avatar HUD, star/streak display, navigation cards to Study, Challenge, Room, Shop, Stats | M4 | GAMEPLAY_GUIDE / Spec Miner 3 |
| 29 | Pet Interaction in Menu | Tap pet in menu for heart emote, sound effect, and greeting quote | M4 | GAMEPLAY_GUIDE / Spec Miner 3 |
| 30 | Stats Dashboard | Streak count, total stars, per-topic progress bars, 10 badges grid (unlocked vs locked) | M4 | ORIGINAL_REQUEST R6 / Spec Miner 3 |
| 31 | 7-Day Activity Chart | Visual CSS bar chart showing questions answered per day over past 7 days | M4 | ORIGINAL_REQUEST R6 / Spec Miner 3 |
| 32 | Pink Pastel Theme & Polish | Consistent CSS design tokens, Nunito font, responsive layout (375px - 1200px), 100% Vietnamese copy | M4 | ORIGINAL_REQUEST R7 / Spec Miner 3 |
| 33 | Automated Smoke Test | `verify.js` validating all HTML tags, script references, API contract, state round-trip, star logic | M5 | ORIGINAL_REQUEST Verification |
| 34 | E2E Regression Suite | Comprehensive opaque-box test runner covering Tiers 1-4 with 100% pass rate | M5 | Project Pattern Dual Track |
| 35 | Manual Browser Verification | Independent reviewer verifying end-to-end user journeys in browser environment | M5 | ORIGINAL_REQUEST Manual Test |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Engine & Data Bank | `js/game.js`, `js/data.js`, audio synthesizer, core state tests | none | IN_PROGRESS |
| M2 | Study & Challenge Modes | `study.html`, `flashcard.html`, `quiz.html`, `matching.html`, `sorting.html`, `challenge.html`, `js/study.js`, `js/challenge.js` | M1 | PLANNED |
| M3 | Pet System, Room & Shop | `css/pets.css`, `css/items.css`, `room.html`, `shop.html`, `js/room.js`, `js/shop.js` | M1 | PLANNED |
| M4 | Onboarding, Menu & Stats | `index.html`, `stats.html`, `css/style.css`, `js/main.js`, `js/stats.js` | M1, M2, M3 | PLANNED |
| M5 | Final Verification & Hardening | `verify.js`, E2E test suite (100% pass), Tier 5 adversarial testing, manual browser test | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts
### `DATA` (`js/data.js`) -> `GameEngine` (`js/game.js`)
- `DATA.topics`: Array of `{ id: string, name: string, icon: string, description: string }`
- `DATA.questions`: Array of `{ id: string, topicId: string, concept: string, definition: string, quizOptions?: string[], quizAnswer?: number, explanation?: string, sortItems?: string[], difficulty?: number }`
- `DATA.shopItems`: Array of `{ id: string, name: string, category: string, price: number, icon: string, description: string }`
- `DATA.petCatalog`: Array of `{ type: string, name: string, price: number, description: string }`
- `DATA.badges`: Array of `{ id: string, name: string, description: string, icon: string }`

### `GameEngine` (`js/game.js`) -> All Pages
Exposed on `window.GameEngine`:
- **State & Lifecycle**: `init()`, `getState()`, `saveState()`, `resetState()`, `isFirstTime()`
- **Stars**: `getStars()`, `earnStars(amount, source)`, `spendStars(amount)` -> returns boolean, `canAfford(amount)`
- **Pet**: `getPet()`, `setPetName(name)`, `setPetType(type)`, `setPetState(state)`, `unlockPet(type)`
- **Streak**: `getStreak()`, `checkStreak()`
- **Room**: `getRoom()`, `placeItem(itemId, x, y)`, `removeItem(index)`, `setWallpaper(id)`, `setFloor(id)`
- **Shop**: `getShopCatalog()`, `getOwnedItems()`, `buyItem(itemId)` -> boolean
- **SRS & Progress**: `getProgress(qId)`, `markAnswered(qId, isCorrect)`, `getTodayReview(topicId)`, `getTopicStats(topicId)`
- **Challenges**: `isChallengeUnlocked()`, `unlockChallenge()`, `getHighScores()`, `updateHighScore(mode, score)`
- **Badges**: `getBadges()`, `checkBadges()` -> newly unlocked array
- **Audio**: `playSound(name)` ('tap', 'correct', 'wrong', 'star', 'fanfare'), `toggleSound()`, `isSoundMuted()`

---

## Code Layout
```
C:\Users\User\.gemini\antigravity\scratch\game-hoc-tap\
├── index.html           # Main menu & first-time onboarding modal
├── study.html           # Topic selection screen
├── flashcard.html       # Study Mode: 3D Flashcard
├── quiz.html            # Study Mode: 4-Option Multiple Choice Quiz
├── matching.html        # Study Mode: Tap-to-select Matching Pairs
├── sorting.html         # Study Mode: Procedural Drag/Tap Sorting
├── challenge.html       # Challenge Mode Hub (Speed, Survival, Combo, Boss)
├── room.html            # Virtual Room with Free-Drag Furniture Decoration
├── shop.html            # Shop for furniture, wallpapers, and pets
├── stats.html           # Stats Dashboard, streak, badges, 7-day activity
├── css/
│   ├── style.css        # Pink pastel global theme, components, layout
│   ├── pets.css         # Pure CSS animated pets (Cat, Bunny, Bear, Duck, Hamster)
│   └── items.css        # Furniture CSS shapes and room styling
├── js/
│   ├── data.js          # Authoritative question bank & catalogs
│   ├── game.js          # Core GameEngine module
│   ├── main.js          # Index & Onboarding controller
│   ├── study.js         # Study hub controller
│   ├── challenge.js     # Challenge modes controller
│   ├── room.js          # Free-drag room controller
│   ├── shop.js          # Shop controller
│   └── stats.js         # Stats dashboard controller
└── verify.js            # Automated smoke test & validation script
```
