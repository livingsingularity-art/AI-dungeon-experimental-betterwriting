# Vogler's Hero's Journey Scripts

**AI Dungeon implementation of Christopher Vogler's 12-stage monomyth framework**

Based on "The Writer's Journey: Mythic Structure for Writers" by Christopher Vogler, which adapts Joseph Campbell's Hero's Journey for screenwriting and narrative structure.

---

## 📚 Overview

This script system guides AI Dungeon stories through the classic Hero's Journey structure, automatically tracking story progression and providing stage-appropriate narrative guidance to the AI.

### What is the Hero's Journey?

The Hero's Journey (or monomyth) is a universal story pattern found in myths, legends, and modern stories worldwide. Christopher Vogler adapted Joseph Campbell's work into a practical 12-stage framework used by screenwriters and novelists.

**The 12 Stages:**
1. **Ordinary World** - Hero's normal life
2. **Call to Adventure** - Challenge presented
3. **Refusal of the Call** - Hero hesitates
4. **Meeting the Mentor** - Guidance received
5. **Crossing the First Threshold** - Commitment to adventure
6. **Tests, Allies, and Enemies** - Learning the new world
7. **Approach to the Inmost Cave** - Preparing for the big challenge
8. **The Ordeal** - Facing death/greatest fear
9. **Reward (Seizing the Sword)** - Victory and treasure
10. **The Road Back** - Return journey begins
11. **Resurrection** - Final test and transformation
12. **Return with the Elixir** - Home, transformed

---

## 📁 Files

```
voglerScripts/
├── voglerSharedLibrary.js  - Core system, word banks, synonyms, config cards
├── voglerContext.js        - Injects stage guidance + player's note into AI context
├── voglerInput.js          - Processes player input and commands
├── voglerOutput.js         - Detects beats, advances stages, restores notes
└── VOGLER_README.md        - This file
```

## 🆕 New Features (Latest Update)

### Configuration Story Cards
All non-automatic features now have configuration story cards for easy control:

1. **Configure Vogler System** - Hero's Journey settings
2. **Configure Auto-Cards** - NGO temperature/heat tension system
3. **Configure Smart Synonyms** - Emotion/precision-based word replacement
4. **Player's Author's Note** - Your custom writing instructions (preserved)
5. **Configure Word Banks** - Stop words and quality filters

All cards stay under 1500 characters for AI Dungeon compatibility.

### Smart Synonym Replacement
Enhanced synonym database with emotion & precision metadata:
- **Emotion scores** (1-5): Emotional strength of replacement
- **Precision scores** (1-5): Character clarity/specificity
- **Context tags**: Genre-agnostic tags for smart matching
- **Dialogue flags**: Special handling for dialogue verbs

Example: "walked" → "trudged" (emotion: 4, precision: 4, tags: ['weary', 'slow'])

### Word Banks & Stop Words
Comprehensive lists for better prose quality:
- **Conflict words**: Increase narrative tension (battle, danger, urgent)
- **Calming words**: Decrease tension (peace, rest, content)
- **Stop words**: Weak prose to avoid (very, really, suddenly)
- **Filter words**: "Show don't tell" improvements

### Player's Author's Note
Separate storage for player's custom instructions:
- Preserved across all turns
- Combined with system guidance automatically
- Highest priority in author's note
- Won't be overwritten by Vogler system

---

## 🚀 Installation

### For AI Dungeon Web/Mobile:

1. **Create 4 new scripts** in your adventure's script settings:
   - Shared/Library script
   - Context modifier script
   - Input modifier script
   - Output modifier script

2. **Copy the contents** of each Vogler script file into the corresponding AI Dungeon script slot:
   - `voglerSharedLibrary.js` → Shared script
   - `voglerContext.js` → Context modifier
   - `voglerInput.js` → Input modifier
   - `voglerOutput.js` → Output modifier

3. **Save and enable** all scripts

4. **Start your adventure!** The system initializes at Stage 1 (Ordinary World)

---

## ⚙️ Configuration

Edit the `VOGLER_CONFIG` object in `voglerSharedLibrary.js`:

```javascript
const VOGLER_CONFIG = {
    // System control
    enabled: true,              // Master on/off switch
    debugLogging: false,        // Verbose console logging
    logStageChanges: true,      // Log when stages change

    // Auto-advancement settings
    autoAdvance: true,          // Automatically advance stages
    turnsPerStage: 8,           // Average turns per stage
    minTurnsPerStage: 4,        // Minimum before advancement
    maxTurnsPerStage: 15,       // Maximum before forced advancement

    // Stage transition
    requireKeyBeats: true,      // Require story beats before advancing
    flexiblePacing: true,       // Allow player influence

    // Integration
    integrateWithBonepoke: true,
    integrateWithVS: true,

    // Commands
    stageCommand: '@stage',     // Manual stage control
    beatCommand: '@beat',       // Mark beat completed
};
```

### Recommended Settings:

**For shorter stories (20-50 turns):**
```javascript
turnsPerStage: 4
minTurnsPerStage: 2
maxTurnsPerStage: 8
requireKeyBeats: false  // More flexible
```

**For epic journeys (100+ turns):**
```javascript
turnsPerStage: 12
minTurnsPerStage: 6
maxTurnsPerStage: 20
requireKeyBeats: true   // Ensure beats are hit
```

**For maximum player control:**
```javascript
autoAdvance: false      // Manual control only
```

---

## 🎮 Player Commands

### Vogler Commands

**`@stage <number>`** - Manually jump to a specific stage (1-12)
- `@stage 5` - Jump to "Crossing the First Threshold"
- `@stage 8` - Jump to "The Ordeal" (climax)
- `@stage 12` - Jump to "Return with the Elixir" (ending)

**`@beat <description>`** - Mark a story beat as completed
- `@beat Introduced mentor character`
- `@beat Hero refuses the call`
- `@beat Crossed into the special world`

### NGO Commands (if enabled)

**`@temp <number>`** - Set temperature directly (1-15)
- `@temp 5` - Moderate tension
- `@temp 10` - High tension (overheat threshold)
- `@temp 1` - Reset to minimum

**`@arc <phase>`** - Force narrative phase
- `@arc climax` - Jump to climax phase
- `@arc resolution` - Jump to resolution

**Note:** Commands are invisible - they're processed and removed from the story text.

---

## 📊 How It Works

### Automatic Stage Tracking

The system tracks your story progression through three mechanisms:

1. **Turn Counting** - Tracks how many turns you've spent in each stage
2. **Beat Detection** - Identifies when key story beats occur
3. **Manual Override** - Allows you to control pacing with commands

### Stage Advancement

A stage advances when:
- ✅ Minimum turns reached (default: 4)
- ✅ Enough key beats completed (60% by default)
- ✅ Average turns reached (default: 8)

OR:
- ⚠️ Maximum turns exceeded (default: 15) - forces advancement

### Beat Detection

The system automatically detects story beats through keyword matching:

**Stage 1 (Ordinary World):**
- "normal", "routine", "everyday" → Establishes normal life
- "friend", "family" → Shows relationships

**Stage 8 (The Ordeal):**
- "death", "die", "killed" → Facing death
- "lost", "doomed", "hopeless" → All seems lost

**...and so on for all 12 stages**

### AI Guidance

Each stage injects specific author's note guidance:

**Stage 1 Example:**
```
[Hero's Journey: Ordinary World] Establish the protagonist's normal life,
relationships, and world. Show what they have to lose. Build sympathy and
connection with the character. Keep tone grounded and relatable.
Pacing: Slow, measured. Build character connection.
Tone: Grounded, relatable, everyday
```

This invisible guidance shapes the AI's narrative decisions.

---

## 🎨 Integration with Other Systems

### Trinity Scripts (NGO + Bonepoke + VS)

The Vogler system is designed to work **alongside** the Trinity scripts:

- **NGO Integration**: Vogler suggests temperature/heat based on stage
  - Stage 1 (Ordinary World): temp=1, heat=0 (calm)
  - Stage 8 (The Ordeal): temp=9, heat=25 (intense!)
  - Stage 12 (Return): temp=3, heat=5 (resolution)

- **Verbalized Sampling Integration**: Adjusts VS parameters per stage
  - Early stages: k=5, tau=0.10 (focused)
  - Climax stages: k=9, tau=0.20 (creative)

- **Bonepoke Integration**: Quality control works alongside journey structure

### Using Vogler + Trinity Together

**Option 1: Vogler Primary (Recommended for structured stories)**
```javascript
// In Vogler config:
integrateWithBonepoke: true
integrateWithVS: true

// In Trinity NGO config:
ngo.enabled: false  // Let Vogler control pacing
bonepoke.enabled: true  // Keep quality control
vs.enabled: true  // Keep diversity
```

**Option 2: NGO Primary (Recommended for dynamic, heat-driven stories)**
```javascript
// In Vogler config:
enabled: true
autoAdvance: false  // Manual stage control only

// In Trinity NGO config:
ngo.enabled: true  // NGO controls pacing
// Vogler provides structure reference but doesn't auto-advance
```

**Option 3: Both Active (Advanced - requires tuning)**
```javascript
// Both systems suggest pacing
// Vogler provides narrative structure
// NGO provides dynamic tension
// They influence each other
```

---

## 📖 Stage Guide

### Stage 1: Ordinary World
**Purpose:** Establish baseline, make audience care
**Duration:** 4-10 turns
**Key Beats:**
- Introduce protagonist in normal environment
- Show daily routine and relationships
- Hint at inner lack or dissatisfaction

**Tips:**
- Don't rush! Build character connection
- Show what they'll lose if they leave
- Establish normalcy to contrast with adventure

---

### Stage 2: Call to Adventure
**Purpose:** Present the challenge
**Duration:** 2-5 turns
**Key Beats:**
- Introduce problem/opportunity
- Disrupt ordinary world
- Present stakes clearly

**Tips:**
- Make the call specific and compelling
- Create urgency or intrigue
- Can be positive (opportunity) or negative (threat)

---

### Stage 3: Refusal of the Call
**Purpose:** Show hero's humanity and fear
**Duration:** 2-4 turns
**Key Beats:**
- Hero expresses doubt or fear
- Show what holds them back
- Reveal character vulnerabilities

**Tips:**
- Make reluctance believable
- This creates contrast for later courage
- Can be brief or skipped for eager heroes

---

### Stage 4: Meeting the Mentor
**Purpose:** Prepare hero for journey
**Duration:** 3-6 turns
**Key Beats:**
- Introduce mentor character
- Provide crucial advice or training
- Give tools, weapons, or gifts

**Tips:**
- Mentor doesn't have to be a person (can be a memory, book, etc.)
- Build credibility and connection
- Plant seeds that pay off later

---

### Stage 5: Crossing the First Threshold
**Purpose:** Commit to adventure
**Duration:** 2-4 turns
**Key Beats:**
- Hero makes decision to proceed
- Cross into unknown territory
- Point of no return

**Tips:**
- Clear transition moment
- New rules, dangers, wonders
- This is Act 1 → Act 2 transition

---

### Stage 6: Tests, Allies, and Enemies
**Purpose:** Learn the new world
**Duration:** 10-20 turns (longest stage)
**Key Beats:**
- Face tests and challenges
- Make allies and friends
- Identify enemies

**Tips:**
- Variety is key - different challenges
- Build the team
- Show growth through experience
- This is the "fun and games" section

---

### Stage 7: Approach to the Inmost Cave
**Purpose:** Build suspense before climax
**Duration:** 4-8 turns
**Key Beats:**
- Approach the dangerous place
- Make preparations and plans
- Build suspense and dread

**Tips:**
- "Inmost cave" = central challenge (literal or metaphorical)
- Last chance to turn back
- Increase tension

---

### Stage 8: The Ordeal
**Purpose:** Midpoint crisis, death & rebirth
**Duration:** 5-10 turns
**Key Beats:**
- Face greatest fear or challenge
- Moment of apparent defeat
- All seems lost
- Hero is transformed

**Tips:**
- This is the MIDPOINT and central crisis
- Allow genuine danger and doubt
- Death can be literal or metaphorical
- Major turning point

---

### Stage 9: Reward (Seizing the Sword)
**Purpose:** Victory and treasure
**Duration:** 3-6 turns
**Key Beats:**
- Survive the ordeal
- Claim the reward/treasure
- Gain new knowledge or power

**Tips:**
- Reward can be object, knowledge, or reconciliation
- Moment of relief and triumph
- Hint that journey isn't over

---

### Stage 10: The Road Back
**Purpose:** Return journey complications
**Duration:** 5-10 turns
**Key Beats:**
- Decision to return home
- Pursuit or chase sequence
- Villain's counterattack

**Tips:**
- Often involves chase or pursuit
- Urgency increases
- Racing against time
- Act 2 → Act 3 transition

---

### Stage 11: Resurrection
**Purpose:** Final test and climax
**Duration:** 8-15 turns
**Key Beats:**
- Final confrontation/climax
- Ultimate test of growth
- Highest stakes
- Hero proves transformation

**Tips:**
- This is the CLIMAX
- Apply all growth from journey
- Final death-and-rebirth
- Make it epic!

---

### Stage 12: Return with the Elixir
**Purpose:** Resolution and new normal
**Duration:** 4-8 turns
**Key Beats:**
- Return to ordinary world
- Hero is transformed
- Share the elixir/wisdom
- Resolve character arcs

**Tips:**
- Show how hero has changed
- "Elixir" benefits community
- Provide closure
- Show new normal
- Satisfy emotional payoff

---

## 🔧 Troubleshooting

### "Stages advancing too fast"
- Increase `minTurnsPerStage` and `turnsPerStage`
- Set `requireKeyBeats: true`
- Lower the stage manually with `@stage` if needed

### "Stuck in one stage too long"
- Decrease `turnsPerStage`
- Set `requireKeyBeats: false` for more flexibility
- Manually advance with `@stage <number>`

### "AI not following stage guidance"
- Check that `voglerContext.js` is loaded and active
- Enable `debugLogging: true` to verify guidance is injecting
- Make sure author's note isn't being overwritten by other scripts

### "Want more control over pacing"
- Set `autoAdvance: false`
- Use `@stage` commands to control progression manually
- Adjust `flexiblePacing: true` for more player influence

### "Integration conflicts with Trinity/NGO"
- See "Integration with Other Systems" section above
- Decide which system is primary (Vogler or NGO)
- Disable competing features in non-primary system

---

## 📈 Progress Tracking

### Console Output

With `logStageChanges: true`, you'll see:

```
🎬 STAGE CHANGE: Ordinary World → Call to Adventure (average turns reached)

🎬 Call to Adventure (Stage 2/12) - 1 turns
✅ Player beats detected: Receive the call

📖 Call to Adventure: 2/4 beats completed

📊 Journey Progress: 25% (Tests, Allies, and Enemies, Turn 12)
```

### State Inspection

Access journey state anytime in console:
```javascript
VoglerEngine.getProgress()
// Returns:
// {
//   currentStage: 6,
//   stageName: "Tests, Allies, and Enemies",
//   turnsInStage: 12,
//   totalTurns: 45,
//   completedBeats: 4,
//   totalBeats: 6,
//   progress: "6/12 stages",
//   percentComplete: 50
// }
```

---

## 💡 Tips & Best Practices

### Story Structure

1. **Don't rush the Ordinary World** - We need to care about the hero
2. **Make the Ordeal (Stage 8) count** - This is your midpoint crisis
3. **The Resurrection (Stage 11) is the climax** - Make it epic
4. **Give proper closure (Stage 12)** - Don't end abruptly

### Pacing

- **Fast-paced adventure:** 4-6 turns per stage
- **Standard story:** 8-10 turns per stage
- **Epic journey:** 12-15 turns per stage

### Beat Completion

- You don't need to hit EVERY beat
- Focus on 60-80% of key beats per stage
- Some beats naturally combine
- Manual `@beat` commands help track progress

### Flexibility

- The 12 stages are a guide, not a prison
- Some stories naturally linger in certain stages
- Use `@stage` to skip stages if needed
- Adjust `requireKeyBeats` based on your style

---

## 🎯 Example Adventure Flow

**Turns 1-6: Ordinary World**
- Establish hero's daily life as a farmer
- Show relationship with family
- Hint at desire for adventure
- Auto-advances after 6 turns + key beats

**Turns 7-9: Call to Adventure**
- Mysterious traveler arrives with message
- Kingdom in danger, hero needed
- Auto-advances after 3 turns

**Turns 10-11: Refusal**
- Hero worried about leaving family
- Fears inadequacy
- Auto-advances quickly (brief stage)

**Turns 12-16: Meeting the Mentor**
- Old warrior trains hero
- Receives father's sword
- Learns combat skills
- Auto-advances after 5 turns

**Turns 17-19: Crossing Threshold**
- Leaves village
- Enters dark forest
- No turning back
- Auto-advances after 3 turns

**Turns 20-35: Tests, Allies, Enemies**
- Meets wizard companion
- Fights bandits (test)
- Befriends merchant (ally)
- Identifies dark lord (enemy)
- Longest stage - lots of adventure!

**...continues through all 12 stages...**

---

## 📚 Further Reading

- **"The Writer's Journey: Mythic Structure for Writers"** by Christopher Vogler (primary source)
- **"The Hero with a Thousand Faces"** by Joseph Campbell (original monomyth)
- **"Story"** by Robert McKee (story structure)
- **"Save the Cat!"** by Blake Snyder (beat sheets and structure)

---

## 🤝 Credits

**Christopher Vogler** - The Writer's Journey framework
**Joseph Campbell** - Hero's Journey monomyth
**Trinity Scripts** - Integration patterns and best practices
**AI Dungeon Community** - Testing and feedback

---

## 📄 License

MIT License - Free to use, modify, and share

---

## 🆘 Support

For issues, suggestions, or questions:
- Check the Troubleshooting section above
- Review the Stage Guide for specific stage help
- Adjust configuration settings for your use case
- Join AI Dungeon community forums for assistance

---

**Happy Journey Writing! 🎬✨**

May your heroes find their elixir and return transformed.
