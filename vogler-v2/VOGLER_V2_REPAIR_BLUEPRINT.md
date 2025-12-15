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

## Version

**Blueprint Version**: 1.0.0
**Date**: 2025-01-XX
**Status**: Ready for Implementation
