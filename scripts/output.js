/**
 * ============================================================================
 * AI DUNGEON OUTPUT SCRIPT
 * Analyzes and optionally modifies AI output before showing to player
 * ============================================================================
 *
 * This script runs AFTER sharedLibrary and can:
 * - Analyze output quality (Bonepoke)
 * - Trigger regeneration if quality is too low
 * - Clean up formatting issues
 * - Track analytics
 *
 * Available params: text, state, history, info, storyCards
 * Returns: { text } or { text, stop } (stop=true triggers regeneration)
 */

const modifier = (text) => {
    // Initialize regeneration counter if needed
    state.regenCount = state.regenCount || 0;
    state.regenThisOutput = state.regenThisOutput || 0;

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

    // Clean up output formatting
    const cleanOutput = (output) => {
        // Remove any accidental XML tags that might have leaked through
        output = output.replace(/<\/?response>/g, '');
        output = output.replace(/<\/?probability>/g, '');
        output = output.replace(/<\/?text>/g, '');
        output = output.replace(/<\/?candidate[^>]*>/g, '');
        output = output.replace(/<\/?selected>/g, '');

        // Remove VS instruction if it leaked through
        output = output.replace(/\[Internal Sampling Protocol:[\s\S]*?\]/g, '');

        // Remove empty lines at start/end
        output = output.trim();

        // Normalize multiple newlines to max 2
        output = output.replace(/\n{3,}/g, '\n\n');

        return output;
    };

    text = cleanOutput(text);

    // Prevent starting with starting message on first output
    // (Only show custom starting message or blank, never AI-generated intro)
    if (info.actionCount === 0) {
        // Return blank or custom start message
        const customStart = state.customStartMessage || ' ';
        return { text: customStart };
    }

    return { text };
};

// Execute modifier
modifier(text);

// Best Practice: Always end lifecycle scripts with void 0
void 0;
