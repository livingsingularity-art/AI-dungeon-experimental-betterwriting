/**
 * ============================================================================
 * AI DUNGEON CONTEXT SCRIPT
 * Modifies the context sent to the AI model
 * ============================================================================
 *
 * This script runs AFTER sharedLibrary and modifies the full context.
 * This is where:
 * - Verbalized Sampling instructions are injected
 * - Dynamic corrections are applied based on history
 * - Custom author's notes are added
 *
 * Available params: text, state, history, info, storyCards
 * Returns: { text } or { text, stop }
 */

const modifier = (text) => {
    // Analyze recent history for problems
    const analyzeRecentHistory = () => {
        const recentOutputs = history
            .filter(h => h.type === 'ai')
            .slice(-3)
            .map(h => h.text || '')
            .join(' ');

        if (!recentOutputs) return null;

        return BonepokeAnalysis.analyze(recentOutputs);
    };

    // Apply dynamic corrections if enabled
    if (CONFIG.bonepoke.enabled && CONFIG.bonepoke.enableDynamicCorrection) {
        const recentAnalysis = analyzeRecentHistory();

        if (recentAnalysis) {
            // Store in state for output script
            state.lastContextAnalysis = recentAnalysis;

            // Apply corrections via dynamic story cards
            DynamicCorrection.applyCorrections(recentAnalysis);

            // Log significant issues
            if (recentAnalysis.quality === 'poor') {
                safeLog(`Quality warning: ${recentAnalysis.quality} (score: ${recentAnalysis.avgScore.toFixed(2)})`, 'warn');
            }
        }
    }

    // Adaptive VS configuration based on context
    if (CONFIG.vs.enabled && CONFIG.vs.adaptive) {
        const adaptedParams = VerbalizedSampling.analyzeContext(text);

        // Temporarily adjust VS parameters
        const originalK = CONFIG.vs.k;
        const originalTau = CONFIG.vs.tau;

        CONFIG.vs.k = adaptedParams.k;
        CONFIG.vs.tau = adaptedParams.tau;

        // Update VS card with new params
        VerbalizedSampling.updateCard();

        // Log adaptation
        if (CONFIG.vs.debugLogging) {
            safeLog(`VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau}`, 'info');
        }

        // Reset after this turn (will be re-evaluated next time)
        state.vsAdaptedParams = { originalK, originalTau };
    }

    // Custom Continue handling
    // If user hit Continue, add instruction to continue from last response
    const handleContinue = () => {
        const lastEntry = history[history.length - 1];
        if (lastEntry?.type === 'continue') {
            const lastLine = text
                .split('\n')
                .filter(line => line.trim() !== '')
                .pop() || '';

            // Only add continue instruction if last line seems incomplete
            if (!/[.!?]$/.test(lastLine.trim())) {
                return '\n\n<SYSTEM>Continue from your last response, maintaining the same scene and tone.</SYSTEM>';
            }
        }
        return '';
    };

    text += handleContinue();

    // Inject Verbalized Sampling instruction
    if (CONFIG.vs.enabled) {
        text += '\n\n' + VerbalizedSampling.getInstruction();
    }

    // Track context size for debugging
    if (CONFIG.system.enableAnalytics) {
        state.lastContextSize = text.length;
        state.lastContextWords = text.split(/\s+/).length;
    }

    return { text };
};

// Execute modifier
modifier(text);

// Best Practice: Always end lifecycle scripts with void 0
void 0;
