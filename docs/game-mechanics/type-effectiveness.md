# Type Effectiveness in Yellow Legacy

Yellow Legacy modifies type matchups from vanilla Gen 1. This doc describes the changes and how they affect the damage calculator.

## Source

`yellow-legacy-v1.0.9/data/types/type_matchups.asm`

## Changes from Vanilla Gen 1

| Attacker | Defender | Vanilla | Yellow Legacy |
|----------|----------|---------|---------------|
| Ghost | Psychic | 0× (bug) | 2× |
| Bug | Poison | 2× | 1× |

### Ghost vs Psychic

In vanilla Gen 1, Ghost-type moves deal **no damage** to Psychic due to a programming bug. The game incorrectly treated Ghost as immune to Psychic. Yellow Legacy fixes this so Ghost is **super effective** (2×) against Psychic, matching the intended type chart and later generations.

### Bug vs Poison

Vanilla Gen 1 has Bug super effective (2×) against Poison. Yellow Legacy changes this to **neutral** (1×) for balance.

## Extracted Data

The calculator extracts type matchups to `src/data/types.json` via `scripts/parsers/types.js`. The JSON format uses `effect` values: `2` (super effective), `0.5` (not very effective), `0` (no effect).

## Implementation Status

**Implemented.** We patch `@smogon/calc` to add a `typeMatchups` Field option. When set (Gen 1 only), `getMoveEffectiveness` uses it instead of the built-in type chart. The calculator passes the Yellow Legacy chart from `src/data/types.json` via `runDamageCalc` → `new Field({ typeMatchups: getTypeLookup() })`. The patch is in `patches/@smogon+calc+0.10.0.patch`.

## See also

- [ADR-001: Use @smogon/calc Gen 1 Engine with Overrides](../adr/001-use-smogon-calc-with-overrides.md)
- [ADR-015: Patch vs Fork vs PR](../adr/015-patch-vs-fork-vs-pr.md)
