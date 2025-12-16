/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V2 - INPUT SCRIPT
 * Processes player commands and detects story beats from player actions
 * ============================================================================
 * @version 2.0.0
 */

const modifier = (text) => {
    // Initialize Vogler state if needed
    if (!state.vogler || !state.vogler.initialized) {
        initVoglerState();
    }

    // Safety: Empty input becomes continue
    if (!text || text.trim() === '') {
        return { text: '.' };
    }

    const originalText = text;
    const lowerText = text.toLowerCase().trim();

    // ═══════════════════════════════════════════════════════════════
    // PROCESS DEBUG COMMANDS (/vogler)
    // ═══════════════════════════════════════════════════════════════

    if (lowerText.startsWith('/vogler')) {
        const result = processVoglerCommand(text);
        if (result.handled) {
            // Display message to player and stop further processing
            if (result.message) {
                state.message = result.message;
            }
            return { text: '', stop: true };
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PROCESS PLAYER COMMANDS (@stage, @beat, @bridge)
    // ═══════════════════════════════════════════════════════════════

    // @stage <number> - Jump to specific stage
    const stageMatch = text.match(/@stage\s+(\d+)/i);
    if (stageMatch) {
        const stageNum = parseInt(stageMatch[1]);
        if (jumpToStage(stageNum)) {
            state.message = '[VOGLER] Jumped to Stage ' + stageNum + ': ' + VOGLER_STAGES[stageNum].name;
        } else {
            state.message = '[VOGLER] Invalid stage number: ' + stageNum;
        }
        // Remove command from text
        text = text.replace(/@stage\s+\d+/i, '').trim();
        if (!text) return { text: '', stop: true };
    }

    // @beat - Complete the next structural beat
    if (lowerText.includes('@beat')) {
        const completed = completeNextBeat();
        if (completed) {
            const actData = state.vogler.acts[state.vogler.currentAct];
            const remaining = actData?.remainingBeats?.length || 0;
            state.message = '[VOGLER] Beat completed! ' + remaining + ' beats remaining in current act.';
        } else {
            state.message = '[VOGLER] No beats remaining in current act.';
        }
        // Remove command from text
        text = text.replace(/@beat/gi, '').trim();
        if (!text) return { text: '', stop: true };
    }

    // @bridge - Generate SAE bridge card
    if (lowerText.includes('@bridge')) {
        generateBridgeCard();
        state.message = '[VOGLER] Bridge generation initiated. Continue story to see results.';
        // Remove command from text
        text = text.replace(/@bridge/gi, '').trim();
        if (!text) return { text: '', stop: true };
    }

    // @temp <number> - Set NGO temperature (if NGO available)
    const tempMatch = text.match(/@temp\s+(\d+)/i);
    if (tempMatch && state.ngo) {
        const temp = parseInt(tempMatch[1]);
        state.ngo.temperature = Math.max(1, Math.min(15, temp));
        state.message = '[VOGLER-NGO] Temperature set to ' + state.ngo.temperature;
        text = text.replace(/@temp\s+\d+/i, '').trim();
        if (!text) return { text: '', stop: true };
    }

    // ═══════════════════════════════════════════════════════════════
    // BEAT DETECTION FROM PLAYER INPUT
    // ═══════════════════════════════════════════════════════════════

    detectBeatsFromInput(text);

    // ═══════════════════════════════════════════════════════════════
    // BETTER SAY ACTIONS (from Trinity)
    // ═══════════════════════════════════════════════════════════════

    text = processSayAction(text);

    return { text };
};

/**
 * Detect story beats from player input using keywords
 */
function detectBeatsFromInput(text) {
    const currentStage = state.vogler.currentStage;
    const stage = VOGLER_STAGES[currentStage];
    const lowerText = text.toLowerCase();

    // Check for stage keywords in player input
    let keywordsFound = 0;
    for (const keyword of stage.keywords) {
        if (lowerText.includes(keyword)) {
            keywordsFound++;
        }
    }

    // If multiple keywords found, might indicate beat progression
    if (keywordsFound >= 2) {
        if (DEBUG_CONFIG.verboseMode) {
            log('[VOGLER-INPUT] Multiple stage keywords detected (' + keywordsFound + ')');
        }
        // Could auto-complete beat here, but leaving manual for now
    }
}

/**
 * Process "say" actions with better formatting
 */
function processSayAction(text) {
    // Handle patterns like "whisper, hello" -> 'You whisper, "hello"'
    const sayPatterns = [
        { pattern: /^(whisper|shout|yell|ask|reply|answer|murmur|mutter),?\s+(.+)$/i, verb: '$1' },
        { pattern: /^say,?\s+(.+)$/i, verb: 'say' }
    ];

    for (const { pattern, verb } of sayPatterns) {
        const match = text.match(pattern);
        if (match) {
            const dialogue = match[2] || match[1];
            const capitalizedDialogue = dialogue.charAt(0).toUpperCase() + dialogue.slice(1);
            const actualVerb = match[1] ? match[1].toLowerCase() : verb;

            // Add proper punctuation if missing
            let finalDialogue = capitalizedDialogue;
            if (!/[.!?]$/.test(finalDialogue)) {
                finalDialogue += '.';
            }

            text = 'You ' + actualVerb + ', "' + finalDialogue + '"';
            break;
        }
    }

    // Fix common typos
    text = text.replace(/\bi says\b/gi, 'I say');
    text = text.replace(/\bi said\b/gi, 'I say');

    return text;
}

// Don't modify below this line
// FIX: Don't manually call modifier - let AI Dungeon call it
void 0;
