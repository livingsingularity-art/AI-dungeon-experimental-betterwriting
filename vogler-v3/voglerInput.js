/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V3 - INPUT SCRIPT
 * Pre-processes player input before it reaches the AI
 * ============================================================================
 *
 * DIRECTOR PATTERN (Modular):
 * - processDebugCommands: Handle /vogler commands
 * - processPlayerCommands: Handle @stage, @beat, @bridge
 * - detectBeatCompletion: Check if player completed a beat
 * - enhanceSayActions: Improve formatting (optional)
 *
 * ✅ NO manual modifier() call - Director handles it
 * ============================================================================
 */

/**
 * Process debug commands (/vogler)
 */
const processDebugCommands = (text) => {
    if (text.startsWith('/vogler')) {
        return processVoglerCommand(text);
    }
    return { text };
};

/**
 * Process player commands (@stage, @beat, @bridge)
 */
const processPlayerCommands = (text) => {
    let modifiedText = text;
    let shouldStop = false;

    // @stage N - Jump to specific stage
    const stageMatch = text.match(/@stage\s+(\d+)/i);
    if (stageMatch) {
        const stageNum = parseInt(stageMatch[1]);
        if (stageNum >= 1 && stageNum <= 12) {
            state.vogler.currentStage = stageNum;
            state.vogler.currentAct = VOGLER_STAGES[stageNum].act;
            state.vogler.turnsInStage = 0;

            // Sync NGO
            if (CONFIG.ngo.enabled) {
                syncVoglerToNGO();
            }

            safeLog(`Player jumped to Stage ${stageNum}: ${VOGLER_STAGES[stageNum].name}`, 'info');

            // Remove command from text
            modifiedText = modifiedText.replace(/@stage\s+\d+/i, '').trim();
        }
    }

    // @beat - Mark next beat complete
    if (text.match(/@beat/i)) {
        const act = state.vogler.currentAct;
        const actBeats = state.vogler.acts[act];

        if (actBeats.remainingBeats.length > 0) {
            const nextBeat = actBeats.remainingBeats[0];
            completeBeat(nextBeat);
            safeLog(`Player marked beat complete: "${nextBeat}"`, 'info');
        }

        // Remove command from text
        modifiedText = modifiedText.replace(/@beat/i, '').trim();
    }

    // @bridge - Generate bridge card
    if (text.match(/@bridge/i)) {
        generateBridgeCard();
        safeLog('Player requested bridge card generation', 'info');

        // Remove command from text
        modifiedText = modifiedText.replace(/@bridge/i, '').trim();
    }

    // @temp N - Set NGO temperature (if NGO is available)
    const tempMatch = text.match(/@temp\s+(\d+)/i);
    if (tempMatch && state.ngo) {
        const temp = parseInt(tempMatch[1]);
        state.ngo.temperature = Math.max(1, Math.min(15, temp));
        safeLog(`Player set NGO temperature to ${temp}`, 'info');

        // Remove command from text
        modifiedText = modifiedText.replace(/@temp\s+\d+/i, '').trim();
    }

    // If all text was commands, prevent empty input
    if (modifiedText.trim().length === 0) {
        modifiedText = ' ';  // Minimal placeholder
        shouldStop = true;
    }

    return { text: modifiedText, stop: shouldStop };
};

/**
 * Detect beat completion from player input
 * Analyzes input for keywords matching current stage beats
 */
const detectBeatCompletion = (text) => {
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

    // Check if input matches any stage keywords
    const hasKeyword = stage.keywords.some(keyword =>
        lowerText.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
        // Check if matches first remaining beat (approximate)
        const nextBeat = actBeats.remainingBeats[0];
        const beatWords = nextBeat.toLowerCase().split(' ');

        // If 2+ words from beat appear in input, consider it completed
        const matches = beatWords.filter(word =>
            word.length > 3 && lowerText.includes(word)
        );

        if (matches.length >= 2) {
            completeBeat(nextBeat);
            safeLog(`Auto-detected beat completion: "${nextBeat}"`, 'info');
        }
    }

    return { text };
};

/**
 * Enhance say actions (optional)
 * Based on Trinity's "Better Say Actions" by BinKompliziert
 */
const enhanceSayActions = (text) => {
    // Only process "say" actions
    if (!text.match(/>\s*you\s+say\s+"/i)) {
        return { text };
    }

    // Add comma after "say"
    let enhanced = text.replace(/(say)(s?\s+")/i, (m, a, b) => a + ',' + b);

    // Fix first person
    enhanced = enhanced.replace(/\bi says/i, 'I say');

    // Capitalize first letter after quote
    enhanced = enhanced.replace(/(says?,\s+")(\w)/i, (m, a, b) => a + b.toUpperCase());

    return { text: enhanced };
};

/**
 * Empty input safety
 * Prevent crashes from empty submissions
 */
const preventEmptyInput = (text) => {
    if (!text || text.trim().length === 0) {
        return { text: ' ' };  // Minimal placeholder
    }
    return { text };
};

// ============================================================================
// DIRECTOR PATTERN USAGE
// Define modifier that AI Dungeon will call
// ============================================================================

const modifier = (text) => {
    return director.input(
        processDebugCommands,     // First: handle /vogler commands
        processPlayerCommands,    // Second: handle @stage, @beat, @bridge
        detectBeatCompletion,     // Third: auto-detect beat completion
        enhanceSayActions,        // Fourth: improve say action formatting
        preventEmptyInput         // Fifth: safety check for empty input
    );
};

// AI Dungeon calls modifier(text) automatically
modifier(text);
