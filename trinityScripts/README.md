# Trinity Scripts for AI Dungeon

A comprehensive AI Dungeon scripting system that combines multiple enhancement technologies for superior creative writing quality.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Systems](#core-systems)
4. [Configuration](#configuration)
5. [User Commands](#user-commands)
6. [Modules Reference](#modules-reference)
7. [How It Works](#how-it-works)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Trinity Scripts combines several powerful systems to enhance AI Dungeon's output quality:

| System | Purpose |
|--------|---------|
| **Verbalized Sampling (VS)** | Increases output diversity and creativity |
| **Bonepoke Protocol** | Quality analysis and fatigue detection |
| **NGO Engine** | Narrative pacing and tension control |
| **DiversityEngine** | Mode collapse prevention |
| **Smart Replacement** | Intelligent synonym substitution |
| **Auto-Cards** | Automatic story card generation |

---

## Installation

Copy each script file to the corresponding AI Dungeon script slot:

| File | Destination |
|------|-------------|
| `trinitysharedLibrary(1).js` | Shared Library > Library |
| `trinityinput(1).js` | Scripts > Input |
| `trinitycontext(1).js` | Scripts > Context |
| `trinityoutput(1).js` | Scripts > Output |

---

## Core Systems

### Verbalized Sampling (VS)

Instructs the AI to consider multiple narrative directions before selecting one, increasing creativity and reducing predictability.

**How it works:**
- Injects sampling instructions into context
- AI considers k candidates with probability threshold tau
- Selects from "unlikely tails" of the distribution

**Key Settings:**
```javascript
CONFIG.vs = {
    enabled: true,
    k: 5,           // Number of candidates to consider
    tau: 0.10,      // Probability threshold
    adaptive: true  // Auto-adjust based on context
}
```

---

### Bonepoke Protocol

Analyzes output quality across multiple dimensions and detects word fatigue.

**Quality Dimensions:**
- Emotional Strength
- Character Clarity
- Story Flow
- Dialogue Weight
- Word Variety

**Features:**
- Detects overused words/phrases
- Provides quality scores (1-5 scale)
- Triggers synonym replacement for fatigued words
- Logs quality warnings

---

### NGO Engine (Narrative Guidance Overhaul)

Controls narrative pacing through heat and temperature mechanics.

**Heat (Short-term tension):**
- Increases with conflict words
- Decreases with calming words
- Decays naturally over time

**Temperature (Long-term arc):**
- Tracks story phase (Introduction → Climax → Resolution)
- Controls narrative intensity
- Range: 1-15

**Phases:**
| Temp | Phase |
|------|-------|
| 1-2 | Introduction |
| 3-4 | Rising Action |
| 5-6 | Complications |
| 7-8 | Crisis |
| 9-10 | Climax |
| 11-12 | Falling Action |
| 13+ | Resolution |

**Special Modes:**
- **Overheat Mode**: Sustained climax for 4 turns
- **Cooldown Mode**: Forced falling action for 5 turns

---

### DiversityEngine (Mode Collapse Prevention)

Prevents repetitive output patterns by tracking and analyzing diversity metrics.

**Features:**
- N-gram analysis across outputs
- Diversity scoring (0-100%)
- Pattern detection (exact, structural, looping)
- Auto-blocking of repeated phrases
- Escalating intervention prompts

**Intervention Levels:**
| Score | Level | Action |
|-------|-------|--------|
| 80%+ | Excellent | None |
| 65-79% | Good | Monitor |
| 50-64% | Moderate | Nudge |
| 35-49% | Low | Intervene |
| <35% | Critical | Escalate |

---

### Smart Replacement

Intelligently replaces overused words with contextually appropriate synonyms.

**Features:**
- 200+ synonym mappings
- Context-aware selection
- Quality validation before replacement
- Adaptive learning from results

**Strictness Presets:**
- `conservative`: Only replace when strongly needed
- `balanced`: Normal replacement rate (default)
- `aggressive`: Replace more often

---

## Configuration

### Main CONFIG Object

Located in `trinitysharedLibrary(1).js`:

```javascript
const CONFIG = {
    // Verbalized Sampling
    vs: {
        enabled: true,
        k: 5,
        tau: 0.10,
        adaptive: true,
        debugLogging: true
    },

    // Bonepoke Analysis
    bonepoke: {
        enabled: true,
        fatigueThreshold: 3,
        qualityThreshold: 2.5,
        enableDynamicCorrection: true,
        debugLogging: true
    },

    // NGO Engine
    ngo: {
        enabled: true,
        initialHeat: 0,
        initialTemperature: 1,
        maxTemperature: 12,
        // ... many more options
    },

    // Diversity Engine
    diversity: {
        enabled: true,
        alertThreshold: 0.35,
        autoBlockPhrases: true,
        maxBlockedPhrases: 30,
        showFeedback: true,
        debugLogging: true
    },

    // Smart Replacement
    smartReplacement: {
        enabled: true,
        enableValidation: true,
        enableContextMatching: true,
        enableAdaptiveLearning: true
    }
}
```

### Story Card Configuration

Create a story card with key `smart_replacement_config` to adjust settings in-game:

```
SMART REPLACEMENT CONFIGURATION
Toggle features on/off (true/false):

enabled: true
enableValidation: true
enableContextMatching: true
debugLogging: false

Strictness preset (conservative/balanced/aggressive):
preset: balanced
```

---

## User Commands

Type these commands in the Do/Say/Story input:

### Diversity Commands

| Command | Description |
|---------|-------------|
| `/diversity` or `/div` | Show diversity statistics |
| `/health` | Memory and story card health report |
| `/clearblocked` | Clear the blocked phrase list |
| `/diversityreset` or `/divreset` | Full diversity system reset |
| `/threshold 0.35` | Set alert threshold (0-1) |

### NGO Commands

| Command | Description |
|---------|-------------|
| `@req <request>` | Immediate narrative request (injected to frontMemory) |
| `(goal text)` | Gradual goal (persists for 4 turns) |
| `@temp +2` or `@temp -1` | Manual temperature adjustment |
| `@arc climax` | Force specific story phase |

---

## Modules Reference

### DiversityEngine

```javascript
DiversityEngine.generateMeaningfulNgrams(text, n)
// Returns array of meaningful n-grams (filters stopwords)

DiversityEngine.calculateDiversityScore(newText, historyTexts)
// Returns { score: 0-1, overlap: number, details: {...} }

DiversityEngine.detectExactRepetition(text)
// Returns array of repeated phrases

DiversityEngine.detectStructuralRepetition(text)
// Returns array of { pattern, count } for repeated sentence starters

DiversityEngine.detectLoopingPatterns(text)
// Returns array of detected paragraph loops

DiversityEngine.assessDiversity(score)
// Returns { level, action, color } based on score thresholds
```

### MemoryHealth

```javascript
MemoryHealth.analyzeMemory(memoryText)
// Returns array of issues found in memory

MemoryHealth.analyzeStoryCards(cards)
// Returns array of issues found in story cards

MemoryHealth.generateReport()
// Returns formatted health report string
```

### NGOEngine

```javascript
NGOEngine.analyzeConflict(text)
// Returns { conflicts, calming, net }

NGOEngine.updateHeat(conflictData, source)
// Returns { oldHeat, newHeat, delta }

NGOEngine.checkTemperatureIncrease()
// Returns { shouldIncrease, reason }

NGOEngine.applyTemperatureIncrease(qualityApproved)
// Returns { applied, oldTemp, newTemp, reason }

NGOEngine.enterOverheatMode()
// Enters sustained climax mode

NGOEngine.forceEarlyCooldown(reason)
// Forces cooldown mode

NGOEngine.processTurn()
// Processes one complete NGO turn
```

### BonepokeAnalysis

```javascript
BonepokeAnalysis.analyze(text)
// Returns full quality analysis object

BonepokeAnalysis.extractNGrams(text, minSize, maxSize)
// Returns object of n-grams with counts
```

### VerbalizedSampling

```javascript
VerbalizedSampling.getInstruction()
// Returns formatted VS instruction string

VerbalizedSampling.analyzeContext(text)
// Returns adapted { k, tau } parameters

VerbalizedSampling.updateCard(params)
// Updates the VS story card
```

---

## How It Works

### Script Execution Order

```
1. Library loads (shared functions available)
2. Input modifier runs:
   - Processes commands (@req, parentheses, /commands)
   - Enhances say actions
   - Analyzes player input for heat
3. Context modifier runs:
   - Builds layered author's note
   - Applies VS adaptation
   - Injects diversity guidance
   - Injects blocked phrases
4. AI generates response
5. Output modifier runs:
   - Cleans output artifacts
   - Analyzes quality (Bonepoke)
   - Processes NGO turn
   - Analyzes diversity
   - Replaces fatigued words
   - Generates user feedback
```

### Data Flow

```
Player Input
    ↓
[Input Modifier] → Process commands, enhance formatting
    ↓
[Context Modifier] → Build context with VS, diversity guidance
    ↓
[AI Model] → Generate response
    ↓
[Output Modifier] → Analyze, clean, replace, feedback
    ↓
Display to Player
```

### State Persistence

All state is stored in `state` object:

```javascript
state.ngo           // NGO engine state (heat, temperature, phase)
state.diversity     // Diversity tracking (scores, blocked phrases)
state.commands      // Command state (@req, parentheses memory)
state.bonepokeHistory  // Quality analysis history
state.outputHistory    // Recent outputs for n-gram tracking
```

---

## Troubleshooting

### Common Issues

**"Quality below threshold" warnings:**
- Normal during mode collapse
- System will auto-correct via synonym replacement
- Consider manual regeneration for persistent issues

**Diversity score dropping:**
- Use `/diversityreset` to clear history
- Check `/health` for memory issues
- The system will auto-escalate prompts

**VS instructions leaking into output:**
- Already handled by output cleaner
- Check for pattern `[Internal Sampling Protocol...]`

**Empty output after cleaning:**
- System returns single space to prevent crash
- Check logs for what was removed

### Debug Logging

Enable debug logging in CONFIG:

```javascript
CONFIG.vs.debugLogging = true
CONFIG.bonepoke.debugLogging = true
CONFIG.ngo.debugLogging = true
CONFIG.diversity.debugLogging = true
CONFIG.smartReplacement.debugLogging = true
```

### Performance

- Memory is managed automatically (history pruning)
- Regex patterns are cached for performance
- Learning history is pruned every 50 turns

---

## Word Bank Cards

The system creates template story cards for word control:

### PRECISE Removal
Key: `banned_words`
- Removes exact phrases from output
- Format: comma-separated phrases

### AGGRESSIVE Removal
Key: `aggressive_removal`
- Removes entire sentences containing phrase
- Use for severe issues

### REPLACER
Key: `word_replacer`
- Custom synonym mappings
- Format: `original => replacement`

---

## Credits

- **Verbalized Sampling**: Research-based diversity technique
- **Bonepoke Protocol**: Quality analysis system
- **NGO Engine**: Narrative pacing control
- **Auto-Cards**: LewdLeah (GitHub)
- **Better Say Actions**: BinKompliziert (AI Dungeon Discord)
- **DiversityEngine**: Mode collapse prevention (Blueprint implementation)

---

## Version

Trinity Scripts v2.5.0 (with Mode Collapse Prevention)

Last updated: 2025
