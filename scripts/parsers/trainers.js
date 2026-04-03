/**
 * Pure parser: extracts trainer data (parties, names, special moves) from ASM files.
 * Returns raw data with no game knowledge. No categories, rematches, locations, or display names.
 */

import { parseLiList } from '../lib/parse-asm.js'

/**
 * @param {string} speciesId
 * @param {number} level
 * @param {{ pokemon: Array<{ id: string, level1Moves?: string[] }>, learnsets: Record<string, Array<{ level: number, move: string }>> }} deps
 */
export function getMovesAtLevel(speciesId, level, { pokemon, learnsets }) {
	const learnset = learnsets[speciesId] ?? []
	const species = Array.isArray(pokemon) ? pokemon.find(p => p.id === speciesId) : null
	const level1Moves = species?.level1Moves ?? []

	const moves = level1Moves.slice(0, 4).map(m => m || null)
	while (moves.length < 4) moves.push(null)

	const atLevel = learnset.filter(l => l.level <= level).sort((a, b) => a.level - b.level)
	for (const { move } of atLevel) {
		if (moves.includes(move)) continue
		const emptyIdx = moves.findIndex(m => m == null)
		if (emptyIdx >= 0) {
			moves[emptyIdx] = move
		} else {
			moves.shift()
			moves.push(move)
		}
	}

	return moves.slice(0, 4)
}

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

/**
 * @param {{ readAsm: (p: string) => string, readAsmLines: (p: string) => string[] }} readers
 * @param {{ pokemon: unknown[], learnsets: Record<string, unknown> }} deps In-memory data matching pokemon.json / learnsets.json shape
 */
export function extractTrainers(readers, { pokemon, learnsets }) {
	const { readAsm, readAsmLines } = readers

	const trainerConstLines = readAsmLines('constants/trainer_constants.asm')
	const trainerConstants = parseTrainerConstants(trainerConstLines)

	const namesLines = readAsmLines('data/trainers/names.asm')
	const names = parseLiList(namesLines)

	const specialMovesContent = readAsm('data/trainers/special_moves.asm')
	const specialMoves = {}

	const specialLines = specialMovesContent.split('\n')
	let currentTrainer = null
	let currentMoves = {}

	for (const line of specialLines) {
		const trainerMatch = line.match(/db\s+([A-Za-z_]\w*)\s*,\s*(\d+)\s*;?/)
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

	const partiesContent = readAsm('data/trainers/parties.asm')
	const trainers = []
	const classBlocks = partiesContent.split(/(\w+Data):/).slice(1)

	const moveDeps = { pokemon, learnsets }

	for (let i = 0; i < classBlocks.length; i += 2) {
		const className = classBlocks[i]?.replace('Data', '') ?? ''
		const blockContent = classBlocks[i + 1] ?? ''

		const constName = blockNameToConstant(className)
		const trainerClassId = trainerConstants[constName]
		const rawRomName = (trainerClassId != null ? names[trainerClassId - 1] : null) ?? className

		const entries = []
		const lines = blockContent.split('\n')

		for (const line of lines) {
			const trimmed = line.trim()
			if (trimmed.startsWith('assert')) continue
			if (trimmed.startsWith(';')) continue

			const uniformMatch = trimmed.match(/db\s+(\d+)\s*,\s*([\w\s,]+)/)
			if (uniformMatch) {
				const lvl = parseInt(uniformMatch[1], 10)
				const rest = uniformMatch[2].split(',').map(s => s.trim()).filter(Boolean)
				const species = rest.filter(s => !/^\d+$/.test(s) && s !== '0')
				if (species.length > 0) {
					const party = Array(species.length).fill(lvl).map((l, idx) => ({ level: l, species: species[idx] }))
					entries.push({ party })
				}
				continue
			}

			const varMatch = trimmed.match(/db\s+\$FF\s*,\s*([\w\s,]+)/)
			if (varMatch) {
				const parts = varMatch[1].split(',').map(s => s.trim()).filter(s => s !== '0')
				const party = []
				for (let j = 0; j < parts.length; j += 2) {
					const lvl = parseInt(parts[j], 10)
					const species = parts[j + 1]
					if (species && !isNaN(lvl)) {
						party.push({ level: lvl, species })
					}
				}
				if (party.length > 0) {
					entries.push({ party })
				}
			}
		}

		for (let entryId = 0; entryId < entries.length; entryId++) {
			const entry = entries[entryId]
			const trainerId = entryId + 1
			const variantKey = `${trainerClassId ?? className}_${trainerId}`
			const customMoves =
				specialMoves[variantKey] ??
				specialMoves[`${constName}_${trainerId}`] ??
				specialMoves[`${className}_${trainerId}`]

			const partyWithMoves = entry.party.map((p, slotIdx) => {
				const slot = slotIdx + 1
				const overrides = customMoves?.[String(slot)]
				const defaultMoves = getMovesAtLevel(p.species, p.level ?? 50, moveDeps)
				const moves = [...defaultMoves]
				if (overrides) {
					for (const [moveSlot, moveId] of Object.entries(overrides).sort(
						([a], [b]) => parseInt(a, 10) - parseInt(b, 10)
					)) {
						const idx = parseInt(moveSlot, 10) - 1
						if (idx >= 0 && idx < 4) moves[idx] = moveId
					}
				}
				return { ...p, moves: moves.filter(Boolean) }
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
