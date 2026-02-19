# ADR-009: Opponent Navigation Rework

## Status

Accepted

## Context

After ADR-008, the Opponent page showed only the trainer grid, and BattleView embedded the full opponent PartyBuilder. We wanted:
- A single Opponent page that hosts both party editing and trainer loading
- Battle view to show only party selection (no editing)
- Empty slots hidden in battle UI
- Auto-select first Pokemon on each team

## Decision

1. **Route rename** – `/opponents` → `/opponent`; nav label "Opponents" → "Opponent".

2. **Opponent page two-mode layout** – Single page with `showTrainerPicker` toggle:
   - **Edit mode** (default): PartyBuilder for opponent party; "Load from trainer" link.
   - **Trainer mode**: Trainer grid; "Set manually" link. Selecting a trainer calls `loadFromTrainer` and switches back to edit mode (no navigation).

3. **BattleView simplification** – Remove PartyBuilder. Show party selection buttons only. "Edit" link to `/opponent`. Filter to non-empty slots (`slot.species`). Call `ensureValidSelection()` on mount and when parties change.

4. **Battle store** – Add `ensureValidSelection()`: if `selectedMyIndex`/`selectedTheirIndex` is null or points to empty slot, set to first non-empty index.

## Consequences

**Pros:**
- Opponent editing lives on one page; Battle is focused on matchup
- Clear flow: edit opponent → go to Battle
- Empty slots don't clutter battle UI
- Auto-selection avoids "no Pokemon selected" state
