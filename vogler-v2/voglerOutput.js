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
    // RESTORE AUTHOR'S NOTE (preserved from context hook)
    // ═══════════════════════════════════════════════════════════════
    restoreAuthorsNote();

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
                safeLog('[BRIDGE] Max attempts reached, aborting generation', 'warn');
                state.vogler.pendingBridgeGeneration = null;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPREHENSIVE OUTPUT CLEANING
    // ═══════════════════════════════════════════════════════════════

    text = cleanOutputComprehensive(text);

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

    if (CONFIG.output.removeDuplicates) {
        text = removeDuplicates(text);
    }

    // ═══════════════════════════════════════════════════════════════
    // DIALOGUE FORMATTING
    // ═══════════════════════════════════════════════════════════════

    text = formatDialogue(text);

    // ═══════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════
    if (DEBUG_CONFIG.verboseMode) {
        safeLog('[OUTPUT] Processed output, length: ' + text.length, 'debug');
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
 * Comprehensive AI output cleaning
 * Uses CONFIG.output settings for flexibility
 */
function cleanOutputComprehensive(text) {
    const cfg = CONFIG.output;

    // ─────────────────────────────────────────────────────────────────
    // PHASE 1: Remove XML tags
    // ─────────────────────────────────────────────────────────────────
    if (cfg.cleanXmlTags) {
        // Remove specific XML tags from config
        for (const tag of cfg.xmlTagsToRemove) {
            const openPattern = new RegExp('<' + tag + '[^>]*>', 'gi');
            const closePattern = new RegExp('</' + tag + '>', 'gi');
            text = text.replace(openPattern, '');
            text = text.replace(closePattern, '');
        }
        // Remove any remaining generic XML-like tags
        text = text.replace(/<[^>]+>/g, '');
    }

    // ─────────────────────────────────────────────────────────────────
    // PHASE 2: Remove marker leaks (stage instructions, etc.)
    // ─────────────────────────────────────────────────────────────────
    if (cfg.cleanMarkerLeaks) {
        // Apply marker patterns from config
        for (const pattern of cfg.markerPatterns) {
            try {
                const regex = new RegExp(pattern, 'gi');
                text = text.replace(regex, '');
            } catch (e) {
                safeLog('[OUTPUT] Invalid marker pattern: ' + pattern, 'warn');
            }
        }

        // Remove common instruction leaks
        text = text.replace(/\[Next beat.*?\]/gi, '');
        text = text.replace(/\[Current stage.*?\]/gi, '');
        text = text.replace(/\[Author's note.*?\]/gi, '');

        // Remove generation markers
        text = text.replace(/\[STORY BRIDGE GENERATION\]/g, '');
        text = text.replace(/\[END GENERATION\]/g, '');

        // Remove VS (Verbalized Sampling) leaks
        text = text.replace(/\[VS:.*?\]/gi, '');
        text = text.replace(/\[Temperature:.*?\]/gi, '');

        // Remove trailing "stop" quirk (common AI artifact)
        text = text.replace(/\s*stop\s*$/i, '');
    }

    // ─────────────────────────────────────────────────────────────────
    // PHASE 3: Clean excessive whitespace
    // ─────────────────────────────────────────────────────────────────
    if (cfg.cleanExcessiveNewlines) {
        const maxNewlines = cfg.maxConsecutiveNewlines || 3;
        const pattern = new RegExp('\\n{' + (maxNewlines + 1) + ',}', 'g');
        text = text.replace(pattern, '\n'.repeat(maxNewlines));
    }

    // Always trim
    text = text.trim();

    return text;
}

/**
 * Legacy function - Clean AI output of unwanted artifacts
 * @deprecated Use cleanOutputComprehensive() instead
 */
function cleanOutput(text) {
    return cleanOutputComprehensive(text);
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
