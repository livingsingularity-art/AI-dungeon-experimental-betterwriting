/**
 * ============================================================================
 * AI DUNGEON OUTPUT SCRIPT (FIXED v2.1)
 * Analyzes and optionally modifies AI output before showing to player
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize regeneration counter if needed
    state.regenCount = state.regenCount || 0;
    state.regenThisOutput = state.regenThisOutput || 0;

    // CRITICAL FIX: Clean output FIRST before analysis
    // This prevents VS instructions from being analyzed as part of the story
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
        output = output.replace(/from the unlikely tails.*?distribution/gi, '');

        // Remove trailing "stop" (AI Dungeon quirk)
        // Handles both "the stop" and "thestop" (with or without space)
        output = output.replace(/stop\s*$/i, '').trim();

        // Remove empty lines at start/end
        output = output.trim();

        // Normalize multiple newlines to max 2
        output = output.replace(/\n{3,}/g, '\n\n');

        return output;
    };

    // Clean BEFORE analysis
    text = cleanOutput(text);

    // Remove duplicate text at the start (AI repeating last phrase)
    // Get the last output from history to check for duplicates
    const lastAIOutput = history
        .slice()
        .reverse()
        .find(h => h.type === 'ai');

    if (lastAIOutput && lastAIOutput.text) {
        // Get last 100 characters of previous output
        const lastChunk = lastAIOutput.text.slice(-100);

        // Check if current output starts with any suffix of last output
        // This handles cases like:
        // Previous: "...she"
        // Current: "she says..." (duplicate "she")
        for (let len = 50; len >= 10; len--) {
            const suffix = lastChunk.slice(-len).trim();
            if (suffix && text.trim().startsWith(suffix)) {
                // Found duplicate - remove it
                text = text.trim().slice(suffix.length).trim();
                safeLog(`Removed duplicate start: "${suffix.slice(0, 30)}..."`, 'info');
                break;
            }
        }
    }

    // Add space to start of every reply (user requirement)
    if (!text.startsWith(' ')) {
        text = ' ' + text;
    }

    // Analyze output quality with Bonepoke
    const analysis = CONFIG.bonepoke.enabled ?
        BonepokeAnalysis.analyze(text) : null;

    // Store analysis in history
    if (analysis) {
        state.bonepokeHistory = state.bonepokeHistory || [];
        state.bonepokeHistory.push(analysis);

        // Keep only last 20 analyses for memory efficiency
        if (state.bonepokeHistory.length > 20) {
            state.bonepokeHistory = state.bonepokeHistory.slice(-20);
        }

        // Store last score for context script
        state.lastBonepokeScore = analysis.avgScore;
    }

    // Quality-gated regeneration
    const shouldRegenerate = () => {
        if (!CONFIG.bonepoke.enabled) return false;
        if (!analysis) return false;
        if (state.regenThisOutput >= CONFIG.bonepoke.maxRegenAttempts) {
            safeLog('Max regeneration attempts reached, accepting output', 'warn');
            return false;
        }

        const isBelowThreshold = analysis.avgScore < CONFIG.bonepoke.qualityThreshold;

        if (isBelowThreshold) {
            safeLog(
                `Quality below threshold: ${analysis.avgScore.toFixed(2)} < ${CONFIG.bonepoke.qualityThreshold}`,
                'warn'
            );

            // Log specific issues
            if (analysis.suggestions.length > 0) {
                safeLog('Issues detected:', 'warn');
                analysis.suggestions.slice(0, 3).forEach(s => safeLog(`  - ${s}`, 'warn'));
            }

            return true;
        }

        return false;
    };

    // Check if we should regenerate
    if (shouldRegenerate()) {
        state.regenCount += 1;
        state.regenThisOutput += 1;
        Analytics.recordRegeneration();

        safeLog(`Triggering regeneration (attempt ${state.regenThisOutput}/${CONFIG.bonepoke.maxRegenAttempts})`, 'warn');

        // Return with stop=true to trigger regeneration
        return { text: '', stop: true };
    }

    // Reset regen counter on successful output
    state.regenThisOutput = 0;

    // Log quality if enabled
    if (analysis && (CONFIG.bonepoke.debugLogging || CONFIG.vs.debugLogging)) {
        safeLog(`Output quality: ${analysis.quality} (${analysis.avgScore.toFixed(2)})`, 'success');

        // Log scores breakdown
        if (CONFIG.bonepoke.debugLogging) {
            Object.entries(analysis.scores).forEach(([category, score]) => {
                safeLog(`  ${category}: ${score}/5`, 'info');
            });
        }

        // Log MARM status if active
        if (analysis.composted.marm !== 'MARM: suppressed') {
            safeLog(`  ${analysis.composted.marm}`, 'warn');
        }
    }

    // Record analytics
    Analytics.recordOutput(analysis);

    // Safety check: If text is empty after cleaning, don't return nothing
    // This prevents "no text output" errors
    if (!text || text.trim() === '') {
        safeLog('Warning: Output was empty after cleaning, returning space', 'warn');
        return { text: ' ' };
    }

    return { text };
};

// FIX: Don't manually call modifier
void 0;
