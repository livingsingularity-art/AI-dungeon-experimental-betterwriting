# Vogler V3 Refined Blueprint
## Complete Implementation Guide: Trinity + SAE + Hero's Journey

**Version:** 3.0.0-refined
**Date:** 2025-12-18
**Base:** Trinity Scripts (copy as foundation)
**Integration:** SAE (Story Arc Engine) patterns
**Standards:** AI Dungeon Best Practices + Director Pattern

---

## Executive Summary

This blueprint provides a **complete, step-by-step guide** for transforming a copy of the Trinity scripts into fully-featured Vogler V3 scripts. It combines:

1. **Trinity Scripts** - Complete 11,557-line foundation (Bonepoke, VS, NGO, word replacement)
2. **SAE Patterns** - AI-generated story arc system with progressive element removal
3. **Vogler's Hero's Journey** - 12-stage narrative structure with NGO synchronization
4. **Best Practices** - Correct API usage, Director pattern, proper script organization

### Key Differences from Previous Blueprints

| Aspect | Previous V3 Blueprint | This Refined Blueprint |
|--------|----------------------|------------------------|
| **API Calls** | Generic examples | Exact positional params from TypeScript defs |
| **SAE Integration** | Conceptual | Direct code patterns from original SAE |
| **Director Pattern** | Mentioned | Full implementation with `void 0` endings |
| **Story Card API** | Object params (wrong) | Positional params (correct) |
| **Script Organization** | Yi1i1i style | Director + Yi1i1i hybrid |

---

## Part 1: Correct API Reference (CRITICAL)

### Story Card API - FROM OFFICIAL TYPEDEFS

```typescript
// Source: aidungeon.d.ts - THESE ARE THE CORRECT SIGNATURES

// ADD - Returns new length of storyCards array
function addStoryCard(
  keys: string,      // Triggers for card inclusion
  entry?: string,    // Content injected into context
  type?: string,     // Category (default: "Custom")
  name?: string,     // Display title (default: keys)
  notes?: string     // Description (not sent to AI)
): number;

// UPDATE - Modifies existing card at index
function updateStoryCard(
  index: number,     // Position in storyCards array
  keys: string,      // New keys
  entry: string,     // New entry content
  type?: string,     // New type (preserves existing if omitted)
  name?: string,     // New title (preserves existing if omitted)
  notes?: string     // New notes (preserves existing if omitted)
): void;

// REMOVE - Deletes card at index
function removeStoryCard(index: number): void;
```

### WRONG vs CORRECT Usage

```javascript
// ============================================
// WRONG (V2's fatal mistake - DO NOT USE)
// ============================================
addStoryCard({
    keys: 'vogler-beat-1',
    entry: content,
    type: 'author'
});
// Result: First param becomes "[object Object]" string!

updateStoryCard(idx, {
    keys: 'foo',
    entry: 'bar'
});
// Result: Second param becomes "[object Object]"!


// ============================================
// CORRECT (Use these patterns ALWAYS)
// ============================================
addStoryCard('vogler-beat-1', content, 'author');
// Result: keys='vogler-beat-1', entry=content, type='author'

addStoryCard('vogler-beat-1', content, 'author', 'Act I Beats', 'Beat tracking card');
// Result: Full card with title and notes

updateStoryCard(idx, 'vogler-beat-1', newContent, 'author');
// Result: Updates card at idx with new content

// Finding a card by keys (helper pattern)
const findCard = (keys) => {
    const idx = storyCards.findIndex(c => c.keys === keys || c.title === keys);
    return idx >= 0 ? { index: idx, card: storyCards[idx] } : null;
};
```

### Memory API - Context Injection Points

```javascript
// Source: aidungeon.d.ts StateMemory interface

// MEMORY LOCATIONS (in order of context appearance):
// 1. state.memory.context    → Beginning of context (Memory field)
// 2. World Lore              → Story cards section
// 3. Story Summary           → Summary content
// 4. Memories                → Memorized moments
// 5. Recent Story            → History actions
// 6. state.memory.authorsNote → Near end, before last response
// 7. Last action/response    → Most recent content
// 8. state.memory.frontMemory → Very end (highest priority for AI)

// Usage:
state.memory.context = "Core story facts here";
state.memory.authorsNote = "[Stage guidance and Vogler notes]";
state.memory.frontMemory = "[Critical immediate instructions]";
```

---

## Part 2: Script Organization Pattern

### File Structure (4 Files)

```
vogler-v3/
├── voglerSharedLibrary.js   # Core: CONFIG, state, all functions
├── voglerInput.js           # Input processing + commands
├── voglerContext.js         # Context injection + arc prompts
└── voglerOutput.js          # Beat detection + stage advancement
```

### Script Template Pattern (Best Practices Hybrid)

**SharedLibrary Structure:**
```javascript
// voglerSharedLibrary.js
// ============================================
// VOGLER V3 SHARED LIBRARY
// Based on Trinity + SAE + Best Practices
// ============================================

// #region Director Pattern
// Source: director.md - function chaining system

const director = {
    text: '',
    stop: false,

    /**
     * Chain functions for library execution
     */
    library(...fns) {
        for (const fn of fns) {
            if (typeof fn === 'function') {
                fn.call(this);
            }
        }
    },

    /**
     * Chain functions for input/context/output hooks
     * Each fn receives (text, stop, type) and returns { text, stop? }
     */
    load(type, ...fns) {
        this.text = text;
        this.stop = typeof stop !== 'undefined' ? stop : false;

        for (const fn of fns) {
            if (typeof fn === 'function') {
                const result = fn.call(this, this.text, this.stop, type);
                if (result) {
                    if (typeof result.text !== 'undefined') this.text = result.text;
                    if (typeof result.stop !== 'undefined') this.stop = result.stop;
                }
            }
        }

        return { text: this.text, stop: this.stop };
    },

    input(...fns) { return this.load('input', ...fns); },
    context(...fns) { return this.load('context', ...fns); },
    output(...fns) { return this.load('output', ...fns); }
};
// #endregion

// #region Configuration
const CONFIG = {
    // ... Trinity CONFIG sections ...

    // Vogler Configuration
    vogler: {
        enabled: true,
        autoAdvance: true,
        minTurnsPerStage: 3,
        maxTurnsPerStage: 12,
        beatThreshold: 0.6,
        syncWithNGO: true,
        debugLogging: false
    },

    // SAE Bridge Configuration
    saeBridge: {
        enabled: true,
        eventsToGenerate: 5,
        maxWordsPerEvent: 10,
        turnsPerEventRemoval: 3,
        attemptLimit: 3
    }
};
// #endregion

// #region State Initialization
// ... functions defined below ...
// #endregion

// #region Vogler Stage Definitions
// ... VOGLER_STAGES object ...
// #endregion

// #region Story Card Management
// ... card helper functions ...
// #endregion

// #region Vogler Beat System (Tier 1)
// ... beat card functions ...
// #endregion

// #region SAE Bridge System (Tier 2)
// ... bridge card functions ...
// #endregion

// #region Stage Management
// ... advancement functions ...
// #endregion

// #region NGO Integration
// ... sync functions ...
// #endregion

// #region Debug Commands
// ... command processors ...
// #endregion

// Execute library initialization
director.library(
    initializeState,
    initializeVoglerState,
    // ... other init functions from Trinity ...
);
```

**Input/Context/Output Script Pattern:**
```javascript
// voglerInput.js (same pattern for context/output)
// ============================================

const processVoglerCommands = (text) => {
    // ... command processing ...
    return { text };
};

const processPlayerInput = (text) => {
    // ... input processing ...
    return { text };
};

// Use Director pattern - chain functions
director.input(
    processVoglerCommands,
    processPlayerInput
    // ... other input functions from Trinity ...
);

// CRITICAL: Always end with void 0
void 0
```

---

## Part 3: SAE Pattern Integration

### Original SAE Architecture (From Source)

The SAE system uses this simple but effective pattern:

```javascript
// SAE Library Pattern (adapted from original)
// Key insight: Functions in library, called from hooks

function onLibrary_SAE() {
    // Initialize settings card if not exists
    ensureSettingsCard();

    // Initialize arc card if not exists
    ensureArcCard();
}

function onInput_SAE(text) {
    // Process commands: /redo arc, /stop, /help
    if (text.match(/\/redo\s*arc/i)) {
        state.sae.regenerateArc = true;
        return text.replace(/\/redo\s*arc/i, '').trim();
    }
    return text;
}

function onContext_SAE(text) {
    // Remove angle-bracketed text (SAE markers)
    text = text.replace(/<[^>]+>/g, '');

    // Inject arc into author's note
    if (state.sae.currentArc) {
        state.memory.authorsNote = buildArcNote();
    }

    // Check if time to generate new arc
    if (shouldGenerateArc()) {
        injectArcGenerationPrompt();
    }

    return text;
}

function onOutput_SAE(text) {
    // Parse generated arc from output
    if (state.sae.pendingArcGeneration) {
        const arc = parseArcFromOutput(text);
        if (arc) {
            storeArc(arc);
            text = getConfirmationMessage();
        }
    }

    // Progressive element removal
    if (shouldRemoveElement()) {
        removeFirstArcElement();
    }

    // Increment turn counter
    state.sae.turnCount++;

    return text;
}
```

### SAE Key Settings (From Original)

```javascript
const SAE_SETTINGS = {
    // How often to call AI for arc generation
    turnsPerAICall: 35,

    // Retry limit for malformed outputs
    attemptLimit: 3,

    // Progressive removal frequency
    turnsPerElemRemoval: 3,

    // Arc generation prompt (CRITICAL - must be specific)
    arcPrompt: `Generate exactly 11 major events for this story arc.
Each event must be under 7 words.
Format as numbered list: 1. Event one, 2. Event two, etc.
Do NOT continue the story - ONLY output the numbered list.`
};
```

### Arc Validation Pattern (From Original)

```javascript
// SAE validates arc by checking for numbered items 8-11
function validateArc(text) {
    // Must have at least items 8, 9, 10, 11 to be valid
    const hasItem8 = /^\s*8[\.\)]/m.test(text);
    const hasItem9 = /^\s*9[\.\)]/m.test(text);
    const hasItem10 = /^\s*10[\.\)]/m.test(text);
    const hasItem11 = /^\s*11[\.\)]/m.test(text);

    return hasItem8 && hasItem9 && hasItem10 && hasItem11;
}

function parseArcEvents(text) {
    const events = [];
    const lines = text.split('\n');

    for (const line of lines) {
        // Match: "1. Event text" or "1) Event text"
        const match = line.match(/^\s*(\d+)[\.\)]\s*(.+)$/);
        if (match) {
            events.push({
                number: parseInt(match[1]),
                text: match[2].trim()
            });
        }
    }

    return events.sort((a, b) => a.number - b.number);
}
```

---

## Part 4: Complete Vogler Stage Definitions

```javascript
// #region Vogler Stage Definitions
const VOGLER_STAGES = {
    // ═══════════════════════════════════════════════════════════════
    // ACT I - THE SETUP (Stages 1-5)
    // ═══════════════════════════════════════════════════════════════
    1: {
        name: "Ordinary World",
        act: 1,
        description: "Establish the hero's normal life before the adventure",
        guidance: "Show protagonist's daily routine, relationships, unfulfilled desires. Build sympathy.",
        keyBeats: [
            "introduce protagonist",
            "show normal life",
            "hint at inner desire",
            "establish relationships",
            "show flaws or wounds"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 1, heat: 0, phase: 'exploration' },
        keywords: ["home", "routine", "always", "every day", "normal", "usual", "peaceful"]
    },

    2: {
        name: "Call to Adventure",
        act: 1,
        description: "Something disrupts the ordinary world",
        guidance: "Present challenge or opportunity demanding response. Create tension between comfort and adventure.",
        keyBeats: [
            "inciting incident",
            "messenger arrives",
            "discovery of problem",
            "opportunity presents",
            "status quo threatened"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 2, heat: 5, phase: 'exploration' },
        keywords: ["must", "have to", "urgent", "summon", "discover", "learn", "message", "news"]
    },

    3: {
        name: "Refusal of the Call",
        act: 1,
        description: "Hero hesitates or refuses initially",
        guidance: "Show fear, reluctance, or duty keeping hero back. Internal conflict intensifies.",
        keyBeats: [
            "express fear",
            "cite duty",
            "show reluctance",
            "rationalize staying",
            "warn of danger"
        ],
        minTurns: 2,
        maxTurns: 5,
        ngoMapping: { temperature: 2, heat: 3, phase: 'exploration' },
        keywords: ["can't", "won't", "afraid", "impossible", "danger", "risk", "stay", "but"]
    },

    4: {
        name: "Meeting the Mentor",
        act: 1,
        description: "Hero receives guidance, training, or magical aid",
        guidance: "Introduce wise figure providing tools, knowledge, or confidence. May be person, book, or inner wisdom.",
        keyBeats: [
            "mentor appears",
            "receive training",
            "gain magical aid",
            "learn crucial info",
            "earn mentor's trust"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 2, phase: 'exploration' },
        keywords: ["teach", "learn", "wise", "gift", "advice", "train", "master", "guide"]
    },

    5: {
        name: "Crossing the First Threshold",
        act: 1,
        description: "Hero commits to adventure and enters the Special World",
        guidance: "Mark clear departure from ordinary world. Point of no return. Guardian or test at threshold.",
        keyBeats: [
            "make commitment",
            "pass threshold guardian",
            "enter special world",
            "burn bridges",
            "first test"
        ],
        minTurns: 3,
        maxTurns: 5,
        ngoMapping: { temperature: 4, heat: 8, phase: 'rising' },
        keywords: ["cross", "enter", "begin", "leave behind", "no turning back", "step into", "embark"]
    },

    // ═══════════════════════════════════════════════════════════════
    // ACT II - THE CONFRONTATION (Stages 6-9)
    // ═══════════════════════════════════════════════════════════════
    6: {
        name: "Tests, Allies, and Enemies",
        act: 2,
        description: "Hero learns rules of Special World through challenges",
        guidance: "Series of tests teaching hero about new world. Introduce allies and enemies. Build skills.",
        keyBeats: [
            "face first test",
            "meet ally",
            "identify enemy",
            "learn rules",
            "prove worth"
        ],
        minTurns: 6,
        maxTurns: 12,
        ngoMapping: { temperature: 5, heat: 10, phase: 'rising' },
        keywords: ["test", "trial", "friend", "enemy", "ally", "fight", "challenge", "prove"]
    },

    7: {
        name: "Approach to the Inmost Cave",
        act: 2,
        description: "Hero prepares for the major challenge",
        guidance: "Build tension toward Ordeal. Preparations, reconnaissance, team bonding. Calm before storm.",
        keyBeats: [
            "gather intelligence",
            "make plans",
            "team preparation",
            "face inner fears",
            "approach danger"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 7, heat: 15, phase: 'rising' },
        keywords: ["prepare", "plan", "ready", "approach", "close", "near", "before", "soon"]
    },

    8: {
        name: "The Ordeal",
        act: 2,
        description: "Hero faces greatest fear - death and rebirth moment",
        guidance: "CENTRAL CRISIS. Hero confronts death (literal or ego-death). Must appear all is lost. Transformation moment.",
        keyBeats: [
            "face death",
            "all seems lost",
            "inner revelation",
            "symbolic death",
            "transformation"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 10, heat: 25, phase: 'climax', triggerOverheat: true },
        keywords: ["die", "death", "end", "lose", "fail", "dark", "worst", "desperate", "sacrifice"]
    },

    9: {
        name: "Reward (Seizing the Sword)",
        act: 2,
        description: "Hero survives death and claims reward",
        guidance: "Celebration of survival. Hero gains treasure, knowledge, or reconciliation. Brief respite.",
        keyBeats: [
            "claim reward",
            "celebrate survival",
            "gain insight",
            "team bonding",
            "acknowledge change"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 8, heat: 5, phase: 'rising' },
        keywords: ["reward", "gain", "treasure", "victory", "win", "earn", "achieve", "succeed"]
    },

    // ═══════════════════════════════════════════════════════════════
    // ACT III - THE RESOLUTION (Stages 10-12)
    // ═══════════════════════════════════════════════════════════════
    10: {
        name: "The Road Back",
        act: 3,
        description: "Hero begins journey back to Ordinary World",
        guidance: "Chase scenes, pursuit by villain remnants. Recommitment to completing adventure. Ticking clock.",
        keyBeats: [
            "pursue or be pursued",
            "recommit to goal",
            "face setbacks",
            "race against time",
            "regroup"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 9, heat: 20, phase: 'rising' },
        keywords: ["return", "back", "chase", "escape", "hurry", "time", "pursue", "flee"]
    },

    11: {
        name: "Resurrection",
        act: 3,
        description: "Final climactic confrontation - second death/rebirth",
        guidance: "CLIMAX. Hero uses all lessons learned. Final transformation. Higher stakes than Ordeal.",
        keyBeats: [
            "final battle",
            "use all skills",
            "sacrifice self",
            "transform fully",
            "defeat antagonist"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 12, heat: 30, phase: 'climax', triggerOverheat: true },
        keywords: ["final", "last", "ultimate", "climax", "everything", "all", "complete"]
    },

    12: {
        name: "Return with the Elixir",
        act: 3,
        description: "Hero returns transformed with boon for community",
        guidance: "RESOLUTION. Show changed hero. Demonstrate transformation. Share wisdom with ordinary world.",
        keyBeats: [
            "return home",
            "share wisdom",
            "demonstrate change",
            "heal wounds",
            "new equilibrium"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 0, phase: 'falling', triggerCooldown: true },
        keywords: ["return", "home", "peace", "heal", "new", "changed", "wisdom", "share"]
    }
};

const ACTS = {
    1: {
        name: "Act I: The Setup",
        stages: [1, 2, 3, 4, 5],
        description: "Establish ordinary world, introduce call, cross threshold",
        ngoPhase: "exploration"
    },
    2: {
        name: "Act II: The Confrontation",
        stages: [6, 7, 8, 9],
        description: "Tests and trials leading to central crisis and reward",
        ngoPhase: "rising"
    },
    3: {
        name: "Act III: The Resolution",
        stages: [10, 11, 12],
        description: "Road back, resurrection/climax, return with elixir",
        ngoPhase: "climax"
    }
};
// #endregion
```

---

## Part 5: Two-Tier Story System Implementation

### Tier 1: Vogler Beat Cards (Pre-generated)

```javascript
// #region Tier 1: Beat Cards
// Created at turn zero, beats DELETED when completed

const DEFAULT_BEAT_TEMPLATES = {
    1: {
        name: "Act I: The Setup",
        beats: [
            "Hero established in ordinary world",
            "Disruption or call arrives unexpectedly",
            "Hero resists or fears the call",
            "Mentor provides guidance or gift",
            "Hero commits and crosses threshold"
        ]
    },
    2: {
        name: "Act II: The Confrontation",
        beats: [
            "Tests reveal allies and enemies",
            "Hero approaches the central danger",
            "THE ORDEAL - darkest moment arrives",
            "Hero survives and claims reward",
            "Complication threatens the victory"
        ]
    },
    3: {
        name: "Act III: The Resolution",
        beats: [
            "Chase or pursuit toward finale",
            "CLIMAX - final confrontation begins",
            "Hero transformed through sacrifice",
            "Return home with wisdom gained"
        ]
    }
};

/**
 * Create all beat cards at initialization (turn zero)
 * Uses CORRECT positional API parameters
 */
function createAllBeatCards() {
    safeLog('[VOGLER] Creating pre-generated beat cards...');

    for (let actNum = 1; actNum <= 3; actNum++) {
        const template = DEFAULT_BEAT_TEMPLATES[actNum];
        const cardKey = `vogler-beats-${actNum}`;

        // Check if card already exists (don't overwrite user edits)
        const existing = findCardByKeys(cardKey);
        if (existing) {
            safeLog(`[VOGLER] Beat card ${cardKey} exists, preserving`);
            continue;
        }

        // Build card content
        let content = `[${template.name} - Remaining Beats]\n\n`;
        template.beats.forEach(beat => {
            content += `* ${beat}\n`;
        });
        content += `\n[Completed beats are removed from this card]`;

        // CORRECT API: positional parameters
        addStoryCard(
            cardKey,                    // keys
            content,                    // entry
            'author',                   // type
            `${template.name} Beats`,   // name/title
            'Beat tracking - edit to customize' // notes/description
        );

        // Initialize state tracking
        state.vogler.acts[actNum] = {
            remainingBeats: [...template.beats],
            completedBeats: [],
            cardKey: cardKey
        };

        safeLog(`[VOGLER] Created beat card: ${cardKey}`);
    }
}

/**
 * Complete a beat - REMOVES it from the card
 * @param {number} actNum - Act number (1, 2, or 3)
 * @param {number} beatIndex - Index in remainingBeats array
 */
function completeBeat(actNum, beatIndex) {
    const actData = state.vogler.acts[actNum];
    if (!actData || beatIndex >= actData.remainingBeats.length) {
        return false;
    }

    // Get beat being completed
    const completedBeat = actData.remainingBeats[beatIndex];

    // Move from remaining to completed
    actData.completedBeats.push({
        text: completedBeat,
        completedTurn: info.actionCount
    });

    // REMOVE from remaining (not just mark)
    actData.remainingBeats.splice(beatIndex, 1);

    // Update the story card
    updateBeatCardDisplay(actNum);

    safeLog(`[VOGLER] Beat completed: "${completedBeat}"`);

    // Check if act is complete
    if (actData.remainingBeats.length === 0) {
        safeLog(`[VOGLER] Act ${actNum} complete!`);
    }

    return true;
}

/**
 * Update beat card to show only remaining beats
 */
function updateBeatCardDisplay(actNum) {
    const actData = state.vogler.acts[actNum];
    const template = DEFAULT_BEAT_TEMPLATES[actNum];
    const cardKey = `vogler-beats-${actNum}`;

    if (!actData) return;

    // Find existing card
    const existing = findCardByKeys(cardKey);
    if (!existing) return;

    // Build updated content - ONLY remaining beats
    let content = `[${template.name} - Remaining Beats]\n`;
    content += `Stage: ${VOGLER_STAGES[state.vogler.currentStage].name}\n\n`;

    if (actData.remainingBeats.length === 0) {
        content += `*** ALL BEATS COMPLETE ***\n`;
    } else {
        actData.remainingBeats.forEach(beat => {
            content += `* ${beat}\n`;
        });
    }

    // CORRECT API: positional parameters
    updateStoryCard(
        existing.index,     // index
        cardKey,            // keys
        content,            // entry
        'author'            // type
    );
}

/**
 * Complete the next beat in current act
 */
function completeNextBeat() {
    const actNum = state.vogler.currentAct;
    const actData = state.vogler.acts[actNum];

    if (!actData || actData.remainingBeats.length === 0) {
        safeLog('[VOGLER] No remaining beats to complete');
        return false;
    }

    return completeBeat(actNum, 0);
}
// #endregion
```

### Tier 2: SAE Bridge Cards (On-Demand AI Generation)

```javascript
// #region Tier 2: SAE Bridge Cards
// Generated via @bridge command using AI

/**
 * Request bridge card generation
 * Adapted from SAE pattern - injects prompt into author's note
 */
function requestBridgeGeneration() {
    const currentStage = state.vogler.currentStage;
    const stage = VOGLER_STAGES[currentStage];
    const actData = state.vogler.acts[state.vogler.currentAct];

    // Get next structural beat for context
    const nextBeat = actData?.remainingBeats?.[0] || "continue the story";

    // Get recent story context
    const recentText = history.slice(-6).map(h => h.text).join(' ').slice(-600);

    // Build STRONG generation prompt (SAE pattern - must be explicit)
    const bridgePrompt = `[SYSTEM: GENERATE STORY BRIDGE]

Current Stage: ${stage.name}
Next Beat Needed: ${nextBeat}

Recent Story Context:
${recentText}

INSTRUCTIONS:
Generate exactly ${CONFIG.saeBridge.eventsToGenerate} specific plot events.
Each event: under ${CONFIG.saeBridge.maxWordsPerEvent} words.
Use character names from the story.
Events should lead toward: "${nextBeat}"

FORMAT (numbered list only):
1. [First specific event]
2. [Second specific event]
3. [Third specific event]
4. [Fourth specific event]
5. [Fifth specific event]

OUTPUT ONLY THE NUMBERED LIST. Do NOT continue the story.`;

    // Store current author's note to restore later
    state.vogler.bridge = {
        pendingGeneration: true,
        savedAuthorsNote: state.memory.authorsNote || '',
        prompt: bridgePrompt,
        attempts: 0
    };

    // Inject into author's note (high priority location)
    state.memory.authorsNote = bridgePrompt;

    safeLog('[VOGLER-BRIDGE] Generation requested');

    return true;
}

/**
 * Parse bridge events from AI output
 * Adapted from SAE validateArc pattern
 */
function parseBridgeFromOutput(text) {
    if (!state.vogler.bridge?.pendingGeneration) {
        return null;
    }

    const events = [];
    const lines = text.split('\n');

    for (const line of lines) {
        // Match: "1. Event" or "1) Event"
        const match = line.match(/^\s*(\d+)[\.\)]\s*(.+)$/);
        if (match && match[2].trim()) {
            events.push(match[2].trim());
        }
    }

    // Validate: need at least 3 events (SAE-style validation)
    if (events.length >= 3) {
        return events.slice(0, CONFIG.saeBridge.eventsToGenerate);
    }

    // Increment attempts
    state.vogler.bridge.attempts++;

    if (state.vogler.bridge.attempts >= CONFIG.saeBridge.attemptLimit) {
        // Failed after max attempts - restore and abort
        restoreSavedAuthorsNote();
        safeLog('[VOGLER-BRIDGE] Generation failed after max attempts');
        return null;
    }

    // Keep trying
    safeLog(`[VOGLER-BRIDGE] Parse failed, attempt ${state.vogler.bridge.attempts}`);
    return null;
}

/**
 * Store parsed bridge events and create card
 */
function storeBridgeEvents(events) {
    // Restore original author's note
    restoreSavedAuthorsNote();

    // Store events in state
    state.vogler.bridge = {
        events: events,
        created: info.actionCount,
        lastRemoval: info.actionCount,
        pendingGeneration: false
    };

    // Create/update bridge story card
    const cardKey = 'vogler-bridge';
    const existing = findCardByKeys(cardKey);

    let content = `[Story Bridge - Plot Events]\n`;
    content += `Moving toward: ${state.vogler.acts[state.vogler.currentAct]?.remainingBeats?.[0] || 'next beat'}\n\n`;
    events.forEach((event, idx) => {
        content += `${idx + 1}. ${event}\n`;
    });

    if (existing) {
        // CORRECT API: positional params
        updateStoryCard(existing.index, cardKey, content, 'author');
    } else {
        // CORRECT API: positional params
        addStoryCard(cardKey, content, 'author', 'Story Bridge', 'SAE-generated plot events');
    }

    safeLog(`[VOGLER-BRIDGE] Stored ${events.length} events`);

    return true;
}

/**
 * Progressive removal of bridge events (SAE pattern)
 * Called each turn
 */
function progressiveBridgeRemoval() {
    if (!state.vogler.bridge?.events || state.vogler.bridge.events.length === 0) {
        return;
    }

    const turnsSince = info.actionCount - state.vogler.bridge.lastRemoval;

    if (turnsSince >= CONFIG.saeBridge.turnsPerEventRemoval) {
        // Remove first event
        const removed = state.vogler.bridge.events.shift();
        state.vogler.bridge.lastRemoval = info.actionCount;

        safeLog(`[VOGLER-BRIDGE] Removed event: "${removed}"`);

        // Update card
        const cardKey = 'vogler-bridge';
        const existing = findCardByKeys(cardKey);

        if (state.vogler.bridge.events.length === 0) {
            // Bridge complete - remove card
            if (existing) {
                removeStoryCard(existing.index);
            }
            state.vogler.bridge = null;
            safeLog('[VOGLER-BRIDGE] Bridge completed');
        } else if (existing) {
            // Update card with remaining events
            let content = `[Story Bridge - Plot Events]\n\n`;
            state.vogler.bridge.events.forEach((event, idx) => {
                content += `${idx + 1}. ${event}\n`;
            });
            updateStoryCard(existing.index, cardKey, content, 'author');
        }
    }
}

/**
 * Restore saved author's note
 */
function restoreSavedAuthorsNote() {
    if (state.vogler.bridge?.savedAuthorsNote !== undefined) {
        state.memory.authorsNote = state.vogler.bridge.savedAuthorsNote;
        delete state.vogler.bridge.savedAuthorsNote;
    }
}
// #endregion
```

---

## Part 6: State Management

```javascript
// #region State Management

/**
 * Initialize Vogler state (called at turn zero)
 */
function initializeVoglerState() {
    // Check if already initialized
    if (state.vogler?.initialized) {
        if (CONFIG.vogler.debugLogging) {
            safeLog('[VOGLER] Already initialized');
        }
        return;
    }

    safeLog('[VOGLER] ═══════════════════════════════════════');
    safeLog('[VOGLER] INITIALIZING VOGLER V3 SYSTEM');
    safeLog('[VOGLER] ═══════════════════════════════════════');

    // Create state structure
    state.vogler = {
        initialized: true,
        version: '3.0.0',

        // Current position
        currentStage: 1,
        currentAct: 1,
        turnsInStage: 0,
        totalTurns: 0,

        // Tier 1: Beat tracking (per act)
        acts: {
            1: null,  // Populated by createAllBeatCards()
            2: null,
            3: null
        },

        // Tier 2: SAE Bridge (on-demand)
        bridge: null,

        // Statistics
        stats: {
            stageChanges: 0,
            beatsCompleted: 0,
            bridgesGenerated: 0
        }
    };

    // Create all story cards
    createConfigurationCards();
    createAllBeatCards();

    // Sync with NGO
    if (CONFIG.vogler.syncWithNGO && state.ngo) {
        syncVoglerToNGO(1);
    }

    safeLog('[VOGLER] Initialized at Stage 1 - Ordinary World');
    safeLog('[VOGLER] Use @bridge to generate plot guidance');
}

/**
 * Create configuration cards
 */
function createConfigurationCards() {
    // Vogler config card
    const configKey = 'vogler-config';
    if (!findCardByKeys(configKey)) {
        addStoryCard(
            configKey,
            `[Vogler V3 Configuration]
autoAdvance: ${CONFIG.vogler.autoAdvance}
minTurnsPerStage: ${CONFIG.vogler.minTurnsPerStage}
beatThreshold: ${CONFIG.vogler.beatThreshold}
syncWithNGO: ${CONFIG.vogler.syncWithNGO}

[Edit values to customize behavior]`,
            'author',
            'Vogler Config'
        );
    }

    // Player guidance card
    const guidanceKey = 'player-guidance';
    if (!findCardByKeys(guidanceKey)) {
        addStoryCard(
            guidanceKey,
            `[Your Author's Note]
Add style preferences, character details, or narrative goals.
Combined with Vogler stage guidance.

[Edit this card to add preferences]`,
            'author',
            "Player's Guidance"
        );
    }
}
// #endregion
```

---

## Part 7: Stage Advancement Logic

```javascript
// #region Stage Advancement

/**
 * Check if ready to advance stage
 */
function checkStageAdvancement() {
    if (!CONFIG.vogler.autoAdvance) return false;

    const currentStage = state.vogler.currentStage;
    const stage = VOGLER_STAGES[currentStage];
    const turns = state.vogler.turnsInStage;
    const actData = state.vogler.acts[state.vogler.currentAct];

    // Already at final stage
    if (currentStage >= 12) return false;

    // Check minimum turns
    if (turns < stage.minTurns) return false;

    // Force advance if max turns exceeded
    if (turns >= stage.maxTurns) {
        safeLog(`[VOGLER] Max turns (${turns}) reached, forcing advance`);
        return true;
    }

    // Check beat completion
    if (actData) {
        const template = DEFAULT_BEAT_TEMPLATES[state.vogler.currentAct];
        const total = template.beats.length;
        const remaining = actData.remainingBeats?.length || total;
        const completion = (total - remaining) / total;

        if (completion >= CONFIG.vogler.beatThreshold) {
            safeLog(`[VOGLER] Beat threshold (${(completion * 100).toFixed(0)}%) met`);
            return true;
        }
    }

    return false;
}

/**
 * Advance to next stage
 */
function advanceStage() {
    const current = state.vogler.currentStage;

    if (current >= 12) {
        safeLog('[VOGLER] Journey complete!');
        return false;
    }

    const next = current + 1;
    const nextStage = VOGLER_STAGES[next];
    const prevAct = VOGLER_STAGES[current].act;
    const nextAct = nextStage.act;

    safeLog(`[VOGLER] ═══════════════════════════════════════`);
    safeLog(`[VOGLER] ADVANCING: ${VOGLER_STAGES[current].name} -> ${nextStage.name}`);

    // Update state
    state.vogler.currentStage = next;
    state.vogler.turnsInStage = 0;
    state.vogler.stats.stageChanges++;

    // Check for act transition
    if (nextAct !== prevAct) {
        state.vogler.currentAct = nextAct;
        safeLog(`[VOGLER] ACT TRANSITION: ${ACTS[nextAct].name}`);
    }

    // Sync with NGO
    if (CONFIG.vogler.syncWithNGO && state.ngo) {
        syncVoglerToNGO(next);
    }

    safeLog(`[VOGLER] ═══════════════════════════════════════`);

    return true;
}

/**
 * Jump to specific stage
 */
function jumpToStage(stageNum) {
    if (stageNum < 1 || stageNum > 12) {
        safeLog('[VOGLER] Invalid stage number');
        return false;
    }

    const stage = VOGLER_STAGES[stageNum];

    state.vogler.currentStage = stageNum;
    state.vogler.currentAct = stage.act;
    state.vogler.turnsInStage = 0;

    // Sync with NGO
    if (CONFIG.vogler.syncWithNGO && state.ngo) {
        syncVoglerToNGO(stageNum);
    }

    safeLog(`[VOGLER] Jumped to Stage ${stageNum}: ${stage.name}`);

    return true;
}
// #endregion
```

---

## Part 8: NGO Synchronization

```javascript
// #region NGO Integration

/**
 * Sync Vogler stage to NGO temperature/heat
 */
function syncVoglerToNGO(stageNum) {
    if (!state.ngo) {
        safeLog('[VOGLER-NGO] NGO not initialized');
        return;
    }

    const stage = VOGLER_STAGES[stageNum];
    const mapping = stage.ngoMapping;

    // Gradual temperature adjustment
    const currentTemp = state.ngo.temperature || 1;
    const targetTemp = mapping.temperature;

    if (targetTemp > currentTemp) {
        state.ngo.temperature = Math.min(targetTemp, currentTemp + 2);
    } else if (targetTemp < currentTemp) {
        state.ngo.temperature = Math.max(targetTemp, currentTemp - 1);
    }

    // Heat target
    state.ngo.heat = Math.max(state.ngo.heat || 0, mapping.heat);

    // Phase
    if (mapping.phase) {
        state.ngo.phase = mapping.phase;
    }

    // Special triggers
    if (mapping.triggerOverheat) {
        state.ngo.overheatTurns = CONFIG.ngo?.overheatDuration || 4;
        safeLog('[VOGLER-NGO] Triggering overheat mode');
    }

    if (mapping.triggerCooldown) {
        state.ngo.cooldownTurns = CONFIG.ngo?.cooldownDuration || 3;
        safeLog('[VOGLER-NGO] Triggering cooldown mode');
    }

    if (CONFIG.vogler.debugLogging) {
        safeLog(`[VOGLER-NGO] Synced: temp=${state.ngo.temperature}, heat=${state.ngo.heat}, phase=${state.ngo.phase}`);
    }
}
// #endregion
```

---

## Part 9: Command Processing

```javascript
// #region Command Processing

/**
 * Process Vogler commands from input
 * @returns {object} { text, stop?, handled }
 */
function processVoglerCommands(text) {
    const trimmed = text.trim().toLowerCase();

    // /vogler commands
    if (trimmed.startsWith('/vogler')) {
        return handleVoglerSlashCommand(text);
    }

    // @stage N - Jump to stage
    const stageMatch = text.match(/@stage\s*(\d+)/i);
    if (stageMatch) {
        const num = parseInt(stageMatch[1]);
        jumpToStage(num);
        const newText = text.replace(/@stage\s*\d+/i, '').trim();
        return { text: newText || ' ', handled: true };
    }

    // @beat - Complete next beat
    if (/@beat\b/i.test(text)) {
        completeNextBeat();
        const newText = text.replace(/@beat/i, '').trim();
        return { text: newText || ' ', handled: true };
    }

    // @bridge - Generate bridge card
    if (/@bridge\b/i.test(text)) {
        requestBridgeGeneration();
        return {
            text: 'Generate the plot events list as instructed.',
            handled: true
        };
    }

    return { text, handled: false };
}

/**
 * Handle /vogler slash commands
 */
function handleVoglerSlashCommand(text) {
    const args = text.trim().slice(7).trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase() || 'status';

    let message = '';

    switch (cmd) {
        case 'status':
            message = getVoglerStatus();
            break;

        case 'stage':
            const num = parseInt(args[1]);
            if (num && VOGLER_STAGES[num]) {
                message = getStageDetails(num);
            } else {
                message = getStageDetails(state.vogler.currentStage);
            }
            break;

        case 'beats':
            message = getBeatsStatus();
            break;

        case 'advance':
            advanceStage();
            message = `Advanced to ${VOGLER_STAGES[state.vogler.currentStage].name}`;
            break;

        case 'complete':
            completeNextBeat();
            message = 'Completed next beat';
            break;

        case 'reset':
            const actNum = parseInt(args[1]) || state.vogler.currentAct;
            resetBeatCard(actNum);
            message = `Reset Act ${actNum} beats`;
            break;

        case 'debug':
            CONFIG.vogler.debugLogging = !CONFIG.vogler.debugLogging;
            message = `Debug: ${CONFIG.vogler.debugLogging ? 'ON' : 'OFF'}`;
            break;

        case 'help':
            message = getVoglerHelp();
            break;

        default:
            message = `Unknown command: ${cmd}. Use /vogler help`;
    }

    state.message = message;
    return { text: ' ', stop: true, handled: true };
}

/**
 * Get Vogler status display
 */
function getVoglerStatus() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const act = ACTS[state.vogler.currentAct];
    const actData = state.vogler.acts[state.vogler.currentAct];

    let status = `\n========== VOGLER V3 STATUS ==========\n`;
    status += `Stage ${state.vogler.currentStage}/12: ${stage.name}\n`;
    status += `${act.name}\n`;
    status += `Turns in stage: ${state.vogler.turnsInStage}/${stage.maxTurns}\n\n`;

    status += `BEATS:\n`;
    if (actData) {
        const remaining = actData.remainingBeats?.length || 0;
        const completed = actData.completedBeats?.length || 0;
        status += `  Completed: ${completed}\n`;
        status += `  Remaining: ${remaining}\n`;
    }

    if (state.vogler.bridge?.events) {
        status += `\nBRIDGE EVENTS: ${state.vogler.bridge.events.length}\n`;
    }

    if (state.ngo) {
        status += `\nNGO: temp=${state.ngo.temperature}, heat=${state.ngo.heat}\n`;
    }

    status += `======================================\n`;

    return status;
}

/**
 * Get help text
 */
function getVoglerHelp() {
    return `
======== VOGLER V3 COMMANDS ========

STATUS:
/vogler status    - Show current state
/vogler stage [N] - Show stage details
/vogler beats     - Show beat status

CONTROL:
/vogler advance   - Force stage advance
/vogler complete  - Complete next beat
/vogler reset [N] - Reset Act N beats

IN-STORY:
@stage 5   - Jump to stage 5
@beat      - Complete next beat
@bridge    - Generate plot events

DEBUG:
/vogler debug - Toggle debug logging
/vogler help  - Show this help
====================================`;
}
// #endregion
```

---

## Part 10: Helper Functions

```javascript
// #region Helper Functions

/**
 * Safe logging wrapper
 */
function safeLog(message) {
    try {
        log(message);
    } catch (e) {
        // Silently fail if log unavailable
    }
}

/**
 * Find card by keys or title
 * @returns {object|null} { index, card } or null
 */
function findCardByKeys(keys) {
    const idx = storyCards.findIndex(c =>
        c.keys === keys || c.title === keys
    );
    return idx >= 0 ? { index: idx, card: storyCards[idx] } : null;
}

/**
 * Reset beat card to defaults
 */
function resetBeatCard(actNum) {
    const cardKey = `vogler-beats-${actNum}`;
    const existing = findCardByKeys(cardKey);

    if (existing) {
        removeStoryCard(existing.index);
    }

    // Clear state
    state.vogler.acts[actNum] = null;

    // Recreate with defaults
    const template = DEFAULT_BEAT_TEMPLATES[actNum];
    let content = `[${template.name} - Remaining Beats]\n\n`;
    template.beats.forEach(beat => {
        content += `* ${beat}\n`;
    });

    addStoryCard(cardKey, content, 'author', `${template.name} Beats`);

    state.vogler.acts[actNum] = {
        remainingBeats: [...template.beats],
        completedBeats: [],
        cardKey: cardKey
    };

    safeLog(`[VOGLER] Reset beat card for Act ${actNum}`);
}

/**
 * Get stage details display
 */
function getStageDetails(stageNum) {
    const stage = VOGLER_STAGES[stageNum];
    const isCurrent = stageNum === state.vogler.currentStage;

    let details = `\n----- STAGE ${stageNum}: ${stage.name} -----\n`;
    details += isCurrent ? '*** CURRENT STAGE ***\n\n' : '\n';
    details += `Act: ${ACTS[stage.act].name}\n`;
    details += `${stage.description}\n\n`;
    details += `Guidance:\n${stage.guidance}\n\n`;
    details += `Key Beats:\n`;
    stage.keyBeats.forEach(beat => {
        details += `  - ${beat}\n`;
    });
    details += `\nTurns: ${stage.minTurns}-${stage.maxTurns}\n`;
    details += `NGO: temp=${stage.ngoMapping.temperature}, heat=${stage.ngoMapping.heat}\n`;

    return details;
}

/**
 * Get beats status display
 */
function getBeatsStatus() {
    let status = '\n======== BEAT STATUS ========\n';

    for (let actNum = 1; actNum <= 3; actNum++) {
        const template = DEFAULT_BEAT_TEMPLATES[actNum];
        const actData = state.vogler.acts[actNum];
        const isCurrent = actNum === state.vogler.currentAct;

        status += `\n${isCurrent ? '>' : ' '} ${template.name}\n`;

        if (actData) {
            status += `  Remaining: ${actData.remainingBeats?.length || 0}\n`;
            actData.remainingBeats?.forEach(beat => {
                status += `    - ${beat}\n`;
            });
        }
    }

    status += '\n=============================\n';
    return status;
}
// #endregion
```

---

## Part 11: Complete Input Script

```javascript
// voglerInput.js
// ============================================
// VOGLER V3 INPUT SCRIPT
// ============================================

/**
 * Process Vogler commands
 */
const processVoglerInput = (text) => {
    const result = processVoglerCommands(text);
    if (result.handled) {
        return result;
    }
    return { text };
};

/**
 * Increment turn counters
 */
const incrementTurns = (text) => {
    if (state.vogler?.initialized) {
        state.vogler.turnsInStage++;
        state.vogler.totalTurns++;
    }
    return { text };
};

// Chain functions with Director
director.input(
    processVoglerInput,
    incrementTurns
    // ... add Trinity input functions here ...
);

// CRITICAL: End with void 0
void 0
```

---

## Part 12: Complete Context Script

```javascript
// voglerContext.js
// ============================================
// VOGLER V3 CONTEXT SCRIPT
// ============================================

/**
 * Inject Vogler stage guidance into author's note
 */
const injectVoglerGuidance = (text) => {
    if (!state.vogler?.initialized) {
        return { text };
    }

    // Don't inject if bridge generation pending
    if (state.vogler.bridge?.pendingGeneration) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const actData = state.vogler.acts[state.vogler.currentAct];

    // Build Vogler guidance
    let voglerNote = `[Hero's Journey: Stage ${state.vogler.currentStage} - ${stage.name}]\n`;
    voglerNote += `${stage.guidance}\n`;

    // Add next beat if available
    if (actData?.remainingBeats?.[0]) {
        voglerNote += `\nNext beat: ${actData.remainingBeats[0]}`;
    }

    // Combine with existing author's note
    const existing = state.memory.authorsNote || '';
    state.memory.authorsNote = existing + '\n\n' + voglerNote;

    // Add stage to frontMemory for high priority
    state.memory.frontMemory = `[Stage ${state.vogler.currentStage}/12: ${stage.name}]`;

    return { text };
};

// Chain functions with Director
director.context(
    injectVoglerGuidance
    // ... add Trinity context functions here ...
);

// CRITICAL: End with void 0
void 0
```

---

## Part 13: Complete Output Script

```javascript
// voglerOutput.js
// ============================================
// VOGLER V3 OUTPUT SCRIPT
// ============================================

/**
 * Parse bridge generation response
 */
const parseBridgeOutput = (text) => {
    if (!state.vogler?.bridge?.pendingGeneration) {
        return { text };
    }

    const events = parseBridgeFromOutput(text);

    if (events) {
        storeBridgeEvents(events);

        // Replace output with confirmation
        const confirmText = `Bridge card generated!\n\n` +
            events.map((e, i) => `${i + 1}. ${e}`).join('\n') +
            `\n\n[Continue the story normally.]`;

        return { text: confirmText };
    }

    return { text };
};

/**
 * Process progressive removal and stage advancement
 */
const processVoglerOutput = (text) => {
    if (!state.vogler?.initialized) {
        return { text };
    }

    // Progressive bridge removal
    progressiveBridgeRemoval();

    // Check stage advancement
    if (checkStageAdvancement()) {
        advanceStage();
    }

    return { text };
};

// Chain functions with Director
director.output(
    parseBridgeOutput,
    processVoglerOutput
    // ... add Trinity output functions here ...
);

// CRITICAL: End with void 0
void 0
```

---

## Part 14: Implementation Checklist

### Phase 1: Foundation (Copy Trinity)
- [ ] Copy all 4 Trinity script files to vogler-v3/ folder
- [ ] Rename to voglerSharedLibrary.js, voglerInput.js, etc.
- [ ] Verify Trinity features work after copy

### Phase 2: Add Director Pattern
- [ ] Add director object to sharedLibrary (if not present)
- [ ] Update Input script to use `director.input(...); void 0`
- [ ] Update Context script to use `director.context(...); void 0`
- [ ] Update Output script to use `director.output(...); void 0`

### Phase 3: Add Vogler Definitions
- [ ] Add VOGLER_STAGES constant to sharedLibrary
- [ ] Add ACTS constant to sharedLibrary
- [ ] Add DEFAULT_BEAT_TEMPLATES constant
- [ ] Add CONFIG.vogler section
- [ ] Add CONFIG.saeBridge section

### Phase 4: Add State Management
- [ ] Add initializeVoglerState() function
- [ ] Add createConfigurationCards() function
- [ ] Add createAllBeatCards() function
- [ ] Integrate init into library director.library() call

### Phase 5: Add Beat System (Tier 1)
- [ ] Add completeBeat() function
- [ ] Add updateBeatCardDisplay() function
- [ ] Add completeNextBeat() function
- [ ] Add resetBeatCard() function

### Phase 6: Add SAE Bridge System (Tier 2)
- [ ] Add requestBridgeGeneration() function
- [ ] Add parseBridgeFromOutput() function
- [ ] Add storeBridgeEvents() function
- [ ] Add progressiveBridgeRemoval() function
- [ ] Add restoreSavedAuthorsNote() function

### Phase 7: Add Stage Management
- [ ] Add checkStageAdvancement() function
- [ ] Add advanceStage() function
- [ ] Add jumpToStage() function
- [ ] Add syncVoglerToNGO() function

### Phase 8: Add Command Processing
- [ ] Add processVoglerCommands() function
- [ ] Add handleVoglerSlashCommand() function
- [ ] Add status/help display functions
- [ ] Integrate into input director chain

### Phase 9: Integrate with Hooks
- [ ] Add Vogler functions to input director chain
- [ ] Add Vogler functions to context director chain
- [ ] Add Vogler functions to output director chain

### Phase 10: Testing
- [ ] Test turn-zero initialization
- [ ] Test beat card creation
- [ ] Test beat completion (deletes from card)
- [ ] Test @bridge generation
- [ ] Test stage advancement
- [ ] Test NGO sync
- [ ] Test all /vogler commands
- [ ] Full journey playthrough

---

## Part 15: API Quick Reference

### Story Card API (CORRECT)
```javascript
addStoryCard(keys, entry, type, name, notes) -> number
updateStoryCard(index, keys, entry, type, name, notes) -> void
removeStoryCard(index) -> void
```

### Memory API
```javascript
state.memory.context = "..."      // Beginning of context
state.memory.authorsNote = "..."  // Near end
state.memory.frontMemory = "..."  // Very end (highest priority)
```

### Director Pattern
```javascript
director.library(fn1, fn2, ...)   // Library execution
director.input(fn1, fn2, ...)     // Input hook
director.context(fn1, fn2, ...)   // Context hook
director.output(fn1, fn2, ...)    // Output hook

// Each fn returns { text, stop? }
// End scripts with: void 0
```

### State Structure
```javascript
state.vogler = {
    initialized: true,
    currentStage: 1,
    currentAct: 1,
    turnsInStage: 0,
    totalTurns: 0,
    acts: {
        1: { remainingBeats: [], completedBeats: [], cardKey: '' },
        2: { ... },
        3: { ... }
    },
    bridge: {
        events: [],
        pendingGeneration: false,
        savedAuthorsNote: ''
    },
    stats: { ... }
}
```

---

## Conclusion

This refined blueprint provides:

1. **Correct API usage** - Positional parameters from official TypeScript definitions
2. **SAE patterns** - Direct adaptation of original Story Arc Engine code
3. **Director pattern** - Proper function chaining with `void 0` endings
4. **Two-tier system** - Pre-generated beats + on-demand bridge generation
5. **Complete code** - Ready-to-implement functions
6. **Trinity compatibility** - Designed to merge with existing features

**Start by copying Trinity scripts, then add Vogler components following the checklist.**

---

**End of Refined Blueprint**
