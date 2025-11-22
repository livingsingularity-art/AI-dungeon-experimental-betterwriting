/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * TRINITY + AUTO-CARDS CONTEXT SCRIPT (Integrated v3.0)
 * Modifies the context sent to the AI model
 * ============================================================================
 */

const modifier = (text) => {
    let stop = false;

    // ========== STEP 1: AUTO-CARDS CONTEXT PROCESSING ==========
    // Auto-Cards processes context first (language, card generation triggers)
    [text, stop] = AutoCards("context", text, stop);

    // ========== STEP 2: TRINITY BONEPOKE - ANALYZE RECENT QUALITY ==========
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
                safeLog(`⚠️ Quality warning: ${recentAnalysis.quality} (score: ${recentAnalysis.avgScore.toFixed(2)})`, 'warn');
            }
        }
    }

    // ========== STEP 3: NGO LAYERED AUTHOR'S NOTE SYSTEM ==========
    // Build author's note with priority layers:
    // 1. PlayersAuthorsNote card (user's stable author's note)
    // 2. NGO Phase Guidance (dynamic Hero's Journey narrative direction)
    // 3. Parentheses memory (gradual goals)
    // 4. @req in author's note layer (urgent player intent)
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const buildLayeredAuthorsNote = () => {
            const layers = [];

            try {
                // LAYER 1: PlayersAuthorsNote story card content (user's custom guidance)
                const playerContent = PlayersAuthorsNoteCard.getPlayerContent();
                if (playerContent) {
                    layers.push(playerContent);
                    safeLog(`✅ Layer 1 (Player): "${playerContent.substring(0, 50)}..."`, 'info');
                }

                // LAYER 2: NGO Hero's Journey Phase Guidance
                const currentPhase = getCurrentNGOPhase();
                if (currentPhase && currentPhase.authorNoteGuidance) {
                    layers.push(currentPhase.authorNoteGuidance);
                    safeLog(`✅ Layer 2 (Hero's Journey - ${currentPhase.name}): "${currentPhase.authorNoteGuidance.substring(0, 60)}..."`, 'info');
                }

                // LAYER 3: Command layers (parentheses memory + @req author's note)
                if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
                    const commandLayers = NGOCommands.buildAuthorsNoteLayer();

                    // Parentheses () memory (gradual goals over 4 turns)
                    if (commandLayers.memoryGuidance) {
                        layers.push(commandLayers.memoryGuidance);
                        safeLog(`✅ Layer 3 (Memory): "${commandLayers.memoryGuidance.substring(0, 50)}..."`, 'info');
                    }

                    // @req author's note layer (urgent request)
                    if (commandLayers.reqGuidance) {
                        layers.push(commandLayers.reqGuidance);
                        safeLog(`✅ Layer 4 (@req): "${commandLayers.reqGuidance.substring(0, 50)}..."`, 'info');
                    }
                }
            } catch (err) {
                safeLog(`❌ Error building layered author's note: ${err.message}`, 'error');
            }

            return layers.filter(Boolean).join(' ');
        };

        try {
            const builtNote = buildLayeredAuthorsNote();

            // Set state.memory.authorsNote directly
            // AI Dungeon reads this property and injects it into context automatically
            if (builtNote && state.memory) {
                state.memory.authorsNote = builtNote;
                // Store for restoration in output (AI Dungeon sometimes resets it)
                state.authorsNoteStorage = builtNote;
                safeLog(`📝 Author's note updated (${builtNote.length} chars)`, 'success');
            }
        } catch (err) {
            safeLog(`❌ Error setting author's note: ${err.message}`, 'error');
        }
    }

    // ========== STEP 4: VERBALIZED SAMPLING ==========
    // Adaptive VS parameters based on Hero's Journey phase
    if (CONFIG.vs && CONFIG.vs.enabled) {
        try {
            // Get current phase for adaptive VS
            const currentPhase = getCurrentNGOPhase();
            const vsParams = currentPhase?.vsAdjustment || { k: 5, tau: 0.10 };

            // Ensure VS card exists and update parameters
            const vsCard = VerbalizedSampling.ensureCard();
            if (vsCard) {
                VerbalizedSampling.updateCard(vsCard, vsParams.k, vsParams.tau);
                safeLog(`🎲 VS updated: k=${vsParams.k}, tau=${vsParams.tau} (${currentPhase?.name || 'default'})`, 'info');
            }
        } catch (err) {
            safeLog(`❌ VS error: ${err.message}`, 'error');
        }
    }

    return { text, stop };
};

void 0;
