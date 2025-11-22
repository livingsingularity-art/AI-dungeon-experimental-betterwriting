/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * TRINITY + AUTO-CARDS INPUT SCRIPT (Integrated v3.0)
 * Pre-processes user input before it reaches the AI
 * ============================================================================
 */

const modifier = (text) => {
    // Track input type for analytics
    state.lastInputType = history[history.length - 1]?.type || 'action';
    state.lastInputTimestamp = Date.now();

    // ========== STEP 1: TRINITY NGO - ANALYZE ORIGINAL INPUT ==========
    // CRITICAL: Do this BEFORE AutoCards modifies text
    // This captures conflict words in the player's raw input
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const conflictData = NGOEngine.analyzeConflict(text);
        NGOEngine.processHeatChanges(conflictData, 'player');

        safeLog(`🎮 Player input heat: ${conflictData.conflictCount} conflict, ${conflictData.calmingCount} calming`, 'info');
    }

    // ========== STEP 2: TRINITY COMMANDS - PROCESS AND REMOVE ==========
    // Process @req, @temp, @arc, () commands and extract clean text
    if (CONFIG.commands && CONFIG.commands.enabled) {
        const commandResult = NGOCommands.processAllCommands(text);

        // ✅ FIX: Use the cleaned text (this removes @req, @temp, etc.)
        text = commandResult.processed;

        // Log commands found
        if (Object.keys(commandResult.commands).length > 0) {
            safeLog(`🎮 Commands processed: ${JSON.stringify(commandResult.commands)}`, 'info');
        }

        // CRITICAL FIX: If commands consumed all text, provide minimal input
        // AI Dungeon crashes with empty input - use continue signal instead
        if (!text || text.trim() === '') {
            text = '.';
            safeLog(`⚠️ Commands consumed all input - using continue signal`, 'warn');
        }

        // === @REQ FRONT MEMORY INJECTION ===
        // Set frontMemory for @req (dual injection: frontMemory + author's note)
        if (CONFIG.commands.reqDualInjection && state.commands && state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
            const frontMemoryInjection = NGOCommands.buildFrontMemoryInjection();
            if (frontMemoryInjection && state.memory) {
                state.memory.frontMemory = frontMemoryInjection;
                safeLog(`💉 Front memory set with @req: "${state.commands.narrativeRequest}"`, 'info');
            }
        }
    }

    // ========== STEP 3: BETTER SAY ACTIONS ==========
    // Enhanced dialogue formatting (Trinity feature)
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

    text = enhanceSayActions(text);

    // ========== STEP 4: AUTO-CARDS - PROCESS CLEANED INPUT ==========
    // Auto-Cards gets the cleaned text (commands already removed)
    // This allows Auto-Cards to detect entities without command noise
    text = AutoCards("input", text);

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return { text };
};

void 0;
