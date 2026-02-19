# Enhancement: Move Typeahead with Learnable Priority

## Status

Proposed

## Summary

Replace the plain `<select>` dropdowns for move selection in the Party Builder with a search/typeahead input. Typing filters the full move list, but results are grouped and sorted so moves the selected Pokemon can actually learn (via level-up, TM/HM, or level 1 learnset) appear first.

## Motivation

The current select dropdown lists all 164 moves alphabetically. For a Pokemon like Pikachu, the user has to scroll through the entire list to find Thunderbolt. A typeahead lets them type "thu" and immediately see Thunderbolt, Thunder, Thunder Wave, and Thundershock -- with the ones Pikachu actually learns surfaced at the top.

## Proposed Behavior

- **Closed state**: Shows the currently selected move (display name + power/type), or "-- None --" if empty. Clicking opens the search.
- **Open state**: Text input with focus. Dropdown appears below with filtered results.
- **Filtering**: Matches against display name and move ID as the user types.
- **Grouping**: Results split into two sections with headers:
  - **Learnable** -- moves from the species' level-up learnset, TM/HM compatibility, and level 1 moves.
  - **Other** -- all remaining moves that match the query.
- **Within each group**: Alphabetical by display name.
- **Keyboard**: Arrow keys navigate, Enter selects, Escape closes.
- **Clear**: An "x" button clears the slot back to None.

## Data Dependencies

- `getLearnableMoves(speciesId)` from `gamedata.js` already returns the set of moves a species can learn. This drives the grouping.
- `getAllMoves()` provides the full list for the "Other" group.

## Implementation Notes

- Build as `src/components/MoveTypeahead.vue`.
- Props: `modelValue` (move ID), `speciesId` (for learnable lookup).
- Emits: `update:modelValue`.
- Wire into PartyView's move rows, replacing the current `<select>`.
- Consider also applying the same typeahead pattern to the species selector.
