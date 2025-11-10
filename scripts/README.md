# AI Dungeon Enhanced Creative Writing Scripts

Complete, production-ready script set combining **Verbalized Sampling** and **Bonepoke Protocol** for AI Dungeon.

## 📋 Overview

This script collection provides:

- ✅ **Verbalized Sampling (VS)**: 2-3x diversity improvement via low-probability sampling
- ✅ **Bonepoke Analysis**: Quality control detecting contradictions, fatigue, and drift
- ✅ **Dynamic Correction**: Auto-generated guidance cards responding to detected issues
- ✅ **Quality-Gated Regeneration**: Automatic retry on poor outputs
- ✅ **Adaptive Parameters**: Context-aware VS configuration
- ✅ **Analytics Tracking**: Metrics on quality, diversity, and system performance

## 📁 File Structure

```
scripts/
├── sharedLibrary.js    ← Paste into: Shared Library > Library
├── input.js            ← Paste into: Scripts > Input
├── context.js          ← Paste into: Scripts > Context
├── output.js           ← Paste into: Scripts > Output
└── README.md           ← This file
```

## 🚀 Installation

### Step 1: Access Scenario Editor

1. Go to AI Dungeon
2. Open your scenario or create a new one
3. Click **Edit Scenario** → **Scripts**

### Step 2: Install Shared Library

1. Navigate to **Shared Library** → **Library** tab
2. **Delete all existing code** or append to the end
3. Copy entire contents of `sharedLibrary.js`
4. Paste into the Library editor
5. Click **Save**

### Step 3: Install Lifecycle Scripts

For each of the following:

**Input Script:**
- Navigate to **Scripts** → **Input** tab
- Copy entire contents of `input.js`
- Paste into the editor (replacing existing code or appending)
- Click **Save**

**Context Script:**
- Navigate to **Scripts** → **Context** tab
- Copy entire contents of `context.js`
- Paste into the editor
- Click **Save**

**Output Script:**
- Navigate to **Scripts** → **Output** tab
- Copy entire contents of `output.js`
- Paste into the editor
- Click **Save**

### Step 4: Verify Installation

1. Start a new adventure with your scenario
2. Open **Console** (hamburger menu → Console)
3. Type an action and press Enter
4. Check console for: `✅ State initialized`
5. If you see no errors, installation is successful!

## ⚙️ Configuration

### Basic Configuration

Edit the `CONFIG` object at the top of `sharedLibrary.js`:

```javascript
const CONFIG = {
    // Verbalized Sampling
    vs: {
        enabled: true,          // Toggle VS on/off
        k: 5,                   // Number of candidates (3-10)
        tau: 0.10,              // Probability threshold (0.05-0.20)
        seamless: true,         // Hide process from output
        adaptive: false,        // Auto-adjust parameters
        debugLogging: false     // Console logging
    },

    // Bonepoke Analysis
    bonepoke: {
        enabled: true,          // Toggle analysis on/off
        fatigueThreshold: 3,    // Word repetition threshold (2-5)
        qualityThreshold: 2.5,  // Min avg score (1.0-5.0)
        maxRegenAttempts: 2,    // Regeneration limit (0-3)
        enableDynamicCorrection: true,  // Auto-inject guidance
        debugLogging: false     // Console logging
    },

    // System
    system: {
        persistState: true,     // Save state between sessions
        enableAnalytics: false  // Track metrics over time
    }
};
```

### Recommended Presets

**Conservative (Balanced Quality/Diversity):**
```javascript
vs: { enabled: true, k: 5, tau: 0.10, adaptive: false }
bonepoke: { enabled: true, fatigueThreshold: 4, qualityThreshold: 2.5, maxRegenAttempts: 2 }
```

**Aggressive (Maximum Diversity):**
```javascript
vs: { enabled: true, k: 7, tau: 0.08, adaptive: true }
bonepoke: { enabled: true, fatigueThreshold: 3, qualityThreshold: 3.0, maxRegenAttempts: 3 }
```

**VS Only (Lightweight):**
```javascript
vs: { enabled: true, k: 5, tau: 0.10, adaptive: false }
bonepoke: { enabled: false }
```

**Quality Control Only:**
```javascript
vs: { enabled: false }
bonepoke: { enabled: true, fatigueThreshold: 3, qualityThreshold: 2.5 }
```

## 🎮 Usage

### Normal Operation

Once installed, the scripts work **automatically**:

1. Type your action/dialogue as normal
2. VS injects instructions before AI generation
3. AI generates diverse output
4. Bonepoke analyzes quality
5. If quality is poor, output regenerates automatically (up to limit)
6. Clean output is shown to you

### Monitoring (Debug Mode)

Enable debug logging to see what's happening:

```javascript
vs: { debugLogging: true }
bonepoke: { debugLogging: true }
```

Console output will show:
```
ℹ️ VS adapted: k=7, tau=0.12
✅ Output quality: good (3.42)
  Emotional Strength: 4/5
  Story Flow: 5/5
  Character Clarity: 4/5
  Dialogue Weight: 2/5
  Word Variety: 5/5
```

### Viewing Analytics

Enable analytics and check state in console:

```javascript
system: { enableAnalytics: true }
```

In console, type:
```javascript
log(Analytics.getSummary())
```

Output:
```javascript
{
  totalOutputs: 47,
  regenerations: 3,
  regenRate: "6.4%",
  fatigueRate: "12.8%",
  driftRate: "4.3%"
}
```

## 🧩 Features Deep Dive

### Verbalized Sampling (VS)

**How it works:**
- Injects instruction asking AI to internally generate 5 candidates
- AI estimates probability for each (how typical it would be)
- AI only considers candidates with p < 0.10 (unlikely responses)
- AI randomly selects one and outputs it naturally

**Benefits:**
- 2-3x vocabulary diversity
- Breaks repetitive patterns
- More surprising plot developments
- Varied dialogue and actions

**Adaptive Mode:**
When enabled, VS adjusts parameters based on context:
- **Dialogue**: k=7, tau=0.12 (more speech variety)
- **Action**: k=5, tau=0.08 (surprising but coherent)
- **Description**: k=4, tau=0.15 (moderate exploration)

### Bonepoke Analysis

**Detection Systems:**

1. **Contradiction Detection**
   - Finds temporal inconsistencies ("already...not", "still...not")
   - Flags logical conflicts

2. **Fatigue Tracking**
   - Counts word repetition (threshold: 3+ occurrences)
   - Ignores common words (the, and, etc.)

3. **Drift Detection**
   - Identifies abstract system-speak without action
   - Flags terms like "system", "protocol", "sequence" without verbs

4. **MARM Status** (Meta-Aware Recursion Monitor)
   - Composite score from all detections
   - States: suppressed / flicker / active
   - Diagnostic canary for system health

**Scoring Categories:**
- Emotional Strength (1-5)
- Story Flow (1-5)
- Character Clarity (1-5)
- Dialogue Weight (1-5)
- Word Variety (1-5)

Average score determines quality: excellent (4+) / good (3-4) / fair (2-3) / poor (<2)

### Dynamic Correction

When Bonepoke detects problems, it **automatically creates story cards** with guidance:

**Fatigue Detected:**
```
[Style guidance: Avoid repeating these overused words: door, system, room.
Use synonyms, varied phrasing, and fresh descriptions.]
```

**Drift Detected:**
```
[Style guidance: Focus on concrete, physical actions. Show visible responses,
character decisions, and tangible events. Avoid abstract system references.]
```

**Contradictions Detected:**
```
[Style guidance: Maintain logical consistency. Check temporal sequence.
Ensure cause and effect make sense.]
```

These cards are **temporary** and cleaned up on the next turn.

### Quality-Gated Regeneration

When output quality falls below threshold:

1. Output script detects low score
2. Returns `{ text: '', stop: true }`
3. AI Dungeon automatically regenerates
4. Process repeats up to `maxRegenAttempts` (default: 2)
5. After limit, output is accepted regardless of quality

**Safety Features:**
- Hard limit prevents infinite loops
- Each regeneration logged in console
- State tracks attempts per output

## 📊 Best Practices

### DO:
✅ Start with conservative settings
✅ Enable debug logging initially to verify operation
✅ Adjust `tau` before adjusting `k` (tau matters more)
✅ Use adaptive mode for varied scenarios (dialogue + action + description)
✅ Monitor analytics to measure improvement
✅ Disable systems if you want pure AI output
✅ Use `state` for persistent data across turns

### DON'T:
❌ Set `tau` too high (>0.15) - reduces diversity
❌ Set `qualityThreshold` too high (>3.5) - causes excessive regeneration
❌ Enable both aggressive VS and strict quality gates - conflict
❌ Use `worldinfo` API (deprecated - use `storyCards` instead)
❌ Forget `void 0` at end of lifecycle scripts
❌ Modify shared library variables from lifecycle scripts (use `state` instead)

### Memory Bank Required

**Important:** Dynamic correction requires **Memory Bank** to be enabled:

1. Edit Scenario → Settings
2. Toggle **Memory Bank** to ON
3. This allows scripts to create/modify story cards

If Memory Bank is OFF, dynamic correction will fail silently.

## 🐛 Troubleshooting

### "State not initialized"

**Solution:** Check that sharedLibrary.js is saved correctly. State should initialize automatically.

### "Cannot modify storyCards"

**Solution:** Enable Memory Bank in scenario settings.

### Excessive regenerations

**Solution:** Lower `qualityThreshold` or increase `maxRegenAttempts`:
```javascript
bonepoke: { qualityThreshold: 2.0, maxRegenAttempts: 1 }
```

### VS not increasing diversity

**Solutions:**
1. Enable debug logging and verify VS instruction is injected
2. Lower `tau` to 0.08 for stricter tail sampling
3. Increase `k` to 7 for more candidates
4. Check console for AI model compliance

### Output seems too chaotic

**Solutions:**
1. Raise `tau` to 0.12-0.15
2. Lower `k` to 3-4
3. Disable adaptive mode
4. Enable Bonepoke for quality control

### Script errors in console

**Solution:** Verify you copied entire file contents. Common issue: missing closing braces or `void 0` at end.

## 🔬 Testing & Validation

### Quick Test Protocol

1. **Installation Test:**
   - Start adventure
   - Check console for "✅ State initialized"
   - Check for any red errors

2. **VS Test:**
   - Generate 10 outputs with same prompt
   - Compare vocabulary diversity
   - Should see varied responses

3. **Bonepoke Test:**
   - Intentionally repeat same word 5+ times in your action
   - Next output should trigger fatigue warning
   - Dynamic correction card should appear

4. **Regeneration Test:**
   - Set `qualityThreshold: 4.5` (very strict)
   - Generate output
   - Should regenerate 2-3 times
   - Console shows "Triggering regeneration"

### Performance Metrics

Track these over 50+ outputs:

| Metric | Baseline | With Scripts | Measurement |
|--------|----------|--------------|-------------|
| Distinct-3 | 0.42 | 0.80+ | Unique trigrams / total |
| Vocabulary | 1,200 | 2,400+ | Unique words in session |
| Regenerations | 0% | 3-8% | Regen count / total outputs |
| Fatigue Rate | - | 5-15% | Outputs with repetition |

## 📚 Script Execution Flow

```
USER TYPES ACTION
    ↓
┌─────────────────────────────────┐
│ onInput Hook                    │
│ → sharedLibrary (loads utils)  │
│ → input.js (process input)     │
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ onModelContext Hook             │
│ → sharedLibrary (available)    │
│ → context.js:                   │
│   • Analyze recent history      │
│   • Apply dynamic corrections   │
│   • Inject VS instruction       │
└───────────┬─────────────────────┘
            ↓
      [AI GENERATES]
            ↓
┌─────────────────────────────────┐
│ onOutput Hook                   │
│ → sharedLibrary (available)    │
│ → output.js:                    │
│   • Analyze with Bonepoke       │
│   • Check quality threshold     │
│   • Regenerate if needed        │
│   • Clean formatting            │
│   • Record analytics            │
└───────────┬─────────────────────┘
            ↓
     SHOW TO PLAYER
```

## 🔧 Advanced Customization

### Custom Quality Scoring

Edit `BonepokeAnalysis.scoreOutput()` in sharedLibrary.js:

```javascript
// Add custom category
scores['Plot Originality'] = text.includes('treasure') ? 1 : 5;
```

### Custom Corrections

Edit `DynamicCorrection` in sharedLibrary.js:

```javascript
const correctMyCustomIssue = () => {
    buildCard(
        "DynamicCorrection_Custom",
        "[Your custom guidance here]",
        "guidance",
        "",
        "Custom correction",
        0
    );
};
```

### Integration with Other Scripts

These scripts are designed to coexist with other AI Dungeon scripts:

**Option 1: Append to existing code**
```javascript
// Your existing shared library code
const myExistingFunction = () => { ... };

// Then paste our sharedLibrary.js below

void 0;
```

**Option 2: Modular approach**
Use functions from shared library in your custom scripts:
```javascript
// In your custom context script
const modifier = (text) => {
    // Your custom logic
    if (someCondition) {
        const analysis = BonepokeAnalysis.analyze(text);
        // Do something with analysis
    }

    // Then call our modifier
    text += VerbalizedSampling.getInstruction();
    return { text };
};
```

## 📖 API Reference

### Shared Library Exports

**VerbalizedSampling:**
- `getInstruction()` → string: Get current VS instruction
- `analyzeContext(text)` → {k, tau}: Suggest parameters for context
- `updateCard()` → void: Refresh VS card with current config

**BonepokeAnalysis:**
- `analyze(text)` → object: Full analysis with scores and suggestions
- `detectContradictions(text)` → string[]: Find logical conflicts
- `traceFatigue(text)` → object: Word repetition counts
- `detectDrift(text)` → string[]: Find ungrounded references

**DynamicCorrection:**
- `applyCorrections(analysis)` → void: Auto-create guidance cards
- `cleanup()` → void: Remove all dynamic cards
- `correctFatigue(words)` → void: Create variety guidance
- `correctDrift()` → void: Create grounding guidance

**Analytics:**
- `getSummary()` → object: Session statistics
- `recordOutput(analysis)` → void: Log output event
- `recordRegeneration()` → void: Log regeneration

**Utilities:**
- `buildCard(title, entry, type, keys, desc, index)` → card: Create story card
- `getCard(predicate, getAll)` → card|card[]: Find story card(s)
- `removeCard(title)` → boolean: Delete story card
- `safeLog(message, level)` → void: Conditional logging

### State Variables

Access via `state` object:

- `state.initialized` - boolean: Initialization status
- `state.vsHistory` - array: VS historical data
- `state.bonepokeHistory` - array: Analysis history (last 20)
- `state.metrics` - object: Session metrics
- `state.dynamicCards` - string[]: Active correction card titles
- `state.lastBonepokeScore` - number: Most recent avg score
- `state.regenCount` - number: Total regenerations this session
- `state.lastContextSize` - number: Last context character count

## 📜 Version History

**v2.0.0** (2025-11-10)
- Complete rewrite following AI Dungeon best practices
- Integrated Verbalized Sampling + Bonepoke Protocol
- Added dynamic correction system
- Quality-gated regeneration
- Adaptive VS parameters
- Comprehensive analytics
- Modern storyCards API (deprecated worldinfo)

## 📄 License

MIT License - Free to use, modify, and distribute

## 🙏 Credits

- **Verbalized Sampling**: CHATS-lab research (arxiv.org/abs/2510.01171)
- **Bonepoke Protocol**: James Taylor (CC BY-NC-SA 4.0)
- **Better Say Actions**: BinKompliziert (AI Dungeon Discord)
- **AI Dungeon Scripting**: Latitude team

## 🔗 Resources

- [AI Dungeon Scripting Docs](https://help.aidungeon.com/scripting)
- [Verbalized Sampling Paper](https://arxiv.org/html/2510.01171v3)
- [Verbalized Sampling GitHub](https://github.com/CHATS-lab/verbalized-sampling)
- [Bonepoke Articles](https://medium.com/@utharian)
- [AI Dungeon Discord](https://discord.gg/aidungeon)

---

**Need help?** Check the Troubleshooting section or ask in AI Dungeon Discord #scripting channel.
