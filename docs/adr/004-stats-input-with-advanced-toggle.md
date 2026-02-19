# ADR-004: Stats Input with Advanced Toggle

## Status

Accepted

## Context

Most users have in-game stat values (HP, Atk, Def, Spd, Spc) on hand from their game screen. A smaller subset wants precise control via DVs and Stat Exp. The original UI exposed only DVs and Stat Exp, which was intimidating for casual users.

## Decision

- **Primary mode (default)**: Five number inputs for the final stats the user sees in-game. This is the default for new slots.
- **Advanced mode (toggle)**: Expands DVs (0-15) and Stat Exp (0-65535). Stat fields become read-only computed values from base stats + level + DVs + Stat Exp using the Gen 1 formula.
- **Per-slot mode**: Each party slot remembers whether it's in basic or advanced mode.
- **Global default**: A `statInputMode` setting (`'stats'` or `'advanced'`) in the settings store, persisted to localStorage under `pokemon-calc-settings`, controls the default for new/cleared slots.

## Consequences

**Pros:**
- 90% of users can enter stats directly without understanding DVs/Stat Exp
- Advanced users retain full control when needed
- Per-slot mode allows mixing (e.g. one slot with direct stats, another with DVs)
- Global default respects user preference across sessions

**Cons:**
- Two code paths in `toCalcPokemon`: basic mode overwrites `rawStats`/`stats` after construction; advanced mode uses IVs/EVs as before
- Settings store adds a small amount of state and localStorage usage

## Implementation Notes

- `calcGen1Stat(stat, base, level, dvs, statExp)` implements the Gen 1 formula for display and fallback
- Basic mode: build Pokemon with neutral IVs/EVs, then override `rawStats` and `stats` with user values (or computed fallback when null)
- Advanced mode: convert DVs/Stat Exp to IVs/EVs; calc computes stats internally
- HP DV is derived from other DVs: `(atk%2)*8 + (def%2)*4 + (spd%2)*2 + (spc%2)`
