# Trinity + Auto-Cards Integration Guide

**Version:** 3.0
**Date:** 2025-01-20
**Status:** ✅ Ready to Use

---

## 🎯 **What This Does**

Combines **TrinityScripts Hero's Journey Edition** with **Auto-Cards** entity detection system:

- ✅ **Auto-Cards**: Automatically detects and creates story cards for characters, locations, objects
- ✅ **Hero's Journey**: 12-stage narrative structure with phase-driven guidance
- ✅ **Quality Control**: Bonepoke fatigue detection + smart synonym replacement
- ✅ **Verbalized Sampling**: Adaptive creativity based on story phase
- ✅ **Commands**: @req, @temp, @arc, () for manual control
- ✅ **NGO System**: Heat/temperature for automatic phase progression

**Result:** Maximum automation + maximum quality!

---

## 📋 **Setup Instructions**

### **Step 1: Shared Library**

**OPTION A: Use Pre-Combined File (Easiest)**

Copy the entire contents of:
```
trinityScripts/trinity_autocards_sharedLibrary.js
```

This file already has lolalibrary.js and Trinity combined with proper `void 0;` separators.

**OPTION B: Manual Combination**

Use your existing `lolalibrary.js` file (which contains Auto-Cards):

```
┌─────────────────────────────────────────┐
│  SHARED LIBRARY                         │
├─────────────────────────────────────────┤
│                                         │
│  1. Copy entire lolalibrary.js here     │
│     (Contains Auto-Cards + LocalizedLanguages)
│                                         │
│  2. ADD THIS LINE after Lola:           │
│     void 0;  ← CRITICAL!                │
│                                         │
│  3. Copy Trinity sharedLibrary below    │
│     (Your existing trinitysharedLibrary(1).js)
│                                         │
│  4. Final void 0; at end                │
│                                         │
└─────────────────────────────────────────┘
```

**Shared Library structure:**
```javascript
// ========== LOLA / AUTO-CARDS (TOP) ==========
globalThis.MainSettings = class MainSettings { /* ... */ };
function LocalizedLanguages(hook, str) { /* ... */ }
function AutoCards(inHook, inText, inStop) { /* ... */ }
// ... rest of lolalibrary.js ...

void 0;  // ← ADD THIS!

// ========== TRINITY (BELOW) ==========
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>

const CONFIG = { /* Trinity configuration */ };
const HEROES_JOURNEY_PHASES = { /* 12 stages */ };
// ... rest of Trinity sharedLibrary ...

void 0;  // ← Final void 0
```

### **Step 2: Input Script**

**Replace your Input script with:**
```
trinityScripts/trinity_autocards_input.js
```

**Or copy the content manually.**

### **Step 3: Context Script**

**Replace your Context script with:**
```
trinityScripts/trinity_autocards_context.js
```

### **Step 4: Output Script**

**Replace your Output script with:**
```
trinityScripts/trinity_autocards_output.js
```

---

## 🔧 **What Gets Fixed**

### **Issue 1: @req Not "Eating Itself"** ✅ FIXED

**The Problem:**
```javascript
// WRONG - command text stays in output
const commandResult = NGOCommands.processAllCommands(text);
// Not using commandResult.processed!
return { text };  // Still has "@req something"
```

**The Fix:**
```javascript
// CORRECT - command text removed
const commandResult = NGOCommands.processAllCommands(text);
text = commandResult.processed;  // ✅ Use cleaned text
return { text };  // "@req something" is gone
```

### **Issue 2: NGO Not Working** ✅ FIXED

**The Problem:** Auto-Cards was processing text BEFORE Trinity could analyze it for conflict words.

**The Fix:** Proper processing order:

**Input Script:**
1. ✅ Trinity NGO analyzes FIRST (raw input)
2. ✅ Trinity commands process and clean
3. ✅ Auto-Cards processes last (cleaned text)

**Output Script:**
1. ✅ Trinity analyzes quality FIRST
2. ✅ Trinity NGO processes heat/temperature
3. ✅ **NGOEngine.processTurn()** called (updates temperature)
4. ✅ Auto-Cards processes last

---

## 📊 **Processing Flow**

### **Input Hook Execution Order:**

```
User types: "I attack the dragon @temp 10"
    ↓
[1] Trinity NGO analyzes
    → Detects "attack", "dragon" as conflict words
    → Heat increases
    ↓
[2] Trinity Commands process
    → Extracts @temp 10 (sets temperature to 10)
    → Removes "@temp 10" from text
    → Text now: "I attack the dragon"
    ↓
[3] Better Say Actions
    → (not applicable - not a Say action)
    ↓
[4] Auto-Cards processes
    → Detects "dragon" as entity
    → May queue card generation
    ↓
Returns: "I attack the dragon"
(Command eaten, NGO heat updated, entity detected)
```

### **Context Hook Execution Order:**

```
[1] Auto-Cards context
    → Language setup
    → Card generation triggers
    ↓
[2] Trinity Bonepoke
    → Analyzes last 3 AI outputs
    → Creates dynamic correction cards if needed
    ↓
[3] Trinity NGO Author's Note
    → Layer 1: Player's custom note
    → Layer 2: Hero's Journey phase guidance
    → Layer 3: Parentheses memory
    → Layer 4: @req urgent guidance
    ↓
[4] Trinity Verbalized Sampling
    → Adaptive k/tau based on phase
    → Updates VS instruction card
    ↓
Context sent to AI with all enhancements
```

### **Output Hook Execution Order:**

```
AI generates: "The dragon breathes fire at you!"
    ↓
[1] Trinity NGO restores author's note
    → (if AI Dungeon reset it)
    ↓
[2] Clean output
    → Remove leaked VS instructions
    → Remove XML tags
    ↓
[3] Trinity Bonepoke analyzes
    → Checks for fatigue, contradictions
    → Applies smart synonym replacement
    ↓
[4] Trinity NGO processes
    → Analyzes "dragon", "fire" for conflict
    → Updates heat
    → **processTurn() → Updates temperature → Changes phase**
    ↓
[5] Auto-Cards processes
    → Detects "dragon" entity
    → Updates "Dragon" card if exists
    → Adds to card memory
    ↓
Returns: Enhanced output to player
```

---

## ⚙️ **Configuration**

### **Auto-Cards Settings**

Edit in Shared Library (`globalThis.MainSettings`):

```javascript
globalThis.MainSettings = (class MainSettings {
    static AC = {
        DEFAULT_DO_AC: true,  // ← Enable Auto-Cards
        DEFAULT_CARD_CREATION_COOLDOWN: 32,  // Turns between cards
        DEFAULT_GENERATED_ENTRY_LIMIT: 600,  // Max entry length
        DEFAULT_USE_BULLETED_LIST_MODE: true,  // Bullet format
        // ... more settings ...
    };
});
```

### **Trinity Settings**

Edit in Shared Library (`CONFIG`):

```javascript
const CONFIG = {
    vs: {
        enabled: true,  // Verbalized Sampling
        adaptive: true,  // Adapt to Hero's Journey phase
        debugLogging: false  // Production mode
    },
    bonepoke: {
        enabled: true,  // Quality control
        fatigueThreshold: 3,  // Word repetition threshold
        enableDynamicCorrection: true,  // Auto-correction cards
        debugLogging: false
    },
    ngo: {
        enabled: true,  // Hero's Journey system
        heatDecayRate: 1,  // Natural heat decay per turn
        heatIncreasePerConflict: 1,  // Heat per conflict word
        tempIncreaseChance: 30,  // % chance temp increases
        debugLogging: false,
        logStateChanges: false
    },
    commands: {
        enabled: true,  // @req, @temp, @arc, ()
        debugLogging: false
    },
    smartReplacement: {
        enabled: true,  // Synonym replacement
        debugLogging: false
    }
};
```

---

## 🎮 **Using Combined Features**

### **Auto-Cards Commands**

Auto-Cards has its own configuration card. After first turn:
1. Check your story cards
2. Find "Configure Auto-Cards"
3. Toggle settings, ban titles, etc.

### **Trinity Commands**

Use in your input:

**@req [urgent request]**
```
@req The hero discovers a hidden betrayal
```
- Immediate high-priority guidance
- Appears in frontMemory (1 turn) + author's note (2 turns)
- Text is removed from input ✅

**@temp [1-12]**
```
@temp 10
```
- Jump to specific temperature
- 1 = Ordinary World, 10+ = The Ordeal (climax)
- Text is removed ✅

**@arc [phase]**
```
@arc ordeal
```
- Jump to specific Hero's Journey phase
- Available: ordinaryWorld, callToAdventure, refusalOfCall, meetingMentor, crossingThreshold, testsAlliesEnemies, approachCave, ordeal, reward, roadBack, resurrection, returnElixir
- Text is removed ✅

**(gradual guidance)**
```
(focus on character emotions and inner conflict)
```
- Gentle 4-turn guidance
- Max 3 active at once
- Text is removed ✅

---

## 📈 **What Each System Does**

| Feature | System | What It Does |
|---------|--------|--------------|
| **Entity Detection** | Auto-Cards | Detects character/location/object names |
| **Card Generation** | Auto-Cards | Creates story cards automatically |
| **Card Updates** | Auto-Cards | Adds memories to cards as story progresses |
| **Card Compression** | Auto-Cards | Summarizes long card memories |
| **Language Support** | Auto-Cards (Lola) | Multi-language adventures |
| **Quality Analysis** | Trinity Bonepoke | Detects fatigue, drift, contradictions |
| **Synonym Replacement** | Trinity | 200+ word variations |
| **Hero's Journey Phases** | Trinity NGO | 12-stage story structure |
| **Phase Guidance** | Trinity NGO | Author's note per phase |
| **Heat/Temperature** | Trinity NGO | Automatic phase progression |
| **Verbalized Sampling** | Trinity VS | Adaptive creativity (k/tau) |
| **Manual Commands** | Trinity | @req, @temp, @arc, () |

---

## 🔍 **Troubleshooting**

### **Auto-Cards Not Creating Cards**

**Check:**
1. Is `DEFAULT_DO_AC: true`?
2. Is Memory Bank enabled in adventure settings?
3. Have enough turns passed? (cooldown = 32 by default)
4. Are entity names being detected? (proper nouns, capitalized)

**Debug:**
```javascript
// In Output script, temporarily add:
log(`🔍 Auto-Cards active: ${state.AutoCards?.config?.doAC}`);
```

### **NGO Temperature Not Changing**

**Check:**
1. Is `CONFIG.ngo.enabled: true`?
2. Is `NGOEngine.processTurn()` called in Output script?
3. Are you using conflict words? (attack, fight, danger, etc.)

**Debug:**
```javascript
// In Output script, temporarily add:
log(`🌡️ Temp: ${state.ngo?.temperature}, Heat: ${state.ngo?.heat}`);
log(`🌡️ Phase: ${getCurrentNGOPhase()?.name}`);
```

### **Commands Not Being Removed**

**Check:**
1. Is this line in Input script?
   ```javascript
   text = commandResult.processed;  // ← Must be present!
   ```

**Debug:**
```javascript
// In Input script, add:
log(`📝 Before commands: "${text}"`);
log(`📝 After commands: "${commandResult.processed}"`);
```

### **Shared Library Not Loading**

**Check:**
1. Did you add `void 0;` after lolalibrary.js?
2. Is there a syntax error? (missing bracket, etc.)
3. Check AI Dungeon console (View → Console) for errors

---

## 🎯 **Expected Behavior**

### **Turn 1 (Ordinary World)**
- Temperature: 1
- Phase: "Ordinary World"
- Author's Note: "Establish hero's normal life..."
- VS: k=3, tau=0.15 (safe, predictable)
- Auto-Cards: Detecting initial entities

### **Turn 10 (Action Builds)**
- Temperature: 4-6
- Phase: "Tests, Allies, and Enemies"
- Author's Note: "Hero encounters tests, makes allies..."
- VS: k=5, tau=0.10 (balanced)
- Auto-Cards: Building entity cards (characters, locations)

### **Turn 20 (Approaching Climax)**
- Temperature: 7-8
- Phase: "Approach to the Inmost Cave"
- Author's Note: "Hero approaches greatest danger..."
- VS: k=5, tau=0.10 (building tension)
- Auto-Cards: Updating entity cards with memories

### **Turn 25 (Climax)**
- Temperature: 10-12
- Phase: "The Ordeal"
- Author's Note: "THE ORDEAL. Maximum tension..."
- VS: k=6, tau=0.06 (MAXIMUM creativity)
- Auto-Cards: Tracking major events in card memories

### **Turn 35 (Resolution)**
- Temperature: 2-4 (descending)
- Phase: "Resurrection" → "Return with Elixir"
- Author's Note: "Final test proves transformation..."
- VS: k=4, tau=0.15 (stable, conclusive)
- Auto-Cards: Summarizing long card memories

---

## ✅ **Integration Checklist**

**Option A (Pre-Combined):**
- [ ] Shared Library: Copy `trinity_autocards_sharedLibrary.js` to AI Dungeon Shared Library tab
- [ ] Input script: Copy `trinity_autocards_input.js` to AI Dungeon Input tab
- [ ] Context script: Copy `trinity_autocards_context.js` to AI Dungeon Context tab
- [ ] Output script: Copy `trinity_autocards_output.js` to AI Dungeon Output tab

**Option B (Manual):**
- [ ] Shared Library: lolalibrary.js copied
- [ ] Shared Library: `void 0;` added after Lola
- [ ] Shared Library: Trinity code added below
- [ ] Shared Library: Final `void 0;` at end
- [ ] Input script: Replaced with trinity_autocards_input.js
- [ ] Context script: Replaced with trinity_autocards_context.js
- [ ] Output script: Replaced with trinity_autocards_output.js

**Testing (Both Options):**
- [ ] All scripts end with `void 0;`
- [ ] Memory Bank enabled in adventure settings
- [ ] Test adventure starts without errors
- [ ] Test @req command (should be removed from text)
- [ ] Test @temp command (should change temperature)
- [ ] Test Auto-Cards (should create entity cards)
- [ ] Test NGO (temperature should increase with conflict)
- [ ] Check Hero's Journey phase changes

---

## 📚 **Additional Documentation**

- **Trinity README**: trinityScripts/README.md (379 lines)
- **Lola Compatibility**: trinityScripts/LOLA_COMPATIBILITY.md (764 lines)
- **Code Review**: trinityScripts/REVIEW_AND_IMPROVEMENTS.md (775 lines)
- **Blueprint**: trinityScripts/BLUEPRINT.md (Implementation plan)

---

## 🎉 **You're All Set!**

This integration combines the best of both systems:

✅ **Auto-Cards** handles entity detection and card management
✅ **Trinity** handles quality control and Hero's Journey structure
✅ **No conflicts** - they work together seamlessly
✅ **Commands work** - @req, @temp, @arc are properly removed
✅ **NGO works** - heat/temperature update correctly

**Happy adventuring!** 🗡️🚀🔍👻💕🤠

---

**Integration Guide Version:** 1.0
**Last Updated:** 2025-01-20
**Status:** Production Ready ✅
