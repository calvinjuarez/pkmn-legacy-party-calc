/**
 * Extracts type effectiveness from Yellow Legacy type_matchups.asm.
 */

import { ASM_TYPE_TO_DISPLAY, ASM_EFFECT_TO_MULTIPLIER } from '../lib/gen1-asm-maps.js'

/**
 * @param {{ readAsm: (p: string) => string }} readers
 */
export function extractTypes(readers) {
	const { readAsm } = readers

	const content = readAsm('data/types/type_matchups.asm')
	const matchups = []
	const matchupRegex = /db\s+(\w+)\s*,\s*(\w+)\s*,\s*(\w+)/g
	let m
	while ((m = matchupRegex.exec(content)) !== null) {
		const [, attacker, defender, effect] = m
		if (attacker === '-1' || defender === '-1') break
		const effectVal = ASM_EFFECT_TO_MULTIPLIER[effect]
		matchups.push({
			attacker: ASM_TYPE_TO_DISPLAY[attacker] ?? attacker,
			defender: ASM_TYPE_TO_DISPLAY[defender] ?? defender,
			effect: effectVal ?? 1,
		})
	}

	return { matchups }
}
