# Residual Damage (Leech Seed, Poison, Burn) in Yellow Legacy

Yellow Legacy increases residual damage from 1/16 to 1/8 HP per turn for Leech Seed, poison, and burn. This matches Gen 2+ behavior.

## Vanilla Gen 1

- **Leech Seed**: 1/16 of max HP per turn (damage to seeded Pokémon, recovery for attacker)
- **Poison**: 1/16 of max HP per turn
- **Burn**: 1/16 of max HP per turn

## Yellow Legacy

- **Leech Seed**: 1/8 of max HP per turn
- **Poison**: 1/8 of max HP per turn
- **Burn**: 1/8 of max HP per turn

## Implementation

**Implemented.** The calculator passes Field options to `@smogon/calc`:

```javascript
const field = new Field({
	attackerSide: options.attackerSide ?? {},
	defenderSide: options.defenderSide ?? {},
	leechSeedDivisor: 8,
	poisonDivisor: 8,
	burnDivisor: 8,
})
```

The upstream calc hardcodes 1/16 for Gen 1 and 1/8 for Gen 2+. We use **patch-package** to add support for `leechSeedDivisor`, `poisonDivisor`, and `burnDivisor` on the Field. The patch is at `patches/@smogon+calc+0.10.0.patch`.

When these options are set, the calc uses the given divisor instead of the default for the generation.

## Patch Details

The patch modifies:

1. **`field.js`** – Adds `leechSeedDivisor`, `poisonDivisor`, `burnDivisor` to the Field constructor and `clone()`.
2. **`desc.js`** – In `getEndOfTurn()`, uses `field.leechSeedDivisor ?? (gen.num >= 2 ? 8 : 16)` for Leech Seed, and analogous logic for poison and burn.

## Upstream Contribution

See [enhancements/002-leech-seed-divisor-pr.md](../enhancements/002-leech-seed-divisor-pr.md) for a proposed upstream PR. If merged, we could remove the patch and rely on the library’s built-in support.

## See also

- [ADR-007: Battle Calculator Field Conditions](../adr/007-battle-calculator-field-conditions.md)
- [Implementation Status](implementation-status.md)
