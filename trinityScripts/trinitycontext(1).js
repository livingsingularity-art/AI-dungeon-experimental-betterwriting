/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * AI DUNGEON CONTEXT SCRIPT (Optimized v2.2)
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
        }
    }

    // === NGO LAYERED AUTHOR'S NOTE SYSTEM ===
    // Build author's note with priority layers:
    // 1. PlayersAuthorsNote card (user's stable author's note)
    // 2. NGO Phase Guidance (dynamic narrative direction)
    // 3. Parentheses memory (gradual goals)
    // 4. @req immediate request (urgent player intent)
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const buildLayeredAuthorsNote = () => {
            const layers = [];

            try {
                // LAYER 1: PlayersAuthorsNote story card content (replaces original)
                // Player edits this card to provide stable custom narrative guidance
                // This is the user's "author's note" since the original gets overwritten
                const playerContent = PlayersAuthorsNoteCard.getPlayerContent();
                if (playerContent) {
                    layers.push(playerContent);
                }

                // LAYER 2: NGO Phase Guidance
                // Dynamic guidance based on current story phase (cultivation stages)
                const currentPhase = getCurrentNGOPhase();
                if (currentPhase && currentPhase.authorNoteGuidance) {
                    layers.push(currentPhase.authorNoteGuidance);
                }

                // LAYER 3: Parentheses memory (gradual goals)
                // Note: @req goes to frontMemory, NOT author's note (see below)
                if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
                    const commandLayers = NGOCommands.buildAuthorsNoteLayer();

                    // Layer 3: Parentheses () memory (gradual goals over 4 turns)
                    if (commandLayers.memoryGuidance) {
                        layers.push(commandLayers.memoryGuidance);
                    }
                }
            } catch (err) {
                safeLog(`❌ Error building layered author's note: ${err.message}`, 'error');
            }

            return layers.filter(Boolean).join(' ');
        };

        try {
            const builtNote = buildLayeredAuthorsNote();

            // CORRECT APPROACH: Set state.memory.authorsNote directly
            // AI Dungeon reads this property and injects it into context automatically
            if (builtNote && state.memory) {
                state.memory.authorsNote = builtNote;

                // Store backup for output script restoration
                state.authorsNoteStorage = builtNote;
            } else if (!state.memory) {
                safeLog(`⚠️ WARNING: state.memory not available, cannot set author's note`, 'warn');
            }
        } catch (err) {
            safeLog(`❌ Critical error in NGO author's note system: ${err.message}`, 'error');
        }
    }

    // Note: frontMemory (@req) is set in INPUT modifier, not here
    // Pattern from Narrative-Steering-Wheel: frontMemory must be set in input modifier to work correctly

    // Adaptive VS configuration based on context (NOW NGO-AWARE)
    if (CONFIG.vs.enabled && CONFIG.vs.adaptive) {
        const adaptedParams = VerbalizedSampling.analyzeContext(text);

        // Update VS card with adapted parameters (no CONFIG mutation)
        VerbalizedSampling.updateCard(adaptedParams);
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

    return { text };
};

// FIX: Don't manually call modifier - let AI Dungeon call it
// The engine automatically calls modifier(text)
// Calling it here causes double execution

void 0;
