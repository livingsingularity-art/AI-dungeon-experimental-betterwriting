# Vogler V3 Integration Blueprint
## Comprehensive Three-Way Comparison & Integration Plan

**Date:** 2025-12-18
**Purpose:** Create Vogler V3 by properly combining Trinity (base), Vogler V2 (broken Hero's Journey), and Blueprint fixes

---

## Executive Summary

### Current State Analysis

| Component | Trinity Scripts | Vogler V2 | Current V3 (WRONG) |
|-----------|----------------|-----------|-------------------|
| **sharedLibrary** | 11,557 lines | 8,546 lines | 1,006 lines |
| **input** | 189 lines | 188 lines | 195 lines |
| **context** | 263 lines | 115 lines | 123 lines |
| **output** | 806 lines | 308 lines | 216 lines |
| **Status** | ✅ Working | ❌ Broken APIs | ❌ Missing all Trinity features |

### Critical Discovery

**Vogler V2 is INCOMPLETE** - it added Hero's Journey but **REMOVED** core Trinity features:
- ❌ Missing Bonepoke Protocol
- ❌ Missing Verbalized Sampling (VS)
- ❌ Missing NGO Core Engine
- ❌ Missing Diversity Engine
- ❌ Missing Word Replacement
- ❌ Missing Phrase/Word Deletion
- ❌ Plus broken API parameter calls

**Current V3 is FUNDAMENTALLY WRONG** - built from scratch instead of evolving from Trinity/V2

---

## Correct Lineage

```
Trinity Scripts (11,557 lines)
    ↓ (add Hero's Journey)
Vogler V2 (8,546 lines) ← Lost 3,000+ lines of features!
    ↓ (fix APIs + restore Trinity features)
Vogler V3 (target: ~12,000+ lines)
```

---

## Part 1: Trinity Scripts Features (BASE CODE)

### What Trinity Has (ALL MUST BE IN V3)

#### 1. Core Configuration System
```javascript
const CONFIG = {
    vs: { ... },              // Verbalized Sampling
    bonepoke: { ... },        // Quality analysis
    ngo: { ... },             // Heat/temperature mechanics
    diversity: { ... },       // Mode collapse prevention
    smartReplacement: { ... }, // Word replacement
    cardManagement: { ... },  // Story card system
    // ... many more subsystems
}
```

**Location in Trinity:** Lines 26-222
**Status in V2:** ✅ Partial (CONFIG exists but missing subsystems)
**Status in V3:** ❌ Completely different/minimal CONFIG

---

#### 2. Verbalized Sampling (VS) System
**Purpose:** Prevent repetitive outputs by forcing AI to consider alternatives
**Lines in Trinity:** 3,582-3,711 (130 lines)
**Status in V2:** ❌ MISSING
**Status in V3:** ❌ MISSING

**Key Functions:**
- `runVerbalizedSampling(text)` - Main VS execution
- `buildVSPrompt(k, tau)` - Construct sampling prompt
- `parseVSResponse(response)` - Extract selected candidate
- `isVSTriggered()` - Determine when to run VS

**Integration Priority:** 🔴 P0 CRITICAL

---

#### 3. Bonepoke Protocol System
**Purpose:** Analyze output quality (word fatigue, contradictions, tone drift)
**Lines in Trinity:** 3,712-4,158 (447 lines)
**Status in V2:** ❌ MISSING
**Status in V3:** ❌ MISSING

**Key Functions:**
- `runBonepokeAnalysis(text)` - Main analysis
- `detectWordFatigue(text)` - Find overused words
- `detectContradictions(text)` - Find logical inconsistencies
- `detectToneDrift(text)` - Find style inconsistencies
- `calculateQualityScores(analysis)` - Compute metrics

**Data Structures:**
```javascript
state.bonepoke = {
    lastAnalysis: { fatigue: [], contradictions: [], drift: [], scores: {} },
    history: [],
    fatigueWords: new Set(),
    avgScore: 0
}
```

**Integration Priority:** 🔴 P0 CRITICAL

---

#### 4. Word Replacement System
**Purpose:** Replace fatigued words with fresh synonyms
**Lines in Trinity:** ~2,900-3,389 (490 lines)
**Status in V2:** ❌ MISSING
**Status in V3:** ❌ MISSING

**Key Features:**
- Synonym mappings (1,000+ word pairs)
- Context-aware replacement
- Smart replacement algorithm
- Validation to prevent new issues
- Adaptive learning from past replacements

**Key Functions:**
- `getSmartSynonym(word, bonepokeScores, context)` - Select best replacement
- `validateReplacement(originalText, replacedText, word, synonym)` - Ensure quality
- `detectContradictoryReplacement(context, word, replacement)` - Prevent contradictions
- `ensureReplacerCard()` - Create word bank card

**Story Cards Created:**
- `word_replacer` - Word bank template

**Integration Priority:** 🔴 P0 CRITICAL

---

#### 5. Phrase/Word Deletion System
**Purpose:** Remove cliché phrases and overused words
**Lines in Trinity:** Integrated throughout output processing
**Status in V2:** ❌ MISSING
**Status in V3:** ❌ MISSING

**Key Features:**
- Cliché phrase detection and removal
- Filler word deletion
- Purple prose reduction
- User-customizable deletion lists

**Story Cards Created:**
- `phrase_deleter` - Phrase deletion rules
- `word_deleter` - Word deletion rules

**Integration Priority:** 🟡 P1 HIGH

---

#### 6. NGO Core Engine
**Purpose:** Dynamic pacing with heat/temperature mechanics
**Lines in Trinity:** 4,337-4,700 (364 lines)
**Status in V2:** ⚠️ PARTIAL (basic NGO, missing advanced features)
**Status in V3:** ❌ MISSING

**Key Functions:**
- `updateNGOState()` - Process heat/temperature changes
- `detectConflictWords(text)` - Find tension indicators
- `processNGOTurn()` - Turn-by-turn update
- `handleOverheat()` - Sustain climax
- `handleCooldown()` - Falling action
- `triggerRandomExplosion()` - Surprise tension spikes

**State Structure:**
```javascript
state.ngo = {
    heat: 0,
    temperature: 1,
    phase: 'exposition',
    turnsInPhase: 0,
    consecutiveConflicts: 0,
    calmTurns: 0,
    overheat: { active: false, turnsRemaining: 0 },
    cooldown: { active: false, turnsRemaining: 0 }
}
```

**Integration Priority:** 🔴 P0 CRITICAL

---

#### 7. Diversity Engine (Mode Collapse Prevention)
**Purpose:** Detect and prevent repetitive patterns
**Lines in Trinity:** 4,701-4,861 (161 lines)
**Status in V2:** ❌ MISSING
**Status in V3:** ❌ MISSING

**Key Functions:**
- `analyzeOutputDiversity(text)` - Measure uniqueness
- `detectModeCollapse(history)` - Find patterns
- `escalateIntervention(level)` - Increase diversity pressure
- `trackBlockedPhrases(phrase)` - Remember overused phrases

**Integration Priority:** 🟡 P1 HIGH

---

#### 8. Dynamic Correction System
**Purpose:** Auto-create guidance cards to prevent recurring issues
**Lines in Trinity:** 4,159-4,277 (119 lines)
**Status in V2:** ❌ MISSING
**Status in V3:** ❌ MISSING

**Key Functions:**
- `createDynamicGuidanceCard(issue, guidance)` - Generate cards
- `updateDynamicGuidanceCard(issue, guidance)` - Update existing
- `removeDynamicGuidanceCard(issue)` - Clean up resolved issues

**Integration Priority:** 🟢 P2 MEDIUM

---

#### 9. AutoCards Integration (Full)
**Purpose:** Complete AutoCards system for dynamic card generation
**Lines in Trinity:** 5,548-11,557 (6,009 lines!)
**Status in V2:** ⚠️ PARTIAL (hooks only, not full integration)
**Status in V3:** ❌ MISSING

**Key Features:**
- Full AutoCards() function (6,000+ lines)
- API for programmatic control
- Card generation, regeneration, deletion
- Memory management
- Banned titles system

**Integration Priority:** 🟢 P2 MEDIUM (can be optional)

---

#### 10. Story Card Management
**Purpose:** Robust card creation/update/deletion
**Lines in Trinity:** 835-2,628 (1,794 lines)
**Status in V2:** ⚠️ PARTIAL (basic functions only)
**Status in V3:** ✅ Present (but using wrong API!)

**Key Functions:**
- `buildCard(title, entry, type, keys, description, priority)` - Correct API usage
- `ensureReplacerCard()` - Word bank management
- `ensurePhraseDeletionCard()` - Phrase deletion rules
- `updateCardWithValidation()` - Safe card updates

**Integration Priority:** 🔴 P0 CRITICAL (API fixes)

---

## Part 2: Vogler V2 Additions (HERO'S JOURNEY)

### What V2 Added (MUST BE IN V3)

#### 1. VOGLER_STAGES Definition
**Purpose:** Christopher Vogler's 12-stage Hero's Journey structure
**Lines in V2:** 229-428 (200 lines)
**Status in V3:** ✅ Present (simplified version)

**Structure:**
```javascript
const VOGLER_STAGES = {
    1: {
        name: "Ordinary World",
        act: 1,
        description: "...",
        guidance: "...",
        keyBeats: [...],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 1, heat: 0 },
        keywords: [...]
    },
    // ... 2-12
}
```

**Integration Action:** ✅ KEEP from V3 (it's correct), merge with V2's additional metadata

---

#### 2. Tier 1: Beat Cards System
**Purpose:** Pre-generated plot beats for each Act
**Lines in V2:** 864-1,024 (161 lines)
**Status in V3:** ✅ Present (simplified)

**Key Functions:**
- `createActBeatCards()` - Generate beat cards for Acts 1-3
- `completeBeat(beatName)` - Mark beat as done
- `getNextBeat()` - Get next incomplete beat
- `updateBeatCard(act)` - Update remaining beats

**State Structure:**
```javascript
state.vogler = {
    currentStage: 1,
    currentAct: 1,
    turnsInStage: 0,
    totalTurns: 0,
    acts: {
        1: { remainingBeats: [...], completedBeats: [] },
        2: { remainingBeats: [...], completedBeats: [] },
        3: { remainingBeats: [...], completedBeats: [] }
    }
}
```

**Integration Action:** ✅ KEEP from V3, ensure API calls use positional params

---

#### 3. Tier 2: SAE Bridge Cards
**Purpose:** On-demand AI-generated plot events
**Lines in V2:** 1,025-1,192 (168 lines)
**Status in V3:** ⚠️ Present but BROKEN (times out)

**Key Functions:**
- `requestBridgeCardGeneration()` - Trigger AI generation
- `parseBridgeCardResponse(text)` - Extract events from AI
- `updateBridgeCard(events)` - Store bridge events
- `consumeBridgeEvent()` - Use next bridge event

**State Structure:**
```javascript
state.vogler.bridge = {
    active: false,
    events: [],
    lastGenerated: 0,
    pendingGeneration: false
}
```

**KNOWN BUG in V2 & V3:** Bridge generation times out
**ROOT CAUSE:** Weak prompt, AI continues story instead of generating list

**Integration Action:** 🔴 FIX with stronger prompt (see blueprint amendments)

---

#### 4. Stage Management System
**Purpose:** Handle stage transitions and advancement
**Lines in V2:** 1,193-1,295 (103 lines)
**Status in V3:** ✅ Present (simplified)

**Key Functions:**
- `advanceStage()` - Move to next stage
- `checkStageAdvancement()` - Auto-advance when ready
- `jumpToStage(stageNum)` - Manual stage jump
- `getStageProgress()` - Current stage info

**Integration Action:** ✅ KEEP from V3

---

#### 5. NGO-Vogler Integration
**Purpose:** Sync Vogler stages with NGO heat/temperature
**Lines in V2:** 1,296-1,352 (57 lines)
**Status in V3:** ❌ MISSING (no NGO in V3)

**Key Functions:**
- `syncVoglerToNGO()` - Set NGO based on Vogler stage
- `syncNGOToVogler()` - Suggest Vogler stage based on NGO heat

**Example Mapping:**
```javascript
// Stage 1 (Ordinary World) → Temperature 1, Heat 0
// Stage 11 (Resurrection) → Temperature 12-15, Heat 40-50
```

**Integration Action:** 🔴 RESTORE (critical for pacing)

---

#### 6. Vogler Debug Commands
**Purpose:** Player commands for testing/controlling Vogler
**Lines in V2:** 1,353-1,777 (425 lines)
**Status in V3:** ⚠️ PARTIAL (simpler version)

**Commands:**
- `/vogler status` - Show current state
- `/vogler stage N` - Jump to stage
- `/vogler beat` - Mark beat complete
- `/vogler bridge` - Generate bridge card
- `/vogler reset` - Reset to stage 1
- `/vogler auto [on|off]` - Toggle auto-advancement

**Integration Action:** ✅ MERGE V2 + V3 versions

---

#### 7. Vogler-Specific Author's Note
**Purpose:** Inject stage guidance into context
**Lines in V2:** 1,778-2,005 (228 lines)
**Status in V3:** ✅ Present (layered version)

**Key Functions:**
- `buildVoglerAuthorsNote()` - Generate Vogler guidance
- `injectStageGuidance()` - Add to frontMemory
- `buildLayeredNote()` - Combine player + Vogler guidance

**Integration Action:** ✅ KEEP V3 version (uses frontMemory correctly)

---

#### 8. API Parameter Bugs (V2's CRITICAL FAILURE)
**Lines in V2:** Throughout (every story card call)
**Bug Count:** 47+ instances

**Example Bug:**
```javascript
// ❌ WRONG (V2):
addStoryCard({
    keys: 'vogler-beat-1',
    entry: content,
    type: 'author'
});
// Passes {keys: ...} as first param → "[object Object]" stored!

// ✅ CORRECT:
addStoryCard('vogler-beat-1', content, 'author');
```

**Integration Action:** 🔴 FIX ALL instances (blueprint amendment priority P0)

---

## Part 3: Current V3 Issues (WHAT WENT WRONG)

### Fatal Mistakes in V3

1. **❌ Started from scratch** instead of using Trinity as base
2. **❌ Missing ALL Trinity features:**
   - No Bonepoke
   - No VS
   - No NGO
   - No word replacement
   - No diversity engine
   - No phrase deletion
3. **✅ Got API parameters correct** (only good thing)
4. **✅ Implemented Director pattern correctly**
5. **⚠️ Bridge generation still broken** (timeout issue)

---

## Part 4: Final Vogler V3 Integration Plan

### Step-by-Step Build Process

#### Phase 1: Foundation (Trinity Base)
**Goal:** Start with working Trinity scripts

1. ✅ Copy `trinitysharedLibrary(1).js` → `voglerSharedLibrary.js`
2. ✅ Copy `trinityinput(1).js` → `voglerInput.js`
3. ✅ Copy `trinitycontext(1).js` → `voglerContext.js`
4. ✅ Copy `trinityoutput(1).js` → `voglerOutput.js`

**Result:** Full working Trinity system (11,557 lines)

---

#### Phase 2: Add Vogler Structures
**Goal:** Insert Hero's Journey definitions

**In voglerSharedLibrary.js:**

1. **After CONFIG section** (line ~222), add:
   ```javascript
   // #region Vogler Stage Definitions
   const VOGLER_STAGES = { /* 12 stages from V3 */ };
   ```

2. **After utilities** (line ~428), add:
   ```javascript
   // #region Vogler State Management
   function initializeVoglerState() { /* from V3 */ }
   function createConfigurationCards() { /* from V3 - FIX APIs */ }
   function createAllBeatCards() { /* from V3 - FIX APIs */ }
   ```

3. **Before AutoCards** (line ~5,548), add:
   ```javascript
   // #region Vogler Beat System
   function completeBeat(beatName) { /* from V3 */ }
   function updateBeatCard(act) { /* from V3 - FIX API */ }

   // #region Vogler Bridge System
   function generateBridgeCard() { /* FIX with strong prompt */ }
   function updateBridgeCard(events) { /* from V3 - FIX API */ }

   // #region Vogler Stage Management
   function advanceStage() { /* from V3 */ }
   function checkStageAdvancement() { /* from V3 */ }
   function jumpToStage(stageNum) { /* from V3 */ }

   // #region Vogler-NGO Sync
   function syncVoglerToNGO() { /* from V2 */ }
   function syncNGOToVogler() { /* from V2 */ }
   ```

4. **Add to CONFIG:**
   ```javascript
   const CONFIG = {
       // ... existing Trinity config ...

       // Vogler Hero's Journey
       vogler: {
           enabled: true,
           autoAdvance: true,
           minTurnsPerStage: 3,
           beatCompletionThreshold: 0.7
       },

       // Beat cards
       beatCards: {
           enabled: true,
           progressiveDeletion: true,
           showCompleted: false
       },

       // Bridge cards
       bridge: {
           enabled: true,
           eventsToGenerate: 5,
           maxWordsPerEvent: 10,
           turnsPerEventRemoval: 3
       }
   };
   ```

5. **Add to state initialization** (in `initializeSharedState()` or similar):
   ```javascript
   if (!state.vogler) {
       state.vogler = {
           initialized: false,
           currentStage: 1,
           currentAct: 1,
           turnsInStage: 0,
           totalTurns: 0,
           acts: {
               1: { remainingBeats: [], completedBeats: [] },
               2: { remainingBeats: [], completedBeats: [] },
               3: { remainingBeats: [], completedBeats: [] }
           },
           bridge: {
               active: false,
               events: [],
               lastGenerated: 0,
               savedAuthorsNote: ''
           },
           ngoSynced: false
       };
   }
   ```

**Estimated lines added:** ~800

---

#### Phase 3: Fix ALL API Parameter Calls
**Goal:** Ensure story card operations use positional params

**Search and replace pattern:**
```javascript
// FIND:
addStoryCard({ *keys: *([^,]+), *entry: *([^,]+), *type: *([^}]+) *})

// REPLACE WITH:
addStoryCard($1, $2, $3)
```

**Files to fix:**
- voglerSharedLibrary.js
- All Vogler-specific functions

**Estimated fixes:** 47+ instances

---

#### Phase 4: Integrate Vogler Commands
**Goal:** Add Vogler-specific input processing

**In voglerInput.js:**

After Trinity input processing, add:
```javascript
// Process Vogler commands
const processVoglerCommands = (text) => {
    if (!state.vogler || !state.vogler.initialized) {
        return { text };
    }

    // /vogler status
    if (text.match(/\/vogler\s+status/i)) {
        displayVoglerStatus();
        return { text: '', stop: true };
    }

    // /vogler stage N
    const stageMatch = text.match(/\/vogler\s+stage\s+(\d+)/i);
    if (stageMatch) {
        const stageNum = parseInt(stageMatch[1]);
        if (stageNum >= 1 && stageNum <= 12) {
            jumpToStage(stageNum);
            return { text: text.replace(/\/vogler\s+stage\s+\d+/i, '').trim(), stop: false };
        }
    }

    // @bridge - Generate bridge card
    if (text.match(/@bridge/i)) {
        generateBridgeCard();
        return { text: 'Generate the plot events list as requested.', stop: false };
    }

    // @beat - Mark beat complete
    if (text.match(/@beat/i)) {
        const nextBeat = getNextBeat();
        if (nextBeat) {
            completeBeat(nextBeat);
        }
        return { text: text.replace(/@beat/i, '').trim(), stop: false };
    }

    return { text };
};

// Add to director chain
const modifier = (text) => {
    return director.input(
        // ... existing Trinity functions ...
        processVoglerCommands  // Add Vogler command processing
    );
};
```

**Estimated lines added:** ~100

---

#### Phase 5: Integrate Vogler Context
**Goal:** Inject stage guidance into AI context

**In voglerContext.js:**

After Trinity context processing, add:
```javascript
// Inject Vogler guidance
const injectVoglerGuidance = (text) => {
    if (!state.vogler || !state.vogler.initialized) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];

    // Build Vogler-specific author's note section
    const voglerNote = `[Hero's Journey: ${stage.name}]
${stage.guidance}

Key beats: ${getNextBeats(3).join('; ')}`;

    // Add to author's note (layered with Trinity's existing note)
    const existing = state.memory.authorsNote || '';
    state.memory.authorsNote = existing + '\n\n' + voglerNote;

    // Add critical stage info to frontMemory
    const criticalInfo = `[Stage ${state.vogler.currentStage}/12: ${stage.name}]`;
    const existingFront = state.memory.frontMemory || '';
    state.memory.frontMemory = criticalInfo + '\n' + existingFront;

    return { text };
};

// Add to director chain
const modifier = (text) => {
    return director.context(
        // ... existing Trinity functions ...
        injectVoglerGuidance  // Add Vogler context injection
    );
};
```

**Estimated lines added:** ~80

---

#### Phase 6: Integrate Vogler Output Processing
**Goal:** Detect beat completion, parse bridge cards

**In voglerOutput.js:**

After Trinity output processing, add:
```javascript
// Detect beat completion from AI output
const detectBeatCompletion = (text) => {
    if (!state.vogler || !state.vogler.initialized) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const nextBeat = getNextBeat();

    if (!nextBeat) {
        return { text };
    }

    // Check if output contains beat keywords
    const lowerText = text.toLowerCase();
    const beatKeywords = extractKeywords(nextBeat);

    let matchCount = 0;
    for (const keyword of beatKeywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
            matchCount++;
        }
    }

    // If enough keywords match, auto-complete beat
    if (matchCount >= beatKeywords.length * 0.5) {
        completeBeat(nextBeat);
    }

    return { text };
};

// Parse bridge card response
const parseBridgeResponse = (text) => {
    if (!state.vogler.bridge.active) {
        return { text };
    }

    // Look for numbered list pattern
    const eventPattern = /^\s*\d+\.\s*(.+)$/gm;
    const matches = [...text.matchAll(eventPattern)];

    if (matches.length >= CONFIG.bridge.eventsToGenerate) {
        const events = matches.slice(0, CONFIG.bridge.eventsToGenerate)
            .map(m => m[1].trim());

        updateBridgeCard(events);

        // Restore original author's note
        if (state.vogler.bridge.savedAuthorsNote) {
            state.memory.authorsNote = state.vogler.bridge.savedAuthorsNote;
            delete state.vogler.bridge.savedAuthorsNote;
        }

        // Replace output with user-friendly message
        const message = `📋 Bridge Card Generated!\n\n${events.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n[Continue the story normally.]`;
        return { text: message };
    }

    return { text };
};

// Update Vogler state
const updateVoglerState = (text) => {
    if (!state.vogler || !state.vogler.initialized) {
        return { text };
    }

    // Increment turn counters
    state.vogler.totalTurns++;
    state.vogler.turnsInStage++;

    // Check stage advancement
    checkStageAdvancement();

    // Sync with NGO
    if (state.ngo && CONFIG.vogler.syncWithNGO) {
        syncVoglerToNGO();
    }

    return { text };
};

// Add to director chain
const modifier = (text) => {
    return director.output(
        // ... existing Trinity functions ...
        detectBeatCompletion,  // Auto-detect beat completion
        parseBridgeResponse,   // Parse bridge card generation
        updateVoglerState      // Update Vogler turn counters
    );
};
```

**Estimated lines added:** ~150

---

#### Phase 7: Fix Bridge Generation (Critical Bug)
**Goal:** Make @bridge command actually work

**Problem:** Current implementation times out because:
1. Prompt is too weak
2. AI continues story instead of generating list
3. No clear format instruction

**Solution in `generateBridgeCard()`:**

```javascript
function generateBridgeCard() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];

    // Create STRONG, explicit prompt
    const bridgePrompt = `SYSTEM DIRECTIVE: Generate exactly ${CONFIG.bridge.eventsToGenerate} specific plot events for "${stage.name}".

FORMAT REQUIREMENT:
- Output ONLY a numbered list (1., 2., 3., etc.)
- Each event = one concrete action or scene (max ${CONFIG.bridge.maxWordsPerEvent} words)
- Do NOT continue the story
- Do NOT add commentary

EXAMPLE FORMAT:
1. Hero discovers hidden passage
2. Villain captures ally
3. Hero faces moral dilemma

STAGE CONTEXT: ${stage.guidance}
KEY BEATS: ${stage.keyBeats.slice(0, 3).join('; ')}

Generate the list now:`;

    // Mark bridge generation active
    state.vogler.bridge.active = true;
    state.vogler.bridge.lastGenerated = state.vogler.totalTurns;

    // Save current author's note (will restore after generation)
    state.vogler.bridge.savedAuthorsNote = state.memory.authorsNote || '';

    // CRITICAL: Override author's note with bridge directive
    // This ensures maximum AI attention
    state.memory.authorsNote = bridgePrompt;

    safeLog('[VOGLER] Bridge card generation requested', 'info');
}
```

**Key improvements:**
1. ✅ Explicit format requirement
2. ✅ Clear example
3. ✅ "Do NOT continue story" instruction
4. ✅ Saves/restores author's note
5. ✅ Uses authorsNote (higher priority than frontMemory)

---

#### Phase 8: Add Vogler Initialization
**Goal:** Auto-initialize on first turn

**In voglerSharedLibrary.js, add to initialization section:**

```javascript
// Initialize Vogler system on first turn
function initializeVoglerSystem() {
    if (state.vogler && state.vogler.initialized) {
        return;
    }

    safeLog('[VOGLER] Initializing Hero\'s Journey system...', 'info');

    // Create base state
    if (!state.vogler) {
        state.vogler = {
            initialized: false,
            currentStage: 1,
            currentAct: 1,
            turnsInStage: 0,
            totalTurns: 0,
            acts: {
                1: { remainingBeats: [], completedBeats: [] },
                2: { remainingBeats: [], completedBeats: [] },
                3: { remainingBeats: [], completedBeats: [] }
            },
            bridge: {
                active: false,
                events: [],
                lastGenerated: 0,
                savedAuthorsNote: ''
            },
            ngoSynced: false
        };
    }

    // Create configuration cards (✅ using correct API)
    createConfigurationCards();

    // Pre-generate all beat cards (✅ using correct API)
    createAllBeatCards();

    // Sync with NGO if enabled
    if (state.ngo && CONFIG.vogler.syncWithNGO) {
        syncVoglerToNGO();
    }

    state.vogler.initialized = true;
    safeLog('[VOGLER] Initialized at Stage 1: Ordinary World', 'info');
}

// Call during shared library execution
initializeVoglerSystem();
```

---

#### Phase 9: Testing & Validation
**Goal:** Ensure all systems work together

**Test Checklist:**

1. **Trinity Features Still Work:**
   - [ ] Bonepoke analysis runs
   - [ ] VS triggers on repetitive output
   - [ ] NGO heat/temperature updates
   - [ ] Word replacement activates
   - [ ] Phrase deletion works
   - [ ] Diversity engine detects mode collapse

2. **Vogler Features Work:**
   - [ ] Initializes at Stage 1
   - [ ] Beat cards created (3 cards)
   - [ ] Configuration card created
   - [ ] `/vogler status` shows correct info
   - [ ] `/vogler stage 2` advances stage
   - [ ] `@beat` marks beat complete
   - [ ] `@bridge` generates event list (doesn't timeout!)
   - [ ] Auto-advancement after min turns

3. **Integration Works:**
   - [ ] NGO syncs with Vogler stage
   - [ ] Vogler guidance appears in author's note
   - [ ] Trinity + Vogler don't conflict
   - [ ] Story cards use correct API params

4. **No Regressions:**
   - [ ] No "modifier is not defined" errors
   - [ ] No "[object Object]" in story cards
   - [ ] No infinite loops
   - [ ] No timeouts (except network issues)

---

## Part 5: Priority Matrix

| Feature | Priority | Lines | Reason |
|---------|----------|-------|--------|
| **Fix API Parameters** | 🔴 P0 CRITICAL | ~100 | V2's fatal flaw, breaks all story cards |
| **Restore Bonepoke** | 🔴 P0 CRITICAL | ~447 | Core quality control system |
| **Restore VS** | 🔴 P0 CRITICAL | ~130 | Core diversity system |
| **Restore NGO Core** | 🔴 P0 CRITICAL | ~364 | Core pacing system |
| **Restore Word Replacement** | 🔴 P0 CRITICAL | ~490 | User explicitly wants this |
| **Fix Bridge Generation** | 🔴 P0 CRITICAL | ~50 | Currently times out |
| **Add VOGLER_STAGES** | 🔴 P0 CRITICAL | ~200 | Core Vogler feature |
| **Add Beat System** | 🔴 P0 CRITICAL | ~300 | Core Vogler feature |
| **Add Stage Management** | 🔴 P0 CRITICAL | ~200 | Core Vogler feature |
| **Vogler-NGO Sync** | 🟡 P1 HIGH | ~100 | Important for pacing |
| **Restore Diversity Engine** | 🟡 P1 HIGH | ~161 | Mode collapse prevention |
| **Restore Phrase Deletion** | 🟡 P1 HIGH | ~200 | User explicitly wants this |
| **Vogler Commands** | 🟡 P1 HIGH | ~300 | User convenience |
| **Dynamic Correction** | 🟢 P2 MEDIUM | ~119 | Nice to have |
| **AutoCards Full** | 🟢 P2 MEDIUM | ~6,009 | Optional, can omit |

---

## Part 6: Expected Final V3 Stats

| Component | Lines | Features |
|-----------|-------|----------|
| **voglerSharedLibrary.js** | ~12,000 | Trinity (11,557) + Vogler (~800) - AutoCards (~6,000 optional) + fixes (~100) |
| **voglerInput.js** | ~300 | Trinity (189) + Vogler commands (~100) |
| **voglerContext.js** | ~350 | Trinity (263) + Vogler guidance (~80) |
| **voglerOutput.js** | ~1,000 | Trinity (806) + Vogler processing (~150) |
| **TOTAL** | ~13,650 | Complete system |

---

## Part 7: Critical API Fixes Reference

### Story Card API - Correct Usage

```javascript
// ✅ CORRECT:
addStoryCard(keys, entry, type)
updateStoryCard(index, keys, entry, type)
removeStoryCard(index)

// ❌ WRONG (V2 mistake):
addStoryCard({ keys: 'foo', entry: 'bar', type: 'baz' })
updateStoryCard(index, { keys: 'foo', entry: 'bar', type: 'baz' })
```

### Director Pattern - Correct Usage

```javascript
// ✅ CORRECT:
const modifier = (text) => {
    return director.input(
        function1,
        function2,
        function3
    );
};
modifier(text);

// ❌ WRONG (causes "modifier is not defined"):
director.input(function1, function2, function3);
void 0;
```

---

## Part 8: Implementation Order

### Day 1: Foundation
1. Copy Trinity scripts → vogler-v3/
2. Add VOGLER_STAGES definition
3. Add Vogler state initialization
4. Add Vogler CONFIG sections

### Day 2: Core Vogler
5. Add beat card system
6. Add bridge card system (with fixed prompt)
7. Add stage management
8. Fix all API parameter calls

### Day 3: Integration
9. Add Vogler input commands
10. Add Vogler context injection
11. Add Vogler output processing
12. Add Vogler-NGO synchronization

### Day 4: Testing
13. Test all Trinity features
14. Test all Vogler features
15. Test integration points
16. Fix any bugs found

---

## Part 9: Success Criteria

### Must Have (P0)
- ✅ All Trinity features work (Bonepoke, VS, NGO, word replacement)
- ✅ All story cards use correct API parameters
- ✅ Vogler 12-stage system works
- ✅ Beat tracking works
- ✅ Bridge generation works (no timeout)
- ✅ Stage advancement works
- ✅ NGO-Vogler sync works
- ✅ No runtime errors

### Should Have (P1)
- ✅ Phrase/word deletion works
- ✅ Diversity engine works
- ✅ Vogler commands work
- ✅ Auto-advancement works

### Nice to Have (P2)
- ✅ Dynamic correction works
- ✅ Full AutoCards integration
- ✅ Performance optimizations
- ✅ Comprehensive documentation

---

## Part 10: Common Pitfalls to Avoid

1. **DON'T** start from scratch again
2. **DON'T** remove Trinity features
3. **DON'T** use object parameters for story card API
4. **DON'T** forget to wrap Director calls in modifier function
5. **DON'T** use weak prompts for bridge generation
6. **DON'T** skip NGO-Vogler synchronization
7. **DON'T** forget to initialize Vogler state
8. **DON'T** assume V2 is complete (it's missing 3,000+ lines!)
9. **DON'T** skip testing Trinity features after integration
10. **DON'T** commit without testing first

---

## Conclusion

**Vogler V3 = Trinity (complete) + Vogler (Hero's Journey) + Blueprint Fixes**

**NOT:** Vogler V3 = minimal new implementation ❌
**NOT:** Vogler V3 = just V2 fixes ❌

**YES:** Vogler V3 = Trinity base + Vogler additions + all fixes ✅

**Estimated Timeline:**
- Phase 1-2 (Foundation): 2 hours
- Phase 3-4 (API fixes): 2 hours
- Phase 5-6 (Integration): 3 hours
- Phase 7-8 (Testing): 2 hours
- **Total:** 9 hours of focused work

**Final Result:**
- ~13,650 lines of fully integrated, working code
- All Trinity features preserved
- All Vogler features working
- All blueprint fixes applied
- Production-ready Hero's Journey system

---

**End of Blueprint**
