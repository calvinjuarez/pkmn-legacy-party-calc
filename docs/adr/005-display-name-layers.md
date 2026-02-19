# ADR-005: Display Name Layers (Extract, Normalize, Present)

## Status

Accepted

## Context

Display names were originally applied during extraction via a single `DISPLAY_NAME_OVERRIDES` map that mixed two concerns: mechanical ROM decoding (e.g., `LT.SURGE` -> `Lt. Surge`) and editorial choices (e.g., `RIVAL3` -> `Champion`). This baked presentation decisions into the extracted JSON, making the data less trustworthy as a source of truth and coupling extraction to UI preferences.

## Decision

Separate display name handling into three layers:

1. **Extract** — Parsers store raw ROM strings as `romName` and mechanically normalized strings as `displayName`. No editorial choices.
2. **Normalize** — `toTitleCase` + `ROM_NAME_OVERRIDES` (ROM decode only) in `scripts/lib/parse-asm.js`. Handles charset constraints (e.g., `MR.MIME` -> `Mr. Mime`, `OFF.JENNY` -> `Officer Jenny`).
3. **Present** — Editorial overrides in `src/services/gamedata.js` via `DISPLAY_OVERRIDES` map and `getTrainerDisplayName()` helper. App-layer UI decisions (e.g., `RIVAL3` -> `Champion`).

## Consequences

**Pros:**
- Extracted JSON is transparent about what came from the ROM (`romName`) vs. what was mechanically normalized (`displayName`)
- Editorial renames live in the app layer where they belong; different consumers can apply different overrides
- Single source of truth for raw data; presentation is decoupled

**Cons:**
- Slightly more JSON fields (`romName` on every entity)
- Consumers must call `getTrainerDisplayName()` for trainers instead of using `displayName` directly

## Implementation Notes

- `romName` is the raw string from the ROM (e.g., `RIVAL3`, `LT.SURGE`). `displayName` is mechanically normalized via `toDisplayName()`.
- `DISPLAY_OVERRIDES.trainers` keys are uppercase `romName` values. `getTrainerDisplayName(trainer)` looks up by `trainer.romName`, falls back to `trainer.displayName`.
- Pokemon and move display names are not overridden editorially; they use `displayName` directly. The pattern is there if needed later.
