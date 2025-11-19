/**
 * ============================================================================
 * JADE v2.0-NGO — Context Integration Example
 * ============================================================================
 * Injects JADE system block at the start of the AI prompt each turn.
 * INCLUDES NGO state information (heat, temperature, phase) in JADE context.
 *
 * Requires: jade-protocol-v2-ngo-integrated.js in SharedLibrary
 * ============================================================================
 */

const modifier = (text) => {
    if (!JADE_CONFIG.enabled) {
        return { text };
    }

    // ------------------------------------------------------
    // 1. Build RAG Context
    // ------------------------------------------------------
    const buildRAGContext = () => {
        const facts = [];

        // Memory field
        if (state.memory?.context) {
            facts.push(state.memory.context);
        }

        // Story card titled "RAG_CONTEXT"
        const ragCard = storyCards.find(c => c.title === "RAG_CONTEXT");
        if (ragCard?.entry) {
            facts.push(ragCard.entry);
        }

        // Last ~3 pieces of AI or story output (auto-context)
        const recent = history
            .slice(-3)
            .filter(h => h.type === "story" || h.type === "ai")
            .map(h => h.text)
            .join(" ")
            .slice(0, 200);

        if (recent) facts.push(recent);

        return facts.filter(Boolean).join(" ") || "[No RAG context available]";
    };

    // ------------------------------------------------------
    // 2. Get user action
    // ------------------------------------------------------
    const getUserAction = () => {
        const last = history
            .slice()
            .reverse()
            .find(h => h.type === "do" || h.type === "say");

        return last?.text || "Continue the story.";
    };

    const ragContext = buildRAGContext();
    const userAction = getUserAction();

    // ------------------------------------------------------
    // 3. Generate JADE system block (WITH NGO STATE)
    // ------------------------------------------------------
    // JADEProtocol.generatePrompt() automatically includes:
    // - JADE state (GOLD/SLOP/SALVAGE/VANILLA)
    // - E and Beta metrics
    // - NGO heat, temperature, phase (if NGO enabled)
    // - NGO author's note guidance
    const jadeBlock = JADEProtocol.generatePrompt(ragContext, userAction);

    // ------------------------------------------------------
    // 4. Prepend JADE system block to context
    // ------------------------------------------------------
    // Always prepend so JADE is read *before* everything else.
    text = jadeBlock + "\n\n" + text;

    // ------------------------------------------------------
    // 5. Advance JADE turn counter
    // ------------------------------------------------------
    JADEProtocol.processTurn();

    // ------------------------------------------------------
    // 6. Debug logging (optional)
    // ------------------------------------------------------
    if (JADE_CONFIG.debug_logging) {
        const jadeState = JADEProtocol.getState();
        log(`🎭 JADE: ${jadeState.current} | NGO: ${jadeState.ngo?.PHASE || 'N/A'} (T=${jadeState.ngo?.TEMPERATURE || 0})`);
    }

    return { text };
};

// Required in AI Dungeon context scripts
void 0;
