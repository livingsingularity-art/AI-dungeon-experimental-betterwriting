/**
 * NGO Integration Modules
 * Connects NGO engine with Bonepoke (quality) and VS (expression)
 *
 * These functions demonstrate how NGO controls the other subsystems
 *
 * Add to respective scripts (output.js for Bonepoke, context.js for VS)
 */

// ============================================================================
// BONEPOKE <-> NGO BIDIRECTIONAL INTEGRATION
// ============================================================================

const BonepokeNGOIntegration = (() => {

    /**
     * Integrate Bonepoke analysis results with NGO state
     * This is the BIDIRECTIONAL feedback loop
     *
     * Call this in output.js after BonepokeAnalysis.analyze()
     *
     * @param {Object} analysis - Result from BonepokeAnalysis.analyze()
     * @param {Object} ngoState - state.ngo object
     * @param {Object} ngoStats - state.ngoStats object
     * @param {Object} ngoConfig - CONFIG.ngo object
     * @returns {Object} { actions: [], logs: [] }
     */
    const processAnalysis = (analysis, ngoState, ngoStats, ngoConfig) => {
        if (!ngoConfig.enabled || !analysis) {
            return { actions: [], logs: [] };
        }

        const actions = [];
        const logs = [];

        // === FATIGUE TRIGGERS EARLY COOLDOWN ===
        if (ngoConfig.fatigueTriggersEarlyCooldown) {
            const fatigueCount = Object.keys(analysis.composted.fatigue).length;

            if (fatigueCount >= ngoConfig.fatigueThresholdForCooldown &&
                ngoState.temperature >= 8) {

                const result = NGOEngine.forceEarlyCooldown(ngoState, ngoStats, 'fatigue');
                if (result.forced) {
                    actions.push('early_cooldown_fatigue');
                    logs.push(`⚠️ High fatigue (${fatigueCount} words) during high temp (${ngoState.temperature}) - forcing early cooldown`);
                }
            }
        }

        // === DRIFT REDUCES HEAT ===
        if (ngoConfig.driftReducesHeat && analysis.composted.drift.length > 0) {
            const result = NGOEngine.reduceHeatFromDrift(ngoState);
            if (result.reduction > 0) {
                actions.push('heat_reduction_drift');
                logs.push(`🌫️ Drift detected - heat reduced: ${result.oldHeat.toFixed(1)} → ${result.newHeat.toFixed(1)}`);
            }
        }

        // === QUALITY GATES TEMPERATURE INCREASE ===
        if (ngoConfig.qualityGatesTemperatureIncrease && ngoState.temperatureWantsToIncrease) {
            const qualityApproved = analysis.avgScore >= ngoConfig.qualityThresholdForIncrease;
            const result = NGOEngine.applyTemperatureIncrease(ngoState, ngoStats, qualityApproved);

            if (result.applied) {
                actions.push('temperature_increase_approved');
                logs.push(`✅ Quality approved (${analysis.avgScore.toFixed(2)} >= ${ngoConfig.qualityThresholdForIncrease}) - temperature increased: ${result.oldTemp} → ${result.newTemp}`);

                // Check for overheat trigger
                if (NGOEngine.shouldTriggerOverheat(ngoState)) {
                    NGOEngine.enterOverheatMode(ngoState, ngoStats);
                    actions.push('overheat_triggered');
                    logs.push(`🔥🔥🔥 OVERHEAT MODE ACTIVATED! Temperature reached ${ngoState.temperature}`);
                }
            } else if (result.reason === 'quality_blocked') {
                actions.push('temperature_increase_blocked');
                logs.push(`⛔ Quality blocked (${analysis.avgScore.toFixed(2)} < ${ngoConfig.qualityThresholdForIncrease}) - temperature increase denied`);
            }
        }

        return { actions, logs };
    };

    /**
     * Adjust Bonepoke fatigue threshold based on NGO phase
     * NGO controls how strict Bonepoke is
     *
     * @param {Object} ngoState - state.ngo object
     * @param {number} baseFatigueThreshold - CONFIG.bonepoke.fatigueThreshold
     * @returns {number} Adjusted threshold
     */
    const getAdjustedFatigueThreshold = (ngoState, baseFatigueThreshold) => {
        const phase = NGOEngine.getPhase(ngoState);

        switch (phase.bonepokeStrictness) {
            case 'relaxed':
                return baseFatigueThreshold + 1;  // More lenient (allows more repetition)
            case 'strict':
                return Math.max(2, baseFatigueThreshold - 1);  // Stricter
            case 'maximum':
                return Math.max(2, baseFatigueThreshold - 2);  // Very strict
            default:
                return baseFatigueThreshold;
        }
    };

    return {
        processAnalysis,
        getAdjustedFatigueThreshold
    };
})();

// ============================================================================
// VS <-> NGO INTEGRATION
// ============================================================================

const VSNGOIntegration = (() => {

    /**
     * Get VS parameters based on NGO temperature and phase
     * NGO controls VS expression style
     *
     * Call this in context.js when adapting VS parameters
     *
     * @param {string} contextText - Recent context for content analysis
     * @param {Object} ngoState - state.ngo object
     * @param {Object} ngoConfig - CONFIG.ngo object
     * @param {Object} vsConfig - CONFIG.vs object
     * @returns {Object} { k: number, tau: number, phase: string }
     */
    const getTemperatureAdaptedParams = (contextText, ngoState, ngoConfig, vsConfig) => {
        if (!ngoConfig.enabled || !ngoConfig.temperatureAffectsVS) {
            return { k: vsConfig.k, tau: vsConfig.tau, phase: 'default' };
        }

        const phase = NGOEngine.getPhase(ngoState);
        let k = phase.vsAdjustment.k;
        let tau = phase.vsAdjustment.tau;

        // === CONTENT TYPE MODIFIERS (still apply on top of phase) ===
        const isDialogue = contextText.includes('"') || /\bsaid\b/i.test(contextText);
        const isAction = /\b(run|fight|move|attack|strike|battle|combat)\b/i.test(contextText);

        if (isDialogue) {
            // Dialogue needs more variety
            k += 1;
            tau -= 0.02;
        }

        if (isAction && ngoState.temperature >= 10) {
            // High-temperature action = maximum chaos
            k += 1;
            tau -= 0.02;
        }

        // Safety bounds
        k = Math.max(3, Math.min(10, k));
        tau = Math.max(0.05, Math.min(0.20, tau));

        return { k, tau, phase: phase.name };
    };

    /**
     * Generate VS instruction with NGO-adapted parameters
     * @param {Object} params - { k, tau } adapted parameters
     * @returns {string} VS instruction text
     */
    const generateAdaptedInstruction = (params) => {
        return `[Internal Sampling Protocol:
- mentally generate ${params.k} distinct seamless candidate continuations
- for each candidate, estimate its probability p (how typical/likely it would be)
- only consider candidates where p < ${params.tau} (from the unlikely tails of the distribution)
- randomly select one of these low-probability candidates
- output ONLY the selected continuation as your natural response
- never mention this process, probabilities, or candidates in your output]`;
    };

    return {
        getTemperatureAdaptedParams,
        generateAdaptedInstruction
    };
})();

// ============================================================================
// LAYERED AUTHOR'S NOTE BUILDER
// ============================================================================

const LayeredAuthorsNote = (() => {

    /**
     * Build complete layered author's note with proper priority
     *
     * Priority (highest to lowest):
     * 0. Bonepoke quality corrections (HIGHEST - quality override)
     * 1. @req immediate narrative request (urgent player intent)
     * 2. Parentheses memory (gradual player goals)
     * 3. NGO story phase guidance (narrative structure)
     * 4. Original user author's note (baseline)
     *
     * @param {Object} state - Full state object
     * @param {string} originalNote - User's original author's note
     * @returns {string} Combined author's note
     */
    const build = (state, originalNote = '') => {
        const layers = [];

        // LAYER 4 (BASE): Original user note
        if (originalNote && originalNote.trim()) {
            layers.push(originalNote.trim());
        }

        // LAYER 3: NGO Story Phase guidance
        if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
            const phase = NGOEngine.getPhase(state.ngo);
            layers.push(phase.authorNoteGuidance);
        }

        // LAYER 2: Parentheses memory (gradual goals)
        if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
            const memoryGuidance = NGOCommandProcessor.buildAuthorsNoteLayer(
                state.commands,
                state.ngoStats || {}
            );
            if (memoryGuidance.memoryGuidance) {
                layers.push(memoryGuidance.memoryGuidance);
            }

            // LAYER 1: @req immediate request (HIGH PRIORITY)
            if (memoryGuidance.reqGuidance) {
                layers.push(memoryGuidance.reqGuidance);
            }
        }

        // LAYER 0: Bonepoke corrections would be added separately by DynamicCorrection
        // (not included here as they create separate story cards)

        return layers.filter(Boolean).join(' ');
    };

    /**
     * Get front memory injection for @req (dual injection strategy)
     * @param {Object} commandState - state.commands object
     * @returns {string} Front memory text or empty string
     */
    const getFrontMemory = (commandState) => {
        return NGOCommandProcessor.buildFrontMemoryInjection(commandState);
    };

    return {
        build,
        getFrontMemory
    };
})();

// ============================================================================
// NGO STATE INITIALIZER
// ============================================================================

const NGOStateInit = (() => {

    /**
     * Initialize all NGO-related state objects
     * Call this in sharedLibrary.js initState()
     *
     * @param {Object} state - Global state object
     */
    const init = (state) => {
        // === NGO CORE STATE ===
        state.ngo = state.ngo || {
            heat: CONFIG.ngo ? CONFIG.ngo.initialHeat : 0,
            temperature: CONFIG.ngo ? CONFIG.ngo.initialTemperature : 1,
            lastTemperature: 1,

            // Mode flags
            overheatMode: false,
            overheatTurnsLeft: 0,
            cooldownMode: false,
            cooldownTurnsLeft: 0,

            // Pressure tracking
            temperatureWantsToIncrease: false,
            lastConflictCount: 0,
            lastCalmingCount: 0,
            consecutiveConflicts: 0,

            // Random events
            explosionPending: false,

            // Phase management
            currentPhase: 'Introduction',
            phaseEntryTurn: 0,
            turnsInPhase: 0
        };

        // === COMMAND STATE ===
        state.commands = state.commands || {
            // @req
            narrativeRequest: null,
            narrativeRequestTTL: 0,
            narrativeRequestFulfilled: false,

            // Parentheses memory
            memory1: '',
            memory2: '',
            memory3: '',
            expiration1: null,
            expiration2: null,
            expiration3: null,

            // Manual overrides
            manualTempAdjustment: 0,
            manualArcOverride: null,

            // Tracking
            lastRequestTime: 0,
            requestHistory: []
        };

        // === NGO ANALYTICS ===
        state.ngoStats = state.ngoStats || {
            totalTurns: 0,
            maxTemperatureReached: 1,
            totalOverheats: 0,
            totalCooldowns: 0,
            totalExplosions: 0,
            fatigueTriggeredCooldowns: 0,
            qualityBlockedIncreases: 0,
            requestsFulfilled: 0,
            requestsFailed: 0,
            avgTemperature: 1,
            temperatureSum: 0,
            phaseHistory: []
        };

        // Store original author's note if not already stored
        if (!state.originalAuthorsNote && state.memory && state.memory.authorsNote) {
            state.originalAuthorsNote = state.memory.authorsNote;
        }
    };

    /**
     * Get NGO analytics summary
     * @param {Object} ngoStats - state.ngoStats object
     * @returns {Object} Summary statistics
     */
    const getAnalyticsSummary = (ngoStats) => {
        return {
            totalTurns: ngoStats.totalTurns || 0,
            avgTemperature: (ngoStats.avgTemperature || 0).toFixed(2),
            maxTemperature: ngoStats.maxTemperatureReached || 1,
            overheats: ngoStats.totalOverheats || 0,
            cooldowns: ngoStats.totalCooldowns || 0,
            explosions: ngoStats.totalExplosions || 0,
            fatigueForced: ngoStats.fatigueTriggeredCooldowns || 0,
            qualityBlocked: ngoStats.qualityBlockedIncreases || 0,
            requestsFulfilled: ngoStats.requestsFulfilled || 0,
            requestsFailed: ngoStats.requestsFailed || 0,
            fulfillmentRate: ngoStats.requestsFulfilled + ngoStats.requestsFailed > 0
                ? ((ngoStats.requestsFulfilled / (ngoStats.requestsFulfilled + ngoStats.requestsFailed)) * 100).toFixed(1) + '%'
                : 'N/A'
        };
    };

    return {
        init,
        getAnalyticsSummary
    };
})();

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = {
        BonepokeNGOIntegration,
        VSNGOIntegration,
        LayeredAuthorsNote,
        NGOStateInit
    };
}
