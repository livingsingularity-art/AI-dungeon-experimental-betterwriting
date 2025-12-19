/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

/**
 * ============================================================================
 * VOGLER V4 OUTPUT SCRIPT
 * Analyzes and optionally modifies AI output before showing to player
 * ============================================================================
 *
 * Combines:
 * - Trinity output processing (Bonepoke, NGO, diversity, word replacement)
 * - Vogler Hero's Journey (bridge parsing, beat detection, stage advancement)
 */

/**
 * Parse bridge generation response from AI
 */
const parseBridgeOutput = (text) => {
    if (!state.vogler?.bridge?.pendingGeneration) {
        return { text };
    }

    const events = parseBridgeFromOutput(text);

    if (events) {
        storeBridgeEvents(events);

        // Replace output with confirmation
        const confirmText = `Bridge card generated!\n\n` +
            events.map((e, i) => `${i + 1}. ${e}`).join('\n') +
            `\n\n[Continue the story normally.]`;

        return { text: confirmText };
    }

    return { text };
};

/**
 * Process Vogler output (progressive removal + stage advancement)
 */
const processVoglerOutput = (text) => {
    if (!state.vogler?.initialized) {
        return { text };
    }

    // Progressive bridge removal
    progressiveBridgeRemoval();

    // Check stage advancement
    if (checkStageAdvancement()) {
        advanceStage();
    }

    return { text };
};

/**
 * Initialize quality tracking
 */
const initializeQualityTracking = (text) => {
    state.regenCount = state.regenCount || 0;
    return { text };
};

/**
 * Restore NGO author's note
 */
const restoreAuthorsNote = (text) => {
    if (!CONFIG.ngo || !CONFIG.ngo.enabled || !state.memory || !state.authorsNoteStorage) {
        return { text };
    }

    if (!state.memory.authorsNote || state.memory.authorsNote !== state.authorsNoteStorage) {
        state.memory.authorsNote = state.authorsNoteStorage;
        safeLog(`🔄 Author's note restored from storage`, 'info');
    }

    return { text };
};

/**
 * Process through AutoCards
 */
const processAutoCards = (text) => {
    text = AutoCards("output", text);
    return { text };
};

/**
 * Clean output from VS instructions and XML tags
 */
const cleanOutput = (text) => {
    // Remove any accidental XML tags
    text = text.replace(/<\/?response>/g, '');
    text = text.replace(/<\/?probability>/g, '');
    text = text.replace(/<\/?text>/g, '');
    text = text.replace(/<\/?candidate[^>]*>/g, '');
    text = text.replace(/<\/?selected>/g, '');

    // Remove VS instruction if it leaked through
    text = text.replace(/\[Internal Sampling Protocol:[\s\S]*?\]/g, '');
    text = text.replace(/Internal Sampling Protocol:[\s\S]*?never mention this process[^\n]*/g, '');

    // Remove instruction fragments
    text = text.replace(/- (mentally )?generate \d+ distinct.*?candidates/gi, '');
    text = text.replace(/- for each.*?probability p/gi, '');
    text = text.replace(/- only consider candidates where p <.*?\)/gi, '');
    text = text.replace(/- randomly select one.*?candidates/gi, '');
    text = text.replace(/- output ONLY.*?response/gi, '');
    text = text.replace(/- never mention.*?output/gi, '');
    text = text.replace(/from the unlikely tails.*?distribution/gi, '');

    // Remove trailing "stop"
    text = text.replace(/stop[.!?,;\s]*$/i, '').trim();

    // Normalize whitespace
    text = text.trim();
    text = text.replace(/\n{3,}/g, '\n\n');

    return { text };
};

/**
 * Format dialogue
 */
const formatDialogue = (text) => {
    // Fix dialogue tags with missing commas
    if (text.match(/".*,,/)) {
        text = text.replace(/says? "\s*(\S)(.*),,\s*(\S)/i, (m, a, b, c) =>
            a.toLowerCase() + b.trim() + ', "' + c.toUpperCase()
        );
        text = text.replace(/(you |i )(your? |i )(\S)/i, (m, a, b, c) =>
            b.charAt(0).toUpperCase() + b.slice(1) + c.toLowerCase()
        );
    } else {
        text = text.replace(/\bi says/i, 'I say');
        text = text.replace(/(says?) "\s*(\S)/i, (m, a, b) =>
            a + ', "' + b.toUpperCase()
        );
    }

    // Add period before closing quote if missing
    if (text.match(/[^.,?!]"\n/)) {
        text = text.replace(/\s*"\n/, '."\n');
    } else {
        text = text.replace(/(say)(s?, ".*)([,?!]")/i, (m, a, b, c) => {
            const verb = c == ',"' ? 'begin' : c == '?"' ? 'ask' : c == '!"' ? 'shout' : '';
            return verb ? verb + b.trim() + c : m;
        });
    }

    return { text };
};

/**
 * Analyze output quality with Bonepoke
 */
const analyzeBonepokeQuality = (text) => {
    if (!CONFIG.bonepoke.enabled) {
        state.currentAnalysis = null;
        return { text };
    }

    const analysis = BonepokeAnalysis.analyze(text);
    state.currentAnalysis = analysis;

    // Store analysis in history
    state.bonepokeHistory = state.bonepokeHistory || [];
    state.bonepokeHistory.push(analysis);

    // Trim to keep only last 5 analyses
    while (state.bonepokeHistory.length > (CONFIG.maxBonepokeHistory || 5)) {
        state.bonepokeHistory.shift();
    }

    // Store last score
    state.lastBonepokeScore = analysis.avgScore;

    return { text };
};

/**
 * Process NGO turn
 */
const processNGOTurn = (text) => {
    if (!CONFIG.ngo || !CONFIG.ngo.enabled || !state.ngo) {
        return { text };
    }

    const turnResult = NGOEngine.processTurn();

    if (turnResult.processed && CONFIG.ngo.logStateChanges) {
        if (turnResult.overheat.completed) {
            safeLog('🔥 Overheat completed, entering cooldown', 'info');
        }
        if (turnResult.cooldown.completed) {
            safeLog('✅ Cooldown complete', 'success');
        }
    }

    if (CONFIG.ngo.debugLogging) {
        safeLog(`📊 NGO: Heat=${state.ngo.heat.toFixed(1)}, Temp=${state.ngo.temperature}, Phase=${state.ngo.currentPhase}`, 'info');
    }

    return { text };
};

/**
 * Analyze AI output for conflict
 */
const analyzeAIConflict = (text) => {
    if (!CONFIG.ngo || !CONFIG.ngo.enabled || !state.ngo) {
        return { text };
    }

    const aiConflictData = NGOEngine.analyzeConflict(text);
    const aiHeatResult = NGOEngine.updateHeat(aiConflictData, 'ai');

    if (CONFIG.ngo.logStateChanges && aiHeatResult.delta !== 0) {
        safeLog(`🔥 AI heat: ${aiHeatResult.oldHeat.toFixed(1)} → ${aiHeatResult.newHeat.toFixed(1)} (conflicts: ${aiConflictData.conflicts}, calming: ${aiConflictData.calming})`, 'info');
    }

    return { text };
};

/**
 * Bonepoke-NGO bidirectional integration
 */
const integrateBonepokeNGO = (text) => {
    if (!CONFIG.bonepoke.enabled || !state.currentAnalysis || !CONFIG.ngo || !CONFIG.ngo.enabled || !state.ngo) {
        return { text };
    }

    const analysis = state.currentAnalysis;

    // Fatigue triggers early cooldown
    if (CONFIG.ngo.fatigueTriggersEarlyCooldown) {
        const fatigueCount = Object.keys(analysis.composted.fatigue).length;
        if (fatigueCount >= CONFIG.ngo.fatigueThresholdForCooldown && state.ngo.temperature >= 8) {
            NGOEngine.forceEarlyCooldown('fatigue');
            safeLog(`⚠️ High fatigue (${fatigueCount} words) at temp ${state.ngo.temperature} - forcing cooldown`, 'warn');
        }
    }

    // Drift reduces heat
    if (CONFIG.ngo.driftReducesHeat && analysis.composted.drift.length > 0) {
        const driftResult = NGOEngine.reduceHeatFromDrift();
        if (driftResult.reduction > 0) {
            safeLog(`🌫️ Drift detected - heat reduced: ${driftResult.oldHeat.toFixed(1)} → ${driftResult.newHeat.toFixed(1)}`, 'info');
        }
    }

    // Quality gates temperature increase
    if (CONFIG.ngo.qualityGatesTemperatureIncrease && state.ngo.temperatureWantsToIncrease) {
        const qualityApproved = analysis.avgScore >= CONFIG.ngo.qualityThresholdForIncrease;
        const tempResult = NGOEngine.applyTemperatureIncrease(qualityApproved);

        if (tempResult.applied) {
            safeLog(`🌡️ Temperature: ${tempResult.oldTemp} → ${tempResult.newTemp} (quality: ${analysis.avgScore.toFixed(2)})`, 'warn');

            if (NGOEngine.shouldTriggerOverheat()) {
                NGOEngine.enterOverheatMode();
            }
        } else if (tempResult.reason === 'quality_blocked') {
            safeLog(`⛔ Temperature increase BLOCKED (quality: ${analysis.avgScore.toFixed(2)} < ${CONFIG.ngo.qualityThresholdForIncrease})`, 'warn');
        }
    }

    return { text };
};

/**
 * Analyze diversity
 */
const analyzeDiversity = (text) => {
    if (!CONFIG.diversity || !CONFIG.diversity.enabled) {
        return { text };
    }

    // Initialize diversity state
    if (!state.diversity) {
        state.diversity = {
            scoreHistory: [],
            avgScore: 1.0,
            blockedPhrases: [],
            rerollCount: 0,
            lastDiversityScore: 1.0,
            alertThreshold: CONFIG.diversity.alertThreshold,
            interventionLevel: 'none',
            outputTexts: []
        };
    }

    const ds = state.diversity;
    const historyTexts = ds.outputTexts || [];

    // Calculate diversity score
    const diversityResult = DiversityEngine.calculateDiversityScore(text, historyTexts);

    // Update state
    ds.lastDiversityScore = diversityResult.score;
    ds.scoreHistory.push(diversityResult.score);
    if (ds.scoreHistory.length > 20) ds.scoreHistory.shift();

    // Calculate average
    ds.avgScore = ds.scoreHistory.reduce((a, b) => a + b, 0) / ds.scoreHistory.length;

    // Assess intervention level
    const assessment = DiversityEngine.assessDiversity(diversityResult.score);
    ds.interventionLevel = assessment.action;

    // Auto-block phrases
    if (CONFIG.diversity.autoBlockPhrases && diversityResult.details.overlappingPhrases) {
        diversityResult.details.overlappingPhrases.forEach(phrase => {
            if (!ds.blockedPhrases.includes(phrase)) {
                ds.blockedPhrases.push(phrase);
            }
        });
        if (ds.blockedPhrases.length > CONFIG.diversity.maxBlockedPhrases) {
            ds.blockedPhrases = ds.blockedPhrases.slice(-20);
        }
    }

    // Store output
    ds.outputTexts.push(text);
    if (ds.outputTexts.length > 5) ds.outputTexts.shift();

    // Log
    if (CONFIG.diversity.debugLogging) {
        safeLog(`📊 Diversity: ${Math.round(diversityResult.score * 100)}% (${assessment.level})`,
                diversityResult.score < 0.5 ? 'warn' : 'info');
    }

    return { text };
};

/**
 * Track cross-output repetition
 */
const trackCrossOutputRepetition = (text) => {
    state.outputHistory = state.outputHistory || [];
    state.turnCount = (state.turnCount || 0) + 1;

    // Extract n-grams
    const allNGrams = BonepokeAnalysis.extractNGrams(text, 2, 3);

    // Keep only significant n-grams
    const significantNGrams = {};
    Object.entries(allNGrams).forEach(([key, data]) => {
        if (data.count >= 2 || data.properNouns > 0) {
            significantNGrams[key] = {
                c: data.count,
                s: data.size,
                p: data.properNouns,
                j: data.conjunctions
            };
        }
    });

    // Add to history
    state.outputHistory.push({
        turn: state.turnCount,
        ngrams: significantNGrams
    });

    // Trim history
    while (state.outputHistory.length > (CONFIG.maxOutputHistory || 3)) {
        state.outputHistory.shift();
    }

    // Find cross-output repeats
    const crossOutputRepeats = BonepokeAnalysis.findCrossOutputRepeats(state.outputHistory);

    if (crossOutputRepeats.length > 0) {
        const handled = [];

        crossOutputRepeats.forEach(repeat => {
            const words = repeat.phrase.split(' ');
            const properNouns = [];

            words.forEach((word, idx) => {
                if (idx > 0 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
                    properNouns.push(word);
                }
            });

            // Preserve proper nouns
            if (properNouns.length > 0 && repeat.size > 2) {
                const preservedText = properNouns.join(' and ');
                const regex = new RegExp(repeat.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

                if (regex.test(text)) {
                    text = text.replace(regex, preservedText);
                    handled.push(`${repeat.phrase} → ${preservedText} (cross-output, preserved names)`);
                }
            } else {
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

        if (handled.length > 0) {
            safeLog(`🔄 Cross-output repeats: ${handled.join(', ')}`, 'info');
        }
    }

    return { text };
};

/**
 * Apply word removal/replacement (USC-style)
 */
const applyWordProcessing = (text) => {
    // MODE 1: PRECISE removal
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

        if (foundPrecise.length > 0) {
            safeLog(`⛔ PRECISE removed: ${foundPrecise.join(', ')}`, 'warn');
        }
    }

    // MODE 2: AGGRESSIVE removal
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
                    const matchedPhrase = aggressive.find(p =>
                        sentence.toLowerCase().includes(p.toLowerCase())
                    );
                    safeLog(`⛔ AGGRESSIVE removed sentence with: "${matchedPhrase}"`, 'warn');
                    filtered.push(sentence.includes('"') ? (sentence.match(/"/g) || []).join('') : '');
                } else {
                    filtered.push(sentence);
                }
            }

            text = filtered.join('');
        }
    }

    // MODE 3: Auto-replace fatigue
    if (state.currentAnalysis && state.currentAnalysis.composted.fatigue) {
        const replaced = [];
        const removed = [];
        const needsSynonym = [];

        Object.keys(state.currentAnalysis.composted.fatigue).forEach(fatigued => {
            const synonym = CONFIG.smartReplacement && CONFIG.smartReplacement.enabled
                ? getSmartSynonym(fatigued, state.currentAnalysis.scores, text)
                : getSynonym(fatigued);

            const isPhrase = fatigued.includes(' ');
            const isSound = fatigued.includes('*');
            const isSingleWord = !isPhrase && !isSound;

            if (synonym !== fatigued) {
                const pattern = (isSound || isPhrase)
                    ? fatigued.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    : `\\b${fatigued.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;

                const regex = new RegExp(pattern, 'gi');
                if (regex.test(text)) {
                    text = text.replace(regex, synonym);
                    replaced.push(`${fatigued} → ${synonym}`);
                }
            } else {
                if (isPhrase || isSound) {
                    const pattern = fatigued.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(pattern, 'gi');
                    if (regex.test(text)) {
                        text = text.replace(regex, '');
                        removed.push(fatigued);
                    }
                } else if (isSingleWord) {
                    needsSynonym.push(fatigued);
                }
            }
        });

        if (replaced.length > 0) {
            safeLog(`🔄 Replaced: ${replaced.join(', ')}`, 'info');
        }
        if (removed.length > 0) {
            safeLog(`⚠️ Removed phrases (no synonym): ${removed.join(', ')}`, 'warn');
        }
        if (needsSynonym.length > 0) {
            safeLog(`📝 Needs synonym: ${needsSynonym.join(', ')} (kept in text)`, 'warn');
        }
    }

    // MODE 4: User REPLACER card
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
                const regex = getWordRegex(original);
                if (regex.test(text)) {
                    text = text.replace(regex, replacement);
                    applied.push(`${original} → ${replacement}`);
                }
            }
        }

        if (applied.length > 0) {
            safeLog(`🔄 User REPLACER applied: ${applied.join(', ')}`, 'info');
        }
    }

    return { text };
};

/**
 * Remove duplicate text at start
 */
const removeDuplicateStart = (text) => {
    const lastAIOutput = history
        .slice()
        .reverse()
        .find(h => h.type === 'ai');

    if (lastAIOutput && lastAIOutput.text) {
        const lastChunk = lastAIOutput.text.slice(-100);

        for (let len = 50; len >= 10; len--) {
            const suffix = lastChunk.slice(-len).trim();
            if (suffix && text.trim().startsWith(suffix)) {
                text = text.trim().slice(suffix.length).trim();
                safeLog(`Removed duplicate start: "${suffix.slice(0, 30)}..."`, 'info');
                break;
            }
        }
    }

    return { text };
};

/**
 * Add space to start
 */
const addLeadingSpace = (text) => {
    if (!text.startsWith(' ')) {
        text = ' ' + text;
    }
    return { text };
};

/**
 * Detect NGO request fulfillment
 */
const detectRequestFulfillment = (text) => {
    if (!CONFIG.commands || !CONFIG.commands.enabled || !state.commands) {
        return { text };
    }

    const fulfillmentResult = NGOCommands.detectFulfillment(text);

    if (fulfillmentResult.reason === 'pending') {
        safeLog(`⏳ Request pending (score: ${fulfillmentResult.score.toFixed(2)}, TTL: ${state.commands.narrativeRequestTTL})`, 'info');
    }

    NGOCommands.cleanupExpiredMemories();

    return { text };
};

/**
 * Record analytics
 */
const recordAnalytics = (text) => {
    Analytics.recordOutput(state.currentAnalysis);
    return { text };
};

/**
 * Safety check for empty output
 */
const safetyCheckEmpty = (text) => {
    if (!text || text.trim() === '') {
        safeLog('Warning: Output was empty after cleaning, returning space', 'warn');
        return { text: ' ' };
    }
    return { text };
};

// Chain all output processing functions with Director pattern
const modifier = (text) => {
    return director.output(
        initializeQualityTracking,   // Initialize counters
        restoreAuthorsNote,          // Trinity: NGO author's note restoration
        processAutoCards,            // Trinity: AutoCards integration
        parseBridgeOutput,           // Vogler: parse bridge generation
        cleanOutput,                 // Trinity: clean VS instructions
        formatDialogue,              // Trinity: dialogue formatting
        analyzeBonepokeQuality,      // Trinity: Bonepoke analysis
        processNGOTurn,              // Trinity: NGO turn processing
        analyzeAIConflict,           // Trinity: NGO AI conflict analysis
        integrateBonepokeNGO,        // Trinity: Bonepoke-NGO integration
        analyzeDiversity,            // Trinity: diversity analysis
        trackCrossOutputRepetition,  // Trinity: cross-output tracking
        applyWordProcessing,         // Trinity: word removal/replacement
        removeDuplicateStart,        // Trinity: remove duplicates
        addLeadingSpace,             // Trinity: add space
        processVoglerOutput,         // Vogler: progressive removal + advancement
        detectRequestFulfillment,    // Trinity: NGO request fulfillment
        recordAnalytics,             // Trinity: analytics
        safetyCheckEmpty             // Trinity: safety check
    );
};

// CRITICAL: Always end with void 0
void 0
