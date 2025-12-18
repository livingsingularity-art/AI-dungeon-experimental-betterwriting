/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V3 - SHARED LIBRARY
 * Hero's Journey Story Structure System
 * ============================================================================
 *
 * FIXES FROM V2:
 * ✅ Correct API usage (positional parameters, not objects)
 * ✅ Director pattern architecture (modular, not monolithic)
 * ✅ Clean AutoCards integration (no code duplication)
 * ✅ Proper context injection (frontMemory/authorsNote)
 * ✅ Phase 0 testing validation
 *
 * @version 3.0.0
 * @license MIT
 * ============================================================================
 */

// #region Director Pattern Implementation

/**
 * Director - Function chaining system for AI Dungeon scripts
 * Based on Best Practices/director.md
 */
const Director = (() => {
    const chain = (functions, text, stop = false, type = 'library') => {
        let currentText = text;
        let currentStop = stop;

        for (const fn of functions) {
            if (typeof fn === 'string') {
                // String functions are evaluated
                try {
                    const evalFn = eval(`(${fn})`);
                    const result = evalFn.call(Director, currentText, currentStop, type);
                    if (result) {
                        currentText = result.text !== undefined ? result.text : currentText;
                        currentStop = result.stop !== undefined ? result.stop : currentStop;
                    }
                } catch (e) {
                    log('[Director] Error evaluating string function: ' + e);
                }
            } else if (typeof fn === 'function') {
                const result = fn.call(Director, currentText, currentStop, type);
                if (result) {
                    // Handle array return [text, stop]
                    if (Array.isArray(result)) {
                        currentText = result[0] !== undefined ? result[0] : currentText;
                        currentStop = result[1] !== undefined ? result[1] : currentStop;
                    } else {
                        currentText = result.text !== undefined ? result.text : currentText;
                        currentStop = result.stop !== undefined ? result.stop : currentStop;
                    }
                }
            }
        }

        return { text: currentText, stop: currentStop };
    };

    return {
        text: typeof text !== 'undefined' ? text : '',

        library: (...functions) => {
            for (const fn of functions) {
                if (typeof fn === 'function') {
                    fn.call(Director);
                }
            }
        },

        input: (...functions) => {
            const result = chain(functions, text, false, 'input');
            return result;
        },

        context: (...functions) => {
            const result = chain(functions, text, false, 'context');
            return result;
        },

        output: (...functions) => {
            const result = chain(functions, text, false, 'output');
            return result;
        },

        onInput: (...functions) => {
            return chain(functions, text, false, 'input');
        },

        onContext: (...functions) => {
            return chain(functions, text, false, 'context');
        },

        onOutput: (...functions) => {
            return chain(functions, text, false, 'output');
        },

        load: (type, ...functions) => {
            if (type === 'library') {
                return Director.library(...functions);
            } else if (type === 'input') {
                return Director.input(...functions);
            } else if (type === 'context') {
                return Director.context(...functions);
            } else if (type === 'output') {
                return Director.output(...functions);
            }
        }
    };
})();

// Make director globally available
const director = Director;

// #endregion

// #region Configuration

/**
 * Debug Configuration
 */
const DEBUG_CONFIG = {
    prefix: '/vogler',
    enabled: true,
    verboseMode: false,
    logLevel: 'info',  // 'debug' | 'info' | 'warn' | 'error'
};

/**
 * Log level hierarchy
 */
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

/**
 * Safe logging with level filtering
 */
function safeLog(message, level = 'info') {
    if (!DEBUG_CONFIG.enabled) return;

    const currentLevel = LOG_LEVELS[DEBUG_CONFIG.logLevel] || 1;
    const messageLevel = LOG_LEVELS[level] || 1;

    if (messageLevel < currentLevel) return;

    const prefixes = {
        debug: '[DEBUG]',
        info: '[INFO]',
        warn: '[WARN]',
        error: '[ERROR]'
    };

    log((prefixes[level] || '') + ' ' + message);
}

/**
 * Unified Configuration Object
 */
const CONFIG = {
    version: '3.0.0',

    // Debug settings
    debug: DEBUG_CONFIG,

    // Vogler story structure
    vogler: {
        autoAdvance: true,
        minTurnsPerStage: 4,
        maxTurnsPerStage: 12,
        beatCompletionThreshold: 0.6,  // 60% beats needed before stage advance
        deleteCompletedBeats: true,     // Progressive guidance
        storyCardPrefix: 'vogler-beats-',
        beatCardType: 'author'
    },

    // SAE Bridge settings
    bridge: {
        storyCardKey: 'sae-bridge',
        bridgeCardType: 'author',
        eventsToGenerate: 5,
        maxWordsPerEvent: 10,
        turnsPerEventRemoval: 3
    },

    // NGO integration
    ngo: {
        enabled: true,
        syncOnStageChange: true
    },

    // Author's Note layering
    authorsNote: {
        enabled: true,
        useLayered: true,
        useFrontMemory: true,  // Critical instructions at end of context
        maxLength: 500,
        playerNoteCardKey: 'player-guidance'
    },

    // Story card defaults
    cards: {
        configCardKey: 'vogler-config',
        playerGuidanceKey: 'player-guidance'
    }
};

// #endregion

// #region Vogler Stage Definitions

/**
 * The 12 Stages of the Hero's Journey
 * Based on Christopher Vogler's "The Writer's Journey"
 */
const VOGLER_STAGES = {
    1: {
        name: "Ordinary World",
        act: 1,
        description: "Establish the hero's normal life before the adventure",
        guidance: "Show the protagonist's daily routine, relationships, and unfulfilled desires.",
        keyBeats: [
            "Introduce protagonist in their normal environment",
            "Show daily routines and relationships",
            "Hint at inner desires or dissatisfaction",
            "Establish character flaws or wounds",
            "Create sympathy and identification"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 1, heat: 0 },
        keywords: ["home", "routine", "normal", "usual", "everyday"]
    },
    2: {
        name: "Call to Adventure",
        act: 1,
        description: "Something disrupts the ordinary world",
        guidance: "Present a challenge or opportunity that demands response.",
        keyBeats: [
            "Inciting incident occurs",
            "Messenger or herald arrives",
            "Discovery of a problem",
            "Opportunity presents itself",
            "Status quo is threatened"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 2, heat: 5 },
        keywords: ["message", "summon", "discover", "urgent", "must"]
    },
    3: {
        name: "Refusal of the Call",
        act: 1,
        description: "Hero hesitates or refuses initially",
        guidance: "Show fear, reluctance, or duty keeping the hero back.",
        keyBeats: [
            "Express fear or doubt",
            "Cite obligations or duty",
            "Show reluctance to change",
            "Rationalize staying",
            "Warn of danger ahead"
        ],
        minTurns: 2,
        maxTurns: 5,
        ngoMapping: { temperature: 2, heat: 3 },
        keywords: ["can't", "won't", "afraid", "impossible", "but"]
    },
    4: {
        name: "Meeting the Mentor",
        act: 1,
        description: "Hero receives guidance, training, or magical aid",
        guidance: "Introduce a wise figure who provides tools, knowledge, or confidence.",
        keyBeats: [
            "Mentor character appears",
            "Receive training or wisdom",
            "Gain magical aid or tools",
            "Learn crucial information",
            "Earn mentor's trust"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 2 },
        keywords: ["teach", "learn", "wise", "gift", "train"]
    },
    5: {
        name: "Crossing the First Threshold",
        act: 1,
        description: "Hero commits to the adventure",
        guidance: "Mark clear departure from ordinary world. Point of no return.",
        keyBeats: [
            "Make commitment to journey",
            "Pass threshold guardian",
            "Enter the special world",
            "Burn bridges behind",
            "Face first real test"
        ],
        minTurns: 3,
        maxTurns: 5,
        ngoMapping: { temperature: 4, heat: 8 },
        keywords: ["cross", "enter", "begin", "leave", "embark"]
    },
    6: {
        name: "Tests, Allies, and Enemies",
        act: 2,
        description: "Hero learns rules of the special world",
        guidance: "Series of tests that teach about the new world.",
        keyBeats: [
            "Face series of tests",
            "Meet important allies",
            "Identify clear enemies",
            "Learn rules of new world",
            "Prove worth or skill"
        ],
        minTurns: 6,
        maxTurns: 12,
        ngoMapping: { temperature: 5, heat: 10 },
        keywords: ["test", "trial", "ally", "enemy", "challenge"]
    },
    7: {
        name: "Approach to the Inmost Cave",
        act: 2,
        description: "Prepare for the major challenge",
        guidance: "Build tension as hero prepares for the ordeal.",
        keyBeats: [
            "Prepare for major challenge",
            "Make plans with allies",
            "Cross second threshold",
            "Enter dangerous place",
            "Face mounting tension"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 7, heat: 15 },
        keywords: ["prepare", "plan", "approach", "ready", "danger"]
    },
    8: {
        name: "The Ordeal",
        act: 2,
        description: "Face the greatest fear - the central crisis",
        guidance: "The hero faces death and comes out transformed.",
        keyBeats: [
            "Confront greatest fear",
            "Face death or defeat",
            "Hit rock bottom",
            "Experience transformation",
            "Die and be reborn"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 10, heat: 25 },
        keywords: ["death", "fear", "ordeal", "crisis", "face"]
    },
    9: {
        name: "Reward (Seizing the Sword)",
        act: 2,
        description: "Survive the ordeal and claim the prize",
        guidance: "Hero takes possession of the treasure won by facing death.",
        keyBeats: [
            "Survive the ordeal",
            "Claim the prize",
            "Gain new knowledge",
            "Celebrate victory",
            "Experience consequences"
        ],
        minTurns: 3,
        maxTurns: 5,
        ngoMapping: { temperature: 8, heat: 12 },
        keywords: ["reward", "prize", "claim", "victory", "treasure"]
    },
    10: {
        name: "The Road Back",
        act: 3,
        description: "Begin the journey home",
        guidance: "Hero must choose to return to the ordinary world.",
        keyBeats: [
            "Choose to return home",
            "Begin dangerous journey back",
            "Face pursuit or consequences",
            "Experience complications",
            "Renewed commitment"
        ],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 6, heat: 10 },
        keywords: ["return", "back", "home", "journey", "escape"]
    },
    11: {
        name: "Resurrection",
        act: 3,
        description: "Final and most dangerous encounter",
        guidance: "The final climax - hero is tested once more.",
        keyBeats: [
            "Final climactic battle",
            "Death and rebirth again",
            "Ultimate test of all learned",
            "Cleansing or purification",
            "Demonstrate change"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 12, heat: 30 },
        keywords: ["final", "climax", "ultimate", "last", "resurrection"]
    },
    12: {
        name: "Return with the Elixir",
        act: 3,
        description: "Hero returns transformed with the prize",
        guidance: "Show how the hero and their world have changed.",
        keyBeats: [
            "Return to ordinary world",
            "Share the elixir/knowledge",
            "Demonstrate transformation",
            "Restore balance",
            "New normal established"
        ],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 0 },
        keywords: ["return", "changed", "elixir", "gift", "home"]
    }
};

// #endregion

// #region State Management

/**
 * Initialize Vogler state structure
 * Called at turn zero
 */
function initVoglerState() {
    if (state.vogler && state.vogler.initialized) {
        return;  // Already initialized
    }

    safeLog('Initializing Vogler V3 state...', 'info');

    state.vogler = {
        initialized: true,
        version: CONFIG.version,

        // Current progress
        currentStage: 1,
        currentAct: 1,
        turnsInStage: 0,
        totalTurns: 0,

        // Beat tracking (progressive deletion)
        acts: {
            1: { remainingBeats: [], completedBeats: [] },
            2: { remainingBeats: [], completedBeats: [] },
            3: { remainingBeats: [], completedBeats: [] }
        },

        // Bridge card state
        bridge: {
            active: false,
            events: [],
            lastGenerated: 0
        },

        // NGO sync
        ngoSynced: false
    };

    // Create configuration cards
    createConfigurationCards();

    // Pre-generate all beat cards
    createAllBeatCards();

    safeLog('Vogler V3 initialized at Stage 1: Ordinary World', 'info');
}

/**
 * Create configuration story cards
 * ✅ FIXED: Uses correct API positional parameters
 */
function createConfigurationCards() {
    // Config card
    const configExists = storyCards.find(c => c.keys === CONFIG.cards.configCardKey);
    if (!configExists) {
        const configContent = `[Vogler Hero's Journey Configuration]
autoAdvance: ${CONFIG.vogler.autoAdvance}
minTurnsPerStage: ${CONFIG.vogler.minTurnsPerStage}
beatThreshold: ${CONFIG.vogler.beatCompletionThreshold}
ngoSync: ${CONFIG.ngo.enabled}

[Edit these values to customize behavior]`;

        // ✅ CORRECT: Positional parameters (keys, entry, type)
        addStoryCard(CONFIG.cards.configCardKey, configContent, 'author');
        safeLog('Created vogler-config card', 'debug');
    }

    // Player guidance card
    const guidanceExists = storyCards.find(c => c.keys === CONFIG.authorsNote.playerNoteCardKey);
    if (!guidanceExists) {
        const guidanceContent = `[Your Personal Author's Note]
Add your style preferences, character details, or narrative goals here.
This will be layered with Vogler's stage-specific guidance.

[Edit this card to add your preferences]`;

        // ✅ CORRECT: Positional parameters
        addStoryCard(CONFIG.authorsNote.playerNoteCardKey, guidanceContent, 'author');
        safeLog('Created player-guidance card', 'debug');
    }
}

/**
 * Create beat cards for all three acts
 * ✅ FIXED: Uses correct API and stores beats in state
 */
function createAllBeatCards() {
    for (let act = 1; act <= 3; act++) {
        const cardKey = CONFIG.vogler.storyCardPrefix + act;
        const cardExists = storyCards.find(c => c.keys === cardKey);

        if (!cardExists) {
            // Collect beats for this act
            const actBeats = [];
            for (const stageNum in VOGLER_STAGES) {
                const stage = VOGLER_STAGES[stageNum];
                if (stage.act === act) {
                    actBeats.push(...stage.keyBeats);
                }
            }

            // Store in state for tracking
            state.vogler.acts[act].remainingBeats = [...actBeats];

            // Create card content
            const content = `[Act ${act} Story Beats]\n\n` + actBeats.join('\n');

            // ✅ CORRECT: Positional parameters (keys, entry, type)
            addStoryCard(cardKey, content, CONFIG.vogler.beatCardType);
            safeLog(`Created beat card for Act ${act} with ${actBeats.length} beats`, 'debug');
        }
    }
}

/**
 * Get beat card and update it
 * ✅ FIXED: Uses correct updateStoryCard API
 */
function updateBeatCard(act) {
    const cardKey = CONFIG.vogler.storyCardPrefix + act;
    const card = storyCards.find(c => c.keys === cardKey);

    if (!card) {
        safeLog(`Beat card for Act ${act} not found`, 'warn');
        return;
    }

    const remainingBeats = state.vogler.acts[act].remainingBeats;

    if (remainingBeats.length === 0) {
        // No beats left - remove the card
        const cardIndex = storyCards.indexOf(card);
        removeStoryCard(cardIndex);
        safeLog(`Removed Act ${act} beat card - all beats complete`, 'info');
        return;
    }

    // Update card with remaining beats
    const content = `[Act ${act} Story Beats]\n\n` + remainingBeats.join('\n');
    const cardIndex = storyCards.indexOf(card);

    // ✅ CORRECT: Positional parameters (index, keys, entry, type)
    updateStoryCard(cardIndex, card.keys, content, card.type);
    safeLog(`Updated Act ${act} beat card: ${remainingBeats.length} beats remaining`, 'debug');
}

/**
 * Complete a beat (remove from card)
 */
function completeBeat(beatText) {
    const act = state.vogler.currentAct;
    const actBeats = state.vogler.acts[act];

    // Find and remove the beat
    const index = actBeats.remainingBeats.findIndex(b =>
        b.toLowerCase().includes(beatText.toLowerCase())
    );

    if (index !== -1) {
        const completed = actBeats.remainingBeats.splice(index, 1)[0];
        actBeats.completedBeats.push(completed);

        // Update the beat card
        updateBeatCard(act);

        safeLog(`Completed beat: "${completed}"`, 'info');
        return true;
    }

    return false;
}

// #endregion

// #region Stage Management

/**
 * Advance to the next stage
 */
function advanceStage(reason = 'manual') {
    const oldStage = state.vogler.currentStage;

    if (oldStage >= 12) {
        safeLog('Already at final stage (12)', 'warn');
        return false;
    }

    state.vogler.currentStage++;
    state.vogler.turnsInStage = 0;

    const newStage = VOGLER_STAGES[state.vogler.currentStage];
    state.vogler.currentAct = newStage.act;

    // Sync NGO if enabled
    if (CONFIG.ngo.enabled && CONFIG.ngo.syncOnStageChange) {
        syncVoglerToNGO();
    }

    safeLog(`Advanced to Stage ${state.vogler.currentStage}: ${newStage.name} (${reason})`, 'info');
    return true;
}

/**
 * Check if stage should auto-advance
 */
function checkStageAdvancement() {
    if (!CONFIG.vogler.autoAdvance) return false;

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const act = state.vogler.currentAct;
    const actBeats = state.vogler.acts[act];

    // Check minimum turns
    if (state.vogler.turnsInStage < CONFIG.vogler.minTurnsPerStage) {
        return false;
    }

    // Check beat completion percentage for current stage
    const totalBeatsForStage = stage.keyBeats.length;
    const completedInStage = stage.keyBeats.filter(beat =>
        actBeats.completedBeats.includes(beat)
    ).length;

    const completionRate = completedInStage / totalBeatsForStage;

    if (completionRate >= CONFIG.vogler.beatCompletionThreshold) {
        advanceStage('beat threshold reached');
        return true;
    }

    // Check maximum turns
    if (state.vogler.turnsInStage >= CONFIG.vogler.maxTurnsPerStage) {
        advanceStage('max turns reached');
        return true;
    }

    return false;
}

/**
 * Sync Vogler stage to NGO temperature/heat
 */
function syncVoglerToNGO() {
    if (!state.ngo) {
        safeLog('NGO state not found, skipping sync', 'debug');
        return;
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const mapping = stage.ngoMapping;

    state.ngo.temperature = mapping.temperature;
    state.ngo.heat = mapping.heat;
    state.vogler.ngoSynced = true;

    safeLog(`Synced NGO: Temp=${mapping.temperature}, Heat=${mapping.heat}`, 'debug');
}

// #endregion

// #region Bridge Card System (SAE Integration)

/**
 * Generate bridge card with AI-generated plot events
 * ✅ FIXED: Uses correct addStoryCard API
 */
function generateBridgeCard() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];

    // Create prompt for AI to generate bridge events
    const bridgePrompt = `Generate ${CONFIG.bridge.eventsToGenerate} specific plot events (max ${CONFIG.bridge.maxWordsPerEvent} words each) to move the story through "${stage.name}". Focus on concrete actions and scenes, not abstract guidance.`;

    // Mark that we need bridge generation
    state.vogler.bridge.active = true;
    state.vogler.bridge.lastGenerated = state.vogler.totalTurns;

    // Inject prompt into frontMemory for immediate processing
    state.memory.frontMemory = `[BRIDGE REQUEST]\n${bridgePrompt}\n\n` + (state.memory.frontMemory || '');

    safeLog('Bridge card generation requested', 'info');
}

/**
 * Update bridge card with events
 * ✅ FIXED: Uses correct addStoryCard/updateStoryCard API
 */
function updateBridgeCard(events) {
    const cardKey = CONFIG.bridge.storyCardKey;
    const existingCard = storyCards.find(c => c.keys === cardKey);

    if (events.length === 0) {
        // Remove bridge card if no events
        if (existingCard) {
            const index = storyCards.indexOf(existingCard);
            removeStoryCard(index);
            safeLog('Removed empty bridge card', 'debug');
        }
        state.vogler.bridge.active = false;
        return;
    }

    const content = `[Story Bridge Events]\n\n` + events.join('\n');

    if (existingCard) {
        // Update existing card
        const index = storyCards.indexOf(existingCard);
        // ✅ CORRECT: Positional parameters (index, keys, entry, type)
        updateStoryCard(index, existingCard.keys, content, existingCard.type);
        safeLog('Updated bridge card', 'debug');
    } else {
        // Create new card
        // ✅ CORRECT: Positional parameters (keys, entry, type)
        addStoryCard(cardKey, content, CONFIG.bridge.bridgeCardType);
        safeLog('Created bridge card', 'debug');
    }
}

/**
 * Process bridge events (remove completed ones)
 */
function processBridgeEvents() {
    if (!state.vogler.bridge.active) return;

    const turnsSinceGeneration = state.vogler.totalTurns - state.vogler.bridge.lastGenerated;

    if (turnsSinceGeneration >= CONFIG.bridge.turnsPerEventRemoval && state.vogler.bridge.events.length > 0) {
        // Remove first event
        const removed = state.vogler.bridge.events.shift();
        safeLog(`Removed bridge event: "${removed}"`, 'debug');

        // Update card
        updateBridgeCard(state.vogler.bridge.events);
    }
}

// #endregion

// #region Command Processing

/**
 * Process Vogler debug commands
 */
function processVoglerCommand(text) {
    if (!text.startsWith(DEBUG_CONFIG.prefix)) {
        return { text };
    }

    const parts = text.trim().split(' ');
    const command = parts[1];

    let output = '';

    switch (command) {
        case 'status':
            output = getStatusDisplay();
            break;

        case 'stage':
            if (parts[2]) {
                const stageNum = parseInt(parts[2]);
                if (stageNum >= 1 && stageNum <= 12) {
                    state.vogler.currentStage = stageNum;
                    state.vogler.currentAct = VOGLER_STAGES[stageNum].act;
                    output = `Jumped to Stage ${stageNum}: ${VOGLER_STAGES[stageNum].name}`;
                } else {
                    output = getStageDetails(stageNum);
                }
            } else {
                output = getCurrentStageInfo();
            }
            break;

        case 'beat':
        case 'beats':
            output = getBeatsDisplay();
            break;

        case 'advance':
            advanceStage('manual');
            output = `Advanced to Stage ${state.vogler.currentStage}`;
            break;

        case 'help':
            output = getHelpText();
            break;

        default:
            output = `Unknown command: ${command}. Type "/vogler help" for commands.`;
    }

    // Return output as the new text with stop flag
    return { text: '\n' + output, stop: true };
}

/**
 * Get status display
 */
function getStatusDisplay() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const actBeats = state.vogler.acts[state.vogler.currentAct];

    return `
=== VOGLER V3 STATUS ===
Stage: ${state.vogler.currentStage}/12 - ${stage.name}
Act: ${state.vogler.currentAct}/3
Turns in Stage: ${state.vogler.turnsInStage}
Total Turns: ${state.vogler.totalTurns}

Remaining Beats (Act ${state.vogler.currentAct}): ${actBeats.remainingBeats.length}
Completed Beats (Act ${state.vogler.currentAct}): ${actBeats.completedBeats.length}

Bridge Active: ${state.vogler.bridge.active}
NGO Synced: ${state.vogler.ngoSynced}
`;
}

/**
 * Get current stage info
 */
function getCurrentStageInfo() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];
    return `
=== STAGE ${state.vogler.currentStage}: ${stage.name} ===
${stage.description}

Key Beats:
${stage.keyBeats.map((b, i) => `  ${i + 1}. ${b}`).join('\n')}

Guidance: ${stage.guidance}
`;
}

/**
 * Get beats display
 */
function getBeatsDisplay() {
    const act = state.vogler.currentAct;
    const actBeats = state.vogler.acts[act];

    return `
=== ACT ${act} BEATS ===

Remaining (${actBeats.remainingBeats.length}):
${actBeats.remainingBeats.map((b, i) => `  ${i + 1}. ${b}`).join('\n')}

Completed (${actBeats.completedBeats.length}):
${actBeats.completedBeats.map((b, i) => `  ${i + 1}. ${b}`).join('\n')}
`;
}

/**
 * Get help text
 */
function getHelpText() {
    return `
=== VOGLER V3 COMMANDS ===
/vogler status       - Show current status
/vogler stage [N]    - Jump to stage N or show current stage
/vogler beats        - Show remaining/completed beats
/vogler advance      - Force advance to next stage
/vogler help         - Show this help

Player Commands (in-story):
@stage N   - Jump to stage N
@beat      - Mark next beat complete
@bridge    - Generate bridge card
`;
}

/**
 * Get stage details
 */
function getStageDetails(stageNum) {
    const stage = VOGLER_STAGES[stageNum];
    if (!stage) return `Invalid stage number: ${stageNum}`;

    return getCurrentStageInfo();
}

// #endregion

// #region Context Building

/**
 * Build layered author's note
 * Uses Best Practice from Trinity Scripts
 */
function buildLayeredAuthorsNote() {
    if (!CONFIG.authorsNote.enabled || !CONFIG.authorsNote.useLayered) {
        return '';
    }

    const layers = [];

    // Layer 1: Player's personal note
    const playerCard = storyCards.find(c => c.keys === CONFIG.authorsNote.playerNoteCardKey);
    if (playerCard && playerCard.entry) {
        layers.push(playerCard.entry);
    }

    // Layer 2: Current stage guidance
    const stage = VOGLER_STAGES[state.vogler.currentStage];
    layers.push(`[Stage ${state.vogler.currentStage}: ${stage.name}]\n${stage.guidance}`);

    // Layer 3: Beat hints (next 2 remaining beats)
    const actBeats = state.vogler.acts[state.vogler.currentAct];
    if (actBeats.remainingBeats.length > 0) {
        const nextBeats = actBeats.remainingBeats.slice(0, 2);
        layers.push(`Next beats: ${nextBeats.join(', ')}`);
    }

    // Combine with separators
    const combined = layers.join('\n---\n');

    // Enforce max length
    if (combined.length > CONFIG.authorsNote.maxLength) {
        return combined.substring(0, CONFIG.authorsNote.maxLength) + '...';
    }

    return combined;
}

/**
 * Inject stage guidance into frontMemory
 * Best Practice: frontMemory has highest priority for AI attention
 */
function injectStageGuidance() {
    if (!CONFIG.authorsNote.useFrontMemory) return;

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const guidance = `[Current Stage: ${stage.name}] ${stage.guidance}`;

    // Add to frontMemory (highest priority)
    state.memory.frontMemory = guidance + '\n\n' + (state.memory.frontMemory || '');
}

// #endregion

// #region Turn Processing

/**
 * Process turn (called at start of each lifecycle)
 */
function processTurn() {
    if (!state.vogler || !state.vogler.initialized) {
        initVoglerState();
        return;
    }

    state.vogler.totalTurns++;
    state.vogler.turnsInStage++;

    // Process bridge events
    processBridgeEvents();

    // Check for stage advancement
    checkStageAdvancement();

    safeLog(`Turn ${state.vogler.totalTurns}, Stage ${state.vogler.currentStage}, Turn in stage: ${state.vogler.turnsInStage}`, 'debug');
}

// #endregion

// Initialize on first load
director.library(() => {
    if (!state.vogler) {
        initVoglerState();
    }
    processTurn();
});
