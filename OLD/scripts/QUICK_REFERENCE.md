# Quick Reference Card

## 🚀 Installation (5 minutes)

1. **Shared Library** → Paste `sharedLibrary.js` → Save
2. **Scripts > Input** → Paste `input.js` → Save
3. **Scripts > Context** → Paste `context.js` → Save
4. **Scripts > Output** → Paste `output.js` → Save
5. **Settings** → Enable **Memory Bank** → Save

## ⚙️ Quick Config

Edit `CONFIG` object at top of `sharedLibrary.js`:

### Presets

**Balanced (Recommended Start):**
```javascript
vs: { enabled: true, k: 5, tau: 0.10, adaptive: false }
bonepoke: { enabled: true, fatigueThreshold: 3, qualityThreshold: 2.5 }
```

**Maximum Diversity:**
```javascript
vs: { enabled: true, k: 7, tau: 0.08, adaptive: true }
bonepoke: { enabled: true, fatigueThreshold: 3, qualityThreshold: 3.0 }
```

**Lightweight (VS Only):**
```javascript
vs: { enabled: true, k: 5, tau: 0.10 }
bonepoke: { enabled: false }
```

## 🎮 Usage

Works automatically! Just play normally.

### Enable Debug Mode

```javascript
vs: { debugLogging: true }
bonepoke: { debugLogging: true }
```

Console shows:
```
ℹ️ VS adapted: k=7, tau=0.12
✅ Output quality: good (3.42)
⚠️ Fatigue detected: door (5x)
```

## 🔧 Key Parameters

| Parameter | Purpose | Range | Recommended |
|-----------|---------|-------|-------------|
| **k** | VS candidates | 3-10 | 5 |
| **tau** | VS probability threshold | 0.05-0.20 | 0.10 |
| **fatigueThreshold** | Word repetition limit | 2-5 | 3 |
| **qualityThreshold** | Min score for output | 1.0-5.0 | 2.5 |
| **maxRegenAttempts** | Regeneration limit | 0-3 | 2 |

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Cannot modify storyCards"** | Enable Memory Bank in settings |
| **Too many regenerations** | Lower qualityThreshold to 2.0 |
| **Not diverse enough** | Lower tau to 0.08, increase k to 7 |
| **Too chaotic** | Raise tau to 0.15, lower k to 3 |
| **Script errors** | Verify entire file copied, check for `void 0` at end |

## 📊 Check Analytics

In console:
```javascript
log(Analytics.getSummary())
```

Output:
```javascript
{
  totalOutputs: 47,
  regenerations: 3,
  regenRate: "6.4%",
  fatigueRate: "12.8%",
  driftRate: "4.3%"
}
```

## 🎯 What Each Script Does

| Script | Purpose |
|--------|---------|
| **sharedLibrary.js** | Core utilities (VS, Bonepoke, analytics) |
| **input.js** | Pre-process player input (fix say actions) |
| **context.js** | Inject VS, apply dynamic corrections |
| **output.js** | Analyze quality, regenerate if poor, clean formatting |

## 📈 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| **Vocabulary** | 1,200 words | 2,400+ words |
| **Distinct-3** | 0.42 | 0.80+ |
| **Repetition** | Common | Rare |
| **Surprises** | Few | Frequent |

## 🔑 Key Best Practices

✅ Start conservative, tune gradually
✅ Enable debug logging initially
✅ Adjust **tau** before adjusting **k**
✅ Use adaptive mode for mixed scenarios
✅ Monitor analytics to measure improvement
✅ Memory Bank must be enabled
✅ Always end scripts with `void 0`
✅ Use **storyCards** API (not worldinfo)

❌ Don't set tau >0.15 (reduces diversity)
❌ Don't set quality threshold >3.5 (excessive regen)
❌ Don't forget void 0 at end of scripts
❌ Don't modify CONFIG from lifecycle scripts

## 📚 More Info

See **README.md** for:
- Detailed feature explanations
- Advanced customization
- API reference
- Integration with other scripts
- Performance testing protocols

## 🆘 Get Help

- Console errors? Check script completeness
- Poor results? Enable debug logging
- Questions? AI Dungeon Discord #scripting
- Bug? Check GitHub issues

---

**Remember:** Scripts work automatically once installed. Just play and enjoy enhanced creativity!
