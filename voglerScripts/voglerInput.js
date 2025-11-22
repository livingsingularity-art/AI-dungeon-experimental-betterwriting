/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER'S HERO'S JOURNEY - INPUT SCRIPT
 * Pre-processes user input before it reaches the AI
 * ============================================================================
 *
 * Handles:
 * - Vogler-specific commands (@stage, @beat)
 * - Story beat detection from player actions
 * - Turn counting and stage progression tracking
 *
 * @version 1.0.0
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize Vogler state
    const voglerState = VoglerEngine.init();

    // Track input metadata
    state.lastInputType = history[history.length - 1]?.type || 'action';
    state.lastInputTimestamp = Date.now();

    // Increment turn counter
    voglerState.turnsInStage++;
    voglerState.totalTurns++;

    // Process Vogler commands (@stage, @beat)
    if (VOGLER_CONFIG.enabled) {
        const commandResult = VoglerEngine.processCommands(text);
        text = commandResult.processed;

        // Log commands found
        if (Object.keys(commandResult.commands).length > 0 && VOGLER_CONFIG.debugLogging) {
            console.log(`🎬 Vogler commands: ${JSON.stringify(commandResult.commands)}`);
        }

        // CRITICAL: If commands consumed all text, provide minimal input
        if (!text || text.trim() === '') {
            text = '.';  // Minimal continue command
            if (VOGLER_CONFIG.debugLogging) {
                console.log(`⚠️ Commands consumed all input - using continue signal`);
            }
        }
    }

    // Detect story beats from player input
    if (VOGLER_CONFIG.enabled) {
        const detectedBeats = VoglerEngine.detectBeats(text);

        if (detectedBeats.length > 0 && VOGLER_CONFIG.debugLogging) {
            console.log(`✅ Player beats detected: ${detectedBeats.join(', ')}`);
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

    // Store processed input in state for analysis
    state.lastProcessedInput = text;

    // Check if stage advancement should be considered
    if (VOGLER_CONFIG.autoAdvance) {
        const advanceCheck = VoglerEngine.shouldAdvance();

        if (advanceCheck.should) {
            // Note: Actual advancement happens in output script
            // Store flag for output script to check
            state.vogler.pendingAdvancement = {
                ready: true,
                reason: advanceCheck.reason
            };

            if (VOGLER_CONFIG.debugLogging) {
                console.log(`🎬 Stage advancement pending: ${advanceCheck.reason}`);
            }
        } else if (VOGLER_CONFIG.debugLogging && voglerState.turnsInStage % 3 === 0) {
            // Log progress every 3 turns
            console.log(`🎬 Not ready to advance: ${advanceCheck.reason}`);
        }
    }

    return { text };
};

// Let AI Dungeon call modifier
void 0;
