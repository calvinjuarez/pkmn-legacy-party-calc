# ADR-003: localStorage for Party Persistence

## Status

Accepted

## Context

Users need to save their party (species, level, DVs, Stat Exp, moves) between sessions. We need a persistence strategy that works without a backend.

## Decision

Use `localStorage` for party persistence. The Pinia party store watches its state and saves to `localStorage` on change. The store hydrates from `localStorage` on init. The implementation is designed so a backend can be swapped in later without changing the store's public API.

The same pattern is used for battle state:
- **Opponent party** (`pokemon-calc-opponent-party`): we persist the full opponent party (6 slots, same shape as your party). See ADR-008.
- **Active Pokemon** (`pokemon-calc-selection`): we persist `{ myIndex, theirIndex }` for the selected party slot on each side. Indices are validated on load (0–5).

## Consequences

**Pros:**
- No backend or auth required
- Works offline
- Simple implementation
- Fast (no network round-trip)

**Cons:**
- Data is device-specific (no sync across devices)
- Limited to ~5MB per origin
- User cannot access party from another browser/device

## Future Considerations

If we add a backend:
- Add a `saveToBackend()` / `loadFromBackend()` in the store
- Keep the same `party`, `setSlot`, `clearSlot`, `getSlot` API
- Optionally sync localStorage with backend when user is authenticated
