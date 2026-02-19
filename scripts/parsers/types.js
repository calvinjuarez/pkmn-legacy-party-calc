/**
 * Extracts type effectiveness from Yellow Legacy type_matchups.asm.
 * Output: src/data/types.json
 */

import fs from 'fs'
import path from 'path'
import { readAsm } from '../lib/parse-asm.js'

const OUTPUT_PATH = path.join(process.cwd(), 'src/data/types.json')

const TYPE_MAP = {
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
}

const EFFECT_MAP = {
	SUPER_EFFECTIVE: 2,
	NOT_VERY_EFFECTIVE: 0.5,
	NO_EFFECT: 0,
}

function extractTypes() {
	const content = readAsm('data/types/type_matchups.asm')
	// SUPER_EFFECTIVE, NOT_VERY_EFFECTIVE, NO_EFFECT - we'll hardcode for simplicity
	const matchups = []
	const matchupRegex = /db\s+(\w+)\s*,\s*(\w+)\s*,\s*(\w+)/g
	let m
	while ((m = matchupRegex.exec(content)) !== null) {
		const [, attacker, defender, effect] = m
		if (attacker === '-1' || defender === '-1') break
		const effectVal = EFFECT_MAP[effect]
		matchups.push({
			attacker: TYPE_MAP[attacker] ?? attacker,
			defender: TYPE_MAP[defender] ?? defender,
			effect: effectVal ?? 1,
		})
	}

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ matchups }, null, '\t'))
	console.log(`Wrote ${matchups.length} type matchups to ${OUTPUT_PATH}`)
}

extractTypes()
