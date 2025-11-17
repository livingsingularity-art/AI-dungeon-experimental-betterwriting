# AI Dungeon Scripting Best Practices

## 📋 Core Principles

### 1. Script Execution Order

Understanding the execution flow is critical:

```
Hook Triggered
    ↓
sharedLibrary executes (global scope)
    ↓
Lifecycle script executes (local scope)
    ↓
Return { text } or { text, stop }
```

**Key Points:**
- SharedLibrary runs **before** every lifecycle script
- SharedLibrary scope is **global** across all hooks
- Lifecycle scripts have **local** scope
- Each hook gets fresh execution context

### 2. Always End Scripts with `void 0`

**Every script file** must end with:

```javascript
// ... your code ...

// Best Practice: Always end with void 0
void 0;
```

**Why?** AI Dungeon's script engine evaluates the last expression. `void 0` ensures consistent behavior and prevents accidental returns.

### 3. Use Modern StoryCards API

❌ **DEPRECATED (Old Way):**
```javascript
addWorldEntry(keys, entry);
updateWorldEntry(index, keys, entry);
removeWorldEntry(index);
```

✅ **MODERN (Correct Way):**
```javascript
addStoryCard(keys, entry, type);
updateStoryCard(index, keys, entry, type);
removeStoryCard(index);
```

**Better:** Use helper functions that handle edge cases:

```javascript
// From our sharedLibrary
const card = buildCard(title, entry, type, keys, description, index);
const found = getCard(c => c.title === 'MyCard');
const removed = removeCard('MyCard');
```

### 4. State Management

Use `state` object for persistence across turns:

```javascript
// Initialize state safely
state.myVar = state.myVar || defaultValue;

// Store complex data
state.myHistory = state.myHistory || [];
state.myHistory.push(newData);

// Limit array growth (prevent memory issues)
if (state.myHistory.length > 50) {
    state.myHistory = state.myHistory.slice(-50);
}
```

**Available state locations:**
- `state.*` - Persists across turns in same adventure
- `info.*` - Read-only scenario/game info
- `history` - Array of previous actions/outputs
- `text` - Current text being processed
- `storyCards` - Array of story cards (world info)

### 5. Safe Logging

Never assume console is available:

```javascript
// ❌ Bad: May error in production
console.log("Debug info");

// ✅ Good: Use built-in log function
log("Debug info");

// ✅ Better: Conditional logging
const safeLog = (message, enabled = false) => {
    if (enabled) {
        log(message);
    }
};
```

### 6. Avoid Direct Modifications

❌ **Bad: Modifying shared variables**
```javascript
// In sharedLibrary
let myCounter = 0;

// In lifecycle script
myCounter++; // DON'T DO THIS - unreliable scope
```

✅ **Good: Use state for shared data**
```javascript
// In sharedLibrary
const initCounter = () => {
    state.myCounter = state.myCounter || 0;
};

// In lifecycle script
state.myCounter++; // ✓ Reliable
```

### 7. Return Value Patterns

**Input & Context Scripts:**
```javascript
const modifier = (text) => {
    // ... process text ...
    return { text };  // Modified text
};
```

**Output Script - Normal:**
```javascript
const modifier = (text) => {
    // ... process text ...
    return { text };  // Show this text
};
```

**Output Script - Regenerate:**
```javascript
const modifier = (text) => {
    if (qualityIsPoor) {
        return { text: '', stop: true };  // Trigger regeneration
    }
    return { text };
};
```

**Important:** `stop: true` only works in output hook and triggers regeneration.

## 🎯 Common Patterns

### Pattern 1: Safe Initialization

```javascript
// SharedLibrary
const initMySystem = () => {
    if (state.mySystemInit) return;  // Already initialized

    state.mySystemData = {
        counter: 0,
        history: [],
        config: { /* defaults */ }
    };

    state.mySystemInit = true;
};

initMySystem();  // Call in sharedLibrary
```

### Pattern 2: Configuration Object

```javascript
// SharedLibrary - Single source of truth
const CONFIG = {
    feature1: {
        enabled: true,
        param1: 5,
        param2: 0.10
    },
    feature2: {
        enabled: false
    }
};

// Lifecycle scripts can read CONFIG
if (CONFIG.feature1.enabled) {
    // ... use feature
}
```

### Pattern 3: Conditional Feature Execution

```javascript
// SharedLibrary
const MyFeature = (() => {
    const process = (text) => {
        // ... feature logic ...
        return text;
    };

    return {
        process,
        enabled: () => CONFIG.myFeature.enabled
    };
})();

// Lifecycle script
const modifier = (text) => {
    if (MyFeature.enabled()) {
        text = MyFeature.process(text);
    }
    return { text };
};
```

### Pattern 4: Story Card Helper

```javascript
// SharedLibrary
const ensureCard = (title, entry, type = "Custom") => {
    let card = storyCards.find(c => c.title === title);

    if (!card) {
        addStoryCard(title, entry, type);
        card = storyCards.find(c => c.title === title);
    } else {
        card.entry = entry;  // Update existing
    }

    return card;
};
```

### Pattern 5: Regeneration with Limit

```javascript
// Output script
const modifier = (text) => {
    // Initialize regen counter
    state.regenCount = state.regenCount || 0;
    state.regenThisOutput = state.regenThisOutput || 0;

    const MAX_ATTEMPTS = 3;

    if (shouldRegenerate(text) && state.regenThisOutput < MAX_ATTEMPTS) {
        state.regenCount++;
        state.regenThisOutput++;
        return { text: '', stop: true };
    }

    // Success - reset counter
    state.regenThisOutput = 0;
    return { text };
};
```

### Pattern 6: Historical Analysis

```javascript
// Context script
const modifier = (text) => {
    // Get last N AI outputs
    const recentOutputs = history
        .filter(h => h.type === 'ai')
        .slice(-3)
        .map(h => h.text);

    // Analyze patterns
    const hasRepetition = /* check logic */;

    if (hasRepetition) {
        // Apply correction
    }

    return { text };
};
```

### Pattern 7: Dynamic Story Cards

```javascript
// Context script
const modifier = (text) => {
    // Remove old dynamic cards
    state.dynamicCards = state.dynamicCards || [];
    state.dynamicCards.forEach(title => {
        const index = storyCards.findIndex(c => c.title === title);
        if (index > -1) {
            removeStoryCard(index);
        }
    });
    state.dynamicCards = [];

    // Create new ones based on analysis
    if (needsCorrection) {
        addStoryCard("DynamicFix", "correction text", "guidance");
        state.dynamicCards.push("DynamicFix");
    }

    return { text };
};
```

## 🚫 Anti-Patterns (Avoid These)

### ❌ Forgetting void 0

```javascript
// Last line of script
return { text };
// ← Missing void 0 here!
```

**Problem:** Inconsistent behavior, may cause subtle bugs

**Fix:**
```javascript
return { text };

void 0;  // ✓ Always add this
```

### ❌ Using console.log

```javascript
console.log("Debug info");  // May error
```

**Fix:**
```javascript
log("Debug info");  // ✓ Use built-in
```

### ❌ Assuming History Exists

```javascript
const lastOutput = history[history.length - 1].text;  // May crash
```

**Fix:**
```javascript
const lastEntry = history[history.length - 1];
const lastOutput = lastEntry?.text || '';  // ✓ Safe
```

### ❌ Infinite Regeneration

```javascript
// Output script
if (text.length < 50) {
    return { text: '', stop: true };  // Loops forever!
}
```

**Fix:**
```javascript
const MAX_ATTEMPTS = 3;
state.attempts = (state.attempts || 0) + 1;

if (text.length < 50 && state.attempts < MAX_ATTEMPTS) {
    return { text: '', stop: true };
}

state.attempts = 0;  // Reset on success
return { text };
```

### ❌ Memory Leaks

```javascript
// Storing unbounded data
state.allOutputs.push(text);  // Grows forever!
```

**Fix:**
```javascript
state.allOutputs = state.allOutputs || [];
state.allOutputs.push(text);

// Limit size
if (state.allOutputs.length > 100) {
    state.allOutputs = state.allOutputs.slice(-100);
}
```

### ❌ Modifying Config from Scripts

```javascript
// SharedLibrary
const CONFIG = { enabled: true };

// Lifecycle script
CONFIG.enabled = false;  // DON'T DO THIS
```

**Fix:**
```javascript
// Use state for runtime changes
state.featureEnabled = !CONFIG.enabled;

if (state.featureEnabled !== undefined ? state.featureEnabled : CONFIG.enabled) {
    // Use feature
}
```

### ❌ Complex Logic in Context

```javascript
// Context script - 500 lines of analysis
const modifier = (text) => {
    // Huge processing here ← Slows down every turn
    return { text };
};
```

**Fix:**
```javascript
// SharedLibrary - define complex logic once
const MyAnalyzer = (() => {
    // Complex logic here
    return { analyze };
})();

// Context script - just call it
const modifier = (text) => {
    const result = MyAnalyzer.analyze(text);
    return { text };
};
```

## 📐 Code Organization

### File Structure

```javascript
// ============================================================================
// SCRIPT NAME
// Brief description
// ============================================================================

// #region Configuration
const CONFIG = { /* ... */ };
// #endregion

// #region Utilities
const helper1 = () => { /* ... */ };
const helper2 = () => { /* ... */ };
// #endregion

// #region Main System
const MySystem = (() => {
    // Private variables
    const privateVar = 'secret';

    // Public API
    return {
        publicMethod: () => { /* ... */ }
    };
})();
// #endregion

// #region Initialization
initState();
MySystem.init();
// #endregion

void 0;
```

### Commenting

```javascript
/**
 * Clear function description
 * @param {string} text - Parameter description
 * @returns {Object} Return value description
 */
const myFunction = (text) => {
    // Implementation comment explaining WHY not WHAT
    return { text };
};
```

### Naming Conventions

- **Functions**: camelCase (`analyzeText`, `getCard`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ATTEMPTS`, `DEFAULT_CONFIG`)
- **Classes/Modules**: PascalCase (`VerbalizedSampling`, `BonepokeAnalysis`)
- **Private**: Prefix with underscore (`_internalHelper`)

## ⚡ Performance Tips

### 1. Cache Expensive Operations

```javascript
// ❌ Bad: Recalculate every time
const modifier = (text) => {
    const allWords = text.split(/\s+/);
    const uniqueWords = new Set(allWords);
    const wordCount = allWords.length;
    // ...
};

// ✅ Good: Cache in state if needed again
state.lastAnalysis = state.lastAnalysis || {};
if (state.lastAnalysis.text !== text) {
    state.lastAnalysis = {
        text,
        words: text.split(/\s+/),
        unique: new Set(text.split(/\s+/)),
        count: text.split(/\s+/).length
    };
}
```

### 2. Limit Array Operations

```javascript
// ❌ Slow: Processing entire history
history.forEach(entry => { /* complex operation */ });

// ✅ Fast: Process only recent
history.slice(-10).forEach(entry => { /* ... */ });
```

### 3. Use Early Returns

```javascript
// ❌ Nested conditions
const modifier = (text) => {
    if (CONFIG.enabled) {
        if (text.length > 0) {
            if (shouldProcess(text)) {
                // deep nesting
            }
        }
    }
    return { text };
};

// ✅ Early returns
const modifier = (text) => {
    if (!CONFIG.enabled) return { text };
    if (text.length === 0) return { text };
    if (!shouldProcess(text)) return { text };

    // main logic at shallow level
    return { text };
};
```

### 4. Minimize Story Card Operations

```javascript
// ❌ Slow: Repeated card operations
for (let i = 0; i < 10; i++) {
    addStoryCard(`Card${i}`, "content", "Custom");
}

// ✅ Fast: Batch operations
const cards = Array.from({ length: 10 }, (_, i) => ({
    title: `Card${i}`,
    entry: "content"
}));

cards.forEach(({title, entry}) => addStoryCard(title, entry, "Custom"));
```

## 🧪 Testing Patterns

### Debug Wrapper

```javascript
// SharedLibrary
const DEBUG = false;

const debugLog = (label, value) => {
    if (DEBUG) {
        log(`[DEBUG] ${label}:`, JSON.stringify(value, null, 2));
    }
};

// Use throughout scripts
debugLog('Input received', text);
debugLog('State after processing', state.myData);
```

### Assertion Helper

```javascript
const assert = (condition, message) => {
    if (!condition) {
        log(`❌ ASSERTION FAILED: ${message}`);
        // Optionally throw error to halt execution
        throw new Error(message);
    }
};

// Use in critical paths
assert(CONFIG.vs.tau >= 0.05 && CONFIG.vs.tau <= 0.20,
    'tau must be between 0.05 and 0.20');
```

### Feature Flags

```javascript
const FEATURES = {
    experimentalFeature1: false,
    betaFeature2: true,
    debugMode: false
};

if (FEATURES.experimentalFeature1) {
    // New feature code
} else {
    // Stable code
}
```

## 📚 Further Reading

- [Official AI Dungeon Scripting Docs](https://help.aidungeon.com/scripting)
- [AI Dungeon Discord #scripting](https://discord.gg/aidungeon)
- [Mozilla JavaScript Guide](https://developer.mozilla.org/docs/Web/JavaScript/Guide)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

## 🎓 Key Takeaways

1. ✅ Always end scripts with `void 0`
2. ✅ Use modern `storyCards` API (not worldinfo)
3. ✅ Use `state` for persistence
4. ✅ Understand execution order: Hook → SharedLibrary → Lifecycle
5. ✅ SharedLibrary is global, lifecycle scripts are local
6. ✅ Use `log()` not `console.log()`
7. ✅ Return `{ text }` or `{ text, stop }`
8. ✅ Limit regeneration attempts to prevent loops
9. ✅ Bound array sizes to prevent memory issues
10. ✅ Cache expensive operations when possible

---

**Follow these practices and your AI Dungeon scripts will be robust, maintainable, and performant!**
