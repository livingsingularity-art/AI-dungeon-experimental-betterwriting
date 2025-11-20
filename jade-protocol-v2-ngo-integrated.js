/**
 * ============================================================================
 * JADE PROTOCOL v2.0 (AI Dungeon Version) - NGO INTEGRATED
 * Narrative Control Engine for JSON-based Story Structuring
 * ============================================================================
 *
 * NEW IN v2.0 + NGO:
 * - Integrated with NGO (Narrative Guidance Overhaul) system
 * - Includes NGO heat, temperature, phase in JADE context
 * - Safe initialization of `state`
 * - Fully idempotent initState()
 * - Safer JSON output (LLM-friendly, validated)
 * - Encapsulated system block <JADE_SYSTEM_BLOCK>
 * - Configurable rotation pattern
 * - Efficient state history
 * - RAG context sanitization + safer injection
 * - Defensive logging (no crash if log() missing)
 * - Cleaner API surface
 *
 * INTEGRATION:
 * Add to SharedLibrary, then use in context.js
 * ============================================================================
 */

/* ============================================================================
   GLOBAL SAFETY GUARDS
   ============================================================================ */

// Ensure global state exists (AI Dungeon always provides it, but we guard anyway)
if (typeof state === "undefined") {
    globalThis.state = {};
}

// Replace log() with a safe version if missing
const safeJADELog = (...args) => {
    if (typeof log === "function") log(...args);
};


/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const JADE_CONFIG = Object.freeze({
    enabled: true,

    protocol_version: "Jade 2.0-NGO",
    role: "NARRATIVE PHYSICIST / SCRIBE",

    // Word limit for AI responses
    word_limit: 150,

    // Metric ranges
    e_metric_range: { min: 0.3, max: 0.95 },
    beta_metric_range: { min: 0.1, max: 0.7 },

    // State rotation order
    rotation: ["GOLD", "SLOP", "SALVAGE", "VANILLA"],

    // NGO Integration
    includeNGOState: true,      // Include NGO heat/temp/phase in context
    ngoAffectsState: false,     // Future: Let NGO temperature influence JADE state

    // JSON formatting
    compact_json: false,

    // Debug
    debug_logging: false
});


/* ============================================================================
   STATE DEFINITIONS
   ============================================================================ */
const JADE_STATES = {
    GOLD: {
        name: "GOLD",
        mandate: "Perform the Abductive Leap (Creative surprise). Ensure Bible Logic Check is subtle and integrated.",
        focus: "High Narrative Density, Surprise"
    },
    SLOP: {
        name: "SLOP",
        mandate: "Pivot to Structural Verification. Use Sherlock Logic fingerprint to correct the internal narrative contradiction.",
        focus: "Correction, Cohesion Trap Avoidance"
    },
    SALVAGE: {
        name: "SALVAGE",
        mandate: "Perform a Time Travel Logic audit. Introduce a Missing Piece Card and shift the emotional tone.",
        focus: "Emotional Shift, Hidden Element"
    },
    VANILLA: {
        name: "VANILLA",
        mandate: "Enforce Vanilla Containment. Describe the environment only.",
        focus: "Containment, Description"
    }
};


/* ============================================================================
   JADE PROTOCOL ENGINE
   ============================================================================ */

const JADEProtocol = (() => {

    /* ---------------------------------------------
       Initialize JADE State (Idempotent)
    --------------------------------------------- */
    const initState = () => {

        if (!state.jade || typeof state.jade.current_state !== "string") {
            state.jade = {
                current_state: "GOLD",
                e_metric: 0.75,
                beta_metric: 0.3,
                turn_count: 0,
                state_history: []
            };
        }

        if (JADE_CONFIG.debug_logging) safeJADELog("✨ JADE v2.0-NGO initialized");
    };


    /* ---------------------------------------------
       Internal: Generate State Data
    --------------------------------------------- */
    const determineState = () => {

        const turn = state.jade.turn_count;
        const rotation = JADE_CONFIG.rotation;
        const stateName = rotation[turn % rotation.length];

        // Future: Use NGO temperature to influence JADE state selection
        // if (JADE_CONFIG.ngoAffectsState && state.ngo) {
        //     if (state.ngo.temperature >= 10) return "GOLD"; // Climax = creativity
        //     if (state.ngo.cooldownMode) return "SALVAGE";   // Cooldown = reflection
        // }

        const e = randBetween(JADE_CONFIG.e_metric_range);
        const beta = randBetween(JADE_CONFIG.beta_metric_range);

        return {
            state: JADE_STATES[stateName] ? stateName : "VANILLA",
            e_metric: round3(e),
            beta_metric: round3(beta)
        };
    };


    /* ---------------------------------------------
       Internal: Build NGO State Context
    --------------------------------------------- */
    const buildNGOContext = () => {
        if (!JADE_CONFIG.includeNGOState || !state.ngo) {
            return null;
        }

        const ngo = state.ngo;
        const phase = typeof getCurrentNGOPhase === 'function'
            ? getCurrentNGOPhase()
            : { name: ngo.currentPhase || 'Unknown' };

        return {
            HEAT: round3(ngo.heat || 0),
            TEMPERATURE: ngo.temperature || 1,
            PHASE: phase.name,
            MODE: ngo.overheatMode ? "OVERHEAT" :
                  ngo.cooldownMode ? "COOLDOWN" : "NORMAL",
            TURNS_LEFT: ngo.overheatMode ? ngo.overheatTurnsLeft :
                        ngo.cooldownMode ? ngo.cooldownTurnsLeft : 0
        };
    };


    /* ---------------------------------------------
       Internal: Build the JSON Mandate
    --------------------------------------------- */
    const buildJSONMandate = (stateData) => {

        const stateInfo = JADE_STATES[stateData.state] || JADE_STATES.VANILLA;

        const block = {
            ROLE: JADE_CONFIG.role,
            PROTOCOL_VERSION: JADE_CONFIG.protocol_version,
            CONTROL_SIGNAL: stateData.state,
            METRICS: {
                E: stateData.e_metric,
                B: stateData.beta_metric
            },
            MANDATE: stateInfo.mandate,
            FOCUS: stateInfo.focus,
            WORD_LIMIT: JADE_CONFIG.word_limit
        };

        // Add NGO state if available
        const ngoContext = buildNGOContext();
        if (ngoContext) {
            block.NGO_STATE = ngoContext;
        }

        return JADE_CONFIG.compact_json
            ? JSON.stringify(block)
            : JSON.stringify(block, null, 2);
    };


    /* ---------------------------------------------
       Public: Generate Prompt Including RAG + Action
    --------------------------------------------- */
    const generatePrompt = (ragContext, userAction) => {

        const stateData = determineState();

        // Update state
        state.jade.current_state = stateData.state;
        state.jade.e_metric = stateData.e_metric;
        state.jade.beta_metric = stateData.beta_metric;

        // Append to history
        state.jade.state_history.push({
            turn: state.jade.turn_count,
            state: stateData.state,
            e: stateData.e_metric,
            beta: stateData.beta_metric
        });

        // Efficient trimming
        if (state.jade.state_history.length > 20) {
            state.jade.state_history.shift();
        }

        // Build JSON mandate
        const jsonBlock = buildJSONMandate(stateData);

        // Build NGO narrative guidance (if available)
        let ngoGuidance = "";
        if (JADE_CONFIG.includeNGOState && state.ngo) {
            const phase = typeof getCurrentNGOPhase === 'function'
                ? getCurrentNGOPhase()
                : null;

            if (phase) {
                ngoGuidance = `\nNGO_GUIDANCE: ${phase.authorNoteGuidance || ''}`;
            }
        }

        // Encapsulated system instruction block
        const prompt =
`<JADE_SYSTEM_BLOCK>
${jsonBlock}
</JADE_SYSTEM_BLOCK>

RAG_CONTEXT: ${safeText(ragContext)}
USER_ACTION: ${safeText(userAction)}${ngoGuidance}`;

        if (JADE_CONFIG.debug_logging) {
            const ngoInfo = state.ngo
                ? ` [NGO: ${state.ngo.currentPhase || 'N/A'}, T=${state.ngo.temperature || 0}]`
                : '';
            safeJADELog(`🎭 JADE v2.0-NGO injected (${stateData.state}) [E=${stateData.e_metric}, β=${stateData.beta_metric}]${ngoInfo}`);
        }

        return prompt;
    };


    /* ---------------------------------------------
       Public API: Turn Progression
    --------------------------------------------- */
    const processTurn = () => {
        state.jade.turn_count++;
    };


    /* ---------------------------------------------
       Public API: Get Current State
    --------------------------------------------- */
    const getState = () => ({
        current: state.jade.current_state,
        e: state.jade.e_metric,
        beta: state.jade.beta_metric,
        turn: state.jade.turn_count,
        ngo: buildNGOContext()
    });


    /* ---------------------------------------------
       Public API: Set State Manually
    --------------------------------------------- */
    const setState = (stateName) => {
        if (!JADE_STATES[stateName]) {
            safeJADELog(`⚠️ JADE v2.0-NGO: Invalid state "${stateName}"`);
            return false;
        }
        state.jade.current_state = stateName;
        safeJADELog(`✨ JADE v2.0-NGO: State manually set to ${stateName}`);
        return true;
    };


    /* ---------------------------------------------
       UTILS
    --------------------------------------------- */
    function randBetween({ min, max }) {
        return min + Math.random() * (max - min);
    }

    function round3(num) {
        return Math.round(num * 1000) / 1000;
    }

    function safeText(str) {
        return String(str || "").replace(/[\n\r]/g, " ");
    }


    // Public API
    return {
        initState,
        generatePrompt,
        processTurn,
        getState,
        setState
    };

})();


/* ============================================================================
   INITIALIZE ON LOAD
   ============================================================================ */

JADEProtocol.initState();

// Best Practice: Always end shared library with void 0
void 0;
