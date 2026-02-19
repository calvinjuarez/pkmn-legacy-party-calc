# ADR-013: Battle UI State Persistence

## Status

Accepted

## Context

When switching between active Pokemon in the battle calculator, the UI was resetting:
- The selected move (always cleared)
- Field effects (Reflect, Light Screen, Leech Seed)
- Status conditions and stat boosts
- The critical hit toggle

This was disruptive when comparing matchups across a team. Users expect to switch between their Pokemon and the opponent's Pokemon without losing their configured conditions or having to re-select moves.

## Decision

**Per-pokemon move memory:** Each party slot remembers the last move selected for it. When switching Pokemon, restore that slot's memorized move (or default to its first move). If the currently selected move belongs to the other side, leave it untouched.

**Persistent field state:** Side effects, status conditions, stat boosts, and the critical hit toggle no longer reset on Pokemon switches. They describe the battle field/conditions, not the Pokemon identity.

**Full reset on party change:** When either party's data changes (editing Pokemon, loading a trainer, etc.), the battle store detects this via a serialized snapshot comparison and resets all transient state: move selection, move memory, and conditions.

## Consequences

**Pros:**
- Users can switch between their Pokemon and retain each Pokemon's last-selected move
- Field conditions persist across matchup comparisons
- Party edits or trainer loads still produce a clean slate
- All changes are encapsulated in the battle store; no view/component changes required

**Cons:**
- Move memory and party snapshot add a small amount of in-memory state
- `ensureValidSelection()` runs snapshot comparison on each party watch; JSON.stringify of both parties is O(n) but acceptable for 6-slot parties

## Implementation Notes

- `myMoveMemory` and `theirMoveMemory` are refs keyed by party index: `{ [index]: moveId }`
- `lastPartySnapshot` is a JSON string of `[partyStore.party, opponentPartyStore.party]`; when it differs from the current snapshot, `resetBattleUI()` runs
- `setMyPokemon` / `setTheirPokemon` save the current move to memory before switching, then restore the new slot's memorized move (or first move)
- `setMove` updates the appropriate memory map when the user manually selects a move
