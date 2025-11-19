/**
 * TRINITY AUTHORS NOTE MODIFIER
 * Injects command guidance into author's note (@req priority, parentheses memory)
 *
 * SETUP INSTRUCTIONS:
 * 1. Add this as AUTHORS NOTE script in AI Dungeon (use memory.authorsNote)
 * 2. Make sure trinitysharedLibrary(1).js is loaded as a SHARED LIBRARY script
 * 3. The shared library must load BEFORE this script
 */

const modifier = (text) => {
    try {
        // Ensure state is initialized
        if (!state.initialized) {
            initState();
        }

        let authorsNote = text || '';

        // Get player's custom authors note content
        const playerContent = PlayersAuthorsNoteCard.getPlayerContent();
        if (playerContent) {
            authorsNote = playerContent + '\n\n';
        }

        // Build command guidance layers (@req + parentheses memories)
        const commandLayers = NGOCommands.buildAuthorsNoteLayer();

        // Add @req guidance (highest priority)
        if (commandLayers.reqGuidance) {
            authorsNote += commandLayers.reqGuidance + '\n';
            if (CONFIG.commands.debugLogging) {
                safeLog('📝 @req guidance added to author\'s note', 'info');
            }
        }

        // Add parentheses memory guidance
        if (commandLayers.memoryGuidance) {
            authorsNote += commandLayers.memoryGuidance + '\n';
            if (CONFIG.commands.debugLogging) {
                safeLog('📝 Parentheses memory guidance added to author\'s note', 'info');
            }
        }

        // Add NGO narrative guidance if enabled
        if (CONFIG.ngo.enabled) {
            const ngoGuidance = NGONarrativeEngine.buildNarrativeGuidance();
            if (ngoGuidance) {
                authorsNote += '\n' + ngoGuidance;
            }
        }

        return { text: authorsNote.trim() };

    } catch (error) {
        // Graceful error handling
        safeLog(`❌ Authors Note Modifier Error: ${error.message}`, 'error');
        return { text: text };
    }
};

// Export the modifier
modifier(text);
