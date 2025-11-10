/**
 * ============================================================================
 * AI DUNGEON INPUT SCRIPT
 * Pre-processes user input before it reaches the AI
 * ============================================================================
 *
 * This script runs AFTER sharedLibrary and modifies the player's input.
 * Use cases:
 * - Fix common typos
 * - Expand shorthand commands
 * - Normalize formatting
 * - Add input metadata to state
 *
 * Available params: text, state, history, info, storyCards
 * Returns: { text } or { text, stop }
 */

const modifier = (text) => {
    // Track input in state for analytics
    state.lastInputType = history[history.length - 1]?.type || 'action';
    state.lastInputTimestamp = Date.now();

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

    // Store processed input in state for context analysis
    state.lastProcessedInput = text;

    return { text };
};

// Execute modifier
modifier(text);

// Best Practice: Always end lifecycle scripts with void 0
void 0;
