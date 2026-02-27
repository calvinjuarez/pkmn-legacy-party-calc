import { createPartyStore } from './createPartyStore.js'
import { useSettingsStore } from './settings.js'
import { exampleParty } from '../data/exampleParty.js'

export const usePartyStore = createPartyStore('party', 'pkmn-legacy-party-calc-party', {
	getDefaultUseAdvanced: () => useSettingsStore().getDefaultUseAdvanced(),
	exampleParty,
})
