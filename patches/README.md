# Patches

Patches are applied automatically by [patch-package](https://github.com/ds300/patch-package) during `npm install`.

## How patch-package works

1. **Edit** – You modify files in `node_modules` (e.g. `node_modules/@smogon/calc/dist/field.js`).
2. **Generate** – Run `npx patch-package @smogon/calc`. It diffs your modified package against the original from npm and writes the result to `patches/@smogon+calc+0.10.0.patch`.
3. **Apply** – On `npm install`, the `postinstall` script runs `patch-package`, which reinstalls the package and applies the patch so your changes are restored.

One patch file per package. You can edit on top of an already-patched package; regenerating the patch captures all changes. See [AGENTS.md](../AGENTS.md) for the workflow when adding or changing patches.

## Manually applying patches

To reapply patches without reinstalling (e.g. after a fresh clone, or if something went wrong):

```bash
npx patch-package
```

## Unapplying patches

To unapply all patches:

```bash
npx patch-package --reverse
```

Note: this will fail if the patched files have changed since being patched. In that case, reinstall the package: `rm -rf node_modules/@smogon/calc && npm install`.

## @smogon+calc+0.10.0.patch

Extends the calc to support Yellow Legacy mechanics that have no override API.

### Configurable residual divisors

Adds optional `leechSeedDivisor`, `poisonDivisor`, and `burnDivisor` fields to the `Field` constructor. When set, these override the default Gen 1 values (1/16) used for end-of-turn damage calculations.

**Purpose:** Yellow Legacy uses 1/8 for all three (same as Gen 2+). This patch lets the calculator match that behavior.

**Usage:**

```js
new Field({
  leechSeedDivisor: 8,
  poisonDivisor: 8,
  burnDivisor: 8,
})
```

### Custom type effectiveness (Gen 1)

Adds optional `typeMatchups` to the `Field` constructor. When set for Gen 1, `getMoveEffectiveness` uses it instead of the built-in type chart.

**Purpose:** Yellow Legacy changes type matchups (e.g. Ghost vs Psychic 0×→2×, Bug vs Poison 2×→1×). The calc has no override for type effectiveness.

**Usage:** Pass a lookup `{ [attackerId]: { [defenderType]: effect } }` where `attackerId` matches the calc's `toID` output (lowercase). Our `getTypeLookup()` in `src/services/gamedata.js` builds this from `src/data/types.json`.
