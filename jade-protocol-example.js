/**
 * ============================================================================
 * JADE PROTOCOL - Narrative Control System
 * JSON-based AI narrative directive engine for AI Dungeon
 * ============================================================================
 *
 * Translates narrative states (GOLD, SLOP, SALVAGE) into JSON mandates
 * that guide the AI's writing behavior through structured commands.
 *
 * @version 1.0
 * ============================================================================
 */

// #region Configuration

/**
 * JADE Protocol Configuration
 */
const JADE_CONFIG = {
    enabled: true,
    protocol_version: "Jade 2.2",
    role: "NARRATIVE PHYSICIST / SCRIBE",

    // Word limit for AI responses
    word_limit: 150,

    // Metrics ranges
    e_metric_range: { min: 0.3, max: 0.95 },   // Extraction Efficiency
    beta_metric_range: { min: 0.1, max: 0.7 }, // Narrative Contradiction

    // Debugging
    debug_logging: false
};

/**
 * JADE State Definitions
 * Each state has a narrative mandate and focus area
 */
const JADE_STATES = {
    GOLD: {
        name: "GOLD",
        mandate: "Perform the Abductive Leap (Creative surprise). Ensure Bible Logic Check is subtle and integrated.",
        focus: "High Narrative Density, Surprise"
    },
    SLOP: {
        name: "SLOP",
        mandate: "Pivot to Structural Verification (Deductive). Use Sherlock Logic fingerprint to correct a character's internal contradiction.",
        focus: "Correction, Cohesion Trap Avoidance"
    },
    SALVAGE: {
        name: "SALVAGE",
        mandate: "Perform a Time Travel Logic check. Introduce a Missing Piece Card element and shift the scene's emotional tone.",
        focus: "Emotional Shift, Hidden Element"
    },
    VANILLA: {
        name: "VANILLA",
        mandate: "Enforce Vanilla Module Containment. Describe environment only.",
        focus: "Containment, Description"
    }
};

// #endregion

// #region JADE Protocol Engine

/**
 * JADE Protocol Module
 * Manages narrative states and generates JSON control signals
 */
const JADEProtocol = (() => {

    /**
     * Initialize JADE state
     */
    const initState = () => {
        if (state.jade) return; // Already initialized

        state.jade = {
            current_state: "GOLD",
            e_metric: 0.75,
            beta_metric: 0.3,
            turn_count: 0,
            state_history: []
        };

        if (JADE_CONFIG.debug_logging) {
            log("✨ JADE Protocol initialized");
        }
    };

    /**
     * Simulate state determination
     * In production, this would use bonepoke_core_engine calculations
     * @returns {Object} State data with metrics
     */
    const determineState = () => {
        // For now, use simple turn-based rotation
        // Replace with actual bonepoke_core_engine logic
        const turn = state.jade.turn_count;
        const stateNames = ["GOLD", "SLOP", "SALVAGE", "GOLD"];
        const stateName = stateNames[turn % stateNames.length];

        // Generate metrics (in production, these come from calculations)
        const e = Math.random() * (JADE_CONFIG.e_metric_range.max - JADE_CONFIG.e_metric_range.min)
                  + JADE_CONFIG.e_metric_range.min;
        const beta = Math.random() * (JADE_CONFIG.beta_metric_range.max - JADE_CONFIG.beta_metric_range.min)
                     + JADE_CONFIG.beta_metric_range.min;

        return {
            state: stateName,
            e_metric: Math.round(e * 1000) / 1000,
            beta_metric: Math.round(beta * 1000) / 1000
        };
    };

    /**
     * Build JSON mandate from state data
     * @param {Object} stateData - Current state information
     * @returns {string} JSON command string
     */
    const buildJSONMandate = (stateData) => {
        const stateInfo = JADE_STATES[stateData.state] || JADE_STATES.VANILLA;

        // Construct JSON schema
        const jadeSchema = {
            "ROLE": JADE_CONFIG.role,
            "PROTOCOL_VERSION": JADE_CONFIG.protocol_version,
            "CONTROL_SIGNAL": stateData.state,
            "METRICS": {
                "E": stateData.e_metric,
                "B": stateData.beta_metric
            },
            "MANDATE": stateInfo.mandate,
            "FOCUS": stateInfo.focus,
            "WORD_LIMIT": JADE_CONFIG.word_limit
        };

        // Convert to compact JSON string
        const jsonString = JSON.stringify(jadeSchema);

        // Create final prompt fragment
        return `**JADE PROTOCOL JSON MANDATE:** ${jsonString}`;
    };

    /**
     * Generate complete JADE prompt with RAG context
     * @param {string} ragContext - Retrieval-Augmented Generation context
     * @param {string} userAction - Current user input
     * @returns {string} Complete formatted prompt
     */
    const generatePrompt = (ragContext, userAction) => {
        // Determine current state
        const stateData = determineState();

        // Update state tracking
        state.jade.current_state = stateData.state;
        state.jade.e_metric = stateData.e_metric;
        state.jade.beta_metric = stateData.beta_metric;
        state.jade.state_history.push({
            turn: state.jade.turn_count,
            state: stateData.state,
            e: stateData.e_metric,
            beta: stateData.beta_metric
        });

        // Limit history size
        if (state.jade.state_history.length > 20) {
            state.jade.state_history = state.jade.state_history.slice(-20);
        }

        // Build JSON mandate
        const jsonMandate = buildJSONMandate(stateData);

        // Construct final prompt structure
        const prompt = [
            "IMMUTABLE SYSTEM INSTRUCTION: You are the NARRATIVE PHYSICIST. Apply the following JSON mandate to the story.",
            "",
            jsonMandate,
            `RAG CONTEXT: ${ragContext}`,
            `USER ACTION: ${userAction}`
        ].join("\n");

        if (JADE_CONFIG.debug_logging) {
            log(`📊 JADE: ${stateData.state} (E=${stateData.e_metric}, β=${stateData.beta_metric})`);
        }

        return prompt;
    };

    /**
     * Process turn (increment counter)
     */
    const processTurn = () => {
        state.jade.turn_count++;
    };

    /**
     * Get current state info
     * @returns {Object} Current JADE state
     */
    const getState = () => {
        return {
            state: state.jade.current_state,
            e_metric: state.jade.e_metric,
            beta_metric: state.jade.beta_metric,
            turn: state.jade.turn_count
        };
    };

    /**
     * Manually set state (for testing or manual control)
     * @param {string} stateName - One of: GOLD, SLOP, SALVAGE, VANILLA
     */
    const setState = (stateName) => {
        if (!JADE_STATES[stateName]) {
            log(`⚠️ JADE: Invalid state "${stateName}"`);
            return false;
        }

        state.jade.current_state = stateName;
        log(`✨ JADE: State manually set to ${stateName}`);
        return true;
    };

    // Public API
    return {
        initState,
        determineState,
        buildJSONMandate,
        generatePrompt,
        processTurn,
        getState,
        setState
    };
})();

// #endregion

// #region Initialization

// Initialize JADE state when script loads
JADEProtocol.initState();

// #endregion

// #region Example Usage (Comment out in production)

/**
 * Example: How to use JADE in context.js
 *
 * const modifier = (text) => {
 *     if (!JADE_CONFIG.enabled) return { text };
 *
 *     // Extract RAG context from memory or story cards
 *     const ragContext = "[Lizard is one of Nicolette's goats. CK was a rapper.]";
 *
 *     // Get user's current action
 *     const userAction = "Continue the story. Tiffanello looks at the coffee machine.";
 *
 *     // Generate JADE prompt
 *     const jadePrompt = JADEProtocol.generatePrompt(ragContext, userAction);
 *
 *     // Prepend to context
 *     text = jadePrompt + "\n\n" + text;
 *
 *     // Process turn counter
 *     JADEProtocol.processTurn();
 *
 *     return { text };
 * };
 */

/**
 * Example: Manual state control
 *
 * // Force a specific state
 * JADEProtocol.setState("GOLD");
 *
 * // Check current state
 * const currentState = JADEProtocol.getState();
 * log(`Current: ${currentState.state}, E=${currentState.e_metric}`);
 */

/**
 * Example: Test output
 * Uncomment to see example JADE output
 */
/*
if (JADE_CONFIG.debug_logging) {
    const testRAG = "[RAG Context: Lizard is one of Nicolette's goats. CK was a rapper.]";
    const testAction = "Continue the story. Tiffanello looks at the coffee machine.";

    log("=== JADE PROTOCOL TEST ===");
    const testPrompt = JADEProtocol.generatePrompt(testRAG, testAction);
    log(testPrompt);
    log("========================");
}
*/

// #endregion

// Best Practice: Always end shared library with void 0
void 0;
