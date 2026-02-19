/**
 * Extracts level-up learnsets from Yellow Legacy evos_moves.asm.
 * Output: src/data/learnsets.json
 */

import fs from 'fs'
import path from 'path'
import { readAsm, readAsmLines, parseConstants } from '../lib/parse-asm.js'

const LEGACY_ROOT = path.join(process.cwd(), 'yellow-legacy-v1.0.9')
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/learnsets.json')

function extractLearnsets() {
	// Build species IDs in pokemon_constants order (including null for const_skip gaps)
	const monConstLines = readAsmLines('constants/pokemon_constants.asm')
	const monConstants = parseConstants(monConstLines)
	const maxVal = Math.max(...Object.values(monConstants))
	const speciesIdsInOrder = []
	for (let v = 1; v <= maxVal; v++) {
		const name = Object.entries(monConstants).find(([, val]) => val === v)?.[0]
		speciesIdsInOrder.push(name ?? null)
	}

	const evosContent = readAsm('data/pokemon/evos_moves.asm')
	const lines = evosContent.split('\n')

	const learnsets = {}
	let currentSpecies = null
	let inLearnset = false

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// Match block start: RhydonEvosMoves:
		const blockMatch = line.match(/^(\w+)EvosMoves:\s*$/)
		if (blockMatch) {
			currentSpecies = null
			inLearnset = false
			// Map block name to species index via EvosMovesPointerTable order
			// We'll match by iterating - the table is before the blocks
			continue
		}

		// Match ; Learnset
		if (line.includes('; Learnset')) {
			inLearnset = true
			continue
		}

		// In learnset: db level, MOVE
		if (inLearnset) {
			const moveMatch = line.match(/db\s+(\d+)\s*,\s*(\w+)/)
			if (moveMatch) {
				const [, level, move] = moveMatch
				if (move !== '0' && parseInt(level, 10) > 0) {
					if (!currentSpecies) continue
					if (!learnsets[currentSpecies]) {
						learnsets[currentSpecies] = []
					}
					learnsets[currentSpecies].push({ level: parseInt(level, 10), move })
				}
			} else if (line.match(/db\s+0/)) {
				inLearnset = false
			}
		}
	}

	// The evos blocks are in EvosMovesPointerTable order = pokemon_constants order
	const blockOrder = [...evosContent.matchAll(/(\w+)EvosMoves:\s*$/gm)].map(m => m[1])
	const learnsetsBySpecies = {}

	for (let i = 0; i < blockOrder.length && i < speciesIdsInOrder.length; i++) {
		const blockName = blockOrder[i]
		const speciesId = speciesIdsInOrder[i]
		if (!speciesId) continue

		// Extract learnset for this block
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

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(learnsetsBySpecies, null, '\t'))
	console.log(`Wrote learnsets for ${Object.keys(learnsetsBySpecies).length} species to ${OUTPUT_PATH}`)
}

extractLearnsets()
