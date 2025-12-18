/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V3 - CONTEXT SCRIPT
 * Modifies AI context before model is called
 * ============================================================================
 *
 * DIRECTOR PATTERN (Modular):
 * - injectLayeredAuthorsNote: Build and inject multi-layer guidance
 * - injectFrontMemoryGuidance: Add critical stage instructions
 * - handleBridgePrompt: Process bridge generation requests
 *
 * BEST PRACTICE: Uses state.memory.authorsNote and state.memory.frontMemory
 * instead of direct string concatenation
 *
 * ✅ NO manual modifier() call - Director handles it
 * ============================================================================
 */

/**
 * Inject layered author's note
 * Combines player preferences + stage guidance + beat hints
 */
const injectLayeredAuthorsNote = (text) => {
    if (!CONFIG.authorsNote.enabled || !CONFIG.authorsNote.useLayered) {
        return { text };
    }

    // Build the layered note
    const layeredNote = buildLayeredAuthorsNote();

    // Set to author's note (medium priority)
    state.memory.authorsNote = layeredNote;

    safeLog('Injected layered author\'s note', 'debug');
    return { text };
};

/**
 * Inject critical stage guidance into frontMemory
 * frontMemory has highest priority - AI pays most attention to end of context
 */
const injectFrontMemoryGuidance = (text) => {
    if (!CONFIG.authorsNote.useFrontMemory) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];

    // Critical instructions go to frontMemory
    const criticalGuidance = `[Stage: ${stage.name}] ${stage.guidance}`;

    // Prepend to existing frontMemory (if any)
    const existing = state.memory.frontMemory || '';
    state.memory.frontMemory = criticalGuidance + (existing ? '\n\n' + existing : '');

    safeLog('Injected frontMemory guidance', 'debug');
    return { text };
};

/**
 * Handle bridge card generation prompt
 * If bridge was requested, the prompt is already in frontMemory from input
 */
const handleBridgePrompt = (text) => {
    // Bridge prompts are injected in generateBridgeCard()
    // This function could parse AI response to extract events, but we'll do that in output
    return { text };
};

/**
 * Add turn counter for debugging
 */
const addTurnCounter = (text) => {
    if (!DEBUG_CONFIG.verboseMode) {
        return { text };
    }

    const turnInfo = `[Turn ${state.vogler.totalTurns}, Stage ${state.vogler.currentStage}/${state.vogler.turnsInStage}]`;

    // Add to frontMemory for debugging
    const existing = state.memory.frontMemory || '';
    state.memory.frontMemory = existing + '\n' + turnInfo;

    return { text };
};

/**
 * Context length management (optional)
 * Ensures we don't exceed token limits
 */
const manageContextLength = (text) => {
    // Get estimated max chars from info (if available)
    const maxChars = info && info.maxChars ? info.maxChars : 12000;

    if (text.length > maxChars) {
        safeLog(`Context exceeds maxChars (${text.length} > ${maxChars})`, 'warn');
        // AI Dungeon will truncate, but we log the warning
    }

    return { text };
};

// ============================================================================
// DIRECTOR PATTERN USAGE
// Chain functions together - NO manual modifier() call
// ============================================================================

director.context(
    injectLayeredAuthorsNote,     // First: build layered author's note
    injectFrontMemoryGuidance,    // Second: add critical stage guidance
    handleBridgePrompt,           // Third: handle bridge generation (if active)
    addTurnCounter,               // Fourth: add debug info (if verbose)
    manageContextLength           // Fifth: warn if context too long
);

// ✅ CORRECT: End with void 0, NO manual modifier(text) call
void 0;
