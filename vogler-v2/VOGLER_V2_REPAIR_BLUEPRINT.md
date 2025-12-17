# VOGLER V2 REPAIR BLUEPRINT

## Executive Summary

The vogler-v2 scripts are **completely non-functional** due to **critical API misuse** of AI Dungeon's scripting functions. The scripts call `addStoryCard()` and `updateStoryCard()` with **incorrect parameters** (passing objects instead of separate arguments), causing all story card operations to silently fail.

---

## Critical Bugs Identified

### BUG #1: addStoryCard() API Misuse (CRITICAL - 4 occurrences)

**Locations**: `voglerSharedLibrary.js` lines 403, 421, 476, 709

**Problem**: Scripts pass an OBJECT as parameter, but the API expects THREE SEPARATE ARGUMENTS.

**WRONG (Current Code)**:
```javascript
addStoryCard({
    keys: 'vogler-config',
    entry: `[Content here]`,
    type: 'author',
    title: 'Vogler Config'
});
```

**CORRECT (Per Best Practices)**:
```javascript
// Signature: addStoryCard(keys, entry, type)
addStoryCard('vogler-config', `[Content here]`, 'author');
```

**Impact**: ALL story cards fail to create. The API receives `"[object Object]"` as the keys string, and `undefined` for entry and type. Cards appear to be created (no error thrown) but contain garbage data.

---

### BUG #2: updateStoryCard() API Misuse (CRITICAL - 2 occurrences)

**Locations**: `voglerSharedLibrary.js` lines 568, 704

**Problem**: Same issue - passing an object instead of separate parameters.

**WRONG (Current Code)**:
```javascript
updateStoryCard(existingCard.index, {
    ...existingCard,
    entry: content
});
```

**CORRECT (Per Best Practices)**:
```javascript
// Signature: updateStoryCard(index, keys, entry, type)
updateStoryCard(existingCard.index, existingCard.keys, content, existingCard.type);
```

**Impact**: All beat card updates and bridge card updates fail silently.

---

### BUG #3: modifier(text) Double Execution (POTENTIAL)

**Locations**:
- `voglerInput.js` line 109
- `voglerContext.js` line 73
- `voglerOutput.js` line 90

**Problem**: Scripts call `modifier(text)` explicitly, but Trinity scripts say:
```javascript
// FIX: Don't manually call modifier - let AI Dungeon call it
// The engine automatically calls modifier(text)
// Calling it here causes double execution
```

**WRONG (Current Code)**:
```javascript
modifier(text);
void 0;
```

**CORRECT (Trinity Pattern)**:
```javascript
// FIX: Don't manually call modifier - let AI Dungeon call it
void 0;
```

**Impact**: May cause double execution of modifier logic. While Yi1i1i's pattern includes `modifier(text)`, Trinity's functional scripts do NOT - and Trinity works. Safer to follow Trinity's working pattern.

---

## Root Cause Analysis

The developer (Claude) wrote the code assuming `addStoryCard()` and `updateStoryCard()` work like modern JavaScript functions that accept options objects:

```javascript
addStoryCard({ keys, entry, type }); // WRONG - not how API works
```

But AI Dungeon's scripting API uses the traditional positional parameter style:

```javascript
addStoryCard(keys, entry, type);     // CORRECT - positional params
```

This is clearly documented in:
1. **Best Practices Guide**: Lines 233-258 show correct `addStoryCard(keys, entry, type)` signature
2. **Scripting Guidebook**: TypeScript signature `function addStoryCard(keys, entry, type)`
3. **Working Trinity Scripts**: Line 579 shows `addStoryCard(keys, defaultConfig, 'Custom')`

---

## PART 1.5: DEFINITIVE API SIGNATURES (from aidungeon.d.ts)

The official TypeScript definitions in `Best-Practices/aidungeon.d.ts` provide the **definitive API signatures**:

### addStoryCard() - FULL SIGNATURE (5 parameters)

```typescript
function addStoryCard(
    keys: string,      // Comma-separated keywords that trigger this card
    entry?: string,    // The text to inject into AI context when triggered
    type?: string,     // Category for organizing cards (default: "Custom")
    name?: string,     // Display name for the card (default: keys)
    notes?: string     // Additional notes stored in description field (default: "")
): number;             // Returns the index of the newly added card
```

**Reference Implementation** (from aidungeon.d.ts lines 358-371):
```javascript
(keys, entry, type = 'Custom', name = keys, notes = '', options) => {
  const { returnCard = false } = options ?? {}
  storyCards.push({
    id: Math.floor(Math.random() * 1000000000).toString(),
    keys,
    entry,
    type,
    title: name,
    description: notes
  })
  if (returnCard) return storyCards[storyCards.length - 1]
  else return storyCards.length
}
```

### updateStoryCard() - FULL SIGNATURE (6 parameters)

```typescript
function updateStoryCard(
    index: number,     // The index of the story card to update
    keys: string,      // New comma-separated keywords
    entry: string,     // New text to inject into context
    type?: string,     // New category (optional, preserves existing)
    name?: string,     // New display name (optional, preserves existing)
    notes?: string     // New description/notes (optional, preserves existing)
): void;
```

**Reference Implementation** (from aidungeon.d.ts lines 446-460):
```javascript
(index, keys, entry, type, name, notes) => {
  const existing = storyCards[index]
  if (existing) {
    storyCards[index] = {
      id: existing.id,
      keys,
      entry,
      type: type ?? existing.type,
      title: name ?? existing.title,
      description: notes ?? existing.description
    }
  } else {
    throw new Error(`Story card not found at index ${index} in updateStoryCard`)
  }
}
```

### removeStoryCard() - SIGNATURE

```typescript
function removeStoryCard(index: number): void;
// Throws Error if no card exists at the given index
```

---

## Known API Issues (from Best Practices)

### Issue #1: onOutput Memory Changes Delayed
From `aidungeon.d.ts` line 227:
> "Changes to state.memory in onOutput won't affect the AI until the next turn."

**Impact**: Any `state.memory.authorsNote` or `state.memory.context` changes made in the Output script won't be visible to the AI until the NEXT player action.

### Issue #2: Story Card Changes May Not Propagate Between Hooks
From Best Practices documentation:
> "Changes to story cards made in earlier hooks are not always present in later hooks."

**Impact**: A story card created in `onInput` may not be visible in `onModelContext` during the same turn.

### Issue #3: Direct Array Manipulation Supported
From `aidungeon.d.ts` line 283:
> "Direct array manipulation is supported: `storyCards.push()`, `storyCards[i] = ...`"

**Impact**: Can bypass `addStoryCard()` and directly manipulate the `storyCards` array, but must handle ID generation manually.

---

## Alternative Pattern: Director Framework

The `director.md` Best Practices document shows an alternative pattern for organizing modifier functions:

```javascript
// Instead of:
const modifier = (text) => { return { text }; };
modifier(text);
void 0;

// Use Director pattern:
const fn = (text) => { return { text }; };
director.input(fn);  // or director.context(fn), director.output(fn)
void 0;
```

**Key Benefits**:
- Chains multiple modifier functions automatically
- Cleaner separation of concerns
- No manual `modifier(text)` call needed

**Note**: This is an ALTERNATIVE approach. For P0 fixes, simply removing `modifier(text)` and keeping `void 0` is sufficient

---

## Repair Implementation Plan

### STEP 1: Fix addStoryCard() calls in voglerSharedLibrary.js

**Line 403-416 - createConfigurationCards() vogler-config card**:
```javascript
// FROM:
addStoryCard({
    keys: 'vogler-config',
    entry: `[Vogler Hero's Journey Configuration]...`,
    type: 'author',
    title: 'Vogler Config'
});

// TO:
addStoryCard('vogler-config', `[Vogler Hero's Journey Configuration]
autoAdvance: true
minTurnsPerStage: 4
beatThreshold: 0.6
ngoSync: true
debugLogging: false

[Edit these values to customize behavior]`, 'author');
```

**Line 419-432 - createConfigurationCards() player-guidance card**:
```javascript
// FROM:
addStoryCard({
    keys: 'player-guidance',
    entry: `[Your Personal Author's Note]...`,
    type: 'author',
    title: "Player's Guidance"
});

// TO:
addStoryCard('player-guidance', `[Your Personal Author's Note]
Add your style preferences, character details, or narrative goals here.
This will be combined with Vogler's stage-specific guidance.

[Edit this card to add your preferences]`, 'author');
```

**Line 476-482 - createBeatCard()**:
```javascript
// FROM:
addStoryCard({
    keys: cardKey,
    entry: content,
    type: VOGLER_BEAT_CONFIG.beatCardType,
    title: beatTemplate.name + ' Beats'
});

// TO:
addStoryCard(cardKey, content, VOGLER_BEAT_CONFIG.beatCardType);
```

**Line 709-714 - updateBridgeCard()**:
```javascript
// FROM:
addStoryCard({
    keys: SAE_BRIDGE_CONFIG.storyCardKey,
    entry: content,
    type: SAE_BRIDGE_CONFIG.bridgeCardType,
    title: 'Story Bridge'
});

// TO:
addStoryCard(SAE_BRIDGE_CONFIG.storyCardKey, content, SAE_BRIDGE_CONFIG.bridgeCardType);
```

### STEP 2: Fix updateStoryCard() calls in voglerSharedLibrary.js

**Line 568-571 - updateBeatCardDisplay()**:
```javascript
// FROM:
updateStoryCard(existingCard.index, {
    ...existingCard,
    entry: content
});

// TO:
updateStoryCard(existingCard.index, existingCard.keys, content, existingCard.type);
```

**Line 704-707 - updateBridgeCard()**:
```javascript
// FROM:
updateStoryCard(existingCard.index, {
    ...existingCard,
    entry: content
});

// TO:
updateStoryCard(existingCard.index, existingCard.keys, content, existingCard.type);
```

### STEP 3: Remove modifier(text) calls from all scripts

**voglerInput.js line 109**: Remove `modifier(text);`
**voglerContext.js line 73**: Remove `modifier(text);`
**voglerOutput.js line 90**: Remove `modifier(text);`

Keep only `void 0;` at the end of each script.

---

## Testing Plan

After implementing fixes:

1. **Create new adventure** with fixed scripts
2. **Check logs** for `[VOGLER] INITIALIZING VOGLER V2 (Turn Zero)` message
3. **Verify story cards created**:
   - `vogler-config` card should exist
   - `player-guidance` card should exist
   - `vogler-beats-1`, `vogler-beats-2`, `vogler-beats-3` cards should exist
4. **Test commands**:
   - `@beat` should complete a beat and update the card
   - `@bridge` should initiate bridge generation
   - `@stage 5` should jump to stage 5
5. **Check Author's Note** - should show stage guidance, not default text

---

## Files to Modify

| File | Changes Required |
|------|------------------|
| `voglerSharedLibrary.js` | Fix 4x addStoryCard(), Fix 2x updateStoryCard() |
| `voglerInput.js` | Remove `modifier(text);` call |
| `voglerContext.js` | Remove `modifier(text);` call |
| `voglerOutput.js` | Remove `modifier(text);` call |

---

---

## PART 2: MISSING FEATURES ANALYSIS

Beyond the critical API bugs, the vogler-v2 scripts are **missing massive amounts of functionality** present in the functional Trinity scripts. This is a comprehensive comparison.

---

## Missing from Shared Library

### CRITICAL MISSING: buildCard() Utility
Trinity has a robust `buildCard()` wrapper (lines 815-883) that:
- Validates all inputs
- Handles index positioning
- Returns sealed card references
- Provides proper error handling
- Works around AI Dungeon quirks

**Vogler has**: Simple `getCard(key)` that only finds cards by key string.

### CRITICAL MISSING: safeLog() Utility
Trinity has `safeLog(message, level)` (lines 310-319) that:
- Respects CONFIG debug settings
- Uses emoji prefixes for log levels
- Provides consistent logging

**Vogler has**: Raw `log()` calls scattered throughout.

### CRITICAL MISSING: CONFIG Object
Trinity has comprehensive CONFIG (lines 26-203):
- `CONFIG.vs` - Verbalized Sampling settings
- `CONFIG.bonepoke` - Quality analysis settings
- `CONFIG.ngo` - NGO engine settings (50+ parameters)
- `CONFIG.commands` - Command system settings
- `CONFIG.smartReplacement` - Replacement system settings
- `CONFIG.system` - System settings

**Vogler has**: Only basic `DEBUG_CONFIG`, `VOGLER_BEAT_CONFIG`, `SAE_BRIDGE_CONFIG`, `NGO_CONFIG` with minimal parameters.

### CRITICAL MISSING: Core Systems

| Trinity System | Purpose | Vogler Has? |
|----------------|---------|-------------|
| `VerbalizedSampling` | VS diversity system | NO |
| `BonepokeAnalysis` | Quality analysis (fatigue, drift, MARM) | NO |
| `DynamicCorrection` | Auto-correction via story cards | NO |
| `Analytics` | Usage tracking and metrics | NO |
| `NGOEngine` | Full narrative engine | PARTIAL (only sync) |
| `NGOCommands` | @req, (), @temp, @arc commands | PARTIAL |
| `PlayersAuthorsNoteCard` | Player's author note card | NO |
| `AutoCards` | Automatic story card generation | NO |
| `SYNONYM_MAP` | 200+ word synonyms | NO |
| `ENHANCED_SYNONYM_MAP` | Extended synonyms with tags | NO |
| `NGO_WORD_LISTS` | Conflict/calming word detection | NO |
| `NGO_PHASES` | 5 narrative phases | NO |
| `STOPWORDS` | 120+ protected functional words | NO |

### CRITICAL MISSING: Story Card Management Functions

| Trinity Function | Purpose | Vogler Has? |
|------------------|---------|-------------|
| `buildCard()` | Robust card creation with validation | NO |
| `getCard(predicate)` | Find cards by predicate function | NO (only by key) |
| `removeCard()` | Safe card removal | NO |
| `ensureBannedWordsCard()` | PRECISE word bank | NO |
| `ensureAggressiveCard()` | AGGRESSIVE word bank | NO |
| `ensureReplacerCard()` | REPLACER word bank | NO |

---

## Missing from Context Script

### CRITICAL MISSING: Quality Analysis Integration
```javascript
// Trinity Context has:
const analyzeRecentHistory = () => {
    const recentOutputs = history.filter(h => h.type === 'ai').slice(-3)...
    return BonepokeAnalysis.analyze(recentOutputs);
};
if (CONFIG.bonepoke.enabled && CONFIG.bonepoke.enableDynamicCorrection) {
    const recentAnalysis = analyzeRecentHistory();
    DynamicCorrection.applyCorrections(recentAnalysis);
}
```
**Vogler has**: Nothing - no quality analysis.

### CRITICAL MISSING: Layered Author's Note System
Trinity builds author's note with 3+ layers:
1. `PlayersAuthorsNoteCard.getPlayerContent()` - User's stable note
2. `getCurrentNGOPhase().authorNoteGuidance` - Dynamic phase guidance
3. `NGOCommands.buildAuthorsNoteLayer()` - Command memories

**Vogler has**: Simple single-layer stage guidance injection.

### CRITICAL MISSING: VS Integration
```javascript
// Trinity Context has:
if (CONFIG.vs.enabled && CONFIG.vs.adaptive) {
    const adaptedParams = VerbalizedSampling.analyzeContext(text);
    VerbalizedSampling.updateCard(adaptedParams);
}
text += '\n\n' + VerbalizedSampling.getInstruction();
```
**Vogler has**: Nothing - no Verbalized Sampling.

### CRITICAL MISSING: AutoCards Integration
```javascript
// Trinity Context has:
const autoCardsResult = AutoCards("context", text, stop);
```
**Vogler has**: Nothing - no automatic card generation.

### CRITICAL MISSING: Continue Handling
Trinity has proper continue handling for incomplete sentences.
**Vogler has**: Nothing.

---

## Missing from Input Script

### CRITICAL MISSING: Full NGOCommands Processing
```javascript
// Trinity Input has:
const commandResult = NGOCommands.processAllCommands(text);
text = commandResult.processed;
```
**Vogler has**: Only basic @stage, @beat, @bridge, @temp parsing.

### CRITICAL MISSING: Front Memory Injection
```javascript
// Trinity Input has:
if (CONFIG.commands.reqDualInjection && state.commands.narrativeRequest) {
    state.memory.frontMemory = NGOCommands.buildFrontMemoryInjection();
}
```
**Vogler has**: Nothing - no frontMemory support.

### CRITICAL MISSING: Better Say Actions (Full Version)
Trinity has comprehensive dialogue formatting from BinKompliziert with:
- All trigger words (say, exclaim, whisper, mutter, utter, shout, yell, scream, ask, answer, reply, respond, joke, lie)
- Double comma pattern handling
- Proper capitalization

**Vogler has**: Basic partial implementation.

### CRITICAL MISSING: NGO Conflict Analysis
```javascript
// Trinity Input has:
const conflictData = NGOEngine.analyzeConflict(text);
const heatResult = NGOEngine.updateHeat(conflictData, 'player');
```
**Vogler has**: Nothing - no heat tracking from player input.

### CRITICAL MISSING: AutoCards Integration
```javascript
// Trinity Input has:
text = AutoCards("input", text);
```
**Vogler has**: Nothing.

---

## Missing from Output Script

### CRITICAL MISSING: NGO Author's Note Restoration
```javascript
// Trinity Output has:
if (state.memory.authorsNote !== state.authorsNoteStorage) {
    state.memory.authorsNote = state.authorsNoteStorage;
}
```
**Vogler has**: Nothing - author's note can be lost.

### CRITICAL MISSING: AutoCards Integration
```javascript
// Trinity Output has:
text = AutoCards("output", text);
```
**Vogler has**: Nothing.

### CRITICAL MISSING: Comprehensive Output Cleaning
Trinity cleanOutput() removes:
- XML tags (response, probability, text, candidate, selected)
- VS instruction leaks
- Trailing "stop" quirk
- Multiple newlines

**Vogler has**: Basic XML and marker removal only.

### CRITICAL MISSING: Bonepoke Quality Analysis
```javascript
// Trinity Output has:
const analysis = BonepokeAnalysis.analyze(text);
state.bonepokeHistory.push(analysis);
state.lastBonepokeScore = analysis.avgScore;
```
**Vogler has**: Nothing - no quality tracking.

### CRITICAL MISSING: NGO Turn Processing
```javascript
// Trinity Output has:
const turnResult = NGOEngine.processTurn();
// Handles overheat completion, cooldown completion, phase tracking
```
**Vogler has**: Nothing - no NGO turn processing.

### CRITICAL MISSING: Cross-Output N-gram Tracking
Trinity tracks 2-3 word phrases across outputs to detect repetition.
**Vogler has**: Nothing.

### CRITICAL MISSING: Word Bank Card Processing
Trinity reads from three user-editable cards:
- `banned_words` - PRECISE removal
- `aggressive_removal` - Sentence removal
- `word_replacer` - Custom synonyms

**Vogler has**: Nothing - no word bank support.

### CRITICAL MISSING: Smart Replacement System
Trinity has sophisticated synonym replacement with:
- Context matching
- Adaptive learning
- Validation
- Dimension-aware selection

**Vogler has**: Nothing.

### CRITICAL MISSING: Analytics Recording
```javascript
// Trinity Output has:
Analytics.recordOutput(analysis);
Analytics.recordRegeneration();
```
**Vogler has**: Nothing.

---

## Repair Priority Levels

### P0 - CRITICAL (Scripts non-functional without these)
1. Fix addStoryCard() API calls
2. Fix updateStoryCard() API calls
3. Remove modifier(text) calls

### P1 - HIGH (Core functionality broken)
1. Add `safeLog()` utility
2. Add `buildCard()` utility with validation
3. Add proper `getCard()` with predicate support
4. Add comprehensive CONFIG object

### P2 - MEDIUM (Major features missing)
1. Add `PlayersAuthorsNoteCard` system
2. Add layered author's note building
3. Add `AutoCards` integration hooks
4. Add NGO author's note restoration
5. Add comprehensive output cleaning

### P3 - ENHANCEMENT (Quality of life)
1. Add `BonepokeAnalysis` integration
2. Add `NGOEngine` full integration
3. Add `NGOCommands` full integration
4. Add `VerbalizedSampling` integration
5. Add word bank card support
6. Add cross-output tracking
7. Add analytics

---

## Recommended Approach

Given the extensive missing features, there are two approaches:

### Option A: Minimal Fix (P0 only)
Fix only the API bugs to make scripts functional. Vogler-specific features will work, but no Trinity quality systems.

**Pros**: Quick, focused
**Cons**: Missing quality control, no synonym replacement, no adaptive systems

### Option B: Full Integration
Port all Trinity systems into Vogler, creating a comprehensive integrated solution.

**Pros**: Full feature parity, quality control, all systems working together
**Cons**: Major effort, risk of new bugs, larger codebase

### Recommendation
Start with **Option A** to get basic functionality working, then incrementally add P1 features. P2 and P3 can be added in future iterations.

---

## Version

**Blueprint Version**: 2.1.0
**Date**: 2025-12-16
**Status**: Comprehensive Analysis Complete with Best Practices API Verification

### Changelog
- **v2.1.0**: Added definitive API signatures from aidungeon.d.ts, known API issues, and Director pattern alternative
- **v2.0.0**: Added comprehensive missing features analysis comparing to Trinity scripts
- **v1.0.0**: Initial bug identification (addStoryCard/updateStoryCard API misuse)
