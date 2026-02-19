import { createPartyStore } from './createPartyStore.js'

export const useOpponentPartyStore = createPartyStore('opponentParty', 'pokemon-calc-opponent-party', {
	getDefaultUseAdvanced: () => false,
})
