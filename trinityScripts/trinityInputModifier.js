/**
 * TRINITY INPUT MODIFIER
 * Processes player input commands (@req, parentheses, @temp, @arc, etc.)
 *
 * SETUP INSTRUCTIONS:
 * 1. Add this as an INPUT MODIFIER script in AI Dungeon
 * 2. Make sure trinitysharedLibrary(1).js is loaded as a SHARED LIBRARY script
 * 3. The shared library must load BEFORE this script
 */

const modifier = (text) => {
    try {
        // Ensure state is initialized
        if (!state.initialized) {
            initState();
        }

        // Process all commands (@req, (), @temp, @arc, @report, @strictness)
        const result = NGOCommands.processAllCommands(text);

        // Log if any commands were found (only if debugging enabled)
        if (CONFIG.commands.debugLogging && Object.keys(result.commands).length > 0) {
            const commandList = Object.keys(result.commands).join(', ');
            safeLog(`🎮 Commands detected: ${commandList}`, 'info');
        }

        // Return processed text with commands removed
        return { text: result.processed };

    } catch (error) {
        // Graceful error handling - don't break the game
        safeLog(`❌ Input Modifier Error: ${error.message}`, 'error');
        return { text: text }; // Return original text on error
    }
};

// Export the modifier
modifier(text);
