# How to Fix the @req and (...) Command Bug

## Quick Fix (5 Minutes)

### Problem
The `@req` and `(...)` commands fail with "unable to run script error" due to JavaScript function hoisting issues.

### Solution
Reorder two functions in the **Shared Library** script in AI Dungeon's scenario editor.

---

## Step-by-Step Instructions

### 1. Open AI Dungeon Scenario Editor

1. Go to your Trinity scenario in AI Dungeon
2. Click **Edit Scenario**
3. Navigate to **Scripts** tab
4. Select **Shared Library > Library**

### 2. Find the NGOCommands Module

Press `Ctrl+F` (or `Cmd+F` on Mac) and search for:

```
const NGOCommands = (() => {
```

You should find it around line 4634.

### 3. Locate the Problem Functions

Scroll down within the `NGOCommands` module until you find:

```javascript
const processAllCommands = (text) => {
```

This should be around line 4816 (or line 183 within the module).

Keep scrolling down to find these two functions:

```javascript
const processReport = (text) => {
```
(Around line 4946 / line 313 within module)

```javascript
const processStrictness = (text) => {
```
(Around line 4967 / line 334 within module)

### 4. Apply the Fix

**OPTION A: Copy-Paste the Fixed Module**

1. Open the file `NGOCommands_FIXED.js` from this repository
2. Copy the ENTIRE contents (it's the complete fixed NGOCommands module)
3. In AI Dungeon editor, select the entire `NGOCommands` module (from `const NGOCommands = (() => {` to the closing `})();`)
4. Paste the fixed version
5. Save

**OPTION B: Manual Reordering (If you want to understand the fix)**

1. **CUT** the `processReport` function (entire function from start to closing `};`)
2. **CUT** the `processStrictness` function (entire function from start to closing `};`)
3. **PASTE** both functions BEFORE the `processAllCommands` function

The correct order should be:

```javascript
const NGOCommands = (() => {
    // 1. processReq - already here ✓
    // 2. processParentheses - already here ✓
    // 3. processTemp - already here ✓
    // 4. processArc - already here ✓

    // 5. processReport - MOVE HERE (was after processAllCommands)
    const processReport = (text) => {
        // ... function body ...
    };

    // 6. processStrictness - MOVE HERE (was after processAllCommands)
    const processStrictness = (text) => {
        // ... function body ...
    };

    // 7. processAllCommands - NOW it can call the above functions
    const processAllCommands = (text) => {
        // ... calls processReport and processStrictness ...
    };

    // 8. Rest of the functions...
    // buildFrontMemoryInjection
    // buildAuthorsNoteLayer
    // detectFulfillment
    // cleanupExpiredMemories

    return {
        processReq,
        processParentheses,
        processTemp,
        processArc,
        processReport,
        processStrictness,
        processAllCommands,
        buildFrontMemoryInjection,
        buildAuthorsNoteLayer,
        detectFulfillment,
        cleanupExpiredMemories
    };
})();
```

### 5. Save the Scenario

Click **Save** or **Update** in the AI Dungeon editor.

---

## Testing the Fix

### Test 1: @req Command

1. Start or continue your adventure
2. In the input field, type:
   ```
   @req the dragon appears
   ```
3. Submit the action

**Expected Result:**
- Console shows: `🎯 @req: "the dragon appears" (heat +2)`
- Your input is cleaned (the `@req` part is removed)
- The AI output should incorporate your request

**Failure Indicator:**
- Error: "unable to run script error"
- No console output

### Test 2: (...) Memory Command

1. In the input field, type:
   ```
   I look around (find the ancient sword)
   ```
2. Submit the action

**Expected Result:**
- Console shows: `📝 Memory stored: "find the ancient sword" (expires turn X)`
- Your input becomes: `I look around` (parentheses removed)
- Memory should influence next few AI outputs

**Failure Indicator:**
- Error: "unable to run script error"
- Parentheses not removed from text

### Test 3: Bonus Commands

Try these to ensure everything works:

```
@temp +2
```
Should show: `🌡️ Temperature +2 → X`

```
@report
```
Should show performance statistics

```
@strictness aggressive
```
Should show: `✅ Applied aggressive strictness preset`

---

## Troubleshooting

### "Still getting errors"

**Check:**
1. Did you save the scenario after editing?
2. Did you reload the adventure page? (Hard refresh: `Ctrl+Shift+R`)
3. Are there any syntax errors? Check the console for details

**Common mistakes:**
- Missing a closing brace `}`
- Missing a semicolon `;`
- Accidentally deleting part of a function
- Not saving the scenario

**Solution:** If in doubt, use **Option A** (copy the fixed file) instead of manual editing.

### "Commands work but no console output"

Check that debug logging is enabled in CONFIG:

```javascript
const CONFIG = {
    commands: {
        enabled: true,
        debugLogging: true,  // ← Make sure this is true
        // ...
    },
    // ...
};
```

### "Only some commands work"

If `@req` and `(...)` now work but `@report` or `@strictness` don't:
- The fix was only partially applied
- Re-apply the full fix using **Option A**

---

## Why This Fix Works

### The Problem (Technical)

In JavaScript, `const` arrow functions are **not hoisted** to the top of their scope. They only exist **after** their definition line.

**Broken code:**
```javascript
const myFunction = () => {
    helperA();  // ❌ ERROR: helperA doesn't exist yet!
};

const helperA = () => {
    // defined AFTER being called
};
```

**Fixed code:**
```javascript
const helperA = () => {
    // defined FIRST
};

const myFunction = () => {
    helperA();  // ✅ OK: helperA exists now
};
```

### The Original Bug

```javascript
// Line 183: processAllCommands defined FIRST
const processAllCommands = (text) => {
    const reportResult = processReport(processed);      // 💥 CRASH: processReport doesn't exist!
    const strictnessResult = processStrictness(processed); // 💥 CRASH: processStrictness doesn't exist!
    // ...
};

// Line 313: processReport defined LATER
const processReport = (text) => { /* ... */ };

// Line 334: processStrictness defined LATER
const processStrictness = (text) => { /* ... */ };
```

When `processAllCommands` tried to call `processReport()`, JavaScript threw:
```
ReferenceError: processReport is not defined
```

This error **prevented all commands from working**, not just `@report` and `@strictness`.

### The Fix

Move `processReport` and `processStrictness` **before** `processAllCommands`:

```javascript
// FIXED: Dependencies defined FIRST
const processReport = (text) => { /* ... */ };
const processStrictness = (text) => { /* ... */ };

// Now processAllCommands can safely call them
const processAllCommands = (text) => {
    const reportResult = processReport(processed);      // ✅ Works!
    const strictnessResult = processStrictness(processed); // ✅ Works!
    // ...
};
```

---

## Alternative: Prevent Future Issues

To avoid hoisting issues entirely, use traditional function declarations:

```javascript
// These are automatically hoisted
function processReport(text) { /* ... */ }
function processStrictness(text) { /* ... */ }
function processAllCommands(text) { /* ... */ }
```

However, for consistency with the existing codebase, **stick with arrow functions** and just ensure proper ordering.

---

## Reference Files

- `TRINITY_SCRIPTING_BUG_REPORT.md` - Detailed technical analysis
- `NGOCommands_FIXED.js` - Complete fixed NGOCommands module
- `HOW_TO_FIX.md` - This file

---

## Support

If you encounter issues after applying this fix:

1. Check the console for error messages
2. Verify your edit matches the fixed file exactly
3. Try a hard refresh of the page (`Ctrl+Shift+R`)
4. Create a GitHub issue with the error details

---

*Fix documentation created: 2025-01-19*
*Trinity Scripting System v2.9*
