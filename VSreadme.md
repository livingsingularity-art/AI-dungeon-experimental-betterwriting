# Verbalized Sampling: Improving AI Writing 🧪

This project is an independent adaptation of the Verbalized Sampling (VS) research, exploring how to make AI narrators more creative—**with science**.

---

## 🧩 Problem

Ask your favorite LLM for a joke about coffee.  
☕ Open a new chat and ask again.  
You’ll probably get the same one.

That’s **mode collapse**—when models keep choosing the most typical answer until every path feels the same.

It happens because of **human typicality bias**.  
During A/B testing, we tend to reward familiar phrasing over odd but valid alternatives.  
Over time, this nudges models toward safe, predictable text.

This lack of diversity forces us to battle clichés and predictable tropes, burying the unique voices the AI could otherwise produce.

---

## 🔬 Verbalized Sampling (VS)

**Verbalized Sampling** is a simple idea:  
Ask the model to explicitly imagine multiple possible responses and assign each a probability, e.g.:

> “Generate 5 coffee jokes with their corresponding probabilities.”

Then, sample from the *less likely* candidates.

Research shows VS increases creative diversity by **1.6–2.1×** in creative writing tasks.  
You can read the paper here:  
[Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity](https://arxiv.org/html/2510.01171v3)

---

## 🎮 About This Script

This AI Dungeon script attempts to replicate those positive results in-game.  
It only injects the instruction block at the **very end** of the prompt.

[AI Dungeon Scenario Example](https://play.aidungeon.com/scenario/4iv6BegZVMg8/improving-ai-writing-verbalized-sampling?share=true)


---

## Disclaimer

This is a fan-made adaptation of the *Verbalized Sampling* research.  
No lab scientists were harmed in the making of this experiment.  
Please support the official release—err, research 🧠💫