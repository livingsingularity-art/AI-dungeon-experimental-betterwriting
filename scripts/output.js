/**
 * ============================================================================
 * AI DUNGEON OUTPUT SCRIPT v2.7
 * Analyzes and optionally modifies AI output before showing to player
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
        state.bonepokeHistory = state.bonepokeHistory || [];
        state.bonepokeHistory.push(analysis);

        // Keep only last 20 analyses for memory efficiency
        if (state.bonepokeHistory.length > 20) {
            state.bonepokeHistory = state.bonepokeHistory.slice(-20);
        }

        // Store last score for context script
        state.lastBonepokeScore = analysis.avgScore;
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

        if (foundPrecise.length > 0) {
            safeLog(`⛔ PRECISE removed: ${foundPrecise.join(', ')}`, 'warn');
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
                    const matchedPhrase = aggressive.find(p =>
                        sentence.toLowerCase().includes(p.toLowerCase())
                    );
                    safeLog(`⛔ AGGRESSIVE removed sentence with: "${matchedPhrase}"`, 'warn');
                    // Keep quotes if sentence had dialogue
                    filtered.push(sentence.includes('"') ? (sentence.match(/"/g) || []).join('') : '');
                } else {
                    filtered.push(sentence);
                }
            }

            text = filtered.join('');
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
            const synonym = getSynonym(fatigued);
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
                    text = text.replace(regex, synonym);
                    replaced.push(`${fatigued} → ${synonym}`);
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

        // Log what was done
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
                const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
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
                safeLog(`Removed duplicate start: "${suffix.slice(0, 30)}..."`, 'info');
                break;
            }
        }
    }

    // Add space to start of every reply (user requirement)
    if (!text.startsWith(' ')) {
        text = ' ' + text;
    }

    // Quality analysis and logging (no regeneration - doesn't work reliably)
    if (CONFIG.bonepoke.enabled && analysis) {
        const isBelowThreshold = analysis.avgScore < CONFIG.bonepoke.qualityThreshold;

        if (isBelowThreshold) {
            safeLog(
                `⚠️ Quality below threshold: ${analysis.avgScore.toFixed(2)} < ${CONFIG.bonepoke.qualityThreshold}`,
                'warn'
            );

            // Log specific issues for user awareness
            if (analysis.suggestions.length > 0) {
                safeLog('⚠️ Issues detected (consider manual regeneration):', 'warn');
                analysis.suggestions.slice(0, 3).forEach(s => safeLog(`  - ${s}`, 'warn'));
            }

            // Track low quality occurrences
            state.regenCount = (state.regenCount || 0) + 1;
            Analytics.recordRegeneration();
        }
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
