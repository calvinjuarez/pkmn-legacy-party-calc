# ADR-006: Extract / Prepare / Display Pipeline

## Status

Accepted

## Context

The trainer parser originally derived `isRematch` and `location` from ASM comments. Comments are documentation, not data—they may be inconsistent across ROM versions or forks. We also mixed game knowledge (categories, rematches) and display logic (display names) into the parser, making it version-specific and harder to reuse.

## Decision

Restructure the data pipeline into three layers:

1. **Parser** (`scripts/parsers/trainers.js`) — Mechanical ASM translation only. Exports `extractRawTrainers()` returning `{ class, classId, romName, variantId, party }`. No comment parsing, no categories, no display names. Version-agnostic and likely reusable across ROM hacks.

2. **Decorate** (phase within `scripts/extract-data.js`) — Game-specific knowledge. After raw extraction, enriches trainers with `BOSS_CATEGORIES`, `REMATCH_VARIANTS`, `TRAINER_LOCATIONS`. Adds `category`, `isBoss`, `isRematch`, `location`. No human-facing display names in the output.

3. **App constants** (`src/services/gamedata.const.js`) — Display concerns only. `DISPLAY_OVERRIDES`, `BADGE_VARIANTS`, `DEV_BOSSES`, `JESSIE_JAMES_VARIANT_IDS`, `GYM_ORDER`, `E4_ORDER`, `EEVEELUTIONS`. Used by views and `getTrainerDisplayName()`.

## Consequences

**Pros:**
- Parser is reusable; prepare step can differ by game version
- ASM comments inform constants but are never parsed
- Clear separation: parser = syntax, prepare = game structure, app = presentation
- Single source of truth for metadata constants

**Cons:**
- Prepare step must be updated when game structure changes (e.g., new rematch, new boss)
- Two files to maintain for trainer metadata (prepare + gamedata.const)

## Implementation Notes

- Entry point: `npm run extract-data`
- Script runs extract phase (pokemon, moves, learnsets, types parsers + extractRawTrainers), then decorate phase for trainers
- `getTrainerDisplayName()` uses `DISPLAY_OVERRIDES` then falls back to `toDisplayName(romName)` from parse-asm
- Trainers in JSON have no `displayName` field; it is derived at runtime
