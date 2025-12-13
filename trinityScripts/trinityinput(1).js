/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * AI DUNGEON INPUT SCRIPT (Optimized v2.2)
 * Pre-processes user input before it reaches the AI
 * ============================================================================
 */

const modifier = (text) => {
    // Track input in state for analytics
    state.lastInputType = history[history.length - 1]?.type || 'action';
    state.lastInputTimestamp = Date.now();

    // === NGO COMMAND PROCESSING ===
    // Process @req, (...), @temp, @arc commands BEFORE anything else
    if (CONFIG.commands && CONFIG.commands.enabled) {
        const commandResult = NGOCommands.processAllCommands(text);
        text = commandResult.processed;

        // Log commands found
        if (Object.keys(commandResult.commands).length > 0) {
            safeLog(`🎮 Commands: ${JSON.stringify(commandResult.commands)}`, 'info');
        }

        // CRITICAL FIX: If commands consumed all text, provide minimal input
        // AI Dungeon crashes with empty input - use continue signal instead
        if (!text || text.trim() === '') {
            text = '.';  // Minimal continue command
            safeLog(`⚠️ Commands consumed all input - using continue signal`, 'warn');
        }

        // === @REQ FRONT MEMORY INJECTION ===
        // Set frontMemory in INPUT modifier (not context!) - pattern from Narrative-Steering-Wheel line 110
        // This ensures @req is injected into context BEFORE AI processes it
        if (CONFIG.commands.reqDualInjection && state.commands && state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
            const frontMemoryInjection = NGOCommands.buildFrontMemoryInjection();
            if (frontMemoryInjection && state.memory) {
                state.memory.frontMemory = frontMemoryInjection;
                safeLog(`💉 Front memory set with @req: "${state.commands.narrativeRequest}"`, 'info');
            }
        }
    }

    // === DIVERSITY COMMANDS ===
    // Process /diversity, /health, /clearblocked, /diversityreset, /threshold commands
    if (CONFIG.diversity && CONFIG.diversity.enabled) {
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
    }

    // Better Say Actions - Enhanced dialogue formatting
    // Credit: BinKompliziert (AI Dungeon Discord)
    const enhanceSayActions = (input) => {
        // Only process "say" actions
        if (state.lastInputType !== 'say') return input;

        // Fix common typo: "i says" -> "I say"
        input = input.replace(/\bi says\b/gi, 'I say');

        // Handle custom triggers: "whisper, hello" -> "You whisper, "hello""
        const triggers = [
            'say', 'exclaim', 'whisper', 'mutter', 'utter',
            'shout', 'yell', 'scream', 'ask', 'answer',
            'reply', 'respond', 'joke', 'lie'
        ];

        // Pattern: "trigger, dialogue" or "action and trigger,, dialogue"
        const triggerPattern = new RegExp(
            `\\b(${triggers.join('|')})(s?),\\s*(.+)`,
            'i'
        );

        // Pattern for double comma: "action,, dialogue"
        if (input.includes(',,')) {
            input = input.replace(/(.+?),,\s*(.+)/, (match, action, dialogue) => {
                return `${action.trim()}, "${dialogue.trim()}"`;
            });
        } else if (triggerPattern.test(input)) {
            input = input.replace(triggerPattern, (match, verb, plural, dialogue) => {
                return `${verb}${plural}, "${dialogue}"`;
            });
        }

        // Add comma after "say/says" if missing
        input = input.replace(/\b(says?)\s+"/, (match, verb) => `${verb}, "`);

        // Capitalize first letter of dialogue
        input = input.replace(/"(\s*)([a-z])/g, (match, space, letter) => {
            return `"${space}${letter.toUpperCase()}`;
        });

        return input;
    };

    // Apply say action enhancements
    text = enhanceSayActions(text);

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // === NGO CONFLICT ANALYSIS (PLAYER INPUT) ===
    // Analyze player input for conflict/calming words to update heat
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
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
    }

    // Store processed input in state for context analysis
    state.lastProcessedInput = text;

    // === AUTO-CARDS INTEGRATION ===
    // Process input through Auto-Cards for automatic story card generation
    text = AutoCards("input", text);

    return { text };
};

// FIX: Don't manually call modifier
void 0;
