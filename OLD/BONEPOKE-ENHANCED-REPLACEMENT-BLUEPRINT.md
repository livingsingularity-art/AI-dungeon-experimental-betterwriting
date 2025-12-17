# Bonepoke-Enhanced Word Replacement Blueprint

**Objective**: Use Bonepoke quality scores to intelligently select better word replacements instead of random synonym selection.

---

## 📋 Current System Analysis

### Current Replacement Flow
```
1. Bonepoke detects fatigue (repeated words)
2. getSynonym() called with fatigued word
3. Random synonym selected from SYNONYM_MAP
4. Replacement applied
```

### Current Limitations
❌ **No quality awareness**: Random selection doesn't consider what's wrong with the output
❌ **No context sensitivity**: Doesn't know if we need emotion, precision, or simplicity
❌ **No validation**: Doesn't check if replacement actually improves quality
❌ **One-size-fits-all**: Same strategy regardless of what dimension scored low

---

## 🎯 Enhanced System Architecture

### Core Concept: Dimension-Aware Replacement

Each Bonepoke dimension requires different replacement strategies:

| Dimension | Score | Replacement Strategy |
|-----------|-------|---------------------|
| **Emotional Strength** | Low (1-2) | Choose EVOCATIVE synonyms (strong connotations) |
| **Story Flow** | Low (1-2) | Choose TRANSITIONAL synonyms (flow words) |
| **Character Clarity** | Low (1-2) | Choose SPECIFIC synonyms (precise actions) |
| **Dialogue Weight** | Low (1-2) | Choose SPEECH-VERB synonyms (said → murmured) |
| **Word Variety** | Low (1-2) | Choose ANY synonym (fatigue correction) |

---

## 🔧 Implementation Design

### Phase 1: Synonym Categorization System

**Add metadata to SYNONYM_MAP**:

```javascript
const ENHANCED_SYNONYM_MAP = {
    'walked': {
        synonyms: [
            { word: 'strolled', tags: ['neutral', 'relaxed'], emotion: 2 },
            { word: 'marched', tags: ['purposeful', 'strong'], emotion: 4 },
            { word: 'trudged', tags: ['weary', 'negative'], emotion: 4 },
            { word: 'strode', tags: ['confident', 'powerful'], emotion: 3 },
            { word: 'shuffled', tags: ['tired', 'slow'], emotion: 3 },
            { word: 'sauntered', tags: ['casual', 'leisurely'], emotion: 3 }
        ],
        // Metadata for smart selection
        base_emotion: 1,  // Base word has minimal emotion
        precision: 2,     // Generic verb (low precision)
        dialogue_verb: false
    },

    'said': {
        synonyms: [
            { word: 'murmured', tags: ['quiet', 'intimate'], emotion: 3, dialogue: true },
            { word: 'shouted', tags: ['loud', 'intense'], emotion: 5, dialogue: true },
            { word: 'whispered', tags: ['quiet', 'secretive'], emotion: 4, dialogue: true },
            { word: 'declared', tags: ['formal', 'firm'], emotion: 3, dialogue: true },
            { word: 'muttered', tags: ['quiet', 'annoyed'], emotion: 3, dialogue: true }
        ],
        base_emotion: 1,
        precision: 1,
        dialogue_verb: true
    }
};
```

**Tagging System**:
- `emotion`: 1-5 scale (1=neutral, 5=highly evocative)
- `precision`: 1-5 scale (1=generic, 5=very specific)
- `dialogue`: true/false (usable in dialogue tags)
- `tags`: Array of descriptive tags for context matching

---

### Phase 2: Intelligent Synonym Selector

**New function: `getSmartSynonym()`**

```javascript
/**
 * Select synonym based on Bonepoke analysis context
 * @param {string} word - Word to replace
 * @param {Object} bonepokeScores - Current Bonepoke scores
 * @param {string} context - Surrounding text for context awareness
 * @returns {string} Best replacement synonym
 */
const getSmartSynonym = (word, bonepokeScores, context = '') => {
    const lower = word.toLowerCase();
    const wordData = ENHANCED_SYNONYM_MAP[lower];

    if (!wordData || !wordData.synonyms) {
        return getSynonym(word); // Fallback to random
    }

    // STEP 1: Identify weakest dimension
    const weakestDimension = Object.entries(bonepokeScores)
        .sort((a, b) => a[1] - b[1])[0];

    const [dimension, score] = weakestDimension;

    // STEP 2: Filter synonyms based on dimension needs
    let candidates = wordData.synonyms;

    switch(dimension) {
        case 'Emotional Strength':
            // Need HIGH emotion words when emotion is weak
            if (score <= 2) {
                candidates = candidates.filter(s => s.emotion >= 3);
            }
            break;

        case 'Character Clarity':
            // Need HIGH precision words when clarity is weak
            if (score <= 2) {
                candidates = candidates.filter(s => s.precision >= 3);
            }
            break;

        case 'Dialogue Weight':
            // Need dialogue verbs when dialogue is weak
            if (score <= 2 && wordData.dialogue_verb) {
                candidates = candidates.filter(s => s.dialogue === true);
            }
            break;

        case 'Word Variety':
            // Any synonym works - just avoid repetition
            // Keep all candidates
            break;

        case 'Story Flow':
            // Need transitional/flow words
            // Could add flow-specific tags in future
            break;
    }

    // STEP 3: Context matching (advanced)
    if (context) {
        candidates = scoreContextMatch(candidates, context);
    }

    // STEP 4: Select best candidate
    if (candidates.length === 0) {
        candidates = wordData.synonyms; // Fallback to all
    }

    // Weight selection toward higher-scored candidates
    const selected = weightedRandomSelection(candidates);

    return selected.word;
};
```

---

### Phase 3: Replacement Validation System

**Validate replacements improve quality**:

```javascript
/**
 * Test if replacement actually improves output
 * @param {string} original - Original text
 * @param {string} replaced - Text with replacement
 * @returns {boolean} True if replacement is better
 */
const validateReplacement = (original, replaced) => {
    // Quick analysis on both versions
    const originalAnalysis = BonepokeAnalysis.analyze(original);
    const replacedAnalysis = BonepokeAnalysis.analyze(replaced);

    // Replacement is valid if:
    // 1. Average score improved OR stayed same
    // 2. No new contradictions introduced
    // 3. Fatigue count decreased

    const scoreImproved = replacedAnalysis.avgScore >= originalAnalysis.avgScore;
    const noNewContradictions =
        replacedAnalysis.composted.contradictions.length <=
        originalAnalysis.composted.contradictions.length;
    const fatigueReduced =
        Object.keys(replacedAnalysis.composted.fatigue).length <
        Object.keys(originalAnalysis.composted.fatigue).length;

    return scoreImproved && noNewContradictions && fatigueReduced;
};
```

---

### Phase 4: Multi-Pass Replacement Strategy

**Iterative improvement approach**:

```javascript
/**
 * Apply smart replacements with validation
 */
const applySmartReplacements = (text, analysis) => {
    if (!analysis || !analysis.composted.fatigue) return text;

    let improvedText = text;
    const replacements = [];

    // Get fatigued words sorted by count (worst first)
    const fatigued = Object.entries(analysis.composted.fatigue)
        .sort((a, b) => b[1] - a[1]);

    fatigued.forEach(([word, count]) => {
        // Get smart synonym based on weakest dimension
        const synonym = getSmartSynonym(word, analysis.scores, improvedText);

        if (synonym === word) return; // No synonym available

        // Create candidate replacement
        const pattern = `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
        const regex = new RegExp(pattern, 'gi');
        const candidate = improvedText.replace(regex, synonym);

        // Validate replacement improves quality
        if (validateReplacement(improvedText, candidate)) {
            improvedText = candidate;
            replacements.push({
                original: word,
                replacement: synonym,
                reason: getReplacementReason(analysis.scores)
            });
        }
    });

    // Log what was improved and why
    if (replacements.length > 0) {
        replacements.forEach(r => {
            safeLog(`🎯 ${r.original} → ${r.replacement} (${r.reason})`, 'info');
        });
    }

    return improvedText;
};

/**
 * Explain WHY this replacement was chosen
 */
const getReplacementReason = (scores) => {
    const weakest = Object.entries(scores)
        .sort((a, b) => a[1] - b[1])[0];

    const reasons = {
        'Emotional Strength': 'boosting emotion',
        'Character Clarity': 'improving precision',
        'Dialogue Weight': 'enhancing dialogue',
        'Word Variety': 'reducing repetition',
        'Story Flow': 'improving flow'
    };

    return reasons[weakest[0]] || 'improving quality';
};
```

---

## 📊 Synonym Categorization Guide

### Emotion Scale (1-5)

**Level 1 - Neutral** (no emotional weight)
- walked, went, said, looked

**Level 2 - Mild** (slight connotation)
- strolled, mentioned, glanced

**Level 3 - Moderate** (clear connotation)
- strode, declared, gazed, trembled

**Level 4 - Strong** (powerful connotation)
- trudged, whispered, glared, shuddered

**Level 5 - Intense** (maximum emotional impact)
- staggered, shrieked, pierced, convulsed

### Precision Scale (1-5)

**Level 1 - Generic** (could mean many things)
- thing, stuff, went, did

**Level 2 - Basic** (general category)
- walked, said, looked

**Level 3 - Specific** (clear meaning)
- strolled, murmured, glanced

**Level 4 - Precise** (very specific action)
- sauntered, whispered, scrutinized

**Level 5 - Exact** (one specific meaning)
- genuflected, genuflected, ogled

### Context Tags

**Movement verbs**:
- `slow`, `fast`, `tired`, `energetic`, `purposeful`, `casual`

**Speech verbs**:
- `quiet`, `loud`, `emotional`, `neutral`, `formal`, `casual`

**Emotional verbs**:
- `positive`, `negative`, `neutral`, `intense`, `mild`

---

## 🔄 Integration with Existing System

### Modified output.js Flow

```javascript
// === MODE 3: SMART Auto-replace with Bonepoke awareness ===
if (analysis && analysis.composted.fatigue) {
    // NEW: Use smart replacement instead of random
    const smartText = applySmartReplacements(text, analysis);

    if (smartText !== text) {
        text = smartText;
        // Logging handled by applySmartReplacements
    }
}

// User REPLACER card still overrides everything (MODE 4)
```

### Backward Compatibility

**Graceful degradation**:
1. If `ENHANCED_SYNONYM_MAP` not available → fallback to `getSynonym()`
2. If validation fails → keep original text (safe default)
3. If no Bonepoke scores → use random selection
4. User's REPLACER card always has final say

---

## 🎯 Expected Improvements

### Quantitative Goals

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Avg Bonepoke Score | 3.2 | 3.8 | +18% |
| Emotional Strength | 2.5 | 3.5 | +40% |
| Character Clarity | 3.0 | 4.0 | +33% |
| Failed Replacements | ~30% | ~10% | -67% |

### Qualitative Benefits

✅ **Context-aware**: Replacements match narrative needs
✅ **Quality-driven**: Only apply changes that improve scores
✅ **Transparent**: Log shows WHY each replacement was chosen
✅ **Adaptive**: Learns from Bonepoke what needs improvement

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Design enhanced synonym data structure
- [ ] Add emotion/precision metadata to top 50 words
- [ ] Implement `getSmartSynonym()` core logic
- [ ] Unit tests for synonym selection

### Phase 2: Validation (Week 2)
- [ ] Implement `validateReplacement()` function
- [ ] Add replacement success/failure tracking
- [ ] Test on sample outputs
- [ ] Tune emotion/precision thresholds

### Phase 3: Full Integration (Week 3)
- [ ] Expand metadata to all 200+ words in SYNONYM_MAP
- [ ] Integrate with output.js replacement system
- [ ] Add comprehensive logging
- [ ] Performance optimization

### Phase 4: Advanced Features (Week 4)
- [ ] Context matching (surrounding sentence analysis)
- [ ] Multi-word phrase replacement intelligence
- [ ] Adaptive learning (track which replacements work best)
- [ ] User-configurable strictness levels

### Phase 5: Polish (Week 5)
- [ ] Documentation and examples
- [ ] Configuration UI (via story cards)
- [ ] A/B testing with real stories
- [ ] Community feedback integration

---

## 🔧 Configuration Options

### New CONFIG section

```javascript
const CONFIG = {
    // ... existing config ...

    smartReplacement: {
        enabled: true,

        // Minimum score to trigger dimension-specific replacement
        emotionThreshold: 2,        // Boost emotion if < 2
        precisionThreshold: 2,      // Boost precision if < 2

        // Validation settings
        requireImprovement: true,   // Only apply if scores improve
        allowSameScore: true,       // OK if score stays same

        // Strategy weights
        emotionWeight: 1.5,         // Prioritize emotion 1.5x
        precisionWeight: 1.0,
        varietyWeight: 0.8,

        // Fallback behavior
        fallbackToRandom: true,     // Use random if smart fails

        // Debug
        debugLogging: false,
        logReplacementReasons: true  // Show WHY in logs
    }
};
```

---

## 📝 Example Scenarios

### Scenario 1: Low Emotional Strength

**Input**:
```
She walked to the door. "Hello," she said quietly.
```

**Bonepoke Analysis**:
- Emotional Strength: 2 (LOW ← needs improvement)
- Word Variety: 4
- Character Clarity: 3

**Smart Replacement**:
```
She trudged to the door. "Hello," she whispered.
```

**Why**:
- `walked` → `trudged` (emotion: 4, adds weariness)
- `said quietly` → `whispered` (emotion: 4, more evocative)

**Result**: Emotional Strength → 4 ✅

---

### Scenario 2: Low Character Clarity

**Input**:
```
He moved quickly and did something with the thing.
```

**Bonepoke Analysis**:
- Character Clarity: 1 (LOW ← needs improvement)
- Emotional Strength: 3

**Smart Replacement**:
```
He darted forward and manipulated the device.
```

**Why**:
- `moved` → `darted` (precision: 4, specific movement)
- `did` → `manipulated` (precision: 4, specific action)
- `thing` → `device` (precision: 3, more specific noun)

**Result**: Character Clarity → 3 ✅

---

### Scenario 3: Validation Prevents Bad Replacement

**Input**:
```
The ancient wizard spoke the sacred words.
```

**Candidate Replacement**:
```
The ancient wizard verbalized the sacred words.
```

**Validation Check**:
- Original score: 4.2
- Replacement score: 3.8 (WORSE - "verbalized" is clinical)
- ❌ Rejected - keep original

**Result**: Original text preserved ✅

---

## 🎓 Advanced: Machine Learning Extension

### Future Enhancement: Learn from Success

```javascript
/**
 * Track which replacements work best over time
 */
const trackReplacementSuccess = (original, replacement, scoreDelta) => {
    state.replacementStats = state.replacementStats || {};

    const key = `${original}→${replacement}`;
    state.replacementStats[key] = state.replacementStats[key] || {
        attempts: 0,
        successes: 0,
        avgScoreDelta: 0
    };

    const stats = state.replacementStats[key];
    stats.attempts++;

    if (scoreDelta > 0) {
        stats.successes++;
    }

    // Running average of score improvement
    stats.avgScoreDelta =
        (stats.avgScoreDelta * (stats.attempts - 1) + scoreDelta) /
        stats.attempts;
};

/**
 * Use historical success to weight selection
 */
const getHistoricalWeight = (original, replacement) => {
    const key = `${original}→${replacement}`;
    const stats = state.replacementStats?.[key];

    if (!stats || stats.attempts < 3) {
        return 1.0; // No data yet
    }

    // Weight by success rate and avg improvement
    const successRate = stats.successes / stats.attempts;
    const improvement = Math.max(0, stats.avgScoreDelta);

    return successRate * (1 + improvement);
};
```

---

## 🚫 Common Pitfalls to Avoid

### ❌ Anti-Pattern 1: Over-correction
**Wrong**: Replace every low-emotion word with maximum emotion
```
She staggered to the portal and shrieked, "Greetings!"
```
**Right**: Boost emotion gradually, preserve tone
```
She strode to the door and called, "Hello!"
```

### ❌ Anti-Pattern 2: Ignoring Context
**Wrong**: Always pick highest-scored synonym
```
The spy sauntered stealthily through enemy territory.
```
(Sauntered = casual, contradicts stealth)

**Right**: Match context and tone
```
The spy crept stealthily through enemy territory.
```

### ❌ Anti-Pattern 3: Validation Too Strict
**Wrong**: Reject if score doesn't improve by +0.5
(Results in zero replacements)

**Right**: Accept if score improves OR stays same
(Variety improvement is still valuable)

---

## 📚 References

- **Current Implementation**: `/scripts/output.js` lines 375-437
- **Synonym Map**: `/scripts/sharedLibrary.js` lines 450-670
- **Bonepoke Analysis**: `/scripts/sharedLibrary.js` lines 1354-1439
- **Best Practices**: `/scripts/BEST_PRACTICES.md`

---

## ✅ Success Criteria

Implementation is successful when:

1. ✅ Average Bonepoke score increases by 15%+
2. ✅ Dimension-specific improvements visible (emotion, clarity, etc.)
3. ✅ Zero degraded outputs (validation prevents bad replacements)
4. ✅ Transparent logging shows improvement reasoning
5. ✅ User can toggle smart replacement on/off via CONFIG
6. ✅ Backward compatible with existing system
7. ✅ Performance impact < 50ms per output

---

**Blueprint Version**: 1.0
**Author**: AI Dungeon Enhancement Project
**Status**: Design Complete - Ready for Implementation
