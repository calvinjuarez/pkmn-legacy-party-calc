/**
 * Mechanical ROM string → human-facing labels for extracted JSON (extract pipeline only).
 */

/**
 * ROM decode overrides for strings that don't title-case well due to charset constraints.
 * Key: raw ROM string (uppercase for matching). Value: mechanically normalized display name.
 * Editorial renames (e.g. RIVAL3 -> Champion) belong in the app layer (DISPLAY_OVERRIDES).
 */
export const ROM_NAME_OVERRIDES = {
	// Pokemon
	'NIDORAN♂': 'Nidoran ♂',
	'NIDORAN♀': 'Nidoran ♀',
	'MR.MIME': 'Mr. Mime',
	"FARFETCH'D": "Farfetch'd",
	// Moves (ROM uses different spelling)
	'SAND-ATTACK': 'Sand Attack',
	'DOUBLE-EDGE': 'Double-Edge',
	'HI JUMP KICK': 'High Jump Kick',
	// Trainers
	'JR.TRAINER♂': 'Jr. Trainer ♂',
	'JR.TRAINER♀': 'Jr. Trainer ♀',
	'LT.SURGE': 'Lt. Surge',
	'PROF.OAK': 'Prof. Oak',
	'COOLTRAINER♂': 'Cooltrainer ♂',
	'COOLTRAINER♀': 'Cooltrainer ♀',
	'OFF.JENNY': 'Officer Jenny',
}

/**
 * Convert a string to Title Case for display.
 * Handles: "SWORDS DANCE" -> "Swords Dance", "MR.MIME" -> "Mr. Mime"
 */
export function toTitleCase(str) {
	const cleaned = (str ?? '').replace(/@+$/, '').trim()
	if (!cleaned) return ''
	return cleaned
		.toLowerCase()
		.replace(/(?:^|\s|[-._])\w/g, c => c.toUpperCase())
}

export function toDisplayName(rawStr, overrides = ROM_NAME_OVERRIDES) {
	const key = (rawStr ?? '').replace(/@+$/, '').trim().toUpperCase()
	if (overrides[key]) return overrides[key]
	return toTitleCase(rawStr)
}
