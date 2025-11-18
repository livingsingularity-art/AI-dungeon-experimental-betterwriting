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
 * @version 2.4.0
 * @license MIT
 * ============================================================================
 */

// #region Configuration

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
        debugLogging: false     // Console logging
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
        tempIncreaseChance: 15,         // % chance when heat high
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
        qualityThresholdForIncrease: 3.0,

        // VS INTEGRATION
        temperatureAffectsVS: true,

        // COMMAND INTEGRATION
        reqIncreasesHeat: true,
        reqHeatBonus: 2,
        parenthesesIncreasesHeat: true,
        parenthesesHeatBonus: 1,

        // DEBUG
        debugLogging: false,
        logStateChanges: true
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

        // Dimension thresholds (trigger smart selection when score is low)
        emotionThreshold: 2,    // Boost emotion if Emotional Strength < 2
        precisionThreshold: 2,  // Boost precision if Character Clarity < 2

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

        // Debug
        debugLogging: false,
        logReplacementReasons: true,  // Show WHY each replacement was chosen
        logContextAnalysis: false      // Show context matching details
    },

    // System
    system: {
        persistState: true,     // Save state between sessions
        enableAnalytics: true   // Track metrics over time (NOW ENABLED for NGO)
    }
};

// #endregion

// #region Utilities

/**
 * Safe console logging that respects config
 * @param {string} message - Message to log
 * @param {string} [level='info'] - Log level
 */
const safeLog = (message, level = 'info') => {
    if (CONFIG.vs.debugLogging ||
        CONFIG.bonepoke.debugLogging ||
        (CONFIG.smartReplacement && CONFIG.smartReplacement.debugLogging)) {
        const prefix = level === 'error' ? '❌' :
                      level === 'warn' ? '⚠️' :
                      level === 'success' ? '✅' : 'ℹ️';
        log(`${prefix} ${message}`);
    }
};

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

        // Store original author's note
        if (state.memory && state.memory.authorsNote) {
            state.originalAuthorsNote = state.memory.authorsNote;
        } else {
            state.originalAuthorsNote = '';
        }

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

    // Create card with temporary title
    addStoryCard("%TEMP%");

    // Find and configure the new card
    for (const [index, card] of storyCards.entries()) {
        if (card.title !== "%TEMP%") continue;

        card.type = type;
        card.title = title;
        card.keys = keys;
        card.entry = entry;
        card.description = description;

        // Move to correct position if needed
        if (index !== insertionIndex) {
            storyCards.splice(index, 1);
            storyCards.splice(insertionIndex, 0, card);
        }

        return Object.seal(card);
    }

    throw new Error("Failed to create story card");
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
    'man': ['guy', 'fellow', 'gentleman', 'male'],
    'woman': ['lady', 'gal', 'female'],
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
    }
};

/**
 * Get smart synonym based on Bonepoke analysis
 * Selects replacement that addresses the weakest quality dimension
 * @param {string} word - Word to replace
 * @param {Object} bonepokeScores - Bonepoke quality scores
 * @param {string} [context=''] - Surrounding text for context awareness
 * @returns {string} Best replacement synonym or original if no good match
 */
const getSmartSynonym = (word, bonepokeScores, context = '') => {
    if (!CONFIG.smartReplacement || !CONFIG.smartReplacement.enabled) {
        return getSynonym(word); // Fallback to random selection
    }

    const lower = word.toLowerCase();
    const wordData = ENHANCED_SYNONYM_MAP[lower];

    // No enhanced data available - use basic synonym
    if (!wordData || !wordData.synonyms || wordData.synonyms.length === 0) {
        return getSynonym(word);
    }

    // No Bonepoke scores available - use random from enhanced list
    if (!bonepokeScores || Object.keys(bonepokeScores).length === 0) {
        const randomIndex = Math.floor(Math.random() * wordData.synonyms.length);
        return wordData.synonyms[randomIndex].word;
    }

    // STEP 1: Identify weakest dimension
    const sortedDimensions = Object.entries(bonepokeScores)
        .sort((a, b) => a[1] - b[1]); // Lowest score first

    const [weakestDimension, weakestScore] = sortedDimensions[0];

    // STEP 2: Filter candidates based on dimension needs
    let candidates = wordData.synonyms.slice(); // Copy array

    // Apply dimension-specific filtering
    if (weakestScore <= CONFIG.smartReplacement.emotionThreshold &&
        weakestDimension === 'Emotional Strength') {
        // Need HIGH emotion words
        candidates = candidates.filter(s => s.emotion >= 3);
        if (CONFIG.smartReplacement.debugLogging) {
            safeLog(`🎯 Filtering for high emotion (${weakestDimension} = ${weakestScore})`, 'info');
        }
    } else if (weakestScore <= CONFIG.smartReplacement.precisionThreshold &&
               weakestDimension === 'Character Clarity') {
        // Need HIGH precision words
        candidates = candidates.filter(s => s.precision >= 3);
        if (CONFIG.smartReplacement.debugLogging) {
            safeLog(`🎯 Filtering for high precision (${weakestDimension} = ${weakestScore})`, 'info');
        }
    } else if (weakestScore <= CONFIG.smartReplacement.emotionThreshold &&
               weakestDimension === 'Dialogue Weight' &&
               wordData.dialogueVerb) {
        // Need dialogue-specific verbs
        candidates = candidates.filter(s => s.dialogue === true);
        if (CONFIG.smartReplacement.debugLogging) {
            safeLog(`🎯 Filtering for dialogue verbs (${weakestDimension} = ${weakestScore})`, 'info');
        }
    }

    // STEP 3: If no candidates after filtering, use all
    if (candidates.length === 0) {
        candidates = wordData.synonyms.slice();
    }

    // PHASE 4: CONTEXT MATCHING - Analyze surrounding text for better synonym selection
    let contextKeywords = [];
    if (CONFIG.smartReplacement.enableContextMatching && context) {
        const contextLower = context.toLowerCase();

        // Extract context keywords from surrounding text
        const fastWords = ['quick', 'sudden', 'rapid', 'swift', 'abrupt', 'instant', 'hurried'];
        const slowWords = ['slow', 'gradual', 'steady', 'leisurely', 'deliberate'];
        const gentleWords = ['gentle', 'soft', 'tender', 'calm', 'peaceful', 'quiet'];
        const forcefulWords = ['violent', 'forceful', 'aggressive', 'powerful', 'intense', 'strong'];

        if (fastWords.some(w => contextLower.includes(w))) contextKeywords.push('fast');
        if (slowWords.some(w => contextLower.includes(w))) contextKeywords.push('slow');
        if (gentleWords.some(w => contextLower.includes(w))) contextKeywords.push('gentle');
        if (forcefulWords.some(w => contextLower.includes(w))) contextKeywords.push('forceful');

        if (CONFIG.smartReplacement.logContextAnalysis && contextKeywords.length > 0) {
            safeLog(`📝 Context keywords: ${contextKeywords.join(', ')}`, 'info');
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

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < candidates.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return candidates[i].word;
        }
    }

    // Fallback (shouldn't reach here)
    return candidates[candidates.length - 1].word;
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
        let card = getCard(c => c.title === VS_CARD_TITLE);

        if (!card) {
            card = buildCard(
                VS_CARD_TITLE,
                generateInstruction(),
                "System",
                "",  // No keys = always active
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
            new RegExp(`\\b${p}\\b`, 'i').test(fragment)
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
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) conflicts += matches.length;
        });

        NGO_WORD_LISTS.calming.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
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
            turn: state.ngoStats.totalTurns,
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

        // Process in order: @req, (...), @temp, @arc
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
        if (!state.commands.narrativeRequest || state.commands.narrativeRequestTTL <= 0) return '';

        return `<SYSTEM>
# Narrative shaping:
Weave the following concept into the next output in a subtle, immersive way:
${state.commands.narrativeRequest}
</SYSTEM>`;
    };

    /**
     * Build author's note layers for commands
     * @returns {Object} { reqGuidance, memoryGuidance }
     */
    const buildAuthorsNoteLayer = () => {
        const result = { reqGuidance: '', memoryGuidance: '' };

        if (state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
            result.reqGuidance = `PRIORITY: Immediately and naturally introduce: ${state.commands.narrativeRequest}`;
        }

        const memoryParts = [];
        if (state.commands.memory1 && state.commands.expiration1 > state.ngoStats.totalTurns) {
            memoryParts.push(`After the current phrase, flawlessly transition the story towards: ${state.commands.memory1}`);
        }
        if (state.commands.memory2 && state.commands.expiration2 > state.ngoStats.totalTurns) {
            memoryParts.push(`Additionally consider: ${state.commands.memory2}`);
        }
        if (state.commands.memory3 && state.commands.expiration3 > state.ngoStats.totalTurns) {
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
            state.ngoStats.requestsFulfilled++;
            safeLog(`✅ Request FULFILLED! (score: ${fulfillmentScore.toFixed(2)})`, 'success');
            return { fulfilled: true, score: fulfillmentScore, reason: 'threshold_met' };
        } else {
            state.commands.narrativeRequestTTL--;

            if (state.commands.narrativeRequestTTL <= 0) {
                state.commands.narrativeRequest = null;
                state.ngoStats.requestsFailed++;
                safeLog('❌ Request EXPIRED', 'warn');
                return { fulfilled: false, score: fulfillmentScore, reason: 'ttl_expired' };
            }

            return { fulfilled: false, score: fulfillmentScore, reason: 'pending' };
        }
    };

    /**
     * Clean up expired memories
     * @returns {number} Number of memories expired
     */
    const cleanupExpiredMemories = () => {
        let expired = 0;

        if (state.commands.expiration1 && state.commands.expiration1 <= state.ngoStats.totalTurns) {
            state.commands.memory1 = '';
            state.commands.expiration1 = null;
            expired++;
        }

        if (state.commands.expiration2 && state.commands.expiration2 <= state.ngoStats.totalTurns) {
            state.commands.memory2 = '';
            state.commands.expiration2 = null;
            expired++;
        }

        if (state.commands.expiration3 && state.commands.expiration3 <= state.ngoStats.totalTurns) {
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
    const CARD_KEYS = ""; // No trigger keys - always active via script

    /**
     * Ensure the player's authors note card exists
     * Creates a blank template card if it doesn't exist
     * @returns {Object|null} The story card reference
     */
    const ensureCard = () => {
        // Find existing card
        const existingIndex = storyCards.findIndex(card => card.title === CARD_TITLE);

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

// #endregion

// Best Practice: Always end shared library with void 0
void 0;
