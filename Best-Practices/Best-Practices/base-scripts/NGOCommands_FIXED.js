const NGOCommands = (() => {

    /**
     * Process @req command
     * @param {string} text - Input text
     * @returns {Object} { processed, found, request }
     */
    const processReq = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, found: false };

        const reqRegex = new RegExp(`${CONFIG.commands.reqPrefix}\\s+(.+?)(?=$|\\(|@)`, 'i');
        const match = text.match(reqRegex);

        if (!match) return { processed: text, found: false, request: null };

        const request = match[1].trim();

        state.commands.narrativeRequest = request;
        state.commands.narrativeRequestTTL = CONFIG.commands.reqAuthorsNoteTTL;
        state.commands.narrativeRequestFulfilled = false;
        state.commands.lastRequestTime = Date.now();

        state.commands.requestHistory.push({
            request,
            turn: state.ngoStats.totalTurns,
            timestamp: Date.now()
        });

        if (state.commands.requestHistory.length > 20) {
            state.commands.requestHistory = state.commands.requestHistory.slice(-20);
        }

        if (CONFIG.ngo.reqIncreasesHeat) {
            state.ngo.heat += CONFIG.ngo.reqHeatBonus;
        }

        const processed = text.replace(reqRegex, '').trim();
        safeLog(`🎯 @req: "${request}" (heat +${CONFIG.ngo.reqHeatBonus})`, 'info');

        return { processed, found: true, request };
    };

    /**
     * Process (...) parentheses memory
     * @param {string} text - Input text
     * @returns {Object} { processed, found, memories }
     */
    const processParentheses = (text) => {
        if (!CONFIG.commands.parenthesesEnabled) return { processed: text, found: false };

        const parenRegex = /\(([^)]+)\)/g;
        let match;
        const memories = [];

        while ((match = parenRegex.exec(text)) !== null) {
            memories.push(match[1].trim());
        }

        if (memories.length === 0) return { processed: text, found: false, memories: [] };

        // Shift memories down (FIFO)
        state.commands.memory3 = state.commands.memory2;
        state.commands.expiration3 = state.commands.expiration2;
        state.commands.memory2 = state.commands.memory1;
        state.commands.expiration2 = state.commands.expiration1;

        const newestMemory = memories[memories.length - 1];
        state.commands.memory1 = newestMemory;
        state.commands.expiration1 = state.ngoStats.totalTurns + CONFIG.commands.parenthesesDefaultTTL;

        if (CONFIG.ngo.parenthesesIncreasesHeat) {
            state.ngo.heat += CONFIG.ngo.parenthesesHeatBonus;
        }

        const processed = text.replace(parenRegex, '').trim();
        safeLog(`📝 Memory stored: "${newestMemory}" (expires turn ${state.commands.expiration1})`, 'info');

        return { processed, found: true, memories };
    };

    /**
     * Process @temp command
     * @param {string} text - Input text
     * @returns {Object} { processed, found, action, value }
     */
    const processTemp = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, found: false };

        const tempRegex = new RegExp(`${CONFIG.commands.tempCommand}\\s+(reset|[+-]?\\d+)`, 'i');
        const match = text.match(tempRegex);

        if (!match) return { processed: text, found: false };

        const value = match[1].toLowerCase();
        let action = null;
        let numValue = null;

        if (value === 'reset') {
            state.ngo.temperature = CONFIG.ngo.initialTemperature;
            state.ngo.heat = CONFIG.ngo.initialHeat;
            state.ngo.overheatMode = false;
            state.ngo.cooldownMode = false;
            state.ngo.consecutiveConflicts = 0;
            action = 'reset';
            numValue = CONFIG.ngo.initialTemperature;
            safeLog('🔄 NGO state RESET', 'success');
        } else if (value.startsWith('+') || value.startsWith('-')) {
            const delta = parseInt(value);
            state.ngo.temperature = Math.max(
                CONFIG.ngo.minTemperature,
                Math.min(CONFIG.ngo.trueMaxTemperature, state.ngo.temperature + delta)
            );
            action = delta > 0 ? 'increase' : 'decrease';
            numValue = state.ngo.temperature;
            safeLog(`🌡️ Temperature ${delta > 0 ? '+' : ''}${delta} → ${state.ngo.temperature}`, 'info');
        } else {
            const absolute = parseInt(value);
            state.ngo.temperature = Math.max(
                CONFIG.ngo.minTemperature,
                Math.min(CONFIG.ngo.trueMaxTemperature, absolute)
            );
            action = 'set';
            numValue = state.ngo.temperature;
            safeLog(`🌡️ Temperature set to ${state.ngo.temperature}`, 'info');
        }

        return { processed: text.replace(tempRegex, '').trim(), found: true, action, value: numValue };
    };

    /**
     * Process @arc command
     * @param {string} text - Input text
     * @returns {Object} { processed, found, phase }
     */
    const processArc = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, found: false };

        const arcRegex = new RegExp(`${CONFIG.commands.arcCommand}\\s+(intro|rising|climax|cooldown|overheat)`, 'i');
        const match = text.match(arcRegex);

        if (!match) return { processed: text, found: false };

        const phase = match[1].toLowerCase();

        switch (phase) {
            case 'intro':
                state.ngo.temperature = 1;
                state.ngo.heat = 0;
                state.ngo.overheatMode = false;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc → INTRODUCTION', 'info');
                break;
            case 'rising':
                state.ngo.temperature = 6;
                state.ngo.heat = 5;
                state.ngo.overheatMode = false;
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc → RISING ACTION', 'info');
                break;
            case 'climax':
                state.ngo.temperature = 10;
                state.ngo.heat = 10;
                NGOEngine.enterOverheatMode();
                state.ngo.cooldownMode = false;
                safeLog('📖 Arc → CLIMAX', 'warn');
                break;
            case 'cooldown':
                NGOEngine.forceEarlyCooldown('manual');
                break;
            case 'overheat':
                NGOEngine.enterOverheatMode();
                break;
        }

        return { processed: text.replace(arcRegex, '').trim(), found: true, phase };
    };

    // ============================================================================
    // FIX: MOVED THESE FUNCTIONS BEFORE processAllCommands
    // Previously these were defined AFTER processAllCommands, causing
    // ReferenceError when processAllCommands tried to call them
    // ============================================================================

    /**
     * Process @report command (Phase 5) - Shows replacement performance stats
     * @param {string} text - Input text
     * @returns {Object} { processed, found, shouldDisplay }
     */
    const processReport = (text) => {
        const reportRegex = /@report|\/report/i;
        const match = text.match(reportRegex);

        if (!match) return { processed: text, found: false, shouldDisplay: false };

        // Generate and log the report
        const report = generateReplacementReport();
        log(report);

        // Remove the command from text
        const processed = text.replace(reportRegex, '').trim();

        return { processed, found: true, shouldDisplay: true };
    };

    /**
     * Process @strictness command (Phase 6 - MEDIUM #8) - Set replacement strictness level
     * @param {string} text - Input text
     * @returns {Object} { processed, found, level }
     */
    const processStrictness = (text) => {
        const strictnessRegex = /@strictness\s+(conservative|balanced|aggressive)/i;
        const match = text.match(strictnessRegex);

        if (!match) return { processed: text, found: false };

        const level = match[1].toLowerCase();
        const success = applyStrictnessPreset(level);

        // Remove the command from text
        const processed = text.replace(strictnessRegex, '').trim();

        return { processed, found: true, level, success };
    };

    // ============================================================================
    // END OF FIX - processAllCommands can now safely call processReport and processStrictness
    // ============================================================================

    /**
     * Process all commands in input text
     * @param {string} text - Input text
     * @returns {Object} { processed, commands }
     */
    const processAllCommands = (text) => {
        if (!CONFIG.commands.enabled) return { processed: text, commands: {} };

        let processed = text;
        const commands = {};

        // Process in order: @report, @strictness, @req, (...), @temp, @arc
        const reportResult = processReport(processed);
        processed = reportResult.processed;
        if (reportResult.found) commands.report = true;

        const strictnessResult = processStrictness(processed);
        processed = strictnessResult.processed;
        if (strictnessResult.found) commands.strictness = strictnessResult.level;

        const reqResult = processReq(processed);
        processed = reqResult.processed;
        if (reqResult.found) commands.req = reqResult.request;

        const parenResult = processParentheses(processed);
        processed = parenResult.processed;
        if (parenResult.found) commands.parentheses = parenResult.memories;

        const tempResult = processTemp(processed);
        processed = tempResult.processed;
        if (tempResult.found) commands.temp = { action: tempResult.action, value: tempResult.value };

        const arcResult = processArc(processed);
        processed = arcResult.processed;
        if (arcResult.found) commands.arc = arcResult.phase;

        return { processed, commands };
    };

    /**
     * Build front memory injection for @req
     * @returns {string} Front memory text
     */
    const buildFrontMemoryInjection = () => {
        if (!CONFIG.commands.reqDualInjection) return '';
        if (!state.commands.narrativeRequest || state.commands.narrativeRequestTTL <= 0) return '';

        return `<SYSTEM>
# Narrative shaping:
Weave the following concept into the next output in a subtle, immersive way:
${state.commands.narrativeRequest}
</SYSTEM>`;
    };

    /**
     * Build author's note layers for commands
     * @returns {Object} { reqGuidance, memoryGuidance }
     */
    const buildAuthorsNoteLayer = () => {
        const result = { reqGuidance: '', memoryGuidance: '' };

        if (state.commands.narrativeRequest && state.commands.narrativeRequestTTL > 0) {
            result.reqGuidance = `PRIORITY: Immediately and naturally introduce: ${state.commands.narrativeRequest}`;
        }

        const memoryParts = [];
        if (state.commands.memory1 && state.commands.expiration1 > state.ngoStats.totalTurns) {
            memoryParts.push(`After the current phrase, flawlessly transition the story towards: ${state.commands.memory1}`);
        }
        if (state.commands.memory2 && state.commands.expiration2 > state.ngoStats.totalTurns) {
            memoryParts.push(`Additionally consider: ${state.commands.memory2}`);
        }
        if (state.commands.memory3 && state.commands.expiration3 > state.ngoStats.totalTurns) {
            memoryParts.push(`Background goal: ${state.commands.memory3}`);
        }

        if (memoryParts.length > 0) {
            result.memoryGuidance = memoryParts.join(' ');
        }

        return result;
    };

    /**
     * Detect if request was fulfilled in output
     * @param {string} outputText - AI output text
     * @returns {Object} { fulfilled, score, reason }
     */
    const detectFulfillment = (outputText) => {
        if (!CONFIG.commands.detectFulfillment) return { fulfilled: false, reason: 'disabled' };
        if (!state.commands.narrativeRequest) return { fulfilled: false, reason: 'no_request' };

        const request = state.commands.narrativeRequest.toLowerCase();
        const textLower = outputText.toLowerCase();

        // Keyword matching
        const keywords = request.split(/\s+/).filter(w => w.length > 3);
        const matchedKeywords = keywords.filter(kw => textLower.includes(kw));
        const keywordScore = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;

        // N-gram overlap
        const requestNGrams = Object.keys(BonepokeAnalysis.extractNGrams(request, 2, 3));
        const textNGrams = Object.keys(BonepokeAnalysis.extractNGrams(outputText, 2, 3));
        const ngramOverlap = requestNGrams.filter(ng => textNGrams.includes(ng)).length;
        const ngramScore = requestNGrams.length > 0 ? ngramOverlap / requestNGrams.length : 0;

        const fulfillmentScore = (keywordScore * 0.6) + (ngramScore * 0.4);
        const fulfilled = fulfillmentScore >= CONFIG.commands.fulfillmentThreshold;

        if (fulfilled) {
            state.commands.narrativeRequestFulfilled = true;
            state.commands.narrativeRequest = null;
            state.commands.narrativeRequestTTL = 0;
            state.ngoStats.requestsFulfilled++;
            safeLog(`✅ Request FULFILLED! (score: ${fulfillmentScore.toFixed(2)})`, 'success');
            return { fulfilled: true, score: fulfillmentScore, reason: 'threshold_met' };
        } else {
            state.commands.narrativeRequestTTL--;

            if (state.commands.narrativeRequestTTL <= 0) {
                state.commands.narrativeRequest = null;
                state.ngoStats.requestsFailed++;
                safeLog('❌ Request EXPIRED', 'warn');
                return { fulfilled: false, score: fulfillmentScore, reason: 'ttl_expired' };
            }

            return { fulfilled: false, score: fulfillmentScore, reason: 'pending' };
        }
    };

    /**
     * Clean up expired memories
     * @returns {number} Number of memories expired
     */
    const cleanupExpiredMemories = () => {
        let expired = 0;

        if (state.commands.expiration1 && state.commands.expiration1 <= state.ngoStats.totalTurns) {
            state.commands.memory1 = '';
            state.commands.expiration1 = null;
            expired++;
        }

        if (state.commands.expiration2 && state.commands.expiration2 <= state.ngoStats.totalTurns) {
            state.commands.memory2 = '';
            state.commands.expiration2 = null;
            expired++;
        }

        if (state.commands.expiration3 && state.commands.expiration3 <= state.ngoStats.totalTurns) {
            state.commands.memory3 = '';
            state.commands.expiration3 = null;
            expired++;
        }

        if (expired > 0) {
            safeLog(`🗑️ ${expired} memories expired`, 'info');
        }

        return expired;
    };

    return {
        processReq,
        processParentheses,
        processTemp,
        processArc,
        processReport,
        processStrictness,
        processAllCommands,
        buildFrontMemoryInjection,
        buildAuthorsNoteLayer,
        detectFulfillment,
        cleanupExpiredMemories
    };
})();
