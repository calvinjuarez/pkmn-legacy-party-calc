# Yellow Legacy Implementation Status

This doc summarizes which game mechanics are implemented in the damage calculator and which are not.

## Implemented

| Mechanic | Location | Notes |
|----------|----------|-------|
| **Move overrides** | `src/services/gamedata.js`, `src/data/moves.json` | Power, accuracy, type from Yellow Legacy |
| **Residual damage** | `runDamageCalc` → Field options | Leech Seed, poison, burn at 1/8 via `leechSeedDivisor`, `poisonDivisor`, `burnDivisor` |
| **Field options** | `patches/@smogon+calc+0.10.0.patch` | Adds divisor overrides to @smogon/calc |
| **High-crit moves** | (if applicable) | Karate Chop, Slash, etc. use calc's built-in crit logic |
| **Ghost Physical → Special** | `runDamageCalc` → Move overrides | `category: 'Special'` for Ghost-type moves |
| **Night Shade** | `runDamageCalc` → base move name workaround | Pass `'Lick'` as base so calc uses normal formula with 60 BP |

## Not Implemented

| Mechanic | Blocker | Possible Approach |
|----------|---------|-------------------|
| **Type effectiveness** | Calc uses built-in Gen 1 chart | Patch calc to accept custom type matchups, or fork |

## Data Extraction

- **Moves**: `scripts/parsers/moves.js` → `src/data/moves.json`
- **Types**: `scripts/parsers/types.js` → `src/data/types.json`
- **Trainers**: `scripts/parsers/trainers.js` → `src/data/trainers.json`

Run `npm run extract-data` to regenerate from the Yellow Legacy ASM source in `yellow-legacy-v1.0.9/`.

## See also

- [Type Effectiveness](type-effectiveness.md)
- [Physical/Special Split](physical-special-split.md)
- [Move Changes](move-changes.md)
- [Residual Damage](residual-damage.md)
- [ADR-001: Use @smogon/calc Gen 1 Engine with Overrides](../adr/001-use-smogon-calc-with-overrides.md)
- [ADR-014: Yellow Legacy Mechanics via Move Overrides](../adr/014-yellow-legacy-override-mechanics.md)
