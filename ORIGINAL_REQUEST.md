# Original User Request

## 2026-09-05T06:43:42Z

Build a production-quality, fully client-side web app called "Meow Meow Ôn Viên Chức" — a gamified study app for Vietnamese civil servant exam prep. Players study via flashcards, quizzes, matching, and sorting exercises, earning stars (⭐) to buy furniture, decorate a virtual room with free-drag placement, and care for CSS-animated pets. Inspired by the HamChee language learning app. Target user: a non-technical girlfriend preparing for exams. The app must be cute (pink pastel theme), fun, and fully functional offline after first load.

Working directory: C:\Users\User\.gemini\antigravity\scratch\game-hoc-tap
Integrity mode: development

## Reference Specification Documents

The following design documents have been pre-written by the project lead and are located in:
`C:\Users\User\.gemini\antigravity\brain\0dc58a43-a05e-4b02-ada6-08ade72a7d38\`

**Read ALL of these before starting any implementation:**

| Document | Contents |
|----------|----------|
| `ARCHITECTURE.md` | File structure, navigation flow diagram, file dependency graph, data flow, and all architectural decisions (multi-page, localStorage, CSS-only pets, free-drag room) |
| `GAME_STATE.md` | Complete localStorage schema, spaced repetition algorithm, star economy rules, streak logic, pet state transitions — this is the binding data contract |
| `AGENT_BRIEF.md` | Per-agent briefs with exact API signatures for game.js, checklists, and scope boundaries |
| `GAMEPLAY_GUIDE.md` | Detailed UX specification for every screen and interaction |
| `GAME_INTRO.md` | Game concept, feature overview, game loop description |
| `TEAM_ROLES.md` | Team structure and responsibilities |

The team MUST follow the schemas and API contracts defined in `GAME_STATE.md` and `AGENT_BRIREF.md`. These were explicitly designed by the user and are non-negotiable specifications.

The folder structure is already prepared:
```
game-hoc-tap/
├── css/     (empty, ready)
├── js/      (empty, ready)
└── assets/  (empty, ready)
```

## Requirements

### R1. Core Game Engine
A shared JavaScript module that manages all game state — stars, pets, streak, room layout, study progress with spaced repetition, shop purchases, badges, and high scores. All state persists in localStorage under a single key. Every HTML page imports this module and interacts with it through a documented API. The spaced repetition system must track per-question mastery using increasing review intervals (1 → 3 → 7 → 15 → 30 days).

### R2. Four Study Modes
Four distinct study modes that pull from a shared question bank: (1) Flashcard with flip animation and self-assessment, (2) Quiz with 4 multiple-choice options and answer explanations, (3) Matching pairs with tap-to-select mechanics, (4) Sorting/ordering with drag-and-drop. Each mode must award stars upon correct answers and record progress for spaced repetition. The user selects a topic before entering any mode, and questions due for review today are prioritized.

### R3. Four Challenge Modes
Four challenge game modes that are locked until the player completes at least one full study set: (1) Speed — answer as many as possible in 60 seconds, (2) Survival — 5 lives, lose one per wrong answer, (3) Combo — streak multiplier resets on wrong answer, (4) Boss — 3 hard questions, must get all correct. Challenge modes award more stars than study modes and track high scores.

### R4. Pet System with CSS Animation
An animated virtual pet displayed in the room, built entirely with CSS (no image assets). The player chooses a pet type and names it on first launch. At least 3 pet types available from the start, with more purchasable. Each pet has at least 4 visually distinct animation states (idle, happy, sad, sleeping) that change based on player activity. The pet must feel alive — visible movement in idle state.

### R5. Room Decoration with Free-Drag
A virtual room where the player can place purchased furniture items anywhere via free drag-and-drop (not a fixed grid). Item positions persist across sessions. Items can be moved to new positions and removed back to inventory. The room must work with both mouse and touch input. At least 15 different purchasable items across multiple categories.

### R6. Onboarding, Navigation, and Stats
A first-time onboarding flow (choose pet → name pet → enter game). A main menu screen with navigation to all features. A stats/achievements screen showing streak, total stars, per-topic progress bars, earned badges, and a 7-day activity chart.

### R7. Visual Design
Cute pink pastel theme suitable for the target user (young Vietnamese woman). Consistent color scheme, rounded corners, friendly typography. All UI in Vietnamese. Responsive layout that works on phones (375px width) through laptops (1200px).

## Verification

### Automated Smoke Test
Write a verification script (`verify.js` or `verify.py`) that programmatically checks:
1. All HTML files exist and contain valid markup (no unclosed tags)
2. All referenced CSS and JS files exist and are loadable
3. `game.js` exposes the expected API functions (list from AGENT_BRIEF.md)
4. `data.js` contains valid data with correct schema (topics, questions with required fields, shopItems, petCatalog, badges)
5. localStorage round-trip: init state → save → reload → state matches
6. Star arithmetic: earn stars → spend stars → balance correct, cannot go negative

### Manual Interaction Test (Agent-as-Judge)
An independent reviewer agent must open the app in a browser and verify these interactions work end-to-end, documenting each with pass/fail:
1. First launch → onboarding appears → choose pet → name pet → enter menu
2. Menu → Study → select topic → complete 5 flashcards → stars increase
3. Menu → Study → complete a quiz set → challenge mode unlocks
4. Menu → Challenge → play each of the 4 modes → high scores saved
5. Menu → Shop → buy an item → stars decrease → item marked as owned
6. Menu → Room → place bought item via drag → reload page → item still in position
7. Menu → Stats → shows correct streak count and progress
8. Pet animation changes visibly after completing a study session

## Acceptance Criteria

### Functionality
- [ ] Opening `index.html` in a browser shows a working main menu with navigation to all features
- [ ] First-time users see an onboarding flow to choose and name a pet before reaching the menu
- [ ] All 4 study modes (flashcard, quiz, matching, sorting) are playable with sample questions
- [ ] All 4 challenge modes are locked initially and unlock after completing one study set
- [ ] Stars are earned for correct answers and can be spent in the shop
- [ ] Star balance never goes negative under any sequence of actions
- [ ] Purchased items appear in the room and can be freely dragged to any position (mouse and touch)
- [ ] Item positions persist after page reload
- [ ] Pet animation state changes visibly in response to study activity
- [ ] Spaced repetition tracks per-question progress: questions answered incorrectly appear sooner for review
- [ ] All game state persists in localStorage and survives page reload and browser restart
- [ ] The automated smoke test script passes all checks

### Visual & UX
- [ ] Pink pastel color theme is applied consistently across all pages
- [ ] All user-facing text is in Vietnamese
- [ ] Layout is usable at 375px viewport width (no horizontal scrolling, all buttons tappable)
- [ ] Pet has at least 4 visually distinguishable animation states
- [ ] At least 15 shop items are available for purchase across at least 3 categories

### Data
- [ ] At least 10 sample questions exist per topic (minimum 2 topics) following the schema in GAME_STATE.md
- [ ] Questions include concept, definition, quizOptions, quizAnswer, and explanation fields
- [ ] At least 2 questions per topic have sortItems for the sorting mode
