#!/usr/bin/env node
/**
 * Extracts game data from the Yellow Legacy ROM hack ASM source files.
 * Run: npm run extract-data
 *
 * Two phases: (1) Extract — mechanical ASM parsing via parsers. (2) Decorate —
 * enriches raw trainer data with game-specific metadata (categories, rematches, locations).
 */

import fs from 'fs'
import path from 'path'
import { extractRawTrainers } from './parsers/trainers.js'

// Extract: run parsers (they write their own files on import)
import './parsers/pokemon.js'
import './parsers/moves.js'
import './parsers/learnsets.js'
import './parsers/types.js'

const OUTPUT_PATH = path.join(process.cwd(), 'src/data/trainers.json')

// Decorate: game knowledge for trainer metadata
const BOSS_CATEGORIES = {
	Brock: 'gymLeaders',
	Misty: 'gymLeaders',
	LtSurge: 'gymLeaders',
	Erika: 'gymLeaders',
	Koga: 'gymLeaders',
	Blaine: 'gymLeaders',
	Sabrina: 'gymLeaders',
	Giovanni: 'gymLeaders',
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

// Decorate: enrich raw trainers with metadata, write trainers.json
function decorateAndWriteTrainers() {
	const raw = extractRawTrainers()

	const trainers = raw.map(t => {
		const category = BOSS_CATEGORIES[t.class] ?? 'other'
		const isBoss = category !== 'other'
		const isRematch = REMATCH_VARIANTS[t.class] === t.variantId
		const location = TRAINER_LOCATIONS[t.class]?.[t.variantId]

		const trainer = {
			class: t.class,
			classId: t.classId,
			romName: t.romName,
			variantId: t.variantId,
			party: t.party,
			category,
			isBoss,
			isRematch,
		}
		if (location) trainer.location = location
		return trainer
	})

	const gymLeaders = trainers.filter(t => t.category === 'gymLeaders')
	const eliteFour = trainers.filter(t => t.category === 'eliteFour')
	const champion = trainers.filter(t => t.category === 'champion')
	const rival = trainers.filter(t => t.category === 'rival')
	const other = trainers.filter(t => t.category === 'other')

	const output = {
		trainers,
		categories: {
			gymLeaders,
			eliteFour,
			champion,
			rival,
			other,
		},
	}

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, '\t'))
	console.log(`Wrote ${trainers.length} trainer variants to ${OUTPUT_PATH}`)
}

decorateAndWriteTrainers()
console.log('Data extraction complete.')
