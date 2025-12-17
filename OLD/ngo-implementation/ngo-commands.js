/**
 * NGO Command System
 * Processes player commands as narrative pressure vectors
 *
 * Commands:
 * - @req <text> : Immediate narrative request (dual injection)
 * - (...) : Parentheses memory (gradual goal)
 * - @temp <value> : Manual temperature control
 * - @arc <phase> : Direct phase control
 *
 * Add to input.js
 */

const NGOCommandProcessor = (() => {
    // Reference to CONFIG.commands (set at runtime)
    let config = null;

    /**
     * Initialize the processor with config reference
     * @param {Object} commandsConfig - The CONFIG.commands object
     */
    const init = (commandsConfig) => {
        config = commandsConfig;
    };

    /**
     * Process @req command
     * @param {string} text - Input text
     * @param {Object} commandState - state.commands object
     * @param {Object} ngoState - state.ngo object
     * @param {Object} ngoStats - state.ngoStats object
     * @param {Object} ngoConfig - CONFIG.ngo object
     * @returns {Object} { processed: string, found: boolean, request: string }
     */
    const processReq = (text, commandState, ngoState, ngoStats, ngoConfig) => {
        if (!config || !config.enabled) {
            return { processed: text, found: false, request: null };
        }

        const reqRegex = new RegExp(`${config.reqPrefix}\\s+(.+?)(?=$|\\(|@)`, 'i');
        const match = text.match(reqRegex);

        if (!match) {
            return { processed: text, found: false, request: null };
        }

        const request = match[1].trim();

        // Store request with TTL
        commandState.narrativeRequest = request;
        commandState.narrativeRequestTTL = config.reqAuthorsNoteTTL;
        commandState.narrativeRequestFulfilled = false;
        commandState.lastRequestTime = Date.now();

        // Track for analytics
        commandState.requestHistory = commandState.requestHistory || [];
        commandState.requestHistory.push({
            request: request,
            turn: ngoStats.totalTurns,
            timestamp: Date.now()
        });

        // Trim history to last 20 requests
        if (commandState.requestHistory.length > 20) {
            commandState.requestHistory = commandState.requestHistory.slice(-20);
        }

        // NGO integration: @req increases heat
        if (ngoConfig.reqIncreasesHeat) {
            ngoState.heat += ngoConfig.reqHeatBonus;
        }

        // Remove command from text
        const processed = text.replace(reqRegex, '').trim();

        return { processed, found: true, request };
    };

    /**
     * Process (...) parentheses memory
     * @param {string} text - Input text
     * @param {Object} commandState - state.commands object
     * @param {Object} ngoState - state.ngo object
     * @param {Object} ngoStats - state.ngoStats object
     * @param {Object} ngoConfig - CONFIG.ngo object
     * @returns {Object} { processed: string, found: boolean, memories: string[] }
     */
    const processParentheses = (text, commandState, ngoState, ngoStats, ngoConfig) => {
        if (!config || !config.parenthesesEnabled) {
            return { processed: text, found: false, memories: [] };
        }

        const parenRegex = /\(([^)]+)\)/g;
        let match;
        const memories = [];

        while ((match = parenRegex.exec(text)) !== null) {
            memories.push(match[1].trim());
        }

        if (memories.length === 0) {
            return { processed: text, found: false, memories: [] };
        }

        // Shift existing memories down (FIFO queue)
        commandState.memory3 = commandState.memory2;
        commandState.expiration3 = commandState.expiration2;
        commandState.memory2 = commandState.memory1;
        commandState.expiration2 = commandState.expiration1;

        // Store newest in slot 1 (highest priority)
        const newestMemory = memories[memories.length - 1];  // Last one = most recent
        commandState.memory1 = newestMemory;
        commandState.expiration1 = ngoStats.totalTurns + config.parenthesesDefaultTTL;

        // NGO integration: parentheses increase heat
        if (ngoConfig.parenthesesIncreasesHeat) {
            ngoState.heat += ngoConfig.parenthesesHeatBonus;
        }

        // Remove parentheses from text (keep the surrounding text)
        const processed = text.replace(parenRegex, '').trim();

        return { processed, found: true, memories };
    };

    /**
     * Process @temp command
     * @param {string} text - Input text
     * @param {Object} ngoState - state.ngo object
     * @param {Object} ngoConfig - CONFIG.ngo object
     * @returns {Object} { processed: string, found: boolean, action: string, value: number }
     */
    const processTemp = (text, ngoState, ngoConfig) => {
        if (!config || !config.enabled) {
            return { processed: text, found: false, action: null, value: null };
        }

        const tempRegex = new RegExp(`${config.tempCommand}\\s+(reset|[+-]?\\d+)`, 'i');
        const match = text.match(tempRegex);

        if (!match) {
            return { processed: text, found: false, action: null, value: null };
        }

        const value = match[1].toLowerCase();
        let action = null;
        let numValue = null;

        if (value === 'reset') {
            ngoState.temperature = ngoConfig.initialTemperature;
            ngoState.heat = ngoConfig.initialHeat;
            ngoState.overheatMode = false;
            ngoState.cooldownMode = false;
            ngoState.overheatTurnsLeft = 0;
            ngoState.cooldownTurnsLeft = 0;
            ngoState.consecutiveConflicts = 0;
            action = 'reset';
            numValue = ngoConfig.initialTemperature;
        } else if (value.startsWith('+') || value.startsWith('-')) {
            const delta = parseInt(value);
            const oldTemp = ngoState.temperature;
            ngoState.temperature = Math.max(
                ngoConfig.minTemperature,
                Math.min(ngoConfig.trueMaxTemperature, ngoState.temperature + delta)
            );
            action = delta > 0 ? 'increase' : 'decrease';
            numValue = ngoState.temperature;
        } else {
            const absolute = parseInt(value);
            ngoState.temperature = Math.max(
                ngoConfig.minTemperature,
                Math.min(ngoConfig.trueMaxTemperature, absolute)
            );
            action = 'set';
            numValue = ngoState.temperature;
        }

        const processed = text.replace(tempRegex, '').trim();

        return { processed, found: true, action, value: numValue };
    };

    /**
     * Process @arc command
     * @param {string} text - Input text
     * @param {Object} ngoState - state.ngo object
     * @param {Object} ngoStats - state.ngoStats object
     * @param {Object} ngoConfig - CONFIG.ngo object
     * @returns {Object} { processed: string, found: boolean, phase: string }
     */
    const processArc = (text, ngoState, ngoStats, ngoConfig) => {
        if (!config || !config.enabled) {
            return { processed: text, found: false, phase: null };
        }

        const arcRegex = new RegExp(`${config.arcCommand}\\s+(intro|rising|climax|cooldown|overheat)`, 'i');
        const match = text.match(arcRegex);

        if (!match) {
            return { processed: text, found: false, phase: null };
        }

        const phase = match[1].toLowerCase();

        switch (phase) {
            case 'intro':
                ngoState.temperature = 1;
                ngoState.heat = 0;
                ngoState.overheatMode = false;
                ngoState.cooldownMode = false;
                break;
            case 'rising':
                ngoState.temperature = 6;
                ngoState.heat = 5;
                ngoState.overheatMode = false;
                ngoState.cooldownMode = false;
                break;
            case 'climax':
                ngoState.temperature = 10;
                ngoState.heat = 10;
                ngoState.overheatMode = true;
                ngoState.overheatTurnsLeft = ngoConfig.overheatDuration;
                ngoState.cooldownMode = false;
                ngoStats.totalOverheats = (ngoStats.totalOverheats || 0) + 1;
                break;
            case 'cooldown':
                NGOEngine.forceEarlyCooldown(ngoState, ngoStats, 'manual');
                break;
            case 'overheat':
                NGOEngine.enterOverheatMode(ngoState, ngoStats);
                break;
        }

        const processed = text.replace(arcRegex, '').trim();

        return { processed, found: true, phase };
    };

    /**
     * Process all commands in input text
     * @param {string} text - Input text
     * @param {Object} state - Full state object
     * @returns {Object} { processed: string, commands: Object }
     */
    const processAllCommands = (text, state) => {
        if (!config || !config.enabled) {
            return { processed: text, commands: {} };
        }

        let processed = text;
        const commands = {};

        // Initialize state objects if needed
        state.ngo = state.ngo || {};
        state.ngoStats = state.ngoStats || {};
        state.commands = state.commands || {};

        // Reference to NGO config (would be CONFIG.ngo in actual implementation)
        const ngoConfig = CONFIG.ngo;

        // Process @req (highest priority - immediate narrative injection)
        const reqResult = processReq(processed, state.commands, state.ngo, state.ngoStats, ngoConfig);
        processed = reqResult.processed;
        if (reqResult.found) {
            commands.req = reqResult.request;
        }

        // Process (...) parentheses memory
        const parenResult = processParentheses(processed, state.commands, state.ngo, state.ngoStats, ngoConfig);
        processed = parenResult.processed;
        if (parenResult.found) {
            commands.parentheses = parenResult.memories;
        }

        // Process @temp (manual temperature control)
        const tempResult = processTemp(processed, state.ngo, ngoConfig);
        processed = tempResult.processed;
        if (tempResult.found) {
            commands.temp = { action: tempResult.action, value: tempResult.value };
        }

        // Process @arc (phase control)
        const arcResult = processArc(processed, state.ngo, state.ngoStats, ngoConfig);
        processed = arcResult.processed;
        if (arcResult.found) {
            commands.arc = arcResult.phase;
        }

        return { processed, commands };
    };

    /**
     * Build front memory injection for @req
     * @param {Object} commandState - state.commands object
     * @returns {string} Front memory injection text or empty string
     */
    const buildFrontMemoryInjection = (commandState) => {
        if (!config || !config.reqDualInjection) {
            return '';
        }

        if (!commandState.narrativeRequest || commandState.narrativeRequestTTL <= 0) {
            return '';
        }

        return `<SYSTEM>
# Narrative shaping:
Weave the following concept into the next output in a subtle, immersive way:
${commandState.narrativeRequest}
</SYSTEM>`;
    };

    /**
     * Build author's note layer for commands
     * @param {Object} commandState - state.commands object
     * @param {Object} ngoStats - state.ngoStats object
     * @returns {Object} { reqGuidance: string, memoryGuidance: string }
     */
    const buildAuthorsNoteLayer = (commandState, ngoStats) => {
        const result = {
            reqGuidance: '',
            memoryGuidance: ''
        };

        // @req guidance (immediate priority)
        if (commandState.narrativeRequest && commandState.narrativeRequestTTL > 0) {
            result.reqGuidance = `PRIORITY: Immediately and naturally introduce: ${commandState.narrativeRequest}`;
        }

        // Parentheses memory guidance (gradual goals)
        const memoryParts = [];
        if (commandState.memory1 && commandState.expiration1 > ngoStats.totalTurns) {
            memoryParts.push(`After the current phrase, flawlessly transition the story towards: ${commandState.memory1}`);
        }
        if (commandState.memory2 && commandState.expiration2 > ngoStats.totalTurns) {
            memoryParts.push(`Additionally consider: ${commandState.memory2}`);
        }
        if (commandState.memory3 && commandState.expiration3 > ngoStats.totalTurns) {
            memoryParts.push(`Background goal: ${commandState.memory3}`);
        }

        if (memoryParts.length > 0) {
            result.memoryGuidance = memoryParts.join(' ');
        }

        return result;
    };

    /**
     * Detect if request was fulfilled in output
     * @param {string} outputText - AI output text
     * @param {Object} commandState - state.commands object
     * @param {Object} ngoStats - state.ngoStats object
     * @returns {Object} { fulfilled: boolean, score: number, reason: string }
     */
    const detectFulfillment = (outputText, commandState, ngoStats) => {
        if (!config || !config.detectFulfillment) {
            return { fulfilled: false, score: 0, reason: 'detection_disabled' };
        }

        if (!commandState.narrativeRequest) {
            return { fulfilled: false, score: 0, reason: 'no_request' };
        }

        const request = commandState.narrativeRequest.toLowerCase();
        const textLower = outputText.toLowerCase();

        // Method 1: Keyword matching (60% weight)
        const keywords = request.split(/\s+/).filter(w => w.length > 3);
        const matchedKeywords = keywords.filter(kw => textLower.includes(kw));
        const keywordScore = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

        // Method 2: N-gram overlap (40% weight)
        // Note: This uses BonepokeAnalysis.extractNGrams if available
        let ngramScore = 0;
        if (typeof BonepokeAnalysis !== 'undefined' && BonepokeAnalysis.extractNGrams) {
            const requestNGrams = Object.keys(BonepokeAnalysis.extractNGrams(request, 2, 3));
            const textNGrams = Object.keys(BonepokeAnalysis.extractNGrams(outputText, 2, 3));
            const ngramOverlap = requestNGrams.filter(ng => textNGrams.includes(ng)).length;
            ngramScore = requestNGrams.length > 0 ? ngramOverlap / requestNGrams.length : 0;
        }

        // Combined score
        const fulfillmentScore = (keywordScore * 0.6) + (ngramScore * 0.4);
        const fulfilled = fulfillmentScore >= config.fulfillmentThreshold;

        if (fulfilled) {
            commandState.narrativeRequestFulfilled = true;
            commandState.narrativeRequest = null;
            commandState.narrativeRequestTTL = 0;
            ngoStats.requestsFulfilled = (ngoStats.requestsFulfilled || 0) + 1;
            return { fulfilled: true, score: fulfillmentScore, reason: 'threshold_met' };
        } else {
            // Decrement TTL
            commandState.narrativeRequestTTL--;

            if (commandState.narrativeRequestTTL <= 0) {
                commandState.narrativeRequest = null;
                ngoStats.requestsFailed = (ngoStats.requestsFailed || 0) + 1;
                return { fulfilled: false, score: fulfillmentScore, reason: 'ttl_expired' };
            }

            return { fulfilled: false, score: fulfillmentScore, reason: 'pending' };
        }
    };

    /**
     * Clean up expired memories
     * @param {Object} commandState - state.commands object
     * @param {Object} ngoStats - state.ngoStats object
     * @returns {number} Number of memories expired
     */
    const cleanupExpiredMemories = (commandState, ngoStats) => {
        let expired = 0;

        if (commandState.expiration1 && commandState.expiration1 <= ngoStats.totalTurns) {
            commandState.memory1 = '';
            commandState.expiration1 = null;
            expired++;
        }

        if (commandState.expiration2 && commandState.expiration2 <= ngoStats.totalTurns) {
            commandState.memory2 = '';
            commandState.expiration2 = null;
            expired++;
        }

        if (commandState.expiration3 && commandState.expiration3 <= ngoStats.totalTurns) {
            commandState.memory3 = '';
            commandState.expiration3 = null;
            expired++;
        }

        return expired;
    };

    return {
        init,
        processReq,
        processParentheses,
        processTemp,
        processArc,
        processAllCommands,
        buildFrontMemoryInjection,
        buildAuthorsNoteLayer,
        detectFulfillment,
        cleanupExpiredMemories
    };
})();

// Export for testing
if (typeof module !== 'undefined') {
    module.exports = NGOCommandProcessor;
}
