/**
 * POKEMON TYPE CHART IMPLEMENTATION (Gen 1, 2, and Legacy Hacks)
 * ----------------------------------------
 *
 * Illustrative model of type effectiveness as if stored in the Gen 1 format:
 * flat [AttackID, DefendID, Effect] with effect 20/5/0 as branch keys.
 *
 * Models vanilla Gen 1, Gen 2, and (a hypothetical/extrapolated) Gen 6, as well
 * as Yellow Legacy v1.0.9.
 *
 * Storage: Flat Uint8Array of [AttackID, DefendID, Effect]
 * Effect values: 20 (super), 05 (not very), 00 (no effect), used as logical
 * branch keys, not as multipliers in any calculation.
 *
 * Sources:
 * - Gen 1: github.com/pret/pokered:/data/types/type_matchups.asm
 * - Gen 2: github.com/pret/pokecrystal:/data/types/type_matchups.asm
 * - Gen 6: (I googled the changes and made it up)
 * - Yellow Legacy: yellow-legacy-v1.0.9/data/types/type_matchups.asm
 */

/**
 * 1. Define Internal Type IDs (Gen 1 constants)
 */
// GEN 1
// - 0x06 is labeled as BIRD type; it was used as "UNTYPED"/placeholder type in
//   the code.  Some status-only moves had that type, as did "STRUGGLE", the
//   move used when a pokemon has no pp left for any learned moves.  It was
//   listed as a physical move type.
// - In Red and Blue, physical/special was determined by comparing the type's
//   index against the SPECIAL constant, `0x14` (20).  Types < 20 are physical;
//   >= 20, special.
// - Types 0x09-0x13 were explicitly listed as "UNUSED" in the code.  Perhaps
//   they were intended for space for additional types.  In any case, they took
//   advantage of the gap in gen 2 when they introduced STEEL as another type in
//   the PHYSICAL range.
const NORMAL = 0x00, FIGHTING = 0x01, FLYING = 0x02, POISON = 0x03,
		GROUND = 0x04, ROCK = 0x05, BUG = 0x07, GHOST = 0x08,
		FIRE = 0x14, WATER = 0x15, GRASS = 0x16, ELECTRIC = 0x17,
		PSYCHIC = 0x18, ICE = 0x19, DRAGON = 0x1A;

// GEN 2
// - STEEL was added in the PHYSICAL range, DARK in the SPECIAL range.
// - Gen 2 introduced the move CURSE with its own move type, CURSE.  That type
//   was given the index 0x13 (19), the final value in the explicit UNUSED_TYPES
//   range. The physical/special check would classify the type as Physical, but
//   it never actually runs because CURSE is not a damaging move (non-ghosts
//   trade speed -1 for attack +1 and defense +1; ghosts trade 50% user hp once
//   for recurring 25% target hp per turn).
const STEEL = 0x09, DARK = 0x1B;


// GEN 6 (just for fun)
// - Physical and special were decoupled from types in Gen 4.  Fairy was added
//   in gen 6.  This model is aimed at showing how Gens 1 and 2 were implemented,
//   so this "FAIRY" implementation here in this model is completely made up.
//   I put it in the SPECIAL range because it feels "special" to me.
const FAIRY = 0x1C;

// Effect constants; only used as if/elseif branches, NOT in the actual calculation.
const SUPER = 20, NOT_VERY = 5, NONE = 0;

/**
 * 2. The Type Effectiveness Table
 *
 * Note: the original data didn't have the matchups ordered by attacker as we do.
 * This model is not going to model source order, etc.  I'm just trying to show
 * _how_ this part of the code was structured.
 */
const gen1TypeChart = new Uint8Array([

	// WATER
	WATER, FIRE, SUPER,
	WATER, ROCK, SUPER,
	WATER, GROUND, SUPER,
	WATER, WATER, NOT_VERY,
	WATER, GRASS, NOT_VERY,
	WATER, DRAGON, NOT_VERY,

	// FIRE
	FIRE, GRASS, SUPER,
	FIRE, ICE, SUPER,
	FIRE, BUG, SUPER,
	FIRE, FIRE, NOT_VERY,
	FIRE, WATER, NOT_VERY,
	FIRE, ROCK, NOT_VERY,
	FIRE, DRAGON, NOT_VERY,

	// GRASS
	GRASS, WATER, SUPER,
	GRASS, ROCK, SUPER,
	GRASS, GROUND, SUPER,
	GRASS, FIRE, NOT_VERY,
	GRASS, GRASS, NOT_VERY,
	GRASS, POISON, NOT_VERY,
	GRASS, FLYING, NOT_VERY,
	GRASS, BUG, NOT_VERY,
	GRASS, DRAGON, NOT_VERY,

	// ELECTRIC
	ELECTRIC, WATER, SUPER,
	ELECTRIC, FLYING, SUPER,
	ELECTRIC, ELECTRIC, NOT_VERY,
	ELECTRIC, GRASS, NOT_VERY,
	ELECTRIC, DRAGON, NOT_VERY,
	ELECTRIC, GROUND, NONE,

	// ICE
	ICE, WATER, NOT_VERY,
	ICE, GRASS, SUPER,
	ICE, GROUND, SUPER,
	ICE, FLYING, SUPER,
	ICE, ICE, NOT_VERY,
	ICE, DRAGON, SUPER,

	// FIGHTING
	FIGHTING, NORMAL, SUPER,
	FIGHTING, POISON, NOT_VERY,
	FIGHTING, FLYING, NOT_VERY,
	FIGHTING, PSYCHIC, NOT_VERY,
	FIGHTING, BUG, NOT_VERY,
	FIGHTING, ROCK, SUPER,
	FIGHTING, ICE, SUPER,
	FIGHTING, GHOST, NONE,

	// POISON
	POISON, GRASS, SUPER,
	POISON, POISON, NOT_VERY,
	POISON, GROUND, NOT_VERY,
	POISON, BUG, SUPER,
	POISON, ROCK, NOT_VERY,
	POISON, GHOST, NOT_VERY,

	// GROUND
	GROUND, FIRE, SUPER,
	GROUND, ELECTRIC, SUPER,
	GROUND, GRASS, NOT_VERY,
	GROUND, BUG, NOT_VERY,
	GROUND, ROCK, SUPER,
	GROUND, POISON, SUPER,
	GROUND, FLYING, NONE,

	// FLYING
	FLYING, ELECTRIC, NOT_VERY,
	FLYING, FIGHTING, SUPER,
	FLYING, BUG, SUPER,
	FLYING, GRASS, SUPER,
	FLYING, ROCK, NOT_VERY,

	// PSYCHIC
	PSYCHIC, FIGHTING, SUPER,
	PSYCHIC, POISON, SUPER,
	PSYCHIC, PSYCHIC, NOT_VERY,

	// BUG
	BUG, FIRE, NOT_VERY,
	BUG, GRASS, SUPER,
	BUG, FIGHTING, NOT_VERY,
	BUG, FLYING, NOT_VERY,
	BUG, POISON, SUPER,
	BUG, PSYCHIC, SUPER,
	BUG, GHOST, NOT_VERY,

	// ROCK
	ROCK, FIRE, SUPER,
	ROCK, FIGHTING, NOT_VERY,
	ROCK, GROUND, NOT_VERY,
	ROCK, FLYING, SUPER,
	ROCK, BUG, SUPER,
	ROCK, ICE, SUPER,

	// GHOST
	// #bug_1: In GEN 1, this was mistakenly set to NONE (0). In practice, this
	// only affected 1 move, Lick.  The only other ghost moves ignored type-based
	// modifiers. (Confuse Ray just confuses, so no damage is calculated; and
	// Night Shade deals damage equal to the user's level—ignoring all typing,
	// stat boosts, etc.)
	GHOST, PSYCHIC, NONE,
	GHOST, GHOST, SUPER,
	GHOST, NORMAL, NONE,

	// NORMAL
	NORMAL, ROCK, NOT_VERY,
	NORMAL, GHOST, NONE,

	// DRAGON
	DRAGON, DRAGON, SUPER,

	// Sentinel value: End of Table
	0xFF
]);

// A utility so the next gen type charts can be listed as deltas rather than
// having to fully list everything all over again.
function applyTypeChartChanges(baseChart, { rebalances = [], additions = new Uint8Array(0) }) {
	const rebalanceAdditions = rebalances.filter((r) => r.length === 3).flat();
	const exclude = new Set(rebalances.map((r) => `${r[0]},${r[1]}`));
	const kept = [];

	for (let i = 0; i < baseChart.length; i += 3) {
		if (baseChart[i] === 0xFF) break;
		if (!exclude.has(`${baseChart[i]},${baseChart[i + 1]}`)) {
			kept.push(baseChart[i], baseChart[i + 1], baseChart[i + 2]);
		}
	}

	return new Uint8Array([...kept, ...rebalanceAdditions, ...additions, 0xFF]);
}

/**
 * 2.1. Gen 1 → Gen 2
 */
const gen2TypeChart = applyTypeChartChanges(gen1TypeChart, {
	rebalances: [
		// #bug_1_fix: Gen 2 fixed the bug where Psychic was immune to Ghost
		// instead of weak to it.
		[GHOST, PSYCHIC, SUPER],
		// In Gen 1, bug and poison were weak to each other. Gen 2 rebalanced this
		// interaction:
		[BUG, POISON, NOT_VERY], // - bug is not very effective vs poison
		[POISON, BUG],           // - poison is neutral vs bug
		// Ice was rebalanced to be weak against fire.
		[ICE, FIRE, NOT_VERY],
	],
	additions: new Uint8Array([

		// STEEL
		STEEL, ROCK, SUPER,
		STEEL, ICE, SUPER,
		STEEL, STEEL, NOT_VERY,
		STEEL, FIRE, NOT_VERY,
		STEEL, WATER, NOT_VERY,
		STEEL, ELECTRIC, NOT_VERY,
		// Weaknesses
		FIRE, STEEL, SUPER,
		FIGHTING, STEEL, SUPER,
		GROUND, STEEL, SUPER,
		// Resistances
		NORMAL, STEEL, NOT_VERY,
		FLYING, STEEL, NOT_VERY,
		ROCK, STEEL, NOT_VERY,
		BUG, STEEL, NOT_VERY,
		GRASS, STEEL, NOT_VERY,
		PSYCHIC, STEEL, NOT_VERY,
		ICE, STEEL, NOT_VERY,
		DRAGON, STEEL, NOT_VERY,
		GHOST, STEEL, NOT_VERY,
		// Immunities
		POISON, STEEL, NONE,

		// DARK
		DARK, STEEL, NOT_VERY,
		DARK, PSYCHIC, SUPER,
		DARK, GHOST, SUPER,
		DARK, DARK, NOT_VERY,
		DARK, FIGHTING, NOT_VERY,
		// Weaknesses
		BUG, DARK, SUPER,
		FIGHTING, DARK, SUPER,
		// Resistances
		GHOST, DARK, NOT_VERY,
		// Immunities
		PSYCHIC, DARK, NONE,

	]),
});

/**
 * 2.2. Gen 2 → Gen 6
 */
const gen6TypeChart = applyTypeChartChanges(gen2TypeChart, {
	rebalances: [
		// Steel loses Ghost and Dark resistances; you can now bite Steelix for
		// neutral damage.
		[GHOST, STEEL],
		[DARK, STEEL],
	],
	additions: new Uint8Array([

		// FAIRY
		FAIRY, DRAGON, SUPER,
		FAIRY, FIGHTING, SUPER,
		FAIRY, DARK, SUPER,
		FAIRY, FIRE, NOT_VERY,
		FAIRY, POISON, NOT_VERY,
		FAIRY, STEEL, NOT_VERY,
		// Weaknesses
		FIRE, FAIRY, SUPER,
		POISON, FAIRY, SUPER,
		STEEL, FAIRY, SUPER,
		// Resistances
		FIGHTING, FAIRY, NOT_VERY,
		BUG, FAIRY, NOT_VERY,
		DARK, FAIRY, NOT_VERY,
		// Immunities
		DRAGON, FAIRY, NONE,

	]),
});

/**
 * 3. The Calculation Engine
 * Port of AdjustDamageForMoveType: we operate on a running effectiveness value,
 * branching on the stored effect (20/5/0)—double, halve, or zero. The values
 * are never divided; they are comparison keys only.
 */
function gen1CalculateEffectiveness(moveType, targetTypes, typeChart = gen1TypeChart) {
	let effectiveness = 10; // 1x (game stores as int; we divide by 10 at return)

	targetTypes.forEach(defType => {
		for (let i = 0; i < typeChart.length; i += 3) {
			const atk = typeChart[i];
			if (atk === 0xFF) break;

			const def = typeChart[i + 1];
			const effect = typeChart[i + 2];

			if (atk === moveType && def === defType) {
				if (effect === NONE) {
					effectiveness = 0;
				} else if (effect === NOT_VERY) {
					// In binary, each bit is a power of 2. Shifting right drops the
					// lowest bit, so we divide by 2.  Because that bit is dropped,
					// we also drop any remainder, so (5 >> 1 = 2) NOT (5 / 2 = 2.5)
					effectiveness >>= 1;
				} else if (effect === SUPER) {
					// Shifting left adds a zero in the low bit, which is what
					// doubling actually does in binary.
					effectiveness <<= 1;
				}
				break;
			}
		}
	});

	return effectiveness / 10; // divide to a 0-1 style multiplier
}

/**
 * 3.1. Gen 2-style calculation: multiply type modifiers directly instead of shifting.
 * Gen 1 used bit shifts on an integer (10→5→2), which truncates. Gen 2 converts
 * each effect to a multiplier (20→2, 5→0.5, 0→0) and multiplies—division allows
 * decimals, so 0.5 × 0.5 = 0.25x for double resistance.
 */
function gen2CalculateEffectiveness(moveType, targetTypes, typeChart = gen2TypeChart) {
	let multiplier = 1;

	targetTypes.forEach(defType => {
		for (let i = 0; i < typeChart.length; i += 3) {
			const atk = typeChart[i];
			if (atk === 0xFF) break;

			const def = typeChart[i + 1];
			const effect = typeChart[i + 2];

			if (atk === moveType && def === defType) {
				if (effect === NONE) {
					multiplier = 0;
				} else if (effect === NOT_VERY) {
					// Division (5/10) yields 0.5; multiplying by a float preserves
					// decimals. Double resistance: 0.5 × 0.5 = 0.25x, not 0.2x.
					multiplier *= 0.5;
				} else if (effect === SUPER) {
					// 20/10 = 2. Same idea: multiply by the decoded value.
					multiplier *= 2;
				}
				break;
			}
		}
	});

	return multiplier;
}

/**
 * 3.2. Gen 6-style calculation: no change to the calculation itself, just the types.
 */
function gen6CalculateEffectiveness(moveType, targetTypes, typeChart = gen6TypeChart) {
	return gen2CalculateEffectiveness(moveType, targetTypes, typeChart);
}


/**
 * 4. The Legacy ROM Hacks
 */

/**
 * 4.1. Yellow Legacy
 */
// YELLOW LEGACY v1.0.9
const yellowLegacy109TypeChart = applyTypeChartChanges(gen1TypeChart, {
	rebalances: [
		// #bug_1_fix: Applies the gen 2 fix
		[GHOST, PSYCHIC, SUPER],
		// Bug vs Poison: was SUPER, now neutral. (Poison vs Bug stays 2×.)
		// This gives poison a _similar_ advantage to what gen 2's rebalance does
		// (i.e. poison is more effective vs bug than bug is vs poison), without
		// completely implementing that change, which was made in the context of
		// the steel and dark additions.
		[BUG, POISON],
	],
	additions: new Uint8Array([]),
});

// The hack makes no change to how effectiveness is calculated, preserving the
// "2x resistance is 0.2x, not 0.25x" quirk, in its effort to stay faithful to
// the charming quirks of the original game (while removing irritating ones).
function yellowLegacy109CalculateEffectiveness(moveType, targetTypes, typeChart = yellowLegacy109TypeChart) {
	return gen1CalculateEffectiveness(moveType, targetTypes, typeChart);
}
