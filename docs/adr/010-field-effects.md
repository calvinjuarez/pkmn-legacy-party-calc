# ADR-010: Gen 1 Field Effects in Damage Calc

## Context

The damage calculator supports field effects that modify damage and KO chance. We need to know which effects exist in Gen 1 and affect the calc.

## Decision

**Gen 1 effects we support:**
- **Reflect** – Doubles defender's Defense vs physical moves (ignored on crit)
- **Light Screen** – Doubles defender's Special vs special moves (ignored on crit)
- **Leech Seed** – Defender loses 1/16 max HP per turn; attacker gains that as recovery. Affects KO chance (healing/drain), not raw damage formula

**Effects not in scope:** Mist (stat drops), Focus Energy (crit rate; we use a separate crit checkbox)

## Status

Accepted. The battle UI exposes Reflect, Light Screen, and Leech Seed per side.
