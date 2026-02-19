# ADR-001: Use @smogon/calc Gen 1 Engine with Overrides

## Status

Accepted

## Context

We need a damage calculator for Pokemon Yellow Legacy, a Gen 1 ROM hack. Yellow Legacy modifies base stats, moves, and possibly type effectiveness from vanilla Pokemon Yellow. We need accurate damage calculations using the ROM hack's data.

## Decision

Use the `@smogon/calc` library with Gen 1 mode and pass `overrides` on the Pokemon and Move constructors to inject Yellow Legacy's modified data. We do not implement a custom damage formula.

## Consequences

**Pros:**
- Proven, battle-tested Gen 1 damage formula
- Handles all edge cases (critical hits, type effectiveness, etc.)
- Single source of truth for mechanics
- Overrides allow us to inject ROM hack data without forking the library

**Cons:**
- Dependency on @smogon/calc's Gen 1 implementation
- Must map our extracted data to the override format the library expects
- If the library has a Gen 1 bug, we inherit it

## Implementation Notes

- Base stats use `spe` (Speed) and `spc` (Special) to align with calc; calc expands `spc` to both `spa` and `spd` for Gen 1
- Move overrides use `bp`, `accuracy`, `type` to override power/accuracy/type
