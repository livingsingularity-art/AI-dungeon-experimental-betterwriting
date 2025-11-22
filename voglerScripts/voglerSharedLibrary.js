/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER'S HERO'S JOURNEY - SHARED LIBRARY
 * Based on Christopher Vogler's 12-Stage Monomyth Structure
 * ============================================================================
 *
 * Implements the Writer's Journey framework for AI Dungeon storytelling
 * Tracks story progression through the 12 stages of the Hero's Journey
 * Provides dynamic guidance to shape narrative arc and pacing
 *
 * @version 1.0.0
 * @license MIT
 * @reference "The Writer's Journey: Mythic Structure for Writers" by Christopher Vogler
 * ============================================================================
 */

// #region Configuration

/**
 * Global configuration for Vogler's Hero's Journey system
 */
const VOGLER_CONFIG = {
    // System control
    enabled: true,
    debugLogging: false,
    logStageChanges: true,

    // Auto-advancement settings
    autoAdvance: true,
    turnsPerStage: 8,           // Average turns before considering stage advancement
    minTurnsPerStage: 4,        // Minimum turns before advancement
    maxTurnsPerStage: 15,       // Maximum turns before forced advancement

    // Stage transition
    requireKeyBeats: true,      // Require key story beats before advancing
    flexiblePacing: true,       // Allow player to influence stage duration

    // Integration with other systems
    integrateWithBonepoke: true,
    integrateWithVS: true,

    // Player commands
    stageCommand: '@stage',     // Manual stage control: @stage 5
    beatCommand: '@beat',       // Mark story beat completed: @beat mentor
};

// #endregion

// #region Hero's Journey Stages

/**
 * The 12 Stages of Vogler's Hero's Journey
 * Each stage contains guidance for the AI to shape the narrative
 */
const VOGLER_STAGES = {
    1: {
        name: "Ordinary World",
        description: "The hero's everyday life before the adventure begins",
        authorNoteGuidance: "Establish the protagonist's normal life, relationships, and world. Show what they have to lose. Build sympathy and connection with the character. Keep tone grounded and relatable.",
        keyBeats: [
            "Introduce protagonist in their normal environment",
            "Show their daily routine and relationships",
            "Hint at inner lack or dissatisfaction",
            "Establish what they stand to lose"
        ],
        temperature: 1,
        heat: 0,
        vsParams: { k: 5, tau: 0.10 },
        pacing: "Slow, measured. Build character connection.",
        tone: "Grounded, relatable, everyday"
    },

    2: {
        name: "Call to Adventure",
        description: "An event disrupts the hero's comfort zone, presenting a challenge or quest",
        authorNoteGuidance: "Present a clear disruption or opportunity that challenges the status quo. The call should be specific and compelling. Introduce stakes. Create a decision point for the protagonist.",
        keyBeats: [
            "Introduce the problem, challenge, or opportunity",
            "Disrupt the ordinary world",
            "Present stakes clearly",
            "Create urgency or intrigue"
        ],
        temperature: 2,
        heat: 5,
        vsParams: { k: 5, tau: 0.12 },
        pacing: "Moderate. Build intrigue and tension.",
        tone: "Mysterious, intriguing, slightly unsettling"
    },

    3: {
        name: "Refusal of the Call",
        description: "The hero hesitates or attempts to turn away from the journey",
        authorNoteGuidance: "Show the protagonist's fear, doubt, or resistance. Highlight what holds them back: fear of change, responsibilities, self-doubt. Make their reluctance believable and sympathetic. This creates contrast for their eventual acceptance.",
        keyBeats: [
            "Hero expresses doubt or fear",
            "Show what holds them back",
            "Reveal character vulnerabilities",
            "Create internal conflict"
        ],
        temperature: 2,
        heat: 3,
        vsParams: { k: 5, tau: 0.10 },
        pacing: "Slow. Allow character introspection.",
        tone: "Uncertain, anxious, conflicted"
    },

    4: {
        name: "Meeting the Mentor",
        description: "A seasoned character provides training, equipment, or advice",
        authorNoteGuidance: "Introduce a wise, experienced figure who prepares the hero. The mentor offers training, tools, wisdom, or encouragement. Build their credibility and connection with protagonist. Plant seeds of guidance that will matter later.",
        keyBeats: [
            "Introduce mentor character",
            "Provide crucial advice or training",
            "Give tools, weapons, or gifts",
            "Build mentor-hero relationship",
            "Prepare hero for journey"
        ],
        temperature: 3,
        heat: 2,
        vsParams: { k: 6, tau: 0.11 },
        pacing: "Moderate. Balance exposition with connection.",
        tone: "Wise, preparatory, inspiring"
    },

    5: {
        name: "Crossing the First Threshold",
        description: "The hero commits to the adventure and enters the special world",
        authorNoteGuidance: "Mark the clear transition from ordinary to special world. The hero makes a decision and crosses the point of no return. Introduce new rules, dangers, and wonders. Build excitement and trepidation. This is a major turning point.",
        keyBeats: [
            "Hero makes the decision to proceed",
            "Cross into unknown territory",
            "Encounter threshold guardians",
            "Establish new world rules",
            "Point of no return"
        ],
        temperature: 4,
        heat: 8,
        vsParams: { k: 6, tau: 0.13 },
        pacing: "Quickening. Build momentum.",
        tone: "Exciting, uncertain, committed"
    },

    6: {
        name: "Tests, Allies, and Enemies",
        description: "The hero faces challenges and learns the rules of the new world",
        authorNoteGuidance: "Present a series of challenges that teach the hero (and reader) how this world works. Introduce allies who join the cause and enemies who oppose it. Build the team. Show growth through trial and error. Keep variety high.",
        keyBeats: [
            "Face tests and challenges",
            "Make allies and friends",
            "Identify enemies and obstacles",
            "Learn new world's rules",
            "Character grows through experience",
            "Build relationships within team"
        ],
        temperature: 5,
        heat: 10,
        vsParams: { k: 7, tau: 0.14 },
        pacing: "Active. Varied challenges.",
        tone: "Adventurous, learning, bonding"
    },

    7: {
        name: "Approach to the Inmost Cave",
        description: "The hero prepares for the central, most dangerous challenge",
        authorNoteGuidance: "Build suspense as the hero approaches the major challenge. Show preparation, planning, and growing dread. The 'inmost cave' can be physical location or emotional confrontation. Increase tension. Last chance to turn back. Show what's at stake.",
        keyBeats: [
            "Approach the dangerous place or challenge",
            "Make preparations and plans",
            "Build suspense and dread",
            "Show what's at stake",
            "Gather courage and resources",
            "Last moments before crisis"
        ],
        temperature: 6,
        heat: 15,
        vsParams: { k: 7, tau: 0.15 },
        pacing: "Tense. Build to crisis.",
        tone: "Suspenseful, foreboding, determined"
    },

    8: {
        name: "The Ordeal",
        description: "The hero faces their greatest fear; a moment of death and rebirth",
        authorNoteGuidance: "This is the story's central crisis and midpoint. The hero faces death (literal or metaphorical). All seems lost. Create maximum tension and stakes. The hero must confront their deepest fear. This is a transformative moment. Allow genuine danger and doubt.",
        keyBeats: [
            "Face the greatest fear or challenge",
            "Moment of apparent defeat or death",
            "All seems lost",
            "Hero is transformed by the experience",
            "Midpoint crisis",
            "Confrontation with shadow/antagonist"
        ],
        temperature: 9,
        heat: 25,
        vsParams: { k: 8, tau: 0.18 },
        pacing: "Intense. Peak crisis.",
        tone: "Desperate, intense, transformative"
    },

    9: {
        name: "Reward (Seizing the Sword)",
        description: "Having survived, the hero obtains the reward",
        authorNoteGuidance: "The hero survives the ordeal and claims their prize. This can be an object, knowledge, reconciliation, or new understanding. Show the cost of victory. Celebrate the achievement but hint that the journey isn't over. Moment of relief and triumph.",
        keyBeats: [
            "Survive the ordeal",
            "Claim the reward or treasure",
            "Gain new knowledge or power",
            "Moment of celebration or relief",
            "Recognize what was sacrificed",
            "Hero is changed by experience"
        ],
        temperature: 7,
        heat: 12,
        vsParams: { k: 7, tau: 0.14 },
        pacing: "Triumphant but uncertain.",
        tone: "Victorious, relieved, but changed"
    },

    10: {
        name: "The Road Back",
        description: "The hero begins the journey home; new dangers or chase ensues",
        authorNoteGuidance: "The hero must return to the ordinary world, but it won't be easy. Often involves a chase or pursuit. The villain makes one last attempt. Create urgency. The hero chooses to return despite risks. Show commitment to bringing the 'elixir' home.",
        keyBeats: [
            "Decision to return home",
            "Pursuit or chase sequence",
            "Villain's counterattack",
            "Urgency and danger increase",
            "Hero's commitment tested",
            "Racing against time"
        ],
        temperature: 8,
        heat: 18,
        vsParams: { k: 8, tau: 0.16 },
        pacing: "Fast. Rising action.",
        tone: "Urgent, dangerous, determined"
    },

    11: {
        name: "Resurrection",
        description: "Final test; the hero is purified by one last sacrifice",
        authorNoteGuidance: "The climax. A final, ultimate confrontation that tests everything the hero has learned. Often a battle or choice that determines fate of both hero and their world. Stakes are highest. The hero must apply all growth from journey. Final death-and-rebirth moment. Make it count.",
        keyBeats: [
            "Final confrontation or climax",
            "Ultimate test of growth",
            "Highest stakes - fate of world",
            "Hero proves transformation",
            "Final sacrifice or choice",
            "Climactic resolution"
        ],
        temperature: 10,
        heat: 30,
        vsParams: { k: 9, tau: 0.20 },
        pacing: "Explosive. Final climax.",
        tone: "Climactic, epic, definitive"
    },

    12: {
        name: "Return with the Elixir",
        description: "The hero returns home transformed, bringing wisdom to their community",
        authorNoteGuidance: "Denouement. The hero returns to ordinary world but is forever changed. Show how they've grown. The 'elixir' (knowledge, treasure, wisdom) benefits their community. Provide closure while honoring the journey. Show the new normal. Resolve character arcs. Satisfy emotional payoff.",
        keyBeats: [
            "Return to ordinary world",
            "Hero has been transformed",
            "Share the elixir/wisdom",
            "Benefit the community",
            "Resolve character relationships",
            "Show the new normal",
            "Provide satisfying closure"
        ],
        temperature: 3,
        heat: 5,
        vsParams: { k: 5, tau: 0.10 },
        pacing: "Slow. Reflective resolution.",
        tone: "Reflective, satisfying, hopeful"
    }
};

// #endregion

// #region State Management

/**
 * Initialize Vogler state if needed
 */
const initVoglerState = () => {
    if (!state.vogler) {
        state.vogler = {
            currentStage: 1,
            turnsInStage: 0,
            totalTurns: 0,
            completedBeats: [],
            stageHistory: [],
            manualOverride: false,
            lastStageChange: 0
        };

        if (VOGLER_CONFIG.debugLogging) {
            console.log('🎬 Vogler Hero\'s Journey initialized at Stage 1: Ordinary World');
        }
    }

    return state.vogler;
};

/**
 * Get current stage configuration
 */
const getCurrentVoglerStage = () => {
    const voglerState = initVoglerState();
    return VOGLER_STAGES[voglerState.currentStage] || VOGLER_STAGES[1];
};

/**
 * Advance to next stage
 */
const advanceVoglerStage = (reason = 'auto') => {
    const voglerState = initVoglerState();
    const oldStage = voglerState.currentStage;

    // Don't advance past stage 12
    if (oldStage >= 12) {
        if (VOGLER_CONFIG.debugLogging) {
            console.log('🎬 Already at final stage (Return with Elixir)');
        }
        return false;
    }

    // Record stage history
    voglerState.stageHistory.push({
        stage: oldStage,
        turns: voglerState.turnsInStage,
        completedBeats: [...voglerState.completedBeats],
        reason: reason
    });

    // Advance
    voglerState.currentStage = oldStage + 1;
    voglerState.turnsInStage = 0;
    voglerState.completedBeats = [];
    voglerState.lastStageChange = voglerState.totalTurns;

    const newStage = VOGLER_STAGES[voglerState.currentStage];

    if (VOGLER_CONFIG.logStageChanges) {
        console.log(`🎬 STAGE CHANGE: ${VOGLER_STAGES[oldStage].name} → ${newStage.name} (${reason})`);
    }

    return true;
};

/**
 * Check if stage should advance
 */
const shouldAdvanceStage = () => {
    if (!VOGLER_CONFIG.autoAdvance) return false;

    const voglerState = initVoglerState();
    const currentStage = getCurrentVoglerStage();

    // Check minimum turns
    if (voglerState.turnsInStage < VOGLER_CONFIG.minTurnsPerStage) {
        return { should: false, reason: 'minimum turns not met' };
    }

    // Check maximum turns (force advancement)
    if (voglerState.turnsInStage >= VOGLER_CONFIG.maxTurnsPerStage) {
        return { should: true, reason: 'maximum turns reached' };
    }

    // Check key beats if required
    if (VOGLER_CONFIG.requireKeyBeats) {
        const beatsCompleted = voglerState.completedBeats.length;
        const beatsRequired = Math.ceil(currentStage.keyBeats.length * 0.6); // 60% of beats

        if (beatsCompleted < beatsRequired) {
            return { should: false, reason: `need ${beatsRequired - beatsCompleted} more key beats` };
        }
    }

    // Check average turns
    if (voglerState.turnsInStage >= VOGLER_CONFIG.turnsPerStage) {
        return { should: true, reason: 'average turns reached with beats completed' };
    }

    return { should: false, reason: 'not enough turns' };
};

/**
 * Mark a story beat as completed
 */
const completeVoglerBeat = (beatDescription) => {
    const voglerState = initVoglerState();

    if (!voglerState.completedBeats.includes(beatDescription)) {
        voglerState.completedBeats.push(beatDescription);

        if (VOGLER_CONFIG.debugLogging) {
            console.log(`✅ Story beat completed: ${beatDescription}`);
        }
    }
};

/**
 * Detect story beats in text (simple keyword matching)
 */
const detectStoryBeats = (text) => {
    const currentStage = getCurrentVoglerStage();
    const voglerState = initVoglerState();
    const detected = [];

    // Stage-specific beat detection patterns
    const beatPatterns = {
        1: [ // Ordinary World
            { pattern: /normal|ordinary|routine|everyday|usual/i, beat: "Establish normal life" },
            { pattern: /relationship|friend|family|companion/i, beat: "Show relationships" },
            { pattern: /lack|want|need|dissatisfied|unfulfilled/i, beat: "Hint at inner lack" }
        ],
        2: [ // Call to Adventure
            { pattern: /message|letter|call|summon|quest|mission/i, beat: "Receive the call" },
            { pattern: /problem|crisis|threat|danger|opportunity/i, beat: "Introduce the challenge" },
            { pattern: /must|have to|need to|should/i, beat: "Present stakes" }
        ],
        3: [ // Refusal
            { pattern: /afraid|fear|scared|worry|anxious/i, beat: "Express fear" },
            { pattern: /can't|won't|refuse|no|doubt/i, beat: "Refuse or resist" },
            { pattern: /but|however|responsibility|duty/i, beat: "Show what holds back" }
        ],
        4: [ // Mentor
            { pattern: /teach|train|show|guide|instruct/i, beat: "Receive training" },
            { pattern: /gift|weapon|tool|equipment/i, beat: "Receive tools" },
            { pattern: /wise|experienced|elder|master/i, beat: "Meet mentor" }
        ],
        5: [ // Threshold
            { pattern: /cross|enter|step|pass|venture/i, beat: "Cross threshold" },
            { pattern: /new world|strange|unfamiliar|different/i, beat: "Enter special world" },
            { pattern: /no turning back|committed|decided/i, beat: "Point of no return" }
        ],
        6: [ // Tests
            { pattern: /challenge|test|trial|obstacle/i, beat: "Face challenges" },
            { pattern: /ally|friend|companion|join/i, beat: "Make allies" },
            { pattern: /enemy|foe|opponent|villain/i, beat: "Identify enemies" }
        ],
        7: [ // Approach
            { pattern: /prepare|plan|ready|gather/i, beat: "Make preparations" },
            { pattern: /dangerous|deadly|perilous|lair|cave/i, beat: "Approach danger" },
            { pattern: /fear|dread|nervous|tense/i, beat: "Build suspense" }
        ],
        8: [ // Ordeal
            { pattern: /death|die|killed|defeat/i, beat: "Face death" },
            { pattern: /lost|doomed|hopeless|desperate/i, beat: "All seems lost" },
            { pattern: /confront|face|battle|fight/i, beat: "Central confrontation" }
        ],
        9: [ // Reward
            { pattern: /victory|triumph|win|succeed/i, beat: "Achieve victory" },
            { pattern: /treasure|prize|reward|gain/i, beat: "Claim reward" },
            { pattern: /learn|understand|realize|discover/i, beat: "Gain knowledge" }
        ],
        10: [ // Road Back
            { pattern: /return|go back|home|escape/i, beat: "Begin return" },
            { pattern: /chase|pursue|hunt|follow/i, beat: "Pursuit begins" },
            { pattern: /hurry|rush|quick|urgent/i, beat: "Create urgency" }
        ],
        11: [ // Resurrection
            { pattern: /final|last|ultimate|climax/i, beat: "Final confrontation" },
            { pattern: /everything|all|fate|destiny/i, beat: "Highest stakes" },
            { pattern: /sacrifice|give|offer/i, beat: "Final sacrifice" }
        ],
        12: [ // Return
            { pattern: /return|home|back/i, beat: "Return home" },
            { pattern: /changed|different|transformed|grew/i, beat: "Show transformation" },
            { pattern: /share|tell|teach|help/i, beat: "Share wisdom" }
        ]
    };

    const patterns = beatPatterns[voglerState.currentStage] || [];

    patterns.forEach(({ pattern, beat }) => {
        if (pattern.test(text) && !voglerState.completedBeats.includes(beat)) {
            detected.push(beat);
            completeVoglerBeat(beat);
        }
    });

    return detected;
};

// #endregion

// #region Integration with Trinity Systems

/**
 * Get Vogler-adjusted temperature for NGO
 */
const getVoglerTemperature = () => {
    if (!VOGLER_CONFIG.enabled) return null;

    const currentStage = getCurrentVoglerStage();
    return currentStage.temperature;
};

/**
 * Get Vogler-adjusted heat for NGO
 */
const getVoglerHeat = () => {
    if (!VOGLER_CONFIG.enabled) return null;

    const currentStage = getCurrentVoglerStage();
    return currentStage.heat;
};

/**
 * Get Vogler-adjusted VS parameters
 */
const getVoglerVSParams = () => {
    if (!VOGLER_CONFIG.enabled) return null;

    const currentStage = getCurrentVoglerStage();
    return currentStage.vsParams;
};

/**
 * Build author's note with Vogler guidance
 */
const buildVoglerAuthorsNote = () => {
    if (!VOGLER_CONFIG.enabled) return '';

    const currentStage = getCurrentVoglerStage();
    const voglerState = initVoglerState();

    // Build layered guidance
    const layers = [];

    // Stage name and guidance
    layers.push(`[Hero's Journey: ${currentStage.name}] ${currentStage.authorNoteGuidance}`);

    // Pacing hint
    if (currentStage.pacing) {
        layers.push(`Pacing: ${currentStage.pacing}`);
    }

    // Tone hint
    if (currentStage.tone) {
        layers.push(`Tone: ${currentStage.tone}`);
    }

    // Remaining key beats (if close to advancement)
    if (voglerState.turnsInStage >= VOGLER_CONFIG.minTurnsPerStage) {
        const remaining = currentStage.keyBeats.filter(
            beat => !voglerState.completedBeats.some(completed =>
                beat.toLowerCase().includes(completed.toLowerCase()) ||
                completed.toLowerCase().includes(beat.toLowerCase())
            )
        );

        if (remaining.length > 0 && remaining.length <= 3) {
            layers.push(`Key beats to address: ${remaining.slice(0, 2).join('; ')}`);
        }
    }

    return layers.join(' ');
};

// #endregion

// #region Command Processing

/**
 * Process Vogler-specific commands
 */
const processVoglerCommands = (text) => {
    const voglerState = initVoglerState();
    let processed = text;
    const commands = {};

    // @stage command - manual stage control
    const stageRegex = new RegExp(`${VOGLER_CONFIG.stageCommand}\\s+(\\d+)`, 'gi');
    const stageMatch = stageRegex.exec(text);

    if (stageMatch) {
        const targetStage = parseInt(stageMatch[1]);
        if (targetStage >= 1 && targetStage <= 12) {
            voglerState.currentStage = targetStage;
            voglerState.turnsInStage = 0;
            voglerState.completedBeats = [];
            voglerState.manualOverride = true;

            commands.stage = targetStage;
            processed = processed.replace(stageMatch[0], '').trim();

            if (VOGLER_CONFIG.logStageChanges) {
                console.log(`🎬 Manual stage change to ${VOGLER_STAGES[targetStage].name}`);
            }
        }
    }

    // @beat command - mark beat completed
    const beatRegex = new RegExp(`${VOGLER_CONFIG.beatCommand}\\s+([^\\n]+)`, 'gi');
    const beatMatch = beatRegex.exec(text);

    if (beatMatch) {
        const beatDescription = beatMatch[1].trim();
        completeVoglerBeat(beatDescription);

        commands.beat = beatDescription;
        processed = processed.replace(beatMatch[0], '').trim();
    }

    return { processed, commands };
};

// #endregion

// #region Analytics & Logging

/**
 * Get Vogler journey progress
 */
const getVoglerProgress = () => {
    const voglerState = initVoglerState();
    const currentStage = getCurrentVoglerStage();

    return {
        currentStage: voglerState.currentStage,
        stageName: currentStage.name,
        turnsInStage: voglerState.turnsInStage,
        totalTurns: voglerState.totalTurns,
        completedBeats: voglerState.completedBeats.length,
        totalBeats: currentStage.keyBeats.length,
        progress: `${voglerState.currentStage}/12 stages`,
        percentComplete: Math.round((voglerState.currentStage / 12) * 100)
    };
};

/**
 * Log Vogler status
 */
const logVoglerStatus = () => {
    if (!VOGLER_CONFIG.debugLogging) return;

    const progress = getVoglerProgress();
    console.log(`🎬 Vogler Progress: Stage ${progress.currentStage}/12 - ${progress.stageName}`);
    console.log(`   Turns in stage: ${progress.turnsInStage}, Beats: ${progress.completedBeats}/${progress.totalBeats}`);
};

// #endregion

// #region Word Banks - Genre Agnostic

/**
 * NGO-style conflict/calming word lists adapted for Hero's Journey stages
 * These drive tension detection and are genre-agnostic
 */
const VOGLER_WORD_LISTS = {
    // Words that increase narrative tension (conflict, action, danger)
    conflict: [
        // Violence & Combat
        'attack', 'fight', 'battle', 'war', 'kill', 'murder', 'destroy',
        'strike', 'punch', 'kick', 'stab', 'slash', 'shoot', 'blast',
        'crush', 'smash', 'break', 'shatter', 'explode', 'detonate',
        'wound', 'injure', 'hurt', 'harm', 'damage', 'wreck', 'ruin',

        // Danger & Threat
        'danger', 'threat', 'enemy', 'foe', 'villain', 'monster',
        'demon', 'beast', 'creature', 'predator', 'hunter',
        'trap', 'ambush', 'poison', 'curse', 'plague',
        'death', 'dying', 'dead', 'corpse', 'doom',

        // Urgency & Crisis
        'run', 'flee', 'escape', 'chase', 'pursue', 'hurry', 'rush',
        'urgent', 'emergency', 'crisis', 'disaster', 'catastrophe',
        'collapse', 'crash', 'fall', 'fail', 'lose', 'lost',
        'now', 'quickly', 'immediately', 'fast',

        // Negative Emotion
        'rage', 'fury', 'anger', 'hate', 'fear', 'terror', 'panic',
        'scream', 'shout', 'yell', 'cry', 'sob', 'wail', 'shriek',
        'despair', 'agony', 'torment', 'suffer', 'pain', 'anguish',
        'dread', 'horror', 'nightmare', 'trauma', 'shock',

        // Confrontation
        'confront', 'challenge', 'oppose', 'resist', 'defy', 'betray',
        'deceive', 'lie', 'steal', 'rob', 'threaten', 'demand',
        'argue', 'conflict', 'dispute', 'clash',
        'accuse', 'blame', 'condemn', 'judge', 'punish',

        // High Stakes
        'blood', 'fire', 'explosion', 'destruction', 'chaos',
        'invasion', 'siege', 'conquest', 'revolution',
        'sacrifice', 'fate', 'destiny', 'prophecy',
        'ultimate', 'final', 'last', 'end', 'apocalypse'
    ],

    // Words that decrease tension (calm, resolution, rest)
    calming: [
        // Peace & Tranquility
        'peace', 'calm', 'quiet', 'still', 'serene', 'tranquil',
        'gentle', 'soft', 'warm', 'safe', 'secure', 'protected',
        'harmony', 'balance', 'stable', 'steady', 'settled',

        // Rest & Relaxation
        'rest', 'sleep', 'relax', 'breathe', 'sigh', 'exhale',
        'settle', 'sit', 'lie', 'lean', 'recline', 'pause',
        'wait', 'linger', 'stay', 'remain', 'stop',
        'dream', 'slumber', 'doze', 'nap',

        // Positive Emotion
        'happy', 'joy', 'love', 'care', 'comfort', 'soothe',
        'smile', 'laugh', 'giggle', 'chuckle', 'grin',
        'hug', 'embrace', 'hold', 'cuddle', 'caress',
        'content', 'satisfied', 'pleased', 'delighted',

        // Resolution & Healing
        'resolve', 'solve', 'fix', 'heal', 'recover', 'mend',
        'forgive', 'apologize', 'reconcile', 'understand', 'agree',
        'accept', 'approve', 'allow', 'permit', 'grant',
        'complete', 'finish', 'accomplish', 'achieve', 'succeed',

        // Connection & Support
        'friend', 'ally', 'companion', 'partner', 'family', 'home',
        'trust', 'believe', 'hope', 'faith', 'together', 'united',
        'bond', 'connection', 'relationship', 'friendship',
        'support', 'help', 'aid', 'assist', 'guide',

        // Mundane & Everyday
        'eat', 'drink', 'cook', 'clean', 'walk', 'talk', 'think',
        'observe', 'notice', 'examine', 'study', 'learn', 'remember',
        'write', 'read', 'listen', 'watch', 'see', 'look',
        'ordinary', 'normal', 'usual', 'routine', 'daily'
    ]
};

/**
 * Stop words - common words to avoid for quality writing
 * These create weak prose and should be avoided where possible
 */
const STOP_WORDS = [
    // Weak adverbs
    'very', 'really', 'quite', 'just', 'rather', 'somewhat',
    'fairly', 'pretty', 'basically', 'actually', 'literally',
    'totally', 'absolutely', 'completely', 'entirely',

    // Overused transitions
    'suddenly', 'meanwhile', 'however', 'therefore', 'thus',
    'nevertheless', 'nonetheless', 'moreover', 'furthermore',

    // Telling phrases (show don't tell)
    'realized', 'noticed', 'seemed', 'appeared', 'felt like',
    'thought to herself', 'thought to himself',
    'could see', 'could hear', 'could feel',

    // Weak verbs
    'was', 'were', 'is', 'are', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did',

    // Filter words
    'saw', 'heard', 'felt', 'thought', 'wondered', 'seemed',
    'noticed', 'watched', 'looked', 'realized',

    // Crutch phrases
    'a bit', 'a little', 'kind of', 'sort of', 'in a way',
    'for some reason', 'somehow', 'somewhat',

    // Redundant modifiers
    'still remained', 'completely destroyed', 'final end',
    'advance planning', 'past history', 'close proximity'
];

// #endregion

// #region Enhanced Synonym Database with Emotion & Precision Metadata

/**
 * Comprehensive synonym database with emotion and precision scoring
 * Designed to work with Bonepoke's multidimensional analysis
 *
 * Structure:
 * - word: synonym replacement
 * - emotion: 1-5 (Emotional Strength score)
 * - precision: 1-5 (Character Clarity score)
 * - tags: context/genre tags for smart matching
 * - dialogue: true for dialogue-specific verbs
 */
const ENHANCED_SYNONYM_MAP = {
    // === HIGH-FREQUENCY VERBS ===

    'walked': {
        synonyms: [
            { word: 'strolled', emotion: 2, precision: 3, tags: ['casual', 'slow', 'relaxed'] },
            { word: 'marched', emotion: 4, precision: 4, tags: ['purposeful', 'strong', 'determined'] },
            { word: 'trudged', emotion: 4, precision: 4, tags: ['weary', 'slow', 'difficult'] },
            { word: 'strode', emotion: 3, precision: 4, tags: ['confident', 'fast', 'purposeful'] },
            { word: 'shuffled', emotion: 3, precision: 4, tags: ['tired', 'slow', 'reluctant'] },
            { word: 'sauntered', emotion: 3, precision: 4, tags: ['casual', 'relaxed', 'leisurely'] },
            { word: 'paced', emotion: 3, precision: 3, tags: ['nervous', 'repetitive', 'anxious'] },
            { word: 'wandered', emotion: 2, precision: 3, tags: ['aimless', 'exploring', 'lost'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'said': {
        synonyms: [
            { word: 'murmured', emotion: 3, precision: 4, tags: ['quiet', 'intimate', 'soft'], dialogue: true },
            { word: 'whispered', emotion: 4, precision: 4, tags: ['quiet', 'secretive', 'intimate'], dialogue: true },
            { word: 'shouted', emotion: 5, precision: 4, tags: ['loud', 'intense', 'angry'], dialogue: true },
            { word: 'declared', emotion: 3, precision: 4, tags: ['formal', 'firm', 'official'], dialogue: true },
            { word: 'muttered', emotion: 3, precision: 4, tags: ['quiet', 'annoyed', 'grumbling'], dialogue: true },
            { word: 'replied', emotion: 2, precision: 3, tags: ['neutral', 'responsive', 'answer'], dialogue: true },
            { word: 'stated', emotion: 2, precision: 3, tags: ['neutral', 'formal', 'factual'], dialogue: true },
            { word: 'exclaimed', emotion: 4, precision: 3, tags: ['surprised', 'sudden', 'emphatic'], dialogue: true },
            { word: 'announced', emotion: 3, precision: 3, tags: ['public', 'formal', 'important'], dialogue: true }
        ],
        baseEmotion: 1, basePrecision: 2, dialogueVerb: true
    },

    'looked': {
        synonyms: [
            { word: 'glanced', emotion: 2, precision: 4, tags: ['quick', 'brief', 'casual'] },
            { word: 'stared', emotion: 3, precision: 4, tags: ['intense', 'prolonged', 'fixed'] },
            { word: 'gazed', emotion: 3, precision: 4, tags: ['soft', 'prolonged', 'admiring'] },
            { word: 'peered', emotion: 3, precision: 4, tags: ['careful', 'scrutinizing', 'close'] },
            { word: 'glared', emotion: 4, precision: 4, tags: ['angry', 'intense', 'hostile'] },
            { word: 'observed', emotion: 2, precision: 3, tags: ['neutral', 'watchful', 'analytical'] },
            { word: 'scanned', emotion: 2, precision: 4, tags: ['quick', 'searching', 'comprehensive'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'went': {
        synonyms: [
            { word: 'traveled', emotion: 2, precision: 3, tags: ['journey', 'distance', 'movement'] },
            { word: 'proceeded', emotion: 2, precision: 3, tags: ['formal', 'continued', 'forward'] },
            { word: 'moved', emotion: 1, precision: 2, tags: ['neutral', 'basic', 'general'] },
            { word: 'ventured', emotion: 3, precision: 4, tags: ['brave', 'risky', 'uncertain'] },
            { word: 'headed', emotion: 2, precision: 3, tags: ['directional', 'purposeful', 'toward'] },
            { word: 'journeyed', emotion: 3, precision: 4, tags: ['long', 'quest', 'epic'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'turned': {
        synonyms: [
            { word: 'spun', emotion: 3, precision: 4, tags: ['fast', 'complete', 'sudden'] },
            { word: 'pivoted', emotion: 3, precision: 4, tags: ['quick', 'precise', 'athletic'] },
            { word: 'rotated', emotion: 2, precision: 3, tags: ['mechanical', 'slow', 'deliberate'] },
            { word: 'wheeled', emotion: 3, precision: 4, tags: ['sudden', 'complete', 'dramatic'] },
            { word: 'twisted', emotion: 3, precision: 4, tags: ['forceful', 'strained', 'difficult'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    // === EMOTION VERBS ===

    'smiled': {
        synonyms: [
            { word: 'grinned', emotion: 4, precision: 4, tags: ['wide', 'happy', 'pleased'] },
            { word: 'beamed', emotion: 4, precision: 4, tags: ['bright', 'joyful', 'radiant'] },
            { word: 'smirked', emotion: 4, precision: 4, tags: ['smug', 'knowing', 'sly'] }
        ],
        baseEmotion: 2, basePrecision: 3
    },

    'laughed': {
        synonyms: [
            { word: 'chuckled', emotion: 3, precision: 4, tags: ['soft', 'amused', 'gentle'] },
            { word: 'giggled', emotion: 4, precision: 4, tags: ['light', 'playful', 'nervous'] },
            { word: 'guffawed', emotion: 5, precision: 4, tags: ['loud', 'hearty', 'boisterous'] },
            { word: 'cackled', emotion: 5, precision: 4, tags: ['wild', 'manic', 'evil'] },
            { word: 'snickered', emotion: 3, precision: 4, tags: ['quiet', 'sly', 'mocking'] }
        ],
        baseEmotion: 3, basePrecision: 3
    },

    // === MOVEMENT & ACTION ===

    'moved': {
        synonyms: [
            { word: 'shifted', emotion: 2, precision: 3, tags: ['slight', 'adjustment', 'subtle'] },
            { word: 'stirred', emotion: 2, precision: 3, tags: ['awakening', 'slow', 'beginning'] },
            { word: 'relocated', emotion: 2, precision: 4, tags: ['complete', 'distant', 'permanent'] },
            { word: 'transitioned', emotion: 2, precision: 4, tags: ['smooth', 'gradual', 'change'] },
            { word: 'glided', emotion: 3, precision: 4, tags: ['smooth', 'effortless', 'graceful'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'took': {
        synonyms: [
            { word: 'grabbed', emotion: 3, precision: 3, tags: ['quick', 'forceful', 'urgent'] },
            { word: 'seized', emotion: 4, precision: 4, tags: ['aggressive', 'sudden', 'forceful'] },
            { word: 'grasped', emotion: 3, precision: 3, tags: ['firm', 'deliberate', 'controlled'] },
            { word: 'snatched', emotion: 4, precision: 4, tags: ['quick', 'aggressive', 'theft'] },
            { word: 'clutched', emotion: 4, precision: 4, tags: ['desperate', 'tight', 'fearful'] },
            { word: 'claimed', emotion: 3, precision: 4, tags: ['ownership', 'assertive', 'rightful'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'gave': {
        synonyms: [
            { word: 'offered', emotion: 3, precision: 3, tags: ['polite', 'willing', 'generous'] },
            { word: 'handed', emotion: 2, precision: 3, tags: ['direct', 'simple', 'physical'] },
            { word: 'presented', emotion: 3, precision: 4, tags: ['formal', 'ceremonial', 'official'] },
            { word: 'provided', emotion: 2, precision: 3, tags: ['neutral', 'supplied', 'furnished'] },
            { word: 'extended', emotion: 3, precision: 4, tags: ['reaching', 'offering', 'generous'] },
            { word: 'bestowed', emotion: 4, precision: 5, tags: ['formal', 'generous', 'honor'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    // === PERCEPTION VERBS ===

    'saw': {
        synonyms: [
            { word: 'spotted', emotion: 2, precision: 4, tags: ['noticed', 'found', 'discovered'] },
            { word: 'noticed', emotion: 2, precision: 3, tags: ['aware', 'observed', 'detected'] },
            { word: 'observed', emotion: 2, precision: 3, tags: ['watched', 'studied', 'careful'] },
            { word: 'glimpsed', emotion: 3, precision: 4, tags: ['brief', 'partial', 'fleeting'] },
            { word: 'beheld', emotion: 4, precision: 5, tags: ['formal', 'literary', 'wonder'] },
            { word: 'witnessed', emotion: 3, precision: 4, tags: ['event', 'important', 'testimony'] },
            { word: 'perceived', emotion: 3, precision: 4, tags: ['understood', 'sensed', 'intuited'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'heard': {
        synonyms: [
            { word: 'detected', emotion: 2, precision: 4, tags: ['aware', 'noticed', 'sensed'] },
            { word: 'caught', emotion: 2, precision: 3, tags: ['brief', 'partial', 'fleeting'] },
            { word: 'perceived', emotion: 3, precision: 4, tags: ['sensed', 'aware', 'intuited'] },
            { word: 'discerned', emotion: 3, precision: 5, tags: ['distinguished', 'careful', 'analytical'] },
            { word: 'overheard', emotion: 3, precision: 4, tags: ['accidental', 'secret', 'eavesdrop'] }
        ],
        baseEmotion: 1, basePrecision: 2
    },

    'felt': {
        synonyms: [
            { word: 'sensed', emotion: 3, precision: 4, tags: ['intuitive', 'aware', 'perceptive'] },
            { word: 'experienced', emotion: 2, precision: 3, tags: ['neutral', 'direct', 'underwent'] },
            { word: 'perceived', emotion: 3, precision: 4, tags: ['intellectual', 'aware', 'understood'] },
            { word: 'detected', emotion: 2, precision: 4, tags: ['subtle', 'noticed', 'discovered'] }
        ],
        baseEmotion: 2, basePrecision: 2
    },

    // === ADJECTIVES ===

    'big': {
        synonyms: [
            { word: 'large', emotion: 1, precision: 2, tags: ['neutral', 'size', 'general'] },
            { word: 'sizeable', emotion: 2, precision: 3, tags: ['notable', 'measured', 'considerable'] },
            { word: 'substantial', emotion: 2, precision: 4, tags: ['important', 'considerable', 'significant'] },
            { word: 'massive', emotion: 3, precision: 4, tags: ['huge', 'impressive', 'overwhelming'] },
            { word: 'immense', emotion: 3, precision: 4, tags: ['vast', 'enormous', 'impressive'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    'small': {
        synonyms: [
            { word: 'little', emotion: 1, precision: 2, tags: ['neutral', 'diminutive', 'tiny'] },
            { word: 'compact', emotion: 2, precision: 3, tags: ['efficient', 'dense', 'concentrated'] },
            { word: 'diminutive', emotion: 3, precision: 4, tags: ['tiny', 'delicate', 'petite'] },
            { word: 'miniscule', emotion: 3, precision: 4, tags: ['extremely-small', 'tiny', 'minute'] }
        ],
        baseEmotion: 1, basePrecision: 1
    },

    // === EMOTION ADJECTIVES ===

    'happy': {
        synonyms: [
            { word: 'cheerful', emotion: 4, precision: 4, tags: ['bright', 'positive', 'upbeat'] },
            { word: 'joyful', emotion: 5, precision: 4, tags: ['intense', 'celebratory', 'ecstatic'] },
            { word: 'content', emotion: 3, precision: 3, tags: ['peaceful', 'satisfied', 'calm'] },
            { word: 'elated', emotion: 5, precision: 4, tags: ['euphoric', 'ecstatic', 'thrilled'] },
            { word: 'delighted', emotion: 4, precision: 4, tags: ['pleased', 'charmed', 'gratified'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'sad': {
        synonyms: [
            { word: 'sorrowful', emotion: 4, precision: 4, tags: ['grief', 'deep', 'mournful'] },
            { word: 'melancholy', emotion: 4, precision: 5, tags: ['pensive', 'wistful', 'reflective'] },
            { word: 'dejected', emotion: 4, precision: 4, tags: ['downcast', 'defeated', 'discouraged'] },
            { word: 'despondent', emotion: 5, precision: 4, tags: ['hopeless', 'despair', 'depressed'] },
            { word: 'mournful', emotion: 4, precision: 4, tags: ['grieving', 'lamenting', 'bereaved'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'angry': {
        synonyms: [
            { word: 'furious', emotion: 5, precision: 4, tags: ['intense', 'rage', 'violent'] },
            { word: 'irate', emotion: 4, precision: 4, tags: ['formal', 'indignant', 'offended'] },
            { word: 'incensed', emotion: 5, precision: 4, tags: ['outraged', 'inflamed', 'provoked'] },
            { word: 'wrathful', emotion: 5, precision: 5, tags: ['righteous', 'vengeful', 'punitive'] },
            { word: 'livid', emotion: 5, precision: 4, tags: ['extreme', 'visible', 'intense'] }
        ],
        baseEmotion: 3, basePrecision: 2
    },

    'scared': {
        synonyms: [
            { word: 'frightened', emotion: 4, precision: 3, tags: ['alarmed', 'startled', 'fearful'] },
            { word: 'terrified', emotion: 5, precision: 4, tags: ['extreme', 'panicked', 'horrified'] },
            { word: 'apprehensive', emotion: 3, precision: 4, tags: ['worried', 'uneasy', 'anxious'] },
            { word: 'petrified', emotion: 5, precision: 4, tags: ['paralyzed', 'frozen', 'extreme'] },
            { word: 'alarmed', emotion: 4, precision: 3, tags: ['sudden', 'worried', 'concerned'] }
        ],
        baseEmotion: 3, basePrecision: 2
    }
};

// #endregion

// #region Configuration Story Cards for NGO & Vogler Features

/**
 * Configuration cards for user-facing control of all non-automatic features
 * All cards kept under 1500 characters for AI Dungeon compatibility
 */

/**
 * Vogler Configuration Card - Control Hero's Journey system
 */
const VoglerConfigCard = (() => {
    const CARD_KEY = 'vogler_config';

    const createDefaultCard = () => {
        const defaultConfig = `VOGLER HERO'S JOURNEY CONFIGURATION
Control the 12-stage narrative arc system

SYSTEM:
enabled: true
debugLogging: false
logStageChanges: true

AUTO-ADVANCEMENT:
autoAdvance: true
turnsPerStage: 8
minTurnsPerStage: 4
maxTurnsPerStage: 15
requireKeyBeats: true
flexiblePacing: true

INTEGRATION:
integrateWithBonepoke: true
integrateWithVS: true

COMMANDS:
stageCommand: @stage
beatCommand: @beat

Usage:
@stage 5 - Jump to stage 5 (Crossing Threshold)
@beat mentor appeared - Mark story beat complete

Stages: 1=Ordinary World, 2=Call, 3=Refusal, 4=Mentor, 5=Threshold, 6=Tests, 7=Approach, 8=Ordeal, 9=Reward, 10=Road Back, 11=Resurrection, 12=Return

Save and refresh to apply changes.`;

        return buildCard(
            'Configure Vogler System',
            defaultConfig.length > 1500 ? defaultConfig.substring(0, 1497) + '...' : defaultConfig,
            'Custom',
            CARD_KEY,
            'Control Hero\'s Journey 12-stage narrative arc',
            50
        );
    };

    const ensureCard = () => {
        let card = storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
        if (!card) {
            card = createDefaultCard();
            if (VOGLER_CONFIG.debugLogging) {
                log('📖 Created Vogler Configuration story card');
            }
        }
        return card;
    };

    const parseConfig = (entry) => {
        if (!entry) return null;
        const config = {};
        const lines = entry.split('\n');

        lines.forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                const [, key, value] = match;
                const trimmedValue = value.trim().toLowerCase();

                if (trimmedValue === 'true' || trimmedValue === 'false') {
                    config[key] = trimmedValue === 'true';
                } else if (!isNaN(trimmedValue)) {
                    config[key] = parseFloat(trimmedValue);
                } else {
                    config[key] = value.trim();
                }
            }
        });

        return config;
    };

    const applyConfig = (userConfig) => {
        if (!userConfig) return;

        Object.keys(userConfig).forEach(key => {
            if (VOGLER_CONFIG.hasOwnProperty(key)) {
                VOGLER_CONFIG[key] = userConfig[key];
            }
        });

        if (VOGLER_CONFIG.debugLogging) {
            log('✅ Applied Vogler config from story card');
        }
    };

    const loadAndApply = () => {
        const card = ensureCard();
        if (!card) return;

        const userConfig = parseConfig(card.entry);
        applyConfig(userConfig);
    };

    return { ensureCard, parseConfig, applyConfig, loadAndApply };
})();

/**
 * NGO Temperature/Heat Configuration Card
 */
const NGOConfigCard = (() => {
    const CARD_KEY = 'ngo_config';

    const createDefaultCard = () => {
        const defaultConfig = `NGO NARRATIVE TENSION SYSTEM
Dynamic temperature & heat for pacing

HEAT (Short-term tension):
heatDecayRate: 1
heatIncreasePerConflict: 1
playerHeatMultiplier: 2
maxHeat: 50

TEMPERATURE (Long-term arc):
initialTemperature: 1
minTemperature: 1
maxTemperature: 12
trueMaxTemperature: 15

INCREASE TRIGGERS:
heatThresholdForTempIncrease: 10
tempIncreaseChance: 15
tempIncreaseOnConsecutiveConflicts: 3

DECREASE TRIGGERS:
calmingTurnsForDecrease: 5
tempDecreaseAmount: 1

OVERHEAT (Sustained climax):
overheatTriggerTemp: 10
overheatDuration: 4
overheatHeatReduction: 10

COOLDOWN (Falling action):
cooldownDuration: 5
cooldownTempDecreaseRate: 2
cooldownMinTemperature: 3

COMMANDS:
@temp 5 - Set temperature
@arc climax - Force narrative phase

Save and refresh to apply.`;

        return buildCard(
            'Configure Auto-Cards',
            defaultConfig.length > 1500 ? defaultConfig.substring(0, 1497) + '...' : defaultConfig,
            'Custom',
            CARD_KEY,
            'NGO temperature/heat tension system',
            51
        );
    };

    const ensureCard = () => {
        let card = storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
        if (!card) {
            card = createDefaultCard();
            if (VOGLER_CONFIG.debugLogging) {
                log('🌡️ Created NGO Configuration story card');
            }
        }
        return card;
    };

    return { ensureCard };
})();

/**
 * Smart Synonym Replacement Configuration Card
 */
const SynonymConfigCard = (() => {
    const CARD_KEY = 'synonym_config';

    const createDefaultCard = () => {
        const defaultConfig = `SMART SYNONYM REPLACEMENT
Bonepoke-driven word enhancement

SYSTEM:
enabled: true
debugLogging: false

THRESHOLDS (Replace when score below):
Emotional Strength: 2
Character Clarity: 2
Story Flow: 2
Dialogue Weight: 2
Word Variety: 1

VALIDATION:
preventQualityDegradation: true
preventNewContradictions: true
preventFatigueIncrease: true
requireImprovement: false
minScoreImprovement: 0.0

ADVANCED:
enableContextMatching: true
enableAdaptiveLearning: true
contextRadius: 50
tagMatchBonus: 2

STRICTNESS PRESETS:
conservative - Only replace weak words, require improvement
balanced - Normal (recommended)
aggressive - Replace more often, lenient

Usage: Set scores 1-5. Lower = more replacements
Save and refresh to apply.`;

        return buildCard(
            'Configure Smart Synonyms',
            defaultConfig.length > 1500 ? defaultConfig.substring(0, 1497) + '...' : defaultConfig,
            'Custom',
            CARD_KEY,
            'Smart synonym replacement with emotion/precision scoring',
            52
        );
    };

    const ensureCard = () => {
        let card = storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
        if (!card) {
            card = createDefaultCard();
            if (VOGLER_CONFIG.debugLogging) {
                log('📝 Created Synonym Configuration story card');
            }
        }
        return card;
    };

    return { ensureCard };
})();

/**
 * Player's Author's Note Configuration Card
 * Separates player notes from system-generated notes
 */
const PlayersAuthorsNoteCard = (() => {
    const CARD_KEY = 'players_note';

    const createDefaultCard = () => {
        const defaultConfig = `PLAYER'S AUTHOR'S NOTE
Your personal writing instructions for the AI

Add your custom writing guidance here. This will be preserved and combined with system guidance (Vogler stages, NGO settings, etc.)

Example instructions:
- Write in third person past tense
- Focus on dialogue and character interaction
- Avoid graphic violence
- Keep tone light and adventurous
- Emphasize humor

This note persists across turns. Edit freely.
System notes appear separately and don't override this.`;

        return buildCard(
            'Player\'s Author\'s Note',
            defaultConfig.length > 1500 ? defaultConfig.substring(0, 1497) + '...' : defaultConfig,
            'Custom',
            CARD_KEY,
            'Your personal author\'s note - preserved across turns',
            1 // High priority
        );
    };

    const ensureCard = () => {
        let card = storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
        if (!card) {
            card = createDefaultCard();
            if (VOGLER_CONFIG.debugLogging) {
                log('✍️ Created Player\'s Author\'s Note story card');
            }
        }
        return card;
    };

    const getPlayersNote = () => {
        const card = ensureCard();
        if (!card || !card.entry) return '';

        // Extract only the custom part (after the template header)
        const lines = card.entry.split('\n');
        const startIndex = lines.findIndex(line => line.includes('Example instructions:'));

        if (startIndex === -1 || startIndex >= lines.length - 1) {
            // User hasn't customized yet, return empty
            return '';
        }

        // Get everything after the examples
        const customStart = lines.findIndex((line, idx) =>
            idx > startIndex && line.trim() !== '' && !line.includes('-') && !line.includes('Example')
        );

        if (customStart === -1) return '';

        return lines.slice(customStart).join('\n').trim();
    };

    return { ensureCard, getPlayersNote };
})();

/**
 * Word Banks Configuration Card
 */
const WordBanksCard = (() => {
    const CARD_KEY = 'word_banks';

    const createDefaultCard = () => {
        const defaultConfig = `WORD BANKS - STOP WORDS & FILTERS
Words to avoid or replace for better prose

WEAK ADVERBS (avoid):
very, really, quite, just, rather, somewhat, fairly, pretty, basically, actually, literally, totally, absolutely

OVERUSED TRANSITIONS (avoid):
suddenly, meanwhile, however, therefore, nevertheless, moreover, furthermore

FILTER WORDS (show don't tell):
realized, noticed, seemed, appeared, felt like, thought to, could see, could hear, could feel

TELLING PHRASES (avoid):
a bit, a little, kind of, sort of, in a way, for some reason, somehow

REDUNDANT PAIRS (avoid):
still remained, completely destroyed, final end, advance planning, past history, close proximity

USAGE: Edit this card to customize your word filters. System will try to avoid or replace these words when possible.

Save and refresh to apply.`;

        return buildCard(
            'Configure Word Banks',
            defaultConfig.length > 1500 ? defaultConfig.substring(0, 1497) + '...' : defaultConfig,
            'Custom',
            CARD_KEY,
            'Stop words and quality filters for better prose',
            53
        );
    };

    const ensureCard = () => {
        let card = storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
        if (!card) {
            card = createDefaultCard();
            if (VOGLER_CONFIG.debugLogging) {
                log('🚫 Created Word Banks Configuration story card');
            }
        }
        return card;
    };

    return { ensureCard };
})();

// #endregion

// #region Story Card Management

/**
 * Build or update a story card (modern API, not worldinfo)
 * Ensures value stays under 1500 characters
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

    // Enforce 1500 character limit on entry
    if (entry.length > 1500) {
        entry = entry.substring(0, 1497) + '...';
        if (VOGLER_CONFIG.debugLogging) {
            log(`⚠️ Card entry truncated to 1500 chars: ${title}`);
        }
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

// #endregion

// #region Initialization

/**
 * Initialize all Vogler systems and create configuration cards
 */
const initVoglerSystems = () => {
    if (state.voglerSystemsInit) return;

    // Create all configuration story cards
    VoglerConfigCard.ensureCard();
    NGOConfigCard.ensureCard();
    SynonymConfigCard.ensureCard();
    PlayersAuthorsNoteCard.ensureCard();
    WordBanksCard.ensureCard();

    // Load configuration from cards
    VoglerConfigCard.loadAndApply();

    state.voglerSystemsInit = true;

    if (VOGLER_CONFIG.debugLogging) {
        log('✅ Vogler systems initialized with all configuration cards');
    }
};

// Initialize on load
initVoglerSystems();

// #endregion

// Export for use in other scripts
const VoglerEngine = {
    // State
    init: initVoglerState,
    getCurrentStage: getCurrentVoglerStage,

    // Stage management
    advanceStage: advanceVoglerStage,
    shouldAdvance: shouldAdvanceStage,

    // Beats
    completeBeat: completeVoglerBeat,
    detectBeats: detectStoryBeats,

    // Integration
    getTemperature: getVoglerTemperature,
    getHeat: getVoglerHeat,
    getVSParams: getVoglerVSParams,
    buildAuthorsNote: buildVoglerAuthorsNote,

    // Commands
    processCommands: processVoglerCommands,

    // Analytics
    getProgress: getVoglerProgress,
    logStatus: logVoglerStatus,

    // Configuration Cards
    config: {
        vogler: VoglerConfigCard,
        ngo: NGOConfigCard,
        synonyms: SynonymConfigCard,
        playersNote: PlayersAuthorsNoteCard,
        wordBanks: WordBanksCard
    },

    // Word Lists & Databases
    wordLists: VOGLER_WORD_LISTS,
    stopWords: STOP_WORDS,
    synonyms: ENHANCED_SYNONYM_MAP
};

// Make available globally
if (typeof window !== 'undefined') {
    window.VoglerEngine = VoglerEngine;
}

void 0;
