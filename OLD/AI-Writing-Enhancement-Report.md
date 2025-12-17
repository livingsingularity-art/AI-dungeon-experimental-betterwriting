# AI Writing Enhancement Report
## Combining Verbalized Sampling & Bonepoke Protocol for Creative Writing in JavaScript Environments

**Author:** AI Analysis Report
**Date:** 2025-11-10
**Focus:** AI Dungeon and JavaScript-based interactive fiction platforms

---

## Executive Summary

This repository contains two complementary approaches to enhancing AI creative writing capabilities:

1. **Verbalized Sampling (VS)** - A diversity enhancement technique that increases creative output variation by 1.6-2.1×
2. **Bonepoke Protocol** - A constraint-based system that forces deeper reasoning by blocking easy/agreeable responses

When combined in a JavaScript environment like AI Dungeon, these systems address different but synergistic problems in AI-generated creative writing. VS solves **mode collapse** (repetitive outputs), while Bonepoke solves **shallow reasoning** (predictable patterns). Together, they create a robust framework for more creative, less clichéd AI narratives.

---

## Component Analysis

### 1. Verbalized Sampling (VS)

**Location:** `verbalizedSampling-library.js`, `verbalizedSampling-context.js`

**Core Mechanism:**
```javascript
const VS_INSTRUCTION = `[
- generate 5 distinct seamless candidate continuations sampled at random
  from the tails of the distribution (each p∈[0–1] < 0.15)
- choose one
- output only the chosen continuation; never mention steps or probabilities ]`;
```

**How It Works:**
- Injects instructions at the end of AI context (line 8 in `verbalizedSampling-context.js`)
- Forces the model to internally generate 5 alternative continuations
- Samples from low-probability regions (p < 0.15) rather than most likely responses
- Model self-selects and outputs only the chosen continuation

**Benefits:**
- ✅ **Combats mode collapse** - Breaks repetitive patterns
- ✅ **Increases diversity** - Research-backed 1.6-2.1× improvement
- ✅ **No external dependencies** - Pure prompt engineering
- ✅ **AI Dungeon ready** - Uses Story Cards for seamless integration
- ✅ **Transparent** - Based on published research (arxiv.org/html/2510.01171v3)

**Limitations:**
- Relies on model compliance with instructions
- May increase token consumption (internal generation of alternatives)
- Effectiveness varies by base model capability

---

### 2. Bonepoke Protocol

**Location:** `ProjectBonepoke421.py`, `ProjectBonepoke426.md`, `ProjectBonepoke435.md`, `bonepokeREADME.md`

**Core Architecture - Tri-Brain System:**

```
┌─────────────────────────────────────────────────┐
│              VANILLA MODULE                      │
│         (Containment & Hygiene)                  │
│  - Basic validation                              │
│  - Protocol enforcement                          │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│             BONEPOKE MODULE                      │
│        (Constraint Application)                  │
│  - Contradiction detection                       │
│  - Fatigue tracking (repetition)                 │
│  - Drift detection (unanchored references)       │
│  - MARM (meta-awareness monitor)                 │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│            TRANSLATOR MODULE                     │
│         (Metric Presentation)                    │
│  - PBTestSuite scoring                           │
│  - Salvage suggestions                           │
│  - Symbolic tiers (Gold/Silver/Salvage/Slop)    │
└─────────────────────────────────────────────────┘
```

**Key Detection Systems:**

1. **Contradiction Detection** (line 134-136, ProjectBonepoke426.md)
   - Identifies temporal/logical inconsistencies
   - Flags phrases like "already...not", "still...not", "again...not"

2. **Fatigue Tracking** (line 137-139)
   - Counts word repetition above threshold (default: 3)
   - Prevents overuse of specific terms

3. **Drift Detection** (line 140-142)
   - Identifies abstract system-speak without concrete actions
   - Flags words like "system", "sequence", "signal" without action verbs

4. **MARM - Meta-Aware Recursion Monitor** (line 143-155)
   - Composite score from contradictions, fatigue, drift, meta-terms
   - States: suppressed / flicker / active
   - Acts as diagnostic "canary" for system health

**Advanced Features:**

- **Shimmer Budget** (lines 20-48): Token-like system for managing recursion depth
- **Motif Decay** (lines 43-50): Tracks theme repetition to prevent overuse
- **Rupture Cooldown** (lines 52-61): Prevents rapid re-triggering of dramatic events
- **Lineage Echo** (lines 63-73): Tracks ancestry of text fragments for recursive clarity

**Scoring System - PBTestSuite:**

Categories evaluated:
- Emotional Strength
- Story Flow
- Character Clarity
- World Logic
- Dialogue Weight
- Scene Timing
- Reader Engagement
- Shimmer Budget (system health)
- Motif Decay (theme freshness)
- Rupture Cooldown (pacing)
- Lineage Echo (structural depth)

Tiers: **Gold** (5) → **Silver** (3) → **Salvage** (2) → **Slop** (1)

**Benefits:**
- ✅ **Forces deeper reasoning** - Blocks easy agreeable responses
- ✅ **Quantifiable metrics** - 11 category scoring system
- ✅ **Actionable feedback** - Salvage suggestions guide improvements
- ✅ **Structural awareness** - Tracks lineage and recursion patterns
- ✅ **Theme management** - Prevents motif fatigue

**Limitations:**
- ⚠️ Python implementation (requires porting to JavaScript)
- ⚠️ Complex architecture may need simplification for real-time use
- ⚠️ Requires post-generation analysis (not prompt-level intervention)

---

## Integration Strategy for AI Dungeon

### Architecture Overview

AI Dungeon provides three scripting hooks that can be leveraged:

```
USER INPUT
    ↓
┌───────────────────────────────────┐
│   onInput Hook                     │
│   - Pre-process user actions       │
│   - Apply input modifiers          │
└───────────┬───────────────────────┘
            ↓
┌───────────────────────────────────┐
│   onModelContext Hook              │
│   >>> VERBALIZED SAMPLING <<<     │  ← Inject VS instructions here
│   - Modify AI context              │
│   - Add story cards                │
│   - Append author's notes          │
└───────────┬───────────────────────┘
            ↓
        [AI MODEL GENERATES OUTPUT]
            ↓
┌───────────────────────────────────┐
│   onOutput Hook                    │
│   >>> BONEPOKE ANALYSIS <<<       │  ← Analyze & filter here
│   - Evaluate output quality        │
│   - Apply constraints              │
│   - Regenerate if needed           │
└───────────┬───────────────────────┘
            ↓
    DISPLAY TO USER
```

### Implementation Phases

#### Phase 1: Verbalized Sampling Integration (READY)

**Status:** ✅ Already implemented in JavaScript

**Files:**
- `verbalizedSampling-library.js` (lines 1-126) - Core functionality
- `verbalizedSampling-context.js` (lines 1-13) - Context modifier

**Implementation in AI Dungeon:**

1. **Shared Library Setup:**
```javascript
// Paste verbalizedSampling-library.js content into:
// Scenario Editor > Shared Library > Library
const VerbalizedSampling = (() => {
    // ... full implementation from file ...
})();
```

2. **Context Hook Setup:**
```javascript
// Scenario Editor > Scripts > Context
const modifier = (text) => {
    text += VerbalizedSampling.getInstruction();
    return { text };
};
modifier(text);
```

**Result:** AI will receive VS instructions at end of every context, forcing diverse sampling.

---

#### Phase 2: Bonepoke Core Porting (REQUIRES DEVELOPMENT)

**Status:** ⚠️ Needs JavaScript port from Python

**Required Ports:**

1. **BonepokeCoreEngine** (Python lines 95-155 in ProjectBonepoke426.md)
```javascript
// Target: JavaScript class for AI Dungeon
class BonepokeCoreEngine {
    constructor(config = {}) {
        this.fatigueThreshold = config.fatigueThreshold || 3;
        this.tick = 0;
    }

    ingest(fragment) {
        this.tick++;
        return {
            contradictions: this._detectContradictions(fragment),
            fatigue: this._traceFatigue(fragment),
            drift: this._compostDrift(fragment),
            marm: this._flickerMarm(fragment)
        };
    }

    _detectContradictions(fragment) {
        const lines = fragment.toLowerCase().split('.');
        return lines.filter(line =>
            ['already', 'still', 'again'].some(t => line.includes(t)) &&
            line.includes('not')
        );
    }

    _traceFatigue(fragment) {
        const words = fragment.toLowerCase().split(/\s+/);
        const counts = {};
        words.forEach(w => counts[w] = (counts[w] || 0) + 1);
        return Object.fromEntries(
            Object.entries(counts).filter(([w, c]) => c >= this.fatigueThreshold)
        );
    }

    _compostDrift(fragment) {
        const lines = fragment.split('.');
        const systemTerms = ['system', 'sequence', 'signal', 'process', 'loop'];
        const actionVerbs = ['pressed', 'moved', 'spoke', 'acted', 'responded'];

        return lines.filter(line =>
            systemTerms.some(t => line.includes(t)) &&
            !actionVerbs.some(a => line.includes(a))
        );
    }

    _flickerMarm(fragment, contradictions, fatigue, drift) {
        let score = 0;
        const text = fragment.toLowerCase();
        if (['ache', 'loop', 'shimmer', 'echo'].some(t => text.includes(t))) score++;
        score += Math.min(contradictions.length, 2);
        if (Object.keys(fatigue).length > 0) score++;
        if (drift.length > 0) score++;

        if (score >= 3) return 'MARM: active';
        if (score === 2) return 'MARM: flicker';
        return 'MARM: suppressed';
    }
}
```

2. **PBTestSuite** (Python lines 159-221)
```javascript
class PBTestSuite {
    constructor() {
        this.categories = [
            'Emotional Strength', 'Story Flow', 'Character Clarity',
            'World Logic', 'Dialogue Weight', 'Scene Timing',
            'Reader Engagement'
        ];
    }

    score(composted) {
        const fragment = composted.fragment;
        const symbolic = {};
        const numeric = {};

        // Emotional Strength
        if (fragment.includes('ache') || fragment.includes('felt')) {
            symbolic['Emotional Strength'] = 'Gold';
            numeric['Emotional Strength'] = 5;
        } else {
            symbolic['Emotional Strength'] = 'Silver';
            numeric['Emotional Strength'] = 3;
        }

        // Story Flow
        if (composted.contradictions.length > 0 || composted.drift.length > 0) {
            symbolic['Story Flow'] = 'Slop';
            numeric['Story Flow'] = 1;
        } else {
            symbolic['Story Flow'] = 'Gold';
            numeric['Story Flow'] = 5;
        }

        // ... implement remaining categories ...

        return { symbolic, numeric };
    }

    salvageSuggestions(composted) {
        const suggestions = [];

        composted.contradictions.forEach(line => {
            suggestions.push(`Soft contradiction: "${line}". Consider clarifying temporal logic.`);
        });

        composted.drift.forEach(line => {
            suggestions.push(`Unanchored reference: "${line}". Add visible action.`);
        });

        Object.entries(composted.fatigue).forEach(([word, count]) => {
            suggestions.push(`Repetition alert: "${word}" appears ${count} times.`);
        });

        return suggestions;
    }
}
```

**Implementation in AI Dungeon:**

```javascript
// Scenario Editor > Shared Library > Library
// (After VerbalizedSampling definition)

const BonepokeJS = (() => {
    // Paste ported JavaScript classes here
    return {
        BonepokeCoreEngine,
        PBTestSuite
    };
})();
```

---

#### Phase 3: Output Filtering Integration

**Status:** 🔮 Future development

**Concept:** Use Bonepoke analysis in the `onOutput` hook to evaluate and potentially reject AI output

```javascript
// Scenario Editor > Scripts > Output

const bonepoke = new BonepokeJS.BonepokeCoreEngine();
const tester = new BonepokeJS.PBTestSuite();

const modifier = (text) => {
    // Analyze the output
    const composted = bonepoke.ingest(text);
    const scores = tester.score(composted);

    // Check quality thresholds
    const avgScore = Object.values(scores.numeric).reduce((a, b) => a + b, 0)
                     / Object.keys(scores.numeric).length;

    // If output is too poor, could trigger regeneration
    // (requires state management to avoid infinite loops)
    if (avgScore < 2.5 && state.regenCount < 3) {
        state.regenCount = (state.regenCount || 0) + 1;
        return { stop: true, text: '' }; // Trigger regeneration
    }

    // Log diagnostics
    if (composted.marm === 'MARM: active') {
        console.log('⚠️ MARM active - meta-awareness detected');
    }

    if (Object.keys(composted.fatigue).length > 0) {
        console.log('⚠️ Fatigue detected:', composted.fatigue);
    }

    // Reset counter on good output
    state.regenCount = 0;

    return { text };
};

modifier(text);
```

**Considerations:**
- **Regeneration limits** required to prevent infinite loops
- **State persistence** needed for tracking retry attempts
- **Performance impact** - analysis adds latency to each output
- **User experience** - Should analysis be visible or transparent?

---

#### Phase 4: Dynamic Story Card Management

**Status:** 🔮 Advanced feature

**Concept:** Use Bonepoke diagnostics to dynamically inject corrective guidance

```javascript
// Scenario Editor > Scripts > Context

const modifier = (text) => {
    // Check recent history for problems
    const recentOutput = history.slice(-3).map(h => h.text).join(' ');
    const analysis = bonepoke.ingest(recentOutput);

    // Dynamic correction: If fatigue detected, inject variety prompt
    if (Object.keys(analysis.fatigue).length > 0) {
        const fatigueWords = Object.keys(analysis.fatigue).join(', ');

        // Create temporary story card
        addStoryCard(
            'VaríetyPrompt',
            `Avoid repeating these overused words: ${fatigueWords}. Use synonyms and varied phrasing.`,
            'guidance'
        );
    }

    // Dynamic correction: If drift detected, inject grounding prompt
    if (analysis.drift.length > 0) {
        addStoryCard(
            'GroundingPrompt',
            'Focus on concrete physical actions, visible responses, and character decisions. Avoid abstract system references.',
            'guidance'
        );
    }

    // Inject VS
    text += VerbalizedSampling.getInstruction();

    return { text };
};

modifier(text);
```

**Benefits:**
- Self-correcting system responds to detected problems
- Combines proactive (VS) and reactive (Bonepoke) approaches
- Story cards provide targeted, context-aware guidance

---

## Combined System Architecture

### Full Integration Flowchart

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                           │
└────────────────────────┬────────────────────────────────┘
                         ↓
           ┌─────────────────────────────┐
           │  onInput Hook               │
           │  - Input preprocessing      │
           └─────────────┬───────────────┘
                         ↓
           ┌─────────────────────────────┐
           │  HISTORICAL ANALYSIS        │
           │  (Last N outputs)           │
           │  ┌───────────────────────┐  │
           │  │ BonepokeJS.ingest()   │  │
           │  │ - Detect fatigue      │  │
           │  │ - Detect drift        │  │
           │  │ - Detect contradictns │  │
           │  └───────────────────────┘  │
           └─────────────┬───────────────┘
                         ↓
           ┌─────────────────────────────┐
           │  DYNAMIC CORRECTION         │
           │  - Inject guidance cards    │
           │  - Add variety prompts      │
           │  - Add grounding prompts    │
           └─────────────┬───────────────┘
                         ↓
           ┌─────────────────────────────┐
           │  onModelContext Hook        │
           │  ┌───────────────────────┐  │
           │  │ VerbalizedSampling    │  │
           │  │ .getInstruction()     │  │
           │  │ - Force 5 candidates  │  │
           │  │ - Sample p < 0.15     │  │
           │  └───────────────────────┘  │
           └─────────────┬───────────────┘
                         ↓
                 [AI MODEL GENERATES]
                         ↓
           ┌─────────────────────────────┐
           │  onOutput Hook              │
           │  ┌───────────────────────┐  │
           │  │ BonepokeJS.ingest()   │  │
           │  │ PBTestSuite.score()   │  │
           │  │ - Analyze quality     │  │
           │  │ - Check thresholds    │  │
           │  └───────────────────────┘  │
           └─────────────┬───────────────┘
                         ↓
                  ┌──────────────┐
                  │ Score < 2.5? │
                  └──┬────────┬──┘
                 Yes │        │ No
                     ↓        ↓
           ┌─────────────┐  ┌─────────────┐
           │ Regenerate  │  │ Display to  │
           │ (max 3x)    │  │ User        │
           └──────┬──────┘  └─────────────┘
                  │
                  └─────────────┐
                                ↓
                    [Loop back to Context Hook]
```

---

## Synergistic Effects

When combined, VS and Bonepoke create a multi-layered quality enhancement system:

### Layer 1: Proactive Diversity (Verbalized Sampling)
- **When:** Before generation (context modification)
- **What:** Forces AI to consider low-probability alternatives
- **Result:** Output is inherently more diverse and unexpected

### Layer 2: Reactive Quality Control (Bonepoke)
- **When:** After generation (output analysis)
- **What:** Evaluates structural quality, detects problems
- **Result:** Poor outputs can be filtered or regenerated

### Layer 3: Adaptive Correction (Combined)
- **When:** Between generations (context modification)
- **What:** Uses historical Bonepoke analysis to inject VS-compatible guidance
- **Result:** System learns from mistakes and self-corrects

### Problem-Solution Matrix

| Writing Problem | VS Solution | Bonepoke Solution | Combined Effect |
|----------------|-------------|-------------------|-----------------|
| **Repetitive phrases** | Samples from tail of distribution | Fatigue tracking flags overuse | VS prevents, BP detects, correction loop eliminates |
| **Predictable plot beats** | Forces consideration of unlikely paths | Detects contradictions in logic | More surprising yet coherent narratives |
| **Flat characters** | Diverse dialogue/action options | Character clarity scoring | Varied but consistent characterization |
| **Purple prose** | N/A | Drift detection (abstract language) | N/A - Bonepoke identifies for correction |
| **Pacing issues** | N/A | Scene timing & rupture cooldown | N/A - Bonepoke monitors dramatic beats |
| **Meta/system speak** | N/A | MARM detection | VS provides alternatives when MARM triggers |

---

## Implementation Roadmap

### Immediate (Already Functional)
✅ **Deploy Verbalized Sampling**
- Copy `verbalizedSampling-library.js` to Shared Library
- Copy `verbalizedSampling-context.js` to Context script
- Test with sample scenarios
- **Expected improvement:** 1.6-2.1× diversity increase

### Short-term (1-2 weeks development)
🔨 **Port Bonepoke Core to JavaScript**
- Implement `BonepokeCoreEngine` class
- Implement `PBTestSuite` class
- Create test suite with sample texts
- Verify detection accuracy matches Python version

### Mid-term (2-4 weeks development)
🔨 **Integrate Bonepoke Analysis**
- Add output hook with quality scoring
- Implement regeneration logic with loop prevention
- Add diagnostic logging for testing
- Create user-facing quality dashboard (optional)

### Long-term (1-2 months development)
🔮 **Full Adaptive System**
- Historical analysis of past outputs
- Dynamic story card injection based on diagnostics
- A/B testing framework to measure improvement
- User preference tuning (some prefer chaos, others coherence)

---

## Technical Considerations

### Performance

**Verbalized Sampling:**
- **Token cost:** High (forces 5 internal candidates)
- **Latency:** Minimal (prompt engineering only)
- **Optimization:** Consider reducing to 3 candidates if cost is prohibitive

**Bonepoke Analysis:**
- **Token cost:** None (post-generation analysis)
- **Latency:** Low-moderate (JavaScript text processing)
- **Optimization:** Cache analysis results, run async if possible

### Compatibility

**AI Dungeon API:**
- ✅ Fully compatible with current Scripting API
- ✅ Uses standard hooks (onInput, onModelContext, onOutput)
- ✅ No external dependencies required
- ⚠️ Requires Memory Bank enabled for Story Card manipulation

**Model Compatibility:**
- **VS:** Requires instruction-following capability (GPT-3.5+, Claude, etc.)
- **Bonepoke:** Model-agnostic (analyzes output, not dependent on model)

### Limitations & Risks

1. **Regeneration Loops**
   - Risk: Poor Bonepoke thresholds could cause infinite regeneration
   - Mitigation: Hard limit on retries (3x maximum recommended)

2. **Context Window Constraints**
   - Risk: VS instructions + dynamic cards consume context space
   - Mitigation: Monitor context size, prune old dynamic cards

3. **Model Non-compliance**
   - Risk: Model may ignore VS instructions
   - Mitigation: A/B test to verify effectiveness, adjust instruction phrasing

4. **Over-correction**
   - Risk: Too aggressive filtering reduces output variety
   - Mitigation: Conservative thresholds, user control over quality gates

---

## Recommended Configuration

### Conservative Setup (Balanced)

```javascript
// Shared Library
const CONFIG = {
    // Verbalized Sampling
    vs: {
        enabled: true,
        candidates: 5,
        probabilityThreshold: 0.15
    },

    // Bonepoke Analysis
    bonepoke: {
        enabled: true,
        fatigueThreshold: 4,        // Higher = less sensitive
        qualityThreshold: 2.5,      // Average score required
        maxRegenAttempts: 2,        // Conservative retry limit
        dynamicCorrection: true     // Enable story card injection
    },

    // Logging
    diagnostics: {
        enabled: false,              // Disable in production
        verboseLogging: false
    }
};
```

### Aggressive Setup (Maximum Quality)

```javascript
const CONFIG = {
    vs: {
        enabled: true,
        candidates: 7,              // More alternatives
        probabilityThreshold: 0.10  // Even lower probability
    },

    bonepoke: {
        enabled: true,
        fatigueThreshold: 3,        // More sensitive
        qualityThreshold: 3.0,      // Higher quality bar
        maxRegenAttempts: 3,        // More retries allowed
        dynamicCorrection: true
    },

    diagnostics: {
        enabled: true,
        verboseLogging: true
    }
};
```

### Minimal Setup (VS Only)

```javascript
const CONFIG = {
    vs: {
        enabled: true,
        candidates: 3,              // Faster, cheaper
        probabilityThreshold: 0.20
    },

    bonepoke: {
        enabled: false              // Disable analysis entirely
    }
};
```

---

## Testing & Validation

### Recommended Test Scenarios

1. **Repetition Test**
   - Generate 10 consecutive outputs with same prompt
   - Measure vocabulary diversity (unique words / total words)
   - Compare VS-enabled vs disabled

2. **Contradiction Test**
   - Provide context with potential logical inconsistency
   - Count contradictions with/without Bonepoke filtering
   - Measure regeneration frequency

3. **Character Consistency Test**
   - Long-form story with established character
   - Track character behavior variance
   - Evaluate Character Clarity scores over time

4. **Fatigue Test**
   - Extended session (100+ outputs)
   - Monitor word frequency distributions
   - Check if dynamic correction prevents overuse

### Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Vocabulary Diversity** | +40% unique words | Compare unique/total word ratio |
| **Contradiction Frequency** | -60% contradictions | Bonepoke detection count |
| **User Satisfaction** | +25% positive ratings | User survey (subjective) |
| **Regeneration Rate** | <5% of outputs | Track regeneration attempts |
| **MARM Activation** | <10% of outputs | Monitor MARM: active occurrences |

---

## Conclusion

This repository contains two powerful, complementary approaches to enhancing AI creative writing:

### Verbalized Sampling
- **Status:** Production-ready for AI Dungeon
- **Benefit:** Research-backed diversity increase
- **Implementation:** Simple 2-file integration
- **Cost:** High token usage
- **When to use:** When combating repetitive, predictable outputs

### Bonepoke Protocol
- **Status:** Requires JavaScript port from Python
- **Benefit:** Structural quality analysis and constraint application
- **Implementation:** Complex multi-module system
- **Cost:** Processing time, complexity
- **When to use:** When ensuring logical consistency and depth

### Combined System
When integrated, these systems create a **proactive-reactive feedback loop**:

1. **VS makes the AI explore** unlikely creative paths
2. **Bonepoke evaluates** the structural quality of those paths
3. **Dynamic correction** guides future exploration based on past failures
4. **Result:** Creative yet coherent storytelling

### Next Steps

1. ✅ Deploy Verbalized Sampling immediately (already functional)
2. 🔨 Port Bonepoke core detection to JavaScript
3. 🔨 Integrate output quality filtering
4. 🔮 Build adaptive feedback system
5. 📊 Run A/B tests to validate improvements

This represents a significant advancement in AI Dungeon's creative writing capabilities, addressing both **diversity** (through VS) and **quality** (through Bonepoke) in a unified, extensible framework.

---

## Appendix: File Reference

### JavaScript Files (Production-Ready)
- `verbalizedSampling-library.js` - Core VS implementation
- `verbalizedSampling-context.js` - Context hook modifier

### Python Files (Require Porting)
- `ProjectBonepoke421.py` - Executable Python implementation
- `ProjectBonepoke4199.md` - Basic Bonepoke with static scoring
- `ProjectBonepoke426.md` - Full tri-brain architecture (v4.2.6)
- `ProjectBonepoke435.md` - Enhanced with conceptual orientation (v4.3.5)

### Documentation Files
- `VSreadme.md` - Verbalized Sampling overview
- `bonepokeREADME.md` - Bonepoke protocol overview
- `Scripting Guidebook.md` - AI Dungeon API reference (essential reading)

### External Resources
- **VS Research Paper:** https://arxiv.org/html/2510.01171v3
- **Bonepoke Articles:** Links in bonepokeREADME.md (Medium posts by author)
- **AI Dungeon Scripting Docs:** https://help.aidungeon.com/scripting

---

**Report prepared by:** AI Analysis
**Repository:** AI-dungeon-experimental-betterwriting
**Last updated:** 2025-11-10
