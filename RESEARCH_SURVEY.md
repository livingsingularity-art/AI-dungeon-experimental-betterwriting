# Research Survey: Improving Creative Writing Capabilities of LLMs
## Comprehensive Literature Review (2024-2025)

**Date:** 2025-11-11
**Focus:** Techniques, methods, and recent advances in enhancing LLM creative writing

---

## 📊 Executive Summary

Recent research (2024-2025) has identified multiple approaches to improving LLM creative writing capabilities, with key advances in:

1. **Diversity Enhancement** - Verbalized Sampling, DDPO/DORPO training
2. **Mode Collapse Mitigation** - Training-free prompting strategies
3. **Sampling Methods** - Temperature, top-k, nucleus sampling optimization
4. **Constraint-Based Generation** - Balancing coherence and creativity
5. **Prompt Engineering** - Structured techniques for storytelling

**Key Finding:** Combining multiple techniques (sampling + prompting + constraints) yields the best results for creative writing tasks.

---

## 1. Mode Collapse & Diversity Enhancement

### 🔬 Verbalized Sampling (Zhang et al., 2025)

**Paper:** arXiv:2510.01171 - "Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity"

**Problem Identified:**
- Post-training alignment reduces LLM diversity
- **Typicality bias** in preference data: annotators systematically favor familiar text
- Cognitive psychology finding: humans reward "typical" answers over valid alternatives
- Result: Mode collapse where models produce same responses repeatedly

**Solution:**
```
Instead of: "Tell me a joke about coffee"
VS Prompt:  "Generate 5 jokes about coffee with their corresponding
             probabilities. Sample from p<0.10 (unlikely responses)."
```

**Results:**
- **1.6-2.1× diversity increase** in creative writing tasks
- **2-3× overall diversity improvement** while maintaining quality
- No degradation in factual accuracy or safety
- **Training-free** - works via prompting alone

**Implementation:**
- Model verbalizes probability distribution over responses
- Relieves pressure to produce single "typical" answer
- Sample from tail of distribution (low-probability responses)
- Model-agnostic: works with GPT, Claude, Gemini, Llama

**GitHub:** https://github.com/CHATS-lab/verbalized-sampling

---

### 🎯 DDPO & DORPO (Midjourney + NYU, 2024)

**Papers:** New training techniques for diversity

**Approach:**
- **Diversified Direct Preference Optimization (DDPO)**
- **Diversified Odds Ratio Preference Optimization (DORPO)**
- Training LLMs with diversity-focused objectives

**Results:**
- Expands range of possible outputs
- Maintains coherence and readability
- Requires retraining (not inference-time)

**Key Insight:** Training objectives matter - optimizing for diversity during training yields creative models.

---

### 📈 NoveltyBench (2025)

**Paper:** arXiv:2504.05228v2 - "NoveltyBench: Evaluating Language Models for Humanlike Diversity"

**Evaluation Strategies:**
- Resampling techniques
- Paraphrasing methods
- System prompts for creativity
- In-context regeneration

**Focus:** Measuring human-like diversity in outputs, not just raw variation.

---

### 🌊 Diversified Sampling (2025)

**Paper:** arXiv:2502.11027v1 - "Diversified Sampling Improves Scaling LLM inference"

**Method:**
- **Prompt perturbations** that modify prompt distribution
- Encourages diverse candidate solutions
- Improves best-of-N selection quality

**Theory:**
- Increased diversity reduces error rates **linearly** with number of diverse prompts
- Mathematical proof of diversity → quality relationship

---

## 2. Sampling Methods & Parameters

### 🌡️ Temperature

**Function:** Controls randomness in token selection

**How it Works:**
- Redistributes probabilities of possible tokens
- Reduces probability of common tokens
- Increases probability of rare tokens

**For Creative Writing:**
- **Low (0.2-0.5):** Focused, coherent, predictable
- **Medium (0.7-0.9):** Balanced creativity and coherence
- **High (1.0-1.5):** Highly creative, surprising, less coherent

**Best Practice:** 0.8-1.2 for most creative writing tasks

---

### 🔝 Top-k Sampling

**Function:** Limits token selection to top k most probable tokens

**How it Works:**
- Sorts tokens by probability
- Keeps only top k tokens
- Redistributes probability among them

**For Creative Writing:**
- **Low (1-10):** Very focused, limited creativity
- **Medium (20-50):** Balanced
- **High (50-100):** More variation, useful for creative contexts

**Best Practice:** k=50 for creative writing

---

### 🎯 Top-p (Nucleus Sampling)

**Function:** Dynamic selection based on cumulative probability

**How it Works:**
- Sums probabilities in descending order
- Stops when cumulative sum reaches p
- Adapts to context (variable number of tokens)

**Advantages:**
- More dynamic than top-k
- Context-adaptive
- **Preferred for creative applications**

**For Creative Writing:**
- **Low (0.7-0.85):** More focused
- **Medium (0.9-0.95):** Recommended for creativity
- **High (0.95-0.99):** Maximum diversity

**Best Practice:** p=0.9-0.95 for creative writing

---

### ⚖️ Balancing Diversity and Risk

**Research Finding:** Trade-offs exist at each decoding step

**Framework:**
1. Estimate intrinsic model capacity
2. Balance diversity vs. quality via temperature tuning
3. Use tail truncation (top-k/top-p) to limit extremes

**Recommendation:**
```
Creative Writing Optimal Settings:
- Temperature: 0.9
- Top-p: 0.92
- Top-k: 50
- Combine all three for best results
```

**Key Insight:** Temperature and nucleus sampling are **orthogonal** - use both together.

---

## 3. Decoding Strategies

### 📉 Greedy Decoding

**Method:** Always select most probable token

**Results:**
- Most coherent
- Least creative
- **Not recommended for creative writing**

**Use Case:** Translation, summarization where accuracy matters

---

### 🔍 Beam Search

**Method:** Keep k most likely sequences at each step

**Advantages:**
- More nuanced than greedy
- Finds high-probability sequences

**Limitations for Creative Writing:**
- Over-optimizes for likelihood
- Leads to **repetitive outputs** (degeneration)
- Narrow vocabulary
- Lacks variation of human text

**Research Finding:** "Beam outputs, while high-probability, lack the variation of human text, often repeating phrases."

**Recommendation:** **Avoid beam search for creative writing** - use sampling methods instead

---

### 🎲 Sampling-Based Decoding

**Method:** Top-k and nucleus (top-p) sampling

**Advantages:**
- Variability and diversity
- More creative output
- Preferred for open-ended generation

**Best Practice:**
```
Creative Task → Sampling (top-k/top-p)
Summarization → Beam search
Translation → Greedy or beam search
```

---

## 4. Prompt Engineering for Creative Writing

### 🎭 Role-Playing Technique

**Method:**
```
"You are [famous author/expert]. Write a story about [topic]."
```

**Examples:**
- "You are Ray Bradbury. Write about space exploration."
- "You are a Pulitzer Prize-winning novelist. Continue this story..."

**Benefit:** Leverages model's knowledge of specific styles and perspectives

---

### 🎨 Style Emulation

**Method:**
```
"Write [content] in the style of [famous person/work]"
```

**Examples:**
- "in the style of Ernest Hemingway"
- "in the style of film noir"
- "in the style of Victorian poetry"

---

### 📝 C.R.E.A.T.E. Framework

**Structured approach for creative prompts:**

**C - Character:** Define the role AI assumes
```
"You are a creative writing professor..."
```

**R - Request:** Clearly define the request
```
"...write a short story about..."
```

**E - Extras:** Provide reference text or examples
```
"...similar to this example: [reference]"
```

**A - Additions:** Refine with POV or style
```
"...using first-person perspective, metaphorical language..."
```

**T - Type of Output:** Specify format
```
"...500 words, three paragraphs..."
```

**E - Extras:** Additional constraints
```
"...must include these elements: [list]"
```

---

### 💃 Dancing Technique (Conflict + Context)

**Method:** Alternate between revealing conflict and context

**Structure:**
```
Conflict revealed → Context provided → Deeper conflict → More context → Resolution
```

**Benefit:** Creates engaging narrative rhythm, maintains tension

---

## 5. Constraint-Based Generation

### 🏗️ Coherence Without Repetition

**Paper:** arXiv:2504.11986 - "Large Language Models as Quasi-crystals"

**Concept:** LLMs as **quasicrystals**
- Global coherence without periodic repetition
- Generated through local constraints
- Constraint-based organization without repetition

**Implication:** Constraints can **enhance** rather than limit creativity

---

### 📚 Long-Form Constrained Generation

**Paper:** arXiv:2502.12568 - "A Cognitive Writing Perspective for Constrained Long-Form Text Generation"

**Challenge:** LLMs struggle with long-form text under complex constraints

**Cognitive Balance Required:**
- Local coherence (sentence-to-sentence)
- Global structure (overall narrative arc)

**Solution - CogWriter:**
- Enhances instruction-compliant long-form text
- No additional training required
- Maintains both local and global coherence

---

### 🎲 Discrete Diffusion for Constraints

**Paper:** arXiv:2503.09790v1 - "Constrained Language Generation with Discrete Diffusion Models"

**Method:**
- Discrete diffusion + structured constraints
- Impose constraints at every denoising step
- Preserves creativity and expressiveness

**Results:**
- High fidelity in meeting requirements
- Maintains fluency
- Preserves semantic coherence

**Key Insight:** Can enforce hard constraints without sacrificing creativity

---

### 🧮 Constraint Propagation + LLMs

**Paper:** arXiv:2505.24012 - "Large Language Model Meets Constraint Propagation"

**Approach:** Combine LLMs with constraint programming

**Benefits:**
- Linguistic coherence (from LLM)
- Strict constraint satisfaction (from CP)
- Addresses limitations of pure autoregressive generation

---

### 🎯 CS4 Creativity Benchmark

**Paper:** arXiv:2410.04197v1 - "CS4: Measuring the Creativity of Large Language Models Automatically"

**Method:** Measure creativity by controlling number of story-writing constraints

**Metrics:**
- Coherence scores
- Instruction satisfaction ratios
- Creativity under increasing constraints

**Finding:** More constraints doesn't always reduce creativity - it depends on constraint type

---

## 6. Top LLM Models for Creative Writing (2025)

### 🥇 Tier 1: Most Creative

**Claude (Anthropic)**
- **Sonnet 4.5** and **Opus 4.1**
- "Most soul in their writing"
- Excel at: Vivid characters, consistent narrative, engaging voice
- Best for: Fiction, character-driven stories

**Muse by Sudowrite**
- Trained purely on outstanding fiction and creative prose
- Writes with: Real emotion, rhythm, voice
- Best for: Literary fiction, prose with artistic merit

**Qwen3-235B-A22B** (Open Source)
- Outstanding creative capabilities
- Strong human preference alignment
- Best for: Open-ended creative tasks

---

### 🥈 Tier 2: Well-Rounded

**Gemini 2.5 Pro**
- Most well-rounded for writers
- Strengths: Precision, reasoning, detailed outputs
- Best for: SEO content, essays, research writing

**DeepSeek-V3** (Open Source)
- Strong creative capabilities
- Good balance of creativity and coherence

---

### 🥉 Tier 3: Specialized

**Qwen3-14B** (Open Source)
- Smaller model with good creative output
- Efficient for resource-constrained environments

---

## 7. Advanced Techniques

### 🔄 Hierarchical Expansion

**Method:** Generate long-form content hierarchically

**Process:**
1. Generate high-level outline
2. Expand each section
3. Fill in details at lowest level
4. Maintain coherence across levels

**Benefit:** Better global coherence in long texts

---

### 🔁 Iterative Refinement

**Method:** Multiple passes with feedback

**Process:**
1. Generate initial draft (high temperature)
2. LLM acts as critic - identifies issues
3. Revise based on feedback
4. Repeat until quality threshold met

**Benefit:** Cognitive offloading - LLM handles both generation and critique

---

### 🎛️ Test-Time Compute

**Concept:** Spend more compute at inference time for better results

**Methods:**
- Generate multiple candidates (best-of-N)
- Self-consistency checking
- Iterative refinement
- Diversified sampling + selection

**Finding:** Inference-time compute scaling can match training-time improvements

---

## 8. Key Research Insights

### 💡 Critical Findings

1. **Mode Collapse is Real**
   - Caused by typicality bias in human feedback
   - Post-training alignment reduces diversity
   - Requires active mitigation strategies

2. **Sampling > Beam Search for Creativity**
   - Beam search optimizes for likelihood → repetition
   - Sampling methods produce human-like variation
   - Different tasks need different strategies

3. **Temperature + Top-p are Orthogonal**
   - Use both together for best results
   - Temperature affects distribution shape
   - Top-p performs dynamic truncation

4. **Constraints Can Enhance Creativity**
   - Properly designed constraints force novel solutions
   - Too few constraints → generic output
   - Too many constraints → reduced creativity
   - Sweet spot depends on constraint type

5. **Training-Free Methods Work**
   - Verbalized Sampling: 2-3× diversity with no retraining
   - Prompt engineering achieves significant improvements
   - Inference-time techniques are practical

6. **Diversity ≠ Quality**
   - Must balance both
   - Pure diversity leads to incoherence
   - Pure quality leads to repetition
   - Optimal zone: high diversity + high quality

---

## 9. Practical Recommendations

### ✅ Best Practices for Creative Writing

**1. Sampling Configuration**
```javascript
{
    temperature: 0.9,
    top_p: 0.92,
    top_k: 50,
    presence_penalty: 0.1,  // Discourage repetition
    frequency_penalty: 0.1   // Encourage novelty
}
```

**2. Prompting Strategy**
```
Combine:
- Role-playing ("You are Ray Bradbury...")
- Style guidance ("Write with metaphorical language...")
- Verbalized Sampling instruction (force 5 alternatives)
- Specific constraints (word count, themes, etc.)
```

**3. Iterative Refinement**
```
Pass 1: High creativity (temp=1.2, top_p=0.95)
Pass 2: LLM critique and identify issues
Pass 3: Focused revision (temp=0.7, top_p=0.9)
```

**4. Quality Control**
```
- Check for repetition (n-gram diversity)
- Verify constraint satisfaction
- Measure coherence
- Regenerate if below threshold
```

---

### 🔧 Implementation Stack

**Minimal Stack (Inference Only):**
```
1. Verbalized Sampling prompting
2. Temperature = 0.9, Top-p = 0.92
3. Repetition checking (n-gram analysis)
4. Best-of-3 selection
```

**Full Stack (Maximum Quality):**
```
1. Verbalized Sampling
2. Optimal sampling parameters
3. Bonepoke-style quality analysis
4. Dynamic constraint injection
5. Iterative refinement
6. Hierarchical expansion (for long-form)
7. Best-of-N with diversity scoring
```

---

## 10. Open Research Questions

### 🤔 Unresolved Issues

1. **Optimal Verbalized Sampling Parameters**
   - Best k (number of candidates)?
   - Best tau (probability threshold)?
   - Task-dependent vs universal?

2. **Constraint Design**
   - What types of constraints enhance creativity?
   - What types reduce it?
   - How many constraints is optimal?

3. **Quality Metrics**
   - Better automatic evaluation needed
   - Human preference vs algorithmic diversity
   - How to measure "soul" or "voice"?

4. **Long-Form Coherence**
   - Maintaining global structure over 10k+ words
   - Character consistency
   - Plot logic

5. **Style Transfer Fidelity**
   - How accurately can LLMs mimic specific authors?
   - Legal/ethical implications
   - Originality vs imitation

---

## 11. Comparison with Our Implementation

### ✅ What We Already Have

| Technique | Implementation | Status |
|-----------|---------------|--------|
| **Verbalized Sampling** | ✅ Full implementation | k=5, tau=0.10 |
| **Quality Analysis** | ✅ Bonepoke Protocol | 5 categories |
| **Constraint Injection** | ✅ Dynamic story cards | Context-aware |
| **Repetition Detection** | ✅ Fatigue tracking | Threshold=5 |
| **Regeneration** | ✅ Quality-gated | Max 2 attempts |
| **Adaptive Parameters** | ✅ Context-aware VS | Dialogue/action/description |

### 🔄 What We Could Add

| Technique | Potential Benefit | Complexity |
|-----------|------------------|------------|
| **Best-of-N Selection** | Choose best from multiple outputs | Medium |
| **Iterative Refinement** | Multi-pass improvement | Medium |
| **Hierarchical Expansion** | Better long-form coherence | High |
| **Constraint Propagation** | Stricter constraint satisfaction | High |
| **Style Transfer Prompts** | Better author emulation | Low |
| **Test-Time Compute** | Quality scaling with inference | Medium |

---

## 12. Key Papers by Category

### Mode Collapse & Diversity
1. Zhang et al. (2025) - Verbalized Sampling [arXiv:2510.01171]
2. NoveltyBench (2025) [arXiv:2504.05228v2]
3. Diversified Sampling (2025) [arXiv:2502.11027v1]

### Sampling Methods
4. Balancing Diversity and Risk in LLM Sampling
5. Generation Configurations (Huyenchip, 2024)

### Decoding Strategies
6. Decoding Strategies in Large Language Models (HuggingFace)
7. Text Generation Strategies (Transformers Documentation)

### Constraint-Based Generation
8. LLMs as Quasi-crystals (2025) [arXiv:2504.11986]
9. Cognitive Writing Perspective (2025) [arXiv:2502.12568]
10. Constrained Discrete Diffusion (2025) [arXiv:2503.09790v1]
11. LLM + Constraint Propagation (2025) [arXiv:2505.24012]
12. CS4 Creativity Benchmark (2024) [arXiv:2410.04197v1]

### Controllable Generation
13. Controllable Text Generation Survey (2024) [arXiv:2408.12599]
14. Controllable Neural Text Generation (Lilian Weng)

### Creative Writing Models
15. Weaver: Foundation Models for Creative Writing (2024) [arXiv:2401.17268]

---

## 13. Tools & Frameworks

### Open Source
- **verbalized-sampling** (GitHub: CHATS-lab)
- **Transformers** (HuggingFace) - Built-in sampling methods
- **LangChain** - Chains with VS integration

### Commercial
- **Sudowrite** (Muse) - Fiction-focused
- **Claude** (Anthropic) - Best character/narrative
- **Gemini Pro** - Well-rounded

### Research Benchmarks
- **NoveltyBench** - Diversity evaluation
- **CS4** - Creativity measurement
- **Writing Benchmark** (GitHub: lechmazur)

---

## 14. Conclusion

### Key Takeaways

1. **Diversity is solvable** - Verbalized Sampling shows 2-3× improvement with no training
2. **Sampling matters** - Right parameters (temp, top-p) crucial for creativity
3. **Constraints help** - Proper constraints force novelty without reducing coherence
4. **Multiple techniques stack** - Combining VS + sampling + constraints yields best results
5. **Inference-time optimization works** - Don't need retraining to improve creativity

### Our Implementation Status

Our current script set (v2.1.1) already implements many cutting-edge techniques:
- ✅ Verbalized Sampling (research-recommended parameters)
- ✅ Quality-gated regeneration (Bonepoke Protocol)
- ✅ Dynamic constraint injection
- ✅ Adaptive parameters
- ✅ Repetition detection and mitigation

**We are ahead of most production systems** in implementing recent research findings.

### Future Directions

1. **Add best-of-N selection** - Generate 3 outputs, pick best
2. **Implement iterative refinement** - Multi-pass improvement
3. **Explore hierarchical expansion** - Better long-form structure
4. **Experiment with different VS parameters** - A/B test k and tau values
5. **Add style transfer prompts** - Better author emulation

---

**Report Compiled:** 2025-11-11
**Papers Reviewed:** 15+ recent publications (2024-2025)
**Focus:** Practical techniques for enhancing LLM creative writing
**Status:** Current with latest research as of November 2025
