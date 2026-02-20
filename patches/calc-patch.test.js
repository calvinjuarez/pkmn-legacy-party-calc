/**
 * Tests that the @smogon/calc patch adds and honors typeMatchups on the Field.
 * Uses the calc directly (not runDamageCalc) to isolate patch behavior.
 */
import { describe, it, expect } from 'vitest'
import { calculate, Field, Move, Pokemon } from '@smogon/calc'

describe('calc patch: typeMatchups', () => {
	it('honors typeMatchups when passed to Field (Ghost vs Psychic 2x)', () => {
		const typeMatchups = { ghost: { Psychic: 2, Ice: 1 } }
		const field = new Field({ typeMatchups })
		const attacker = new Pokemon(1, 'Gengar', { level: 54 })
		const defender = new Pokemon(1, 'Jynx', { level: 54 })
		const move = new Move(1, 'Lick')

		const result = calculate(1, attacker, defender, move, field)

		expect(result.damage).toBeDefined()
		expect(Array.isArray(result.damage)).toBe(true)
		expect(result.damage[0]).toBeGreaterThan(0)
	})
})
