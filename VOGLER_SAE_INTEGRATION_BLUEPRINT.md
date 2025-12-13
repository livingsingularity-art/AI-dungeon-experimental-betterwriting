# Vogler + SAE Integration Blueprint
## AI Dungeon Enhanced Narrative Structure System

**Version:** 1.0.0
**Base:** Trinity Scripts v2.5.0
**Status:** Blueprint/Design Document

---

## Executive Summary

This blueprint describes a new **Vogler-SAE Hybrid System** that combines:

1. **Vogler's 12-Stage Hero's Journey** - Proven narrative structure framework
2. **SAE's AI-Generated Story Arcs** - Dynamic, AI-created plot outlines stored in story cards
3. **Trinity Scripts Foundation** - Existing NGO/Bonepoke/VS systems for quality control
4. **Act-Based Story Cards** - One card per Act tracking story beats and progress
5. **Comprehensive Debug Tools** - Ensuring all systems are observable and testable

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VOGLER-SAE HYBRID SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     THREE-ACT STRUCTURE                              │   │
│  │                                                                      │   │
│  │   ACT I (Setup)          ACT II (Confrontation)    ACT III (Resol.) │   │
│  │   ├─ Stage 1             ├─ Stage 6                ├─ Stage 10      │   │
│  │   ├─ Stage 2             ├─ Stage 7                ├─ Stage 11      │   │
│  │   ├─ Stage 3             ├─ Stage 8                └─ Stage 12      │   │
│  │   ├─ Stage 4             └─ Stage 9                                 │   │
│  │   └─ Stage 5                                                        │   │
│  │                                                                      │   │
│  │   [Story Card:           [Story Card:              [Story Card:     │   │
│  │    ACT I Arc]             ACT II Arc]               ACT III Arc]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   INTEGRATION LAYER                                  │   │
│  │                                                                      │   │
│  │   Stage-to-NGO Mapping ──► Heat/Temperature sync                    │   │
│  │   Beat Detection ──────► Automatic stage progression                │   │
│  │   SAE Arc Generation ──► AI-created plot points per Act             │   │
│  │   Bonepoke Quality ────► Quality gates for progression              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DEBUG SYSTEM                                    │   │
│  │                                                                      │   │
│  │   /vogler status    - Current state display                         │   │
│  │   /vogler debug     - Toggle verbose logging                        │   │
│  │   /vogler arc       - Display current act's story arc               │   │
│  │   /vogler stage     - Show stage details                            │   │
│  │   /vogler generate  - Force arc regeneration                        │   │
│  │   /vogler advance   - Force stage advancement                       │   │
│  │   /vogler reset     - Reset to beginning                            │   │
│  │   /vogler health    - System health check                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: The 12-Stage Hero's Journey Structure

### Stage Definitions

```javascript
const VOGLER_STAGES = {
    // ACT I - THE SETUP (Stages 1-5)
    1: {
        name: "Ordinary World",
        act: 1,
        description: "Establish the hero's normal life before the adventure",
        guidance: "Show the protagonist's daily routine, relationships, and unfulfilled desires. Build sympathy and identification.",
        keyBeats: [
            "introduce protagonist",
            "show normal life",
            "hint at inner desire",
            "establish relationships",
            "show flaws or wounds"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 1, heat: 0 },
        keywords: ["home", "routine", "always", "every day", "normal", "usual", "peaceful"]
    },

    2: {
        name: "Call to Adventure",
        act: 1,
        description: "Something disrupts the ordinary world",
        guidance: "Present a challenge, opportunity, or problem that demands response. Create tension between comfort and adventure.",
        keyBeats: [
            "inciting incident",
            "messenger arrives",
            "discovery of problem",
            "opportunity presents",
            "status quo threatened"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 2, heat: 5 },
        keywords: ["must", "have to", "urgent", "summon", "discover", "learn", "message", "news"]
    },

    3: {
        name: "Refusal of the Call",
        act: 1,
        description: "Hero hesitates or refuses initially",
        guidance: "Show fear, reluctance, or duty keeping the hero back. Internal conflict intensifies.",
        keyBeats: [
            "express fear",
            "cite duty",
            "show reluctance",
            "rationalize staying",
            "warn of danger"
        ],
        minTurns: 2,
        maxTurns: 5,
        ngoMapping: { temperature: 2, heat: 3 },
        keywords: ["can't", "won't", "afraid", "impossible", "danger", "risk", "stay", "but"]
    },

    4: {
        name: "Meeting the Mentor",
        act: 1,
        description: "Hero receives guidance, training, or magical aid",
        guidance: "Introduce a wise figure who provides tools, knowledge, or confidence. Mentor may be person, book, or inner wisdom.",
        keyBeats: [
            "mentor appears",
            "receive training",
            "gain magical aid",
            "learn crucial info",
            "earn mentor's trust"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 2 },
        keywords: ["teach", "learn", "wise", "gift", "advice", "train", "master", "guide"]
    },

    5: {
        name: "Crossing the First Threshold",
        act: 1,
        description: "Hero commits to the adventure and enters the Special World",
        guidance: "Mark clear departure from ordinary world. Point of no return. Guardian or test at the threshold.",
        keyBeats: [
            "make commitment",
            "pass threshold guardian",
            "enter special world",
            "burn bridges",
            "first test"
        ],
        minTurns: 3,
        maxTurns: 5,
        ngoMapping: { temperature: 4, heat: 8 },
        keywords: ["cross", "enter", "begin", "leave behind", "no turning back", "step into", "embark"]
    },

    // ACT II - THE CONFRONTATION (Stages 6-9)
    6: {
        name: "Tests, Allies, and Enemies",
        act: 2,
        description: "Hero learns rules of Special World through challenges",
        guidance: "Series of tests that teach hero about new world. Introduce allies and enemies. Build skills.",
        keyBeats: [
            "face first test",
            "meet ally",
            "identify enemy",
            "learn rules",
            "prove worth"
        ],
        minTurns: 6,
        maxTurns: 12,
        ngoMapping: { temperature: 5, heat: 10 },
        keywords: ["test", "trial", "friend", "enemy", "ally", "fight", "challenge", "prove"]
    },

    7: {
        name: "Approach to the Inmost Cave",
        act: 2,
        description: "Hero prepares for the major challenge",
        guidance: "Build tension toward the Ordeal. Preparations, reconnaissance, team bonding. Calm before storm.",
        keyBeats: [
            "gather intelligence",
            "make plans",
            "team preparation",
            "face inner fears",
            "approach danger"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 7, heat: 15 },
        keywords: ["prepare", "plan", "ready", "approach", "close", "near", "before", "soon"]
    },

    8: {
        name: "The Ordeal",
        act: 2,
        description: "Hero faces greatest fear - death and rebirth moment",
        guidance: "CENTRAL CRISIS. Hero confronts death (literal or ego-death). Must appear all is lost. Moment of transformation.",
        keyBeats: [
            "face death",
            "all seems lost",
            "inner revelation",
            "symbolic death",
            "transformation"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 10, heat: 25 },  // TRIGGER OVERHEAT
        keywords: ["die", "death", "end", "lose", "fail", "dark", "worst", "desperate", "sacrifice"]
    },

    9: {
        name: "Reward (Seizing the Sword)",
        act: 2,
        description: "Hero survives death and claims reward",
        guidance: "Celebration of survival. Hero gains treasure, knowledge, or reconciliation. Brief respite before road back.",
        keyBeats: [
            "claim reward",
            "celebrate survival",
            "gain insight",
            "team bonding",
            "acknowledge change"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 8, heat: 5 },  // POST-OVERHEAT
        keywords: ["reward", "gain", "treasure", "victory", "win", "earn", "achieve", "succeed"]
    },

    // ACT III - THE RESOLUTION (Stages 10-12)
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
        ngoMapping: { temperature: 9, heat: 20 },
        keywords: ["return", "back", "chase", "escape", "hurry", "time", "pursue", "flee"]
    },

    11: {
        name: "Resurrection",
        act: 3,
        description: "Final climactic confrontation - second death/rebirth",
        guidance: "CLIMAX. Hero must use all lessons learned. Final transformation. Higher stakes than Ordeal.",
        keyBeats: [
            "final battle",
            "use all skills",
            "sacrifice self",
            "transform fully",
            "defeat antagonist"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 12, heat: 30 },  // MAXIMUM CLIMAX
        keywords: ["final", "last", "ultimate", "climax", "everything", "all", "complete"]
    },

    12: {
        name: "Return with the Elixir",
        act: 3,
        description: "Hero returns transformed with boon for community",
        guidance: "RESOLUTION. Show changed hero. Demonstrate how journey transformed them. Share wisdom with ordinary world.",
        keyBeats: [
            "return home",
            "share wisdom",
            "demonstrate change",
            "heal wounds",
            "new equilibrium"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 0 },  // COOLDOWN COMPLETE
        keywords: ["return", "home", "peace", "heal", "new", "changed", "wisdom", "share"]
    }
};
```

### Act Definitions

```javascript
const ACTS = {
    1: {
        name: "Act I: The Setup",
        stages: [1, 2, 3, 4, 5],
        description: "Establish ordinary world, introduce the call, and cross the threshold",
        arcPrompt: `Create a story arc for Act I (The Setup) with 4-5 key events:
- Event 1: Introduction of protagonist in their ordinary world
- Event 2: The inciting incident or call to adventure
- Event 3: Initial hesitation or refusal
- Event 4: Guidance or aid received
- Event 5: Commitment to the adventure

Keep each event under 7 words. Focus on establishing stakes and character.`,
        storyCardKey: "vogler-act-1",
        ngoPhase: "exploration"
    },

    2: {
        name: "Act II: The Confrontation",
        stages: [6, 7, 8, 9],
        description: "Tests and trials leading to the central crisis and reward",
        arcPrompt: `Create a story arc for Act II (The Confrontation) with 4-5 key events:
- Event 1: Early tests and meeting allies/enemies
- Event 2: Building toward the major challenge
- Event 3: THE ORDEAL - the darkest moment (must be impactful)
- Event 4: Claiming the reward after survival
- Event 5: Complication that launches final act

Keep each event under 7 words. Make the Ordeal feel like a true crisis.`,
        storyCardKey: "vogler-act-2",
        ngoPhase: "rising"
    },

    3: {
        name: "Act III: The Resolution",
        stages: [10, 11, 12],
        description: "The road back, resurrection/climax, and return with elixir",
        arcPrompt: `Create a story arc for Act III (The Resolution) with 3-4 key events:
- Event 1: Chase or pursuit back toward resolution
- Event 2: FINAL CONFRONTATION - climax using all learned skills
- Event 3: Victory and transformation complete
- Event 4: Return to ordinary world, changed

Keep each event under 7 words. The climax must feel earned.`,
        storyCardKey: "vogler-act-3",
        ngoPhase: "climax"
    }
};
```

---

## Part 2: Pre-Generated Story Arc Cards

### Arc Generation System

**IMPORTANT DESIGN DECISION:** Unlike SAE which generates arcs mid-game, all Vogler arc story cards are **pre-generated at turn zero** during initialization. This provides:

1. **Consistent structure** - All three acts have their arcs defined from the start
2. **No mid-story pauses** - No AI generation calls interrupting gameplay
3. **Player visibility** - Users can see and edit all arcs in Story Cards immediately
4. **Predictable behavior** - Same initialization every time

The arc cards are created alongside configuration cards during `initVoglerState()`.

```javascript
/**
 * Arc Configuration
 */
const ARC_CONFIG = {
    // Pre-generation (all arcs created at turn zero)
    preGenerateAllArcs: true,       // Create all 3 act arcs on initialization

    // Arc format
    eventsPerAct: {
        1: 5,  // Act I: 5 events
        2: 5,  // Act II: 5 events
        3: 4   // Act III: 4 events
    },
    maxWordsPerEvent: 7,

    // Story card settings
    storyCardPrefix: "vogler-act-",
    arcCardType: "author",          // Ensures it influences AI
    arcCardTrigger: "",             // Always active (no keys needed)

    // Progressive completion tracking
    enableProgressiveCompletion: true,  // Mark events as complete (✓) as story progresses

    // Manual regeneration (only via /vogler generate command)
    allowManualRegeneration: true,

    // Debug
    debugLogging: true
};

/**
 * Pre-defined Arc Templates
 * These are the DEFAULT arcs created at turn zero.
 * Users can customize them in Story Cards after initialization.
 */
const DEFAULT_ARC_TEMPLATES = {
    1: {
        name: "Act I: The Setup",
        events: [
            { text: "Hero established in ordinary world", completed: false },
            { text: "Disruption or call arrives unexpectedly", completed: false },
            { text: "Hero resists or fears the call", completed: false },
            { text: "Mentor provides guidance or gift", completed: false },
            { text: "Hero commits and crosses threshold", completed: false }
        ]
    },
    2: {
        name: "Act II: The Confrontation",
        events: [
            { text: "Tests reveal allies and enemies", completed: false },
            { text: "Hero approaches the central danger", completed: false },
            { text: "THE ORDEAL - darkest moment arrives", completed: false },
            { text: "Hero survives and claims reward", completed: false },
            { text: "Complication threatens the victory", completed: false }
        ]
    },
    3: {
        name: "Act III: The Resolution",
        events: [
            { text: "Chase or pursuit toward finale", completed: false },
            { text: "CLIMAX - final confrontation begins", completed: false },
            { text: "Hero transformed through sacrifice", completed: false },
            { text: "Return home with wisdom gained", completed: false }
        ]
    }
};

/**
 * Create all arc story cards at initialization (turn zero)
 * Called once during initVoglerState()
 */
function createAllArcCards() {
    log('[VOGLER-ARC] Creating pre-generated arc story cards...');

    for (let actNum = 1; actNum <= 3; actNum++) {
        createArcCard(actNum, DEFAULT_ARC_TEMPLATES[actNum]);
    }

    log('[VOGLER-ARC] All 3 act arc cards created successfully');
}

/**
 * Create a single arc story card
 */
function createArcCard(actNumber, arcTemplate) {
    const cardKey = ARC_CONFIG.storyCardPrefix + actNumber;
    const act = ACTS[actNumber];

    // Build card content
    let content = `[${arcTemplate.name}]\n`;
    content += `Stages: ${act.stages.join('-')}\n\n`;
    content += `Story Arc Events:\n`;

    arcTemplate.events.forEach((event, idx) => {
        const status = event.completed ? '✓' : '○';
        content += `${status} ${idx + 1}. ${event.text}\n`;
    });

    content += `\n[Edit these events to match your story]`;

    // Check if card already exists
    const existingCard = getCard(cardKey);
    if (existingCard) {
        // Don't overwrite user customizations
        if (ARC_CONFIG.debugLogging) {
            log('[VOGLER-ARC] Arc card ' + cardKey + ' already exists, preserving');
        }
        return;
    }

    // Create new card
    addStoryCard({
        keys: cardKey,
        entry: content,
        type: ARC_CONFIG.arcCardType,
        title: arcTemplate.name + ' Arc'
    });

    // Store in state for tracking
    state.vogler.acts[actNumber] = {
        arc: JSON.parse(JSON.stringify(arcTemplate.events)), // Deep copy
        created: 0,  // Turn zero
        cardKey: cardKey
    };

    if (ARC_CONFIG.debugLogging) {
        log('[VOGLER-ARC] Created arc card: ' + cardKey);
    }
}

/**
 * Regenerate arc for a specific act (manual only, via /vogler generate)
 * Resets the arc to default template
 */
function regenerateArcCard(actNumber) {
    if (!ARC_CONFIG.allowManualRegeneration) {
        log('[VOGLER-ARC] Manual regeneration disabled');
        return false;
    }

    const cardKey = ARC_CONFIG.storyCardPrefix + actNumber;
    const arcTemplate = DEFAULT_ARC_TEMPLATES[actNumber];

    // Remove existing card
    const existingCard = getCard(cardKey);
    if (existingCard) {
        removeStoryCard(existingCard.index);
    }

    // Reset state
    state.vogler.acts[actNumber] = null;

    // Create fresh card
    createArcCard(actNumber, arcTemplate);

    log('[VOGLER-ARC] Regenerated arc card for Act ' + actNumber);
    return true;
}


/**
 * Mark an arc event as completed and update the story card
 */
function markArcEventComplete(actNumber, eventIndex) {
    const actData = state.vogler.acts[actNumber];
    if (!actData || !actData.arc || !actData.arc[eventIndex]) {
        log('[VOGLER-ARC] Cannot mark event complete: invalid act or event');
        return false;
    }

    // Mark in state
    actData.arc[eventIndex].completed = true;
    actData.arc[eventIndex].completedTurn = info.actionCount;

    // Update story card
    updateArcCardDisplay(actNumber);

    if (ARC_CONFIG.debugLogging) {
        log('[VOGLER-ARC] Event ' + (eventIndex + 1) + ' marked complete in Act ' + actNumber);
    }

    return true;
}

/**
 * Update arc story card display to reflect current completion status
 */
function updateArcCardDisplay(actNumber) {
    const cardKey = ARC_CONFIG.storyCardPrefix + actNumber;
    const actData = state.vogler.acts[actNumber];
    const arcTemplate = DEFAULT_ARC_TEMPLATES[actNumber];

    if (!actData || !actData.arc) {
        return;
    }

    // Build updated card content
    let content = `[${arcTemplate.name}]\n`;
    content += `Stages: ${ACTS[actNumber].stages.join('-')}\n`;
    content += `Current Stage: ${VOGLER_STAGES[state.vogler.currentStage].name}\n\n`;
    content += `Story Arc Events:\n`;

    actData.arc.forEach((event, idx) => {
        const status = event.completed ? '✓' : '○';
        content += `${status} ${idx + 1}. ${event.text}\n`;
    });

    // Calculate progress
    const completed = actData.arc.filter(e => e.completed).length;
    const total = actData.arc.length;
    content += `\nProgress: ${completed}/${total} events`;

    // Update card
    const existingCard = getCard(cardKey);
    if (existingCard) {
        updateStoryCard(existingCard.index, {
            ...existingCard,
            entry: content
        });
    }
}

/**
 * Get completion percentage for an act's arc
 */
function getArcCompletionPercent(actNumber) {
    const actData = state.vogler.acts[actNumber];
    if (!actData || !actData.arc) {
        return 0;
    }

    const completed = actData.arc.filter(e => e.completed).length;
    return Math.round((completed / actData.arc.length) * 100);
}
```

---

## Part 3: Debug System

### Debug Commands

```javascript
/**
 * Debug Command Configuration
 */
const DEBUG_CONFIG = {
    prefix: '/vogler',
    enabled: true,
    verboseMode: false,

    // Display settings
    showProgressBar: true,
    showNGOState: true,
    showArcEvents: true
};

/**
 * Process Vogler debug commands
 * Returns: { handled: boolean, message: string|null }
 */
function processVoglerCommand(input) {
    const trimmed = input.trim().toLowerCase();

    if (!trimmed.startsWith(DEBUG_CONFIG.prefix)) {
        return { handled: false, message: null };
    }

    const args = trimmed.slice(DEBUG_CONFIG.prefix.length).trim().split(' ');
    const command = args[0] || 'status';

    switch (command) {
        case 'status':
            return { handled: true, message: getStatusDisplay() };

        case 'debug':
            DEBUG_CONFIG.verboseMode = !DEBUG_CONFIG.verboseMode;
            return {
                handled: true,
                message: `[VOGLER] Debug mode: ${DEBUG_CONFIG.verboseMode ? 'ON' : 'OFF'}`
            };

        case 'arc':
            return { handled: true, message: getArcDisplay() };

        case 'stage':
            const stageNum = parseInt(args[1]);
            if (stageNum && VOGLER_STAGES[stageNum]) {
                return { handled: true, message: getStageDetails(stageNum) };
            }
            return { handled: true, message: getStageDetails(state.vogler.currentStage) };

        case 'generate':
            const actNum = parseInt(args[1]) || state.vogler.currentAct;
            generateActArc(actNum);
            return {
                handled: true,
                message: `[VOGLER] Arc generation initiated for Act ${actNum}`
            };

        case 'advance':
            advanceStage();
            return {
                handled: true,
                message: `[VOGLER] Advanced to ${VOGLER_STAGES[state.vogler.currentStage].name}`
            };

        case 'reset':
            resetVoglerState();
            return {
                handled: true,
                message: '[VOGLER] System reset to Stage 1 - Ordinary World'
            };

        case 'health':
            return { handled: true, message: getHealthCheck() };

        case 'beats':
            return { handled: true, message: getBeatsDisplay() };

        case 'ngo':
            return { handled: true, message: getNGOSyncStatus() };

        case 'help':
            return { handled: true, message: getHelpDisplay() };

        default:
            return {
                handled: true,
                message: `[VOGLER] Unknown command: ${command}. Use /vogler help`
            };
    }
}

/**
 * Status Display
 */
function getStatusDisplay() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const act = ACTS[state.vogler.currentAct];
    const progress = calculateJourneyProgress();

    let display = `\n═══════════════════════════════════════════\n`;
    display += `      VOGLER'S HERO'S JOURNEY STATUS\n`;
    display += `═══════════════════════════════════════════\n\n`;

    // Current Position
    display += `📍 CURRENT POSITION\n`;
    display += `   Stage ${state.vogler.currentStage}/12: ${stage.name}\n`;
    display += `   ${act.name}\n\n`;

    // Progress Bar
    if (DEBUG_CONFIG.showProgressBar) {
        display += `📊 JOURNEY PROGRESS\n`;
        display += `   ${buildProgressBar(progress.overall, 30)} ${progress.overall}%\n\n`;

        display += `   Stage Progress: ${buildProgressBar(progress.stage, 20)} ${progress.stage}%\n`;
        display += `   Turns in stage: ${state.vogler.turnsInStage}/${stage.maxTurns}\n\n`;
    }

    // Beats
    display += `🎯 BEATS COMPLETED\n`;
    const completedBeats = state.vogler.completedBeats[state.vogler.currentStage] || [];
    display += `   ${completedBeats.length}/${stage.keyBeats.length} key beats\n`;
    if (completedBeats.length > 0) {
        completedBeats.forEach(beat => {
            display += `   ✓ ${beat}\n`;
        });
    }
    display += `\n`;

    // NGO Sync
    if (DEBUG_CONFIG.showNGOState && state.ngo) {
        display += `🌡️ NGO STATE\n`;
        display += `   Temperature: ${state.ngo.temperature}/${CONFIG.ngo.maxTemperature}\n`;
        display += `   Heat: ${state.ngo.heat}/${CONFIG.ngo.maxHeat}\n`;
        display += `   Phase: ${state.ngo.phase}\n\n`;
    }

    // Arc Status
    if (DEBUG_CONFIG.showArcEvents) {
        const actData = state.vogler.acts[state.vogler.currentAct];
        if (actData && actData.arc) {
            display += `📜 CURRENT ARC (${act.name})\n`;
            actData.arc.forEach((event, idx) => {
                const status = event.completed ? '✓' : '○';
                display += `   ${status} ${idx + 1}. ${event.text}\n`;
            });
        } else {
            display += `📜 ARC: Not yet generated\n`;
        }
    }

    display += `\n═══════════════════════════════════════════\n`;

    return display;
}

/**
 * Arc Display
 */
function getArcDisplay() {
    let display = `\n═══════════════════════════════════════════\n`;
    display += `           STORY ARCS BY ACT\n`;
    display += `═══════════════════════════════════════════\n\n`;

    for (let actNum = 1; actNum <= 3; actNum++) {
        const act = ACTS[actNum];
        const actData = state.vogler.acts[actNum];
        const isCurrent = actNum === state.vogler.currentAct;

        display += `${isCurrent ? '▶' : ' '} ${act.name}\n`;
        display += `   Stages: ${act.stages.join(', ')}\n`;

        if (actData && actData.arc) {
            display += `   Events:\n`;
            actData.arc.forEach((event, idx) => {
                const status = event.completed ? '✓' : '○';
                display += `     ${status} ${idx + 1}. ${event.text}\n`;
            });
        } else {
            display += `   [Arc not yet generated]\n`;
        }
        display += `\n`;
    }

    return display;
}

/**
 * Stage Details Display
 */
function getStageDetails(stageNum) {
    const stage = VOGLER_STAGES[stageNum];
    const isCurrent = stageNum === state.vogler.currentStage;

    let display = `\n───────────────────────────────────────────\n`;
    display += `  STAGE ${stageNum}: ${stage.name.toUpperCase()}\n`;
    display += `───────────────────────────────────────────\n\n`;

    display += `${isCurrent ? '★ CURRENT STAGE ★\n\n' : ''}`;
    display += `Act: ${ACTS[stage.act].name}\n`;
    display += `Description: ${stage.description}\n\n`;

    display += `Author's Guidance:\n${stage.guidance}\n\n`;

    display += `Key Beats:\n`;
    const completedBeats = state.vogler.completedBeats[stageNum] || [];
    stage.keyBeats.forEach(beat => {
        const isComplete = completedBeats.includes(beat);
        display += `  ${isComplete ? '✓' : '○'} ${beat}\n`;
    });
    display += `\n`;

    display += `Turn Requirements:\n`;
    display += `  Minimum: ${stage.minTurns} turns\n`;
    display += `  Maximum: ${stage.maxTurns} turns\n`;

    if (isCurrent) {
        display += `  Current: ${state.vogler.turnsInStage} turns\n`;
    }
    display += `\n`;

    display += `NGO Mapping:\n`;
    display += `  Temperature Target: ${stage.ngoMapping.temperature}\n`;
    display += `  Heat Target: ${stage.ngoMapping.heat}\n\n`;

    display += `Detection Keywords:\n`;
    display += `  ${stage.keywords.join(', ')}\n`;

    return display;
}

/**
 * Health Check Display
 */
function getHealthCheck() {
    let display = `\n═══════════════════════════════════════════\n`;
    display += `         VOGLER SYSTEM HEALTH CHECK\n`;
    display += `═══════════════════════════════════════════\n\n`;

    const checks = [];

    // State initialization
    checks.push({
        name: 'State Initialized',
        status: !!state.vogler,
        details: state.vogler ? 'OK' : 'state.vogler is undefined'
    });

    // Current stage valid
    checks.push({
        name: 'Current Stage Valid',
        status: !!VOGLER_STAGES[state.vogler?.currentStage],
        details: state.vogler?.currentStage ? `Stage ${state.vogler.currentStage}` : 'Invalid'
    });

    // Act tracking
    checks.push({
        name: 'Act Tracking',
        status: state.vogler?.currentAct >= 1 && state.vogler?.currentAct <= 3,
        details: `Act ${state.vogler?.currentAct || 'unknown'}`
    });

    // Beat tracking
    checks.push({
        name: 'Beat Tracking',
        status: typeof state.vogler?.completedBeats === 'object',
        details: state.vogler?.completedBeats ? 'Active' : 'Missing'
    });

    // Arc data
    const hasArc = state.vogler?.acts?.[state.vogler?.currentAct]?.arc;
    checks.push({
        name: 'Current Arc',
        status: !!hasArc,
        details: hasArc ? `${hasArc.length} events` : 'Not generated'
    });

    // NGO integration
    checks.push({
        name: 'NGO Integration',
        status: !!state.ngo,
        details: state.ngo ? 'Connected' : 'Not found'
    });

    // Story cards
    const actCards = [1, 2, 3].map(n => getCard(ARC_CONFIG.storyCardPrefix + n)).filter(Boolean);
    checks.push({
        name: 'Story Cards',
        status: actCards.length > 0,
        details: `${actCards.length}/3 act cards created`
    });

    // Display results
    let passed = 0;
    let failed = 0;

    checks.forEach(check => {
        const icon = check.status ? '✓' : '✗';
        display += `${icon} ${check.name}: ${check.details}\n`;
        if (check.status) passed++;
        else failed++;
    });

    display += `\n───────────────────────────────────────────\n`;
    display += `Results: ${passed} passed, ${failed} failed\n`;
    display += `Status: ${failed === 0 ? 'HEALTHY' : 'ISSUES DETECTED'}\n`;

    if (failed > 0) {
        display += `\nRecommendations:\n`;
        if (!state.vogler) {
            display += `• Run initialization: State will auto-init on next turn\n`;
        }
        if (!hasArc) {
            display += `• Generate arc: /vogler generate\n`;
        }
    }

    return display;
}

/**
 * Help Display
 */
function getHelpDisplay() {
    return `
═══════════════════════════════════════════
         VOGLER SYSTEM COMMANDS
═══════════════════════════════════════════

/vogler status    - Show current journey status
/vogler debug     - Toggle verbose debug logging
/vogler arc       - Display all act arcs
/vogler stage [n] - Show stage details (current if no number)
/vogler generate [n] - Reset Act N arc to defaults (1, 2, or 3)
/vogler advance   - Force advance to next stage
/vogler reset     - Reset journey to Stage 1 (preserves arc edits)
/vogler health    - Run system health check
/vogler beats     - Show beat completion status
/vogler ngo       - Show NGO synchronization status
/vogler help      - Show this help message

Player Commands (in-story):
@stage <1-12>    - Jump to specific stage
@beat <text>     - Mark a story beat as complete
@event <n>       - Mark arc event N as complete
@arc             - Show current arc in story

Note: All arc cards are pre-generated at turn zero.
Edit them in Story Cards to customize for your story.

═══════════════════════════════════════════`;
}

/**
 * Build visual progress bar
 */
function buildProgressBar(percent, width) {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

/**
 * Calculate journey progress percentages
 */
function calculateJourneyProgress() {
    const currentStage = state.vogler.currentStage;
    const turnsInStage = state.vogler.turnsInStage;
    const stage = VOGLER_STAGES[currentStage];

    // Overall journey progress (based on stages)
    const overall = Math.round(((currentStage - 1) / 12) * 100);

    // Stage progress (based on turns)
    const stageProgress = Math.min(100, Math.round((turnsInStage / stage.maxTurns) * 100));

    return {
        overall: overall,
        stage: stageProgress
    };
}
```

---

## Part 4: Integration with Trinity Systems

### NGO Synchronization

```javascript
/**
 * Sync Vogler stage with NGO temperature/heat
 * Called during stage transitions
 */
function syncVoglerToNGO(stageNum) {
    if (!CONFIG.ngo.enabled || !state.ngo) {
        log('[VOGLER-NGO] NGO not enabled, skipping sync');
        return;
    }

    const stage = VOGLER_STAGES[stageNum];
    const mapping = stage.ngoMapping;

    // Set target temperature based on stage
    const currentTemp = state.ngo.temperature;
    const targetTemp = mapping.temperature;

    // Gradual temperature adjustment (don't jump instantly)
    if (targetTemp > currentTemp) {
        // Rising action - increase temperature
        state.ngo.temperature = Math.min(targetTemp, currentTemp + 2);
    } else if (targetTemp < currentTemp && currentTemp > CONFIG.ngo.minTemperature) {
        // Falling action - decrease temperature
        state.ngo.temperature = Math.max(targetTemp, currentTemp - 1);
    }

    // Set heat target
    state.ngo.heat = Math.max(state.ngo.heat, mapping.heat);

    // Special phase triggers
    if (stageNum === 8) {
        // The Ordeal - trigger overheat
        state.ngo.overheatTurns = CONFIG.ngo.overheatDuration;
        state.ngo.phase = 'climax';
        log('[VOGLER-NGO] ORDEAL: Triggering overheat mode');
    } else if (stageNum === 11) {
        // Resurrection - maximum climax
        state.ngo.temperature = CONFIG.ngo.trueMaxTemperature;
        state.ngo.phase = 'climax';
        log('[VOGLER-NGO] RESURRECTION: Maximum temperature');
    } else if (stageNum === 12) {
        // Return with Elixir - trigger cooldown
        state.ngo.cooldownTurns = CONFIG.ngo.cooldownDuration;
        state.ngo.phase = 'falling';
        log('[VOGLER-NGO] RETURN: Triggering cooldown');
    }

    if (DEBUG_CONFIG.verboseMode) {
        log(`[VOGLER-NGO] Stage ${stageNum} sync: temp=${state.ngo.temperature}, heat=${state.ngo.heat}, phase=${state.ngo.phase}`);
    }
}

/**
 * Get NGO sync status display
 */
function getNGOSyncStatus() {
    if (!state.ngo) {
        return '[VOGLER-NGO] NGO system not initialized';
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const mapping = stage.ngoMapping;

    let display = `\n───────────────────────────────────────────\n`;
    display += `       NGO SYNCHRONIZATION STATUS\n`;
    display += `───────────────────────────────────────────\n\n`;

    display += `Current Stage: ${stage.name}\n\n`;

    display += `Temperature:\n`;
    display += `  Target: ${mapping.temperature}\n`;
    display += `  Current: ${state.ngo.temperature}\n`;
    display += `  Status: ${state.ngo.temperature === mapping.temperature ? '✓ Synced' : '○ Adjusting'}\n\n`;

    display += `Heat:\n`;
    display += `  Target: ${mapping.heat}\n`;
    display += `  Current: ${state.ngo.heat}\n\n`;

    display += `Phase: ${state.ngo.phase}\n`;
    display += `Overheat Turns: ${state.ngo.overheatTurns || 0}\n`;
    display += `Cooldown Turns: ${state.ngo.cooldownTurns || 0}\n`;

    return display;
}
```

### Bonepoke Integration

```javascript
/**
 * Quality gates for stage advancement
 * Uses Bonepoke scores to ensure quality before progressing
 */
function checkQualityGateForAdvancement() {
    if (!CONFIG.bonepoke.enabled || !state.bonepokeHistory) {
        return true; // Pass if Bonepoke disabled
    }

    // Get recent quality scores
    const recentScores = state.bonepokeHistory.slice(-3);
    if (recentScores.length < 2) {
        return true; // Not enough data
    }

    // Calculate average quality
    const avgQuality = recentScores.reduce((sum, s) => sum + s.average, 0) / recentScores.length;

    // Check against threshold
    const passes = avgQuality >= CONFIG.bonepoke.qualityThreshold;

    if (!passes && DEBUG_CONFIG.verboseMode) {
        log(`[VOGLER-QUALITY] Stage advancement blocked: avg quality ${avgQuality.toFixed(2)} < ${CONFIG.bonepoke.qualityThreshold}`);
    }

    return passes;
}
```

---

## Part 5: State Management

### State Initialization

```javascript
/**
 * Initialize or restore Vogler state
 * Called at turn zero - creates all story cards (config + arcs)
 */
function initVoglerState() {
    // Check for existing state
    if (state.vogler && state.vogler.initialized) {
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER] State already initialized');
        }
        return state.vogler;
    }

    log('[VOGLER] ═══════════════════════════════════════');
    log('[VOGLER] INITIALIZING VOGLER SYSTEM (Turn Zero)');
    log('[VOGLER] ═══════════════════════════════════════');

    // Initialize fresh state
    state.vogler = {
        initialized: true,
        version: '1.0.0',

        // Current position
        currentStage: 1,
        currentAct: 1,
        turnsInStage: 0,

        // Beat tracking (per stage)
        completedBeats: {
            1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
            7: [], 8: [], 9: [], 10: [], 11: [], 12: []
        },

        // Arc data (per act) - will be populated by createAllArcCards()
        acts: {
            1: null,
            2: null,
            3: null
        },

        // Manual overrides
        manualOverride: false,
        lastManualStage: null,

        // Statistics
        stats: {
            stageChanges: 0,
            beatsDetected: 0,
            eventsCompleted: 0,
            totalTurns: 0
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // CREATE ALL STORY CARDS AT TURN ZERO
    // ═══════════════════════════════════════════════════════════════

    // 1. Create configuration story cards
    createConfigurationCards();

    // 2. Create all three act arc story cards (PRE-GENERATED)
    createAllArcCards();

    log('[VOGLER] All story cards created successfully');
    log('[VOGLER] State initialized at Stage 1 - Ordinary World');

    // Sync with NGO
    syncVoglerToNGO(1);

    return state.vogler;
}

/**
 * Create configuration story cards at turn zero
 */
function createConfigurationCards() {
    log('[VOGLER] Creating configuration story cards...');

    // Vogler main config card
    const configExists = getCard('vogler-config');
    if (!configExists) {
        addStoryCard({
            keys: 'vogler-config',
            entry: `[Vogler Hero's Journey Configuration]
autoAdvance: true
minTurnsPerStage: 4
beatThreshold: 0.6
ngoSync: true
debugLogging: false

[Edit these values to customize behavior]`,
            type: 'author',
            title: 'Vogler Config'
        });
        log('[VOGLER] Created vogler-config card');
    }

    // Player's author's note card
    const playerNoteExists = getCard('player-guidance');
    if (!playerNoteExists) {
        addStoryCard({
            keys: 'player-guidance',
            entry: `[Your Personal Author's Note]
Add your style preferences, character details, or narrative goals here.
This will be combined with Vogler's stage-specific guidance.

[Edit this card to add your preferences]`,
            type: 'author',
            title: "Player's Guidance"
        });
        log('[VOGLER] Created player-guidance card');
    }
}
```

### Stage Advancement Logic

```javascript
/**
 * Check if ready to advance to next stage
 */
function checkStageAdvancement() {
    const currentStage = state.vogler.currentStage;
    const stage = VOGLER_STAGES[currentStage];
    const turnsInStage = state.vogler.turnsInStage;
    const completedBeats = state.vogler.completedBeats[currentStage] || [];

    // Already at final stage
    if (currentStage >= 12) {
        return false;
    }

    // Check minimum turns
    if (turnsInStage < stage.minTurns) {
        return false;
    }

    // Check beat completion (at least 60%)
    const beatCompletion = completedBeats.length / stage.keyBeats.length;
    const beatThreshold = 0.6;

    // Force advance if max turns exceeded
    if (turnsInStage >= stage.maxTurns) {
        if (DEBUG_CONFIG.verboseMode) {
            log(`[VOGLER] Max turns reached (${turnsInStage}/${stage.maxTurns}), forcing advancement`);
        }
        return true;
    }

    // Normal advancement: min turns + beat threshold
    if (beatCompletion >= beatThreshold) {
        if (DEBUG_CONFIG.verboseMode) {
            log(`[VOGLER] Beat threshold met (${(beatCompletion * 100).toFixed(0)}%), ready to advance`);
        }
        return true;
    }

    // Quality gate check
    if (!checkQualityGateForAdvancement()) {
        return false;
    }

    return false;
}

/**
 * Advance to next stage
 */
function advanceStage() {
    const currentStage = state.vogler.currentStage;

    if (currentStage >= 12) {
        log('[VOGLER] Journey complete! Already at Stage 12');
        return false;
    }

    const nextStage = currentStage + 1;
    const nextStageData = VOGLER_STAGES[nextStage];

    // Log transition
    log(`[VOGLER] ═══════════════════════════════════════`);
    log(`[VOGLER] STAGE TRANSITION: ${VOGLER_STAGES[currentStage].name} → ${nextStageData.name}`);
    log(`[VOGLER] ═══════════════════════════════════════`);

    // Update state
    state.vogler.currentStage = nextStage;
    state.vogler.turnsInStage = 0;
    state.vogler.stats.stageChanges++;

    // Check for act transition
    const previousAct = VOGLER_STAGES[currentStage].act;
    const newAct = nextStageData.act;

    if (newAct !== previousAct) {
        state.vogler.currentAct = newAct;
        log(`[VOGLER] ACT TRANSITION: Entering ${ACTS[newAct].name}`);

        // Generate arc for new act
        generateActArc(newAct);
    }

    // Sync with NGO
    syncVoglerToNGO(nextStage);

    // Update story card
    updateVoglerStoryCard();

    return true;
}
```

---

## Part 6: File Structure

The new Vogler-SAE system will consist of 4 files:

```
voglerSaeScripts/
├── voglerSaeSharedLibrary.js   # Core system, config, state management
├── voglerSaeContext.js         # Context injection, arc generation
├── voglerSaeInput.js           # Command processing, beat detection from player
└── voglerSaeOutput.js          # Beat detection from AI, stage advancement
```

### File Responsibilities

**voglerSaeSharedLibrary.js**
- Configuration constants (VOGLER_STAGES, ACTS, DEFAULT_ARC_TEMPLATES)
- State initialization and management
- Turn-zero story card creation (config + all 3 arc cards)
- Debug command processing
- Display/formatting utilities
- NGO/Bonepoke integration functions
- Story card management and arc completion tracking

**voglerSaeContext.js**
- Author's note injection with stage-appropriate guidance
- Current arc event injection (from pre-generated cards)
- NGO temperature/heat adjustments
- Front memory injection for @req commands
- Verbalized Sampling parameter adjustment based on stage

**voglerSaeInput.js**
- Command processing (@stage, @beat, /vogler commands)
- Player action beat detection
- Turn counting
- Input validation
- Say action enhancement (from Trinity)

**voglerSaeOutput.js**
- AI output beat detection
- Stage advancement logic
- Arc event completion marking
- Arc story card display updates
- Quality analysis integration
- Duplicate prevention
- Output cleaning

---

## Part 7: Implementation Checklist

### Phase 1: Foundation
- [ ] Create `voglerSaeSharedLibrary.js` with VOGLER_STAGES and ACTS constants
- [ ] Add DEFAULT_ARC_TEMPLATES with pre-defined arc events
- [ ] Implement state initialization with turn-zero card creation
- [ ] Port debug command system
- [ ] Create story card management functions

### Phase 2: Turn-Zero Card Creation
- [ ] Implement createConfigurationCards() for config story cards
- [ ] Implement createAllArcCards() to create all 3 act arcs at init
- [ ] Implement createArcCard() for individual arc card creation
- [ ] Ensure cards don't overwrite user customizations on reload

### Phase 3: Core Logic
- [ ] Implement beat detection system (keyword matching)
- [ ] Implement stage advancement logic
- [ ] Implement act transition handling
- [ ] Implement arc event completion tracking
- [ ] Implement updateArcCardDisplay() for live progress updates

### Phase 4: Trinity Integration
- [ ] Port NGO synchronization from old Vogler
- [ ] Integrate with existing NGO heat/temperature system
- [ ] Integrate with Bonepoke quality gates
- [ ] Integrate with Verbalized Sampling parameters
- [ ] Ensure Auto-Cards compatibility

### Phase 5: Debug Tools
- [ ] Implement all /vogler commands
- [ ] Create status display with progress bars
- [ ] Implement health check system
- [ ] Add verbose logging mode
- [ ] Implement /vogler generate (reset arc to defaults)

### Phase 6: Testing
- [ ] Test state persistence across turns
- [ ] Test turn-zero card creation
- [ ] Test stage advancement at boundaries
- [ ] Test arc event completion tracking
- [ ] Test NGO synchronization
- [ ] Test all debug commands
- [ ] Full journey playthrough test

---

## Appendix A: Configuration Story Cards

Users can customize the system via story cards:

```javascript
const CONFIGURATION_CARDS = {
    // Main Vogler config
    voglerConfig: {
        keys: "vogler-config",
        title: "Vogler Configuration",
        template: `[Vogler Hero's Journey Settings]
autoAdvance: true
turnsPerStage: 8
beatThreshold: 0.6
ngoSync: true
arcGeneration: true
debugMode: false`
    },

    // Player's custom guidance
    playerGuidance: {
        keys: "player-guidance",
        title: "Player's Author's Note",
        template: `[Your custom guidance here]
Style notes, character details, or narrative preferences.
This is preserved and combined with Vogler stage guidance.`
    },

    // Arc settings
    arcSettings: {
        keys: "arc-settings",
        title: "Arc Generation Settings",
        template: `[Story Arc Settings]
eventsPerAct: 5
autoGenerate: true
progressiveRemoval: true
turnsPerRemoval: 4`
    }
};
```

---

## Appendix B: Keyboard Reference

### Player Commands (In-Story)
| Command | Description |
|---------|-------------|
| `@stage 5` | Jump to stage 5 |
| `@beat mentors gift` | Mark beat as complete |
| `@event 2` | Mark arc event 2 as complete |
| `@temp 10` | Set NGO temperature to 10 |
| `@arc` | Display current story arc |

### Debug Commands (/vogler)
| Command | Description |
|---------|-------------|
| `/vogler status` | Full status display |
| `/vogler debug` | Toggle verbose logging |
| `/vogler arc` | Show all act arcs |
| `/vogler stage 8` | Show stage 8 details |
| `/vogler generate 1` | Reset Act 1 arc to defaults |
| `/vogler advance` | Force stage advance |
| `/vogler reset` | Reset journey to Stage 1 |
| `/vogler health` | System health check |
| `/vogler beats` | Show beat completion |
| `/vogler ngo` | Show NGO sync status |
| `/vogler help` | Show help |

**Note:** Arc cards are pre-generated at turn zero. Use Story Cards UI to edit them for your story.

---

## Appendix C: Stage-to-NGO Mapping Quick Reference

| Stage | Name | Act | Temp | Heat | NGO Phase |
|-------|------|-----|------|------|-----------|
| 1 | Ordinary World | I | 1 | 0 | exploration |
| 2 | Call to Adventure | I | 2 | 5 | exploration |
| 3 | Refusal of the Call | I | 2 | 3 | exploration |
| 4 | Meeting the Mentor | I | 3 | 2 | exploration |
| 5 | Crossing the Threshold | I | 4 | 8 | rising |
| 6 | Tests, Allies, Enemies | II | 5 | 10 | rising |
| 7 | Approach to Inmost Cave | II | 7 | 15 | rising |
| 8 | The Ordeal | II | 10 | 25 | climax (overheat) |
| 9 | Reward | II | 8 | 5 | rising |
| 10 | The Road Back | III | 9 | 20 | rising |
| 11 | Resurrection | III | 12-15 | 30 | climax (max) |
| 12 | Return with Elixir | III | 3 | 0 | falling (cooldown) |

---

**End of Blueprint**

*Next Steps: Implement Phase 1 (Foundation) following this blueprint.*
