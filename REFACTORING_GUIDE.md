# Trinity Refactoring Guide

**Goal**: Split 5,127-line shared library into manageable, testable modules

**Benefits**:
- ✅ Faster editor performance
- ✅ Easier to understand and maintain
- ✅ Testable in isolation
- ✅ Can selectively disable features
- ✅ Reduces risk of bugs

---

## Quick Wins (Do First)

### 1. Move SYNONYM_MAP to StoryCard

**Impact**: Reduces shared library by ~1,800 lines (35% reduction!)

**Implementation**:

```javascript
// OLD (in shared library - 1,800 lines):
const SYNONYM_MAP = {
    "shiver": {
        synonyms: ["tremble", "quiver", "shake"],
        tags: ["emotion", "fear"],
        quality: { "Emotional Strength": 3 }
    },
    // ... 1,800 more lines ...
};

// NEW (in story card - loaded once):

// 1. Create initialization function in shared library:
const initializeSynonymCard = () => {
    const existing = storyCards.find(c => c.title === 'SynonymDatabase');
    if (existing) return;  // Already exists

    // Compact JSON format
    const synonymData = {
        "shiver": {
            s: ["tremble", "quiver", "shake"],
            t: ["emotion", "fear"],
            q: { "E": 3, "C": 3 }  // Shortened keys
        },
        // ... rest of synonyms ...
    };

    buildCard(
        'SynonymDatabase',
        JSON.stringify(synonymData),
        'Custom',
        '',
        'Synonym database for smart replacement system'
    );

    safeLog('✅ Created synonym database card', 'success');
};

// 2. Call during initialization:
if (!state.initialized) {
    initializeSynonymCard();
    state.initialized = true;
}

// 3. Update getSynonym() to read from card:
const getSynonym = (word) => {
    // Cache the parsed data
    if (!state.synonymCache) {
        const card = storyCards.find(c => c.title === 'SynonymDatabase');
        if (!card) return word;

        try {
            state.synonymCache = JSON.parse(card.entry);
        } catch (err) {
            safeLog(`Failed to parse synonym database: ${err.message}`, 'error');
            return word;
        }
    }

    const entry = state.synonymCache[word.toLowerCase()];
    if (!entry || !entry.s || entry.s.length === 0) {
        return word;  // No synonym found
    }

    // Return random synonym
    return entry.s[Math.floor(Math.random() * entry.s.length)];
};
```

**Result**:
- Shared library: 5,127 → 3,327 lines (35% reduction!)
- Faster parsing
- User can edit synonyms via story card editor
- Can export/import synonym database

---

### 2. Extract Magic Numbers

**Impact**: Better readability, easier tuning

**Find all magic numbers**:
```bash
grep -n '\b[0-9]\+\b' trinitysharedLibrary.js | grep -v '//' | head -20
```

**Replace with constants**:

```javascript
// BEFORE:
if (state.commands.requestHistory.length > 20) {
    state.commands.requestHistory = state.commands.requestHistory.slice(-20);
}

// AFTER:
const MAX_REQUEST_HISTORY = 20;

if (state.commands.requestHistory.length > MAX_REQUEST_HISTORY) {
    state.commands.requestHistory = state.commands.requestHistory.slice(-MAX_REQUEST_HISTORY);
}
```

**All magic numbers to extract**:
```javascript
// At top of shared library, after CONFIG:
const LIMITS = {
    MAX_REQUEST_HISTORY: 20,
    MAX_OUTPUT_HISTORY: 3,
    MAX_BONEPOKE_HISTORY: 5,
    MAX_PHASE_HISTORY: 50,
    MIN_LEARNING_SAMPLES: 3,
    MAX_REQUEST_LENGTH: 500,
    MAX_MEMORY_LENGTH: 200,
    MAX_SYNONYM_CACHE_SIZE: 1000
};
```

---

### 3. Add Error Boundaries

**Impact**: Prevents script crashes, better debugging

**Wrap all lifecycle script modifiers**:

```javascript
// trinityinput(1).js
const modifier = (text) => {
    try {
        // === EXISTING CODE HERE ===

        return { text };

    } catch (err) {
        // Log error with full context
        log(`❌ INPUT SCRIPT ERROR`);
        log(`Message: ${err.message}`);
        log(`Stack: ${err.stack}`);

        // Fallback: return original text (game continues)
        return { text };
    }
};

void 0;
```

**Same pattern for all 3 lifecycle scripts**:
- `trinityinput(1).js`
- `trinitycontext(1).js`
- `trinityoutput(1).js`

---

## Full Modularization (Long-term)

### Target Architecture

```
Shared Library (NEW - ~800 lines)
├─ Module loader
├─ Configuration
├─ State initialization
└─ Module instances

Modules (in story cards):
├─ bonepoke.json (BonepokeAnalysis)
├─ verbalized-sampling.json (VerbalizedSampling)
├─ ngo-engine.json (NGOEngine)
├─ ngo-commands.json (NGOCommands)
├─ smart-replacement.json (Smart Replacement)
├─ analytics.json (Analytics)
└─ synonym-database.json (SYNONYM_MAP)
```

### Module Loader Pattern

**Shared library becomes lightweight loader**:

```javascript
/// <reference no-default-lib="true"/>
/// <reference lib="es2022"/>
//@ts-check

// ============================================================================
// TRINITY SHARED LIBRARY v3.0 (Modular)
// ============================================================================

// #region Configuration
const CONFIG = {
    // ... all config ...
};
// #endregion

// #region Module Loader
/**
 * Load module code from story card
 * @param {string} moduleName - Name of module card
 * @returns {*} Module exports
 */
const loadModule = (moduleName) => {
    const card = storyCards.find(c => c.title === `Trinity_${moduleName}`);

    if (!card) {
        safeLog(`⚠️ Module not found: ${moduleName}`, 'warn');
        return null;
    }

    try {
        // Module card contains: { code: "...", version: "1.0.0" }
        const moduleData = JSON.parse(card.entry);

        // Execute module code in isolated scope
        const moduleFunc = new Function('CONFIG', 'state', 'log', 'storyCards', moduleData.code);
        const moduleExports = moduleFunc(CONFIG, state, log, storyCards);

        safeLog(`✅ Loaded module: ${moduleName} v${moduleData.version}`, 'info');
        return moduleExports;

    } catch (err) {
        safeLog(`❌ Failed to load module ${moduleName}: ${err.message}`, 'error');
        return null;
    }
};

/**
 * Load all modules
 */
const loadAllModules = () => {
    state.modules = {
        bonepoke: loadModule('bonepoke'),
        vs: loadModule('verbalized_sampling'),
        ngo: loadModule('ngo_engine'),
        commands: loadModule('ngo_commands'),
        smartReplace: loadModule('smart_replacement'),
        analytics: loadModule('analytics')
    };

    // Validate all loaded
    const missing = Object.entries(state.modules)
        .filter(([name, module]) => !module)
        .map(([name]) => name);

    if (missing.length > 0) {
        safeLog(`⚠️ Missing modules: ${missing.join(', ')}`, 'warn');
    }
};
// #endregion

// #region State Initialization
const initState = () => {
    if (state.initialized) return;

    // Initialize state
    state.ngo = { /* ... */ };
    state.commands = { /* ... */ };
    // ...

    // Load modules
    loadAllModules();

    state.initialized = true;
};

initState();
// #endregion

// #region Public API
// Expose module functions for lifecycle scripts
const BonepokeAnalysis = state.modules?.bonepoke || {};
const VerbalizedSampling = state.modules?.vs || {};
const NGOEngine = state.modules?.ngo || {};
const NGOCommands = state.modules?.commands || {};
const Analytics = state.modules?.analytics || {};
// #endregion

void 0;
```

### Example Module: Bonepoke

**Story Card**: `Trinity_bonepoke`

**Card Entry** (JSON):
```json
{
  "version": "1.0.0",
  "code": "(function() { const analyze = (text) => { /* analysis code */ }; return { analyze }; })()"
}
```

**Expanded Format** (for readability during development):

Create file: `modules/bonepoke.module.js`

```javascript
/**
 * Bonepoke Analysis Module
 * Quality analysis and fatigue detection
 */
(function() {
    'use strict';

    // Private variables
    const DIMENSIONS = [
        'Emotional Strength',
        'Character Clarity',
        'Story Flow',
        'Dialogue Weight',
        'Word Variety'
    ];

    // Private functions
    const scoreEmotionalStrength = (text) => {
        // ... scoring logic ...
    };

    const scoreCharacterClarity = (text) => {
        // ... scoring logic ...
    };

    // Public API
    const analyze = (text) => {
        if (!text || text.trim().length === 0) {
            return null;
        }

        const scores = {
            'Emotional Strength': scoreEmotionalStrength(text),
            'Character Clarity': scoreCharacterClarity(text),
            // ... other scores ...
        };

        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONS.length;

        const quality = avgScore >= 3.5 ? 'excellent' :
                       avgScore >= 3.0 ? 'good' :
                       avgScore >= 2.5 ? 'fair' : 'poor';

        return {
            scores,
            avgScore,
            quality,
            composted: extractComposted(text)
        };
    };

    const extractNGrams = (text, minSize, maxSize) => {
        // ... n-gram extraction ...
    };

    // Module exports
    return {
        analyze,
        extractNGrams,
        version: '1.0.0'
    };
})();
```

**To deploy**: Minify and store in story card

```bash
# Minify module
npx terser modules/bonepoke.module.js -c -m -o modules/bonepoke.min.js

# Create card entry
echo '{"version":"1.0.0","code":"' > bonepoke.card.json
cat modules/bonepoke.min.js >> bonepoke.card.json
echo '"}' >> bonepoke.card.json
```

---

## Migration Strategy

### Phase 1: Preparation (No Breaking Changes)

**Goal**: Set up infrastructure without breaking existing code

**Steps**:

1. **Add module loader to shared library** (end of file)
2. **Create empty module cards** (don't load yet)
3. **Add feature flag**:
   ```javascript
   const CONFIG = {
       system: {
           useModularArchitecture: false  // ← Add this
       }
   };
   ```

4. **Test that everything still works**

### Phase 2: Extract First Module (Low Risk)

**Start with Analytics** (smallest, least complex)

1. Copy Analytics code to `modules/analytics.module.js`
2. Test standalone
3. Minify and create story card
4. Update loader to use Analytics module when flag enabled
5. Test with flag ON
6. If successful, remove old Analytics code
7. Set flag to `true` by default

### Phase 3: Extract Remaining Modules (One at a Time)

**Order** (low risk → high risk):

1. ✅ Analytics (~200 lines)
2. PlayersAuthorsNoteCard (~100 lines)
3. SmartReplacement (~300 lines)
4. NGOCommands (~400 lines)
5. VerbalizedSampling (~400 lines)
6. NGOEngine (~600 lines)
7. BonepokeAnalysis (~800 lines) ← Most complex, do last

### Phase 4: Data Externalization

1. SYNONYM_MAP → story card
2. STOPWORDS → story card
3. CONFLICT_WORDS, CALMING_WORDS → story card

### Phase 5: Cleanup

1. Remove old code
2. Update documentation
3. Create migration guide for users

---

## Testing Strategy

### Before Each Module Extraction

**Create test suite**:

```javascript
// test/test-bonepoke.js
const runBonepokeTests = () => {
    log('========================================');
    log('BONEPOKE MODULE TESTS');
    log('========================================');

    // Test 1: Basic analysis
    (() => {
        const text = "The hero smiled bravely.";
        const result = BonepokeAnalysis.analyze(text);

        assert(result !== null, 'Should return analysis');
        assert(result.scores, 'Should have scores');
        assert(result.avgScore > 0, 'Should have average score');
        log('✅ Test 1: Basic analysis PASSED');
    })();

    // Test 2: Fatigue detection
    (() => {
        const text = "He nodded. She nodded. They all nodded.";
        const result = BonepokeAnalysis.analyze(text);

        assert(result.composted.fatigue['nodded'] >= 3, 'Should detect fatigue');
        log('✅ Test 2: Fatigue detection PASSED');
    })();

    // Test 3: Empty text
    (() => {
        const result = BonepokeAnalysis.analyze('');
        assert(result === null, 'Should return null for empty text');
        log('✅ Test 3: Empty text PASSED');
    })();

    log('========================================');
    log('ALL TESTS PASSED');
    log('========================================');
};

// Helper
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`);
    }
};
```

**Run tests BEFORE and AFTER extraction**:

```javascript
// In scenario, add command:
// @test bonepoke

const processTestCommand = (text) => {
    const match = text.match(/@test\s+(\w+)/i);
    if (!match) return { processed: text, found: false };

    const moduleName = match[1];

    switch (moduleName) {
        case 'bonepoke':
            runBonepokeTests();
            break;
        case 'ngo':
            runNGOTests();
            break;
        // ... other tests ...
    }

    return { processed: text.replace(/@test\s+\w+/i, '').trim(), found: true };
};
```

### Integration Testing

**After each module extraction, test full workflow**:

```javascript
// Test: Full turn cycle
const testFullTurnCycle = () => {
    log('Testing full turn cycle...');

    // Simulate user input
    const input = "@req the dragon appears (find the sword)";

    // Process input (trinityinput)
    const inputResult = NGOCommands.processAllCommands(input);
    assert(inputResult.commands.req === 'the dragon appears', 'Req extracted');

    // Simulate AI output
    const aiOutput = "The ancient dragon emerged from the mist, its scales gleaming.";

    // Analyze output (trinityoutput)
    const analysis = BonepokeAnalysis.analyze(aiOutput);
    assert(analysis !== null, 'Analysis generated');

    // Check fulfillment
    const fulfillment = NGOCommands.detectFulfillment(aiOutput);
    assert(fulfillment.fulfilled === true, 'Request fulfilled');

    log('✅ Full turn cycle test PASSED');
};
```

---

## Performance Benchmarking

### Before/After Comparison

```javascript
const benchmarkModularVsMonolithic = () => {
    const iterations = 100;

    // Benchmark: Module loading time
    const startLoad = Date.now();
    for (let i = 0; i < iterations; i++) {
        loadModule('bonepoke');
    }
    const loadTime = Date.now() - startLoad;

    // Benchmark: Analysis time (modular)
    const startAnalysis = Date.now();
    for (let i = 0; i < iterations; i++) {
        BonepokeAnalysis.analyze("Sample text for analysis.");
    }
    const analysisTime = Date.now() - startAnalysis;

    log(`Module loading: ${loadTime}ms for ${iterations} loads (${(loadTime/iterations).toFixed(2)}ms avg)`);
    log(`Analysis (modular): ${analysisTime}ms for ${iterations} runs (${(analysisTime/iterations).toFixed(2)}ms avg)`);
};
```

**Expected improvements**:
- Shared library parsing: **-60%** (5,127 → 2,000 lines)
- Memory usage: **-40%** (less code in memory)
- Editor responsiveness: **+200%** (smaller files)
- Module loading: < 5ms per module

---

## Rollback Plan

**If modular architecture causes issues**:

1. **Keep old code commented**:
   ```javascript
   // OLD MONOLITHIC CODE (BACKUP - REMOVE AFTER TESTING)
   /*
   const BonepokeAnalysis = (() => {
       // ... 800 lines ...
   })();
   */

   // NEW MODULAR CODE
   const BonepokeAnalysis = loadModule('bonepoke');
   ```

2. **Feature flag for instant rollback**:
   ```javascript
   const CONFIG = {
       system: {
           useModularArchitecture: true  // ← Set to false to rollback
       }
   };

   const BonepokeAnalysis = CONFIG.system.useModularArchitecture
       ? loadModule('bonepoke')      // Modular
       : (() => { /* old code */ })();  // Monolithic fallback
   ```

3. **Version control**:
   - Keep git tags for each migration phase
   - Tag before extraction: `git tag pre-module-bonepoke`
   - Tag after extraction: `git tag post-module-bonepoke`

---

## Summary

### Quick Wins (Do First)
1. ✅ Move SYNONYM_MAP to StoryCard (-1,800 lines)
2. ✅ Extract magic numbers to constants
3. ✅ Add error boundaries to lifecycle scripts
4. ✅ Add input validation to commands

**Estimated Time**: 4-8 hours
**Risk**: Low
**Impact**: High

### Full Modularization (Long-term)
1. Extract modules one-by-one (Analytics → Bonepoke)
2. Test after each extraction
3. Benchmark performance
4. Keep rollback option

**Estimated Time**: 20-30 hours
**Risk**: Medium
**Impact**: Very High

### Success Criteria
- ✅ Shared library < 2,000 lines
- ✅ All tests passing
- ✅ Performance same or better
- ✅ User experience unchanged
- ✅ Easier to maintain

---

*Refactoring guide created: 2025-01-19*
*Target: Trinity v3.0 (Modular Architecture)*
