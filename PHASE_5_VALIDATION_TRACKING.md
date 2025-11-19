# Phase 5: Replacement Validation & Success Tracking

**Status:** ✅ IMPLEMENTED
**Date:** 2025-01-18
**Features:** Replacement validation, performance tracking, user-facing reports

---

## 🎯 Overview

Phase 5 adds intelligent validation and tracking to the smart synonym replacement system. Every replacement is now:
1. **Validated** - Tested to ensure it improves (or doesn't harm) quality
2. **Tracked** - Performance data collected for adaptive learning
3. **Reported** - Comprehensive statistics available to users

---

## 🛡️ Feature 1: Replacement Validation System

### What It Does

Before applying any word replacement, the system now:
- Analyzes the text **before** replacement (Bonepoke analysis)
- Analyzes the text **after** replacement (Bonepoke analysis)
- Compares the results and **blocks** the replacement if it would:
  - Lower the overall quality score
  - Create new contradictions
  - Increase word fatigue
  - Fail to meet minimum improvement threshold (in strict mode)

### Configuration

Located in `sharedLibrary.js` CONFIG section:

```javascript
smartReplacement: {
    // Phase 5: Replacement Validation & Tracking
    enableValidation: true,             // Validate replacements improve quality
    validationStrict: false,            // Strict: require improvement. False: allow neutral
    preventQualityDegradation: true,    // Block replacements that lower scores
    preventNewContradictions: true,     // Block if creates new contradictions
    preventFatigueIncrease: true,       // Block if increases word fatigue
    minScoreImprovement: 0.0,           // Minimum score delta to accept (0.0 = any improvement)

    // Debug
    logValidation: false                // Show validation decisions in log
}
```

### Validation Modes

**Permissive Mode (default):**
```javascript
validationStrict: false,
preventQualityDegradation: true,
```
- Allows neutral replacements (score stays same)
- Blocks replacements that **lower** quality
- ✅ Best for most users

**Strict Mode:**
```javascript
validationStrict: true,
minScoreImprovement: 0.1,
```
- **Requires** score improvement of at least 0.1
- Blocks neutral and degrading replacements
- ⚠️ May skip more replacements, but ensures every one improves quality

**Diagnostic Mode:**
```javascript
logValidation: true,
```
- Logs every validation decision
- Shows exactly why replacements pass/fail
- 📊 Great for understanding system behavior

### Example Validation Flow

```
Turn 45: AI output contains "walked slowly"

1. Bonepoke detects word fatigue on "walked"
2. Smart replacement selects "trudged" (emotion: 4, tags: ['weary', 'slow'])
3. VALIDATION STARTS:
   - Original text: "walked slowly" → Bonepoke score: 3.2
   - Replaced text: "trudged slowly" → Bonepoke score: 3.4
   - Score change: +0.2 ✅
   - No new contradictions ✅
   - No fatigue increase ✅
4. VALIDATION PASSED ✅
5. Replacement applied: "trudged slowly"
6. Tracked for learning: walked → trudged (+0.2)
```

**Example Blocked Replacement:**

```
Turn 52: AI output contains "said quietly"

1. Bonepoke detects word fatigue on "said"
2. Smart replacement selects "shouted" (emotion: 5, tags: ['loud', 'forceful'])
3. VALIDATION STARTS:
   - Original text: "said quietly" → Bonepoke score: 3.1
   - Replaced text: "shouted quietly" → Bonepoke score: 2.8
   - Score change: -0.3 ❌
4. VALIDATION FAILED: Quality degraded (-0.30)
5. Replacement BLOCKED ❌
6. Original text kept: "said quietly"
```

---

## 📊 Feature 2: Replacement Success Tracking

### What It Tracks

The system tracks **every replacement attempt** and collects:

**Global Statistics:**
- Total replacements made
- Successful replacements (improved quality)
- Neutral replacements (maintained quality)
- Failed replacements (degraded quality)

**Per-Word-Pair Statistics:**
- Number of times each word→synonym pair was used
- Total score improvement from all uses
- Average improvement per use
- ⭐ Used for adaptive learning bonuses

**Validation Statistics:**
- Total validation attempts
- Validations passed vs. blocked
- Breakdown by block reason:
  - Quality degradation
  - New contradictions
  - Fatigue increase
  - Insufficient improvement

### Data Structure

```javascript
state.replacementLearning = {
    history: {
        'walked': {
            'trudged': {
                uses: 15,
                totalScoreImprovement: 2.4,
                avgImprovement: 0.16
            },
            'strolled': {
                uses: 8,
                totalScoreImprovement: 0.9,
                avgImprovement: 0.11
            }
        },
        'said': {
            'whispered': {
                uses: 12,
                totalScoreImprovement: 1.8,
                avgImprovement: 0.15
            }
        }
    },
    totalReplacements: 35,
    successfulReplacements: 28,
    neutralReplacements: 5,
    failedReplacements: 2
};

state.replacementValidation = {
    totalAttempts: 42,
    validationsPassed: 35,
    validationsFailed: 7,
    blockedReasons: {
        qualityDegradation: 4,
        newContradictions: 2,
        fatigueIncrease: 1,
        insufficientImprovement: 0
    }
};
```

### Adaptive Learning Integration

High-performing word pairs (≥3 uses) get **bonus weight** in future selections:

```javascript
// If "walked → trudged" has avg improvement of +0.16 (from 15 uses)
learningBonus = 0.16 * 0.1 * 10 = 0.16
finalWeight = baseWeight + learningBonus

// This makes "trudged" MORE LIKELY to be selected next time
```

---

## 📈 Feature 3: Performance Reports

### How to View Report

Type in your input:
```
@report
```
or
```
/report
```

The system will display a comprehensive performance report in the game log.

### Report Contents

```
═══════════════════════════════════════════════
   SMART REPLACEMENT PERFORMANCE REPORT
═══════════════════════════════════════════════

📊 OVERALL STATISTICS
   Total Replacements: 127
   ✅ Successful (improved): 98 (77.2%)
   → Neutral (maintained): 24 (18.9%)
   ❌ Failed (degraded): 5 (3.9%)

🛡️  VALIDATION STATISTICS
   Total Attempts: 145
   ✅ Passed: 127 (87.6%)
   ❌ Blocked: 18
      - Quality degradation: 12
      - New contradictions: 4
      - Fatigue increase: 2
      - Insufficient improvement: 0

🏆 TOP PERFORMING REPLACEMENTS (min 3 uses)
   🥇 walked → trudged
      Avg: +0.164 | Uses: 15 | Total: +2.46
   🥈 said → whispered
      Avg: +0.152 | Uses: 12 | Total: +1.82
   🥉 looked → gazed
      Avg: +0.138 | Uses: 9 | Total: +1.24
      big → immense
      Avg: +0.121 | Uses: 8 | Total: +0.97
      dark → shadowy
      Avg: +0.115 | Uses: 7 | Total: +0.81

⚠️  WORST PERFORMING REPLACEMENTS
   ⚠️  said → shouted
      Avg: -0.089 | Uses: 4 | Total: -0.36
   ⚠️  walked → marched
      Avg: -0.043 | Uses: 3 | Total: -0.13

═══════════════════════════════════════════════
Use /ngo report to see this data
═══════════════════════════════════════════════
```

### Interpreting the Report

**Overall Success Rate:**
- **>70% successful:** Excellent! System is improving quality consistently
- **50-70% successful:** Good, but consider adjusting thresholds
- **<50% successful:** Review CONFIG settings, validation may be too lenient

**Validation Block Rate:**
- **<20% blocked:** Validation is working well, most replacements pass
- **20-40% blocked:** Moderate filtering, consider loosening if too strict
- **>40% blocked:** Very strict, may want to lower thresholds

**Top Performers:**
- These word pairs consistently improve quality
- Future selections will favor these (adaptive learning)
- Good candidates to add more synonyms for

**Worst Performers:**
- These word pairs harm quality
- System will avoid these in future (adaptive learning)
- Consider removing from ENHANCED_SYNONYM_MAP or adjusting metadata

---

## 🔧 Advanced Configuration Examples

### Example 1: Maximum Safety (Block Everything Harmful)

```javascript
smartReplacement: {
    enableValidation: true,
    validationStrict: true,              // Require improvement
    minScoreImprovement: 0.05,           // Must improve by ≥0.05
    preventQualityDegradation: true,
    preventNewContradictions: true,
    preventFatigueIncrease: true,
    logValidation: true                  // See every decision
}
```

**Result:** Only replacements that measurably improve quality will be applied. Very conservative.

### Example 2: Balanced (Recommended)

```javascript
smartReplacement: {
    enableValidation: true,
    validationStrict: false,             // Allow neutral
    minScoreImprovement: 0.0,
    preventQualityDegradation: true,     // Block degradation
    preventNewContradictions: true,
    preventFatigueIncrease: true,
    logValidation: false
}
```

**Result:** Blocks harmful replacements, allows neutral ones. Good balance.

### Example 3: Diagnostic Mode (Debug Issues)

```javascript
smartReplacement: {
    enableValidation: true,
    validationStrict: false,
    preventQualityDegradation: true,
    preventNewContradictions: true,
    preventFatigueIncrease: true,
    logValidation: true,                 // Show validation
    logReplacementReasons: true,         // Show why selected
    logContextAnalysis: true,            // Show context matching
    debugLogging: true                   // Show everything
}
```

**Result:** Maximum logging, see exactly how system makes decisions.

### Example 4: Disabled (Testing Baseline)

```javascript
smartReplacement: {
    enableValidation: false,             // No validation
    enableAdaptiveLearning: false        // No tracking
}
```

**Result:** Replacements applied without validation. Useful for A/B testing.

---

## 📚 Implementation Details

### File: `sharedLibrary.js`

**Added Functions:**

1. **`validateReplacement(originalText, replacedText, originalWord, synonym)`**
   - Lines: 2253-2348
   - Compares Bonepoke scores before/after replacement
   - Returns: `{ valid: boolean, reason: string, scoreChange: number }`

2. **`generateReplacementReport()`**
   - Lines: 2350-2464
   - Generates formatted performance report
   - Returns: Report string

3. **`processReport(text)` (in NGOCommands module)**
   - Lines: 4080-4099
   - Handles @report command
   - Triggers report display

**Added Configuration:**
- Lines: 169-181 (Phase 5 validation settings)

**Added State Initialization:**
- Lines: 305-316 (replacementValidation state)

### File: `output.js`

**Modified Section:**
- Lines: 409-461 (Integrated validation into replacement logic)

**Flow:**
```
1. Get synonym from getSmartSynonym()
2. Create hypothetical replacement (originalText → replacedText)
3. Validate replacement (if enabled)
4. If validation fails → skip replacement, track reason
5. If validation passes → apply replacement
6. Track result for adaptive learning
7. Log with score change info
```

---

## 🧪 Testing the System

### Test 1: Verify Validation Works

1. Enable validation logging:
```javascript
CONFIG.smartReplacement.logValidation = true;
```

2. Play a few turns
3. Check game log for validation messages:
```
✅ APPROVED: walked → trudged (+0.12)
❌ BLOCKED: said → shouted (score decreased -0.23)
```

### Test 2: Check Adaptive Learning

1. Play ~20 turns with smart replacement enabled
2. Type `@report`
3. Verify you see:
   - Total replacements > 0
   - Top performers list populated
   - Success rate calculated

### Test 3: Verify Blocked Replacements

1. Enable strict mode:
```javascript
CONFIG.smartReplacement.validationStrict = true;
CONFIG.smartReplacement.minScoreImprovement = 0.2;  // Very high threshold
```

2. Play a few turns
3. Type `@report`
4. Should see higher blocked count in validation stats

### Test 4: Baseline Comparison

**Day 1: Baseline (no validation)**
```javascript
CONFIG.smartReplacement.enableValidation = false;
```
- Play 50 turns
- Note overall story quality

**Day 2: With Validation**
```javascript
CONFIG.smartReplacement.enableValidation = true;
```
- Play 50 turns
- Compare story quality
- Type `@report` to see stats

---

## 🎯 Expected Results

After ~50 turns with validation enabled:

- **Validation Pass Rate:** 80-90% (most replacements are beneficial)
- **Success Rate:** 60-80% (most improve quality)
- **Neutral Rate:** 15-30% (some maintain quality)
- **Failed Rate:** 5-10% (few degrade quality, but caught by validation)

**If your numbers differ significantly:**

- **Pass rate <70%:** Validation too strict, lower thresholds
- **Success rate <50%:** ENHANCED_SYNONYM_MAP needs better metadata
- **Failed rate >20%:** Either validation is too lenient OR map has poor synonym choices

---

## 🔬 Future Enhancements (Not Yet Implemented)

From `UNIMPLEMENTED_IDEAS.md`:

1. **Multi-Word Phrase Intelligence** (HIGH priority)
   - Special handling for phrases like "deep breath", "slight smile"
   - Match and replace as semantic units

2. **Contextual Strictness Presets** (MEDIUM priority)
   - Different validation levels for different narrative phases
   - Example: Stricter during dialogue, lenient during action

3. **User-Facing Statistics Card** (LOW priority)
   - Story card showing live replacement stats
   - Updated each turn

---

## 📖 Quick Reference

| Command | Effect |
|---------|--------|
| `@report` or `/report` | Display performance report |
| `CONFIG.smartReplacement.enableValidation = false` | Disable validation |
| `CONFIG.smartReplacement.logValidation = true` | Show validation decisions |
| `CONFIG.smartReplacement.validationStrict = true` | Require improvement |

| State Variable | Purpose |
|----------------|---------|
| `state.replacementLearning.history` | Per-word-pair performance data |
| `state.replacementLearning.totalReplacements` | Total count |
| `state.replacementValidation.totalAttempts` | Validation attempts |
| `state.replacementValidation.blockedReasons` | Why validations failed |

---

## ✅ Checklist: Is Phase 5 Working?

- [ ] Validation blocks harmful replacements (check with `logValidation: true`)
- [ ] Adaptive learning tracks word pairs (check `state.replacementLearning.history`)
- [ ] @report command displays statistics
- [ ] Success rate >60% after 50 turns
- [ ] Top performers show positive avg improvement
- [ ] Worst performers (if any) show negative avg improvement

---

**Phase 5 Complete! 🎉**

Smart synonym replacement now intelligently validates every change, learns from results, and provides comprehensive performance data.
