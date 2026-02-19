/**
 * Extracts Pokemon species data from Yellow Legacy ASM files.
 * Output: src/data/pokemon.json
 */

import fs from 'fs'
import path from 'path'
import { readAsmLines, readAsm, parseConstants, parseDbStrings, toDisplayName } from '../lib/parse-asm.js'

const LEGACY_ROOT = path.join(process.cwd(), 'yellow-legacy-v1.0.9')
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/pokemon.json')

// Type constant to smogon/calc type name
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
	BIRD: 'Normal', // Gen 1 uses BIRD as placeholder for typeless
}

function parseBaseStatsFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8')
	const lines = content.split('\n')

	let hp = 0, atk = 0, def = 0, spe = 0, spc = 0
	let type1 = 'Normal', type2 = 'Normal'
	let level1Moves = []
	let tmhm = []

	for (const line of lines) {
		// db 45, 49, 49, 45, 65
		const statsMatch = line.match(/db\s+(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
		if (statsMatch) {
			hp = parseInt(statsMatch[1], 10)
			atk = parseInt(statsMatch[2], 10)
			def = parseInt(statsMatch[3], 10)
			spe = parseInt(statsMatch[4], 10)
			spc = parseInt(statsMatch[5], 10)
			continue
		}

		// db GRASS, POISON ; type
		const typeMatch = line.match(/db\s+(\w+)\s*,\s*(\w+)\s*;?\s*type/)
		if (typeMatch) {
			type1 = TYPE_MAP[typeMatch[1]] ?? typeMatch[1]
			type2 = TYPE_MAP[typeMatch[2]] ?? typeMatch[2]
			continue
		}

		// db TACKLE, GROWL, NO_MOVE, NO_MOVE ; level 1 learnset
		const movesMatch = line.match(/db\s+([\w_]+)\s*,\s*([\w_]+)\s*,\s*([\w_]+)\s*,\s*([\w_]+)/)
		if (movesMatch && !line.includes('tmhm')) {
			level1Moves = [movesMatch[1], movesMatch[2], movesMatch[3], movesMatch[4]]
				.filter(m => m !== 'NO_MOVE')
			continue
		}

		// tmhm SWORDS_DANCE, TOXIC, ...
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

function extractPokemon() {
	// 1. Parse pokedex constants (DEX_BULBASAUR = 1, etc.)
	const dexConstLines = readAsmLines('constants/pokedex_constants.asm')
	const dexConstants = parseConstants(dexConstLines)

	// 2. Parse pokemon constants (RHYDON = 1, etc.) for battle order
	const monConstLines = readAsmLines('constants/pokemon_constants.asm')
	const monConstants = parseConstants(monConstLines)

	// 3. Parse names (same order as pokemon_constants)
	const namesContent = readAsm('data/pokemon/names.asm')
	const names = parseDbStrings(namesContent.split('\n'))

	// 4. Parse dex_order to map battle index -> dex id
	const dexOrderLines = readAsmLines('data/pokemon/dex_order.asm')
	const dexOrder = []
	for (const line of dexOrderLines) {
		const match = line.match(/db\s+(DEX_\w+)/)
		if (match) {
			const dexId = dexConstants[match[1]]
			dexOrder.push(dexId ?? 0)
		} else if (line.match(/db\s+0/)) {
			dexOrder.push(0) // MissingNo
		}
	}

	// 5. Build reverse: dex id -> species constant name
	const dexIdToConstant = {}
	for (const [name, value] of Object.entries(dexConstants)) {
		if (value >= 1 && value <= 151) {
			dexIdToConstant[value] = name.replace('DEX_', '')
		}
	}

	// 6. Read base_stats include order (pokedex order 1-151)
	const baseStatsContent = readAsm('data/pokemon/base_stats.asm')
	const includeMatches = [...baseStatsContent.matchAll(/INCLUDE\s+"data\/pokemon\/base_stats\/([\w.]+)\.asm"/g)]
	const baseStatsFiles = includeMatches.map(m => m[1]) // e.g. bulbasaur, nidoranm, mrmime

	const baseStatsDir = path.join(LEGACY_ROOT, 'data/pokemon/base_stats')

	// 7. Build pokemon list: for each battle index with valid dex, get name + base stats
	const pokemon = []
	const seenIds = new Set()

	for (let i = 0; i < names.length; i++) {
		const dexId = dexOrder[i]
		if (!dexId || dexId === 0) continue // Skip MissingNo

		const id = dexIdToConstant[dexId]
		if (!id || seenIds.has(id)) continue
		seenIds.add(id)

		// Base stats file is at index (dexId - 1) in the include list
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

	const unique = pokemon

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(unique, null, '\t'))
	console.log(`Wrote ${unique.length} Pokemon to ${OUTPUT_PATH}`)
}

extractPokemon()
