import { createPartyStore } from './createPartyStore.js'
import { useSettingsStore } from './settings.js'

export const usePartyStore = createPartyStore('party', 'pokemon-calc-party', {
	getDefaultUseAdvanced: () => useSettingsStore().getDefaultUseAdvanced(),
})
