# Trinity Scripts Setup Guide for AI Dungeon

## Overview

The Trinity system requires **5 script slots** in AI Dungeon to function properly. Each script handles a different part of the system.

## Required Scripts (in order)

### 1. **Shared Library** (Required - Must Load First)
- **File**: `trinitysharedLibrary(1).js`
- **Script Type**: Shared Library
- **Load Order**: 1 (First!)
- **Purpose**: Contains all Trinity functions, config, and modules

### 2. **Input Modifier** (Required for @req and ())
- **File**: `trinityInputModifier.js`
- **Script Type**: Input Modifier
- **Load Order**: 2
- **Purpose**: Processes player commands (@req, (), @temp, @arc, etc.)
- **Fixes**: The "unable to run script" error you encountered

### 3. **Authors Note Modifier** (Required for @req and ())
- **File**: `trinityAuthorsNoteModifier.js`
- **Script Type**: Authors Note (memory.authorsNote)
- **Load Order**: 3
- **Purpose**: Injects @req and () memory into AI guidance layer

### 4. **Context Modifier** (Optional but Recommended)
- **File**: `trinityContextModifier.js`
- **Script Type**: Context Modifier
- **Load Order**: 4
- **Purpose**: Adds front-memory injection for @req dual-injection mode

### 5. **Output Modifier** (Recommended)
- **File**: `trinityOutputModifier.js`
- **Script Type**: Output Modifier
- **Load Order**: 5
- **Purpose**: Detects @req fulfillment, cleans up expired memories, updates NGO state

## Installation Steps

### Step 1: Add Shared Library
1. Go to AI Dungeon Scripts
2. Click "Add Script" → "Shared Library"
3. Paste contents of `trinitysharedLibrary(1).js`
4. Save as "Trinity Shared Library"

### Step 2: Add Input Modifier
1. Click "Add Script" → "Input Modifier"
2. Paste contents of `trinityInputModifier.js`
3. Save as "Trinity Input Modifier"

### Step 3: Add Authors Note Modifier
1. Click "Add Script" → "Authors Note"
2. Paste contents of `trinityAuthorsNoteModifier.js`
3. Save as "Trinity Authors Note"

### Step 4: Add Context Modifier (Optional)
1. Click "Add Script" → "Context Modifier"
2. Paste contents of `trinityContextModifier.js`
3. Save as "Trinity Context Modifier"

### Step 5: Add Output Modifier (Optional)
1. Click "Add Script" → "Output Modifier"
2. Paste contents of `trinityOutputModifier.js`
3. Save as "Trinity Output Modifier"

## Verification

After installing all scripts, test the command system:

### Test @req Command
Type in your story:
```
@req introduce a mysterious stranger
```

You should see:
- ✅ Command is removed from your input
- ✅ Log message: "🎯 @req: 'introduce a mysterious stranger'"
- ✅ AI output introduces a mysterious stranger

### Test () Parentheses Memory
Type in your story:
```
(the character feels nervous)
```

You should see:
- ✅ Parentheses removed from your input
- ✅ Log message: "📝 Memory stored: 'the character feels nervous'"
- ✅ AI output reflects the nervous mood

## Troubleshooting

### "Unable to run script" error
- **Cause**: Shared library not loaded, or scripts in wrong order
- **Fix**: Ensure `trinitysharedLibrary(1).js` is loaded FIRST as Shared Library

### Commands not working (@req, ())
- **Cause**: Missing inputModifier or authorsNoteModifier
- **Fix**: Install `trinityInputModifier.js` and `trinityAuthorsNoteModifier.js`

### Commands working but no AI response
- **Cause**: Missing authors note modifier
- **Fix**: Install `trinityAuthorsNoteModifier.js`

### No log messages
- **Cause**: Debug logging disabled
- **Fix**: Edit "Trinity Toggles: System" story card, set "Command Debug Logging: true"

## Feature Toggles

After installation, you'll have 3 story cards to control Trinity:

1. **Trinity Toggles: Core** - Enable/disable main systems
2. **Trinity Toggles: Narrative** - NGO and Smart Replacement settings
3. **Trinity Toggles: System** - Command system and debug options

Edit these cards to customize Trinity's behavior!

## Command Reference

| Command | Format | Purpose | Example |
|---------|--------|---------|---------|
| @req | `@req <narrative goal>` | Priority narrative request | `@req start a tense confrontation` |
| () | `(instruction)` | High-priority memory (4 turns) | `(the hero is wounded)` |
| @temp | `@temp <number>` or `@temp reset` | Manually adjust NGO temperature | `@temp +2` or `@temp reset` |
| @arc | `@arc <phase>` | Force narrative arc phase | `@arc climax` |
| @report | `@report` | Show replacement statistics | `@report` |
| @strictness | `@strictness <1-3>` | Adjust Bonepoke strictness | `@strictness 2` |

## Minimum Required Setup

If you only have 2-3 script slots available:

**Minimal Setup** (2 slots):
1. `trinitysharedLibrary(1).js` (Shared Library)
2. `trinityInputModifier.js` (Input Modifier)

This gives you command processing but no AI guidance injection.

**Recommended Setup** (3 slots):
1. `trinitysharedLibrary(1).js` (Shared Library)
2. `trinityInputModifier.js` (Input Modifier)
3. `trinityAuthorsNoteModifier.js` (Authors Note)

This gives you full @req and () functionality!

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Enable debug logging in "Trinity Toggles: System" card
3. Ensure all scripts are in the correct load order
4. Verify shared library loads before other scripts

## What's Fixed

The new modular script structure fixes:
- ✅ "Unable to run script" error with @req
- ✅ "Unable to run script" error with ()
- ✅ Commands being processed but not applied
- ✅ Missing command state initialization
- ✅ @req and () having no effect on AI output

Enjoy the full Trinity experience! 🎮✨
