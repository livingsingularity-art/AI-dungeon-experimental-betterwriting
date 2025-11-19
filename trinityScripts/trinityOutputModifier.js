/**
 * TRINITY OUTPUT MODIFIER
 * Detects @req fulfillment, cleans up expired memories, updates NGO state
 *
 * SETUP INSTRUCTIONS:
 * 1. Add this as an OUTPUT MODIFIER script in AI Dungeon
 * 2. Make sure trinitysharedLibrary(1).js is loaded as a SHARED LIBRARY script
 * 3. The shared library must load BEFORE this script
 */

const modifier = (text) => {
    try {
        // Ensure state is initialized
        if (!state.initialized) {
            initState();
        }

        // Increment turn counter
        state.ngoStats.totalTurns++;

        // Detect @req fulfillment in AI output
        if (state.commands.narrativeRequest && !state.commands.narrativeRequestFulfilled) {
            const fulfillmentResult = NGOCommands.detectFulfillment(text);

            if (CONFIG.commands.debugLogging && !fulfillmentResult.fulfilled) {
                safeLog(`🔍 @req fulfillment score: ${fulfillmentResult.score.toFixed(2)} (need ${CONFIG.commands.fulfillmentThreshold})`, 'info');
            }
        }

        // Clean up expired parentheses memories
        NGOCommands.cleanupExpiredMemories();

        // Update NGO state if enabled
        if (CONFIG.ngo.enabled && typeof NGONarrativeEngine !== 'undefined') {
            NGONarrativeEngine.updateState(text);
        }

        // Return unmodified text (this modifier only tracks state)
        return { text: text };

    } catch (error) {
        // Graceful error handling
        safeLog(`❌ Output Modifier Error: ${error.message}`, 'error');
        return { text: text };
    }
};

// Export the modifier
modifier(text);
