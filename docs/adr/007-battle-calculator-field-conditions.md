# ADR-007: Battle Calculator Field Conditions and UI

## Status

Accepted

## Context

The battle screen needed to support Gen 1-relevant conditions that affect damage calculation: Reflect, Light Screen, status conditions, stat boosts, and critical hits. The `@smogon/calc` library supports these via `Field`, `Pokemon.status`, `Pokemon.boosts`, and `Move.isCrit`.

## Decision

1. **Store**: Add reactive state in the battle store for attacker/defender side field conditions (`isReflect`, `isLightScreen`), status, stat boosts, and crit. Reset conditions when Pokemon selection changes.

2. **Calc service**: Extend `runDamageCalc(attacker, defender, moveName, options)` to accept an options object and pass a `Field` plus status/boosts/crit to `calculate()`.

3. **UI**: Two-column matchup layout with condition controls per side, move selector and crit toggle in the center, and auto-recalculate on any change.

## Consequences

**Pros:**
- Full Gen 1 damage calc support (Reflect, Light Screen, burn, boosts, crit)
- Clear separation: store holds state, gamedata runs calc, view binds UI
- Auto-calc improves UX; no manual "Calculate" button needed

**Cons:**
- More state to manage; conditions reset on Pokemon change (intended)

## Implementation Notes

- Gen 1 Special: one UI control sets both `spa` and `spd` in boosts
- `attackerSide` = your side (attacker's team), `defenderSide` = their side when you attack
- Status values: `''`, `'brn'`, `'par'`, `'psn'`, `'slp'`, `'frz'`, `'tox'`
