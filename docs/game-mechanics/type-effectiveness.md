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

**Not implemented.** The `@smogon/calc` library uses its own built-in Gen 1 type chart. Move overrides (`bp`, `accuracy`, `type`) are passed to the calc, but type effectiveness is computed internally and cannot be overridden via the public API.

To support Yellow Legacy type effectiveness, we would need to either:

1. **Patch @smogon/calc** – Add support for custom type matchups (e.g. a `typeMatchups` override on the Field or Move).
2. **Fork the calc** – Maintain a fork with Yellow Legacy’s type chart.

## See also

- [ADR-001: Use @smogon/calc Gen 1 Engine with Overrides](../adr/001-use-smogon-calc-with-overrides.md)
- [Implementation Status](implementation-status.md)
