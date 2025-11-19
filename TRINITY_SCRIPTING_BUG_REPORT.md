# Trinity Scripting Bug Report

## Executive Summary

**Issue**: The `@req` and `(...)` commands fail with "unable to run script error"

**Root Cause**: JavaScript hoisting/scope issue - functions are being called before they're defined

**Severity**: CRITICAL - Completely breaks command system

**Status**: ✅ IDENTIFIED - Fix ready to apply

---

## Technical Analysis

### The Problem

In `trinityScripts/trinitysharedLibrary(1).js`, the `NGOCommands` module has a **function ordering bug**:

```javascript
// Line 4816: processAllCommands is defined FIRST
const processAllCommands = (text) => {
    // ...
    const reportResult = processReport(processed);      // ❌ ERROR: processReport doesn't exist yet!
    const strictnessResult = processStrictness(processed); // ❌ ERROR: processStrictness doesn't exist yet!
    const reqResult = processReq(processed);            // ✅ OK: defined earlier
    const parenResult = processParentheses(processed);  // ✅ OK: defined earlier
    // ...
};

// Line 4946: processReport is defined LATER
const processReport = (text) => {
    // ...
};

// Line 4967: processStrictness is defined LATER
const processStrictness = (text) => {
    // ...
};
```

### Why This Breaks

1. **JavaScript hoisting**: `const` and `let` declarations are **not hoisted** like `function` declarations
2. **Temporal Dead Zone**: `processReport` and `processStrictness` don't exist until their definition lines
3. **ReferenceError**: When `processAllCommands` executes, it tries to call undefined functions
4. **Cascade failure**: This error prevents the entire Input script from running, blocking ALL commands

### Why @req and (...) Both Fail

Both commands are processed by `processAllCommands()`:
- Input script calls: `NGOCommands.processAllCommands(text)`
- `processAllCommands` **immediately** calls `processReport()` and `processStrictness()`
- These calls throw `ReferenceError` **before** reaching `processReq()` or `processParentheses()`
- Result: **All commands fail**, not just @req and (...)

---

## The Fix

### Solution 1: Reorder Function Definitions (RECOMMENDED)

Move `processReport` and `processStrictness` **BEFORE** `processAllCommands`:

```javascript
// INSIDE NGOCommands MODULE:

// 1. Define processReport FIRST
const processReport = (text) => {
    const reportRegex = /@report|\/report/i;
    const match = text.match(reportRegex);
    if (!match) return { processed: text, found: false, shouldDisplay: false };

    const report = generateReplacementReport();
    log(report);
    const processed = text.replace(reportRegex, '').trim();
    return { processed, found: true, shouldDisplay: true };
};

// 2. Define processStrictness SECOND
const processStrictness = (text) => {
    const strictnessRegex = /@strictness\s+(conservative|balanced|aggressive)/i;
    const match = text.match(strictnessRegex);
    if (!match) return { processed: text, found: false };

    const level = match[1].toLowerCase();
    const success = applyStrictnessPreset(level);
    const processed = text.replace(strictnessRegex, '').trim();
    return { processed, found: true, level, success };
};

// 3. NOW define processAllCommands (can safely call above functions)
const processAllCommands = (text) => {
    if (!CONFIG.commands.enabled) return { processed: text, commands: {} };

    let processed = text;
    const commands = {};

    // Now these calls work!
    const reportResult = processReport(processed);
    processed = reportResult.processed;
    if (reportResult.found) commands.report = true;

    const strictnessResult = processStrictness(processed);
    processed = strictnessResult.processed;
    if (strictnessResult.found) commands.strictness = strictnessResult.level;

    const reqResult = processReq(processed);
    processed = reqResult.processed;
    if (reqResult.found) commands.req = reqResult.request;

    const parenResult = processParentheses(processed);
    processed = parenResult.processed;
    if (parenResult.found) commands.parentheses = parenResult.memories;

    const tempResult = processTemp(processed);
    processed = tempResult.processed;
    if (tempResult.found) commands.temp = { action: tempResult.action, value: tempResult.value };

    const arcResult = processArc(processed);
    processed = arcResult.processed;
    if (arcResult.found) commands.arc = arcResult.phase;

    return { processed, commands };
};
```

### Solution 2: Use Function Declarations (Alternative)

Convert to traditional function declarations (automatically hoisted):

```javascript
// These are automatically hoisted to the top of the scope
function processReport(text) { /* ... */ }
function processStrictness(text) { /* ... */ }
function processAllCommands(text) { /* ... */ }
```

**RECOMMENDATION**: Use Solution 1 (reordering) as it maintains the existing arrow function style and is more explicit about dependencies.

---

## Validation

### How to Test the Fix

1. **Apply the fix** (reorder functions in sharedLibrary)
2. **Test @req command**:
   ```
   @req the dragon attacks
   ```
   - Should see: `🎯 @req: "the dragon attacks" (heat +2)`
   - Input should be cleaned (command removed)
   - Author's note should contain the request

3. **Test (...) command**:
   ```
   (find the ancient sword)
   ```
   - Should see: `📝 Memory stored: "find the ancient sword" (expires turn X)`
   - Input should be cleaned (parentheses removed)
   - Memory should appear in author's note

4. **Test @report command** (bonus):
   ```
   @report
   ```
   - Should see performance statistics
   - Should NOT throw error

5. **Test @strictness command** (bonus):
   ```
   @strictness aggressive
   ```
   - Should see: `✅ Applied aggressive strictness preset`
   - Should NOT throw error

### Expected Console Output (Success)

```
🎮 Commands: {"req":"the dragon attacks"}
🎯 @req: "the dragon attacks" (heat +2)
🔥 Player heat: 0.0 → 2.0 (conflicts: 0, calming: 0)
```

### Expected Console Output (Before Fix - Error)

```
ReferenceError: processReport is not defined
```

---

## Best Practices Violated

### From BEST_PRACTICES.md

**Violated Principle**: "Understanding the execution flow is critical"

```
Hook Triggered
    ↓
sharedLibrary executes (global scope)  ← ALL functions must be defined in correct order!
    ↓
Lifecycle script executes (local scope)
```

**Key Lesson**: In JavaScript, `const` arrow functions are **not hoisted**. Always define functions **before** they're called, or use traditional `function` declarations.

### Correct Pattern

```javascript
// ✅ GOOD: Dependencies defined first
const helperA = () => { /* ... */ };
const helperB = () => { /* ... */ };
const mainFunction = () => {
    helperA();  // OK - defined above
    helperB();  // OK - defined above
};

// ❌ BAD: Dependencies defined after use
const mainFunction = () => {
    helperA();  // ERROR - doesn't exist yet!
    helperB();  // ERROR - doesn't exist yet!
};
const helperA = () => { /* ... */ };
const helperB = () => { /* ... */ };
```

---

## Impact Assessment

### Broken Features
- ✅ `@req <request>` - Narrative requests
- ✅ `(...) memory` - Parentheses memory system
- ✅ `@temp +/-N` - Temperature control
- ✅ `@arc <phase>` - Arc control
- ✅ `@report` - Performance reports
- ✅ `@strictness <level>` - Strictness presets

### Working Features
- ✅ Bonepoke Analysis (quality detection)
- ✅ Verbalized Sampling (diversity)
- ✅ NGO Engine (heat/temperature)
- ✅ Smart Replacement (synonym system)
- ✅ Dialogue formatting
- ✅ Cross-output tracking

---

## Additional Issues Found

### Minor Issue: Missing Safeguard

The `generateReplacementReport()` function is defined **outside** the `NGOCommands` module (line 3208), but is called **inside** `processReport()`. While this works due to closure, it's not ideal.

**Recommendation**: Move `generateReplacementReport` inside `NGOCommands` or export it explicitly.

---

## Next Steps

1. ✅ **Apply fix** - Reorder functions in shared library
2. ✅ **Test** - Verify all commands work
3. ✅ **Commit** - Push fixes to Trinity branch
4. 📝 **Document** - Update scripting guidebook with hoisting warnings
5. 🧪 **Add tests** - Create test suite for command processing

---

## Code Location Reference

**File**: `trinityScripts/trinitysharedLibrary(1).js`

**Function Locations**:
- Line 4634: `NGOCommands` module start
- Line 4816: `processAllCommands` (called first, defined first - PROBLEM!)
- Line 4946: `processReport` (called second, defined last - BUG!)
- Line 4967: `processStrictness` (called third, defined last - BUG!)
- Line 5014: Module exports

**Fix Location**: Move lines 4946-4980 (processReport + processStrictness) to BEFORE line 4816

---

## Summary

**Problem**: Functions called before they're defined due to JavaScript hoisting rules

**Fix**: Reorder function definitions so dependencies come first

**Difficulty**: EASY - Simple code reorganization, no logic changes needed

**Testing**: HIGH PRIORITY - All command features currently broken

**Estimated Fix Time**: 5 minutes (code reorder + test)

---

*Bug report generated: 2025-01-19*
*Trinity Scripting System v2.9*
