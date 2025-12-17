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
    // === DIVERSITY-AWARE VERBALIZED SAMPLING ===
    // Rotate through prompts based on turn count and diversity state
    const getDiversityAwareVSPrompt = () => {
        const ds = state.diversity || { interventionLevel: 'none', rerollCount: 0 };

        // Rotate through prompts based on turn count
        const turnIndex = (state.ngo?.turnsInPhase || state.turnCount || 0) % 4;

        // Base prompts (rotate to prevent AI from ignoring them)
        const basePrompts = [
            "Consider 3 different directions this scene could take. Choose the most engaging yet unexpected option.",
            "Before continuing, identify which narrative elements have been overused. Consciously vary your approach.",
            "This scene should reveal something new about the world or characters. Avoid retreading familiar ground.",
            "Write as if surprising a reader who has correctly predicted the obvious continuation."
        ];

        // Escalation prompts for low diversity
        const escalationPrompts = [
            "IMPORTANT: Recent output has been repetitive. Introduce unexpected elements and fresh vocabulary.",
            "The narrative has fallen into patterns. This paragraph MUST feel distinctly different.",
            "CRITICAL: Vary sentence structure dramatically. Use words you haven't used recently.",
            "Force yourself to take the story in a direction the reader would NOT expect."
        ];

        let selectedPrompt = basePrompts[turnIndex];

        // Escalate based on intervention level
        if (ds.interventionLevel === 'intervene' || ds.interventionLevel === 'escalate') {
            selectedPrompt = escalationPrompts[turnIndex];
        }

        // Further escalate based on reroll count
        if (ds.rerollCount >= 2) {
            selectedPrompt += " Completely change your approach from previous attempts.";
        }

        return selectedPrompt;
    };

    // === BLOCKED PHRASE INJECTION ===
    // Add dynamic blocked phrase injection before the AI processes
    const injectBlockedPhrases = (contextText) => {
        const ds = state.diversity;
        if (!ds || !CONFIG.diversity || !CONFIG.diversity.enabled) return contextText;
        if (ds.blockedPhrases.length === 0) return contextText;

        // Only inject if we have problematic phrases
        const recentBlocked = ds.blockedPhrases.slice(-10);
        if (recentBlocked.length === 0) return contextText;

        // Build avoidance instruction
        const blockedSection = `\n[Avoid using these overused phrases: ${recentBlocked.join('; ')}]`;

        // Insert near end of context
        const lines = contextText.split('\n');
        const insertPosition = Math.max(0, lines.length - 2);
        lines.splice(insertPosition, 0, blockedSection);

        return lines.join('\n');
    };

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

                // LAYER 3: Parentheses memory (gradual goals)
                // Note: @req goes to frontMemory, NOT author's note (see below)
                if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
                    const commandLayers = NGOCommands.buildAuthorsNoteLayer();

                    // Layer 3: Parentheses () memory (gradual goals over 4 turns)
                    if (commandLayers.memoryGuidance) {
                        layers.push(commandLayers.memoryGuidance);
                        safeLog(`✅ Layer 3 (Memory): "${commandLayers.memoryGuidance.substring(0, 50)}..."`, 'success');
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
            // Pattern from original NGO scripts (ngoInput Script lines 163-229)
            if (builtNote && state.memory) {
                state.memory.authorsNote = builtNote;

                // Store backup for output script restoration (original NGO pattern line 296)
                state.authorsNoteStorage = builtNote;

                const phase = getCurrentNGOPhase();
                safeLog(`📝 Author's note set with phase: ${phase.name} (temp: ${state.ngo.temperature})`, 'info');
                safeLog(`📝 Content (${builtNote.length} chars): "${builtNote.substring(0, 80)}..."`, 'info');
            } else if (!state.memory) {
                safeLog(`⚠️ WARNING: state.memory not available, cannot set author's note`, 'warn');
            }
        } catch (err) {
            safeLog(`❌ Critical error in NGO author's note system: ${err.message}`, 'error');
            safeLog(`❌ Error stack: ${err.stack}`, 'error');
        }
    }

    // Note: frontMemory (@req) is set in INPUT modifier, not here
    // Pattern from Narrative-Steering-Wheel: frontMemory must be set in input modifier to work correctly

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

    // Inject Verbalized Sampling instruction with diversity guidance
    // FIX: Use better formatting to prevent leakage
    if (CONFIG.vs.enabled) {
        const vsInstruction = VerbalizedSampling.getInstruction();
        text += '\n\n' + vsInstruction;

        // Add diversity-aware guidance if enabled
        if (CONFIG.diversity && CONFIG.diversity.enabled && CONFIG.diversity.rotateSamplingPrompts) {
            const diversityGuidance = getDiversityAwareVSPrompt();
            text += `\n[Writing guidance: ${diversityGuidance}]`;
        }
    }

    // Track context size for debugging
    if (CONFIG.system.enableAnalytics) {
        state.lastContextSize = text.length;
        state.lastContextWords = text.split(/\s+/).length;
    }

    // === AUTO-CARDS INTEGRATION ===
    // Process context through Auto-Cards for automatic story card generation and management
    // Auto-Cards will inject relevant story card content into the context
    const autoCardsResult = AutoCards("context", text, stop);

    // AutoCards returns { text, stop } - extract both values
    if (autoCardsResult && typeof autoCardsResult === 'object') {
        text = autoCardsResult.text || text;
        // Note: stop parameter is read-only in AI Dungeon context modifier, but AutoCards may set it
    }

    // === BLOCKED PHRASE INJECTION ===
    // Inject blocked phrases before returning to guide AI away from repetitive content
    if (CONFIG.diversity && CONFIG.diversity.enabled) {
        text = injectBlockedPhrases(text);
    }

    return { text };
};

// FIX: Don't manually call modifier - let AI Dungeon call it
// The engine automatically calls modifier(text)
// Calling it here causes double execution

void 0;
