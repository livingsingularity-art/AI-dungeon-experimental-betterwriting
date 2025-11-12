/**
 * ============================================================================
 * AI DUNGEON OUTPUT SCRIPT v2.2
 * Analyzes and optionally modifies AI output before showing to player
 *
 * v2.2 Updates:
 * - Minimum length check (prevents short/malformed outputs)
 * - Word banning system (via story cards)
 * - Iterative refinement (critique cards guide regeneration)
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize regeneration counter if needed
    state.regenCount = state.regenCount || 0;
    state.regenThisOutput = state.regenThisOutput || 0;

    // CRITICAL FIX: Clean output FIRST before analysis
    // This prevents VS instructions from being analyzed as part of the story
    const cleanOutput = (output) => {
        // Remove any accidental XML tags
        output = output.replace(/<\/?response>/g, '');
        output = output.replace(/<\/?probability>/g, '');
        output = output.replace(/<\/?text>/g, '');
        output = output.replace(/<\/?candidate[^>]*>/g, '');
        output = output.replace(/<\/?selected>/g, '');

        // CRITICAL: Remove VS instruction if it leaked through
        // Pattern: [Internal Sampling Protocol: ... ]
        output = output.replace(/\[Internal Sampling Protocol:[\s\S]*?\]/g, '');

        // Also catch if brackets got stripped but content remains
        output = output.replace(/Internal Sampling Protocol:[\s\S]*?never mention this process[^\n]*/g, '');

        // Remove any remaining instruction fragments
        output = output.replace(/- (mentally )?generate \d+ distinct.*?candidates/gi, '');
        output = output.replace(/- for each.*?probability p/gi, '');
        output = output.replace(/- only consider candidates where p <.*?\)/gi, '');
        output = output.replace(/- randomly select one.*?candidates/gi, '');
        output = output.replace(/- output ONLY.*?response/gi, '');
        output = output.replace(/- never mention.*?output/gi, '');
        output = output.replace(/from the unlikely tails.*?distribution/gi, '');

        // Remove trailing "stop" (AI Dungeon quirk)
        // Handles "stop", "Stop.", "stop!", etc. at the end
        output = output.replace(/stop[.!?,;\s]*$/i, '').trim();

        // Remove empty lines at start/end
        output = output.trim();

        // Normalize multiple newlines to max 2
        output = output.replace(/\n{3,}/g, '\n\n');

        return output;
    };

    // Clean BEFORE analysis
    text = cleanOutput(text);

    // Check for banned words (user-defined story card)
    const bannedCard = storyCards.find(c => c.keys && c.keys.includes('banned_words'));
    if (bannedCard && bannedCard.entry) {
        const bannedWords = bannedCard.entry
            .toLowerCase()
            .split(/[,\n]+/)
            .map(w => w.trim())
            .filter(w => w.length > 0);

        if (bannedWords.length > 0) {
            const textLower = text.toLowerCase();
            const foundBanned = bannedWords.filter(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                return regex.test(textLower);
            });

            if (foundBanned.length > 0 && state.regenThisOutput < CONFIG.bonepoke.maxRegenAttempts) {
                safeLog(`⛔ Banned words detected: ${foundBanned.join(', ')}`, 'warn');
                safeLog(`Triggering regeneration (attempt ${state.regenThisOutput + 1}/${CONFIG.bonepoke.maxRegenAttempts})`, 'warn');
                state.regenCount += 1;
                state.regenThisOutput += 1;
                Analytics.recordRegeneration();
                return { text: '', stop: true };
            }
        }
    }

    // Minimum length check - reject very short outputs
    if (text.trim().length < 20 && state.regenThisOutput < CONFIG.bonepoke.maxRegenAttempts) {
        safeLog(`⚠️ Output too short (${text.trim().length} chars), triggering regeneration`, 'warn');
        state.regenCount += 1;
        state.regenThisOutput += 1;
        Analytics.recordRegeneration();
        return { text: '', stop: true };
    }

    // Remove duplicate text at the start (AI repeating last phrase)
    // Get the last output from history to check for duplicates
    const lastAIOutput = history
        .slice()
        .reverse()
        .find(h => h.type === 'ai');

    if (lastAIOutput && lastAIOutput.text) {
        // Get last 100 characters of previous output
        const lastChunk = lastAIOutput.text.slice(-100);

        // Check if current output starts with any suffix of last output
        // This handles cases like:
        // Previous: "...she"
        // Current: "she says..." (duplicate "she")
        for (let len = 50; len >= 10; len--) {
            const suffix = lastChunk.slice(-len).trim();
            if (suffix && text.trim().startsWith(suffix)) {
                // Found duplicate - remove it
                text = text.trim().slice(suffix.length).trim();
                safeLog(`Removed duplicate start: "${suffix.slice(0, 30)}..."`, 'info');
                break;
            }
        }
    }

    // Add space to start of every reply (user requirement)
    if (!text.startsWith(' ')) {
        text = ' ' + text;
    }

    // Analyze output quality with Bonepoke
    const analysis = CONFIG.bonepoke.enabled ?
        BonepokeAnalysis.analyze(text) : null;

    // Store analysis in history
    if (analysis) {
        state.bonepokeHistory = state.bonepokeHistory || [];
        state.bonepokeHistory.push(analysis);

        // Keep only last 20 analyses for memory efficiency
        if (state.bonepokeHistory.length > 20) {
            state.bonepokeHistory = state.bonepokeHistory.slice(-20);
        }

        // Store last score for context script
        state.lastBonepokeScore = analysis.avgScore;
    }

    // Quality-gated regeneration
    const shouldRegenerate = () => {
        if (!CONFIG.bonepoke.enabled) return false;
        if (!analysis) return false;
        if (state.regenThisOutput >= CONFIG.bonepoke.maxRegenAttempts) {
            safeLog('Max regeneration attempts reached, accepting output', 'warn');
            return false;
        }

        const isBelowThreshold = analysis.avgScore < CONFIG.bonepoke.qualityThreshold;

        if (isBelowThreshold) {
            safeLog(
                `Quality below threshold: ${analysis.avgScore.toFixed(2)} < ${CONFIG.bonepoke.qualityThreshold}`,
                'warn'
            );

            // Log specific issues
            if (analysis.suggestions.length > 0) {
                safeLog('Issues detected:', 'warn');
                analysis.suggestions.slice(0, 3).forEach(s => safeLog(`  - ${s}`, 'warn'));
            }

            return true;
        }

        return false;
    };

    // Check if we should regenerate
    if (shouldRegenerate()) {
        state.regenCount += 1;
        state.regenThisOutput += 1;
        Analytics.recordRegeneration();

        safeLog(`Triggering regeneration (attempt ${state.regenThisOutput}/${CONFIG.bonepoke.maxRegenAttempts})`, 'warn');

        // ITERATIVE REFINEMENT: Add critique card to guide next generation
        // This implements "test-time compute" from research - spend more inference for better results
        if (CONFIG.bonepoke.enableDynamicCorrection && analysis.suggestions.length > 0) {
            const critiqueText = `The previous AI response had quality issues that need addressing:\n${
                analysis.suggestions.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')
            }\n\nIn your next response, specifically fix these issues while maintaining narrative coherence and flow.`;

            const critiqueCard = buildCard(
                'Quality Critique',
                critiqueText,
                'Custom',
                'critique quality refinement',
                'Specific issues to address in regeneration',
                0 // High priority (0 = top)
            );

            const existingCritique = storyCards.findIndex(c => c.keys && c.keys.includes('critique'));
            if (existingCritique >= 0) {
                storyCards[existingCritique] = critiqueCard;
            } else {
                storyCards.push(critiqueCard);
            }

            safeLog('📝 Added critique card to guide regeneration', 'info');
        }

        // Return with stop=true to trigger regeneration
        return { text: '', stop: true };
    }

    // Reset regen counter on successful output
    state.regenThisOutput = 0;

    // Remove critique card on successful output (no longer needed)
    const critiqueIndex = storyCards.findIndex(c => c.keys && c.keys.includes('critique'));
    if (critiqueIndex >= 0) {
        storyCards.splice(critiqueIndex, 1);
        safeLog('✓ Removed critique card (quality acceptable)', 'info');
    }

    // Log quality if enabled
    if (analysis && (CONFIG.bonepoke.debugLogging || CONFIG.vs.debugLogging)) {
        safeLog(`Output quality: ${analysis.quality} (${analysis.avgScore.toFixed(2)})`, 'success');

        // Log scores breakdown
        if (CONFIG.bonepoke.debugLogging) {
            Object.entries(analysis.scores).forEach(([category, score]) => {
                safeLog(`  ${category}: ${score}/5`, 'info');
            });
        }

        // Log MARM status if active
        if (analysis.composted.marm !== 'MARM: suppressed') {
            safeLog(`  ${analysis.composted.marm}`, 'warn');
        }
    }

    // Record analytics
    Analytics.recordOutput(analysis);

    // Safety check: If text is empty after cleaning, don't return nothing
    // This prevents "no text output" errors
    if (!text || text.trim() === '') {
        safeLog('Warning: Output was empty after cleaning, returning space', 'warn');
        return { text: ' ' };
    }

    return { text };
};

// FIX: Don't manually call modifier
void 0;
