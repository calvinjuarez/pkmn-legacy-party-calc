/**
 * Gen 1 ASM constant names → display strings used when building extracted JSON.
 */

/** ASM type constant → @smogon/calc-style type name */
export const ASM_TYPE_TO_DISPLAY = {
	NORMAL: 'Normal',
	FIRE: 'Fire',
	WATER: 'Water',
	GRASS: 'Grass',
	ELECTRIC: 'Electric',
	ICE: 'Ice',
	FIGHTING: 'Fighting',
	POISON: 'Poison',
	GROUND: 'Ground',
	FLYING: 'Flying',
	PSYCHIC_TYPE: 'Psychic',
	BUG: 'Bug',
	ROCK: 'Rock',
	GHOST: 'Ghost',
	DRAGON: 'Dragon',
	BIRD: 'Normal', // Gen 1 placeholder for typeless
}

/** type_matchups.asm effect constant → multiplier */
export const ASM_EFFECT_TO_MULTIPLIER = {
	SUPER_EFFECTIVE: 2,
	NOT_VERY_EFFECTIVE: 0.5,
	NO_EFFECT: 0,
}
