# ENHANCED_SYNONYM_MAP Completion Blueprint
**Version:** 1.0
**Date:** 2025-01-18
**Target:** Complete Bonepoke scoring for 100 missing SYNONYM_MAP entries
**Goal:** Create the most intelligent, versatile, and context-aware synonym replacement system possible

---

## Executive Summary

**Current Status:**
- **SYNONYM_MAP entries:** 226 total
- **ENHANCED_SYNONYM_MAP entries:** 126 complete (55.8% coverage)
- **Missing Bonepoke scores:** 100 entries (44.2% gap)

**Mission:** Transform Trinity's synonym replacement from 56% smart selection to **100% Bonepoke-aware** replacement, ensuring every word choice is guided by quality analysis rather than random chance.

**Key Innovation:** This blueprint doesn't just add scores—it creates a **semantic intelligence layer** that understands:
- **Emotional resonance** (how does the word make readers feel?)
- **Precision clarity** (how specific/vivid is the meaning?)
- **Contextual fitness** (which situations demand which variants?)
- **Stylistic versatility** (formal vs casual, literary vs technical)

---

## Table of Contents

1. [Gap Analysis](#1-gap-analysis)
2. [Scoring Methodology](#2-scoring-methodology)
3. [Categorization Strategy](#3-categorization-strategy)
4. [Tag System Architecture](#4-tag-system-architecture)
5. [Implementation Phases](#5-implementation-phases)
6. [Quality Assurance](#6-quality-assurance)
7. [Automation Framework](#7-automation-framework)
8. [Complete Entry Templates](#8-complete-entry-templates)
9. [Integration Testing](#9-integration-testing)
10. [Maintenance Plan](#10-maintenance-plan)

---

## 1. Gap Analysis

### 1.1 Missing Entries by Category

**Adverbs (8 entries):**
- `finally`, `slowly`
- **Impact:** High-frequency words in narrative pacing
- **Priority:** P1 - Used in almost every story

**Common Verbs (35 entries):**
- `get`, `got`, `grew`, `built`, `broke`, `changed`, `died`, `killed`, `ran`, `tried`, etc.
- **Impact:** Critical - these are the most overused words in amateur writing
- **Priority:** P1 - Maximum fatigue risk

**Dialogue/Speech Verbs (7 entries):**
- `answer`, `reply`, `respond`, `muttered`, `screamed`, `yelled`
- **Impact:** High - essential for varied dialogue
- **Priority:** P1 - Dialogue Weight dimension depends on these

**Adjectives - Descriptive (22 entries):**
- `awful`, `cool`, `crazy`, `dull`, `easy`, `gorgeous`, `hard`, `horrible`, `huge`, `loud`, etc.
- **Impact:** Medium-High - overused but replaceable
- **Priority:** P2 - Word Variety improvements

**Nouns - Common (15 entries):**
- `answer`, `breath`, `building`, `child`, `city`, `door`, `enemy`, `eyes`, `face`, `fingers`, `fire`, `friend`, `hair`, `hand`, `life`, `place`, `room`, `sound`, `time`, `voice`, `wall`, `war`, `water`, `way`, `world`
- **Impact:** High - appear frequently in descriptions
- **Priority:** P2 - Precision improvements

**Multi-word Phrases (3 entries):**
- `combat boots`, `emerald eyes`, `quick glance`
- **Impact:** Low - specific situations only
- **Priority:** P3 - Nice-to-have

**Sound Effects (7 entries):**
- `*click*`, `*creak*`, `*gulp*`, `*rustle*`, `*schlick*`, `*schlorp*`, `*scuff*`, `*thud*`
- **Impact:** Low - stylistic choices
- **Priority:** P3 - Enhancement only

**Color Adjectives (6 entries):**
- `black`, `blue`, `gray`, `green`, `white`, `red`
- **Impact:** Medium - precision matters for visual clarity
- **Priority:** P2 - Character Clarity dimension

---

## 2. Scoring Methodology

### 2.1 Emotion Score (1-5)

**Purpose:** Measure the emotional weight/intensity the word carries.

| Score | Definition | Example Words | When to Use |
|-------|------------|---------------|-------------|
| **1** | Neutral, no emotional coloring | the, is, was, said (basic) | Emotional Strength < 2 (need boost) |
| **2** | Slight emotional tint | mentioned, noticed, walked | Emotional Strength 2-3 (maintain) |
| **3** | Moderate emotional impact | whispered, strode, dark | Emotional Strength 3-4 (good) |
| **4** | Strong emotional resonance | screamed, fled, terrifying | Emotional Strength < 2 (strong boost) |
| **5** | Maximum emotional intensity | shrieked, annihilated, catastrophic | Emotional Strength < 1 (emergency boost) |

**Scoring Process:**
1. Read the synonym in isolation
2. Ask: "What emotion does this word evoke in readers?"
3. Consider: intensity, connotation, visceral impact
4. Compare to baseline word (baseEmotion)
5. Score relative to the original word's neutrality

**Examples:**
```javascript
// 'answer' (verb) - neutral baseline
'answer': {
    synonyms: [
        { word: 'reply', emotion: 2, precision: 3 },      // Slight formality
        { word: 'respond', emotion: 2, precision: 4 },    // More deliberate
        { word: 'retort', emotion: 4, precision: 4 },     // Hostile/sharp emotion
        { word: 'snap', emotion: 5, precision: 4 }        // Very aggressive
    ],
    baseEmotion: 1, basePrecision: 2
}
```

### 2.2 Precision Score (1-5)

**Purpose:** Measure how specific, vivid, and unambiguous the word is.

| Score | Definition | Example Words | When to Use |
|-------|------------|---------------|-------------|
| **1** | Vague, generic, unclear | thing, stuff, got | Character Clarity < 1 (emergency) |
| **2** | Basic clarity, simple | walked, looked, said | Character Clarity < 2 (needs boost) |
| **3** | Clear and specific | strode, gazed, stated | Character Clarity 2-3 (maintain) |
| **4** | Very precise, vivid | sauntered, scrutinized, articulated | Character Clarity 3-4 (excellent) |
| **5** | Maximum specificity | ambled, dissected, pontificated | Character Clarity < 2 (literary boost) |

**Scoring Process:**
1. Ask: "How much information does this word convey?"
2. Consider: specificity, imagery, clarity of meaning
3. Test: "Can a reader visualize this clearly?"
4. Compare to synonyms in same set
5. Higher precision = fewer possible interpretations

**Examples:**
```javascript
// 'walked' - basic movement verb
'walked': {
    synonyms: [
        { word: 'moved', emotion: 1, precision: 1 },      // Vague - could be any motion
        { word: 'strode', emotion: 3, precision: 4 },     // Specific gait, confident
        { word: 'sauntered', emotion: 3, precision: 5 },  // Very specific - casual, unhurried
        { word: 'ambled', emotion: 2, precision: 5 }      // Maximum precision - slow, relaxed
    ],
    baseEmotion: 1, basePrecision: 2
}
```

### 2.3 Base Scores

**Purpose:** Define the quality floor of the original word.

**Guidelines:**
- `baseEmotion`: Emotional weight of the ORIGINAL fatigued word
- `basePrecision`: Clarity/specificity of the ORIGINAL fatigued word
- Used as comparison point: synonyms should ideally match or exceed base scores
- If Bonepoke scores are LOW, system prioritizes synonyms with HIGHER scores

**Examples:**
```javascript
// High-quality original - synonyms should maintain level
'articulated': { baseEmotion: 3, basePrecision: 5 }

// Low-quality original - synonyms should improve
'got': { baseEmotion: 1, basePrecision: 1 }

// Emotionally loaded original - synonyms should vary
'screamed': { baseEmotion: 5, basePrecision: 3 }
```

---

## 3. Categorization Strategy

### 3.1 Priority Tiers

**P1: Critical Path (45 entries) - Complete First**
- High-frequency verbs (35): get, got, grew, built, broke, changed, tried, etc.
- Adverbs affecting pacing (8): finally, slowly
- Essential dialogue verbs (7): answer, reply, respond, muttered, screamed, yelled

**Rationale:** These words appear in EVERY story. Missing Bonepoke scores means 44% of all synonym replacements are random instead of quality-aware.

**P2: Quality Enhancers (35 entries) - Complete Second**
- Descriptive adjectives (22): awful, cool, dull, gorgeous, hard, loud, etc.
- Common nouns (15): breath, building, child, city, door, eyes, face, etc.
- Color adjectives (6): black, blue, gray, green, white, red

**Rationale:** Improve Character Clarity and Word Variety dimensions. High ROI for writing quality.

**P3: Polish & Edge Cases (20 entries) - Complete Last**
- Multi-word phrases (3): combat boots, emerald eyes, nervous laugh, deep breath
- Sound effects (7): *click*, *creak*, *gulp*, etc.
- Specialized words (10): defeat, enemy, journey, victory, war, weapon, etc.

**Rationale:** Lower frequency, situational use. Nice-to-have for completeness.

---

## 4. Tag System Architecture

### 4.1 Tag Philosophy

**Purpose:** Tags enable **context matching** - the system analyzes surrounding text and selects synonyms whose tags align with the detected context.

**Tag Categories:**

1. **Emotional Tone Tags**
   - `positive`, `negative`, `neutral`
   - `tense`, `calm`, `anxious`, `peaceful`
   - `hopeful`, `despairing`, `fearful`, `confident`

2. **Pacing/Energy Tags**
   - `fast`, `slow`, `medium`
   - `urgent`, `leisurely`, `rushed`, `deliberate`
   - `action`, `introspective`, `contemplative`

3. **Formality Tags**
   - `formal`, `casual`, `neutral`
   - `literary`, `colloquial`, `technical`
   - `archaic`, `modern`, `slang`

4. **Genre/Setting Tags**
   - `scifi`, `fantasy`, `modern`, `historical`
   - `military`, `nautical`, `medical`, `legal`
   - `urban`, `rural`, `wilderness`, `space`

5. **Physical/Sensory Tags**
   - `visual`, `auditory`, `tactile`, `olfactory`
   - `violent`, `gentle`, `forceful`, `soft`
   - `harsh`, `smooth`, `sharp`, `dull`

6. **Dialogue-Specific Tags**
   - `dialogue`, `said-alternative`
   - `aggressive`, `timid`, `neutral-speech`
   - `whisper`, `shout`, `normal-volume`

7. **Relationship/Social Tags**
   - `intimate`, `formal-distance`, `hostile`
   - `superior-to-inferior`, `peer-to-peer`
   - `respectful`, `dismissive`, `affectionate`

### 4.2 Tag Selection Guidelines

**Rule 1: Minimum 2 tags, maximum 5 tags per synonym**
- Too few = poor context matching
- Too many = dilutes specificity

**Rule 2: Always include at least one PRIMARY tag**
- Primary tags: formality, emotion, pacing, or genre
- These have highest context-matching weight

**Rule 3: Be consistent across related words**
- If 'strode' is tagged `confident`, all confident-walk verbs get it
- Maintains semantic coherence

**Rule 4: Avoid redundant tags**
- Bad: `['fast', 'quick', 'rapid']` - all mean the same
- Good: `['fast', 'urgent', 'action']` - distinct dimensions

**Examples:**
```javascript
// GOOD tagging - diverse, specific, useful
{ word: 'sauntered', emotion: 3, precision: 5, tags: ['slow', 'casual', 'confident', 'relaxed'] }

// BAD tagging - redundant, vague
{ word: 'sauntered', emotion: 3, precision: 5, tags: ['walk', 'walking', 'movement'] }

// EXCELLENT tagging - contextually rich
{ word: 'retorted', emotion: 4, precision: 4, tags: ['aggressive', 'dialogue', 'defensive', 'hostile', 'sharp'] }
```

---

## 5. Implementation Phases

### Phase 1: P1 Critical Path (Week 1-2)

**Target:** 45 entries
**Focus:** High-frequency verbs, adverbs, dialogue verbs

**Day 1-3: High-Frequency Verbs (20 entries)**
```
get, got, gave, grew, built, broke, changed, died, killed, ran,
kept, lost, met, played, ran, replied, responded, tried, turned, used
```

**Process:**
1. Group by semantic field (motion, change, possession, etc.)
2. Score each synonym relative to group
3. Assign tags based on usage context
4. Cross-reference with existing ENHANCED entries for consistency

**Day 4-5: Adverbs & Pacing Words (8 entries)**
```
finally, slowly, commonly, easily, softly, loudly, quietly, quickly
```

**Process:**
1. Identify pacing impact (fast vs slow)
2. Score emotion based on intensity
3. Score precision based on specificity
4. Tag with pacing + formality

**Day 6-7: Dialogue Verbs (7 entries)**
```
answer, reply, respond, muttered, screamed, yelled, whispered
```

**Process:**
1. Map to volume spectrum (whisper → yell)
2. Map to emotion spectrum (neutral → hostile)
3. Tag with dialogue + emotion + volume
4. Ensure Dialogue Weight compatibility

**Deliverable:** 45 entries with full Bonepoke scores + tags

---

### Phase 2: P2 Quality Enhancers (Week 3-4)

**Target:** 35 entries
**Focus:** Adjectives, nouns, colors

**Day 1-4: Descriptive Adjectives (22 entries)**
```
awful, cool, crazy, dull, easy, gorgeous, hard, horrible, huge, loud,
modern, nice, old, perfect, poor, powerful, quiet, sick, simple, small,
strong, terrible, tiny, ugly, warm, weak, weird, wonderful, young
```

**Process:**
1. Group by polarity (positive/negative/neutral)
2. Group by intensity (mild/moderate/extreme)
3. Score emotion based on connotation
4. Score precision based on specificity vs vagueness
5. Tag with tone + intensity + formality

**Day 5-6: Common Nouns (15 entries)**
```
answer, breath, building, child, city, door, enemy, eyes, face,
fingers, fire, friend, hair, hand, life, place, room, sound, time,
voice, wall, water, way, world
```

**Process:**
1. Consider generic vs specific alternatives
2. Score precision highly for vivid variants
3. Tag with genre + setting + formality
4. Include part-for-whole variants where appropriate

**Day 7: Color Adjectives (6 entries)**
```
black, blue, gray, green, white, red
```

**Process:**
1. Include shade variations (crimson, scarlet, ruby for red)
2. Score precision based on specificity
3. Score emotion based on color psychology
4. Tag with visual + tone + intensity

**Deliverable:** 35 entries with full Bonepoke scores + tags

---

### Phase 3: P3 Polish & Edge Cases (Week 5)

**Target:** 20 entries
**Focus:** Phrases, sound effects, specialized words

**Day 1-2: Multi-word Phrases (3 entries)**
```
combat boots, emerald eyes, deep breath, long sigh, nervous laugh,
quick glance, slight smile
```

**Process:**
1. Treat as atomic units (don't break apart)
2. Score based on vividness of imagery
3. Tag with context + emotion + specificity
4. Include variations maintaining parallel structure

**Day 3: Sound Effects (7 entries)**
```
*click*, *creak*, *gulp*, *rustle*, *schlick*, *schlorp*, *scuff*, *thud*
```

**Process:**
1. Score emotion based on intensity
2. Score precision based on acoustic specificity
3. Tag with auditory + intensity + context
4. Consider onomatopoeia variations

**Day 4-5: Specialized Words (10 entries)**
```
defeat, enemy, journey, victory, war, weapon, peace, battle, hero, villain
```

**Process:**
1. Map to genre contexts (fantasy, scifi, historical, etc.)
2. Score emotion based on narrative weight
3. Score precision based on specificity
4. Tag heavily with genre + formality

**Deliverable:** 20 entries with full Bonepoke scores + tags

---

## 6. Quality Assurance

### 6.1 Internal Consistency Checks

**Check 1: Emotion Score Coherence**
```javascript
// Verify emotion scores increase with intensity
'said' (emotion: 1) < 'stated' (emotion: 2) < 'declared' (emotion: 3) < 'shouted' (emotion: 4)
```

**Check 2: Precision Score Logic**
```javascript
// Verify precision scores align with specificity
'moved' (precision: 1) < 'walked' (precision: 2) < 'strode' (precision: 4) < 'sauntered' (precision: 5)
```

**Check 3: Tag Appropriateness**
```javascript
// Verify tags match word semantics
'whispered' should have: ['dialogue', 'quiet', 'soft', 'secretive']
'whispered' should NOT have: ['loud', 'aggressive', 'forceful']
```

**Check 4: Base Score Accuracy**
```javascript
// Verify baseEmotion/basePrecision reflect original word
'got': { baseEmotion: 1, basePrecision: 1 }  // ✅ Correct - vague and neutral
'shrieked': { baseEmotion: 5, basePrecision: 3 }  // ✅ Correct - intense but not ultra-precise
```

### 6.2 Cross-Reference Validation

**Validation 1: Synonym Overlap Check**
- Ensure synonyms don't appear in multiple entries inappropriately
- Example: 'stated' should be in 'said' entry, not also in 'spoke' entry

**Validation 2: Tag Consistency Check**
- Ensure similar words share core tags
- Example: All dialogue verbs should have 'dialogue' tag

**Validation 3: Score Distribution Check**
- Verify each entry has score variety (not all 3s)
- Ensure emotional and precision ranges are utilized

### 6.3 Testing Protocol

**Test 1: Contextual Appropriateness**
```javascript
// Test scenario: Tense action scene
Context: "He ran down the corridor, heart pounding..."
Fatigued word: "ran"
Expected replacement: 'sprinted' (fast, action, urgent) NOT 'jogged' (slow, casual)
Verify: getSmartSynonym('ran', bonepokeScores, context) returns high-energy variant
```

**Test 2: Quality Preservation**
```javascript
// Test scenario: High-quality original
Context: "She articulated her thoughts with precision..."
Fatigued word: "articulated"
Expected: shouldKeepFatiguedWord() returns true - original is best choice
Verify: System preserves quality despite fatigue
```

**Test 3: Dimension Boosting**
```javascript
// Test scenario: Low Emotional Strength (1.5/5)
Fatigued word: "said"
Expected replacement: 'declared' or 'exclaimed' (emotion: 3-4) NOT 'mentioned' (emotion: 2)
Verify: System prioritizes emotion-boosting synonyms when dimension is weak
```

---

## 7. Automation Framework

### 7.1 Semi-Automated Scoring Tool (Python)

**Purpose:** Accelerate scoring process with AI assistance + human review

```python
# pseudo-code for scoring assistant
import anthropic

def generate_bonepoke_scores(word, synonyms):
    """
    Use Claude to generate initial emotion/precision scores
    Human reviews and adjusts as needed
    """
    prompt = f"""
    Analyze these synonyms for the word '{word}' and provide Bonepoke scores:

    Synonyms: {', '.join(synonyms)}

    For each synonym, provide:
    1. Emotion score (1-5): How emotionally intense is this word?
    2. Precision score (1-5): How specific and vivid is this word?
    3. Tags (2-5): Contextual tags (formality, pacing, genre, etc.)

    Format as JSON:
    {{
        "synonym": {{
            "emotion": 3,
            "precision": 4,
            "tags": ["formal", "technical", "deliberate"]
        }}
    }}
    """

    # Get AI suggestion
    response = claude.generate(prompt)

    # Human reviews in interactive mode
    return review_and_adjust(response)

def batch_process_missing_entries(missing_list):
    """Process all 100 missing entries with AI assistance"""
    for entry in missing_list:
        word = entry['word']
        synonyms = SYNONYM_MAP[word]

        print(f"\n--- Processing: {word} ---")
        scores = generate_bonepoke_scores(word, synonyms)

        # Generate code snippet
        generate_enhanced_entry(word, scores)

        # Validate
        validate_entry(word, scores)
```

### 7.2 Validation Automation

```python
def validate_bonepoke_entry(entry):
    """Automated quality checks"""
    checks = []

    # Check 1: Score ranges
    for syn in entry['synonyms']:
        assert 1 <= syn['emotion'] <= 5, "Emotion out of range"
        assert 1 <= syn['precision'] <= 5, "Precision out of range"
        checks.append("✓ Scores in valid range")

    # Check 2: Tag count
    for syn in entry['synonyms']:
        assert 2 <= len(syn['tags']) <= 5, "Tag count outside 2-5 range"
        checks.append("✓ Tag count valid")

    # Check 3: Base scores exist
    assert 'baseEmotion' in entry, "Missing baseEmotion"
    assert 'basePrecision' in entry, "Missing basePrecision"
    checks.append("✓ Base scores present")

    # Check 4: Synonym variety
    emotions = [syn['emotion'] for syn in entry['synonyms']]
    assert len(set(emotions)) > 1, "No emotion variety"
    checks.append("✓ Emotion variety present")

    return all(checks)
```

### 7.3 Code Generation Tool

```python
def generate_enhanced_entry(word, scores):
    """Generate JavaScript code for ENHANCED_SYNONYM_MAP entry"""

    code = f"    '{word}': {{\n"
    code += "        synonyms: [\n"

    for syn, data in scores.items():
        code += f"            {{ word: '{syn}', "
        code += f"emotion: {data['emotion']}, "
        code += f"precision: {data['precision']}, "
        code += f"tags: {data['tags']} }},\n"

    code += "        ],\n"
    code += f"        baseEmotion: {data['baseEmotion']}, "
    code += f"basePrecision: {data['basePrecision']}\n"
    code += "    },\n"

    print(code)
    return code
```

---

## 8. Complete Entry Templates

### 8.1 Template: High-Frequency Verb

```javascript
'get': {
    synonyms: [
        { word: 'obtain', emotion: 2, precision: 3, tags: ['formal', 'deliberate'] },
        { word: 'receive', emotion: 2, precision: 3, tags: ['passive', 'formal'] },
        { word: 'acquire', emotion: 2, precision: 4, tags: ['formal', 'deliberate', 'effort'] },
        { word: 'gain', emotion: 3, precision: 3, tags: ['positive', 'achievement'] },
        { word: 'secure', emotion: 3, precision: 4, tags: ['deliberate', 'effort', 'success'] },
        { word: 'procure', emotion: 2, precision: 5, tags: ['formal', 'deliberate', 'literary'] }
    ],
    baseEmotion: 1, basePrecision: 1  // 'get' is vague and neutral
}
```

**Rationale:**
- Emotion: 2-3 (formal variants add slight weight)
- Precision: 3-5 (all more specific than 'get')
- Tags: Focus on formality + effort/passivity distinctions
- baseEmotion: 1 (neutral), basePrecision: 1 (very vague)

---

### 8.2 Template: Dialogue Verb

```javascript
'answer': {
    synonyms: [
        { word: 'reply', emotion: 2, precision: 3, tags: ['dialogue', 'formal', 'neutral-speech'] },
        { word: 'respond', emotion: 2, precision: 4, tags: ['dialogue', 'formal', 'deliberate'] },
        { word: 'retort', emotion: 4, precision: 4, tags: ['dialogue', 'aggressive', 'defensive', 'sharp'] },
        { word: 'snap', emotion: 5, precision: 4, tags: ['dialogue', 'hostile', 'aggressive', 'sudden'] },
        { word: 'murmur', emotion: 2, precision: 4, tags: ['dialogue', 'quiet', 'soft', 'hesitant'] }
    ],
    baseEmotion: 1, basePrecision: 2  // 'answer' is neutral but clear
}
```

**Rationale:**
- Emotion: Wide range (2-5) for variety
- Precision: 3-4 (all specify HOW they answered)
- Tags: All include 'dialogue', then differentiate by tone/volume
- baseEmotion: 1 (neutral verb), basePrecision: 2 (basic clarity)

---

### 8.3 Template: Descriptive Adjective

```javascript
'awful': {
    synonyms: [
        { word: 'terrible', emotion: 4, precision: 3, tags: ['negative', 'strong', 'colloquial'] },
        { word: 'dreadful', emotion: 4, precision: 4, tags: ['negative', 'formal', 'intense'] },
        { word: 'horrendous', emotion: 5, precision: 4, tags: ['negative', 'extreme', 'emphatic'] },
        { word: 'atrocious', emotion: 5, precision: 5, tags: ['negative', 'extreme', 'formal', 'literary'] },
        { word: 'abysmal', emotion: 4, precision: 5, tags: ['negative', 'extreme', 'literary', 'depth'] }
    ],
    baseEmotion: 3, basePrecision: 2  // 'awful' is negative but vague
}
```

**Rationale:**
- Emotion: 4-5 (all strongly negative)
- Precision: 3-5 (increasing specificity)
- Tags: All 'negative', differentiate by formality/intensity
- baseEmotion: 3 (moderately intense), basePrecision: 2 (somewhat vague)

---

### 8.4 Template: Color Adjective

```javascript
'red': {
    synonyms: [
        { word: 'crimson', emotion: 3, precision: 5, tags: ['visual', 'dark-red', 'intense', 'literary'] },
        { word: 'scarlet', emotion: 3, precision: 5, tags: ['visual', 'bright-red', 'vivid', 'bold'] },
        { word: 'ruby', emotion: 3, precision: 5, tags: ['visual', 'jewel-tone', 'rich', 'formal'] },
        { word: 'vermilion', emotion: 3, precision: 5, tags: ['visual', 'orange-red', 'exotic', 'literary'] },
        { word: 'burgundy', emotion: 2, precision: 5, tags: ['visual', 'dark-red', 'sophisticated', 'muted'] }
    ],
    baseEmotion: 1, basePrecision: 2  // 'red' is neutral, somewhat vague
}
```

**Rationale:**
- Emotion: 2-3 (colors have moderate emotional weight)
- Precision: ALL 5 (specific shades are maximally precise)
- Tags: All 'visual', differentiate by shade + tone
- baseEmotion: 1 (neutral), basePrecision: 2 (basic color)

---

### 8.5 Template: Common Noun

```javascript
'building': {
    synonyms: [
        { word: 'structure', emotion: 1, precision: 2, tags: ['neutral', 'technical', 'generic'] },
        { word: 'edifice', emotion: 3, precision: 4, tags: ['formal', 'imposing', 'literary', 'large'] },
        { word: 'facility', emotion: 1, precision: 4, tags: ['technical', 'functional', 'modern'] },
        { word: 'construction', emotion: 2, precision: 3, tags: ['neutral', 'in-progress', 'physical'] },
        { word: 'tower', emotion: 3, precision: 5, tags: ['tall', 'imposing', 'vertical', 'specific'] },
        { word: 'hall', emotion: 2, precision: 4, tags: ['interior-space', 'formal', 'specific'] }
    ],
    baseEmotion: 1, basePrecision: 2  // 'building' is neutral and somewhat vague
}
```

**Rationale:**
- Emotion: 1-3 (nouns less emotional than verbs/adjectives)
- Precision: 2-5 (specific types much clearer than 'building')
- Tags: Differentiate by size, function, formality
- baseEmotion: 1 (neutral), basePrecision: 2 (generic)

---

### 8.6 Template: Adverb (Pacing)

```javascript
'finally': {
    synonyms: [
        { word: 'eventually', emotion: 2, precision: 3, tags: ['slow', 'gradual', 'neutral'] },
        { word: 'ultimately', emotion: 2, precision: 4, tags: ['formal', 'conclusive', 'deliberate'] },
        { word: 'lastly', emotion: 1, precision: 3, tags: ['sequential', 'formal', 'conclusive'] },
        { word: 'at last', emotion: 3, precision: 3, tags: ['relief', 'anticipation', 'colloquial'] },
        { word: 'in the end', emotion: 2, precision: 3, tags: ['reflective', 'conclusive', 'neutral'] }
    ],
    baseEmotion: 2, basePrecision: 2  // 'finally' has slight relief/anticipation
}
```

**Rationale:**
- Emotion: 1-3 (some relief connotation)
- Precision: 3-4 (moderate specificity)
- Tags: Focus on pacing + emotional undertone
- baseEmotion: 2 (slight anticipation), basePrecision: 2 (clear but basic)

---

### 8.7 Template: Sound Effect

```javascript
'*thud*': {
    synonyms: [
        { word: '*thump*', emotion: 3, precision: 4, tags: ['auditory', 'heavy', 'dull', 'impact'] },
        { word: '*bang*', emotion: 4, precision: 4, tags: ['auditory', 'loud', 'sharp', 'sudden'] },
        { word: '*crash*', emotion: 5, precision: 4, tags: ['auditory', 'very-loud', 'destructive', 'violent'] },
        { word: '*slam*', emotion: 4, precision: 5, tags: ['auditory', 'forceful', 'door-specific', 'aggressive'] }
    ],
    baseEmotion: 3, basePrecision: 3  // 'thud' is moderately intense and specific
}
```

**Rationale:**
- Emotion: 3-5 (sound effects have inherent intensity)
- Precision: 4-5 (onomatopoeia is highly specific)
- Tags: All 'auditory', differentiate by intensity/character
- baseEmotion: 3 (moderate), basePrecision: 3 (fairly specific)

---

## 9. Integration Testing

### 9.1 Test Scenarios

**Scenario 1: High-Frequency Verb Replacement**
```javascript
// Input text
"She got the package and opened it carefully."

// Bonepoke scores (before replacement)
{
    'Emotional Strength': 2.0,
    'Story Flow': 3.5,
    'Character Clarity': 1.8,  // LOW - needs precision boost
    'Dialogue Weight': 0,
    'Word Variety': 2.5
}

// Expected behavior
- Detect 'got' as fatigued (used 3+ times)
- Identify 'Character Clarity' as weakest dimension (1.8 < 2.0)
- Filter synonyms for high precision (3+)
- Context: neutral, no strong mood detected
- Select: 'received' or 'acquired' (precision: 3-4, formal)

// After replacement
"She received the package and opened it carefully."

// Bonepoke scores (after replacement)
{
    'Character Clarity': 2.3  // IMPROVED from 1.8
}
```

**Scenario 2: Dialogue Verb Escalation**
```javascript
// Input text (tense confrontation scene)
"'I don't believe you,' she answered coldly."

// Context analysis
- Mood: negative (coldly, don't believe)
- Pacing: medium
- Dialogue: yes
- Emotional tone: hostile

// Bonepoke scores
{
    'Emotional Strength': 1.5,  // LOW - needs emotion boost
    'Dialogue Weight': 3.0
}

// Expected behavior
- Detect 'answered' as fatigued
- Identify 'Emotional Strength' as weakest dimension
- Filter synonyms for high emotion (3+)
- Context matching: hostile tone detected
- Select: 'retorted' or 'snap' (emotion: 4-5, tags: aggressive/hostile)

// After replacement
"'I don't believe you,' she retorted coldly."

// Bonepoke scores (after replacement)
{
    'Emotional Strength': 2.8  // IMPROVED from 1.5
}
```

**Scenario 3: Context-Aware Retention**
```javascript
// Input text (literary prose)
"The red sunset painted the sky in shades of crimson."

// Bonepoke scores
{
    'Emotional Strength': 4.5,
    'Character Clarity': 4.8,
    'Word Variety': 1.0  // LOW but...
}

// Expected behavior
- Detect 'red' as fatigued (low Word Variety)
- Run shouldKeepFatiguedWord() comparison
- Original "red sunset" → Bonepoke score: 4.2
- Synonym "crimson sunset" → Bonepoke score: 4.1 (redundant with "shades of crimson")
- Synonym "scarlet sunset" → Bonepoke score: 4.0 (clash with "crimson" later)
- Decision: KEEP 'red' - original maintains best quality

// After analysis
"The red sunset painted the sky in shades of crimson."  // UNCHANGED

// Log output
"✋ Kept fatigued word 'red': Original maintains best quality (delta: +0.2)"
```

### 9.2 Edge Case Testing

**Edge Case 1: All Synonyms Contradict Context**
```javascript
// Input
"The quiet whisper echoed through the silent room."

// Fatigued: 'whisper'
// Synonyms: 'murmur', 'mutter', 'breathe', 'hiss'
// Problem: ALL are quiet sounds, but "echoed" suggests volume
// Detection: contradictionCheck() flags ALL synonyms
// Resolution: KEEP original 'whisper' - least contradictory
```

**Edge Case 2: No Bonepoke-Scored Synonyms Available**
```javascript
// Input
"The XYZ device activated."

// Fatigued: 'XYZ' (hypothetical word not in ENHANCED_SYNONYM_MAP)
// Fallback: Use basic SYNONYM_MAP if available
// Fallback 2: Keep original if no synonyms at all
// Log: "⚠️ 📝 Needs synonym: XYZ (kept in text)"
```

**Edge Case 3: Synonym Increases Fatigue**
```javascript
// Input
"She walked down the hall and walked through the door."

// Fatigued: 'walked' (used 2x in sentence)
// Synonym candidate: 'moved'
// Check: 'moved' appears 3x elsewhere in paragraph
// Detection: preventFatigueIncrease = true
// Resolution: Try next synonym or keep original
```

---

## 10. Maintenance Plan

### 10.1 Ongoing Monitoring

**Metric 1: Coverage Rate**
- Track: Percentage of synonyms with Bonepoke scores
- Target: 100% (currently 56%, goal: 100%)
- Review: Monthly check for new SYNONYM_MAP additions

**Metric 2: Replacement Quality**
- Track: Average Bonepoke score improvement after replacements
- Target: +0.3 points average improvement
- Review: Analyze logs for quality degradation cases

**Metric 3: Context Match Success**
- Track: Percentage of replacements where tags matched context
- Target: 70%+ tag match rate
- Review: Identify missing tag categories

### 10.2 Expansion Strategy

**New Words Addition Protocol:**

1. **Discovery:** User reports missing synonym or pattern analysis detects frequent word
2. **Validation:** Check word frequency in corpus (must appear 10+ times per 1000 stories)
3. **SYNONYM_MAP Addition:** Add basic synonyms (simple array)
4. **ENHANCED_SYNONYM_MAP Addition:** Score with Bonepoke + tags using this blueprint
5. **Testing:** Run through test scenarios
6. **Deployment:** Add to next release

**Semi-Annual Review:**
- Analyze 6 months of logs for:
  - Most frequently fatigued words
  - Words with "Needs synonym" warnings
  - New writing trends (new genres, new slang, etc.)
- Prioritize additions based on impact

### 10.3 Tag Evolution

**As writing styles evolve, tags must adapt:**

**New Genre Tags:**
- `cyberpunk`, `dystopian`, `romance`, `thriller`, etc.
- Add as new genres become popular in AI Dungeon

**New Formality Levels:**
- `academic`, `journalistic`, `conversational`, `texting`
- Accommodate different writing modes

**Emotional Granularity:**
- Expand beyond positive/negative to: `melancholic`, `euphoric`, `anxious`, `serene`, etc.
- Enable more nuanced emotion matching

---

## 11. Success Metrics

### 11.1 Quantitative Goals

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Coverage Rate | 56% (126/226) | 100% (226/226) | 5 weeks |
| P1 Completion | 0% (0/45) | 100% (45/45) | 2 weeks |
| P2 Completion | 0% (0/35) | 100% (35/35) | 4 weeks |
| P3 Completion | 0% (0/20) | 100% (20/20) | 5 weeks |
| Avg Emotion Range | N/A | 2.5+ points | 5 weeks |
| Avg Precision Range | N/A | 2.5+ points | 5 weeks |
| Tags Per Synonym | N/A | 3.0 average | 5 weeks |

### 11.2 Qualitative Goals

**Goal 1: Semantic Intelligence**
- System understands word nuances, not just surface synonyms
- Replacements feel natural and appropriate in context

**Goal 2: Stylistic Versatility**
- System adapts to ANY writing style (Bradbury, Hemingway, King, etc.)
- Tags enable genre-appropriate replacements

**Goal 3: Quality Preservation**
- Zero instances of quality degradation
- shouldKeepFatiguedWord() prevents all downgrades

**Goal 4: User Trust**
- Users rely on Trinity for synonym suggestions
- "Configure Auto-Cards" becomes go-to tool for customization

---

## 12. Appendices

### Appendix A: Complete Missing Words List (100 entries)

**Adverbs (8):**
commonly, easily, finally, loudly, quietly, slowly, softly

**Verbs (35):**
answer, broke, built, changed, died, felt, gave, get, got, grew, heard, kept, killed, knew, learned, left, lost, loved, met, played, ran, reached, replied, responded, sent, showed, stood, thought, tried, turned, used, waited, walked, wanted, worked

**Dialogue Verbs (7):**
answer (duplicate), muttered, replied (duplicate), responded (duplicate), screamed, whispered (duplicate), yelled

**Adjectives (22):**
awful, cool, crazy, dull, easy, gorgeous, gray, green, hard, horrible, huge, loud, modern, nice, old, perfect, poor, powerful, quiet, sick, simple, small, strong, terrible, tiny, ugly, warm, weak, weird, wonderful, young

**Nouns (15):**
answer (duplicate), breath, building, child, city, door, enemy, eyes, face, fingers, fire, friend, hair, hand, life, place, room, sound, time, voice, wall, water, way, world

**Colors (6):**
black, blue, gray (duplicate), green (duplicate), red, white

**Multi-word Phrases (3):**
combat boots, emerald eyes, quick glance

**Sound Effects (7):**
*click*, *creak*, *gulp*, *rustle*, *schlick*, *schlorp*, *scuff*, *thud*

**Specialized (10):**
common, defeat, journey, peace, victory, war, weapon

### Appendix B: Tag Master List

**Comprehensive tag vocabulary for consistent application:**

**Emotion/Tone:**
positive, negative, neutral, intense, mild, hopeful, despairing, fearful, confident, melancholic, euphoric, anxious, serene, hostile, affectionate, dismissive, respectful, aggressive, timid, defensive

**Pacing/Energy:**
fast, slow, medium, urgent, leisurely, rushed, deliberate, sudden, gradual, abrupt, smooth, jarring

**Formality:**
formal, casual, neutral, literary, colloquial, technical, archaic, modern, slang, academic, conversational

**Genre/Setting:**
scifi, fantasy, modern, historical, urban, rural, wilderness, space, military, nautical, medical, legal, western, cyberpunk, dystopian

**Physical/Sensory:**
visual, auditory, tactile, olfactory, gustatory, violent, gentle, forceful, soft, harsh, smooth, sharp, dull, bright, dark, loud, quiet

**Dialogue:**
dialogue, said-alternative, whisper, shout, normal-volume, question, statement, exclamation

**Relationship:**
intimate, formal-distance, superior-to-inferior, peer-to-peer

**Specificity:**
generic, specific, vague, precise, vivid, abstract, concrete

### Appendix C: Reference Checklist

**Before submitting each entry, verify:**

- [ ] Emotion scores: All between 1-5
- [ ] Precision scores: All between 1-5
- [ ] Base scores: Present and accurate
- [ ] Tag count: 2-5 per synonym
- [ ] Tag validity: All tags in master list
- [ ] Synonym variety: Emotion scores span 2+ points
- [ ] Precision variety: Precision scores span 2+ points
- [ ] No typos: Word spelling correct
- [ ] JavaScript syntax: Valid JSON structure
- [ ] Alphabetical order: Entry in correct position
- [ ] No duplicates: Synonym doesn't appear elsewhere inappropriately
- [ ] Context logic: Tags make semantic sense together
- [ ] Test: Entry passes automated validation

---

## Conclusion

This blueprint transforms ENHANCED_SYNONYM_MAP from a partial coverage system (56%) into a **comprehensive semantic intelligence layer (100%)** that:

1. **Understands context** through 50+ semantic tags
2. **Preserves quality** through Bonepoke score comparisons
3. **Adapts to style** through formality/genre awareness
4. **Learns from usage** through adaptive learning tracking
5. **Scales infinitely** through systematic methodology

**Implementation Timeline:** 5 weeks
**Expected Outcome:** Zero random synonym replacements, 100% Bonepoke-guided quality improvements

**The result:** Trinity becomes the most intelligent synonym replacement system in AI writing assistance, rivaling human editorial judgment while operating in real-time.

---

**END OF BLUEPRINT**
