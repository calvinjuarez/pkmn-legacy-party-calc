import { createPartyStore } from './createPartyStore.js'

export const useOpponentPartyStore = createPartyStore('opponentParty', 'pkmn-legacy-party-calc-opponent-party', {
	getDefaultUseAdvanced: () => false,
})
