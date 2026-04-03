/**
 * Extracts level-up learnsets from Yellow Legacy evos_moves.asm.
 */

import { parseConstants } from '../lib/parse-asm.js'

/**
 * @param {{ readAsm: (p: string) => string, readAsmLines: (p: string) => string[] }} readers
 */
export function extractLearnsets(readers) {
	const { readAsm, readAsmLines } = readers

	const monConstLines = readAsmLines('constants/pokemon_constants.asm')
	const monConstants = parseConstants(monConstLines)
	const maxVal = Math.max(...Object.values(monConstants))
	const speciesIdsInOrder = []
	for (let v = 1; v <= maxVal; v++) {
		const name = Object.entries(monConstants).find(([, val]) => val === v)?.[0]
		speciesIdsInOrder.push(name ?? null)
	}

	const evosContent = readAsm('data/pokemon/evos_moves.asm')

	const blockOrder = [...evosContent.matchAll(/(\w+)EvosMoves:\s*$/gm)].map(m => m[1])
	const learnsetsBySpecies = {}

	for (let i = 0; i < blockOrder.length && i < speciesIdsInOrder.length; i++) {
		const blockName = blockOrder[i]
		const speciesId = speciesIdsInOrder[i]
		if (!speciesId) continue

		const blockStart = evosContent.indexOf(blockName + 'EvosMoves:')
		const nextBlock = blockOrder[i + 1]
		const blockEnd = nextBlock
			? evosContent.indexOf(nextBlock + 'EvosMoves:')
			: evosContent.length
		const block = evosContent.slice(blockStart, blockEnd)

		const moves = []
		const learnsetStart = block.indexOf('; Learnset')
		if (learnsetStart >= 0) {
			const learnsetSection = block.slice(learnsetStart)
			const moveMatches = [...learnsetSection.matchAll(/db\s+(\d+)\s*,\s*(\w+)/g)]
			for (const m of moveMatches) {
				const level = parseInt(m[1], 10)
				const move = m[2]
				if (level > 0 && move !== '0') {
					moves.push({ level, move })
				}
			}
		}

		if (moves.length > 0) {
			learnsetsBySpecies[speciesId] = moves
		}
	}

	return learnsetsBySpecies
}
