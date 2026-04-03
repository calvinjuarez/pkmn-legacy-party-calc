#!/usr/bin/env node
/**
 * Extracts game data from the Yellow Legacy ROM hack ASM source files.
 * Run: npm run extract-data
 *
 * Parse → transform → persist: mechanical parsers return data; transform enriches trainers;
 * this script writes src/data/*.json (committed).
 */

import fs from 'fs'
import path from 'path'
import { createAsmReaders } from './lib/parse-asm.js'
import { toDisplayName } from './lib/rom-display-names.js'
import { extractPokemon } from './parsers/pokemon.js'
import { extractMoves } from './parsers/moves.js'
import { extractLearnsets } from './parsers/learnsets.js'
import { extractTypes } from './parsers/types.js'
import { extractTrainers } from './parsers/trainers.js'

const DEFAULT_CONFIG = {
	legacyRoot: path.join(process.cwd(), 'yellow-legacy-v1.0.9'),
	outputDir: path.join(process.cwd(), 'src/data'),
}

const BOSS_CATEGORIES = {
	Brock: 'gymLeader',
	Misty: 'gymLeader',
	LtSurge: 'gymLeader',
	Erika: 'gymLeader',
	Koga: 'gymLeader',
	Blaine: 'gymLeader',
	Sabrina: 'gymLeader',
	Giovanni: 'gymLeader',
	Bruno: 'eliteFour',
	Lorelei: 'eliteFour',
	Agatha: 'eliteFour',
	Lance: 'eliteFour',
	Rival3: 'champion',
	Rival1: 'rival',
	Rival2: 'rival',
}

const REMATCH_VARIANTS = {
	Brock: 1,
	Misty: 1,
	LtSurge: 1,
	Erika: 3,
	Koga: 2,
	Sabrina: 2,
	Blaine: 1,
	Bruno: 1,
	Lorelei: 1,
	Agatha: 1,
	Lance: 1,
	Rival3: 3,
}

const TRAINER_LOCATIONS = {
	Giovanni: { 0: 'Rocket Hideout', 1: 'Silph Co.', 2: 'Viridian Gym' },
	Rival1: { 0: "Oak's Lab", 1: 'Route 22', 2: 'Cerulean City' },
	Rival2: {
		0: 'SS Anne',
		1: 'Pokémon Tower',
		2: 'Pokémon Tower',
		3: 'Pokémon Tower',
		4: 'Silph Co.',
		5: 'Silph Co.',
		6: 'Silph Co.',
		7: 'Route 22',
		8: 'Route 22',
		9: 'Route 22',
	},
	Rival3: { 0: "Champion's Room", 1: "Champion's Room", 2: "Champion's Room" },
	Rocket: { 41: 'Mt. Moon', 42: 'Rocket Hideout', 43: 'Pokémon Tower', 44: 'Silph Co.' },
}

function writeJson(outputPath, data) {
	fs.mkdirSync(path.dirname(outputPath), { recursive: true })
	fs.writeFileSync(outputPath, JSON.stringify(data, null, '\t'))
}

/**
 * Enrich parsed trainer records (mechanical ASM output) with metadata and displayName for JSON.
 */
function transformTrainerMetadata(raw) {
	return raw.map(t => {
		const category = BOSS_CATEGORIES[t.class] ?? 'other'
		const isBoss = category !== 'other'
		const isRematch = REMATCH_VARIANTS[t.class] === t.variantId
		const location = TRAINER_LOCATIONS[t.class]?.[t.variantId]

		return {
			...t,
			displayName: toDisplayName(t.romName),
			category,
			isBoss,
			isRematch,
			...(location ? { location } : {}),
		}
	})
}

function runExtract(config = DEFAULT_CONFIG) {
	const { legacyRoot, outputDir } = config
	const readers = createAsmReaders(legacyRoot)

	const pokemon = extractPokemon(readers, { legacyRoot })
	writeJson(path.join(outputDir, 'pokemon.json'), pokemon)

	const learnsets = extractLearnsets(readers)
	writeJson(path.join(outputDir, 'learnsets.json'), learnsets)

	const moves = extractMoves(readers)
	writeJson(path.join(outputDir, 'moves.json'), moves)

	const types = extractTypes(readers)
	writeJson(path.join(outputDir, 'types.json'), types)

	console.log(`Wrote ${pokemon.length} Pokemon, ${moves.length} moves, ${Object.keys(learnsets).length} learnset species to ${outputDir}`)

	const parsedTrainers = extractTrainers(readers, { pokemon, learnsets })
	const trainers = transformTrainerMetadata(parsedTrainers)

	const gymLeader = trainers.filter(t => t.category === 'gymLeader')
	const eliteFour = trainers.filter(t => t.category === 'eliteFour')
	const champion = trainers.filter(t => t.category === 'champion')
	const rival = trainers.filter(t => t.category === 'rival')
	const other = trainers.filter(t => t.category === 'other')

	const trainersOutput = {
		trainers,
		categories: {
			gymLeader,
			eliteFour,
			champion,
			rival,
			other,
		},
	}

	const trainersPath = path.join(outputDir, 'trainers.json')
	writeJson(trainersPath, trainersOutput)
	console.log(`Wrote ${trainers.length} trainer variants to ${trainersPath}`)
}

runExtract()
console.log('Data extraction complete.')
