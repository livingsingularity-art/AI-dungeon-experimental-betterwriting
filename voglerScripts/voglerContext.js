/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER'S HERO'S JOURNEY - CONTEXT SCRIPT
 * Modifies the context sent to the AI model
 * ============================================================================
 *
 * Injects Hero's Journey stage guidance into the AI's context
 * Ensures the AI understands current story stage and expectations
 * Integrates with existing Trinity systems
 *
 * @version 1.0.0
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize Vogler state
    VoglerEngine.init();

    // Get current stage information
    const currentStage = VoglerEngine.getCurrentStage();
    const progress = VoglerEngine.getProgress();

    // Build and inject Vogler author's note
    if (VOGLER_CONFIG.enabled) {
        try {
            const voglerGuidance = VoglerEngine.buildAuthorsNote();

            // Get player's custom author's note (separate from system notes)
            const playersNote = VoglerEngine.config.playersNote.getPlayersNote();

            // Inject into author's note system
            // This works alongside NGO or as standalone
            if (state.memory) {
                // Build combined author's note: Player's note + System guidance
                const noteParts = [];

                // Add player's custom note first (highest priority)
                if (playersNote && playersNote.trim() !== '') {
                    noteParts.push(playersNote.trim());
                }

                // Add Vogler system guidance
                if (voglerGuidance && voglerGuidance.trim() !== '') {
                    noteParts.push(voglerGuidance.trim());
                }

                // Combine with separator
                state.memory.authorsNote = noteParts.join(' | ');

                // Store for restoration in output script
                state.voglerAuthorsNoteStorage = voglerGuidance;
                state.playersAuthorsNoteStorage = playersNote;

                if (VOGLER_CONFIG.debugLogging) {
                    log(`🎬 Vogler guidance injected: ${currentStage.name}`);
                    log(`   System: ${voglerGuidance.substring(0, 80)}...`);
                    if (playersNote) {
                        log(`   Player: ${playersNote.substring(0, 80)}...`);
                    }
                }
            }
        } catch (err) {
            if (VOGLER_CONFIG.debugLogging) {
                log(`❌ Error injecting Vogler guidance: ${err.message}`);
            }
        }
    }

    // Integrate with VS (Verbalized Sampling) if enabled
    if (VOGLER_CONFIG.integrateWithVS && typeof VerbalizedSampling !== 'undefined') {
        const vsParams = VoglerEngine.getVSParams();

        if (vsParams && VerbalizedSampling.updateCard) {
            VerbalizedSampling.updateCard(vsParams);

            if (VOGLER_CONFIG.debugLogging) {
                console.log(`🎨 VS adapted for ${currentStage.name}: k=${vsParams.k}, tau=${vsParams.tau}`);
            }
        }
    }

    // Integrate with NGO temperature if enabled
    if (VOGLER_CONFIG.enabled && typeof state.ngo !== 'undefined' && state.ngo) {
        const voglerTemp = VoglerEngine.getTemperature();
        const voglerHeat = VoglerEngine.getHeat();

        // Suggest temperature (don't override NGO entirely, but influence it)
        if (voglerTemp !== null) {
            // Store suggested values for NGO to consider
            state.vogler.suggestedTemperature = voglerTemp;
            state.vogler.suggestedHeat = voglerHeat;

            if (VOGLER_CONFIG.debugLogging) {
                console.log(`🌡️ Vogler suggests: temp=${voglerTemp}, heat=${voglerHeat}`);
            }
        }
    }

    // Custom Continue handling with stage awareness
    const handleContinue = () => {
        const lastEntry = history[history.length - 1];
        if (lastEntry?.type === 'continue') {
            const lastLine = text
                .split('\n')
                .filter(line => line.trim() !== '')
                .pop() || '';

            // Add continue instruction with stage context
            if (!/[.!?]$/.test(lastLine.trim())) {
                return `\n\n<SYSTEM>Continue from your last response. Remember: ${currentStage.name} - ${currentStage.pacing}</SYSTEM>`;
            }
        }
        return '';
    };

    text += handleContinue();

    // Log progress if enabled
    if (VOGLER_CONFIG.debugLogging) {
        VoglerEngine.logStatus();
    }

    // Track context size for debugging
    if (VOGLER_CONFIG.debugLogging) {
        state.lastContextSize = text.length;
        state.lastContextWords = text.split(/\s+/).length;
    }

    return { text };
};

// Let AI Dungeon call modifier
void 0;
