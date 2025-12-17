/**
 * NGO Story Phase Definitions
 * Each phase defines the narrative tone and system behavior
 *
 * Add to sharedLibrary.js
 */

const NGO_PHASES = {
    // Temperature 1-3: INTRODUCTION
    introduction: {
        tempRange: [1, 3],
        name: 'Introduction',
        description: 'Establish characters, world, and hooks',
        authorNoteGuidance:
            'Story Phase: Introduction. Focus on character establishment, ' +
            'world-building, and subtle foreshadowing. Introduce elements that ' +
            'may become relevant later. Keep conflicts minimal - let the story breathe. ' +
            'Establish tone, setting, and character personalities.',
        vsAdjustment: { k: 4, tau: 0.15 },  // Low diversity = coherent
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
            'Increase tension gradually but maintain hope. Plant seeds for future developments.',
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
            'toward difficult choices. The climax approaches. Tension builds significantly.',
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
            'Shocking developments occur. Everything changes. No turning back.',
        vsAdjustment: { k: 7, tau: 0.08 },  // High diversity = shocking events
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
            'must be made. The outcome is uncertain. Maximum emotional intensity.',
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
            'Death and destruction are real possibilities. Nothing is safe. ' +
            'The world may never be the same.',
        vsAdjustment: { k: 9, tau: 0.06 },  // CHAOS MODE
        bonepokeStrictness: 'maximum'
    },

    // OVERHEAT MODE (Special - sustained climax)
    overheat: {
        tempRange: null,  // Special mode, not temperature-based
        name: 'Overheat (Sustained Climax)',
        description: 'Maintain peak intensity, begin resolution hints',
        authorNoteGuidance:
            'Story Phase: SUSTAINED CLIMAX. Maintain the intensity but begin ' +
            'introducing hints of resolution. Characters find inner strength. ' +
            'The tide may be turning. Keep tension high but show possible ways forward. ' +
            'Hope emerges amidst the chaos.',
        vsAdjustment: { k: 7, tau: 0.09 },  // Slightly reduced chaos
        bonepokeStrictness: 'strict'
    },

    // COOLDOWN MODE (Special - falling action)
    cooldown: {
        tempRange: null,  // Special mode
        name: 'Cooldown (Falling Action)',
        description: 'Resolve conflicts, process events',
        authorNoteGuidance:
            'Story Phase: Falling Action. The crisis passes. Characters process ' +
            'what happened. Resolve plot threads. Allow emotional moments. ' +
            'The world begins to stabilize. Rest and recovery are possible. ' +
            'Reflect on consequences and changes.',
        vsAdjustment: { k: 4, tau: 0.14 },  // Return to coherence
        bonepokeStrictness: 'relaxed'
    }
};

/**
 * Get current phase based on temperature and mode
 * @param {Object} ngoState - Current NGO state
 * @returns {Object} Phase definition
 */
const getCurrentPhase = (ngoState) => {
    if (!ngoState) return NGO_PHASES.introduction;

    if (ngoState.overheatMode) return NGO_PHASES.overheat;
    if (ngoState.cooldownMode) return NGO_PHASES.cooldown;

    const temp = ngoState.temperature || 1;

    if (temp <= 3) return NGO_PHASES.introduction;
    if (temp <= 6) return NGO_PHASES.risingEarly;
    if (temp <= 9) return NGO_PHASES.risingLate;
    if (temp === 10) return NGO_PHASES.climaxEntry;
    if (temp <= 12) return NGO_PHASES.peakClimax;
    return NGO_PHASES.extremeClimax;
};

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = { NGO_PHASES, getCurrentPhase };
}
