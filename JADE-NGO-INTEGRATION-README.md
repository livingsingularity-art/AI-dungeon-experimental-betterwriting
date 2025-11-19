# JADE Protocol v2.0 - NGO Integration

**JADE + NGO = Complete Narrative Control**

JADE Protocol v2.0 now includes full integration with the NGO (Narrative Guidance Overhaul) system, combining JADE's creative directives with NGO's dynamic story arc management.

---

## 🎯 What's New in v2.0-NGO

### Integrated Systems

**JADE Protocol** (Macro Narrative Control)
- Creative mandates (GOLD, SLOP, SALVAGE, VANILLA)
- E (Extraction Efficiency) and β (Beta) metrics
- Structured JSON directives

**NGO System** (Dynamic Story Arc)
- Heat (short-term tension: 0-50)
- Temperature (story arc level: 1-15)
- Story phases (Introduction → Climax → Cooldown)
- Overheat/Cooldown modes

### Combined Output

JADE v2.0-NGO automatically includes NGO state in the AI context:

```json
{
  "ROLE": "NARRATIVE PHYSICIST / SCRIBE",
  "PROTOCOL_VERSION": "Jade 2.0-NGO",
  "CONTROL_SIGNAL": "GOLD",
  "METRICS": {
    "E": 0.875,
    "B": 0.342
  },
  "MANDATE": "Perform the Abductive Leap (Creative surprise)...",
  "FOCUS": "High Narrative Density, Surprise",
  "WORD_LIMIT": 150,
  "NGO_STATE": {
    "HEAT": 24.5,
    "TEMPERATURE": 8,
    "PHASE": "Climax Entry",
    "MODE": "NORMAL",
    "TURNS_LEFT": 0
  }
}

RAG_CONTEXT: [Your story facts]
USER_ACTION: [Player's action]
NGO_GUIDANCE: CLIMAX ENTRY: Rising to peak. Escalate conflict...
```

---

## 📦 Installation

### Step 1: Add to SharedLibrary

Copy the contents of `jade-protocol-v2-ngo-integrated.js` into your AI Dungeon **Shared Library**.

### Step 2: Update Context Script

In your **context.js**, add the JADE injection:

```javascript
const modifier = (text) => {
    // === JADE-NGO INJECTION ===
    if (JADE_CONFIG.enabled) {
        const ragContext = buildRAGContext();
        const userAction = getUserAction();

        // Includes JADE state + NGO state automatically
        const jadeBlock = JADEProtocol.generatePrompt(ragContext, userAction);
        text = jadeBlock + "\n\n" + text;

        JADEProtocol.processTurn();
    }

    // ... rest of your context modifications ...

    return { text };
};
```

See `jade-context-ngo-integration-example.js` for a complete implementation.

---

## 🔄 How It Works

### Automatic NGO State Injection

When both JADE and NGO are enabled, JADE automatically:

1. **Reads NGO state**: Heat, Temperature, Phase, Mode
2. **Includes in JSON mandate**: `NGO_STATE` object
3. **Adds NGO guidance**: Phase-specific author's note text
4. **Logs combined state**: JADE + NGO information

### Data Flow

```
Turn Start
    ↓
NGO processes turn → Updates heat/temp/phase
    ↓
JADE reads NGO state
    ↓
JADE generates JSON mandate (includes NGO_STATE)
    ↓
Context injected → AI sees both systems
    ↓
AI generates output following JADE mandate + NGO guidance
```

---

## 🎮 Example Scenarios

### Scenario 1: Introduction Phase

**NGO State**:
- Heat: 5
- Temperature: 2
- Phase: Introduction

**JADE State**: GOLD (Creative surprise)

**Combined Output**:
```json
{
  "CONTROL_SIGNAL": "GOLD",
  "MANDATE": "Perform the Abductive Leap...",
  "NGO_STATE": {
    "HEAT": 5,
    "TEMPERATURE": 2,
    "PHASE": "Introduction"
  }
}

NGO_GUIDANCE: INTRODUCTION: Set the scene. Establish characters...
```

**AI Behavior**: Creative world-building with subtle character introduction

---

### Scenario 2: Peak Climax

**NGO State**:
- Heat: 42
- Temperature: 11
- Phase: Peak Climax
- Mode: OVERHEAT (3 turns left)

**JADE State**: SLOP (Structural verification)

**Combined Output**:
```json
{
  "CONTROL_SIGNAL": "SLOP",
  "MANDATE": "Pivot to Structural Verification...",
  "NGO_STATE": {
    "HEAT": 42,
    "TEMPERATURE": 11,
    "PHASE": "Peak Climax",
    "MODE": "OVERHEAT",
    "TURNS_LEFT": 3
  }
}

NGO_GUIDANCE: PEAK CLIMAX: Intense confrontation. Major revelations...
```

**AI Behavior**: Intense climax scene BUT with logic verification (prevents plot holes during chaos)

---

### Scenario 3: Cooldown Recovery

**NGO State**:
- Heat: 8
- Temperature: 7
- Phase: Late Rising Action
- Mode: COOLDOWN (2 turns left)

**JADE State**: SALVAGE (Emotional shift)

**Combined Output**:
```json
{
  "CONTROL_SIGNAL": "SALVAGE",
  "MANDATE": "Perform a Time Travel Logic audit. Shift emotional tone...",
  "NGO_STATE": {
    "HEAT": 8,
    "TEMPERATURE": 7,
    "PHASE": "Late Rising Action",
    "MODE": "COOLDOWN",
    "TURNS_LEFT": 2
  }
}

NGO_GUIDANCE: Falling action. Process aftermath. Reflect on consequences.
```

**AI Behavior**: Reflective scene processing aftermath + emotional tone shift

---

## ⚙️ Configuration

### Enable/Disable NGO Integration

```javascript
const JADE_CONFIG = {
    enabled: true,

    // NGO Integration
    includeNGOState: true,    // Include NGO heat/temp/phase in context
    ngoAffectsState: false,   // (Future) Let NGO influence JADE state selection

    // Debug
    debug_logging: false
};
```

### Debug Output

Enable to see combined state logging:

```javascript
JADE_CONFIG.debug_logging = true;
```

Console output:
```
🎭 JADE v2.0-NGO injected (GOLD) [E=0.875, β=0.342] [NGO: Climax Entry, T=8]
```

---

## 🔧 Advanced: NGO-Influenced JADE States

### Future Enhancement (Optional)

You can make JADE state selection respond to NGO temperature:

```javascript
// In jade-protocol-v2-ngo-integrated.js, determineState():

if (JADE_CONFIG.ngoAffectsState && state.ngo) {
    // High temperature (climax) → GOLD for creativity
    if (state.ngo.temperature >= 10) {
        return { state: "GOLD", e_metric: 0.9, beta_metric: 0.2 };
    }

    // Cooldown mode → SALVAGE for reflection
    if (state.ngo.cooldownMode) {
        return { state: "SALVAGE", e_metric: 0.7, beta_metric: 0.4 };
    }

    // Low quality detected → SLOP for correction
    if (state.lastBonepokeScore && state.lastBonepokeScore < 2.5) {
        return { state: "SLOP", e_metric: 0.5, beta_metric: 0.6 };
    }
}
```

Enable this mode:
```javascript
JADE_CONFIG.ngoAffectsState = true;
```

---

## 📊 System Synergy

### How JADE + NGO Complement Each Other

| Aspect | JADE | NGO | Combined |
|--------|------|-----|----------|
| **Scope** | Single-turn mandate | Multi-turn arc | Coherent long-term story with varied expression |
| **Control** | Creative direction | Tension/pacing | Creative variety within proper pacing |
| **Metrics** | E & β (extraction/contradiction) | Heat & Temp | Quality + Structure |
| **Timeframe** | Immediate | Gradual | Both micro and macro control |

### Example: Perfect Synergy

**Turn 25** - Rising action building to climax

**NGO**:
- Temperature: 7 (Late Rising Action)
- Heat: 28 (high tension)
- Guidance: "Accelerate momentum. Deepen complications."

**JADE**:
- State: GOLD (Creative surprise)
- Mandate: "Perform the Abductive Leap"

**Result**: Surprising plot twist that escalates existing tension → Perfect rising action

---

## 🎯 Best Practices

### 1. Let Systems Work Together

✅ **Good**: Both enabled, working in harmony
```javascript
JADE_CONFIG.enabled = true;
CONFIG.ngo.enabled = true;
```

❌ **Bad**: Fighting each other with contradictory settings

### 2. Use Debug Logging During Tuning

```javascript
JADE_CONFIG.debug_logging = true;
CONFIG.ngo.debugLogging = true;
```

Monitor both systems to ensure they're producing good results.

### 3. Trust the Automation

Both systems are designed to adapt automatically. Don't manually override unless necessary.

### 4. RAG Context is Critical

JADE relies on good RAG context. Ensure:
- Memory field has key story facts
- RAG_CONTEXT story card exists
- Recent history is relevant

---

## 📝 Files

- `jade-protocol-v2-ngo-integrated.js` - Main JADE module (add to SharedLibrary)
- `jade-context-ngo-integration-example.js` - Context.js integration example
- `JADE-NGO-INTEGRATION-README.md` - This file

---

## 🔍 Troubleshooting

### NGO_STATE not appearing in JSON

**Cause**: NGO not initialized
**Fix**: Ensure NGO system is enabled in CONFIG and initialized

### JADE ignoring NGO temperature

**Cause**: `ngoAffectsState` is false (default)
**Fix**: Set `JADE_CONFIG.ngoAffectsState = true` (optional)

### Both systems producing contradictory guidance

**Cause**: Misconfigured or fighting mandates
**Fix**: Review debug logs, adjust JADE rotation or NGO phase tuning

---

## 🚀 What's Next

### Future Enhancements

1. **Bidirectional Influence**: NGO temperature influences JADE state selection
2. **Bonepoke Integration**: JADE responds to quality scores (SLOP when quality low)
3. **Smart Synonym Integration**: JADE state influences synonym emotion/precision selection
4. **Adaptive Rotation**: JADE rotation adapts to story needs

---

## 📚 References

- **JADE Protocol Original**: `JADE-PROTOCOL-README.md`
- **NGO System**: `NGO_IMPLEMENTATION_BLUEPRINT.md`
- **Smart Replacement**: `BONEPOKE-ENHANCED-REPLACEMENT-BLUEPRINT.md`
- **Best Practices**: `scripts/BEST_PRACTICES.md`

---

**JADE v2.0-NGO** - The complete narrative control stack for AI Dungeon
**License**: Use freely in your AI Dungeon scenarios
