/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V4 INPUT SCRIPT
 * Pre-processes user input before it reaches the AI
 * ============================================================================
 *
 * Combines:
 * - Trinity input processing (NGO commands, diversity commands, say actions)
 * - Vogler Hero's Journey commands (@stage, @beat, @bridge, /vogler)
 */

/**
 * Process Vogler commands and update state
 */
const processVoglerInput = (text) => {
    const result = processVoglerCommands(text);
    if (result.handled) {
        return result;
    }
    return { text };
};

/**
 * Increment Vogler turn counters
 */
const incrementTurns = (text) => {
    if (state.vogler?.initialized) {
        state.vogler.turnsInStage++;
        state.vogler.totalTurns++;
    }
    return { text };
};

/**
 * Track input type and timestamp
 */
const trackInputMetadata = (text) => {
    state.lastInputType = history[history.length - 1]?.type || 'action';
    state.lastInputTimestamp = Date.now();
    return { text };
};

/**
 * Process NGO commands (@req, (), @temp, @arc)
 */
const processNGOCommands = (text) => {
    if (!CONFIG.commands || !CONFIG.commands.enabled) {
        return { text };
    }

    const commandResult = NGOCommands.processAllCommands(text);
    text = commandResult.processed;

    // Log commands found
    if (Object.keys(commandResult.commands).length > 0) {
        safeLog(`🎮 Commands: ${JSON.stringify(commandResult.commands)}`, 'info');
    }

    // CRITICAL FIX: If commands consumed all text, provide minimal input
    if (!text || text.trim() === '') {
        text = '.';
        safeLog(`⚠️ Commands consumed all input - using continue signal`, 'warn');
    }

    // @REQ FRONT MEMORY INJECTION
    if (CONFIG.commands.reqDualInjection && state.commands && state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
        const frontMemoryInjection = NGOCommands.buildFrontMemoryInjection();
        if (frontMemoryInjection && state.memory) {
            state.memory.frontMemory = frontMemoryInjection;
            safeLog(`💉 Front memory set with @req: "${state.commands.narrativeRequest}"`, 'info');
        }
    }

    return { text };
};

/**
 * Process diversity system commands
 */
const processDiversityCommands = (text) => {
    if (!CONFIG.diversity || !CONFIG.diversity.enabled) {
        return { text };
    }

    const trimmedText = text.trim().toLowerCase();

    // /diversity or /div - Show diversity statistics
    if (trimmedText === '/diversity' || trimmedText === '/div') {
        const ds = state.diversity || {};
        state.message = `📊 Diversity Statistics\n` +
            `Current Score: ${Math.round((ds.lastDiversityScore || 1) * 100)}%\n` +
            `Session Average: ${Math.round((ds.avgScore || 1) * 100)}%\n` +
            `Blocked Phrases: ${(ds.blockedPhrases || []).length}\n` +
            `Intervention Level: ${ds.interventionLevel || 'none'}`;
        return { text: ".", stop: true };
    }

    // /health - Memory and story card health check
    if (trimmedText === '/health') {
        state.message = MemoryHealth.generateReport();
        return { text: ".", stop: true };
    }

    // /clearblocked - Reset blocked phrase list
    if (trimmedText === '/clearblocked') {
        if (state.diversity) {
            state.diversity.blockedPhrases = [];
        }
        state.message = "✓ Blocked phrase list cleared";
        return { text: ".", stop: true };
    }

    // /diversityreset or /divreset - Full diversity system reset
    if (trimmedText === '/diversityreset' || trimmedText === '/divreset') {
        state.diversity = {
            scoreHistory: [],
            avgScore: 1.0,
            blockedPhrases: [],
            rerollCount: 0,
            lastDiversityScore: 1.0,
            alertThreshold: CONFIG.diversity.alertThreshold,
            interventionLevel: 'none',
            outputTexts: []
        };
        state.message = "✓ Diversity system reset";
        return { text: ".", stop: true };
    }

    // /threshold X - Adjust alert threshold
    if (trimmedText.startsWith('/threshold ')) {
        const args = trimmedText.split(' ').slice(1);
        const newThreshold = parseFloat(args[0]);
        if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 1) {
            if (state.diversity) {
                state.diversity.alertThreshold = newThreshold;
            }
            CONFIG.diversity.alertThreshold = newThreshold;
            state.message = `✓ Alert threshold set to ${Math.round(newThreshold * 100)}%`;
        } else {
            state.message = "Usage: /threshold 0.35 (value between 0 and 1)";
        }
        return { text: ".", stop: true };
    }

    return { text };
};

/**
 * Enhanced say action formatting
 */
const enhanceSayActions = (text) => {
    // Only process "say" actions
    if (state.lastInputType !== 'say') return { text };

    // Fix common typo: "i says" -> "I say"
    text = text.replace(/\bi says\b/gi, 'I say');

    // Handle custom triggers
    const triggers = [
        'say', 'exclaim', 'whisper', 'mutter', 'utter',
        'shout', 'yell', 'scream', 'ask', 'answer',
        'reply', 'respond', 'joke', 'lie'
    ];

    const triggerPattern = new RegExp(
        `\\b(${triggers.join('|')})(s?),\\s*(.+)`,
        'i'
    );

    // Pattern for double comma: "action,, dialogue"
    if (text.includes(',,')) {
        text = text.replace(/(.+?),,\s*(.+)/, (match, action, dialogue) => {
            return `${action.trim()}, "${dialogue.trim()}"`;
        });
    } else if (triggerPattern.test(text)) {
        text = text.replace(triggerPattern, (match, verb, plural, dialogue) => {
            return `${verb}${plural}, "${dialogue}"`;
        });
    }

    // Add comma after "say/says" if missing
    text = text.replace(/\b(says?)\s+"/, (match, verb) => `${verb}, "`);

    // Capitalize first letter of dialogue
    text = text.replace(/"(\s*)([a-z])/g, (match, space, letter) => {
        return `"${space}${letter.toUpperCase()}`;
    });

    return { text };
};

/**
 * Normalize whitespace
 */
const normalizeWhitespace = (text) => {
    text = text.replace(/\s+/g, ' ').trim();
    return { text };
};

/**
 * Analyze player input for NGO conflict tracking
 */
const analyzePlayerConflict = (text) => {
    if (!CONFIG.ngo || !CONFIG.ngo.enabled || !state.ngo) {
        return { text };
    }

    const conflictData = NGOEngine.analyzeConflict(text);
    const heatResult = NGOEngine.updateHeat(conflictData, 'player');

    if (CONFIG.ngo.logStateChanges && heatResult.delta !== 0) {
        safeLog(`🔥 Player heat: ${heatResult.oldHeat.toFixed(1)} → ${heatResult.newHeat.toFixed(1)} (conflicts: ${conflictData.conflicts}, calming: ${conflictData.calming})`, 'info');
    }

    // Check if temperature should increase
    const tempCheck = NGOEngine.checkTemperatureIncrease();
    if (tempCheck.shouldIncrease) {
        safeLog(`🌡️ Temperature increase pending (reason: ${tempCheck.reason})`, 'info');
    }

    return { text };
};

/**
 * Store processed input for context analysis
 */
const storeProcessedInput = (text) => {
    state.lastProcessedInput = text;
    return { text };
};

/**
 * Process through AutoCards
 */
const processAutoCards = (text) => {
    text = AutoCards("input", text);
    return { text };
};

// Chain all input processing functions with Director pattern
director.input(
    trackInputMetadata,
    processVoglerInput,      // Vogler: process commands, handle stop
    processNGOCommands,      // Trinity: NGO commands
    processDiversityCommands, // Trinity: diversity commands
    enhanceSayActions,       // Trinity: dialogue formatting
    normalizeWhitespace,     // Trinity: whitespace normalization
    analyzePlayerConflict,   // Trinity: NGO conflict analysis
    incrementTurns,          // Vogler: increment turn counters
    storeProcessedInput,     // Trinity: store for context
    processAutoCards         // Trinity: AutoCards integration
);

// CRITICAL: Always end with void 0
void 0
