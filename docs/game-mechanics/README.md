# Yellow Legacy Game Mechanics

Reference documentation for game mechanics in the Yellow Legacy ROM hack and how the damage calculator supports them.

## Mechanics

| Doc | Description |
|-----|-------------|
| [type-effectiveness.md](type-effectiveness.md) | Ghost vs Psychic fix, Bug vs Poison balance change |
| [physical-special-split.md](physical-special-split.md) | Ghost moves use Special instead of Physical |
| [move-changes.md](move-changes.md) | Power, accuracy, and type changes (Cut, Slam, Night Shade, etc.) |
| [residual-damage.md](residual-damage.md) | Leech Seed, poison, burn at 1/8 HP per turn |
| [trainer-movesets.md](trainer-movesets.md) | How trainer movesets are computed from the ROM hack |

## Source

All mechanics are derived from the Yellow Legacy ASM source in `yellow-legacy-v1.0.9/`. Run `npm run extract-data` to regenerate `src/data/*.json` from that source.
