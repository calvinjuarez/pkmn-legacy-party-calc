# Physical/Special Split (Ghost) in Yellow Legacy

In Gen 1, damage category is determined by **type**, not by individual move. All Ghost-type moves use the Physical formula (Attack vs Defense) in vanilla. Yellow Legacy changes Ghost to **Special** to align with Pokémon Crystal and later generations.

## Vanilla Gen 1

- **Ghost** = Physical (uses Attack stat to deal damage, Defense to take it)
- **Psychic** = Special

This made Lick and Night Shade (the only damaging Ghost moves in vanilla) scale off Attack, which hurt Ghost-types like Gengar that have higher Special.

## Yellow Legacy

- **Ghost** = Special (uses Special stat for both offense and defense)

This matches Crystal and makes Ghost moves scale off Special, which fits Gengar’s stat spread.

## Implementation Status

**Implemented.** The calc's `Move` constructor accepts `category` in overrides. In `runDamageCalc`, when `moveData.type === 'Ghost'`, we add `category: 'Special'` to the overrides. Ghost moves (Lick, Night Shade) now use the Special formula.

## See also

- [Move Changes](move-changes.md) – Lick and Night Shade are Ghost moves affected by this
- [Implementation Status](implementation-status.md)
