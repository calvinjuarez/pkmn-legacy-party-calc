# Trainer Movesets in Yellow Legacy

This doc describes how trainer Pokemon movesets are determined in the Yellow Legacy ROM hack. The damage calculator extracts this data from the ASM source and replicates the same logic.

## Party Definitions

Trainer parties are defined in `data/trainers/parties.asm`. **Moves are not stored here** — only species and levels.

Two formats:

1. **Uniform level**: `db level, species1, species2, ..., 0` — all Pokemon share the same level.
2. **Variable level**: `db $FF, level1, species1, level2, species2, ..., 0` — each Pokemon has its own level. The `$FF` prefix also enables special move overrides for this trainer.

Example (Lorelei):

```
LoreleiData:
	db $FF, 56, SLOWBRO, 55, CLOYSTER, 55, DEWGONG, 56, JYNX, 57, LAPRAS, 0
```

## Default Moveset Computation

When a trainer battle starts, the engine initializes each Pokemon via `AddPartyMon`, which calls `WriteMonMoves` (`engine/pokemon/evos_moves.asm`). This routine:

1. **Starts with level 1 moves** from the Pokemon's base stats (e.g. Slowbro: `TACKLE, DISABLE, HEADBUTT, NO_MOVE`).
2. **Walks the learnset** in level order. For each move at or below the Pokemon's level:
   - If already known, skip.
   - If an empty slot exists, fill it.
   - If all 4 slots are full, **shift moves left** (drop the oldest), then add the new move at slot 4.

The shift behavior is critical: when a Pokemon "learns" a move and has no empty slots, the oldest move is discarded and the new one goes at the end.

### Worked Example: Slowbro at Level 56

Yellow Legacy Slowbro learnset (`data/pokemon/evos_moves.asm`):

```
db 5, GROWL
db 5, WATER_GUN
db 10, CONFUSION
db 18, DISABLE
db 22, HEADBUTT
db 25, PSYBEAM
db 28, WATERFALL
db 36, WITHDRAW
db 40, AMNESIA
db 45, PSYCHIC_M
```

Level 1 moves: `[TACKLE, DISABLE, HEADBUTT, null]`

| Step | Move | Action | Result |
|------|------|--------|--------|
| 1 | GROWL | Fill empty | [TACKLE, DISABLE, HEADBUTT, GROWL] |
| 2 | WATER_GUN | Shift | [DISABLE, HEADBUTT, GROWL, WATER_GUN] |
| 3 | CONFUSION | Shift | [HEADBUTT, GROWL, WATER_GUN, CONFUSION] |
| ... | ... | ... | ... |
| 10 | AMNESIA | Shift | [PSYBEAM, WATERFALL, WITHDRAW, AMNESIA] |
| 11 | PSYCHIC_M | Shift | [WATERFALL, WITHDRAW, AMNESIA, PSYCHIC_M] |

**Default result**: `WATERFALL, WITHDRAW, AMNESIA, PSYCHIC_M`

## Special Move Overrides

After computing default moves, the engine checks `SpecialTrainerMoves` (`data/trainers/special_moves.asm`). This is a **Yellow Legacy addition** — vanilla Yellow has no special moves table.

Format:

```
db TRAINER_CLASS, TRAINER_ID
db partymon_slot, move_slot, MOVE_ID
db partymon_slot, move_slot, MOVE_ID
...
db 0
```

Both `partymon_slot` and `move_slot` are **1-indexed**. Only specified slots are overwritten; the rest come from the default computation.

### Worked Example: Lorelei's Slowbro

Lorelei variant 1, Slowbro is party slot 1. Special moves for that slot:

```
db LORELEI, 1
db 1, 1, EARTHQUAKE   ; party slot 1, move slot 1
db 1, 2, BLIZZARD     ; party slot 1, move slot 2
```

Default: `[WATERFALL, WITHDRAW, AMNESIA, PSYCHIC_M]`  
After overrides: `[EARTHQUAKE, BLIZZARD, AMNESIA, PSYCHIC_M]`

Slots 3 and 4 (Amnesia, Psychic) are unchanged — they come from the base game's learnset computation. Yellow Legacy only overrides slots 1 and 2 for better coverage.

## DVs and Stat EXP

All trainer Pokemon use **hardcoded** values (not stored per-trainer):

- **DVs**: 9/8/8/8 (Atk: 9, Def: 8, Spe: 8, Spc: 8; HP derived)
- **Stat EXP**: 0 across the board

These are baked into the engine. When loading a trainer party into the calculator, we apply these values so damage calculations match in-game.

## Our Parser

The extraction script replicates this logic in `scripts/parsers/trainers.js`:

- **`getMovesAtLevel(speciesId, level)`** — Replicates `WriteMonMoves`: starts with level 1 moves, iterates learnset, fills empty slots then shifts when full.
- **Special moves parsing** — Parses `special_moves.asm` and applies overrides by `trainerClassId_trainerId` and party slot. Overrides are applied after the default moveset is computed.

Run `npm run extract-data` to regenerate `src/data/trainers.json` from the Yellow Legacy ASM source.
