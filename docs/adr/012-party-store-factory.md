# ADR-012: Reusable Party Store Factory

## Status

Accepted

## Context

Party and opponent party stores were nearly identical: same slot structure (species, nickname, level, stats, dvs, statExp, moves, useAdvanced), same API (party, setSlot, clearSlot, getSlot), same persistence pattern. Only differences:
- Storage key (`pokemon-calc-party` vs `pokemon-calc-opponent-party`)
- Default `useAdvanced`: user party follows settings; opponent uses `false`
- `loadFromTrainer` only used for opponent, but structurally applicable to both

Duplicating the logic in two stores was error-prone and made changes require edits in two places.

## Decision

1. **`createPartyStore` factory** – New `createPartyStore.js` that takes `(id, storageKey, { getDefaultUseAdvanced })` and returns a Pinia store definition. All shared logic lives in the factory.

2. **Thin store modules** – `party.js` and `opponentParty.js` each call the factory with their config:
   - Party: `getDefaultUseAdvanced: () => useSettingsStore().getDefaultUseAdvanced()`
   - Opponent: `getDefaultUseAdvanced: () => false`

3. **Unified API** – Both stores expose `loadFromTrainer`. Only opponent uses it in the UI, but the API is identical for consistency.

## Consequences

**Pros:**
- Single source of truth for party slot structure and behavior
- Future changes (e.g. new fields) require one edit
- Both stores support nickname and all fields; opponent can use them if needed

**Cons:**
- Slightly more indirection (factory + two thin modules vs two self-contained stores)
