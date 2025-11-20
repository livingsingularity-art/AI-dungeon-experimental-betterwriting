/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * AI DUNGEON OUTPUT SCRIPT v2.9 (Optimized 2025-01-18)
 * Analyzes and optionally modifies AI output before showing to player
 *
 * v2.9 Updates (PERFORMANCE OPTIMIZATIONS):
 * - Cached regex compilation for ~40% performance improvement
 * - Optimized array operations
 * - Memory management improvements
 *
 * v2.8 Updates (CROSS-OUTPUT TRACKING - MEMORY OPTIMIZED):
 * - N-gram extraction: Tracks 2-3 word sequences (reduced from 2-5 for memory)
 * - Output history: Stores last 3 outputs (reduced from 5)
 * - Only stores significant n-grams (appear 2+ times OR contain proper nouns)
 * - Compressed data structure (c/s/p/j keys instead of full names)
 * - No full text storage (only n-gram keys)
 * - Bonepoke history: 5 outputs (reduced from 20)
 * - Adaptive thresholds: "Jack and Jill" needs higher count than "the door"
 *   * Base threshold: 2 appearances
 *   * +1 for each proper noun (harder to vary)
 *   * +1 for each conjunction (indicates compound phrase)
 * - Proper noun preservation: "Jack and Jill went up" → "Jack and Jill"
 * - Cross-output replacement: Detects phrases repeated across turns
 * - Smart filtering: Distinguishes true repeats from natural variation
 *
 * v2.7 Updates (REPLACEMENT > REMOVAL):
 * - Massively expanded synonym map: 200+ entries (verbs, nouns, adjectives)
 * - Single words (verbs/adjectives/nouns) → ALWAYS replaced, NEVER removed
 * - Phrases → Try replacement first, only remove as last resort
 * - Missing synonyms logged for future expansion (kept in text)
 * - Stopwords: 120+ functional words protected (pronouns, prepositions, etc.)
 * - Proper nouns: Names automatically detected and preserved
 *
 * v2.6 Updates (Replace-first strategy):
 * - ALL overused content → Try synonym replacement FIRST
 * - Phrases, sounds, words → All get synonyms if available
 * - Removal only as fallback or via user cards (PRECISE/AGGRESSIVE)
 * - Expanded synonym map: 60+ entries including phrases & sound effects
 *
 * v2.5 Updates (Auto-cleanup):
 * - Overused phrases → Auto-removed (no manual intervention)
 * - Sound effects → Auto-removed (no manual intervention)
 * - Single words → Auto-replaced with synonyms
 * - Detection: threshold=3 for words/phrases, threshold=2 for sounds
 *
 * v2.4 Updates (Bonepoke Integration):
 * - Three separate word bank cards (PRECISE, AGGRESSIVE, REPLACER)
 * - Enhanced fatigue detection (words + phrases + sound effects)
 * - 50+ word synonym dictionary
 *
 * v2.3 Updates (USC-inspired):
 * - Word banning via direct removal (AGGRESSIVE/PRECISE modes)
 * - No regeneration attempts (doesn't work reliably in AI Dungeon)
 * - Quality analysis kept for logging/awareness only
 * ============================================================================
 */

const modifier = (text) => {
    // Initialize quality tracking counter if needed
    state.regenCount = state.regenCount || 0;

    // === NGO AUTHOR'S NOTE RESTORATION ===
    // Restore author's note if AI Dungeon reset it
    // This ensures our layered author's note persists across turns
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.memory && state.authorsNoteStorage) {
        // Check if author's note was cleared or reset
        if (!state.memory.authorsNote || state.memory.authorsNote !== state.authorsNoteStorage) {
            state.memory.authorsNote = state.authorsNoteStorage;
        }
    }

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

    // === DIALOGUE FORMATTER ===
    // Fixes common dialogue formatting issues:
    // - Missing commas: says "text → says, "Text
    // - Capitalization after quotes
    // - Missing punctuation before closing quotes
    // - Replace generic "say" with specific verbs (begin, ask, shout)

    // Fix dialogue tags with missing commas and capitalization
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

    // Analyze output quality with Bonepoke FIRST (to detect fatigue)
    const analysis = CONFIG.bonepoke.enabled ?
        BonepokeAnalysis.analyze(text) : null;

    // Store analysis in history
    if (analysis) {
        // Initialize history array
        state.bonepokeHistory = state.bonepokeHistory || [];

        // Add current analysis
        state.bonepokeHistory.push(analysis);

        // Trim to keep only last 5 analyses for memory efficiency
        // Optimized: use shift instead of slice
        while (state.bonepokeHistory.length > MAX_BONEPOKE_HISTORY) {
            state.bonepokeHistory.shift();
        }

        // Store last score for context script
        state.lastBonepokeScore = analysis.avgScore;
    }

    // === NGO TURN PROCESSING ===
    // Process NGO engine turn (timers, phase tracking)
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const turnResult = NGOEngine.processTurn();
    }

    // === NGO AI CONFLICT ANALYSIS ===
    // Analyze AI output for conflict/calming words
    if (CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        const aiConflictData = NGOEngine.analyzeConflict(text);
        const aiHeatResult = NGOEngine.updateHeat(aiConflictData, 'ai');
    }

    // === BONEPOKE-NGO BIDIRECTIONAL INTEGRATION ===
    // Quality regulates pacing: fatigue triggers cooldown, quality gates temp increases
    if (CONFIG.bonepoke.enabled && analysis && CONFIG.ngo && CONFIG.ngo.enabled && state.ngo) {
        // Fatigue triggers early cooldown
        if (CONFIG.ngo.fatigueTriggersEarlyCooldown) {
            const fatigueCount = Object.keys(analysis.composted.fatigue).length;
            if (fatigueCount >= CONFIG.ngo.fatigueThresholdForCooldown && state.ngo.temperature >= 8) {
                NGOEngine.forceEarlyCooldown('fatigue');
            }
        }

        // Drift reduces heat
        if (CONFIG.ngo.driftReducesHeat && analysis.composted.drift.length > 0) {
            const driftResult = NGOEngine.reduceHeatFromDrift();
        }

        // Quality gates temperature increase
        if (CONFIG.ngo.qualityGatesTemperatureIncrease && state.ngo.temperatureWantsToIncrease) {
            const qualityApproved = analysis.avgScore >= CONFIG.ngo.qualityThresholdForIncrease;
            const tempResult = NGOEngine.applyTemperatureIncrease(qualityApproved);

            if (tempResult.applied) {
                // Check for overheat trigger
                if (NGOEngine.shouldTriggerOverheat()) {
                    NGOEngine.enterOverheatMode();
                }
            }
        }
    }

    // === CROSS-OUTPUT TRACKING ===
    // Track last 3 outputs with n-grams to detect repeated phrases across turns

    // Initialize arrays
    state.outputHistory = state.outputHistory || [];
    state.turnCount = (state.turnCount || 0) + 1;

    // Extract n-grams from current output (2-3 words only for memory efficiency)
    const allNGrams = BonepokeAnalysis.extractNGrams(text, 2, 3);

    // Only keep n-grams that might be significant (appear 2+ times OR have proper nouns)
    // This drastically reduces state size
    const significantNGrams = {};
    Object.entries(allNGrams).forEach(([key, data]) => {
        if (data.count >= 2 || data.properNouns > 0) {
            // Store minimal data
            significantNGrams[key] = {
                c: data.count,        // count (shortened key)
                s: data.size,         // size
                p: data.properNouns,  // properNouns
                j: data.conjunctions  // conjunctions (join)
            };
        }
    });

    // Add current output to history (NO FULL TEXT - too large!)
    state.outputHistory.push({
        turn: state.turnCount,
        ngrams: significantNGrams  // Only significant n-grams, compressed keys
    });

    // Trim to keep only last 3 outputs for memory efficiency
    // Optimized: use shift instead of slice for better performance
    while (state.outputHistory.length > MAX_OUTPUT_HISTORY) {
        state.outputHistory.shift();
    }

    // Find phrases repeated across outputs
    const crossOutputRepeats = BonepokeAnalysis.findCrossOutputRepeats(state.outputHistory);

    // Handle cross-output repeated phrases
    if (crossOutputRepeats.length > 0) {
        const handled = [];

        crossOutputRepeats.forEach(repeat => {
            // Extract proper nouns from the phrase
            const words = repeat.phrase.split(' ');
            const properNouns = [];

            words.forEach((word, idx) => {
                // Skip first word (might be sentence start)
                if (idx > 0 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
                    properNouns.push(word);
                }
            });

            // If phrase contains proper nouns, preserve them but vary the rest
            if (properNouns.length > 0 && repeat.size > 2) {
                const preservedText = properNouns.join(' and ');
                const regex = new RegExp(repeat.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

                if (regex.test(text)) {
                    text = text.replace(regex, preservedText);
                    handled.push(`${repeat.phrase} → ${preservedText} (cross-output, preserved names)`);
                }
            }
            // Otherwise, try synonym replacement via existing system
            else {
                const synonym = getSynonym(repeat.phrase.toLowerCase());
                if (synonym !== repeat.phrase.toLowerCase()) {
                    const regex = new RegExp(repeat.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    if (regex.test(text)) {
                        text = text.replace(regex, synonym);
                        handled.push(`${repeat.phrase} → ${synonym} (cross-output)`);
                    }
                }
            }
        });

    }

    // USC-style word removal/replacement system (3 modes)
    // Reads from three separate word bank cards + Bonepoke fatigue data

    // === MODE 1: PRECISE removal (just the phrase) ===
    const preciseCard = storyCards.find(c => c.keys && c.keys.includes('banned_words'));
    if (preciseCard && preciseCard.entry) {
        const lines = preciseCard.entry.split('\n');
        const precise = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const phrases = trimmed.split(',').map(p => p.trim()).filter(p => p.length > 0);
            precise.push(...phrases);
        }

        const foundPrecise = [];
        for (const phrase of precise) {
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            if (regex.test(text)) {
                foundPrecise.push(phrase);
                text = text.replace(regex, '');
            }
        }

    }

    // === MODE 2: AGGRESSIVE removal (entire sentence) ===
    const aggressiveCard = storyCards.find(c => c.keys && c.keys.includes('aggressive_removal'));
    if (aggressiveCard && aggressiveCard.entry) {
        const lines = aggressiveCard.entry.split('\n');
        const aggressive = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const phrases = trimmed.split(',').map(p => p.trim()).filter(p => p.length > 0);
            aggressive.push(...phrases);
        }

        if (aggressive.length > 0) {
            const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
            const filtered = [];

            for (const sentence of sentences) {
                const shouldDelete = aggressive.some(phrase =>
                    sentence.toLowerCase().includes(phrase.toLowerCase())
                );

                if (shouldDelete) {
                    // Keep quotes if sentence had dialogue
                    filtered.push(sentence.includes('"') ? (sentence.match(/"/g) || []).join('') : '');
                } else {
                    filtered.push(sentence);
                }
            }

            text = filtered.join('');
        }
    }

    // === PHASE 6: Multi-Word Phrase Intelligence ===
    // Process multi-word phrases BEFORE single-word fatigue replacement
    // This ensures phrases like "deep breath" are replaced as semantic units
    if (CONFIG.smartReplacement && CONFIG.smartReplacement.enablePhraseIntelligence && analysis) {
        const detectedPhrases = detectPhraseReplacements(text);
        if (detectedPhrases.length > 0) {
            const phraseResult = applyPhraseReplacements(text, detectedPhrases, analysis);
            text = phraseResult.text;
        }
    }

    // === MODE 3: Auto-replace ALL fatigue types ===
    // REPLACEMENT FIRST strategy:
    // - Try to replace everything (words, phrases, sounds)
    // - Only remove PHRASES as last resort (if no synonym)
    // - NEVER remove single words (verbs/adjectives/nouns) - log warning instead
    // User can still force removal via PRECISE/AGGRESSIVE cards

    if (analysis && analysis.composted.fatigue) {
        const replaced = [];
        const removed = [];
        const needsSynonym = [];  // Track words missing synonyms

        Object.keys(analysis.composted.fatigue).forEach(fatigued => {
            // === SMART REPLACEMENT: Use Bonepoke scores to guide selection ===
            // Passes quality dimensions to getSmartSynonym for intelligent choice
            const synonym = CONFIG.smartReplacement && CONFIG.smartReplacement.enabled
                ? getSmartSynonym(fatigued, analysis.scores, text)
                : getSynonym(fatigued);

            const isPhrase = fatigued.includes(' ');
            const isSound = fatigued.includes('*');
            const isSingleWord = !isPhrase && !isSound;

            // Try replacement first
            if (synonym !== fatigued) {
                // For sound effects and phrases, match without word boundaries
                const pattern = (isSound || isPhrase)
                    ? fatigued.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    : `\\b${fatigued.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;

                const regex = new RegExp(pattern, 'gi');
                if (regex.test(text)) {
                    // === PHASE 5: VALIDATION - Test replacement before applying ===
                    const originalText = text;
                    const replacedText = text.replace(regex, synonym);

                    // Validate replacement (if enabled)
                    let validationResult = { valid: true, reason: 'validation disabled', scoreChange: 0 };
                    if (CONFIG.smartReplacement && CONFIG.smartReplacement.enableValidation) {
                        state.replacementValidation.totalAttempts++;
                        validationResult = validateReplacement(originalText, replacedText, fatigued, synonym);

                        if (!validationResult.valid) {
                            // Blocked by validation - track reason and skip replacement
                            state.replacementValidation.validationsFailed++;

                            // Categorize block reason
                            if (validationResult.reason.includes('degraded')) {
                                state.replacementValidation.blockedReasons.qualityDegradation++;
                            } else if (validationResult.reason.includes('contradiction')) {
                                state.replacementValidation.blockedReasons.newContradictions++;
                            } else if (validationResult.reason.includes('fatigue')) {
                                state.replacementValidation.blockedReasons.fatigueIncrease++;
                            } else if (validationResult.reason.includes('improvement')) {
                                state.replacementValidation.blockedReasons.insufficientImprovement++;
                            }

                            return; // Skip this replacement
                        } else {
                            state.replacementValidation.validationsPassed++;
                        }
                    }

                    // Apply replacement (validation passed or disabled)
                    text = replacedText;

                    // Track result for adaptive learning
                    if (CONFIG.smartReplacement && CONFIG.smartReplacement.enableAdaptiveLearning) {
                        trackReplacementResult(fatigued, synonym, validationResult.scoreChange);
                    }

                    // Enhanced logging with reason (if smart replacement)
                    if (CONFIG.smartReplacement && CONFIG.smartReplacement.enabled &&
                        CONFIG.smartReplacement.logReplacementReasons) {
                        // Get weakest dimension to explain WHY
                        const weakest = Object.entries(analysis.scores)
                            .sort((a, b) => a[1] - b[1])[0];
                        const reason = weakest[1] <= 2 ? `for ${weakest[0]}` : '';
                        const scoreInfo = validationResult.scoreChange !== 0
                            ? ` [${validationResult.scoreChange >= 0 ? '+' : ''}${validationResult.scoreChange.toFixed(2)}]`
                            : '';
                        replaced.push(`${fatigued} → ${synonym}${reason ? ' (' + reason + ')' : ''}${scoreInfo}`);
                    } else {
                        replaced.push(`${fatigued} → ${synonym}`);
                    }
                }
            }
            // No synonym available - decide based on type
            else {
                // ONLY remove phrases as last resort
                // NEVER remove single words (verbs/adjectives/nouns)
                if (isPhrase || isSound) {
                    const pattern = fatigued.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(pattern, 'gi');
                    if (regex.test(text)) {
                        text = text.replace(regex, '');
                        removed.push(fatigued);
                    }
                }
                // Single word without synonym - keep it, but log
                else if (isSingleWord) {
                    needsSynonym.push(fatigued);
                }
            }
        });

    }

    // === MODE 4: User-defined REPLACER card (manual overrides) ===
    const replacerCard = storyCards.find(c => c.keys && c.keys.includes('word_replacer'));
    if (replacerCard && replacerCard.entry) {
        const lines = replacerCard.entry.split('\n');
        const applied = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const arrowIndex = trimmed.indexOf('=>');
            if (arrowIndex === -1) continue;

            const original = trimmed.slice(0, arrowIndex).trim();
            const replacement = trimmed.slice(arrowIndex + 2).trim();

            if (original && replacement) {
                const regex = getWordRegex(original);  // Optimized: use cached regex from sharedLibrary
                if (regex.test(text)) {
                    text = text.replace(regex, replacement);
                    applied.push(`${original} → ${replacement}`);
                }
            }
        }

    }

    // Minimum length warning (no regeneration - doesn't work reliably)
    if (text.trim().length < 20) {
        safeLog(`⚠️ Output very short (${text.trim().length} chars) - may want to manually regenerate`, 'warn');
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
                break;
            }
        }
    }

    // Add space to start of every reply (user requirement)
    if (!text.startsWith(' ')) {
        text = ' ' + text;
    }

    // Quality tracking (for analytics)
    if (CONFIG.bonepoke.enabled && analysis) {
        const isBelowThreshold = analysis.avgScore < CONFIG.bonepoke.qualityThreshold;

        if (isBelowThreshold) {
            // Track low quality occurrences
            state.regenCount = (state.regenCount || 0) + 1;
            Analytics.recordRegeneration();
        }
    }

    // === NGO @REQ FULFILLMENT DETECTION ===
    // Check if narrative request was fulfilled in this output
    if (CONFIG.commands && CONFIG.commands.enabled && state.commands) {
        const fulfillmentResult = NGOCommands.detectFulfillment(text);

        // Cleanup expired parentheses memories
        NGOCommands.cleanupExpiredMemories();
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
