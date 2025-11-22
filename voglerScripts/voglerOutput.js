/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER'S HERO'S JOURNEY - OUTPUT SCRIPT
 * Analyzes and optionally modifies AI output before showing to player
 * ============================================================================
 *
 * Handles:
 * - Story beat detection from AI output
 * - Automatic stage advancement when appropriate
 * - Progress tracking and logging
 * - Author's note restoration
 *
 * @version 1.0.0
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize Vogler state
    const voglerState = VoglerEngine.init();

    // Restore author's note if needed (same pattern as Trinity/NGO)
    if (VOGLER_CONFIG.enabled && state.memory && state.voglerAuthorsNoteStorage) {
        // Check if author's note was cleared or reset
        if (!state.memory.authorsNote || !state.memory.authorsNote.includes(state.voglerAuthorsNoteStorage)) {
            // Restore it
            const existingNote = state.memory.authorsNote || '';
            const separator = existingNote ? ' ' : '';
            state.memory.authorsNote = existingNote + separator + state.voglerAuthorsNoteStorage;

            if (VOGLER_CONFIG.debugLogging) {
                console.log(`🔄 Vogler author's note restored`);
            }
        }
    }

    // Clean output (remove any accidental leakage)
    const cleanOutput = (output) => {
        // Remove any accidental stage instructions
        output = output.replace(/\[Hero's Journey:.*?\]/g, '');
        output = output.replace(/Pacing:.*?(?=\n|$)/gi, '');
        output = output.replace(/Tone:.*?(?=\n|$)/gi, '');
        output = output.replace(/Key beats to address:.*?(?=\n|$)/gi, '');

        // Remove trailing "stop" (AI Dungeon quirk)
        output = output.replace(/stop[.!?,;\s]*$/i, '').trim();

        // Remove empty lines at start/end
        output = output.trim();

        // Normalize multiple newlines to max 2
        output = output.replace(/\n{3,}/g, '\n\n');

        return output;
    };

    // Clean BEFORE analysis
    text = cleanOutput(text);

    // Detect story beats from AI output
    if (VOGLER_CONFIG.enabled) {
        const detectedBeats = VoglerEngine.detectBeats(text);

        if (detectedBeats.length > 0) {
            if (VOGLER_CONFIG.debugLogging) {
                console.log(`✅ AI beats detected: ${detectedBeats.join(', ')}`);
            }

            // Log beat completion
            if (VOGLER_CONFIG.logStageChanges) {
                const currentStage = VoglerEngine.getCurrentStage();
                const progress = VoglerEngine.getProgress();
                console.log(`📖 ${currentStage.name}: ${progress.completedBeats}/${progress.totalBeats} beats completed`);
            }
        }
    }

    // Check for stage advancement
    if (VOGLER_CONFIG.enabled && VOGLER_CONFIG.autoAdvance) {
        // Check if advancement was flagged in input script
        const pendingAdvancement = state.vogler.pendingAdvancement;

        if (pendingAdvancement && pendingAdvancement.ready) {
            // Additional check: advancement happens AFTER AI output, so we have fresh beat detection
            const advanceCheck = VoglerEngine.shouldAdvance();

            if (advanceCheck.should) {
                const oldStage = VoglerEngine.getCurrentStage();
                const advanced = VoglerEngine.advanceStage(pendingAdvancement.reason);

                if (advanced) {
                    const newStage = VoglerEngine.getCurrentStage();

                    // Display stage transition to player
                    if (VOGLER_CONFIG.logStageChanges) {
                        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                        console.log(`🎬 HERO'S JOURNEY: ${oldStage.name} → ${newStage.name}`);
                        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

                        // Add a narrative transition note to output (optional)
                        // Uncomment if you want visible stage transitions
                        // text += `\n\n*[The story enters a new phase: ${newStage.name}]*`;
                    }
                }
            }

            // Clear pending flag
            state.vogler.pendingAdvancement = { ready: false, reason: '' };
        }
    }

    // Dialogue formatter (same as Trinity)
    // Fixes common dialogue formatting issues
    if (text.match(/".*,,/)) {
        // Special case: double commas after dialogue
        text = text.replace(/says? "\s*(\S)(.*),,\s*(\S)/i, (m, a, b, c) =>
            a.toLowerCase() + b.trim() + ', "' + c.toUpperCase()
        );
        // Fix pronoun capitalization
        text = text.replace(/(you |i )(your? |i )(\S)/i, (m, a, b, c) =>
            b.charAt(0).toUpperCase() + b.slice(1) + c.toLowerCase()
        );
    } else {
        // Normal case: add comma and capitalize
        text = text.replace(/\bi says/i, 'I say');
        text = text.replace(/(says?) "\s*(\S)/i, (m, a, b) =>
            a + ', "' + b.toUpperCase()
        );
    }

    // Add period before closing quote if missing
    if (text.match(/[^.,?!]"\n/)) {
        text = text.replace(/\s*"\n/, '."\n');
    } else {
        // Replace generic "say" with specific verbs based on punctuation
        text = text.replace(/(say)(s?, ".*)([,?!]")/i, (m, a, b, c) => {
            const verb = c == ',"' ? 'begin' : c == '?"' ? 'ask' : c == '!"' ? 'shout' : '';
            return verb ? verb + b.trim() + c : m;
        });
    }

    // Remove duplicate text at the start (AI repeating last phrase)
    const lastAIOutput = history
        .slice()
        .reverse()
        .find(h => h.type === 'ai');

    if (lastAIOutput && lastAIOutput.text) {
        // Get last 100 characters of previous output
        const lastChunk = lastAIOutput.text.slice(-100);

        // Check if current output starts with any suffix of last output
        for (let len = 50; len >= 10; len--) {
            const suffix = lastChunk.slice(-len).trim();
            if (suffix && text.trim().startsWith(suffix)) {
                // Found duplicate - remove it
                text = text.trim().slice(suffix.length).trim();
                if (VOGLER_CONFIG.debugLogging) {
                    console.log(`Removed duplicate start: "${suffix.slice(0, 30)}..."`);
                }
                break;
            }
        }
    }

    // Add space to start of every reply (AI Dungeon best practice)
    if (!text.startsWith(' ')) {
        text = ' ' + text;
    }

    // Log current progress
    if (VOGLER_CONFIG.debugLogging) {
        VoglerEngine.logStatus();
    } else if (VOGLER_CONFIG.logStageChanges && voglerState.turnsInStage === 1) {
        // Log stage info at start of each stage
        const currentStage = VoglerEngine.getCurrentStage();
        const progress = VoglerEngine.getProgress();
        console.log(`🎬 ${currentStage.name} (Stage ${progress.currentStage}/12) - ${progress.turnsInStage} turns`);
    }

    // Periodic progress reminder (every 5 turns)
    if (VOGLER_CONFIG.logStageChanges && voglerState.turnsInStage % 5 === 0) {
        const progress = VoglerEngine.getProgress();
        const currentStage = VoglerEngine.getCurrentStage();

        console.log(`📊 Journey Progress: ${progress.percentComplete}% (${currentStage.name}, Turn ${voglerState.turnsInStage})`);

        // Show remaining beats if close to advancement
        const remaining = currentStage.keyBeats.length - progress.completedBeats;
        if (remaining > 0 && voglerState.turnsInStage >= VOGLER_CONFIG.minTurnsPerStage) {
            console.log(`   Beats remaining: ${remaining}`);
        }
    }

    // Safety check: If text is empty after cleaning, don't return nothing
    if (!text || text.trim() === '') {
        if (VOGLER_CONFIG.debugLogging) {
            console.log('⚠️ Warning: Output was empty after cleaning, returning space');
        }
        return { text: ' ' };
    }

    return { text };
};

// Let AI Dungeon call modifier
void 0;
