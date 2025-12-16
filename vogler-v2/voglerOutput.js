/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V2 - OUTPUT SCRIPT
 * Processes AI output, detects beats, handles bridge parsing, stage advancement
 * ============================================================================
 * @version 2.0.0
 */

const modifier = (text) => {
    // Initialize Vogler state if needed
    if (!state.vogler || !state.vogler.initialized) {
        initVoglerState();
    }

    // Safety: Never return empty output
    if (!text || text.trim() === '') {
        return { text: '...' };
    }

    const originalText = text;

    // ═══════════════════════════════════════════════════════════════
    // PARSE BRIDGE GENERATION RESPONSE
    // ═══════════════════════════════════════════════════════════════

    if (state.vogler.pendingBridgeGeneration) {
        // Check if output contains numbered list (bridge events)
        if (/^\d+[\.\)]\s*.+/m.test(text)) {
            const success = storeBridgeEvents(text);
            if (success) {
                // Remove the generation output from displayed text
                text = text.replace(/\[STORY BRIDGE GENERATION\][\s\S]*?\[END GENERATION\]/g, '');
                text = text.replace(/^\d+[\.\)]\s*.+$/gm, '').trim();

                state.message = '[VOGLER] Bridge card created with ' +
                    state.vogler.bridge.events.length + ' events!';
            }
            state.vogler.pendingBridgeGeneration = null;
        } else {
            // Increment attempt counter
            state.vogler.pendingBridgeGeneration.attempts++;
            if (state.vogler.pendingBridgeGeneration.attempts >= 3) {
                log('[SAE-BRIDGE] Max attempts reached, aborting generation');
                state.vogler.pendingBridgeGeneration = null;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CLEAN OUTPUT
    // ═══════════════════════════════════════════════════════════════

    text = cleanOutput(text);

    // ═══════════════════════════════════════════════════════════════
    // BEAT DETECTION FROM AI OUTPUT
    // ═══════════════════════════════════════════════════════════════

    detectBeatsFromOutput(text);

    // ═══════════════════════════════════════════════════════════════
    // CHECK STAGE ADVANCEMENT
    // ═══════════════════════════════════════════════════════════════

    if (checkStageAdvancement()) {
        const previousStage = state.vogler.currentStage;
        advanceStage();
        const newStage = VOGLER_STAGES[state.vogler.currentStage];

        // Notify player of stage change
        if (state.message) {
            state.message += '\n\n';
        } else {
            state.message = '';
        }
        state.message += '[VOGLER] Stage advanced to: ' + newStage.name;
    }

    // ═══════════════════════════════════════════════════════════════
    // DUPLICATE PREVENTION
    // ═══════════════════════════════════════════════════════════════

    text = removeDuplicates(text);

    // ═══════════════════════════════════════════════════════════════
    // DIALOGUE FORMATTING
    // ═══════════════════════════════════════════════════════════════

    text = formatDialogue(text);

    // Log output processing
    if (DEBUG_CONFIG.verboseMode) {
        log('[VOGLER-OUTPUT] Processed output, length: ' + text.length);
    }

    return { text };
};

/**
 * Detect story beats from AI output using keywords
 */
function detectBeatsFromOutput(text) {
    const currentStage = state.vogler.currentStage;
    const currentAct = state.vogler.currentAct;
    const stage = VOGLER_STAGES[currentStage];
    const actData = state.vogler.acts[currentAct];
    const lowerText = text.toLowerCase();

    if (!actData || !actData.remainingBeats || actData.remainingBeats.length === 0) {
        return;
    }

    // Check for stage keywords
    let keywordsFound = 0;
    for (const keyword of stage.keywords) {
        if (lowerText.includes(keyword)) {
            keywordsFound++;
        }
    }

    // Check for beat-specific keywords
    const nextBeat = actData.remainingBeats[0].toLowerCase();
    const beatKeywords = nextBeat.split(' ').filter(w => w.length > 3);
    let beatKeywordsFound = 0;

    for (const keyword of beatKeywords) {
        if (lowerText.includes(keyword)) {
            beatKeywordsFound++;
        }
    }

    // Auto-complete beat if strong match (configurable)
    // Currently disabled - beats require manual completion via @beat
    if (false && keywordsFound >= 3 && beatKeywordsFound >= 2) {
        completeBeat(currentAct, 0);
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER-OUTPUT] Auto-completed beat based on keyword match');
        }
    }
}

/**
 * Clean AI output of unwanted artifacts
 */
function cleanOutput(text) {
    // Remove accidental XML/instruction leaks
    text = text.replace(/<[^>]+>/g, '');

    // Remove stage instruction leaks
    text = text.replace(/\[Stage:.*?\]/g, '');
    text = text.replace(/\[Next beat.*?\]/g, '');
    text = text.replace(/\[VOGLER.*?\]/g, '');

    // Remove generation markers
    text = text.replace(/\[STORY BRIDGE GENERATION\]/g, '');
    text = text.replace(/\[END GENERATION\]/g, '');

    // Clean excessive whitespace
    text = text.replace(/\n{4,}/g, '\n\n\n');
    text = text.trim();

    return text;
}

/**
 * Remove duplicate text from output
 */
function removeDuplicates(text) {
    // Check against last output if stored
    if (state.vogler.lastOutput) {
        const lastOutput = state.vogler.lastOutput;

        // Check for repeated opening (up to 50 chars)
        for (let len = 50; len >= 20; len--) {
            if (text.length >= len && lastOutput.endsWith(text.substring(0, len))) {
                text = text.substring(len).trim();
                if (DEBUG_CONFIG.verboseMode) {
                    log('[VOGLER-OUTPUT] Removed ' + len + ' duplicate chars from start');
                }
                break;
            }
        }
    }

    // Store this output for next comparison
    state.vogler.lastOutput = text.slice(-200);

    return text;
}

/**
 * Format dialogue for consistency
 */
function formatDialogue(text) {
    // Fix common dialogue formatting issues

    // Ensure proper quote formatting
    text = text.replace(/"\s*,\s*([a-z])/g, '," $1'); // "Hello" ,she -> "Hello," she
    text = text.replace(/([.!?])"([A-Z])/g, '$1" $2'); // "Hello."She -> "Hello." She

    // Fix unclosed quotes (basic)
    const quoteCount = (text.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
        // Odd number of quotes - likely unclosed
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER-OUTPUT] Warning: Odd number of quotes detected');
        }
    }

    return text;
}

// Don't modify below this line
// FIX: Don't manually call modifier - let AI Dungeon call it
void 0;
