# NGO (Narrative Guidance Overhaul) Implementation Blueprint
## The Central Narrative Intelligence Engine

**Version:** 1.0.0
**Architecture:** NGO-Centric (NGO is the brain, all other systems are modules)
**Target:** AI Dungeon Enhanced Creative Writing System v3.0

---

## Executive Summary

This blueprint describes the integration of NGO as the **central narrative processing engine** that controls:
- **Bonepoke** (Quality Regulator) - bidirectional feedback loop
- **Verbalized Sampling** (Expression Controller) - temperature-driven parameters
- **SYSTEM Requests** (@req) - high-priority narrative pressure injections
- **Parentheses Memory** (...) - mid-priority gradual narrative goals
- **Author's Note** - layered priority system with quality override

**Core Principle:** NGO doesn't augment the system - NGO **IS** the system.

---

## 1. Architecture Overview

```
                      ┌────────────────────────────┐
                      │        USER INPUT           │
                      │  Normal text, @req, (...),  │
                      │     @temp, @arc, etc.       │
                      └─────────────┬───────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       🧠 NGO – CORE NARRATIVE ENGINE                 │
│  Heat / Temperature / Narrative Phase / Overheat / Cooldown / RNG    │
│                                                                      │
│  NGO performs:                                                       │
│   • Real-time conflict analysis (input + output)                     │
│   • Heat accumulation (short-term tension)                           │
│   • Temperature progression (long-term arc)                          │
│   • Phase transitions + beat modulation                              │
│   • Overheat / Cooldown cycle enforcement                            │
│   • @req & (...) as narrative pressure vectors                       │
│                                                                      │
└───────────────┬───────────────────────────────┬──────────────────────┘
                │                               │
                ▼                               ▼
     ┌────────────────────┐            ┌──────────────────────┐
     │ Bonepoke Analyzer  │◄──────────►│ Verbalized Sampling  │
     │ (Quality Governor) │            │ (Expression Engine)  │
     └───────────┬────────┘            └───────────┬──────────┘
                 │                                 │
                 └────────────┬────────────────────┘
                              ▼
              ┌────────────────────────────────────────┐
              │      Output Synthesis (NGO-Unified)     │
              │  • Layered author's note (priority)     │
              │  • Front memory injection (@req)        │
              │  • Temperature-adaptive VS params       │
              │  • Bonepoke quality corrections         │
              └────────────────────────────────────────┘
```

---

## 2. NGO State Management

### 2.1 Core State Variables

```javascript
// In sharedLibrary.js - initState()
const initNGOState = () => {
    // === HEAT/TEMPERATURE ENGINE ===
    state.ngo = state.ngo || {
        heat: 0,                    // Short-term tension (0-∞, resets on cooldown)
        temperature: 1,             // Long-term story phase (1-15)
        lastTemperature: 1,         // For tracking changes

        // Mode flags
        overheatMode: false,        // Sustained climax
        overheatTurnsLeft: 0,       // Countdown timer
        cooldownMode: false,        // Forced rest
        cooldownTurnsLeft: 0,       // Countdown timer

        // Pressure tracking
        temperatureWantsToIncrease: false,  // For quality gating
        lastConflictCount: 0,               // Player conflict words
        lastCalmingCount: 0,                // Player calming words
        consecutiveConflicts: 0,            // Streak tracking

        // Random events
        explosionPending: false,    // RNG spike incoming

        // Phase management
        currentPhase: 'introduction',
        phaseEntryTurn: 0,
        turnsInPhase: 0
    };

    // === COMMAND SYSTEM ===
    state.commands = state.commands || {
        // @req immediate requests
        narrativeRequest: null,
        narrativeRequestTTL: 0,
        narrativeRequestFulfilled: false,

        // (...) parentheses memory system
        memory1: '',
        memory2: '',
        memory3: '',
        expiration1: null,
        expiration2: null,
        expiration3: null,

        // Manual overrides
        manualTempAdjustment: 0,
        manualArcOverride: null,

        // Tracking
        lastRequestTime: 0,
        requestHistory: []  // For analytics
    };

    // === NGO ANALYTICS ===
    state.ngoStats = state.ngoStats || {
        totalTurns: 0,
        maxTemperatureReached: 1,
        totalOverheats: 0,
        totalCooldowns: 0,
        totalExplosions: 0,
        fatigueTriggeredCooldowns: 0,
        qualityBlockedIncreases: 0,
        requestsFulfilled: 0,
        requestsFailed: 0,
        avgTemperature: 1,
        temperatureSum: 0,
        phaseHistory: []
    };
};
```

### 2.2 NGO Configuration

```javascript
// In sharedLibrary.js - CONFIG object
const CONFIG = {
    // ... existing vs/bonepoke/system config ...

    // NGO Core Configuration
    ngo: {
        enabled: true,

        // === HEAT MECHANICS ===
        initialHeat: 0,
        heatDecayRate: 1,           // Natural decay per turn (calm scenes)
        heatIncreasePerConflict: 1, // Per conflict word detected
        playerHeatMultiplier: 2,    // Player conflict words = stronger impact
        aiHeatMultiplier: 1,        // AI conflict words = normal impact
        maxHeat: 50,                // Soft cap (can exceed temporarily)

        // === TEMPERATURE MECHANICS ===
        initialTemperature: 1,
        minTemperature: 1,
        maxTemperature: 12,         // Climax cap
        trueMaxTemperature: 15,     // Extreme climax cap (rarely reached)

        // Temperature increase triggers
        heatThresholdForTempIncrease: 10,   // Heat needed to trigger temp check
        tempIncreaseChance: 15,              // Base % chance per turn when heat high
        tempIncreaseOnConsecutiveConflicts: 3,  // After N consecutive conflicts

        // Temperature decrease triggers
        calmingTurnsForDecrease: 5,         // Turns without conflict to decrease temp
        tempDecreaseAmount: 1,

        // === OVERHEAT MECHANICS ===
        overheatTriggerTemp: 10,    // Temperature that triggers overheat
        overheatDuration: 4,        // Turns to sustain climax
        overheatHeatReduction: 10,  // Reset heat on overheat entry
        overheatLocksTemperature: true,  // Prevent temp changes during overheat

        // === COOLDOWN MECHANICS ===
        cooldownDuration: 5,        // Turns of forced rest
        cooldownTempDecreaseRate: 2,  // Temp decrease per turn during cooldown
        cooldownMinTemperature: 3,    // Don't go below this during cooldown
        cooldownBlocksHeatGain: true, // No heat gain during cooldown

        // === RANDOM EXPLOSIONS ===
        explosionEnabled: true,
        explosionChanceBase: 3,      // Base % chance per turn
        explosionHeatBonus: 5,       // Instant heat spike
        explosionTempBonus: 2,       // Instant temp spike
        explosionCooldownAfter: true,  // Force cooldown after explosion climax

        // === BONEPOKE INTEGRATION ===
        fatigueTriggersEarlyCooldown: true,
        fatigueThresholdForCooldown: 5,  // N fatigued words = force cooldown
        driftReducesHeat: true,
        driftHeatReduction: 3,
        qualityGatesTemperatureIncrease: true,
        qualityThresholdForIncrease: 3.0,  // Avg score needed to increase temp

        // === VS INTEGRATION ===
        temperatureAffectsVS: true,

        // === COMMAND INTEGRATION ===
        reqIncreasesHeat: true,
        reqHeatBonus: 2,
        parenthesesIncreasesHeat: true,
        parenthesesHeatBonus: 1,  // Per turn while active

        // === DEBUG ===
        debugLogging: false,
        logStateChanges: true
    },

    // Command System Configuration
    commands: {
        enabled: true,

        // @req settings
        reqPrefix: '@req',
        reqFrontMemoryTTL: 1,      // Turns in frontMemory
        reqAuthorsNoteTTL: 2,       // Turns in authorsNote
        reqDualInjection: true,     // Use BOTH frontMemory AND authorsNote

        // (...) parentheses memory
        parenthesesEnabled: true,
        parenthesesMaxSlots: 3,
        parenthesesDefaultTTL: 4,   // Turns until expiration
        parenthesesPriority: true,  // Most recent = highest priority

        // Manual controls
        tempCommand: '@temp',       // @temp +3, @temp 10, @temp reset
        arcCommand: '@arc',         // @arc climax, @arc cooldown, @arc intro

        // Fulfillment detection
        detectFulfillment: true,
        fulfillmentThreshold: 0.4,  // 40% keyword match = fulfilled

        debugLogging: false
    }
};
```

---

## 3. NGO Core Engine

### 3.1 Conflict/Calming Word Lists

```javascript
// In sharedLibrary.js
const NGO_WORD_LISTS = {
    // Words that INCREASE heat (conflict, tension, action)
    conflict: [
        // Violence
        'attack', 'fight', 'battle', 'war', 'kill', 'murder', 'destroy',
        'strike', 'punch', 'kick', 'stab', 'slash', 'shoot', 'blast',
        'crush', 'smash', 'break', 'shatter', 'explode', 'detonate',

        // Danger
        'danger', 'threat', 'enemy', 'foe', 'villain', 'monster',
        'demon', 'beast', 'creature', 'predator', 'hunter', 'assassin',

        // Urgency
        'run', 'flee', 'escape', 'chase', 'pursue', 'hurry', 'rush',
        'urgent', 'emergency', 'crisis', 'disaster', 'catastrophe',

        // Emotion (negative/intense)
        'rage', 'fury', 'anger', 'hate', 'fear', 'terror', 'panic',
        'scream', 'shout', 'yell', 'cry', 'sob', 'despair', 'agony',

        // Confrontation
        'confront', 'challenge', 'oppose', 'resist', 'defy', 'betray',
        'deceive', 'lie', 'steal', 'rob', 'threaten', 'demand',

        // Stakes
        'death', 'dying', 'dead', 'blood', 'wound', 'injury', 'pain',
        'suffer', 'torture', 'trap', 'prison', 'captive', 'hostage'
    ],

    // Words that DECREASE heat (calm, resolution, rest)
    calming: [
        // Peace
        'peace', 'calm', 'quiet', 'still', 'serene', 'tranquil',
        'gentle', 'soft', 'warm', 'safe', 'secure', 'protected',

        // Rest
        'rest', 'sleep', 'relax', 'breathe', 'sigh', 'exhale',
        'settle', 'sit', 'lie', 'lean', 'recline', 'pause',

        // Positive emotion
        'happy', 'joy', 'love', 'care', 'comfort', 'soothe',
        'smile', 'laugh', 'giggle', 'chuckle', 'hug', 'embrace',

        // Resolution
        'resolve', 'solve', 'fix', 'heal', 'recover', 'mend',
        'forgive', 'apologize', 'reconcile', 'understand', 'agree',

        // Connection
        'friend', 'ally', 'companion', 'partner', 'family', 'home',
        'trust', 'believe', 'hope', 'faith', 'together', 'united',

        // Mundane
        'eat', 'drink', 'cook', 'clean', 'walk', 'talk', 'think',
        'observe', 'notice', 'examine', 'study', 'learn', 'remember'
    ]
};
```

### 3.2 Story Phase Definitions

```javascript
// In sharedLibrary.js
const NGO_PHASES = {
    // Temperature 1-3: INTRODUCTION
    introduction: {
        tempRange: [1, 3],
        name: 'Introduction',
        description: 'Establish characters, world, and hooks',
        authorNoteGuidance:
            'Story Phase: Introduction. Focus on character establishment, ' +
            'world-building, and subtle foreshadowing. Introduce elements that ' +
            'may become relevant later. Keep conflicts minimal - let the story breathe.',
        vsAdjustment: { k: 4, tau: 0.15 },  // Low diversity, coherent
        bonepokeStrictness: 'relaxed'       // Allow more repetition
    },

    // Temperature 4-6: RISING ACTION (EARLY)
    risingEarly: {
        tempRange: [4, 6],
        name: 'Rising Action (Early)',
        description: 'Introduce minor conflicts, build tension gradually',
        authorNoteGuidance:
            'Story Phase: Rising Action. Begin introducing obstacles and challenges. ' +
            'Characters should face minor setbacks. Hint at greater conflicts ahead. ' +
            'Increase tension gradually but maintain hope.',
        vsAdjustment: { k: 5, tau: 0.12 },  // Moderate diversity
        bonepokeStrictness: 'normal'
    },

    // Temperature 7-9: RISING ACTION (LATE)
    risingLate: {
        tempRange: [7, 9],
        name: 'Rising Action (Late)',
        description: 'Major complications, stakes increase',
        authorNoteGuidance:
            'Story Phase: Late Rising Action. Stakes are high. Characters face ' +
            'serious challenges. Introduce plot twists and revelations. Push characters ' +
            'toward difficult choices. The climax approaches.',
        vsAdjustment: { k: 6, tau: 0.10 },  // Higher diversity for surprises
        bonepokeStrictness: 'strict'        // Avoid repetition in tense scenes
    },

    // Temperature 10: CLIMAX ENTRY
    climaxEntry: {
        tempRange: [10, 10],
        name: 'Climax Entry',
        description: 'Major conflict begins, point of no return',
        authorNoteGuidance:
            'Story Phase: CLIMAX. This is the moment of maximum tension. ' +
            'The main conflict erupts. Characters must face their greatest challenge. ' +
            'Shocking developments occur. Everything changes.',
        vsAdjustment: { k: 7, tau: 0.08 },  // High diversity, shocking events
        bonepokeStrictness: 'strict'
    },

    // Temperature 11-12: PEAK CLIMAX
    peakClimax: {
        tempRange: [11, 12],
        name: 'Peak Climax',
        description: 'Sustained maximum intensity',
        authorNoteGuidance:
            'Story Phase: PEAK CLIMAX. Consequences cascade. Every action matters. ' +
            'Characters are pushed to their absolute limits. Life-changing decisions ' +
            'must be made. The outcome is uncertain.',
        vsAdjustment: { k: 8, tau: 0.07 },  // Maximum diversity
        bonepokeStrictness: 'strict'
    },

    // Temperature 13-15: EXTREME CLIMAX (Rare)
    extremeClimax: {
        tempRange: [13, 15],
        name: 'Extreme Climax',
        description: 'Catastrophic intensity (use sparingly)',
        authorNoteGuidance:
            'Story Phase: EXTREME CLIMAX. Reality itself seems to bend. ' +
            'Cataclysmic events unfold. This is the ultimate test. ' +
            'Death and destruction are real possibilities. Nothing is safe.',
        vsAdjustment: { k: 9, tau: 0.06 },  // CHAOS MODE
        bonepokeStrictness: 'maximum'
    },

    // OVERHEAT MODE (Sustained climax)
    overheat: {
        tempRange: null,  // Special mode
        name: 'Overheat (Sustained Climax)',
        description: 'Maintain peak intensity, begin resolution hints',
        authorNoteGuidance:
            'Story Phase: SUSTAINED CLIMAX. Maintain the intensity but begin ' +
            'introducing hints of resolution. Characters find inner strength. ' +
            'The tide may be turning. Keep tension high but show possible ways forward.',
        vsAdjustment: { k: 7, tau: 0.09 },  // Slightly reduced chaos
        bonepokeStrictness: 'strict'
    },

    // COOLDOWN MODE (Falling action)
    cooldown: {
        tempRange: null,  // Special mode
        name: 'Cooldown (Falling Action)',
        description: 'Resolve conflicts, process events',
        authorNoteGuidance:
            'Story Phase: Falling Action. The crisis passes. Characters process ' +
            'what happened. Resolve plot threads. Allow emotional moments. ' +
            'The world begins to stabilize. Rest and recovery are possible.',
        vsAdjustment: { k: 4, tau: 0.14 },  // Return to coherence
        bonepokeStrictness: 'relaxed'
    }
};

/**
 * Get current phase based on temperature and mode
 * @returns {Object} Phase definition
 */
const getCurrentPhase = () => {
    if (!CONFIG.ngo.enabled) return NGO_PHASES.introduction;

    if (state.ngo.overheatMode) return NGO_PHASES.overheat;
    if (state.ngo.cooldownMode) return NGO_PHASES.cooldown;

    const temp = state.ngo.temperature;

    if (temp <= 3) return NGO_PHASES.introduction;
    if (temp <= 6) return NGO_PHASES.risingEarly;
    if (temp <= 9) return NGO_PHASES.risingLate;
    if (temp === 10) return NGO_PHASES.climaxEntry;
    if (temp <= 12) return NGO_PHASES.peakClimax;
    return NGO_PHASES.extremeClimax;
};
```

### 3.3 NGO Core Processing Functions

```javascript
// In sharedLibrary.js
const NGOEngine = (() => {

    /**
     * Count conflict/calming words in text
     * @param {string} text - Text to analyze
     * @returns {Object} { conflicts: number, calming: number }
     */
    const analyzeConflict = (text) => {
        const textLower = text.toLowerCase();

        let conflicts = 0;
        let calming = 0;

        NGO_WORD_LISTS.conflict.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) conflicts += matches.length;
        });

        NGO_WORD_LISTS.calming.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) calming += matches.length;
        });

        return { conflicts, calming };
    };

    /**
     * Update heat based on input/output analysis
     * @param {Object} conflictData - { conflicts, calming }
     * @param {string} source - 'player' or 'ai'
     */
    const updateHeat = (conflictData, source) => {
        if (!CONFIG.ngo.enabled) return;
        if (state.ngo.cooldownMode && CONFIG.ngo.cooldownBlocksHeatGain) return;

        const multiplier = source === 'player'
            ? CONFIG.ngo.playerHeatMultiplier
            : CONFIG.ngo.aiHeatMultiplier;

        // Calculate heat delta
        const heatGain = conflictData.conflicts * CONFIG.ngo.heatIncreasePerConflict * multiplier;
        const heatLoss = conflictData.calming * CONFIG.ngo.heatDecayRate;

        const oldHeat = state.ngo.heat;
        state.ngo.heat = Math.max(0, state.ngo.heat + heatGain - heatLoss);
        state.ngo.heat = Math.min(state.ngo.heat, CONFIG.ngo.maxHeat);

        // Track consecutive conflicts
        if (conflictData.conflicts > 0 && conflictData.calming === 0) {
            state.ngo.consecutiveConflicts++;
        } else if (conflictData.calming > conflictData.conflicts) {
            state.ngo.consecutiveConflicts = 0;
        }

        // Store for reference
        state.ngo.lastConflictCount = conflictData.conflicts;
        state.ngo.lastCalmingCount = conflictData.calming;

        if (CONFIG.ngo.logStateChanges) {
            safeLog(`🔥 Heat: ${oldHeat.toFixed(1)} → ${state.ngo.heat.toFixed(1)} (${source}: +${heatGain.toFixed(1)}, -${heatLoss.toFixed(1)})`, 'info');
        }
    };

    /**
     * Check if temperature should increase
     * @returns {boolean} Whether temperature increased
     */
    const checkTemperatureIncrease = () => {
        if (!CONFIG.ngo.enabled) return false;
        if (state.ngo.overheatMode && CONFIG.ngo.overheatLocksTemperature) return false;
        if (state.ngo.cooldownMode) return false;
        if (state.ngo.temperature >= CONFIG.ngo.trueMaxTemperature) return false;

        let shouldIncrease = false;

        // Method 1: Heat threshold exceeded
        if (state.ngo.heat >= CONFIG.ngo.heatThresholdForTempIncrease) {
            const roll = Math.random() * 100;
            shouldIncrease = roll < CONFIG.ngo.tempIncreaseChance;
        }

        // Method 2: Consecutive conflicts
        if (state.ngo.consecutiveConflicts >= CONFIG.ngo.tempIncreaseOnConsecutiveConflicts) {
            shouldIncrease = true;
        }

        // Method 3: Random explosion
        if (CONFIG.ngo.explosionEnabled && !state.ngo.explosionPending) {
            const explosionRoll = Math.random() * 100;
            if (explosionRoll < CONFIG.ngo.explosionChanceBase) {
                state.ngo.explosionPending = true;
                shouldIncrease = true;
                state.ngoStats.totalExplosions++;
                safeLog('💥 RANDOM EXPLOSION! Narrative pressure spike!', 'warn');
            }
        }

        if (shouldIncrease) {
            state.ngo.temperatureWantsToIncrease = true;
        }

        return shouldIncrease;
    };

    /**
     * Apply temperature increase (called after quality check)
     * @param {boolean} qualityApproved - Whether Bonepoke approved
     */
    const applyTemperatureIncrease = (qualityApproved = true) => {
        if (!state.ngo.temperatureWantsToIncrease) return;

        if (!qualityApproved && CONFIG.ngo.qualityGatesTemperatureIncrease) {
            state.ngoStats.qualityBlockedIncreases++;
            safeLog('⛔ Temperature increase BLOCKED by quality gate', 'warn');
            state.ngo.temperatureWantsToIncrease = false;
            return;
        }

        const oldTemp = state.ngo.temperature;
        let increase = 1;

        // Explosion bonus
        if (state.ngo.explosionPending) {
            increase += CONFIG.ngo.explosionTempBonus;
            state.ngo.heat += CONFIG.ngo.explosionHeatBonus;
            state.ngo.explosionPending = false;
        }

        state.ngo.temperature = Math.min(
            state.ngo.temperature + increase,
            CONFIG.ngo.trueMaxTemperature
        );

        state.ngo.temperatureWantsToIncrease = false;
        state.ngoStats.maxTemperatureReached = Math.max(
            state.ngoStats.maxTemperatureReached,
            state.ngo.temperature
        );

        if (CONFIG.ngo.logStateChanges) {
            safeLog(`🌡️ Temperature: ${oldTemp} → ${state.ngo.temperature}`, 'warn');
        }

        // Check for overheat trigger
        if (state.ngo.temperature >= CONFIG.ngo.overheatTriggerTemp && !state.ngo.overheatMode) {
            enterOverheatMode();
        }
    };

    /**
     * Enter overheat (sustained climax) mode
     */
    const enterOverheatMode = () => {
        state.ngo.overheatMode = true;
        state.ngo.overheatTurnsLeft = CONFIG.ngo.overheatDuration;
        state.ngo.heat = Math.max(0, state.ngo.heat - CONFIG.ngo.overheatHeatReduction);
        state.ngoStats.totalOverheats++;

        safeLog(`🔥🔥🔥 OVERHEAT MODE ACTIVATED! Sustained climax for ${CONFIG.ngo.overheatDuration} turns`, 'warn');
    };

    /**
     * Process overheat timer
     */
    const processOverheat = () => {
        if (!state.ngo.overheatMode) return;

        state.ngo.overheatTurnsLeft--;

        if (state.ngo.overheatTurnsLeft <= 0) {
            state.ngo.overheatMode = false;
            enterCooldownMode();
        } else {
            safeLog(`🔥 Overheat: ${state.ngo.overheatTurnsLeft} turns remaining`, 'info');
        }
    };

    /**
     * Enter cooldown (falling action) mode
     */
    const enterCooldownMode = () => {
        state.ngo.cooldownMode = true;
        state.ngo.cooldownTurnsLeft = CONFIG.ngo.cooldownDuration;
        state.ngo.heat = 0;
        state.ngo.consecutiveConflicts = 0;
        state.ngoStats.totalCooldowns++;

        safeLog(`❄️ COOLDOWN MODE ACTIVATED! Falling action for ${CONFIG.ngo.cooldownDuration} turns`, 'info');
    };

    /**
     * Process cooldown timer
     */
    const processCooldown = () => {
        if (!state.ngo.cooldownMode) return;

        state.ngo.cooldownTurnsLeft--;

        // Decrease temperature during cooldown
        const oldTemp = state.ngo.temperature;
        state.ngo.temperature = Math.max(
            CONFIG.ngo.cooldownMinTemperature,
            state.ngo.temperature - CONFIG.ngo.cooldownTempDecreaseRate
        );

        if (oldTemp !== state.ngo.temperature && CONFIG.ngo.logStateChanges) {
            safeLog(`❄️ Cooldown temp decrease: ${oldTemp} → ${state.ngo.temperature}`, 'info');
        }

        if (state.ngo.cooldownTurnsLeft <= 0) {
            state.ngo.cooldownMode = false;
            safeLog('✅ Cooldown complete. Normal narrative flow resumed.', 'success');
        } else {
            safeLog(`❄️ Cooldown: ${state.ngo.cooldownTurnsLeft} turns remaining`, 'info');
        }
    };

    /**
     * Force early cooldown (triggered by Bonepoke fatigue)
     */
    const forceEarlyCooldown = (reason = 'fatigue') => {
        if (state.ngo.cooldownMode) return;  // Already cooling

        state.ngo.overheatMode = false;
        state.ngo.overheatTurnsLeft = 0;
        enterCooldownMode();

        if (reason === 'fatigue') {
            state.ngoStats.fatigueTriggeredCooldowns++;
        }

        safeLog(`⚠️ EARLY COOLDOWN triggered by ${reason}`, 'warn');
    };

    /**
     * Process one turn of NGO engine
     */
    const processTurn = () => {
        if (!CONFIG.ngo.enabled) return;

        state.ngoStats.totalTurns++;

        // Update analytics
        state.ngoStats.temperatureSum += state.ngo.temperature;
        state.ngoStats.avgTemperature = state.ngoStats.temperatureSum / state.ngoStats.totalTurns;

        // Process timers
        processOverheat();
        processCooldown();

        // Track phase changes
        const currentPhase = getCurrentPhase();
        if (currentPhase.name !== state.ngo.currentPhase) {
            state.ngo.currentPhase = currentPhase.name;
            state.ngo.phaseEntryTurn = state.ngoStats.totalTurns;
            state.ngo.turnsInPhase = 0;
            state.ngoStats.phaseHistory.push({
                phase: currentPhase.name,
                turn: state.ngoStats.totalTurns,
                temperature: state.ngo.temperature
            });
        }
        state.ngo.turnsInPhase++;
    };

    return {
        analyzeConflict,
        updateHeat,
        checkTemperatureIncrease,
        applyTemperatureIncrease,
        enterOverheatMode,
        processOverheat,
        enterCooldownMode,
        processCooldown,
        forceEarlyCooldown,
        processTurn,
        getCurrentPhase
    };
})();
```

---

## 4. Command System (Pressure Vectors)

### 4.1 Input Script Command Processing

```javascript
// In input.js - Command detection and processing
const processCommands = (text) => {
    if (!CONFIG.commands.enabled) return text;

    let processed = text;

    // === @req PROCESSING ===
    const reqRegex = new RegExp(`${CONFIG.commands.reqPrefix}\\s+(.+?)(?=$|\\(|@)`, 'i');
    const reqMatch = processed.match(reqRegex);

    if (reqMatch) {
        const request = reqMatch[1].trim();

        // Store request with TTL
        state.commands.narrativeRequest = request;
        state.commands.narrativeRequestTTL = CONFIG.commands.reqAuthorsNoteTTL;
        state.commands.narrativeRequestFulfilled = false;
        state.commands.lastRequestTime = Date.now();

        // Track for analytics
        state.commands.requestHistory.push({
            request: request,
            turn: state.ngoStats.totalTurns,
            timestamp: Date.now()
        });

        // NGO integration: @req increases heat
        if (CONFIG.ngo.reqIncreasesHeat) {
            state.ngo.heat += CONFIG.ngo.reqHeatBonus;
            safeLog(`🎯 @req detected: "${request}" (heat +${CONFIG.ngo.reqHeatBonus})`, 'info');
        }

        // Remove command from text (player doesn't see it)
        processed = processed.replace(reqRegex, '').trim();
    }

    // === (...) PARENTHESES MEMORY ===
    if (CONFIG.commands.parenthesesEnabled) {
        const parenRegex = /\(([^)]+)\)/g;
        let parenMatch;
        const memories = [];

        while ((parenMatch = parenRegex.exec(processed)) !== null) {
            memories.push(parenMatch[1].trim());
        }

        if (memories.length > 0) {
            // Shift existing memories down
            state.commands.memory3 = state.commands.memory2;
            state.commands.expiration3 = state.commands.expiration2;
            state.commands.memory2 = state.commands.memory1;
            state.commands.expiration2 = state.commands.expiration1;

            // Store newest in slot 1
            state.commands.memory1 = memories[memories.length - 1];  // Last one = highest priority
            state.commands.expiration1 = state.ngoStats.totalTurns + CONFIG.commands.parenthesesDefaultTTL;

            // NGO integration
            if (CONFIG.ngo.parenthesesIncreasesHeat) {
                state.ngo.heat += CONFIG.ngo.parenthesesHeatBonus;
            }

            safeLog(`📝 Parentheses memory stored: "${state.commands.memory1}" (expires turn ${state.commands.expiration1})`, 'info');

            // Remove parentheses from text (text remains, commands hidden)
            processed = processed.replace(parenRegex, '').trim();
        }
    }

    // === @temp MANUAL CONTROL ===
    const tempRegex = new RegExp(`${CONFIG.commands.tempCommand}\\s+(reset|[+-]?\\d+)`, 'i');
    const tempMatch = processed.match(tempRegex);

    if (tempMatch) {
        const value = tempMatch[1].toLowerCase();

        if (value === 'reset') {
            state.ngo.temperature = CONFIG.ngo.initialTemperature;
            state.ngo.heat = CONFIG.ngo.initialHeat;
            state.ngo.overheatMode = false;
            state.ngo.cooldownMode = false;
            safeLog('🔄 NGO state RESET to initial values', 'success');
        } else if (value.startsWith('+') || value.startsWith('-')) {
            const delta = parseInt(value);
            state.ngo.temperature = Math.max(
                CONFIG.ngo.minTemperature,
                Math.min(CONFIG.ngo.trueMaxTemperature, state.ngo.temperature + delta)
            );
            safeLog(`🌡️ Temperature manually adjusted: ${delta > 0 ? '+' : ''}${delta} → ${state.ngo.temperature}`, 'info');
        } else {
            const absolute = parseInt(value);
            state.ngo.temperature = Math.max(
                CONFIG.ngo.minTemperature,
                Math.min(CONFIG.ngo.trueMaxTemperature, absolute)
            );
            safeLog(`🌡️ Temperature manually set to: ${state.ngo.temperature}`, 'info');
        }

        processed = processed.replace(tempRegex, '').trim();
    }

    // === @arc PHASE CONTROL ===
    const arcRegex = new RegExp(`${CONFIG.commands.arcCommand}\\s+(intro|rising|climax|cooldown|overheat)`, 'i');
    const arcMatch = processed.match(arcRegex);

    if (arcMatch) {
        const phase = arcMatch[1].toLowerCase();

        switch (phase) {
            case 'intro':
                state.ngo.temperature = 1;
                state.ngo.heat = 0;
                state.ngo.overheatMode = false;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc set to: INTRODUCTION', 'info');
                break;
            case 'rising':
                state.ngo.temperature = 6;
                state.ngo.heat = 5;
                state.ngo.overheatMode = false;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc set to: RISING ACTION', 'info');
                break;
            case 'climax':
                state.ngo.temperature = 10;
                state.ngo.heat = 10;
                state.ngo.overheatMode = true;
                state.ngo.overheatTurnsLeft = CONFIG.ngo.overheatDuration;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc set to: CLIMAX', 'warn');
                break;
            case 'cooldown':
                NGOEngine.forceEarlyCooldown('manual');
                safeLog('📖 Arc set to: COOLDOWN', 'info');
                break;
            case 'overheat':
                NGOEngine.enterOverheatMode();
                safeLog('📖 Arc set to: OVERHEAT', 'warn');
                break;
        }

        processed = processed.replace(arcRegex, '').trim();
    }

    return processed;
};
```

### 4.2 Dual Injection Strategy

```javascript
// In context.js - Inject requests into frontMemory
const injectFrontMemory = () => {
    if (!CONFIG.commands.enabled || !CONFIG.commands.reqDualInjection) return;

    if (state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
        const injection = `<SYSTEM>\n# Narrative shaping:\nWeave the following concept into the next output in a subtle, immersive way:\n${state.commands.narrativeRequest}\n</SYSTEM>`;

        // frontMemory is injected RIGHT before the AI generates
        state.memory.frontMemory = (state.memory.frontMemory || '') + '\n\n' + injection;

        safeLog(`💉 Front memory injected: "${state.commands.narrativeRequest}"`, 'info');
    }
};

// In context.js - Build layered author's note
const buildAuthorsNote = () => {
    const layers = [];

    // LAYER 0: User's original (baseline)
    if (state.originalAuthorsNote) {
        layers.push(state.originalAuthorsNote);
    }

    // LAYER 1: NGO Story Phase (narrative structure)
    if (CONFIG.ngo.enabled) {
        const phase = NGOEngine.getCurrentPhase();
        layers.push(phase.authorNoteGuidance);
    }

    // LAYER 2: Parentheses Memory (gradual goals)
    const memoryGuidance = [];
    if (state.commands.memory1 && state.commands.expiration1 > state.ngoStats.totalTurns) {
        memoryGuidance.push(`After the current phrase, flawlessly transition the story towards: ${state.commands.memory1}`);
    }
    if (state.commands.memory2 && state.commands.expiration2 > state.ngoStats.totalTurns) {
        memoryGuidance.push(`Additionally consider: ${state.commands.memory2}`);
    }
    if (state.commands.memory3 && state.commands.expiration3 > state.ngoStats.totalTurns) {
        memoryGuidance.push(`Background goal: ${state.commands.memory3}`);
    }
    if (memoryGuidance.length > 0) {
        layers.push(memoryGuidance.join(' '));
    }

    // LAYER 3: @req Immediate Request (highest narrative priority)
    if (state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
        layers.push(`PRIORITY: Immediately and naturally introduce: ${state.commands.narrativeRequest}`);
    }

    // LAYER 4: Bonepoke Quality Corrections (HIGHEST PRIORITY - quality override)
    // This layer is added by DynamicCorrection.applyCorrections() separately
    // but if we want to include it here, we'd check state.dynamicCards

    return layers.filter(Boolean).join(' ');
};
```

---

## 5. Bonepoke-NGO Bidirectional Integration

### 5.1 Bonepoke → NGO (Quality Regulator)

```javascript
// In output.js - After Bonepoke analysis
const integrateBonepokeWithNGO = (analysis) => {
    if (!CONFIG.ngo.enabled || !analysis) return;

    // === FATIGUE TRIGGERS EARLY COOLDOWN ===
    if (CONFIG.ngo.fatigueTriggersEarlyCooldown) {
        const fatigueCount = Object.keys(analysis.composted.fatigue).length;

        if (fatigueCount >= CONFIG.ngo.fatigueThresholdForCooldown &&
            state.ngo.temperature >= 8) {
            NGOEngine.forceEarlyCooldown('fatigue');
            safeLog(`⚠️ High fatigue (${fatigueCount} words) during high temp - forcing cooldown`, 'warn');
        }
    }

    // === DRIFT REDUCES HEAT ===
    if (CONFIG.ngo.driftReducesHeat && analysis.composted.drift.length > 0) {
        const oldHeat = state.ngo.heat;
        state.ngo.heat = Math.max(0, state.ngo.heat - CONFIG.ngo.driftHeatReduction);
        safeLog(`🌫️ Drift detected - heat reduced: ${oldHeat.toFixed(1)} → ${state.ngo.heat.toFixed(1)}`, 'info');
    }

    // === QUALITY GATES TEMPERATURE INCREASE ===
    if (CONFIG.ngo.qualityGatesTemperatureIncrease && state.ngo.temperatureWantsToIncrease) {
        const qualityApproved = analysis.avgScore >= CONFIG.ngo.qualityThresholdForIncrease;
        NGOEngine.applyTemperatureIncrease(qualityApproved);
    }
};
```

### 5.2 NGO → Bonepoke (Strictness Adjustment)

```javascript
// In sharedLibrary.js - Bonepoke strictness based on NGO phase
const getAdjustedFatigueThreshold = () => {
    if (!CONFIG.ngo.enabled) return CONFIG.bonepoke.fatigueThreshold;

    const phase = NGOEngine.getCurrentPhase();

    switch (phase.bonepokeStrictness) {
        case 'relaxed':
            return CONFIG.bonepoke.fatigueThreshold + 1;  // More lenient
        case 'strict':
            return CONFIG.bonepoke.fatigueThreshold - 1;  // Stricter
        case 'maximum':
            return Math.max(2, CONFIG.bonepoke.fatigueThreshold - 2);  // Very strict
        default:
            return CONFIG.bonepoke.fatigueThreshold;
    }
};
```

---

## 6. VS-NGO Integration

### 6.1 Temperature-Driven Sampling Parameters

```javascript
// In sharedLibrary.js - Enhanced VS analyzeContext
const analyzeContext = (context) => {
    if (!CONFIG.vs.adaptive) return { k: CONFIG.vs.k, tau: CONFIG.vs.tau };

    let k = CONFIG.vs.k;
    let tau = CONFIG.vs.tau;

    // === NGO TEMPERATURE INTEGRATION ===
    if (CONFIG.ngo.enabled && CONFIG.ngo.temperatureAffectsVS) {
        const phase = NGOEngine.getCurrentPhase();

        // Use phase-specific VS adjustments
        k = phase.vsAdjustment.k;
        tau = phase.vsAdjustment.tau;

        safeLog(`🎨 VS adapted for ${phase.name}: k=${k}, tau=${tau}`, 'info');
    }

    // === CONTENT TYPE MODIFIERS (still apply) ===
    const isDialogue = context.includes('"') || /\bsaid\b/i.test(context);
    const isAction = /\b(run|fight|move|attack|strike)\b/i.test(context);

    if (isDialogue) {
        k += 1;
        tau -= 0.02;
    }

    if (isAction && state.ngo.temperature >= 10) {
        // High-temp action = maximum chaos
        k += 1;
        tau -= 0.02;
    }

    // Safety bounds
    k = Math.max(3, Math.min(10, k));
    tau = Math.max(0.05, Math.min(0.20, tau));

    return { k, tau };
};
```

---

## 7. Fulfillment Detection

### 7.1 Request Fulfillment Tracking

```javascript
// In output.js - Detect if @req was fulfilled
const detectRequestFulfillment = (text) => {
    if (!CONFIG.commands.detectFulfillment) return;
    if (!state.commands.narrativeRequest) return;

    const request = state.commands.narrativeRequest.toLowerCase();
    const textLower = text.toLowerCase();

    // Method 1: Keyword matching
    const keywords = request.split(/\s+/).filter(w => w.length > 3);
    const matchedKeywords = keywords.filter(kw => textLower.includes(kw));
    const keywordScore = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

    // Method 2: N-gram overlap
    const requestNGrams = Object.keys(BonepokeAnalysis.extractNGrams(request, 2, 3));
    const textNGrams = Object.keys(BonepokeAnalysis.extractNGrams(text, 2, 3));
    const ngramOverlap = requestNGrams.filter(ng => textNGrams.includes(ng)).length;
    const ngramScore = requestNGrams.length > 0 ? ngramOverlap / requestNGrams.length : 0;

    // Combined score
    const fulfillmentScore = (keywordScore * 0.6) + (ngramScore * 0.4);

    if (fulfillmentScore >= CONFIG.commands.fulfillmentThreshold) {
        state.commands.narrativeRequestFulfilled = true;
        state.commands.narrativeRequest = null;
        state.commands.narrativeRequestTTL = 0;
        state.ngoStats.requestsFulfilled++;
        safeLog(`✅ Request FULFILLED! (score: ${fulfillmentScore.toFixed(2)})`, 'success');
    } else {
        // Decrement TTL
        state.commands.narrativeRequestTTL--;

        if (state.commands.narrativeRequestTTL <= 0) {
            state.commands.narrativeRequest = null;
            state.ngoStats.requestsFailed++;
            safeLog(`❌ Request EXPIRED without fulfillment`, 'warn');
        } else {
            safeLog(`⏳ Request pending (score: ${fulfillmentScore.toFixed(2)}, TTL: ${state.commands.narrativeRequestTTL})`, 'info');
        }
    }
};
```

---

## 8. Implementation Phases

### Phase 0: Foundation (2-3 hours)
- Add all new CONFIG sections to sharedLibrary.js
- Add initNGOState() to initState()
- Add NGO_WORD_LISTS and NGO_PHASES
- Test state initialization

### Phase 1: NGO Core Engine (4-6 hours)
- Implement NGOEngine module
- Add conflict analysis
- Implement heat/temperature state machine
- Add overheat/cooldown logic
- Test phase transitions

### Phase 2: Command System (3-4 hours)
- Add processCommands() to input.js
- Implement @req, @temp, @arc parsing
- Implement parentheses memory system
- Test command detection

### Phase 3: Dual Injection (2-3 hours)
- Implement injectFrontMemory() in context.js
- Implement buildAuthorsNote() with layers
- Ensure proper priority hierarchy
- Test layered output

### Phase 4: Bonepoke Integration (2-3 hours)
- Add integrateBonepokeWithNGO() to output.js
- Implement fatigue → cooldown
- Implement drift → heat reduction
- Implement quality gate
- Test bidirectional feedback

### Phase 5: VS Integration (1-2 hours)
- Enhance analyzeContext() with temperature
- Test k/tau adjustments per phase
- Verify content type modifiers still work

### Phase 6: Fulfillment Detection (2-3 hours)
- Add detectRequestFulfillment() to output.js
- Implement keyword + n-gram scoring
- Test fulfillment tracking
- Handle TTL expiration

### Phase 7: Analytics & Polish (2-3 hours)
- Add Analytics.getNGOSummary()
- Track all NGO statistics
- Add comprehensive logging
- Write user documentation

**Total Estimated Time: 18-27 hours**

---

## 9. Testing Strategy

### Unit Tests
- [ ] Conflict word detection accuracy
- [ ] Heat accumulation math
- [ ] Temperature increase triggers
- [ ] Overheat timer countdown
- [ ] Cooldown temperature decrease
- [ ] Phase transitions
- [ ] Command parsing
- [ ] Fulfillment detection scoring

### Integration Tests
- [ ] Full turn cycle (input → context → output)
- [ ] Bonepoke fatigue triggers cooldown
- [ ] VS parameters match current phase
- [ ] @req appears in both frontMemory AND authorsNote
- [ ] Parentheses memory expires correctly
- [ ] Quality gate blocks low-quality increases

### Scenario Tests
- [ ] Introduction → Rising → Climax → Cooldown flow
- [ ] Random explosion triggers
- [ ] Player uses all command types together
- [ ] High fatigue during climax
- [ ] Drift detection reduces tension
- [ ] Request fulfillment after 1 turn
- [ ] Request expiration after TTL

---

## 10. Risk Assessment

### High Risk
- **State machine complexity** - Many interacting timers and modes
- **Author's note conflicts** - Multiple systems competing for space
- **Performance** - Conflict word scanning on every turn

### Medium Risk
- **Parameter tuning** - k/tau values may need adjustment
- **Fulfillment accuracy** - May false-positive or false-negative
- **Heat balance** - Too fast or too slow temperature changes

### Low Risk
- **Command parsing** - Regex is straightforward
- **VS integration** - Clear interface
- **Analytics** - Just counters

### Mitigation
- Extensive logging for debugging
- CONFIG options for everything (easy tuning)
- Phase-by-phase implementation (test each piece)
- User override commands (@temp, @arc) as escape valves

---

## 11. Success Metrics

- **Temperature range usage**: Are all phases being reached?
- **Overheat frequency**: 1 per 20-30 turns is healthy
- **Cooldown triggers**: Mix of natural and fatigue-forced
- **Request fulfillment rate**: >60% is good
- **VS parameter variety**: k/tau should change across phases
- **Quality scores**: Should remain stable or improve during climax
- **Player satisfaction**: (subjective but most important)

---

## Conclusion

This blueprint establishes NGO as the **central narrative intelligence engine** that:

1. **Monitors** conflict density in real-time
2. **Accumulates** narrative pressure via heat → temperature
3. **Controls** story pacing via phases and modes
4. **Integrates** with Bonepoke for quality-aware pacing
5. **Drives** VS parameters for phase-appropriate expression
6. **Responds** to player commands as pressure vectors
7. **Self-corrects** via quality gates and fatigue detection

The result is a **unified, intelligent narrative control system** that creates natural story arcs while maintaining quality and responding to player intent.

Ready for implementation.
