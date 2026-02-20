# ADR-014: Yellow Legacy Mechanics via Move Overrides

## Status

Accepted

## See also

- [ADR-001](001-use-smogon-calc-with-overrides.md) – Base approach; this ADR extends it with Ghost category and Night Shade workaround

## Context

Yellow Legacy changes several mechanics from vanilla Gen 1. Some can be implemented using the `@smogon/calc` Move override API without patching the library:

1. **Ghost Physical → Special** – Yellow Legacy makes Ghost moves use the Special stat (like Crystal), not Physical.
2. **Night Shade** – Vanilla Night Shade deals fixed damage (level). Yellow Legacy changed it to a normal 60 BP Ghost move. The calc has special handling for `move.named('Night Shade')` that returns level; we need the normal formula instead.

Type effectiveness (Ghost vs Psychic, Bug vs Poison) cannot be overridden; it would require patching the calc.

## Decision

Use Move overrides for both mechanics:

1. **Ghost category** – When `moveData.type === 'Ghost'`, add `category: 'Special'` to overrides. The calc uses `data.category` when present; otherwise it derives from type (Ghost defaults to Physical in Gen 1).

2. **Night Shade** – Pass `'Lick'` as the base move name instead of `'Night Shade'`. The calc checks `move.named('Night Shade')` for fixed damage; with name `'Lick'` it skips that path and uses the normal formula. Overrides supply `basePower: 60`, `type: 'Ghost'`, `accuracy: 100`. The UI still displays "Night Shade" from the user's selection.

## Consequences

**Pros:**
- No patch required; uses the calc's public API
- Ghost moves (Lick, Night Shade) now scale off Special correctly
- Night Shade damage matches Yellow Legacy (60 BP formula, not fixed level)

**Cons:**
- Night Shade uses "Lick" internally; calc result `desc.moveName` would show "Lick" if we ever displayed it (we don't; UI uses our move data)
- Type effectiveness changes remain unimplemented

## Implementation Notes

- Move overrides use `basePower` (not `bp`); the calc reads `data.basePower`.
- Ghost override: `overrides.category = 'Special'` when `moveData.type === 'Ghost'`.
- Night Shade: `new Move(GEN, 'Lick', { overrides: { basePower: 60, type: 'Ghost', accuracy: 100, category: 'Special' } })`.
- See [runDamageCalc](../src/services/gamedata.js) for the full logic.
