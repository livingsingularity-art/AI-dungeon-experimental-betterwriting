# Trinity Story Cards Analysis Report
**Date:** 2025-01-18
**Session:** claude/narrative-trinity-integration-01MBBddz3X8QNdFhNdxs1Z5q

---

## Executive Summary

**User Report:** "Only One story card the Configure Auto-Cards story card is being produced"

**Analysis Findings:**
1. ✅ **4 cards ARE being created** (logs confirm success)
2. ❌ **SmartReplacementConfig card uses wrong API** (missing proper title/metadata)
3. ❌ **52% of synonyms missing Bonepoke scores** (124/238 coverage)
4. ❌ **Missing synonyms for 'station' and 'never'**
5. ❌ **No context-aware fatigue retention logic**

---

## 1. Story Card Creation Analysis

### Cards Currently Being Created

According to the logs, **4 cards are successfully created**:

```
✅ 📝 Created PRECISE word bank card
✅ 📝 Created AGGRESSIVE word bank card
✅ 📝 Created REPLACER word bank card
✅ 📝 PlayersAuthorsNote card created - edit to add your custom guidance
```

### Card Initialization Code

**Location:** `trinitysharedLibrary(1).js:5110-5122`

```javascript
// Ensure VS card exists
if (CONFIG.vs.enabled) {
    VerbalizedSampling.ensureCard();
}

// Ensure all word bank template cards exist
ensureBannedWordsCard();   // PRECISE removal
ensureAggressiveCard();     // AGGRESSIVE sentence removal
ensureReplacerCard();       // REPLACER synonyms

// Ensure PlayersAuthorsNote card exists
if (CONFIG.ngo.enabled) {
    PlayersAuthorsNoteCard.ensureCard();
}
```

### Card Details

| Card Name | Function | Keys | Status |
|-----------|----------|------|--------|
| **Word Bank - PRECISE** | Remove specific phrases from within sentences | `banned_words precise_removal` | ✅ Created |
| **Word Bank - AGGRESSIVE** | Remove entire sentences containing phrases | `aggressive_removal banned_sentences` | ✅ Created |
| **Word Bank - REPLACER** | Word-to-word synonym replacements | `word_replacer synonyms` | ✅ Created |
| **PlayersAuthorsNote** | Player-editable author's note injection | (none - always active) | ✅ Created |
| **Smart Replacement Config** | Feature toggles and settings | `smart_replacement_config` | ⚠️ **BROKEN** |

---

## 2. Root Cause: SmartReplacementConfig Card Creation Bug

### The Problem

**Location:** `trinitysharedLibrary(1).js:552-578`

The `SmartReplacementConfig.createDefaultCard()` function uses the **low-level `addStoryCard()` API** instead of the proper `buildCard()` wrapper:

```javascript
const createDefaultCard = () => {
    const defaultConfig = `SMART REPLACEMENT CONFIGURATION
Toggle features on/off (true/false):
...`;

    // ❌ WRONG API - doesn't set title, type, or description properly
    addStoryCard(CARD_KEY, defaultConfig, ['smart_replacement', 'config']);
    return storyCards.find(c => c.keys && c.keys.includes(CARD_KEY));
};
```

### Why This Causes Issues

The `addStoryCard()` function is a **raw AI Dungeon runtime API** that:
- Only sets raw entry content and keys
- **Does NOT set `card.title`** (the display name users see)
- **Does NOT set `card.type`** (Custom, etc.)
- **Does NOT set `card.description`** (tooltip text)

### What Should Happen

All other cards use the `buildCard()` wrapper which properly sets all metadata:

```javascript
// ✅ CORRECT - How other cards do it
const templateCard = buildCard(
    'Word Bank - PRECISE',        // title (what users see)
    templateText,                  // entry content
    'Custom',                      // type
    'banned_words precise_removal', // keys
    'Phrases removed from AI output (just the phrase)', // description
    100                            // insertion index
);
```

### Impact

**Users likely see:**
- A card with **no proper title** or a raw key string instead of "Configure Auto-Cards"
- Missing description/tooltip
- Card may appear broken or unlabeled in the UI

This explains why the user reports **"only one card"** - the SmartReplacementConfig card exists but **isn't visible or recognizable** in the UI.

---

## 3. Missing Synonym Coverage Analysis

### Coverage Statistics

| Metric | Value |
|--------|-------|
| **SYNONYM_MAP entries** | 238 |
| **ENHANCED_SYNONYM_MAP entries** | 124 |
| **Coverage percentage** | **52%** |
| **Missing Bonepoke scores** | **114 entries** |

### What This Means

**114 words/phrases** (48%) will use **random synonym selection** instead of Bonepoke-aware smart replacement:

- No emotion matching (can replace sad words with happy synonyms)
- No precision matching (can replace technical terms with vague ones)
- No context awareness (can replace formal words with casual ones)
- No quality scoring (can downgrade writing quality)

### Critically Missing Synonyms

From the latest log analysis:

| Word | Log Occurrences | Impact |
|------|----------------|--------|
| **station** | Turns 2, 5 (2 warnings) | Word Variety: 1/5 |
| **never** | Turn 6 (1 warning) | Word Variety: 1/5 |

**Both words:**
- ❌ NOT in SYNONYM_MAP (no replacements available)
- ❌ NOT in ENHANCED_SYNONYM_MAP (no Bonepoke scores)
- ⚠️ Kept in text with quality penalty ("kept in text")

---

## 4. Context-Aware Fatigue Retention

### Current Behavior

When a word is fatigued but **no synonym exists**:
```
⚠️ 📝 Needs synonym: station (kept in text)
```

**Problem:** The system has **NO LOGIC** to evaluate:
- "Is this repetition intentional/stylistic?"
- "Is this word the BEST choice despite fatigue?"
- "Would a synonym actually hurt quality?"

### What's Needed

The user requested:
> "all synonyms should have bonepoke scores to help the engine decide the best word to replace fatigued words or phrases **with the option to keep a fatigued word or phrase as it may be the best choice given the context.**"

**Required Logic:**
1. Run Bonepoke analysis on current word/phrase
2. Run Bonepoke analysis on potential synonyms
3. **Compare scores**
4. **KEEP original** if:
   - Original scores higher than all synonyms
   - Synonym would break context (tone/mood mismatch)
   - Synonym would reduce precision/clarity

**Example Scenario:**
```
Original: "the station loomed ahead"
Fatigue: HIGH (used 3 times)
Synonym options: "outpost", "facility", "platform"

Bonepoke Analysis:
- "station" in this sentence: Precision=5, Emotion=3 → Score=4.0
- "outpost" alternative: Precision=3, Emotion=3 → Score=3.0
- "facility" alternative: Precision=2, Emotion=1 → Score=1.5
- "platform" alternative: Precision=3, Emotion=2 → Score=2.5

Decision: KEEP "station" - higher quality despite fatigue
```

---

## 5. Recommended Fixes

### Priority 1: Fix SmartReplacementConfig Card Creation

**File:** `trinitysharedLibrary(1).js:552-578`

**Change:**
```javascript
const createDefaultCard = () => {
    const defaultConfig = `SMART REPLACEMENT CONFIGURATION
Toggle features on/off (true/false):

enabled: true
enableValidation: true
enableContextMatching: true
enableAdaptiveLearning: true
enablePhraseIntelligence: true
preventNewContradictions: true
validationStrict: false
debugLogging: false
logReplacementReasons: true
logValidation: false

Strictness preset (conservative/balanced/aggressive):
preset: balanced

Instructions:
- Change 'true' to 'false' to disable features
- Change 'false' to 'true' to enable features
- Change preset to: conservative, balanced, or aggressive
- Save card and refresh story to apply changes`;

    // ✅ USE buildCard() instead of addStoryCard()
    const card = buildCard(
        'Configure Auto-Cards',  // User-friendly title
        defaultConfig,           // Entry content
        'Custom',                // Type
        'smart_replacement_config', // Keys
        'Configure Trinity smart replacement features and strictness',
        50  // Insert after word banks but before PlayersAuthorsNote
    );

    safeLog('📝 Created Configure Auto-Cards story card', 'success');
    return card;
};
```

**Impact:** Card will be properly visible with title "Configure Auto-Cards"

---

### Priority 2: Add Missing Synonyms with Bonepoke Scores

#### Add 'station' Synonyms

**SYNONYM_MAP addition (after line 1206):**
```javascript
'ship': ['vessel', 'craft', 'spacecraft', 'rocket', 'hull'],
'station': ['outpost', 'facility', 'platform', 'base', 'depot', 'installation'],
```

**ENHANCED_SYNONYM_MAP addition (after line 2560):**
```javascript
'ship': {
    synonyms: [
        { word: 'vessel', emotion: 2, precision: 4, tags: ['formal', 'nautical'] },
        { word: 'craft', emotion: 2, precision: 4, tags: ['technical', 'neutral'] },
        { word: 'spacecraft', emotion: 2, precision: 5, tags: ['scifi', 'technical'] },
        { word: 'rocket', emotion: 3, precision: 4, tags: ['action', 'scifi'] },
        { word: 'hull', emotion: 2, precision: 5, tags: ['technical', 'part-for-whole'] }
    ],
    baseEmotion: 1, basePrecision: 2
},

'station': {
    synonyms: [
        { word: 'outpost', emotion: 3, precision: 4, tags: ['frontier', 'isolated', 'scifi'] },
        { word: 'facility', emotion: 1, precision: 3, tags: ['technical', 'neutral', 'formal'] },
        { word: 'platform', emotion: 2, precision: 4, tags: ['technical', 'industrial', 'scifi'] },
        { word: 'base', emotion: 2, precision: 3, tags: ['military', 'neutral'] },
        { word: 'depot', emotion: 2, precision: 4, tags: ['industrial', 'supply'] },
        { word: 'installation', emotion: 2, precision: 4, tags: ['formal', 'technical', 'military'] }
    ],
    baseEmotion: 1, basePrecision: 3
}
```

#### Add 'never' Synonyms

**SYNONYM_MAP addition (after 'station'):**
```javascript
'station': ['outpost', 'facility', 'platform', 'base', 'depot', 'installation'],
'never': ['not once', 'not ever', 'at no time', 'under no circumstances'],
```

**ENHANCED_SYNONYM_MAP addition (after 'station'):**
```javascript
'station': {
    synonyms: [
        { word: 'outpost', emotion: 3, precision: 4, tags: ['frontier', 'isolated', 'scifi'] },
        { word: 'facility', emotion: 1, precision: 3, tags: ['technical', 'neutral', 'formal'] },
        { word: 'platform', emotion: 2, precision: 4, tags: ['technical', 'industrial', 'scifi'] },
        { word: 'base', emotion: 2, precision: 3, tags: ['military', 'neutral'] },
        { word: 'depot', emotion: 2, precision: 4, tags: ['industrial', 'supply'] },
        { word: 'installation', emotion: 2, precision: 4, tags: ['formal', 'technical', 'military'] }
    ],
    baseEmotion: 1, basePrecision: 3
},

'never': {
    synonyms: [
        { word: 'not once', emotion: 3, precision: 4, tags: ['emphatic', 'definite'] },
        { word: 'not ever', emotion: 2, precision: 3, tags: ['formal', 'definite'] },
        { word: 'at no time', emotion: 2, precision: 4, tags: ['formal', 'precise'] },
        { word: 'under no circumstances', emotion: 3, precision: 5, tags: ['emphatic', 'formal', 'absolute'] }
    ],
    baseEmotion: 2, basePrecision: 3
}
```

---

### Priority 3: Implement Context-Aware Fatigue Retention

**New Function:** `shouldKeepFatiguedWord()`

**Location:** After `getSmartSynonym()` function

**Implementation:**
```javascript
/**
 * Determine if a fatigued word should be kept based on quality analysis
 * @param {string} word - The fatigued word
 * @param {string} sentence - The full sentence containing the word
 * @param {Object} contextData - Context analysis (mood, pacing, formality)
 * @returns {Object} { keep: boolean, reason: string, originalScore: number, bestSynonymScore: number }
 */
const shouldKeepFatiguedWord = (word, sentence, contextData) => {
    const lower = word.toLowerCase();
    const enhanced = ENHANCED_SYNONYM_MAP[lower];

    // If no Bonepoke-scored synonyms exist, must keep original
    if (!enhanced || !enhanced.synonyms || enhanced.synonyms.length === 0) {
        return {
            keep: true,
            reason: 'No Bonepoke-scored synonyms available',
            originalScore: null,
            bestSynonymScore: null
        };
    }

    // Score the ORIGINAL word in context
    const originalWithContext = sentence; // Keep original sentence
    const originalAnalysis = BonepokeAnalysis.analyze(originalWithContext);
    const originalScore = originalAnalysis.avgScore;

    // Score each SYNONYM alternative in context
    let bestSynonym = null;
    let bestScore = -1;

    enhanced.synonyms.forEach(syn => {
        // Replace word with synonym in sentence
        const synSentence = sentence.replace(new RegExp(`\\b${word}\\b`, 'gi'), syn.word);
        const synAnalysis = BonepokeAnalysis.analyze(synSentence);
        const synScore = synAnalysis.avgScore;

        if (synScore > bestScore) {
            bestScore = synScore;
            bestSynonym = syn.word;
        }
    });

    // DECISION LOGIC
    const scoreDelta = bestScore - originalScore;
    const threshold = 0.3; // Synonym must be 0.3+ points better to replace

    if (scoreDelta > threshold) {
        return {
            keep: false,
            reason: `Synonym "${bestSynonym}" improves quality (+${scoreDelta.toFixed(2)})`,
            originalScore: originalScore,
            bestSynonymScore: bestScore,
            bestSynonym: bestSynonym
        };
    } else {
        return {
            keep: true,
            reason: `Original word maintains best quality (delta: ${scoreDelta.toFixed(2)})`,
            originalScore: originalScore,
            bestSynonymScore: bestScore
        };
    }
};
```

**Integration Point:**

Modify the smart replacement logic to call this function before replacing:

```javascript
// Before replacement:
const fatigueCheck = shouldKeepFatiguedWord(fatiggedWord, sentence, contextData);

if (fatigueCheck.keep) {
    if (CONFIG.smartReplacement.logReplacementReasons) {
        safeLog(`✋ Kept fatigued word "${fatiggedWord}": ${fatigueCheck.reason}`, 'info');
    }
    // Don't replace - keep original
} else {
    // Proceed with replacement using fatigueCheck.bestSynonym
    if (CONFIG.smartReplacement.logReplacementReasons) {
        safeLog(`🔄 Replaced "${fatiggedWord}" → "${fatigueCheck.bestSynonym}": ${fatigueCheck.reason}`, 'info');
    }
}
```

---

### Priority 4: Audit and Fill SYNONYM_MAP Coverage Gaps

**Goal:** Increase coverage from 52% to 90%+

**Process:**
1. Extract all SYNONYM_MAP entries (238 total)
2. Extract all ENHANCED_SYNONYM_MAP entries (124 total)
3. Identify 114 missing entries
4. Prioritize by:
   - Frequency of use (common words first)
   - Log warnings (words actually causing issues)
   - Writing impact (high-impact words)
5. Add Bonepoke scores to top 50-75 missing entries

**Top Priority Words** (based on common usage):
- Adverbs: 'slowly', 'quickly', 'finally', etc. (7 missing)
- Verbs: 'got', 'went', 'came', 'took', etc. (~30 missing)
- Nouns: 'thing', 'time', 'place', 'way', etc. (~20 missing)
- Adjectives: 'good', 'bad', 'big', 'small', etc. (~15 missing)

---

## 6. Testing Recommendations

### Test Case 1: Card Visibility
1. Apply SmartReplacementConfig fix
2. Start new story or reload existing
3. **Verify:** "Configure Auto-Cards" card appears in story cards list
4. **Verify:** Card has proper description tooltip
5. **Verify:** Card content is editable and saves changes

### Test Case 2: Missing Synonym Handling
1. Add 'station' and 'never' synonyms
2. Write scenario using "station" 3+ times
3. **Verify:** "⚠️ Needs synonym: station" warning disappears
4. **Verify:** Word Variety score improves from 1/5
5. **Verify:** Replacements use context-appropriate synonyms

### Test Case 3: Context-Aware Retention
1. Implement `shouldKeepFatiguedWord()` function
2. Create scenario where original word scores higher than synonyms
3. **Verify:** Log shows "✋ Kept fatigued word" with quality reasoning
4. **Verify:** Original word preserved despite fatigue
5. **Verify:** Bonepoke score doesn't drop unnecessarily

### Test Case 4: All Cards Present
1. Load Trinity system with all fixes applied
2. **Verify:** 5 cards visible in story cards:
   - Word Bank - PRECISE
   - Word Bank - AGGRESSIVE
   - Word Bank - REPLACER
   - PlayersAuthorsNote
   - Configure Auto-Cards
3. **Verify:** Each card has proper title and description

---

## 7. Summary of Required Changes

| Priority | Task | File | Lines | Complexity |
|----------|------|------|-------|------------|
| **P1** | Fix SmartReplacementConfig card creation | trinitysharedLibrary(1).js | 552-578 | Low |
| **P2a** | Add 'station' to SYNONYM_MAP | trinitysharedLibrary(1).js | After 1206 | Trivial |
| **P2b** | Add 'station' to ENHANCED_SYNONYM_MAP | trinitysharedLibrary(1).js | After 2560 | Low |
| **P2c** | Add 'never' to SYNONYM_MAP | trinitysharedLibrary(1).js | After 1206 | Trivial |
| **P2d** | Add 'never' to ENHANCED_SYNONYM_MAP | trinitysharedLibrary(1).js | After 2560 | Low |
| **P3** | Implement shouldKeepFatiguedWord() | trinitysharedLibrary(1).js | New function | Medium |
| **P4** | Audit and fill 114 coverage gaps | trinitysharedLibrary(1).js | Multiple | High |

**Estimated Total:** ~200 lines of changes across 6 tasks

---

## 8. Expected Log Output After Fixes

### Before Fixes
```
⚠️ 📝 Needs synonym: station (kept in text)
Word Variety: 1/5
```

### After Fixes
```
✅ 📝 Created Configure Auto-Cards story card
✅ 📝 Created PRECISE word bank card
✅ 📝 Created AGGRESSIVE word bank card
✅ 📝 Created REPLACER word bank card
✅ 📝 PlayersAuthorsNote card created - edit to add your custom guidance

[Turn 2]
🔄 Replaced "station" → "outpost": Context match (frontier, isolated)
Word Variety: 4/5

[Turn 5]
✋ Kept fatigued word "station": Original maintains best quality (delta: -0.5)
Word Variety: 3/5 (fatigue noted but quality preserved)
```

---

## Conclusion

The Trinity system **IS creating 4 cards successfully**, but:
1. The **SmartReplacementConfig card is broken** (wrong API, no title)
2. **52% of synonyms lack Bonepoke scores** (random replacements)
3. **No logic to preserve quality** when original beats synonyms
4. **Missing critical synonyms** ('station', 'never')

All issues are **fixable** with the changes outlined in this report. Implementing Priority 1-3 will resolve the user's immediate concerns. Priority 4 is a longer-term quality improvement.
