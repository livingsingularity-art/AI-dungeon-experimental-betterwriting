# JADE Protocol for AI Dungeon

Converted from Python to JavaScript following AI Dungeon best practices.

## 📋 Overview

JADE Protocol is a **JSON-based narrative control system** that guides AI behavior through structured mandates. It translates narrative states (GOLD, SLOP, SALVAGE) into high-leverage JSON directives.

## 🎯 Narrative States

### GOLD
- **Mandate**: Perform the Abductive Leap (Creative surprise)
- **Focus**: High Narrative Density, Surprise
- **Use when**: Story needs creative breakthrough or unexpected twist

### SLOP
- **Mandate**: Structural Verification (Deductive Logic)
- **Focus**: Correction, Cohesion Trap Avoidance
- **Use when**: Characters acting inconsistently or logic breaking down

### SALVAGE
- **Mandate**: Time Travel Logic check + Missing Piece Card
- **Focus**: Emotional Shift, Hidden Element
- **Use when**: Need to recover from poor output or shift emotional tone

### VANILLA
- **Mandate**: Containment - Description only
- **Focus**: Environment description
- **Use when**: Need to slow down and ground the story

## 📦 Installation

### Step 1: Add to SharedLibrary

Copy the contents of `jade-protocol-example.js` into your AI Dungeon **Shared Library**.

### Step 2: Integrate into Context Script

In your **context.js** script, add:

```javascript
const modifier = (text) => {
    if (JADE_CONFIG.enabled) {
        // Build RAG context from memory/story cards
        const ragContext = state.memory?.context || "[Default context]";

        // Get last user action
        const userAction = history[history.length - 1]?.text || "Continue.";

        // Generate and prepend JADE prompt
        const jadePrompt = JADEProtocol.generatePrompt(ragContext, userAction);
        text = jadePrompt + "\n\n" + text;

        // Process turn
        JADEProtocol.processTurn();
    }

    return { text };
};
```

See `jade-context-integration-example.js` for a complete example.

## 🎮 Usage

### Automatic Mode (Default)

JADE automatically rotates through states each turn:
- Turn 1: GOLD
- Turn 2: SLOP
- Turn 3: SALVAGE
- Turn 4: GOLD (repeats)

### Manual Control

Force a specific state:

```javascript
// In input.js or context.js
if (text.includes("@jade gold")) {
    JADEProtocol.setState("GOLD");
}
if (text.includes("@jade slop")) {
    JADEProtocol.setState("SLOP");
}
```

### Check Current State

```javascript
const current = JADEProtocol.getState();
log(`State: ${current.state}, E: ${current.e_metric}, Beta: ${current.beta_metric}`);
```

## 📊 Metrics

### E (Extraction Efficiency)
- **Range**: 0.3 - 0.95
- **Meaning**: How efficiently the AI extracts narrative potential
- **Higher = Better**: More narrative density per word

### β (Beta - Narrative Contradiction)
- **Range**: 0.1 - 0.7
- **Meaning**: Level of internal contradiction in the narrative
- **Lower = Better**: Fewer logic/character inconsistencies

> **Note**: In the example code, metrics are randomized. In production, replace `determineState()` with your actual bonepoke_core_engine calculations.

## 🔧 Configuration

Edit `JADE_CONFIG` in the script:

```javascript
const JADE_CONFIG = {
    enabled: true,              // Toggle JADE on/off
    protocol_version: "Jade 2.2",
    word_limit: 150,            // AI response word limit
    debug_logging: false        // Console output
};
```

## 📐 How It Works

1. **State Determination**: Each turn, JADE determines the current narrative state (GOLD/SLOP/SALVAGE)
2. **JSON Generation**: Builds a structured JSON mandate with:
   - Control signal (state name)
   - Metrics (E and Beta)
   - Narrative mandate (what the AI should do)
   - Focus area (specific guidance)
3. **Context Injection**: Prepends JSON to AI context BEFORE all other text
4. **AI Processing**: AI reads JSON as system instruction and adjusts behavior

## 🧪 Testing

Enable debug logging:

```javascript
const JADE_CONFIG = {
    // ...
    debug_logging: true
};
```

Uncomment the test block at the bottom of `jade-protocol-example.js` to see example output.

## 🔄 Integration with Existing Systems

JADE works alongside:
- **Verbalized Sampling**: JADE sets narrative direction, VS controls expression diversity
- **Bonepoke**: JADE provides macro guidance, Bonepoke handles micro quality control
- **NGO System**: JADE can read NGO temperature/heat to inform state selection

Example combined use:

```javascript
const modifier = (text) => {
    // 1. JADE narrative control
    if (JADE_CONFIG.enabled) {
        const jadePrompt = JADEProtocol.generatePrompt(ragContext, userAction);
        text = jadePrompt + "\n\n" + text;
        JADEProtocol.processTurn();
    }

    // 2. Verbalized Sampling diversity
    if (CONFIG.vs.enabled) {
        text += "\n\n" + VerbalizedSampling.getInstruction();
    }

    return { text };
};
```

## 📝 RAG Context

**RAG (Retrieval-Augmented Generation)** provides the AI with key story facts.

Good RAG context examples:
```
[RAG: Lizard is Nicolette's goat. CK was a rapper. The café is called "The Grind".]
```

Bad RAG context:
```
[RAG: There are many characters and things happened before.]
```

**Sources for RAG context**:
1. `state.memory.context` - Player's Memory field
2. Story Cards tagged with `rag_context`
3. Recent history summary (last 2-3 outputs)
4. Character/location cards

## 🎯 Best Practices

1. ✅ **Keep JSON compact**: MythoMax-L2 parses it better when concise
2. ✅ **Rotate states**: Don't stay in one state too long (3-5 turns max)
3. ✅ **Use GOLD for breakthroughs**: When story feels stale
4. ✅ **Use SLOP for corrections**: When characters act out of character
5. ✅ **Use SALVAGE for recovery**: After bad AI outputs
6. ✅ **Provide good RAG**: Quality facts = better AI understanding
7. ✅ **Monitor metrics**: Watch E and Beta to track narrative health

## 🚫 Common Mistakes

❌ **Staying in SLOP too long**: Creates overly rigid, correction-focused writing
❌ **No RAG context**: AI lacks grounding in story facts
❌ **Ignoring metrics**: E and Beta tell you when to change states
❌ **Forgetting processTurn()**: Turn counter gets out of sync

## 🔮 Advanced: Dynamic State Selection

Replace the simple rotation in `determineState()` with smart logic:

```javascript
const determineState = () => {
    // Use NGO heat/temperature
    if (state.ngo && state.ngo.temperature >= 10) {
        return { state: "GOLD", e_metric: 0.9, beta_metric: 0.2 };
    }

    // Use Bonepoke quality
    if (state.lastBonepokeScore < 2.5) {
        return { state: "SLOP", e_metric: 0.5, beta_metric: 0.6 };
    }

    // Check for repetition
    const recentStates = state.jade.state_history.slice(-3);
    if (recentStates.every(s => s.state === "GOLD")) {
        return { state: "SALVAGE", e_metric: 0.7, beta_metric: 0.4 };
    }

    // Default: continue current pattern
    return rotateState();
};
```

## 📚 Files

- `jade-protocol-example.js` - Main JADE module (add to SharedLibrary)
- `jade-context-integration-example.js` - Context.js integration example
- `JADE-PROTOCOL-README.md` - This file

## 🤝 Contributing

To improve JADE Protocol:

1. Replace random metrics with actual calculations
2. Implement bonepoke_core_engine logic
3. Add more states or customize existing mandates
4. Tune metrics ranges based on testing

## 📖 References

- Original Python implementation by user
- AI Dungeon Scripting: https://help.aidungeon.com/scripting
- Best practices: `/scripts/BEST_PRACTICES.md`

---

**JADE Protocol v1.0** - JavaScript conversion for AI Dungeon
**License**: Use freely in your AI Dungeon scenarios
