/**
 * NGO (Narrative Guidance Overhaul) Configuration
 * Central configuration for the NGO-centric narrative intelligence system
 *
 * This file should be merged into sharedLibrary.js CONFIG object
 */

// Add to CONFIG object in sharedLibrary.js
const NGO_CONFIG = {
    // === NGO CORE CONFIGURATION ===
    ngo: {
        enabled: true,

        // HEAT MECHANICS (short-term tension)
        initialHeat: 0,
        heatDecayRate: 1,               // Natural decay per turn
        heatIncreasePerConflict: 1,     // Per conflict word detected
        playerHeatMultiplier: 2,        // Player actions = stronger impact
        aiHeatMultiplier: 1,            // AI output = normal impact
        maxHeat: 50,                    // Soft cap

        // TEMPERATURE MECHANICS (long-term arc)
        initialTemperature: 1,
        minTemperature: 1,
        maxTemperature: 12,             // Standard climax cap
        trueMaxTemperature: 15,         // Extreme climax (rare)

        // Temperature increase triggers
        heatThresholdForTempIncrease: 10,
        tempIncreaseChance: 15,         // % chance when heat high
        tempIncreaseOnConsecutiveConflicts: 3,

        // Temperature decrease triggers
        calmingTurnsForDecrease: 5,
        tempDecreaseAmount: 1,

        // OVERHEAT MECHANICS (sustained climax)
        overheatTriggerTemp: 10,
        overheatDuration: 4,            // Turns
        overheatHeatReduction: 10,
        overheatLocksTemperature: true,

        // COOLDOWN MECHANICS (falling action)
        cooldownDuration: 5,            // Turns
        cooldownTempDecreaseRate: 2,    // Per turn
        cooldownMinTemperature: 3,
        cooldownBlocksHeatGain: true,

        // RANDOM EXPLOSIONS
        explosionEnabled: true,
        explosionChanceBase: 3,         // %
        explosionHeatBonus: 5,
        explosionTempBonus: 2,
        explosionCooldownAfter: true,

        // BONEPOKE INTEGRATION
        fatigueTriggersEarlyCooldown: true,
        fatigueThresholdForCooldown: 5,
        driftReducesHeat: true,
        driftHeatReduction: 3,
        qualityGatesTemperatureIncrease: true,
        qualityThresholdForIncrease: 3.0,

        // VS INTEGRATION
        temperatureAffectsVS: true,

        // COMMAND INTEGRATION
        reqIncreasesHeat: true,
        reqHeatBonus: 2,
        parenthesesIncreasesHeat: true,
        parenthesesHeatBonus: 1,

        // DEBUG
        debugLogging: false,
        logStateChanges: true
    },

    // === COMMAND SYSTEM CONFIGURATION ===
    commands: {
        enabled: true,

        // @req settings
        reqPrefix: '@req',
        reqFrontMemoryTTL: 1,
        reqAuthorsNoteTTL: 2,
        reqDualInjection: true,

        // (...) parentheses memory
        parenthesesEnabled: true,
        parenthesesMaxSlots: 3,
        parenthesesDefaultTTL: 4,
        parenthesesPriority: true,

        // Manual controls
        tempCommand: '@temp',
        arcCommand: '@arc',

        // Fulfillment detection
        detectFulfillment: true,
        fulfillmentThreshold: 0.4,

        debugLogging: false
    }
};

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = NGO_CONFIG;
}
