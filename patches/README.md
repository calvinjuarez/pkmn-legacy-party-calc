# Patches

Patches are applied automatically by [patch-package](https://github.com/ds300/patch-package) during `npm install`.

## Manually applying patches

To reapply patches without reinstalling (e.g. after a fresh clone, or if something went wrong):

```bash
npx patch-package
```

This applies all patches in this directory to their corresponding packages in `node_modules`.

## Unapplying patches

To unapply all patches:

```bash
npx patch-package --reverse
```

Note: this will fail if the patched files have changed since being patched. In that case, reinstall the package: `rm -rf node_modules/@smogon/calc && npm install`.

## @smogon+calc+0.10.0.patch — Configurable residual divisors

Adds optional `leechSeedDivisor`, `poisonDivisor`, and `burnDivisor` fields to the `Field` constructor. When set, these override the default Gen 1 values (1/16) used for end-of-turn damage calculations.

**Purpose:** Yellow Legacy uses 1/8 for all three (same as Gen 2+), via a single shared `HandlePoisonBurnLeechSeed_DecreaseOwnHP` function in the ROM hack. This patch lets the calculator match that behavior without forking the library.

**Usage:** Pass the divisors when constructing `Field`:

```js
new Field({
  leechSeedDivisor: 8,
  poisonDivisor: 8,
  burnDivisor: 8,
})
```

Unset values fall back to the standard `gen.num`-based defaults.
