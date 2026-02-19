import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { runDamageCalc } from '../services/gamedata'
import { usePartyStore } from './party'
import { useOpponentPartyStore } from './opponentParty'

const EMPTY_BOOSTS = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
const SELECTION_KEY = 'pokemon-calc-selection'

function loadSelectionFromStorage() {
	try {
		const raw = localStorage.getItem(SELECTION_KEY)
		if (!raw) return { myIndex: null, theirIndex: null }
		const { myIndex, theirIndex } = JSON.parse(raw)
		const my = typeof myIndex === 'number' && myIndex >= 0 && myIndex <= 5 ? myIndex : null
		const their = typeof theirIndex === 'number' && theirIndex >= 0 && theirIndex <= 5 ? theirIndex : null
		return { myIndex: my, theirIndex: their }
	} catch (e) {
		console.warn('Failed to load selection from storage:', e)
		return { myIndex: null, theirIndex: null }
	}
}

export const useBattleStore = defineStore('battle', () => {
	const selection = loadSelectionFromStorage()
	const selectedMyIndex = ref(selection.myIndex)
	const selectedTheirIndex = ref(selection.theirIndex)
	const selectedMove = ref(null)
	const moveFromOpponent = ref(false)
	const calcResult = ref(null)

	const attackerSide = ref({ isReflect: false, isLightScreen: false, isSeeded: false })
	const defenderSide = ref({ isReflect: false, isLightScreen: false, isSeeded: false })
	const attackerStatus = ref('')
	const defenderStatus = ref('')
	const attackerBoosts = ref({ ...EMPTY_BOOSTS })
	const defenderBoosts = ref({ ...EMPTY_BOOSTS })
	const isCrit = ref(false)

	function resetConditions() {
		attackerSide.value = { isReflect: false, isLightScreen: false, isSeeded: false }
		defenderSide.value = { isReflect: false, isLightScreen: false, isSeeded: false }
		attackerStatus.value = ''
		defenderStatus.value = ''
		attackerBoosts.value = { ...EMPTY_BOOSTS }
		defenderBoosts.value = { ...EMPTY_BOOSTS }
		isCrit.value = false
	}

	const myPokemon = computed(() => {
		if (selectedMyIndex.value == null) return null
		return usePartyStore().getSlot(selectedMyIndex.value)
	})

	const theirPokemon = computed(() => {
		if (selectedTheirIndex.value == null) return null
		return useOpponentPartyStore().getSlot(selectedTheirIndex.value)
	})

	function setMyPokemon(index) {
		selectedMyIndex.value = index
		selectedMove.value = null
		moveFromOpponent.value = false
		calcResult.value = null
		resetConditions()
	}

	function setTheirPokemon(index) {
		selectedTheirIndex.value = index
		selectedMove.value = null
		moveFromOpponent.value = false
		calcResult.value = null
		resetConditions()
	}

	function setMove(move, fromOpponent = false) {
		if (move === selectedMove.value && fromOpponent === moveFromOpponent.value) return
		selectedMove.value = move
		moveFromOpponent.value = fromOpponent
		calcResult.value = null
	}

	function setAttackerSide(side) {
		attackerSide.value = { ...attackerSide.value, ...side }
		calcResult.value = null
	}

	function setDefenderSide(side) {
		defenderSide.value = { ...defenderSide.value, ...side }
		calcResult.value = null
	}

	function setAttackerStatus(status) {
		attackerStatus.value = status
		calcResult.value = null
	}

	function setDefenderStatus(status) {
		defenderStatus.value = status
		calcResult.value = null
	}

	function setAttackerBoost(stat, value) {
		attackerBoosts.value = { ...attackerBoosts.value, [stat]: value }
		calcResult.value = null
	}

	function setDefenderBoost(stat, value) {
		defenderBoosts.value = { ...defenderBoosts.value, [stat]: value }
		calcResult.value = null
	}

	function setAttackerSpecial(value) {
		attackerBoosts.value = { ...attackerBoosts.value, spa: value, spd: value }
		calcResult.value = null
	}

	function setDefenderSpecial(value) {
		defenderBoosts.value = { ...defenderBoosts.value, spa: value, spd: value }
		calcResult.value = null
	}

	function setIsCrit(value) {
		isCrit.value = value
		calcResult.value = null
	}

	function calculate() {
		const myMon = usePartyStore().getSlot(selectedMyIndex.value)
		const theirMon = theirPokemon.value

		if (!myMon?.species || !theirMon?.species || !selectedMove.value) {
			calcResult.value = null
			return
		}

		const fromOpp = moveFromOpponent.value
		const attacker = fromOpp ? theirMon : myMon
		const defender = fromOpp ? myMon : theirMon

		calcResult.value = runDamageCalc(attacker, defender, selectedMove.value, {
			attackerSide: fromOpp ? defenderSide.value : attackerSide.value,
			defenderSide: fromOpp ? attackerSide.value : defenderSide.value,
			attackerStatus: (fromOpp ? defenderStatus.value : attackerStatus.value) || undefined,
			defenderStatus: (fromOpp ? attackerStatus.value : defenderStatus.value) || undefined,
			attackerBoosts: (fromOpp ? defenderBoosts.value : attackerBoosts.value) &&
				Object.values(fromOpp ? defenderBoosts.value : attackerBoosts.value).some(v => v !== 0)
				? (fromOpp ? defenderBoosts.value : attackerBoosts.value)
				: undefined,
			defenderBoosts: (fromOpp ? attackerBoosts.value : defenderBoosts.value) &&
				Object.values(fromOpp ? attackerBoosts.value : defenderBoosts.value).some(v => v !== 0)
				? (fromOpp ? attackerBoosts.value : defenderBoosts.value)
				: undefined,
			isCrit: isCrit.value,
		})
	}

	function ensureValidSelection() {
		const partyStore = usePartyStore()
		const opponentStore = useOpponentPartyStore()
		let firstMy = -1
		let firstTheir = -1
		for (let i = 0; i < 6; i++) {
			if (firstMy < 0 && partyStore.getSlot(i)?.species) firstMy = i
			if (firstTheir < 0 && opponentStore.getSlot(i)?.species) firstTheir = i
		}
		if (firstMy >= 0 && (selectedMyIndex.value == null || !partyStore.getSlot(selectedMyIndex.value)?.species)) {
			selectedMyIndex.value = firstMy
		}
		if (firstTheir >= 0 && (selectedTheirIndex.value == null || !opponentStore.getSlot(selectedTheirIndex.value)?.species)) {
			selectedTheirIndex.value = firstTheir
		}
		// Auto-select first hero move when none selected
		if (selectedMove.value == null && firstMy >= 0 && firstTheir >= 0) {
			const slot = partyStore.getSlot(firstMy)
			const moves = slot?.moves?.filter(Boolean) ?? []
			if (moves.length > 0) {
				selectedMove.value = moves[0]
				moveFromOpponent.value = false
			}
		}
	}

	function clear() {
		selectedMyIndex.value = null
		selectedTheirIndex.value = null
		selectedMove.value = null
		moveFromOpponent.value = false
		calcResult.value = null
		resetConditions()
	}

	function saveSelectionToStorage() {
		try {
			const my = selectedMyIndex.value
			const their = selectedTheirIndex.value
			if (my == null && their == null) {
				localStorage.removeItem(SELECTION_KEY)
				return
			}
			localStorage.setItem(SELECTION_KEY, JSON.stringify({ myIndex: my, theirIndex: their }))
		} catch (e) {
			console.warn('Failed to save selection to storage:', e)
		}
	}

	watch([selectedMyIndex, selectedTheirIndex], () => {
		saveSelectionToStorage()
	}, { immediate: true })

	return {
		selectedMyIndex,
		selectedTheirIndex,
		selectedMove,
		moveFromOpponent,
		calcResult,
		myPokemon,
		theirPokemon,
		attackerSide,
		defenderSide,
		attackerStatus,
		defenderStatus,
		attackerBoosts,
		defenderBoosts,
		isCrit,
		setMyPokemon,
		setTheirPokemon,
		setMove,
		setAttackerSide,
		setDefenderSide,
		setAttackerStatus,
		setDefenderStatus,
		setAttackerBoost,
		setDefenderBoost,
		setAttackerSpecial,
		setDefenderSpecial,
		setIsCrit,
		calculate,
		clear,
		ensureValidSelection,
	}
})
