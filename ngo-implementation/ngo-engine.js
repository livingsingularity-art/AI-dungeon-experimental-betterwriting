/**
 * NGO Core Engine Module
 * The central narrative intelligence processor
 *
 * This module handles:
 * - Conflict/calming word analysis
 * - Heat accumulation and decay
 * - Temperature progression
 * - Overheat/cooldown state machines
 * - Random explosion events
 *
 * Integrates with: Bonepoke (quality), VS (expression), Commands (player intent)
 *
 * Add to sharedLibrary.js
 */

const NGOEngine = (() => {
    // Reference to CONFIG.ngo (set at runtime)
    let config = null;

    /**
     * Initialize the engine with config reference
     * @param {Object} ngoConfig - The CONFIG.ngo object
     */
    const init = (ngoConfig) => {
        config = ngoConfig;
    };

    /**
     * Count conflict/calming words in text
     * @param {string} text - Text to analyze
     * @returns {Object} { conflicts: number, calming: number, net: number }
     */
    const analyzeConflict = (text) => {
        if (!text) return { conflicts: 0, calming: 0, net: 0 };

        const textLower = text.toLowerCase();

        let conflicts = 0;
        let calming = 0;

        // Count conflict words
        NGO_WORD_LISTS.conflict.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) conflicts += matches.length;
        });

        // Count calming words
        NGO_WORD_LISTS.calming.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) calming += matches.length;
        });

        return {
            conflicts,
            calming,
            net: conflicts - calming  // Positive = tension, Negative = calm
        };
    };

    /**
     * Update heat based on conflict analysis
     * @param {Object} ngoState - Current NGO state (state.ngo)
     * @param {Object} conflictData - Result from analyzeConflict()
     * @param {string} source - 'player' or 'ai'
     * @returns {Object} { oldHeat, newHeat, delta }
     */
    const updateHeat = (ngoState, conflictData, source) => {
        if (!config || !config.enabled) {
            return { oldHeat: ngoState.heat, newHeat: ngoState.heat, delta: 0 };
        }

        // Block heat gain during cooldown
        if (ngoState.cooldownMode && config.cooldownBlocksHeatGain) {
            return { oldHeat: ngoState.heat, newHeat: ngoState.heat, delta: 0 };
        }

        const multiplier = source === 'player'
            ? config.playerHeatMultiplier
            : config.aiHeatMultiplier;

        // Calculate heat changes
        const heatGain = conflictData.conflicts * config.heatIncreasePerConflict * multiplier;
        const heatLoss = conflictData.calming * config.heatDecayRate;
        const delta = heatGain - heatLoss;

        const oldHeat = ngoState.heat;
        ngoState.heat = Math.max(0, ngoState.heat + delta);
        ngoState.heat = Math.min(ngoState.heat, config.maxHeat);

        // Track consecutive conflicts
        if (conflictData.conflicts > 0 && conflictData.calming === 0) {
            ngoState.consecutiveConflicts = (ngoState.consecutiveConflicts || 0) + 1;
        } else if (conflictData.calming > conflictData.conflicts) {
            ngoState.consecutiveConflicts = 0;
        }

        // Store for reference
        ngoState.lastConflictCount = conflictData.conflicts;
        ngoState.lastCalmingCount = conflictData.calming;

        return {
            oldHeat,
            newHeat: ngoState.heat,
            delta
        };
    };

    /**
     * Check if temperature should increase
     * @param {Object} ngoState - Current NGO state
     * @returns {Object} { shouldIncrease: boolean, reason: string }
     */
    const checkTemperatureIncrease = (ngoState) => {
        if (!config || !config.enabled) {
            return { shouldIncrease: false, reason: 'disabled' };
        }

        // Block during overheat (temperature locked)
        if (ngoState.overheatMode && config.overheatLocksTemperature) {
            return { shouldIncrease: false, reason: 'overheat_locked' };
        }

        // Block during cooldown
        if (ngoState.cooldownMode) {
            return { shouldIncrease: false, reason: 'cooldown_active' };
        }

        // Block at max temperature
        if (ngoState.temperature >= config.trueMaxTemperature) {
            return { shouldIncrease: false, reason: 'max_temperature' };
        }

        let shouldIncrease = false;
        let reason = 'none';

        // Method 1: Heat threshold exceeded + RNG
        if (ngoState.heat >= config.heatThresholdForTempIncrease) {
            const roll = Math.random() * 100;
            if (roll < config.tempIncreaseChance) {
                shouldIncrease = true;
                reason = 'heat_threshold';
            }
        }

        // Method 2: Consecutive conflicts (deterministic)
        if (!shouldIncrease &&
            ngoState.consecutiveConflicts >= config.tempIncreaseOnConsecutiveConflicts) {
            shouldIncrease = true;
            reason = 'consecutive_conflicts';
        }

        // Method 3: Random explosion
        if (!shouldIncrease && config.explosionEnabled && !ngoState.explosionPending) {
            const explosionRoll = Math.random() * 100;
            if (explosionRoll < config.explosionChanceBase) {
                ngoState.explosionPending = true;
                shouldIncrease = true;
                reason = 'random_explosion';
            }
        }

        if (shouldIncrease) {
            ngoState.temperatureWantsToIncrease = true;
        }

        return { shouldIncrease, reason };
    };

    /**
     * Apply temperature increase (called after quality check)
     * @param {Object} ngoState - Current NGO state
     * @param {Object} ngoStats - Analytics object (state.ngoStats)
     * @param {boolean} qualityApproved - Whether Bonepoke approved
     * @returns {Object} { applied: boolean, oldTemp, newTemp, reason }
     */
    const applyTemperatureIncrease = (ngoState, ngoStats, qualityApproved = true) => {
        if (!ngoState.temperatureWantsToIncrease) {
            return { applied: false, reason: 'no_pending_increase' };
        }

        if (!qualityApproved && config.qualityGatesTemperatureIncrease) {
            ngoStats.qualityBlockedIncreases = (ngoStats.qualityBlockedIncreases || 0) + 1;
            ngoState.temperatureWantsToIncrease = false;
            return { applied: false, reason: 'quality_blocked' };
        }

        const oldTemp = ngoState.temperature;
        let increase = 1;

        // Explosion bonus
        if (ngoState.explosionPending) {
            increase += config.explosionTempBonus;
            ngoState.heat += config.explosionHeatBonus;
            ngoState.explosionPending = false;
            ngoStats.totalExplosions = (ngoStats.totalExplosions || 0) + 1;
        }

        ngoState.temperature = Math.min(
            ngoState.temperature + increase,
            config.trueMaxTemperature
        );

        ngoState.temperatureWantsToIncrease = false;
        ngoStats.maxTemperatureReached = Math.max(
            ngoStats.maxTemperatureReached || 1,
            ngoState.temperature
        );

        return {
            applied: true,
            oldTemp,
            newTemp: ngoState.temperature,
            reason: 'success'
        };
    };

    /**
     * Enter overheat (sustained climax) mode
     * @param {Object} ngoState - Current NGO state
     * @param {Object} ngoStats - Analytics object
     * @returns {Object} { entered: boolean, duration: number }
     */
    const enterOverheatMode = (ngoState, ngoStats) => {
        if (ngoState.overheatMode) {
            return { entered: false, duration: ngoState.overheatTurnsLeft };
        }

        ngoState.overheatMode = true;
        ngoState.overheatTurnsLeft = config.overheatDuration;
        ngoState.heat = Math.max(0, ngoState.heat - config.overheatHeatReduction);
        ngoStats.totalOverheats = (ngoStats.totalOverheats || 0) + 1;

        return { entered: true, duration: config.overheatDuration };
    };

    /**
     * Process overheat timer (call once per turn)
     * @param {Object} ngoState - Current NGO state
     * @returns {Object} { active: boolean, turnsLeft: number, completed: boolean }
     */
    const processOverheat = (ngoState) => {
        if (!ngoState.overheatMode) {
            return { active: false, turnsLeft: 0, completed: false };
        }

        ngoState.overheatTurnsLeft--;

        const completed = ngoState.overheatTurnsLeft <= 0;
        if (completed) {
            ngoState.overheatMode = false;
        }

        return {
            active: !completed,
            turnsLeft: ngoState.overheatTurnsLeft,
            completed
        };
    };

    /**
     * Enter cooldown (falling action) mode
     * @param {Object} ngoState - Current NGO state
     * @param {Object} ngoStats - Analytics object
     * @returns {Object} { entered: boolean, duration: number }
     */
    const enterCooldownMode = (ngoState, ngoStats) => {
        ngoState.cooldownMode = true;
        ngoState.cooldownTurnsLeft = config.cooldownDuration;
        ngoState.heat = 0;
        ngoState.consecutiveConflicts = 0;
        ngoStats.totalCooldowns = (ngoStats.totalCooldowns || 0) + 1;

        return { entered: true, duration: config.cooldownDuration };
    };

    /**
     * Process cooldown timer (call once per turn)
     * @param {Object} ngoState - Current NGO state
     * @returns {Object} { active: boolean, turnsLeft: number, tempDecrease: number, completed: boolean }
     */
    const processCooldown = (ngoState) => {
        if (!ngoState.cooldownMode) {
            return { active: false, turnsLeft: 0, tempDecrease: 0, completed: false };
        }

        ngoState.cooldownTurnsLeft--;

        // Decrease temperature during cooldown
        const oldTemp = ngoState.temperature;
        ngoState.temperature = Math.max(
            config.cooldownMinTemperature,
            ngoState.temperature - config.cooldownTempDecreaseRate
        );
        const tempDecrease = oldTemp - ngoState.temperature;

        const completed = ngoState.cooldownTurnsLeft <= 0;
        if (completed) {
            ngoState.cooldownMode = false;
        }

        return {
            active: !completed,
            turnsLeft: ngoState.cooldownTurnsLeft,
            tempDecrease,
            completed
        };
    };

    /**
     * Force early cooldown (triggered by Bonepoke fatigue or manual)
     * @param {Object} ngoState - Current NGO state
     * @param {Object} ngoStats - Analytics object
     * @param {string} reason - 'fatigue', 'manual', 'drift', etc.
     * @returns {Object} { forced: boolean, reason: string }
     */
    const forceEarlyCooldown = (ngoState, ngoStats, reason = 'fatigue') => {
        if (ngoState.cooldownMode) {
            return { forced: false, reason: 'already_cooling' };
        }

        // Clear overheat if active
        ngoState.overheatMode = false;
        ngoState.overheatTurnsLeft = 0;

        // Enter cooldown
        enterCooldownMode(ngoState, ngoStats);

        // Track fatigue-triggered cooldowns
        if (reason === 'fatigue') {
            ngoStats.fatigueTriggeredCooldowns = (ngoStats.fatigueTriggeredCooldowns || 0) + 1;
        }

        return { forced: true, reason };
    };

    /**
     * Reduce heat due to drift detection
     * @param {Object} ngoState - Current NGO state
     * @returns {Object} { oldHeat, newHeat, reduction }
     */
    const reduceHeatFromDrift = (ngoState) => {
        if (!config.driftReducesHeat) {
            return { oldHeat: ngoState.heat, newHeat: ngoState.heat, reduction: 0 };
        }

        const oldHeat = ngoState.heat;
        ngoState.heat = Math.max(0, ngoState.heat - config.driftHeatReduction);

        return {
            oldHeat,
            newHeat: ngoState.heat,
            reduction: oldHeat - ngoState.heat
        };
    };

    /**
     * Process one complete turn of NGO engine
     * This should be called once per turn in the main loop
     * @param {Object} ngoState - Current NGO state
     * @param {Object} ngoStats - Analytics object
     * @returns {Object} Summary of turn processing
     */
    const processTurn = (ngoState, ngoStats) => {
        if (!config || !config.enabled) {
            return { processed: false, reason: 'disabled' };
        }

        const results = {
            processed: true,
            turn: ngoStats.totalTurns,
            overheat: null,
            cooldown: null,
            phaseChange: null
        };

        // Increment turn counter
        ngoStats.totalTurns = (ngoStats.totalTurns || 0) + 1;
        results.turn = ngoStats.totalTurns;

        // Update analytics
        ngoStats.temperatureSum = (ngoStats.temperatureSum || 0) + ngoState.temperature;
        ngoStats.avgTemperature = ngoStats.temperatureSum / ngoStats.totalTurns;

        // Process timers
        results.overheat = processOverheat(ngoState);
        if (results.overheat.completed) {
            // Overheat ended, enter cooldown
            enterCooldownMode(ngoState, ngoStats);
        }

        results.cooldown = processCooldown(ngoState);

        // Track phase changes
        const currentPhase = getCurrentPhase(ngoState);
        if (currentPhase.name !== ngoState.currentPhase) {
            results.phaseChange = {
                from: ngoState.currentPhase,
                to: currentPhase.name,
                temperature: ngoState.temperature
            };

            ngoState.currentPhase = currentPhase.name;
            ngoState.phaseEntryTurn = ngoStats.totalTurns;
            ngoState.turnsInPhase = 0;

            ngoStats.phaseHistory = ngoStats.phaseHistory || [];
            ngoStats.phaseHistory.push({
                phase: currentPhase.name,
                turn: ngoStats.totalTurns,
                temperature: ngoState.temperature
            });
        }
        ngoState.turnsInPhase = (ngoState.turnsInPhase || 0) + 1;

        return results;
    };

    /**
     * Get current phase (wrapper for external access)
     * @param {Object} ngoState - Current NGO state
     * @returns {Object} Phase definition
     */
    const getPhase = (ngoState) => {
        return getCurrentPhase(ngoState);
    };

    /**
     * Check if overheat should trigger based on temperature
     * @param {Object} ngoState - Current NGO state
     * @returns {boolean} Whether to enter overheat
     */
    const shouldTriggerOverheat = (ngoState) => {
        return ngoState.temperature >= config.overheatTriggerTemp && !ngoState.overheatMode;
    };

    return {
        init,
        analyzeConflict,
        updateHeat,
        checkTemperatureIncrease,
        applyTemperatureIncrease,
        enterOverheatMode,
        processOverheat,
        enterCooldownMode,
        processCooldown,
        forceEarlyCooldown,
        reduceHeatFromDrift,
        processTurn,
        getPhase,
        shouldTriggerOverheat
    };
})();

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = NGOEngine;
}
