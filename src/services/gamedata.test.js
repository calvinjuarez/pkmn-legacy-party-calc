import { describe, it, expect } from 'vitest'
import { runDamageCalc } from './gamedata.js'

describe('runDamageCalc', () => {
	it('Lick vs Jynx: Ghost vs Psychic is super effective (patch + typeMatchups)', () => {
		const attacker = { species: 'GENGAR', level: 54, moves: ['LICK'], useAdvanced: false }
		const defender = { species: 'JYNX', level: 54, moves: [] }
		const result = runDamageCalc(attacker, defender, 'LICK')
		expect(result).not.toBeNull()
		expect(result.noDamage).toBeFalsy()
		expect(result.damage).toBeDefined()
		expect(Array.isArray(result.damage)).toBe(true)
		expect(result.damage[0]).toBeGreaterThan(0)
	})

	it('Night Shade vs Gengar: rolls damage (override), not fixed level', () => {
		const attacker = { species: 'GENGAR', level: 54, moves: ['NIGHT_SHADE'], useAdvanced: false }
		const defender = { species: 'GENGAR', level: 54, moves: [] }
		const result = runDamageCalc(attacker, defender, 'NIGHT_SHADE')
		expect(result).not.toBeNull()
		expect(result.noDamage).toBeFalsy()
		expect(Array.isArray(result.damage)).toBe(true)
		expect(result.damage.length).toBe(39)
		// Fixed damage would be level (54); we expect a roll range
		expect(result.damage[0]).not.toBe(54)
		expect(result.damage[0]).toBeGreaterThan(0)
	})
})
