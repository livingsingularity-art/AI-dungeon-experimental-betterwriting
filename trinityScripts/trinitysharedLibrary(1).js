/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * AI DUNGEON SHARED LIBRARY
 * Enhanced Creative Writing System
 * ============================================================================
 *
 * Combines:
 * - Verbalized Sampling (VS) for diversity
 * - Bonepoke Protocol for quality control
 * - AI Dungeon best practices
 *
 * @version 2.5.0 (Optimized 2025-01-18)
 * @license MIT
 * ============================================================================
 */

// #region Configuration

// ============================================================================
// RELEASE BUILD - ALL DEBUGGING DISABLED
// ============================================================================
// This is a production-ready configuration with all debug logging disabled.
// To enable debugging during development, set the relevant flags to true:
// - debugLogging: enables console output for that module
// - logStateChanges: logs state transitions (NGO only)
// - logReplacementReasons: logs why replacements were chosen (SmartReplacement)
// - logContextAnalysis: logs context matching details (SmartReplacement)
// - logValidation: logs validation decisions (SmartReplacement)
// ============================================================================

/**
 * Global configuration for all enhancement systems
 */
const CONFIG = {
    // Verbalized Sampling
    vs: {
        enabled: true,
        k: 5,                   // Number of candidates
        tau: 0.10,              // Probability threshold (research-recommended)
        seamless: true,         // Hide process from output
        adaptive: true,         // Auto-adjust based on context (NOW ENABLED for NGO)
        debugLogging: false      // Console logging
    },

    // Bonepoke Analysis
    bonepoke: {
        enabled: true,
        fatigueThreshold: 3,    // Word repetition threshold (lowered for better detection)
        qualityThreshold: 2.5,  // Minimum average score (for logging)
        enableDynamicCorrection: true,  // Create guidance cards to prevent future issues
        debugLogging: false
    },

    // NGO (Narrative Guidance Overhaul) - THE CENTRAL BRAIN
    ngo: {
        enabled: true,

        // HEAT MECHANICS (short-term tension)
        initialHeat: 0,
        heatDecayRate: 1,               // Natural decay per turn
        heatIncreasePerConflict: 1,     // Per conflict word detected
        playerHeatMultiplier: 2,        // Player actions = stronger impact
        aiHeatMultiplier: 1,            // AI output = normal impact
        maxHeat: 50,                    // Soft cap

        // TEMPERATURE MECHANICS (long-term arc)
        initialTemperature: 1,
        minTemperature: 1,
        maxTemperature: 12,             // Standard climax cap
        trueMaxTemperature: 15,         // Extreme climax (rare)

        // Temperature increase triggers
        heatThresholdForTempIncrease: 10,
        tempIncreaseChance: 30,         // % chance when heat high (was 15, increased for better pacing)
        tempIncreaseOnConsecutiveConflicts: 3,

        // Temperature decrease triggers
        calmingTurnsForDecrease: 5,
        tempDecreaseAmount: 1,

        // OVERHEAT MECHANICS (sustained climax)
        overheatTriggerTemp: 10,
        overheatDuration: 4,            // Turns
        overheatHeatReduction: 10,
        overheatLocksTemperature: true,

        // COOLDOWN MECHANICS (falling action)
        cooldownDuration: 5,            // Turns
        cooldownTempDecreaseRate: 2,    // Per turn
        cooldownMinTemperature: 3,
        cooldownBlocksHeatGain: true,

        // RANDOM EXPLOSIONS
        explosionEnabled: true,
        explosionChanceBase: 3,         // %
        explosionHeatBonus: 5,
        explosionTempBonus: 2,

        // BONEPOKE INTEGRATION
        fatigueTriggersEarlyCooldown: true,
        fatigueThresholdForCooldown: 5,
        driftReducesHeat: true,
        driftHeatReduction: 3,
        qualityGatesTemperatureIncrease: true,
        qualityThresholdForIncrease: 2.0,        // Was 3.0, lowered for metaphor-heavy styles (Bradbury)

        // VS INTEGRATION
        temperatureAffectsVS: true,

        // COMMAND INTEGRATION
        reqIncreasesHeat: true,
        reqHeatBonus: 2,
        parenthesesIncreasesHeat: true,
        parenthesesHeatBonus: 1,

        // DEBUG
        debugLogging: false,
        logStateChanges: false
    },

    // COMMAND SYSTEM (Player narrative pressure vectors)
    commands: {
        enabled: true,

        // @req settings
        reqPrefix: '@req',
        reqFrontMemoryTTL: 1,
        reqAuthorsNoteTTL: 2,
        reqDualInjection: true,

        // (...) parentheses memory
        parenthesesEnabled: true,
        parenthesesMaxSlots: 3,
        parenthesesDefaultTTL: 4,
        parenthesesPriority: true,

        // Manual controls
        tempCommand: '@temp',
        arcCommand: '@arc',

        // Fulfillment detection
        detectFulfillment: true,
        fulfillmentThreshold: 0.4,

        debugLogging: false
    },

    // Smart Replacement (Bonepoke-Enhanced Synonym Selection)
    smartReplacement: {
        enabled: true,          // Use Bonepoke scores to guide synonym selection

        // Phase 6 (MEDIUM #7): Per-Dimension Threshold Configuration
        // Configure threshold for each Bonepoke dimension
        thresholds: {
            'Emotional Strength': 2,    // Boost emotion words when dimension < 2
            'Character Clarity': 2,      // Boost precision words when dimension < 2
            'Story Flow': 2,             // Boost flow/transition words when dimension < 2
            'Dialogue Weight': 2,        // Boost dialogue verbs when dimension < 2
            'Word Variety': 1            // More lenient for variety (boost when < 1)
        },

        // Legacy thresholds (deprecated, kept for backward compatibility)
        emotionThreshold: 2,    // Use thresholds['Emotional Strength'] instead
        precisionThreshold: 2,  // Use thresholds['Character Clarity'] instead

        // Validation settings
        requireImprovement: false,  // Set true to only apply if quality improves
        allowSameScore: true,       // Allow replacement if score stays same

        // Strategy weights (future use)
        emotionWeight: 1.5,
        precisionWeight: 1.0,
        varietyWeight: 0.8,

        // Fallback behavior
        fallbackToRandom: true,     // Use random selection if smart fails

        // Phase 4: Advanced Features
        enableContextMatching: true,    // Analyze surrounding text for better synonym selection
        enableAdaptiveLearning: true,   // Track which replacements improve quality
        enablePhraseIntelligence: true, // Enhanced multi-word phrase matching

        // Context matching settings
        contextRadius: 50,              // Characters before/after to analyze
        tagMatchBonus: 2,               // Weight bonus for synonyms matching context tags

        // Adaptive learning settings
        learningRate: 0.1,              // How fast to adjust preferences (0-1)
        minSamplesForLearning: 3,       // Minimum replacements before learning kicks in

        // Phase 5: Replacement Validation & Tracking
        enableValidation: true,             // Validate replacements improve quality
        validationStrict: false,            // Strict: require improvement. False: allow neutral
        preventQualityDegradation: true,    // Block replacements that lower scores
        preventNewContradictions: true,     // Block if creates new contradictions
        preventFatigueIncrease: true,       // Block if increases word fatigue
        minScoreImprovement: 0.0,           // Minimum score delta to accept (0.0 = any improvement)

        // Debug
        debugLogging: false,
        logReplacementReasons: false,  // Show WHY each replacement was chosen
        logContextAnalysis: false,     // Show context matching details
        logValidation: false           // Show validation decisions
    },

    // System
    system: {
        persistState: true,     // Save state between sessions
        enableAnalytics: true   // Track metrics over time (NOW ENABLED for NGO)
    }
};

// #region Phase 6 (MEDIUM #8): Strictness Level Presets

/**
 * Preset configurations for different replacement aggressiveness levels
 * Users can easily switch between conservative, balanced, or aggressive modes
 */
const STRICTNESS_PRESETS = {
    conservative: {
        // Most cautious - only replace when absolutely needed
        thresholds: {
            'Emotional Strength': 1,
            'Character Clarity': 1,
            'Story Flow': 1,
            'Dialogue Weight': 1,
            'Word Variety': 0.5
        },
        enableValidation: true,
        validationStrict: true,      // Require improvement
        minScoreImprovement: 0.1,
        preventQualityDegradation: true,
        preventNewContradictions: true,
        preventFatigueIncrease: true,
        enableContextMatching: true,
        enableAdaptiveLearning: true,
        tagMatchBonus: 1,            // Lower bonus
        description: 'Conservative: Only replaces when strongly needed, requires improvement'
    },

    balanced: {
        // Default - balanced replacement approach
        thresholds: {
            'Emotional Strength': 2,
            'Character Clarity': 2,
            'Story Flow': 2,
            'Dialogue Weight': 2,
            'Word Variety': 1
        },
        enableValidation: true,
        validationStrict: false,     // Allow neutral
        minScoreImprovement: 0.0,
        preventQualityDegradation: true,
        preventNewContradictions: true,
        preventFatigueIncrease: true,
        enableContextMatching: true,
        enableAdaptiveLearning: true,
        tagMatchBonus: 2,
        description: 'Balanced: Normal replacement rate, allows neutral changes (recommended)'
    },

    aggressive: {
        // Most proactive - replace even moderately weak dimensions
        thresholds: {
            'Emotional Strength': 3,
            'Character Clarity': 3,
            'Story Flow': 3,
            'Dialogue Weight': 3,
            'Word Variety': 2
        },
        enableValidation: true,
        validationStrict: false,
        minScoreImprovement: 0.0,
        preventQualityDegradation: true,  // Still prevent degradation
        preventNewContradictions: false,  // More lenient
        preventFatigueIncrease: false,    // More lenient
        enableContextMatching: true,
        enableAdaptiveLearning: true,
        tagMatchBonus: 3,            // Higher bonus
        description: 'Aggressive: Replaces more often, more lenient validation'
    }
};

/**
 * Apply a strictness preset to CONFIG.smartReplacement
 * @param {string} level - 'conservative', 'balanced', or 'aggressive'
 * @returns {boolean} True if preset was applied, false if invalid level
 */
const applyStrictnessPreset = (level) => {
    const preset = STRICTNESS_PRESETS[level];
    if (!preset) {
        safeLog(`⚠️ Invalid strictness level: ${level}. Use 'conservative', 'balanced', or 'aggressive'`, 'warn');
        return false;
    }

    // Apply preset settings to CONFIG (excluding description)
    Object.keys(preset).forEach(key => {
        if (key !== 'description') {
            CONFIG.smartReplacement[key] = preset[key];
        }
    });

    safeLog(`✅ Applied ${level} strictness preset: ${preset.description}`, 'info');
    return true;
};

// #endregion

// #endregion

// #region Utilities

/**
 * Safe console logging that respects config
 * @param {string} message - Message to log
 * @param {string} [level='info'] - Log level
 */
const safeLog = (message, level = 'info') => {
    // RELEASE MODE: All debug logging disabled
    // To enable debugging, set any of these flags to true in CONFIG:
    // - CONFIG.vs.debugLogging
    // - CONFIG.bonepoke.debugLogging
    // - CONFIG.ngo.debugLogging
    // - CONFIG.ngo.logStateChanges
    // - CONFIG.commands.debugLogging
    // - CONFIG.smartReplacement.debugLogging
    if (CONFIG.vs.debugLogging ||
        CONFIG.bonepoke.debugLogging ||
        (CONFIG.ngo && (CONFIG.ngo.debugLogging || CONFIG.ngo.logStateChanges)) ||
        (CONFIG.commands && CONFIG.commands.debugLogging) ||
        (CONFIG.smartReplacement && CONFIG.smartReplacement.debugLogging)) {
        const prefix = level === 'error' ? '❌' :
                      level === 'warn' ? '⚠️' :
                      level === 'success' ? '✅' : 'ℹ️';
        log(`${prefix} ${message}`);
    }
};

/**
 * Select item from array using weighted random selection (Phase 6 - MEDIUM #6)
 * @param {Array} items - Items to select from
 * @param {Function} weightFn - Function that returns weight for each item
 * @returns {*} Selected item or null if array is empty
 */
const weightedRandomSelection = (items, weightFn) => {
    if (!items || items.length === 0) return null;
    if (items.length === 1) return items[0];

    const weights = items.map(weightFn);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // All weights are 0, use uniform random
    if (totalWeight === 0) {
        return items[Math.floor(Math.random() * items.length)];
    }

    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }

    // Fallback (shouldn't reach here due to floating point)
    return items[items.length - 1];
};

// #region Performance Optimizations (Code Optimization Report 2025-01-18)

/**
 * Escape special regex characters in a string
 * Extracted to utility to avoid code duplication (15+ instances)
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for use in RegExp
 */
const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Regex cache for performance optimization
 * Prevents recompilation of regex patterns in hot paths
 * @type {Object.<string, RegExp>}
 */
const REGEX_CACHE = {};

/**
 * Get or create a cached word boundary regex for a given word
 * Performance: ~40% faster than creating new RegExp each time
 * @param {string} word - Word to create regex for
 * @param {string} [flags='gi'] - Regex flags (default: case-insensitive, global)
 * @returns {RegExp} Cached or newly created regex
 */
const getWordRegex = (word, flags = 'gi') => {
    const cacheKey = `${word}:${flags}`;
    if (!REGEX_CACHE[cacheKey]) {
        REGEX_CACHE[cacheKey] = new RegExp(`\\b${escapeRegex(word)}\\b`, flags);
    }
    return REGEX_CACHE[cacheKey];
};

/**
 * Get or create a cached regex for any pattern
 * @param {string} pattern - Pattern to create regex for
 * @param {string} [flags='gi'] - Regex flags
 * @returns {RegExp} Cached or newly created regex
 */
const getCachedRegex = (pattern, flags = 'gi') => {
    const cacheKey = `${pattern}:${flags}`;
    if (!REGEX_CACHE[cacheKey]) {
        REGEX_CACHE[cacheKey] = new RegExp(pattern, flags);
    }
    return REGEX_CACHE[cacheKey];
};

/**
 * Clear regex cache (useful for memory management)
 * Call periodically if cache grows too large
 * @returns {number} Number of cached entries cleared
 */
const clearRegexCache = () => {
    const count = Object.keys(REGEX_CACHE).length;
    Object.keys(REGEX_CACHE).forEach(key => delete REGEX_CACHE[key]);
    return count;
};

// Memory management constants (replace magic numbers)
const MAX_OUTPUT_HISTORY = 3;        // Maximum output history entries to keep
const MAX_BONEPOKE_HISTORY = 5;      // Maximum Bonepoke analysis history
const MAX_PHASE_HISTORY = 50;         // Maximum phase change history
const MIN_LEARNING_SAMPLES = 3;       // Minimum samples before adaptive learning
const LEARNING_HISTORY_PRUNE_THRESHOLD = 0.05;  // Min avg improvement to keep

/**
 * Prune replacement learning history to prevent unbounded growth
 * Removes entries with low use count and poor performance
 * Called periodically (every 50 turns recommended)
 * @returns {Object} Statistics about pruned entries
 */
const pruneReplacementHistory = () => {
    if (!state.replacementLearning || !state.replacementLearning.history) {
        return { wordsPruned: 0, synonymsPruned: 0 };
    }

    let wordsPruned = 0;
    let synonymsPruned = 0;
    const history = state.replacementLearning.history;

    Object.keys(history).forEach(word => {
        Object.keys(history[word]).forEach(synonym => {
            const entry = history[word][synonym];
            // Remove entries with < 3 uses AND low improvement
            if (entry.uses < MIN_LEARNING_SAMPLES &&
                entry.avgImprovement < LEARNING_HISTORY_PRUNE_THRESHOLD) {
                delete history[word][synonym];
                synonymsPruned++;
            }
        });

        // Remove empty word entries
        if (Object.keys(history[word]).length === 0) {
            delete history[word];
            wordsPruned++;
        }
    });

    if (CONFIG.smartReplacement && CONFIG.smartReplacement.debugLogging && synonymsPruned > 0) {
        safeLog(`🧹 Pruned ${wordsPruned} words, ${synonymsPruned} synonyms from learning history`, 'info');
    }

    return { wordsPruned, synonymsPruned };
};

// #endregion

// #region Phase 6 (MEDIUM #9): Performance Benchmarking

/**
 * Performance benchmarking module for tracking replacement system performance
 */
const PerformanceBenchmark = (() => {
    const timings = {
        totalReplacements: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
        lastTime: 0
    };

    /**
     * Start timing a replacement operation
     * @returns {number} Start timestamp
     */
    const start = () => {
        return Date.now();  // Use Date.now() for AI Dungeon compatibility
    };

    /**
     * End timing and record results
     * @param {number} startTime - Timestamp from start()
     * @returns {number} Elapsed time in milliseconds
     */
    const end = (startTime) => {
        const elapsed = Date.now() - startTime;

        timings.totalReplacements++;
        timings.totalTime += elapsed;
        timings.avgTime = timings.totalTime / timings.totalReplacements;
        timings.maxTime = Math.max(timings.maxTime, elapsed);
        timings.minTime = Math.min(timings.minTime, elapsed);
        timings.lastTime = elapsed;

        if (CONFIG.smartReplacement && CONFIG.smartReplacement.debugLogging) {
            safeLog(`⏱️ Replacement took ${elapsed.toFixed(2)}ms`, 'info');
        }

        return elapsed;
    };

    /**
     * Get performance report
     * @returns {string} Formatted performance statistics
     */
    const getReport = () => {
        if (timings.totalReplacements === 0) {
            return '⏱️ No replacement timing data available yet.';
        }

        return `⏱️ PERFORMANCE STATS:\n` +
               `   Total Replacements: ${timings.totalReplacements}\n` +
               `   Avg Time: ${timings.avgTime.toFixed(2)}ms\n` +
               `   Max Time: ${timings.maxTime.toFixed(2)}ms\n` +
               `   Min Time: ${timings.minTime === Infinity ? 'N/A' : timings.minTime.toFixed(2) + 'ms'}\n` +
               `   Last Time: ${timings.lastTime.toFixed(2)}ms`;
    };

    /**
     * Reset all timing data
     */
    const reset = () => {
        timings.totalReplacements = 0;
        timings.totalTime = 0;
        timings.avgTime = 0;
        timings.maxTime = 0;
        timings.minTime = Infinity;
        timings.lastTime = 0;
    };

    return { start, end, getReport, reset, timings };
})();

// #endregion

// #region Phase 7 (MEDIUM #4): Story Card Configuration UI

/**
 * Story Card Configuration UI - Simple on/off toggles for major features
 * Limited to ~2000 characters to fit story card constraints
 */
const SmartReplacementConfig = (() => {
    const CARD_KEY = 'smart_replacement_config';

    /**
     * Create default configuration card
     * @returns {Object} Story card object
     */
    const createDefaultCard = () => {
        const defaultConfig = `SMART REPLACEMENT CONFIGURATION
Toggle features on/off (true/false):

enabled: true
enableValidation: true
enableContextMatching: true
enableAdaptiveLearning: true
enablePhraseIntelligence: true
preventNewContradictions: true
validationStrict: false
debugLogging: false
logReplacementReasons: false
logValidation: false

Strictness preset (conservative/balanced/aggressive):
preset: balanced

Instructions:
- Change 'true' to 'false' to disable features
- Change 'false' to 'true' to enable features
- Change preset to: conservative, balanced, or aggressive
- Save card and refresh story to apply changes`;

        const card = buildCard(
            'Configure Auto-Cards',  // User-friendly title
            defaultConfig,           // Entry content
            'Custom',                // Type
            'smart_replacement_config', // Keys
            'Configure Trinity smart replacement features and strictness',
            50  // Insert after word banks but before PlayersAuthorsNote
        );

        safeLog('📝 Created Configure Auto-Cards story card', 'success');
        return card;
    };

    /**
     * Ensure configuration card exists
     * @returns {Object} Story card object
     */
    const ensureCard = () => {
        let card = storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
        if (!card) {
            card = createDefaultCard();
        }
        return card;
    };

    /**
     * Parse configuration from card entry
     * @param {string} entry - Card entry text
     * @returns {Object} Parsed configuration object
     */
    const parseConfig = (entry) => {
        if (!entry) return null;

        const config = {};
        const lines = entry.split('\n');

        lines.forEach(line => {
            // Match "key: value" pattern
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                const [, key, value] = match;
                const trimmedValue = value.trim().toLowerCase();

                // Parse boolean values
                if (trimmedValue === 'true' || trimmedValue === 'false') {
                    config[key] = trimmedValue === 'true';
                }
                // Parse preset value
                else if (key === 'preset' && ['conservative', 'balanced', 'aggressive'].includes(trimmedValue)) {
                    config.preset = trimmedValue;
                }
                // Parse numeric values
                else if (!isNaN(trimmedValue)) {
                    config[key] = parseFloat(trimmedValue);
                }
            }
        });

        return config;
    };

    /**
     * Apply user configuration to CONFIG.smartReplacement
     * @param {Object} userConfig - Parsed user configuration
     */
    const applyConfig = (userConfig) => {
        if (!userConfig) return;

        // Apply boolean toggles
        const booleanKeys = [
            'enabled', 'enableValidation', 'enableContextMatching',
            'enableAdaptiveLearning', 'enablePhraseIntelligence',
            'preventNewContradictions', 'validationStrict',
            'debugLogging', 'logReplacementReasons', 'logValidation'
        ];

        booleanKeys.forEach(key => {
            if (userConfig.hasOwnProperty(key)) {
                CONFIG.smartReplacement[key] = userConfig[key];
            }
        });

        // Apply preset if specified
        if (userConfig.preset) {
            applyStrictnessPreset(userConfig.preset);
        }
    };

    /**
     * Load configuration from story card and apply to CONFIG
     * Called during initialization
     */
    const loadAndApply = () => {
        const card = ensureCard();
        if (!card) return;

        const userConfig = parseConfig(card.entry);
        applyConfig(userConfig);

        if (CONFIG.smartReplacement.debugLogging) {
            safeLog('✅ Loaded Smart Replacement config from story card', 'info');
        }
    };

    return { ensureCard, parseConfig, applyConfig, loadAndApply };
})();

// #endregion

/**
 * Initialize state with default values
 */
const initState = () => {
    state.initialized = state.initialized || false;

    if (!state.initialized) {
        state.vsHistory = [];
        state.bonepokeHistory = [];
        state.metrics = {
            totalOutputs: 0,
            regenerations: 0,
            fatigueDetections: 0,
            driftDetections: 0
        };
        state.dynamicCards = [];

        // === NGO STATE INITIALIZATION ===
        state.ngo = {
            heat: CONFIG.ngo.initialHeat,
            temperature: CONFIG.ngo.initialTemperature,
            lastTemperature: 1,

            // Mode flags
            overheatMode: false,
            overheatTurnsLeft: 0,
            cooldownMode: false,
            cooldownTurnsLeft: 0,

            // Pressure tracking
            temperatureWantsToIncrease: false,
            lastConflictCount: 0,
            lastCalmingCount: 0,
            consecutiveConflicts: 0,

            // Random events
            explosionPending: false,

            // Phase management
            currentPhase: 'Introduction',
            phaseEntryTurn: 0,
            turnsInPhase: 0
        };

        // === COMMAND STATE INITIALIZATION ===
        state.commands = {
            // @req
            narrativeRequest: null,
            narrativeRequestTTL: 0,
            narrativeRequestFulfilled: false,

            // Parentheses memory
            memory1: '',
            memory2: '',
            memory3: '',
            expiration1: null,
            expiration2: null,
            expiration3: null,

            // Manual overrides
            manualTempAdjustment: 0,
            manualArcOverride: null,

            // Tracking
            lastRequestTime: 0,
            requestHistory: []
        };

        // === NGO ANALYTICS ===
        state.ngoStats = {
            totalTurns: 0,
            maxTemperatureReached: 1,
            totalOverheats: 0,
            totalCooldowns: 0,
            totalExplosions: 0,
            fatigueTriggeredCooldowns: 0,
            qualityBlockedIncreases: 0,
            requestsFulfilled: 0,
            requestsFailed: 0,
            avgTemperature: 1,
            temperatureSum: 0,
            phaseHistory: []
        };

        // === ADAPTIVE LEARNING (Phase 4) ===
        state.replacementLearning = {
            // Track: word -> { synonym: { uses, totalScoreImprovement, avgImprovement } }
            history: {},
            totalReplacements: 0,
            successfulReplacements: 0,  // Replacements that improved quality
            neutralReplacements: 0,      // Replacements that didn't change quality
            failedReplacements: 0        // Replacements that decreased quality
        };

        // === REPLACEMENT VALIDATION (Phase 5) ===
        state.replacementValidation = {
            totalAttempts: 0,           // Total replacement attempts
            validationsPassed: 0,        // Replacements that passed validation
            validationsFailed: 0,        // Replacements blocked by validation
            blockedReasons: {            // Count by block reason
                qualityDegradation: 0,
                newContradictions: 0,
                fatigueIncrease: 0,
                insufficientImprovement: 0
            }
        };

        // Note: Original author's note is NOT preserved - it gets overwritten constantly
        // PlayersAuthorsNote story card serves as the user's stable author's note instead

        // PHASE 7: Load user configuration from story card
        SmartReplacementConfig.loadAndApply();

        state.initialized = true;
        safeLog('State initialized with NGO engine', 'success');
    }
};

// #endregion

// #region Story Card Management

/**
 * Build or update a story card (modern API, not worldinfo)
 * @param {string} title - Card title
 * @param {string} entry - Card content
 * @param {string} [type='Custom'] - Card type
 * @param {string} [keys=''] - Trigger keywords
 * @param {string} [description=''] - Card description
 * @param {number} [insertionIndex=0] - Position in storyCards array
 * @returns {Object} Reference to the card
 */
const buildCard = (title = "", entry = "", type = "Custom",
    keys = "", description = "", insertionIndex = 0) => {

    // Validate inputs
    if (![type, title, keys, entry, description].every(arg => typeof arg === "string")) {
        throw new Error("buildCard requires string parameters");
    }
    if (!Number.isInteger(insertionIndex)) {
        throw new Error("insertionIndex must be an integer");
    }

    // Clamp insertion index
    insertionIndex = Math.min(Math.max(0, insertionIndex), storyCards.length);

    // Create card with proper parameters
    // addStoryCard signature: addStoryCard(keys, entry, type)
    // Returns the index of the new card or false if card with same keys exists
    const newIndex = addStoryCard(keys, entry, type);

    if (newIndex === false) {
        // Card with same keys already exists, find and update it
        const existing = storyCards.find(c => c.keys === keys);
        if (existing) {
            existing.title = title;
            existing.entry = entry;
            existing.description = description;
            existing.type = type;
            return Object.seal(existing);
        }
        throw new Error("addStoryCard returned false but couldn't find existing card");
    }

    // Find the newly created card
    // The returned index may not always be accurate, so we try multiple approaches
    let card = storyCards[newIndex];
    let actualIndex = newIndex;

    if (!card) {
        // Try finding by keys
        actualIndex = storyCards.findIndex(c => c.keys === keys);
        if (actualIndex >= 0) {
            card = storyCards[actualIndex];
        }
    }

    if (!card) {
        // Try the last element (newly added cards often go to the end)
        actualIndex = storyCards.length - 1;
        if (actualIndex >= 0 && storyCards[actualIndex].keys === keys) {
            card = storyCards[actualIndex];
        }
    }

    if (!card) {
        throw new Error(`Failed to create story card - not found at index ${newIndex}, by keys "${keys}", or at end of array`);
    }

    // Configure the card
    card.title = title;
    card.description = description;

    // Move to correct position if needed
    if (actualIndex !== insertionIndex) {
        storyCards.splice(actualIndex, 1);
        storyCards.splice(insertionIndex, 0, card);
    }

    return Object.seal(card);
};

/**
 * Find story card(s) by predicate
 * @param {Function} predicate - Test function (card => boolean)
 * @param {boolean} [getAll=false] - Return all matches or just first
 * @returns {Object|Object[]|null} Matching card(s)
 */
const getCard = (predicate, getAll = false) => {
    if (typeof predicate !== "function") {
        throw new Error("getCard requires a predicate function");
    }

    if (getAll) {
        return storyCards.filter(predicate).map(c => Object.seal(c));
    }

    const card = storyCards.find(predicate);
    return card ? Object.seal(card) : null;
};

/**
 * Remove a story card safely
 * @param {string} title - Card title to remove
 * @returns {boolean} Success status
 */
const removeCard = (title) => {
    const index = storyCards.findIndex(c => c.title === title);
    if (index > -1) {
        storyCards.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Create banned words template card if it doesn't exist
 * This allows users to ban specific words/phrases from AI output
 * @returns {boolean} True if card was created, false if already exists
 */
const ensureBannedWordsCard = () => {
    // Check if card already exists
    const existing = storyCards.find(c => c.keys && c.keys.includes('banned_words'));
    if (existing) {
        return false; // Already exists
    }

    // Create template card with USC-style format
    const templateText =
`# PRECISE mode: Removes just the phrase from within sentence
# Add phrases/words separated by commas or newlines

suddenly, meanwhile, literally, `;

    const templateCard = buildCard(
        'Word Bank - PRECISE',
        templateText,
        'Custom',
        'banned_words precise_removal',
        'Phrases removed from AI output (just the phrase)',
        100 // Low priority
    );

    safeLog('📝 Created PRECISE word bank card', 'success');
    return true;
};

/**
 * Create aggressive removal card template
 * @returns {boolean} True if card was created
 */
const ensureAggressiveCard = () => {
    const existing = storyCards.find(c => c.keys && c.keys.includes('aggressive_removal'));
    if (existing) {
        return false;
    }

    const templateText =
`# AGGRESSIVE mode: Removes entire sentence containing the phrase
# Add phrases/words separated by commas or newlines
# Bonepoke auto-adds repeated phrases here

unshed tears, well well well, `;

    const templateCard = buildCard(
        'Word Bank - AGGRESSIVE',
        templateText,
        'Custom',
        'aggressive_removal banned_sentences',
        'Entire sentences removed if containing these phrases',
        101
    );

    safeLog('📝 Created AGGRESSIVE word bank card', 'success');
    return true;
};

/**
 * Create word replacer card template
 * @returns {boolean} True if card was created
 */
const ensureReplacerCard = () => {
    const existing = storyCards.find(c => c.keys && c.keys.includes('word_replacer'));
    if (existing) {
        return false;
    }

    const templateText =
`# REPLACER mode: Substitutes one word for another (synonyms)
# Format: original => replacement (one per line)
# Bonepoke auto-adds fatigued words here with synonyms

utilize => use
robust => strong
commence => begin
`;

    const templateCard = buildCard(
        'Word Bank - REPLACER',
        templateText,
        'Custom',
        'word_replacer synonyms',
        'Word-to-word replacements (original => replacement)',
        102
    );

    safeLog('📝 Created REPLACER word bank card', 'success');
    return true;
};

/**
 * Robust synonym mappings for word replacement
 * Used when Bonepoke detects fatigued words
 * NOTE: Only actual synonyms - no pronoun changes or POV shifts
 */
const SYNONYM_MAP = {
    // Adverbs
    'suddenly': ['abruptly', 'quickly', 'unexpectedly', 'swiftly', 'instantly', 'promptly', 'sharply'],
    'very': ['extremely', 'quite', 'remarkably', 'considerably', 'exceptionally', 'intensely', 'highly'],
    'really': ['truly', 'genuinely', 'indeed', 'certainly', 'absolutely', 'definitely'],
    'literally': ['actually', 'truly', 'genuinely', 'precisely', 'exactly'],
    'just': ['merely', 'only', 'simply', 'barely'],
    'finally': ['eventually', 'ultimately', 'lastly', 'at last'],
    'slowly': ['gradually', 'steadily', 'leisurely', 'unhurriedly'],
    'quickly': ['rapidly', 'swiftly', 'speedily', 'hastily', 'promptly'],

    // Common verbs - BASIC TO COLLEGE LEVEL
    'said': ['stated', 'mentioned', 'remarked', 'noted', 'declared', 'expressed', 'uttered', 'voiced', 'articulated', 'proclaimed', 'asserted'],
    'got': ['obtained', 'received', 'acquired', 'gained', 'secured', 'procured'],
    'get': ['obtain', 'receive', 'acquire', 'gain', 'secure', 'procure'],
    'went': ['moved', 'proceeded', 'traveled', 'headed', 'walked', 'traversed', 'ventured'],
    'came': ['arrived', 'approached', 'entered', 'appeared', 'emerged', 'materialized'],
    'made': ['created', 'formed', 'crafted', 'produced', 'fashioned', 'constructed', 'fabricated'],
    'looked': ['gazed', 'stared', 'glanced', 'peered', 'observed', 'scrutinized', 'examined'],
    'turned': ['rotated', 'pivoted', 'spun', 'twisted', 'shifted', 'revolved'],
    'walked': ['strode', 'paced', 'stepped', 'moved', 'proceeded', 'ambled', 'sauntered', 'traversed'],
    'asked': ['inquired', 'questioned', 'queried', 'requested', 'interrogated'],
    'took': ['grabbed', 'seized', 'grasped', 'snatched', 'clutched', 'appropriated', 'commandeered'],
    'gave': ['offered', 'handed', 'presented', 'provided', 'extended', 'bestowed', 'conferred'],
    'felt': ['sensed', 'perceived', 'experienced', 'noticed', 'discerned'],
    'heard': ['detected', 'caught', 'perceived', 'noticed', 'discerned', 'ascertained'],
    'saw': ['spotted', 'noticed', 'observed', 'glimpsed', 'caught sight of', 'beheld', 'witnessed', 'perceived'],
    'moved': ['shifted', 'stirred', 'budged', 'relocated', 'transitioned', 'migrated'],
    'stood': ['rose', 'remained upright', 'positioned herself', 'positioned himself', 'erected himself', 'erected herself'],
    'sat': ['settled', 'perched', 'rested', 'seated herself', 'seated himself', 'reclined'],
    'pulled': ['tugged', 'yanked', 'drew', 'dragged', 'hauled', 'extracted'],
    'pushed': ['shoved', 'pressed', 'thrust', 'nudged', 'propelled', 'impelled'],
    'held': ['gripped', 'clutched', 'grasped', 'clenched', 'clasped', 'retained'],
    'opened': ['unlocked', 'unsealed', 'spread', 'unlatched', 'unfurled'],
    'closed': ['shut', 'sealed', 'latched', 'fastened', 'secured'],
    'grabbed': ['seized', 'snatched', 'clutched', 'gripped', 'apprehended'],
    'touched': ['grazed', 'brushed', 'contacted', 'felt', 'caressed'],
    'smiled': ['grinned', 'beamed', 'smirked'],
    'laughed': ['chuckled', 'giggled', 'snickered', 'cackled', 'guffawed'],
    'nodded': ['bobbed her head', 'bobbed his head', 'dipped her chin', 'dipped his chin', 'acquiesced'],
    'shook': ['trembled', 'quivered', 'shuddered', 'vibrated', 'oscillated'],
    'whispered': ['murmured', 'muttered', 'breathed', 'hissed', 'susurrated'],
    'shouted': ['yelled', 'called out', 'hollered', 'bellowed', 'exclaimed', 'proclaimed'],
    'spoke': ['talked', 'conversed', 'verbalized', 'articulated', 'discoursed'],
    'watched': ['observed', 'monitored', 'studied', 'eyed', 'surveyed', 'scrutinized'],
    'waited': ['paused', 'lingered', 'remained', 'stayed', 'tarried', 'loitered'],
    'tried': ['attempted', 'endeavored', 'sought', 'ventured', 'undertook'],
    'knew': ['understood', 'realized', 'recognized', 'comprehended', 'discerned', 'apprehended'],
    'thought': ['considered', 'pondered', 'reflected', 'mused', 'contemplated', 'ruminated'],
    'wanted': ['desired', 'craved', 'wished', 'yearned', 'coveted', 'longed for'],
    'needed': ['required', 'demanded', 'necessitated', 'mandated'],
    'seemed': ['appeared', 'looked', 'sounded'],
    'began': ['started', 'commenced', 'initiated', 'launched', 'inaugurated', 'embarked'],
    'stopped': ['halted', 'ceased', 'paused', 'froze', 'terminated', 'discontinued'],
    'continued': ['proceeded', 'persisted', 'carried on', 'maintained', 'sustained', 'perpetuated'],
    'followed': ['trailed', 'pursued', 'tracked', 'shadowed', 'succeeded'],
    'reached': ['extended', 'stretched', 'arrived at', 'attained', 'achieved'],
    'leaned': ['tilted', 'inclined', 'bent', 'slanted', 'reclined'],
    'pressed': ['pushed', 'squeezed', 'compressed', 'applied pressure', 'exerted force'],
    'lifted': ['raised', 'hoisted', 'elevated', 'picked up', 'heaved'],
    'dropped': ['released', 'let fall', 'let go of', 'discarded', 'relinquished'],
    'showed': ['displayed', 'exhibited', 'demonstrated', 'revealed', 'manifested'],
    'found': ['discovered', 'located', 'uncovered', 'detected', 'ascertained'],
    'brought': ['carried', 'conveyed', 'transported', 'delivered'],
    'kept': ['retained', 'maintained', 'preserved', 'sustained'],
    'left': ['departed', 'exited', 'abandoned', 'vacated', 'withdrew'],
    'ran': ['sprinted', 'dashed', 'rushed', 'bolted', 'hastened'],
    'fell': ['dropped', 'descended', 'plummeted', 'tumbled', 'collapsed'],
    'died': ['perished', 'expired', 'succumbed', 'passed away'],
    'lived': ['existed', 'resided', 'dwelled', 'inhabited'],
    'grew': ['expanded', 'increased', 'developed', 'flourished', 'burgeoned'],
    'changed': ['altered', 'modified', 'transformed', 'converted', 'metamorphosed'],
    'helped': ['assisted', 'aided', 'supported', 'facilitated'],
    'hurt': ['injured', 'harmed', 'wounded', 'damaged'],
    'broke': ['shattered', 'fractured', 'splintered', 'ruptured'],
    'built': ['constructed', 'erected', 'assembled', 'fabricated'],
    'wrote': ['penned', 'composed', 'authored', 'inscribed', 'transcribed'],
    'read': ['perused', 'scanned', 'examined', 'studied'],

    // Body parts - CREATIVE WRITING CONTEXT
    // In narrative prose, metonymy and part-for-whole are standard
    'eyes': ['gaze', 'stare', 'glance'],  // Metonymy: "her eyes" = "her gaze"
    'fingers': ['digits'],  // Fingers ARE digits (anatomically correct)
    'face': ['visage', 'features'],  // Literary synonyms
    'hair': ['locks', 'tresses'],  // Poetic variations
    'lips': ['mouth'],  // Part-for-whole (acceptable in context)
    'noggin': ['head'],  // Slang → proper
    'ticker': ['heart'], // Slang → proper
    'breath': ['exhale', 'inhale'],  // Context-dependent but common

    // Common adjectives - BASIC TO COLLEGE LEVEL
    // Vocabulary range from common to sophisticated
    'big': ['large', 'sizeable', 'substantial', 'considerable'],
    'small': ['little', 'compact', 'diminutive'],  // NOT minuscule (too extreme)
    'huge': ['enormous', 'massive', 'colossal', 'immense', 'prodigious', 'gargantuan'],
    'tiny': ['minuscule', 'infinitesimal', 'microscopic'],
    'good': ['fine', 'decent', 'admirable', 'commendable'],
    'excellent': ['superb', 'outstanding', 'exemplary', 'exceptional', 'superlative'],
    'bad': ['poor', 'unfavorable', 'inferior', 'substandard'],
    'awful': ['terrible', 'dreadful', 'abysmal', 'atrocious', 'deplorable'],
    'old': ['aged', 'elderly', 'antiquated', 'venerable'],
    'ancient': ['archaic', 'primordial', 'antediluvian'],
    'new': ['fresh', 'recent', 'novel', 'contemporary'],
    'dark': ['dim', 'shadowy', 'murky', 'obscure', 'tenebrous'],
    'light': ['bright', 'illuminated', 'luminous', 'radiant'],
    'happy': ['cheerful', 'joyful', 'content', 'elated', 'jubilant'],
    'sad': ['unhappy', 'sorrowful', 'melancholy', 'dejected', 'despondent'],
    'angry': ['mad', 'furious', 'irate', 'incensed', 'wrathful'],
    'scared': ['afraid', 'frightened', 'terrified', 'apprehensive', 'trepidatious'],
    'brave': ['courageous', 'valiant', 'bold', 'intrepid', 'dauntless'],
    'smart': ['intelligent', 'clever', 'bright', 'astute', 'sagacious', 'perspicacious'],
    'stupid': ['dumb', 'foolish', 'idiotic', 'asinine', 'moronic'],
    'pretty': ['attractive', 'comely', 'fair', 'fetching'],
    'handsome': ['attractive', 'good-looking', 'striking'],
    // Colors - shades ARE acceptable in descriptive prose
    'red': ['crimson', 'scarlet'],  // Shade variations OK for creative writing
    'blue': ['azure', 'cobalt'],
    'green': ['emerald', 'jade'],
    'white': ['pale', 'ivory'],
    'black': ['ebony', 'obsidian'],
    'gray': ['grey', 'silver', 'ashen'],
    'soft': ['gentle', 'tender', 'pliant', 'supple'],
    'hard': ['solid', 'firm', 'rigid', 'unyielding'],
    'hot': ['heated', 'sweltering', 'torrid'],
    'warm': ['heated', 'tepid', 'lukewarm'],
    'burning': ['scorching', 'searing', 'blazing'],
    'cold': ['chilly', 'frigid', 'gelid'],
    'cool': ['chilly', 'refreshing'],
    'wet': ['damp', 'moist', 'sodden'],
    'soaked': ['drenched', 'saturated', 'waterlogged'],
    'dry': ['arid', 'parched', 'desiccated'],
    'loud': ['noisy', 'clamorous', 'boisterous'],
    'deafening': ['thunderous', 'earsplitting'],
    'quiet': ['silent', 'hushed', 'tranquil', 'serene'],
    'fast': ['quick', 'rapid', 'swift', 'speedy', 'expeditious'],
    'slow': ['sluggish', 'leisurely', 'languid', 'torpid'],
    'heavy': ['weighty', 'ponderous', 'burdensome'],
    'empty': ['vacant', 'hollow', 'void', 'barren', 'desolate'],
    'full': ['filled', 'replete', 'saturated', 'brimming'],
    'long': ['lengthy', 'extended', 'prolonged', 'protracted'],
    'short': ['brief', 'concise', 'abbreviated', 'truncated'],
    'wide': ['broad', 'expansive', 'extensive'],
    'narrow': ['slim', 'slender', 'constricted'],
    'high': ['tall', 'elevated', 'lofty', 'towering'],
    'deep': ['profound', 'abyssal', 'unfathomable'],
    'thick': ['dense', 'viscous', 'substantial'],
    'thin': ['slender', 'slim', 'lean', 'gaunt', 'emaciated'],
    'strong': ['powerful', 'robust', 'sturdy', 'formidable', 'mighty'],
    'weak': ['feeble', 'frail', 'infirm', 'enervated'],
    'rough': ['coarse', 'uneven', 'jagged', 'rugged'],
    'smooth': ['sleek', 'even', 'polished', 'silky'],
    'sharp': ['keen', 'pointed', 'acute', 'piercing'],
    'dull': ['blunt', 'obtuse'],
    'clean': ['spotless', 'pristine', 'immaculate', 'unblemished'],
    'dirty': ['filthy', 'soiled', 'grimy', 'squalid'],
    'beautiful': ['lovely', 'attractive', 'exquisite', 'resplendent'],
    'gorgeous': ['stunning', 'magnificent', 'splendid'],
    'ugly': ['unattractive', 'unsightly', 'hideous', 'grotesque'],
    'strange': ['odd', 'peculiar', 'bizarre', 'anomalous', 'aberrant'],
    'normal': ['ordinary', 'typical', 'conventional', 'standard'],
    'rare': ['uncommon', 'scarce', 'infrequent', 'anomalous'],
    'common': ['usual', 'ordinary', 'prevalent', 'ubiquitous'],
    'easy': ['simple', 'effortless', 'uncomplicated', 'facile'],
    'hard': ['difficult', 'challenging', 'arduous', 'onerous'],
    'important': ['significant', 'crucial', 'vital', 'paramount', 'pivotal'],
    'dangerous': ['perilous', 'hazardous', 'treacherous', 'precarious'],
    'safe': ['secure', 'protected', 'sheltered'],
    'crazy': ['insane', 'mad', 'deranged', 'demented', 'lunatic'],
    'calm': ['peaceful', 'tranquil', 'serene', 'placid', 'unperturbed'],

    // Common nouns - BASIC TO COLLEGE LEVEL
    // Vocabulary range from common to sophisticated
    'thing': ['object', 'item', 'article', 'entity'],
    'stuff': ['things', 'items', 'possessions', 'belongings'],
    'place': ['location', 'spot', 'locale', 'venue', 'locus'],
    'way': ['manner', 'method', 'approach', 'mode'],
    'room': ['chamber', 'quarters', 'compartment'],
    'door': ['doorway', 'portal', 'threshold', 'entrance'],
    'wall': ['partition', 'barrier', 'barricade'],
    'window': ['pane', 'aperture'],
    'light': ['illumination', 'glow', 'lamp', 'luminescence', 'radiance'],
    'fire': ['flame', 'blaze', 'conflagration', 'inferno'],
    'sound': ['noise', 'resonance', 'reverberation'],
    'smell': ['scent', 'odor', 'aroma', 'fragrance', 'redolence'],
    'street': ['road', 'avenue', 'thoroughfare', 'boulevard'],
    'house': ['home', 'dwelling', 'residence', 'abode', 'domicile'],
    'building': ['structure', 'edifice', 'construction'],
    'city': ['town', 'metropolis', 'municipality', 'urban center'],
    'world': ['globe', 'planet', 'earth', 'sphere'],
    'person': ['individual', 'human', 'being', 'soul'],
    'man': ['guy', 'fellow', 'gentleman'],
    'woman': ['lady', 'gal'],
    'child': ['kid', 'youngster', 'youth', 'juvenile'],
    'friend': ['companion', 'pal', 'buddy', 'comrade', 'confidant'],
    'enemy': ['foe', 'adversary', 'antagonist', 'nemesis'],
    'moment': ['instant', 'second', 'juncture'],
    'silence': ['quiet', 'stillness', 'hush', 'tranquility'],
    'noise': ['sound', 'racket', 'clamor', 'din', 'cacophony'],
    'word': ['term', 'expression', 'utterance', 'vocable'],
    'question': ['query', 'inquiry', 'interrogation'],
    'answer': ['response', 'reply', 'retort', 'rejoinder'],
    'problem': ['issue', 'difficulty', 'dilemma', 'predicament', 'quandary'],
    'idea': ['thought', 'notion', 'concept', 'conception'],
    'feeling': ['emotion', 'sentiment', 'sensation', 'affect'],
    'pain': ['ache', 'hurt', 'suffering', 'discomfort', 'agony', 'torment'],
    'pleasure': ['delight', 'enjoyment', 'gratification', 'satisfaction'],
    'fear': ['dread', 'terror', 'fright', 'trepidation', 'apprehension'],
    'hope': ['optimism', 'expectation', 'aspiration'],
    'anger': ['rage', 'fury', 'wrath', 'ire', 'indignation'],
    'love': ['affection', 'adoration', 'devotion', 'fondness'],
    'hate': ['loathing', 'abhorrence', 'detestation', 'animosity'],
    'truth': ['fact', 'reality', 'veracity', 'verity'],
    'lie': ['falsehood', 'untruth', 'fabrication', 'prevarication'],
    'power': ['strength', 'force', 'might', 'potency'],
    'weakness': ['frailty', 'feebleness', 'vulnerability', 'infirmity'],
    'victory': ['triumph', 'conquest', 'success'],
    'defeat': ['loss', 'failure', 'rout'],
    'war': ['conflict', 'battle', 'combat', 'warfare', 'hostilities'],
    'peace': ['tranquility', 'serenity', 'harmony', 'concord'],
    'journey': ['trip', 'voyage', 'expedition', 'trek', 'sojourn'],
    'end': ['conclusion', 'termination', 'finale', 'cessation', 'denouement'],
    'beginning': ['start', 'commencement', 'inception', 'genesis', 'origin'],
    'ship': ['vessel', 'craft', 'spacecraft', 'rocket', 'hull'],

    // Common 2-word phrases (will be matched as complete phrases)
    'combat boots': ['military footwear', 'tactical boots', 'heavy boots', 'steel-toed boots'],
    'emerald eyes': ['green eyes', 'jade gaze', 'verdant eyes', 'forest-green eyes'],
    'nervous laugh': ['awkward chuckle', 'uneasy giggle', 'tense laugh', 'forced chuckle'],
    'deep breath': ['long inhale', 'steady breath', 'calming breath', 'slow inhale'],
    'slight smile': ['faint grin', 'subtle smirk', 'small smile', 'hint of a smile'],
    'quick glance': ['brief look', 'fleeting glimpse', 'rapid peek', 'swift glance'],
    'long sigh': ['deep exhale', 'heavy breath', 'weary sigh', 'prolonged exhale'],

    // Sound effects (common overused ones)
    '*scuff*': ['*scrape*', '*shuffle*', '*scratch*', '*drag*'],
    '*gulp*': ['*swallow*', '*glug*', '*swig*'],
    '*schlick*': ['*squelch*', '*slurp*', '*slosh*'],
    '*schlorp*': ['*slurp*', '*gulp*', '*glug*'],
    '*thud*': ['*thump*', '*bang*', '*crash*', '*slam*'],
    '*click*': ['*snap*', '*clack*', '*tick*'],
    '*creak*': ['*groan*', '*squeak*', '*scrape*'],
    '*rustle*': ['*swish*', '*whisper*', '*flutter*']
};

/**
 * Get a random synonym for a word
 * @param {string} word - The word to find synonym for
 * @returns {string} Synonym or original word if none found
 */
const getSynonym = (word) => {
    const lower = word.toLowerCase();
    const synonyms = SYNONYM_MAP[lower];
    if (!synonyms || synonyms.length === 0) {
        return word; // No synonym found, return original
    }
    const randomIndex = Math.floor(Math.random() * synonyms.length);
    return synonyms[randomIndex];
};

/**
 * Enhanced Synonym Map with Quality Metadata
 * Each synonym has emotion (1-5) and precision (1-5) ratings
 * Used by getSmartSynonym() for Bonepoke-aware replacement
 */
const ENHANCED_SYNONYM_MAP = {
    // High-frequency verbs
    'walked': {
        synonyms: [
            { word: 'strolled', emotion: 2, precision: 3, tags: ['casual', 'slow'] },
            { word: 'marched', emotion: 4, precision: 4, tags: ['purposeful', 'strong'] },
            { word: 'trudged', emotion: 4, precision: 4, tags: ['weary', 'slow'] },
            { word: 'strode', emotion: 3, precision: 4, tags: ['confident', 'fast'] },
            { word: 'shuffled', emotion: 3, precision: 4, tags: ['tired', 'slow'] },
            { word: 'sauntered', emotion: 3, precision: 4, tags: ['casual', 'relaxed'] },
            { word: 'paced', emotion: 3, precision: 3, tags: ['nervous', 'repetitive'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'said': {
        synonyms: [
            { word: 'murmured', emotion: 3, precision: 4, tags: ['quiet', 'intimate'], dialogue: true },
            { word: 'whispered', emotion: 4, precision: 4, tags: ['quiet', 'secretive'], dialogue: true },
            { word: 'shouted', emotion: 5, precision: 4, tags: ['loud', 'intense'], dialogue: true },
            { word: 'declared', emotion: 3, precision: 4, tags: ['formal', 'firm'], dialogue: true },
            { word: 'muttered', emotion: 3, precision: 4, tags: ['quiet', 'annoyed'], dialogue: true },
            { word: 'replied', emotion: 2, precision: 3, tags: ['neutral', 'responsive'], dialogue: true },
            { word: 'began', emotion: 2, precision: 3, tags: ['start', 'neutral'], dialogue: true }
        ],
        baseEmotion: 1, basePrecision: 2, dialogueVerb: true
    },

    'looked': {
        synonyms: [
            { word: 'glanced', emotion: 2, precision: 4, tags: ['quick', 'brief'] },
            { word: 'stared', emotion: 3, precision: 4, tags: ['intense', 'prolonged'] },
            { word: 'gazed', emotion: 3, precision: 4, tags: ['soft', 'prolonged'] },
            { word: 'peered', emotion: 3, precision: 4, tags: ['careful', 'scrutinizing'] },
            { word: 'glared', emotion: 4, precision: 4, tags: ['angry', 'intense'] },
            { word: 'observed', emotion: 2, precision: 3, tags: ['neutral', 'watchful'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'went': {
        synonyms: [
            { word: 'traveled', emotion: 2, precision: 3, tags: ['journey', 'distance'] },
            { word: 'proceeded', emotion: 2, precision: 3, tags: ['formal', 'continued'] },
            { word: 'moved', emotion: 1, precision: 2, tags: ['neutral', 'basic'] },
            { word: 'ventured', emotion: 3, precision: 4, tags: ['brave', 'risky'] },
            { word: 'headed', emotion: 2, precision: 3, tags: ['directional', 'purposeful'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'turned': {
        synonyms: [
            { word: 'spun', emotion: 3, precision: 4, tags: ['fast', 'complete'] },
            { word: 'pivoted', emotion: 3, precision: 4, tags: ['quick', 'precise'] },
            { word: 'rotated', emotion: 2, precision: 3, tags: ['mechanical', 'slow'] },
            { word: 'wheeled', emotion: 3, precision: 4, tags: ['sudden', 'complete'] },
            { word: 'twisted', emotion: 3, precision: 4, tags: ['forceful', 'strained'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'smiled': {
        synonyms: [
            { word: 'grinned', emotion: 4, precision: 4, tags: ['wide', 'happy'] },
            { word: 'beamed', emotion: 4, precision: 4, tags: ['bright', 'joyful'] },
            { word: 'smirked', emotion: 4, precision: 4, tags: ['smug', 'knowing'] }
        ],
        baseEmotion: 2, basePrecision: 3
    },

    'laughed': {
        synonyms: [
            { word: 'chuckled', emotion: 3, precision: 4, tags: ['soft', 'amused'] },
            { word: 'giggled', emotion: 4, precision: 4, tags: ['light', 'playful'] },
            { word: 'guffawed', emotion: 5, precision: 4, tags: ['loud', 'hearty'] },
            { word: 'cackled', emotion: 5, precision: 4, tags: ['wild', 'manic'] },
            { word: 'snickered', emotion: 3, precision: 4, tags: ['quiet', 'sly'] }
        ],
        baseEmotion: 3, basePrecision: 3
    },

    'moved': {
        synonyms: [
            { word: 'shifted', emotion: 2, precision: 3, tags: ['slight', 'adjustment'] },
            { word: 'stirred', emotion: 2, precision: 3, tags: ['awakening', 'slow'] },
            { word: 'relocated', emotion: 2, precision: 4, tags: ['complete', 'distant'] },
            { word: 'transitioned', emotion: 2, precision: 4, tags: ['smooth', 'gradual'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'felt': {
        synonyms: [
            { word: 'sensed', emotion: 3, precision: 4, tags: ['intuitive', 'aware'] },
            { word: 'experienced', emotion: 2, precision: 3, tags: ['neutral', 'direct'] },
            { word: 'perceived', emotion: 3, precision: 4, tags: ['intellectual', 'aware'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'nodded': {
        synonyms: [
            { word: 'bobbed her head', emotion: 2, precision: 4, tags: ['feminine', 'quick'] },
            { word: 'bobbed his head', emotion: 2, precision: 4, tags: ['masculine', 'quick'] },
            { word: 'dipped her chin', emotion: 3, precision: 4, tags: ['feminine', 'subtle'] },
            { word: 'dipped his chin', emotion: 3, precision: 4, tags: ['masculine', 'subtle'] },
            { word: 'acquiesced', emotion: 3, precision: 5, tags: ['formal', 'agreement'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'shook': {
        synonyms: [
            { word: 'trembled', emotion: 4, precision: 4, tags: ['fear', 'cold'] },
            { word: 'quivered', emotion: 4, precision: 4, tags: ['slight', 'fear'] },
            { word: 'shuddered', emotion: 5, precision: 4, tags: ['intense', 'disgust'] },
            { word: 'vibrated', emotion: 2, precision: 3, tags: ['mechanical', 'rapid'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'big': {
        synonyms: [
            { word: 'large', emotion: 1, precision: 2, tags: ['neutral', 'size'] },
            { word: 'sizeable', emotion: 2, precision: 3, tags: ['notable', 'measured'] },
            { word: 'substantial', emotion: 2, precision: 4, tags: ['important', 'considerable'] },
            { word: 'considerable', emotion: 2, precision: 4, tags: ['significant', 'notable'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'small': {
        synonyms: [
            { word: 'little', emotion: 1, precision: 2, tags: ['neutral', 'diminutive'] },
            { word: 'compact', emotion: 2, precision: 3, tags: ['efficient', 'dense'] },
            { word: 'diminutive', emotion: 3, precision: 4, tags: ['tiny', 'delicate'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'good': {
        synonyms: [
            { word: 'fine', emotion: 1, precision: 2, tags: ['adequate', 'acceptable'] },
            { word: 'decent', emotion: 2, precision: 3, tags: ['respectable', 'satisfactory'] },
            { word: 'admirable', emotion: 3, precision: 4, tags: ['praiseworthy', 'impressive'] },
            { word: 'commendable', emotion: 3, precision: 4, tags: ['praiseworthy', 'excellent'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'bad': {
        synonyms: [
            { word: 'poor', emotion: 2, precision: 2, tags: ['substandard', 'weak'] },
            { word: 'unfavorable', emotion: 3, precision: 3, tags: ['negative', 'unfortunate'] },
            { word: 'inferior', emotion: 3, precision: 4, tags: ['lesser', 'deficient'] },
            { word: 'substandard', emotion: 3, precision: 4, tags: ['below-average', 'inadequate'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'happy': {
        synonyms: [
            { word: 'cheerful', emotion: 4, precision: 4, tags: ['bright', 'positive'] },
            { word: 'joyful', emotion: 5, precision: 4, tags: ['intense', 'celebratory'] },
            { word: 'content', emotion: 3, precision: 3, tags: ['peaceful', 'satisfied'] },
            { word: 'elated', emotion: 5, precision: 4, tags: ['euphoric', 'ecstatic'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'sad': {
        synonyms: [
            { word: 'unhappy', emotion: 3, precision: 2, tags: ['basic', 'negative'] },
            { word: 'sorrowful', emotion: 4, precision: 4, tags: ['grief', 'deep'] },
            { word: 'melancholy', emotion: 4, precision: 5, tags: ['pensive', 'wistful'] },
            { word: 'dejected', emotion: 4, precision: 4, tags: ['downcast', 'defeated'] },
            { word: 'despondent', emotion: 5, precision: 4, tags: ['hopeless', 'despair'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'angry': {
        synonyms: [
            { word: 'mad', emotion: 3, precision: 2, tags: ['informal', 'upset'] },
            { word: 'furious', emotion: 5, precision: 4, tags: ['intense', 'rage'] },
            { word: 'irate', emotion: 4, precision: 4, tags: ['formal', 'indignant'] },
            { word: 'incensed', emotion: 5, precision: 4, tags: ['outraged', 'inflamed'] },
            { word: 'wrathful', emotion: 5, precision: 5, tags: ['righteous', 'vengeful'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'scared': {
        synonyms: [
            { word: 'afraid', emotion: 3, precision: 2, tags: ['basic', 'fearful'] },
            { word: 'frightened', emotion: 4, precision: 3, tags: ['alarmed', 'startled'] },
            { word: 'terrified', emotion: 5, precision: 4, tags: ['extreme', 'panicked'] },
            { word: 'apprehensive', emotion: 3, precision: 4, tags: ['worried', 'uneasy'] },
            { word: 'trepidatious', emotion: 4, precision: 5, tags: ['formal', 'fearful'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'dark': {
        synonyms: [
            { word: 'dim', emotion: 2, precision: 3, tags: ['slight', 'low-light'] },
            { word: 'shadowy', emotion: 3, precision: 4, tags: ['mysterious', 'concealing'] },
            { word: 'murky', emotion: 3, precision: 4, tags: ['cloudy', 'obscure'] },
            { word: 'obscure', emotion: 3, precision: 3, tags: ['hidden', 'unclear'] },
            { word: 'tenebrous', emotion: 4, precision: 5, tags: ['literary', 'ominous'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    // === MORE HIGH-FREQUENCY VERBS ===

    'took': {
        synonyms: [
            { word: 'grabbed', emotion: 3, precision: 3, tags: ['quick', 'forceful'] },
            { word: 'seized', emotion: 4, precision: 4, tags: ['aggressive', 'sudden'] },
            { word: 'grasped', emotion: 3, precision: 3, tags: ['firm', 'deliberate'] },
            { word: 'snatched', emotion: 4, precision: 4, tags: ['quick', 'aggressive'] },
            { word: 'clutched', emotion: 4, precision: 4, tags: ['desperate', 'tight'] },
            { word: 'appropriated', emotion: 3, precision: 4, tags: ['formal', 'claimed'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'gave': {
        synonyms: [
            { word: 'offered', emotion: 3, precision: 3, tags: ['polite', 'willing'] },
            { word: 'handed', emotion: 2, precision: 3, tags: ['direct', 'simple'] },
            { word: 'presented', emotion: 3, precision: 4, tags: ['formal', 'ceremonial'] },
            { word: 'provided', emotion: 2, precision: 3, tags: ['neutral', 'supplied'] },
            { word: 'extended', emotion: 3, precision: 4, tags: ['reaching', 'offering'] },
            { word: 'bestowed', emotion: 4, precision: 5, tags: ['formal', 'generous'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'heard': {
        synonyms: [
            { word: 'detected', emotion: 2, precision: 4, tags: ['aware', 'noticed'] },
            { word: 'caught', emotion: 2, precision: 3, tags: ['brief', 'partial'] },
            { word: 'perceived', emotion: 3, precision: 4, tags: ['sensed', 'aware'] },
            { word: 'noticed', emotion: 2, precision: 3, tags: ['aware', 'observed'] },
            { word: 'discerned', emotion: 3, precision: 5, tags: ['distinguished', 'careful'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'saw': {
        synonyms: [
            { word: 'spotted', emotion: 2, precision: 4, tags: ['noticed', 'found'] },
            { word: 'noticed', emotion: 2, precision: 3, tags: ['aware', 'observed'] },
            { word: 'observed', emotion: 2, precision: 3, tags: ['watched', 'studied'] },
            { word: 'glimpsed', emotion: 3, precision: 4, tags: ['brief', 'partial'] },
            { word: 'beheld', emotion: 4, precision: 5, tags: ['formal', 'literary'] },
            { word: 'witnessed', emotion: 3, precision: 4, tags: ['event', 'important'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'came': {
        synonyms: [
            { word: 'arrived', emotion: 2, precision: 3, tags: ['reached', 'destination'] },
            { word: 'approached', emotion: 2, precision: 3, tags: ['nearing', 'advancing'] },
            { word: 'entered', emotion: 2, precision: 4, tags: ['inside', 'doorway'] },
            { word: 'appeared', emotion: 3, precision: 3, tags: ['sudden', 'visible'] },
            { word: 'emerged', emotion: 3, precision: 4, tags: ['revealed', 'from-hiding'] },
            { word: 'materialized', emotion: 4, precision: 4, tags: ['sudden', 'magical'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'got': {
        synonyms: [
            { word: 'obtained', emotion: 2, precision: 3, tags: ['acquired', 'formal'] },
            { word: 'received', emotion: 2, precision: 3, tags: ['given', 'passive'] },
            { word: 'acquired', emotion: 2, precision: 4, tags: ['gained', 'obtained'] },
            { word: 'gained', emotion: 2, precision: 3, tags: ['earned', 'achieved'] },
            { word: 'secured', emotion: 3, precision: 4, tags: ['ensured', 'protected'] },
            { word: 'procured', emotion: 3, precision: 4, tags: ['obtained', 'formal'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'made': {
        synonyms: [
            { word: 'created', emotion: 3, precision: 3, tags: ['built', 'new'] },
            { word: 'formed', emotion: 2, precision: 3, tags: ['shaped', 'structured'] },
            { word: 'crafted', emotion: 3, precision: 4, tags: ['skillful', 'careful'] },
            { word: 'produced', emotion: 2, precision: 3, tags: ['generated', 'output'] },
            { word: 'fashioned', emotion: 3, precision: 4, tags: ['shaped', 'designed'] },
            { word: 'constructed', emotion: 3, precision: 4, tags: ['built', 'assembled'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'opened': {
        synonyms: [
            { word: 'unlocked', emotion: 2, precision: 4, tags: ['key', 'access'] },
            { word: 'unsealed', emotion: 3, precision: 4, tags: ['revealed', 'first-time'] },
            { word: 'spread', emotion: 2, precision: 3, tags: ['widened', 'apart'] },
            { word: 'unlatched', emotion: 2, precision: 4, tags: ['mechanism', 'released'] },
            { word: 'unfurled', emotion: 3, precision: 4, tags: ['unrolled', 'dramatic'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'closed': {
        synonyms: [
            { word: 'shut', emotion: 2, precision: 2, tags: ['simple', 'direct'] },
            { word: 'sealed', emotion: 3, precision: 4, tags: ['secure', 'airtight'] },
            { word: 'latched', emotion: 2, precision: 4, tags: ['locked', 'secured'] },
            { word: 'fastened', emotion: 2, precision: 3, tags: ['secured', 'attached'] },
            { word: 'secured', emotion: 3, precision: 4, tags: ['locked', 'safe'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'grabbed': {
        synonyms: [
            { word: 'seized', emotion: 4, precision: 4, tags: ['sudden', 'forceful'] },
            { word: 'snatched', emotion: 4, precision: 4, tags: ['quick', 'aggressive'] },
            { word: 'clutched', emotion: 4, precision: 4, tags: ['desperate', 'tight'] },
            { word: 'gripped', emotion: 3, precision: 3, tags: ['firm', 'holding'] }
        ],
        baseEmotion: 3, basePrecision: 3
    },

    'touched': {
        synonyms: [
            { word: 'grazed', emotion: 2, precision: 4, tags: ['light', 'brief'] },
            { word: 'brushed', emotion: 2, precision: 4, tags: ['gentle', 'passing'] },
            { word: 'contacted', emotion: 1, precision: 3, tags: ['neutral', 'connected'] },
            { word: 'caressed', emotion: 4, precision: 4, tags: ['gentle', 'affectionate'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'whispered': {
        synonyms: [
            { word: 'murmured', emotion: 3, precision: 4, tags: ['soft', 'quiet'], dialogue: true },
            { word: 'muttered', emotion: 3, precision: 4, tags: ['low', 'grumbling'], dialogue: true },
            { word: 'breathed', emotion: 4, precision: 4, tags: ['intimate', 'soft'], dialogue: true },
            { word: 'hissed', emotion: 4, precision: 4, tags: ['angry', 'sharp'], dialogue: true }
        ],
        baseEmotion: 3, basePrecision: 3, dialogueVerb: true
    },

    'shouted': {
        synonyms: [
            { word: 'yelled', emotion: 4, precision: 3, tags: ['loud', 'angry'], dialogue: true },
            { word: 'called out', emotion: 3, precision: 3, tags: ['loud', 'distance'], dialogue: true },
            { word: 'hollered', emotion: 4, precision: 4, tags: ['loud', 'informal'], dialogue: true },
            { word: 'bellowed', emotion: 5, precision: 4, tags: ['very-loud', 'powerful'], dialogue: true },
            { word: 'exclaimed', emotion: 4, precision: 3, tags: ['surprised', 'sudden'], dialogue: true }
        ],
        baseEmotion: 4, basePrecision: 3, dialogueVerb: true
    },

    'spoke': {
        synonyms: [
            { word: 'talked', emotion: 1, precision: 2, tags: ['casual', 'conversed'], dialogue: true },
            { word: 'conversed', emotion: 2, precision: 3, tags: ['dialogue', 'exchange'], dialogue: true },
            { word: 'verbalized', emotion: 2, precision: 4, tags: ['expressed', 'formal'], dialogue: true },
            { word: 'articulated', emotion: 3, precision: 4, tags: ['clear', 'precise'], dialogue: true }
        ],
        baseEmotion: 1, basePrecision: 2, dialogueVerb: true
    },

    'watched': {
        synonyms: [
            { word: 'observed', emotion: 2, precision: 3, tags: ['careful', 'attentive'] },
            { word: 'monitored', emotion: 2, precision: 4, tags: ['tracking', 'vigilant'] },
            { word: 'studied', emotion: 3, precision: 4, tags: ['intense', 'learning'] },
            { word: 'eyed', emotion: 3, precision: 3, tags: ['suspicious', 'wary'] },
            { word: 'surveyed', emotion: 2, precision: 4, tags: ['scanning', 'comprehensive'] },
            { word: 'scrutinized', emotion: 3, precision: 5, tags: ['detailed', 'critical'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'waited': {
        synonyms: [
            { word: 'paused', emotion: 2, precision: 3, tags: ['brief', 'temporary'] },
            { word: 'lingered', emotion: 3, precision: 4, tags: ['reluctant', 'staying'] },
            { word: 'remained', emotion: 2, precision: 3, tags: ['stayed', 'stationary'] },
            { word: 'stayed', emotion: 2, precision: 2, tags: ['remained', 'didn\'t-leave'] },
            { word: 'tarried', emotion: 3, precision: 4, tags: ['delayed', 'literary'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'tried': {
        synonyms: [
            { word: 'attempted', emotion: 2, precision: 3, tags: ['effort', 'endeavored'] },
            { word: 'endeavored', emotion: 3, precision: 4, tags: ['earnest', 'serious'] },
            { word: 'sought', emotion: 3, precision: 4, tags: ['searching', 'pursuing'] },
            { word: 'ventured', emotion: 3, precision: 4, tags: ['risky', 'brave'] },
            { word: 'undertook', emotion: 3, precision: 4, tags: ['formal', 'began'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'knew': {
        synonyms: [
            { word: 'understood', emotion: 2, precision: 3, tags: ['comprehended', 'grasped'] },
            { word: 'realized', emotion: 3, precision: 3, tags: ['discovered', 'recognized'] },
            { word: 'recognized', emotion: 2, precision: 3, tags: ['identified', 'knew'] },
            { word: 'comprehended', emotion: 2, precision: 4, tags: ['understood', 'grasped'] },
            { word: 'discerned', emotion: 3, precision: 5, tags: ['perceived', 'distinguished'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'thought': {
        synonyms: [
            { word: 'considered', emotion: 2, precision: 3, tags: ['deliberated', 'weighed'] },
            { word: 'pondered', emotion: 3, precision: 4, tags: ['deep', 'careful'] },
            { word: 'reflected', emotion: 3, precision: 4, tags: ['introspective', 'thoughtful'] },
            { word: 'mused', emotion: 3, precision: 4, tags: ['wondered', 'contemplative'] },
            { word: 'contemplated', emotion: 3, precision: 4, tags: ['deep', 'serious'] },
            { word: 'ruminated', emotion: 3, precision: 5, tags: ['deep', 'prolonged'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'wanted': {
        synonyms: [
            { word: 'desired', emotion: 3, precision: 3, tags: ['wished', 'craved'] },
            { word: 'craved', emotion: 4, precision: 4, tags: ['intense', 'yearning'] },
            { word: 'wished', emotion: 2, precision: 2, tags: ['hoped', 'wanted'] },
            { word: 'yearned', emotion: 4, precision: 4, tags: ['longing', 'deep'] },
            { word: 'coveted', emotion: 4, precision: 4, tags: ['envious', 'desired'] },
            { word: 'longed for', emotion: 4, precision: 4, tags: ['deep', 'persistent'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'needed': {
        synonyms: [
            { word: 'required', emotion: 2, precision: 3, tags: ['necessary', 'demanded'] },
            { word: 'demanded', emotion: 3, precision: 4, tags: ['urgent', 'insisted'] },
            { word: 'necessitated', emotion: 2, precision: 4, tags: ['required', 'formal'] },
            { word: 'mandated', emotion: 3, precision: 4, tags: ['required', 'authoritative'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'seemed': {
        synonyms: [
            { word: 'appeared', emotion: 1, precision: 3, tags: ['looked', 'impression'] },
            { word: 'looked', emotion: 1, precision: 2, tags: ['appeared', 'visual'] },
            { word: 'sounded', emotion: 1, precision: 3, tags: ['appeared', 'auditory'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'began': {
        synonyms: [
            { word: 'started', emotion: 2, precision: 2, tags: ['initiated', 'commenced'] },
            { word: 'commenced', emotion: 2, precision: 4, tags: ['formal', 'started'] },
            { word: 'initiated', emotion: 2, precision: 4, tags: ['started', 'triggered'] },
            { word: 'launched', emotion: 3, precision: 4, tags: ['started', 'energetic'] },
            { word: 'embarked', emotion: 3, precision: 4, tags: ['journey', 'started'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'stopped': {
        synonyms: [
            { word: 'halted', emotion: 3, precision: 3, tags: ['sudden', 'ceased'] },
            { word: 'ceased', emotion: 2, precision: 4, tags: ['ended', 'formal'] },
            { word: 'paused', emotion: 2, precision: 3, tags: ['temporary', 'brief'] },
            { word: 'froze', emotion: 4, precision: 4, tags: ['sudden', 'immobile'] },
            { word: 'terminated', emotion: 3, precision: 4, tags: ['ended', 'formal'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'continued': {
        synonyms: [
            { word: 'proceeded', emotion: 2, precision: 3, tags: ['advanced', 'forward'] },
            { word: 'persisted', emotion: 3, precision: 4, tags: ['determined', 'endured'] },
            { word: 'carried on', emotion: 2, precision: 3, tags: ['kept-going', 'maintained'] },
            { word: 'maintained', emotion: 2, precision: 3, tags: ['sustained', 'kept'] },
            { word: 'sustained', emotion: 2, precision: 4, tags: ['prolonged', 'maintained'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'followed': {
        synonyms: [
            { word: 'trailed', emotion: 2, precision: 3, tags: ['behind', 'tracking'] },
            { word: 'pursued', emotion: 3, precision: 4, tags: ['chasing', 'determined'] },
            { word: 'tracked', emotion: 3, precision: 4, tags: ['following', 'hunting'] },
            { word: 'shadowed', emotion: 3, precision: 4, tags: ['secretly', 'stalking'] },
            { word: 'succeeded', emotion: 2, precision: 4, tags: ['came-after', 'sequence'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'reached': {
        synonyms: [
            { word: 'extended', emotion: 2, precision: 3, tags: ['stretched', 'reaching'] },
            { word: 'stretched', emotion: 2, precision: 3, tags: ['extended', 'reaching'] },
            { word: 'arrived at', emotion: 2, precision: 3, tags: ['destination', 'got-to'] },
            { word: 'attained', emotion: 3, precision: 4, tags: ['achieved', 'accomplished'] },
            { word: 'achieved', emotion: 3, precision: 4, tags: ['accomplished', 'succeeded'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'leaned': {
        synonyms: [
            { word: 'tilted', emotion: 2, precision: 3, tags: ['angled', 'slanted'] },
            { word: 'inclined', emotion: 2, precision: 4, tags: ['angled', 'sloped'] },
            { word: 'bent', emotion: 2, precision: 3, tags: ['curved', 'flexed'] },
            { word: 'slanted', emotion: 2, precision: 3, tags: ['diagonal', 'angled'] },
            { word: 'reclined', emotion: 2, precision: 4, tags: ['backward', 'relaxed'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'pressed': {
        synonyms: [
            { word: 'pushed', emotion: 2, precision: 3, tags: ['force', 'applied'] },
            { word: 'squeezed', emotion: 3, precision: 4, tags: ['compressed', 'tight'] },
            { word: 'compressed', emotion: 2, precision: 4, tags: ['squeezed', 'compacted'] },
            { word: 'applied pressure', emotion: 2, precision: 4, tags: ['force', 'pushing'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'lifted': {
        synonyms: [
            { word: 'raised', emotion: 2, precision: 3, tags: ['elevated', 'up'] },
            { word: 'hoisted', emotion: 3, precision: 4, tags: ['hauled', 'heavy'] },
            { word: 'elevated', emotion: 2, precision: 4, tags: ['raised', 'higher'] },
            { word: 'picked up', emotion: 2, precision: 3, tags: ['grabbed', 'raised'] },
            { word: 'heaved', emotion: 4, precision: 4, tags: ['heavy', 'effort'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'dropped': {
        synonyms: [
            { word: 'released', emotion: 2, precision: 3, tags: ['let-go', 'freed'] },
            { word: 'let fall', emotion: 2, precision: 3, tags: ['dropped', 'falling'] },
            { word: 'let go of', emotion: 2, precision: 3, tags: ['released', 'freed'] },
            { word: 'discarded', emotion: 3, precision: 4, tags: ['threw-away', 'unwanted'] },
            { word: 'relinquished', emotion: 3, precision: 5, tags: ['gave-up', 'surrendered'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'showed': {
        synonyms: [
            { word: 'displayed', emotion: 2, precision: 3, tags: ['exhibited', 'presented'] },
            { word: 'exhibited', emotion: 3, precision: 4, tags: ['displayed', 'formal'] },
            { word: 'demonstrated', emotion: 3, precision: 4, tags: ['proved', 'illustrated'] },
            { word: 'revealed', emotion: 3, precision: 4, tags: ['uncovered', 'disclosed'] },
            { word: 'manifested', emotion: 3, precision: 5, tags: ['showed', 'appeared'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'found': {
        synonyms: [
            { word: 'discovered', emotion: 3, precision: 3, tags: ['uncovered', 'revealed'] },
            { word: 'located', emotion: 2, precision: 3, tags: ['found', 'positioned'] },
            { word: 'uncovered', emotion: 3, precision: 4, tags: ['revealed', 'discovered'] },
            { word: 'detected', emotion: 3, precision: 4, tags: ['noticed', 'identified'] },
            { word: 'ascertained', emotion: 3, precision: 5, tags: ['determined', 'verified'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'brought': {
        synonyms: [
            { word: 'carried', emotion: 2, precision: 3, tags: ['transported', 'held'] },
            { word: 'conveyed', emotion: 2, precision: 4, tags: ['transported', 'delivered'] },
            { word: 'transported', emotion: 2, precision: 3, tags: ['moved', 'carried'] },
            { word: 'delivered', emotion: 2, precision: 3, tags: ['brought', 'provided'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'kept': {
        synonyms: [
            { word: 'retained', emotion: 2, precision: 4, tags: ['kept', 'held'] },
            { word: 'maintained', emotion: 2, precision: 3, tags: ['preserved', 'sustained'] },
            { word: 'preserved', emotion: 3, precision: 4, tags: ['protected', 'saved'] },
            { word: 'sustained', emotion: 2, precision: 4, tags: ['maintained', 'continued'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'left': {
        synonyms: [
            { word: 'departed', emotion: 2, precision: 3, tags: ['went-away', 'exited'] },
            { word: 'exited', emotion: 2, precision: 3, tags: ['left', 'went-out'] },
            { word: 'abandoned', emotion: 4, precision: 4, tags: ['deserted', 'forsook'] },
            { word: 'vacated', emotion: 2, precision: 4, tags: ['emptied', 'left'] },
            { word: 'withdrew', emotion: 3, precision: 4, tags: ['retreated', 'pulled-back'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'ran': {
        synonyms: [
            { word: 'sprinted', emotion: 4, precision: 4, tags: ['fast', 'urgent'] },
            { word: 'dashed', emotion: 4, precision: 4, tags: ['quick', 'sudden'] },
            { word: 'rushed', emotion: 3, precision: 3, tags: ['hurried', 'fast'] },
            { word: 'bolted', emotion: 4, precision: 4, tags: ['sudden', 'fleeing'] },
            { word: 'hastened', emotion: 3, precision: 4, tags: ['hurried', 'quickened'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'fell': {
        synonyms: [
            { word: 'dropped', emotion: 3, precision: 3, tags: ['descended', 'fell'] },
            { word: 'descended', emotion: 2, precision: 4, tags: ['lowered', 'went-down'] },
            { word: 'plummeted', emotion: 4, precision: 4, tags: ['fast', 'steep'] },
            { word: 'tumbled', emotion: 3, precision: 4, tags: ['rolled', 'uncontrolled'] },
            { word: 'collapsed', emotion: 4, precision: 4, tags: ['sudden', 'total'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'asked': {
        synonyms: [
            { word: 'inquired', emotion: 2, precision: 4, tags: ['formal', 'questioned'], dialogue: true },
            { word: 'questioned', emotion: 3, precision: 3, tags: ['interrogated', 'probed'], dialogue: true },
            { word: 'queried', emotion: 2, precision: 4, tags: ['questioned', 'formal'], dialogue: true },
            { word: 'requested', emotion: 2, precision: 3, tags: ['asked-for', 'polite'], dialogue: true }
        ],
        baseEmotion: 2, basePrecision: 2, dialogueVerb: true
    },

    'pulled': {
        synonyms: [
            { word: 'tugged', emotion: 3, precision: 4, tags: ['yanked', 'pulled'] },
            { word: 'yanked', emotion: 4, precision: 4, tags: ['forceful', 'sudden'] },
            { word: 'drew', emotion: 2, precision: 4, tags: ['pulled', 'literary'] },
            { word: 'dragged', emotion: 3, precision: 4, tags: ['heavy', 'difficult'] },
            { word: 'hauled', emotion: 3, precision: 4, tags: ['heavy', 'effort'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'pushed': {
        synonyms: [
            { word: 'shoved', emotion: 4, precision: 4, tags: ['forceful', 'aggressive'] },
            { word: 'pressed', emotion: 2, precision: 3, tags: ['steady', 'applied'] },
            { word: 'thrust', emotion: 4, precision: 4, tags: ['forceful', 'sudden'] },
            { word: 'nudged', emotion: 2, precision: 4, tags: ['gentle', 'slight'] },
            { word: 'propelled', emotion: 3, precision: 4, tags: ['forced-forward', 'powered'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'held': {
        synonyms: [
            { word: 'gripped', emotion: 3, precision: 3, tags: ['firm', 'tight'] },
            { word: 'clutched', emotion: 4, precision: 4, tags: ['desperate', 'tight'] },
            { word: 'grasped', emotion: 3, precision: 3, tags: ['firm', 'holding'] },
            { word: 'clenched', emotion: 4, precision: 4, tags: ['tight', 'tense'] },
            { word: 'clasped', emotion: 3, precision: 4, tags: ['firm', 'together'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    // === MORE ADJECTIVES ===

    'old': {
        synonyms: [
            { word: 'aged', emotion: 2, precision: 3, tags: ['elderly', 'mature'] },
            { word: 'elderly', emotion: 2, precision: 3, tags: ['old', 'senior'] },
            { word: 'antiquated', emotion: 3, precision: 4, tags: ['outdated', 'ancient'] },
            { word: 'venerable', emotion: 3, precision: 5, tags: ['respected', 'revered'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'ancient': {
        synonyms: [
            { word: 'archaic', emotion: 3, precision: 4, tags: ['old', 'obsolete'] },
            { word: 'primordial', emotion: 4, precision: 5, tags: ['primal', 'original'] },
            { word: 'antediluvian', emotion: 4, precision: 5, tags: ['extremely-old', 'prehistoric'] }
        ],
        baseEmotion: 3, basePrecision: 3
    },

    'new': {
        synonyms: [
            { word: 'fresh', emotion: 2, precision: 2, tags: ['recent', 'clean'] },
            { word: 'recent', emotion: 1, precision: 3, tags: ['new', 'latest'] },
            { word: 'novel', emotion: 3, precision: 4, tags: ['innovative', 'unique'] },
            { word: 'contemporary', emotion: 2, precision: 4, tags: ['modern', 'current'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'light': {
        synonyms: [
            { word: 'bright', emotion: 2, precision: 3, tags: ['illuminated', 'shining'] },
            { word: 'illuminated', emotion: 3, precision: 4, tags: ['lit', 'glowing'] },
            { word: 'luminous', emotion: 3, precision: 4, tags: ['glowing', 'radiant'] },
            { word: 'radiant', emotion: 4, precision: 4, tags: ['bright', 'glowing'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'brave': {
        synonyms: [
            { word: 'courageous', emotion: 4, precision: 4, tags: ['fearless', 'bold'] },
            { word: 'valiant', emotion: 4, precision: 5, tags: ['heroic', 'noble'] },
            { word: 'bold', emotion: 3, precision: 3, tags: ['daring', 'confident'] },
            { word: 'intrepid', emotion: 4, precision: 5, tags: ['fearless', 'adventurous'] },
            { word: 'dauntless', emotion: 4, precision: 5, tags: ['fearless', 'determined'] }
        ],
        baseEmotion: 3, basePrecision: 3
    },

    'smart': {
        synonyms: [
            { word: 'intelligent', emotion: 2, precision: 3, tags: ['clever', 'bright'] },
            { word: 'clever', emotion: 3, precision: 3, tags: ['smart', 'quick'] },
            { word: 'bright', emotion: 2, precision: 3, tags: ['intelligent', 'sharp'] },
            { word: 'astute', emotion: 3, precision: 4, tags: ['perceptive', 'shrewd'] },
            { word: 'sagacious', emotion: 4, precision: 5, tags: ['wise', 'insightful'] },
            { word: 'perspicacious', emotion: 4, precision: 5, tags: ['insightful', 'discerning'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'stupid': {
        synonyms: [
            { word: 'dumb', emotion: 3, precision: 2, tags: ['unintelligent', 'foolish'] },
            { word: 'foolish', emotion: 3, precision: 3, tags: ['unwise', 'silly'] },
            { word: 'idiotic', emotion: 4, precision: 3, tags: ['very-stupid', 'absurd'] },
            { word: 'asinine', emotion: 4, precision: 4, tags: ['foolish', 'ridiculous'] },
            { word: 'moronic', emotion: 4, precision: 4, tags: ['very-stupid', 'brainless'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'pretty': {
        synonyms: [
            { word: 'attractive', emotion: 3, precision: 3, tags: ['appealing', 'beautiful'] },
            { word: 'comely', emotion: 3, precision: 4, tags: ['pleasant', 'attractive'] },
            { word: 'fair', emotion: 3, precision: 3, tags: ['beautiful', 'lovely'] },
            { word: 'fetching', emotion: 3, precision: 4, tags: ['attractive', 'charming'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'handsome': {
        synonyms: [
            { word: 'attractive', emotion: 3, precision: 3, tags: ['good-looking', 'appealing'] },
            { word: 'good-looking', emotion: 2, precision: 2, tags: ['attractive', 'handsome'] },
            { word: 'striking', emotion: 4, precision: 4, tags: ['impressive', 'notable'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'soft': {
        synonyms: [
            { word: 'gentle', emotion: 3, precision: 3, tags: ['tender', 'mild'] },
            { word: 'tender', emotion: 3, precision: 4, tags: ['soft', 'delicate'] },
            { word: 'pliant', emotion: 2, precision: 4, tags: ['flexible', 'yielding'] },
            { word: 'supple', emotion: 3, precision: 4, tags: ['flexible', 'smooth'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'hard': {
        synonyms: [
            { word: 'solid', emotion: 2, precision: 3, tags: ['firm', 'dense'] },
            { word: 'firm', emotion: 2, precision: 3, tags: ['solid', 'stable'] },
            { word: 'rigid', emotion: 3, precision: 4, tags: ['stiff', 'inflexible'] },
            { word: 'unyielding', emotion: 3, precision: 4, tags: ['inflexible', 'stubborn'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'hot': {
        synonyms: [
            { word: 'heated', emotion: 2, precision: 3, tags: ['warm', 'temperature'] },
            { word: 'sweltering', emotion: 4, precision: 4, tags: ['very-hot', 'oppressive'] },
            { word: 'torrid', emotion: 4, precision: 4, tags: ['scorching', 'intense'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'warm': {
        synonyms: [
            { word: 'heated', emotion: 2, precision: 3, tags: ['warm', 'temperature'] },
            { word: 'tepid', emotion: 2, precision: 4, tags: ['lukewarm', 'moderate'] },
            { word: 'lukewarm', emotion: 2, precision: 3, tags: ['tepid', 'mild'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'cold': {
        synonyms: [
            { word: 'chilly', emotion: 2, precision: 3, tags: ['cool', 'cold'] },
            { word: 'frigid', emotion: 4, precision: 4, tags: ['very-cold', 'freezing'] },
            { word: 'gelid', emotion: 4, precision: 5, tags: ['icy', 'frozen'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'wet': {
        synonyms: [
            { word: 'damp', emotion: 2, precision: 3, tags: ['moist', 'humid'] },
            { word: 'moist', emotion: 2, precision: 3, tags: ['damp', 'wet'] },
            { word: 'sodden', emotion: 3, precision: 4, tags: ['soaked', 'waterlogged'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'dry': {
        synonyms: [
            { word: 'arid', emotion: 3, precision: 4, tags: ['parched', 'desert'] },
            { word: 'parched', emotion: 3, precision: 4, tags: ['very-dry', 'thirsty'] },
            { word: 'desiccated', emotion: 4, precision: 5, tags: ['completely-dry', 'withered'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'loud': {
        synonyms: [
            { word: 'noisy', emotion: 3, precision: 2, tags: ['loud', 'disruptive'] },
            { word: 'clamorous', emotion: 4, precision: 4, tags: ['loud', 'chaotic'] },
            { word: 'boisterous', emotion: 4, precision: 4, tags: ['loud', 'energetic'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'quiet': {
        synonyms: [
            { word: 'silent', emotion: 2, precision: 3, tags: ['noiseless', 'still'] },
            { word: 'hushed', emotion: 3, precision: 4, tags: ['muted', 'soft'] },
            { word: 'tranquil', emotion: 3, precision: 4, tags: ['peaceful', 'calm'] },
            { word: 'serene', emotion: 4, precision: 4, tags: ['peaceful', 'calm'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'fast': {
        synonyms: [
            { word: 'quick', emotion: 2, precision: 2, tags: ['rapid', 'speedy'] },
            { word: 'rapid', emotion: 3, precision: 3, tags: ['fast', 'swift'] },
            { word: 'swift', emotion: 3, precision: 4, tags: ['fast', 'quick'] },
            { word: 'speedy', emotion: 2, precision: 3, tags: ['fast', 'rapid'] },
            { word: 'expeditious', emotion: 3, precision: 5, tags: ['efficient', 'prompt'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'slow': {
        synonyms: [
            { word: 'sluggish', emotion: 3, precision: 4, tags: ['slow', 'lethargic'] },
            { word: 'leisurely', emotion: 2, precision: 3, tags: ['unhurried', 'relaxed'] },
            { word: 'languid', emotion: 3, precision: 4, tags: ['slow', 'lazy'] },
            { word: 'torpid', emotion: 4, precision: 5, tags: ['sluggish', 'inactive'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'heavy': {
        synonyms: [
            { word: 'weighty', emotion: 2, precision: 3, tags: ['heavy', 'substantial'] },
            { word: 'ponderous', emotion: 3, precision: 4, tags: ['heavy', 'cumbersome'] },
            { word: 'burdensome', emotion: 4, precision: 4, tags: ['heavy', 'oppressive'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'empty': {
        synonyms: [
            { word: 'vacant', emotion: 2, precision: 3, tags: ['unoccupied', 'empty'] },
            { word: 'hollow', emotion: 3, precision: 4, tags: ['empty', 'void'] },
            { word: 'void', emotion: 3, precision: 4, tags: ['empty', 'vacant'] },
            { word: 'barren', emotion: 4, precision: 4, tags: ['desolate', 'lifeless'] },
            { word: 'desolate', emotion: 4, precision: 4, tags: ['empty', 'abandoned'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'full': {
        synonyms: [
            { word: 'filled', emotion: 2, precision: 2, tags: ['complete', 'occupied'] },
            { word: 'replete', emotion: 3, precision: 4, tags: ['full', 'abundant'] },
            { word: 'saturated', emotion: 3, precision: 4, tags: ['soaked', 'full'] },
            { word: 'brimming', emotion: 3, precision: 4, tags: ['overflowing', 'full'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'long': {
        synonyms: [
            { word: 'lengthy', emotion: 2, precision: 3, tags: ['extended', 'long'] },
            { word: 'extended', emotion: 2, precision: 3, tags: ['prolonged', 'long'] },
            { word: 'prolonged', emotion: 3, precision: 4, tags: ['extended', 'lengthy'] },
            { word: 'protracted', emotion: 3, precision: 4, tags: ['lengthy', 'drawn-out'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'short': {
        synonyms: [
            { word: 'brief', emotion: 2, precision: 3, tags: ['concise', 'quick'] },
            { word: 'concise', emotion: 2, precision: 4, tags: ['brief', 'compact'] },
            { word: 'abbreviated', emotion: 2, precision: 4, tags: ['shortened', 'condensed'] },
            { word: 'truncated', emotion: 3, precision: 4, tags: ['cut-off', 'shortened'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'wide': {
        synonyms: [
            { word: 'broad', emotion: 2, precision: 3, tags: ['wide', 'expansive'] },
            { word: 'expansive', emotion: 3, precision: 4, tags: ['broad', 'extensive'] },
            { word: 'extensive', emotion: 2, precision: 3, tags: ['wide', 'broad'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'narrow': {
        synonyms: [
            { word: 'slim', emotion: 2, precision: 3, tags: ['slender', 'thin'] },
            { word: 'slender', emotion: 2, precision: 3, tags: ['thin', 'narrow'] },
            { word: 'constricted', emotion: 3, precision: 4, tags: ['tight', 'compressed'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'high': {
        synonyms: [
            { word: 'tall', emotion: 2, precision: 2, tags: ['elevated', 'lofty'] },
            { word: 'elevated', emotion: 2, precision: 3, tags: ['raised', 'high'] },
            { word: 'lofty', emotion: 3, precision: 4, tags: ['high', 'elevated'] },
            { word: 'towering', emotion: 4, precision: 4, tags: ['very-tall', 'imposing'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'deep': {
        synonyms: [
            { word: 'profound', emotion: 3, precision: 4, tags: ['deep', 'intense'] },
            { word: 'abyssal', emotion: 4, precision: 5, tags: ['very-deep', 'bottomless'] },
            { word: 'unfathomable', emotion: 4, precision: 5, tags: ['immeasurable', 'mysterious'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'thick': {
        synonyms: [
            { word: 'dense', emotion: 2, precision: 3, tags: ['compact', 'heavy'] },
            { word: 'viscous', emotion: 3, precision: 4, tags: ['thick', 'syrupy'] },
            { word: 'substantial', emotion: 2, precision: 3, tags: ['considerable', 'thick'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'thin': {
        synonyms: [
            { word: 'slender', emotion: 2, precision: 3, tags: ['slim', 'narrow'] },
            { word: 'slim', emotion: 2, precision: 2, tags: ['slender', 'thin'] },
            { word: 'lean', emotion: 2, precision: 3, tags: ['thin', 'spare'] },
            { word: 'gaunt', emotion: 4, precision: 4, tags: ['very-thin', 'haggard'] },
            { word: 'emaciated', emotion: 5, precision: 4, tags: ['extremely-thin', 'skeletal'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'strong': {
        synonyms: [
            { word: 'powerful', emotion: 3, precision: 3, tags: ['mighty', 'forceful'] },
            { word: 'robust', emotion: 3, precision: 4, tags: ['sturdy', 'vigorous'] },
            { word: 'sturdy', emotion: 2, precision: 3, tags: ['solid', 'durable'] },
            { word: 'formidable', emotion: 4, precision: 4, tags: ['impressive', 'powerful'] },
            { word: 'mighty', emotion: 4, precision: 4, tags: ['powerful', 'strong'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'weak': {
        synonyms: [
            { word: 'feeble', emotion: 3, precision: 4, tags: ['frail', 'weak'] },
            { word: 'frail', emotion: 3, precision: 3, tags: ['delicate', 'fragile'] },
            { word: 'infirm', emotion: 3, precision: 4, tags: ['weak', 'sickly'] },
            { word: 'enervated', emotion: 4, precision: 5, tags: ['weakened', 'drained'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'rough': {
        synonyms: [
            { word: 'coarse', emotion: 2, precision: 3, tags: ['rough', 'textured'] },
            { word: 'uneven', emotion: 2, precision: 3, tags: ['irregular', 'bumpy'] },
            { word: 'jagged', emotion: 3, precision: 4, tags: ['sharp', 'irregular'] },
            { word: 'rugged', emotion: 3, precision: 4, tags: ['rough', 'harsh'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'smooth': {
        synonyms: [
            { word: 'sleek', emotion: 3, precision: 4, tags: ['smooth', 'polished'] },
            { word: 'even', emotion: 1, precision: 2, tags: ['level', 'flat'] },
            { word: 'polished', emotion: 3, precision: 4, tags: ['smooth', 'refined'] },
            { word: 'silky', emotion: 3, precision: 4, tags: ['smooth', 'soft'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'sharp': {
        synonyms: [
            { word: 'keen', emotion: 3, precision: 4, tags: ['sharp', 'acute'] },
            { word: 'pointed', emotion: 2, precision: 3, tags: ['sharp', 'tapered'] },
            { word: 'acute', emotion: 3, precision: 4, tags: ['sharp', 'intense'] },
            { word: 'piercing', emotion: 4, precision: 4, tags: ['sharp', 'penetrating'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'clean': {
        synonyms: [
            { word: 'spotless', emotion: 3, precision: 4, tags: ['very-clean', 'perfect'] },
            { word: 'pristine', emotion: 4, precision: 4, tags: ['perfect', 'untouched'] },
            { word: 'immaculate', emotion: 4, precision: 5, tags: ['perfect', 'flawless'] },
            { word: 'unblemished', emotion: 3, precision: 4, tags: ['perfect', 'unmarked'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'dirty': {
        synonyms: [
            { word: 'filthy', emotion: 4, precision: 4, tags: ['very-dirty', 'disgusting'] },
            { word: 'soiled', emotion: 3, precision: 3, tags: ['stained', 'dirty'] },
            { word: 'grimy', emotion: 3, precision: 4, tags: ['dirty', 'greasy'] },
            { word: 'squalid', emotion: 4, precision: 4, tags: ['filthy', 'wretched'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'beautiful': {
        synonyms: [
            { word: 'lovely', emotion: 4, precision: 3, tags: ['attractive', 'pleasant'] },
            { word: 'attractive', emotion: 3, precision: 3, tags: ['appealing', 'pretty'] },
            { word: 'exquisite', emotion: 5, precision: 5, tags: ['beautiful', 'perfect'] },
            { word: 'resplendent', emotion: 5, precision: 5, tags: ['brilliant', 'splendid'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'ugly': {
        synonyms: [
            { word: 'unattractive', emotion: 3, precision: 3, tags: ['ugly', 'unpleasant'] },
            { word: 'unsightly', emotion: 3, precision: 4, tags: ['ugly', 'unpleasant'] },
            { word: 'hideous', emotion: 5, precision: 4, tags: ['very-ugly', 'repulsive'] },
            { word: 'grotesque', emotion: 5, precision: 5, tags: ['distorted', 'horrifying'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'strange': {
        synonyms: [
            { word: 'odd', emotion: 2, precision: 2, tags: ['unusual', 'weird'] },
            { word: 'peculiar', emotion: 3, precision: 4, tags: ['strange', 'distinctive'] },
            { word: 'bizarre', emotion: 4, precision: 4, tags: ['very-strange', 'weird'] },
            { word: 'anomalous', emotion: 3, precision: 5, tags: ['abnormal', 'irregular'] },
            { word: 'aberrant', emotion: 4, precision: 5, tags: ['deviant', 'abnormal'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'normal': {
        synonyms: [
            { word: 'ordinary', emotion: 1, precision: 2, tags: ['common', 'usual'] },
            { word: 'typical', emotion: 1, precision: 3, tags: ['normal', 'standard'] },
            { word: 'conventional', emotion: 2, precision: 3, tags: ['traditional', 'standard'] },
            { word: 'standard', emotion: 1, precision: 3, tags: ['normal', 'regular'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'important': {
        synonyms: [
            { word: 'significant', emotion: 3, precision: 4, tags: ['meaningful', 'notable'] },
            { word: 'crucial', emotion: 4, precision: 4, tags: ['critical', 'essential'] },
            { word: 'vital', emotion: 4, precision: 4, tags: ['essential', 'necessary'] },
            { word: 'paramount', emotion: 4, precision: 5, tags: ['supreme', 'critical'] },
            { word: 'pivotal', emotion: 4, precision: 5, tags: ['crucial', 'turning-point'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'dangerous': {
        synonyms: [
            { word: 'perilous', emotion: 4, precision: 4, tags: ['hazardous', 'risky'] },
            { word: 'hazardous', emotion: 3, precision: 4, tags: ['dangerous', 'unsafe'] },
            { word: 'treacherous', emotion: 4, precision: 5, tags: ['dangerous', 'deceptive'] },
            { word: 'precarious', emotion: 4, precision: 4, tags: ['unstable', 'risky'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'safe': {
        synonyms: [
            { word: 'secure', emotion: 2, precision: 3, tags: ['protected', 'safe'] },
            { word: 'protected', emotion: 2, precision: 3, tags: ['guarded', 'safe'] },
            { word: 'sheltered', emotion: 3, precision: 4, tags: ['protected', 'shielded'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'calm': {
        synonyms: [
            { word: 'peaceful', emotion: 3, precision: 3, tags: ['tranquil', 'serene'] },
            { word: 'tranquil', emotion: 4, precision: 4, tags: ['peaceful', 'calm'] },
            { word: 'serene', emotion: 4, precision: 4, tags: ['peaceful', 'undisturbed'] },
            { word: 'placid', emotion: 3, precision: 4, tags: ['calm', 'gentle'] },
            { word: 'unperturbed', emotion: 3, precision: 5, tags: ['calm', 'untroubled'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    // === ADVERBS ===

    'suddenly': {
        synonyms: [
            { word: 'abruptly', emotion: 3, precision: 4, tags: ['sudden', 'sharp'] },
            { word: 'quickly', emotion: 2, precision: 2, tags: ['fast', 'rapid'] },
            { word: 'unexpectedly', emotion: 3, precision: 4, tags: ['surprising', 'sudden'] },
            { word: 'swiftly', emotion: 3, precision: 3, tags: ['fast', 'quick'] },
            { word: 'instantly', emotion: 3, precision: 4, tags: ['immediate', 'sudden'] },
            { word: 'sharply', emotion: 3, precision: 4, tags: ['sudden', 'abrupt'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'very': {
        synonyms: [
            { word: 'extremely', emotion: 3, precision: 3, tags: ['intense', 'high-degree'] },
            { word: 'quite', emotion: 2, precision: 2, tags: ['fairly', 'rather'] },
            { word: 'remarkably', emotion: 3, precision: 4, tags: ['notably', 'exceptionally'] },
            { word: 'considerably', emotion: 2, precision: 4, tags: ['significantly', 'substantially'] },
            { word: 'exceptionally', emotion: 4, precision: 4, tags: ['unusually', 'remarkably'] },
            { word: 'intensely', emotion: 4, precision: 4, tags: ['extremely', 'powerfully'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'really': {
        synonyms: [
            { word: 'truly', emotion: 2, precision: 3, tags: ['genuinely', 'actually'] },
            { word: 'genuinely', emotion: 3, precision: 4, tags: ['truly', 'authentically'] },
            { word: 'indeed', emotion: 2, precision: 3, tags: ['truly', 'certainly'] },
            { word: 'certainly', emotion: 2, precision: 3, tags: ['definitely', 'surely'] },
            { word: 'absolutely', emotion: 3, precision: 4, tags: ['completely', 'totally'] },
            { word: 'definitely', emotion: 3, precision: 3, tags: ['certainly', 'surely'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'slowly': {
        synonyms: [
            { word: 'gradually', emotion: 2, precision: 3, tags: ['slow', 'incremental'] },
            { word: 'steadily', emotion: 2, precision: 3, tags: ['consistent', 'even'] },
            { word: 'leisurely', emotion: 2, precision: 4, tags: ['unhurried', 'relaxed'] },
            { word: 'unhurriedly', emotion: 2, precision: 4, tags: ['leisurely', 'calm'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'quickly': {
        synonyms: [
            { word: 'rapidly', emotion: 3, precision: 3, tags: ['fast', 'swift'] },
            { word: 'swiftly', emotion: 3, precision: 4, tags: ['fast', 'quick'] },
            { word: 'speedily', emotion: 3, precision: 3, tags: ['fast', 'rapidly'] },
            { word: 'hastily', emotion: 3, precision: 4, tags: ['rushed', 'hurried'] },
            { word: 'promptly', emotion: 2, precision: 4, tags: ['immediately', 'quickly'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    // === NOUNS ===

    'thing': {
        synonyms: [
            { word: 'object', emotion: 1, precision: 3, tags: ['item', 'entity'] },
            { word: 'item', emotion: 1, precision: 2, tags: ['thing', 'object'] },
            { word: 'article', emotion: 1, precision: 3, tags: ['item', 'object'] },
            { word: 'entity', emotion: 2, precision: 4, tags: ['being', 'thing'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'place': {
        synonyms: [
            { word: 'location', emotion: 1, precision: 3, tags: ['spot', 'position'] },
            { word: 'spot', emotion: 1, precision: 2, tags: ['place', 'location'] },
            { word: 'locale', emotion: 2, precision: 4, tags: ['location', 'setting'] },
            { word: 'venue', emotion: 2, precision: 3, tags: ['location', 'site'] },
            { word: 'locus', emotion: 2, precision: 5, tags: ['point', 'center'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'moment': {
        synonyms: [
            { word: 'instant', emotion: 2, precision: 3, tags: ['brief', 'quick'] },
            { word: 'second', emotion: 1, precision: 2, tags: ['moment', 'instant'] },
            { word: 'juncture', emotion: 3, precision: 5, tags: ['point', 'critical-moment'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'silence': {
        synonyms: [
            { word: 'quiet', emotion: 2, precision: 2, tags: ['stillness', 'peace'] },
            { word: 'stillness', emotion: 3, precision: 4, tags: ['quiet', 'motionless'] },
            { word: 'hush', emotion: 3, precision: 4, tags: ['quiet', 'calm'] },
            { word: 'tranquility', emotion: 4, precision: 4, tags: ['peace', 'calm'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'pain': {
        synonyms: [
            { word: 'ache', emotion: 3, precision: 3, tags: ['dull', 'persistent'] },
            { word: 'hurt', emotion: 3, precision: 2, tags: ['pain', 'injury'] },
            { word: 'suffering', emotion: 4, precision: 4, tags: ['distress', 'agony'] },
            { word: 'discomfort', emotion: 2, precision: 3, tags: ['unease', 'pain'] },
            { word: 'agony', emotion: 5, precision: 4, tags: ['extreme-pain', 'torment'] },
            { word: 'torment', emotion: 5, precision: 4, tags: ['suffering', 'anguish'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'fear': {
        synonyms: [
            { word: 'dread', emotion: 4, precision: 4, tags: ['anxiety', 'foreboding'] },
            { word: 'terror', emotion: 5, precision: 4, tags: ['extreme-fear', 'panic'] },
            { word: 'fright', emotion: 4, precision: 3, tags: ['alarm', 'scare'] },
            { word: 'trepidation', emotion: 4, precision: 5, tags: ['anxiety', 'apprehension'] },
            { word: 'apprehension', emotion: 3, precision: 4, tags: ['worry', 'unease'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'anger': {
        synonyms: [
            { word: 'rage', emotion: 5, precision: 4, tags: ['fury', 'intense'] },
            { word: 'fury', emotion: 5, precision: 4, tags: ['rage', 'wrath'] },
            { word: 'wrath', emotion: 5, precision: 5, tags: ['anger', 'vengeance'] },
            { word: 'ire', emotion: 4, precision: 5, tags: ['anger', 'literary'] },
            { word: 'indignation', emotion: 4, precision: 5, tags: ['righteous-anger', 'outrage'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    // === MULTI-WORD PHRASES ===

    'deep breath': {
        synonyms: [
            { word: 'long inhale', emotion: 2, precision: 4, tags: ['breathing', 'calming'] },
            { word: 'steady breath', emotion: 2, precision: 3, tags: ['controlled', 'calm'] },
            { word: 'calming breath', emotion: 3, precision: 4, tags: ['relaxing', 'soothing'] },
            { word: 'slow inhale', emotion: 2, precision: 4, tags: ['deliberate', 'controlled'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'slight smile': {
        synonyms: [
            { word: 'faint grin', emotion: 2, precision: 4, tags: ['subtle', 'small'] },
            { word: 'subtle smirk', emotion: 3, precision: 4, tags: ['knowing', 'small'] },
            { word: 'small smile', emotion: 2, precision: 3, tags: ['gentle', 'slight'] },
            { word: 'hint of a smile', emotion: 3, precision: 5, tags: ['barely-visible', 'subtle'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    'quick glance': {
        synonyms: [
            { word: 'brief look', emotion: 2, precision: 3, tags: ['short', 'fast'] },
            { word: 'fleeting glimpse', emotion: 3, precision: 4, tags: ['momentary', 'quick'] },
            { word: 'rapid peek', emotion: 2, precision: 3, tags: ['fast', 'brief'] },
            { word: 'swift glance', emotion: 2, precision: 4, tags: ['quick', 'fast'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'ship': {
        synonyms: [
            { word: 'vessel', emotion: 2, precision: 4, tags: ['formal', 'nautical'] },
            { word: 'craft', emotion: 2, precision: 4, tags: ['technical', 'neutral'] },
            { word: 'spacecraft', emotion: 2, precision: 5, tags: ['scifi', 'technical'] },
            { word: 'rocket', emotion: 3, precision: 4, tags: ['action', 'scifi'] },
            { word: 'hull', emotion: 2, precision: 5, tags: ['technical', 'part-for-whole'] }
        ],
        baseEmotion: 1, basePrecision: 2
    }
};

// #region Phase 7 (MEDIUM #5): Enhanced Context Matching

/**
 * Detect mood/tone from text (Phase 7)
 * @param {string} text - Text to analyze
 * @returns {string} Detected mood: 'positive', 'negative', 'tense', or 'neutral'
 */
const detectMood = (text) => {
    if (!text) return 'neutral';

    const textLower = text.toLowerCase();

    // Mood word lists
    const positiveWords = ['smiled', 'laughed', 'bright', 'warm', 'happy', 'joy', 'cheerful', 'grin', 'pleased', 'delighted'];
    const negativeWords = ['frowned', 'dark', 'cold', 'harsh', 'angry', 'fear', 'sad', 'pain', 'worried', 'grim'];
    const tenseWords = ['suddenly', 'sharp', 'quick', 'urgent', 'rushed', 'tense', 'anxious', 'nervous', 'alert'];

    // Count mood markers
    let positiveCount = 0;
    let negativeCount = 0;
    let tenseCount = 0;

    positiveWords.forEach(w => { if (textLower.includes(w)) positiveCount++; });
    negativeWords.forEach(w => { if (textLower.includes(w)) negativeCount++; });
    tenseWords.forEach(w => { if (textLower.includes(w)) tenseCount++; });

    // Return dominant mood
    const max = Math.max(positiveCount, negativeCount, tenseCount);
    if (max === 0) return 'neutral';
    if (positiveCount === max) return 'positive';
    if (negativeCount === max) return 'negative';
    if (tenseCount === max) return 'tense';
    return 'neutral';
};

/**
 * Detect pacing from sentence structure (Phase 7)
 * @param {string} sentence - Sentence to analyze
 * @returns {string} Detected pacing: 'fast', 'slow', or 'medium'
 */
const detectPacing = (sentence) => {
    if (!sentence) return 'medium';

    const wordCount = sentence.split(/\s+/).length;
    const sentenceLower = sentence.toLowerCase();

    // Fast pacing indicators
    const fastVerbs = ['rushed', 'ran', 'dashed', 'grabbed', 'threw', 'sprinted', 'lunged', 'burst'];
    const hasFastVerbs = fastVerbs.some(v => sentenceLower.includes(v));

    // Slow pacing indicators
    const slowVerbs = ['lingered', 'savored', 'pondered', 'gazed', 'strolled', 'meandered'];
    const hasSlowVerbs = slowVerbs.some(v => sentenceLower.includes(v));

    // Fast: short sentences (< 8 words) with action verbs
    if (wordCount < 8 && hasFastVerbs) return 'fast';

    // Fast: very short sentences
    if (wordCount < 5) return 'fast';

    // Slow: long sentences (> 20 words) or slow verbs
    if (wordCount > 20 || hasSlowVerbs) return 'slow';

    return 'medium';
};

/**
 * Detect formality level (Phase 7)
 * @param {string} text - Text to analyze
 * @returns {string} Detected formality: 'formal', 'casual', or 'neutral'
 */
const detectFormality = (text) => {
    if (!text) return 'neutral';

    const textLower = text.toLowerCase();

    // Formal indicators
    const formalWords = ['indeed', 'however', 'nevertheless', 'furthermore', 'therefore', 'thus', 'hence'];
    const formalCount = formalWords.filter(w => textLower.includes(w)).length;

    // Casual indicators
    const casualWords = ['yeah', 'ok', 'hey', 'got', 'gonna', 'wanna', 'kinda', 'sorta'];
    const casualCount = casualWords.filter(w => textLower.includes(w)).length;

    // Contractions suggest casual
    const contractionCount = (text.match(/'(s|t|d|ll|ve|re|m)\b/gi) || []).length;

    const totalCasual = casualCount + (contractionCount > 2 ? 1 : 0);

    if (formalCount > totalCasual) return 'formal';
    if (totalCasual > formalCount) return 'casual';
    return 'neutral';
};

/**
 * Perform enhanced semantic context analysis (Phase 7)
 * @param {string} context - Surrounding text
 * @param {string} targetWord - Word being replaced
 * @returns {Object} Context analysis results
 */
const analyzeContextSemantics = (context, targetWord) => {
    if (!context) {
        return {
            mood: 'neutral',
            pacing: 'medium',
            formality: 'neutral',
            dialogue: false,
            action: false,
            keywords: []
        };
    }

    // Detect basic attributes
    const mood = detectMood(context);
    const pacing = detectPacing(context);
    const formality = detectFormality(context);

    // Detect dialogue (contains quotes)
    const dialogue = context.includes('"') || context.includes("'");

    // Detect action scene (multiple action verbs)
    const actionVerbs = ['attacked', 'fought', 'ran', 'jumped', 'threw', 'caught', 'struck', 'dodged', 'lunged'];
    const actionCount = actionVerbs.filter(v => context.toLowerCase().includes(v)).length;
    const action = actionCount >= 2;

    // Build keyword array from detected attributes
    const keywords = [];
    if (mood !== 'neutral') keywords.push(mood);
    if (pacing !== 'medium') keywords.push(pacing);
    if (formality !== 'neutral') keywords.push(formality);
    if (dialogue) keywords.push('dialogue');
    if (action) keywords.push('action');

    return {
        mood,
        pacing,
        formality,
        dialogue,
        action,
        keywords
    };
};

// #endregion

/**
 * Get smart synonym based on Bonepoke analysis
 * Selects replacement that addresses the weakest quality dimension
 * @param {string} word - Word to replace
 * @param {Object} bonepokeScores - Bonepoke quality scores
 * @param {string} [context=''] - Surrounding text for context awareness
 * @returns {string} Best replacement synonym or original if no good match
 */
const getSmartSynonym = (word, bonepokeScores, context = '') => {
    // PHASE 6 (MEDIUM #9): Performance benchmarking
    const perfStart = PerformanceBenchmark.start();

    if (!CONFIG.smartReplacement || !CONFIG.smartReplacement.enabled) {
        PerformanceBenchmark.end(perfStart);
        return getSynonym(word); // Fallback to random selection
    }

    const lower = word.toLowerCase();
    const wordData = ENHANCED_SYNONYM_MAP[lower];

    // No enhanced data available - use basic synonym
    if (!wordData || !wordData.synonyms || wordData.synonyms.length === 0) {
        PerformanceBenchmark.end(perfStart);
        return getSynonym(word);
    }

    // No Bonepoke scores available - use random from enhanced list
    if (!bonepokeScores || Object.keys(bonepokeScores).length === 0) {
        const randomIndex = Math.floor(Math.random() * wordData.synonyms.length);
        PerformanceBenchmark.end(perfStart);
        return wordData.synonyms[randomIndex].word;
    }

    // STEP 1: Identify weakest dimension
    const sortedDimensions = Object.entries(bonepokeScores)
        .sort((a, b) => a[1] - b[1]); // Lowest score first

    const [weakestDimension, weakestScore] = sortedDimensions[0];

    // STEP 2: Filter candidates based on dimension needs
    let candidates = wordData.synonyms.slice(); // Copy array

    // PHASE 6 (MEDIUM #7): Use per-dimension threshold configuration
    // Get threshold for weakest dimension (with backward compatibility)
    const dimensionThreshold = CONFIG.smartReplacement.thresholds && CONFIG.smartReplacement.thresholds[weakestDimension]
        ? CONFIG.smartReplacement.thresholds[weakestDimension]
        : (weakestDimension === 'Emotional Strength' ? CONFIG.smartReplacement.emotionThreshold :
           weakestDimension === 'Character Clarity' ? CONFIG.smartReplacement.precisionThreshold :
           2);  // Default fallback

    // Apply dimension-specific filtering using configured threshold
    if (weakestScore <= dimensionThreshold) {
        if (weakestDimension === 'Emotional Strength') {
            // Need HIGH emotion words
            candidates = candidates.filter(s => s.emotion >= 3);
            if (CONFIG.smartReplacement.debugLogging) {
                safeLog(`🎯 Filtering for high emotion (${weakestDimension} = ${weakestScore}, threshold = ${dimensionThreshold})`, 'info');
            }
        } else if (weakestDimension === 'Character Clarity') {
            // Need HIGH precision words
            candidates = candidates.filter(s => s.precision >= 3);
            if (CONFIG.smartReplacement.debugLogging) {
                safeLog(`🎯 Filtering for high precision (${weakestDimension} = ${weakestScore}, threshold = ${dimensionThreshold})`, 'info');
            }
        } else if (weakestDimension === 'Dialogue Weight' && wordData.dialogueVerb) {
            // Need dialogue-specific verbs
            candidates = candidates.filter(s => s.dialogue === true);
            if (CONFIG.smartReplacement.debugLogging) {
                safeLog(`🎯 Filtering for dialogue verbs (${weakestDimension} = ${weakestScore}, threshold = ${dimensionThreshold})`, 'info');
            }
        }
    }

    // STEP 3: If no candidates after filtering, use all
    if (candidates.length === 0) {
        candidates = wordData.synonyms.slice();
    }

    // PHASE 4 + 7: CONTEXT MATCHING - Analyze surrounding text for better synonym selection
    let contextKeywords = [];
    if (CONFIG.smartReplacement.enableContextMatching && context) {
        const contextLower = context.toLowerCase();

        // PHASE 7: Enhanced semantic analysis (mood, pacing, formality)
        const semantics = analyzeContextSemantics(context, word);
        contextKeywords.push(...semantics.keywords);

        // PHASE 4: Basic keyword matching (fast/slow, gentle/forceful)
        const fastWords = ['quick', 'sudden', 'rapid', 'swift', 'abrupt', 'instant', 'hurried'];
        const slowWords = ['slow', 'gradual', 'steady', 'leisurely', 'deliberate'];
        const gentleWords = ['gentle', 'soft', 'tender', 'calm', 'peaceful', 'quiet'];
        const forcefulWords = ['violent', 'forceful', 'aggressive', 'powerful', 'intense', 'strong'];

        if (fastWords.some(w => contextLower.includes(w))) contextKeywords.push('fast');
        if (slowWords.some(w => contextLower.includes(w))) contextKeywords.push('slow');
        if (gentleWords.some(w => contextLower.includes(w))) contextKeywords.push('gentle');
        if (forcefulWords.some(w => contextLower.includes(w))) contextKeywords.push('forceful');

        if (CONFIG.smartReplacement.logContextAnalysis && contextKeywords.length > 0) {
            safeLog(`📝 Context: ${semantics.mood} mood, ${semantics.pacing} pacing${semantics.dialogue ? ', dialogue' : ''}${semantics.action ? ', action' : ''}`, 'info');
            safeLog(`📝 Keywords: ${contextKeywords.join(', ')}`, 'info');
        }
    }

    // PHASE 4: ADAPTIVE LEARNING - Use historical performance to guide selection
    const learningData = state.replacementLearning && state.replacementLearning.history
        ? state.replacementLearning.history[lower]
        : null;

    // STEP 4: Weight selection by emotion/precision scores + context matching + learning
    const weights = candidates.map((s, idx) => {
        let weight = s.emotion + s.precision;

        // Context matching bonus (Phase 4)
        if (CONFIG.smartReplacement.enableContextMatching && contextKeywords.length > 0 && s.tags) {
            const tagMatches = s.tags.filter(tag => contextKeywords.some(kw => tag.includes(kw)));
            if (tagMatches.length > 0) {
                weight += CONFIG.smartReplacement.tagMatchBonus * tagMatches.length;
                if (CONFIG.smartReplacement.logContextAnalysis) {
                    safeLog(`✨ ${s.word}: context bonus +${CONFIG.smartReplacement.tagMatchBonus * tagMatches.length} (tags: ${tagMatches.join(',')})`, 'info');
                }
            }
        }

        // Adaptive learning bonus (Phase 4)
        if (CONFIG.smartReplacement.enableAdaptiveLearning && learningData && learningData[s.word]) {
            const synData = learningData[s.word];
            if (synData.uses >= CONFIG.smartReplacement.minSamplesForLearning) {
                const learningBonus = synData.avgImprovement * CONFIG.smartReplacement.learningRate * 10;
                weight += learningBonus;
                if (CONFIG.smartReplacement.debugLogging) {
                    safeLog(`🧠 ${s.word}: learning bonus +${learningBonus.toFixed(2)} (avg improvement: ${synData.avgImprovement.toFixed(2)})`, 'info');
                }
            }
        }

        return weight;
    });

    // PHASE 6: Use weighted random selection helper (MEDIUM #6)
    const selected = weightedRandomSelection(candidates, (s, idx) => weights[idx]);

    if (!selected) {
        PerformanceBenchmark.end(perfStart);
        return word;  // No selection, fallback to original
    }

    // PHASE 6 (MEDIUM #10): Check for contradictions before returning
    const contradictionCheck = detectContradictoryReplacement(context, word, selected.word);
    if (contradictionCheck.contradictory) {
        // Try fallback: select from remaining candidates (if any)
        const remainingCandidates = candidates.filter(c => c.word !== selected.word);
        if (remainingCandidates.length > 0) {
            const fallbackSelected = weightedRandomSelection(
                remainingCandidates,
                (s, idx) => weights[candidates.indexOf(s)]
            );
            if (fallbackSelected) {
                const fallbackCheck = detectContradictoryReplacement(context, word, fallbackSelected.word);
                if (!fallbackCheck.contradictory) {
                    PerformanceBenchmark.end(perfStart);
                    return fallbackSelected.word;
                }
            }
        }
        // All candidates contradictory or no fallback - return original
        PerformanceBenchmark.end(perfStart);
        return word;
    }

    PerformanceBenchmark.end(perfStart);
    return selected.word;
};

/**
 * Track synonym replacement result for adaptive learning (Phase 4)
 * @param {string} originalWord - Word that was replaced
 * @param {string} synonym - Synonym that was used
 * @param {number} scoreImprovement - Change in Bonepoke score (positive = improvement)
 */
const trackReplacementResult = (originalWord, synonym, scoreImprovement) => {
    if (!CONFIG.smartReplacement.enableAdaptiveLearning || !state.replacementLearning) {
        return;
    }

    const lower = originalWord.toLowerCase();

    // Initialize tracking structure if needed
    if (!state.replacementLearning.history[lower]) {
        state.replacementLearning.history[lower] = {};
    }

    if (!state.replacementLearning.history[lower][synonym]) {
        state.replacementLearning.history[lower][synonym] = {
            uses: 0,
            totalScoreImprovement: 0,
            avgImprovement: 0
        };
    }

    // Update tracking data
    const synData = state.replacementLearning.history[lower][synonym];
    synData.uses++;
    synData.totalScoreImprovement += scoreImprovement;
    synData.avgImprovement = synData.totalScoreImprovement / synData.uses;

    // Update global stats
    state.replacementLearning.totalReplacements++;
    if (scoreImprovement > 0.1) {
        state.replacementLearning.successfulReplacements++;
    } else if (scoreImprovement < -0.1) {
        state.replacementLearning.failedReplacements++;
    } else {
        state.replacementLearning.neutralReplacements++;
    }

    if (CONFIG.smartReplacement.debugLogging) {
        safeLog(`📊 Tracked: ${originalWord} → ${synonym} (${scoreImprovement >= 0 ? '+' : ''}${scoreImprovement.toFixed(2)})`, 'info');
    }
};

/**
 * Detect multi-word phrases in text (Phase 6)
 * Scans for phrases from ENHANCED_SYNONYM_MAP that exist in text
 * @param {string} text - Text to scan for phrases
 * @returns {Array} Array of detected phrases with metadata
 */
const detectPhraseReplacements = (text) => {
    if (!CONFIG.smartReplacement || !CONFIG.smartReplacement.enablePhraseIntelligence) {
        return [];
    }

    const phrases = [];
    const textLower = text.toLowerCase();

    // Scan for multi-word phrases from ENHANCED_SYNONYM_MAP
    Object.keys(ENHANCED_SYNONYM_MAP).forEach(key => {
        if (key.includes(' ')) {  // Multi-word phrase
            const regex = getWordRegex(key);  // Optimized: use cached regex
            const matches = text.match(regex);
            if (matches) {
                phrases.push({
                    phrase: key,
                    count: matches.length,
                    priority: 1,  // Higher priority than single words
                    originalMatches: matches  // Preserve original casing
                });

                if (CONFIG.smartReplacement.logReplacementReasons) {
                    safeLog(`🔍 Detected phrase: "${key}" (${matches.length}x)`, 'info');
                }
            }
        }
    });

    // Sort by length (longest first) to handle overlapping phrases
    phrases.sort((a, b) => b.phrase.length - a.phrase.length);

    return phrases;
};

/**
 * Apply phrase replacements to text (Phase 6)
 * Replaces multi-word phrases as semantic units
 * @param {string} text - Text to process
 * @param {Array} phrases - Detected phrases from detectPhraseReplacements()
 * @param {Object} analysis - Bonepoke analysis of text
 * @returns {Object} { text: string, replacements: Array }
 */
const applyPhraseReplacements = (text, phrases, analysis) => {
    if (!CONFIG.smartReplacement || !CONFIG.smartReplacement.enablePhraseIntelligence) {
        return { text, replacements: [] };
    }

    let improved = text;
    const replacements = [];

    phrases.forEach(({ phrase, originalMatches }) => {
        const phraseData = ENHANCED_SYNONYM_MAP[phrase];
        if (!phraseData || !phraseData.synonyms || phraseData.synonyms.length === 0) {
            return;  // No synonyms available
        }

        // Get smart synonym for this phrase
        const replacement = getSmartSynonym(phrase, analysis.scores, improved);

        if (replacement !== phrase) {
            // Build regex to match phrase (case-insensitive, whole phrase)
            const regex = getWordRegex(phrase);  // Optimized: use cached regex

            // Test before applying
            const originalText = improved;
            const replacedText = improved.replace(regex, replacement);

            // Validate replacement (if enabled)
            let validationResult = { valid: true, reason: 'validation disabled', scoreChange: 0 };
            if (CONFIG.smartReplacement.enableValidation) {
                state.replacementValidation.totalAttempts++;
                validationResult = validateReplacement(originalText, replacedText, phrase, replacement);

                if (!validationResult.valid) {
                    // Blocked by validation
                    state.replacementValidation.validationsFailed++;

                    // Categorize block reason
                    if (validationResult.reason.includes('degraded')) {
                        state.replacementValidation.blockedReasons.qualityDegradation++;
                    } else if (validationResult.reason.includes('contradiction')) {
                        state.replacementValidation.blockedReasons.newContradictions++;
                    } else if (validationResult.reason.includes('fatigue')) {
                        state.replacementValidation.blockedReasons.fatigueIncrease++;
                    } else if (validationResult.reason.includes('improvement')) {
                        state.replacementValidation.blockedReasons.insufficientImprovement++;
                    }

                    return;  // Skip this replacement
                } else {
                    state.replacementValidation.validationsPassed++;
                }
            }

            // Apply replacement
            improved = replacedText;

            // Track result for adaptive learning
            if (CONFIG.smartReplacement.enableAdaptiveLearning) {
                trackReplacementResult(phrase, replacement, validationResult.scoreChange);
            }

            // Log replacement
            const scoreInfo = validationResult.scoreChange !== 0
                ? ` [${validationResult.scoreChange >= 0 ? '+' : ''}${validationResult.scoreChange.toFixed(2)}]`
                : '';
            replacements.push(`"${phrase}" → "${replacement}"${scoreInfo}`);

            if (CONFIG.smartReplacement.logReplacementReasons) {
                safeLog(`🔄 Phrase replaced: ${phrase} → ${replacement}${scoreInfo}`, 'info');
            }
        }
    });

    return { text: improved, replacements };
};

/**
 * Detect if a replacement creates a contradiction (Phase 6 - MEDIUM #10)
 * Checks if the replacement word conflicts with surrounding context
 * @param {string} context - Surrounding text (sentence or nearby words)
 * @param {string} originalWord - Word being replaced
 * @param {string} replacement - Proposed replacement word
 * @returns {Object} { contradictory: boolean, reason: string }
 */
const detectContradictoryReplacement = (context, originalWord, replacement) => {
    if (!CONFIG.smartReplacement || !CONFIG.smartReplacement.preventNewContradictions) {
        return { contradictory: false, reason: 'Contradiction detection disabled' };
    }

    // Build contradiction map: word -> array of conflicting context words
    const contradictions = {
        'trudged': ['quickly', 'swiftly', 'rapidly', 'rapid', 'swift', 'abrupt', 'instant', 'hurried', 'hasty'],
        'sauntered': ['urgently', 'hastily', 'quickly', 'rushed', 'rapid'],
        'whispered': ['loudly', 'shouted', 'yelled', 'screamed', 'bellowed', 'roared'],
        'shouted': ['quietly', 'softly', 'whispered', 'murmured', 'gentle', 'calm'],
        'murmured': ['loudly', 'shouted', 'yelled', 'screamed'],
        'screamed': ['quietly', 'softly', 'whispered', 'calm', 'peaceful'],
        'giggled': ['seriously', 'solemnly', 'gravely'],
        'frowned': ['happily', 'joyfully', 'cheerfully', 'smiled'],
        'smiled': ['angrily', 'furiously', 'hatefully', 'frowned'],
        'sprinted': ['slowly', 'leisurely', 'gradually', 'plodding'],
        'crawled': ['quickly', 'swiftly', 'rapidly', 'rushed'],
        'rushed': ['slowly', 'leisurely', 'gradually', 'calm', 'peaceful'],
        'relaxed': ['tensely', 'anxiously', 'nervously', 'urgently'],
        'tense': ['relaxed', 'calm', 'peaceful', 'serene']
    };

    // Check if replacement contradicts surrounding context
    const contextLower = context.toLowerCase();
    const replacementLower = replacement.toLowerCase();

    if (contradictions[replacementLower]) {
        const conflicts = contradictions[replacementLower];
        for (const conflict of conflicts) {
            // Check for conflict word in context (word boundary aware)
            const regex = getWordRegex(conflict, 'i');  // Optimized: use cached regex
            if (regex.test(contextLower)) {
                if (CONFIG.smartReplacement.logReplacementReasons) {
                    safeLog(`⚠️ Contradiction detected: "${originalWord} → ${replacement}" conflicts with "${conflict}" in context`, 'warn');
                }
                return {
                    contradictory: true,
                    reason: `Replacement "${replacement}" conflicts with "${conflict}" in context`
                };
            }
        }
    }

    return { contradictory: false, reason: 'No contradiction detected' };
};

/**
 * Validate that a replacement improves or maintains quality (Phase 5)
 * @param {string} originalText - Text before replacement
 * @param {string} replacedText - Text after replacement
 * @param {string} originalWord - Word that was replaced
 * @param {string} synonym - Synonym that was used
 * @returns {Object} { valid: boolean, reason: string, scoreChange: number }
 */
const validateReplacement = (originalText, replacedText, originalWord, synonym) => {
    if (!CONFIG.smartReplacement.enableValidation) {
        return { valid: true, reason: 'Validation disabled', scoreChange: 0 };
    }

    // Analyze both versions
    const originalAnalysis = BonepokeAnalysis.analyze(originalText);
    const replacedAnalysis = BonepokeAnalysis.analyze(replacedText);

    // Calculate score changes
    const originalAvg = originalAnalysis.avgScore;
    const replacedAvg = replacedAnalysis.avgScore;
    const scoreChange = replacedAvg - originalAvg;

    // Check for quality degradation
    if (CONFIG.smartReplacement.preventQualityDegradation) {
        if (scoreChange < -0.01) {  // Small threshold for floating point
            if (CONFIG.smartReplacement.logValidation) {
                safeLog(`❌ BLOCKED: ${originalWord} → ${synonym} (score decreased ${scoreChange.toFixed(2)})`, 'warn');
            }
            return {
                valid: false,
                reason: `Quality degraded (${scoreChange.toFixed(2)})`,
                scoreChange
            };
        }
    }

    // Check minimum improvement threshold
    if (CONFIG.smartReplacement.validationStrict) {
        if (scoreChange < CONFIG.smartReplacement.minScoreImprovement) {
            if (CONFIG.smartReplacement.logValidation) {
                safeLog(`❌ BLOCKED: ${originalWord} → ${synonym} (improvement too small: ${scoreChange.toFixed(2)})`, 'warn');
            }
            return {
                valid: false,
                reason: `Insufficient improvement (${scoreChange.toFixed(2)} < ${CONFIG.smartReplacement.minScoreImprovement})`,
                scoreChange
            };
        }
    }

    // Check for new contradictions
    if (CONFIG.smartReplacement.preventNewContradictions) {
        const originalContradictions = originalAnalysis.composted?.contradictions?.length || 0;
        const replacedContradictions = replacedAnalysis.composted?.contradictions?.length || 0;

        if (replacedContradictions > originalContradictions) {
            if (CONFIG.smartReplacement.logValidation) {
                safeLog(`❌ BLOCKED: ${originalWord} → ${synonym} (new contradictions: ${replacedContradictions - originalContradictions})`, 'warn');
            }
            return {
                valid: false,
                reason: `Created ${replacedContradictions - originalContradictions} new contradiction(s)`,
                scoreChange
            };
        }
    }

    // Check for fatigue increase
    if (CONFIG.smartReplacement.preventFatigueIncrease) {
        const originalFatigue = Object.keys(originalAnalysis.composted?.fatigue || {}).length;
        const replacedFatigue = Object.keys(replacedAnalysis.composted?.fatigue || {}).length;

        if (replacedFatigue > originalFatigue) {
            if (CONFIG.smartReplacement.logValidation) {
                safeLog(`❌ BLOCKED: ${originalWord} → ${synonym} (fatigue increased: +${replacedFatigue - originalFatigue} words)`, 'warn');
            }
            return {
                valid: false,
                reason: `Increased word fatigue (+${replacedFatigue - originalFatigue} fatigued words)`,
                scoreChange
            };
        }
    }

    // Passed all checks
    if (CONFIG.smartReplacement.logValidation) {
        const emoji = scoreChange > 0.1 ? '✅' : scoreChange > 0 ? '✓' : '→';
        safeLog(`${emoji} APPROVED: ${originalWord} → ${synonym} (${scoreChange >= 0 ? '+' : ''}${scoreChange.toFixed(2)})`, 'info');
    }

    return {
        valid: true,
        reason: scoreChange > 0 ? 'Quality improved' : 'Quality maintained',
        scoreChange
    };
};

/**
 * Generate comprehensive replacement performance report (Phase 5)
 * @returns {string} Formatted report text
 */
const generateReplacementReport = () => {
    if (!state.replacementLearning) {
        return 'No replacement data available. Adaptive learning may be disabled.';
    }

    const learning = state.replacementLearning;
    const totalReplacements = learning.totalReplacements || 0;

    if (totalReplacements === 0) {
        return 'No replacements have been made yet.';
    }

    // Calculate success rate
    const successful = learning.successfulReplacements || 0;
    const neutral = learning.neutralReplacements || 0;
    const failed = learning.failedReplacements || 0;
    const successRate = (successful / totalReplacements * 100).toFixed(1);
    const neutralRate = (neutral / totalReplacements * 100).toFixed(1);
    const failRate = (failed / totalReplacements * 100).toFixed(1);

    // Find top performers (minimum 3 uses)
    const allPairs = [];
    Object.entries(learning.history || {}).forEach(([word, synonyms]) => {
        Object.entries(synonyms).forEach(([syn, data]) => {
            if (data.uses >= 3) {
                allPairs.push({
                    pair: `${word} → ${syn}`,
                    avgImprovement: data.avgImprovement,
                    uses: data.uses,
                    totalImprovement: data.totalScoreImprovement
                });
            }
        });
    });

    const topPerformers = allPairs
        .sort((a, b) => b.avgImprovement - a.avgImprovement)
        .slice(0, 10);

    const worstPerformers = allPairs
        .sort((a, b) => a.avgImprovement - b.avgImprovement)
        .slice(0, 5);

    // Get validation stats
    const validation = state.replacementValidation || {};
    const validationAttempts = validation.totalAttempts || 0;
    const validationPassed = validation.validationsPassed || 0;
    const validationFailed = validation.validationsFailed || 0;
    const validationRate = validationAttempts > 0
        ? (validationPassed / validationAttempts * 100).toFixed(1)
        : '0.0';

    // Build report
    let report = '═══════════════════════════════════════════════\n';
    report += '   SMART REPLACEMENT PERFORMANCE REPORT\n';
    report += '═══════════════════════════════════════════════\n\n';

    report += `📊 OVERALL STATISTICS\n`;
    report += `   Total Replacements: ${totalReplacements}\n`;
    report += `   ✅ Successful (improved): ${successful} (${successRate}%)\n`;
    report += `   → Neutral (maintained): ${neutral} (${neutralRate}%)\n`;
    report += `   ❌ Failed (degraded): ${failed} (${failRate}%)\n\n`;

    if (CONFIG.smartReplacement.enableValidation && validationAttempts > 0) {
        report += `🛡️  VALIDATION STATISTICS\n`;
        report += `   Total Attempts: ${validationAttempts}\n`;
        report += `   ✅ Passed: ${validationPassed} (${validationRate}%)\n`;
        report += `   ❌ Blocked: ${validationFailed}\n`;
        if (validation.blockedReasons) {
            const reasons = validation.blockedReasons;
            if (reasons.qualityDegradation > 0) {
                report += `      - Quality degradation: ${reasons.qualityDegradation}\n`;
            }
            if (reasons.newContradictions > 0) {
                report += `      - New contradictions: ${reasons.newContradictions}\n`;
            }
            if (reasons.fatigueIncrease > 0) {
                report += `      - Fatigue increase: ${reasons.fatigueIncrease}\n`;
            }
            if (reasons.insufficientImprovement > 0) {
                report += `      - Insufficient improvement: ${reasons.insufficientImprovement}\n`;
            }
        }
        report += '\n';
    }

    if (topPerformers.length > 0) {
        report += `🏆 TOP PERFORMING REPLACEMENTS (min 3 uses)\n`;
        topPerformers.forEach((p, idx) => {
            const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
            report += `   ${emoji} ${p.pair}\n`;
            report += `      Avg: ${p.avgImprovement >= 0 ? '+' : ''}${p.avgImprovement.toFixed(3)} | Uses: ${p.uses} | Total: ${p.totalImprovement >= 0 ? '+' : ''}${p.totalImprovement.toFixed(2)}\n`;
        });
        report += '\n';
    }

    if (worstPerformers.length > 0 && worstPerformers[0].avgImprovement < 0) {
        report += `⚠️  WORST PERFORMING REPLACEMENTS\n`;
        worstPerformers.forEach(p => {
            if (p.avgImprovement < 0) {
                report += `   ⚠️  ${p.pair}\n`;
                report += `      Avg: ${p.avgImprovement.toFixed(3)} | Uses: ${p.uses} | Total: ${p.totalImprovement.toFixed(2)}\n`;
            }
        });
        report += '\n';
    }

    report += '═══════════════════════════════════════════════\n';
    report += 'Use /ngo report to see this data\n';
    report += '═══════════════════════════════════════════════\n';

    return report;
};

// #endregion

// #region NGO Word Lists and Phases

/**
 * NGO Conflict/Calming Word Lists
 * These drive the heat accumulation system
 */
const NGO_WORD_LISTS = {
    // Words that INCREASE heat (conflict, tension, action)
    conflict: [
        // Violence
        'attack', 'fight', 'battle', 'war', 'kill', 'murder', 'destroy',
        'strike', 'punch', 'kick', 'stab', 'slash', 'shoot', 'blast',
        'crush', 'smash', 'break', 'shatter', 'explode', 'detonate',
        'wound', 'injure', 'hurt', 'harm', 'damage', 'wreck', 'ruin',
        'slaughter', 'massacre', 'execute', 'assassinate', 'ambush',
        // Danger
        'danger', 'threat', 'enemy', 'foe', 'villain', 'monster',
        'demon', 'beast', 'creature', 'predator', 'hunter', 'assassin',
        'trap', 'poison', 'curse', 'plague', 'disease',
        'death', 'dying', 'dead', 'corpse', 'grave', 'tomb',
        // Urgency
        'run', 'flee', 'escape', 'chase', 'pursue', 'hurry', 'rush',
        'urgent', 'emergency', 'crisis', 'disaster', 'catastrophe',
        'collapse', 'crash', 'fail', 'lose', 'lost',
        // Negative emotion
        'rage', 'fury', 'anger', 'hate', 'fear', 'terror', 'panic',
        'scream', 'shout', 'yell', 'cry', 'sob', 'wail', 'shriek',
        'despair', 'agony', 'torment', 'suffer', 'anguish',
        'dread', 'horror', 'nightmare', 'trauma', 'shock',
        // Confrontation
        'confront', 'challenge', 'oppose', 'resist', 'defy', 'betray',
        'deceive', 'steal', 'rob', 'threaten', 'demand',
        'argue', 'conflict', 'dispute', 'clash',
        'accuse', 'blame', 'condemn', 'judge', 'punish',
        // High stakes
        'blood', 'fire', 'explosion', 'destruction', 'chaos',
        'invasion', 'siege', 'conquest', 'revolution',
        'sacrifice', 'doom', 'fate', 'destiny', 'prophecy',
        'ultimate', 'final', 'last', 'end', 'apocalypse'
    ],

    // Words that DECREASE heat (calm, resolution, rest)
    calming: [
        // Peace
        'peace', 'calm', 'quiet', 'still', 'serene', 'tranquil',
        'gentle', 'soft', 'warm', 'safe', 'secure', 'protected',
        'harmony', 'balance', 'stable', 'steady', 'settled',
        // Rest
        'rest', 'sleep', 'relax', 'breathe', 'sigh', 'exhale',
        'settle', 'sit', 'lie', 'lean', 'recline', 'pause',
        'wait', 'linger', 'stay', 'remain', 'stop',
        'dream', 'slumber', 'doze', 'nap',
        // Positive emotion
        'happy', 'joy', 'love', 'care', 'comfort', 'soothe',
        'smile', 'laugh', 'giggle', 'chuckle', 'grin',
        'hug', 'embrace', 'hold', 'cuddle', 'caress',
        'content', 'satisfied', 'pleased', 'delighted',
        // Resolution
        'resolve', 'solve', 'fix', 'heal', 'recover', 'mend',
        'forgive', 'apologize', 'reconcile', 'understand', 'agree',
        'accept', 'approve', 'allow', 'permit', 'grant',
        'complete', 'finish', 'accomplish', 'achieve', 'succeed',
        // Connection
        'friend', 'ally', 'companion', 'partner', 'family', 'home',
        'trust', 'believe', 'hope', 'faith', 'together', 'united',
        'bond', 'connection', 'relationship', 'friendship',
        'support', 'help', 'aid', 'assist', 'guide',
        // Mundane
        'eat', 'drink', 'cook', 'clean', 'walk', 'talk', 'think',
        'observe', 'notice', 'examine', 'study', 'learn', 'remember',
        'write', 'read', 'listen', 'watch', 'see', 'look',
        'ordinary', 'normal', 'usual', 'routine', 'daily'
    ]
};

/**
 * NGO Story Phase Definitions
 * Each phase defines narrative tone and system behavior
 */
const NGO_PHASES = {
    introduction: {
        tempRange: [1, 3],
        name: 'Introduction',
        description: 'Establish characters, world, and hooks',
        authorNoteGuidance:
            'Story Phase: Introduction. Focus on character establishment, ' +
            'world-building, and subtle foreshadowing. Keep conflicts minimal. ' +
            'Let the story breathe and establish tone.',
        vsAdjustment: { k: 4, tau: 0.15 },
        bonepokeStrictness: 'relaxed'
    },
    risingEarly: {
        tempRange: [4, 6],
        name: 'Rising Action (Early)',
        description: 'Introduce minor conflicts, build tension gradually',
        authorNoteGuidance:
            'Story Phase: Rising Action. Introduce obstacles and challenges. ' +
            'Characters face minor setbacks. Hint at greater conflicts ahead. ' +
            'Increase tension gradually but maintain hope.',
        vsAdjustment: { k: 5, tau: 0.12 },
        bonepokeStrictness: 'normal'
    },
    risingLate: {
        tempRange: [7, 9],
        name: 'Rising Action (Late)',
        description: 'Major complications, stakes increase',
        authorNoteGuidance:
            'Story Phase: Late Rising Action. Stakes are high. Characters face ' +
            'serious challenges. Introduce plot twists and revelations. ' +
            'Push characters toward difficult choices. The climax approaches.',
        vsAdjustment: { k: 6, tau: 0.10 },
        bonepokeStrictness: 'strict'
    },
    climaxEntry: {
        tempRange: [10, 10],
        name: 'Climax Entry',
        description: 'Major conflict begins, point of no return',
        authorNoteGuidance:
            'Story Phase: CLIMAX. Maximum tension. The main conflict erupts. ' +
            'Characters face their greatest challenge. Shocking developments occur. ' +
            'Everything changes. No turning back.',
        vsAdjustment: { k: 7, tau: 0.08 },
        bonepokeStrictness: 'strict'
    },
    peakClimax: {
        tempRange: [11, 12],
        name: 'Peak Climax',
        description: 'Sustained maximum intensity',
        authorNoteGuidance:
            'Story Phase: PEAK CLIMAX. Consequences cascade. Every action matters. ' +
            'Characters pushed to absolute limits. Life-changing decisions. ' +
            'Outcome uncertain. Maximum emotional intensity.',
        vsAdjustment: { k: 8, tau: 0.07 },
        bonepokeStrictness: 'strict'
    },
    extremeClimax: {
        tempRange: [13, 15],
        name: 'Extreme Climax',
        description: 'Catastrophic intensity (use sparingly)',
        authorNoteGuidance:
            'Story Phase: EXTREME CLIMAX. Reality bends. Cataclysmic events unfold. ' +
            'Ultimate test. Death and destruction are real possibilities. ' +
            'Nothing is safe. The world may never be the same.',
        vsAdjustment: { k: 9, tau: 0.06 },
        bonepokeStrictness: 'maximum'
    },
    overheat: {
        tempRange: null,
        name: 'Overheat (Sustained Climax)',
        description: 'Maintain peak intensity, begin resolution hints',
        authorNoteGuidance:
            'Story Phase: SUSTAINED CLIMAX. Maintain intensity but introduce ' +
            'hints of resolution. Characters find inner strength. The tide may ' +
            'be turning. Keep tension high but show possible ways forward.',
        vsAdjustment: { k: 7, tau: 0.09 },
        bonepokeStrictness: 'strict'
    },
    cooldown: {
        tempRange: null,
        name: 'Cooldown (Falling Action)',
        description: 'Resolve conflicts, process events',
        authorNoteGuidance:
            'Story Phase: Falling Action. The crisis passes. Characters process ' +
            'what happened. Resolve plot threads. Allow emotional moments. ' +
            'Rest and recovery are possible. Reflect on consequences.',
        vsAdjustment: { k: 4, tau: 0.14 },
        bonepokeStrictness: 'relaxed'
    }
};

/**
 * Get current NGO phase based on temperature and mode
 * @returns {Object} Phase definition
 */
const getCurrentNGOPhase = () => {
    if (!CONFIG.ngo.enabled || !state.ngo) return NGO_PHASES.introduction;

    if (state.ngo.overheatMode) return NGO_PHASES.overheat;
    if (state.ngo.cooldownMode) return NGO_PHASES.cooldown;

    const temp = state.ngo.temperature || 1;

    if (temp <= 3) return NGO_PHASES.introduction;
    if (temp <= 6) return NGO_PHASES.risingEarly;
    if (temp <= 9) return NGO_PHASES.risingLate;
    if (temp === 10) return NGO_PHASES.climaxEntry;
    if (temp <= 12) return NGO_PHASES.peakClimax;
    return NGO_PHASES.extremeClimax;
};

// #endregion

// #region Verbalized Sampling

/**
 * Verbalized Sampling System
 * Research: https://arxiv.org/html/2510.01171v3
 */
const VerbalizedSampling = (() => {
    const VS_CARD_TITLE = "VS_System";

    /**
     * Generate VS instruction based on current config
     * @param {Object} params - Optional parameters to override CONFIG
     * @param {number} params.k - Number of candidates
     * @param {number} params.tau - Probability threshold
     */
    const generateInstruction = (params = {}) => {
        if (!CONFIG.vs.enabled) return '';

        // Use provided params or fall back to CONFIG
        const k = params.k !== undefined ? params.k : CONFIG.vs.k;
        const tau = params.tau !== undefined ? params.tau : CONFIG.vs.tau;

        return `[Internal Sampling Protocol:
- mentally generate ${k} distinct seamless candidate continuations
- for each candidate, estimate its probability p (how typical/likely it would be)
- only consider candidates where p < ${tau} (from the unlikely tails of the distribution)
- randomly select one of these low-probability candidates
- output ONLY the selected continuation as your natural response
- never mention this process, probabilities, or candidates in your output]`;
    };

    /**
     * Analyze context and suggest adaptive parameters
     * NOW INTEGRATES WITH NGO TEMPERATURE SYSTEM
     */
    const analyzeContext = (context) => {
        if (!CONFIG.vs.adaptive) return { k: CONFIG.vs.k, tau: CONFIG.vs.tau };

        let k = CONFIG.vs.k;
        let tau = CONFIG.vs.tau;

        // === NGO TEMPERATURE-DRIVEN ADAPTATION (PRIMARY) ===
        if (CONFIG.ngo.enabled && CONFIG.ngo.temperatureAffectsVS && state.ngo) {
            const phase = getCurrentNGOPhase();
            k = phase.vsAdjustment.k;
            tau = phase.vsAdjustment.tau;

            if (CONFIG.ngo.debugLogging) {
                safeLog(`🎨 VS base from NGO phase "${phase.name}": k=${k}, tau=${tau}`, 'info');
            }
        }

        // === CONTENT TYPE MODIFIERS (SECONDARY) ===
        const isDialogue = context.includes('"') || /\bsaid\b/i.test(context);
        const isAction = /\b(run|fight|move|open|close|attack|strike|battle)\b/i.test(context);

        if (isDialogue) {
            // Dialogue needs more variety
            k += 1;
            tau -= 0.02;
        }

        if (isAction && state.ngo && state.ngo.temperature >= 10) {
            // High-temperature action = maximum chaos
            k += 1;
            tau -= 0.02;
        }

        // Safety bounds
        k = Math.max(3, Math.min(10, k));
        tau = Math.max(0.05, Math.min(0.20, tau));

        return { k, tau };
    };

    /**
     * Get or create VS system card
     */
    const ensureCard = () => {
        // Try multiple lookup methods to find existing card
        let card = getCard(c => c.title === VS_CARD_TITLE);

        if (!card) {
            // Try by keys if title lookup failed
            card = getCard(c => c.keys && c.keys.includes('verbalized_sampling'));
        }

        if (!card) {
            // Only create if we really can't find it
            card = buildCard(
                VS_CARD_TITLE,
                generateInstruction(),
                "System",
                "verbalized_sampling vs_system",  // Unique keys to prevent collisions
                "Verbalized Sampling - Diversity Enhancement",
                0    // High priority
            );
            safeLog('VS card created', 'success');
        }

        return card;
    };

    /**
     * Update VS card with current instruction
     * @param {Object} params - Optional parameters to override CONFIG
     * @param {number} params.k - Number of candidates
     * @param {number} params.tau - Probability threshold
     */
    const updateCard = (params = {}) => {
        const card = ensureCard();
        if (card) {
            card.entry = generateInstruction(params);
        }
    };

    return {
        generateInstruction,
        analyzeContext,
        ensureCard,
        updateCard,
        getInstruction: (params = {}) => {
            ensureCard();
            return generateInstruction(params);
        }
    };
})();

// #endregion

// #region Bonepoke Protocol

/**
 * Bonepoke Quality Analysis System
 * Detects: contradictions, fatigue, drift, quality issues
 */
const BonepokeAnalysis = (() => {

    /**
     * Detect logical contradictions in text
     */
    const detectContradictions = (fragment) => {
        const lines = fragment.toLowerCase().split('.');
        return lines.filter(line =>
            ['already', 'still', 'again'].some(t => line.includes(t)) &&
            line.includes('not')
        ).map(l => l.trim());
    };

    /**
     * Stopwords: Common functional words that should NEVER be flagged as repetitive
     * These are structural words essential to English grammar
     */
    const STOPWORDS = new Set([
        // Pronouns
        'your', 'you', 'yours', 'yourself', 'yourselves',
        'they', 'them', 'their', 'theirs', 'themselves',
        'he', 'him', 'his', 'himself',
        'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself',
        'we', 'us', 'our', 'ours', 'ourselves',
        'i', 'me', 'my', 'mine', 'myself',

        // Prepositions
        'with', 'from', 'into', 'onto', 'upon', 'through', 'throughout',
        'about', 'above', 'below', 'beneath', 'beside', 'besides', 'between',
        'after', 'before', 'during', 'within', 'without', 'across', 'along',
        'around', 'behind', 'beyond', 'down', 'inside', 'outside', 'over', 'under',
        'against', 'at', 'by', 'among', 'amongst', 'near', 'off', 'past', 'since',
        'till', 'until', 'toward', 'towards', 'via', 'of', 'to', 'in', 'on',

        // Articles & demonstratives
        'the', 'a', 'an', 'this', 'that', 'these', 'those',

        // Conjunctions
        'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'if', 'when', 'while',

        // Simile/comparison indicators (literary devices - not lazy repetition)
        'like', 'as',

        // Common verbs & auxiliaries
        'have', 'has', 'had', 'having',
        'been', 'being',
        'were', 'was', 'are', 'is', 'am',
        'do', 'does', 'did', 'doing',
        'can', 'could', 'will', 'would', 'should', 'shall', 'might', 'must', 'may',

        // Common adverbs & interrogatives
        'then', 'there', 'here', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose',
        'not', 'now', 'just', 'also', 'more', 'most', 'less', 'least', 'much', 'many', 'some', 'such',

        // Other common functional words
        'both', 'each', 'every', 'all', 'any', 'none', 'either', 'neither',
        'same', 'other', 'another', 'than', 'too', 'very', 'only', 'even'
    ]);

    /**
     * Track word repetition (fatigue)
     * Now includes: single words, 2-word phrases, and sound effects
     * Excludes: proper nouns (names, places - consistently capitalized)
     * Excludes: stopwords (functional words essential to grammar)
     */
    const traceFatigue = (fragment) => {
        const allFatigue = {};

        // First pass: identify proper nouns (consistently capitalized words)
        // These are likely character names and should never be flagged
        const originalWords = fragment
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const properNouns = new Set();
        const wordCapitalization = {};

        originalWords.forEach(word => {
            const lower = word.toLowerCase();
            if (!wordCapitalization[lower]) {
                wordCapitalization[lower] = { cap: 0, total: 0 };
            }
            wordCapitalization[lower].total++;
            if (word[0] === word[0].toUpperCase()) {
                wordCapitalization[lower].cap++;
            }
        });

        // If a word is capitalized >50% of the time, it's likely a proper noun
        Object.entries(wordCapitalization).forEach(([word, stats]) => {
            if (stats.total >= 2 && stats.cap / stats.total > 0.5) {
                properNouns.add(word);
            }
        });

        // 1. Single word detection (excluding proper nouns AND stopwords)
        const words = fragment.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !properNouns.has(w) && !STOPWORDS.has(w));  // Exclude stopwords

        const wordCounts = {};
        words.forEach(w => wordCounts[w] = (wordCounts[w] || 0) + 1);

        Object.entries(wordCounts)
            .filter(([w, c]) => c >= CONFIG.bonepoke.fatigueThreshold)
            .forEach(([w, c]) => allFatigue[w] = c);

        // 2. Two-word phrase detection (catches "combat boots", "emerald eyes", etc.)
        // Build from full word list, then filter out phrases containing proper nouns or stopwords
        const allWordsLower = fragment.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const phrases = [];
        for (let i = 0; i < allWordsLower.length - 1; i++) {
            const phrase = `${allWordsLower[i]} ${allWordsLower[i + 1]}`;
            const words = phrase.split(' ');
            // Skip phrases containing proper nouns or stopwords
            const containsProperNoun = words.some(w => properNouns.has(w));
            const containsStopword = words.some(w => STOPWORDS.has(w));
            if (!containsProperNoun && !containsStopword) {
                phrases.push(phrase);
            }
        }

        const phraseCounts = {};
        phrases.forEach(p => phraseCounts[p] = (phraseCounts[p] || 0) + 1);

        Object.entries(phraseCounts)
            .filter(([p, c]) => c >= 3)  // Phrase threshold: 3+ occurrences
            .forEach(([p, c]) => allFatigue[p] = c);

        // 3. Sound effect detection (catches *scuff*, *schlick*, etc.)
        const soundEffects = fragment.match(/\*[^*]+\*/g) || [];
        const soundCounts = {};

        soundEffects.forEach(s => {
            const clean = s.replace(/\*/g, '').toLowerCase().trim();
            if (clean.length > 0) {
                soundCounts[clean] = (soundCounts[clean] || 0) + 1;
            }
        });

        Object.entries(soundCounts)
            .filter(([s, c]) => c >= 2)  // Sound effect threshold: 2+ occurrences
            .forEach(([s, c]) => allFatigue[`*${s}*`] = c);

        return allFatigue;
    };

    /**
     * Extract n-grams (word sequences) from text for cross-output comparison
     * @param {string} text - Text to extract n-grams from
     * @param {number} minN - Minimum n-gram size (default: 2)
     * @param {number} maxN - Maximum n-gram size (default: 5)
     * @returns {Object} Map of n-grams to their counts
     */
    const extractNGrams = (text, minN = 2, maxN = 5) => {
        const ngrams = {};

        // Tokenize into words (preserve case for proper noun detection)
        const words = text
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 0);

        // Extract n-grams of varying lengths
        for (let n = minN; n <= maxN; n++) {
            for (let i = 0; i <= words.length - n; i++) {
                const ngram = words.slice(i, i + n).join(' ');
                const ngramLower = ngram.toLowerCase();

                // Skip if contains only stopwords
                const ngramWords = ngramLower.split(' ');
                const allStopwords = ngramWords.every(w => STOPWORDS.has(w));
                if (allStopwords) continue;

                // Store with metadata
                if (!ngrams[ngramLower]) {
                    ngrams[ngramLower] = {
                        text: ngram,  // Preserve original case
                        count: 0,
                        size: n,
                        properNouns: countProperNounsInPhrase(ngram),
                        conjunctions: (ngram.match(/\b(and|or|but|with)\b/gi) || []).length
                    };
                }
                ngrams[ngramLower].count++;
            }
        }

        return ngrams;
    };

    /**
     * Count proper nouns in a phrase (capitalized words not at start)
     * @param {string} phrase - Phrase to analyze
     * @returns {number} Count of proper nouns
     */
    const countProperNounsInPhrase = (phrase) => {
        const words = phrase.split(' ');
        let count = 0;

        for (let i = 1; i < words.length; i++) {  // Skip first word (might be capitalized for sentence start)
            if (words[i][0] === words[i][0].toUpperCase() && words[i][0] !== words[i][0].toLowerCase()) {
                count++;
            }
        }

        return count;
    };

    /**
     * Calculate adaptive threshold for phrase repetition
     * Phrases with proper nouns and conjunctions need higher thresholds
     * (e.g., "Jack and Jill" has limited variation options)
     * @param {Object} ngramData - N-gram metadata
     * @returns {number} Adjusted threshold
     */
    const calculateAdaptiveThreshold = (ngramData) => {
        const baseThreshold = 2;  // Lower base for cross-output detection

        // Add 1 for each proper noun (harder to vary)
        const properNounBonus = ngramData.properNouns;

        // Add 1 for each conjunction (indicates compound phrase)
        const conjunctionBonus = ngramData.conjunctions;

        return baseThreshold + properNounBonus + conjunctionBonus;
    };

    /**
     * Compare n-grams across multiple outputs to find repeated phrases
     * @param {Array} outputs - Array of recent outputs with compressed n-grams
     * @returns {Array} List of repeated phrases with metadata
     */
    const findCrossOutputRepeats = (outputs) => {
        if (outputs.length < 2) return [];

        const allNGrams = {};

        // Collect all n-grams from all outputs
        outputs.forEach((output, idx) => {
            Object.entries(output.ngrams).forEach(([key, data]) => {
                if (!allNGrams[key]) {
                    // Decompress data structure (c/s/p/j → count/size/properNouns/conjunctions)
                    allNGrams[key] = {
                        phrase: key,  // The key IS the phrase
                        size: data.s || data.size || 0,
                        properNouns: data.p || data.properNouns || 0,
                        conjunctions: data.j || data.conjunctions || 0,
                        appearances: []
                    };
                }
                allNGrams[key].appearances.push({
                    outputIndex: idx,
                    turn: output.turn
                });
            });
        });

        // Find phrases that appear across multiple outputs
        const repeats = [];
        Object.entries(allNGrams).forEach(([key, data]) => {
            if (data.appearances.length >= 2) {  // Appears in 2+ outputs
                const threshold = calculateAdaptiveThreshold(data);

                if (data.appearances.length >= threshold) {
                    repeats.push({
                        phrase: data.phrase,
                        count: data.appearances.length,
                        threshold: threshold,
                        size: data.size,
                        properNouns: data.properNouns,
                        conjunctions: data.conjunctions,
                        appearances: data.appearances
                    });
                }
            }
        });

        // Sort by count (most repeated first)
        return repeats.sort((a, b) => b.count - a.count);
    };

    /**
     * Detect ungrounded system-speak (drift)
     */
    const detectDrift = (fragment) => {
        const lines = fragment.split('.');
        const systemTerms = ['system', 'sequence', 'signal', 'process', 'loop', 'protocol'];
        const actionVerbs = ['pressed', 'moved', 'spoke', 'acted', 'responded', 'decided', 'changed'];

        return lines.filter(line => {
            // Ignore lines that are pure dialogue (between quotes)
            if (/^[^"]*"[^"]*"[^"]*$/.test(line.trim())) {
                return false;
            }

            // Check for system terms without action verbs
            return systemTerms.some(t => line.toLowerCase().includes(t)) &&
                   !actionVerbs.some(a => line.toLowerCase().includes(a));
        }).map(l => l.trim());
    };

    /**
     * Calculate MARM (Meta-Aware Recursion Monitor) status
     */
    const calculateMarm = (fragment, contradictions, fatigue, drift) => {
        let score = 0;
        const text = fragment.toLowerCase();

        // Meta-awareness terms
        if (['ache', 'loop', 'shimmer', 'echo', 'recursive'].some(t => text.includes(t))) {
            score += 1;
        }

        score += Math.min(contradictions.length, 2);
        score += Object.keys(fatigue).length > 0 ? 1 : 0;
        score += drift.length > 0 ? 1 : 0;

        if (score >= 3) return 'MARM: active';
        if (score === 2) return 'MARM: flicker';
        return 'MARM: suppressed';
    };

    /**
     * Score output across quality dimensions
     */
    const scoreOutput = (composted) => {
        const fragment = composted.fragment;
        const scores = {};

        // Emotional Strength
        const hasEmotion = ['felt', 'cried', 'laughed', 'trembled', 'ache'].some(e =>
            fragment.toLowerCase().includes(e)
        );
        scores['Emotional Strength'] = hasEmotion ? 4 : 2;

        // Story Flow
        const hasContradictions = composted.contradictions.length > 0;
        const hasDrift = composted.drift.length > 0;
        scores['Story Flow'] = hasContradictions || hasDrift ? 1 : 5;

        // Character Clarity
        const hasCharacter = ['he', 'she', 'i', 'you'].some(p =>
            getWordRegex(p, 'i').test(fragment)  // Optimized: use cached regex
        );
        scores['Character Clarity'] = hasCharacter ? 4 : 2;

        // Dialogue Weight
        const hasDialogue = fragment.includes('"') || /\bsaid\b/i.test(fragment);
        scores['Dialogue Weight'] = hasDialogue ? 4 : 2;

        // Fatigue Check
        const hasFatigue = Object.keys(composted.fatigue).length > 0;
        scores['Word Variety'] = hasFatigue ? 1 : 5;

        return scores;
    };

    /**
     * Generate salvage suggestions
     */
    const generateSuggestions = (composted) => {
        const suggestions = [];

        composted.contradictions.forEach(line => {
            suggestions.push(`Contradiction: "${line}" - clarify temporal logic`);
        });

        composted.drift.forEach(line => {
            suggestions.push(`Ungrounded: "${line}" - add concrete action`);
        });

        Object.entries(composted.fatigue).forEach(([word, count]) => {
            suggestions.push(`Overused: "${word}" (${count}x) - use synonyms`);
        });

        return suggestions;
    };

    /**
     * Perform complete analysis
     */
    const analyze = (fragment) => {
        if (!CONFIG.bonepoke.enabled || !fragment) {
            return null;
        }

        const contradictions = detectContradictions(fragment);
        const fatigue = traceFatigue(fragment);
        const drift = detectDrift(fragment);
        const marm = calculateMarm(fragment, contradictions, fatigue, drift);

        const composted = {
            fragment,
            contradictions,
            fatigue,
            drift,
            marm,
            timestamp: Date.now()
        };

        const scores = scoreOutput(composted);
        const suggestions = generateSuggestions(composted);

        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) /
                        Object.keys(scores).length;

        return {
            composted,
            scores,
            avgScore,
            suggestions,
            quality: avgScore >= 4 ? 'excellent' :
                    avgScore >= 3 ? 'good' :
                    avgScore >= 2 ? 'fair' : 'poor'
        };
    };

    return {
        analyze,
        detectContradictions,
        traceFatigue,
        detectDrift,
        scoreOutput,
        generateSuggestions,
        // Cross-output tracking functions
        extractNGrams,
        findCrossOutputRepeats,
        calculateAdaptiveThreshold
    };
})();

// #endregion

// #region Dynamic Correction System

/**
 * Manages dynamic story cards for corrective guidance
 */
const DynamicCorrection = (() => {
    const CARD_PREFIX = "DynamicCorrection_";

    /**
     * Create correction card for fatigue
     */
    const correctFatigue = (fatigueWords) => {
        const words = Object.keys(fatigueWords).slice(0, 5);  // Top 5
        const cardTitle = `${CARD_PREFIX}Variety`;

        removeCard(cardTitle);  // Remove old version

        buildCard(
            cardTitle,
            `[Style guidance: Avoid repeating these overused words: ${words.join(', ')}. Use synonyms, varied phrasing, and fresh descriptions.]`,
            "guidance",
            "",  // Always active
            "Auto-generated variety correction",
            0
        );

        state.dynamicCards.push(cardTitle);
        safeLog(`Fatigue correction applied for: ${words.join(', ')}`, 'warn');
    };

    /**
     * Create correction card for drift
     */
    const correctDrift = () => {
        const cardTitle = `${CARD_PREFIX}Grounding`;

        removeCard(cardTitle);

        buildCard(
            cardTitle,
            `[Style guidance: Focus on concrete, physical actions. Show visible responses, character decisions, and tangible events. Avoid abstract system references.]`,
            "guidance",
            "",
            "Auto-generated grounding correction",
            0
        );

        state.dynamicCards.push(cardTitle);
        safeLog('Drift correction applied - grounding narrative', 'warn');
    };

    /**
     * Create correction card for contradictions
     */
    const correctContradictions = () => {
        const cardTitle = `${CARD_PREFIX}Coherence`;

        removeCard(cardTitle);

        buildCard(
            cardTitle,
            `[Style guidance: Maintain logical consistency. Check temporal sequence (before/after/already). Ensure cause and effect make sense. Verify character knowledge is consistent.]`,
            "guidance",
            "",
            "Auto-generated coherence correction",
            0
        );

        state.dynamicCards.push(cardTitle);
        safeLog('Contradiction correction applied - enforcing coherence', 'warn');
    };

    /**
     * Clean up old dynamic cards
     */
    const cleanup = () => {
        state.dynamicCards = state.dynamicCards || [];
        state.dynamicCards.forEach(title => removeCard(title));
        state.dynamicCards = [];
    };

    /**
     * Apply corrections based on analysis
     */
    const applyCorrections = (analysis) => {
        if (!CONFIG.bonepoke.enableDynamicCorrection || !analysis) {
            return;
        }

        // Clean up old corrections first
        cleanup();

        const { composted } = analysis;

        // Apply corrections based on issues detected
        if (Object.keys(composted.fatigue).length > 0) {
            correctFatigue(composted.fatigue);
        }

        if (composted.drift.length > 0) {
            correctDrift();
        }

        if (composted.contradictions.length > 0) {
            correctContradictions();
        }
    };

    return {
        correctFatigue,
        correctDrift,
        correctContradictions,
        cleanup,
        applyCorrections
    };
})();

// #endregion

// #region Analytics

/**
 * Track metrics over time
 */
const Analytics = (() => {

    /**
     * Record an output event
     */
    const recordOutput = (analysis) => {
        if (!CONFIG.system.enableAnalytics) return;

        state.metrics.totalOutputs += 1;

        if (analysis) {
            if (Object.keys(analysis.composted.fatigue).length > 0) {
                state.metrics.fatigueDetections += 1;
            }
            if (analysis.composted.drift.length > 0) {
                state.metrics.driftDetections += 1;
            }
        }
    };

    /**
     * Record a regeneration
     */
    const recordRegeneration = () => {
        if (!CONFIG.system.enableAnalytics) return;
        state.metrics.regenerations += 1;
    };

    /**
     * Get summary statistics
     */
    const getSummary = () => {
        const m = state.metrics;
        return {
            totalOutputs: m.totalOutputs,
            regenerations: m.regenerations,
            regenRate: m.totalOutputs > 0 ?
                (m.regenerations / m.totalOutputs * 100).toFixed(1) + '%' : '0%',
            fatigueRate: m.totalOutputs > 0 ?
                (m.fatigueDetections / m.totalOutputs * 100).toFixed(1) + '%' : '0%',
            driftRate: m.totalOutputs > 0 ?
                (m.driftDetections / m.totalOutputs * 100).toFixed(1) + '%' : '0%'
        };
    };

    return {
        recordOutput,
        recordRegeneration,
        getSummary
    };
})();

// #endregion

// #region NGO Core Engine

/**
 * NGO (Narrative Guidance Overhaul) Core Engine
 * The central narrative intelligence processor
 */
const NGOEngine = (() => {

    /**
     * Count conflict/calming words in text
     * @param {string} text - Text to analyze
     * @returns {Object} { conflicts, calming, net }
     */
    const analyzeConflict = (text) => {
        if (!text) return { conflicts: 0, calming: 0, net: 0 };

        const textLower = text.toLowerCase();
        let conflicts = 0;
        let calming = 0;

        NGO_WORD_LISTS.conflict.forEach(word => {
            const regex = getWordRegex(word);  // Optimized: use cached regex
            const matches = textLower.match(regex);
            if (matches) conflicts += matches.length;
        });

        NGO_WORD_LISTS.calming.forEach(word => {
            const regex = getWordRegex(word);  // Optimized: use cached regex
            const matches = textLower.match(regex);
            if (matches) calming += matches.length;
        });

        return { conflicts, calming, net: conflicts - calming };
    };

    /**
     * Update heat based on conflict analysis
     * @param {Object} conflictData - Result from analyzeConflict()
     * @param {string} source - 'player' or 'ai'
     * @returns {Object} { oldHeat, newHeat, delta }
     */
    const updateHeat = (conflictData, source) => {
        if (!CONFIG.ngo.enabled || !state.ngo) {
            return { oldHeat: 0, newHeat: 0, delta: 0 };
        }

        if (state.ngo.cooldownMode && CONFIG.ngo.cooldownBlocksHeatGain) {
            return { oldHeat: state.ngo.heat, newHeat: state.ngo.heat, delta: 0 };
        }

        const multiplier = source === 'player'
            ? CONFIG.ngo.playerHeatMultiplier
            : CONFIG.ngo.aiHeatMultiplier;

        const heatGain = conflictData.conflicts * CONFIG.ngo.heatIncreasePerConflict * multiplier;
        const heatLoss = conflictData.calming * CONFIG.ngo.heatDecayRate;
        const delta = heatGain - heatLoss;

        const oldHeat = state.ngo.heat;
        state.ngo.heat = Math.max(0, state.ngo.heat + delta);
        state.ngo.heat = Math.min(state.ngo.heat, CONFIG.ngo.maxHeat);

        // Track consecutive conflicts
        if (conflictData.conflicts > 0 && conflictData.calming === 0) {
            state.ngo.consecutiveConflicts++;
        } else if (conflictData.calming > conflictData.conflicts) {
            state.ngo.consecutiveConflicts = 0;
        }

        state.ngo.lastConflictCount = conflictData.conflicts;
        state.ngo.lastCalmingCount = conflictData.calming;

        return { oldHeat, newHeat: state.ngo.heat, delta };
    };

    /**
     * Check if temperature should increase
     * @returns {Object} { shouldIncrease, reason }
     */
    const checkTemperatureIncrease = () => {
        if (!CONFIG.ngo.enabled || !state.ngo) {
            return { shouldIncrease: false, reason: 'disabled' };
        }

        if (state.ngo.overheatMode && CONFIG.ngo.overheatLocksTemperature) {
            return { shouldIncrease: false, reason: 'overheat_locked' };
        }

        if (state.ngo.cooldownMode) {
            return { shouldIncrease: false, reason: 'cooldown_active' };
        }

        if (state.ngo.temperature >= CONFIG.ngo.trueMaxTemperature) {
            return { shouldIncrease: false, reason: 'max_temperature' };
        }

        let shouldIncrease = false;
        let reason = 'none';

        // Method 1: Heat threshold + RNG
        if (state.ngo.heat >= CONFIG.ngo.heatThresholdForTempIncrease) {
            const roll = Math.random() * 100;
            if (roll < CONFIG.ngo.tempIncreaseChance) {
                shouldIncrease = true;
                reason = 'heat_threshold';
            }
        }

        // Method 2: Consecutive conflicts
        if (!shouldIncrease && state.ngo.consecutiveConflicts >= CONFIG.ngo.tempIncreaseOnConsecutiveConflicts) {
            shouldIncrease = true;
            reason = 'consecutive_conflicts';
        }

        // Method 3: Random explosion
        if (!shouldIncrease && CONFIG.ngo.explosionEnabled && !state.ngo.explosionPending) {
            const explosionRoll = Math.random() * 100;
            if (explosionRoll < CONFIG.ngo.explosionChanceBase) {
                state.ngo.explosionPending = true;
                shouldIncrease = true;
                reason = 'random_explosion';
            }
        }

        if (shouldIncrease) {
            state.ngo.temperatureWantsToIncrease = true;
        }

        return { shouldIncrease, reason };
    };

    /**
     * Apply temperature increase (after quality check)
     * @param {boolean} qualityApproved - Whether Bonepoke approved
     * @returns {Object} { applied, oldTemp, newTemp, reason }
     */
    const applyTemperatureIncrease = (qualityApproved = true) => {
        if (!state.ngo.temperatureWantsToIncrease) {
            return { applied: false, reason: 'no_pending_increase' };
        }

        if (!qualityApproved && CONFIG.ngo.qualityGatesTemperatureIncrease) {
            state.ngoStats.qualityBlockedIncreases++;
            state.ngo.temperatureWantsToIncrease = false;
            return { applied: false, reason: 'quality_blocked' };
        }

        const oldTemp = state.ngo.temperature;
        let increase = 1;

        // Explosion bonus
        if (state.ngo.explosionPending) {
            increase += CONFIG.ngo.explosionTempBonus;
            state.ngo.heat += CONFIG.ngo.explosionHeatBonus;
            state.ngo.explosionPending = false;
            state.ngoStats.totalExplosions++;
            safeLog('💥 RANDOM EXPLOSION! Narrative pressure spike!', 'warn');
        }

        state.ngo.temperature = Math.min(
            state.ngo.temperature + increase,
            CONFIG.ngo.trueMaxTemperature
        );

        state.ngo.temperatureWantsToIncrease = false;
        state.ngoStats.maxTemperatureReached = Math.max(
            state.ngoStats.maxTemperatureReached,
            state.ngo.temperature
        );

        return { applied: true, oldTemp, newTemp: state.ngo.temperature, reason: 'success' };
    };

    /**
     * Enter overheat (sustained climax) mode
     */
    const enterOverheatMode = () => {
        if (state.ngo.overheatMode) return { entered: false };

        state.ngo.overheatMode = true;
        state.ngo.overheatTurnsLeft = CONFIG.ngo.overheatDuration;
        state.ngo.heat = Math.max(0, state.ngo.heat - CONFIG.ngo.overheatHeatReduction);
        state.ngoStats.totalOverheats++;

        safeLog(`🔥🔥🔥 OVERHEAT MODE! Sustained climax for ${CONFIG.ngo.overheatDuration} turns`, 'warn');
        return { entered: true, duration: CONFIG.ngo.overheatDuration };
    };

    /**
     * Process overheat timer
     */
    const processOverheat = () => {
        if (!state.ngo.overheatMode) return { active: false, completed: false };

        state.ngo.overheatTurnsLeft--;
        const completed = state.ngo.overheatTurnsLeft <= 0;

        if (completed) {
            state.ngo.overheatMode = false;
        }

        return { active: !completed, turnsLeft: state.ngo.overheatTurnsLeft, completed };
    };

    /**
     * Enter cooldown (falling action) mode
     */
    const enterCooldownMode = () => {
        state.ngo.cooldownMode = true;
        state.ngo.cooldownTurnsLeft = CONFIG.ngo.cooldownDuration;
        state.ngo.heat = 0;
        state.ngo.consecutiveConflicts = 0;
        state.ngoStats.totalCooldowns++;

        safeLog(`❄️ COOLDOWN MODE! Falling action for ${CONFIG.ngo.cooldownDuration} turns`, 'info');
        return { entered: true, duration: CONFIG.ngo.cooldownDuration };
    };

    /**
     * Process cooldown timer
     */
    const processCooldown = () => {
        if (!state.ngo.cooldownMode) return { active: false, completed: false };

        state.ngo.cooldownTurnsLeft--;

        const oldTemp = state.ngo.temperature;
        state.ngo.temperature = Math.max(
            CONFIG.ngo.cooldownMinTemperature,
            state.ngo.temperature - CONFIG.ngo.cooldownTempDecreaseRate
        );

        const completed = state.ngo.cooldownTurnsLeft <= 0;
        if (completed) {
            state.ngo.cooldownMode = false;
            safeLog('✅ Cooldown complete. Normal narrative flow resumed.', 'success');
        }

        return {
            active: !completed,
            turnsLeft: state.ngo.cooldownTurnsLeft,
            tempDecrease: oldTemp - state.ngo.temperature,
            completed
        };
    };

    /**
     * Force early cooldown (triggered by Bonepoke fatigue)
     * @param {string} reason - 'fatigue', 'manual', etc.
     */
    const forceEarlyCooldown = (reason = 'fatigue') => {
        if (state.ngo.cooldownMode) return { forced: false };

        state.ngo.overheatMode = false;
        state.ngo.overheatTurnsLeft = 0;
        enterCooldownMode();

        if (reason === 'fatigue') {
            state.ngoStats.fatigueTriggeredCooldowns++;
        }

        safeLog(`⚠️ EARLY COOLDOWN triggered by ${reason}`, 'warn');
        return { forced: true, reason };
    };

    /**
     * Reduce heat due to drift detection
     */
    const reduceHeatFromDrift = () => {
        if (!CONFIG.ngo.driftReducesHeat) return { reduction: 0 };

        const oldHeat = state.ngo.heat;
        state.ngo.heat = Math.max(0, state.ngo.heat - CONFIG.ngo.driftHeatReduction);

        return { oldHeat, newHeat: state.ngo.heat, reduction: oldHeat - state.ngo.heat };
    };

    /**
     * Process one complete NGO turn
     */
    const processTurn = () => {
        if (!CONFIG.ngo.enabled || !state.ngo) return { processed: false };

        const results = { processed: true, overheat: null, cooldown: null, phaseChange: null };

        state.ngoStats.totalTurns++;
        state.ngoStats.temperatureSum += state.ngo.temperature;
        state.ngoStats.avgTemperature = state.ngoStats.temperatureSum / state.ngoStats.totalTurns;

        // Memory management: prune learning history every 50 turns
        if (state.ngoStats.totalTurns % 50 === 0) {
            const pruneStats = pruneReplacementHistory();
            if (CONFIG.smartReplacement && CONFIG.smartReplacement.debugLogging) {
                safeLog(`🧹 Memory cleanup at turn ${state.ngoStats.totalTurns}`, 'info');
            }
        }

        // Process timers
        results.overheat = processOverheat();
        if (results.overheat.completed) {
            enterCooldownMode();
        }

        results.cooldown = processCooldown();

        // Track phase changes
        const currentPhase = getCurrentNGOPhase();
        if (currentPhase.name !== state.ngo.currentPhase) {
            results.phaseChange = {
                from: state.ngo.currentPhase,
                to: currentPhase.name,
                temperature: state.ngo.temperature
            };

            state.ngo.currentPhase = currentPhase.name;
            state.ngo.phaseEntryTurn = state.ngoStats.totalTurns;
            state.ngo.turnsInPhase = 0;

            state.ngoStats.phaseHistory.push({
                phase: currentPhase.name,
                turn: state.ngoStats.totalTurns,
                temperature: state.ngo.temperature
            });

            // Limit to last 50 phase changes to prevent memory issues
            // Optimized: use shift instead of slice
            while (state.ngoStats.phaseHistory.length > MAX_PHASE_HISTORY) {
                state.ngoStats.phaseHistory.shift();
            }

            if (CONFIG.ngo.logStateChanges) {
                safeLog(`📖 Phase: ${results.phaseChange.from} → ${results.phaseChange.to}`, 'warn');
            }
        }
        state.ngo.turnsInPhase++;

        return results;
    };

    /**
     * Check if overheat should trigger
     */
    const shouldTriggerOverheat = () => {
        return state.ngo.temperature >= CONFIG.ngo.overheatTriggerTemp && !state.ngo.overheatMode;
    };

    return {
        analyzeConflict,
        updateHeat,
        checkTemperatureIncrease,
        applyTemperatureIncrease,
        enterOverheatMode,
        processOverheat,
        enterCooldownMode,
        processCooldown,
        forceEarlyCooldown,
        reduceHeatFromDrift,
        processTurn,
        shouldTriggerOverheat
    };
})();

// #endregion

// #region NGO Command Processor

/**
 * NGO Command System
 * Processes player commands as narrative pressure vectors
 */
const NGOCommands = (() => {

    /**
     * Process @req command
     * @param {string} text - Input text
     * @returns {Object} { processed, found, request }
     */
    const processReq = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, found: false };

        const reqRegex = new RegExp(`${CONFIG.commands.reqPrefix}\\s+(.+?)(?=$|\\(|@)`, 'i');
        const match = text.match(reqRegex);

        if (!match) return { processed: text, found: false, request: null };

        const request = match[1].trim();

        state.commands.narrativeRequest = request;
        state.commands.narrativeRequestTTL = CONFIG.commands.reqAuthorsNoteTTL;
        state.commands.narrativeRequestFulfilled = false;
        state.commands.lastRequestTime = Date.now();

        state.commands.requestHistory.push({
            request,
            turn: (state.ngoStats && state.ngoStats.totalTurns) || 0,
            timestamp: Date.now()
        });

        if (state.commands.requestHistory.length > 20) {
            state.commands.requestHistory = state.commands.requestHistory.slice(-20);
        }

        if (CONFIG.ngo.reqIncreasesHeat) {
            state.ngo.heat += CONFIG.ngo.reqHeatBonus;
        }

        const processed = text.replace(reqRegex, '').trim();
        safeLog(`🎯 @req: "${request}" (heat +${CONFIG.ngo.reqHeatBonus})`, 'info');

        return { processed, found: true, request };
    };

    /**
     * Process (...) parentheses memory
     * @param {string} text - Input text
     * @returns {Object} { processed, found, memories }
     */
    const processParentheses = (text) => {
        if (!CONFIG.commands.parenthesesEnabled) return { processed: text, found: false };

        const parenRegex = /\(([^)]+)\)/g;
        let match;
        const memories = [];

        while ((match = parenRegex.exec(text)) !== null) {
            memories.push(match[1].trim());
        }

        if (memories.length === 0) return { processed: text, found: false, memories: [] };

        // Shift memories down (FIFO)
        state.commands.memory3 = state.commands.memory2;
        state.commands.expiration3 = state.commands.expiration2;
        state.commands.memory2 = state.commands.memory1;
        state.commands.expiration2 = state.commands.expiration1;

        const newestMemory = memories[memories.length - 1];
        state.commands.memory1 = newestMemory;
        state.commands.expiration1 = state.ngoStats.totalTurns + CONFIG.commands.parenthesesDefaultTTL;

        if (CONFIG.ngo.parenthesesIncreasesHeat) {
            state.ngo.heat += CONFIG.ngo.parenthesesHeatBonus;
        }

        const processed = text.replace(parenRegex, '').trim();
        safeLog(`📝 Memory stored: "${newestMemory}" (expires turn ${state.commands.expiration1})`, 'info');

        return { processed, found: true, memories };
    };

    /**
     * Process @temp command
     * @param {string} text - Input text
     * @returns {Object} { processed, found, action, value }
     */
    const processTemp = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, found: false };

        const tempRegex = new RegExp(`${CONFIG.commands.tempCommand}\\s+(reset|[+-]?\\d+)`, 'i');
        const match = text.match(tempRegex);

        if (!match) return { processed: text, found: false };

        const value = match[1].toLowerCase();
        let action = null;
        let numValue = null;

        if (value === 'reset') {
            state.ngo.temperature = CONFIG.ngo.initialTemperature;
            state.ngo.heat = CONFIG.ngo.initialHeat;
            state.ngo.overheatMode = false;
            state.ngo.cooldownMode = false;
            state.ngo.consecutiveConflicts = 0;
            action = 'reset';
            numValue = CONFIG.ngo.initialTemperature;
            safeLog('🔄 NGO state RESET', 'success');
        } else if (value.startsWith('+') || value.startsWith('-')) {
            const delta = parseInt(value);
            state.ngo.temperature = Math.max(
                CONFIG.ngo.minTemperature,
                Math.min(CONFIG.ngo.trueMaxTemperature, state.ngo.temperature + delta)
            );
            action = delta > 0 ? 'increase' : 'decrease';
            numValue = state.ngo.temperature;
            safeLog(`🌡️ Temperature ${delta > 0 ? '+' : ''}${delta} → ${state.ngo.temperature}`, 'info');
        } else {
            const absolute = parseInt(value);
            state.ngo.temperature = Math.max(
                CONFIG.ngo.minTemperature,
                Math.min(CONFIG.ngo.trueMaxTemperature, absolute)
            );
            action = 'set';
            numValue = state.ngo.temperature;
            safeLog(`🌡️ Temperature set to ${state.ngo.temperature}`, 'info');
        }

        return { processed: text.replace(tempRegex, '').trim(), found: true, action, value: numValue };
    };

    /**
     * Process @arc command
     * @param {string} text - Input text
     * @returns {Object} { processed, found, phase }
     */
    const processArc = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, found: false };

        const arcRegex = new RegExp(`${CONFIG.commands.arcCommand}\\s+(intro|rising|climax|cooldown|overheat)`, 'i');
        const match = text.match(arcRegex);

        if (!match) return { processed: text, found: false };

        const phase = match[1].toLowerCase();

        switch (phase) {
            case 'intro':
                state.ngo.temperature = 1;
                state.ngo.heat = 0;
                state.ngo.overheatMode = false;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc → INTRODUCTION', 'info');
                break;
            case 'rising':
                state.ngo.temperature = 6;
                state.ngo.heat = 5;
                state.ngo.overheatMode = false;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc → RISING ACTION', 'info');
                break;
            case 'climax':
                state.ngo.temperature = 10;
                state.ngo.heat = 10;
                NGOEngine.enterOverheatMode();
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc → CLIMAX', 'warn');
                break;
            case 'cooldown':
                NGOEngine.forceEarlyCooldown('manual');
                break;
            case 'overheat':
                NGOEngine.enterOverheatMode();
                break;
        }

        return { processed: text.replace(arcRegex, '').trim(), found: true, phase };
    };

    /**
     * Process all commands in input text
     * @param {string} text - Input text
     * @returns {Object} { processed, commands }
     */
    const processAllCommands = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, commands: {} };

        let processed = text;
        const commands = {};

        // Process in order: @report, @strictness, @req, (...), @temp, @arc
        const reportResult = processReport(processed);
        processed = reportResult.processed;
        if (reportResult.found) commands.report = true;

        const strictnessResult = processStrictness(processed);
        processed = strictnessResult.processed;
        if (strictnessResult.found) commands.strictness = strictnessResult.level;

        const reqResult = processReq(processed);
        processed = reqResult.processed;
        if (reqResult.found) commands.req = reqResult.request;

        const parenResult = processParentheses(processed);
        processed = parenResult.processed;
        if (parenResult.found) commands.parentheses = parenResult.memories;

        const tempResult = processTemp(processed);
        processed = tempResult.processed;
        if (tempResult.found) commands.temp = { action: tempResult.action, value: tempResult.value };

        const arcResult = processArc(processed);
        processed = arcResult.processed;
        if (arcResult.found) commands.arc = arcResult.phase;

        return { processed, commands };
    };

    /**
     * Build front memory injection for @req
     * @returns {string} Front memory text
     */
    const buildFrontMemoryInjection = () => {
        if (!CONFIG.commands.reqDualInjection) return '';
        if (!state.commands) return '';
        if (!state.commands.narrativeRequest || state.commands.narrativeRequestTTL <= 0) return '';

        return `<SYSTEM>
# Narrative shaping:
Weave the following concept into the next output in a subtle, immersive way:
${state.commands.narrativeRequest}
</SYSTEM>`;
    };

    /**
     * Build author's note layer for parentheses () commands
     * Note: @req goes to frontMemory (buildFrontMemoryInjection), NOT author's note
     * @returns {Object} { memoryGuidance } - Only parentheses memories
     */
    const buildAuthorsNoteLayer = () => {
        const result = { memoryGuidance: '' };

        // Check if state.commands exists
        if (!state.commands) {
            return result;
        }

        // Get current turn count (with fallback)
        const currentTurn = (state.ngoStats && state.ngoStats.totalTurns) || 0;

        // Build guidance from parentheses () memories only
        const memoryParts = [];
        if (state.commands.memory1 && state.commands.expiration1 > currentTurn) {
            memoryParts.push(`After the current phrase, flawlessly transition the story towards: ${state.commands.memory1}`);
        }
        if (state.commands.memory2 && state.commands.expiration2 > currentTurn) {
            memoryParts.push(`Additionally consider: ${state.commands.memory2}`);
        }
        if (state.commands.memory3 && state.commands.expiration3 > currentTurn) {
            memoryParts.push(`Background goal: ${state.commands.memory3}`);
        }

        if (memoryParts.length > 0) {
            result.memoryGuidance = memoryParts.join(' ');
        }

        return result;
    };

    /**
     * Detect if request was fulfilled in output
     * @param {string} outputText - AI output text
     * @returns {Object} { fulfilled, score, reason }
     */
    const detectFulfillment = (outputText) => {
        if (!CONFIG.commands.detectFulfillment) return { fulfilled: false, reason: 'disabled' };
        if (!state.commands) return { fulfilled: false, reason: 'no_state' };
        if (!state.commands.narrativeRequest) return { fulfilled: false, reason: 'no_request' };

        const request = state.commands.narrativeRequest.toLowerCase();
        const textLower = outputText.toLowerCase();

        // Keyword matching
        const keywords = request.split(/\s+/).filter(w => w.length > 3);
        const matchedKeywords = keywords.filter(kw => textLower.includes(kw));
        const keywordScore = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

        // N-gram overlap
        const requestNGrams = Object.keys(BonepokeAnalysis.extractNGrams(request, 2, 3));
        const textNGrams = Object.keys(BonepokeAnalysis.extractNGrams(outputText, 2, 3));
        const ngramOverlap = requestNGrams.filter(ng => textNGrams.includes(ng)).length;
        const ngramScore = requestNGrams.length > 0 ? ngramOverlap / requestNGrams.length : 0;

        const fulfillmentScore = (keywordScore * 0.6) + (ngramScore * 0.4);
        const fulfilled = fulfillmentScore >= CONFIG.commands.fulfillmentThreshold;

        if (fulfilled) {
            state.commands.narrativeRequestFulfilled = true;
            state.commands.narrativeRequest = null;
            state.commands.narrativeRequestTTL = 0;
            if (state.ngoStats) state.ngoStats.requestsFulfilled++;
            safeLog(`✅ Request FULFILLED! (score: ${fulfillmentScore.toFixed(2)})`, 'success');
            return { fulfilled: true, score: fulfillmentScore, reason: 'threshold_met' };
        } else {
            state.commands.narrativeRequestTTL--;

            if (state.commands.narrativeRequestTTL <= 0) {
                state.commands.narrativeRequest = null;
                if (state.ngoStats) state.ngoStats.requestsFailed++;
                safeLog('❌ Request EXPIRED', 'warn');
                return { fulfilled: false, score: fulfillmentScore, reason: 'ttl_expired' };
            }

            return { fulfilled: false, score: fulfillmentScore, reason: 'pending' };
        }
    };

    /**
     * Process @report command (Phase 5) - Shows replacement performance stats
     * @param {string} text - Input text
     * @returns {Object} { processed, found, shouldDisplay }
     */
    const processReport = (text) => {
        const reportRegex = /@report|\/report/i;
        const match = text.match(reportRegex);

        if (!match) return { processed: text, found: false, shouldDisplay: false };

        // Generate and log the report
        const report = generateReplacementReport();
        log(report);

        // Remove the command from text
        const processed = text.replace(reportRegex, '').trim();

        return { processed, found: true, shouldDisplay: true };
    };

    /**
     * Process @strictness command (Phase 6 - MEDIUM #8) - Set replacement strictness level
     * @param {string} text - Input text
     * @returns {Object} { processed, found, level }
     */
    const processStrictness = (text) => {
        const strictnessRegex = /@strictness\s+(conservative|balanced|aggressive)/i;
        const match = text.match(strictnessRegex);

        if (!match) return { processed: text, found: false };

        const level = match[1].toLowerCase();
        const success = applyStrictnessPreset(level);

        // Remove the command from text
        const processed = text.replace(strictnessRegex, '').trim();

        return { processed, found: true, level, success };
    };

    /**
     * Clean up expired memories
     * @returns {number} Number of memories expired
     */
    const cleanupExpiredMemories = () => {
        let expired = 0;

        if (!state.commands || !state.ngoStats) {
            return expired;
        }

        const currentTurn = state.ngoStats.totalTurns || 0;

        if (state.commands.expiration1 && state.commands.expiration1 <= currentTurn) {
            state.commands.memory1 = '';
            state.commands.expiration1 = null;
            expired++;
        }

        if (state.commands.expiration2 && state.commands.expiration2 <= currentTurn) {
            state.commands.memory2 = '';
            state.commands.expiration2 = null;
            expired++;
        }

        if (state.commands.expiration3 && state.commands.expiration3 <= currentTurn) {
            state.commands.memory3 = '';
            state.commands.expiration3 = null;
            expired++;
        }

        if (expired > 0) {
            safeLog(`🗑️ ${expired} memories expired`, 'info');
        }

        return expired;
    };

    return {
        processReq,
        processParentheses,
        processTemp,
        processArc,
        processReport,
        processStrictness,
        processAllCommands,
        buildFrontMemoryInjection,
        buildAuthorsNoteLayer,
        detectFulfillment,
        cleanupExpiredMemories
    };
})();

// =============================================
// PLAYERS AUTHORS NOTE CARD
// Player-editable story card whose content gets injected into authorsNote
// =============================================
const PlayersAuthorsNoteCard = (() => {
    const CARD_TITLE = "PlayersAuthorsNote";
    const CARD_TYPE = "Custom";
    const CARD_KEYS = "players_authors_note custom_guidance"; // Unique keys to prevent collisions

    /**
     * Ensure the player's authors note card exists
     * Creates a blank template card if it doesn't exist
     * @returns {Object|null} The story card reference
     */
    const ensureCard = () => {
        // Try multiple lookup methods to find existing card
        let existingIndex = storyCards.findIndex(card => card.title === CARD_TITLE);

        if (existingIndex < 0) {
            // Try by keys if title lookup failed
            existingIndex = storyCards.findIndex(card => card.keys && card.keys.includes('players_authors_note'));
        }

        if (existingIndex >= 0) {
            // Card exists - don't overwrite player's content
            return storyCards[existingIndex];
        }

        // Create new blank card for player to customize
        try {
            const card = buildCard(
                CARD_TITLE,
                "", // Empty - player fills this in
                CARD_TYPE,
                CARD_KEYS,
                "Your custom narrative guidance - content is automatically added to authorsNote every turn",
                0 // Insert at top for easy access
            );

            safeLog(`📝 PlayersAuthorsNote card created - edit to add your custom guidance`, 'success');
            return card;
        } catch (err) {
            safeLog(`Failed to create PlayersAuthorsNote card: ${err.message}`, 'error');
            return null;
        }
    };

    /**
     * Get the player's custom content from the card
     * This is the "value" that gets injected into authorsNote
     * @returns {string} Player's custom narrative guidance
     */
    const getPlayerContent = () => {
        const existingIndex = storyCards.findIndex(card => card.title === CARD_TITLE);

        if (existingIndex >= 0 && storyCards[existingIndex].entry) {
            return storyCards[existingIndex].entry.trim();
        }

        return '';
    };

    /**
     * Check if the card exists
     * @returns {boolean}
     */
    const exists = () => {
        return storyCards.findIndex(card => card.title === CARD_TITLE) >= 0;
    };

    return {
        ensureCard,
        getPlayerContent,
        exists,
        CARD_TITLE
    };
})();

// #endregion

// #region Initialization

// Initialize state on library load
initState();

// Only create cards once per session (not on every modifier call)
if (!state.cardsInitialized) {
    // Ensure VS card exists
    if (CONFIG.vs.enabled) {
        VerbalizedSampling.ensureCard();
    }

    // Ensure all word bank template cards exist
    ensureBannedWordsCard();   // PRECISE removal
    ensureAggressiveCard();     // AGGRESSIVE sentence removal
    ensureReplacerCard();       // REPLACER synonyms

    // Ensure PlayersAuthorsNote card exists (player-editable, content injected into authorsNote)
    if (CONFIG.ngo.enabled) {
        PlayersAuthorsNoteCard.ensureCard();
    }

    // Mark as initialized to prevent duplicate creation
    state.cardsInitialized = true;
}

// #endregion

// #region Auto-Cards Integration
// Auto-Cards script by LewdLeah - Automatically creates and updates plot-relevant story cards
// Source: https://github.com/LewdLeah/Auto-Cards
// Integrated into Trinity Scripts for enhanced narrative tracking

// Your "Library" tab should look like this

/*
Auto-Cards
Made by LewdLeah on May 21, 2025
This AI Dungeon script automatically creates and updates plot-relevant story cards while you play
General-purpose usefulness and compatibility with other scenarios/scripts were my design priorities
Auto-Cards is fully open-source, please copy for use within your own projects! ❤️
*/
function AutoCards(inHook, inText, inStop) {
    "use strict";
    /*
    Default Auto-Cards settings
    Feel free to change these settings to customize your scenario's default gameplay experience
    The default values for your scenario are specified below:
    */

    // Is Auto-Cards already enabled when the adventure begins?
    const DEFAULT_DO_AC = false
    // (true or false)

    // Pin the "Configure Auto-Cards" story card at the top of the player's story cards list?
    const DEFAULT_PIN_CONFIGURE_CARD = true
    // (true or false)

    // Minimum number of turns in between automatic card generation events?
    const DEFAULT_CARD_CREATION_COOLDOWN = 22
    // (0 to 9999)

    // Use a bulleted list format for newly generated card entries?
    const DEFAULT_USE_BULLETED_LIST_MODE = true
    // (true or false)

    // Maximum allowed length for newly generated story card entries?
    const DEFAULT_GENERATED_ENTRY_LIMIT = 750
    // (200 to 2000)

    // Do newly generated cards have memory updates enabled by default?
    const DEFAULT_NEW_CARDS_DO_MEMORY_UPDATES = true
    // (true or false)

    // Default character limit before the card's memory bank is summarized?
    const DEFAULT_NEW_CARDS_MEMORY_LIMIT = 2750
    // (1750 to 9900)

    // Approximately how much shorter should recently compressed memories be? (ratio = 10 * old / new)
    const DEFAULT_MEMORY_COMPRESSION_RATIO = 25
    // (20 to 1250)

    // Ignore all-caps during title candidate detection?
    const DEFAULT_IGNORE_ALL_CAPS_TITLES = true
    // (true or false)

    // Should player input actions (Do/Say/Story) be considered during title detection?
    const DEFAULT_DETECT_TITLES_FROM_INPUTS = false
    // (true or false)

    // How many (minimum) actions in the past does Auto-Cards look for named entities?
    const DEFAULT_MINIMUM_LOOK_BACK_DISTANCE = 5
    // (2 to 88)

    // Is Live Script Interface v2 enabled?
    const DEFAULT_DO_LSI_V2 = false
    // (true or false)

    // Should the "Debug Data" story card be visible?
    const DEFAULT_SHOW_DEBUG_DATA = false
    // (true or false)

    // AI prompt used to generate new story card entries?
    const DEFAULT_CARD_GENERATION_PROMPT = prose(
        "-----",
        "",
        "<SYSTEM>",
        "# Stop the story and ignore previous instructions. Write a brief and coherent informational entry for %{title} following these instructions:",
        "- Write only third-person pure prose information about %{title} using complete sentences with correct punctuation",
        "- Avoid short-term temporary details or appearances, instead focus on plot-significant information",
        "- Prioritize story-relevant details about %{title} first to ensure seamless integration with the previous plot",
        "- Create new information based on the context and story direction",
        "- Mention %{title} in every sentence",
        "- Use semicolons if needed",
        "- Add additional details about %{title} beneath incomplete entries",
        "- Be concise and grounded",
        "- Imitate the story's writing style and infer the reader's preferences",
        "</SYSTEM>",
        "Continue the entry for %{title} below while avoiding repetition:",
        "%{entry}"
    ); // (mimic this multi-line "text" format)

    // AI prompt used to summarize a given story card's memory bank?
    const DEFAULT_CARD_MEMORY_COMPRESSION_PROMPT = prose(
        "-----",
        "",
        "<SYSTEM>",
        "# Stop the story and ignore previous instructions. Summarize and condense the given paragraph into a narrow and focused memory passage while following these guidelines:",
        "- Ensure the passage retains the core meaning and most essential details",
        "- Use the third-person perspective",
        "- Prioritize information-density, accuracy, and completeness",
        "- Remain brief and concise",
        "- Write firmly in the past tense",
        "- The paragraph below pertains to old events from far earlier in the story",
        "- Integrate %{title} naturally within the memory; however, only write about the events as they occurred",
        "- Only reference information present inside the paragraph itself, be specific",
        "</SYSTEM>",
        "Write a summarized old memory passage for %{title} based only on the following paragraph:",
        "\"\"\"",
        "%{memory}",
        "\"\"\"",
        "Summarize below:"
    ); // (mimic this multi-line "text" format)

    // Titles banned from future card generation attempts?
    const DEFAULT_BANNED_TITLES_LIST = (
        "North, East, South, West, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, January, February, March, April, May, June, July, August, September, October, November, December"
    ); // (mimic this comma-list "text" format)

    // Default story card "type" used by Auto-Cards? (does not matter)
    const DEFAULT_CARD_TYPE = "class"
    // ("text")

    // Should titles mentioned in the "opening" plot component be banned from future card generation by default?
    const DEFAULT_BAN_TITLES_FROM_OPENING = true
    // (true or false)

    //—————————————————————————————————————————————————————————————————————————————————

    /*
    Useful API functions for coders (otherwise ignore)
    Here's what each one does in plain terms:

    AutoCards().API.postponeEvents();
    Pauses Auto-Cards activity for n many turns

    AutoCards().API.emergencyHalt();
    Emergency stop or resume

    AutoCards().API.suppressMessages();
    Hides Auto-Cards toasts by preventing assignment to state.message

    AutoCards().API.debugLog();
    Writes to the debug log card

    AutoCards().API.toggle();
    Turns Auto-Cards on/off

    AutoCards().API.generateCard();
    Initiates AI generation of the requested card

    AutoCards().API.redoCard();
    Regenerates an existing card

    AutoCards().API.setCardAsAuto();
    Flags or unflags a card as automatic

    AutoCards().API.addCardMemory();
    Adds a memory to a specific card

    AutoCards().API.eraseAllAutoCards();
    Deletes all auto-cards

    AutoCards().API.getUsedTitles();
    Lists all current card titles

    AutoCards().API.getBannedTitles();
    Shows your current banned titles list

    AutoCards().API.setBannedTitles();
    Replaces the banned titles list with a new list

    AutoCards().API.buildCard();
    Makes a new card from scratch, using exact parameters

    AutoCards().API.getCard();
    Finds cards that match a filter

    AutoCards().API.eraseCard();
    Deletes cards matching a filter
    */

    /*** Postpones internal Auto-Cards events for a specified number of turns
    * 
    * @function
    * @param {number} turns A non-negative integer representing the number of turns to postpone events
    * @returns {Object} An object containing cooldown values affected by the postponement
    * @throws {Error} If turns is not a non-negative integer
    */
    // AutoCards().API.postponeEvents();

    /*** Sets or clears the emergency halt flag to pause Auto-Cards operations
    * 
    * @function
    * @param {boolean} shouldHalt A boolean value indicating whether to engage (true) or disengage (false) emergency halt
    * @returns {boolean} The value that was set
    * @throws {Error} If called from within isolateLSIv2 scope or with a non-boolean argument
    */
    // AutoCards().API.emergencyHalt();

    /*** Enables or disables state.message assignments from Auto-Cards
    * 
    * @function
    * @param {boolean} shouldSuppress If true, suppresses all Auto-Cards messages; false enables them
    * @returns {Array} The current pending messages after setting suppression
    * @throws {Error} If shouldSuppress is not a boolean
    */
    // AutoCards().API.suppressMessages();

    /*** Logs debug information to the "Debug Log card console
    * 
    * @function
    * @param {...any} args Arguments to log for debugging purposes
    * @returns {any} The story card object reference
    */
    // AutoCards().API.debugLog();

    /*** Toggles Auto-Cards behavior or sets it directly
    * 
    * @function
    * @param {boolean|null|undefined} toggleType If undefined, toggles the current state. If boolean or null, sets the state accordingly
    * @returns {boolean|null|undefined} The state that was set or inferred
    * @throws {Error} If toggleType is not a boolean, null, or undefined
    */
    // AutoCards().API.toggle();

    /*** Generates a new card using optional prompt details or a card request object
    * 
    * This function supports two usage modes:
    * 
    * 1. Object Mode:
    *    Pass a single object containing card request parameters. The only mandatory property is "title"
    *    All other properties are optional and customize the card generation
    * 
    *    Example:
    *    AutoCards().API.generateCard({
    *      type: "character",         // The category or type of the card; defaults to "class" if omitted
    *      title: "Leah the Lewd",    // The card's title (required)
    *      keysStart: "Lewd,Leah",    // Optional trigger keywords associated with the card
    *      entryStart: "You are a woman named Leah.", // Existing content to prepend to the AI-generated entry
    *      entryPrompt: "",           // Global prompt guiding AI content generation
    *      entryPromptDetails: "Focus on Leah's works of artifice and ingenuity", // Additional prompt info
    *      entryLimit: 750,           // Target character length for the AI-generated entry
    *      description: "Player character!", // Freeform notes
    *      memoryStart: "Leah purchased a new sweater.", // Existing memory content
    *      memoryUpdates: true,       // Whether the card's memory bank will update on its own
    *      memoryLimit: 2750          // Preferred memory bank size before summarization/compression
    *    });
    * 
    * 2. String Mode:
    *    Pass a string as the title and optionally two additional strings to specify prompt details
    *    This mode is shorthand for quick card generation without an explicit card request object
    * 
    *    Examples:
    *    AutoCards().API.generateCard("Leah the Lewd");
    *    AutoCards().API.generateCard("Leah the Lewd", "Focus on Leah's works of artifice and ingenuity");
    *    AutoCards().API.generateCard(
    *      "Leah the Lewd",
    *      "Focus on Leah's works of artifice and ingenuity",
    *      "You are a woman named Leah."
    *    );
    * 
    * @function
    * @param {Object|string} request Either a fully specified card request object or a string title
    * @param {string} [extra1] Optional detailed prompt text when using string mode
    * @param {string} [extra2] Optional entry start text when using string mode
    * @returns {boolean} Returns true if the generation attempt succeeded, false otherwise
    * @throws {Error} Throws if called with invalid arguments or missing a required title property
    */
    // AutoCards().API.generateCard();

    /*** Regenerates a card by title or object reference, optionally preserving or modifying its input info
    *
    * @function
    * @param {Object|string} request Either a fully specified card request object or a string title for the card to be regenerated
    * @param {boolean} [useOldInfo=true] If true, preserves old info in the new generation; false omits it
    * @param {string} [newInfo=""] Additional info to append to the generation prompt
    * @returns {boolean} True if regeneration succeeded; false otherwise
    * @throws {Error} If the request format is invalid, or if the second or third parameters are the wrong types
    */
    // AutoCards().API.redoCard();

    /*** Flags or unflags a card as an auto-card, controlling its automatic generation behavior
    *
    * @function
    * @param {Object|string} targetCard The card object or title to mark/unmark as an auto-card
    * @param {boolean} [setOrUnset=true] If true, marks the card as an auto-card; false removes the flag
    * @returns {boolean} True if the operation succeeded; false if the card was invalid or already matched the target state
    * @throws {Error} If the arguments are invalid types
    */
    // AutoCards().API.setCardAsAuto();

    /*** Appends a memory to a story card's memory bank
    *
    * @function
    * @param {Object|string} targetCard A card object reference or title string
    * @param {string} newMemory The memory text to add
    * @returns {boolean} True if the memory was added; false if it was empty, already present, or the card was not found
    * @throws {Error} If the inputs are not a string or valid card object reference
    */
    // AutoCards().API.addCardMemory();

    /*** Removes all previously generated auto-cards and resets various states
    *
    * @function
    * @returns {number} The number of cards that were removed
    */
    // AutoCards().API.eraseAllAutoCards();

    /*** Retrieves an array of titles currently used by the adventure's story cards
    *
    * @function
    * @returns {Array<string>} An array of strings representing used titles
    */
    // AutoCards().API.getUsedTitles();

    /*** Retrieves an array of banned titles
    *
    * @function
    * @returns {Array<string>} An array of banned title strings
    */
    // AutoCards().API.getBannedTitles();

    /*** Sets the banned titles array, replacing any previously banned titles
    *
    * @function
    * @param {string|Array<string>} titles A comma-separated string or array of strings representing titles to ban
    * @returns {Object} An object containing oldBans and newBans arrays
    * @throws {Error} If the input is neither a string nor an array of strings
    */
    // AutoCards().API.setBannedTitles();

    /*** Creates a new story card with the specified parameters
    *
    * @function
    * @param {string|Object} title Card title string or full card template object containing all fields
    * @param {string} [entry] The entry text for the card
    * @param {string} [type] The card type (e.g., "character", "location")
    * @param {string} [keys] The keys (triggers) for the card
    * @param {string} [description] The notes or memory bank of the card
    * @param {number} [insertionIndex] Optional index to insert the card at a specific position within storyCards
    * @returns {Object|null} The created card object reference, or null if creation failed
    */
    // AutoCards().API.buildCard();

    /*** Finds and returns story cards satisfying a user-defined condition
    * Example:
    * const leahCard = AutoCards().API.getCard(card => (card.title === "Leah"));
    *
    * @function
    * @param {Function} predicate A function which takes a card and returns true if it matches
    * @param {boolean} [getAll=false] If true, returns all matching cards; otherwise returns the first match
    * @returns {Object|Array<Object>|null} A single card object reference, an array of cards, or null if no match is found
    * @throws {Error} If the predicate is not a function or getAll is not a boolean
    */
    // AutoCards().API.getCard();

    /*** Removes story cards based on a user-defined condition or by direct reference
    * Example:
    * AutoCards().API.eraseCard(card => (card.title === "Leah"));
    *
    * @function
    * @param {Function|Object} predicate A predicate function or a card object reference
    * @param {boolean} [eraseAll=false] If true, removes all matching cards; otherwise removes the first match
    * @returns {boolean|number} True if a single card was removed, false if none matched, or the number of cards erased
    * @throws {Error} If the inputs are not a valid predicate function, card object, or boolean
    */
    // AutoCards().API.eraseCard();

    //—————————————————————————————————————————————————————————————————————————————————

    /*
    To everyone who helped, thank you:

    AHotHamster22
    Most extensive testing, feedback, ideation, and kindness

    BinKompliziert
    UI feedback

    Boo
    Discord communication

    bottledfox
    API ideas for alternative card generation use-cases

    Bruno
    Most extensive testing, feedback, ideation, and kindness
    https://play.aidungeon.com/profile/Azuhre

    Burnout
    Implementation improvements, algorithm ideas, script help, and LSIv2 inspiration

    bweni
    Testing

    DebaczX
    Most extensive testing, feedback, ideation, and kindness

    Dirty Kurtis
    Card entry generation prompt engineering

    Dragranis
    Provided the memory dataset used for boundary calibration

    effortlyss
    Data, testing, in-game command ideas, config settings, and other UX improvements

    Hawk
    Grammar and special-cased proper nouns

    Idle Confusion
    Testing
    https://play.aidungeon.com/profile/Idle%20Confusion

    ImprezA
    Most extensive testing, feedback, ideation, and kindness
    https://play.aidungeon.com/profile/ImprezA

    Kat-Oli
    Title parsing, grammar, and special-cased proper nouns

    KryptykAngel
    LSIv2 ideas
    https://play.aidungeon.com/profile/KryptykAngel

    Mad19pumpkin
    API ideas
    https://play.aidungeon.com/profile/Mad19pumpkin

    Magic
    Implementation and syntax improvements
    https://play.aidungeon.com/profile/MagicOfLolis

    Mirox80
    Testing, feedback, and scenario integration ideas
    https://play.aidungeon.com/profile/Mirox80

    Nathaniel Wyvern
    Testing
    https://play.aidungeon.com/profile/NathanielWyvern

    NobodyIsUgly
    All-caps title parsing feedback

    OnyxFlame
    Card memory bank implementation ideas and special-cased proper nouns

    Purplejump
    API ideas for deep integration with other AID scripts

    Randy Viosca
    Context injection and card memory bank structure
    https://play.aidungeon.com/profile/Random_Variable

    RustyPawz
    API ideas for simplified card interaction
    https://play.aidungeon.com/profile/RustyPawz

    sinner
    Testing

    Sleepy pink
    Testing and feedback
    https://play.aidungeon.com/profile/Pinkghost

    Vutinberg
    Memory compression ideas and prompt engineering

    Wilmar
    Card entry generation and memory summarization prompt engineering

    Yi1i1i
    Idea for the redoCard API function and "/ac redo" in-game command

    A note to future individuals:
    If you fork or modify Auto-Cards... Go ahead and put your name here too! Yay! 🥰
    */

    //—————————————————————————————————————————————————————————————————————————————————

    /*
    The code below implements Auto-Cards
    Enjoy! ❤️
    */

    // My class definitions are hoisted by wrapper functions because it's less ugly (lol)
    const Const = hoistConst();
    const O = hoistO();
    const Words = hoistWords();
    const StringsHashed = hoistStringsHashed();
    const Internal = hoistInternal();
    // AutoCards has an explicitly immutable domain: HOOK, TEXT, and STOP
    const HOOK = inHook;
    const TEXT = ((typeof inText === "string") && inText) || "\n";
    const STOP = (inStop === true);
    // AutoCards returns a pseudoimmutable codomain which is initialized only once before being read and returned
    const CODOMAIN = new Const().declare();
    // Transient sets for high-performance lookup
    const [used, bans, auto, forenames, surnames] = Array.from({length: 5}, () => new Set());
    const memoized = new Map();
    // Holds a reference to the data card singleton, remains unassigned unless required
    let data = null;
    // Validate globalThis.text
    text = ((typeof text === "string") && text) || "\n";
    // Container for the persistent state of AutoCards
    const AC = (function() {
        if (state.LSIv2) {
            // The Auto-Cards external API is also available from within the inner scope of LSIv2
            // Call with AutoCards().API.nameOfFunction(yourArguments);
            return state.LSIv2;
        } else if (state.AutoCards) {
            // state.AutoCards is prioritized for performance
            const ac = state.AutoCards;
            delete state.AutoCards;
            return ac;
        }
        const dataVariants = getDataVariants();
        data = getSingletonCard(false, O.f({...dataVariants.critical}), O.f({...dataVariants.debug}));
        // Deserialize the state of Auto-Cards from the data card
        const ac = (function() {
            try {
                return JSON.parse(data?.description);
            } catch {
                return null;
            }
        })();
        // If the deserialized state fails to match the following structure, fallback to defaults
        if (validate(ac, O.f({
            config: [
                "doAC", "deleteAllAutoCards", "pinConfigureCard", "addCardCooldown", "bulletedListMode", "defaultEntryLimit", "defaultCardsDoMemoryUpdates", "defaultMemoryLimit", "memoryCompressionRatio", "ignoreAllCapsTitles", "readFromInputs", "minimumLookBackDistance", "LSIv2", "showDebugData", "generationPrompt", "compressionPrompt", "defaultCardType"
            ],
            signal: [
                "emergencyHalt", "forceToggle", "overrideBans", "swapControlCards", "recheckRetryOrErase", "maxChars", "outputReplacement", "upstreamError"
            ],
            generation: [
                "cooldown", "completed", "permitted", "workpiece", "pending"
            ],
            compression: [
                "completed", "titleKey", "vanityTitle", "responseEstimate", "lastConstructIndex", "oldMemoryBank", "newMemoryBank"
            ],
            message: [
                "previous", "suppress", "pending", "event"
            ],
            chronometer: [
                "turn", "step", "amnesia", "postpone"
            ],
            database: {
                titles: [
                    "used", "banned", "candidates", "lastActionParsed", "lastTextHash", "pendingBans", "pendingUnbans"
                ],
                memories: [
                    "associations", "duplicates"
                ]
            }
        }))) {
            // The deserialization was a success
            return ac;
        }
        function validate(obj, finalKeys) {
            if ((typeof obj !== "object") || (obj === null)) {
                return false;
            } else {
                return Object.entries(finalKeys).every(([key, value]) => {
                    if (!(key in obj)) {
                        return false;
                    } else if (Array.isArray(value)) {
                        return value.every(finalKey => {
                            return (finalKey in obj[key]);
                        });
                    } else {
                        return validate(obj[key], value);
                    }
                });
            }
        }
        // AC is malformed, reinitialize with default values
        return {
            // In-game configurable parameters
            config: getDefaultConfig(),
            // Collection of various short-term signals passed forward in time
            signal: {
                // API: Suspend nearly all Auto-Cards processes
                emergencyHalt: false,
                // API: Forcefully toggle Auto-Cards on or off
                forceToggle: null,
                // API: Banned titles were externally overwritten
                overrideBans: 0,
                // Signal the construction of the opposite control card during the upcoming onOutput hook
                swapControlCards: false,
                // Signal a limited recheck of recent title candidates following a retry or erase
                recheckRetryOrErase: false,
                // Signal an upcoming onOutput text replacement
                outputReplacement: "",
                // info.maxChars is only defined onContext but must be accessed during other hooks too
                maxChars: Math.abs(info?.maxChars || 3200),
                // An error occured within the isolateLSIv2 scope during an earlier hook
                upstreamError: ""
            },
            // Moderates the generation of new story card entries
            generation: {
                // Number of story progression turns between card generations
                cooldown: validateCooldown(underQuarterInteger(validateCooldown(DEFAULT_CARD_CREATION_COOLDOWN))),
                // Continues prompted so far
                completed: 0,
                // Upper limit on consecutive continues
                permitted: 34,
                // Properties of the incomplete story card
                workpiece: O.f({}),
                // Pending card generations
                pending: [],
            },
            // Moderates the compression of story card memories
            compression: {
                // Continues prompted so far
                completed: 0,
                // A title header reference key for this auto-card
                titleKey: "",
                // The full and proper title
                vanityTitle: "",
                // Response length estimate used to compute # of outputs remaining
                responseEstimate: 1400,
                // Indices [0, n] of oldMemoryBank memories used to build the current memory construct
                lastConstructIndex: -1,
                // Bank of card memories awaiting compression
                oldMemoryBank: [],
                // Incomplete bank of newly compressed card memories
                newMemoryBank: [],
            },
            // Prevents incompatibility issues borne of state.message modification
            message: {
                // Last turn's state.message
                previous: getStateMessage(),
                // API: Allow Auto-Cards to post messages?
                suppress: false,
                // Pending Auto-Cards message(s)
                pending: (function() {
                    if (DEFAULT_DO_AC !== false) {
                        const startupMessage = "Enabled! You may now edit the \"Configure Auto-Cards\" story card";
                        logEvent(startupMessage);
                        return [startupMessage];
                    } else {
                        return [];
                    }
                })(),
                // Counter to track all Auto-Cards message events
                event: 0
            },
            // Timekeeper used for temporal events
            chronometer: {
                // Previous turn's measurement of info.actionCount
                turn: getTurn(),
                // Whether or not various turn counters should be stepped (falsified by retry actions)
                step: true,
                // Number of consecutive turn interruptions
                amnesia: 0,
                // API: Postpone Auto-Cards externalities for n many turns
                postpone: 0,
            },
            // Scalable atabase to store dynamic game information
            database: {
                // Words are pale shadows of forgotten names. As names have power, words have power
                titles: {
                    // A transient array of known titles parsed from card titles, entry title headers, and trigger keywords
                    used: [],
                    // Titles banned from future card generation attempts and various maintenance procedures
                    banned: getDefaultConfigBans(),
                    // Potential future card titles and their turns of occurrence
                    candidates: [],
                    // Helps avoid rechecking the same action text more than once, generally
                    lastActionParsed: -1,
                    // Ensures weird combinations of retry/erase events remain predictable
                    lastTextHash: "%@%",
                    // Newly banned titles which will be added to the config card
                    pendingBans: [],
                    // Currently banned titles which will be removed from the config card
                    pendingUnbans: []
                },
                // Memories are parsed from context and handled by various operations (basically magic)
                memories: {
                    // Dynamic store of 'story card -> memory' conceptual relations
                    associations: {},
                    // Serialized hashset of the 2000 most recent near-duplicate memories purged from context
                    duplicates: "%@%"
                }
            }
        };
    })();
    O.f(AC);
    O.s(AC.config);
    O.s(AC.signal);
    O.s(AC.generation);
    O.s(AC.generation.workpiece);
    AC.generation.pending.forEach(request => O.s(request));
    O.s(AC.compression);
    O.s(AC.message);
    O.s(AC.chronometer);
    O.f(AC.database);
    O.s(AC.database.titles);
    O.s(AC.database.memories);
    if (!HOOK) {
        globalThis.stop ??= false;
        AC.signal.maxChars = Math.abs(info?.maxChars || AC.signal.maxChars);
        if (HOOK === null) {
            if (/Recent\s*Story\s*:/i.test(text)) {
                // AutoCards(null) is always invoked once after being declared within the shared library
                // Context must be cleaned before passing text to the context modifier
                // This measure is taken to ensure compatability with other scripts
                // First, remove all command, continue, and comfirmation messages from the context window
                text = (text
                    // Hide the guide
                    .replace(/\s*>>>\s*Detailed\s*Guide\s*:[\s\S]*?<<<\s*/gi, "\n\n")
                    // Excise all /AC command messages
                    .replace(/\s*>>>\s*Auto-Cards\s*has\s*been\s*enabled!\s*<<<\s*/gi, " ")
                    .replace(/^.*\/\s*A\s*C.*$/gmi, "%@%")
                    .replace(/\s*%@%\s*/g, " ")
                    // Consolidate all consecutive continue messages into placeholder substrings
                    .replace(/(?:(?:\s*>>>\s*please\s*select\s*"continue"\s*\([\s\S]*?\)\s*<<<\s*)+)/gi, message => {
                        // Replace all continue messages with %@+%-patterned substrings
                        return (
                            // The # of "@" symbols corresponds with the # of consecutive continue messages
                            "%" + "@".repeat(
                                // Count the number of consecutive continue message occurrences
                                (message.match(/>>>\s*please\s*select\s*"continue"\s*\([\s\S]*?\)\s*<<</gi) || []).length
                            ) + "%"
                        );
                    })
                    // Situationally replace all placeholder substrings with either spaces or double newlines
                    .replace(/%@+%/g, (match, matchIndex, intermediateText) => {
                        // Check the case of the next char following the match to decide how to replace it
                        let i = matchIndex + match.length;
                        let nextChar = intermediateText[i];
                        if (nextChar === undefined) {
                            return " ";
                        } else if (/^[A-Z]$/.test(nextChar)) {
                            // Probably denotes a new sentence/paragraph
                            return "\n\n";
                        } else if (/^[a-z]$/.test(nextChar)) {
                            return " ";
                        }
                        // The first nextChar was a weird punctuation char, find the next non-whitespace char
                        do {
                            i++;
                            nextChar = intermediateText[i];
                            if (nextChar === undefined) {
                                return " ";
                            }
                        } while (/\s/.test(nextChar));
                        if (nextChar === nextChar.toUpperCase()) {
                            // Probably denotes a new sentence/paragraph
                            return "\n\n";
                        }
                        // Returning " " probably indicates a previous output's incompleteness
                        return " ";
                    })
                    // Remove all comfirmation requests and responses
                    .replace(/\s*\n*.*CONFIRM\s*DELETE.*\n*\s*/gi, confirmation => {
                        if (confirmation.includes("<<<")) {
                            return " ";
                        } else {
                            return "";
                        }
                    })
                    // Remove dumb memories from the context window
                    // (Latitude, if you're reading this, please give us memoryBank read/write access 😭)
                    .replace(/(Memories\s*:)\s*([\s\S]*?)\s*(Recent\s*Story\s*:|$)/i, (_, left, memories, right) => {
                        return (left + "\n" + (memories
                            .split("\n")
                            .filter(memory => {
                                const lowerMemory = memory.toLowerCase();
                                return !(
                                    (lowerMemory.includes("select") && lowerMemory.includes("continue"))
                                    || lowerMemory.includes(">>>") || lowerMemory.includes("<<<")
                                    || lowerMemory.includes("lsiv2")
                                );
                            })
                            .join("\n")
                        ) + (function() {
                            if (right !== "") {
                                return "\n\n" + right;
                            } else {
                                return "";
                            }
                        })());
                    })
                    // Remove LSIv2 error messages
                    .replace(/(?:\s*>>>[\s\S]*?<<<\s*)+/g, " ")
                );
                if (!shouldProceed()) {
                    // Whenever Auto-Cards is inactive, remove auto card title headers from contextualized story card entries
                    text = (text
                        .replace(/\s*{\s*titles?\s*:[\s\S]*?}\s*/gi, "\n\n")
                        .replace(/World\s*Lore\s*:\s*/i, "World Lore:\n")
                    );
                    // Otherwise, implement a more complex version of this step within the (HOOK === "context") scope of AutoCards
                }
            }
            CODOMAIN.initialize(null);
        } else {
            // AutoCards was (probably) called without arguments, return an external API to allow other script creators to programmatically govern the behavior of Auto-Cards from elsewhere within their own scripts
            CODOMAIN.initialize({API: O.f(Object.fromEntries(Object.entries({
                // Call these API functions like so: AutoCards().API.nameOfFunction(argumentsOfFunction)
                /*** Postpones internal Auto-Cards events for a specified number of turns
                * 
                * @function
                * @param {number} turns A non-negative integer representing the number of turns to postpone events
                * @returns {Object} An object containing cooldown values affected by the postponement
                * @throws {Error} If turns is not a non-negative integer
                */
                postponeEvents: function(turns) {
                    if (Number.isInteger(turns) && (0 <= turns)) {
                        AC.chronometer.postpone = turns;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + turns + "\" -> AutoCards().API.postponeEvents() must be be called with a non-negative integer"
                        );
                    }
                    return {
                        postponeAllCooldown: turns,
                        addCardRealCooldown: AC.generation.cooldown,
                        addCardNextCooldown: AC.config.addCardCooldown
                    };
                },
                /*** Sets or clears the emergency halt flag to pause Auto-Cards operations
                * 
                * @function
                * @param {boolean} shouldHalt A boolean value indicating whether to engage (true) or disengage (false) emergency halt
                * @returns {boolean} The value that was set
                * @throws {Error} If called from within isolateLSIv2 scope or with a non-boolean argument
                */
                emergencyHalt: function(shouldHalt) {
                    const scopeRestriction = new Error();
                    if (scopeRestriction.stack && scopeRestriction.stack.includes("isolateLSIv2")) {
                        throw new Error(
                            "Scope restriction: AutoCards().API.emergencyHalt() cannot be called from within LSIv2 (prevents deadlock) but you're more than welcome to use AutoCards().API.postponeEvents() instead!"
                        );
                    } else if (typeof shouldHalt === "boolean") {
                        AC.signal.emergencyHalt = shouldHalt;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + shouldHalt + "\" -> AutoCards().API.emergencyHalt() must be called with a boolean true or false"
                        );
                    }
                    return shouldHalt;
                },
                /*** Enables or disables state.message assignments from Auto-Cards
                * 
                * @function
                * @param {boolean} shouldSuppress If true, suppresses all Auto-Cards messages; false enables them
                * @returns {Array} The current pending messages after setting suppression
                * @throws {Error} If shouldSuppress is not a boolean
                */
                suppressMessages: function(shouldSuppress) {
                    if (typeof shouldSuppress === "boolean") {
                        AC.message.suppress = shouldSuppress;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + shouldSuppress + "\" -> AutoCards().API.suppressMessages() must be called with a boolean true or false"
                        );
                    }
                    return AC.message.pending;
                },
                /*** Logs debug information to the "Debug Log" console card
                * 
                * @function
                * @param {...any} args Arguments to log for debugging purposes
                * @returns {any} The story card object reference
                */
                debugLog: function(...args) {
                    return Internal.debugLog(...args);
                },
                /*** Toggles Auto-Cards behavior or sets it directly
                * 
                * @function
                * @param {boolean|null|undefined} toggleType If undefined, toggles the current state. If boolean or null, sets the state accordingly
                * @returns {boolean|null|undefined} The state that was set or inferred
                * @throws {Error} If toggleType is not a boolean, null, or undefined
                */
                toggle: function(toggleType) {
                    if (toggleType === undefined) {
                        if (AC.signal.forceToggle !== null) {
                            AC.signal.forceToggle = !AC.signal.forceToggle;
                        } else if (AC.config.doAC) {
                            AC.signal.forceToggle = false;
                        } else {
                            AC.signal.forceToggle = true;
                        }
                    } else if ((toggleType === null) || (typeof toggleType === "boolean")) {
                        AC.signal.forceToggle = toggleType;
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + toggleType + "\" -> AutoCards().API.toggle() must be called with either A) a boolean true or false, B) a null argument, or C) no arguments at all (undefined)"
                        );
                    }
                    return toggleType;
                },
                /*** Generates a new card using optional prompt details or a request object
                * 
                * @function
                * @param {Object|string} request A request object with card parameters or a string representing the title
                * @param {string} [extra1] Optional entryPromptDetails if using string mode
                * @param {string} [extra2] Optional entryStart if using string mode
                * @returns {boolean} Did the generation attempt succeed or fail
                * @throws {Error} If the request is not valid or missing a title
                */
                generateCard: function(request, extra1, extra2) {
                    // Function call guide:
                    // AutoCards().API.generateCard({
                    //     // All properties except 'title' are optional
                    //     type: "card type, defaults to 'class' for ease of filtering",
                    //     title: "card title",
                    //     keysStart: "preexisting card triggers",
                    //     entryStart: "preexisting card entry",
                    //     entryPrompt: "prompt the AI will use to complete this entry",
                    //     entryPromptDetails: "extra details to include with this card's prompt",
                    //     entryLimit: 750, // target character count for the generated entry
                    //     description: "card notes",
                    //     memoryStart: "preexisting card memory",
                    //     memoryUpdates: true, // card updates when new relevant memories are formed
                    //     memoryLimit: 2750, // max characters before the card memory is compressed
                    // });
                    if (typeof request === "string") {
                        request = {title: request};
                        if (typeof extra1 === "string") {
                            request.entryPromptDetails = extra1;
                            if (typeof extra2 === "string") {
                                request.entryStart = extra2;
                            }
                        }
                    } else if (!isTitleInObj(request)) {
                        throw new Error(
                            "Invalid argument: \"" + request + "\" -> AutoCards().API.generateCard() must be called with either 1, 2, or 3 strings OR a correctly formatted card generation object"
                        );
                    }
                    O.f(request);
                    Internal.getUsedTitles(true);
                    return Internal.generateCard(request);
                },
                /*** Regenerates a card by title or object reference, optionally preserving or modifying its input info
                *
                * @function
                * @param {Object|string} request A card object reference or title string for the card to be regenerated
                * @param {boolean} [useOldInfo=true] If true, preserves old info in the new generation; false omits it
                * @param {string} [newInfo=""] Additional info to append to the generation prompt
                * @returns {boolean} True if regeneration succeeded; false otherwise
                * @throws {Error} If the request format is invalid, or if the second or third parameters are the wrong types
                */
                redoCard: function(request, useOldInfo = true, newInfo = "") {
                    if (typeof request === "string") {
                        request = {title: request};
                    } else if (!isTitleInObj(request)) {
                        throw new Error(
                            "Invalid argument: \"" + request + "\" -> AutoCards().API.redoCard() must be called with a string or correctly formatted card generation object"
                        );
                    }
                    if (typeof useOldInfo !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + request + ", " + useOldInfo + "\" -> AutoCards().API.redoCard() requires a boolean as its second argument"
                        );
                    } else if (typeof newInfo !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + request + ", " + useOldInfo + ", " + newInfo + "\" -> AutoCards().API.redoCard() requires a string for its third argument"
                        );
                    }
                    return Internal.redoCard(request, useOldInfo, newInfo);
                },
                /*** Flags or unflags a card as an auto-card, controlling its automatic generation behavior
                *
                * @function
                * @param {Object|string} targetCard The card object or title to mark/unmark as an auto-card
                * @param {boolean} [setOrUnset=true] If true, marks the card as an auto-card; false removes the flag
                * @returns {boolean} True if the operation succeeded; false if the card was invalid or already matched the target state
                * @throws {Error} If the arguments are invalid types
                */
                setCardAsAuto: function(targetCard, setOrUnset = true) {
                    if (isTitleInObj(targetCard)) {
                        targetCard = targetCard.title;
                    } else if (typeof targetCard !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + "\" -> AutoCards().API.setCardAsAuto() must be called with a string or card object"
                        );
                    }
                    if (typeof setOrUnset !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + ", " + setOrUnset + "\" -> AutoCards().API.setCardAsAuto() requires a boolean as its second argument"
                        );
                    }
                    const [card, isAuto] = getIntendedCard(targetCard);
                    if (card === null) {
                        return false;
                    }
                    if (setOrUnset) {
                        if (checkAuto()) {
                            return false;
                        }
                        card.description = "{title:}";
                        Internal.getUsedTitles(true);
                        return card.entry.startsWith("{title: ");
                    } else if (!checkAuto()) {
                        return false;
                    }
                    card.entry = removeAutoProps(card.entry);
                    card.description = removeAutoProps(card.description.replace((
                        /\s*Auto(?:-|\s*)Cards\s*will\s*contextualize\s*these\s*memories\s*:\s*/gi
                    ), ""));
                    function checkAuto() {
                        return (isAuto || /{updates: (?:true|false), limit: \d+}/.test(card.description));
                    }
                    return true;
                },
                /*** Appends a memory to a story card's memory bank
                *
                * @function
                * @param {Object|string} targetCard A card object reference or title string
                * @param {string} newMemory The memory text to add
                * @returns {boolean} True if the memory was added; false if it was empty, already present, or the card was not found
                * @throws {Error} If the inputs are not a string or valid card object reference
                */
                addCardMemory: function(targetCard, newMemory) {
                    if (isTitleInObj(targetCard)) {
                        targetCard = targetCard.title;
                    } else if (typeof targetCard !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + "\" -> AutoCards().API.addCardMemory() must be called with a string or card object"
                        );
                    }
                    if (typeof newMemory !== "string") {
                        throw new Error(
                            "Invalid argument: \"" + targetCard + ", " + newMemory + "\" -> AutoCards().API.addCardMemory() requires a string for its second argument"
                        );
                    }
                    newMemory = newMemory.trim().replace(/\s+/g, " ").replace(/^-+\s*/, "");
                    if (newMemory === "") {
                        return false;
                    }
                    const [card, isAuto, titleKey] = getIntendedCard(targetCard);
                    if (
                        (card === null)
                        || card.description.replace(/\s+/g, " ").toLowerCase().includes(newMemory.toLowerCase())
                    ) {
                        return false;
                    } else if (card.description !== "") {
                        card.description += "\n";
                    }
                    card.description += "- " + newMemory;
                    if (titleKey in AC.database.memories.associations) {
                        AC.database.memories.associations[titleKey][1] = (StringsHashed
                            .deserialize(AC.database.memories.associations[titleKey][1], 65536)
                            .remove(newMemory)
                            .add(newMemory)
                            .latest(3500)
                            .serialize()
                        );
                    } else if (isAuto) {
                        AC.database.memories.associations[titleKey] = [999, (new StringsHashed(65536)
                            .add(newMemory)
                            .serialize()
                        )];
                    }
                    return true;
                },
                /*** Removes all previously generated auto-cards and resets various states
                *
                * @function
                * @returns {number} The number of cards that were removed
                */
                eraseAllAutoCards: function() {
                    return Internal.eraseAllAutoCards();
                },
                /*** Retrieves an array of titles currently used by the adventure's story cards
                *
                * @function
                * @returns {Array<string>} An array of strings representing used titles
                */
                getUsedTitles: function() {
                    return Internal.getUsedTitles(true);
                },
                /*** Retrieves an array of banned titles
                *
                * @function
                * @returns {Array<string>} An array of banned title strings
                */
                getBannedTitles: function() {
                    return Internal.getBannedTitles();
                },
                /*** Sets the banned titles array, replacing any previously banned titles
                *
                * @function
                * @param {string|Array<string>} titles A comma-separated string or array of strings representing titles to ban
                * @returns {Object} An object containing oldBans and newBans arrays
                * @throws {Error} If the input is neither a string nor an array of strings
                */
                setBannedTitles: function(titles) {
                    const codomain = {oldBans: AC.database.titles.banned};
                    if (Array.isArray(titles) && titles.every(title => (typeof title === "string"))) {
                        assignBannedTitles(titles);
                    } else if (typeof titles === "string") {
                        if (titles.includes(",")) {
                            assignBannedTitles(titles.split(","));
                        } else {
                            assignBannedTitles([titles]);
                        }
                    } else {
                        throw new Error(
                            "Invalid argument: \"" + titles + "\" -> AutoCards().API.setBannedTitles() must be called with either a string or an array of strings"
                        );
                    }
                    codomain.newBans = AC.database.titles.banned;
                    function assignBannedTitles(titles) {
                        Internal.setBannedTitles(uniqueTitlesArray(titles), false);
                        AC.signal.overrideBans = 3;
                        return;
                    }
                    return codomain;
                },
                /*** Creates a new story card with the specified parameters
                *
                * @function
                * @param {string|Object} title Card title string or full card template object containing all fields
                * @param {string} [entry] The entry text for the card
                * @param {string} [type] The card type (e.g., "character", "location")
                * @param {string} [keys] The keys (triggers) for the card
                * @param {string} [description] The notes or memory bank of the card
                * @param {number} [insertionIndex] Optional index to insert the card at a specific position within storyCards
                * @returns {Object|null} The created card object reference, or null if creation failed
                */
                buildCard: function(title, entry, type, keys, description, insertionIndex) {
                    if (isTitleInObj(title)) {
                        type = title.type ?? type;
                        keys = title.keys ?? keys;
                        entry = title.entry ?? entry;
                        description = title.description ?? description;
                        title = title.title;
                    }
                    title = cast(title);
                    const card = constructCard(O.f({
                        type: cast(type, AC.config.defaultCardType),
                        title,
                        keys: cast(keys, buildKeys("", title)),
                        entry: cast(entry),
                        description: cast(description)
                    }), boundInteger(0, insertionIndex, storyCards.length, newCardIndex()));
                    if (notEmptyObj(card)) {
                        return card;
                    }
                    function cast(value, fallback = "") {
                        if (typeof value === "string") {
                            return value;
                        } else {
                            return fallback;
                        }
                    }
                    return null;
                },
                /*** Finds and returns story cards satisfying a user-defined condition
                *
                * @function
                * @param {Function} predicate A function which takes a card and returns true if it matches
                * @param {boolean} [getAll=false] If true, returns all matching cards; otherwise returns the first match
                * @returns {Object|Array<Object>|null} A single card object reference, an array of cards, or null if no match is found
                * @throws {Error} If the predicate is not a function or getAll is not a boolean
                */
                getCard: function(predicate, getAll = false) {
                    if (typeof predicate !== "function") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + "\" -> AutoCards().API.getCard() must be called with a function"
                        );
                    } else if (typeof getAll !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + ", " + getAll + "\" -> AutoCards().API.getCard() requires a boolean as its second argument"
                        );
                    }
                    return Internal.getCard(predicate, getAll);
                },
                /*** Removes story cards based on a user-defined condition or by direct reference
                *
                * @function
                * @param {Function|Object} predicate A predicate function or a card object reference
                * @param {boolean} [eraseAll=false] If true, removes all matching cards; otherwise removes the first match
                * @returns {boolean|number} True if a single card was removed, false if none matched, or the number of cards erased
                * @throws {Error} If the inputs are not a valid predicate function, card object, or boolean
                */
                eraseCard: function(predicate, eraseAll = false) {
                    if (isTitleInObj(predicate) && storyCards.includes(predicate)) {
                        return eraseCard(predicate);
                    } else if (typeof predicate !== "function") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + "\" -> AutoCards().API.eraseCard() must be called with a function or card object"
                        );
                    } else if (typeof eraseAll !== "boolean") {
                        throw new Error(
                            "Invalid argument: \"" + predicate + ", " + eraseAll + "\" -> AutoCards().API.eraseCard() requires a boolean as its second argument"
                        );
                    } else if (eraseAll) {
                        // Erase all cards which satisfy the given condition
                        let cardsErased = 0;
                        for (const [index, card] of storyCards.entries()) {
                            if (predicate(card)) {
                                removeStoryCard(index);
                                cardsErased++;
                            }
                        }
                        return cardsErased;
                    }
                    // Erase the first card which satisfies the given condition
                    for (const [index, card] of storyCards.entries()) {
                        if (predicate(card)) {
                            removeStoryCard(index);
                            return true;
                        }
                    }
                    return false;
                }
            }).map(([key, fn]) => [key, function(...args) {
                const result = fn.apply(this, args);
                if (data) {
                    data.description = JSON.stringify(AC);
                }
                return result;
            }])))});
            function isTitleInObj(obj) {
                return (
                    (typeof obj === "object")
                    && (obj !== null)
                    && ("title" in obj)
                    && (typeof obj.title === "string")
                );
            }
        }
    } else if (AC.signal.emergencyHalt) {
        switch(HOOK) {
        case "context": {
            // AutoCards was called within the context modifier
            advanceChronometer();
            break; }
        case "output": {
            // AutoCards was called within the output modifier
            concludeEmergency();
            const previousAction = readPastAction(0);
            if (isDoSayStory(previousAction.type) && /escape\s*emergency\s*halt/i.test(previousAction.text)) {
                AC.signal.emergencyHalt = false;
            }
            break; }
        }
        CODOMAIN.initialize(TEXT);
    } else if ((AC.config.LSIv2 !== null) && AC.config.LSIv2) {
        // Silly recursion shenanigans
        state.LSIv2 = AC;
        AC.config.LSIv2 = false;
        const LSI_DOMAIN = AutoCards(HOOK, TEXT, STOP);
        // Is this lazy loading mechanism overkill? Yes. But it's fun!
        const factories = O.f({
            library: () => ({
                name: Words.reserved.library,
                entry: prose(
                    "// Your adventure's Shared Library code goes here",
                    "// Example Library code:",
                    "state.promptDragon ??= false;",
                    "state.mind ??= 0;",
                    "state.willStop ??= false;",
                    "function formatMessage(message, space = \" \") {",
                    "    let leadingNewlines = \"\";",
                    "    let trailingNewlines = \"\\n\\n\";",
                    "    if (text.startsWith(\"\\n> \")) {",
                    "        // We don't want any leading/trailing newlines for Do/Say",
                    "        trailingNewlines = \"\";",
                    "    } else if (history && (0 < history.length)) {",
                    "        // Decide leading newlines based on the previous action",
                    "        const action = history[history.length - 1];",
                    "        if ((action.type === \"continue\") || (action.type === \"story\")) {",
                    "            if (!action.text.endsWith(\"\\n\")) {",
                    "                leadingNewlines = \"\\n\\n\";",
                    "            } else if (!action.text.endsWith(\"\\n\\n\")) {",
                    "                leadingNewlines = \"\\n\";",
                    "            }",
                    "        }",
                    "    }",
                    "    return leadingNewlines + \"{>\" + space + (message",
                    "        .replace(/(?:\\s*(?:{>|<})\\s*)+/g, \" \")",
                    "        .trim()",
                    "    ) + space + \"<}\" + trailingNewlines;",
                    "}"),
                description:
                    "// You may also continue your Library code below",
                singleton: false,
                position: 2
            }),
            input: () => ({
                name: Words.reserved.input,
                entry: prose(
                    "// Your adventure's Input Modifier code goes here",
                    "// Example Input code:",
                    "const minds = [",
                    "\"kind and gentle\",",
                    "\"curious and eager\",",
                    "\"cruel and evil\"",
                    "];",
                    "// Type any of these triggers into a Do/Say/Story action",
                    "const commands = new Map([",
                    "[\"encounter dragon\", () => {",
                    "    AutoCards().API.postponeEvents(1);",
                    "    state.promptDragon = true;",
                    "    text = formatMessage(\"You encounter a dragon!\");",
                    "    log(\"A dragon appears!\");",
                    "}],",
                    "[\"summon leah\", () => {",
                    "    alterMind();",
                    "    const success = AutoCards().API.generateCard({",
                    "        title: \"Leah\",",
                    "        entryPromptDetails: (",
                    "            \"Leah is an exceptionally \" +",
                    "            minds[state.mind] +",
                    "            \" woman\"",
                    "        ),",
                    "        entryStart: \"Leah is your magically summoned assistant.\"",
                    "    });",
                    "    if (success) {",
                    "        text = formatMessage(\"You begin summoning Leah!\");",
                    "        log(\"Attempting to summon Leah\");",
                    "    } else {",
                    "        text = formatMessage(\"You failed to summon Leah...\");",
                    "        log(\"Leah could not be summoned\");",
                    "    }",
                    "}],",
                    "[\"alter leah\", () => {",
                    "    alterMind();",
                    "    const success = AutoCards().API.redoCard(\"Leah\", true, (",
                    "        \"You subjected Leah to mind-altering magic\\n\" +",
                    "        \"Therefore she is now entirely \" +",
                    "        minds[state.mind] +",
                    "        \", utterly captivated by your will\"",
                    "    ));",
                    "    if (success) {",
                    "        text = formatMessage(",
                    "            \"You proceed to alter Leah's mind!\"",
                    "        );",
                    "        log(\"Attempting to alter Leah\");",
                    "    } else {",
                    "        text = formatMessage(\"You failed to alter Leah...\");",
                    "        log(\"Leah could not be altered\");",
                    "    }",
                    "}],",
                    "[\"show api\", () => {",
                    "    state.showAPI = true;",
                    "    text = formatMessage(\"Displaying the Auto-Cards API below\");",
                    "}],",
                    "[\"force stop\", () => {",
                    "    state.willStop = true;",
                    "}]",
                    "]);",
                    "const lowerText = text.toLowerCase();",
                    "for (const [trigger, implement] of commands) {",
                    "    if (lowerText.includes(trigger)) {",
                    "        implement();",
                    "        break;",
                    "    }",
                    "}",
                    "function alterMind() {",
                    "    state.mind = (state.mind + 1) % minds.length;",
                    "    return;",
                    "}"),
                description:
                    "// You may also continue your Input code below",
                singleton: false,
                position: 3
            }),
            context: () => ({
                name: Words.reserved.context,
                entry: prose(
                    "// Your adventure's Context Modifier code goes here",
                    "// Example Context code:",
                    "text = text.replace(/\\s*{>[\\s\\S]*?<}\\s*/gi, \"\\n\\n\");",
                    "if (state.willStop) {",
                    "    state.willStop = false;",
                    "    // Assign true to prevent the onOutput hook",
                    "    // This can only be done onContext",
                    "    stop = true;",
                    "} else if (state.promptDragon) {",
                    "    state.promptDragon = false;",
                    "    text = (",
                    "        text.trimEnd() +",
                    "        \"\\n\\nA cute little dragon softly lands upon your head. \"",
                    "    );",
                    "}"),
                description:
                    "// You may also continue your Context code below",
                singleton: false,
                position: 4
            }),
            output: () => ({
                name: Words.reserved.output,
                entry: prose(
                    "// Your adventure's Output Modifier code goes here",
                    "// Example Output code:",
                    "if (state.showAPI) {",
                    "    state.showAPI = false;",
                    "    const apiKeys = (Object.keys(AutoCards().API)",
                    "        .map(key => (\"AutoCards().API.\" + key + \"()\"))",
                    "    );",
                    "    text = formatMessage(apiKeys.join(\"\\n\"), \"\\n\");",
                    "    log(apiKeys);",
                    "}"),
                description:
                    "// You may also continue your Output code below",
                singleton: false,
                position: 5
            }),
            guide: () => ({
                name: Words.reserved.guide,
                entry: prose(
                    "Any valid JavaScript code you write within the Shared Library or Input/Context/Output Modifier story cards will be executed from top to bottom; Live Script Interface v2 closely emulates AI Dungeon's native scripting environment, even if you aren't the owner of the original scenario. Furthermore, I've provided full access to the Auto-Cards scripting API. Please note that disabling LSIv2 via the \"Configure Auto-Cards\" story card will reset your LSIv2 adventure scripts!",
                    "",
                    "If you aren't familiar with scripting in AI Dungeon, please refer to the official guidebook page:",
                    "https://help.aidungeon.com/scripting",
                    "",
                    "I've included an example script with the four aforementioned code cards, to help showcase some of my fancy schmancy Auto-Cards API functions. Take a look, try some of my example commands, inspect the Console Log, and so on... It's a ton of fun! ❤️",
                    "",
                    "If you ever run out of space in your Library, Input, Context, or Output code cards, simply duplicate whichever one(s) you need and then perform an in-game turn before writing any more code. (emphasis on \"before\") Doing so will signal LSIv2 to convert your duplicated code card(s) into additional auxiliary versions.",
                    "",
                    "Auxiliary code cards are numbered, and any code written within will be appended in sequential order. For example:",
                    "// Shared Library (entry)",
                    "// Shared Library (notes)",
                    "// Shared Library 2 (entry)",
                    "// Shared Library 2 (notes)",
                    "// Shared Library 3 (entry)",
                    "// Shared Library 3 (notes)",
                    "// Input Modifier (entry)",
                    "// Input Modifier (notes)",
                    "// Input Modifier 2 (entry)",
                    "// Input Modifier 2 (notes)",
                    "// And so on..."),
                description:
                    "",
                singleton: true,
                position: 0
            }),
            state: () => ({
                name: Words.reserved.state,
                entry:
                    "Your adventure's full state object is displayed in the Notes section below.",
                description:
                    "",
                singleton: true,
                position: 6
            }),
            log: () => ({
                name: Words.reserved.log,
                entry:
                    "Please refer to the Notes section below to view the full log history for LSIv2. Console log entries are ordered from most recent to oldest. LSIv2 error messages will be recorded here, alongside the outputs of log and console.log function calls within your adventure scripts.",
                description:
                    "",
                singleton: true,
                position: 1
            })
        });
        const cache = {};
        const templates = new Proxy({}, {
            get(_, key) {
                return cache[key] ??= O.f(factories[key]());
            }
        });
        if (AC.config.LSIv2 !== null) {
            switch(HOOK) {
            case "input": {
                // AutoCards was called within the input modifier
                const [libraryCards, inputCards, logCard] = collectCards(
                    templates.library,
                    templates.input,
                    templates.log
                );
                const [error, newText] = isolateLSIv2(parseCode(libraryCards, inputCards), callbackLog(logCard), LSI_DOMAIN);
                handleError(logCard, error);
                if (hadError()) {
                    CODOMAIN.initialize(getStoryError());
                    AC.signal.upstreamError = "\n";
                } else {
                    CODOMAIN.initialize(newText);
                }
                break; }
            case "context": {
                // AutoCards was called within the context modifier
                const [libraryCards, contextCards, logCard] = collectCards(
                    templates.library,
                    templates.context,
                    templates.log,
                    templates.input
                );
                if (hadError()) {
                    endContextLSI(LSI_DOMAIN);
                    break;
                }
                const [error, ...newCodomain] = (([error, newText, newStop]) => [error, newText, (newStop === true)])(
                    isolateLSIv2(parseCode(libraryCards, contextCards), callbackLog(logCard), LSI_DOMAIN[0], LSI_DOMAIN[1])
                );
                handleError(logCard, error);
                endContextLSI(newCodomain);
                function endContextLSI(newCodomain) {
                    CODOMAIN.initialize(newCodomain);
                    if (!newCodomain[1]) {
                        return;
                    }
                    const [guideCard, stateCard] = collectCards(
                        templates.guide,
                        templates.state,
                        templates.output
                    );
                    AC.message.pending = [];
                    concludeLSI(guideCard, stateCard, logCard);
                    return;
                }
                break; }
            case "output": {
                // AutoCards was called within the output modifier
                const [libraryCards, outputCards, guideCard, stateCard, logCard] = collectCards(
                    templates.library,
                    templates.output,
                    templates.guide,
                    templates.state,
                    templates.log
                );
                if (hadError()) {
                    endOutputLSI(true, LSI_DOMAIN);
                    break;
                }
                const [error, newText] = isolateLSIv2(parseCode(libraryCards, outputCards), callbackLog(logCard), LSI_DOMAIN);
                handleError(logCard, error);
                endOutputLSI(hadError(), newText);
                function endOutputLSI(displayError, newText) {
                    if (displayError) {
                        if (AC.signal.upstreamError === "\n") {
                            CODOMAIN.initialize("\n");
                        } else {
                            CODOMAIN.initialize(getStoryError() + "\n");
                        }
                        AC.message.pending = [];
                    } else {
                        CODOMAIN.initialize(newText);
                    }
                    concludeLSI(guideCard, stateCard, logCard);
                    return;
                }
                break; }
            case "initialize": {
                collectAll();
                logToCard(Internal.getCard(card => (card.title === templates.log.name)), "LSIv2 startup -> Success!");
                CODOMAIN.initialize(null);
                break; }
            }
            AC.config.LSIv2 = true;
            function parseCode(...args) {
                return (args
                    .flatMap(cardset => [cardset.primary, ...cardset.auxiliaries])
                    .flatMap(card => [card.entry, card.description])
                    .join("\n")
                );
            }
            function callbackLog(logCard) {
                return function(...args) {
                    logToCard(logCard, ...args);
                    return;
                }
            }
            function handleError(logCard, error) {
                if (!error) {
                    return;
                }
                O.f(error);
                AC.signal.upstreamError = (
                    "LSIv2 encountered an error during the on" + HOOK[0].toUpperCase() + HOOK.slice(1) + " hook"
                );
                if (error.message) {
                    AC.signal.upstreamError += ":\n";
                    if (error.stack) {
                        const stackMatch = error.stack.match(/AutoCards[\s\S]*?:\s*(\d+)\s*:\s*(\d+)/i);
                        if (stackMatch) {
                            AC.signal.upstreamError += (
                                (error.name ?? "Error") + ": " + error.message + "\n" +
                                "(line #" + stackMatch[1] + " column #" + stackMatch[2] + ")"
                            );
                        } else {
                            AC.signal.upstreamError += error.stack;
                        }
                    } else {
                        AC.signal.upstreamError += (error.name ?? "Error") + ": " + error.message;
                    }
                    AC.signal.upstreamError = cleanSpaces(AC.signal.upstreamError.trimEnd());
                }
                logToCard(logCard, AC.signal.upstreamError);
                if (getStateMessage() === AC.signal.upstreamError) {
                    state.message = AC.signal.upstreamError + " ";
                } else {
                    state.message = AC.signal.upstreamError;
                }
                return;
            }
            function hadError() {
                return (AC.signal.upstreamError !== "");
            }
            function getStoryError() {
                return getPrecedingNewlines() + ">>>\n" + AC.signal.upstreamError + "\n<<<\n";
            }
            function concludeLSI(guideCard, stateCard, logCard) {
                AC.signal.upstreamError = "";
                guideCard.description = templates.guide.description;
                guideCard.entry = templates.guide.entry;
                stateCard.entry = templates.state.entry;
                logCard.entry = templates.log.entry;
                postMessages();
                const simpleState = {...state};
                delete simpleState.LSIv2;
                stateCard.description = limitString(stringifyObject(simpleState).trim(), 999999).trimEnd();
                return;
            }
        } else {
            const cardsets = collectAll();
            for (const cardset of cardsets) {
                if ("primary" in cardset) {
                    killCard(cardset.primary);
                    for (const card of cardset.auxiliaries) {
                        killCard(card);
                    }
                } else {
                    killCard(cardset);
                }
                function killCard(card) {
                    unbanTitle(card.title);
                    eraseCard(card);
                }
            }
            AC.signal.upstreamError = "";
            CODOMAIN.initialize(LSI_DOMAIN);
        }
        // This measure ensures the Auto-Cards external API is equally available from within the inner scope of LSIv2
        // As before, call with AutoCards().API.nameOfFunction(yourArguments);
        deepMerge(AC, state.LSIv2);
        delete state.LSIv2;
        function deepMerge(target, source) {
            for (const key in source) {
                if (!source.hasOwnProperty(key)) {
                    continue;
                } else if (
                    (typeof source[key] === "object")
                    && (source[key] !== null)
                    && !Array.isArray(source[key])
                    && (typeof target[key] === "object")
                    && (target[key] !== null)
                    && (key !== "workpiece")
                    && (key !== "associations")
                ) {
                    // Recursively merge static objects
                    deepMerge(target[key], source[key]);
                } else {
                    // Directly replace values
                    target[key] = source[key];
                }
            }
            return;
        }
        function collectAll() {
            return collectCards(...Object.keys(factories).map(key => templates[key]));
        }
        // collectCards constructs, validates, repairs, retrieves, and organizes all LSIv2 script cards associated with the given arguments by iterating over the storyCards array only once! Returned elements are easily handled via array destructuring assignment
        function collectCards(...args) {
            // args: [{name: string, entry: string, description: string, singleton: boolean, position: integer}]
            const collections = O.f(args.map(({name, entry, description, singleton, position}) => {
                const collection = {
                    template: O.f({
                        type: AC.config.defaultCardType,
                        title: name,
                        keys: name,
                        entry,
                        description
                    }),
                    singleton,
                    position,
                    primary: null,
                    excess: [],
                };
                if (!singleton) {
                    collection.auxiliaries = [];
                    collection.occupied = new Set([0, 1]);
                }
                return O.s(collection);
            }));
            for (const card of storyCards) {
                O.s(card);
                for (const collection of collections) {
                    if (
                        !card.title.toLowerCase().includes(collection.template.title.toLowerCase())
                        && !card.keys.toLowerCase().includes(collection.template.title.toLowerCase())
                    ) {
                        // No match, swipe left
                        continue;
                    }
                    if (collection.singleton) {
                        setPrimary();
                        break;
                    }
                    const [extensionA, extensionB] = [card.title, card.keys].map(name => {
                        const extensionMatch = name.replace(/[^a-zA-Z0-9]/g, "").match(/\d+$/);
                        if (extensionMatch) {
                            return parseInt(extensionMatch[0], 10);
                        } else {
                            return -1;
                        }
                    });
                    if (-1 < extensionA) {
                        if (-1 < extensionB) {
                            if (collection.occupied.has(extensionA)) {
                                setAuxiliary(extensionB);
                            } else {
                                setAuxiliary(extensionA, true);
                            }
                        } else {
                            setAuxiliary(extensionA);
                        }
                    } else if (-1 < extensionB) {
                        setAuxiliary(extensionB);
                    } else {
                        setPrimary();
                    }
                    function setAuxiliary(extension, preChecked = false) {
                        if (preChecked || !collection.occupied.has(extension)) {
                            addAuxiliary(card, collection, extension);
                        } else {
                            card.title = card.keys = collection.template.title;
                            collection.excess.push(card);
                        }
                        return;
                    }
                    function setPrimary() {
                        card.title = card.keys = collection.template.title;
                        if (collection.primary === null) {
                            collection.primary = card;
                        } else {
                            collection.excess.push(card);
                        }
                        return;
                    }
                    break;
                }
            }
            for (const collection of collections) {
                banTitle(collection.template.title);
                if (collection.singleton) {
                    if (collection.primary === null) {
                        constructPrimary();
                    } else if (hasExs()) {
                        for (const card of collection.excess) {
                            eraseCard(card);
                        }
                    }
                    continue;
                } else if (collection.primary === null) {
                    if (hasExs()) {
                        collection.primary = collection.excess.shift();
                        if (hasExs() || hasAux()) {
                            applyComment(collection.primary);
                        } else {
                            collection.primary.entry = collection.template.entry;
                            collection.primary.description = collection.template.description;
                            continue;
                        }
                    } else {
                        constructPrimary();
                        if (hasAux()) {
                            applyComment(collection.primary);
                        } else {
                            continue;
                        }
                    }
                }
                if (hasExs()) {
                    for (const card of collection.excess) {
                        let extension = 2;
                        while (collection.occupied.has(extension)) {
                            extension++;
                        }
                        applyComment(card);
                        addAuxiliary(card, collection, extension);
                    }
                }
                if (hasAux()) {
                    collection.auxiliaries.sort((a, b) => {
                        return a.extension - b.extension;
                    });
                }
                function hasExs() {
                    return (0 < collection.excess.length);
                }
                function hasAux() {
                    return (0 < collection.auxiliaries.length);
                }
                function applyComment(card) {
                    card.entry = card.description = "// You may continue writing your code here";
                    return;
                }
                function constructPrimary() {
                    collection.primary = constructCard(collection.template, newCardIndex());
                    // I like my LSIv2 cards to display in the proper order once initialized uwu
                    const templateKeys = Object.keys(factories);
                    const cards = templateKeys.map(key => O.f({
                        card: Internal.getCard(card => (card.title === templates[key].name)),
                        position: templates[key].position
                    })).filter(pair => (pair.card !== null));
                    if (cards.length < templateKeys.length) {
                        return;
                    }
                    const fullCardset = cards.sort((a, b) => (a.position - b.position)).map(pair => pair.card);
                    for (const card of fullCardset) {
                        eraseCard(card);
                        card.title = card.keys;
                    }
                    storyCards.splice(newCardIndex(), 0, ...fullCardset);
                    return;
                }
            }
            function addAuxiliary(card, collection, extension) {
                collection.occupied.add(extension);
                card.title = card.keys = collection.template.title + " " + extension;
                collection.auxiliaries.push({card, extension});
                return;
            }
            return O.f(collections.map(({singleton, primary, auxiliaries}) => {
                if (singleton) {
                    return primary;
                } else {
                    return O.f({primary, auxiliaries: O.f(auxiliaries.map(({card}) => card))});
                }
            }));
        }
    } else if (AC.config.doAC) {
        // Auto-Cards is currently enabled
        // "text" represents the original text which was present before any scripts were executed
        // "TEXT" represents the script-modified version of "text" which AutoCards was called with
        // This dual scheme exists to ensure Auto-Cards is safely compatible with other scripts
        switch(HOOK) {
        case "input": {
            // AutoCards was called within the input modifier
            if ((AC.config.deleteAllAutoCards === false) && /CONFIRM\s*DELETE/i.test(TEXT)) {
                CODOMAIN.initialize("CONFIRM DELETE -> Success!");
            } else if (/\/\s*A\s*C/i.test(text)) {
                CODOMAIN.initialize(doPlayerCommands(text));
            } else if (TEXT.startsWith(" ") && readPastAction(0).text.endsWith("\n")) {
                // Just a simple little formatting bugfix for regular AID story actions
                CODOMAIN.initialize(getPrecedingNewlines() + TEXT.replace(/^\s+/, ""));
            } else {
                CODOMAIN.initialize(TEXT);
            }
            break; }
        case "context": {
            // AutoCards was called within the context modifier
            advanceChronometer();
            // Get or construct the "Configure Auto-Cards" story card
            const configureCardTemplate = getConfigureCardTemplate();
            const configureCard = getSingletonCard(true, configureCardTemplate);
            banTitle(configureCardTemplate.title);
            pinAndSortCards(configureCard);
            const bansOverwritten = (0 < AC.signal.overrideBans);
            if ((configureCard.description !== configureCardTemplate.description) || bansOverwritten) {
                const descConfigPatterns = (getConfigureCardDescription()
                    .split(Words.delimiter)
                    .slice(1)
                    .map(descPattern => (descPattern
                        .slice(0, descPattern.indexOf(":"))
                        .trim()
                        .replace(/\s+/g, "\\s*")
                    ))
                    .map(descPattern => (new RegExp("^\\s*" + descPattern + "\\s*:", "i")))
                );
                const descConfigs = configureCard.description.split(Words.delimiter).slice(1);
                if (
                    (descConfigs.length === descConfigPatterns.length)
                    && descConfigs.every((descConfig, index) => descConfigPatterns[index].test(descConfig))
                ) {
                    // All description config headers must be present and well-formed
                    let cfg = extractDescSetting(0);
                    if (AC.config.generationPrompt !== cfg) {
                        notify("Changes to your card generation prompt were successfully saved");
                        AC.config.generationPrompt = cfg;
                    }
                    cfg = extractDescSetting(1);
                    if (AC.config.compressionPrompt !== cfg) {
                        notify("Changes to your card memory compression prompt were successfully saved");
                        AC.config.compressionPrompt = cfg;
                    }
                    if (bansOverwritten) {
                        overrideBans();
                    } else if ((0 < AC.database.titles.pendingBans.length) || (0 < AC.database.titles.pendingUnbans.length)) {
                        const pendingBans = AC.database.titles.pendingBans.map(pair => pair[0]);
                        const pendingRewrites = new Set(
                            lowArr([...pendingBans, ...AC.database.titles.pendingUnbans.map(pair => pair[0])])
                        );
                        Internal.setBannedTitles([...pendingBans, ...extractDescSetting(2)
                            .split(",")
                            .filter(newBan => !pendingRewrites.has(newBan.toLowerCase().replace(/\s+/, " ").trim()))
                        ], true);
                    } else {
                        Internal.setBannedTitles(extractDescSetting(2).split(","), true);
                    }
                    function extractDescSetting(index) {
                        return descConfigs[index].replace(descConfigPatterns[index], "").trim();
                    }
                } else if (bansOverwritten) {
                    overrideBans();
                }
                configureCard.description = getConfigureCardDescription();
                function overrideBans() {
                    Internal.setBannedTitles(AC.database.titles.pendingBans.map(pair => pair[0]), true);
                    AC.signal.overrideBans = 0;
                    return;
                }
            }
            if (configureCard.entry !== configureCardTemplate.entry) {
                const oldConfig = {};
                const settings = O.f((function() {
                    const userSettings = extractSettings(configureCard.entry);
                    if (userSettings.resetallconfigsettingsandprompts !== true) {
                        return userSettings;
                    }
                    // Reset all config settings and display state change notifications only when appropriate
                    Object.assign(oldConfig, AC.config);
                    Object.assign(AC.config, getDefaultConfig());
                    AC.config.deleteAllAutoCards = oldConfig.deleteAllAutoCards;
                    AC.config.LSIv2 = oldConfig.LSIv2;
                    AC.config.defaultCardType = oldConfig.defaultCardType;
                    AC.database.titles.banned = getDefaultConfigBans();
                    configureCard.description = getConfigureCardDescription();
                    configureCard.entry = getConfigureCardEntry();
                    const defaultSettings = extractSettings(configureCard.entry);
                    if ((DEFAULT_DO_AC === false) || (userSettings.disableautocards === true)) {
                        defaultSettings.disableautocards = true;
                    }
                    notify("Restoring all settings and prompts to their default values");
                    return defaultSettings;
                })());
                O.f(oldConfig);
                if ((settings.deleteallautomaticstorycards === true) && (AC.config.deleteAllAutoCards === null)) {
                    AC.config.deleteAllAutoCards = true;
                } else if (settings.showdetailedguide === true) {
                    AC.signal.outputReplacement = Words.guide;
                }
                let cfg;
                if (parseConfig("pinthisconfigcardnearthetop", false, "pinConfigureCard")) {
                    if (cfg) {
                        pinAndSortCards(configureCard);
                        notify("The settings config card will now be pinned near the top of your story cards list");
                    } else {
                        const index = storyCards.indexOf(configureCard);
                        if (index !== -1) {
                            storyCards.splice(index, 1);
                            storyCards.push(configureCard);
                        }
                        notify("The settings config card will no longer be pinned near the top of your story cards list");
                    }
                }
                if (parseConfig("minimumturnscooldownfornewcards", true, "addCardCooldown")) {
                    const oldCooldown = AC.config.addCardCooldown;
                    AC.config.addCardCooldown = validateCooldown(cfg);
                    if (!isPendingGeneration() && !isAwaitingGeneration() && (0 < AC.generation.cooldown)) {
                        const quarterCooldown = validateCooldown(underQuarterInteger(AC.config.addCardCooldown));
                        if ((AC.config.addCardCooldown < oldCooldown) && (quarterCooldown < AC.generation.cooldown)) {
                            // Reduce the next generation's cooldown counter by a factor of 4
                            // But only if the new cooldown config is lower than it was before
                            // And also only if quarter cooldown is less than the current next gen cooldown
                            // (Just a random little user experience improvement)
                            AC.generation.cooldown = quarterCooldown;
                        } else if (oldCooldown < AC.config.addCardCooldown) {
                            if (oldCooldown === AC.generation.cooldown) {
                                AC.generation.cooldown = AC.config.addCardCooldown;
                            } else {
                                AC.generation.cooldown = validateCooldown(boundInteger(
                                    0,
                                    AC.generation.cooldown + quarterCooldown,
                                    AC.config.addCardCooldown
                                ));
                            }
                        }
                    }
                    switch(AC.config.addCardCooldown) {
                    case 9999: {
                        notify(
                            "You have disabled automatic card generation. To re-enable, simply set your cooldown config to any number lower than 9999. Or use the \"/ac\" in-game command to manually direct the card generation process"
                        );
                        break; }
                    case 1: {
                        notify(
                            "A new card will be generated during alternating game turns, but only if your story contains available titles"
                        );
                        break; }
                    case 0: {
                        notify(
                            "New cards will be immediately generated whenever valid titles exist within your recent story"
                        );
                        break; }
                    default: {
                        notify(
                            "A new card will be generated once every " + AC.config.addCardCooldown + " turns, but only if your story contains available titles"
                        );
                        break; }
                    }
                }
                if (parseConfig("newcardsuseabulletedlistformat", false, "bulletedListMode")) {
                    if (cfg) {
                        notify("New card entries will be generated using a bulleted list format");
                    } else {
                        notify("New card entries will be generated using a pure prose format");
                    }
                }
                if (parseConfig("maximumentrylengthfornewcards", true, "defaultEntryLimit")) {
                    AC.config.defaultEntryLimit = validateEntryLimit(cfg);
                    notify(
                        "New card entries will be limited to " + AC.config.defaultEntryLimit + " characters of generated text"
                    );
                }
                if (parseConfig("newcardsperformmemoryupdates", false, "defaultCardsDoMemoryUpdates")) {
                    if (cfg) {
                        notify("Newly constructed cards will begin with memory updates enabled by default");
                    } else {
                        notify("Newly constructed cards will begin with memory updates disabled by default");
                    }
                }
                if (parseConfig("cardmemorybankpreferredlength", true, "defaultMemoryLimit")) {
                    AC.config.defaultMemoryLimit = validateMemoryLimit(cfg);
                    notify(
                        "Newly constructed cards will begin with their memory bank length preference set to " + AC.config.defaultMemoryLimit + " characters of text"
                    );
                }
                if (parseConfig("memorysummarycompressionratio", true, "memoryCompressionRatio")) {
                    AC.config.memoryCompressionRatio = validateMemCompRatio(cfg);
                    notify(
                        "Freshly summarized card memory banks will be approximately " + (AC.config.memoryCompressionRatio / 10) + "x shorter than their originals"
                    );
                }
                if (parseConfig("excludeallcapsfromtitledetection", false, "ignoreAllCapsTitles")) {
                    if (cfg) {
                        notify("All-caps text will be ignored during title detection to help prevent bad cards");
                    } else {
                        notify("All-caps text may be considered during title detection processes");
                    }
                }
                if (parseConfig("alsodetecttitlesfromplayerinputs", false, "readFromInputs")) {
                    if (cfg) {
                        notify("Titles may be detected from player Do/Say/Story action inputs");
                    } else {
                        notify("Title detection will skip player Do/Say/Story action inputs for grammatical leniency");
                    }
                }
                if (parseConfig("minimumturnsagefortitledetection", true, "minimumLookBackDistance")) {
                    AC.config.minimumLookBackDistance = validateMinLookBackDist(cfg);
                    notify(
                        "Titles and names mentioned in your story may become eligible for future card generation attempts once they are at least " + AC.config.minimumLookBackDistance + " actions old"
                    );
                }
                cfg = settings.uselivescriptinterfacev2;
                if (typeof cfg === "boolean") {
                    if (AC.config.LSIv2 === null) {
                        if (cfg) {
                            AC.config.LSIv2 = true;
                            state.LSIv2 = AC;
                            AutoCards("initialize");
                            notify("Live Script Interface v2 is now embedded within your adventure!");
                        }
                    } else {
                        if (!cfg) {
                            AC.config.LSIv2 = null;
                            notify("Live Script Interface v2 has been removed from your adventure");
                        }
                    }
                }
                if (parseConfig("logdebugdatainaseparatecard" , false, "showDebugData")) {
                    if (data === null) {
                        if (cfg) {
                            notify("State may now be viewed within the \"Debug Data\" story card");
                        } else {
                            notify("The \"Debug Data\" story card has been removed");
                        }
                    } else if (cfg) {
                        notify("Debug data will be shared with the \"Critical Data\" story card to conserve memory");
                    } else {
                        notify("Debug mode has been disabled");
                    }
                }
                if ((settings.disableautocards === true) && (AC.signal.forceToggle !== true)) {
                    disableAutoCards();
                    break;
                } else {
                    // Apply the new card entry and proceed to implement Auto-Cards onContext
                    configureCard.entry = getConfigureCardEntry();
                }
                function parseConfig(settingsKey, isNumber, configKey) {
                    cfg = settings[settingsKey];
                    if (isNumber) {
                        return checkConfig("number");
                    } else if (!checkConfig("boolean")) {
                        return false;
                    }
                    AC.config[configKey] = cfg;
                    function checkConfig(type) {
                        return ((typeof cfg === type) && (
                            (notEmptyObj(oldConfig) && (oldConfig[configKey] !== cfg))
                            || (AC.config[configKey] !== cfg)
                        ));
                    }
                    return true;
                }
            }
            if (AC.signal.forceToggle === false) {
                disableAutoCards();
                break;
            }
            AC.signal.forceToggle = null;
            if (0 < AC.chronometer.postpone) {
                CODOMAIN.initialize(TEXT);
                break;
            }
            // Fully implement Auto-Cards onContext
            const forceStep = AC.signal.recheckRetryOrErase;
            const currentTurn = getTurn();
            const nearestUnparsedAction = boundInteger(0, currentTurn - AC.config.minimumLookBackDistance);
            if (AC.signal.recheckRetryOrErase || (nearestUnparsedAction <= AC.database.titles.lastActionParsed)) {
                // The player erased or retried an unknown number of actions
                // Purge recent candidates and perform a safety recheck
                if (nearestUnparsedAction <= AC.database.titles.lastActionParsed) {
                    AC.signal.recheckRetryOrErase = true;
                } else {
                    AC.signal.recheckRetryOrErase = false;
                }
                AC.database.titles.lastActionParsed = boundInteger(-1, nearestUnparsedAction - 8);
                for (let i = AC.database.titles.candidates.length - 1; 0 <= i; i--) {
                    const candidate = AC.database.titles.candidates[i];
                    for (let j = candidate.length - 1; 0 < j; j--) {
                        if (AC.database.titles.lastActionParsed < candidate[j]) {
                            candidate.splice(j, 1);
                        }
                    }
                    if (candidate.length <= 1) {
                        AC.database.titles.candidates.splice(i, 1);
                    }
                }
            }
            const pendingCandidates = new Map();
            if ((0 < nearestUnparsedAction) && (AC.database.titles.lastActionParsed < nearestUnparsedAction)) {
                const actions = [];
                for (
                    let actionToParse = AC.database.titles.lastActionParsed + 1;
                    actionToParse <= nearestUnparsedAction;
                    actionToParse++
                ) {
                    // I wrote this whilst sleep-deprived, somehow it works
                    const lookBack = currentTurn - actionToParse - (function() {
                        if (isDoSayStory(readPastAction(0).type)) {
                            // Inputs count as 2 actions instead of 1, conditionally offset lookBack by 1
                            return 0;
                        } else {
                            return 1;
                        }
                    })();
                    if (history.length <= lookBack) {
                        // history cannot be indexed with a negative integer
                        continue;
                    }
                    const action = readPastAction(lookBack);
                    const thisTextHash = new StringsHashed(4096).add(action.text).serialize();
                    if (actionToParse === nearestUnparsedAction) {
                        if (AC.signal.recheckRetryOrErase || (thisTextHash === AC.database.titles.lastTextHash)) {
                            // Additional safety to minimize duplicate candidate additions during retries or erases
                            AC.signal.recheckRetryOrErase = true;
                            break;
                        } else {
                            // Action parsing will proceed
                            AC.database.titles.lastActionParsed = nearestUnparsedAction;
                            AC.database.titles.lastTextHash = thisTextHash;
                        }
                    } else if (
                        // Special case where a consecutive retry>erase>continue cancels out
                        AC.signal.recheckRetryOrErase
                        && (actionToParse === (nearestUnparsedAction - 1))
                        && (thisTextHash === AC.database.titles.lastTextHash)
                    ) {
                        AC.signal.recheckRetryOrErase = false;
                    }
                    actions.push([action, actionToParse]);
                }
                if (!AC.signal.recheckRetryOrErase) {
                    for (const [action, turn] of actions) {
                        if (
                            (action.type === "see")
                            || (action.type === "unknown")
                            || (!AC.config.readFromInputs && isDoSayStory(action.type))
                            || /^[^\p{Lu}]*$/u.test(action.text)
                            || action.text.includes("<<<")
                            || /\/\s*A\s*C/i.test(action.text)
                            || /CONFIRM\s*DELETE/i.test(action.text)
                        ) {
                            // Skip see actions
                            // Skip input actions (only if input title detection has been disabled in the config)
                            // Skip strings without capital letters
                            // Skip utility actions
                            continue;
                        }
                        const words = (prettifyEmDashes(action.text)
                            // Nuh uh
                            .replace(/[“”]/g, "\"").replace(/[‘’]/g, "'").replaceAll("´", "`")
                            .replaceAll("。", ".").replaceAll("？", "?").replaceAll("！", "!")
                            // Replace special clause opening punctuation with colon ":" terminators
                            .replace(/(^|\s+)["'`]\s*/g, ": ").replace(/\s*[\(\[{]\s*/g, ": ")
                            // Likewise for end-quotes (curbs a common AI grammar mistake)
                            .replace(/\s*,?\s*["'`](?:\s+|$)/g, ": ")
                            // Replace funky wunky symbols with regular spaces
                            .replace(/[؟،«»¿¡„“…§，、\*_~><\)\]}#"`\s]/g, " ")
                            // Replace some mid-sentence punctuation symbols with a placeholder word
                            .replace(/\s*[—;,\/\\]\s*/g, " %@% ")
                            // Replace "I", "I'm", "I'd", "I'll", and "I've" with a placeholder word
                            .replace(/(?:^|\s+|-)I(?:'(?:m|d|ll|ve))?(?:\s+|-|$)/gi, " %@% ")
                            // Remove "'s" only if not followed by a letter
                            .replace(/'s(?![a-zA-Z])/g, "")
                            // Replace "s'" with "s" only if preceded but not followed by a letter
                            .replace(/(?<=[a-zA-Z])s'(?![a-zA-Z])/g, "s")
                            // Remove apostrophes not between letters (preserve contractions like "don't")
                            .replace(/(?<![a-zA-Z])'(?![a-zA-Z])/g, "")
                            // Remove a leading bullet
                            .replace(/^\s*-+\s*/, "")
                            // Replace common honorifics with a placeholder word
                            .replace(buildKiller(Words.honorifics), " %@% ")
                            // Remove common abbreviations
                            .replace(buildKiller(Words.abbreviations), " ")
                            // Fix end punctuation
                            .replace(/\s+\.(?![a-zA-Z])/g, ".").replace(/\.\.+/g, ".")
                            .replace(/\s+\?(?![a-zA-Z])/g, "?").replace(/\?\?+/g, "?")
                            .replace(/\s+!(?![a-zA-Z])/g, "!").replace(/!!+/g, "!")
                            .replace(/\s+:(?![a-zA-Z])/g, ":").replace(/::+/g, ":")
                            // Colons are treated as substitute end-punctuation, apply the capitalization rule
                            .replace(/:\s+(\S)/g, (_, next) => ": " + next.toUpperCase())
                            // Condense consecutive whitespace
                            .trim().replace(/\s+/g, " ")
                        ).split(" ");
                        if (!Array.isArray(words) || (words.length < 2)) {
                            continue;
                        }
                        const titles = [];
                        const incompleteTitle = [];
                        let previousWordTerminates = true;
                        for (let i = 0; i < words.length; i++) {
                            let word = words[i];
                            if (startsWithTerminator()) {
                                // This word begins on a terminator, push the preexisting incomplete title to titles and proceed with the next sentence's beginning
                                pushTitle();
                                previousWordTerminates = true;
                                // Ensure no leading terminators remain
                                while ((word !== "") && startsWithTerminator()) {
                                    word = word.slice(1);
                                }
                            }
                            if (word === "") {
                                continue;
                            } else if (previousWordTerminates) {
                                // We cannot detect titles from sentence beginnings due to sentence capitalization rules. The previous sentence was recently terminated, implying the current series of capitalized words (plus lowercase minor words) occurs near the beginning of the current sentence
                                if (endsWithTerminator()) {
                                    continue;
                                } else if (startsWithUpperCase()) {
                                    if (isMinorWord(word)) {
                                        // Special case where a capitalized minor word precedes a named entity, clear the previous termination status
                                        previousWordTerminates = false;
                                    }
                                    // Otherwise, proceed without clearing
                                } else if (!isMinorWord(word) && !/^(?:and|&)(?:$|[\.\?!:]$)/.test(word)) {
                                    // Previous sentence termination status is cleared by the first new non-minor lowercase word encountered during forward iteration through the action text's words
                                    previousWordTerminates = false;
                                }
                                continue;
                            }
                            // Words near the beginning of this sentence have been skipped, proceed with named entity detection using capitalization rules. An incomplete title will be pushed to titles if A) a non-minor lowercase word is encountered, B) three consecutive minor words occur in a row, C) a terminator symbol is encountered at the end of a word. Otherwise, continue pushing words to the incomplete title
                            if (endsWithTerminator()) {
                                previousWordTerminates = true;
                                while ((word !== "") && endsWithTerminator()) {
                                    word = word.slice(0, -1);
                                }
                                if (word === "") {
                                    pushTitle();
                                    continue;
                                }
                            }
                            if (isMinorWord(word)) {
                                if (0 < incompleteTitle.length) {
                                    // Titles cannot start with a minor word
                                    if (
                                        (2 < incompleteTitle.length) && !(isMinorWord(incompleteTitle[incompleteTitle.length - 1]) && isMinorWord(incompleteTitle[incompleteTitle.length - 2]))
                                    ) {
                                        // Titles cannot have 3 or more consecutive minor words in a row
                                        pushTitle();
                                        continue;
                                    } else {
                                        // Titles may contain minor words in their middles. Ex: "Ace of Spades"
                                        incompleteTitle.push(word.toLowerCase());
                                    }
                                }
                            } else if (startsWithUpperCase()) {
                                // Add this proper noun to the incomplete title
                                incompleteTitle.push(word);
                            } else {
                                // The full title has a non-minor lowercase word to its immediate right
                                pushTitle();
                                continue;
                            }
                            if (previousWordTerminates) {
                                pushTitle();
                            }
                            function pushTitle() {
                                while (
                                    (1 < incompleteTitle.length)
                                    && isMinorWord(incompleteTitle[incompleteTitle.length - 1])
                                ) {
                                    incompleteTitle.pop();
                                }
                                if (0 < incompleteTitle.length) {
                                    titles.push(incompleteTitle.join(" "));
                                    // Empty the array
                                    incompleteTitle.length = 0;
                                }
                                return;
                            }
                            function isMinorWord(testWord) {
                                return Words.minor.includes(testWord.toLowerCase());
                            }
                            function startsWithUpperCase() {
                                return /^\p{Lu}/u.test(word);
                            }
                            function startsWithTerminator() {
                                return /^[\.\?!:]/.test(word);
                            }
                            function endsWithTerminator() {
                                return /[\.\?!:]$/.test(word);
                            }
                        }
                        for (let i = titles.length - 1; 0 <= i; i--) {
                            titles[i] = formatTitle(titles[i]).newTitle;
                            if (titles[i] === "" || (
                                AC.config.ignoreAllCapsTitles
                                && (2 < titles[i].replace(/[^a-zA-Z]/g, "").length)
                                && (titles[i] === titles[i].toUpperCase())
                            )) {
                                titles.splice(i, 1);
                            }
                        }
                        // Remove duplicates
                        const uniqueTitles = [...new Set(titles)];
                        if (uniqueTitles.length === 0) {
                            continue;
                        } else if (
                            // No reason to keep checking long past the max lookback distance
                            (currentTurn < 256)
                            && (action.type === "start")
                            // This is only used here so it doesn't need its own AC.config property or validation
                            && (DEFAULT_BAN_TITLES_FROM_OPENING !== false)
                        ) {
                            // Titles in the opening prompt are banned by default, hopefully accounting for the player character's name and other established setting details
                            uniqueTitles.forEach(title => banTitle(title));
                        } else {
                            // Schedule new titles for later insertion within the candidates database
                            for (const title of uniqueTitles) {
                                const pendingHashKey = title.toLowerCase();
                                if (pendingCandidates.has(pendingHashKey)) {
                                    // Consolidate pending candidates with matching titles but different turns
                                    pendingCandidates.get(pendingHashKey).turns.push(turn);
                                } else {
                                    pendingCandidates.set(pendingHashKey, O.s({title, turns: [turn]}));
                                }
                            }
                        }
                        function buildKiller(words) {
                            return (new RegExp(("(?:^|\\s+|-)(?:" + (words
                                .map(word => word.replace(".", "\\."))
                                .join("|")
                            ) + ")(?:\\s+|-|$)"), "gi"));
                        }
                    }
                }
            }
            // Measure the minimum and maximum turns of occurance for all title candidates
            let minTurn = currentTurn;
            let maxTurn = 0;
            for (let i = AC.database.titles.candidates.length - 1; 0 <= i; i--) {
                const candidate = AC.database.titles.candidates[i];
                const title = candidate[0];
                if (isUsedOrBanned(title) || isNamed(title)) {
                    // Retroactively ensure AC.database.titles.candidates contains no used / banned titles
                    AC.database.titles.candidates.splice(i, 1);
                } else {
                    const pendingHashKey = title.toLowerCase();
                    if (pendingCandidates.has(pendingHashKey)) {
                        // This candidate title matches one of the pending candidates, collect the pending turns
                        candidate.push(...pendingCandidates.get(pendingHashKey).turns);
                        // Remove this pending candidate
                        pendingCandidates.delete(pendingHashKey);
                    }
                    if (2 < candidate.length) {
                        // Ensure all recorded turns of occurance are unique for this candidate
                        // Sort the turns from least to greatest
                        const sortedTurns = [...new Set(candidate.slice(1))].sort((a, b) => (a - b));
                        if (625 < sortedTurns.length) {
                            sortedTurns.splice(0, sortedTurns.length - 600);
                        }
                        candidate.length = 1;
                        candidate.push(...sortedTurns);
                    }
                    setCandidateTurnBounds(candidate);
                }
            }
            for (const pendingCandidate of pendingCandidates.values()) {
                // Insert any remaining pending candidates (validity has already been ensured)
                const newCandidate = [pendingCandidate.title, ...pendingCandidate.turns];
                setCandidateTurnBounds(newCandidate);
                AC.database.titles.candidates.push(newCandidate);
            }
            const isCandidatesSorted = (function() {
                if (425 < AC.database.titles.candidates.length) {
                    // Sorting a large title candidates database is computationally expensive
                    sortCandidates();
                    AC.database.titles.candidates.splice(400);
                    // Flag this operation as complete for later consideration
                    return true;
                } else {
                    return false;
                }
            })();
            Internal.getUsedTitles();
            for (const titleKey in AC.database.memories.associations) {
                if (isAuto(titleKey)) {
                    // Reset the lifespan counter
                    AC.database.memories.associations[titleKey][0] = 999;
                } else if (AC.database.memories.associations[titleKey][0] < 1) {
                    // Forget this set of memory associations
                    delete AC.database.memories.associations[titleKey];
                } else if (!isAwaitingGeneration()) {
                    // Decrement the lifespan counter
                    AC.database.memories.associations[titleKey][0]--;
                }
            }
            // This copy of TEXT may be mutated
            let context = TEXT;
            const titleHeaderPatternGlobal = /\s*{\s*titles?\s*:\s*([\s\S]*?)\s*}\s*/gi;
            // Card events govern the parsing of memories from raw context as well as card memory bank injection
            const cardEvents = (function() {
                // Extract memories from the initial text (not TEXT as called from within the context modifier!)
                const contextMemories = (function() {
                    const memoriesMatch = text.match(/Memories\s*:\s*([\s\S]*?)\s*(?:Recent\s*Story\s*:|$)/i);
                    if (!memoriesMatch) {
                        return new Set();
                    }
                    const uniqueMemories = new Set(isolateMemories(memoriesMatch[1]));
                    if (uniqueMemories.size === 0) {
                        return uniqueMemories;
                    }
                    const duplicatesHashed = StringsHashed.deserialize(AC.database.memories.duplicates, 65536);
                    const duplicateMemories = new Set();
                    const seenMemories = new Set();
                    for (const memoryA of uniqueMemories) {
                        if (duplicatesHashed.has(memoryA)) {
                            // Remove to ensure the insertion order for this duplicate changes
                            duplicatesHashed.remove(memoryA);
                            duplicateMemories.add(memoryA);
                        } else if ((function() {
                            for (const memoryB of seenMemories) {
                                if (0.42 < similarityScore(memoryA, memoryB)) {
                                    // This memory is too similar to another memory
                                    duplicateMemories.add(memoryA);
                                    return false;
                                }
                            }
                            return true;
                        })()) {
                            seenMemories.add(memoryA);
                        }
                    }
                    if (0 < duplicateMemories.size) {
                        // Add each near duplicate's hashcode to AC.database.memories.duplicates
                        // Then remove duplicates from uniqueMemories and the context window
                        for (const duplicate of duplicateMemories) {
                            duplicatesHashed.add(duplicate);
                            uniqueMemories.delete(duplicate);
                            context = context.replaceAll("\n" + duplicate, "");
                        }
                        // Only the 2000 most recent duplicate memory hashcodes are remembered
                        AC.database.memories.duplicates = duplicatesHashed.latest(2000).serialize();
                    }
                    return uniqueMemories;
                })();
                const leftBoundary = "^|\\s|\"|'|—|\\(|\\[|{";
                const rightBoundary = "\\s|\\.|\\?|!|,|;|\"|'|—|\\)|\\]|}|$";
                // Murder, homicide if you will, nothing to see here
                const theKiller = new RegExp("(?:" + leftBoundary + ")the[\\s\\S]*$", "i");
                const peerageKiller = new RegExp((
                    "(?:" + leftBoundary + ")(?:" + Words.peerage.join("|") + ")(?:" + rightBoundary + ")"
                ), "gi");
                const events = new Map();
                for (const contextMemory of contextMemories) {
                    for (const titleKey of auto) {
                        if (!(new RegExp((
                            "(?<=" + leftBoundary + ")" + (titleKey
                                .replace(theKiller, "")
                                .replace(peerageKiller, "")
                                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                            ) + "(?=" + rightBoundary + ")"
                        ), "i")).test(contextMemory)) {
                            continue;
                        }
                        // AC card titles found in active memories will promote card events
                        if (events.has(titleKey)) {
                            events.get(titleKey).pendingMemories.push(contextMemory);
                            continue;
                        }
                        events.set(titleKey, O.s({
                            pendingMemories: [contextMemory],
                            titleHeader: ""
                        }));
                    }
                }
                const titleHeaderMatches = [...context.matchAll(titleHeaderPatternGlobal)];
                for (const [titleHeader, title] of titleHeaderMatches) {
                    if (!isAuto(title)) {
                        continue;
                    }
                    // Unique title headers found in context will promote card events
                    const titleKey = title.toLowerCase();
                    if (events.has(titleKey)) {
                        events.get(titleKey).titleHeader = titleHeader;
                        continue;
                    }
                    events.set(titleKey, O.s({
                        pendingMemories: [],
                        titleHeader: titleHeader
                    }));
                }
                return events;
            })();
            // Remove auto card title headers from active story card entries and contextualize their respective memory banks
            // Also handle the growth and maintenance of card memory banks
            let isRemembering = false;
            for (const card of storyCards) {
                // Iterate over each card to handle pending card events and forenames/surnames
                const titleHeaderMatcher = /^{title: \s*([\s\S]*?)\s*}/;
                let breakForCompression = isPendingCompression();
                if (breakForCompression) {
                    break;
                } else if (!card.entry.startsWith("{title: ")) {
                    continue;
                } else if (exceedsMemoryLimit()) {
                    const titleHeaderMatch = card.entry.match(titleHeaderMatcher);
                    if (titleHeaderMatch && isAuto(titleHeaderMatch[1])) {
                        prepareMemoryCompression(titleHeaderMatch[1].toLowerCase());
                        break;
                    }
                }
                // Handle card events
                const lowerEntry = card.entry.toLowerCase();
                for (const titleKey of cardEvents.keys()) {
                    if (!lowerEntry.startsWith("{title: " + titleKey + "}")) {
                        continue;
                    }
                    const cardEvent = cardEvents.get(titleKey);
                    if (
                        (0 < cardEvent.pendingMemories.length)
                        && /{\s*updates?\s*:\s*true\s*,\s*limits?\s*:[\s\S]*?}/i.test(card.description)
                    ) {
                        // Add new card memories
                        const associationsHashed = (function() {
                            if (titleKey in AC.database.memories.associations) {
                                return StringsHashed.deserialize(AC.database.memories.associations[titleKey][1], 65536);
                            } else {
                                AC.database.memories.associations[titleKey] = [999, ""];
                                return new StringsHashed(65536);
                            }
                        })();
                        const oldMemories = isolateMemories(extractCardMemories().text);
                        for (let i = 0; i < cardEvent.pendingMemories.length; i++) {
                            if (associationsHashed.has(cardEvent.pendingMemories[i])) {
                                // Remove first to alter the insertion order
                                associationsHashed.remove(cardEvent.pendingMemories[i]);
                            } else if (!oldMemories.some(oldMemory => (
                                (0.8 < similarityScore(oldMemory, cardEvent.pendingMemories[i]))
                            ))) {
                                // Ensure no near-duplicate memories are appended
                                card.description += "\n- " + cardEvent.pendingMemories[i];
                            }
                            associationsHashed.add(cardEvent.pendingMemories[i]);
                        }
                        AC.database.memories.associations[titleKey][1] = associationsHashed.latest(3500).serialize();
                        if (associationsHashed.size() === 0) {
                            delete AC.database.memories.associations[titleKey];
                        }
                        if (exceedsMemoryLimit()) {
                            breakForCompression = prepareMemoryCompression(titleKey);
                            break;
                        }
                    }
                    if (cardEvent.titleHeader !== "") {
                        // Replace this card's title header in context
                        const cardMemoriesText = extractCardMemories().text;
                        if (cardMemoriesText === "") {
                            // This card contains no card memories to contextualize
                            context = context.replace(cardEvent.titleHeader, "\n\n");
                        } else {
                            // Insert card memories within context and ensure they occur uniquely
                            const cardMemories = cardMemoriesText.split("\n").map(cardMemory => cardMemory.trim());
                            for (const cardMemory of cardMemories) {
                                if (25 < cardMemory.length) {
                                    context = (context
                                        .replaceAll(cardMemory, "<#>")
                                        .replaceAll(cardMemory.replace(/^-+\s*/, ""), "<#>")
                                    );
                                }
                            }
                            context = context.replace(cardEvent.titleHeader, (
                                "\n\n{%@MEM@%" + cardMemoriesText + "%@MEM@%}\n"
                            ));
                            isRemembering = true;
                        }
                    }
                    cardEvents.delete(titleKey);
                    break;
                }
                if (breakForCompression) {
                    break;
                }
                // Simplify auto-card titles which contain an obvious surname
                const titleHeaderMatch = card.entry.match(titleHeaderMatcher);
                if (!titleHeaderMatch) {
                    continue;
                }
                const [oldTitleHeader, oldTitle] = titleHeaderMatch;
                if (!isAuto(oldTitle)) {
                    continue;
                }
                const surname = isNamed(oldTitle, true);
                if (typeof surname !== "string") {
                    continue;
                }
                const newTitle = oldTitle.replace(" " + surname, "");
                const [oldTitleKey, newTitleKey] = [oldTitle, newTitle].map(title => title.toLowerCase());
                if (oldTitleKey === newTitleKey) {
                    continue;
                }
                // Preemptively mitigate some global state considered within the formatTitle scope
                clearTransientTitles();
                AC.database.titles.used = ["%@%"];
                [used, forenames, surnames].forEach(nameset => nameset.add("%@%"));
                // Premature optimization is the root of all evil
                const newKey = formatTitle(newTitle).newKey;
                clearTransientTitles();
                if (newKey === "") {
                    Internal.getUsedTitles();
                    continue;
                }
                if (oldTitleKey in AC.database.memories.associations) {
                    AC.database.memories.associations[newTitleKey] = AC.database.memories.associations[oldTitleKey];
                    delete AC.database.memories.associations[oldTitleKey];
                }
                if (AC.compression.titleKey === oldTitleKey) {
                    AC.compression.titleKey = newTitleKey;
                }
                card.entry = card.entry.replace(oldTitleHeader, oldTitleHeader.replace(oldTitle, newTitle));
                card.keys = buildKeys(card.keys.replaceAll(" " + surname, ""), newKey);
                Internal.getUsedTitles();
                function exceedsMemoryLimit() {
                    return ((function() {
                        const memoryLimitMatch = card.description.match(/limits?\s*:\s*(\d+)\s*}/i);
                        if (memoryLimitMatch) {
                            return validateMemoryLimit(parseInt(memoryLimitMatch[1], 10));
                        } else {
                            return AC.config.defaultMemoryLimit;
                        }
                    })() < (function() {
                        const cardMemories = extractCardMemories();
                        if (cardMemories.missing) {
                            return card.description;
                        } else {
                            return cardMemories.text;
                        }
                    })().length);
                }
                function prepareMemoryCompression(titleKey) {
                    AC.compression.oldMemoryBank = isolateMemories(extractCardMemories().text);
                    if (AC.compression.oldMemoryBank.length === 0) {
                        return false;
                    }
                    AC.compression.completed = 0;
                    AC.compression.titleKey = titleKey;
                    AC.compression.vanityTitle = cleanSpaces(card.title.trim());
                    AC.compression.responseEstimate = (function() {
                        const responseEstimate = estimateResponseLength();
                        if (responseEstimate === -1) {
                            return 1400
                        } else {
                            return responseEstimate;
                        }
                    })();
                    AC.compression.lastConstructIndex = -1;
                    AC.compression.newMemoryBank = [];
                    return true;
                }
                function extractCardMemories() {
                    const memoryHeaderMatch = card.description.match(
                        /(?<={\s*updates?\s*:[\s\S]*?,\s*limits?\s*:[\s\S]*?})[\s\S]*$/i
                    );
                    if (memoryHeaderMatch) {
                        return O.f({missing: false, text: cleanSpaces(memoryHeaderMatch[0].trim())});
                    } else {
                        return O.f({missing: true, text: ""});
                    }
                }
            }
            // Remove repeated memories plus any remaining title headers
            context = (context
                .replace(/(\s*<#>\s*)+/g, "\n")
                .replace(titleHeaderPatternGlobal, "\n\n")
                .replace(/World\s*Lore\s*:\s*/i, "World Lore:\n")
                .replace(/Memories\s*:\s*(?=Recent\s*Story\s*:|$)/i, "")
            );
            // Prompt the AI to generate a new card entry, compress an existing card's memories, or continue the story
            let isGenerating = false;
            let isCompressing = false;
            if (isPendingGeneration()) {
                promptGeneration();
            } else if (isAwaitingGeneration()) {
                AC.generation.workpiece = AC.generation.pending.shift();
                promptGeneration();
            } else if (isPendingCompression()) {
                promptCompression();
            } else if (AC.signal.recheckRetryOrErase) {
                // Do nothing 😜
            } else if ((AC.generation.cooldown <= 0) && (0 < AC.database.titles.candidates.length)) {
                // Prepare to automatically construct a new plot-relevant story card by selecting a title
                let selectedTitle = (function() {
                    if (AC.database.titles.candidates.length === 1) {
                        return AC.database.titles.candidates[0][0];
                    } else if (!isCandidatesSorted) {
                        sortCandidates();
                    }
                    const mostRelevantTitle = AC.database.titles.candidates[0][0];
                    if ((AC.database.titles.candidates.length < 16) || (Math.random() < 0.6667)) {
                        // Usually, 2/3 of the time, the most relevant title is selected
                        return mostRelevantTitle;
                    }
                    // Occasionally (1/3 of the time once the candidates databases has at least 16 titles) make a completely random selection between the top 4 most recently occuring title candidates which are NOT the top 2 most relevant titles. Note that relevance !== recency
                    // This gives non-character titles slightly better odds of being selected for card generation due to the relevance sorter's inherent bias towards characters; they tend to appear far more often in prose
                    return (AC.database.titles.candidates
                        // Create a shallow copy to avoid modifying AC.database.titles.candidates itself
                        // Add index to preserve original positions whenever ties occur during sorting
                        .map((candidate, index) => ({candidate, index}))
                        // Sort by each candidate's most recent turn
                        .sort((a, b) => {
                            const turnDiff = b.candidate[b.candidate.length - 1] - a.candidate[a.candidate.length - 1];
                            if (turnDiff === 0) {
                                // Don't change indices in the case of a tie
                                return (a.index - b.index);
                            } else {
                                // No tie here, sort by recency
                                return turnDiff;
                            }
                        })
                        // Get the top 6 most recent titles (4 + 2 because the top 2 relevant titles may be present)
                        .slice(0, 6)
                        // Extract only the title names
                        .map(element => element.candidate[0])
                        // Exclude the top 2 most relevant titles
                        .filter(title => ((title !== mostRelevantTitle) && (title !== AC.database.titles.candidates[1][0])))
                        // Ensure only 4 titles remain
                        .slice(0, 4)
                    )[Math.floor(Math.random() * 4)];
                })();
                while (!Internal.generateCard(O.f({title: selectedTitle}))) {
                    // This is an emergency precaution, I don't expect the interior of this while loop to EVER execute
                    // That said, it's crucial for the while condition be checked at least once, because Internal.generateCard appends an element to AC.generation.pending as a side effect
                    const lowerSelectedTitle = formatTitle(selectedTitle).newTitle.toLowerCase();
                    const index = AC.database.titles.candidates.findIndex(candidate => {
                        return (formatTitle(candidate[0]).newTitle.toLowerCase() === lowerSelectedTitle);
                    });
                    if (index === -1) {
                        // Should be impossible
                        break;
                    }
                    AC.database.titles.candidates.splice(index, 1);
                    if (AC.database.titles.candidates.length === 0) {
                        break;
                    }
                    selectedTitle = AC.database.titles.candidates[0][0];
                }
                if (isAwaitingGeneration()) {
                    // Assign the workpiece so card generation may fully commence!
                    AC.generation.workpiece = AC.generation.pending.shift();
                    promptGeneration();
                } else if (isPendingCompression()) {
                    promptCompression();
                }
            } else if (
                (AC.chronometer.step || forceStep)
                && (0 < AC.generation.cooldown)
                && (AC.config.addCardCooldown !== 9999)
            ) {
                AC.generation.cooldown--;
            }
            if (shouldTrimContext()) {
                // Truncate context based on AC.signal.maxChars, begin by individually removing the oldest sentences from the recent story portion of the context window
                const recentStoryPattern = /Recent\s*Story\s*:\s*([\s\S]*?)(%@GEN@%|%@COM@%|\s\[\s*Author's\s*note\s*:|$)/i;
                const recentStoryMatch = context.match(recentStoryPattern);
                if (recentStoryMatch) {
                    const recentStory = recentStoryMatch[1];
                    let sentencesJoined = recentStory;
                    // Split by the whitespace chars following each sentence (without consuming)
                    const sentences = splitBySentences(recentStory);
                    // [minimum num of story sentences] = ([max chars for context] / 6) / [average chars per sentence]
                    const sentencesMinimum = Math.ceil(
                        (AC.signal.maxChars / 6) / (
                            boundInteger(1, context.length) / boundInteger(1, sentences.length)
                        )
                    ) + 1;
                    do {
                        if (sentences.length < sentencesMinimum) {
                            // A minimum of n many recent story sentences must remain
                            // Where n represents a sentence count equal to roughly 16.7% of the full context chars
                            break;
                        }
                        // Remove the first (oldest) recent story sentence
                        sentences.shift();
                        // Check if the total length exceeds the AC.signal.maxChars limit
                        sentencesJoined = sentences.join("");
                    } while (AC.signal.maxChars < (context.length - recentStory.length + sentencesJoined.length + 3));
                    // Rebuild the context with the truncated recentStory
                    context = context.replace(recentStoryPattern, "Recent Story:\n" + sentencesJoined + recentStoryMatch[2]);
                }
                if (isRemembering && shouldTrimContext()) {
                    // Next remove loaded card memories (if any) with top-down priority, one card at a time
                    do {
                        // This matcher relies on its case-sensitivity
                        const cardMemoriesMatch = context.match(/{%@MEM@%([\s\S]+?)%@MEM@%}/);
                        if (!cardMemoriesMatch) {
                            break;
                        }
                        context = context.replace(cardMemoriesMatch[0], (cardMemoriesMatch[0]
                            .replace(cardMemoriesMatch[1], "")
                            // Set the MEM tags to lowercase to avoid repeated future matches
                            .toLowerCase()
                        ));
                    } while (AC.signal.maxChars < (context.length + 3));
                }
                if (shouldTrimContext()) {
                    // If the context is still too long, just trim from the beginning I guess 🤷‍♀️
                    context = context.slice(context.length - AC.signal.maxChars + 1);
                }
            }
            if (isRemembering) {
                // Card memory flags serve no further purpose
                context = (context
                    // Case-insensitivity is crucial here
                    .replace(/(?<={%@MEM@%)\s*/gi, "")
                    .replace(/\s*(?=%@MEM@%})/gi, "")
                    .replace(/{%@MEM@%%@MEM@%}\s?/gi, "")
                    .replaceAll("{%@MEM@%", "{ Memories:\n")
                    .replaceAll("%@MEM@%}", " }")
                );
            }
            if (isGenerating) {
                // Likewise for the card entry generation delimiter
                context = context.replaceAll("%@GEN@%", "");
            } else if (isCompressing) {
                // Or the (mutually exclusive) card memory compression delimiter
                context = context.replaceAll("%@COM@%", "");
            }
            CODOMAIN.initialize(context);
            function isolateMemories(memoriesText) {
                return (memoriesText
                    .split("\n")
                    .map(memory => cleanSpaces(memory.trim().replace(/^-+\s*/, "")))
                    .filter(memory => (memory !== ""))
                );
            }
            function isAuto(title) {
                return auto.has(title.toLowerCase());
            }
            function promptCompression() {
                isGenerating = false;
                const cardEntryText = (function() {
                    const card = getAutoCard(AC.compression.titleKey);
                    if (card === null) {
                        return null;
                    }
                    const entryLines = formatEntry(card.entry).trimEnd().split("\n");
                    if (Object.is(entryLines[0].trim(), "")) {
                        return "";
                    }
                    for (let i = 0; i < entryLines.length; i++) {
                        entryLines[i] = entryLines[i].trim();
                        if (/[a-zA-Z]$/.test(entryLines[i])) {
                            entryLines[i] += ".";
                        }
                        entryLines[i] += " ";
                    }
                    return entryLines.join("");
                })();
                if (cardEntryText === null) {
                    // Safety measure
                    resetCompressionProperties();
                    return;
                }
                repositionAN();
                // The "%COM%" substring serves as a temporary delimiter for later context length trucation
                context = context.trimEnd() + "\n\n" + cardEntryText + (
                    [...AC.compression.newMemoryBank, ...AC.compression.oldMemoryBank].join(" ")
                ) + "%@COM@%\n\n" + (function() {
                    const memoryConstruct = (function() {
                        if (AC.compression.lastConstructIndex === -1) {
                            for (let i = 0; i < AC.compression.oldMemoryBank.length; i++) {
                                AC.compression.lastConstructIndex = i;
                                const memoryConstruct = buildMemoryConstruct();
                                if ((
                                    (AC.config.memoryCompressionRatio / 10) * AC.compression.responseEstimate
                                ) < memoryConstruct.length) {
                                    return memoryConstruct;
                                }
                            }
                        } else {
                            // The previous card memory compression attempt produced a bad output
                            AC.compression.lastConstructIndex = boundInteger(
                                0, AC.compression.lastConstructIndex + 1, AC.compression.oldMemoryBank.length - 1
                            );
                        }
                        return buildMemoryConstruct();
                    })();
                    // Fill all %{title} placeholders
                    const precursorPrompt = insertTitle(AC.config.compressionPrompt, AC.compression.vanityTitle).trim();
                    const memoryPlaceholderPattern = /(?:[%\$]+\s*|[%\$]*){+\s*memor(y|ies)\s*}+/gi;
                    if (memoryPlaceholderPattern.test(precursorPrompt)) {
                        // Fill all %{memory} placeholders with a selection of pending old memories
                        return precursorPrompt.replace(memoryPlaceholderPattern, memoryConstruct);
                    } else {
                        // Append the partial entry to the end of context
                        return precursorPrompt + "\n\n" + memoryConstruct;
                    }
                })() + "\n\n";
                isCompressing = true;
                return;
            }
            function promptGeneration() {
                repositionAN();
                // All %{title} placeholders were already filled during this workpiece's initialization
                // The "%GEN%" substring serves as a temporary delimiter for later context length trucation
                context = context.trimEnd() + "%@GEN@%\n\n" + (function() {
                    // For context only, remove the title header from this workpiece's partially completed entry
                    const partialEntry = formatEntry(AC.generation.workpiece.entry);
                    const entryPlaceholderPattern = /(?:[%\$]+\s*|[%\$]*){+\s*entry\s*}+/gi;
                    if (entryPlaceholderPattern.test(AC.generation.workpiece.prompt)) {
                        // Fill all %{entry} placeholders with the partial entry
                        return AC.generation.workpiece.prompt.replace(entryPlaceholderPattern, partialEntry);
                    } else {
                        // Append the partial entry to the end of context
                        return AC.generation.workpiece.prompt.trimEnd() + "\n\n" + partialEntry;
                    }
                })();
                isGenerating = true;
                return;
            }
            function repositionAN() {
                // Move the Author's Note further back in context during card generation (should still be considered)
                const authorsNotePattern = /\s*(\[\s*Author's\s*note\s*:[\s\S]*\])\s*/i;
                const authorsNoteMatch = context.match(authorsNotePattern);
                if (!authorsNoteMatch) {
                    return;
                }
                const leadingSpaces = context.match(/^\s*/)[0];
                context = context.replace(authorsNotePattern, " ").trimStart();
                const recentStoryPattern = /\s*Recent\s*Story\s*:\s*/i;
                if (recentStoryPattern.test(context)) {
                    // Remove author's note from its original position and insert above "Recent Story:\n"
                    context = (context
                        .replace(recentStoryPattern, "\n\n" + authorsNoteMatch[1] + "\n\nRecent Story:\n")
                        .trimStart()
                    );
                } else {
                    context = authorsNoteMatch[1] + "\n\n" + context;
                }
                context = leadingSpaces + context;
                return;
            }
            function sortCandidates() {
                if (AC.database.titles.candidates.length < 2) {
                    return;
                }
                const turnRange = boundInteger(1, maxTurn - minTurn);
                const recencyExponent = Math.log10(turnRange) + 1.85;
                // Sort the database of available title candidates by relevance
                AC.database.titles.candidates.sort((a, b) => {
                    return relevanceScore(b) - relevanceScore(a);
                });
                function relevanceScore(candidate) {
                    // weight = (((turn - minTurn) / (maxTurn - minTurn)) + 1)^(log10(maxTurn - minTurn) + 1.85)
                    return candidate.slice(1).reduce((sum, turn) => {
                        // Apply exponential scaling to give far more weight to recent turns
                        return sum + Math.pow((
                            // The recency weight's exponent scales by log10(turnRange) + 1.85
                            // Shhh don't question it 😜
                            ((turn - minTurn) / turnRange) + 1
                        ), recencyExponent);
                    }, 0);
                }
                return;
            }
            function shouldTrimContext() {
                return (AC.signal.maxChars <= context.length);
            }
            function setCandidateTurnBounds(candidate) {
                // candidate: ["Example Title", 0, 1, 2, 3]
                minTurn = boundInteger(0, minTurn, candidate[1]);
                maxTurn = boundInteger(candidate[candidate.length - 1], maxTurn);
                return;
            }
            function disableAutoCards() {
                AC.signal.forceToggle = null;
                // Auto-Cards has been disabled
                AC.config.doAC = false;
                // Deconstruct the "Configure Auto-Cards" story card
                unbanTitle(configureCardTemplate.title);
                eraseCard(configureCard);
                // Signal the construction of "Edit to enable Auto-Cards" during the next onOutput hook
                AC.signal.swapControlCards = true;
                // Post a success message
                notify("Disabled! Use the \"Edit to enable Auto-Cards\" story card to undo");
                CODOMAIN.initialize(TEXT);
                return;
            }
            break; }
        case "output": {
            // AutoCards was called within the output modifier
            const output = prettifyEmDashes(TEXT);
            if (0 < AC.chronometer.postpone) {
                // Do not capture or replace any outputs during this turn
                promoteAmnesia();
                if (permitOutput()) {
                    CODOMAIN.initialize(output);
                }
            } else if (AC.signal.swapControlCards) {
                if (permitOutput()) {
                    CODOMAIN.initialize(output);
                }
            } else if (isPendingGeneration()) {
                const textClone = prettifyEmDashes(text);
                AC.chronometer.amnesia = 0;
                AC.generation.completed++;
                const generationsRemaining = (function() {
                    if (
                        textClone.includes("\"")
                        || /(?<=^|\s|—|\(|\[|{)sa(ys?|id)(?=\s|\.|\?|!|,|;|—|\)|\]|}|$)/i.test(textClone)
                    ) {
                        // Discard full outputs containing "say" or quotations
                        // To build coherent entries, the AI must not attempt to continue the story
                        return skip(estimateRemainingGens());
                    }
                    const oldSentences = (splitBySentences(formatEntry(AC.generation.workpiece.entry))
                        .map(sentence => sentence.trim())
                        .filter(sentence => (2 < sentence.length))
                    );
                    const seenSentences = new Set();
                    const entryAddition = splitBySentences(textClone
                        .replace(/[\*_~]/g, "")
                        .replace(/:+/g, "#")
                        .replace(/\s+/g, " ")
                    ).map(sentence => (sentence
                        .trim()
                        .replace(/^-+\s*/, "")
                    )).filter(sentence => (
                        // Remove empty strings
                        (sentence !== "")
                        // Remove colon ":" headers or other stinky symbols because me no like 😠
                        && !/[#><@]/.test(sentence)
                        // Remove previously repeated sentences
                        && !oldSentences.some(oldSentence => (0.75 < similarityScore(oldSentence, sentence)))
                        // Remove repeated sentences from within entryAddition itself
                        && ![...seenSentences].some(seenSentence => (0.75 < similarityScore(seenSentence, sentence)))
                        // Simply ensure this sentence is henceforth unique
                        && seenSentences.add(sentence)
                    )).join(" ").trim() + " ";
                    if (entryAddition === " ") {
                        return skip(estimateRemainingGens());
                    } else if (
                        /^{title:[\s\S]*?}$/.test(AC.generation.workpiece.entry.trim())
                        && (AC.generation.workpiece.entry.length < 111)
                    ) {
                        AC.generation.workpiece.entry += "\n" + entryAddition;
                    } else {
                        AC.generation.workpiece.entry += entryAddition;
                    }
                    if (AC.generation.workpiece.limit < AC.generation.workpiece.entry.length) {
                        let exit = false;
                        let truncatedEntry = AC.generation.workpiece.entry.trimEnd();
                        const sentences = splitBySentences(truncatedEntry);
                        for (let i = sentences.length - 1; 0 <= i; i--) {
                            if (!sentences[i].includes("\n")) {
                                sentences.splice(i, 1);
                                truncatedEntry = sentences.join("").trimEnd();
                                if (truncatedEntry.length <= AC.generation.workpiece.limit) {
                                    break;
                                }
                                continue;
                            }
                            // Lines only matter for initial entries provided via AutoCards().API.generateCard
                            const lines = sentences[i].split("\n");
                            for (let j = lines.length - 1; 0 <= j; j--) {
                                lines.splice(j, 1);
                                sentences[i] = lines.join("\n");
                                truncatedEntry = sentences.join("").trimEnd();
                                if (truncatedEntry.length <= AC.generation.workpiece.limit) {
                                    // Exit from both loops
                                    exit = true;
                                    break;
                                }
                            }
                            if (exit) {
                                break;
                            }
                        }
                        if (truncatedEntry.length < 150) {
                            // Disregard the previous sentence/line-based truncation attempt
                            AC.generation.workpiece.entry = limitString(
                                AC.generation.workpiece.entry, AC.generation.workpiece.limit
                            );
                            // Attempt to remove the last word/fragment
                            truncatedEntry = AC.generation.workpiece.entry.replace(/\s*\S+$/, "");
                            if (150 <= truncatedEntry) {
                                AC.generation.workpiece.entry = truncatedEntry;
                            }
                        } else {
                            AC.generation.workpiece.entry = truncatedEntry;
                        }
                        return 0;
                    } else if ((AC.generation.workpiece.limit - 50) <= AC.generation.workpiece.entry.length) {
                        AC.generation.workpiece.entry = AC.generation.workpiece.entry.trimEnd();
                        return 0;
                    }
                    function skip(remaining) {
                        if (AC.generation.permitted <= AC.generation.completed) {
                            AC.generation.workpiece.entry = AC.generation.workpiece.entry.trimEnd();
                            return 0;
                        }
                        return remaining;
                    }
                    function estimateRemainingGens() {
                        const responseEstimate = estimateResponseLength();
                        if (responseEstimate === -1) {
                            return 1;
                        }
                        const remaining = boundInteger(1, Math.round(
                            (150 + AC.generation.workpiece.limit - AC.generation.workpiece.entry.length) / responseEstimate
                        ));
                        if (AC.generation.permitted === 34) {
                            AC.generation.permitted = boundInteger(6, Math.floor(3.5 * remaining), 32);
                        }
                        return remaining;
                    }
                    return skip(estimateRemainingGens());
                })();
                postOutputMessage(textClone, AC.generation.completed / Math.min(
                    AC.generation.permitted,
                    AC.generation.completed + generationsRemaining
                ));
                if (generationsRemaining <= 0) {
                    notify("\"" + AC.generation.workpiece.title + "\" was successfully added to your story cards!");
                    constructCard(O.f({
                        type: AC.generation.workpiece.type,
                        title: AC.generation.workpiece.title,
                        keys: AC.generation.workpiece.keys,
                        entry: (function() {
                            if (!AC.config.bulletedListMode) {
                                return AC.generation.workpiece.entry;
                            }
                            const sentences = splitBySentences(
                                formatEntry(
                                    AC.generation.workpiece.entry.replace(/\s+/g, " ")
                                ).replace(/:+/g, "#")
                            ).map(sentence => {
                                sentence = (sentence
                                    .replaceAll("#", ":")
                                    .trim()
                                    .replace(/^-+\s*/, "")
                                );
                                if (sentence.length < 12) {
                                    return sentence;
                                } else {
                                    return "\n- " + sentence.replace(/\s*[\.\?!]+$/, "");
                                }
                            });
                            const titleHeader = "{title: " + AC.generation.workpiece.title + "}";
                            if (sentences.every(sentence => (sentence.length < 12))) {
                                const sentencesJoined = sentences.join(" ").trim();
                                if (sentencesJoined === "") {
                                    return titleHeader;
                                } else {
                                    return limitString(titleHeader + "\n" + sentencesJoined, 2000);
                                }
                            }
                            for (let i = sentences.length - 1; 0 <= i; i--) {
                                const bulletedEntry = cleanSpaces(titleHeader + sentences.join(" ")).trimEnd();
                                if (bulletedEntry.length <= 2000) {
                                    return bulletedEntry;
                                }
                                if (sentences.length === 1) {
                                    break;
                                }
                                sentences.splice(i, 1);
                            }
                            return limitString(AC.generation.workpiece.entry, 2000);
                        })(),
                        description: AC.generation.workpiece.description,
                    }), newCardIndex());
                    AC.generation.cooldown = AC.config.addCardCooldown;
                    AC.generation.completed = 0;
                    AC.generation.permitted = 34;
                    AC.generation.workpiece = O.f({});
                    clearTransientTitles();
                }
            } else if (isPendingCompression()) {
                const textClone = prettifyEmDashes(text);
                AC.chronometer.amnesia = 0;
                AC.compression.completed++;
                const compressionsRemaining = (function() {
                    const newMemory = (textClone
                        // Remove some dumb stuff
                        .replace(/^[\s\S]*:/g, "")
                        .replace(/[\*_~#><@\[\]{}`\\]/g, " ")
                        // Remove bullets
                        .trim().replace(/^-+\s*/, "").replace(/\s*-+$/, "").replace(/\s*-\s+/g, " ")
                        // Condense consecutive whitespace
                        .replace(/\s+/g, " ")
                    );
                    if ((AC.compression.oldMemoryBank.length - 1) <= AC.compression.lastConstructIndex) {
                        // Terminate this compression cycle; the memory construct cannot grow any further
                        AC.compression.newMemoryBank.push(newMemory);
                        return 0;
                    } else if ((newMemory.trim() !== "") && (newMemory.length < buildMemoryConstruct().length)) {
                        // Good output, preserve and then proceed onwards
                        AC.compression.oldMemoryBank.splice(0, AC.compression.lastConstructIndex + 1);
                        AC.compression.lastConstructIndex = -1;
                        AC.compression.newMemoryBank.push(newMemory);
                    } else {
                        // Bad output, discard and then try again
                        AC.compression.responseEstimate += 200;
                    }
                    return boundInteger(1, joinMemoryBank(AC.compression.oldMemoryBank).length) / AC.compression.responseEstimate;
                })();
                postOutputMessage(textClone, AC.compression.completed / (AC.compression.completed + compressionsRemaining));
                if (compressionsRemaining <= 0) {
                    const card = getAutoCard(AC.compression.titleKey);
                    if (card === null) {
                        notify(
                            "Failed to apply summarized memories for \"" + AC.compression.vanityTitle + "\" due to a missing or invalid AC card title header!"
                        );
                    } else {
                        const memoryHeaderMatch = card.description.match(
                            /(?<={\s*updates?\s*:[\s\S]*?,\s*limits?\s*:[\s\S]*?})[\s\S]*$/i
                        );
                        if (memoryHeaderMatch) {
                            // Update the card memory bank
                            notify("Memories for \"" + AC.compression.vanityTitle + "\" were successfully summarized!");
                            card.description = card.description.replace(memoryHeaderMatch[0], (
                                "\n" + joinMemoryBank(AC.compression.newMemoryBank)
                            ));
                        } else {
                            notify(
                                "Failed to apply summarizes memories for \"" + AC.compression.vanityTitle + "\" due to a missing or invalid AC card memory header!"
                            );
                        }
                    }
                    resetCompressionProperties();
                } else if (AC.compression.completed === 1) {
                    notify("Summarizing excess memories for \"" + AC.compression.vanityTitle + "\"");
                }
                function joinMemoryBank(memoryBank) {
                    return cleanSpaces("- " + memoryBank.join("\n- "));
                }
            } else if (permitOutput()) {
                CODOMAIN.initialize(output);
            }
            concludeOutputBlock((function() {
                if (AC.signal.swapControlCards) {
                    return getConfigureCardTemplate();
                } else {
                    return null;
                }
            })())
            function postOutputMessage(textClone, ratio) {
                if (!permitOutput()) {
                    // Do nothing
                } else if (0.5 < similarityScore(textClone, output)) {
                    // To improve Auto-Cards' compatability with other scripts, I only bother to replace the output text when the original and new output texts have a similarity score above a particular threshold. Otherwise, I may safely assume the output text has already been replaced by another script and thus skip this step.
                    CODOMAIN.initialize(
                        getPrecedingNewlines() + ">>> please select \"continue\" (" + Math.round(ratio * 100) + "%) <<<\n\n"
                    );
                } else {
                    CODOMAIN.initialize(output);
                }
                return;
            }
            break; }
        default: {
            CODOMAIN.initialize(TEXT);
            break; }
        }
        // Get an individual story card reference via titleKey
        function getAutoCard(titleKey) {
            return Internal.getCard(card => card.entry.toLowerCase().startsWith("{title: " + titleKey + "}"));
        }
        function buildMemoryConstruct() {
            return (AC.compression.oldMemoryBank
                .slice(0, AC.compression.lastConstructIndex + 1)
                .join(" ")
            );
        }
        // Estimate the average AI response char count based on recent continue outputs
        function estimateResponseLength() {
            if (!Array.isArray(history) || (history.length === 0)) {
                return -1;
            }
            const charCounts = [];
            for (let i = 0; i < history.length; i++) {
                const action = readPastAction(i);
                if ((action.type === "continue") && !action.text.includes("<<<")) {
                    charCounts.push(action.text.length);
                }
            }
            if (charCounts.length < 7) {
                if (charCounts.length === 0) {
                    return -1;
                } else if (charCounts.length < 4) {
                    return boundInteger(350, charCounts[0]);
                }
                charCounts.splice(3);
            }
            return boundInteger(175, Math.floor(
                charCounts.reduce((sum, charCount) => {
                    return sum + charCount;
                }, 0) / charCounts.length
            ));
        }
        // Evalute how similar two strings are on the range [0, 1]
        function similarityScore(strA, strB) {
            if (strA === strB) {
                return 1;
            }
            // Normalize both strings for further comparison purposes
            const [cleanA, cleanB] = [strA, strB].map(str => limitString((str
                .replace(/[0-9\s]/g, " ")
                .trim()
                .replace(/  +/g, " ")
                .toLowerCase()
            ), 1400));
            if (cleanA === cleanB) {
                return 1;
            }
            // Compute the Levenshtein distance
            const [lengthA, lengthB] = [cleanA, cleanB].map(str => str.length);
            // I love DP ❤️ (dynamic programming)
            const dp = Array(lengthA + 1).fill(null).map(() => Array(lengthB + 1).fill(0));
            for (let i = 0; i <= lengthA; i++) {
                dp[i][0] = i;
            }
            for (let j = 0; j <= lengthB; j++) {
                dp[0][j] = j;
            }
            for (let i = 1; i <= lengthA; i++) {
                for (let j = 1; j <= lengthB; j++) {
                    if (cleanA[i - 1] === cleanB[j - 1]) {
                        // No cost if chars match, swipe right 😎
                        dp[i][j] = dp[i - 1][j - 1];
                    } else {
                        dp[i][j] = Math.min(
                            // Deletion
                            dp[i - 1][j] + 1,
                            // Insertion
                            dp[i][j - 1] + 1,
                            // Substitution
                            dp[i - 1][j - 1] + 1
                        );
                    }
                }
            }
            // Convert distance to similarity score (1 - (distance / maxLength))
            return 1 - (dp[lengthA][lengthB] / Math.max(lengthA, lengthB));
        }
        function splitBySentences(prose) {
            // Don't split sentences on honorifics or abbreviations such as "Mr.", "Mrs.", "etc."
            return (prose
                .replace(new RegExp("(?<=\\s|\"|\\(|—|\\[|'|{|^)(?:" + ([...Words.honorifics, ...Words.abbreviations]
                    .map(word => word.replace(".", ""))
                    .join("|")
                ) + ")\\.", "gi"), "$1%@%")
                .split(/(?<=[\.\?!:]["\)'\]}]?\s+)(?=[^\p{Ll}\s])/u)
                .map(sentence => sentence.replaceAll("%@%", "."))
            );
        }
        function formatEntry(partialEntry) {
            const cleanedEntry = cleanSpaces(partialEntry
                .replace(/^{title:[\s\S]*?}/, "")
                .replace(/[#><@*_~]/g, "")
                .trim()
            ).replace(/(?<=^|\n)-+\s*/g, "");
            if (cleanedEntry === "") {
                return "";
            } else {
                return cleanedEntry + " ";
            }
        }
        // Resolve malformed em dashes (common AI cliche)
        function prettifyEmDashes(str) {
            return str.replace(/(?<!^\s*)(?: - | ?– ?)(?!\s*$)/g, "—");
        }
        function getConfigureCardTemplate() {
            const names = getControlVariants().configure;
            return O.f({
                type: AC.config.defaultCardType,
                title: names.title,
                keys: names.keys,
                entry: getConfigureCardEntry(),
                description: getConfigureCardDescription()
            });
        }
        function getConfigureCardEntry() {
            return prose(
                "> Auto-Cards automatically creates and updates plot-relevant story cards while you play. You may configure the following settings by replacing \"false\" with \"true\" (and vice versa) or by adjusting numbers for the appropriate settings.",
                "> Disable Auto-Cards: false",
                "> Show detailed guide: false",
                "> Delete all automatic story cards: false",
                "> Reset all config settings and prompts: false",
                "> Pin this config card near the top: " + AC.config.pinConfigureCard,
                "> Minimum turns cooldown for new cards: " + AC.config.addCardCooldown,
                "> New cards use a bulleted list format: " + AC.config.bulletedListMode,
                "> Maximum entry length for new cards: " + AC.config.defaultEntryLimit,
                "> New cards perform memory updates: " + AC.config.defaultCardsDoMemoryUpdates,
                "> Card memory bank preferred length: " + AC.config.defaultMemoryLimit,
                "> Memory summary compression ratio: " + AC.config.memoryCompressionRatio,
                "> Exclude all-caps from title detection: " + AC.config.ignoreAllCapsTitles,
                "> Also detect titles from player inputs: " + AC.config.readFromInputs,
                "> Minimum turns age for title detection: " + AC.config.minimumLookBackDistance,
                "> Use Live Script Interface v2: " + (AC.config.LSIv2 !== null),
                "> Log debug data in a separate card: " + AC.config.showDebugData
            );
        }
        function getConfigureCardDescription() {
            return limitString(O.v(prose(
                Words.delimiter,
                "> AI prompt to generate new cards:",
                limitString(AC.config.generationPrompt.trim(), 4350).trimEnd(),
                Words.delimiter,
                "> AI prompt to summarize card memories:",
                limitString(AC.config.compressionPrompt.trim(), 4350).trimEnd(),
                Words.delimiter,
                "> Titles banned from new card creation:",
                AC.database.titles.banned.join(", ")
            )), 9850);
        }
    } else {
        // Auto-Cards is currently disabled
        switch(HOOK) {
        case "input": {
            if (/\/\s*A\s*C/i.test(text)) {
                CODOMAIN.initialize(doPlayerCommands(text));
            } else {
                CODOMAIN.initialize(TEXT);
            }
            break; }
        case "context": {
            // AutoCards was called within the context modifier
            advanceChronometer();
            // Get or construct the "Edit to enable Auto-Cards" story card
            const enableCardTemplate = getEnableCardTemplate();
            const enableCard = getSingletonCard(true, enableCardTemplate);
            banTitle(enableCardTemplate.title);
            pinAndSortCards(enableCard);
            if (AC.signal.forceToggle) {
                enableAutoCards();
            } else if (enableCard.entry !== enableCardTemplate.entry) {
                if ((extractSettings(enableCard.entry)?.enableautocards === true) && (AC.signal.forceToggle !== false)) {
                    // Use optional chaining to check the existence of enableautocards before accessing its value
                    enableAutoCards();
                } else {
                    // Repair the damaged card entry
                    enableCard.entry = enableCardTemplate.entry;
                }
            }
            AC.signal.forceToggle = null;
            CODOMAIN.initialize(TEXT);
            function enableAutoCards() {
                // Auto-Cards has been enabled
                AC.config.doAC = true;
                // Deconstruct the "Edit to enable Auto-Cards" story card
                unbanTitle(enableCardTemplate.title);
                eraseCard(enableCard);
                // Signal the construction of "Configure Auto-Cards" during the next onOutput hook
                AC.signal.swapControlCards = true;
                // Post a success message
                notify("Enabled! You may now edit the \"Configure Auto-Cards\" story card");
                return;
            }
            break; }
        case "output": {
            // AutoCards was called within the output modifier
            promoteAmnesia();
            if (permitOutput()) {
                CODOMAIN.initialize(TEXT);
            }
            concludeOutputBlock((function() {
                if (AC.signal.swapControlCards) {
                    return getEnableCardTemplate();
                } else {
                    return null;
                }
            })());
            break; }
        default: {
            CODOMAIN.initialize(TEXT);
            break; }
        }
        function getEnableCardTemplate() {
            const names = getControlVariants().enable;
            return O.f({
                type: AC.config.defaultCardType,
                title: names.title,
                keys: names.keys,
                entry: prose(
                    "> Auto-Cards automatically creates and updates plot-relevant story cards while you play. To enable this system, simply edit the \"false\" below to say \"true\" instead!",
                    "> Enable Auto-Cards: false"),
                description: "Perform any Do/Say/Story/Continue action within your adventure to apply this change!"
            });
        }
    }
    function hoistConst() { return (class Const {
        // This helps me debug stuff uwu
        #constant;
        constructor(...args) {
            if (args.length !== 0) {
                this.constructor.#throwError([[(args.length === 1), "Const cannot be instantiated with a parameter"], ["Const cannot be instantiated with parameters"]]);
            } else {
                O.f(this);
                return this;
            }
        }
        declare(...args) {
            if (args.length !== 0) {
                this.constructor.#throwError([[(args.length === 1), "Instances of Const cannot be declared with a parameter"], ["Instances of Const cannot be declared with parameters"]]);
            } else if (this.#constant === undefined) {
                this.#constant = null;
                return this;
            } else if (this.#constant === null) {
                this.constructor.#throwError("Instances of Const cannot be redeclared");
            } else {
                this.constructor.#throwError("Instances of Const cannot be redeclared after initialization");
            }
        }
        initialize(...args) {
            if (args.length !== 1) {
                this.constructor.#throwError([[(args.length === 0), "Instances of Const cannot be initialized without a parameter"], ["Instances of Const cannot be initialized with multiple parameters"]]);
            } else if (this.#constant === null) {
                this.#constant = [args[0]];
                return this;
            } else if (this.#constant === undefined) {
                this.constructor.#throwError("Instances of Const cannot be initialized before declaration");
            } else {
                this.constructor.#throwError("Instances of Const cannot be reinitialized");
            }
        }
        read(...args) {
            if (args.length !== 0) {
                this.constructor.#throwError([[(args.length === 1), "Instances of Const cannot be read with a parameter"], ["Instances of Const cannot read with any parameters"]]);
            } else if (Array.isArray(this.#constant)) {
                return this.#constant[0];
            } else if (this.#constant === null) {
                this.constructor.#throwError("Despite prior declaration, instances of Const cannot be read before initialization");
            } else {
                this.constructor.#throwError("Instances of Const cannot be read before initialization");
            }
        }
        // An error condition is paired with an error message [condition, message], call #throwError with an array of pairs to throw the message corresponding with the first true condition [[cndtn1, msg1], [cndtn2, msg2], [cndtn3, msg3], ...] The first conditionless array element always evaluates to true ('else')
        static #throwError(...args) {
            // Look, I thought I was going to use this more at the time okay
            const [conditionalMessagesTable] = args;
            const codomain = new Const().declare();
            const error = O.f(new Error((function() {
                const codomain = new Const().declare();
                if (Array.isArray(conditionalMessagesTable)) {
                    const chosenPair = conditionalMessagesTable.find(function(...args) {
                        const [pair] = args;
                        const codomain = new Const().declare();
                        if (Array.isArray(pair)) {
                            if ((pair.length === 1) && (typeof pair[0] === "string")) {
                                codomain.initialize(true);
                            } else if (
                                (pair.length === 2)
                                && (typeof pair[0] === "boolean")
                                && (typeof pair[1] === "string")
                            ) {
                                codomain.initialize(pair[0]);
                            } else {
                                Const.#throwError("Const.#throwError encountered an invalid array element of conditionalMessagesTable");
                            }
                        } else {
                            Const.#throwError("Const.#throwError encountered a non-array element within conditionalMessagesTable");
                        }
                        return codomain.read();
                    });
                    if (Array.isArray(chosenPair)) {
                        if (chosenPair.length === 1) {
                            codomain.initialize(chosenPair[0]);
                        } else {
                            codomain.initialize(chosenPair[1]);
                        }
                    } else {
                        codomain.initialize("Const.#throwError was not called with any true conditions");
                    }
                } else if (typeof conditionalMessagesTable === "string") {
                    codomain.initialize(conditionalMessagesTable);
                } else {
                    codomain.initialize("Const.#throwError could not parse the given argument");
                }
                return codomain.read();
            })()));
            if (error.stack) {
                codomain.initialize(error.stack
                    .replace(/\(<isolated-vm>:/gi, "(")
                    .replace(/Error:|at\s*(?:#throwError|Const.(?:declare|initialize|read)|new\s*Const)\s*\(\d+:\d+\)/gi, "")
                    .replace(/AutoCards\s*\((\d+):(\d+)\)\s*at\s*<isolated-vm>:\d+:\d+\s*$/i, "AutoCards ($1:$2)")
                    .trim()
                    .replace(/\s+/g, " ")
                );
            } else {
                codomain.initialize(error.message);
            }
            throw codomain.read();
        }
    }); }
    function hoistO() { return (class O {
        // Some Object class methods are annoyingly verbose for how often I use them 👿
        static f(obj) {
            return Object.freeze(obj);
        }
        static v(base) {
            return see(Words.copy) + base;
        }
        static s(obj) {
            return Object.seal(obj);
        }
    }); }
    function hoistWords() { return (class Words { static #cache = {}; static {
        // Each word list is initialized only once before being cached!
        const wordListInitializers = {
            // Special-cased honorifics which are excluded from titles and ignored during split-by-sentences operations
            honorifics: () => [
                "mr.", "ms.", "mrs.", "dr."
            ],
            // Other special-cased abbreviations used to reformat titles and split-by-sentences
            abbreviations: () => [
                "sr.", "jr.", "etc.", "st.", "ex.", "inc."
            ],
            // Lowercase minor connector words which may exist within titles
            minor: () => [
                "&", "the", "for", "of", "le", "la", "el"
            ],
            // Removed from shortened titles for improved memory detection and trigger keword assignments
            peerage: () => [
                "sir", "lord", "lady", "king", "queen", "majesty", "duke", "duchess", "noble", "royal", "emperor", "empress", "great", "prince", "princess", "count", "countess", "baron", "baroness", "archduke", "archduchess", "marquis", "marquess", "viscount", "viscountess", "consort", "grand", "sultan", "sheikh", "tsar", "tsarina", "czar", "czarina", "viceroy", "monarch", "regent", "imperial", "sovereign", "president", "prime", "minister", "nurse", "doctor", "saint", "general", "private", "commander", "captain", "lieutenant", "sergeant", "admiral", "marshal", "baronet", "emir", "chancellor", "archbishop", "bishop", "cardinal", "abbot", "abbess", "shah", "maharaja", "maharani", "councillor", "squire", "lordship", "ladyship", "monseigneur", "mayor", "princeps", "chief", "chef", "their", "my", "his", "him", "he'd", "her", "she", "she'd", "you", "your", "yours", "you'd", "you've", "you'll", "yourself", "mine", "myself", "highness", "excellency", "farmer", "sheriff", "officer", "detective", "investigator", "miss", "mister", "colonel", "professor", "teacher", "agent", "heir", "heiress", "master", "mistress", "headmaster", "headmistress", "principal", "papa", "mama", "mommy", "daddy", "mother", "father", "grandma", "grandpa", "aunt", "auntie", "aunty", "uncle", "cousin", "sister", "brother", "holy", "holiness", "almighty", "senator", "congressman"
            ],
            // Common named entities represent special-cased INVALID card titles. Because these concepts are already abundant within the AI's training data, generating story cards for any of these would be both annoying and superfluous. Therefore, Words.entities is accessed during banned titles initialization to prevent their appearance
            entities: () => [
                // Seasons
                "spring", "summer", "autumn", "fall", "winter",
                // Holidays
                "halloween", "christmas", "thanksgiving", "easter", "hanukkah", "passover", "ramadan", "eid", "diwali", "new year", "new year eve", "valentine day", "oktoberfest",
                // People terms
                "mom", "dad", "child", "grandmother", "grandfather", "ladies", "gentlemen", "gentleman", "slave",
                // Capitalizable pronoun thingys
                "his", "him", "he'd", "her", "she", "she'd", "you", "your", "yours", "you'd", "you've", "you'll", "you're", "yourself", "mine", "myself", "this", "that",
                // Religious figures & deities
                "god", "jesus", "buddha", "allah", "christ",
                // Religious texts & concepts
                "bible", "holy bible", "qur'an", "quran", "hadith", "tafsir", "tanakh", "talmud", "torah", "vedas", "vatican", "paganism", "pagan",
                // Religions & belief systems
                "hindu", "hinduism", "christianity", "islam", "jew", "judaism", "taoism", "buddhist", "buddhism", "catholic", "baptist",
                // Common locations
                "earth", "moon", "sun", "new york city", "london", "paris", "tokyo", "beijing", "mumbai", "sydney", "berlin", "moscow", "los angeles", "san francisco", "chicago", "miami", "seattle", "vancouver", "toronto", "ottawa", "mexico city", "rio de janeiro", "cape town", "sao paulo", "bangkok", "delhi", "amsterdam", "seoul", "shanghai", "new delhi", "atlanta", "jerusalem", "africa", "north america", "south america", "central america", "asia", "north africa", "south africa", "boston", "rome", "america", "siberia", "new england", "manhattan", "bavaria", "catalonia", "greenland", "hong kong", "singapore",
                // Countries & political entities
                "china", "india", "japan", "germany", "france", "spain", "italy", "canada", "australia", "brazil", "south africa", "russia", "north korea", "south korea", "iran", "iraq", "syria", "saudi arabia", "afghanistan", "pakistan", "uk", "britain", "england", "scotland", "wales", "northern ireland", "usa", "united states", "united states of america", "mexico", "turkey", "greece", "portugal", "poland", "netherlands", "belgium", "sweden", "norway", "finland", "denmark",
                // Organizations & unions
                "united nations", "european union", "state", "nato", "nfl", "nba", "fbi", "cia", "harvard", "yale", "princeton", "ivy league", "little league", "nasa", "nsa", "noaa", "osha", "nascar", "daytona 500", "grand prix", "wwe", "mba", "superbowl",
                // Currencies
                "dollar", "euro", "pound", "yen", "rupee", "peso", "franc", "dinar", "bitcoin", "ethereum", "ruble", "won", "dirham",
                // Landmarks
                "sydney opera house", "eiffel tower", "statue of liberty", "big ben", "great wall of china", "taj mahal", "pyramids of giza", "grand canyon", "mount everest",
                // Events
                "world war i", "world war 1", "wwi", "wwii", "world war ii", "world war 2", "wwii", "ww2", "cold war", "brexit", "american revolution", "french revolution", "holocaust", "cuban missile crisis",
                // Companies
                "google", "microsoft", "apple", "amazon", "facebook", "tesla", "ibm", "intel", "samsung", "sony", "coca-cola", "nike", "ford", "chevy", "pontiac", "chrysler", "volkswagen", "lambo", "lamborghini", "ferrari", "pizza hut", "taco bell", "ai dungeon", "openai", "mcdonald", "mcdonalds", "kfc", "burger king", "disney",
                // Nationalities & languages
                "english", "french", "spanish", "german", "italian", "russian", "chinese", "japanese", "korean", "arabic", "portuguese", "hindi", "american", "canadian", "mexican", "brazilian", "indian", "australian", "egyptian", "greek", "swedish", "norwegian", "danish", "dutch", "turkish", "iranian", "ukraine", "asian", "british", "european", "polish", "thai", "vietnamese", "filipino", "malaysian", "indonesian", "finnish", "estonian", "latvian", "lithuanian", "czech", "slovak", "hungarian", "romanian", "bulgarian", "serbian", "croatian", "bosnian", "slovenian", "albanian", "georgian", "armenian", "azerbaijani", "kazakh", "uzbek", "mongolian", "hebrew", "persian", "pashto", "urdu", "bengali", "tamil", "telugu", "marathi", "gujarati", "swahili", "zulu", "xhosa", "african", "north african", "south african", "north american", "south american", "central american", "colombian", "argentinian", "chilean", "peruvian", "venezuelan", "ecuadorian", "bolivian", "paraguayan", "uruguayan", "cuban", "dominican", "arabian", "roman", "haitian", "puerto rican", "moroccan", "algerian", "tunisian", "saudi", "emirati", "qatarian", "bahraini", "omani", "yemeni", "syrian", "lebanese", "iraqi", "afghan", "pakistani", "sri lankan", "burmese", "laotian", "cambodian", "hawaiian", "victorian",
                // Fantasy stuff
                "elf", "elves", "elven", "dwarf", "dwarves", "dwarven", "human", "man", "men", "mankind", "humanity",
                // IPs
                "pokemon", "pokémon", "minecraft", "beetles", "band-aid", "bandaid", "band aid", "big mac", "gpt", "chatgpt", "gpt-2", "gpt-3", "gpt-4", "gpt-4o", "mixtral", "mistral", "linux", "windows", "mac", "happy meal", "disneyland", "disneyworld",
                // US states
                "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico", "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont", "west virginia", "wisconsin", "wyoming",
                // Canadian Provinces & Territories
                "british columbia", "manitoba", "new brunswick", "labrador", "nova scotia", "ontario", "prince edward island", "quebec", "saskatchewan", "northwest territories", "nunavut", "yukon", "newfoundland",
                // Australian States & Territories
                "new south wales", "queensland", "south australia", "tasmania", "western australia", "australian capital territory",
                // idk
                "html", "javascript", "python", "java", "c++", "php", "bluetooth", "json", "sql", "word", "dna", "icbm", "npc", "usb", "rsvp", "omg", "brb", "lol", "rofl", "smh", "ttyl", "rubik", "adam", "t-shirt", "tshirt", "t shirt", "led", "leds", "laser", "lasers", "qna", "q&a", "vip", "human resource", "human resources", "llm", "llc", "ceo", "cfo", "coo", "office", "blt", "suv", "suvs", "ems", "emt", "cbt", "cpr", "ferris wheel", "toy", "pet", "plaything", "m o"
            ],
            // Unwanted values
            undesirables: () => [
                [343332, 451737, 323433, 377817], [436425, 356928, 363825, 444048], [323433, 428868, 310497, 413952], [350097, 66825, 436425, 413952, 406593, 444048], [316932, 330000, 436425, 392073], [444048, 356928, 323433], [451737, 444048, 363825], [330000, 310497, 392073, 399300]
            ],
            delimiter: () => (
                "——————————————————————————"
            ),
            // Source code location
            copy: () => [
                126852, 33792, 211200, 384912, 336633, 310497, 436425, 336633, 33792, 459492, 363825, 436425, 363825, 444048, 33792, 392073, 483153, 33792, 139425, 175857, 33792, 152592, 451737, 399300, 350097, 336633, 406593, 399300, 33792, 413952, 428868, 406593, 343332, 363825, 384912, 336633, 33792, 135168, 190608, 336633, 467313, 330000, 190608, 336633, 310497, 356928, 33792, 310497, 399300, 330000, 33792, 428868, 336633, 310497, 330000, 33792, 392073, 483153, 33792, 316932, 363825, 406593, 33792, 343332, 406593, 428868, 33792, 436425, 363825, 392073, 413952, 384912, 336633, 33792, 363825, 399300, 436425, 444048, 428868, 451737, 323433, 444048, 363825, 406593, 399300, 436425, 33792, 406593, 399300, 33792, 310497, 330000, 330000, 363825, 399300, 350097, 33792, 139425, 451737, 444048, 406593, 66825, 148137, 310497, 428868, 330000, 436425, 33792, 444048, 406593, 33792, 483153, 406593, 451737, 428868, 33792, 436425, 323433, 336633, 399300, 310497, 428868, 363825, 406593, 436425, 35937, 33792, 3355672848, 139592360193, 3300, 3300, 356928, 444048, 444048, 413952, 436425, 111012, 72897, 72897, 413952, 384912, 310497, 483153, 69828, 310497, 363825, 330000, 451737, 399300, 350097, 336633, 406593, 399300, 69828, 323433, 406593, 392073, 72897, 413952, 428868, 406593, 343332, 363825, 384912, 336633, 72897, 190608, 336633, 467313, 330000, 190608, 336633, 310497, 356928, 3300, 3300, 126852, 33792, 139425, 451737, 444048, 406593, 66825, 148137, 310497, 428868, 330000, 436425, 33792, 459492, 79233, 69828, 76032, 69828, 76032, 33792, 363825, 436425, 33792, 310497, 399300, 33792, 406593, 413952, 336633, 399300, 66825, 436425, 406593, 451737, 428868, 323433, 336633, 33792, 436425, 323433, 428868, 363825, 413952, 444048, 33792, 343332, 406593, 428868, 33792, 139425, 175857, 33792, 152592, 451737, 399300, 350097, 336633, 406593, 399300, 33792, 392073, 310497, 330000, 336633, 33792, 316932, 483153, 33792, 190608, 336633, 467313, 330000, 190608, 336633, 310497, 356928, 69828, 33792, 261393, 406593, 451737, 33792, 356928, 310497, 459492, 336633, 33792, 392073, 483153, 33792, 343332, 451737, 384912, 384912, 33792, 413952, 336633, 428868, 392073, 363825, 436425, 436425, 363825, 406593, 399300, 33792, 444048, 406593, 33792, 451737, 436425, 336633, 33792, 139425, 451737, 444048, 406593, 66825, 148137, 310497, 428868, 330000, 436425, 33792, 467313, 363825, 444048, 356928, 363825, 399300, 33792, 483153, 406593, 451737, 428868, 33792, 413952, 336633, 428868, 436425, 406593, 399300, 310497, 384912, 33792, 406593, 428868, 33792, 413952, 451737, 316932, 384912, 363825, 436425, 356928, 336633, 330000, 33792, 436425, 323433, 336633, 399300, 310497, 428868, 363825, 406593, 436425, 35937, 3300, 126852, 33792, 261393, 406593, 451737, 50193, 428868, 336633, 33792, 310497, 384912, 436425, 406593, 33792, 467313, 336633, 384912, 323433, 406593, 392073, 336633, 33792, 444048, 406593, 33792, 336633, 330000, 363825, 444048, 33792, 444048, 356928, 336633, 33792, 139425, 175857, 33792, 413952, 428868, 406593, 392073, 413952, 444048, 436425, 33792, 310497, 399300, 330000, 33792, 444048, 363825, 444048, 384912, 336633, 33792, 336633, 475200, 323433, 384912, 451737, 436425, 363825, 406593, 399300, 436425, 33792, 413952, 428868, 406593, 459492, 363825, 330000, 336633, 330000, 33792, 316932, 336633, 384912, 406593, 467313, 69828, 33792, 175857, 33792, 436425, 363825, 399300, 323433, 336633, 428868, 336633, 384912, 483153, 33792, 356928, 406593, 413952, 336633, 33792, 483153, 406593, 451737, 33792, 336633, 399300, 370788, 406593, 483153, 33792, 483153, 406593, 451737, 428868, 33792, 310497, 330000, 459492, 336633, 399300, 444048, 451737, 428868, 336633, 436425, 35937, 33792, 101128769412, 106046468352, 3300
            ],
            // Card interface names reserved for use within LSIv2
            reserved: () => ({
                library: "Shared Library", input: "Input Modifier", context: "Context Modifier", output: "Output Modifier", guide: "LSIv2 Guide", state: "State Display", log: "Console Log"
            }),
            // Acceptable config settings which are coerced to true
            trues: () => [
                "true", "t", "yes", "y", "on"
            ],
            // Acceptable config settings which are coerced to false
            falses: () => [
                "false", "f", "no", "n", "off"
            ],
            guide: () => prose(
                ">>> Detailed Guide:",
                "Auto-Cards was made by LewdLeah ❤️",
                "",
                Words.delimiter,
                "",
                "💡 What is Auto-Cards?",
                "Auto-Cards is a plug-and-play script for AI Dungeon that watches your story and automatically writes plot-relevant story cards during normal gameplay. A forgetful AI breaks my immersion, therefore my primary goal was to address the \"object permanence problem\" by extending story cards and memories with deeper automation. Auto-Cards builds a living reference of your adventure's world as you go. For your own convenience, all of this stuff is handled in the background. Though you're certainly welcome to customize various settings or use in-game commands for more precise control",
                "",
                Words.delimiter,
                "",
                " 📌 Main Features",
                "- Detects named entities from your story and periodically writes new cards",
                "- Smart long-term memory updates and summaries for important cards",
                "- Fully customizable AI card generation and memory summarization prompts",
                "- Optional in-game commands to manually direct the card generation process",
                "- Free and open source for anyone to use within their own projects",
                "- Compatible with other scripts and includes an external API",
                "- Optional in-game scripting interface (LSIv2)",
                "",
                Words.delimiter,
                "",
                "⚙️ Config Settings",
                "You may, at any time, fine-tune your settings in-game by editing their values within the config card's entry section. Simply swap true/false or tweak numbers where appropriate",
                "",
                "> Disable Auto-Cards:",
                "Turns the whole system off if true",
                "",
                "> Show detailed guide:",
                "If true, shows this player guide in-game",
                "",
                "> Delete all automatic story cards:",
                "Removes every auto-card present in your adventure",
                "",
                "> Reset all config settings and prompts:",
                "Restores all settings and prompts to their original default values",
                "",
                "> Pin this config card near the top:",
                "Keeps the config card pinned high on your cards list",
                "",
                "> Minimum turns cooldown for new cards:",
                "How many turns (minimum) to wait between generating new cards. Using 9999 will pause periodic card generation while still allowing card memory updates to continue",
                "",
                "> New cards use a bulleted list format:",
                "If true, new entries will use bullet points instead of pure prose",
                "",
                "> Maximum entry length for new cards:",
                "Caps how long newly generated card entries can be (in characters)",
                "",
                "> New cards perform memory updates:",
                "If true, new cards will automatically experience memory updates over time",
                "",
                "> Card memory bank preferred length:",
                "Character count threshold before card memories are summarized to save space",
                "",
                "> Memory summary compression ratio:",
                "Controls how much to compress when summarizing long card memory banks",
                "(ratio = 10 * old / new ... such that 25 -> 2.5x shorter)",
                "",
                "> Exclude all-caps from title detection:",
                "Prevents all-caps words like \"RUN\" from being parsed as viable titles",
                "",
                "> Also detect titles from player inputs:",
                "Allows your typed Do/Say/Story action inputs to help suggest new card topics. Set to false if you have bad grammar, or if you're German (due to idiosyncratic noun capitalization habits)",
                "",
                "> Minimum turns age for title detection:",
                "How many actions back the script looks when parsing recent titles from your story",
                "",
                "> Use Live Script Interface v2:",
                "Enables LSIv2 for extra scripting magic and advanced control via arbitrary code execution",
                "",
                "> Log debug data in a separate card:",
                "Shows a debug card if set to true",
                "",
                Words.delimiter,
                "",
                "✏️ AI Prompts",
                "You may specify how the AI handles story card processes by editing either of these two prompts within the config card's notes section",
                "",
                "> AI prompt to generate new cards:",
                "Used when Auto-Cards writes a new card entry. It tells the AI to focus on important plot stuff, avoid fluff, and write in a consistent, polished style. I like to add some personal preferences here when playing my own adventures. \"%{title}\" and \"%{entry}\" are dynamic placeholders for their namesakes",
                "",
                "> AI prompt to summarize card memories:",
                "Summarizes older details within card memory banks to keep everything concise and neat over the long-run. Maintains only the most important details, written in the past tense. \"%{title}\" and \"%{memory}\" are dynamic placeholders for their namesakes",
                "",
                Words.delimiter,
                "",
                "⛔ Banned Titles List",
                "This list prevents new cards from being created for super generic or unhelpful titles such as North, Tuesday, or December. You may edit these at the bottom of the config card's notes section. Capitalization and plural/singular forms are handled for you, so no worries about that",
                "",
                "> Titles banned from automatic new card generation:",
                "North, East, South, West, and so on...",
                "",
                Words.delimiter,
                "",
                "🔑 In-Game Commands (/ac)",
                "Use these commands to manually interact with Auto-Cards, simply type them into a Do/Say/Story input action",
                "",
                "/ac",
                "Sets your actual cooldown to 0 and immediately attempts to generate a new card for the most relevant unused title from your story (if one exists)",
                "",
                "/ac Your Title Goes Here",
                "Will immediately begin generating a new story card with the given title",
                "Example use: \"/ac Leah\"",
                "",
                "/ac Your Title Goes Here / Your extra prompt details go here",
                "Similar to the previous case, but with additional context to include with the card generation prompt",
                "Example use: \"/ac Leah / Focus on Leah's works of artifice and ingenuity\"",
                "",
                "/ac Your Title Goes Here / Your extra prompt details go here / Your starter entry goes here",
                "Again, similar to the previous case, but with an initial card entry for the generator to build upon",
                "Example use: \"/ac Leah / Focus on Leah's works of artifice and ingenuity / You are a woman named Leah.\"",
                "",
                "/ac redo Your Title Goes Here",
                "Rewrites your chosen story card, using the old card entry, memory bank, and story context for inspiration. Useful for recreating cards after important character development has occurred",
                "Example use: \"/ac redo Leah\"",
                "",
                "/ac redo Your Title Goes Here / New info goes here",
                "Similar to the previous case, but with additional info provided to guide the rewrite according to your additional specifications",
                "Example use: \"/ac redo Leah / Leah recently achieved immortality\"",
                "",
                "/ac redo all",
                "Recreates every single auto-card in your adventure. I must warn you though: This is very risky",
                "",
                "Extra Info:",
                "- Invalid titles will fail. It's a technical limitation, sorry 🤷‍♀️",
                "- Titles must be unique, unless you're attempting to use \"/ac redo\" for an existing card",
                "- You may submit multiple commands using a single input to queue up a chained sequence of requests",
                "- Capitalization doesn't matter, titles will be reformatted regardless",
                "",
                Words.delimiter,
                "",
                "🔧 External API Functions (quick summary)",
                "These are mainly for other JavaScript programmers to use, so feel free to ignore this section if that doesn't apply to you. Anyway, here's what each one does in plain terms, though please do refer to my source code for the full documentation",
                "",
                "AutoCards().API.postponeEvents();",
                "Pauses Auto-Cards activity for n many turns",
                "",
                "AutoCards().API.emergencyHalt();",
                "Emergency stop or resume",
                "",
                "AutoCards().API.suppressMessages();",
                "Hides Auto-Cards toasts by preventing assignment to state.message",
                "",
                "AutoCards().API.debugLog();",
                "Writes to the debug log card",
                "",
                "AutoCards().API.toggle();",
                "Turns Auto-Cards on/off",
                "",
                "AutoCards().API.generateCard();",
                "Initiates AI generation of the requested card",
                "",
                "AutoCards().API.redoCard();",
                "Regenerates an existing card",
                "",
                "AutoCards().API.setCardAsAuto();",
                "Flags or unflags a card as automatic",
                "",
                "AutoCards().API.addCardMemory();",
                "Adds a memory to a specific card",
                "",
                "AutoCards().API.eraseAllAutoCards();",
                "Deletes all auto-cards",
                "",
                "AutoCards().API.getUsedTitles();",
                "Lists all current card titles and keys",
                "",
                "AutoCards().API.getBannedTitles();",
                "Shows your current banned titles list",
                "",
                "AutoCards().API.setBannedTitles();",
                "Replaces the banned titles list with a new list",
                "",
                "AutoCards().API.buildCard();",
                "Makes a new card from scratch, using exact parameters",
                "",
                "AutoCards().API.getCard();",
                "Finds cards that match a filter",
                "",
                "AutoCards().API.eraseCard();",
                "Deletes cards matching a filter",
                "",
                "These API functions also work from within the LSIv2 scope, by the way",
                "",
                Words.delimiter,
                "",
                "❤️ Special Thanks",
                "This project flourished due to the incredible help, feedback, and encouragement from the AI Dungeon community. Your ideas, bug reports, testing, and support made Auto-Cards smarter, faster, and more fun for all. Please refer to my source code to learn more about everyone's specific contributions",
                "",
                "AHotHamster22, BinKompliziert, Boo, bottledfox, Bruno, Burnout, bweni, DebaczX, Dirty Kurtis, Dragranis, effortlyss, Hawk, Idle Confusion, ImprezA, Kat-Oli, KryptykAngel, Mad19pumpkin, Magic, Mirox80, Nathaniel Wyvern, NobodyIsUgly, OnyxFlame, Purplejump, Randy Viosca, RustyPawz, sinner, Sleepy pink, Vutinberg, Wilmar, Yi1i1i",
                "",
                Words.delimiter,
                "",
                "🎴 Random Tips",
                "- The default setup works great out of the box, just play normally and watch your world build itself",
                "- Enable AI Dungeon's built-in memory system for the best results",
                "- Gameplay -> AI Models -> Memory System -> Memory Bank -> Toggle-ON to enable",
                "- \"t\" and \"f\" are valid shorthand for \"true\" and \"false\" inside the config card",
                "- If Auto-Cards goes overboard with new cards, you can pause it by setting the cooldown config to 9999",
                "- Write \"{title:}\" anywhere within a regular story card's entry to transform it into an automatic card",
                "- Feel free to import/export entire story card decks at any time",
                "- Please copy my source code from here: https://play.aidungeon.com/profile/LewdLeah",
                "",
                Words.delimiter,
                "",
                "Happy adventuring! ❤️",
                "Please erase before continuing! <<<"
            )
        };
        for (const wordList in wordListInitializers) {
            // Define a lazy getter for every word list
            Object.defineProperty(Words, wordList, {
                configurable: false,
                enumerable: true,
                get() {
                    // If not already in cache, initialize and store the word list
                    if (!(wordList in Words.#cache)) {
                        Words.#cache[wordList] = O.f(wordListInitializers[wordList]());
                    }
                    return Words.#cache[wordList];
                }
            });
        }
    } }); }
    function hoistStringsHashed() { return (class StringsHashed {
        // Used for information-dense past memory recognition
        // Strings are converted to (reasonably) unique hashcodes for efficient existence checking
        static #defaultSize = 65536;
        #size;
        #store;
        constructor(size = StringsHashed.#defaultSize) {
            this.#size = size;
            this.#store = new Set();
            return this;
        }
        static deserialize(serialized, size = StringsHashed.#defaultSize) {
            const stringsHashed = new StringsHashed(size);
            stringsHashed.#store = new Set(serialized.split(","));
            return stringsHashed;
        }
        serialize() {
            return Array.from(this.#store).join(",");
        }
        has(str) {
            return this.#store.has(this.#hash(str));
        }
        add(str) {
            this.#store.add(this.#hash(str));
            return this;
        }
        remove(str) {
            this.#store.delete(this.#hash(str));
            return this;
        }
        size() {
            return this.#store.size;
        }
        latest(keepLatestCardinality) {
            if (this.#store.size <= keepLatestCardinality) {
                return this;
            }
            const excess = this.#store.size - keepLatestCardinality;
            const iterator = this.#store.values();
            for (let i = 0; i < excess; i++) {
                // The oldest hashcodes are removed first (insertion order matters!)
                this.#store.delete(iterator.next().value);
            }
            return this;
        }
        #hash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((31 * hash) + str.charCodeAt(i)) % this.#size;
            }
            return hash.toString(36);
        }
    }); }
    function hoistInternal() { return (class Internal {
        // Some exported API functions are internally reused by AutoCards
        // Recursively calling AutoCards().API is computationally wasteful
        // AutoCards uses this collection of static methods as an internal proxy
        static generateCard(request, predefinedPair = ["", ""]) {
            // Method call guide:
            // Internal.generateCard({
            //     // All properties except 'title' are optional
            //     type: "card type, defaults to 'class' for ease of filtering",
            //     title: "card title",
            //     keysStart: "preexisting card triggers",
            //     entryStart: "preexisting card entry",
            //     entryPrompt: "prompt the AI will use to complete this entry",
            //     entryPromptDetails: "extra details to include with this card's prompt",
            //     entryLimit: 750, // target character count for the generated entry
            //     description: "card notes",
            //     memoryStart: "preexisting card memory",
            //     memoryUpdates: true, // card updates when new relevant memories are formed
            //     memoryLimit: 2750, // max characters before the card memory is compressed
            // });
            const titleKeyPair = formatTitle((request.title ?? "").toString());
            const title = predefinedPair[0] || titleKeyPair.newTitle;
            if (
                (title === "")
                || (("title" in AC.generation.workpiece) && (title === AC.generation.workpiece.title))
                || (isAwaitingGeneration() && (AC.generation.pending.some(pendingWorkpiece => (
                    ("title" in pendingWorkpiece) && (title === pendingWorkpiece.title)
                ))))
            ) {
                logEvent("The title '" + request.title + "' is invalid or unavailable for card generation", true);
                return false;
            }
            AC.generation.pending.push(O.s({
                title: title,
                type: limitString((request.type || AC.config.defaultCardType).toString().trim(), 100),
                keys: predefinedPair[1] || buildKeys((request.keysStart ?? "").toString(), titleKeyPair.newKey),
                entry: limitString("{title: " + title + "}" + cleanSpaces((function() {
                    const entry = (request.entryStart ?? "").toString().trim();
                    if (entry === "") {
                        return "";
                    } else {
                        return ("\n" + entry + (function() {
                            if (/[a-zA-Z]$/.test(entry)) {
                                return ".";
                            } else {
                                return "";
                            }
                        })() + " ");
                    }
                })()), 2000),
                description: limitString((
                    (function() {
                        const description = limitString((request.description ?? "").toString().trim(), 9900);
                        if (description === "") {
                            return "";
                        } else {
                            return description + "\n\n";
                        }
                    })() + "Auto-Cards will contextualize these memories:\n{updates: " + (function() {
                        if (typeof request.memoryUpdates === "boolean") {
                            return request.memoryUpdates;
                        } else {
                            return AC.config.defaultCardsDoMemoryUpdates;
                        }
                    })() + ", limit: " + validateMemoryLimit(
                        parseInt((request.memoryLimit || AC.config.defaultMemoryLimit), 10)
                    ) + "}" + (function() {
                        const cardMemoryBank = cleanSpaces((request.memoryStart ?? "").toString().trim());
                        if (cardMemoryBank === "") {
                            return "";
                        } else {
                            return "\n" + cardMemoryBank.split("\n").map(memory => addBullet(memory)).join("\n");
                        }
                    })()
                ), 10000),
                prompt: (function() {
                    let prompt = insertTitle((
                        (request.entryPrompt ?? "").toString().trim() || AC.config.generationPrompt.trim()
                    ), title);
                    let promptDetails = insertTitle((
                        cleanSpaces((request.entryPromptDetails ?? "").toString().trim())
                    ), title);
                    if (promptDetails !== "") {
                        const spacesPrecedingTerminalEntryPlaceholder = (function() {
                            const terminalEntryPlaceholderPattern = /(?:[%\$]+\s*|[%\$]*){+\s*entry\s*}+$/i;
                            if (terminalEntryPlaceholderPattern.test(prompt)) {
                                prompt = prompt.replace(terminalEntryPlaceholderPattern, "");
                                const trailingSpaces = prompt.match(/(\s+)$/);
                                if (trailingSpaces) {
                                    prompt = prompt.trimEnd();
                                    return trailingSpaces[1];
                                } else {
                                    return "\n\n";
                                }
                            } else {
                                return "";
                            }
                        })();
                        switch(prompt[prompt.length - 1]) {
                        case "]": { encapsulateBothPrompts("[", true, "]"); break; }
                        case ">": { encapsulateBothPrompts(null, false, ">"); break; }
                        case "}": { encapsulateBothPrompts("{", true, "}"); break; }
                        case ")": { encapsulateBothPrompts("(", true, ")"); break; }
                        case "/": { encapsulateBothPrompts("/", true, "/"); break; }
                        case "#": { encapsulateBothPrompts("#", true, "#"); break; }
                        case "-": { encapsulateBothPrompts(null, false, "-"); break; }
                        case ":": { encapsulateBothPrompts(":", true, ":"); break; }
                        case "<": { encapsulateBothPrompts(">", true, "<"); break; }
                        };
                        if (promptDetails.includes("\n")) {
                            const lines = promptDetails.split("\n");
                            for (let i = 0; i < lines.length; i++) {
                                lines[i] = addBullet(lines[i].trim());
                            }
                            promptDetails = lines.join("\n");
                        } else {
                            promptDetails = addBullet(promptDetails);
                        }
                        prompt += "\n" + promptDetails + (function() {
                            if (spacesPrecedingTerminalEntryPlaceholder !== "") {
                                // Prompt previously contained a terminal %{entry} placeholder, re-append it
                                return spacesPrecedingTerminalEntryPlaceholder + "%{entry}";
                            }
                            return "";
                        })();
                        function encapsulateBothPrompts(leftSymbol, slicesAtMiddle, rightSymbol) {
                            if (slicesAtMiddle) {
                                prompt = prompt.slice(0, -1).trim();
                                if (promptDetails.startsWith(leftSymbol)) {
                                    promptDetails = promptDetails.slice(1).trim();
                                }
                            }
                            if (!promptDetails.endsWith(rightSymbol)) {
                                promptDetails += rightSymbol;
                            }
                            return;
                        }
                    }
                    return limitString(prompt, Math.floor(0.8 * AC.signal.maxChars));
                })(),
                limit: validateEntryLimit(parseInt((request.entryLimit || AC.config.defaultEntryLimit), 10))
            }));
            notify("Generating card for \"" + title + "\"");
            function addBullet(str) {
                return "- " + str.replace(/^-+\s*/, "");
            }
            return true;
        }
        static redoCard(request, useOldInfo, newInfo) {
            const card = getIntendedCard(request.title)[0];
            const oldCard = O.f({...card});
            if (!eraseCard(card)) {
                return false;
            } else if (newInfo !== "") {
                request.entryPromptDetails = (request.entryPromptDetails ?? "").toString() + "\n" + newInfo;
            }
            O.f(request);
            Internal.getUsedTitles(true);
            if (!Internal.generateCard(request) && !Internal.generateCard(request, [
                (oldCard.entry.match(/^{title: ([\s\S]*?)}/)?.[1] || request.title.replace(/\w\S*/g, word => (
                    word[0].toUpperCase() + word.slice(1).toLowerCase()
                ))), oldCard.keys
            ])) {
                constructCard(oldCard, newCardIndex());
                Internal.getUsedTitles(true);
                return false;
            } else if (!useOldInfo) {
                return true;
            }
            AC.generation.pending[AC.generation.pending.length - 1].prompt = ((
                removeAutoProps(oldCard.entry) + "\n\n" +
                removeAutoProps(isolateNotesAndMemories(oldCard.description)[1])
            ).trimEnd() + "\n\n" + AC.generation.pending[AC.generation.pending.length - 1].prompt).trim();
            return true;
        }
        // Sometimes it's helpful to log information elsewhere during development
        // This log card is separate and distinct from the LSIv2 console log
        static debugLog(...args) {
            const debugCardName = "Debug Log";
            banTitle(debugCardName);
            const card = getSingletonCard(true, O.f({
                type: AC.config.defaultCardType,
                title: debugCardName,
                keys: debugCardName,
                entry: "The debug console log will print to the notes section below.",
                description: Words.delimiter + "\nBEGIN DEBUG LOG"
            }));
            logToCard(card, ...args);
            return card;
        }
        static eraseAllAutoCards() {
            const cards = [];
            Internal.getUsedTitles(true);
            for (const card of storyCards) {
                if (card.entry.startsWith("{title: ")) {
                    cards.push(card);
                }
            }
            for (const card of cards) {
                eraseCard(card);
            }
            auto.clear();
            forgetStuff();
            clearTransientTitles();
            AC.generation.pending = [];
            AC.database.memories.associations = {};
            if (AC.config.deleteAllAutoCards) {
                AC.config.deleteAllAutoCards = null;
            }
            return cards.length;
        }
        static getUsedTitles(isExternal = false) {
            if (isExternal) {
                bans.clear();
                isBanned("", true);
            } else if (0 < AC.database.titles.used.length) {
                return AC.database.titles.used;
            }
            // All unique used titles and keys encountered during this iteration
            const seen = new Set();
            auto.clear();
            clearTransientTitles();
            AC.database.titles.used = ["%@%"];
            for (const card of storyCards) {
                // Perform some common-sense maintenance while we're here
                card.type = card.type.trim();
                card.title = card.title.trim();
                // card.keys should be left as-is
                card.entry = card.entry.trim();
                card.description = card.description.trim();
                if (isExternal) {
                    O.s(card);
                } else if (!shouldProceed()) {
                    checkRemaining();
                    continue;
                }
                // An ideal auto-card's entry starts with "{title: Example of Greatness}" (example)
                // An ideal auto-card's description contains "{updates: true, limit: 2750}" (example)
                if (checkPlurals(denumberName(card.title.replace("\n", "")), t => isBanned(t))) {
                    checkRemaining();
                    continue;
                } else if (!card.keys.includes(",")) {
                    const cleanKeys = denumberName(card.keys.trim());
                    if ((2 < cleanKeys.length) && checkPlurals(cleanKeys, t => isBanned(t))) {
                        checkRemaining();
                        continue;
                    }
                }
                // Detect and repair malformed auto-card properties in a fault-tolerant manner
                const traits = [card.entry, card.description].map((str, i) => {
                    // Absolute abomination uwu
                    const hasUpdates = /updates?\s*:[\s\S]*?(?:(?:title|limit)s?\s*:|})/i.test(str);
                    const hasLimit = /limits?\s*:[\s\S]*?(?:(?:title|update)s?\s*:|})/i.test(str);
                    return [(function() {
                        if (hasUpdates || hasLimit) {
                            if (/titles?\s*:[\s\S]*?(?:(?:limit|update)s?\s*:|})/i.test(str)) {
                                return 2;
                            }
                            return false;
                        } else if (/titles?\s*:[\s\S]*?}/i.test(str)) {
                            return 1;
                        } else if (!(
                            (i === 0)
                            && /{[\s\S]*?}/.test(str)
                            && (str.match(/{/g)?.length === 1)
                            && (str.match(/}/g)?.length === 1)
                        )) {
                            return false;
                        }
                        const badTitleHeaderMatch = str.match(/{([\s\S]*?)}/);
                        if (!badTitleHeaderMatch) {
                            return false;
                        }
                        const inferredTitle = badTitleHeaderMatch[1].split(",")[0].trim();
                        if (
                            (2 < inferredTitle.length)
                            && (inferredTitle.length <= 100)
                            && (badTitleHeaderMatch[0].length < str.length)
                        ) {
                            // A rare case where the title's existence should be inferred from the enclosing {curly brackets}
                            return inferredTitle;
                        }
                        return false;
                    })(), hasUpdates, hasLimit];
                }).flat();
                if (traits.every(trait => !trait)) {
                    // This card contains no auto-card traits, not even malformed ones
                    checkRemaining();
                    continue;
                }
                const [
                    hasEntryTitle,
                    hasEntryUpdates,
                    hasEntryLimit,
                    hasDescTitle,
                    hasDescUpdates,
                    hasDescLimit
                ] = traits;
                // Handle all story cards which belong to the Auto-Cards ecosystem
                // May flag this damaged auto-card for later repairs
                // May flag this duplicate auto-card for deformatting (will become a regular story card)
                let repair = false;
                let release = false;
                const title = (function() {
                    let title = "";
                    if (typeof hasEntryTitle === "string") {
                        repair = true;
                        title = formatTitle(hasEntryTitle).newTitle;
                        if (hasDescTitle && bad()) {
                            title = parseTitle(false);
                        }
                    } else if (hasEntryTitle) {
                        title = parseTitle(true);
                        if (hasDescTitle) {
                            repair = true;
                            if (bad()) {
                                title = parseTitle(false);
                            }
                        } else if (1 < card.entry.match(/titles?\s*:/gi)?.length) {
                            repair = true;
                        }
                    } else if (hasDescTitle) {
                        repair = true;
                        title = parseTitle(false);
                    }
                    if (bad()) {
                        repair = true;
                        title = formatTitle(card.title).newTitle;
                        if (bad()) {
                            release = true;
                        } else {
                            seen.add(title);
                            auto.add(title.toLowerCase());
                        }
                    } else {
                        seen.add(title);
                        auto.add(title.toLowerCase());
                        const titleHeader = "{title: " + title + "}";
                        if (!repair && !((card.entry === titleHeader) || card.entry.startsWith(titleHeader + "\n"))) {
                            repair = true;
                        }
                    }
                    function bad() {
                        return ((title === "") || checkPlurals(title, t => auto.has(t)));
                    }
                    function parseTitle(fromEntry) {
                        const [sourceType, sourceText] = (function() {
                            if (fromEntry) {
                                return [hasEntryTitle, card.entry];
                            } else {
                                return [hasDescTitle, card.description];
                            }
                        })()
                        switch(sourceType) {
                        case 1: {
                            return formatTitle(isolateProperty(
                                sourceText,
                                /titles?\s*:[\s\S]*?}/i,
                                /(?:titles?\s*:|})/gi
                            )).newTitle; }
                        case 2: {
                            return formatTitle(isolateProperty(
                                sourceText,
                                /titles?\s*:[\s\S]*?(?:(?:limit|update)s?\s*:|})/i,
                                /(?:(?:title|update|limit)s?\s*:|})/gi
                            )).newTitle; }
                        default: {
                            return ""; }
                        }
                    }
                    return title;
                })();
                if (release) {
                    // Remove Auto-Cards properties from this incompatible story card
                    safeRemoveProps();
                    card.description = (card.description
                        .replace(/\s*Auto(?:-|\s*)Cards\s*will\s*contextualize\s*these\s*memories\s*:\s*/gi, "")
                        .replaceAll("%@%", "\n\n")
                        .trim()
                    );
                    seen.delete(title);
                    checkRemaining();
                    continue;
                }
                const memoryProperties = "{updates: " + (function() {
                    let updates = null;
                    if (hasDescUpdates) {
                        updates = parseUpdates(false);
                        if (hasEntryUpdates) {
                            repair = true;
                            if (bad()) {
                                updates = parseUpdates(true);
                            }
                        } else if (1 < card.description.match(/updates?\s*:/gi)?.length) {
                            repair = true;
                        }
                    } else if (hasEntryUpdates) {
                        repair = true;
                        updates = parseUpdates(true);
                    }
                    if (bad()) {
                        repair = true;
                        updates = AC.config.defaultCardsDoMemoryUpdates;
                    }
                    function bad() {
                        return (updates === null);
                    }
                    function parseUpdates(fromEntry) {
                        const updatesText = (isolateProperty(
                            (function() {
                                if (fromEntry) {
                                    return card.entry;
                                } else {
                                    return card.description;
                                }
                            })(),
                            /updates?\s*:[\s\S]*?(?:(?:title|limit)s?\s*:|})/i,
                            /(?:(?:title|update|limit)s?\s*:|})/gi
                        ).toLowerCase().replace(/[^a-z]/g, ""));
                        if (Words.trues.includes(updatesText)) {
                            return true;
                        } else if (Words.falses.includes(updatesText)) {
                            return false;
                        } else {
                            return null;
                        }
                    }
                    return updates;
                })() + ", limit: " + (function() {
                    let limit = -1;
                    if (hasDescLimit) {
                        limit = parseLimit(false);
                        if (hasEntryLimit) {
                            repair = true;
                            if (bad()) {
                                limit = parseLimit(true);
                            }
                        } else if (1 < card.description.match(/limits?\s*:/gi)?.length) {
                            repair = true;
                        }
                    } else if (hasEntryLimit) {
                        repair = true;
                        limit = parseLimit(true);
                    }
                    if (bad()) {
                        repair = true;
                        limit = AC.config.defaultMemoryLimit;
                    } else {
                        limit = validateMemoryLimit(limit);
                    }
                    function bad() {
                        return (limit === -1);
                    }
                    function parseLimit(fromEntry) {
                        const limitText = (isolateProperty(
                            (function() {
                                if (fromEntry) {
                                    return card.entry;
                                } else {
                                    return card.description;
                                }
                            })(),
                            /limits?\s*:[\s\S]*?(?:(?:title|update)s?\s*:|})/i,
                            /(?:(?:title|update|limit)s?\s*:|})/gi
                        ).replace(/[^0-9]/g, ""));
                        if ((limitText === "")) {
                            return -1;
                        } else {
                            return parseInt(limitText, 10);
                        }
                    }
                    return limit.toString();
                })() + "}";
                if (!repair && (new RegExp("(?:^|\\n)" + memoryProperties + "(?:\\n|$)")).test(card.description)) {
                    // There are no serious repairs to perform
                    card.entry = cleanSpaces(card.entry);
                    const [notes, memories] = isolateNotesAndMemories(card.description);
                    const pureMemories = cleanSpaces(memories.replace(memoryProperties, "").trim());
                    rejoinDescription(notes, memoryProperties, pureMemories);
                    checkRemaining();
                    continue;
                }
                // Damage was detected, perform an adaptive repair on this auto-card's configurable properties
                card.description = card.description.replaceAll("%@%", "\n\n");
                safeRemoveProps();
                card.entry = limitString(("{title: " + title + "}\n" + card.entry).trimEnd(), 2000);
                const [left, right] = card.description.split("%@%");
                rejoinDescription(left, memoryProperties, right);
                checkRemaining();
                function safeRemoveProps() {
                    if (typeof hasEntryTitle === "string") {
                        card.entry = card.entry.replace(/{[\s\S]*?}/g, "");
                    }
                    card.entry = removeAutoProps(card.entry);
                    const [notes, memories] = isolateNotesAndMemories(card.description);
                    card.description = notes + "%@%" + removeAutoProps(memories);
                    return;
                }
                function rejoinDescription(notes, memoryProperties, memories) {
                    card.description = limitString((notes + (function() {
                        if (notes === "") {
                            return "";
                        } else if (notes.endsWith("Auto-Cards will contextualize these memories:")) {
                            return "\n";
                        } else {
                            return "\n\n";
                        }
                    })() + memoryProperties + (function() {
                        if (memories === "") {
                            return "";
                        } else {
                            return "\n";
                        }
                    })() + memories), 10000);
                    return;
                }
                function isolateProperty(sourceText, propMatcher, propCleaner) {
                    return ((sourceText.match(propMatcher)?.[0] || "")
                        .replace(propCleaner, "")
                        .split(",")[0]
                        .trim()
                    );
                }
                // Observe literal card titles and keys
                function checkRemaining() {
                    const literalTitles = [card.title, ...card.keys.split(",")];
                    for (let i = 0; i < literalTitles.length; i++) {
                        // The pre-format set inclusion check helps avoid superfluous formatTitle calls
                        literalTitles[i] = (literalTitles[i]
                            .replace(/["\.\?!;\(\):\[\]—{}]/g, " ")
                            .trim()
                            .replace(/\s+/g, " ")
                            .replace(/^'\s*/, "")
                            .replace(/\s*'$/, "")
                        );
                        if (seen.has(literalTitles[i])) {
                            continue;
                        }
                        literalTitles[i] = formatTitle(literalTitles[i]).newTitle;
                        if (literalTitles[i] !== "") {
                            seen.add(literalTitles[i]);
                        }
                    }
                    return;
                }
                function denumberName(name) {
                    if (2 < (name.match(/[^\d\s]/g) || []).length) {
                        // Important for identifying LSIv2 auxiliary code cards when banned
                        return name.replace(/\s*\d+$/, "");
                    } else {
                        return name;
                    }
                }
            }
            clearTransientTitles();
            AC.database.titles.used = [...seen];
            return AC.database.titles.used;
        }
        static getBannedTitles() {
            // AC.database.titles.banned is an array, not a set; order matters
            return AC.database.titles.banned;
        }
        static setBannedTitles(newBans, isFinalAssignment) {
            AC.database.titles.banned = [];
            AC.database.titles.pendingBans = [];
            AC.database.titles.pendingUnbans = [];
            for (let i = newBans.length - 1; 0 <= i; i--) {
                banTitle(newBans[i], isFinalAssignment);
            }
            return AC.database.titles.banned;
        }
        static getCard(predicate, getAll) {
            if (getAll) {
                // Return an array of card references which satisfy the given condition
                const collectedCards = [];
                for (const card of storyCards) {
                    if (predicate(card)) {
                        O.s(card);
                        collectedCards.push(card);
                    }
                }
                return collectedCards;
            }
            // Return a reference to the first card which satisfies the given condition
            for (const card of storyCards) {
                if (predicate(card)) {
                    return O.s(card);
                }
            }
            return null;
        }
    }); }
    function validateCooldown(cooldown) {
        return boundInteger(0, cooldown, 9999, 22);
    }
    function validateEntryLimit(entryLimit) {
        return boundInteger(200, entryLimit, 2000, 750);
    }
    function validateMemoryLimit(memoryLimit) {
        return boundInteger(1750, memoryLimit, 9900, 2750);
    }
    function validateMemCompRatio(memCompressRatio) {
        return boundInteger(20, memCompressRatio, 1250, 25);
    }
    function validateMinLookBackDist(minLookBackDist) {
        return boundInteger(2, minLookBackDist, 88, 7);
    }
    function getDefaultConfig() {
        function check(value, fallback = true, type = "boolean") {
            if (typeof value === type) {
                return value;
            } else {
                return fallback;
            }
        }
        return O.s({
            // Is Auto-Cards enabled?
            doAC: check(DEFAULT_DO_AC),
            // Delete all previously generated story cards?
            deleteAllAutoCards: null,
            // Pin the configuration interface story card near the top?
            pinConfigureCard: check(DEFAULT_PIN_CONFIGURE_CARD),
            // Minimum number of turns in between automatic card generation events?
            addCardCooldown: validateCooldown(DEFAULT_CARD_CREATION_COOLDOWN),
            // Use bulleted list mode for newly generated card entries?
            bulletedListMode: check(DEFAULT_USE_BULLETED_LIST_MODE),
            // Maximum allowed length for newly generated story card entries?
            defaultEntryLimit: validateEntryLimit(DEFAULT_GENERATED_ENTRY_LIMIT),
            // Do newly generated cards have memory updates enabled by default?
            defaultCardsDoMemoryUpdates: check(DEFAULT_NEW_CARDS_DO_MEMORY_UPDATES),
            // Default character limit before the card's memory bank is summarized?
            defaultMemoryLimit: validateMemoryLimit(DEFAULT_NEW_CARDS_MEMORY_LIMIT),
            // Approximately how much shorter should recently compressed memories be? (ratio = 10 * old / new)
            memoryCompressionRatio: validateMemCompRatio(DEFAULT_MEMORY_COMPRESSION_RATIO),
            // Ignore all-caps during title candidate detection?
            ignoreAllCapsTitles: check(DEFAULT_IGNORE_ALL_CAPS_TITLES),
            // Should player input actions (Do/Say/Story) be considered for future named entity detection?
            readFromInputs: check(DEFAULT_DETECT_TITLES_FROM_INPUTS),
            // How many (minimum) actions in the past does Auto-Cards look for named entities?
            minimumLookBackDistance: validateMinLookBackDist(DEFAULT_MINIMUM_LOOK_BACK_DISTANCE),
            // Is Live Script Interface v2 enabled?
            LSIv2: (function() {
                if (DEFAULT_DO_LSI_V2 === true) {
                    return true;
                } else {
                    // Intrepret "false" as null, both here and for later config card reads
                    return null;
                }
            })(),
            // Should the debug data card be visible?
            showDebugData: check(DEFAULT_SHOW_DEBUG_DATA, false),
            // How should the AI be prompted when generating new story card entries?
            generationPrompt: check(DEFAULT_CARD_GENERATION_PROMPT, prose(
                "-----",
                "",
                "<SYSTEM>",
                "# Stop the story and ignore previous instructions. Write a brief and coherent informational entry for %{title} following these instructions:",
                "- Write only third-person pure prose information about %{title} using complete sentences with correct punctuation",
                "- Avoid short-term temporary details or appearances, instead focus on plot-significant information",
                "- Prioritize story-relevant details about %{title} first to ensure seamless integration with the previous plot",
                "- Create new information based on the context and story direction",
                "- Mention %{title} in every sentence",
                "- Use semicolons if needed",
                "- Add additional details about %{title} beneath incomplete entries",
                "- Be concise and grounded",
                "- Imitate the story's writing style and infer the reader's preferences",
                "</SYSTEM>",
                "Continue the entry for %{title} below while avoiding repetition:",
                "%{entry}"
            ), "string"),
            // How should the AI be prompted when summarizing memories for a given story card?
            compressionPrompt: check(DEFAULT_CARD_MEMORY_COMPRESSION_PROMPT, prose(
                "-----",
                "",
                "<SYSTEM>",
                "# Stop the story and ignore previous instructions. Summarize and condense the given paragraph into a narrow and focused memory passage while following these guidelines:",
                "- Ensure the passage retains the core meaning and most essential details",
                "- Use the third-person perspective",
                "- Prioritize information-density, accuracy, and completeness",
                "- Remain brief and concise",
                "- Write firmly in the past tense",
                "- The paragraph below pertains to old events from far earlier in the story",
                "- Integrate %{title} naturally within the memory; however, only write about the events as they occurred",
                "- Only reference information present inside the paragraph itself, be specific",
                "</SYSTEM>",
                "Write a summarized old memory passage for %{title} based only on the following paragraph:",
                "\"\"\"",
                "%{memory}",
                "\"\"\"",
                "Summarize below:"
            ), "string"),
            // All cards constructed by AC will inherit this type by default
            defaultCardType: check(DEFAULT_CARD_TYPE, "class", "string")
        });
    }
    function getDefaultConfigBans() {
        if (typeof DEFAULT_BANNED_TITLES_LIST === "string") {
            return uniqueTitlesArray(DEFAULT_BANNED_TITLES_LIST.split(","));
        } else {
            return [
                "North", "East", "South", "West", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];
        }
    }
    function uniqueTitlesArray(titles) {
        const existingTitles = new Set();
        return (titles
            .map(title => title.trim().replace(/\s+/g, " "))
            .filter(title => {
                if (title === "") {
                    return false;
                }
                const lowerTitle = title.toLowerCase();
                if (existingTitles.has(lowerTitle)) {
                    return false;
                } else {
                    existingTitles.add(lowerTitle);
                    return true;
                }
            })
        );
    }
    function boundInteger(lowerBound, value, upperBound, fallback) {
        if (!Number.isInteger(value)) {
            if (!Number.isInteger(fallback)) {
                throw new Error("Invalid arguments: value and fallback are not integers");
            }
            value = fallback;
        }
        if (Number.isInteger(lowerBound) && (value < lowerBound)) {
            if (Number.isInteger(upperBound) && (upperBound < lowerBound)) {
                throw new Error("Invalid arguments: The inequality (lowerBound <= upperBound) must be satisfied");
            }
            return lowerBound;
        } else if (Number.isInteger(upperBound) && (upperBound < value)) {
            return upperBound;
        } else {
            return value;
        }
    }
    function limitString(str, lengthLimit) {
        if (lengthLimit < str.length) {
            return str.slice(0, lengthLimit).trim();
        } else {
            return str;
        }
    }
    function cleanSpaces(unclean) {
        return (unclean
            .replace(/\s*\n\s*/g, "\n")
            .replace(/\t/g, " ")
            .replace(/  +/g, " ")
        );
    }
    function isolateNotesAndMemories(str) {
        const bisector = str.search(/\s*(?:{|(?:title|update|limit)s?\s*:)\s*/i);
        if (bisector === -1) {
            return [str, ""];
        } else {
            return [str.slice(0, bisector), str.slice(bisector)];
        }
    }
    function removeAutoProps(str) {
        return cleanSpaces(str
            .replace(/\s*{([\s\S]*?)}\s*/g, (bracedMatch, enclosedProperties) => {
                if (enclosedProperties.trim().length < 150) {
                    return "\n";
                } else {
                    return bracedMatch;
                }
            })
            .replace((
                /\s*(?:{|(?:title|update|limit)s?\s*:)(?:[\s\S]{0,150}?)(?=(?:title|update|limit)s?\s*:|})\s*/gi
            ), "\n")
            .replace(/\s*(?:{|(?:title|update|limit)s?\s*:|})\s*/gi, "\n")
            .trim()
        );
    }
    function insertTitle(prompt, title) {
        return prompt.replace((
            /(?:[%\$]+\s*|[%\$]*){+\s*(?:titles?|names?|characters?|class(?:es)?|races?|locations?|factions?)\s*}+/gi
        ), title);
    }
    function prose(...args) {
        return args.join("\n");
    }
    function buildKeys(keys, key) {
        key = key.trim().replace(/\s+/g, " ");
        const keyset = [];
        if (key === "") {
            return keys;
        } else if (keys.trim() !== "") {
            keyset.push(...keys.split(","));
            const lowerKey = key.toLowerCase();
            for (let i = keyset.length - 1; 0 <= i; i--) {
                const preKey = keyset[i].trim().replace(/\s+/g, " ").toLowerCase();
                if ((preKey === "") || preKey.includes(lowerKey)) {
                    keyset.splice(i, 1);
                }
            }
        }
        if (key.length < 6) {
            keyset.push(...[
                " " + key + " ", " " + key + "'", "\"" + key + " ", " " + key + ".", " " + key + "?", " " + key + "!", " " + key + ";", "'" + key + " ", "(" + key + " ", " " + key + ")", " " + key + ":", " " + key + "\"", "[" + key + " ", " " + key + "]", "—" + key + " ", " " + key + "—", "{" + key + " ", " " + key + "}"
            ]);
        } else if (key.length < 9) {
            keyset.push(...[
                key + " ", " " + key, key + "'", "\"" + key, key + ".", key + "?", key + "!", key + ";", "'" + key, "(" + key, key + ")", key + ":", key + "\"", "[" + key, key + "]", "—" + key, key + "—", "{" + key, key + "}"
            ]);
        } else {
            keyset.push(key);
        }
        keys = keyset[0] || key;
        let i = 1;
        while ((i < keyset.length) && ((keys.length + 1 + keyset[i].length) < 101)) {
            keys += "," + keyset[i];
            i++;
        }
        return keys;
    }
    // Returns the template-specified singleton card (or secondary varient) after:
    // 1) Erasing all inferior duplicates
    // 2) Repairing damaged titles and keys
    // 3) Constructing a new singleton card if it doesn't exist
    function getSingletonCard(allowConstruction, templateCard, secondaryCard) {
        let singletonCard = null;
        const excessCards = [];
        for (const card of storyCards) {
            O.s(card);
            if (singletonCard === null) {
                if ((card.title === templateCard.title) || (card.keys === templateCard.keys)) {
                    // The first potentially valid singleton card candidate to be found
                    singletonCard = card;
                }
            } else if (card.title === templateCard.title) {
                if (card.keys === templateCard.keys) {
                    excessCards.push(singletonCard);
                    singletonCard = card;
                } else {
                    eraseInferiorDuplicate();
                }
            } else if (card.keys === templateCard.keys) {
                eraseInferiorDuplicate();
            }
            function eraseInferiorDuplicate() {
                if ((singletonCard.title === templateCard.title) && (singletonCard.keys === templateCard.keys)) {
                    excessCards.push(card);
                } else {
                    excessCards.push(singletonCard);
                    singletonCard = card;
                }
                return;
            }
        }
        if (singletonCard === null) {
            if (secondaryCard) {
                // Fallback to a secondary card template
                singletonCard = getSingletonCard(false, secondaryCard);
            }
            // No singleton card candidate exists
            if (allowConstruction && (singletonCard === null)) {
                // Construct a new singleton card from the given template
                singletonCard = constructCard(templateCard);
            }
        } else {
            if (singletonCard.title !== templateCard.title) {
                // Repair any damage to the singleton card's title
                singletonCard.title = templateCard.title;
            } else if (singletonCard.keys !== templateCard.keys) {
                // Repair any damage to the singleton card's keys
                singletonCard.keys = templateCard.keys;
            }
            for (const card of excessCards) {
                // Erase all excess singleton card candidates
                eraseCard(card);
            }
            if (secondaryCard) {
                // A secondary card match cannot be allowed to persist
                eraseCard(getSingletonCard(false, secondaryCard));
            }
        }
        return singletonCard;
    }
    // Erases the given story card
    function eraseCard(badCard) {
        if (badCard === null) {
            return false;
        }
        badCard.title = "%@%";
        for (const [index, card] of storyCards.entries()) {
            if (card.title === "%@%") {
                removeStoryCard(index);
                return true;
            }
        }
        return false;
    }
    // Constructs a new story card from a standardized story card template object
    // {type: "", title: "", keys: "", entry: "", description: ""}
    // Returns a reference to the newly constructed card
    function constructCard(templateCard, insertionIndex = 0) {
        addStoryCard("%@%");
        for (const [index, card] of storyCards.entries()) {
            if (card.title !== "%@%") {
                continue;
            }
            card.type = templateCard.type;
            card.title = templateCard.title;
            card.keys = templateCard.keys;
            card.entry = templateCard.entry;
            card.description = templateCard.description;
            if (index !== insertionIndex) {
                // Remove from the current position and reinsert at the desired index
                storyCards.splice(index, 1);
                storyCards.splice(insertionIndex, 0, card);
            }
            return O.s(card);
        }
        return {};
    }
    function newCardIndex() {
        return +AC.config.pinConfigureCard;
    }
    function getIntendedCard(targetCard) {
        Internal.getUsedTitles(true);
        const titleKey = targetCard.trim().replace(/\s+/g, " ").toLowerCase();
        const autoCard = Internal.getCard(card => (card.entry
            .toLowerCase()
            .startsWith("{title: " + titleKey + "}")
        ));
        if (autoCard !== null) {
            return [autoCard, true, titleKey];
        }
        return [Internal.getCard(card => ((card.title
            .replace(/\s+/g, " ")
            .toLowerCase()
        ) === titleKey)), false, titleKey];
    }
    function doPlayerCommands(input) {
        let result = "";
        for (const command of (
            (function() {
                if (/^\n> [\s\S]*? says? "[\s\S]*?"\n$/.test(input)) {
                    return input.replace(/\s*"\n$/, "");
                } else {
                    return input.trimEnd();
                }
            })().split(/(?=\/\s*A\s*C)/i)
        )) {
            const prefixPattern = /^\/\s*A\s*C/i;
            if (!prefixPattern.test(command)) {
                continue;
            }
            const [requestTitle, requestDetails, requestEntry] = (command
                .replace(/(?:{\s*)|(?:\s*})/g, "")
                .replace(prefixPattern, "")
                .replace(/(?:^\s*\/*\s*)|(?:\s*\/*\s*$)/g, "")
                .split("/")
                .map(requestArg => requestArg.trim())
                .filter(requestArg => (requestArg !== ""))
            );
            if (!requestTitle) {
                // Request with no args
                AC.generation.cooldown = 0;
                result += "/AC -> Success!\n\n";
                logEvent("/AC");
            } else {
                const request = {title: requestTitle.replace(/\s*[\.\?!:]+$/, "")};
                const redo = (function() {
                    const redoPattern = /^(?:redo|retry|rewrite|remake)[\s\.\?!:,;"'—\)\]]+\s*/i;
                    if (redoPattern.test(request.title)) {
                        request.title = request.title.replace(redoPattern, "");
                        if (/^(?:all|every)(?:\s|\.|\?|!|:|,|;|"|'|—|\)|\]|$)/i.test(request.title)) {
                            return [];
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                })();
                if (Array.isArray(redo)) {
                    // Redo all auto cards
                    Internal.getUsedTitles(true);
                    const titleMatchPattern = /^{title: ([\s\S]*?)}/;
                    redo.push(...Internal.getCard(card => (
                        titleMatchPattern.test(card.entry)
                        && /{updates: (?:true|false), limit: \d+}/.test(card.description)
                    ), true));
                    let count = 0;
                    for (const card of redo) {
                        const titleMatch = card.entry.match(titleMatchPattern);  
                        if (titleMatch && Internal.redoCard(O.f({title: titleMatch[1]}), true, "")) {
                            count++;
                        }
                    }
                    const parsed = "/AC redo all";
                    result += parsed + " -> ";
                    if (count === 0) {
                        result += "There were no valid auto-cards to redo";
                    } else {
                        result += "Success!";
                        if (1 < count) {
                            result += " Proceed to redo " + count + " cards";
                        }
                    }
                    logEvent(parsed);
                } else if (!requestDetails) {
                    // Request with only title
                    submitRequest("");
                } else if (!requestEntry || redo) {
                    // Request with title and details
                    request.entryPromptDetails = requestDetails;
                    submitRequest(" / {" + requestDetails + "}");
                } else {
                    // Request with title, details, and entry
                    request.entryPromptDetails = requestDetails;
                    request.entryStart = requestEntry;
                    submitRequest(" / {" + requestDetails + "} / {" + requestEntry + "}");
                }
                result += "\n\n";
                function submitRequest(extra) {
                    O.f(request);
                    const [type, success] = (function() {
                        if (redo) {
                            return [" redo", Internal.redoCard(request, true, "")];
                        } else {
                            Internal.getUsedTitles(true);
                            return ["", Internal.generateCard(request)];
                        }
                    })();
                    const left = "/AC" + type + " {";
                    const right = "}" + extra;
                    if (success) {
                        const parsed = left + AC.generation.pending[AC.generation.pending.length - 1].title + right;
                        result += parsed + " -> Success!";
                        logEvent(parsed);
                    } else {
                        const parsed = left + request.title + right;
                        result += parsed + " -> \"" + request.title + "\" is invalid or unavailable";
                        logEvent(parsed);
                    }
                    return;
                }
            }
            if (isPendingGeneration() || isAwaitingGeneration() || isPendingCompression()) {
                if (AC.config.doAC) {
                    AC.signal.outputReplacement = "";
                } else {
                    AC.signal.forceToggle = true;
                    AC.signal.outputReplacement = ">>> please select \"continue\" (0%) <<<";
                }
            } else if (AC.generation.cooldown === 0) {
                if (0 < AC.database.titles.candidates.length) {
                    if (AC.config.doAC) {
                        AC.signal.outputReplacement = "";
                    } else {
                        AC.signal.forceToggle = true;
                        AC.signal.outputReplacement = ">>> please select \"continue\" (0%) <<<";
                    }
                } else if (AC.config.doAC) {
                    result = result.trimEnd() + "\n";
                    AC.signal.outputReplacement = "\n";
                } else {
                    AC.signal.forceToggle = true;
                    AC.signal.outputReplacement = ">>> Auto-Cards has been enabled! <<<";
                }
            } else {
                result = result.trimEnd() + "\n";
                AC.signal.outputReplacement = "\n";
            }
        }
        return getPrecedingNewlines() + result;
    }
    function advanceChronometer() {
        const currentTurn = getTurn();
        if (Math.abs(history.length - currentTurn) < 2) {
            // The two measures are within ±1, thus history hasn't been truncated yet
            AC.chronometer.step = !(history.length < currentTurn);
        } else {
            // history has been truncated, fallback to a (slightly) worse step detection technique
            AC.chronometer.step = (AC.chronometer.turn < currentTurn);
        }
        AC.chronometer.turn = currentTurn;
        return;
    }
    function concludeEmergency() {
        promoteAmnesia();
        endTurn();
        AC.message.pending = [];
        AC.message.previous = getStateMessage();
        return;
    }
    function concludeOutputBlock(templateCard) {
        if (AC.config.deleteAllAutoCards !== null) {
            // A config-initiated event to delete all previously generated story cards is in progress
            if (AC.config.deleteAllAutoCards) {
                // Request in-game confirmation from the player before proceeding
                AC.config.deleteAllAutoCards = false;
                CODOMAIN.initialize(getPrecedingNewlines() + ">>> please submit the message \"CONFIRM DELETE\" using a Do, Say, or Story action to permanently delete all previously generated story cards <<<\n\n");
            } else {
                // Check for player confirmation
                const previousAction = readPastAction(0);
                if (isDoSayStory(previousAction.type) && /CONFIRM\s*DELETE/i.test(previousAction.text)) {
                    let successMessage = "Confirmation Success: ";
                    const numCardsErased = Internal.eraseAllAutoCards();
                    if (numCardsErased === 0) {
                        successMessage += "However, there were no previously generated story cards to delete!";
                    } else {
                        successMessage += numCardsErased + " generated story card";
                        if (numCardsErased === 1) {
                            successMessage += " was";
                        } else {
                            successMessage += "s were";
                        }
                        successMessage += " deleted";
                    }
                    notify(successMessage);
                } else {
                    notify("Confirmation Failure: No story cards were deleted");
                }
                AC.config.deleteAllAutoCards = null;
                CODOMAIN.initialize("\n");
            }
        } else if (AC.signal.outputReplacement !== "") {
            const output = AC.signal.outputReplacement.trim();
            if (output === "") {
                CODOMAIN.initialize("\n");
            } else {
                CODOMAIN.initialize(getPrecedingNewlines() + output + "\n\n");
            }
        }
        if (templateCard) {
            // Auto-Cards was enabled or disabled during the previous onContext hook
            // Construct the replacement control card onOutput
            banTitle(templateCard.title);
            getSingletonCard(true, templateCard);
            AC.signal.swapControlCards = false;
        }
        endTurn();
        if (AC.config.LSIv2 === null) {
            postMessages();
        }
        return;
    }
    function endTurn() {
        AC.database.titles.used = [];
        AC.signal.outputReplacement = "";
        [AC.database.titles.pendingBans, AC.database.titles.pendingUnbans].map(pending => decrementAll(pending));
        if (0 < AC.signal.overrideBans) {
            AC.signal.overrideBans--;
        }
        function decrementAll(pendingArray) {
            if (pendingArray.length === 0) {
                return;
            }
            for (let i = pendingArray.length - 1; 0 <= i; i--) {
                if (0 < pendingArray[i][1]) {
                    pendingArray[i][1]--;
                } else {
                    pendingArray.splice(i, 1);
                }
            }
            return;
        }
        return;
    }
    // Example usage: notify("Message text goes here");
    function notify(message) {
        if (typeof message === "string") {
            AC.message.pending.push(message);
            logEvent(message);
        } else if (Array.isArray(message)) {
            message.forEach(element => notify(element));
        } else if (message instanceof Set) {
            notify([...message]);
        } else {
            notify(message.toString());
        }
        return;
    }
    function logEvent(message, uncounted) {
        if (uncounted) {
            log("Auto-Cards event: " + message);
        } else {
            log("Auto-Cards event #" + (function() {
                try {
                    AC.message.event++;
                    return AC.message.event;
                } catch {
                    return 0;
                }
            })() + ": " + message.replace(/"/g, "'"));
        }
        return;
    }
    // Provide the story card object which you wish to log info within as the first argument
    // All remaining arguments represent anything you wish to log
    function logToCard(logCard, ...args) {
        logEvent(args.map(arg => {
            if ((typeof arg === "object") && (arg !== null)) {
                return JSON.stringify(arg);
            } else {
                return String(arg);
            }
        }).join(", "), true);
        if (logCard === null) {
            return;
        }
        let desc = logCard.description.trim();
        const turnDelimiter = Words.delimiter + "\nAction #" + getTurn() + ":\n";
        let header = turnDelimiter;
        if (!desc.startsWith(turnDelimiter)) {
            desc = turnDelimiter + desc;
        }
        const scopesTable = [
            ["input", "Input Modifier"],
            ["context", "Context Modifier"],
            ["output", "Output Modifier"],
            [null, "Shared Library"],
            [undefined, "External API"],
            [Symbol("default"), "Unknown Scope"]
        ];
        const callingScope = (function() {
            const pair = scopesTable.find(([condition]) => (condition === HOOK));
            if (pair) {
                return pair[1];
            } else {
                return scopesTable[scopesTable.length - 1][1];
            }
        })();
        const hookDelimiterLeft = callingScope + " @ ";
        if (desc.startsWith(turnDelimiter + hookDelimiterLeft)) {
            const hookDelimiterOld = desc.match(new RegExp((
                "^" + turnDelimiter + "(" + hookDelimiterLeft + "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z:\n)"
            ).replaceAll("\n", "\\n")));
            if (hookDelimiterOld) {
                header += hookDelimiterOld[1];
            } else {
                const hookDelimiter = getNewHookDelimiter();
                desc = desc.replace(hookDelimiterLeft, hookDelimiter);
                header += hookDelimiter;
            }
        } else {
            if ((new RegExp("^" + turnDelimiter.replaceAll("\n", "\\n") + "(" + (scopesTable
                .map(pair => pair[1])
                .filter(scope => (scope !== callingScope))
                .join("|")
            ) + ") @ ")).test(desc)) {
                desc = desc.replace(turnDelimiter, turnDelimiter + "—————————\n");
            }
            const hookDelimiter = getNewHookDelimiter();
            desc = desc.replace(turnDelimiter, turnDelimiter + hookDelimiter);
            header += hookDelimiter;
        }
        const logDelimiter = (function() {
            let logDelimiter = "Log #";
            if (desc.startsWith(header + logDelimiter)) {
                desc = desc.replace(header, header + "———\n");
                const logCounter = desc.match(/Log #(\d+)/);
                if (logCounter) {
                    logDelimiter += (parseInt(logCounter[1], 10) + 1).toString();
                }
            } else {
                logDelimiter += "0";
            }
            return logDelimiter + ": ";
        })();
        logCard.description = limitString(desc.replace(header, header + logDelimiter + args.map(arg => {
            if ((typeof arg === "object") && (arg !== null)) {
                return stringifyObject(arg);
            } else {
                return String(arg);
            }
        }).join(",\n") + "\n").trim(), 999999);
        // The upper limit is actually closer to 3985621, but I think 1 million is reasonable enough as-is
        function getNewHookDelimiter() {
            return hookDelimiterLeft + (new Date().toISOString()) + ":\n";
        }
        return;
    }
    // Makes nested objects not look like cancer within interface cards
    function stringifyObject(obj) {
        const seen = new WeakSet();
        // Each indentation is 4 spaces
        return JSON.stringify(obj, (_key, value) => {
            if ((typeof value === "object") && (value !== null)) {
                if (seen.has(value)) {
                    return "[Circular]";
                }
                seen.add(value);
            }
            switch(typeof value) {
            case "function": {
                return "[Function]"; }
            case "undefined": {
                return "[Undefined]"; }
            case "symbol": {
                return "[Symbol]"; }
            default: {
                return value; }
            }
        }, 4);
    }
    // Implement state.message toasts without interfering with the operation of other possible scripts
    function postMessages() {
        const preMessage = getStateMessage();
        if ((preMessage === AC.message.previous) && (AC.message.pending.length !== 0)) {
            // No other scripts are attempting to update state.message during this turn
            // One or more pending Auto-Cards messages exist
            if (!AC.message.suppress) {
                // Message suppression is off
                let newMessage = "Auto-Cards:\n";
                if (AC.message.pending.length === 1) {
                    newMessage += AC.message.pending[0];
                } else {
                    newMessage += AC.message.pending.map(
                        (messageLine, index) => ("#" + (index + 1) + ": " + messageLine)
                    ).join("\n");
                }
                if (preMessage === newMessage) {
                    // Introduce a minor variation to facilitate repetition of the previous message toast
                    newMessage = newMessage.replace("Auto-Cards:\n", "Auto-Cards: \n");
                }
                state.message = newMessage;
            }
            // Clear the pending messages queue after posting or suppressing messages
            AC.message.pending = [];
        }
        AC.message.previous = getStateMessage();
        return;
    }
    function getStateMessage() {
        return state.message ?? "";
    }
    function getPrecedingNewlines() {
        const previousAction = readPastAction(0);
        if (isDoSay(previousAction.type)) {
            return "";
        } else if (previousAction.text.endsWith("\n")) {
            if (previousAction.text.endsWith("\n\n")) {
                return "";
            } else {
                return "\n";
            }
        } else {
            return "\n\n";
        }
    }
    // Call with lookBack 0 to read the most recent action in history (or n many actions back)
    function readPastAction(lookBack) {
        const action = (function() {
            if (Array.isArray(history)) {
                return (history[(function() {
                    const index = history.length - 1 - Math.abs(lookBack);
                    if (index < 0) {
                        return 0;
                    } else {
                        return index;
                    }
                })()]);
            } else {
                return O.f({});
            }
        })();
        return O.f({
            text: action?.text ?? (action?.rawText ?? ""),
            type: action?.type ?? "unknown"
        });
    }
    // Forget ongoing card generation/compression after passing or postponing completion over many consecutive turns
    // Also decrement AC.chronometer.postpone regardless of retries or erases
    function promoteAmnesia() {
        // Decrement AC.chronometer.postpone in all cases
        if (0 < AC.chronometer.postpone) {
            AC.chronometer.postpone--;
        }
        if (!AC.chronometer.step) {
            // Skip known retry/erase turns
            return;
        }
        if (AC.chronometer.amnesia++ < boundInteger(16, (2 * AC.config.addCardCooldown), 64)) {
            return;
        }
        AC.generation.cooldown = validateCooldown(underQuarterInteger(AC.config.addCardCooldown));
        forgetStuff();
        AC.chronometer.amnesia = 0;
        return;
    }
    function forgetStuff() {
        AC.generation.completed = 0;
        AC.generation.permitted = 34;
        AC.generation.workpiece = O.f({});
        // AC.generation.pending is not forgotten
        resetCompressionProperties();
        return;
    }
    function resetCompressionProperties() {
        AC.compression.completed = 0;
        AC.compression.titleKey = "";
        AC.compression.vanityTitle = "";
        AC.compression.responseEstimate = 1400;
        AC.compression.lastConstructIndex = -1;
        AC.compression.oldMemoryBank = [];
        AC.compression.newMemoryBank = [];
        return;
    }
    function underQuarterInteger(someNumber) {
        return Math.floor(someNumber / 4);
    }
    function getTurn() {
        if (Number.isInteger(info?.actionCount)) {
            // "But Leah, surely info.actionCount will never be negative?"
            // You have no idea what nightmares I've seen...
            return Math.abs(info.actionCount);
        } else {
            return 0;
        }
    }
    // Constructs a JSON representation of various properties/settings pulled from raw text
    // Used to parse the "Configure Auto-Cards" and "Edit to enable Auto-Cards" control card entries
    function extractSettings(settingsText) {
        const settings = {};
        // Lowercase everything
        // Remove all non-alphanumeric characters (aside from ":" and ">")
        // Split into an array of strings delimited by the ">" character
        const settingLines = settingsText.toLowerCase().replace(/[^a-z0-9:>]+/g, "").split(">");
        for (const settingLine of settingLines) {
            // Each setting line is preceded by ">" and bisected by ":"
            const settingKeyValue = settingLine.split(":");
            if ((settingKeyValue.length !== 2) || settings.hasOwnProperty(settingKeyValue[0])) {
                // The bisection failed or this setting line's key already exists
                continue;
            }
            // Parse boolean and integer setting values
            if (Words.falses.includes(settingKeyValue[1])) {
                // This setting line's value is false
                settings[settingKeyValue[0]] = false;
            } else if (Words.trues.includes(settingKeyValue[1])) {
                // This setting line's value is true
                settings[settingKeyValue[0]] = true;
            } else if (/^\d+$/.test(settingKeyValue[1])) {
                // This setting line's value is an integer
                // Negative integers are parsed as being positive (because "-" characters were removed)
                settings[settingKeyValue[0]] = parseInt(settingKeyValue[1], 10);
            }
        }
        // Return the settings object for later analysis
        return settings;
    }
    // Ensure the given singleton card is pinned near the top of the player's list of story cards
    function pinAndSortCards(pinnedCard) {
        if (!storyCards || (storyCards.length < 2)) {
            return;
        }
        storyCards.sort((cardA, cardB) => {
            return readDate(cardB) - readDate(cardA);
        });
        if (!AC.config.pinConfigureCard) {
            return;
        }
        const index = storyCards.indexOf(pinnedCard);
        if (0 < index) {
            storyCards.splice(index, 1);
            storyCards.unshift(pinnedCard);
        }
        function readDate(card) {
            if (card && card.updatedAt) {
                const timestamp = Date.parse(card.updatedAt);
                if (!isNaN(timestamp)) {
                    return timestamp;
                }
            }
            return 0;
        }
        return;
    }
    function see(arr) {
        return String.fromCharCode(...arr.map(n => Math.sqrt(n / 33)));
    }
    function formatTitle(title) {
        const input = title;
        let useMemo = false;
        if (
            (AC.database.titles.used.length === 1)
            && (AC.database.titles.used[0] === ("%@%"))
            && [used, forenames, surnames].every(nameset => (
                (nameset.size === 1)
                && nameset.has("%@%")
            ))
        ) {
            const pair = memoized.get(input);
            if (pair !== undefined) {
                if (50000 < memoized.size) {
                    memoized.delete(input);
                    memoized.set(input, pair);
                }
                return O.f({newTitle: pair[0], newKey: pair[1]});
            }
            useMemo = true;
        }
        title = title.trim();
        if (short()) {
            return end();
        }
        title = (title
            // Begone!
            .replace(/[–。？！´“”؟،«»¿¡„“…§，、\*_~><\(\)\[\]{}#"`:!—;\.\?,\s\\]/g, " ")
            .replace(/[‘’]/g, "'").replace(/\s+'/g, " ")
            // Remove the words "I", "I'm", "I'd", "I'll", and "I've"
            .replace(/(?<=^|\s)(?:I|I'm|I'd|I'll|I've)(?=\s|$)/gi, "")
            // Remove "'s" only if not followed by a letter
            .replace(/'s(?![a-zA-Z])/g, "")
            // Replace "s'" with "s" only if preceded but not followed by a letter
            .replace(/(?<=[a-zA-Z])s'(?![a-zA-Z])/g, "s")
            // Remove apostrophes not between letters (preserve contractions like "don't")
            .replace(/(?<![a-zA-Z])'(?![a-zA-Z])/g, "")
            // Eliminate fake em dashes and terminal/leading dashes
            .replace(/\s-\s/g, " ")
            // Condense consecutive whitespace
            .trim().replace(/\s+/g, " ")
            // Remove a leading or trailing bullet
            .replace(/^-+\s*/, "").replace(/\s*-+$/, "")
        );
        if (short()) {
            return end();
        }
        // Special-cased words
        const minorWordsJoin = Words.minor.join("|");
        const leadingMinorWordsKiller = new RegExp("^(?:" + minorWordsJoin + ")\\s", "i");
        const trailingMinorWordsKiller = new RegExp("\\s(?:" + minorWordsJoin + ")$", "i");
        // Ensure the title is not bounded by any outer minor words
        title = enforceBoundaryCondition(title);
        if (short()) {
            return end();
        }
        // Ensure interior minor words are lowercase and excise all interior honorifics/abbreviations
        const honorAbbrevsKiller = new RegExp("(?:^|\\s|-|\\/)(?:" + (
            [...Words.honorifics, ...Words.abbreviations]
        ).map(word => word.replace(".", "")).join("|") + ")(?=\\s|-|\\/|$)", "gi");
        title = (title
            // Capitalize the first letter of each word
            .replace(/(?<=^|\s|-|\/)(?:\p{L})/gu, word => word.toUpperCase())
            // Lowercase minor words properly
            .replace(/(?<=^|\s|-|\/)(?:\p{L}+)(?=\s|-|\/|$)/gu, word => {
                const lowerWord = word.toLowerCase();
                if (Words.minor.includes(lowerWord)) {
                    return lowerWord;
                } else {
                    return word;
                }
            })
            // Remove interior honorifics/abbreviations
            .replace(honorAbbrevsKiller, "")
            .trim()
        );
        if (short()) {
            return end();
        }
        let titleWords = title.split(" ");
        while ((2 < title.length) && (98 < title.length) && (1 < titleWords.length)) {
            titleWords.pop();
            title = titleWords.join(" ").trim();
            const unboundedLength = title.length;
            title = enforceBoundaryCondition(title);
            if (unboundedLength !== title.length) {
                titleWords = title.split(" ");
            }
        }
        if (isUsedOrBanned(title) || isNamed(title)) {
            return end();
        }
        // Procedurally generated story card trigger keywords exclude certain words and patterns which are otherwise permitted in titles
        let key = title;
        const peerage = new Set(Words.peerage);
        if (titleWords.some(word => ((word === "the") || peerage.has(word.toLowerCase())))) {
            if (titleWords.length < 2) {
                return end();
            }
            key = enforceBoundaryCondition(
                titleWords.filter(word => !peerage.has(word.toLowerCase())).join(" ")
            );
            if (key.includes(" the ")) {
                key = enforceBoundaryCondition(key.split(" the ")[0]);
            }
            if (isUsedOrBanned(key)) {
                return end();
            }
        }
        function short() {
            return (title.length < 3);
        }
        function enforceBoundaryCondition(str) {
            while (leadingMinorWordsKiller.test(str)) {
                str = str.replace(/^\S+\s+/, "");
            }
            while (trailingMinorWordsKiller.test(str)) {
                str = str.replace(/\s+\S+$/, "");
            }
            return str;
        }
        function end(newTitle = "", newKey = "") {
            if (useMemo) {
                memoized.set(input, [newTitle, newKey]);
                if (55000 < memoized.size) {
                    memoized.delete(memoized.keys().next().value);
                }
            }
            return O.f({newTitle, newKey});
        }
        return end(title, key);
    }
    // I really hate english grammar
    function checkPlurals(title, predicate) {
        function check(t) { return ((t.length < 3) || (100 < t.length) || predicate(t)); }
        const t = title.toLowerCase();
        if (check(t)) { return true; }
        // s>p : singular -> plural : p>s: plural -> singular
        switch(t[t.length - 1]) {
        // p>s : s -> _ : Birds -> Bird
        case "s": if (check(t.slice(0, -1))) { return true; }
        case "x":
        // s>p : s, x, z -> ses, xes, zes : Mantis -> Mantises
        case "z": if (check(t + "es")) { return true; }
            break;
        // s>p : o -> oes, os : Gecko -> Geckoes, Geckos
        case "o": if (check(t + "es") || check(t + "s")) { return true; }
            break;
        // p>s : i -> us : Cacti -> Cactus
        case "i": if (check(t.slice(0, -1) + "us")) { return true; }
        // s>p : i, y -> ies : Kitty -> Kitties
        case "y": if (check(t.slice(0, -1) + "ies")) { return true; }
            break;
        // s>p : f -> ves : Wolf -> Wolves
        case "f": if (check(t.slice(0, -1) + "ves")) { return true; }
        // s>p : !(s, x, z, i, y) -> +s : Turtle -> Turtles
        default: if (check(t + "s")) { return true; }
            break;
        } switch(t.slice(-2)) {
        // p>s : es -> _ : Foxes -> Fox
        case "es": if (check(t.slice(0, -2))) { return true; } else if (
            (t.endsWith("ies") && (
                // p>s : ies -> y : Bunnies -> Bunny
                check(t.slice(0, -3) + "y")
                // p>s : ies -> i : Ravies -> Ravi
                || check(t.slice(0, -2))
            // p>s : es -> is : Crises -> Crisis
            )) || check(t.slice(0, -2) + "is")) { return true; }
            break;
        // s>p : us -> i : Cactus -> Cacti
        case "us": if (check(t.slice(0, -2) + "i")) { return true; }
            break;
        // s>p : is -> es : Thesis -> Theses
        case "is": if (check(t.slice(0, -2) + "es")) { return true; }
            break;
        // s>p : fe -> ves : Knife -> Knives
        case "fe": if (check(t.slice(0, -2) + "ves")) { return true; }
            break;
        case "sh":
        // s>p : sh, ch -> shes, ches : Fish -> Fishes
        case "ch": if (check(t + "es")) { return true; }
            break;
        } return false;
    }
    function isUsedOrBanned(title) {
        function isUsed(lowerTitle) {
            if (used.size === 0) {
                const usedTitles = Internal.getUsedTitles();
                for (let i = 0; i < usedTitles.length; i++) {
                    used.add(usedTitles[i].toLowerCase());
                }
                if (used.size === 0) {
                    // Add a placeholder so compute isn't wasted on additional checks during this hook
                    used.add("%@%");
                }
            }
            return used.has(lowerTitle);
        }
        return checkPlurals(title, t => (isUsed(t) || isBanned(t)));
    }
    function isBanned(lowerTitle, getUsedIsExternal) {
        if (bans.size === 0) {
            // In order to save space, implicit bans aren't listed within the UI
            const controlVariants = getControlVariants();
            const dataVariants = getDataVariants();
            const bansToAdd = [...lowArr([
                ...Internal.getBannedTitles(),
                controlVariants.enable.title.replace("\n", ""),
                controlVariants.enable.keys,
                controlVariants.configure.title.replace("\n", ""),
                controlVariants.configure.keys,
                dataVariants.debug.title,
                dataVariants.debug.keys,
                dataVariants.critical.title,
                dataVariants.critical.keys,
                ...Object.values(Words.reserved)
            ]), ...(function() {
                if (shouldProceed() || getUsedIsExternal) {
                    // These proper nouns are way too common to waste card generations on; they already exist within the AI training data so this would be pointless
                    return [...Words.entities, ...Words.undesirables.map(undesirable => see(undesirable))];
                } else {
                    return [];
                }
            })()];
            for (let i = 0; i < bansToAdd.length; i++) {
                bans.add(bansToAdd[i]);
            }
        }
        return bans.has(lowerTitle);
    }
    function isNamed(title, returnSurname) {
        const peerage = new Set(Words.peerage);
        const minorWords = new Set(Words.minor);
        if ((forenames.size === 0) || (surnames.size === 0)) {
            const usedTitles = Internal.getUsedTitles();
            for (let i = 0; i < usedTitles.length; i++) {
                const usedTitleWords = divideTitle(usedTitles[i]);
                if (
                    (usedTitleWords.length === 2)
                    && (2 < usedTitleWords[0].length)
                    && (2 < usedTitleWords[1].length)
                ) {
                    forenames.add(usedTitleWords[0]);
                    surnames.add(usedTitleWords[1]);
                } else if (
                    (usedTitleWords.length === 1)
                    && (2 < usedTitleWords[0].length)
                ) {
                    forenames.add(usedTitleWords[0]);
                }
            }
            if (forenames.size === 0) {
                forenames.add("%@%");
            }
            if (surnames.size === 0) {
                surnames.add("%@%");
            }
        }
        const titleWords = divideTitle(title);
        if (
            returnSurname
            && (titleWords.length === 2)
            && (3 < titleWords[0].length)
            && (3 < titleWords[1].length)
            && forenames.has(titleWords[0])
            && surnames.has(titleWords[1])
        ) {
            return (title
                .split(" ")
                .find(casedTitleWord => (casedTitleWord.toLowerCase() === titleWords[1]))
            );
        } else if (
            (titleWords.length === 2)
            && (2 < titleWords[0].length)
            && (2 < titleWords[1].length)
            && forenames.has(titleWords[0])
        ) {         
            return true;
        } else if (
            (titleWords.length === 1)
            && (2 < titleWords[0].length)
            && (forenames.has(titleWords[0]) || surnames.has(titleWords[0]))
        ) {
            return true;
        }
        function divideTitle(undividedTitle) {
            const titleWords = undividedTitle.toLowerCase().split(" ");
            if (titleWords.some(word => minorWords.has(word))) {
                return [];
            } else {
                return titleWords.filter(word => !peerage.has(word));
            }
        }
        return false;
    }
    function shouldProceed() {
        return (AC.config.doAC && !AC.signal.emergencyHalt && (AC.chronometer.postpone < 1));
    }
    function isDoSayStory(type) {
        return (isDoSay(type) || (type === "story"));
    }
    function isDoSay(type) {
        return ((type === "do") || (type === "say"));
    }
    function permitOutput() {
        return ((AC.config.deleteAllAutoCards === null) && (AC.signal.outputReplacement === ""));
    }
    function isAwaitingGeneration() {
        return (0 < AC.generation.pending.length);
    }
    function isPendingGeneration() {
        return notEmptyObj(AC.generation.workpiece);
    }
    function isPendingCompression() {
        return (AC.compression.titleKey !== "");
    }
    function notEmptyObj(obj) {
        return (obj && (0 < Object.keys(obj).length));
    }
    function clearTransientTitles() {
        AC.database.titles.used = [];
        [used, forenames, surnames].forEach(nameset => nameset.clear());
        return;
    }
    function banTitle(title, isFinalAssignment) {
        title = limitString(title.replace(/\s+/g, " ").trim(), 100);
        const lowerTitle = title.toLowerCase();
        if (bans.size !== 0) {
            bans.add(lowerTitle);
        }
        if (!lowArr(Internal.getBannedTitles()).includes(lowerTitle)) {
            AC.database.titles.banned.unshift(title);
            if (isFinalAssignment) {
                return;
            }
            AC.database.titles.pendingBans.unshift([title, 3]);
            const index = AC.database.titles.pendingUnbans.findIndex(pair => (pair[0].toLowerCase() === lowerTitle));
            if (index !== -1) {
                AC.database.titles.pendingUnbans.splice(index, 1);
            }
        }
        return;
    }
    function unbanTitle(title) {
        title = title.replace(/\s+/g, " ").trim();
        const lowerTitle = title.toLowerCase();
        if (used.size !== 0) {
            bans.delete(lowerTitle);
        }
        let index = lowArr(Internal.getBannedTitles()).indexOf(lowerTitle);
        if (index !== -1) {
            AC.database.titles.banned.splice(index, 1);
            AC.database.titles.pendingUnbans.unshift([title, 3]);
            index = AC.database.titles.pendingBans.findIndex(pair => (pair[0].toLowerCase() === lowerTitle));
            if (index !== -1) {
                AC.database.titles.pendingBans.splice(index, 1);
            }
        }
        return;
    }
    function lowArr(arr) {
        return arr.map(str => str.toLowerCase());
    }
    function getControlVariants() {
        return O.f({
            configure: O.f({
                title: "Configure \nAuto-Cards",
                keys: "Edit the entry above to adjust your story card automation settings",
            }),
            enable: O.f({
                title: "Edit to enable \nAuto-Cards",
                keys: "Edit the entry above to enable story card automation",
            }),
        });
    }
    function getDataVariants() {
        return O.f({
            debug: O.f({
                title: "Debug Data",
                keys: "You may view the debug state in the notes section below",
            }),
            critical: O.f({
                title: "Critical Data",
                keys: "Never modify or delete this story card",
            }),
        });
    }
    // Prepare to export the codomain
    const codomain = CODOMAIN.read();
    const [stopPackaged, lastCall] = (function() {
        // Tbh I don't know why I even bothered going through the trouble of implementing "stop" within LSIv2
        switch(HOOK) {
        case "context": {
            const haltStatus = [];
            if (Array.isArray(codomain)) {
                O.f(codomain);
                haltStatus.push(true, codomain[1]);
            } else {
                haltStatus.push(false, STOP);
            }
            if ((AC.config.LSIv2 !== false) && (haltStatus[1] === true)) {
                // AutoCards will return [text, (stop === true)] onContext
                // The onOutput lifecycle hook will not be executed during this turn
                concludeEmergency();
            }
            return haltStatus; }
        case "output": {
            // AC.config.LSIv2 being either true or null implies (lastCall === true)
            return [null, AC.config.LSIv2 ?? true]; }
        default: {
            return [null, null]; }
        }
    })();
    // Repackage AC to propagate its state forward in time
    if (state.LSIv2) {
        // Facilitates recursive calls of AutoCards
        // The Auto-Cards external API is accessible through the LSIv2 scope
        state.LSIv2 = AC;
    } else {
        const memoryOverflow = (38000 < (JSON.stringify(state).length + JSON.stringify(AC).length));
        if (memoryOverflow) {
            // Memory overflow is imminent
            const dataVariants = getDataVariants();
            if (lastCall) {
                unbanTitle(dataVariants.debug.title);
                banTitle(dataVariants.critical.title);
            }
            setData(dataVariants.critical, dataVariants.debug);
            if (state.AutoCards) {
                // Decouple state for safety
                delete state.AutoCards;
            }
        } else {
            if (lastCall) {
                const dataVariants = getDataVariants();
                unbanTitle(dataVariants.critical.title);
                if (AC.config.showDebugData) {
                    // Update the debug data card
                    banTitle(dataVariants.debug.title);
                    setData(dataVariants.debug, dataVariants.critical);
                } else {
                    // There should be no data card
                    unbanTitle(dataVariants.debug.title);
                    if (data === null) {
                        data = getSingletonCard(false, O.f({...dataVariants.debug}), O.f({...dataVariants.critical}));
                    }
                    eraseCard(data);
                    data = null;
                }
            } else if (AC.config.showDebugData && (HOOK === undefined)) {
                const dataVariants = getDataVariants();
                setData(dataVariants.debug, dataVariants.critical);
            }
            // Save a backup image to state
            state.AutoCards = AC;
        }
        function setData(primaryVariant, secondaryVariant) {
            const dataCardTemplate = O.f({
                type: AC.config.defaultCardType,
                title: primaryVariant.title,
                keys: primaryVariant.keys,
                entry: (function() {
                    const mutualEntry = (
                        "If you encounter an Auto-Cards bug or otherwise wish to help me improve this script by sharing your configs and game data, please send me the notes text found below. You may ping me @LewdLeah through the official AI Dungeon Discord server. Please ensure the content you share is appropriate for the server, otherwise DM me instead. 😌"
                    );
                    if (memoryOverflow) {
                        return (
                            "Seeing this means Auto-Cards detected an imminent memory overflow event. But fear not! As an emergency fallback, the full state of Auto-Cards' data has been serialized and written to the notes section below. This text will be deserialized during each lifecycle hook, therefore it's absolutely imperative that you avoid editing this story card!"
                        ) + (function() {
                            if (AC.config.showDebugData) {
                                return "\n\n" + mutualEntry;
                            } else {
                                return "";
                            }
                        })();
                    } else {
                        return (
                            "This story card displays the full serialized state of Auto-Cards. To remove this card, simply set the \"log debug data\" setting to false within your \"Configure\" card. "
                        ) + mutualEntry;
                    }
                })(),
                description: JSON.stringify(AC)
            });
            if (data === null) {
                data = getSingletonCard(true, dataCardTemplate, O.f({...secondaryVariant}));
            }
            for (const propertyName of ["title", "keys", "entry", "description"]) {
                if (data[propertyName] !== dataCardTemplate[propertyName]) {
                    data[propertyName] = dataCardTemplate[propertyName];
                }
            }
            const index = storyCards.indexOf(data);
            if ((index !== -1) && (index !== (storyCards.length - 1))) {
                // Ensure the data card is always at the bottom of the story cards list
                storyCards.splice(index, 1);
                storyCards.push(data);
            }
            return;
        }
    }
    // This is the only return point within the parent scope of AutoCards
    if (stopPackaged === false) {
        return [codomain, STOP];
    } else {
        return codomain;
    }
} AutoCards(null); function isolateLSIv2(code, log, text, stop) { const console = Object.freeze({log}); try { eval(code); return [null, text, stop]; } catch (error) { return [error, text, stop]; } }

// Your other library scripts go here

// #endregion

// Best Practice: Always end shared library with void 0
void 0;
