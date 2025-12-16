/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V2 - CONTEXT SCRIPT
 * Injects stage guidance, beat info, and bridge prompts into AI context
 * ============================================================================
 * @version 2.0.0
 */

const modifier = (text) => {
    // Initialize Vogler state if needed
    if (!state.vogler || !state.vogler.initialized) {
        initVoglerState();
    }

    // Increment turn counter
    state.vogler.turnsInStage++;
    state.vogler.stats.totalTurns++;

    // Progressive bridge removal (if bridge exists)
    if (state.vogler.bridge) {
        progressiveBridgeRemoval();
    }

    // Build and inject author's note with stage guidance
    const stageGuidance = buildStageGuidance();

    // Combine with existing author's note
    if (state.memory && state.memory.authorsNote !== undefined) {
        // Preserve any existing author's note and add stage guidance
        const existingNote = state.memory.authorsNote || '';
        if (!existingNote.includes('[Stage:')) {
            state.memory.authorsNote = existingNote + '\n\n' + stageGuidance;
        } else {
            // Update stage guidance portion
            state.memory.authorsNote = existingNote.replace(/\[Stage:[\s\S]*$/, stageGuidance);
        }
    } else {
        // Initialize memory if needed
        if (!state.memory) state.memory = {};
        state.memory.authorsNote = stageGuidance;
    }

    // Handle bridge generation if flagged
    if (state.vogler.generateBridgeThisTurn && state.vogler.pendingBridgeGeneration) {
        const bridgePrompt = state.vogler.pendingBridgeGeneration.prompt;

        // Inject bridge generation prompt at end of context
        text = text + '\n\n' + bridgePrompt;

        // Clear flag (will be processed in output)
        state.vogler.generateBridgeThisTurn = false;

        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER-CONTEXT] Injected bridge generation prompt');
        }
    }

    // Log current state if verbose
    if (DEBUG_CONFIG.verboseMode) {
        const stage = VOGLER_STAGES[state.vogler.currentStage];
        log('[VOGLER-CONTEXT] Turn ' + state.vogler.stats.totalTurns +
            ' | Stage: ' + stage.name +
            ' | Turns in stage: ' + state.vogler.turnsInStage);
    }

    return { text };
};

// Don't modify below this line
// FIX: Don't manually call modifier - let AI Dungeon call it
void 0;
