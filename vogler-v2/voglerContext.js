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

    // ═══════════════════════════════════════════════════════════════
    // STORE AUTHOR'S NOTE FOR RESTORATION
    // ═══════════════════════════════════════════════════════════════
    storeAuthorsNote();

    // ═══════════════════════════════════════════════════════════════
    // INCREMENT TURN COUNTERS
    // ═══════════════════════════════════════════════════════════════
    state.vogler.turnsInStage++;
    state.vogler.stats.totalTurns++;

    // ═══════════════════════════════════════════════════════════════
    // PROGRESSIVE BRIDGE REMOVAL
    // ═══════════════════════════════════════════════════════════════
    if (state.vogler.bridge) {
        progressiveBridgeRemoval();
    }

    // ═══════════════════════════════════════════════════════════════
    // APPLY LAYERED AUTHOR'S NOTE
    // Combines: Player note + Stage guidance + Beat hints + Temp effects
    // ═══════════════════════════════════════════════════════════════
    applyLayeredAuthorsNote();

    // ═══════════════════════════════════════════════════════════════
    // UPDATE DEBUG CARD (if enabled)
    // ═══════════════════════════════════════════════════════════════
    if (DEBUG_CONFIG.showDebugCard) {
        updateDebugCard();
    }

    // ═══════════════════════════════════════════════════════════════
    // BRIDGE GENERATION INJECTION
    // ═══════════════════════════════════════════════════════════════
    if (state.vogler.generateBridgeThisTurn && state.vogler.pendingBridgeGeneration) {
        const bridgePrompt = state.vogler.pendingBridgeGeneration.prompt;

        // Inject bridge generation prompt at end of context
        text = text + '\n\n' + bridgePrompt;

        // Clear flag (will be processed in output)
        state.vogler.generateBridgeThisTurn = false;

        safeLog('[CONTEXT] Injected bridge generation prompt', 'debug');
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTO-CARDS INTEGRATION
    // Process context through AutoCards if available and enabled
    // ═══════════════════════════════════════════════════════════════
    if (typeof AutoCards === 'function' && CONFIG.integrations.autoCards) {
        // In AI Dungeon, 'stop' is a global in context modifier scope
        // Use globalThis.stop or default to false if not defined
        const stopParam = (typeof stop !== 'undefined') ? stop : false;
        const autoCardsResult = AutoCards("context", text, stopParam);

        // AutoCards returns { text, stop } - extract both values
        if (autoCardsResult && typeof autoCardsResult === 'object') {
            text = autoCardsResult.text || text;
            // Note: stop is read-only in AI Dungeon context modifier
        } else if (typeof autoCardsResult === 'string') {
            text = autoCardsResult;
        }

        safeLog('[CONTEXT] AutoCards context processing complete', 'debug');
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════
    if (DEBUG_CONFIG.verboseMode) {
        const stage = VOGLER_STAGES[state.vogler.currentStage];
        safeLog('[CONTEXT] Turn ' + state.vogler.stats.totalTurns +
            ' | Stage: ' + stage.name +
            ' | Turns in stage: ' + state.vogler.turnsInStage, 'debug');
    }

    return { text };
};

// Don't modify below this line
// FIX: Don't manually call modifier - let AI Dungeon call it
void 0;
