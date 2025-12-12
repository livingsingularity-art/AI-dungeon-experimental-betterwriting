# Mode Collapse Prevention Implementation Blueprint for Trinity Scripts

## Executive Summary

This blueprint details how to implement mode collapse prevention techniques from the "Avoiding Mode Collapse" research documents into the existing Trinity Scripts architecture. The current scripts already contain foundational elements (Verbalized Sampling, Bonepoke analysis, NGO engine) that can be enhanced with additional diversity-focused systems.

---

## Current State Analysis

### What Trinity Scripts Already Have

| Component | Location | Mode Collapse Relevance |
|-----------|----------|------------------------|
| Verbalized Sampling | `trinitysharedLibrary.js:28-35`, `trinitycontext.js:159-163` | **CORE** - Explicitly requests diverse outputs |
| Bonepoke Analysis | `trinitysharedLibrary.js:39-44`, `trinityoutput.js:161-180` | Quality scoring, fatigue detection |
| N-gram Tracking | `trinityoutput.js:253-287` | Cross-output phrase repetition |
| Output History | `trinityoutput.js:277-287` | Stores last 3 outputs with n-grams |
| Synonym Replacement | `trinitysharedLibrary.js:1018-1260` | 200+ synonym mappings |
| Smart Replacement | `trinitysharedLibrary.js:140-196` | Context-aware synonym selection |
| Dynamic Author's Note | `trinitycontext.js:44-116` | Layered guidance injection |
| NGO Engine | `trinitysharedLibrary.js:46-111` | Pacing and tension control |

### What's Missing (Gaps to Fill)

1. **Dedicated Diversity Scoring System** - No unified diversity metric
2. **Blocked Phrase History** - No persistent "avoid these phrases" injection
3. **Memory Health Monitoring** - No commands to diagnose Memory/WorldInfo issues
4. **Context Diversity Pruning** - No smart removal of repetitive context
5. **Verbalized Sampling Rotation** - Static prompts, no diversity-pressure escalation
6. **User Feedback Dashboard** - No consolidated diversity status display

---

## Implementation Plan

### Phase 1: Diversity Detection System (Shared Library)

**File:** `trinitysharedLibrary(1).js`
**Priority:** HIGH
**Effort:** Medium

Add a dedicated `DiversityEngine` module alongside the existing `NGOEngine`:

```javascript
// === DIVERSITY ENGINE ===
// Tracks and manages output diversity across the session

const DiversityEngine = (() => {
    // === STOPWORDS (Filter from n-gram analysis) ===
    const STOPWORDS = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'and', 'of', 'in',
        'that', 'it', 'for', 'on', 'with', 'as', 'at', 'by', 'from', 'or', 'be',
        'this', 'have', 'has', 'had', 'you', 'your', 'i', 'my', 'me', 'we', 'our',
        'they', 'their', 'he', 'she', 'his', 'her', 'but', 'not', 'what', 'which'
    ]);

    /**
     * Generate meaningful n-grams (filtering stopword-heavy sequences)
     * @param {string} text - Text to analyze
     * @param {number} n - N-gram size (2-4 recommended)
     * @returns {string[]} Array of meaningful n-grams
     */
    const generateMeaningfulNgrams = (text, n) => {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2);

        const ngrams = [];
        for (let i = 0; i <= words.length - n; i++) {
            const gram = words.slice(i, i + n);
            // Require at least half the words to be meaningful
            const meaningfulCount = gram.filter(w => !STOPWORDS.has(w)).length;
            if (meaningfulCount >= Math.ceil(n / 2)) {
                ngrams.push(gram.join(' '));
            }
        }
        return ngrams;
    };

    /**
     * Calculate diversity score comparing new text to history
     * @param {string} newText - New output to evaluate
     * @param {string[]} historyTexts - Array of previous outputs
     * @returns {Object} { score: 0-1 (1=fully diverse), overlap: number, details: {...} }
     */
    const calculateDiversityScore = (newText, historyTexts) => {
        const currentGrams = new Set(generateMeaningfulNgrams(newText, 3));
        const historicalGrams = new Set(
            historyTexts.flatMap(h => generateMeaningfulNgrams(h, 3))
        );

        if (currentGrams.size === 0) {
            return { score: 1.0, overlap: 0, details: { currentSize: 0, historySize: historicalGrams.size } };
        }

        let overlap = 0;
        const overlappingPhrases = [];
        currentGrams.forEach(gram => {
            if (historicalGrams.has(gram)) {
                overlap++;
                overlappingPhrases.push(gram);
            }
        });

        const repetitionRatio = overlap / currentGrams.size;
        const diversityScore = 1 - repetitionRatio;

        return {
            score: diversityScore,
            overlap: overlap,
            details: {
                currentSize: currentGrams.size,
                historySize: historicalGrams.size,
                overlappingPhrases: overlappingPhrases.slice(0, 5) // Top 5 for logging
            }
        };
    };

    /**
     * Detect exact phrase repetitions within text
     * @param {string} text - Text to check
     * @returns {string[]} Array of repeated phrases
     */
    const detectExactRepetition = (text) => {
        const matches = text.match(/(.{15,}?)\1+/g);
        return matches || [];
    };

    /**
     * Detect structural repetition (repeated sentence starters)
     * @param {string} text - Text to analyze
     * @returns {Array} Array of {pattern, count} objects
     */
    const detectStructuralRepetition = (text) => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const starters = {};

        sentences.forEach(s => {
            const start = s.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase();
            starters[start] = (starters[start] || 0) + 1;
        });

        return Object.entries(starters)
            .filter(([_, count]) => count >= 3)
            .map(([pattern, count]) => ({ pattern, count }));
    };

    /**
     * Detect looping patterns across paragraphs
     * @param {string} text - Full text to analyze
     * @returns {Array} Array of detected loops
     */
    const detectLoopingPatterns = (text) => {
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
        const seen = new Map();
        const loops = [];

        paragraphs.forEach((p, idx) => {
            const normalized = p.toLowerCase().replace(/\s+/g, ' ').trim();
            const signature = normalized.slice(0, 100);

            if (seen.has(signature)) {
                loops.push({
                    preview: p.slice(0, 50) + '...',
                    firstIndex: seen.get(signature),
                    repeatIndex: idx
                });
            } else {
                seen.set(signature, idx);
            }
        });

        return loops;
    };

    /**
     * Get diversity assessment with thresholds
     * @param {number} score - Diversity score (0-1)
     * @returns {Object} { level: string, action: string, color: string }
     */
    const assessDiversity = (score) => {
        if (score >= 0.8) return { level: 'excellent', action: 'none', color: '🟢' };
        if (score >= 0.65) return { level: 'good', action: 'monitor', color: '🟡' };
        if (score >= 0.5) return { level: 'moderate', action: 'nudge', color: '🟠' };
        if (score >= 0.35) return { level: 'low', action: 'intervene', color: '🔴' };
        return { level: 'critical', action: 'escalate', color: '⛔' };
    };

    return {
        generateMeaningfulNgrams,
        calculateDiversityScore,
        detectExactRepetition,
        detectStructuralRepetition,
        detectLoopingPatterns,
        assessDiversity,
        STOPWORDS
    };
})();
```

**State Additions** (add to `initState()`):
```javascript
// === DIVERSITY STATE INITIALIZATION ===
state.diversity = {
    scoreHistory: [],           // Last 20 diversity scores
    avgScore: 1.0,              // Running average
    blockedPhrases: [],         // Phrases to avoid (auto-populated)
    rerollCount: 0,             // Consecutive rerolls (resets on good output)
    lastDiversityScore: 1.0,    // Most recent score
    alertThreshold: 0.35,       // User-configurable
    interventionLevel: 'none'   // none, nudge, intervene, escalate
};
```

---

### Phase 2: Enhanced Verbalized Sampling (Context Modifier)

**File:** `trinitycontext(1).js`
**Priority:** HIGH
**Effort:** Low

Replace static verbalized sampling with diversity-pressure-aware prompts:

```javascript
// === DIVERSITY-AWARE VERBALIZED SAMPLING ===
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
```

**Integration Point** (in context modifier, around line 159):
```javascript
// REPLACE this:
// text += '\n\n' + VerbalizedSampling.getInstruction();

// WITH this:
if (CONFIG.vs.enabled) {
    const vsInstruction = VerbalizedSampling.getInstruction();
    const diversityGuidance = getDiversityAwareVSPrompt();

    // Inject both: VS mechanics + diversity guidance
    text += '\n\n' + vsInstruction;
    text += `\n[Writing guidance: ${diversityGuidance}]`;
}
```

---

### Phase 3: Blocked Phrase Injection (Context Modifier)

**File:** `trinitycontext(1).js`
**Priority:** MEDIUM
**Effort:** Low

Add dynamic blocked phrase injection before the AI processes:

```javascript
// === BLOCKED PHRASE INJECTION ===
const injectBlockedPhrases = (text) => {
    const ds = state.diversity;
    if (!ds || ds.blockedPhrases.length === 0) return text;

    // Only inject if we have problematic phrases
    const recentBlocked = ds.blockedPhrases.slice(-10);
    if (recentBlocked.length === 0) return text;

    // Build avoidance instruction
    const blockedSection = `\n[Avoid using these overused phrases: ${recentBlocked.join('; ')}]`;

    // Insert near end of context
    const lines = text.split('\n');
    const insertPosition = Math.max(0, lines.length - 2);
    lines.splice(insertPosition, 0, blockedSection);

    return lines.join('\n');
};
```

**Integration Point** (add before `return { text }` in context modifier):
```javascript
// Inject blocked phrases before returning
text = injectBlockedPhrases(text);
```

---

### Phase 4: Output Diversity Analysis (Output Modifier)

**File:** `trinityoutput(1).js`
**Priority:** HIGH
**Effort:** Medium

Enhance output analysis with diversity scoring and user feedback:

```javascript
// === DIVERSITY ANALYSIS ===
// Add after Bonepoke analysis (around line 180)

const analyzeDiversity = (text) => {
    // Initialize diversity state if needed
    if (!state.diversity) {
        state.diversity = {
            scoreHistory: [],
            avgScore: 1.0,
            blockedPhrases: [],
            rerollCount: 0,
            lastDiversityScore: 1.0,
            alertThreshold: 0.35,
            interventionLevel: 'none'
        };
    }

    const ds = state.diversity;

    // Get history texts from outputHistory (already tracked)
    const historyTexts = (state.outputHistory || [])
        .map(h => h.text || '')
        .filter(t => t.length > 0);

    // Calculate diversity score
    const diversityResult = DiversityEngine.calculateDiversityScore(text, historyTexts);

    // Update state
    ds.lastDiversityScore = diversityResult.score;
    ds.scoreHistory.push(diversityResult.score);
    if (ds.scoreHistory.length > 20) ds.scoreHistory.shift();

    // Calculate running average
    ds.avgScore = ds.scoreHistory.reduce((a, b) => a + b, 0) / ds.scoreHistory.length;

    // Assess and set intervention level
    const assessment = DiversityEngine.assessDiversity(diversityResult.score);
    ds.interventionLevel = assessment.action;

    // Detect specific issues
    const issues = [];

    const exactRepeats = DiversityEngine.detectExactRepetition(text);
    if (exactRepeats.length > 0) {
        issues.push({ type: 'exact', items: exactRepeats });
    }

    const structuralRepeats = DiversityEngine.detectStructuralRepetition(text);
    if (structuralRepeats.length > 0) {
        issues.push({ type: 'structural', items: structuralRepeats });
    }

    // Add overlapping phrases to blocked list
    if (diversityResult.details.overlappingPhrases) {
        diversityResult.details.overlappingPhrases.forEach(phrase => {
            if (!ds.blockedPhrases.includes(phrase)) {
                ds.blockedPhrases.push(phrase);
            }
        });
        // Maintain max size
        if (ds.blockedPhrases.length > 30) {
            ds.blockedPhrases = ds.blockedPhrases.slice(-20);
        }
    }

    return {
        score: diversityResult.score,
        assessment: assessment,
        issues: issues,
        overlappingPhrases: diversityResult.details.overlappingPhrases
    };
};

// === USER FEEDBACK ===
const generateDiversityFeedback = (diversityAnalysis) => {
    const ds = state.diversity;
    const { score, assessment, issues } = diversityAnalysis;

    // Only show feedback for concerning scores
    if (score >= 0.65) {
        // Good diversity - reset reroll counter
        ds.rerollCount = 0;

        // Occasional positive feedback (every 5 turns)
        if ((state.turnCount || 0) % 5 === 0) {
            return `${assessment.color} Diversity healthy: ${Math.round(score * 100)}%`;
        }
        return null;
    }

    // Build alert message
    let message = `${assessment.color} Diversity Alert (${assessment.level})\n`;
    message += `Score: ${Math.round(score * 100)}% | Avg: ${Math.round(ds.avgScore * 100)}%\n`;

    if (issues.length > 0) {
        issues.forEach(issue => {
            if (issue.type === 'exact') {
                message += `• Exact repetition detected\n`;
            } else if (issue.type === 'structural') {
                message += `• Structural repetition: "${issue.items[0].pattern}..." (${issue.items[0].count}x)\n`;
            }
        });
    }

    // Recommendations
    if (score < 0.35) {
        message += `\n💡 Recommendation: Click Retry for a fresh response`;
        ds.rerollCount++;
    }

    return message;
};
```

**Integration Point** (add in output modifier, after Bonepoke analysis):
```javascript
// === DIVERSITY ANALYSIS ===
const diversityAnalysis = analyzeDiversity(text);

// Log diversity status
if (CONFIG.bonepoke.debugLogging) {
    const da = diversityAnalysis;
    safeLog(`📊 Diversity: ${Math.round(da.score * 100)}% (${da.assessment.level})`,
            da.score < 0.5 ? 'warn' : 'info');
}

// Generate user feedback
const diversityFeedback = generateDiversityFeedback(diversityAnalysis);
if (diversityFeedback) {
    // Combine with existing state.message or set new
    state.message = state.message
        ? state.message + '\n\n' + diversityFeedback
        : diversityFeedback;
}
```

---

### Phase 5: Memory Health Monitoring (Input Modifier)

**File:** `trinityinput(1).js`
**Priority:** MEDIUM
**Effort:** Medium

Add commands for diagnosing memory and story card health:

```javascript
// === MEMORY HEALTH ANALYSIS ===
const MemoryHealth = (() => {
    /**
     * Analyze Memory/WorldInfo for repetition-inducing content
     */
    const analyzeMemory = (memoryText) => {
        const issues = [];

        // Check for duplicate sentences
        const sentences = memoryText.match(/[^.!?]+[.!?]+/g) || [];
        const seenSentences = new Set();

        sentences.forEach(s => {
            const normalized = s.toLowerCase().trim();
            if (seenSentences.has(normalized)) {
                issues.push({
                    type: 'duplicate_sentence',
                    text: s.trim().slice(0, 50) + '...'
                });
            }
            seenSentences.add(normalized);
        });

        // Check for high n-gram density
        const trigrams = DiversityEngine.generateMeaningfulNgrams(memoryText, 3);
        const freq = new Map();
        trigrams.forEach(g => freq.set(g, (freq.get(g) || 0) + 1));

        const highFreqPhrases = [...freq.entries()]
            .filter(([_, count]) => count > 3)
            .map(([gram, count]) => ({ gram, count }));

        if (highFreqPhrases.length > 3) {
            issues.push({
                type: 'high_phrase_density',
                examples: highFreqPhrases.slice(0, 3)
            });
        }

        // Check for negative instructions (often backfire)
        if (/\bnot\b|\bdon't\b|\bwon't\b|\bnever\b/i.test(memoryText)) {
            issues.push({
                type: 'negative_instruction',
                note: 'Negative instructions often backfire. Consider positive framing.'
            });
        }

        return issues;
    };

    /**
     * Analyze Story Cards for issues
     */
    const analyzeStoryCards = (cards) => {
        const issues = [];
        const allEntries = cards.map(c => c.entry || '').join(' ');

        // Check for duplicate keys
        const keySet = new Map();
        cards.forEach((card, idx) => {
            if (!card.keys) return;
            card.keys.split(',').forEach(key => {
                const k = key.trim().toLowerCase();
                if (keySet.has(k)) {
                    issues.push({
                        type: 'duplicate_key',
                        key: k,
                        indices: [keySet.get(k), idx]
                    });
                }
                keySet.set(k, idx);
            });
        });

        // Check for oversized entries
        cards.forEach((card, idx) => {
            if (card.entry && card.entry.length > 1000) {
                issues.push({
                    type: 'oversized_entry',
                    title: card.title || `Card ${idx}`,
                    length: card.entry.length
                });
            }
        });

        // Check for repetitive content across entries
        const crossEntryGrams = DiversityEngine.generateMeaningfulNgrams(allEntries, 4);
        const gramFreq = new Map();
        crossEntryGrams.forEach(g => gramFreq.set(g, (gramFreq.get(g) || 0) + 1));

        const repeatedAcrossEntries = [...gramFreq.entries()]
            .filter(([_, count]) => count > 2);

        if (repeatedAcrossEntries.length > 5) {
            issues.push({
                type: 'cross_entry_repetition',
                count: repeatedAcrossEntries.length,
                examples: repeatedAcrossEntries.slice(0, 3).map(([g, _]) => g)
            });
        }

        return issues;
    };

    /**
     * Generate health report
     */
    const generateReport = () => {
        const memoryIssues = analyzeMemory(memory || '');
        const cardIssues = analyzeStoryCards(storyCards || []);

        let report = "📋 Memory Health Report\n\n";

        if (memoryIssues.length === 0 && cardIssues.length === 0) {
            report += "✓ No issues detected!";
            return report;
        }

        if (memoryIssues.length > 0) {
            report += "Memory Issues:\n";
            memoryIssues.forEach(i => {
                if (i.type === 'duplicate_sentence') {
                    report += `• Duplicate: "${i.text}"\n`;
                } else if (i.type === 'high_phrase_density') {
                    report += `• High phrase density: ${i.examples.map(e => e.gram).join(', ')}\n`;
                } else if (i.type === 'negative_instruction') {
                    report += `• ${i.note}\n`;
                }
            });
        }

        if (cardIssues.length > 0) {
            report += "\nStory Card Issues:\n";
            cardIssues.forEach(i => {
                if (i.type === 'duplicate_key') {
                    report += `• Duplicate key: "${i.key}"\n`;
                } else if (i.type === 'oversized_entry') {
                    report += `• Oversized: ${i.title} (${i.length} chars)\n`;
                } else if (i.type === 'cross_entry_repetition') {
                    report += `• Cross-entry repetition: ${i.examples.join(', ')}\n`;
                }
            });
        }

        return report;
    };

    return { analyzeMemory, analyzeStoryCards, generateReport };
})();
```

**Command Integration** (add to command processing in input modifier):
```javascript
// Add these cases to the existing command switch

case 'diversity':
case 'div':
    // Show diversity statistics
    const ds = state.diversity || {};
    state.message = `📊 Diversity Statistics\n` +
        `Current Score: ${Math.round((ds.lastDiversityScore || 1) * 100)}%\n` +
        `Session Average: ${Math.round((ds.avgScore || 1) * 100)}%\n` +
        `Blocked Phrases: ${(ds.blockedPhrases || []).length}\n` +
        `Intervention Level: ${ds.interventionLevel || 'none'}`;
    return { text: "", stop: true };

case 'health':
    // Memory and story card health check
    state.message = MemoryHealth.generateReport();
    return { text: "", stop: true };

case 'clearblocked':
    // Reset blocked phrase list
    if (state.diversity) {
        state.diversity.blockedPhrases = [];
    }
    state.message = "✓ Blocked phrase list cleared";
    return { text: "", stop: true };

case 'diversityreset':
case 'divreset':
    // Full diversity system reset
    state.diversity = {
        scoreHistory: [],
        avgScore: 1.0,
        blockedPhrases: [],
        rerollCount: 0,
        lastDiversityScore: 1.0,
        alertThreshold: 0.35,
        interventionLevel: 'none'
    };
    state.message = "✓ Diversity system reset";
    return { text: "", stop: true };

case 'threshold':
    // Adjust alert threshold
    const newThreshold = parseFloat(args[0]);
    if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 1) {
        if (state.diversity) {
            state.diversity.alertThreshold = newThreshold;
        }
        state.message = `✓ Alert threshold set to ${Math.round(newThreshold * 100)}%`;
    } else {
        state.message = "Usage: /threshold 0.35 (value between 0 and 1)";
    }
    return { text: "", stop: true };
```

---

### Phase 6: Context Diversity Pruning (Context Modifier)

**File:** `trinitycontext(1).js`
**Priority:** LOW
**Effort:** Medium

Add intelligent context pruning to remove repetitive content:

```javascript
// === CONTEXT DIVERSITY PRUNING ===
const diversityAwarePrune = (contextText, maxChars) => {
    if (contextText.length <= maxChars) return contextText;

    const ds = state.diversity;
    const outputHistory = (state.outputHistory || []).map(h => h.text || '').filter(t => t);

    // Split into paragraphs
    const paragraphs = contextText.split(/\n\n+/);

    // Score each paragraph
    const scored = paragraphs.map((para, idx) => {
        const recency = idx / paragraphs.length; // 0 = oldest, 1 = newest

        // Calculate repetition score against output history
        const diversityResult = DiversityEngine.calculateDiversityScore(para, outputHistory);
        const repScore = 1 - diversityResult.score;

        // Priority formula: recent + novel content wins
        // Lower score = higher priority to keep
        const priority = (1 - recency) * 0.4 + repScore * 0.6;

        return { para, idx, priority, length: para.length };
    });

    // Sort by priority (lower = keep)
    scored.sort((a, b) => a.priority - b.priority);

    // Always keep most recent 3 paragraphs
    const mustKeep = scored.filter(s => s.idx >= paragraphs.length - 3);
    const canPrune = scored.filter(s => s.idx < paragraphs.length - 3);

    let result = [];
    let charCount = mustKeep.reduce((sum, s) => sum + s.length + 4, 0); // +4 for \n\n

    // Add must-keep
    mustKeep.forEach(s => result.push(s));

    // Add others by priority until limit
    for (const item of canPrune) {
        if (charCount + item.length + 4 <= maxChars) {
            result.push(item);
            charCount += item.length + 4;
        }
    }

    // Restore original order
    result.sort((a, b) => a.idx - b.idx);

    const prunedText = result.map(r => r.para).join('\n\n');

    if (CONFIG.bonepoke.debugLogging && prunedText.length < contextText.length) {
        safeLog(`🗜️ Context pruned: ${contextText.length} → ${prunedText.length} chars`, 'info');
    }

    return prunedText;
};
```

**Integration Point** (add early in context modifier):
```javascript
// Apply diversity-aware pruning if context is too long
// Reserve 500 chars for injections (Author's Note, VS, blocked phrases)
const MAX_CONTEXT = 8000; // Adjust based on model limits
if (text.length > MAX_CONTEXT) {
    text = diversityAwarePrune(text, MAX_CONTEXT - 500);
}
```

---

### Phase 7: Configuration & Story Card UI

**File:** `trinitysharedLibrary(1).js`
**Priority:** LOW
**Effort:** Low

Add diversity configuration to existing SmartReplacementConfig pattern:

```javascript
// Add to CONFIG object
diversity: {
    enabled: true,
    alertThreshold: 0.35,      // Score below this triggers alerts
    autoBlockPhrases: true,    // Auto-add overlapping phrases to block list
    maxBlockedPhrases: 30,     // Max phrases to track
    contextPruningEnabled: false, // Enable context pruning (experimental)
    showFeedback: true,        // Show diversity feedback to user
    debugLogging: true
}
```

**Story Card Template:**
```javascript
const ensureDiversityConfigCard = () => {
    const existing = storyCards.find(c => c.keys && c.keys.includes('diversity_config'));
    if (existing) return false;

    const templateText =
`DIVERSITY CONFIGURATION
Toggle features on/off (true/false):

enabled: true
showFeedback: true
autoBlockPhrases: true
contextPruningEnabled: false

Alert threshold (0-1, lower = more sensitive):
alertThreshold: 0.35

Instructions:
- alertThreshold: 0.35 means alert when diversity < 35%
- autoBlockPhrases: automatically avoids repeated phrases
- contextPruningEnabled: experimental, removes repetitive context`;

    buildCard(
        'Diversity Config',
        templateText,
        'Custom',
        'diversity_config, diversity',
        'Configure diversity/mode-collapse prevention',
        105
    );

    safeLog('📝 Created Diversity Config card', 'success');
    return true;
};
```

---

## Implementation Order & Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION ROADMAP                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: DiversityEngine (Shared Library)                  │
│     ↓                                                       │
│  Phase 2: Enhanced VS Prompts (Context) ←──────────────┐    │
│     ↓                                                  │    │
│  Phase 3: Blocked Phrase Injection (Context) ──────────┤    │
│     ↓                                                  │    │
│  Phase 4: Output Diversity Analysis (Output) ──────────┘    │
│     ↓                                                       │
│  Phase 5: Memory Health Commands (Input)                    │
│     ↓                                                       │
│  Phase 6: Context Pruning (Context) [OPTIONAL]              │
│     ↓                                                       │
│  Phase 7: Config UI (Shared Library) [OPTIONAL]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Dependencies:**
- Phase 1 MUST be completed first (other phases depend on DiversityEngine)
- Phases 2-4 can be done in any order after Phase 1
- Phase 5 depends on Phase 1 (uses DiversityEngine.generateMeaningfulNgrams)
- Phases 6-7 are optional enhancements

---

## Testing Checklist

### Unit Tests (Manual)

- [ ] DiversityEngine.generateMeaningfulNgrams returns expected n-grams
- [ ] DiversityEngine.calculateDiversityScore returns 1.0 for unique text
- [ ] DiversityEngine.calculateDiversityScore returns <0.5 for highly repetitive text
- [ ] detectExactRepetition finds "test test" patterns
- [ ] detectStructuralRepetition finds repeated sentence starters

### Integration Tests

- [ ] `/div` command shows diversity statistics
- [ ] `/health` command shows memory analysis
- [ ] `/clearblocked` clears blocked phrase list
- [ ] Low diversity score triggers user feedback
- [ ] Blocked phrases appear in context injection
- [ ] VS prompts escalate when diversity is low

### End-to-End Tests

- [ ] Play 20+ turns and verify diversity tracking
- [ ] Intentionally create repetitive content, verify detection
- [ ] Verify blocked phrases reduce repetition
- [ ] Verify VS escalation improves diversity on retries

---

## Compatibility Notes

### AI Dungeon API Constraints

1. **Cannot modify sampling parameters** - Temperature, top-p, min-p are user-controlled
2. **No automatic retry** - Must suggest retry via `state.message`
3. **Limited state size** - Keep tracked data minimal
4. **Synchronous execution** - No async/await, setTimeout

### Existing System Integration

- **Bonepoke**: Diversity score should complement quality score (don't duplicate fatigue detection)
- **NGO**: Diversity data can inform pacing (high diversity = OK to escalate)
- **Smart Replacement**: Diversity-blocked phrases should feed into replacement system
- **Cross-output tracking**: Reuse existing `state.outputHistory` structure

---

## Expected Outcomes

### Quantitative

- Reduce phrase overlap between outputs by 40-60%
- Decrease user-initiated retries by 25-50%
- Maintain quality scores while improving diversity

### Qualitative

- More varied vocabulary and sentence structures
- Reduced narrative loops and repetitive patterns
- Clearer user feedback when diversity issues arise
- Better diagnostic tools for problematic content

---

## Safety Constraints & Memory Management

**CRITICAL**: All implementations MUST follow these patterns to prevent unbounded growth, ensure debuggability, and maintain system stability.

### Named Constants (Required)

All magic numbers MUST be defined as named constants at the top of the implementation:

```javascript
// === DIVERSITY SYSTEM CONSTANTS ===
// Memory management (prevent unbounded growth)
const MAX_DIVERSITY_SCORE_HISTORY = 20;      // Rolling window of scores
const MAX_BLOCKED_PHRASES = 30;              // Maximum phrases to track
const MAX_BLOCKED_PHRASES_INJECTED = 10;     // Max phrases sent to AI
const MAX_OVERLAPPING_PHRASES_LOGGED = 5;    // Limit for debug output

// Bounds (prevent exponential behavior)
const MIN_DIVERSITY_SCORE = 0.0;             // Floor for scores
const MAX_DIVERSITY_SCORE = 1.0;             // Ceiling for scores
const MIN_ALERT_THRESHOLD = 0.0;             // Minimum threshold setting
const MAX_ALERT_THRESHOLD = 1.0;             // Maximum threshold setting
const MAX_REROLL_COUNT = 10;                 // Cap reroll escalation

// Expiration (nothing held indefinitely)
const BLOCKED_PHRASE_TTL_TURNS = 15;         // Phrases expire after N turns
const DIVERSITY_PRUNE_INTERVAL = 25;         // Prune state every N turns
const INTERVENTION_DECAY_TURNS = 3;          // Reset intervention after good outputs

// Performance limits
const MAX_NGRAM_PROCESSING_LENGTH = 5000;    // Skip analysis for huge texts
const MAX_PARAGRAPHS_TO_SCORE = 50;          // Limit context pruning scope
```

### State Structure with TTL and Bounds

```javascript
// === DIVERSITY STATE INITIALIZATION (with safety features) ===
state.diversity = {
    // Scores (bounded 0-1, rolling window)
    scoreHistory: [],                        // Max: MAX_DIVERSITY_SCORE_HISTORY
    avgScore: 1.0,                           // Clamped to [0, 1]
    lastDiversityScore: 1.0,                 // Clamped to [0, 1]

    // Blocked phrases (with TTL)
    blockedPhrases: [],                      // Max: MAX_BLOCKED_PHRASES
    blockedPhraseTTLs: [],                   // Parallel array: turns until expiration

    // Counters (bounded)
    rerollCount: 0,                          // Max: MAX_REROLL_COUNT
    turnsSinceIntervention: 0,               // For intervention decay

    // Configuration (bounded)
    alertThreshold: 0.35,                    // Clamped to [0, 1]
    interventionLevel: 'none',               // Enum: none, nudge, intervene, escalate

    // Tracking (for debugging and pruning)
    lastPruneTime: 0,                        // Turn number of last prune
    totalAnalyses: 0,                        // Lifetime counter
    debugEnabled: true                       // Debug logging toggle
};
```

### Safe Score Calculation (with bounds)

```javascript
/**
 * Calculate diversity score with safety clamping
 * @returns {number} Score clamped to [0, 1]
 */
const calculateSafeDiversityScore = (newText, historyTexts) => {
    // Safety: Skip huge texts to prevent performance issues
    if (newText.length > MAX_NGRAM_PROCESSING_LENGTH) {
        safeLog(`⚠️ Text too long (${newText.length}), skipping detailed analysis`, 'warn');
        return { score: 0.7, overlap: 0, details: { skipped: true } };
    }

    const result = DiversityEngine.calculateDiversityScore(newText, historyTexts);

    // Clamp score to valid range
    result.score = Math.max(MIN_DIVERSITY_SCORE, Math.min(MAX_DIVERSITY_SCORE, result.score));

    // Limit overlapping phrases for memory efficiency
    if (result.details.overlappingPhrases) {
        result.details.overlappingPhrases = result.details.overlappingPhrases.slice(0, MAX_OVERLAPPING_PHRASES_LOGGED);
    }

    return result;
};
```

### Blocked Phrase Management (with TTL and pruning)

```javascript
/**
 * Add phrase to blocked list with TTL
 * Prevents unbounded growth and stale entries
 */
const addBlockedPhrase = (phrase) => {
    const ds = state.diversity;
    if (!ds) return;

    // Don't add duplicates
    if (ds.blockedPhrases.includes(phrase)) return;

    // Add with TTL
    ds.blockedPhrases.push(phrase);
    ds.blockedPhraseTTLs.push(BLOCKED_PHRASE_TTL_TURNS);

    // Enforce maximum size (remove oldest first)
    while (ds.blockedPhrases.length > MAX_BLOCKED_PHRASES) {
        ds.blockedPhrases.shift();
        ds.blockedPhraseTTLs.shift();
    }

    if (ds.debugEnabled) {
        safeLog(`🚫 Blocked phrase added: "${phrase}" (TTL: ${BLOCKED_PHRASE_TTL_TURNS})`, 'info');
    }
};

/**
 * Decrement TTLs and remove expired phrases
 * Call ONCE per turn in output modifier
 */
const tickBlockedPhraseTTLs = () => {
    const ds = state.diversity;
    if (!ds || !ds.blockedPhraseTTLs) return;

    const expiredCount = { count: 0 };

    // Decrement all TTLs
    ds.blockedPhraseTTLs = ds.blockedPhraseTTLs.map(ttl => ttl - 1);

    // Remove expired (TTL <= 0)
    const validIndices = [];
    ds.blockedPhraseTTLs.forEach((ttl, idx) => {
        if (ttl > 0) {
            validIndices.push(idx);
        } else {
            expiredCount.count++;
        }
    });

    if (expiredCount.count > 0) {
        ds.blockedPhrases = validIndices.map(i => ds.blockedPhrases[i]);
        ds.blockedPhraseTTLs = validIndices.map(i => ds.blockedPhraseTTLs[i]);

        if (ds.debugEnabled) {
            safeLog(`🗑️ Expired ${expiredCount.count} blocked phrases`, 'info');
        }
    }
};
```

### Periodic State Pruning

```javascript
/**
 * Prune diversity state to prevent unbounded growth
 * Call periodically (every DIVERSITY_PRUNE_INTERVAL turns)
 */
const pruneDiversityState = () => {
    const ds = state.diversity;
    if (!ds) return;

    const currentTurn = state.turnCount || 0;

    // Only prune at intervals
    if (currentTurn - ds.lastPruneTime < DIVERSITY_PRUNE_INTERVAL) return;

    ds.lastPruneTime = currentTurn;

    const prunedStats = {
        scoreHistory: 0,
        blockedPhrases: 0
    };

    // Prune score history to maximum
    while (ds.scoreHistory.length > MAX_DIVERSITY_SCORE_HISTORY) {
        ds.scoreHistory.shift();
        prunedStats.scoreHistory++;
    }

    // Prune blocked phrases to maximum (keep newest)
    while (ds.blockedPhrases.length > MAX_BLOCKED_PHRASES) {
        ds.blockedPhrases.shift();
        ds.blockedPhraseTTLs.shift();
        prunedStats.blockedPhrases++;
    }

    // Reset reroll count if too high (prevent infinite escalation)
    if (ds.rerollCount > MAX_REROLL_COUNT) {
        ds.rerollCount = MAX_REROLL_COUNT;
    }

    // Decay intervention level after consecutive good outputs
    if (ds.interventionLevel !== 'none' && ds.turnsSinceIntervention >= INTERVENTION_DECAY_TURNS) {
        ds.interventionLevel = 'none';
        ds.turnsSinceIntervention = 0;
        safeLog(`✅ Intervention level reset after ${INTERVENTION_DECAY_TURNS} good turns`, 'info');
    }

    if (ds.debugEnabled && (prunedStats.scoreHistory > 0 || prunedStats.blockedPhrases > 0)) {
        safeLog(`🧹 Diversity state pruned: ${prunedStats.scoreHistory} scores, ${prunedStats.blockedPhrases} phrases`, 'info');
    }
};
```

### Debug Logging Integration

```javascript
/**
 * Log diversity debug information
 * Respects CONFIG.diversity.debugLogging setting
 */
const logDiversityDebug = (message, level = 'info', forceLog = false) => {
    const ds = state.diversity;
    if (!forceLog && (!ds || !ds.debugEnabled)) return;
    if (!CONFIG.diversity || !CONFIG.diversity.debugLogging) return;

    safeLog(`[DIV] ${message}`, level);
};

/**
 * Generate comprehensive debug report
 * Called by /divdebug command
 */
const generateDiversityDebugReport = () => {
    const ds = state.diversity;
    if (!ds) return "Diversity system not initialized";

    return `📊 DIVERSITY DEBUG REPORT
═══════════════════════════════════
State:
  Last Score: ${(ds.lastDiversityScore * 100).toFixed(1)}%
  Avg Score: ${(ds.avgScore * 100).toFixed(1)}%
  Intervention: ${ds.interventionLevel}
  Reroll Count: ${ds.rerollCount}/${MAX_REROLL_COUNT}

Memory Usage:
  Score History: ${ds.scoreHistory.length}/${MAX_DIVERSITY_SCORE_HISTORY}
  Blocked Phrases: ${ds.blockedPhrases.length}/${MAX_BLOCKED_PHRASES}
  Last Prune: Turn ${ds.lastPruneTime}
  Total Analyses: ${ds.totalAnalyses}

Configuration:
  Alert Threshold: ${(ds.alertThreshold * 100).toFixed(0)}%
  Debug Enabled: ${ds.debugEnabled}
  Prune Interval: Every ${DIVERSITY_PRUNE_INTERVAL} turns

Blocked Phrases (with TTL):
${ds.blockedPhrases.slice(0, 10).map((p, i) =>
    `  ${i+1}. "${p}" (${ds.blockedPhraseTTLs[i]} turns left)`
).join('\n') || '  (none)'}
${ds.blockedPhrases.length > 10 ? `  ... and ${ds.blockedPhrases.length - 10} more` : ''}
═══════════════════════════════════`;
};
```

### Safe Array Operations

```javascript
/**
 * Safe array trimming (from OPTIMIZATIONS_APPLIED.md pattern)
 * Uses shift() instead of slice() for better performance
 */
const trimArrayToMax = (arr, maxLength) => {
    while (arr.length > maxLength) {
        arr.shift();
    }
    return arr;
};

/**
 * Safe score history update with bounds
 */
const updateScoreHistory = (score) => {
    const ds = state.diversity;
    if (!ds) return;

    // Clamp score
    const clampedScore = Math.max(MIN_DIVERSITY_SCORE, Math.min(MAX_DIVERSITY_SCORE, score));

    // Add to history
    ds.scoreHistory.push(clampedScore);

    // Trim to max (using efficient shift pattern)
    trimArrayToMax(ds.scoreHistory, MAX_DIVERSITY_SCORE_HISTORY);

    // Recalculate average
    ds.avgScore = ds.scoreHistory.length > 0
        ? ds.scoreHistory.reduce((a, b) => a + b, 0) / ds.scoreHistory.length
        : 1.0;

    // Clamp average
    ds.avgScore = Math.max(MIN_DIVERSITY_SCORE, Math.min(MAX_DIVERSITY_SCORE, ds.avgScore));
};
```

### Configuration Validation

```javascript
/**
 * Validate and clamp configuration values
 * Call on initialization and config changes
 */
const validateDiversityConfig = () => {
    const ds = state.diversity;
    if (!ds) return;

    // Clamp threshold to valid range
    ds.alertThreshold = Math.max(MIN_ALERT_THRESHOLD,
                                  Math.min(MAX_ALERT_THRESHOLD, ds.alertThreshold));

    // Validate intervention level
    const validLevels = ['none', 'monitor', 'nudge', 'intervene', 'escalate'];
    if (!validLevels.includes(ds.interventionLevel)) {
        ds.interventionLevel = 'none';
    }

    // Ensure arrays are initialized
    ds.scoreHistory = ds.scoreHistory || [];
    ds.blockedPhrases = ds.blockedPhrases || [];
    ds.blockedPhraseTTLs = ds.blockedPhraseTTLs || [];

    // Sync TTL array length with blocked phrases
    while (ds.blockedPhraseTTLs.length < ds.blockedPhrases.length) {
        ds.blockedPhraseTTLs.push(BLOCKED_PHRASE_TTL_TURNS);
    }
    while (ds.blockedPhraseTTLs.length > ds.blockedPhrases.length) {
        ds.blockedPhraseTTLs.pop();
    }
};
```

### Integration with Turn Processing

```javascript
// In output modifier, add these calls in sequence:

// 1. Tick TTLs (once per turn)
tickBlockedPhraseTTLs();

// 2. Run diversity analysis
const diversityAnalysis = analyzeDiversity(text);

// 3. Update state safely
updateScoreHistory(diversityAnalysis.score);

// 4. Increment analysis counter
state.diversity.totalAnalyses++;

// 5. Prune if interval reached
pruneDiversityState();

// 6. Track intervention decay
if (diversityAnalysis.score >= 0.65) {
    state.diversity.turnsSinceIntervention++;
} else {
    state.diversity.turnsSinceIntervention = 0;
}
```

### Additional Debug Commands

```javascript
// Add to command processing in input modifier:

case 'divdebug':
    // Comprehensive debug report
    state.message = generateDiversityDebugReport();
    return { text: "", stop: true };

case 'divlog':
    // Toggle debug logging
    if (state.diversity) {
        state.diversity.debugEnabled = !state.diversity.debugEnabled;
        state.message = `Diversity debug logging: ${state.diversity.debugEnabled ? 'ON' : 'OFF'}`;
    }
    return { text: "", stop: true };

case 'divprune':
    // Force immediate prune
    if (state.diversity) {
        state.diversity.lastPruneTime = 0; // Reset to force prune
        pruneDiversityState();
        state.message = "✓ Diversity state pruned";
    }
    return { text: "", stop: true };
```

---

## Comparison with Existing Best Practices

### Alignment with CODE_OPTIMIZATION_REPORT.md

| Existing Pattern | Blueprint Implementation | Status |
|-----------------|-------------------------|--------|
| Named constants (MAX_OUTPUT_HISTORY) | MAX_DIVERSITY_SCORE_HISTORY, etc. | ✅ Added |
| Array pruning with shift() | trimArrayToMax() function | ✅ Added |
| Memory pruning intervals | DIVERSITY_PRUNE_INTERVAL | ✅ Added |
| TypeScript references | Same pattern | ✅ Compatible |
| JSDoc annotations | All functions documented | ✅ Added |
| safeLog() usage | logDiversityDebug() wrapper | ✅ Added |

### Alignment with OPTIMIZATIONS_APPLIED.md

| Optimization | Blueprint Status |
|-------------|-----------------|
| Regex caching | Uses existing getCachedRegex() | ✅ Reuses |
| Bounded state growth | MAX constants + pruning | ✅ Added |
| Performance limits | MAX_NGRAM_PROCESSING_LENGTH | ✅ Added |
| Debug logging controls | debugEnabled flag | ✅ Added |
| Memory management constants | All magic numbers named | ✅ Added |

### Alignment with Scripting Guidebook.md

| Best Practice | Blueprint Status |
|--------------|-----------------|
| No async/setTimeout | All synchronous | ✅ Compliant |
| State persistence via state object | Uses state.diversity | ✅ Compliant |
| Modifier return pattern | Returns { text } | ✅ Compliant |
| Console logging via log() | Uses safeLog() | ✅ Compliant |
| Story card management | Uses buildCard() | ✅ Compliant |

---

## Summary of Safety Features Added

### Memory Management
- ✅ All arrays have maximum sizes
- ✅ Periodic pruning every 25 turns
- ✅ TTL expiration for blocked phrases (15 turns)
- ✅ No unbounded growth possible

### Bounds Checking
- ✅ All scores clamped to [0, 1]
- ✅ Configuration values validated
- ✅ Reroll counter capped at 10
- ✅ Text length limits for performance

### Debugging Tools
- ✅ `/divdebug` - Comprehensive state report
- ✅ `/divlog` - Toggle debug logging
- ✅ `/divprune` - Force state cleanup
- ✅ All operations logged when debug enabled

### Expiration/Decay
- ✅ Blocked phrases expire after 15 turns
- ✅ Intervention level decays after 3 good outputs
- ✅ State pruned at regular intervals
- ✅ Nothing held indefinitely

---

## Future Enhancements

1. **Machine Learning Integration**: Track which interventions work best per user
2. **Model-Specific Profiles**: Different thresholds for Wayfarer vs DeepSeek
3. **Collaborative Filtering**: Learn from community about problematic phrases
4. **Automatic Memory Cleanup**: Suggest Memory edits to reduce repetition sources
