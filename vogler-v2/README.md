# Vogler V2 - Two-Tier Story Arc System

A comprehensive AI Dungeon scripting system that combines Christopher Vogler's 12-stage Hero's Journey with SAE-style AI-generated story bridges.

## Overview

Vogler V2 uses a **two-tier approach** for narrative guidance:

### Tier 1: Beat Cards (Pre-generated)
- Structural story beats (WHAT needs to happen)
- Pre-generated for all 3 acts at initialization
- Completed beats are **DELETED** from cards
- AI only sees remaining beats

### Tier 2: Bridge Cards (On-demand)
- Specific plot events (HOW to move between beats)
- AI-generated based on current story context
- Created via `@bridge` command
- Events auto-removed as story progresses

## Installation

1. Copy `voglerSharedLibrary.js` into your AI Dungeon Shared Library
2. Copy `voglerContext.js` into your Context script
3. Copy `voglerInput.js` into your Input script
4. Copy `voglerOutput.js` into your Output script
5. Save and enable all scripts
6. System initializes automatically at Stage 1

## Files

| File | Purpose |
|------|---------|
| `voglerSharedLibrary.js` | Core system, configs, state management, debug commands |
| `voglerContext.js` | Author's note injection, bridge prompt injection |
| `voglerInput.js` | Command processing, player beat detection |
| `voglerOutput.js` | AI beat detection, stage advancement, output cleaning |

## Commands

### Player Commands (In-Story)
| Command | Description |
|---------|-------------|
| `@stage 5` | Jump to stage 5 |
| `@beat` | Complete next structural beat |
| `@bridge` | Generate SAE bridge card |
| `@temp 10` | Set NGO temperature to 10 |

### Debug Commands
| Command | Description |
|---------|-------------|
| `/vogler status` | Full status display |
| `/vogler beats` | Show remaining beats per act |
| `/vogler bridge` | Show current bridge events |
| `/vogler stage 8` | Show stage 8 details |
| `/vogler complete` | Complete next beat |
| `/vogler generate` | Generate bridge card |
| `/vogler reset 1` | Reset Act 1 beats |
| `/vogler advance` | Force stage advance |
| `/vogler health` | System health check |
| `/vogler debug` | Toggle verbose logging |
| `/vogler help` | Show help |

## The 12 Stages

### Act I: The Setup (Stages 1-5)
1. **Ordinary World** - Establish hero's normal life
2. **Call to Adventure** - Something disrupts the ordinary
3. **Refusal of the Call** - Hero hesitates
4. **Meeting the Mentor** - Guidance received
5. **Crossing the Threshold** - Commit to adventure

### Act II: The Confrontation (Stages 6-9)
6. **Tests, Allies, Enemies** - Learn the special world
7. **Approach to Inmost Cave** - Prepare for challenge
8. **The Ordeal** - Face greatest fear (CENTRAL CRISIS)
9. **Reward** - Survive and claim prize

### Act III: The Resolution (Stages 10-12)
10. **The Road Back** - Journey home begins
11. **Resurrection** - Final climax (MAXIMUM TENSION)
12. **Return with Elixir** - Hero returns transformed

## Story Cards Created

At initialization, the system creates:

1. **vogler-config** - Configuration settings
2. **player-guidance** - Your personal author's note
3. **vogler-beats-1** - Act I structural beats
4. **vogler-beats-2** - Act II structural beats
5. **vogler-beats-3** - Act III structural beats

On-demand (via @bridge):
- **sae-bridge** - Current story bridge events

## How It Works

1. **Turn Zero**: System initializes, creates all beat cards
2. **Each Turn**: Stage guidance injected into author's note
3. **Player uses @beat**: Next structural beat deleted from card
4. **Player uses @bridge**: AI generates specific plot events
5. **Stage Advancement**: Automatic based on turns and beat completion

## NGO Integration

Each stage maps to specific NGO temperature/heat values:

| Stage | Temp | Heat | Phase |
|-------|------|------|-------|
| 1 | 1 | 0 | exploration |
| 5 | 4 | 8 | rising |
| 8 (Ordeal) | 10 | 25 | climax |
| 11 (Resurrection) | 12 | 30 | climax |
| 12 | 3 | 0 | falling |

## Version

**V2.0.0** - Two-Tier System with SAE Integration

## License

MIT - Free to use, modify, and distribute

## Credits

- Christopher Vogler (Hero's Journey framework)
- Joseph Campbell (Original monomyth)
- SAE (Story Arc Engine concept by Yi1i1i)
- Trinity Scripts community
