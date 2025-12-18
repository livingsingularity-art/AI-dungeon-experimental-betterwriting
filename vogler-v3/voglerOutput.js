/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V3 - OUTPUT SCRIPT
 * Processes AI output before displaying to player
 * ============================================================================
 *
 * DIRECTOR PATTERN (Modular):
 * - detectAIBeatCompletion: Check if AI completed a beat
 * - parseBridgeResponse: Extract bridge events if generation was requested
 * - cleanOutputArtifacts: Remove leaked markers and XML
 * - processStageAdvancement: Check if stage should advance
 *
 * ✅ NO manual modifier() call - Director handles it
 * ============================================================================
 */

/**
 * Detect if AI output indicates beat completion
 * Analyzes AI response for keywords matching remaining beats
 */
const detectAIBeatCompletion = (text) => {
    if (!state.vogler || !state.vogler.initialized) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const act = state.vogler.currentAct;
    const actBeats = state.vogler.acts[act];

    if (actBeats.remainingBeats.length === 0) {
        return { text };
    }

    const lowerText = text.toLowerCase();

    // Check next 2 remaining beats
    const beatsToCheck = actBeats.remainingBeats.slice(0, 2);

    for (const beat of beatsToCheck) {
        const beatWords = beat.toLowerCase().split(' ');
        const significantWords = beatWords.filter(w => w.length > 3);

        // Count how many beat words appear in output
        const matches = significantWords.filter(word =>
            lowerText.includes(word)
        );

        // If 50%+ of significant words match, consider beat completed
        if (matches.length >= Math.ceil(significantWords.length * 0.5)) {
            completeBeat(beat);
            safeLog(`AI output completed beat: "${beat}"`, 'info');
            break;  // Only complete one beat per turn
        }
    }

    return { text };
};

/**
 * Parse bridge response if generation was requested
 * Extract numbered events from AI response
 */
const parseBridgeResponse = (text) => {
    if (!state.vogler.bridge.active) {
        return { text };
    }

    // Look for numbered list pattern
    const eventPattern = /^\s*\d+\.\s*(.+)$/gm;
    const matches = [...text.matchAll(eventPattern)];

    if (matches.length >= CONFIG.bridge.eventsToGenerate) {
        // Extract events
        const events = matches.slice(0, CONFIG.bridge.eventsToGenerate)
            .map(m => m[1].trim());

        // Store in state
        state.vogler.bridge.events = events;
        state.vogler.bridge.active = true;

        // Update bridge card
        updateBridgeCard(events);

        safeLog(`Extracted ${events.length} bridge events from AI response`, 'info');

        // Remove the bridge generation section from output
        let cleaned = text;
        for (const match of matches) {
            cleaned = cleaned.replace(match[0], '');
        }

        // Clean up remaining artifacts
        cleaned = cleaned.replace(/\[BRIDGE REQUEST\][\s\S]*?(?=\n\n|\n>|$)/i, '');
        cleaned = cleaned.replace(/Generate \d+ specific plot events[\s\S]*?(?=\n\n|\n>|$)/i, '');

        return { text: cleaned.trim() };
    }

    return { text };
};

/**
 * Clean output artifacts
 * Remove leaked markers, XML tags, and internal instructions
 */
const cleanOutputArtifacts = (text) => {
    let cleaned = text;

    // Remove stage markers
    cleaned = cleaned.replace(/\[Stage:?\s*\d+\s*:?\s*[^\]]*\]/gi, '');
    cleaned = cleaned.replace(/\[Stage\s+\d+\/\d+\]/gi, '');

    // Remove beat markers
    cleaned = cleaned.replace(/\[Beat:?\s*[^\]]*\]/gi, '');

    // Remove Vogler system markers
    cleaned = cleaned.replace(/\[VOGLER[^\]]*\]/gi, '');
    cleaned = cleaned.replace(/\[SAE[^\]]*\]/gi, '');

    // Remove XML artifacts (if any)
    cleaned = cleaned.replace(/<\/?(?:response|text|candidate|selected|probability)[^>]*>/gi, '');

    // Remove internal sampling instructions (if leaked)
    cleaned = cleaned.replace(/\[Internal Sampling Protocol[^\]]*\]/gi, '');

    // Remove excessive newlines (max 3 consecutive)
    cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

    // Trim
    cleaned = cleaned.trim();

    // Safety: if cleaning removed everything, return minimal placeholder
    if (cleaned.length === 0) {
        safeLog('Warning: Output cleaning removed all content!', 'warn');
        return { text: ' ' };
    }

    return { text: cleaned };
};

/**
 * Process stage advancement
 * Check if conditions are met to advance to next stage
 */
const processStageAdvancement = (text) => {
    // This runs after beat detection, so check advancement
    checkStageAdvancement();
    return { text };
};

/**
 * Add user feedback (optional)
 * Display progress information to player
 */
const addUserFeedback = (text) => {
    if (!DEBUG_CONFIG.verboseMode) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const act = state.vogler.currentAct;
    const actBeats = state.vogler.acts[act];

    const feedback = `\n\n[Stage ${state.vogler.currentStage}: ${stage.name} | Beats: ${actBeats.completedBeats.length}/${actBeats.remainingBeats.length + actBeats.completedBeats.length}]`;

    return { text: text + feedback };
};

/**
 * Restore author's note after context hook
 * Note: Changes to state.memory in output don't affect AI until next turn
 * This is just cleanup for consistency
 */
const restoreAuthorsNote = (text) => {
    // Author's note changes in output hook don't affect current turn
    // Just ensure it's set for next turn
    if (CONFIG.authorsNote.enabled && CONFIG.authorsNote.useLayered) {
        state.memory.authorsNote = buildLayeredAuthorsNote();
    }
    return { text };
};

/**
 * Update turn counters
 * Increment counters at end of successful turn
 */
const updateTurnCounters = (text) => {
    // Counters are updated in processTurn() which runs at start of next cycle
    // This is just for logging
    safeLog(`Turn ${state.vogler.totalTurns} complete`, 'debug');
    return { text };
};

// ============================================================================
// DIRECTOR PATTERN USAGE
// Chain functions together - NO manual modifier(text) call
// ============================================================================

director.output(
    detectAIBeatCompletion,       // First: check if AI completed a beat
    parseBridgeResponse,          // Second: extract bridge events if requested
    cleanOutputArtifacts,         // Third: remove leaked markers
    processStageAdvancement,      // Fourth: check if stage should advance
    addUserFeedback,              // Fifth: add progress info (if verbose)
    restoreAuthorsNote,           // Sixth: restore author's note for next turn
    updateTurnCounters            // Seventh: update counters
);

// ✅ CORRECT: End with void 0, NO manual modifier(text) call
void 0;
