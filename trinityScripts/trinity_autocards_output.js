/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * TRINITY + AUTO-CARDS OUTPUT SCRIPT (Integrated v3.0)
 * Analyzes and optionally modifies AI output before showing to player
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize quality tracking counter if needed
    state.regenCount = state.regenCount || 0;

    // ========== STEP 1: NGO AUTHOR'S NOTE RESTORATION ==========
    // Restore author's note if AI Dungeon reset it
    // This ensures our layered author's note persists across turns
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.memory && state.authorsNoteStorage) {
        // Check if author's note was cleared or reset
        if (!state.memory.authorsNote || state.memory.authorsNote !== state.authorsNoteStorage) {
            state.memory.authorsNote = state.authorsNoteStorage;
            safeLog(`🔄 Author's note restored from storage`, 'info');
        }
    }

    // ========== STEP 2: CLEAN OUTPUT ==========
    // Remove any VS instructions or XML that leaked through
    const cleanOutput = (output) => {
        // Remove any accidental XML tags
        output = output.replace(/<\/?response>/g, '');
        output = output.replace(/<\/?probability>/g, '');
        output = output.replace(/<\/?text>/g, '');
        output = output.replace(/<\/?candidate[^>]*>/g, '');
        output = output.replace(/<\/?selected>/g, '');

        // CRITICAL: Remove VS instruction if it leaked through
        // Pattern: [Internal Sampling Protocol: ... ]
        output = output.replace(/\[Internal Sampling Protocol:[\s\S]*?\]/g, '');

        // Also catch if brackets got stripped but content remains
        output = output.replace(/Internal Sampling Protocol:[\s\S]*?never mention this process[^\n]*/g, '');

        // Remove any remaining instruction fragments
        output = output.replace(/- (mentally )?generate \d+ distinct.*?candidates/gi, '');
        output = output.replace(/- for each.*?probability p/gi, '');
        output = output.replace(/- only consider candidates where p <.*?\)/gi, '');
        output = output.replace(/- randomly select one.*?candidates/gi, '');
        output = output.replace(/- output ONLY.*?response/gi, '');
        output = output.replace(/- never mention.*?output/gi, '');

        return output.trim();
    };

    text = cleanOutput(text);

    // ========== STEP 3: TRINITY BONEPOKE ANALYSIS ==========
    // Analyze output quality BEFORE Auto-Cards modifies it
    if (CONFIG.bonepoke && CONFIG.bonepoke.enabled) {
        const bonepokeResult = BonepokeAnalysis.analyze(text);

        // Store in history (bounded to last 5)
        state.bonepokeHistory = state.bonepokeHistory || [];
        state.bonepokeHistory.push({
            turn: state.turnCount || 0,
            analysis: bonepokeResult
        });

        // Bound history size (memory management)
        if (state.bonepokeHistory.length > 5) {
            state.bonepokeHistory = state.bonepokeHistory.slice(-5);
        }

        // Apply Smart Replacement if enabled
        if (CONFIG.smartReplacement && CONFIG.smartReplacement.enabled) {
            const beforeLength = text.length;
            text = SmartReplacement.process(text, bonepokeResult);
            const afterLength = text.length;

            if (beforeLength !== afterLength) {
                safeLog(`✏️ Smart replacement: ${beforeLength} → ${afterLength} chars`, 'info');
            }
        }

        // Log quality issues
        if (bonepokeResult.quality === 'poor') {
            safeLog(`⚠️ Output quality: ${bonepokeResult.quality} (${bonepokeResult.avgScore.toFixed(2)})`, 'warn');
        }
    }

    // ========== STEP 4: TRINITY NGO PROCESSING ==========
    // Analyze AI output for conflict/calming words and update heat/temperature
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const conflictData = NGOEngine.analyzeConflict(text);
        NGOEngine.processHeatChanges(conflictData, 'ai');

        // ✅ CRITICAL: Process turn to update temperature
        // This is what actually advances the Hero's Journey phases
        NGOEngine.processTurn();

        safeLog(`🌡️ NGO: Heat=${state.ngo.heat}, Temp=${state.ngo.temperature}, Phase=${getCurrentNGOPhase()?.name || 'unknown'}`, 'info');
    }

    // ========== STEP 5: INCREMENT TURN COUNTER ==========
    state.turnCount = (state.turnCount || 0) + 1;

    // ========== STEP 6: AUTO-CARDS - FINAL PROCESSING ==========
    // Auto-Cards does final entity detection and card updates
    // This happens AFTER Trinity's quality control and replacements
    text = AutoCards("output", text);

    return { text };
};

void 0;
