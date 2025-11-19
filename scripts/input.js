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

    return { text };
};

// FIX: Don't manually call modifier
void 0;
