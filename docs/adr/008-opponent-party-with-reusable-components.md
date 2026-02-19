# ADR-008: Opponent Party with Reusable Components

## Status

Accepted

## Context

The battle calculator originally used a selected trainer as the opponent source. The opponent party came from trainer data (species, level, moves) with no user editing. We wanted:
- A full editable opponent party (6 slots, same structure as your party)
- Reusable party UI for both PartyView and BattleView
- Optional "Load from boss" to populate opponent from trainer data

## Decision

1. **Reusable PartyBuilder component** – Extracted from PartyView. Accepts `party`, `getSlot`, `setSlot`, optional `selectedIndex`, and `editorTitle`. Renders slot grid + editor panel. Used by both PartyView (your party) and BattleView (opponent party).

2. **Opponent party store** – New `opponentParty.js` store mirroring the party store API (`party`, `getSlot`, `setSlot`, `clearSlot`, `loadFromTrainer`). Persisted to `pokemon-calc-opponent-party` in localStorage.

3. **Battle store** – `theirParty` and `theirPokemon` come from `useOpponentPartyStore()` instead of `selectedOpponent.party`. Removed `selectedOpponent` and trainer persistence.

4. **Load from boss** – BattleView has a "Load from boss" link to `/opponents?loadInto=opponent`. OpponentView: selecting a trainer calls `loadFromTrainer(trainer)` and navigates to `/battle`.

5. **Damage calc defender** – `runDamageCalc` checks if defender is a party slot (has `dvs`, `useAdvanced`, or `stats`). If so, uses `toCalcPokemon`; otherwise `trainerMonToCalcPokemon` for raw trainer mons.

## Consequences

**Pros:**
- Opponent party is fully editable (DVs, Stat Exp, moves)
- Single source of truth for party UI
- BattleView always shows battle layout (no "no opponent" state)
- Load from boss populates slots without persisting trainer reference

**Cons:**
- OpponentView no longer "sets opponent" in the old sense; it always loads into opponent party and navigates
- `pokemon-calc-opponent` (trainer) is deprecated; `pokemon-calc-opponent-party` is the new key
