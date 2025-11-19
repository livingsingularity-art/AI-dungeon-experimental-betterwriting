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

            // Log significant issues
            if (recentAnalysis.quality === 'poor') {
                safeLog(`Quality warning: ${recentAnalysis.quality} (score: ${recentAnalysis.avgScore.toFixed(2)})`, 'warn');
            }
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
                    safeLog(`✅ Layer 1 (Player): "${playerContent.substring(0, 50)}..."`, 'success');
                } else {
                    safeLog(`⚠️ Layer 1 (Player): EMPTY`, 'warn');
                }

                // LAYER 2: NGO Phase Guidance
                // Dynamic guidance based on current story phase (Introduction, Rising Action, etc.)
                const currentPhase = getCurrentNGOPhase();
                if (currentPhase && currentPhase.authorNoteGuidance) {
                    layers.push(currentPhase.authorNoteGuidance);
                    safeLog(`✅ Layer 2 (NGO): "${currentPhase.authorNoteGuidance.substring(0, 60)}..."`, 'success');
                } else {
                    safeLog(`⚠️ Layer 2 (NGO): MISSING!`, 'warn');
                }

                // LAYER 3 & 4: Command system layers
                if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
                    const commandLayers = NGOCommands.buildAuthorsNoteLayer();

                    // Layer 3: Parentheses memory (gradual goals)
                    if (commandLayers.memoryGuidance) {
                        layers.push(commandLayers.memoryGuidance);
                        safeLog(`✅ Layer 3 (Memory): "${commandLayers.memoryGuidance.substring(0, 50)}..."`, 'success');
                    }

                    // Layer 4: @req immediate request (highest narrative priority)
                    if (commandLayers.reqGuidance) {
                        layers.push(commandLayers.reqGuidance);
                        safeLog(`✅ Layer 4 (@req): "${commandLayers.reqGuidance}"`, 'success');
                    }
                }
            } catch (err) {
                safeLog(`❌ Error building layered author's note: ${err.message}`, 'error');
            }

            return layers.filter(Boolean).join(' ');
        };

        try {
            const builtNote = buildLayeredAuthorsNote();

            // CRITICAL FIX: AI Dungeon IGNORES state.memory.authorsNote in scripts!
            // We must inject the author's note DIRECTLY into the text instead
            // Format: text positioned 3 newlines before the end (AI Dungeon author's note position)

            // Remove any existing [Author's note: ...] from text (scenario's default)
            text = text.replace(/\[Author's note:.*?\]/gs, '');

            // Inject our layered author's note in proper AI Dungeon format
            if (builtNote) {
                // Author's note goes 3 lines back from the end
                text = text + `\n\n\n[Author's note: ${builtNote}]`;
            }

            const phase = getCurrentNGOPhase();
            safeLog(`📝 Author's note built with phase: ${phase.name} (temp: ${state.ngo.temperature})`, 'info');
            safeLog(`📝 INJECTED into text (${builtNote.length} chars)`, 'info');
        } catch (err) {
            safeLog(`❌ Critical error in NGO author's note system: ${err.message}`, 'error');
            safeLog(`❌ Error stack: ${err.stack}`, 'error');
        }
    }

    // === NGO FRONT MEMORY INJECTION (@req dual injection) ===
    // Inject @req into front of context for immediate, high-priority narrative shaping
    if (CONFIG.commands && CONFIG.commands.enabled && CONFIG.commands.reqDualInjection && state.commands) {
        const frontMemoryInjection = NGOCommands.buildFrontMemoryInjection();
        if (frontMemoryInjection) {
            // Prepend to text (front memory goes at the start)
            text = frontMemoryInjection + '\n\n' + text;
            safeLog(`💉 Front memory injected with @req: "${state.commands.narrativeRequest}"`, 'info');
        }
    }

    // Adaptive VS configuration based on context (NOW NGO-AWARE)
    if (CONFIG.vs.enabled && CONFIG.vs.adaptive) {
        const adaptedParams = VerbalizedSampling.analyzeContext(text);

        // Update VS card with adapted parameters (no CONFIG mutation)
        VerbalizedSampling.updateCard(adaptedParams);

        // Log adaptation with NGO phase info
        if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
            const phase = getCurrentNGOPhase();
            safeLog(`🎨 VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau} (phase: ${phase.name})`, 'info');
        } else {
            safeLog(`VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau}`, 'info');
        }

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

    // VERIFICATION: Check if author's note was injected into text
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        if (text.includes('[Author\'s note:')) {
            const noteMatch = text.match(/\[Author's note: (.+?)\]/s);
            if (noteMatch) {
                safeLog(`✅ VERIFIED: Author's note INJECTED into context (${noteMatch[1].length} chars)`, 'success');
            }
        } else {
            safeLog(`⚠️ WARNING: No author's note found in final context!`, 'warn');
        }
    }

    return { text };
};

// FIX: Don't manually call modifier - let AI Dungeon call it
// The engine automatically calls modifier(text)
// Calling it here causes double execution

void 0;
