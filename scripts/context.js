/**
 * ============================================================================
 * AI DUNGEON CONTEXT SCRIPT (FIXED v2.1)
 * Modifies the context sent to the AI model
 * ============================================================================
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

        // Update VS card with adapted parameters (no CONFIG mutation)
        VerbalizedSampling.updateCard(adaptedParams);

        // Log adaptation
        safeLog(`VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau}`, 'info');

        // Store adapted params for reference if needed
        state.vsAdaptedParams = adaptedParams;
    }

    // Custom Continue handling
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
    // FIX: Use better formatting to prevent leakage
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

// FIX: Don't manually call modifier - let AI Dungeon call it
// The engine automatically calls modifier(text)
// Calling it here causes double execution

void 0;
