# Avoiding Mode Collapse in Small Language Models: A Complete Technical Guide

**For small language models in the 12-70B parameter range, preventing mode collapse requires a multi-layered approach combining inference-time sampling techniques with training-time interventions.** The most effective and lightweight methods include **min-p sampling** (breakthrough from 2024 maintaining coherence at high temperatures), **verbalized sampling** (training-free prompting achieving 1.6-2.1x diversity gains), and strategic combinations of temperature, top-k, and top-p filtering. JavaScript ES5 environments can implement these techniques efficiently using numerically stable softmax and typed arrays for performance.

Mode collapse—where models generate repetitively or favor narrow response modes—is increasingly understood as a data-level problem exacerbated by RLHF alignment (which reduces diversity by 1.6-2.1x according to 2025 research). Smaller models are particularly vulnerable due to limited capacity to represent full probability distributions. This guide covers everything from fundamental sampling parameters to cutting-edge techniques developed in 2023-2025.

---

## Core sampling techniques provide the foundation

**Temperature scaling** is the simplest intervention, dividing logits by temperature T before softmax. Lower temperatures (0.1-0.3) produce deterministic outputs for factual tasks; higher temperatures (0.8-1.5) increase diversity for creative work. The critical insight: **smaller models have lower "mutation temperatures"** where significant behavioral changes occur, requiring more conservative settings for factual tasks.

| Task Type | Temperature | Notes |
|-----------|-------------|-------|
| Factual Q&A, code | 0.1-0.3 | Near-deterministic |
| Technical writing | 0.3-0.5 | Controlled variation |
| General chat | 0.5-0.7 | Balanced |
| Creative writing | 0.8-1.2 | Higher diversity |

**Top-k sampling** truncates the vocabulary to the k most probable tokens before sampling. Recommended k=50 for chat applications, k=10 for code generation. The limitation: fixed truncation doesn't adapt to varying model confidence across contexts. When the model is highly confident, k tokens may represent nearly all probability mass; when uncertain, k tokens may include improbable candidates.

**Top-p (nucleus) sampling** addresses this by dynamically selecting tokens whose cumulative probability reaches threshold p. With p=0.9, the "nucleus" expands when the model is uncertain and contracts when confident. Research shows **p=0.9-0.95 works well across tasks**, with top-p generally preferred over top-k for its adaptive behavior.

Computational overhead for all three techniques is negligible—temperature requires only division, top-k requires sorting, and top-p adds cumulative summation. Apply in order: **temperature → top-k → top-p → sample**.

---

## Min-p sampling represents the most significant recent advancement

Published in July 2024, **min-p sampling** sets a dynamic truncation threshold relative to the top token's probability: `threshold = p_base × p_max`. This elegant formulation maintains coherence even at high temperatures (1.5-2.0) where top-p fails.

The key advantage: when the model is confident (high p_max), more tokens get filtered out; when uncertain (low p_max), more diversity is permitted. Testing across Mistral 7B and Llama models from 1B to 123B parameters showed consistent improvements. On EQ-Bench Creative Writing, min-p with temperature 1.5 and p_base=0.1 scored **62 versus baseline 51.5**.

**Recommended settings**: p_base=0.05-0.1 for most tasks. At p_base=0.1, min-p filters any token with probability less than 10% of the most likely token's probability. This has been adopted by **54,000+ GitHub repositories** and integrated into Hugging Face Transformers, vLLM, and llama.cpp.

Min-p's computational overhead is minimal—just multiplication and comparison operations vectorized across the vocabulary. For JavaScript implementation, it requires only one additional line after computing probabilities.

---

## Verbalized sampling circumvents mode collapse through prompting

The most innovative training-free technique from October 2025, **verbalized sampling** reformulates prompts to explicitly request probability distributions rather than single outputs:

```
Generate 5 responses to the user query, each within a separate <response> tag.
Each <response> must include a <text> and a numeric <probability>.
Please sample at random from the tails of the distribution, such that the 
probability of each response is less than 0.10.
```

The model verbalizes multiple responses with probabilities, then you sample from this distribution—particularly from low-probability tails. Results show **1.6-2.1x diversity improvement** over direct prompting in creative writing tasks, with more capable models benefiting more from the technique.

This approach has zero computational overhead at inference (beyond generating multiple responses) and is orthogonal to temperature—you can combine both. The underlying insight: different prompt formulations collapse to different modes, and prompts requesting distributions better approximate the diverse distribution learned during pretraining.

---

## Repetition penalties complement sampling techniques

Three penalty mechanisms target repeated tokens directly:

**Frequency penalty** scales with token count: `logit_penalty = frequency_penalty × count(token)`. Use values 0.5-1.0 for creative tasks, with 0.7 as a balanced default. **Presence penalty** applies a flat penalty after any token appears once—better for forcing vocabulary diversity. Both range from -2.0 to 2.0 in most APIs.

**N-gram blocking** (`no_repeat_ngram_size`) prevents exact sequence repetition. Setting `no_repeat_ngram_size=2` blocks any 2-gram from appearing twice. **Caution**: this can cause issues with proper nouns ("New York" can only appear once).

The newest approach, **LZ penalty** (2025), uses information-theoretic compression principles with sliding window n-gram statistics. It's more surgical than frequency/presence penalties and enables greedy decoding for reasoning models without degeneration—particularly valuable for long reasoning traces where standard penalties fail.

---

## Mirostat and typical sampling use feedback control

**Mirostat** (ICLR 2021) is an adaptive top-k algorithm using feedback control to maintain target perplexity. The core finding: **cross-entropy has near-linear relation with repetition**. By controlling perplexity, you control repetitions automatically.

Set target surprise τ ≈ 3.0-4.0 for focused output, 5.0-7.0 for creative diversity. Mirostat avoids both the "boredom trap" (low k causes repetition) and "confusion trap" (high k causes incoherence). No per-task tuning required once τ is set, though it carries moderate computational overhead for the feedback loop.

**Typical sampling** takes an information-theoretic approach: humans produce text where each word's information content stays close to the conditional entropy. The truncation keeps tokens whose negative log-probability is within range τ of the expected entropy—avoiding both highly unlikely AND overly generic tokens. Typical τ=0.2-0.5 works for story generation.

---

## Contrastive decoding improves factuality at higher cost

**Contrastive decoding** (ACL 2023) computes: `score = log P_expert(token) - log P_amateur(token)`, exploiting that failures (repetition, incoherence) are even more prevalent in smaller models. The difference signals preferred outputs.

The practical limitation: loading two models requires significant memory. **DoLa** (ICLR 2024) addresses this by contrasting between early and final layers of the same model—no separate amateur needed. **DCD** (2024) uses dropout or quantization as the "amateur" version, further reducing overhead.

For 12-70B models, DoLa is most practical: it improves factuality without external retrieval or additional models, requiring only dual forward passes through different layer depths.

---

## Training-time techniques prevent mode collapse at the source

**RLHF causes significant diversity reduction**—alignment through reward-based fine-tuning (DPO/PPO) causes dramatic decreases in output diversity even when next-token entropy barely changes. SFT is primarily responsible for drops in next-token prediction diversity; DPO adds large output-level diversity drops. Industrially fine-tuned models exhibit far lower diversity than research versions.

**KL divergence penalty type matters**. Reverse KL (standard in DPO) causes "mode-seeking" behavior that collapses into single modes. **Forward KL or Jensen-Shannon divergence** maintains broader solution coverage. The 2024 **DPH-RL** framework uses mass-covering f-divergences as a "rehearsal mechanism" forcing broad coverage, resolving Pass@k degradation while improving Pass@1.

**Practical training recommendations**:
- Use dropout (start 20%, may need higher for larger models)—remarkably effective for multi-epoch training
- Implement label smoothing, but verify the model isn't already under-confident
- Maintain at least 25-30% high-quality human content in training data
- Use small but non-zero KL penalty with entropy-preserving strategies
- Periodically reset reference policy during prolonged training

**LoRA fine-tuning**: contrary to expectations, LoRA does NOT mitigate catastrophic forgetting. It "learns less and forgets less"—good for instruction fine-tuning but poor for domain adaptation. The low-rank constraint limits adaptation to completely new domains.

---

## JavaScript ES5 implementation requires careful numerical handling

The core challenge is implementing numerically stable softmax. `Math.exp(x)` overflows for x > ~709. **Always subtract the maximum logit before exponentiating**:

```javascript
function softmax(logits) {
  var maxLogit = -Infinity;
  var i;
  for (i = 0; i < logits.length; i++) {
    if (logits[i] > maxLogit) maxLogit = logits[i];
  }
  
  var expValues = [];
  var sumExp = 0;
  for (i = 0; i < logits.length; i++) {
    var expVal = Math.exp(logits[i] - maxLogit);
    expValues.push(expVal);
    sumExp += expVal;
  }
  
  var probs = [];
  for (i = 0; i < expValues.length; i++) {
    probs.push(expValues[i] / sumExp);
  }
  return probs;
}
```

**ES5-specific patterns**: use `var` instead of `let/const`, regular functions instead of arrow functions, `Array.prototype.slice.call()` instead of spread operators. Avoid `Math.max.apply(Math, arr)` for large arrays (stack overflow)—use loops instead.

**Use Float32Array for large vocabularies**—50% memory savings over standard arrays, up to 2x faster for numerical operations due to contiguous memory. For vocabulary sizes of 32K-100K tokens, this significantly reduces memory pressure:

```javascript
var logits = new Float32Array(vocabularySize);  // 4 bytes per element vs 8
```

---

## Complete lightweight sampler for ES5 environments

```javascript
var LightSampler = function(options) {
  options = options || {};
  this.temperature = options.temperature !== undefined ? options.temperature : 0.8;
  this.topK = options.topK || 40;
  this.topP = options.topP || 0.9;
  this.minP = options.minP || 0.1;
};

LightSampler.prototype.sample = function(logits) {
  var i, maxIdx, maxVal, threshold;
  
  // Apply temperature
  var scaled = [];
  for (i = 0; i < logits.length; i++) {
    scaled.push(logits[i] / this.temperature);
  }
  
  // Stable softmax
  maxVal = -Infinity;
  for (i = 0; i < scaled.length; i++) {
    if (scaled[i] > maxVal) maxVal = scaled[i];
  }
  
  var probs = [];
  var sumExp = 0;
  for (i = 0; i < scaled.length; i++) {
    var exp = Math.exp(scaled[i] - maxVal);
    probs.push(exp);
    sumExp += exp;
  }
  for (i = 0; i < probs.length; i++) {
    probs[i] /= sumExp;
  }
  
  // Min-p filtering
  var maxProb = 0;
  for (i = 0; i < probs.length; i++) {
    if (probs[i] > maxProb) maxProb = probs[i];
  }
  threshold = this.minP * maxProb;
  
  var filtered = [];
  for (i = 0; i < probs.length; i++) {
    if (probs[i] >= threshold) {
      filtered.push({ index: i, prob: probs[i] });
    }
  }
  
  // Sort for top-k and top-p
  filtered.sort(function(a, b) { return b.prob - a.prob; });
  
  // Apply top-k
  if (this.topK > 0 && filtered.length > this.topK) {
    filtered = filtered.slice(0, this.topK);
  }
  
  // Apply top-p
  var cumSum = 0;
  var nucleus = [];
  for (i = 0; i < filtered.length; i++) {
    nucleus.push(filtered[i]);
    cumSum += filtered[i].prob;
    if (cumSum >= this.topP) break;
  }
  
  // Renormalize and sample
  var total = 0;
  for (i = 0; i < nucleus.length; i++) total += nucleus[i].prob;
  
  var r = Math.random() * total;
  cumSum = 0;
  for (i = 0; i < nucleus.length; i++) {
    cumSum += nucleus[i].prob;
    if (r < cumSum) return nucleus[i].index;
  }
  return nucleus[nucleus.length - 1].index;
};
```

---

## Comparative effectiveness and practical recommendations

| Technique | Overhead | Best For | Key Parameters |
|-----------|----------|----------|----------------|
| Temperature | Negligible | Basic diversity control | 0.7-0.8 general, 0.1-0.3 factual |
| Top-p | Low | Adaptive truncation | p=0.9-0.95 |
| Min-p | Negligible | High-temp coherence | p_base=0.05-0.1 |
| Verbalized Sampling | None* | Maximum diversity | k=5 responses |
| Mirostat | Moderate | Long-form generation | τ=3-5 |
| Repetition penalty | Low | Breaking loops | 1.0-1.2 |
| DoLa | Medium | Factuality | α=0.1 |

*Verbalized sampling has prompting overhead, not computational overhead.

**For 12-70B models specifically**: smaller models require more conservative temperature settings for factual tasks but can match larger models when fine-tuned. Testing on Pythia models (70M to 2.8B) showed smaller models maintain less token distribution coverage after fine-tuning. Use temperature 0.6-0.8 with top-p 0.9-0.95 and min-p 0.05-0.1 as a robust baseline.

**Recommended JavaScript libraries**: node-llama-cpp for Node.js (full sampling parameter support including min-p and mirostat), Wllama for WebAssembly compatibility in browsers, or WebLLM for WebGPU-enabled environments with best performance.

---

## Conclusion

Preventing mode collapse in small language models combines **inference-time sampling** (min-p, temperature, top-p, repetition penalties) with **prompting strategies** (verbalized sampling) and, when applicable, **training-time interventions** (forward-KL regularization, dropout, diverse training data). The 2024-2025 advances—particularly min-p sampling and verbalized sampling—represent practical breakthroughs that are easy to implement and effective.

For JavaScript ES5 environments, all core techniques translate directly with attention to numerical stability and memory efficiency via typed arrays. The complete sampler implementation above provides a production-ready starting point combining temperature, min-p, top-k, and top-p in the recommended order.

The key insight from recent research: mode collapse is fundamentally a data-level problem driven by typicality bias in human preferences and exacerbated by RLHF alignment. Inference-time techniques mitigate symptoms; addressing root causes requires attention to training data diversity and KL divergence formulation during fine-tuning.