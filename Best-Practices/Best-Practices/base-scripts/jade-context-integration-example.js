/**
 * ============================================================================
 * JADE PROTOCOL - CONTEXT.JS INTEGRATION EXAMPLE
 * Shows how to integrate JADE Protocol into AI Dungeon context script
 * ============================================================================
 *
 * USAGE:
 * 1. Add jade-protocol-example.js to your SharedLibrary
 * 2. Use this pattern in your context.js script
 *
 * ============================================================================
 */

const modifier = (text) => {

    // === JADE PROTOCOL INJECTION ===
    // Prepends JSON narrative directive to AI context
    if (JADE_CONFIG.enabled) {

        // STEP 1: Extract RAG context from story cards or memory
        // This provides the AI with essential story facts
        const buildRAGContext = () => {
            const facts = [];

            // Option A: Read from memory
            if (state.memory?.context) {
                facts.push(state.memory.context);
            }

            // Option B: Read from specific story cards
            const ragCard = storyCards.find(c => c.title === "RAG_CONTEXT");
            if (ragCard && ragCard.entry) {
                facts.push(ragCard.entry);
            }

            // Option C: Auto-extract from recent history
            const recentContext = history
                .slice(-3)
                .filter(h => h.type === 'ai' || h.type === 'story')
                .map(h => h.text)
                .join(' ')
                .slice(0, 200); // Limit size

            if (recentContext) {
                facts.push(recentContext);
            }

            return facts.filter(Boolean).join(' ') || "[No RAG context available]";
        };

        // STEP 2: Get user action (last player input)
        const getUserAction = () => {
            const lastAction = history
                .slice()
                .reverse()
                .find(h => h.type === 'do' || h.type === 'say');

            return lastAction?.text || "Continue the story.";
        };

        // STEP 3: Build RAG context and user action
        const ragContext = buildRAGContext();
        const userAction = getUserAction();

        // STEP 4: Generate JADE prompt
        const jadePrompt = JADEProtocol.generatePrompt(ragContext, userAction);

        // STEP 5: Prepend to context
        // The JADE mandate goes FIRST so the AI sees it before everything else
        text = jadePrompt + "\n\n" + text;

        // STEP 6: Process turn
        JADEProtocol.processTurn();

        // Debug logging
        if (JADE_CONFIG.debug_logging) {
            const state_info = JADEProtocol.getState();
            log(`🎭 JADE ${state_info.state} injected (turn ${state_info.turn})`);
        }
    }

    // === OTHER CONTEXT MODIFICATIONS ===
    // Your existing context modifications go here
    // (Verbalized Sampling, Bonepoke, etc.)

    return { text };
};

// Best Practice: Don't manually call modifier
void 0;
