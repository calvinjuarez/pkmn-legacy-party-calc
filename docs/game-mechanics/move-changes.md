# Move Changes in Yellow Legacy

Yellow Legacy modifies many moves from vanilla Gen 1. This doc lists the changes and how the calculator handles them.

## Source

`yellow-legacy-v1.0.9/data/moves/moves.asm`

## Summary Table

| Move | Vanilla | Yellow Legacy |
|------|---------|---------------|
| Cut | 50 BP, Normal, 95% | 55 BP, Bug, 100% |
| Slam | 80 BP, Normal, 75% | 80 BP, Dragon, 100% |
| Karate Chop | 50 BP, Normal, 95% | 50 BP, Fighting, 95% |
| Gust | 40 BP, Normal, 100% | 40 BP, Flying, 100% |
| Rage | 20 BP, Normal, 100% | 60 BP, Normal, 100% |
| Night Shade | Fixed (level) | 60 BP, Ghost, 100% |
| Lick | 20 BP, Ghost, 100% | 40 BP, Ghost, 100% |
| Sludge | 65 BP, Poison, 100% | 90 BP, Poison, 100% |
| Leech Life | 20 BP, Bug, 100% | 50 BP, Bug, 100% |
| Crabhammer | 90 BP, Water, 85% | 110 BP, Water, 100% |

## Implemented via Move Overrides

The calculator applies these via `src/data/moves.json` (extracted from the ROM hack) and `runDamageCalc` in `src/services/gamedata.js`, which passes `overrides: { basePower, accuracy, type }` to the `Move` constructor. All moves in the table above are correctly represented in `moves.json` and used by the calc.

## Night Shade Special Case

In vanilla Gen 1, Night Shade deals **fixed damage** equal to the user’s level (1–151). Yellow Legacy changes it to a **normal 60 BP Ghost move** that uses the standard damage formula.

The `@smogon/calc` library has special handling for fixed-damage moves. It checks `move.named('Night Shade')` and returns `attacker.level` instead of using the damage formula.

**Implemented workaround:** We pass `'Lick'` as the base move name to the calc instead of `'Night Shade'`. The calc skips the fixed-damage path and uses the normal formula. Overrides supply `basePower: 60`, `type: 'Ghost'`, `accuracy: 100`. The UI still displays "Night Shade" from the user's selection.

## Other Move Changes

The ROM hack may include additional power/accuracy/type changes. Run `npm run extract-data` to regenerate `src/data/moves.json` from the Yellow Legacy ASM source. The extraction script in `scripts/parsers/moves.js` reads `moves.asm` and outputs the JSON used by the calculator.

## See also

- [Physical/Special Split](physical-special-split.md) – Ghost moves use Special in Yellow Legacy
- [Implementation Status](implementation-status.md)
