# TrinityScripts Release Blueprint: Hero's Journey Edition

## Overview
This blueprint outlines the transformation of TrinityScripts into a production-ready, genre-agnostic adventure storytelling system based on Joseph Campbell's Hero's Journey (Monomyth) structure.

## Version
**Target Version:** 3.0.0 - Hero's Journey Release
**Date:** 2025-01-20
**Status:** In Development

---

## Part 1: Debugging Feature Removal

### 1.1 Logging Systems to Disable

All `safeLog()` calls will remain in code BUT will be disabled via CONFIG flags:

#### Configuration Changes:
```javascript
// Disable all debug logging for production
vs: {
    debugLogging: false  // Was: true
},
bonepoke: {
    debugLogging: false  // Was: true
},
ngo: {
    debugLogging: false,      // Was: true
    logStateChanges: false    // Was: true
},
commands: {
    debugLogging: false  // Was: true
},
smartReplacement: {
    debugLogging: false,             // Was: true
    logReplacementReasons: false,    // Was: true
    logContextAnalysis: false,       // Was: true
    logValidation: false             // Was: true
}
```

### 1.2 Analytics to Keep (Essential)
- `state.turnCount` - Required for phase progression
- `state.ngo.heat` / `state.ngo.temperature` - Core mechanics
- `state.bonepokeHistory` - Quality tracking
- `state.outputHistory` - Cross-output repeat detection
- `state.replacementLearning` - Adaptive system

### 1.3 Features to Remove Completely
- Performance benchmarking (`PerformanceBenchmark` module)
- Validation tracking statistics (`state.replacementValidation`)
- Development comments (keep only user-facing documentation)

---

## Part 2: Hero's Journey Integration

### 2.1 The 12 Stages Mapped to NGO System

The current NGO system has a generic phase structure. We'll replace it with Hero's Journey stages:

#### Current NGO Phases (Generic):
1. Introduction (temp 1-2)
2. Rising Action (temp 3-5)
3. Buildup (temp 6-8)
4. Climax (temp 9-12)
5. Falling Action (temp 8-5 during cooldown)
6. Resolution (temp 4-1 during cooldown)

#### New Hero's Journey Phases:

**ACT I: DEPARTURE (Separation from Ordinary World)**

1. **Ordinary World** (Temperature 1)
   - **Description:** Establish the hero's normal life, daily routine, relationships, and world
   - **Narrative Goals:** Character introduction, world-building, establish normalcy
   - **Author's Note Guidance:** "Focus on establishing the hero's ordinary life and relationships. Show what is normal, comfortable, and familiar. Build the world and introduce supporting characters."
   - **Conflict Words:** minimal, focus on routine conflicts
   - **Heat Range:** 0-5 (low tension)

2. **Call to Adventure** (Temperature 1-2)
   - **Description:** An event disrupts the ordinary world, presenting a challenge or quest
   - **Narrative Goals:** Introduce the inciting incident, present the quest/challenge
   - **Author's Note Guidance:** "Introduce a disruption or challenge that pulls the hero out of their ordinary world. Present a quest, mystery, or problem that demands attention."
   - **Conflict Words:** discovery, challenge, mystery
   - **Heat Range:** 5-10 (rising tension)

3. **Refusal of the Call** (Temperature 2)
   - **Description:** Hero hesitates, shows fear or reluctance to accept the challenge
   - **Narrative Goals:** Show vulnerability, internal conflict, stakes
   - **Author's Note Guidance:** "Show the hero's hesitation, fear, or reluctance. Highlight what they might lose or why they're afraid to proceed. Build internal conflict."
   - **Conflict Words:** doubt, fear, hesitation
   - **Heat Range:** 8-12 (internal tension)

4. **Meeting the Mentor** (Temperature 2-3)
   - **Description:** Hero encounters a guide who provides wisdom, training, or aid
   - **Narrative Goals:** Introduce mentor figure, provide tools/knowledge, build confidence
   - **Author's Note Guidance:** "Introduce a mentor, guide, or helper who provides wisdom, training, or necessary items. Build the relationship between hero and mentor."
   - **Conflict Words:** teaching, preparation, guidance
   - **Heat Range:** 5-10 (preparation)

5. **Crossing the Threshold** (Temperature 3-4)
   - **Description:** Hero commits to the journey and enters the special/unknown world
   - **Narrative Goals:** Point of no return, leave familiar behind, enter adventure
   - **Author's Note Guidance:** "The hero commits to the journey and crosses into the unknown. This is the point of no return. Show the transition from ordinary to special world."
   - **Conflict Words:** departure, commitment, journey
   - **Heat Range:** 10-15 (commitment tension)

**ACT II: INITIATION (Trials in the Special World)**

6. **Tests, Allies, and Enemies** (Temperature 4-6)
   - **Description:** Hero faces challenges, makes friends, and identifies foes
   - **Narrative Goals:** Build relationships, test abilities, reveal character
   - **Author's Note Guidance:** "The hero encounters tests, makes allies, and identifies enemies. Show the hero learning the rules of this new world and building relationships."
   - **Conflict Words:** battle, friendship, rivalry, challenge
   - **Heat Range:** 15-25 (active adventure)

7. **Approach to the Inmost Cave** (Temperature 7-8)
   - **Description:** Hero prepares for the major challenge ahead
   - **Narrative Goals:** Final preparations, gathering courage, anticipation builds
   - **Author's Note Guidance:** "The hero approaches the location or moment of greatest danger. Build anticipation and tension. Show final preparations and growing dread."
   - **Conflict Words:** preparation, danger, foreboding
   - **Heat Range:** 25-35 (rising dread)

8. **The Ordeal** (Temperature 9-12)
   - **Description:** The central crisis - hero faces death, greatest fear, or major enemy
   - **Narrative Goals:** Peak conflict, transformation moment, life-or-death stakes
   - **Author's Note Guidance:** "THE CLIMAX. The hero faces their greatest challenge, darkest moment, or most dangerous enemy. Life and death stakes. Maximum tension and drama."
   - **Conflict Words:** death, battle, crisis, survival
   - **Heat Range:** 40-50+ (MAXIMUM)
   - **Overheat Trigger:** YES

9. **Reward (Seizing the Sword)** (Temperature 10-8)
   - **Description:** Hero survives and gains the treasure, knowledge, or victory
   - **Narrative Goals:** Consequence of ordeal, gain the prize, moment of relief
   - **Author's Note Guidance:** "The hero survives the ordeal and claims their reward: a treasure, knowledge, victory, or reconciliation. Show the fruits of their struggle."
   - **Conflict Words:** victory, discovery, achievement
   - **Heat Range:** 30-40 (post-climax high)

**ACT III: RETURN (Bringing the Gift Home)**

10. **The Road Back** (Temperature 7-5)
    - **Description:** Hero begins the journey home, often facing pursuit or complications
    - **Narrative Goals:** Return journey complications, chase sequences, loose ends
    - **Author's Note Guidance:** "The hero begins the journey back to the ordinary world. Show complications, pursuits, or challenges on the return path."
    - **Conflict Words:** escape, pursuit, return
    - **Heat Range:** 20-30 (falling action with tension)
    - **Cooldown Begins:** YES

11. **Resurrection** (Temperature 4-2)
    - **Description:** Final test - hero must use everything learned to prove transformation
    - **Narrative Goals:** Final challenge, demonstrate growth, purification moment
    - **Author's Note Guidance:** "The hero faces one final test that proves their transformation. They must demonstrate they've truly changed and learned from the journey."
    - **Conflict Words:** final test, transformation, proof
    - **Heat Range:** 15-25 (final surge)

12. **Return with the Elixir** (Temperature 1)
    - **Description:** Hero returns home transformed, bringing benefit to their community
    - **Narrative Goals:** Show change, restore balance, share the gift, resolution
    - **Author's Note Guidance:** "The hero returns home transformed, bringing a gift, knowledge, or benefit to their community. Show how the journey changed them and improved their world."
    - **Conflict Words:** homecoming, peace, balance
    - **Heat Range:** 0-10 (resolution)

### 2.2 Phase Progression System

#### Temperature-to-Phase Mapping:
```javascript
Temperature 1: Ordinary World
Temperature 1-2: Call to Adventure → Refusal → Meeting Mentor
Temperature 3-4: Crossing the Threshold
Temperature 4-6: Tests, Allies, Enemies
Temperature 7-8: Approach to Inmost Cave
Temperature 9-12: The Ordeal
Temperature 10-8: Reward
Temperature 7-5: The Road Back
Temperature 4-2: Resurrection
Temperature 1: Return with the Elixir
```

#### Manual Override Commands:
- `@arc [phase_name]` - Jump to specific Hero's Journey stage
- `@temp [1-12]` - Set temperature (which influences phase)

### 2.3 Genre-Agnostic Implementation

The system must work for ANY genre:
- **Fantasy:** Wizard called to save kingdom from dark lord
- **Sci-Fi:** Engineer must stop rogue AI on space station
- **Mystery:** Detective investigates murder in small town
- **Horror:** Survivor escapes from haunted location
- **Romance:** Character overcomes fear to find love
- **Western:** Gunslinger defends town from bandits

**Key Principles:**
1. **No genre-specific vocabulary** in guidance (no "magic", "spaceships", "romance")
2. **Universal narrative beats** (challenge, fear, mentor, crisis, transformation)
3. **Flexible conflict detection** (physical, emotional, intellectual, social)
4. **Player-driven genre** through world info, story cards, and input

### 2.4 Verbalized Sampling Adaptation per Phase

Different Hero's Journey stages need different VS parameters:

```javascript
Ordinary World: k=3, tau=0.15 (predictable, safe)
Call/Refusal: k=4, tau=0.12 (slightly varied)
Meeting Mentor: k=4, tau=0.10 (balanced)
Crossing Threshold: k=5, tau=0.10 (adventurous)
Tests/Allies/Enemies: k=5, tau=0.08 (creative variety)
Approach: k=5, tau=0.10 (building tension)
Ordeal: k=6, tau=0.06 (maximum creativity for climax)
Reward: k=5, tau=0.10 (relief and discovery)
Road Back: k=5, tau=0.12 (complications)
Resurrection: k=5, tau=0.10 (focused final test)
Return: k=4, tau=0.15 (stable resolution)
```

---

## Part 3: Production Configuration

### 3.1 Default Settings for Release

```javascript
CONFIG = {
    vs: {
        enabled: true,
        k: 5,
        tau: 0.10,
        seamless: true,
        adaptive: true,
        debugLogging: false  // PRODUCTION
    },
    bonepoke: {
        enabled: true,
        fatigueThreshold: 3,
        qualityThreshold: 2.5,
        enableDynamicCorrection: true,
        debugLogging: false  // PRODUCTION
    },
    ngo: {
        enabled: true,
        // All mechanics enabled
        debugLogging: false,  // PRODUCTION
        logStateChanges: false  // PRODUCTION
    },
    commands: {
        enabled: true,
        debugLogging: false  // PRODUCTION
    },
    smartReplacement: {
        enabled: true,
        enableContextMatching: true,
        enableAdaptiveLearning: true,
        enablePhraseIntelligence: true,
        enableValidation: true,
        debugLogging: false,  // PRODUCTION
        logReplacementReasons: false,  // PRODUCTION
        logContextAnalysis: false,  // PRODUCTION
        logValidation: false  // PRODUCTION
    },
    system: {
        persistState: true,
        enableAnalytics: true
    }
};
```

### 3.2 Recommended Story Cards for Users

Users should set up these cards for optimal experience:

1. **World Info:** Genre, setting, tone
2. **Remember Pin:** Hero name, quest goal, key relationships
3. **PlayersAuthorsNote:** Custom narrative guidance (optional layer 1)
4. **banned_words (optional):** Precise word removal
5. **aggressive_removal (optional):** Sentence-level filtering
6. **word_replacer (optional):** Manual synonym overrides

---

## Part 4: Documentation (README)

### 4.1 README Structure

```markdown
# TrinityScripts v3.0 - Hero's Journey Edition

## Overview
- What it is
- What it does
- Who it's for

## Quick Start
- Installation steps
- Minimal setup
- First adventure

## The Hero's Journey System
- 12 stages explained
- How progression works
- Manual controls (@arc, @temp)

## Core Features
1. Hero's Journey Phases
2. Verbalized Sampling (VS)
3. Bonepoke Quality Control
4. NGO Heat/Temperature System
5. Smart Replacement System
6. Command System (@req, parentheses, @temp, @arc)

## Commands Reference
- @req [request] - Urgent narrative request
- (request) - Gradual 4-turn guidance
- @temp [1-12] - Set temperature manually
- @arc [phase] - Jump to specific Hero's Journey stage

## Advanced Configuration
- Story cards setup
- Tuning parameters
- Troubleshooting

## Hero's Journey Stage Reference
- Detailed breakdown of all 12 stages
- Examples for different genres
- Tips for each stage

## Technical Details
- How it works
- Architecture overview
- State persistence

## Credits & License
```

---

## Part 5: Testing & Validation

### 5.1 Test Scenarios

Before release, test these scenarios:

1. **Fantasy Adventure:** Wizard's journey to defeat dark lord
2. **Sci-Fi Thriller:** Engineer stops rogue AI
3. **Mystery Investigation:** Detective solves murder
4. **Horror Survival:** Character escapes haunted house
5. **Romance Story:** Overcoming fear to find love

### 5.2 Validation Checklist

- [ ] All debug logging disabled
- [ ] 12 Hero's Journey phases implemented
- [ ] Phase progression works correctly
- [ ] Temperature/Heat mechanics functional
- [ ] @arc and @temp commands work
- [ ] Genre-agnostic (no hardcoded genre terms)
- [ ] README is comprehensive
- [ ] No performance issues
- [ ] State persists correctly
- [ ] Overheat/Cooldown mechanics work

---

## Part 6: Implementation Roadmap

### Phase 1: Cleanup (Estimated: 2 hours)
1. Disable all debug logging via CONFIG
2. Remove PerformanceBenchmark module
3. Remove validation tracking stats
4. Clean up comments

### Phase 2: Hero's Journey Implementation (Estimated: 4 hours)
1. Design 12-phase system in shared library
2. Create phase definitions with guidance
3. Implement temperature-to-phase mapping
4. Update VS adaptation for each phase
5. Add @arc command for manual phase control

### Phase 3: Documentation (Estimated: 2 hours)
1. Write comprehensive README
2. Add inline documentation
3. Create examples for each genre
4. Document all commands

### Phase 4: Testing (Estimated: 2 hours)
1. Test all 12 phases
2. Test phase transitions
3. Test @arc and @temp commands
4. Test multiple genres
5. Validate quality

### Phase 5: Release (Estimated: 1 hour)
1. Final review
2. Version bump to 3.0.0
3. Commit and push
4. Create release notes

---

## Part 7: Success Metrics

The release is successful if:

1. ✅ All debug logging disabled (production-ready)
2. ✅ 12 Hero's Journey phases work correctly
3. ✅ System is genre-agnostic (no hardcoded genre terms)
4. ✅ Phase progression is smooth and logical
5. ✅ Manual controls (@arc, @temp) work as expected
6. ✅ README is clear and comprehensive
7. ✅ Multiple genre tests pass
8. ✅ Performance is acceptable (no lag)
9. ✅ Code is clean and well-documented
10. ✅ Version control is clean (good commit messages)

---

## Notes & Considerations

### Design Philosophy
- **Genre-Agnostic First:** Never assume genre in core logic
- **Player Agency:** System guides but doesn't force
- **Quality Focus:** Bonepoke ensures high-quality output
- **Smooth Pacing:** Heat/Temperature creates natural story arcs
- **Flexibility:** Manual overrides for power users

### Potential Issues & Solutions
1. **Phase progression too fast/slow:** Adjust temperature increase rates
2. **Generic guidance feels flat:** Add more specific but genre-neutral examples
3. **Overheat triggers too often:** Adjust thresholds in config
4. **Cooldown too abrupt:** Adjust cooldown duration/rate

### Future Enhancements (Post-Release)
- Multiple monomyth variants (Writer's Journey, Virgin's Promise)
- Genre-specific expansion packs (as separate optional modules)
- Visual phase tracker (if AI Dungeon supports)
- Community story card templates
- Advanced analytics dashboard

---

**Blueprint Version:** 1.0
**Last Updated:** 2025-01-20
**Status:** Ready for Implementation
