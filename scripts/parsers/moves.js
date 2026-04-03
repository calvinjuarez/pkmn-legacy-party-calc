/**
 * Extracts move data from Yellow Legacy ASM files.
 */

import { parseConstants, parseLiList } from '../lib/parse-asm.js'
import { ASM_TYPE_TO_DISPLAY } from '../lib/gen1-asm-maps.js'
import { toDisplayName } from '../lib/rom-display-names.js'

/**
 * @param {{ readAsm: (p: string) => string, readAsmLines: (p: string) => string[] }} readers
 */
export function extractMoves(readers) {
	const { readAsm, readAsmLines } = readers

	const moveConstLines = readAsmLines('constants/move_constants.asm')
	const moveConstants = parseConstants(moveConstLines)

	const namesLines = readAsmLines('data/moves/names.asm')
	const names = parseLiList(namesLines)

	const movesContent = readAsm('data/moves/moves.asm')
	const moves = []
	const moveRegex = /move\s+([\w_]+)\s*,\s*[\w_]+\s*,\s*(\d+)\s*,\s*([\w_]+)\s*,\s*(\d+)\s*,\s*(\d+)/g
	let match
	while ((match = moveRegex.exec(movesContent)) !== null) {
		const [, moveConst, power, typeConst, accuracy, pp] = match
		const index = moveConstants[moveConst]
		if (index === undefined || index >= names.length) continue
		if (index === 0) continue

		const rawName = names[index - 1]

		moves.push({
			id: moveConst,
			romName: rawName,
			displayName: toDisplayName(rawName),
			power: parseInt(power, 10),
			type: ASM_TYPE_TO_DISPLAY[typeConst] ?? typeConst,
			accuracy: parseInt(accuracy, 10),
			pp: parseInt(pp, 10),
		})
	}

	return moves
}
