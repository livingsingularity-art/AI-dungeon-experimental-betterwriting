/**
 * TRINITY CONTEXT MODIFIER
 * Injects command guidance (@req, parentheses memory) into the AI's context
 *
 * SETUP INSTRUCTIONS:
 * 1. Add this as a CONTEXT MODIFIER script in AI Dungeon
 * 2. Make sure trinitysharedLibrary(1).js is loaded as a SHARED LIBRARY script
 * 3. The shared library must load BEFORE this script
 */

const modifier = (text) => {
    try {
        // Ensure state is initialized
        if (!state.initialized) {
            initState();
        }

        let modifiedText = text;

        // Add front memory injection for @req (if dual injection enabled)
        const frontMemory = NGOCommands.buildFrontMemoryInjection();
        if (frontMemory) {
            modifiedText = frontMemory + '\n\n' + modifiedText;
            if (CONFIG.commands.debugLogging) {
                safeLog('📤 @req front memory injected', 'info');
            }
        }

        return { text: modifiedText };

    } catch (error) {
        // Graceful error handling
        safeLog(`❌ Context Modifier Error: ${error.message}`, 'error');
        return { text: text };
    }
};

// Export the modifier
modifier(text);
