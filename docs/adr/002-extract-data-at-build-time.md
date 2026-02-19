# ADR-002: Extract Data from ASM at Build Time

## Status

Accepted

## Context

All game data (Pokemon, moves, trainers, etc.) lives in the Yellow Legacy ROM hack's ASM source files. We need this data in a format the Vue app can consume. Options: parse at runtime in the browser, or extract to JSON at build time.

## Decision

Extract data from ASM files using Node.js scripts at build time. Output JSON files to `src/data/`. The JSON is checked into the repo and imported by the app. Run `npm run extract-data` to regenerate after ROM hack updates.

## Consequences

**Pros:**
- Simple, fast app startup (no ASM parsing in browser)
- JSON can be tree-shaken or code-split if needed
- Single extraction step; app stays decoupled from ASM format
- Easy to validate extracted data before commit

**Cons:**
- Data can become stale if submodule is updated without re-running extract
- Extraction scripts must be maintained when ASM format changes
- Large JSON payload (mitigated by future code-splitting if needed)

## Implementation Notes

- Scripts live in `scripts/parsers/`
- Entry point: `scripts/extract-data.js` (run via `npm run extract-data`)
- Output: `src/data/pokemon.json`, `moves.json`, `learnsets.json`, `trainers.json`, `types.json`
