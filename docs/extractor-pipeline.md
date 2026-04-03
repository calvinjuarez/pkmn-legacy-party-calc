# Extractor pipeline

Operational reference for how game data gets from Yellow Legacy ASM into committed JSON. **ADRs** (e.g. [ADR-002](adr/002-extract-data-at-build-time.md), [ADR-005](adr/005-display-name-layers.md), [ADR-006](adr/006-extract-prepare-display-pipeline.md), [ADR-017](adr/017-transform-layer-terminology.md)) record **why** past choices were made; this doc is **what we do now**.

## Run

```bash
npm run extract-data
```

Entry point: [`scripts/extract-data.js`](../scripts/extract-data.js). Output: [`src/data/`](../src/data/) JSON, **checked into git** ([ADR-002](adr/002-extract-data-at-build-time.md)).

## Parse → transform → persist

| Stage | Role |
|--------|------|
| **Parse** | ASM → mechanical structures. Parsers export functions; **no** filesystem writes on import. **No** `displayName` here—it is not a field read from ASM. |
| **Transform** | Augments parsed data before write (trainer categories, rematches, locations, mechanical `displayName` from [`scripts/lib/rom-display-names.js`](../scripts/lib/rom-display-names.js)). Formal code uses **transform** naming ([ADR-017](adr/017-transform-layer-terminology.md)). |
| **Persist** | `writeFile` for `pokemon.json`, `moves.json`, `learnsets.json`, `types.json`, `trainers.json`. |

The **extractor** wires these stages. Individual **`scripts/parsers/*.js`** modules are **parsers** for specific ASM concerns, not the whole job.

There is **no** required transform framework—manual composition in `extract-data.js` is enough.

## Config

[`scripts/extract-data.js`](../scripts/extract-data.js) uses a `DEFAULT_CONFIG`:

- **`legacyRoot`** — Absolute path to the ROM hack tree (default: `yellow-legacy-v1.0.9` under repo root).
- **`outputDir`** — Base directory for JSON (default: `src/data`).

Swapping another Yellow Legacy checkout or a similar Pret-layout tree is primarily a **config / path** change.

## Mechanical ASM only: `parse-asm.js`

[`scripts/lib/parse-asm.js`](../scripts/lib/parse-asm.js) exposes:

- **`createAsmReaders(legacyRoot)`** — returns `{ readAsm, readAsmLines }`.
- **`parseConstants`**, **`parseLiList`**, **`parseDbStrings`** — stateless helpers.

**Display** strings for JSON and ASM constant → type labels live elsewhere:

- [`scripts/lib/rom-display-names.js`](../scripts/lib/rom-display-names.js)
- [`scripts/lib/gen1-asm-maps.js`](../scripts/lib/gen1-asm-maps.js)

## Display names

- **Extract:** Mechanical normalization is applied when building JSON (`displayName` on species, moves, trainers). Rules live in `rom-display-names.js` (extract pipeline only).
- **App:** [`src/services/gamedata.js`](../src/services/gamedata.js) uses **`DISPLAY_OVERRIDES`** from [`gamedata.const.js`](../src/services/gamedata.const.js) for **editorial** labels (e.g. Champion, Rival), then `trainer.displayName` from JSON. See [ADR-005](adr/005-display-name-layers.md).

## Consumable JSON

Committed `src/data/*.json` is the **primary artifact**: reusable and as **complete** as practical (metadata, mechanical names) so the browser bundle does not re-derive ROM facts. More data from [`gamedata.const.js`](../src/services/gamedata.const.js) may move into extracted JSON over time; that migration is **incremental**, not all at once.

## Trainers ordering

`extractTrainers` needs in-memory **`pokemon`** and **`learnsets`** (same shapes as the JSON) to compute default party moves. The extractor runs those parsers first, then trainers.

## Placement of this doc

This file documents **repo build / tooling**. Do not treat [`docs/game-mechanics/`](game-mechanics/) as the home for extractor docs—that area is for **ROM hack and base-game mechanics** discovery, not how this app builds its data.
