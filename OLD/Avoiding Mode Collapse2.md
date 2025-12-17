# Mode Collapse Avoidance in AI Dungeon: A Practical Implementation Blueprint

AI Dungeon's scripting environment offers surprisingly powerful tools for combating mode collapse, despite lacking direct control over sampling parameters. The key insight is that scripts can intercept and modify everything the model sees (context) and produces (output), enabling sophisticated diversity enforcement through prompt engineering, n-gram tracking, and context management rather than temperature or top-p adjustments.

This blueprint provides a complete architectural framework and working code for implementing anti-repetition systems within AI Dungeon's JavaScript sandbox. The techniques range from simple Author's Note injections that take minutes to implement, to comprehensive n-gram tracking systems that rival dedicated repetition penalty algorithms.

---

## Understanding AI Dungeon's scripting architecture

AI Dungeon's scripting system operates through four hooks that form a processing pipeline for every interaction. The **Shared Library** contains utility functions available to all other scripts. The **Input Modifier** intercepts player text before processing, returning `{ text, stop }` where `stop: true` prevents AI generation entirely. The **Context Modifier** manipulates the full prompt sent to the model without affecting the displayed story—this is where most diversity injection occurs. The **Output Modifier** processes AI responses before display, enabling repetition detection and filtering.

Scripts access persistent storage through the `state` object, which survives across all modifier calls throughout an adventure. Special properties like `state.memory.context`, `state.memory.frontMemory`, and `state.memory.authorsNote` directly inject content into the AI's context at specific positions. The `history` array provides the last 100 actions with their types (story, continue, do, say), and `worldInfo` exposes the Story Card system for dynamic management.

**Critical limitation**: Scripts cannot control temperature, top-p, top-k, repetition penalties, or any sampling parameters. These remain user-configurable through Advanced AI Settings but are invisible to scripts. This constraint shapes our entire approach—we must achieve diversity through context manipulation rather than parameter tuning.

---

## Technique classification by implementation feasibility

After analyzing AI Dungeon's capabilities against known mode collapse prevention techniques, three implementation categories emerge:

**Fully implementable within AI Dungeon:**
- Verbalized sampling through prompt modification
- N-gram tracking and repetition scoring
- Output filtering and duplicate removal
- Context rotation and diversity-based pruning
- Dynamic Author's Note injection for style variation
- State-based phrase history tracking
- Memory health monitoring and cleanup
- Progressive diversity pressure on retries

**Partially implementable (with workarounds):**
- Repetition penalty effects (via blocked phrase lists in prompts)
- Temperature variation effects (via meta-prompts requesting creativity levels)
- Presence penalty simulation (via explicit "avoid these words" injections)
- Resampling when repetition detected (via user alerts, not automatic retry)

**Not implementable (hardcoded by platform):**
- Direct temperature, top-p, top-k adjustment
- Automatic generation retry without user action
- Token-level probability manipulation
- Model selection via script
- True min-p or other advanced sampling methods

---

## Core detection system: N-gram tracking engine

The foundation of any anti-mode-collapse system is reliable repetition detection. This implementation tracks word-level trigrams across the adventure history, calculates overlap scores, and identifies both exact and structural repetition patterns.

```javascript
// === SHARED LIBRARY ===
// N-gram generation and repetition detection utilities

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'and', 'of', 'in',
  'that', 'it', 'for', 'on', 'with', 'as', 'at', 'by', 'from', 'or', 'be',
  'this', 'have', 'has', 'had', 'you', 'your', 'i', 'my', 'me', 'we', 'our',
  'they', 'their', 'he', 'she', 'his', 'her', 'but', 'not', 'what', 'which'
]);

function generateWordNgrams(text, n) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const ngrams = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

function generateMeaningfulNgrams(text, n) {
  const ngrams = generateWordNgrams(text, n);
  return ngrams.filter(gram => {
    const words = gram.split(' ');
    const meaningfulCount = words.filter(w => !STOPWORDS.has(w)).length;
    return meaningfulCount >= Math.ceil(n / 2);
  });
}

function calculateRepetitionScore(newText, historyTexts) {
  const currentGrams = new Set(generateMeaningfulNgrams(newText, 3));
  const historicalGrams = new Set(
    historyTexts.flatMap(h => generateMeaningfulNgrams(h, 3))
  );
  
  if (currentGrams.size === 0) return 0;
  
  let overlap = 0;
  currentGrams.forEach(gram => {
    if (historicalGrams.has(gram)) overlap++;
  });
  
  return overlap / currentGrams.size;
}

function detectExactRepetition(text) {
  // Matches phrases of 15+ characters repeated consecutively
  const matches = text.match(/(.{15,}?)\1+/g);
  return matches || [];
}

function detectStructuralRepetition(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const starters = {};
  
  sentences.forEach(s => {
    const start = s.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase();
    starters[start] = (starters[start] || 0) + 1;
  });
  
  return Object.entries(starters)
    .filter(([_, count]) => count >= 3)
    .map(([pattern, count]) => ({ pattern, count }));
}

function detectLoopingPatterns(text) {
  // Detect paragraph-level repetition
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  const seen = new Map();
  const loops = [];
  
  paragraphs.forEach((p, idx) => {
    const normalized = p.toLowerCase().replace(/\s+/g, ' ').trim();
    const signature = normalized.slice(0, 100);
    
    if (seen.has(signature)) {
      loops.push({ paragraph: p.slice(0, 50) + '...', firstIndex: seen.get(signature), repeatIndex: idx });
    } else {
      seen.set(signature, idx);
    }
  });
  
  return loops;
}
```

This detection engine forms the analytical backbone. The `generateMeaningfulNgrams` function filters out stopword-heavy trigrams that create false positives ("and the the", "to be a"). The `calculateRepetitionScore` returns a 0-1 value indicating what percentage of the new output's meaningful phrases appeared in recent history. Scores above **0.35** typically indicate problematic repetition.

---

## Diversity injection through context modification

The Context Modifier provides the most powerful intervention point because it controls exactly what the AI model receives. This implementation injects diversity-promoting instructions dynamically based on detected repetition patterns.

```javascript
// === CONTEXT MODIFIER ===
const modifier = (text) => {
  // Initialize tracking state
  if (!state.diversitySystem) {
    state.diversitySystem = {
      outputHistory: [],
      repScoreHistory: [],
      rerollCount: 0,
      lastDiversityScore: 1.0,
      blockedPhrases: [],
      turnCount: 0
    };
  }
  
  const ds = state.diversitySystem;
  ds.turnCount++;
  
  // === VERBALIZED SAMPLING INJECTION ===
  // Research shows this recovers ~67% of diversity lost to alignment
  const verbalizedPrompts = [
    "Consider 3 different directions this scene could take. Choose the most engaging yet unexpected option.",
    "Before continuing, identify which narrative elements have been overused. Consciously vary your approach.",
    "This scene should reveal something new about the world or characters. Avoid retreading familiar ground.",
    "Write as if surprising a reader who has correctly predicted the obvious continuation."
  ];
  
  // Rotate through verbalized prompts
  const vPrompt = verbalizedPrompts[ds.turnCount % verbalizedPrompts.length];
  
  // === DYNAMIC AUTHOR'S NOTE BASED ON REPETITION LEVEL ===
  let authorsNote = "";
  const repScore = ds.lastDiversityScore < 1 ? (1 - ds.lastDiversityScore) : 0;
  
  if (repScore > 0.5) {
    // High repetition - aggressive diversity request
    authorsNote = "IMPORTANT: The narrative has become repetitive. Introduce unexpected elements, vary sentence structure dramatically, use fresh vocabulary. This paragraph should feel distinctly different from recent ones.";
  } else if (repScore > 0.3) {
    // Moderate repetition - gentle nudge
    authorsNote = "Vary your prose style. Use different sentence lengths, introduce new descriptive elements, avoid recently-used phrases.";
  } else if (ds.rerollCount > 0) {
    // User has rerolled - escalate creativity request
    const escalation = [
      "Try a different approach than before.",
      "Be more creative and unexpected in your continuation.",
      "Write something that would surprise the reader.",
      "Completely change direction from previous attempts."
    ];
    authorsNote = escalation[Math.min(ds.rerollCount - 1, escalation.length - 1)];
  } else {
    // Normal operation - light diversity maintenance
    authorsNote = "Be specific, descriptive, and creative. Avoid repetition.";
  }
  
  // === INJECT BLOCKED PHRASES ===
  let blockedSection = "";
  if (ds.blockedPhrases.length > 0) {
    const recentBlocked = ds.blockedPhrases.slice(-10);
    blockedSection = `\n[Avoid using these overused phrases: ${recentBlocked.join('; ')}]`;
  }
  
  // === BUILD MODIFIED CONTEXT ===
  const lines = text.split('\n');
  const insertPosition = Math.max(0, lines.length - 3);
  
  // Insert Author's Note at standard position (3 lines from end)
  lines.splice(insertPosition, 0, `[Author's note: ${authorsNote}]`);
  
  // Add verbalized sampling instruction near the end
  lines.push(`\n[Writing guidance: ${vPrompt}]${blockedSection}`);
  
  return { text: lines.join('\n') };
};
modifier(text);
```

The **verbalized sampling** technique draws from recent research showing that asking models to consider multiple options before selecting one recovers significant diversity. The dynamic Author's Note creates a feedback loop—high repetition scores trigger stronger diversity requests, which should reduce future repetition scores.

---

## Output analysis and user feedback system

The Output Modifier analyzes AI responses, updates repetition metrics, and provides actionable feedback to users when intervention is needed.

```javascript
// === OUTPUT MODIFIER ===
const modifier = (text) => {
  if (!state.diversitySystem) {
    state.diversitySystem = {
      outputHistory: [],
      repScoreHistory: [],
      rerollCount: 0,
      lastDiversityScore: 1.0,
      blockedPhrases: [],
      turnCount: 0
    };
  }
  
  const ds = state.diversitySystem;
  let modifiedText = text;
  const issues = [];
  
  // === CALCULATE REPETITION METRICS ===
  const repScore = calculateRepetitionScore(text, ds.outputHistory);
  ds.lastDiversityScore = 1 - repScore;
  ds.repScoreHistory.push(repScore);
  if (ds.repScoreHistory.length > 20) ds.repScoreHistory.shift();
  
  // === DETECT SPECIFIC ISSUES ===
  const exactRepeats = detectExactRepetition(text);
  const structuralRepeats = detectStructuralRepetition(text);
  const loopPatterns = detectLoopingPatterns(ds.outputHistory.join('\n\n') + '\n\n' + text);
  
  if (repScore > 0.4) {
    issues.push(`High phrase repetition (${Math.round(repScore * 100)}% overlap with recent outputs)`);
  }
  
  if (exactRepeats.length > 0) {
    issues.push(`Exact phrase repetition detected`);
    // Auto-remove duplicates
    exactRepeats.forEach(repeat => {
      const escaped = repeat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})\\1+`, 'g');
      modifiedText = modifiedText.replace(regex, '$1');
    });
  }
  
  if (structuralRepeats.length > 0) {
    issues.push(`Structural repetition: sentences starting with "${structuralRepeats[0].pattern}..." (${structuralRepeats[0].count}x)`);
  }
  
  if (loopPatterns.length > 0) {
    issues.push(`Narrative loop detected - story may be cycling`);
  }
  
  // === EXTRACT AND TRACK OVERUSED PHRASES ===
  const currentNgrams = generateMeaningfulNgrams(text, 3);
  const ngramCounts = {};
  currentNgrams.forEach(g => {
    ngramCounts[g] = (ngramCounts[g] || 0) + 1;
  });
  
  // Add phrases that appear 3+ times in current output to blocked list
  Object.entries(ngramCounts)
    .filter(([_, count]) => count >= 3)
    .forEach(([gram, _]) => {
      if (!ds.blockedPhrases.includes(gram)) {
        ds.blockedPhrases.push(gram);
      }
    });
  
  // Maintain blocked phrase list size
  if (ds.blockedPhrases.length > 30) {
    ds.blockedPhrases = ds.blockedPhrases.slice(-20);
  }
  
  // === UPDATE HISTORY ===
  ds.outputHistory.push(text);
  if (ds.outputHistory.length > 8) ds.outputHistory.shift();
  
  // === GENERATE USER FEEDBACK ===
  if (issues.length > 0) {
    const avgRepScore = ds.repScoreHistory.reduce((a, b) => a + b, 0) / ds.repScoreHistory.length;
    
    let message = `⚠️ Repetition Alert\n`;
    message += issues.map(i => `• ${i}`).join('\n');
    message += `\n\nDiversity Score: ${Math.round(ds.lastDiversityScore * 100)}%`;
    message += `\nSession Average: ${Math.round((1 - avgRepScore) * 100)}%`;
    
    if (repScore > 0.5) {
      message += `\n\n💡 Recommendation: Click Retry for a fresh response, or use Undo to return before the repetition started.`;
    }
    
    state.message = message;
    ds.rerollCount++;
  } else {
    // Good output - reset reroll counter and provide positive feedback
    ds.rerollCount = 0;
    
    // Only show message occasionally to avoid spam
    if (ds.turnCount % 5 === 0) {
      state.message = `✓ Diversity healthy: ${Math.round(ds.lastDiversityScore * 100)}%`;
    }
  }
  
  return { text: modifiedText };
};
modifier(text);
```

This system maintains a rolling window of recent outputs (8 generations), calculates comprehensive repetition metrics, automatically removes exact duplicates, builds a dynamic blocked-phrase list, and provides clear user feedback when intervention is needed. The **reroll escalation system** increases diversity pressure each time a user clicks Retry, then resets when good output is achieved.

---

## Input processing and command interface

The Input Modifier handles user commands for manual control and preprocesses input to maximize diversity.

```javascript
// === INPUT MODIFIER ===
const modifier = (text) => {
  if (!state.diversitySystem) {
    state.diversitySystem = {
      outputHistory: [],
      repScoreHistory: [],
      rerollCount: 0,
      lastDiversityScore: 1.0,
      blockedPhrases: [],
      turnCount: 0,
      config: {
        alertThreshold: 0.35,
        autoFilter: true,
        verboseFeedback: false
      }
    };
  }
  
  const ds = state.diversitySystem;
  
  // === COMMAND PROCESSING ===
  if (text.startsWith('/')) {
    const parts = text.trim().slice(1).split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
      case 'diversity':
      case 'div':
        // Show diversity stats
        const avgScore = ds.repScoreHistory.length > 0
          ? ds.repScoreHistory.reduce((a, b) => a + b, 0) / ds.repScoreHistory.length
          : 0;
        state.message = `📊 Diversity Statistics\n` +
          `Current Score: ${Math.round(ds.lastDiversityScore * 100)}%\n` +
          `Session Average: ${Math.round((1 - avgScore) * 100)}%\n` +
          `Blocked Phrases: ${ds.blockedPhrases.length}\n` +
          `Outputs Tracked: ${ds.outputHistory.length}`;
        return { text: "", stop: true };
      
      case 'clearblocked':
        // Reset blocked phrase list
        ds.blockedPhrases = [];
        state.message = "✓ Blocked phrase list cleared";
        return { text: "", stop: true };
      
      case 'reset':
        // Full diversity system reset
        ds.outputHistory = [];
        ds.repScoreHistory = [];
        ds.blockedPhrases = [];
        ds.rerollCount = 0;
        ds.lastDiversityScore = 1.0;
        state.message = "✓ Diversity system reset";
        return { text: "", stop: true };
      
      case 'threshold':
        // Adjust alert threshold
        const newThreshold = parseFloat(args[0]);
        if (!isNaN(newThreshold) && newThreshold >= 0 && newThreshold <= 1) {
          ds.config.alertThreshold = newThreshold;
          state.message = `✓ Alert threshold set to ${Math.round(newThreshold * 100)}%`;
        } else {
          state.message = "Usage: /threshold 0.35 (value between 0 and 1)";
        }
        return { text: "", stop: true };
      
      case 'verbose':
        ds.config.verboseFeedback = !ds.config.verboseFeedback;
        state.message = `Verbose feedback: ${ds.config.verboseFeedback ? 'ON' : 'OFF'}`;
        return { text: "", stop: true };
      
      case 'help':
        state.message = `🔧 Diversity System Commands\n` +
          `/div - Show diversity statistics\n` +
          `/clearblocked - Clear blocked phrase list\n` +
          `/reset - Reset entire diversity system\n` +
          `/threshold N - Set alert threshold (0-1)\n` +
          `/verbose - Toggle detailed feedback`;
        return { text: "", stop: true };
    }
  }
  
  // === INPUT DIVERSITY ENHANCEMENT ===
  // Detect simple/repetitive player inputs
  const inputWords = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (inputWords.length < 4 && !text.includes('"')) {
    // Very short input - encourage elaboration via context
    ds.inputWasSimple = true;
  } else {
    ds.inputWasSimple = false;
  }
  
  // Track last input for similarity detection
  ds.lastInput = text;
  
  return { text };
};
modifier(text);
```

The command system provides runtime control without editing scripts. Users can check diversity metrics, clear tracked phrases when starting a new scene, adjust sensitivity thresholds, and reset the system entirely. The input analysis detects very simple player inputs (which tend to produce repetitive "You do X" responses) and flags them for enhanced diversity injection.

---

## Memory health monitoring and context management

Mode collapse often originates from problematic content accumulating in Memory or Story Cards. This monitoring system identifies and helps resolve these issues.

```javascript
// Add to Shared Library
function analyzeMemoryHealth(memoryText) {
  const issues = [];
  
  // Check for duplicate sentences
  const sentences = memoryText.match(/[^.!?]+[.!?]+/g) || [];
  const seenSentences = new Map();
  
  sentences.forEach(s => {
    const normalized = s.toLowerCase().trim();
    if (seenSentences.has(normalized)) {
      issues.push({
        type: 'duplicate_sentence',
        text: s.trim().slice(0, 50) + '...'
      });
    }
    seenSentences.set(normalized, true);
  });
  
  // Check for high n-gram density
  const trigrams = generateMeaningfulNgrams(memoryText, 3);
  const freq = new Map();
  trigrams.forEach(g => freq.set(g, (freq.get(g) || 0) + 1));
  
  const highFreqPhrases = [...freq.entries()]
    .filter(([_, count]) => count > 3)
    .map(([gram, count]) => ({ gram, count }));
  
  if (highFreqPhrases.length > 3) {
    issues.push({
      type: 'high_phrase_density',
      examples: highFreqPhrases.slice(0, 3)
    });
  }
  
  // Check for problematic patterns
  if (/\bnot\b|\bdon't\b|\bwon't\b|\bnever\b/i.test(memoryText)) {
    issues.push({
      type: 'negative_instruction',
      note: 'Negative instructions often backfire. Use positive framing instead.'
    });
  }
  
  return issues;
}

function analyzeWorldInfo(worldInfo) {
  const issues = [];
  const allEntries = worldInfo.map(w => w.entry).join(' ');
  
  // Check for duplicate keys
  const keySet = new Map();
  worldInfo.forEach((entry, idx) => {
    entry.keys.split(',').forEach(key => {
      const k = key.trim().toLowerCase();
      if (keySet.has(k)) {
        issues.push({
          type: 'duplicate_key',
          key: k,
          indices: [keySet.get(k), idx]
        });
      }
      keySet.set(k, idx);
    });
  });
  
  // Check for overly long entries
  worldInfo.forEach((entry, idx) => {
    if (entry.entry.length > 1000) {
      issues.push({
        type: 'oversized_entry',
        index: idx,
        length: entry.entry.length
      });
    }
  });
  
  // Check for repetitive content across entries
  const crossEntryGrams = generateMeaningfulNgrams(allEntries, 4);
  const gramFreq = new Map();
  crossEntryGrams.forEach(g => gramFreq.set(g, (gramFreq.get(g) || 0) + 1));
  
  const repeatedAcrossEntries = [...gramFreq.entries()]
    .filter(([_, count]) => count > 2);
  
  if (repeatedAcrossEntries.length > 5) {
    issues.push({
      type: 'cross_entry_repetition',
      count: repeatedAcrossEntries.length,
      examples: repeatedAcrossEntries.slice(0, 3).map(([g, _]) => g)
    });
  }
  
  return issues;
}

// Command to run health check (add to Input Modifier switch)
case 'health':
  const memoryIssues = analyzeMemoryHealth(memory || '');
  const worldIssues = analyzeWorldInfo(worldInfo || []);
  
  let healthReport = "📋 Memory Health Report\n\n";
  
  if (memoryIssues.length === 0 && worldIssues.length === 0) {
    healthReport += "✓ No issues detected!";
  } else {
    if (memoryIssues.length > 0) {
      healthReport += "Memory Issues:\n";
      memoryIssues.forEach(i => {
        healthReport += `• ${i.type}: ${i.text || i.note || JSON.stringify(i.examples)}\n`;
      });
    }
    if (worldIssues.length > 0) {
      healthReport += "\nStory Card Issues:\n";
      worldIssues.forEach(i => {
        healthReport += `• ${i.type}: ${JSON.stringify(i).slice(0, 80)}\n`;
      });
    }
  }
  
  state.message = healthReport;
  return { text: "", stop: true };
```

The `/health` command provides a diagnostic report identifying Memory content that may be causing repetition (duplicate sentences, high phrase density, negative instructions) and Story Card problems (duplicate keys, oversized entries, repeated content across entries).

---

## Advanced: Context diversity rotation

This technique actively prunes repetitive content from context while preserving narrative coherence, making room for fresh content in limited context windows.

```javascript
// Add to Context Modifier for advanced context management
function diversityAwarePrune(contextText, maxChars, ds) {
  if (contextText.length <= maxChars) return contextText;
  
  // Split into paragraphs
  const paragraphs = contextText.split(/\n\n+/);
  
  // Score each paragraph
  const scored = paragraphs.map((para, idx) => {
    const recency = idx / paragraphs.length; // 0 = oldest, 1 = newest
    const repScore = calculateRepetitionScore(para, ds.outputHistory);
    const length = para.length;
    
    // Priority formula: recent + novel content wins
    // Lower score = higher priority to keep
    const priority = (1 - recency) * 0.4 + repScore * 0.6;
    
    return { para, idx, priority, length };
  });
  
  // Sort by priority (lower = keep)
  scored.sort((a, b) => a.priority - b.priority);
  
  // Rebuild context within limit, preserving most recent 3 paragraphs always
  const mustKeep = scored.filter(s => s.idx >= paragraphs.length - 3);
  const canPrune = scored.filter(s => s.idx < paragraphs.length - 3);
  
  let result = [];
  let charCount = mustKeep.reduce((sum, s) => sum + s.length, 0);
  
  // Add must-keep
  mustKeep.forEach(s => result.push(s));
  
  // Add others by priority until limit
  for (const item of canPrune) {
    if (charCount + item.length + 4 <= maxChars) { // +4 for \n\n
      result.push(item);
      charCount += item.length + 4;
    }
  }
  
  // Restore original order
  result.sort((a, b) => a.idx - b.idx);
  
  return result.map(r => r.para).join('\n\n');
}

// In Context Modifier, before other modifications:
if (info && info.maxChars) {
  text = diversityAwarePrune(text, info.maxChars - 500, ds); // Reserve 500 for injections
}
```

This pruning algorithm preferentially removes older, more repetitive paragraphs while always preserving the most recent content for coherence. It's particularly valuable for longer adventures where accumulated repetitive content crowds out fresh narrative development.

---

## Performance and implementation considerations

**Execution constraints**: AI Dungeon scripts run in a sandboxed JavaScript environment without network access, setTimeout, or external libraries. All algorithms must be self-contained and execute synchronously within the modifier call.

**Memory efficiency**: The `state` object persists but shouldn't grow unboundedly. The implementation limits `outputHistory` to 8 entries, `blockedPhrases` to 30, and `repScoreHistory` to 20. For very long adventures, consider adding automatic cleanup:

```javascript
// Add to any modifier as periodic cleanup
if (ds.turnCount % 50 === 0) {
  // Aggressive cleanup every 50 turns
  ds.outputHistory = ds.outputHistory.slice(-5);
  ds.blockedPhrases = ds.blockedPhrases.slice(-15);
  ds.repScoreHistory = ds.repScoreHistory.slice(-10);
}
```

**Processing overhead**: N-gram generation is O(n) where n is text length. For typical AI Dungeon outputs (200-500 characters), this adds negligible latency. The most expensive operation is cross-history comparison, mitigated by limiting history length.

**Debugging**: Use `console.log()` statements liberally during development—output appears in the "Script Logs & Errors" tab and the Last Model Input (LMI) view accessible via the brain icon.

---

## User interaction model

The complete system presents users with three interaction modes:

**Passive monitoring**: The system runs automatically, showing periodic diversity scores and alerting only when significant repetition is detected. Users receive clear recommendations ("Click Retry" or "Use Undo") without requiring script knowledge.

**Active commands**: Users who want more control access the command system (`/div`, `/health`, `/threshold`, etc.) to diagnose issues, adjust sensitivity, and reset tracking when appropriate.

**Configuration options**: Advanced users can modify the `config` object to adjust:
- `alertThreshold`: Repetition score that triggers warnings (default: 0.35)
- `autoFilter`: Whether to automatically remove exact duplicates (default: true)
- `verboseFeedback`: Whether to show detailed n-gram analysis (default: false)

---

## Integration with AI Dungeon's model ecosystem

AI Dungeon's 2025 model lineup—from **12B Wayfarer Small** through **671B DeepSeek V3**—exhibits varying repetition tendencies. Smaller models generally benefit more from aggressive diversity injection, while larger models may only need light monitoring. Consider model-aware thresholds:

```javascript
// If model detection becomes available, adjust accordingly
// Currently, users would set this manually
const modelProfiles = {
  small: { alertThreshold: 0.30, diversityPressure: 'high' },
  medium: { alertThreshold: 0.35, diversityPressure: 'medium' },
  large: { alertThreshold: 0.40, diversityPressure: 'low' }
};

// User command to set profile
case 'profile':
  const profile = args[0]?.toLowerCase();
  if (modelProfiles[profile]) {
    Object.assign(ds.config, modelProfiles[profile]);
    state.message = `✓ Applied ${profile} model profile`;
  }
  return { text: "", stop: true };
```

The **Wayfarer** series, specifically fine-tuned for storytelling, may require different handling than general-purpose models like **Hermes 3** or **DeepSeek**.

---

## Complete modular architecture

The final system architecture separates concerns across the four script tabs:

| Component | Location | Responsibility |
|-----------|----------|----------------|
| N-gram utilities | Shared Library | Text analysis functions |
| State management | Shared Library | Initialization, cleanup |
| Health analysis | Shared Library | Memory/WorldInfo diagnostics |
| Command processing | Input Modifier | User interface |
| Input analysis | Input Modifier | Simple input detection |
| Diversity injection | Context Modifier | Verbalized sampling, Author's Notes |
| Context pruning | Context Modifier | Repetitive content removal |
| Repetition detection | Output Modifier | Scoring and issue identification |
| User feedback | Output Modifier | Alerts and recommendations |
| Auto-filtering | Output Modifier | Duplicate removal |

This separation allows users to adopt components incrementally—starting with just the Output Modifier for monitoring, then adding Context Modifier for active intervention, and finally the full system for comprehensive protection.

---

## Conclusion: Effective diversity within constraints

While AI Dungeon's scripting environment cannot directly manipulate sampling parameters, the combination of **verbalized sampling prompts**, **dynamic Author's Notes**, **n-gram tracking**, **blocked phrase injection**, and **context rotation** creates a comprehensive anti-mode-collapse system that operates through the tools available.

The key insight is that repetition prevention becomes a feedback loop: detect repetition → inject stronger diversity requests → track whether repetition decreases → adjust intervention strength. This closed-loop approach adapts to both model behavior and individual adventure characteristics without requiring parameter access.

Users implementing this blueprint should start with the basic Output Modifier for monitoring, observe their specific repetition patterns, then progressively enable Context Modifier interventions tuned to their needs. The command interface provides runtime control without requiring script edits, making the system accessible to non-technical users while offering full customization for those who want it.