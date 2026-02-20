# ADR-015: Patch vs Fork vs PR

## Status

Accepted

## See also

- [ADR-001](001-use-smogon-calc-with-overrides.md) – Base approach; we extend the calc via patches when overrides are insufficient

## Context

Yellow Legacy needs mechanics the `@smogon/calc` library does not support via its public API:

- **Type effectiveness** – Ghost vs Psychic (0×→2×), Bug vs Poison (2×→1×). The calc uses a built-in type chart with no override.
- **Residual damage** – Leech Seed, poison, burn at 1/8 instead of 1/16. The calc hardcodes divisors by generation.

We had three options: patch the installed package, fork the calc, or submit an upstream PR.

## Decision

**Patch** the installed `@smogon/calc` using patch-package. Do not fork. Do not block on an upstream PR.

## Consequences

**Pros:**
- Minimal maintenance: one patch file, applied automatically on `npm install`
- No separate fork to keep in sync with upstream
- Uses the same package version as everyone else; we only add our diffs
- Fast to implement; no upstream review cycle

**Cons:**
- Patches can break on package upgrades; we must re-apply or update when bumping @smogon/calc
- Upstream does not benefit; other ROM hack calcs would need similar patches

**Why not fork:** A fork would require maintaining our own npm package or vendoring the calc. We would need to merge upstream changes manually. For a small, focused project, that overhead is not justified.

**Why not PR:** An upstream PR for `typeMatchups` and divisor overrides would benefit the community but has uncertain timeline and review. We need the feature now. We can revisit a PR later if we want to reduce our patch surface.

## Implementation Notes

- Patches live in `patches/@smogon+calc+0.10.0.patch`
- Edit files in `node_modules/@smogon/calc`, then run `npx patch-package @smogon/calc` to regenerate
- See [AGENTS.md](../../AGENTS.md) for patch-package workflow
