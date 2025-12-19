/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V4 CONTEXT SCRIPT
 * Modifies the context sent to the AI model
 * ============================================================================
 *
 * Combines:
 * - Trinity context processing (VS, NGO author's note, diversity guidance)
 * - Vogler Hero's Journey stage guidance injection
 */

/**
 * Inject Vogler stage guidance into author's note
 */
const injectVoglerGuidance = (text) => {
    if (!state.vogler?.initialized) {
        return { text };
    }

    // Don't inject if bridge generation pending
    if (state.vogler.bridge?.pendingGeneration) {
        return { text };
    }

    const stage = VOGLER_STAGES[state.vogler.currentStage];
    const actData = state.vogler.acts[state.vogler.currentAct];

    // Build Vogler guidance
    let voglerNote = `[Hero's Journey: Stage ${state.vogler.currentStage} - ${stage.name}]\n`;
    voglerNote += `${stage.guidance}\n`;

    // Add next beat if available
    if (actData?.remainingBeats?.[0]) {
        voglerNote += `\nNext beat: ${actData.remainingBeats[0]}`;
    }

    // Combine with existing author's note
    const existing = state.memory.authorsNote || '';
    state.memory.authorsNote = existing + '\n\n' + voglerNote;

    // Add stage to frontMemory for high priority
    state.memory.frontMemory = `[Stage ${state.vogler.currentStage}/12: ${stage.name}]`;

    return { text };
};

/**
 * Get diversity-aware VS prompt
 */
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

/**
 * Inject blocked phrases instruction
 */
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

/**
 * Analyze recent history for problems
 */
const analyzeRecentHistory = () => {
    const recentOutputs = history
        .filter(h => h.type === 'ai')
        .slice(-3)
        .map(h => h.text || '')
        .join(' ');

    if (!recentOutputs) return null;

    return BonepokeAnalysis.analyze(recentOutputs);
};

/**
 * Apply dynamic corrections
 */
const applyDynamicCorrections = (text) => {
    if (!CONFIG.bonepoke.enabled || !CONFIG.bonepoke.enableDynamicCorrection) {
        return { text };
    }

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

    return { text };
};

/**
 * Build layered author's note with NGO
 */
const buildLayeredAuthorsNote = (text) => {
    if (!CONFIG.ngo || !CONFIG.ngo.enabled || !state.ngo) {
        return { text };
    }

    const layers = [];

    try {
        // LAYER 1: PlayersAuthorsNote card content
        const playerContent = PlayersAuthorsNoteCard.getPlayerContent();
        if (playerContent) {
            layers.push(playerContent);
            safeLog(`✅ Layer 1 (Player): "${playerContent.substring(0, 50)}..."`, 'success');
        } else {
            safeLog(`⚠️ Layer 1 (Player): EMPTY`, 'warn');
        }

        // LAYER 2: NGO Phase Guidance
        const currentPhase = getCurrentNGOPhase();
        if (currentPhase && currentPhase.authorNoteGuidance) {
            layers.push(currentPhase.authorNoteGuidance);
            safeLog(`✅ Layer 2 (NGO): "${currentPhase.authorNoteGuidance.substring(0, 60)}..."`, 'success');
        } else {
            safeLog(`⚠️ Layer 2 (NGO): MISSING!`, 'warn');
        }

        // LAYER 3: Parentheses memory (gradual goals)
        if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
            const commandLayers = NGOCommands.buildAuthorsNoteLayer();

            if (commandLayers.memoryGuidance) {
                layers.push(commandLayers.memoryGuidance);
                safeLog(`✅ Layer 3 (Memory): "${commandLayers.memoryGuidance.substring(0, 50)}..."`, 'success');
            }
        }
    } catch (err) {
        safeLog(`❌ Error building layered author's note: ${err.message}`, 'error');
    }

    const builtNote = layers.filter(Boolean).join(' ');

    try {
        if (builtNote && state.memory) {
            state.memory.authorsNote = builtNote;
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

    return { text };
};

/**
 * Adapt VS configuration based on context
 */
const adaptVSConfiguration = (text) => {
    if (!CONFIG.vs.enabled || !CONFIG.vs.adaptive) {
        return { text };
    }

    const adaptedParams = VerbalizedSampling.analyzeContext(text);

    // Update VS card with adapted parameters
    VerbalizedSampling.updateCard(adaptedParams);

    // Log adaptation with NGO phase info
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const phase = getCurrentNGOPhase();
        safeLog(`🎨 VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau} (phase: ${phase.name})`, 'info');
    } else {
        safeLog(`VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau}`, 'info');
    }

    // Store adapted params for reference
    state.vsAdaptedParams = adaptedParams;

    return { text };
};

/**
 * Handle continue action
 */
const handleContinue = (text) => {
    const lastEntry = history[history.length - 1];
    if (lastEntry?.type === 'continue') {
        const lastLine = text
            .split('\n')
            .filter(line => line.trim() !== '')
            .pop() || '';

        // Only add continue instruction if last line seems incomplete
        if (!/[.!?]$/.test(lastLine.trim())) {
            text += '\n\n<SYSTEM>Continue from your last response, maintaining the same scene and tone.</SYSTEM>';
        }
    }

    return { text };
};

/**
 * Inject Verbalized Sampling instruction
 */
const injectVSInstruction = (text) => {
    if (!CONFIG.vs.enabled) {
        return { text };
    }

    const vsInstruction = VerbalizedSampling.getInstruction();
    text += '\n\n' + vsInstruction;

    // Add diversity-aware guidance if enabled
    if (CONFIG.diversity && CONFIG.diversity.enabled && CONFIG.diversity.rotateSamplingPrompts) {
        const diversityGuidance = getDiversityAwareVSPrompt();
        text += `\n[Writing guidance: ${diversityGuidance}]`;
    }

    return { text };
};

/**
 * Track context size
 */
const trackContextSize = (text) => {
    if (CONFIG.system.enableAnalytics) {
        state.lastContextSize = text.length;
        state.lastContextWords = text.split(/\s+/).length;
    }
    return { text };
};

/**
 * Process through AutoCards
 */
const processAutoCards = (text, stop) => {
    const autoCardsResult = AutoCards("context", text, stop);

    if (autoCardsResult && typeof autoCardsResult === 'object') {
        text = autoCardsResult.text || text;
    }

    return { text };
};

/**
 * Final blocked phrase injection
 */
const finalBlockedPhraseInjection = (text) => {
    if (CONFIG.diversity && CONFIG.diversity.enabled) {
        text = injectBlockedPhrases(text);
    }
    return { text };
};

// Chain all context processing functions with Director pattern
const modifier = (text) => {
    return director.context(
        applyDynamicCorrections,     // Trinity: dynamic correction system
        buildLayeredAuthorsNote,     // Trinity: NGO layered author's note
        injectVoglerGuidance,        // Vogler: stage guidance injection
        adaptVSConfiguration,        // Trinity: adaptive VS
        handleContinue,              // Trinity: continue handling
        injectVSInstruction,         // Trinity: VS instruction
        trackContextSize,            // Trinity: analytics
        processAutoCards,            // Trinity: AutoCards integration
        finalBlockedPhraseInjection  // Trinity: blocked phrases
    );
};

// CRITICAL: Always end with void 0
void 0
