/**
 * Game data service - provides access to extracted Yellow Legacy data
 * and converts to @smogon/calc format with overrides.
 */

import { calculate, Field, Move, Pokemon } from '@smogon/calc'
import learnsetsData from '../data/learnsets.json'
import movesData from '../data/moves.json'
import pokemonData from '../data/pokemon.json'
import trainersData from '../data/trainers.json'
import typesData from '../data/types.json'
import { DISPLAY_OVERRIDES, toDisplayName } from './gamedata.const.js'

const GEN = 1

// Index by id for fast lookup
const pokemonById = Object.fromEntries(pokemonData.map(p => [p.id, p]))
const movesById = Object.fromEntries(movesData.map(m => [m.id, m]))
const movesByDisplayName = Object.fromEntries(movesData.map(m => [m.displayName, m]))

export function getAllPokemon() {
	return pokemonData
}

export function getPokemon(id) {
	return pokemonById[id] ?? pokemonData.find(p =>
		p.id.toLowerCase() === id?.toLowerCase() ||
		p.displayName?.toLowerCase() === id?.toLowerCase()
	)
}

export function getAllMoves() {
	return movesData
}

export function getMove(id) {
	return movesById[id] ?? movesByDisplayName[id] ?? movesData.find(m =>
		m.id?.toLowerCase() === id?.toLowerCase() ||
		m.displayName?.toLowerCase() === id?.toLowerCase()
	)
}

export function getLearnset(speciesId) {
	return learnsetsData[speciesId] ?? []
}

export function getTypeMatchups() {
	return typesData.matchups ?? []
}

export function getAllTrainers() {
	return trainersData.trainers ?? []
}

export function getTrainerCategories() {
	return trainersData.categories ?? {}
}

/** Find trainer by classId and variantId. */
export function getTrainerById(classId, variantId) {
	const trainers = trainersData.trainers ?? []
	return trainers.find(t =>
		(t.classId ?? t.class) === classId && (t.variantId ?? 0) === Number(variantId)
	) ?? null
}

export function getTrainerDisplayName(trainer) {
	const key = trainer.romName?.toUpperCase() ?? trainer.class
	return DISPLAY_OVERRIDES.trainers[key] ?? toDisplayName(trainer.romName ?? trainer.class)
}

export function getBossTrainers() {
	const cats = trainersData.categories ?? {}
	return [
		...(cats.gymLeaders ?? []),
		...(cats.eliteFour ?? []),
		...(cats.champion ?? []),
	]
}

/**
 * Get moves a Pokemon can learn (level-up + TM from base stats)
 */
export function getLearnableMoves(speciesId) {
	const pokemon = getPokemon(speciesId)
	if (!pokemon) return []

	const learnset = getLearnset(speciesId)
	const levelUpMoves = new Set(learnset.map(l => l.move))

	const tmMoves = new Set(pokemon.tmhm ?? [])
	const allMoves = new Set([...levelUpMoves, ...tmMoves, ...(pokemon.level1Moves ?? [])])

	return [...allMoves].map(moveId => getMove(moveId)).filter(Boolean)
}

/**
 * Gen 1 stat formula: base, level, DV (0-15), Stat Exp (0-65535).
 * Returns the in-game displayed stat value.
 */
export function calcGen1Stat(stat, base, level, dvs, statExp) {
	const dvVal = stat === 'hp'
		? (dvs.atk % 2) * 8 + (dvs.def % 2) * 4 + (dvs.spe % 2) * 2 + (dvs.spc % 2)
		: (dvs[stat] ?? 15)
	const statExpBonus = Math.min(255, Math.floor(Math.ceil(Math.sqrt(statExp)) / 4))
	const core = Math.floor(((base + dvVal) * 2 + statExpBonus) * level / 100)
	return stat === 'hp' ? core + level + 10 : core + 5
}

/**
 * Convert our party Pokemon to @smogon/calc Pokemon with Yellow Legacy overrides.
 */
export function toCalcPokemon(partyMon, isAttacker = true) {
	if (!partyMon?.species) return null

	const species = getPokemon(partyMon.species)
	if (!species) return null

	const dvs = partyMon.dvs ?? { atk: 15, def: 15, spe: 15, spc: 15 }
	const statExp = partyMon.statExp ?? { hp: 65535, atk: 65535, def: 65535, spe: 65535, spc: 65535 }
	const level = partyMon.level ?? 50
	const bs = species.baseStats

	// Calc uses spe=Speed, spa/spd=Special. We use spe/spc to match; calc expands spc to both spa and spd for Gen 1.
	let ivs, evs
	if (partyMon.useAdvanced) {
		// Advanced mode: convert DVs/Stat Exp to IVs/EVs, calc computes stats internally
		ivs = {
			hp: 31,
			atk: Math.min(31, (dvs.atk ?? 15) * 2),
			def: Math.min(31, (dvs.def ?? 15) * 2),
			spe: Math.min(31, (dvs.spe ?? 15) * 2),
			spc: Math.min(31, (dvs.spc ?? 15) * 2),
		}
		evs = {
			hp: Math.min(252, Math.floor((statExp.hp ?? 65535) / 260)),
			atk: Math.min(252, Math.floor((statExp.atk ?? 65535) / 260)),
			def: Math.min(252, Math.floor((statExp.def ?? 65535) / 260)),
			spe: Math.min(252, Math.floor((statExp.spe ?? 65535) / 260)),
			spc: Math.min(252, Math.floor((statExp.spc ?? 65535) / 260)),
		}
	} else {
		// Basic mode: use neutral IVs/EVs, we'll override rawStats and stats with user values
		ivs = { hp: 31, atk: 31, def: 31, spe: 31, spc: 31 }
		evs = { hp: 252, atk: 252, def: 252, spe: 252, spc: 252 }
	}

	const overrides = {
		baseStats: {
			hp: bs.hp,
			atk: bs.atk,
			def: bs.def,
			spe: bs.spe,
			spa: bs.spc,
			spd: bs.spc,
		},
		types: species.types,
	}

	const moves = partyMon.moves?.filter(Boolean) ?? []
	const calcMoves = moves.length > 0 ? moves : (species.level1Moves ?? ['Tackle'])

	const mon = new Pokemon(GEN, species.displayName, {
		level,
		ivs,
		evs,
		moves: calcMoves,
		overrides,
	})

	if (!partyMon.useAdvanced && partyMon.stats) {
		// Basic mode: override with user's in-game stat values
		const s = partyMon.stats
		const userStats = {
			hp: s.hp != null ? Number(s.hp) : calcGen1Stat('hp', bs.hp, level, dvs, statExp.hp ?? 65535),
			atk: s.atk != null ? Number(s.atk) : calcGen1Stat('atk', bs.atk, level, dvs, statExp.atk ?? 65535),
			def: s.def != null ? Number(s.def) : calcGen1Stat('def', bs.def, level, dvs, statExp.def ?? 65535),
			spe: s.spe != null ? Number(s.spe) : calcGen1Stat('spe', bs.spe, level, dvs, statExp.spe ?? 65535),
			spa: s.spc != null ? Number(s.spc) : calcGen1Stat('spc', bs.spc, level, dvs, statExp.spc ?? 65535),
			spd: s.spc != null ? Number(s.spc) : calcGen1Stat('spc', bs.spc, level, dvs, statExp.spc ?? 65535),
		}
		mon.rawStats = { ...mon.rawStats, ...userStats }
		mon.stats = { ...mon.stats, ...userStats }
		mon.originalCurHP = mon.rawStats.hp
	}

	return mon
}

/**
 * Get moves for a trainer's Pokemon (from data, or fallback to learnset/level1).
 */
export function getTrainerMonMoves(trainerMon) {
	if (!trainerMon?.species) return []
	const species = getPokemon(trainerMon.species)
	if (!species) return []
	const moveIds = trainerMon.moves?.length > 0
		? trainerMon.moves
		: (getLearnset(species.id)?.[0] ? [getLearnset(species.id)[0].move] : species.level1Moves) ?? ['Tackle']
	return moveIds.filter(Boolean).map(id => getMove(id)).filter(Boolean)
}

/**
 * Convert trainer's party member to calc Pokemon (uses default DVs/StatExp for NPCs).
 */
export function trainerMonToCalcPokemon(trainerMon) {
	if (!trainerMon?.species) return null

	const species = getPokemon(trainerMon.species)
	if (!species) return null

	const moves = trainerMon.moves?.length > 0
		? trainerMon.moves
		: (getLearnset(species.id)?.[0] ? [getLearnset(species.id)[0].move] : species.level1Moves) ?? ['Tackle']

	const bs = species.baseStats
	return new Pokemon(GEN, species.displayName, {
		level: trainerMon.level ?? 50,
		moves,
		overrides: {
			baseStats: {
				hp: bs.hp,
				atk: bs.atk,
				def: bs.def,
				spe: bs.spe,
				spa: bs.spc,
				spd: bs.spc,
			},
			types: species.types,
		},
	})
}

/**
 * Check if defender is a party slot (has dvs, useAdvanced, or stats) vs raw trainer mon.
 */
function isPartySlot(defender) {
	if (!defender?.species) return false
	return defender.dvs != null || defender.useAdvanced === true || defender.stats != null
}

/**
 * Run damage calculation.
 * Attacker = your party Pokemon (with DVs, Stat Exp).
 * Defender = opponent's Pokemon. If party slot (has dvs/useAdvanced/stats), use toCalcPokemon; else trainerMonToCalcPokemon.
 * @param {object} options - Optional: attackerSide, defenderSide, attackerStatus, defenderStatus, attackerBoosts, defenderBoosts, isCrit
 */
export function runDamageCalc(attacker, defender, moveName, options = {}) {
	const calcAttacker = toCalcPokemon(attacker, true)
	const calcDefender = isPartySlot(defender)
		? toCalcPokemon(defender, false)
		: trainerMonToCalcPokemon(defender)
	if (!calcAttacker || !calcDefender) return null

	const moveData = getMove(moveName)
	if (!moveData) return null

	if (!moveData.power) {
		return { noDamage: true }
	}

	if (options.attackerStatus) calcAttacker.status = options.attackerStatus
	if (options.defenderStatus) calcDefender.status = options.defenderStatus
	if (options.attackerBoosts) {
		const b = { ...calcAttacker.boosts, ...options.attackerBoosts }
		if (GEN === 1) b.spd = b.spa
		calcAttacker.boosts = b
	}
	if (options.defenderBoosts) {
		const b = { ...calcDefender.boosts, ...options.defenderBoosts }
		if (GEN === 1) b.spd = b.spa
		calcDefender.boosts = b
	}

	const field = new Field({
		attackerSide: options.attackerSide ?? {},
		defenderSide: options.defenderSide ?? {},
		// Yellow Legacy: Leech Seed, poison, and burn all do 1/8 instead of 1/16
		leechSeedDivisor: 8,
		poisonDivisor: 8,
		burnDivisor: 8,
	})

	const calcMove = new Move(GEN, moveData.displayName, {
		isCrit: options.isCrit ?? false,
		overrides: {
			bp: moveData.power,
			accuracy: moveData.accuracy,
			type: moveData.type,
		},
	})

	try {
		return calculate(GEN, calcAttacker, calcDefender, calcMove, field)
	} catch (e) {
		console.error('Calc error:', e)
		return { noDamage: true }
	}
}
