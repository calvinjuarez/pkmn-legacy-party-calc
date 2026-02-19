/**
 * Human-facing display constants for the app.
 * Used by views and gamedata.js. Does not contain game-structural data
 * (that lives in the prepare step and trainers.json).
 */

/** Editorial overrides for trainer display names. Key: romName (uppercase). */
export const DISPLAY_OVERRIDES = {
	trainers: { RIVAL3: 'Champion', RIVAL1: 'Rival', RIVAL2: 'Rival' },
}

/** Badge-based scaling variant labels for gym leaders you can fight in any order. */
export const BADGE_VARIANTS = {
	Erika: { 0: '3 Badges', 1: '4 Badges', 2: '5 Badges' },
	Koga: { 0: '4 Badges', 1: '5 Badges' },
	Sabrina: { 0: '5 Badges', 1: '4 Badges' },
}

/** Developer boss trainer classes. */
export const DEV_BOSSES = new Set(['Smith', 'Craig', 'Weebra'])

/** Jessie & James Rocket variant IDs (for UI grouping). */
export const JESSIE_JAMES_VARIANT_IDS = new Set([41, 42, 43, 44])

/** Sort order for gym leaders. */
export const GYM_ORDER = ['Brock', 'Misty', 'LtSurge', 'Erika', 'Koga', 'Sabrina', 'Blaine', 'Giovanni']

/** Sort order for Elite Four. */
export const E4_ORDER = ['Lorelei', 'Bruno', 'Agatha', 'Lance']

/** Species IDs used for eeveelution detection (rival starter). */
export const EEVEELUTIONS = new Set(['EEVEE', 'JOLTEON', 'FLAREON', 'VAPOREON'])

/** ROM decode overrides for trainer names that don't title-case well. Key: uppercase. */
const ROM_NAME_OVERRIDES = {
	'JR.TRAINER♂': 'Jr. Trainer ♂',
	'JR.TRAINER♀': 'Jr. Trainer ♀',
	'LT.SURGE': 'Lt. Surge',
	'PROF.OAK': 'Prof. Oak',
	'COOLTRAINER♂': 'Cooltrainer ♂',
	'COOLTRAINER♀': 'Cooltrainer ♀',
	'OFF.JENNY': 'Officer Jenny',
}

function toTitleCase(str) {
	const cleaned = (str ?? '').replace(/@+$/, '').trim()
	if (!cleaned) return ''
	return cleaned.toLowerCase().replace(/(?:^|\s|[-._])\w/g, c => c.toUpperCase())
}

/** Mechanically normalize a ROM string for display (no editorial overrides). */
export function toDisplayName(rawStr) {
	const key = (rawStr ?? '').replace(/@+$/, '').trim().toUpperCase()
	return ROM_NAME_OVERRIDES[key] ?? toTitleCase(rawStr)
}
