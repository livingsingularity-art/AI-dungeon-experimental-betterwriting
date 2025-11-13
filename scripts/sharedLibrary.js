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
        adaptive: false,        // Auto-adjust based on context
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

    // System
    system: {
        persistState: true,     // Save state between sessions
        enableAnalytics: false  // Track metrics over time
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
    if (CONFIG.vs.debugLogging || CONFIG.bonepoke.debugLogging) {
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
        state.initialized = true;
        safeLog('State initialized', 'success');
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

    // Common verbs
    'said': ['stated', 'mentioned', 'remarked', 'noted', 'declared', 'expressed', 'uttered', 'voiced'],
    'got': ['obtained', 'received', 'acquired', 'gained', 'secured'],
    'get': ['obtain', 'receive', 'acquire', 'gain', 'secure'],
    'went': ['moved', 'proceeded', 'traveled', 'headed', 'walked'],
    'came': ['arrived', 'approached', 'entered', 'appeared'],
    'made': ['created', 'formed', 'crafted', 'produced', 'fashioned'],
    'looked': ['gazed', 'stared', 'glanced', 'peered', 'observed'],
    'turned': ['rotated', 'pivoted', 'spun', 'twisted', 'shifted'],
    'walked': ['strode', 'paced', 'stepped', 'moved', 'proceeded'],
    'asked': ['inquired', 'questioned', 'queried', 'requested'],
    'took': ['grabbed', 'seized', 'grasped', 'snatched', 'clutched'],
    'gave': ['offered', 'handed', 'presented', 'provided', 'extended'],
    'felt': ['sensed', 'perceived', 'experienced', 'noticed'],
    'heard': ['detected', 'caught', 'perceived', 'noticed'],
    'saw': ['spotted', 'noticed', 'observed', 'glimpsed', 'caught sight of'],
    'moved': ['shifted', 'stirred', 'budged', 'relocated'],
    'stood': ['rose', 'remained upright', 'positioned herself', 'positioned himself'],
    'sat': ['settled', 'perched', 'rested', 'seated herself', 'seated himself'],
    'pulled': ['tugged', 'yanked', 'drew', 'dragged'],
    'pushed': ['shoved', 'pressed', 'thrust', 'nudged'],
    'held': ['gripped', 'clutched', 'grasped', 'clenched'],
    'opened': ['unlocked', 'unsealed', 'spread', 'unlatched'],
    'closed': ['shut', 'sealed', 'latched', 'fastened'],
    'grabbed': ['seized', 'snatched', 'clutched', 'gripped'],
    'touched': ['grazed', 'brushed', 'contacted', 'felt'],
    'smiled': ['grinned', 'beamed', 'smirked'],
    'laughed': ['chuckled', 'giggled', 'snickered', 'cackled'],
    'nodded': ['bobbed her head', 'bobbed his head', 'dipped her chin', 'dipped his chin'],
    'shook': ['trembled', 'quivered', 'shuddered', 'vibrated'],
    'whispered': ['murmured', 'muttered', 'breathed', 'hissed'],
    'shouted': ['yelled', 'called out', 'hollered', 'bellowed'],
    'spoke': ['talked', 'conversed', 'verbalized', 'articulated'],
    'watched': ['observed', 'monitored', 'studied', 'eyed'],
    'waited': ['paused', 'lingered', 'remained', 'stayed'],
    'tried': ['attempted', 'endeavored', 'sought', 'ventured'],
    'knew': ['understood', 'realized', 'recognized', 'comprehended'],
    'thought': ['considered', 'pondered', 'reflected', 'mused'],
    'wanted': ['desired', 'craved', 'wished', 'yearned'],
    'needed': ['required', 'demanded', 'necessitated'],
    'seemed': ['appeared', 'looked', 'sounded'],
    'began': ['started', 'commenced', 'initiated', 'launched'],
    'stopped': ['halted', 'ceased', 'paused', 'froze'],
    'continued': ['proceeded', 'persisted', 'carried on', 'maintained'],
    'followed': ['trailed', 'pursued', 'tracked', 'shadowed'],
    'reached': ['extended', 'stretched', 'arrived at', 'attained'],
    'leaned': ['tilted', 'inclined', 'bent', 'slanted'],
    'pressed': ['pushed', 'squeezed', 'compressed', 'applied pressure'],
    'lifted': ['raised', 'hoisted', 'elevated', 'picked up'],
    'dropped': ['released', 'let fall', 'let go of', 'discarded'],

    // Body parts (common in repetitive prose)
    'eyes': ['gaze', 'stare', 'glance', 'look', 'vision'],
    'hands': ['fingers', 'palms', 'grip', 'fists'],
    'face': ['visage', 'features', 'countenance', 'expression'],
    'voice': ['tone', 'words', 'speech', 'vocals'],
    'head': ['skull', 'crown', 'noggin'],
    'hair': ['locks', 'tresses', 'mane', 'strands'],
    'lips': ['mouth', 'maw'],
    'teeth': ['fangs', 'incisors', 'chompers'],
    'arms': ['limbs', 'appendages'],
    'legs': ['limbs', 'shanks'],
    'feet': ['tootsies', 'paws'],
    'shoulders': ['blades'],
    'chest': ['torso', 'breast'],
    'back': ['spine', 'rear'],
    'neck': ['throat', 'nape'],
    'skin': ['flesh', 'hide', 'complexion'],
    'heart': ['ticker', 'pulse'],
    'breath': ['respiration', 'exhalation', 'inhalation'],
    'body': ['form', 'figure', 'physique', 'frame'],
    'fingers': ['digits', 'hands'],
    'throat': ['neck', 'gullet', 'esophagus'],

    // Common adjectives
    'big': ['large', 'huge', 'enormous', 'massive', 'substantial', 'sizeable'],
    'small': ['tiny', 'little', 'minuscule', 'compact', 'petite'],
    'good': ['fine', 'excellent', 'pleasant', 'favorable', 'decent', 'quality'],
    'bad': ['poor', 'unpleasant', 'unfavorable', 'awful', 'terrible', 'negative'],
    'old': ['aged', 'ancient', 'elderly', 'weathered', 'vintage'],
    'new': ['fresh', 'recent', 'modern', 'novel', 'contemporary'],
    'dark': ['dim', 'shadowy', 'murky', 'gloomy', 'obscure'],
    'light': ['bright', 'illuminated', 'radiant', 'luminous', 'pale'],
    'red': ['crimson', 'scarlet', 'ruby', 'vermillion'],
    'blue': ['azure', 'cobalt', 'navy', 'sapphire'],
    'green': ['emerald', 'jade', 'verdant', 'olive'],
    'white': ['ivory', 'pale', 'alabaster', 'cream'],
    'black': ['ebony', 'obsidian', 'raven', 'coal'],
    'gray': ['grey', 'silver', 'ashen', 'slate'],
    'brown': ['tan', 'beige', 'chestnut', 'umber'],
    'yellow': ['golden', 'amber', 'blonde', 'corn'],
    'purple': ['violet', 'lavender', 'plum', 'mauve'],
    'orange': ['amber', 'tangerine', 'rust', 'copper'],
    'soft': ['gentle', 'tender', 'delicate', 'plush'],
    'hard': ['solid', 'firm', 'rigid', 'stiff'],
    'hot': ['warm', 'heated', 'burning', 'scorching'],
    'cold': ['cool', 'chilly', 'frigid', 'icy'],
    'wet': ['damp', 'moist', 'soggy', 'drenched'],
    'dry': ['arid', 'parched', 'dehydrated'],
    'loud': ['noisy', 'deafening', 'booming', 'thunderous'],
    'quiet': ['silent', 'hushed', 'muted', 'still'],
    'fast': ['quick', 'rapid', 'swift', 'speedy'],
    'slow': ['sluggish', 'gradual', 'leisurely', 'unhurried'],
    'heavy': ['weighty', 'massive', 'ponderous', 'hefty'],
    'empty': ['vacant', 'hollow', 'void', 'bare'],
    'full': ['filled', 'packed', 'loaded', 'brimming'],
    'long': ['lengthy', 'extended', 'prolonged', 'elongated'],
    'short': ['brief', 'compact', 'concise', 'abbreviated'],
    'wide': ['broad', 'expansive', 'extensive', 'spacious'],
    'narrow': ['slim', 'slender', 'thin', 'tight'],
    'high': ['tall', 'elevated', 'towering', 'lofty'],
    'deep': ['profound', 'bottomless', 'cavernous'],
    'thick': ['dense', 'chunky', 'hefty', 'substantial'],
    'thin': ['slender', 'slim', 'lean', 'gaunt'],
    'strong': ['powerful', 'mighty', 'robust', 'sturdy'],
    'weak': ['feeble', 'frail', 'fragile', 'delicate'],
    'rough': ['coarse', 'jagged', 'uneven', 'rugged'],
    'smooth': ['sleek', 'polished', 'even', 'silky'],
    'sharp': ['keen', 'pointed', 'acute', 'piercing'],
    'dull': ['blunt', 'boring', 'lifeless', 'muted'],
    'clean': ['pristine', 'spotless', 'pure', 'immaculate'],
    'dirty': ['filthy', 'grimy', 'soiled', 'unclean'],
    'beautiful': ['lovely', 'gorgeous', 'stunning', 'attractive'],
    'ugly': ['unattractive', 'unsightly', 'hideous', 'grotesque'],

    // Common nouns
    'thing': ['object', 'item', 'element', 'matter'],
    'stuff': ['items', 'objects', 'materials', 'belongings'],
    'place': ['location', 'spot', 'site', 'area', 'venue'],
    'time': ['moment', 'period', 'instant', 'duration', 'interval'],
    'way': ['manner', 'method', 'approach', 'path', 'route'],
    'room': ['chamber', 'space', 'quarters', 'compartment'],
    'door': ['entrance', 'doorway', 'portal', 'threshold', 'entry'],
    'wall': ['partition', 'barrier', 'surface', 'panel'],
    'floor': ['ground', 'surface', 'flooring', '底'],
    'window': ['pane', 'opening', 'aperture'],
    'table': ['desk', 'surface', 'counter'],
    'chair': ['seat', 'stool', 'bench'],
    'light': ['illumination', 'glow', 'radiance', 'lamp'],
    'sound': ['noise', 'audio', 'tone', 'resonance'],
    'smell': ['scent', 'odor', 'aroma', 'fragrance'],
    'taste': ['flavor', 'savor', 'tang'],
    'touch': ['contact', 'feel', 'sensation'],
    'air': ['atmosphere', 'breeze', 'wind'],
    'water': ['liquid', 'fluid', 'moisture'],
    'fire': ['flame', 'blaze', 'inferno'],
    'earth': ['ground', 'soil', 'dirt', 'terrain'],
    'sky': ['heavens', 'firmament', 'atmosphere'],
    'ground': ['earth', 'floor', 'terrain', 'surface'],
    'street': ['road', 'avenue', 'lane', 'pathway'],
    'house': ['home', 'dwelling', 'residence', 'abode'],
    'building': ['structure', 'edifice', 'construction'],
    'city': ['town', 'metropolis', 'municipality', 'urban center'],
    'world': ['globe', 'planet', 'earth', 'realm'],
    'person': ['individual', 'human', 'being', 'soul'],
    'man': ['gentleman', 'male', 'fellow', 'guy'],
    'woman': ['lady', 'female', 'gal'],
    'child': ['kid', 'youngster', 'youth', 'minor'],
    'friend': ['companion', 'pal', 'buddy', 'associate'],
    'enemy': ['foe', 'adversary', 'opponent', 'rival'],
    'moment': ['instant', 'second', 'beat', 'breath'],
    'minute': ['moment', 'instant', 'while'],
    'hour': ['period', 'span', 'stretch'],
    'night': ['evening', 'darkness', 'nighttime'],
    'morning': ['dawn', 'daybreak', 'sunrise'],
    'afternoon': ['midday', 'daytime'],
    'shadow': ['shade', 'silhouette', 'darkness', 'outline'],
    'silence': ['quiet', 'stillness', 'hush', 'calm'],
    'noise': ['sound', 'racket', 'clamor', 'din'],
    'word': ['term', 'expression', 'utterance'],
    'question': ['query', 'inquiry', 'interrogation'],
    'answer': ['response', 'reply', 'solution'],
    'problem': ['issue', 'difficulty', 'challenge', 'complication'],
    'idea': ['thought', 'notion', 'concept', 'plan'],
    'feeling': ['emotion', 'sensation', 'sentiment'],
    'pain': ['ache', 'hurt', 'suffering', 'discomfort'],
    'pleasure': ['delight', 'enjoyment', 'satisfaction'],

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
     */
    const generateInstruction = () => {
        if (!CONFIG.vs.enabled) return '';

        const { k, tau } = CONFIG.vs;

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
     */
    const analyzeContext = (context) => {
        if (!CONFIG.vs.adaptive) return { k: CONFIG.vs.k, tau: CONFIG.vs.tau };

        const isDialogue = context.includes('"') || /\bsaid\b/i.test(context);
        const isAction = /\b(run|fight|move|open|close|attack)\b/i.test(context);
        const isDescriptive = context.length > 500;

        // Adapt parameters based on context type
        if (isDialogue) {
            return { k: 7, tau: 0.12 };  // More variety in speech
        } else if (isAction) {
            return { k: 5, tau: 0.08 };  // Surprising but coherent actions
        } else if (isDescriptive) {
            return { k: 4, tau: 0.15 };  // Moderate for descriptions
        }

        return { k: CONFIG.vs.k, tau: CONFIG.vs.tau };
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
     */
    const updateCard = () => {
        const card = ensureCard();
        if (card) {
            card.entry = generateInstruction();
        }
    };

    return {
        generateInstruction,
        analyzeContext,
        ensureCard,
        updateCard,
        getInstruction: () => {
            ensureCard();
            return generateInstruction();
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
        generateSuggestions
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

// #endregion

// Best Practice: Always end shared library with void 0
void 0;
