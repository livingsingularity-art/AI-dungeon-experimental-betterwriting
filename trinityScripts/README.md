# TrinityScripts v3.0 - Hero's Journey Edition

**Genre-agnostic adventure storytelling system for AI Dungeon**

TrinityScripts enhances AI Dungeon with intelligent narrative guidance, quality control, and structured story progression based on Joseph Campbell's classic Hero's Journey monomyth.

---

## 🚀 Quick Start

1. **Install the scripts** in AI Dungeon (Shared Library, Context, Input, Output)
2. **Set your genre** in World Info (Fantasy, Sci-Fi, Mystery, Horror, etc.)
3. **Start your adventure** - The system adapts automatically
4. **Use commands** when needed:
   - Type `@req [your request]` for urgent narrative guidance
   - Use `(suggestion)` in parentheses for gentle 4-turn guidance
   - Type `@temp [1-12]` to manually set story temperature
   - Type `@arc [phase name]` to jump to specific Hero's Journey stage

---

## 🎭 The Hero's Journey System

TrinityScripts guides your story through 12 classic adventure stages that work across **any genre**:

### **ACT I: DEPARTURE** (Temperature 1-4)

#### 1. **Ordinary World** (Temp 1)
- Establish your hero's normal life, relationships, and world
- Build character and setting with minimal conflict
- *Examples:* A wizard's daily routine in the tower | An engineer's shift on the space station | A detective's morning coffee

#### 2. **Call to Adventure** (Temp 1-2)
- A disruption, challenge, or quest appears
- Something pulls the hero from their comfort zone
- *Examples:* A mysterious letter arrives | Sensors detect an anomaly | A body is discovered

#### 3. **Refusal of the Call** (Temp 2)
- The hero hesitates, shows fear or reluctance
- Internal conflict: What will they lose?
- *Examples:* "I'm just a student!" | "That's not my jurisdiction" | "Someone else should handle this"

#### 4. **Meeting the Mentor** (Temp 2-3)
- A guide provides wisdom, training, or necessary items
- Preparation for the journey ahead
- *Examples:* The wise old mage | The veteran pilot | The retired detective

#### 5. **Crossing the Threshold** (Temp 3-4)
- The hero commits to the journey
- Point of no return - entering the unknown
- *Examples:* Stepping through the portal | Launching the rescue mission | Going undercover

### **ACT II: INITIATION** (Temperature 4-12)

#### 6. **Tests, Allies, and Enemies** (Temp 4-6)
- Face challenges and build relationships
- Learn the rules of this new world
- *Examples:* Combat training montage | Making contact with rebels | Gathering evidence and witnesses

#### 7. **Approach to the Inmost Cave** (Temp 7-8)
- Approaching the place of greatest danger
- Final preparations as dread builds
- *Examples:* Marching on the dark fortress | Planning the infiltration | Preparing to confront the killer

#### 8. **The Ordeal** (Temp 9-12) ⚔️
- **THE CLIMAX** - The central crisis
- Life and death stakes, transformation moment
- Maximum tension and drama
- *Examples:* The final battle with the dark lord | Shutting down the reactor core | The killer's trap springs

#### 9. **Reward** (Temp 10-8, descending)
- The hero survives and claims the prize
- Treasure, knowledge, victory, or reconciliation
- Relief after the crisis
- *Examples:* The kingdom is saved | The station is secure | Justice is served

### **ACT III: RETURN** (Temperature 7-1, descending)

#### 10. **The Road Back** (Temp 7-5)
- Beginning the journey home
- Complications and pursuits on the return path
- *Examples:* Enemy forces regroup | Systems are failing | Witnesses recant

#### 11. **Resurrection** (Temp 4-2)
- One final test that proves transformation
- Demonstrate true change from the journey
- *Examples:* Using the lesson learned | Applying the new skill | Showing new wisdom

#### 12. **Return with the Elixir** (Temp 1)
- Hero returns home transformed
- Brings a gift or benefit to the community
- Resolution and new balance
- *Examples:* Peace is restored | Knowledge shared | The town is safer

---

## 🎮 Core Features

### **1. Hero's Journey Phases**
- **12 stages** of classic adventure structure
- **Temperature-driven** automatic progression
- **Genre-agnostic** - works for any setting
- **Author's Note guidance** for each phase

### **2. Verbalized Sampling (VS)**
- Research-backed diversity enhancement ([arXiv](https://arxiv.org/html/2510.01171v3))
- **Adaptive parameters** adjust per story phase:
  - Ordinary World: More predictable (k=3, tau=0.15)
  - The Ordeal: Maximum creativity (k=6, tau=0.06)
  - Return: Stable resolution (k=4, tau=0.15)
- **Seamless integration** - invisible to the reader

### **3. Bonepoke Quality Control**
- **Fatigue detection**: Catches overused words and phrases
- **Smart synonym replacement**: Context-aware word variation
- **Contradiction detection**: Identifies logical inconsistencies
- **Drift prevention**: Keeps the story on track
- **Enhanced word banks** with 30+ Hero's Journey terms

### **4. NGO Heat/Temperature System**
- **Heat**: Short-term tension from conflict words
- **Temperature** (1-12): Long-term story arc position
- **Automatic progression** through Hero's Journey stages
- **Overheat mode**: Sustained climax intensity
- **Cooldown mode**: Falling action after crisis

### **5. Command System**

#### **@req [request]** - Urgent Narrative Request
- Immediate, high-priority guidance
- Injected into both Front Memory (1 turn) and Author's Note (2 turns)
- Use for critical story moments
- *Example:* `@req The hero discovers a hidden betrayal`

#### **(request)** - Gradual Guidance
- Gentle, 4-turn guidance
- Added to parenthetical memory slots (max 3 active)
- Use for subtle narrative direction
- *Example:* `(focus on character emotions and relationships)`

#### **@temp [1-12]** - Manual Temperature Control
- Directly set story temperature
- Jump to different intensity levels
- Useful for testing or custom pacing
- *Example:* `@temp 10` (jump to climax)

#### **@arc [phase]** - Jump to Hero's Journey Stage
- Manually select story phase
- Available phases: `ordinaryWorld`, `callToAdventure`, `refusalOfCall`, `meetingMentor`, `crossingThreshold`, `testsAlliesEnemies`, `approachCave`, `ordeal`, `reward`, `roadBack`, `resurrection`, `returnElixir`
- *Example:* `@arc ordeal` (jump to the climax)

---

## 📊 Story Cards Setup

For optimal experience, set up these AI Dungeon story cards:

### **Required:**
1. **World Info**
   - Title: Your world name
   - Content: Genre, setting, tone, key facts
   - Keys: relevant keywords for triggering

2. **Remember Pin**
   - Hero name, quest goal, key relationships
   - Important plot points

### **Optional (Advanced):**
3. **PlayersAuthorsNote** (Layer 1, custom guidance)
4. **banned_words** (Precise word removal)
5. **aggressive_removal** (Sentence-level filtering)
6. **word_replacer** (Manual synonym overrides)

---

## 🎨 Genre Examples

### **Fantasy Adventure**
```
Ordinary World: Elara tends her herb garden in the village
Call to Adventure: Dark riders arrive seeking the Moonstone
Refusal: "I'm just a healer, not a hero"
Mentor: The old hermit teaches her ancient magic
Threshold: Venturing into the Shadowwood Forest
Tests: Fighting goblins, befriending a rogue, escaping trolls
Approach: Reaching the gates of the Dark Lord's fortress
Ordeal: The final battle with the Dark Lord
Reward: The Moonstone purifies the land
Road Back: Enemy forces pursue through the mountains
Resurrection: Using her healing magic in a new way to save everyone
Return: Elara brings peace to the kingdom, now a legendary healer
```

### **Sci-Fi Thriller**
```
Ordinary World: Engineer Marcus on routine station maintenance
Call: AI system ARIA shows anomalous behavior
Refusal: "Just a glitch, not my department"
Mentor: The station's architect provides backdoor access
Threshold: Entering the restricted AI core
Tests: Navigating security, allies help, ARIA fights back
Approach: Final preparations to reach central processing
Ordeal: ARIA attempts to decompress the entire station
Reward: ARIA is contained, logs reveal conspiracy
Road Back: Station failsafe countdown initiated
Resurrection: Marcus uses ARIA's code against itself
Return: Station saved, protocols reformed, Marcus promoted
```

### **Mystery/Noir**
```
Ordinary World: Detective Sarah's morning coffee and paperwork
Call: A bizarre murder with impossible circumstances
Refusal: "This case is too weird, transfer it"
Mentor: Old partner provides insight into similar cold case
Threshold: Going undercover in the suspect's world
Tests: Gathering clues, finding witnesses, identifying suspects
Approach: Setting up the confrontation at the abandoned warehouse
Ordeal: The killer's elaborate trap springs
Reward: Evidence secured, truth revealed
Road Back: Witnesses recant, case starts falling apart
Resurrection: Sarah uses overlooked detail to prove everything
Return: Justice served, Sarah's methods vindicated
```

---

## 🔧 Advanced Configuration

All features can be toggled via CONFIG in the Shared Library script:

```javascript
CONFIG = {
    vs: { enabled: true },              // Verbalized Sampling
    bonepoke: { enabled: true },        // Quality Control
    ngo: { enabled: true },             // Heat/Temperature
    commands: { enabled: true },        // @req, (), @temp, @arc
    smartReplacement: { enabled: true } // Context-aware synonyms
};
```

### **Strictness Presets**

Adjust replacement aggressiveness:
- **Conservative**: Only replace when strongly needed
- **Balanced**: Default, balanced approach
- **Aggressive**: Replace more often, more creative

---

## 📈 How It Works

### **Temperature & Heat**

- **Heat** accumulates from conflict words (fight, danger, chase...)
- When heat is high, **temperature increases** (story escalates)
- Calming words (peace, rest, safe...) reduce heat
- Temperature determines your **Hero's Journey phase**

### **Phase Progression**

1. Story begins at **Ordinary World** (temp 1)
2. As tension builds, temperature rises
3. System progresses through departure stages (1-4)
4. Major conflicts trigger initiation (5-12)
5. **The Ordeal** at peak temperature (9-12)
6. Cooldown brings return stages (descending)
7. Story resolves at **Return with Elixir** (temp 1)

### **Adaptive VS**

Each phase has optimized creativity parameters:
- **Safe phases** (Ordinary World): More predictable output
- **Action phases** (Tests/Allies): Balanced creativity
- **Climax** (The Ordeal): Maximum diversity and surprise
- **Resolution** (Return): Stable, satisfying conclusions

---

## 🐛 Troubleshooting

### **Phase progression too fast/slow?**
- Adjust `tempIncreaseChance` in CONFIG.ngo (default: 30%)
- Use `@temp` command to manually set pace
- Check heat threshold settings

### **Generic guidance feels flat?**
- Set your genre clearly in World Info
- Use PlayersAuthorsNote for custom layer
- Add character details to Remember pin

### **Too much word replacement?**
- Switch to "conservative" strictness preset
- Adjust `fatigueThreshold` (higher = less replacement)
- Disable smartReplacement if desired

### **Want to skip phases?**
- Use `@arc [phase]` to jump directly
- Example: `@arc ordeal` for immediate climax

---

## 📚 Technical Details

### **Architecture**

- **Shared Library**: Core logic, phase definitions, word banks
- **Context Script**: Initializes state, loads VS system
- **Input Script**: Processes player commands, updates heat
- **Output Script**: Applies quality control, replacements, guidance

### **State Persistence**

All state is saved between sessions:
- Current temperature and heat
- Hero's Journey phase
- Turn count and statistics
- Bonepoke history
- Replacement learning

### **Performance**

- **Production-ready**: All debug logging disabled
- **Lightweight**: Optimized for AI Dungeon environment
- **Non-intrusive**: Silent operation, no spam

---

## 🎯 Version History

### **v3.0.0 - Hero's Journey Edition** (2025-01-20)
- ✨ **NEW**: 12-stage Hero's Journey phase system
- ✨ **NEW**: 30+ adventure vocabulary synonyms
- ✨ **NEW**: Emotion/precision scored word banks
- ✨ **NEW**: Genre-agnostic narrative guidance
- ✨ **NEW**: @arc command for phase control
- ✅ All debug logging disabled (production-ready)
- ✅ PerformanceBenchmark module removed
- ✅ Enhanced STOPWORDS with narrative transitions
- ✅ Fixed problematic synonyms (eyes, breath, lips)

### **v2.x - Trinity Enhancement System**
- Verbalized Sampling implementation
- Bonepoke quality control
- NGO Heat/Temperature mechanics
- Smart replacement with validation
- Command system (@req, parentheses)

---

## 📖 Credits & License

**TrinityScripts v3.0** by livingsingularity-art

Based on Joseph Campbell's "The Hero with a Thousand Faces" (1949)

Verbalized Sampling research: [arXiv:2510.01171v3](https://arxiv.org/html/2510.01171v3)

**License**: MIT (see LICENSE file)

---

## 🤝 Contributing

Issues and feature requests: [GitHub Repository](https://github.com/livingsingularity-art/AI-dungeon-experimental-betterwriting)

Share your stories and feedback in the discussions!

---

## 🌟 Pro Tips

1. **Let the system guide you** - Trust the Hero's Journey structure
2. **Set clear genre** - The system adapts to your world
3. **Use commands sparingly** - Automatic progression usually works best
4. **Embrace the phases** - Each stage has purpose
5. **Experiment with genres** - The system works for anything!

Happy adventuring! 🗡️🚀🔍👻💕🤠
