# Enhancement: Upstream PR for leechSeedDivisor

## Status

Future

## Summary

Open a PR to [smogon/damage-calc](https://github.com/smogon/damage-calc) to add a `leechSeedDivisor` option to the Field, allowing ROM hacks (e.g. Yellow Legacy) to override the default Leech Seed damage/recovery rate.

## Motivation

Yellow Legacy changes Leech Seed from 1/16 to 1/8 HP per turn. The upstream calc hardcodes 1/16 for Gen 1 and 1/8 for Gen 2+. We currently use patch-package to add this option locally; upstream support would remove the hack and benefit other ROM hack calcs.

## Proposed API

```javascript
new Field({
  attackerSide: { ... },
  defenderSide: { ... },
  leechSeedDivisor: 8,  // optional; defaults to gen.num >= 2 ? 8 : 16
})
```

## Implementation Notes

- Add `leechSeedDivisor?: number` to `State.Field` in `state.ts`
- Add to `Field` class constructor and `clone()` in `field.ts`
- In `desc.ts` `getEndOfTurn()`, use `field.leechSeedDivisor ?? (gen.num >= 2 ? 8 : 16)` for both defender damage and attacker recovery
- Our patch at `patches/@smogon+calc+0.10.0.patch` can be removed once merged and released
