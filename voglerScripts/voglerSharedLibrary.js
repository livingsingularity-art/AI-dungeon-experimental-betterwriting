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
    logStatus: logVoglerStatus
};

// Make available globally
if (typeof window !== 'undefined') {
    window.VoglerEngine = VoglerEngine;
}

void 0;
