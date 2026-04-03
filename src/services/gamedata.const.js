/**
 * App-only display and UI constants.
 * Mechanical trainer display names live in trainers.json (see npm run extract-data).
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
