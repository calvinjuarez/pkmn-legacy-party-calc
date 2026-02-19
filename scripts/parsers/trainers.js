/**
 * Pure parser: extracts trainer data (parties, names, special moves) from ASM files.
 * Returns raw data with no game knowledge. No categories, rematches, locations, or display names.
 * Use prepare-data.js to enrich this output for a specific game version.
 */

import { parseLiList, readAsm, readAsmLines } from '../lib/parse-asm.js'

// Block names that don't follow standard CamelCase -> UPPER_SNAKE conversion
const BLOCK_NAME_TO_CONSTANT = {
	Psychic: 'PSYCHIC_TR',
}

function blockNameToConstant(name) {
	if (BLOCK_NAME_TO_CONSTANT[name]) return BLOCK_NAME_TO_CONSTANT[name]
	return name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
}

function parseTrainerConstants(lines) {
	const result = {}
	let value = 0
	for (const line of lines) {
		const trimmed = line.trim()
		if (trimmed.match(/^const_def\s*$/)) {
			value = 0
		} else if (trimmed.match(/^const_def\s+(\d+)/)) {
			value = parseInt(trimmed.match(/^const_def\s+(\d+)/)[1], 10)
		} else if (trimmed.match(/^trainer_const\s+(\w+)/)) {
			const name = trimmed.match(/^trainer_const\s+(\w+)/)[1]
			result[name] = value
			value++
		}
	}
	return result
}

export function extractRawTrainers() {
	// 1. Parse trainer constants (uses trainer_const macro, not plain const)
	const trainerConstLines = readAsmLines('constants/trainer_constants.asm')
	const trainerConstants = parseTrainerConstants(trainerConstLines)

	// 2. Parse trainer names
	const namesLines = readAsmLines('data/trainers/names.asm')
	const names = parseLiList(namesLines)

	// 3. Parse special moves: db TRAINER_CLASS, TRAINER_ID, then db slot, move_slot, move_id
	const specialMovesContent = readAsm('data/trainers/special_moves.asm')
	const specialMoves = {}

	const specialLines = specialMovesContent.split('\n')
	let currentTrainer = null
	let currentMoves = {}

	for (const line of specialLines) {
		const trainerMatch = line.match(/db\s+(\w+)\s*,\s*(\d+)\s*;?/)
		if (trainerMatch) {
			if (currentTrainer) {
				specialMoves[currentTrainer] = { ...currentMoves }
			}
			const [, cls, id] = trainerMatch
			currentTrainer = `${trainerConstants[cls] ?? cls}_${id}`
			currentMoves = {}
			continue
		}

		const moveMatch = line.match(/db\s+(\d+)\s*,\s*(\d+)\s*,\s*(\w+)/)
		if (moveMatch && currentTrainer) {
			const [, slot, moveSlot, moveId] = moveMatch
			if (!currentMoves[slot]) currentMoves[slot] = {}
			currentMoves[slot][moveSlot] = moveId
		} else if (line.match(/db\s+0\s*$/) && currentTrainer) {
			specialMoves[currentTrainer] = { ...currentMoves }
			currentTrainer = null
			currentMoves = {}
		}
	}

	// 4. Parse parties.asm - mechanical extraction, no comment parsing
	const partiesContent = readAsm('data/trainers/parties.asm')
	const trainers = []
	const classBlocks = partiesContent.split(/(\w+Data):/).slice(1)

	for (let i = 0; i < classBlocks.length; i += 2) {
		const className = classBlocks[i]?.replace('Data', '') ?? ''
		const blockContent = classBlocks[i + 1] ?? ''

		const constName = blockNameToConstant(className)
		const trainerClassId = trainerConstants[constName]
		const rawRomName = (trainerClassId != null ? names[trainerClassId - 1] : null) ?? className

		// Parse party entries: db level, species... or db $FF, level, species, level, species...
		const entries = []
		const lines = blockContent.split('\n')

		for (const line of lines) {
			const trimmed = line.trim()
			if (trimmed.startsWith('assert')) continue
			if (trimmed.startsWith(';')) continue

			// Format 1: db 11, RATTATA, EKANS, 0
			const uniformMatch = trimmed.match(/db\s+(\d+)\s*,\s*([\w\s,]+)/)
			if (uniformMatch) {
				const level = parseInt(uniformMatch[1], 10)
				const rest = uniformMatch[2].split(',').map(s => s.trim()).filter(Boolean)
				const species = rest.filter(s => !/^\d+$/.test(s) && s !== '0')
				if (species.length > 0) {
					const party = Array(species.length).fill(level).map((l, idx) => ({ level: l, species: species[idx] }))
					entries.push({ party })
				}
				continue
			}

			// Format 2: db $FF, 10, GEODUDE, 12, ONIX, 0
			const varMatch = trimmed.match(/db\s+\$FF\s*,\s*([\w\s,]+)/)
			if (varMatch) {
				const parts = varMatch[1].split(',').map(s => s.trim()).filter(s => s !== '0')
				const party = []
				for (let j = 0; j < parts.length; j += 2) {
					const level = parseInt(parts[j], 10)
					const species = parts[j + 1]
					if (species && !isNaN(level)) {
						party.push({ level, species })
					}
				}
				if (party.length > 0) {
					entries.push({ party })
				}
			}
		}

		for (let entryId = 0; entryId < entries.length; entryId++) {
			const entry = entries[entryId]
			const variantKey = `${trainerClassId ?? className}_${entryId}`
			const customMoves = specialMoves[variantKey] ?? specialMoves[`${className}_${entryId}`]

			const partyWithMoves = entry.party.map((p, slotIdx) => {
				const slot = slotIdx + 1
				const overrides = customMoves?.[String(slot)]
				let moves = []
				if (overrides) {
					moves = Object.entries(overrides)
						.sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
						.map(([, move]) => move)
				}
				return { ...p, moves }
			})

			trainers.push({
				class: className,
				classId: trainerClassId,
				romName: rawRomName,
				variantId: entryId,
				party: partyWithMoves,
			})
		}
	}

	return trainers
}
