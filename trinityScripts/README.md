# Trinity Scripts - XianXia Edition v1.0

**Production-ready AI Dungeon enhancement system optimized for XianXia cultivation stories**

---

## Table of Contents

1. [Introduction](#introduction)
2. [What is XianXia Edition?](#what-is-xianxia-edition)
3. [Core Systems](#core-systems)
4. [Story Phases & Cultivation Stages](#story-phases--cultivation-stages)
5. [Installation](#installation)
6. [Quick Start Guide](#quick-start-guide)
7. [Command Reference](#command-reference)
8. [Customization](#customization)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)
11. [Technical Details](#technical-details)
12. [Credits & License](#credits--license)

---

## Introduction

Trinity Scripts - XianXia Edition is a comprehensive AI Dungeon enhancement system specifically tuned for **cultivation-based storytelling** in the XianXia (仙侠) genre. It combines intelligent narrative pacing, quality control, and genre-specific optimization to create immersive cultivation journeys from mortal awakening to immortal ascension.

### Key Features

- **Cultivation-Aware Story Pacing**: Automatically adapts narrative tension to match cultivation breakthroughs
- **8 Distinct Story Phases**: From Mortal Awakening to Immortal Ascension
- **XianXia Vocabulary Detection**: Recognizes cultivation terms, tribulations, and dao philosophy
- **Quality-Gated Progression**: Ensures breakthroughs happen when writing quality is high
- **Adaptive Sampling**: Adjusts AI creativity based on current cultivation stage
- **Production-Ready**: All debug features removed for clean, fast execution

---

## What is XianXia Edition?

XianXia (仙侠) is a Chinese fantasy genre focused on **cultivation** - the practice of martial arts and Taoist techniques to achieve immortality and transcend mortal limits. This edition of Trinity Scripts understands the unique narrative structure of cultivation stories:

### Cultivation Story Structure

```
Mortal Life → Discovery → Foundation Building → Core Formation →
Tribulation → Ascension → New Realms → Greater Challenges
```

Unlike Western fantasy's linear hero's journey, XianXia stories follow a **cyclic progression pattern**:

1. **Bottleneck**: Protagonist hits a cultivation barrier
2. **Preparation**: Gather resources, insights, allies
3. **Breakthrough Attempt**: Face tribulation or life-death challenge
4. **Consolidation**: Stabilize new realm, understand new powers
5. **New Horizon**: Discover the next level exists
6. **Repeat**: The cycle begins anew at higher stakes

Trinity XianXia Edition manages this cycle automatically through its NGO (Narrative Gravity Oscillator) system.

---

## Core Systems

### 1. NGO (Narrative Gravity Oscillator)

The **central brain** that controls story pacing and intensity.

**How It Works:**
- **Heat**: Short-term tension (0-50 scale)
  - Rises with conflict words: "tribulation", "battle", "rival"
  - Falls with calming words: "meditation", "consolidate", "dao"
- **Temperature**: Long-term arc progression (1-15 scale)
  - Maps to cultivation stages
  - Increases when heat stays high
  - Decreases during cooldown periods

**XianXia Tuning:**
- Tribulation-related words generate high heat
- Meditation and cultivation words reduce heat
- Temperature represents cultivation realm progression

### 2. Bonepoke Protocol

**Quality analysis system** that evaluates AI output across 5 dimensions:

1. **Emotional Strength**: Impact and resonance of emotional moments
2. **Character Clarity**: Distinct voices and clear motivations
3. **Story Flow**: Pacing and narrative cohesion
4. **Dialogue Weight**: Natural, meaningful conversations
5. **Word Variety**: Vocabulary diversity and freshness

**XianXia Integration:**
- Prevents breakthrough at low quality (quality gates temperature increase)
- Triggers cooldown when writing becomes repetitive (fatigue detection)
- Reduces heat when story drifts off-topic (drift detection)

### 3. Verbalized Sampling (VS)

**Diversity engine** that encourages creative, unexpected AI responses.

**How It Works:**
- Instructs AI to generate multiple candidates
- Select from unlikely options (controlled randomness)
- Prevents predictable, repetitive output

**Cultivation Adaptation:**
- Lower creativity during calm training montages (tau=0.15)
- Higher creativity during tribulation chaos (tau=0.06)
- Maximum variation at peak cultivation breakthroughs

### 4. Command System

**Player control tools** for steering the narrative:

- `@req <request>`: Immediate narrative request (1-2 turns)
- `(goal)`: Gradual narrative direction (4 turns)
- `@temp <number>`: Manual temperature override
- `@arc <phase>`: Force specific story phase

---

## Story Phases & Cultivation Stages

Trinity XianXia Edition features **8 distinct story phases**, each mapped to cultivation progression:

### 1. Mortal Awakening (Temperature 1-3)

**Cultivation Stage**: Qi Sensing / Outer Disciple
**Narrative Focus**: Discovery and wonder

**What Happens:**
- Protagonist discovers spiritual roots or hidden talent
- Introduction to cultivation world (sects, qi, spiritual energy)
- First encounters with immortal practitioners
- Hints at special constitution or destiny

**Author's Note Guidance:**
> "The protagonist discovers their connection to cultivation. Introduce sect hierarchy, spiritual energy (qi), and cultivation concepts. Show initial weakness but hint at hidden potential or special constitution. Emphasize wonder and mystery of the immortal path."

**Example Scenario:**
```
The orphan discovers they can sense the spiritual energy flowing through
the ancient jade pendant. An elderly cultivator recognizes their rare
Pure Yang Constitution and offers them a place in the Celestial Sword Sect.
```

---

### 2. Foundation Building (Temperature 4-6)

**Cultivation Stage**: Qi Gathering / Inner Disciple
**Narrative Focus**: Training and rivalry

**What Happens:**
- Rigorous cultivation training montages
- Learning martial techniques and spiritual arts
- Competition for resources (spirit stones, pills, techniques)
- Rivalry with arrogant young masters
- Discovery of manual fragments or hidden techniques

**Author's Note Guidance:**
> "The protagonist undergoes rigorous cultivation training. Show progress through minor breakthroughs and small victories. Introduce cultivation techniques, spirit stones, and pill refinement. Establish rivalries with arrogant young masters. Hint at deeper sect mysteries."

**Example Scenario:**
```
After three months of closed-door cultivation, the protagonist breaks through
to Qi Gathering Stage 5. The young master of the Azure Dragon Family
challenges them to a duel at the Outer Disciple Tournament. The protagonist
discovers a torn page from an ancient sword manual in the sect library.
```

---

### 3. Core Formation Trials (Temperature 7-9)

**Cultivation Stage**: Core Condensation / Core Disciple
**Narrative Focus**: Life-death challenges

**What Happens:**
- Exploration of secret realms or forbidden zones
- Confrontation with demonic cultivators
- Acquisition of heavenly treasures
- Revelation of unique physique or bloodline
- Preparation for major breakthrough

**Author's Note Guidance:**
> "The protagonist faces life-threatening challenges. Enter secret realms, ancient ruins, or forbidden territories. Battle powerful enemies and demonic cultivators. Discover heavenly treasures and lost cultivation techniques. The path grows dangerous. Breakthrough requires facing death itself."

**Example Scenario:**
```
The sect sends disciples into the Ancient Dragon Tomb to retrieve Core
Formation resources. Inside, demonic cultivators from the Blood Moon Sect
ambush them. The protagonist finds the Void Severing Sword Technique
but must fight a Foundation Establishment demonic cultivator to escape.
Their hidden Lightning Dao Physique awakens during the battle.
```

---

### 4. Tribulation Descent (Temperature 10)

**Cultivation Stage**: Nascent Soul Tribulation
**Narrative Focus**: Breakthrough or death

**What Happens:**
- Final preparations (pills, formations, protective artifacts)
- Tribulation clouds gather
- Inner demons manifest
- Enemies attempt sabotage
- The moment of truth

**Author's Note Guidance:**
> "TRIBULATION DESCENT. The heavens respond to cultivation advancement. Dark clouds gather. Lightning tribulation descends. Face inner demons and external enemies simultaneously. This is the moment of breakthrough or death. The protagonist must prove worthy of defying heaven's will."

**Example Scenario:**
```
The protagonist enters seclusion in the Heavenly Peak Formation. Nine-colored
tribulation clouds gather above the sect, visible for ten thousand miles.
The first lightning bolt shatters their protective formation. Elder assassins
from rival sects sneak in to kill them at their weakest. Their dao heart
wavers as inner demons whisper of past failures.
```

---

### 5. Heavenly Tribulation (Temperature 11-12)

**Cultivation Stage**: 9-Fold Lightning Tribulation
**Narrative Focus**: Ultimate test

**What Happens:**
- Nine waves of increasing intensity
- Physical and spiritual limits pushed to breaking
- Cosmic phenomena shake the region
- Ancestral sect protectors intervene
- Life or death decided by dao heart strength

**Author's Note Guidance:**
> "HEAVENLY TRIBULATION. Nine waves of heavenly lightning descend. Each wave stronger than the last. The protagonist's dao heart is tested. Ancient powers observe from the shadows. The sect's fate hangs in balance. Success means ascension. Failure means annihilation. Reality trembles with the weight of cultivation's ultimate test."

**Example Scenario:**
```
The sixth lightning wave contains the wrath of a Thunder Dragon. The
protagonist's body shatters and reforms three times. Blood rains from
the sky. The sect patriarch emerges from millennia of seclusion to
protect the sect's foundation from collateral damage. Immortals in
the Upper Realms take notice. The final wave contains fragments of
Heavenly Dao itself.
```

---

### 6. Immortal Ascension (Temperature 13-15)

**Cultivation Stage**: Breaking Mortal Limits
**Narrative Focus**: World-shaking consequences

**What Happens:**
- Transcendence to immortal realm
- Opposition from jealous immortals or heavenly rules
- Landscapes destroyed by power unleashed
- Ancient prophecies fulfilled or broken
- Fundamental changes to the cultivation world

**Author's Note Guidance:**
> "IMMORTAL ASCENSION. The protagonist transcends mortal limits. Immortals descend to prevent or enable ascension. Ancient seals break. The fabric of reality tears. Continents crack. Sects crumble or rise. This moment rewrites the cultivation world's history. Nothing will ever be the same. The dao itself evolves."

**Example Scenario:**
```
The protagonist shatters the Heavenly Barrier separating mortal and immortal
realms. Jealous immortals descend to kill this potential rival. The
protagonist's ancestor - thought dead for 100,000 years - manifests from
the void to protect them. Their clash splits continents. Lesser sects are
annihilated by the aftershocks. The Heavenly Dao adds a new rule to reality
itself.
```

---

### 7. Dao Consolidation (Overheat Phase)

**Cultivation Stage**: Post-Breakthrough Stabilization
**Narrative Focus**: Integration of power

**What Happens:**
- Enters seclusion to consolidate cultivation base
- Integrates new abilities and dao insights
- Power stabilizes and becomes controllable
- Path forward becomes clearer
- Hints at next challenges

**Author's Note Guidance:**
> "DAO CONSOLIDATION. The breakthrough succeeds but power must be stabilized. The protagonist enters seclusion to consolidate their cultivation base. New dao insights emerge. Spiritual energy circulates through meridians. The path forward becomes clearer. Maintain intensity but show the protagonist gaining control."

**Example Scenario:**
```
The protagonist sits in lotus position for seven days and seven nights.
The chaotic immortal qi stabilizes and integrates with their meridians.
They comprehend the First Layer of Void Severing Dao. Their lifespan
extends to ten thousand years. The sect celebrates their success, but
the protagonist senses greater challenges waiting in the Upper Realms.
```

---

### 8. Sect Recovery (Cooldown Phase)

**Cultivation Stage**: Meditation and Rewards
**Narrative Focus**: Peace before the next storm

**What Happens:**
- Recovering from tribulation or major battle
- Receiving recognition and rewards
- Processing cultivation insights in peace
- Preparing for the next stage of journey
- Brief moments of normalcy

**Author's Note Guidance:**
> "SECT RECOVERY. The storm passes. The protagonist meditates and recovers. Allies celebrate. Rewards are distributed. Cultivation insights deepen. Allow moments of peace and reflection. Show the fruits of victory. Rest and prepare. The immortal path stretches onward. Greater challenges await beyond the horizon."

**Example Scenario:**
```
The sect holds a grand ceremony honoring the protagonist's breakthrough.
They receive a Peak Grade spirit sword and the title of Sect Guardian.
The protagonist teaches juniors their insights, solidifying their own
understanding. They visit the Tranquil Jade Lake to meditate and recover.
But rumors arrive of an ancient immortal ruin opening in the Western Wastes...
```

---

## Installation

### Requirements

- AI Dungeon account (Griffin or Dragon model recommended)
- Scenario with script slots available

### Step-by-Step Installation

1. **Create or open your XianXia adventure** in AI Dungeon

2. **Install the Shared Library Script**:
   - Go to your scenario's scripts section
   - Create a new **Shared Library** script
   - Paste the contents of `trinitysharedLibrary(1).js`
   - Save

3. **Install the Input Modifier**:
   - Create a new **Input Modifier** script
   - Paste the contents of `trinityinput(1).js`
   - Save

4. **Install the Context Modifier**:
   - Create a new **Context Modifier** script
   - Paste the contents of `trinitycontext(1).js`
   - Save

5. **Install the Output Modifier**:
   - Create a new **Output Modifier** script
   - Paste the contents of `trinityoutput(1).js`
   - Save

6. **Verify Installation**:
   - Start or continue your adventure
   - Scripts should run silently (no debug output)
   - The AI should receive XianXia-tuned guidance

---

## Quick Start Guide

### Your First Cultivation Story

1. **Start a new scenario** with a XianXia premise:
   ```
   You are a peasant who discovers a mysterious jade pendant that
   allows you to sense spiritual energy. An elder from the Heavenly
   Sword Sect tests you and discovers you have rare Pure Yang Constitution.
   ```

2. **Let the system guide the story**:
   - Early turns (temp 1-3): Discovery and wonder phase
   - System emphasizes world-building and potential
   - Use this time to explore the sect and cultivation basics

3. **Use commands to steer**:
   ```
   @req rival disciple challenges me to a duel
   (slowly reveal my special constitution)
   ```

4. **Watch temperature rise naturally**:
   - As you engage in conflicts and breakthroughs
   - System will guide story toward tribulation when ready
   - Temperature increases automatically based on conflict words

5. **Survive the tribulation** (temp 10-12):
   - System recognizes tribulation-related words
   - Narrative intensity maximizes
   - Quality-gating ensures good writing during climax

6. **Consolidate and continue**:
   - System triggers cooldown after intense breakthrough
   - Time to recover, receive rewards, prepare for next arc
   - The cycle continues at higher cultivation realms

---

## Command Reference

### @req - Immediate Narrative Request

**Syntax**: `@req <your request>`

**Purpose**: Direct the AI toward a specific event or development

**Duration**: 1-2 turns (immediate priority)

**Examples**:
```
@req a mysterious masked cultivator appears
@req I discover a hidden cave with ancient techniques
@req the young master challenges me publicly
@req tribulation clouds begin gathering
```

**How It Works**:
- Injected into `frontMemory` (highest priority context)
- AI receives strong guidance to fulfill request
- Expires after 1-2 turns or when fulfilled
- Generates heat (increases tension slightly)

---

### (...) - Gradual Narrative Direction

**Syntax**: `(your goal or direction)`

**Purpose**: Gently guide story direction over multiple turns

**Duration**: 4 turns (gradual influence)

**Examples**:
```
(slowly reveal the sect's dark secret)
(build romantic tension with dao companion)
(hint at ancient treasure in forbidden zone)
(prepare for foundation establishment breakthrough)
```

**How It Works**:
- Added to author's note layer
- Influences story gradually over 4 turns
- Can stack up to 3 parentheses memories
- Lower heat impact than @req

---

### @temp - Manual Temperature Override

**Syntax**: `@temp <number>`

**Purpose**: Directly set narrative intensity

**Range**: 1-15

**Examples**:
```
@temp 1     Reset to calm, peaceful state
@temp 6     Set to mid-level rising action
@temp 10    Force tribulation/climax
@temp 3     Enter cooldown manually
```

**When To Use**:
- Story phase feels wrong for current events
- Want to force a tribulation scene
- Need to calm down after intense sequence
- Testing different phase guidances

**Warning**: Overrides automatic pacing. Use sparingly.

---

### @arc - Force Specific Story Phase

**Syntax**: `@arc <phase name>`

**Purpose**: Jump to a specific story phase regardless of temperature

**Valid Phases**:
- `introduction` / `awakening`
- `rising` / `foundation`
- `trials` / `core`
- `tribulation`
- `climax` / `peak`
- `ascension` / `extreme`
- `consolidation` / `overheat`
- `recovery` / `cooldown`

**Examples**:
```
@arc tribulation    Force tribulation phase
@arc recovery       Enter cooldown/recovery
@arc foundation     Return to training phase
```

**Warning**: May conflict with temperature. Use for testing or special scenarios.

---

## Customization

### Adjusting Cultivation Pacing

If breakthroughs happen too quickly or slowly, edit `trinitysharedLibrary(1).js`:

```javascript
// Find CONFIG.ngo section:
CONFIG.ngo = {
    // Slower progression: Increase these values
    heatThresholdForTempIncrease: 10,    // Default: 10 → Try: 15
    tempIncreaseChance: 30,              // Default: 30 → Try: 20

    // Faster progression: Decrease these values
    heatThresholdForTempIncrease: 10,    // Default: 10 → Try: 7
    tempIncreaseChance: 30,              // Default: 30 → Try: 40
}
```

### Adding Custom XianXia Vocabulary

Add your own conflict/calming words to tune heat detection:

```javascript
// Find NGO_WORD_LISTS in trinitysharedLibrary(1).js

// Add more conflict words (increases heat):
conflict: [
    // ... existing words ...
    'dao heart demon', 'bottleneck', 'cripple cultivation',
    // Add your custom terms here:
    'soul attack', 'spirit beast', 'blood oath'
]

// Add more calming words (reduces heat):
calming: [
    // ... existing words ...
    'dao comprehension', 'spiritual energy', 'meditation',
    // Add your custom terms here:
    'inner world', 'soul sea', 'true essence'
]
```

### Modifying Phase Descriptions

Customize the XianXia flavor by editing phase descriptions:

```javascript
// Find NGO_PHASES in trinitysharedLibrary(1).js

introduction: {
    name: 'Mortal Awakening',  // Change this
    description: 'Discovery of cultivation path, humble beginnings',
    authorNoteGuidance:
        'Your custom guidance here. Focus on whatever themes you prefer.',
    // ... rest unchanged
}
```

### Creating Story Cards

Enhance the system with manual override cards:

**1. PlayersAuthorsNote Card**:
- Create a story card with key: `PlayersAuthorsNote`
- Your stable author's note (always included)
- Example: "Focus on sword cultivation techniques. Protagonist is honorable but ruthless to enemies."

**2. Banned Words Card** (Precise Removal):
- Create a story card with key: `banned_words`
- List words/phrases to remove completely
- Example: `suddenly, without warning, out of nowhere`

**3. Aggressive Removal Card**:
- Create a story card with key: `aggressive_removal`
- Remove entire sentences containing these words
- Example: `stop, wait, hold on`

**4. Word Replacer Card**:
- Create a story card with key: `word_replacer`
- Custom synonym replacements
- Format: `old => new` (one per line)
- Example:
  ```
  sword => blade
  cultivate => refine qi
  master => dao ancestor
  ```

---

## Advanced Features

### Quality-Gated Progression

**What It Does**: Prevents temperature increases when writing quality is low.

**Why It Matters**: Ensures major breakthroughs (tribulations, ascensions) happen when the AI is writing well, not during repetitive or poor-quality output.

**How It Works**:
```
Temperature wants to increase (heat is high)
  ↓
Bonepoke analyzes recent output quality
  ↓
If quality >= 2.0 → Temperature increases (breakthrough allowed)
If quality < 2.0 → Increase blocked (wait for better writing)
```

**Configuration**:
```javascript
CONFIG.ngo.qualityGatesTemperatureIncrease = true;  // Enable/disable
CONFIG.ngo.qualityThresholdForIncrease = 2.0;       // Minimum quality (0-5)
```

---

### Fatigue-Triggered Cooldown

**What It Does**: Automatically enters cooldown phase when writing becomes repetitive.

**Why It Matters**: Prevents the AI from burning out during extended high-intensity scenes. Forces a recovery period.

**How It Works**:
```
Bonepoke detects 5+ repeated words/phrases
  ↓
Temperature >= 8 (high intensity active)
  ↓
System forces early cooldown
  ↓
Narrative shifts to recovery/meditation
```

**Configuration**:
```javascript
CONFIG.ngo.fatigueTriggersEarlyCooldown = true;  // Enable/disable
CONFIG.ngo.fatigueThresholdForCooldown = 5;       // Number of fatigued words
```

---

### Drift Detection & Reduction

**What It Does**: Detects when story goes off-topic and reduces narrative heat.

**Why It Matters**: Keeps cultivation stories focused. If AI starts rambling about unrelated topics, system calms it down.

**How It Works**:
```
Bonepoke detects drift (incoherent tangents)
  ↓
Heat reduced by 3 points
  ↓
Temperature increase chance decreases
  ↓
Story naturally returns to main narrative
```

**Configuration**:
```javascript
CONFIG.ngo.driftReducesHeat = true;      // Enable/disable
CONFIG.ngo.driftHeatReduction = 3;        // Heat points to reduce
```

---

### Smart Synonym Replacement

**What It Does**: Replaces overused words with synonyms based on context and quality needs.

**Why It Matters**: Prevents repetitive writing ("he struck again and again") while maintaining meaning.

**How It Works**:
```
Bonepoke detects repeated word (threshold: 3 uses)
  ↓
Analyzes quality dimensions (Emotional Strength, Character Clarity, etc.)
  ↓
Selects synonym that improves weakest dimension
  ↓
Validates replacement doesn't reduce quality
  ↓
Applies if approved, keeps original if not
```

**Configuration**:
```javascript
CONFIG.smartReplacement.enabled = true;           // Master switch
CONFIG.smartReplacement.enableValidation = true;  // Validate before applying
CONFIG.smartReplacement.preventQualityDegradation = true;  // Block bad replacements
```

---

### Cross-Output Phrase Tracking

**What It Does**: Tracks repeated phrases across multiple AI outputs (not just current output).

**Why It Matters**: Catches patterns like "took a deep breath" repeated every 3 turns.

**How It Works**:
```
Stores last 3 outputs as n-gram fingerprints
  ↓
Compares current output to history
  ↓
Detects phrases appearing 2+ times across outputs
  ↓
Applies smart replacement or removal
```

**Memory Efficient**: Only stores significant 2-3 word phrases, not full text.

---

## Troubleshooting

### Temperature Stuck at Low Value

**Problem**: Story stays at temperature 1-3, won't progress to tribulation.

**Causes**:
1. Not enough conflict words in player input or AI output
2. Too many calming words (meditation, peace, etc.)
3. Quality gating blocking increases

**Solutions**:
1. Use more action-oriented input:
   ```
   ❌ "I meditate peacefully"
   ✅ "I challenge the arrogant young master to a duel"
   ```

2. Use @req to force conflict:
   ```
   @req rivals attack during my breakthrough attempt
   ```

3. Manually override if needed:
   ```
   @temp 10
   ```

4. Check quality threshold (may be too high):
   ```javascript
   CONFIG.ngo.qualityThresholdForIncrease = 2.0  // Lower if stuck
   ```

---

### Temperature Rising Too Quickly

**Problem**: Hits tribulation (temp 10) too early in the story.

**Causes**:
1. Too many conflict words too soon
2. Heat threshold too low
3. Temperature increase chance too high

**Solutions**:
1. Use calmer language in early game:
   ```
   ❌ "I battle and destroy my enemies"
   ✅ "I study the cultivation manual and meditate"
   ```

2. Adjust pacing configuration:
   ```javascript
   CONFIG.ngo.heatThresholdForTempIncrease = 15  // Increase from 10
   CONFIG.ngo.tempIncreaseChance = 20             // Decrease from 30
   ```

3. Force lower temperature:
   ```
   @temp 3
   ```

---

### Tribulation Won't Trigger

**Problem**: At temperature 10+ but tribulation phase not activating.

**Causes**:
1. Stuck in overheat or cooldown mode
2. Arc command overriding temperature
3. Quality score too low (blocking progression)

**Solutions**:
1. Check current phase with command:
   ```
   @arc tribulation
   ```

2. Manually trigger if needed:
   ```
   @req heavenly tribulation descends
   ```

3. Verify not in cooldown (should auto-exit after 5 turns)

---

### Repetitive Output Despite Bonepoke

**Problem**: AI keeps using same words/phrases even with synonym replacement active.

**Causes**:
1. Synonyms missing for that specific word
2. Validation blocking all replacements
3. Smart replacement disabled

**Solutions**:
1. Check if system detects fatigue (look for overused words)

2. Add custom synonyms:
   ```javascript
   // In SYNONYM_MAP section of trinitysharedLibrary(1).js
   'overused word': ['synonym1', 'synonym2', 'synonym3']
   ```

3. Use manual word replacer card:
   ```
   Create story card with key: word_replacer
   Content:
   overused word => better alternative
   ```

4. Verify configuration:
   ```javascript
   CONFIG.smartReplacement.enabled = true
   CONFIG.bonepoke.enabled = true
   ```

---

### Scripts Not Loading or Errors

**Problem**: Scripts don't run or AI Dungeon shows errors.

**Causes**:
1. Incorrect script type (Shared Library vs Input/Context/Output)
2. Syntax errors from editing
3. Missing dependencies

**Solutions**:
1. **Verify script types**:
   - `trinitysharedLibrary(1).js` → **Shared Library**
   - `trinityinput(1).js` → **Input Modifier**
   - `trinitycontext(1).js` → **Context Modifier**
   - `trinityoutput(1).js` → **Output Modifier**

2. **Check for typos** if you edited configuration:
   - Missing commas, brackets, quotes
   - Use a JavaScript validator online

3. **Reinstall clean versions** if broken:
   - Delete current scripts
   - Re-paste from original files
   - Don't edit until verified working

4. **Check AI Dungeon console** (F12 in browser):
   - Look for JavaScript errors
   - Report specific error messages

---

## Technical Details

### State Management

The system tracks narrative state in AI Dungeon's persistent `state` object:

```javascript
state.ngo = {
    heat: 0-50,              // Short-term tension
    temperature: 1-15,        // Long-term arc position
    currentPhase: 'string',   // Active phase name
    overheatMode: boolean,    // In sustained climax?
    cooldownMode: boolean,    // In falling action?
    consecutiveConflicts: number,
    temperatureWantsToIncrease: boolean
}

state.commands = {
    narrativeRequest: 'string',      // Current @req content
    narrativeRequestTTL: number,     // Turns remaining
    parenthesesMemories: [],         // Active () goals
}

state.bonepokeHistory = [
    { avgScore, quality, composted, ... },  // Last 5 analyses
]

state.outputHistory = [
    { turn, ngrams },        // Last 3 outputs
]
```

### NGO Heat Mechanics

**Heat Accumulation**:
```
heat_gain = (conflict_words × heat_per_conflict × multiplier) - (calming_words × decay_rate)

multiplier:
  - player input: 2x
  - AI output: 1x
```

**Heat Decay**:
```
Each turn: heat -= 1 (natural decay)
Max heat: 50 (soft cap)
```

**Temperature Increase Logic**:
```
IF heat >= 10 (threshold):
  30% chance per turn to trigger increase request

IF consecutive_conflicts >= 3:
  Guaranteed increase request

IF increase requested:
  Check quality gate (score >= 2.0)
  If approved: temperature += 1

IF temperature >= 10:
  Trigger overheat check (enters sustained climax)
```

### Bonepoke Scoring

Each output analyzed across 5 dimensions (1-5 scale):

```
1 = Very Poor    (incoherent, broken)
2 = Poor         (weak, minimal)
3 = Fair         (acceptable, functional)
4 = Good         (strong, engaging)
5 = Excellent    (exceptional, masterful)

avgScore = (emotional + clarity + flow + dialogue + variety) / 5
```

**Quality Rating**:
```
avgScore >= 4.0  → "excellent"
avgScore >= 3.0  → "good"
avgScore >= 2.0  → "fair"
avgScore < 2.0   → "poor"
```

**Fatigue Detection**:
```
word_count = occurrences of word in output
IF word_count >= 3: marked as fatigued
```

### Verbalized Sampling Parameters

**k**: Number of candidates AI mentally generates (4-9)
**tau**: Probability threshold for unlikely selection (0.06-0.15)

```
Low temperature (calm):   k=4, tau=0.15  (less creative)
Mid temperature (action): k=6, tau=0.10  (balanced)
High temperature (climax): k=9, tau=0.06  (maximum creativity)
```

### Performance Optimizations

**Production-Ready Features**:
- All debug logging disabled (faster execution)
- Regex caching (~40% performance gain)
- Optimized array operations (shift instead of slice)
- Memory management (history pruning)
- No analytics overhead

**Memory Limits**:
```
MAX_OUTPUT_HISTORY = 3        (last 3 outputs for cross-tracking)
MAX_BONEPOKE_HISTORY = 5      (last 5 quality analyses)
MAX_PHASE_HISTORY = 50         (last 50 phase changes)
```

---

## Credits & License

### Trinity Scripts - XianXia Edition v1.0

**Original Trinity Scripts Framework**:
- Verbalized Sampling implementation
- Bonepoke Protocol system
- NGO (Narrative Gravity Oscillator) core engine

**XianXia Edition Adaptation (2025)**:
- Cultivation-based phase tuning
- XianXia vocabulary integration
- Genre-specific optimization
- Production release preparation

**Research Sources**:
- Verbalized Sampling: [arXiv:2510.01171v3](https://arxiv.org/html/2510.01171v3)
- Better Say Actions: BinKompliziert (AI Dungeon Discord)
- AI Dungeon Best Practices: Community contributions

### License

MIT License

Copyright (c) 2025 Trinity Scripts Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Appendix: XianXia Terminology

For those unfamiliar with XianXia genre:

- **Cultivation**: Practice of martial/Taoist techniques to achieve immortality
- **Qi / Spiritual Energy**: Life force energy cultivators harness
- **Dao**: The Way, the path of cultivation and cosmic principles
- **Tribulation**: Heavenly test that cultivators must pass to breakthrough
- **Sect**: Cultivation organization/school (like martial arts clans)
- **Young Master**: Arrogant antagonist, usually from powerful family
- **Spirit Stones**: Currency and cultivation resources
- **Medicinal Pill**: Alchemical pills that boost cultivation
- **Secret Realm**: Hidden dimension with treasures and dangers
- **Foundation Establishment**: Early cultivation stage (building the base)
- **Core Formation**: Mid cultivation stage (forming energy core)
- **Nascent Soul**: Advanced stage (forming independent soul)
- **Dao Heart**: One's will and understanding of the Dao
- **Inner Demon**: Mental obstacles that block cultivation
- **Courting Death**: Seeking death (common phrase for foolish antagonists)

---

**For support, suggestions, or bug reports, please refer to the repository issues or community forums.**

**Happy cultivating! May your dao heart remain steadfast on the path to immortality.**

---

*Trinity Scripts - XianXia Edition v1.0 - Production Release 2025-01-20*
