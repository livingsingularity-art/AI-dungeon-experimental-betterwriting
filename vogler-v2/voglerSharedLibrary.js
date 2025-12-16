/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V2 - SHARED LIBRARY
 * Two-Tier Story Arc System with SAE Integration
 * ============================================================================
 *
 * TIER 1: Vogler Beat Cards (Pre-generated at turn zero)
 *   - Structural story beats (WHAT needs to happen)
 *   - Completed beats are DELETED from cards
 *
 * TIER 2: SAE Bridge Cards (Generated on-demand)
 *   - Specific plot events (HOW to move between beats)
 *   - AI-generated based on current story context
 *
 * @version 2.0.0
 * @license MIT
 * ============================================================================
 */

// #region Configuration

/**
 * Debug Configuration
 */
const DEBUG_CONFIG = {
    prefix: '/vogler',
    enabled: true,
    verboseMode: false,
    showProgressBar: true,
    showNGOState: true,
    showBeatStatus: true,
    // Log levels: 'debug' < 'info' < 'warn' < 'error'
    logLevel: 'info',
    // Show debug story card with real-time status
    showDebugCard: false,
    debugCardKey: 'vogler-debug'
};

/**
 * Log level hierarchy for filtering
 */
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

/**
 * Safe logging utility with level filtering and prefixes
 * @param {string} message - The message to log
 * @param {'debug'|'info'|'warn'|'error'} level - Log level (default: 'info')
 */
function safeLog(message, level = 'info') {
    if (!DEBUG_CONFIG.enabled) return;

    const currentLevel = LOG_LEVELS[DEBUG_CONFIG.logLevel] || 0;
    const messageLevel = LOG_LEVELS[level] || 1;

    if (messageLevel < currentLevel) return;

    const prefixes = {
        debug: '[DEBUG]',
        info: '[INFO]',
        warn: '[WARN]',
        error: '[ERROR]'
    };

    const prefix = prefixes[level] || '';
    log(prefix + ' ' + message);
}

/**
 * Vogler Beat Configuration (Tier 1)
 */
const VOGLER_BEAT_CONFIG = {
    preGenerateAllBeats: true,
    beatsPerAct: { 1: 5, 2: 5, 3: 4 },
    storyCardPrefix: "vogler-beats-",
    beatCardType: "author",
    deleteCompletedBeats: true,
    debugLogging: true
};

/**
 * SAE Bridge Configuration (Tier 2)
 */
const SAE_BRIDGE_CONFIG = {
    storyCardKey: "sae-bridge",
    bridgeCardType: "author",
    eventsToGenerate: 5,
    maxWordsPerEvent: 10,
    turnsPerEventRemoval: 3,
    debugLogging: true
};

/**
 * NGO Integration Configuration
 */
const NGO_CONFIG = {
    enabled: true,
    syncOnStageChange: true,
    debugLogging: true
};

/**
 * ============================================================================
 * UNIFIED CONFIG OBJECT
 * Consolidates all configuration with additional P3+ features
 * ============================================================================
 */
const CONFIG = {
    // System version
    version: '2.1.0',

    // Debug settings (references DEBUG_CONFIG)
    debug: DEBUG_CONFIG,

    // Vogler story structure
    vogler: {
        ...VOGLER_BEAT_CONFIG,
        autoAdvance: true,
        minTurnsPerStage: 4,
        maxTurnsPerStage: 12,
        beatCompletionThreshold: 0.6, // 60% beats needed before stage advance
        stageKeywordMatching: true
    },

    // SAE Bridge settings (references SAE_BRIDGE_CONFIG)
    bridge: SAE_BRIDGE_CONFIG,

    // NGO integration (references NGO_CONFIG)
    ngo: NGO_CONFIG,

    // Author's Note layering system
    authorsNote: {
        enabled: true,
        // Layer priorities (higher = more important, added last)
        layers: {
            playerNote: 1,      // Player's stable author's note
            stageGuidance: 2,   // Vogler stage-specific guidance
            beatHints: 3,       // Current beat hints
            tempEffects: 4      // Temporary command effects (@temp)
        },
        maxLength: 500,         // Max combined length
        separator: '\n',        // Layer separator
        playerNoteCardKey: 'player-guidance',
        preserveOnOutput: true  // Restore after context hook
    },

    // Output cleaning settings
    output: {
        cleanXmlTags: true,
        cleanMarkerLeaks: true,
        cleanExcessiveNewlines: true,
        maxConsecutiveNewlines: 3,
        removeDuplicates: true,
        duplicateCheckLength: 50,
        // XML tags to remove
        xmlTagsToRemove: ['response', 'probability', 'text', 'candidate', 'selected'],
        // Marker patterns to remove
        markerPatterns: ['\\[Stage:.*?\\]', '\\[Beat:.*?\\]', '\\[VOGLER.*?\\]', '\\[SAE.*?\\]']
    },

    // Player commands
    commands: {
        prefix: '@',
        // Available commands
        stage: true,    // @stage <n>
        beat: true,     // @beat
        bridge: true,   // @bridge
        temp: true,     // @temp <text> (temporary author's note)
        skip: true      // @skip (skip current beat)
    },

    // Story card defaults
    cards: {
        defaultType: 'author',
        configCardKey: 'vogler-config',
        playerGuidanceKey: 'player-guidance',
        debugCardKey: 'vogler-debug'
    },

    // Future integrations (hooks for P4)
    integrations: {
        autoCards: false,
        bonepoke: false,
        verbalizedSampling: false,
        wordBanks: false
    }
};

// Ensure backwards compatibility - keep original const references working
Object.assign(DEBUG_CONFIG, CONFIG.debug);
Object.assign(VOGLER_BEAT_CONFIG, CONFIG.vogler);
Object.assign(SAE_BRIDGE_CONFIG, CONFIG.bridge);
Object.assign(NGO_CONFIG, CONFIG.ngo);

// #endregion

// #region Stage Definitions

/**
 * Vogler's 12-Stage Hero's Journey
 */
const VOGLER_STAGES = {
    // ACT I - THE SETUP (Stages 1-5)
    1: {
        name: "Ordinary World",
        act: 1,
        description: "Establish the hero's normal life before the adventure",
        guidance: "Show the protagonist's daily routine, relationships, and unfulfilled desires. Build sympathy and identification.",
        keyBeats: ["introduce protagonist", "show normal life", "hint at inner desire", "establish relationships", "show flaws or wounds"],
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
        keyBeats: ["inciting incident", "messenger arrives", "discovery of problem", "opportunity presents", "status quo threatened"],
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
        keyBeats: ["express fear", "cite duty", "show reluctance", "rationalize staying", "warn of danger"],
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
        keyBeats: ["mentor appears", "receive training", "gain magical aid", "learn crucial info", "earn mentor's trust"],
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
        keyBeats: ["make commitment", "pass threshold guardian", "enter special world", "burn bridges", "first test"],
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
        keyBeats: ["face first test", "meet ally", "identify enemy", "learn rules", "prove worth"],
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
        keyBeats: ["gather intelligence", "make plans", "team preparation", "face inner fears", "approach danger"],
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
        keyBeats: ["face death", "all seems lost", "inner revelation", "symbolic death", "transformation"],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 10, heat: 25 },
        keywords: ["die", "death", "end", "lose", "fail", "dark", "worst", "desperate", "sacrifice"]
    },
    9: {
        name: "Reward (Seizing the Sword)",
        act: 2,
        description: "Hero survives death and claims reward",
        guidance: "Celebration of survival. Hero gains treasure, knowledge, or reconciliation. Brief respite before road back.",
        keyBeats: ["claim reward", "celebrate survival", "gain insight", "team bonding", "acknowledge change"],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 8, heat: 5 },
        keywords: ["reward", "gain", "treasure", "victory", "win", "earn", "achieve", "succeed"]
    },
    // ACT III - THE RESOLUTION (Stages 10-12)
    10: {
        name: "The Road Back",
        act: 3,
        description: "Hero begins journey back to Ordinary World",
        guidance: "Chase scenes, pursuit by villain remnants. Recommitment to completing adventure. Ticking clock.",
        keyBeats: ["pursue or be pursued", "recommit to goal", "face setbacks", "race against time", "regroup"],
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
        keyBeats: ["final battle", "use all skills", "sacrifice self", "transform fully", "defeat antagonist"],
        minTurns: 4,
        maxTurns: 8,
        ngoMapping: { temperature: 12, heat: 30 },
        keywords: ["final", "last", "ultimate", "climax", "everything", "all", "complete"]
    },
    12: {
        name: "Return with the Elixir",
        act: 3,
        description: "Hero returns transformed with boon for community",
        guidance: "RESOLUTION. Show changed hero. Demonstrate how journey transformed them. Share wisdom with ordinary world.",
        keyBeats: ["return home", "share wisdom", "demonstrate change", "heal wounds", "new equilibrium"],
        minTurns: 3,
        maxTurns: 6,
        ngoMapping: { temperature: 3, heat: 0 },
        keywords: ["return", "home", "peace", "heal", "new", "changed", "wisdom", "share"]
    }
};

/**
 * Three-Act Structure
 */
const ACTS = {
    1: {
        name: "Act I: The Setup",
        stages: [1, 2, 3, 4, 5],
        description: "Establish ordinary world, introduce the call, and cross the threshold",
        ngoPhase: "exploration"
    },
    2: {
        name: "Act II: The Confrontation",
        stages: [6, 7, 8, 9],
        description: "Tests and trials leading to the central crisis and reward",
        ngoPhase: "rising"
    },
    3: {
        name: "Act III: The Resolution",
        stages: [10, 11, 12],
        description: "The road back, resurrection/climax, and return with elixir",
        ngoPhase: "climax"
    }
};

/**
 * Pre-defined Beat Templates (Tier 1)
 * Completed beats are DELETED from cards, not marked
 */
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

// #endregion

// #region Utility Functions

/**
 * Get a story card by its key
 */
function getCard(key) {
    if (!storyCards || !Array.isArray(storyCards)) return null;
    for (let i = 0; i < storyCards.length; i++) {
        if (storyCards[i].keys === key) {
            return { ...storyCards[i], index: i };
        }
    }
    return null;
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

    const overall = Math.round(((currentStage - 1) / 12) * 100);
    const stageProgress = Math.min(100, Math.round((turnsInStage / stage.maxTurns) * 100));

    return { overall, stage: stageProgress };
}

/**
 * Get beat completion percentage for an act
 */
function getBeatCompletionPercent(actNumber) {
    const actData = state.vogler.acts[actNumber];
    const template = DEFAULT_BEAT_TEMPLATES[actNumber];
    if (!actData || !template) return 0;

    const total = template.beats.length;
    const remaining = actData.remainingBeats?.length || total;
    const completed = total - remaining;

    return Math.round((completed / total) * 100);
}

/**
 * Get a story card by key OR predicate function
 * @param {string|function} keyOrPredicate - Key string or predicate function (card) => boolean
 * @returns {object|null} Card with index property, or null if not found
 */
function getCardAdvanced(keyOrPredicate) {
    if (!storyCards || !Array.isArray(storyCards)) return null;

    const predicate = typeof keyOrPredicate === 'function'
        ? keyOrPredicate
        : (card) => card.keys === keyOrPredicate;

    for (let i = 0; i < storyCards.length; i++) {
        if (predicate(storyCards[i])) {
            return { ...storyCards[i], index: i };
        }
    }
    return null;
}

/**
 * Get all cards matching a predicate
 * @param {function} predicate - Function (card) => boolean
 * @returns {array} Array of cards with index properties
 */
function getCardsByPredicate(predicate) {
    if (!storyCards || !Array.isArray(storyCards)) return [];

    const results = [];
    for (let i = 0; i < storyCards.length; i++) {
        if (predicate(storyCards[i])) {
            results.push({ ...storyCards[i], index: i });
        }
    }
    return results;
}

/**
 * Get all cards of a specific type
 * @param {string} cardType - The type to filter by
 */
function getCardsByType(cardType) {
    return getCardsByPredicate(card => card.type === cardType);
}

/**
 * Get all cards with keys starting with a prefix
 * @param {string} prefix - The key prefix to match
 */
function getCardsByPrefix(prefix) {
    return getCardsByPredicate(card => card.keys && card.keys.startsWith(prefix));
}

/**
 * Safe wrapper for addStoryCard with validation and error handling
 * @param {string} keys - Card keys
 * @param {string} entry - Card content
 * @param {string} type - Card type
 * @param {string} name - Card display name
 * @param {string} notes - Optional notes
 * @returns {object|null} Created card info or null on failure
 */
function buildCard(keys, entry, type, name, notes) {
    try {
        // Validate inputs
        if (!keys || typeof keys !== 'string') {
            safeLog('[buildCard] Invalid keys: ' + keys, 'error');
            return null;
        }
        if (entry === undefined || entry === null) {
            entry = '';
        }
        if (!type) type = 'Custom';
        if (!name) name = keys;

        // Check for duplicate keys
        const existing = getCard(keys);
        if (existing) {
            safeLog('[buildCard] Card with key "' + keys + '" already exists at index ' + existing.index, 'warn');
            return existing;
        }

        // Create the card
        const index = addStoryCard(keys, entry, type, name, notes || '');

        safeLog('[buildCard] Created card "' + keys + '" at index ' + index, 'debug');

        // Return card info
        return {
            keys: keys,
            entry: entry,
            type: type,
            title: name,
            index: index - 1 // addStoryCard returns length, index is length - 1
        };
    } catch (error) {
        safeLog('[buildCard] Error creating card: ' + error.message, 'error');
        return null;
    }
}

/**
 * Safe wrapper for removeStoryCard with error handling
 * @param {string|number} keyOrIndex - Card key or index to remove
 * @returns {boolean} True if removed successfully
 */
function removeCardSafe(keyOrIndex) {
    try {
        let index;

        if (typeof keyOrIndex === 'string') {
            const card = getCard(keyOrIndex);
            if (!card) {
                safeLog('[removeCard] Card not found: ' + keyOrIndex, 'warn');
                return false;
            }
            index = card.index;
        } else {
            index = keyOrIndex;
        }

        if (index < 0 || index >= storyCards.length) {
            safeLog('[removeCard] Invalid index: ' + index, 'error');
            return false;
        }

        const cardKeys = storyCards[index]?.keys || 'unknown';
        removeStoryCard(index);

        safeLog('[removeCard] Removed card "' + cardKeys + '" at index ' + index, 'debug');
        return true;
    } catch (error) {
        safeLog('[removeCard] Error: ' + error.message, 'error');
        return false;
    }
}

/**
 * Validate Vogler state integrity
 * @returns {object} Validation results with passed, failed arrays
 */
function validateState() {
    const results = { passed: [], failed: [], warnings: [] };

    // Check state.vogler exists
    if (!state.vogler) {
        results.failed.push('state.vogler is undefined');
        return results;
    }
    results.passed.push('state.vogler exists');

    // Check initialization
    if (!state.vogler.initialized) {
        results.failed.push('state.vogler.initialized is false');
    } else {
        results.passed.push('Vogler initialized');
    }

    // Check current stage valid
    if (!VOGLER_STAGES[state.vogler.currentStage]) {
        results.failed.push('Invalid currentStage: ' + state.vogler.currentStage);
    } else {
        results.passed.push('Valid currentStage: ' + state.vogler.currentStage);
    }

    // Check act tracking
    if (state.vogler.currentAct < 1 || state.vogler.currentAct > 3) {
        results.failed.push('Invalid currentAct: ' + state.vogler.currentAct);
    } else {
        results.passed.push('Valid currentAct: ' + state.vogler.currentAct);
    }

    // Check beat cards exist
    for (let i = 1; i <= 3; i++) {
        const card = getCard(VOGLER_BEAT_CONFIG.storyCardPrefix + i);
        if (!card) {
            results.warnings.push('Beat card missing for Act ' + i);
        } else {
            results.passed.push('Beat card exists for Act ' + i);
        }
    }

    // Check acts data
    for (let i = 1; i <= 3; i++) {
        const actData = state.vogler.acts[i];
        if (!actData) {
            results.warnings.push('Act ' + i + ' data not initialized');
        } else if (!actData.remainingBeats) {
            results.warnings.push('Act ' + i + ' missing remainingBeats array');
        }
    }

    return results;
}

/**
 * Create or update the debug story card
 */
function updateDebugCard() {
    if (!DEBUG_CONFIG.showDebugCard) return;

    const stage = VOGLER_STAGES[state.vogler?.currentStage] || { name: 'Unknown' };
    const actData = state.vogler?.acts?.[state.vogler?.currentAct];

    let content = '[VOGLER DEBUG - Turn ' + (state.vogler?.stats?.totalTurns || 0) + ']\n\n';
    content += 'Stage: ' + (state.vogler?.currentStage || '?') + '/12 - ' + stage.name + '\n';
    content += 'Act: ' + (state.vogler?.currentAct || '?') + '\n';
    content += 'Turns in Stage: ' + (state.vogler?.turnsInStage || 0) + '/' + (stage.maxTurns || '?') + '\n\n';

    if (actData?.remainingBeats) {
        content += 'Remaining Beats: ' + actData.remainingBeats.length + '\n';
        if (actData.remainingBeats[0]) {
            content += 'Next Beat: ' + actData.remainingBeats[0] + '\n';
        }
    }

    content += '\nStats:\n';
    content += '- Stage Changes: ' + (state.vogler?.stats?.stageChanges || 0) + '\n';
    content += '- Beats Completed: ' + (state.vogler?.stats?.beatsCompleted || 0) + '\n';
    content += '- Bridges Generated: ' + (state.vogler?.stats?.bridgesGenerated || 0) + '\n';

    const existingCard = getCard(DEBUG_CONFIG.debugCardKey);
    if (existingCard) {
        try {
            updateStoryCard(
                existingCard.index,
                existingCard.keys,
                content,
                existingCard.type
            );
        } catch (e) {
            safeLog('[updateDebugCard] Update failed: ' + e.message, 'error');
        }
    } else {
        buildCard(DEBUG_CONFIG.debugCardKey, content, 'author', 'Vogler Debug');
    }
}

/**
 * Dump state to log for debugging
 */
function dumpState() {
    safeLog('=== STATE DUMP ===', 'debug');
    safeLog('Version: ' + (state.vogler?.version || 'unknown'), 'debug');
    safeLog('Stage: ' + state.vogler?.currentStage + ' / Act: ' + state.vogler?.currentAct, 'debug');
    safeLog('Turns in Stage: ' + state.vogler?.turnsInStage, 'debug');
    safeLog('Total Turns: ' + state.vogler?.stats?.totalTurns, 'debug');

    for (let i = 1; i <= 3; i++) {
        const actData = state.vogler?.acts?.[i];
        if (actData) {
            safeLog('Act ' + i + ': ' + (actData.remainingBeats?.length || 0) + ' beats remaining', 'debug');
        }
    }

    safeLog('Story Cards: ' + (storyCards?.length || 0) + ' total', 'debug');
    safeLog('=== END DUMP ===', 'debug');
}

/**
 * Dump all story cards to log
 */
function dumpCards() {
    safeLog('=== STORY CARDS ===', 'debug');
    if (!storyCards || storyCards.length === 0) {
        safeLog('No story cards found', 'debug');
        return;
    }

    for (let i = 0; i < storyCards.length; i++) {
        const card = storyCards[i];
        safeLog('[' + i + '] keys="' + card.keys + '" type="' + card.type + '" title="' + card.title + '"', 'debug');
    }
    safeLog('=== END CARDS ===', 'debug');
}

// #endregion

// #region State Management

/**
 * Initialize or restore Vogler state
 * Called at turn zero - creates all story cards (config + beat cards)
 */
function initVoglerState() {
    if (state.vogler && state.vogler.initialized) {
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER] State already initialized');
        }
        return state.vogler;
    }

    log('[VOGLER] ═══════════════════════════════════════');
    log('[VOGLER] INITIALIZING VOGLER V2 (Turn Zero)');
    log('[VOGLER] ═══════════════════════════════════════');

    state.vogler = {
        initialized: true,
        version: '2.0.0',

        // Current position
        currentStage: 1,
        currentAct: 1,
        turnsInStage: 0,

        // TIER 1: Beat data (per act)
        acts: { 1: null, 2: null, 3: null },

        // TIER 2: SAE Bridge (on-demand)
        bridge: null,
        pendingBridgeGeneration: null,
        generateBridgeThisTurn: false,

        // Manual overrides
        manualOverride: false,
        lastManualStage: null,

        // Statistics
        stats: {
            stageChanges: 0,
            beatsCompleted: 0,
            bridgesGenerated: 0,
            totalTurns: 0
        }
    };

    // Create all story cards at turn zero
    createConfigurationCards();
    createAllBeatCards();

    log('[VOGLER] All story cards created successfully');
    log('[VOGLER] State initialized at Stage 1 - Ordinary World');
    log('[VOGLER] Use @bridge to generate SAE-style plot guidance');

    // Sync with NGO if available
    syncVoglerToNGO(1);

    return state.vogler;
}

/**
 * Create configuration story cards at turn zero
 */
function createConfigurationCards() {
    log('[VOGLER] Creating configuration story cards...');

    const configExists = getCard('vogler-config');
    if (!configExists) {
        addStoryCard(
            'vogler-config',
            `[Vogler Hero's Journey Configuration]
autoAdvance: true
minTurnsPerStage: 4
beatThreshold: 0.6
ngoSync: true
debugLogging: false

[Edit these values to customize behavior]`,
            'author',
            'Vogler Config'
        );
        log('[VOGLER] Created vogler-config card');
    }

    const playerNoteExists = getCard('player-guidance');
    if (!playerNoteExists) {
        addStoryCard(
            'player-guidance',
            `[Your Personal Author's Note]
Add your style preferences, character details, or narrative goals here.
This will be combined with Vogler's stage-specific guidance.

[Edit this card to add your preferences]`,
            'author',
            "Player's Guidance"
        );
        log('[VOGLER] Created player-guidance card');
    }
}

// #endregion

// #region Tier 1: Beat Cards

/**
 * Create all beat story cards at initialization (turn zero)
 */
function createAllBeatCards() {
    log('[VOGLER-BEAT] Creating pre-generated beat story cards...');

    for (let actNum = 1; actNum <= 3; actNum++) {
        createBeatCard(actNum, DEFAULT_BEAT_TEMPLATES[actNum]);
    }

    log('[VOGLER-BEAT] All 3 act beat cards created successfully');
}

/**
 * Create a single beat story card
 */
function createBeatCard(actNumber, beatTemplate) {
    const cardKey = VOGLER_BEAT_CONFIG.storyCardPrefix + actNumber;
    const act = ACTS[actNumber];

    let content = `[${beatTemplate.name} - Remaining Beats]\n`;
    content += `Stages: ${act.stages.join('-')}\n\n`;

    beatTemplate.beats.forEach(beat => {
        content += `• ${beat}\n`;
    });

    content += `\n[Beats are deleted when completed]`;

    const existingCard = getCard(cardKey);
    if (existingCard) {
        if (VOGLER_BEAT_CONFIG.debugLogging) {
            log('[VOGLER-BEAT] Beat card ' + cardKey + ' already exists, preserving');
        }
        return;
    }

    addStoryCard(
        cardKey,
        content,
        VOGLER_BEAT_CONFIG.beatCardType,
        beatTemplate.name + ' Beats'
    );

    state.vogler.acts[actNumber] = {
        remainingBeats: [...beatTemplate.beats],
        completedBeats: [],
        created: 0,
        cardKey: cardKey
    };

    if (VOGLER_BEAT_CONFIG.debugLogging) {
        log('[VOGLER-BEAT] Created beat card: ' + cardKey);
    }
}

/**
 * Complete a beat - DELETES it from the card
 */
function completeBeat(actNumber, beatIndex) {
    const actData = state.vogler.acts[actNumber];
    if (!actData || !actData.remainingBeats || beatIndex >= actData.remainingBeats.length) {
        log('[VOGLER-BEAT] Cannot complete beat: invalid act or beat index');
        return false;
    }

    const completedBeat = actData.remainingBeats[beatIndex];

    actData.completedBeats.push({
        text: completedBeat,
        completedTurn: info.actionCount
    });

    actData.remainingBeats.splice(beatIndex, 1);
    updateBeatCardDisplay(actNumber);

    state.vogler.stats.beatsCompleted++;

    if (VOGLER_BEAT_CONFIG.debugLogging) {
        log('[VOGLER-BEAT] Beat completed and removed: "' + completedBeat + '"');
        log('[VOGLER-BEAT] Remaining beats in Act ' + actNumber + ': ' + actData.remainingBeats.length);
    }

    if (actData.remainingBeats.length === 0) {
        log('[VOGLER-BEAT] ★ Act ' + actNumber + ' complete! All beats achieved.');
    }

    return true;
}

/**
 * Complete the next beat in the current act (index 0)
 */
function completeNextBeat() {
    const currentAct = state.vogler.currentAct;
    const actData = state.vogler.acts[currentAct];

    if (!actData || !actData.remainingBeats || actData.remainingBeats.length === 0) {
        log('[VOGLER-BEAT] No remaining beats in current act');
        return false;
    }

    return completeBeat(currentAct, 0);
}

/**
 * Update beat story card - shows ONLY remaining beats
 */
function updateBeatCardDisplay(actNumber) {
    const cardKey = VOGLER_BEAT_CONFIG.storyCardPrefix + actNumber;
    const actData = state.vogler.acts[actNumber];
    const beatTemplate = DEFAULT_BEAT_TEMPLATES[actNumber];

    if (!actData) return;

    let content = `[${beatTemplate.name} - Remaining Beats]\n`;
    content += `Current Stage: ${VOGLER_STAGES[state.vogler.currentStage].name}\n\n`;

    if (actData.remainingBeats.length === 0) {
        content += `★ ALL BEATS COMPLETE ★\n`;
        content += `This act's structural goals achieved.\n`;
    } else {
        actData.remainingBeats.forEach(beat => {
            content += `• ${beat}\n`;
        });
    }

    const existingCard = getCard(cardKey);
    if (existingCard) {
        updateStoryCard(
            existingCard.index,
            existingCard.keys,
            content,
            existingCard.type
        );
    }
}

/**
 * Reset beat card to defaults
 */
function resetBeatCard(actNumber) {
    const cardKey = VOGLER_BEAT_CONFIG.storyCardPrefix + actNumber;
    const beatTemplate = DEFAULT_BEAT_TEMPLATES[actNumber];

    const existingCard = getCard(cardKey);
    if (existingCard) {
        removeStoryCard(existingCard.index);
    }

    state.vogler.acts[actNumber] = null;
    createBeatCard(actNumber, beatTemplate);

    log('[VOGLER-BEAT] Reset beat card for Act ' + actNumber);
    return true;
}

// #endregion

// #region Tier 2: SAE Bridge Cards

/**
 * Generate SAE-style bridge card via command
 */
function generateBridgeCard() {
    const currentAct = state.vogler.currentAct;
    const currentStage = state.vogler.currentStage;
    const actData = state.vogler.acts[currentAct];

    const remainingBeats = actData?.remainingBeats || [];
    const nextBeat = remainingBeats[0] || "story continues";

    const recentHistory = history.slice(-8).map(h => h.text).join(' ').slice(-800);
    const prompt = buildBridgePrompt(nextBeat, recentHistory, currentStage);

    state.vogler.pendingBridgeGeneration = {
        prompt: prompt,
        targetBeat: nextBeat,
        attempts: 0
    };

    state.vogler.generateBridgeThisTurn = true;

    if (SAE_BRIDGE_CONFIG.debugLogging) {
        log('[SAE-BRIDGE] Bridge generation initiated');
        log('[SAE-BRIDGE] Target beat: ' + nextBeat);
    }

    state.vogler.stats.bridgesGenerated++;
    return prompt;
}

/**
 * Build the bridge generation prompt
 */
function buildBridgePrompt(nextBeat, recentHistory, currentStage) {
    const stage = VOGLER_STAGES[currentStage];

    return `[STORY BRIDGE GENERATION]

Current narrative:
${recentHistory}

Current stage: ${stage.name}
Next structural beat: ${nextBeat}

Generate ${SAE_BRIDGE_CONFIG.eventsToGenerate} specific plot events that will move the story toward the next beat.
Each event should:
- Be under ${SAE_BRIDGE_CONFIG.maxWordsPerEvent} words
- Use character names from the story
- Be specific and actionable
- Create a clear path toward: "${nextBeat}"

Format as numbered list:
1. [First specific event]
2. [Second specific event]
...

[END GENERATION]`;
}

/**
 * Parse and store generated bridge events
 */
function storeBridgeEvents(generatedText) {
    const events = [];
    const lines = generatedText.split('\n');

    for (const line of lines) {
        const match = line.match(/^\d+[\.\)]\s*(.+)$/);
        if (match && match[1].trim()) {
            events.push(match[1].trim());
        }
    }

    if (events.length === 0) {
        log('[SAE-BRIDGE] Failed to parse bridge events');
        return false;
    }

    state.vogler.bridge = {
        events: events,
        created: info.actionCount,
        lastRemoval: info.actionCount
    };

    updateBridgeCard();
    log('[SAE-BRIDGE] Stored ' + events.length + ' bridge events');
    return true;
}

/**
 * Update bridge story card display
 */
function updateBridgeCard() {
    const bridgeData = state.vogler.bridge;
    if (!bridgeData || !bridgeData.events) return;

    let content = `[Story Bridge - Current Arc]\n`;
    content += `Moving toward: ${state.vogler.acts[state.vogler.currentAct]?.remainingBeats?.[0] || 'next beat'}\n\n`;

    bridgeData.events.forEach((event, idx) => {
        content += `${idx + 1}. ${event}\n`;
    });

    const existingCard = getCard(SAE_BRIDGE_CONFIG.storyCardKey);
    if (existingCard) {
        updateStoryCard(
            existingCard.index,
            existingCard.keys,
            content,
            existingCard.type
        );
    } else {
        addStoryCard(
            SAE_BRIDGE_CONFIG.storyCardKey,
            content,
            SAE_BRIDGE_CONFIG.bridgeCardType,
            'Story Bridge'
        );
    }
}

/**
 * Progressive removal of bridge events
 */
function progressiveBridgeRemoval() {
    const bridgeData = state.vogler.bridge;
    if (!bridgeData || !bridgeData.events || bridgeData.events.length === 0) return;

    const turnsSinceRemoval = info.actionCount - bridgeData.lastRemoval;

    if (turnsSinceRemoval >= SAE_BRIDGE_CONFIG.turnsPerEventRemoval) {
        const removed = bridgeData.events.shift();
        bridgeData.lastRemoval = info.actionCount;

        if (SAE_BRIDGE_CONFIG.debugLogging) {
            log('[SAE-BRIDGE] Removed bridge event: "' + removed + '"');
        }

        updateBridgeCard();

        if (bridgeData.events.length === 0) {
            const card = getCard(SAE_BRIDGE_CONFIG.storyCardKey);
            if (card) {
                removeStoryCard(card.index);
            }
            state.vogler.bridge = null;
            log('[SAE-BRIDGE] Bridge completed and removed');
        }
    }
}

/**
 * Remove bridge card manually
 */
function removeBridgeCard() {
    const card = getCard(SAE_BRIDGE_CONFIG.storyCardKey);
    if (card) {
        removeStoryCard(card.index);
    }
    state.vogler.bridge = null;
    log('[SAE-BRIDGE] Bridge card removed');
}

// #endregion

// #region Stage Management

/**
 * Check if ready to advance to next stage
 */
function checkStageAdvancement() {
    const currentStage = state.vogler.currentStage;
    const stage = VOGLER_STAGES[currentStage];
    const turnsInStage = state.vogler.turnsInStage;
    const currentAct = state.vogler.currentAct;
    const actData = state.vogler.acts[currentAct];

    if (currentStage >= 12) return false;
    if (turnsInStage < stage.minTurns) return false;

    // Check beat completion (at least 60%)
    if (actData && actData.remainingBeats) {
        const template = DEFAULT_BEAT_TEMPLATES[currentAct];
        const total = template.beats.length;
        const remaining = actData.remainingBeats.length;
        const completion = (total - remaining) / total;

        if (completion < 0.6 && turnsInStage < stage.maxTurns) {
            return false;
        }
    }

    if (turnsInStage >= stage.maxTurns) {
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER] Max turns reached, forcing advancement');
        }
        return true;
    }

    return turnsInStage >= stage.minTurns;
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

    log('[VOGLER] ═══════════════════════════════════════');
    log('[VOGLER] STAGE TRANSITION: ' + VOGLER_STAGES[currentStage].name + ' → ' + nextStageData.name);
    log('[VOGLER] ═══════════════════════════════════════');

    state.vogler.currentStage = nextStage;
    state.vogler.turnsInStage = 0;
    state.vogler.stats.stageChanges++;

    // Check for act transition
    const previousAct = VOGLER_STAGES[currentStage].act;
    const newAct = nextStageData.act;

    if (newAct !== previousAct) {
        state.vogler.currentAct = newAct;
        log('[VOGLER] ACT TRANSITION: Entering ' + ACTS[newAct].name);
    }

    // Update beat card displays
    updateBeatCardDisplay(state.vogler.currentAct);

    // Sync with NGO
    syncVoglerToNGO(nextStage);

    return true;
}

/**
 * Jump to specific stage
 */
function jumpToStage(stageNum) {
    if (stageNum < 1 || stageNum > 12 || !VOGLER_STAGES[stageNum]) {
        log('[VOGLER] Invalid stage number: ' + stageNum);
        return false;
    }

    const stage = VOGLER_STAGES[stageNum];
    state.vogler.currentStage = stageNum;
    state.vogler.currentAct = stage.act;
    state.vogler.turnsInStage = 0;
    state.vogler.manualOverride = true;
    state.vogler.lastManualStage = stageNum;

    log('[VOGLER] Jumped to Stage ' + stageNum + ': ' + stage.name);

    updateBeatCardDisplay(state.vogler.currentAct);
    syncVoglerToNGO(stageNum);

    return true;
}

// #endregion

// #region NGO Integration

/**
 * Sync Vogler stage with NGO temperature/heat
 */
function syncVoglerToNGO(stageNum) {
    if (!NGO_CONFIG.enabled || !state.ngo) {
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER-NGO] NGO not available, skipping sync');
        }
        return;
    }

    const stage = VOGLER_STAGES[stageNum];
    const mapping = stage.ngoMapping;

    const currentTemp = state.ngo.temperature;
    const targetTemp = mapping.temperature;

    // Gradual temperature adjustment
    if (targetTemp > currentTemp) {
        state.ngo.temperature = Math.min(targetTemp, currentTemp + 2);
    } else if (targetTemp < currentTemp) {
        state.ngo.temperature = Math.max(targetTemp, currentTemp - 1);
    }

    state.ngo.heat = Math.max(state.ngo.heat, mapping.heat);

    // Special phase triggers
    if (stageNum === 8) {
        // The Ordeal - trigger overheat
        if (state.ngo.overheatTurns !== undefined) {
            state.ngo.overheatTurns = 4;
        }
        state.ngo.phase = 'climax';
        log('[VOGLER-NGO] ORDEAL: Triggering overheat mode');
    } else if (stageNum === 11) {
        // Resurrection - maximum climax
        state.ngo.temperature = 12;
        state.ngo.phase = 'climax';
        log('[VOGLER-NGO] RESURRECTION: Maximum temperature');
    } else if (stageNum === 12) {
        // Return with Elixir - trigger cooldown
        if (state.ngo.cooldownTurns !== undefined) {
            state.ngo.cooldownTurns = 5;
        }
        state.ngo.phase = 'falling';
        log('[VOGLER-NGO] RETURN: Triggering cooldown');
    }

    if (NGO_CONFIG.debugLogging) {
        log('[VOGLER-NGO] Stage ' + stageNum + ' sync: temp=' + state.ngo.temperature + ', heat=' + state.ngo.heat);
    }
}

// #endregion

// #region Debug Commands

/**
 * Process Vogler debug commands
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
            return { handled: true, message: '[VOGLER] Debug mode: ' + (DEBUG_CONFIG.verboseMode ? 'ON' : 'OFF') };

        case 'beats':
            return { handled: true, message: getBeatsDisplay() };

        case 'bridge':
            return { handled: true, message: getBridgeDisplay() };

        case 'stage':
            const stageNum = parseInt(args[1]);
            if (stageNum && VOGLER_STAGES[stageNum]) {
                return { handled: true, message: getStageDetails(stageNum) };
            }
            return { handled: true, message: getStageDetails(state.vogler.currentStage) };

        case 'complete':
            const completed = completeNextBeat();
            return { handled: true, message: completed ? '[VOGLER] Beat completed!' : '[VOGLER] No beats to complete' };

        case 'generate':
            generateBridgeCard();
            return { handled: true, message: '[VOGLER] Bridge generation initiated. Continue story to generate.' };

        case 'reset':
            const actNum = parseInt(args[1]);
            if (actNum >= 1 && actNum <= 3) {
                resetBeatCard(actNum);
                return { handled: true, message: '[VOGLER] Reset beats for Act ' + actNum };
            }
            return { handled: true, message: '[VOGLER] Usage: /vogler reset <1|2|3>' };

        case 'advance':
            advanceStage();
            return { handled: true, message: '[VOGLER] Advanced to ' + VOGLER_STAGES[state.vogler.currentStage].name };

        case 'health':
            return { handled: true, message: getHealthCheck() };

        case 'ngo':
            return { handled: true, message: getNGOSyncStatus() };

        case 'validate':
            const validation = validateState();
            let valMsg = '\n═══ VALIDATION RESULTS ═══\n';
            valMsg += 'PASSED (' + validation.passed.length + '):\n';
            validation.passed.forEach(p => valMsg += '  ✓ ' + p + '\n');
            if (validation.failed.length > 0) {
                valMsg += 'FAILED (' + validation.failed.length + '):\n';
                validation.failed.forEach(f => valMsg += '  ✗ ' + f + '\n');
            }
            if (validation.warnings.length > 0) {
                valMsg += 'WARNINGS (' + validation.warnings.length + '):\n';
                validation.warnings.forEach(w => valMsg += '  ⚠ ' + w + '\n');
            }
            return { handled: true, message: valMsg };

        case 'cards':
            let cardsMsg = '\n═══ STORY CARDS (' + (storyCards?.length || 0) + ') ═══\n';
            if (storyCards && storyCards.length > 0) {
                for (let i = 0; i < storyCards.length; i++) {
                    const card = storyCards[i];
                    cardsMsg += '[' + i + '] ' + (card.keys || '?') + ' (' + (card.type || '?') + ')\n';
                }
            } else {
                cardsMsg += 'No story cards found.\n';
            }
            return { handled: true, message: cardsMsg };

        case 'state':
            dumpState();
            return { handled: true, message: '[VOGLER] State dumped to log. Check script console.' };

        case 'loglevel':
            const newLevel = args[1];
            if (newLevel && LOG_LEVELS[newLevel] !== undefined) {
                DEBUG_CONFIG.logLevel = newLevel;
                return { handled: true, message: '[VOGLER] Log level set to: ' + newLevel };
            }
            return { handled: true, message: '[VOGLER] Current: ' + DEBUG_CONFIG.logLevel + '. Usage: /vogler loglevel <debug|info|warn|error>' };

        case 'debugcard':
            DEBUG_CONFIG.showDebugCard = !DEBUG_CONFIG.showDebugCard;
            if (DEBUG_CONFIG.showDebugCard) {
                updateDebugCard();
            } else {
                removeCardSafe(DEBUG_CONFIG.debugCardKey);
            }
            return { handled: true, message: '[VOGLER] Debug card: ' + (DEBUG_CONFIG.showDebugCard ? 'ON' : 'OFF') };

        case 'reinit':
            state.vogler = null;
            initVoglerState();
            return { handled: true, message: '[VOGLER] State reinitialized from scratch.' };

        case 'history':
            let histMsg = '\n═══ RECENT HISTORY ═══\n';
            const recentHistory = history.slice(-5);
            recentHistory.forEach((h, i) => {
                const preview = (h.text || '').slice(0, 60).replace(/\n/g, ' ');
                histMsg += '[' + (history.length - 5 + i) + '] ' + h.type + ': ' + preview + '...\n';
            });
            return { handled: true, message: histMsg };

        case 'help':
            return { handled: true, message: getHelpDisplay() };

        default:
            return { handled: true, message: '[VOGLER] Unknown command: ' + command + '. Use /vogler help' };
    }
}

/**
 * Status Display
 */
function getStatusDisplay() {
    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const act = ACTS[state.vogler.currentAct];
    const progress = calculateJourneyProgress();

    let display = '\n═══════════════════════════════════════════\n';
    display += '      VOGLER V2 - HERO\'S JOURNEY STATUS\n';
    display += '═══════════════════════════════════════════\n\n';

    display += '📍 CURRENT POSITION\n';
    display += '   Stage ' + state.vogler.currentStage + '/12: ' + stage.name + '\n';
    display += '   ' + act.name + '\n\n';

    if (DEBUG_CONFIG.showProgressBar) {
        display += '📊 JOURNEY PROGRESS\n';
        display += '   ' + buildProgressBar(progress.overall, 30) + ' ' + progress.overall + '%\n\n';
        display += '   Stage Progress: ' + buildProgressBar(progress.stage, 20) + ' ' + progress.stage + '%\n';
        display += '   Turns in stage: ' + state.vogler.turnsInStage + '/' + stage.maxTurns + '\n\n';
    }

    // Beats
    const actData = state.vogler.acts[state.vogler.currentAct];
    if (actData) {
        const remaining = actData.remainingBeats?.length || 0;
        const total = DEFAULT_BEAT_TEMPLATES[state.vogler.currentAct].beats.length;
        display += '🎯 BEATS (' + act.name + ')\n';
        display += '   Completed: ' + (total - remaining) + '/' + total + '\n';
        if (remaining > 0) {
            display += '   Next: ' + actData.remainingBeats[0] + '\n';
        }
        display += '\n';
    }

    // Bridge
    if (state.vogler.bridge && state.vogler.bridge.events) {
        display += '🌉 BRIDGE ACTIVE\n';
        display += '   Events: ' + state.vogler.bridge.events.length + ' remaining\n\n';
    }

    // NGO
    if (DEBUG_CONFIG.showNGOState && state.ngo) {
        display += '🌡️ NGO STATE\n';
        display += '   Temperature: ' + state.ngo.temperature + '\n';
        display += '   Heat: ' + state.ngo.heat + '\n';
        display += '   Phase: ' + (state.ngo.phase || 'unknown') + '\n\n';
    }

    display += '═══════════════════════════════════════════\n';
    return display;
}

/**
 * Beats Display
 */
function getBeatsDisplay() {
    let display = '\n───────────────────────────────────────────\n';
    display += '           BEAT STATUS BY ACT\n';
    display += '───────────────────────────────────────────\n\n';

    for (let actNum = 1; actNum <= 3; actNum++) {
        const actData = state.vogler.acts[actNum];
        const template = DEFAULT_BEAT_TEMPLATES[actNum];
        const isCurrent = actNum === state.vogler.currentAct;

        display += (isCurrent ? '▶ ' : '  ') + template.name + '\n';

        if (actData && actData.remainingBeats) {
            const completion = getBeatCompletionPercent(actNum);
            display += '   Progress: ' + buildProgressBar(completion, 15) + ' ' + completion + '%\n';
            display += '   Remaining:\n';
            actData.remainingBeats.forEach(beat => {
                display += '     • ' + beat + '\n';
            });
        } else {
            display += '   [Not initialized]\n';
        }
        display += '\n';
    }

    return display;
}

/**
 * Bridge Display
 */
function getBridgeDisplay() {
    let display = '\n───────────────────────────────────────────\n';
    display += '           SAE BRIDGE STATUS\n';
    display += '───────────────────────────────────────────\n\n';

    if (!state.vogler.bridge || !state.vogler.bridge.events) {
        display += 'No bridge currently active.\n';
        display += 'Use @bridge or /vogler generate to create one.\n';
        return display;
    }

    const bridgeData = state.vogler.bridge;
    const nextBeat = state.vogler.acts[state.vogler.currentAct]?.remainingBeats?.[0] || 'next beat';

    display += 'Target: ' + nextBeat + '\n';
    display += 'Created: Turn ' + bridgeData.created + '\n';
    display += 'Events remaining: ' + bridgeData.events.length + '\n\n';

    display += 'Plot Events:\n';
    bridgeData.events.forEach((event, idx) => {
        display += '  ' + (idx + 1) + '. ' + event + '\n';
    });

    return display;
}

/**
 * Stage Details Display
 */
function getStageDetails(stageNum) {
    const stage = VOGLER_STAGES[stageNum];
    const isCurrent = stageNum === state.vogler.currentStage;

    let display = '\n───────────────────────────────────────────\n';
    display += '  STAGE ' + stageNum + ': ' + stage.name.toUpperCase() + '\n';
    display += '───────────────────────────────────────────\n\n';

    if (isCurrent) display += '★ CURRENT STAGE ★\n\n';

    display += 'Act: ' + ACTS[stage.act].name + '\n';
    display += 'Description: ' + stage.description + '\n\n';
    display += 'Guidance:\n' + stage.guidance + '\n\n';

    display += 'Key Beats:\n';
    stage.keyBeats.forEach(beat => {
        display += '  • ' + beat + '\n';
    });
    display += '\n';

    display += 'Turn Requirements:\n';
    display += '  Minimum: ' + stage.minTurns + ' turns\n';
    display += '  Maximum: ' + stage.maxTurns + ' turns\n';
    if (isCurrent) {
        display += '  Current: ' + state.vogler.turnsInStage + ' turns\n';
    }
    display += '\n';

    display += 'NGO Mapping:\n';
    display += '  Temperature: ' + stage.ngoMapping.temperature + '\n';
    display += '  Heat: ' + stage.ngoMapping.heat + '\n';

    return display;
}

/**
 * Health Check Display
 */
function getHealthCheck() {
    let display = '\n═══════════════════════════════════════════\n';
    display += '         VOGLER SYSTEM HEALTH CHECK\n';
    display += '═══════════════════════════════════════════\n\n';

    const checks = [];

    checks.push({
        name: 'State Initialized',
        status: !!state.vogler?.initialized,
        details: state.vogler?.initialized ? 'OK' : 'state.vogler not initialized'
    });

    checks.push({
        name: 'Current Stage Valid',
        status: !!VOGLER_STAGES[state.vogler?.currentStage],
        details: state.vogler?.currentStage ? 'Stage ' + state.vogler.currentStage : 'Invalid'
    });

    checks.push({
        name: 'Act Tracking',
        status: state.vogler?.currentAct >= 1 && state.vogler?.currentAct <= 3,
        details: 'Act ' + (state.vogler?.currentAct || 'unknown')
    });

    for (let i = 1; i <= 3; i++) {
        const card = getCard(VOGLER_BEAT_CONFIG.storyCardPrefix + i);
        checks.push({
            name: 'Beat Card Act ' + i,
            status: !!card,
            details: card ? 'Present' : 'Missing'
        });
    }

    checks.push({
        name: 'NGO Integration',
        status: !!state.ngo,
        details: state.ngo ? 'Connected' : 'Not found'
    });

    let passed = 0;
    let failed = 0;

    checks.forEach(check => {
        const icon = check.status ? '✓' : '✗';
        display += icon + ' ' + check.name + ': ' + check.details + '\n';
        if (check.status) passed++;
        else failed++;
    });

    display += '\n───────────────────────────────────────────\n';
    display += 'Results: ' + passed + ' passed, ' + failed + ' failed\n';
    display += 'Status: ' + (failed === 0 ? 'HEALTHY' : 'ISSUES DETECTED') + '\n';

    return display;
}

/**
 * NGO Sync Status Display
 */
function getNGOSyncStatus() {
    if (!state.ngo) {
        return '[VOGLER-NGO] NGO system not initialized';
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const mapping = stage.ngoMapping;

    let display = '\n───────────────────────────────────────────\n';
    display += '       NGO SYNCHRONIZATION STATUS\n';
    display += '───────────────────────────────────────────\n\n';

    display += 'Current Stage: ' + stage.name + '\n\n';

    display += 'Temperature:\n';
    display += '  Target: ' + mapping.temperature + '\n';
    display += '  Current: ' + state.ngo.temperature + '\n';
    display += '  Status: ' + (state.ngo.temperature === mapping.temperature ? '✓ Synced' : '○ Adjusting') + '\n\n';

    display += 'Heat:\n';
    display += '  Target: ' + mapping.heat + '\n';
    display += '  Current: ' + state.ngo.heat + '\n\n';

    display += 'Phase: ' + (state.ngo.phase || 'unknown') + '\n';

    return display;
}

/**
 * Help Display
 */
function getHelpDisplay() {
    return `
═══════════════════════════════════════════
         VOGLER V2 SYSTEM COMMANDS
═══════════════════════════════════════════

STATUS & INFO:
/vogler status    - Show current journey status
/vogler beats     - Show beat completion status
/vogler bridge    - Show current bridge events
/vogler stage [n] - Show stage details
/vogler ngo       - Show NGO synchronization status
/vogler health    - Run system health check

CONTROL:
/vogler advance   - Force advance to next stage
/vogler complete  - Complete the next beat
/vogler generate  - Generate SAE bridge card
/vogler reset [n] - Reset Act N beats (1, 2, or 3)
/vogler reinit    - Reinitialize state from scratch

DEBUG & DIAGNOSTICS:
/vogler debug     - Toggle verbose debug logging
/vogler validate  - Run state validation checks
/vogler cards     - List all story cards
/vogler state     - Dump state to script console
/vogler history   - Show recent history entries
/vogler loglevel  - Set log level (debug/info/warn/error)
/vogler debugcard - Toggle real-time debug story card
/vogler help      - Show this help message

Player Commands (in-story):
@stage <1-12>    - Jump to specific stage
@beat            - Complete the next structural beat
@bridge          - Generate SAE bridge card

TWO-TIER SYSTEM:
• Beat Cards: Pre-generated at turn zero. Completed beats
  are DELETED from the card (AI only sees what's left).
• Bridge Cards: Generated on-demand via @bridge command.
  Specific plot events that bridge between beats.

═══════════════════════════════════════════`;
}

// #endregion

// #region Author's Note Generation

/**
 * ============================================================================
 * LAYERED AUTHOR'S NOTE SYSTEM
 * Combines multiple sources into a single cohesive author's note
 * ============================================================================
 *
 * Layers (in order of application):
 * 1. Player's stable note (from player-guidance card)
 * 2. Stage-specific guidance (from Vogler stages)
 * 3. Current beat hints (next beat to achieve)
 * 4. Temporary effects (@temp command)
 */

/**
 * Get player's author's note content from their guidance card
 * @returns {string} Player's custom content or empty string
 */
function getPlayerAuthorsNote() {
    const playerCard = getCard(CONFIG.authorsNote.playerNoteCardKey);

    if (!playerCard || !playerCard.entry) {
        return '';
    }

    const entry = playerCard.entry;

    // Skip if it's just the template text
    if (entry.includes('[Edit this card') || entry.includes('[Your Personal')) {
        return '';
    }

    // Extract content, removing template markers
    let content = entry
        .replace(/\[Your Personal Author's Note\]/g, '')
        .replace(/\[Edit this card.*?\]/g, '')
        .trim();

    return content;
}

/**
 * Build stage-appropriate author's note guidance
 * @returns {string} Stage guidance text
 */
function buildStageGuidance() {
    if (!state.vogler || !state.vogler.currentStage) {
        return '';
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    if (!stage) return '';

    let guidance = '[Stage: ' + stage.name + ']\n';
    guidance += stage.guidance;

    return guidance;
}

/**
 * Build beat hints for current act
 * @returns {string} Beat hint text
 */
function buildBeatHints() {
    if (!state.vogler || !state.vogler.currentAct) {
        return '';
    }

    const actData = state.vogler.acts[state.vogler.currentAct];

    if (!actData || !actData.remainingBeats || actData.remainingBeats.length === 0) {
        return '';
    }

    return 'Next beat: ' + actData.remainingBeats[0];
}

/**
 * Get temporary author's note effects (from @temp command)
 * @returns {string} Temporary effects or empty string
 */
function getTempEffects() {
    if (!state.vogler || !state.vogler.tempAuthorsNote) {
        return '';
    }

    const temp = state.vogler.tempAuthorsNote;

    // Check if temporary note has expired
    if (temp.expiresAt && info.actionCount >= temp.expiresAt) {
        state.vogler.tempAuthorsNote = null;
        return '';
    }

    return temp.text || '';
}

/**
 * Build complete layered author's note
 * Combines all layers according to CONFIG.authorsNote settings
 * @returns {string} Complete layered author's note
 */
function buildLayeredAuthorsNote() {
    if (!CONFIG.authorsNote.enabled) {
        return state.memory?.authorsNote || '';
    }

    const layers = [];

    // Layer 1: Player's stable note (lowest priority)
    const playerNote = getPlayerAuthorsNote();
    if (playerNote) {
        layers.push({ priority: CONFIG.authorsNote.layers.playerNote, content: playerNote });
    }

    // Layer 2: Stage guidance
    const stageGuidance = buildStageGuidance();
    if (stageGuidance) {
        layers.push({ priority: CONFIG.authorsNote.layers.stageGuidance, content: stageGuidance });
    }

    // Layer 3: Beat hints
    const beatHints = buildBeatHints();
    if (beatHints) {
        layers.push({ priority: CONFIG.authorsNote.layers.beatHints, content: beatHints });
    }

    // Layer 4: Temporary effects (highest priority)
    const tempEffects = getTempEffects();
    if (tempEffects) {
        layers.push({ priority: CONFIG.authorsNote.layers.tempEffects, content: tempEffects });
    }

    // Sort by priority (lower = earlier in output)
    layers.sort((a, b) => a.priority - b.priority);

    // Combine with separator
    let combined = layers.map(l => l.content).join(CONFIG.authorsNote.separator);

    // Enforce max length
    if (combined.length > CONFIG.authorsNote.maxLength) {
        combined = combined.slice(0, CONFIG.authorsNote.maxLength) + '...';
        safeLog('[AuthorsNote] Truncated to max length: ' + CONFIG.authorsNote.maxLength, 'debug');
    }

    return combined;
}

/**
 * Store current author's note for restoration after output
 * Call this at the START of context processing
 */
function storeAuthorsNote() {
    if (!CONFIG.authorsNote.preserveOnOutput) return;

    state.vogler = state.vogler || {};
    state.vogler._authorsNoteBackup = state.memory?.authorsNote || null;

    safeLog('[AuthorsNote] Stored backup for restoration', 'debug');
}

/**
 * Restore author's note after output processing
 * Call this at the END of output processing
 */
function restoreAuthorsNote() {
    if (!CONFIG.authorsNote.preserveOnOutput) return;

    if (state.vogler?._authorsNoteBackup !== undefined) {
        state.memory = state.memory || {};
        state.memory.authorsNote = state.vogler._authorsNoteBackup;
        state.vogler._authorsNoteBackup = undefined;

        safeLog('[AuthorsNote] Restored from backup', 'debug');
    }
}

/**
 * Apply layered author's note to state.memory
 * Call this during context processing
 */
function applyLayeredAuthorsNote() {
    const layeredNote = buildLayeredAuthorsNote();

    if (layeredNote) {
        state.memory = state.memory || {};
        state.memory.authorsNote = layeredNote;

        safeLog('[AuthorsNote] Applied layered note (' + layeredNote.length + ' chars)', 'debug');
    }
}

/**
 * Set temporary author's note effect
 * @param {string} text - The temporary text
 * @param {number} duration - Number of turns to last (default: 3)
 */
function setTempAuthorsNote(text, duration = 3) {
    state.vogler = state.vogler || {};
    state.vogler.tempAuthorsNote = {
        text: text,
        createdAt: info.actionCount,
        expiresAt: info.actionCount + duration
    };

    safeLog('[AuthorsNote] Set temporary note for ' + duration + ' turns', 'info');
}

/**
 * Clear temporary author's note
 */
function clearTempAuthorsNote() {
    if (state.vogler) {
        state.vogler.tempAuthorsNote = null;
    }
}

/**
 * Legacy function - Get combined author's note (player + stage guidance)
 * @deprecated Use buildLayeredAuthorsNote() instead
 */
function getCombinedAuthorsNote() {
    return buildLayeredAuthorsNote();
}

// #endregion

// #region AutoCards Integration Hooks

/**
 * ============================================================================
 * AUTOCARDS INTEGRATION HOOKS
 * Provides hook points for future AutoCards system integration
 * ============================================================================
 *
 * AutoCards automatically generates story cards based on context.
 * These hooks allow the system to be added without modifying core code.
 */

/**
 * AutoCards hook for input processing
 * Called from Input script after command processing
 * @param {string} text - The processed input text
 * @returns {string} Modified text (or original if AutoCards disabled)
 */
function autoCardsInputHook(text) {
    if (!CONFIG.integrations.autoCards) {
        return text;
    }

    // Hook point for AutoCards input processing
    // When AutoCards is implemented, it will:
    // 1. Analyze player input for key entities/concepts
    // 2. Create or update relevant story cards
    // 3. Return modified text if needed

    safeLog('[AutoCards] Input hook called (not yet implemented)', 'debug');
    return text;
}

/**
 * AutoCards hook for context processing
 * Called from Context script during author's note building
 * @param {string} text - The context text
 * @param {object} stop - Stop sequences object
 * @returns {string} Modified context (or original if AutoCards disabled)
 */
function autoCardsContextHook(text, stop) {
    if (!CONFIG.integrations.autoCards) {
        return text;
    }

    // Hook point for AutoCards context processing
    // When AutoCards is implemented, it will:
    // 1. Analyze context for narrative patterns
    // 2. Inject relevant story card content
    // 3. Update dynamic cards based on story state

    safeLog('[AutoCards] Context hook called (not yet implemented)', 'debug');
    return text;
}

/**
 * AutoCards hook for output processing
 * Called from Output script after cleaning
 * @param {string} text - The cleaned output text
 * @returns {string} Modified output (or original if AutoCards disabled)
 */
function autoCardsOutputHook(text) {
    if (!CONFIG.integrations.autoCards) {
        return text;
    }

    // Hook point for AutoCards output processing
    // When AutoCards is implemented, it will:
    // 1. Analyze AI output for new entities/concepts
    // 2. Create cards for newly introduced characters/locations
    // 3. Update existing cards with new information

    safeLog('[AutoCards] Output hook called (not yet implemented)', 'debug');
    return text;
}

/**
 * Enable AutoCards integration
 * Call this to activate the AutoCards system
 */
function enableAutoCards() {
    CONFIG.integrations.autoCards = true;
    safeLog('[AutoCards] Integration enabled', 'info');
}

/**
 * Disable AutoCards integration
 */
function disableAutoCards() {
    CONFIG.integrations.autoCards = false;
    safeLog('[AutoCards] Integration disabled', 'info');
}

// #endregion

// #region Quality Systems Hooks (P4 Placeholder)

/**
 * ============================================================================
 * QUALITY SYSTEMS HOOKS
 * Placeholder hooks for P4 quality systems (Bonepoke, VS, etc.)
 * ============================================================================
 */

/**
 * Bonepoke analysis hook
 * Placeholder for quality analysis integration
 * @param {string} text - Text to analyze
 * @returns {object|null} Analysis results or null if disabled
 */
function bonepokeAnalysisHook(text) {
    if (!CONFIG.integrations.bonepoke) {
        return null;
    }

    // Placeholder for Bonepoke quality analysis
    // Will analyze for: fatigue indicators, drift, MARM scores
    safeLog('[Bonepoke] Analysis hook called (not yet implemented)', 'debug');
    return null;
}

/**
 * Verbalized Sampling hook
 * Placeholder for VS diversity control
 * @returns {string} VS instruction string or empty
 */
function verbalizedSamplingHook() {
    if (!CONFIG.integrations.verbalizedSampling) {
        return '';
    }

    // Placeholder for Verbalized Sampling
    // Will provide diversity control instructions
    safeLog('[VS] Hook called (not yet implemented)', 'debug');
    return '';
}

/**
 * Word bank processing hook
 * Placeholder for word replacement/banning
 * @param {string} text - Text to process
 * @returns {string} Processed text
 */
function wordBankHook(text) {
    if (!CONFIG.integrations.wordBanks) {
        return text;
    }

    // Placeholder for word bank processing
    // Will handle: banned words, aggressive removal, replacements
    safeLog('[WordBank] Hook called (not yet implemented)', 'debug');
    return text;
}

// #endregion

// Export for use in other scripts
if (typeof module !== 'undefined') {
    module.exports = {
        VOGLER_STAGES,
        ACTS,
        DEFAULT_BEAT_TEMPLATES,
        DEBUG_CONFIG,
        VOGLER_BEAT_CONFIG,
        SAE_BRIDGE_CONFIG,
        initVoglerState,
        completeBeat,
        completeNextBeat,
        generateBridgeCard,
        storeBridgeEvents,
        progressiveBridgeRemoval,
        advanceStage,
        jumpToStage,
        checkStageAdvancement,
        processVoglerCommand,
        buildStageGuidance,
        getCombinedAuthorsNote,
        getCard,
        syncVoglerToNGO
    };
}
