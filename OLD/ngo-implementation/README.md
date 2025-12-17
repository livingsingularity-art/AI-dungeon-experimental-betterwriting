# NGO Implementation Skeleton

This folder contains the implementation skeleton for the **NGO (Narrative Guidance Overhaul)** system - the central narrative intelligence engine.

## File Structure

```
ngo-implementation/
├── README.md                  # This file
├── ngo-config.js             # Configuration schema (add to sharedLibrary.js)
├── ngo-word-lists.js         # Conflict/calming word dictionaries
├── ngo-phases.js             # Story phase definitions
├── ngo-engine.js             # Core NGO processing logic
├── ngo-commands.js           # Command system (@req, (...), @temp, @arc)
└── ngo-integrations.js       # Bonepoke/VS/AuthorsNote integration
```

## Integration Guide

### Step 1: Merge Configuration into sharedLibrary.js

Add the contents of `ngo-config.js` to the existing `CONFIG` object:

```javascript
const CONFIG = {
    vs: { ... },        // existing
    bonepoke: { ... },  // existing
    system: { ... },    // existing

    // ADD THESE:
    ngo: { ... },       // from ngo-config.js
    commands: { ... }   // from ngo-config.js
};
```

### Step 2: Add Word Lists and Phases

Add `NGO_WORD_LISTS` and `NGO_PHASES` to sharedLibrary.js:

```javascript
// After CONFIG object
const NGO_WORD_LISTS = { ... };  // from ngo-word-lists.js
const NGO_PHASES = { ... };      // from ngo-phases.js
const getCurrentPhase = (ngoState) => { ... };  // from ngo-phases.js
```

### Step 3: Add NGO Engine Module

Add the entire `NGOEngine` module to sharedLibrary.js:

```javascript
const NGOEngine = (() => {
    // ... all content from ngo-engine.js
})();
```

### Step 4: Add Command Processor

Add the `NGOCommandProcessor` module to sharedLibrary.js:

```javascript
const NGOCommandProcessor = (() => {
    // ... all content from ngo-commands.js
})();
```

### Step 5: Add Integration Modules

Add the integration modules to sharedLibrary.js:

```javascript
const BonepokeNGOIntegration = (() => { ... });
const VSNGOIntegration = (() => { ... });
const LayeredAuthorsNote = (() => { ... });
const NGOStateInit = (() => { ... });
```

### Step 6: Update initState()

Modify the existing `initState()` function:

```javascript
const initState = () => {
    state.initialized = state.initialized || false;

    if (!state.initialized) {
        // Existing initialization...
        state.vsHistory = [];
        state.bonepokeHistory = [];
        // ...

        // ADD: NGO state initialization
        NGOStateInit.init(state);

        // Initialize NGO engine with config
        NGOEngine.init(CONFIG.ngo);
        NGOCommandProcessor.init(CONFIG.commands);

        state.initialized = true;
    }
};
```

### Step 7: Update input.js

Add command processing to the input script:

```javascript
const modifier = (text) => {
    // ... existing code ...

    // ADD: Process NGO commands
    if (CONFIG.commands && CONFIG.commands.enabled) {
        const commandResult = NGOCommandProcessor.processAllCommands(text, state);
        text = commandResult.processed;

        // Log commands found
        if (Object.keys(commandResult.commands).length > 0) {
            safeLog(`Commands detected: ${JSON.stringify(commandResult.commands)}`, 'info');
        }
    }

    // ADD: Analyze input for conflicts (player heat)
    if (CONFIG.ngo && CONFIG.ngo.enabled) {
        const conflictData = NGOEngine.analyzeConflict(text);
        const heatResult = NGOEngine.updateHeat(state.ngo, conflictData, 'player');

        if (CONFIG.ngo.logStateChanges && heatResult.delta !== 0) {
            safeLog(`🔥 Player heat: ${heatResult.oldHeat.toFixed(1)} → ${heatResult.newHeat.toFixed(1)}`, 'info');
        }

        // Check if temperature should increase
        const tempCheck = NGOEngine.checkTemperatureIncrease(state.ngo);
        if (tempCheck.shouldIncrease) {
            safeLog(`🌡️ Temperature increase pending (reason: ${tempCheck.reason})`, 'info');
        }
    }

    // ... rest of existing code ...
    return { text };
};
```

### Step 8: Update context.js

Add layered author's note and VS adaptation:

```javascript
const modifier = (text) => {
    // ... existing code ...

    // ADD: Build layered author's note
    if (CONFIG.ngo && CONFIG.ngo.enabled) {
        const originalNote = state.originalAuthorsNote || '';
        state.memory.authorsNote = LayeredAuthorsNote.build(state, originalNote);
        safeLog(`📝 Author's note built with NGO phase: ${NGOEngine.getPhase(state.ngo).name}`, 'info');
    }

    // ADD: Inject front memory for @req (dual injection)
    if (CONFIG.commands && CONFIG.commands.enabled && CONFIG.commands.reqDualInjection) {
        const frontMemoryInjection = LayeredAuthorsNote.getFrontMemory(state.commands);
        if (frontMemoryInjection) {
            state.memory.frontMemory = (state.memory.frontMemory || '') + '\n\n' + frontMemoryInjection;
            safeLog(`💉 Front memory injected with @req`, 'info');
        }
    }

    // MODIFY: Adaptive VS with NGO temperature
    if (CONFIG.vs.enabled && CONFIG.vs.adaptive) {
        let adaptedParams;

        if (CONFIG.ngo && CONFIG.ngo.temperatureAffectsVS) {
            // Use NGO-driven adaptation
            adaptedParams = VSNGOIntegration.getTemperatureAdaptedParams(
                text,
                state.ngo,
                CONFIG.ngo,
                CONFIG.vs
            );
        } else {
            // Use existing content-based adaptation
            adaptedParams = VerbalizedSampling.analyzeContext(text);
        }

        VerbalizedSampling.updateCard(adaptedParams);
        safeLog(`🎨 VS adapted: k=${adaptedParams.k}, tau=${adaptedParams.tau} (phase: ${adaptedParams.phase || 'content-based'})`, 'info');
    }

    // ... rest of existing code ...
    return { text };
};
```

### Step 9: Update output.js

Add NGO processing and Bonepoke integration:

```javascript
const modifier = (text) => {
    // ... existing cleaning and analysis code ...

    // ADD: Process NGO turn (timers, analytics)
    if (CONFIG.ngo && CONFIG.ngo.enabled) {
        const turnResult = NGOEngine.processTurn(state.ngo, state.ngoStats);

        if (turnResult.phaseChange) {
            safeLog(`📖 Phase changed: ${turnResult.phaseChange.from} → ${turnResult.phaseChange.to}`, 'warn');
        }

        if (turnResult.overheat.completed) {
            safeLog(`🔥 Overheat completed, entering cooldown`, 'info');
        }

        if (turnResult.cooldown.completed) {
            safeLog(`✅ Cooldown complete`, 'success');
        }
    }

    // ADD: Analyze AI output for conflicts
    if (CONFIG.ngo && CONFIG.ngo.enabled) {
        const aiConflictData = NGOEngine.analyzeConflict(text);
        const aiHeatResult = NGOEngine.updateHeat(state.ngo, aiConflictData, 'ai');

        if (CONFIG.ngo.logStateChanges && aiHeatResult.delta !== 0) {
            safeLog(`🔥 AI heat: ${aiHeatResult.oldHeat.toFixed(1)} → ${aiHeatResult.newHeat.toFixed(1)}`, 'info');
        }
    }

    // ADD: Integrate Bonepoke with NGO (bidirectional)
    if (CONFIG.bonepoke.enabled && analysis && CONFIG.ngo && CONFIG.ngo.enabled) {
        const integrationResult = BonepokeNGOIntegration.processAnalysis(
            analysis,
            state.ngo,
            state.ngoStats,
            CONFIG.ngo
        );

        integrationResult.logs.forEach(log => safeLog(log, 'info'));
    }

    // ADD: Detect @req fulfillment
    if (CONFIG.commands && CONFIG.commands.enabled) {
        const fulfillmentResult = NGOCommandProcessor.detectFulfillment(
            text,
            state.commands,
            state.ngoStats
        );

        if (fulfillmentResult.fulfilled) {
            safeLog(`✅ Narrative request fulfilled! Score: ${fulfillmentResult.score.toFixed(2)}`, 'success');
        } else if (fulfillmentResult.reason === 'ttl_expired') {
            safeLog(`❌ Narrative request expired without fulfillment`, 'warn');
        }

        // Cleanup expired parentheses memories
        const expiredCount = NGOCommandProcessor.cleanupExpiredMemories(state.commands, state.ngoStats);
        if (expiredCount > 0) {
            safeLog(`🗑️ ${expiredCount} parentheses memories expired`, 'info');
        }
    }

    // ... rest of existing code ...
    return { text };
};
```

## Testing

### Manual Testing Checklist

1. **Command Recognition**
   - Type: `@req the villain reveals a secret`
   - Verify: Command removed from text, logged, heat increased

2. **Parentheses Memory**
   - Type: `I enter the room (find a hidden door)`
   - Verify: Parentheses removed, memory stored, expiration set

3. **Temperature Progression**
   - Use conflict words repeatedly
   - Verify: Heat increases, temperature eventually increases

4. **Overheat Mode**
   - Get temperature to 10+
   - Verify: Overheat mode activates, sustains for 4 turns

5. **Cooldown Mode**
   - Wait for overheat to expire
   - Verify: Cooldown mode activates, temperature decreases

6. **VS Adaptation**
   - Check k/tau values at different temperatures
   - Verify: Low temp = low k, high temp = high k

7. **Bonepoke Integration**
   - Cause fatigue during high temperature
   - Verify: Early cooldown triggered

8. **Fulfillment Detection**
   - Use `@req` and check AI output
   - Verify: Request marked fulfilled or expired

## Configuration Tuning

### Heat/Temperature Balance

If temperature increases too fast:
- Increase `heatThresholdForTempIncrease`
- Decrease `tempIncreaseChance`
- Decrease `playerHeatMultiplier`

If temperature increases too slow:
- Decrease `heatThresholdForTempIncrease`
- Increase `tempIncreaseChance`
- Increase `heatIncreasePerConflict`

### VS Expression

If output is too chaotic at high temp:
- Decrease k values in phase definitions
- Increase tau values

If output is too boring at low temp:
- Increase k values in phase definitions
- Decrease tau values

### Quality Gates

If too many temperature increases are blocked:
- Lower `qualityThresholdForIncrease`
- Disable `qualityGatesTemperatureIncrease`

### Cooldown Behavior

If cooldowns are too frequent:
- Increase `fatigueThresholdForCooldown`
- Disable `fatigueTriggersEarlyCooldown`

If climaxes feel too long:
- Decrease `overheatDuration`
- Increase `cooldownTempDecreaseRate`

## Analytics

Access NGO statistics:

```javascript
const summary = NGOStateInit.getAnalyticsSummary(state.ngoStats);
console.log(summary);
// {
//   totalTurns: 25,
//   avgTemperature: '4.32',
//   maxTemperature: 10,
//   overheats: 1,
//   cooldowns: 2,
//   explosions: 0,
//   fatigueForced: 1,
//   qualityBlocked: 3,
//   requestsFulfilled: 5,
//   requestsFailed: 1,
//   fulfillmentRate: '83.3%'
// }
```

## Architecture Diagram

```
INPUT SCRIPT
    │
    ├─ processCommands() ─────────────> state.commands
    │   └─ @req, (...), @temp, @arc
    │
    └─ analyzeConflict() ─────────────> state.ngo.heat
        └─ Player conflict words


CONTEXT SCRIPT
    │
    ├─ buildAuthorsNote() ────────────> state.memory.authorsNote
    │   └─ NGO phase + commands + original
    │
    ├─ getFrontMemory() ──────────────> state.memory.frontMemory
    │   └─ @req dual injection
    │
    └─ getTemperatureAdaptedParams() ─> VS k/tau parameters
        └─ Phase-driven diversity


OUTPUT SCRIPT
    │
    ├─ processTurn() ─────────────────> state.ngo (timers)
    │   └─ Overheat/cooldown processing
    │
    ├─ analyzeConflict() ─────────────> state.ngo.heat
    │   └─ AI output conflict analysis
    │
    ├─ processAnalysis() ─────────────> Bonepoke ↔ NGO
    │   └─ Fatigue → cooldown, quality gates
    │
    └─ detectFulfillment() ───────────> state.ngoStats
        └─ @req completion tracking
```

## Next Steps

1. **Implement** each module step-by-step following this guide
2. **Test** each integration point before moving to the next
3. **Tune** configuration parameters based on actual gameplay
4. **Monitor** analytics to ensure healthy narrative flow
5. **Iterate** based on player feedback

## Support

For questions or issues, refer to:
- `NGO_IMPLEMENTATION_BLUEPRINT.md` - Full technical specification
- Original NGO scripts in repository
- Bonepoke/VS documentation in sharedLibrary.js

---

**Remember: NGO is the BRAIN. Everything else is a sensory or behavioral module that NGO controls.**
