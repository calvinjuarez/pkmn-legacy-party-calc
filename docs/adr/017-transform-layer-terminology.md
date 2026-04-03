# ADR-017: Post-parse layer terminology (transform)

## Status

Accepted

## See also

- [ADR-006](006-extract-prepare-display-pipeline.md) — Historical three-layer split; middle layer was named “Decorate” in that ADR.
- [docs/extractor-pipeline.md](../extractor-pipeline.md) — Operational description of parse → transform → persist (current conventions).

## Context

ADR-006 names the second pipeline stage **Decorate** for trainer enrichment. We generalized the idea: any step after mechanical ASM parsing that augments data (metadata, mechanical display strings, joins) is a **transform**. We also want **formal code** to use **transform** (and concrete names like `transformTrainerMetadata`), not parallel **decorate** / **derive** vocabulary in identifiers.

## Decision

1. Use **transform** as the formal umbrella for the **post-parse, pre-persist** layer. It subsumes what ADR-006 called “Decorate” for trainers.
2. Keep **ADR-006** unchanged in its **Decision** section for historical accuracy; use **See also** for current naming.
3. Document **how we run extraction today** in [`docs/extractor-pipeline.md`](../extractor-pipeline.md), not by rewriting old ADRs.

## Consequences

**Pros:**

- One vocabulary for contributors and tools; less confusion with GoF “Decorator” if we avoid that word in code.
- ADR history stays readable as a record of past wording.

**Cons:**

- Readers must follow See also from ADR-006 to learn current terminology.

## Implementation Notes

- Entry point remains `npm run extract-data` ([`scripts/extract-data.js`](../../scripts/extract-data.js)).
