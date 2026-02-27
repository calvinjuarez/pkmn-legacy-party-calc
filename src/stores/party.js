import { createPartyStore } from './createPartyStore.js'
import { useSettingsStore } from './settings.js'

export const usePartyStore = createPartyStore('party', 'pkmn-legacy-party-calc-party', {
	getDefaultUseAdvanced: () => useSettingsStore().getDefaultUseAdvanced(),
})
