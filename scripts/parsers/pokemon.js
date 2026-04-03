/**
 * Extracts Pokemon species data from Yellow Legacy ASM files.
 */

import fs from 'fs'
import path from 'path'
import { parseConstants, parseDbStrings } from '../lib/parse-asm.js'
import { ASM_TYPE_TO_DISPLAY } from '../lib/gen1-asm-maps.js'
import { toDisplayName } from '../lib/rom-display-names.js'

function parseBaseStatsFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8')
	const lines = content.split('\n')

	let hp = 0, atk = 0, def = 0, spe = 0, spc = 0
	let type1 = 'Normal', type2 = 'Normal'
	let level1Moves = []
	let tmhm = []

	for (const line of lines) {
		const statsMatch = line.match(/db\s+(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
		if (statsMatch) {
			hp = parseInt(statsMatch[1], 10)
			atk = parseInt(statsMatch[2], 10)
			def = parseInt(statsMatch[3], 10)
			spe = parseInt(statsMatch[4], 10)
			spc = parseInt(statsMatch[5], 10)
			continue
		}

		const typeMatch = line.match(/db\s+(\w+)\s*,\s*(\w+)\s*;?\s*type/)
		if (typeMatch) {
			type1 = ASM_TYPE_TO_DISPLAY[typeMatch[1]] ?? typeMatch[1]
			type2 = ASM_TYPE_TO_DISPLAY[typeMatch[2]] ?? typeMatch[2]
			continue
		}

		const movesMatch = line.match(/db\s+([\w_]+)\s*,\s*([\w_]+)\s*,\s*([\w_]+)\s*,\s*([\w_]+)/)
		if (movesMatch && !line.includes('tmhm')) {
			level1Moves = [movesMatch[1], movesMatch[2], movesMatch[3], movesMatch[4]]
				.filter(m => m !== 'NO_MOVE')
			continue
		}

		const tmMatch = line.match(/tmhm\s+(.+)/)
		if (tmMatch) {
			const tms = tmMatch[1].replace(/\\/g, '').split(/[\s,]+/).filter(Boolean)
			tmhm = tms.filter(t => t !== 'end' && t !== ';')
		}
	}

	return {
		baseStats: { hp, atk, def, spe, spc },
		types: [type1, type2].filter(t => t !== 'Normal' || type1 === 'Normal'),
		level1Moves,
		tmhm,
	}
}

/**
 * @param {{ readAsm: (p: string) => string, readAsmLines: (p: string) => string[] }} readers
 * @param {{ legacyRoot: string }} options Absolute path to ROM hack root
 */
export function extractPokemon(readers, { legacyRoot }) {
	const { readAsm, readAsmLines } = readers

	const dexConstLines = readAsmLines('constants/pokedex_constants.asm')
	const dexConstants = parseConstants(dexConstLines)

	const monConstLines = readAsmLines('constants/pokemon_constants.asm')
	const monConstants = parseConstants(monConstLines)

	const namesContent = readAsm('data/pokemon/names.asm')
	const names = parseDbStrings(namesContent.split('\n'))

	const dexOrderLines = readAsmLines('data/pokemon/dex_order.asm')
	const dexOrder = []
	for (const line of dexOrderLines) {
		const match = line.match(/db\s+(DEX_\w+)/)
		if (match) {
			const dexId = dexConstants[match[1]]
			dexOrder.push(dexId ?? 0)
		} else if (line.match(/db\s+0/)) {
			dexOrder.push(0)
		}
	}

	const dexIdToConstant = {}
	for (const [name, value] of Object.entries(dexConstants)) {
		if (value >= 1 && value <= 151) {
			dexIdToConstant[value] = name.replace('DEX_', '')
		}
	}

	const baseStatsContent = readAsm('data/pokemon/base_stats.asm')
	const includeMatches = [...baseStatsContent.matchAll(/INCLUDE\s+"data\/pokemon\/base_stats\/([\w.]+)\.asm"/g)]
	const baseStatsFiles = includeMatches.map(m => m[1])

	const baseStatsDir = path.join(legacyRoot, 'data/pokemon/base_stats')

	const pokemon = []
	const seenIds = new Set()

	for (let i = 0; i < names.length; i++) {
		const dexId = dexOrder[i]
		if (!dexId || dexId === 0) continue

		const id = dexIdToConstant[dexId]
		if (!id || seenIds.has(id)) continue
		seenIds.add(id)

		const fileIndex = dexId - 1
		if (fileIndex < 0 || fileIndex >= baseStatsFiles.length) continue

		const fileName = baseStatsFiles[fileIndex] + '.asm'
		const baseStatsPath = path.join(baseStatsDir, fileName)
		if (!fs.existsSync(baseStatsPath)) continue

		const stats = parseBaseStatsFile(baseStatsPath)
		pokemon.push({
			id,
			romName: names[i],
			displayName: toDisplayName(names[i]),
			dexId,
			...stats,
		})
	}

	return pokemon
}
