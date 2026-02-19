/**
 * Extracts move data from Yellow Legacy ASM files.
 * Output: src/data/moves.json
 */

import fs from 'fs'
import path from 'path'
import { readAsmLines, readAsm, parseConstants, parseLiList, toDisplayName } from '../lib/parse-asm.js'

const OUTPUT_PATH = path.join(process.cwd(), 'src/data/moves.json')

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
	BIRD: 'Normal',
}

function extractMoves() {
	// 1. Parse move constants
	const moveConstLines = readAsmLines('constants/move_constants.asm')
	const moveConstants = parseConstants(moveConstLines)

	// 2. Parse move names (li format)
	const namesLines = readAsmLines('data/moves/names.asm')
	const names = parseLiList(namesLines)

	// 3. Parse moves.asm - move NAME, effect, power, type, accuracy, pp
	const movesContent = readAsm('data/moves/moves.asm')
	const moves = []
	const moveRegex = /move\s+([\w_]+)\s*,\s*[\w_]+\s*,\s*(\d+)\s*,\s*([\w_]+)\s*,\s*(\d+)\s*,\s*(\d+)/g
	let match
	while ((match = moveRegex.exec(movesContent)) !== null) {
		const [, moveConst, power, typeConst, accuracy, pp] = match
		const index = moveConstants[moveConst]
		if (index === undefined || index >= names.length) continue
		if (index === 0) continue // NO_MOVE

		const rawName = names[index - 1] // NO_MOVE is 0, POUND is 1, so names[0]=POUND

		moves.push({
			id: moveConst,
			romName: rawName,
			displayName: toDisplayName(rawName),
			power: parseInt(power, 10),
			type: TYPE_MAP[typeConst] ?? typeConst,
			accuracy: parseInt(accuracy, 10),
			pp: parseInt(pp, 10),
		})
	}

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(moves, null, '\t'))
	console.log(`Wrote ${moves.length} moves to ${OUTPUT_PATH}`)
}

extractMoves()
