import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { runDamageCalc, getTrainerById } from '../services/gamedata'
import { usePartyStore } from './party'

const EMPTY_BOOSTS = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
const OPPONENT_KEY = 'pokemon-calc-opponent'
const LEGACY_OPPONENT_KEY = 'pokemon-calc-competitor'
const SELECTION_KEY = 'pokemon-calc-selection'

function loadOpponentFromStorage() {
	try {
		let raw = localStorage.getItem(OPPONENT_KEY)
		if (!raw) raw = localStorage.getItem(LEGACY_OPPONENT_KEY)
		if (raw) {
			const { classId, variantId } = JSON.parse(raw)
			if (classId != null && variantId != null) {
				return getTrainerById(classId, variantId)
			}
		}
	} catch (e) {
		console.warn('Failed to load opponent from storage:', e)
	}
	return null
}

function loadSelectionFromStorage(opponent) {
	try {
		const raw = localStorage.getItem(SELECTION_KEY)
		if (!raw) return { myIndex: null, theirIndex: null }
		const { myIndex, theirIndex } = JSON.parse(raw)
		const my = typeof myIndex === 'number' && myIndex >= 0 && myIndex <= 5 ? myIndex : null
		const partyLen = opponent?.party?.length ?? 0
		const their = typeof theirIndex === 'number' && theirIndex >= 0 && theirIndex < partyLen ? theirIndex : null
		return { myIndex: my, theirIndex: their }
	} catch (e) {
		console.warn('Failed to load selection from storage:', e)
		return { myIndex: null, theirIndex: null }
	}
}

export const useBattleStore = defineStore('battle', () => {
	const opponent = loadOpponentFromStorage()
	const selection = loadSelectionFromStorage(opponent)
	const selectedOpponent = ref(opponent)
	const selectedMyIndex = ref(selection.myIndex)
	const selectedTheirIndex = ref(selection.theirIndex)
	const selectedMove = ref(null)
	const calcResult = ref(null)

	const attackerSide = ref({ isReflect: false, isLightScreen: false })
	const defenderSide = ref({ isReflect: false, isLightScreen: false })
	const attackerStatus = ref('')
	const defenderStatus = ref('')
	const attackerBoosts = ref({ ...EMPTY_BOOSTS })
	const defenderBoosts = ref({ ...EMPTY_BOOSTS })
	const isCrit = ref(false)

	function resetConditions() {
		attackerSide.value = { isReflect: false, isLightScreen: false }
		defenderSide.value = { isReflect: false, isLightScreen: false }
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
		if (!selectedOpponent.value || selectedTheirIndex.value == null) return null
		const party = selectedOpponent.value.party ?? []
		return party[selectedTheirIndex.value] ?? null
	})

	function setOpponent(trainer) {
		selectedOpponent.value = trainer
		selectedTheirIndex.value = null
		selectedMove.value = null
		calcResult.value = null
		resetConditions()
	}

	function setMyPokemon(index) {
		selectedMyIndex.value = index
		selectedMove.value = null
		calcResult.value = null
		resetConditions()
	}

	function setTheirPokemon(index) {
		selectedTheirIndex.value = index
		selectedMove.value = null
		calcResult.value = null
		resetConditions()
	}

	function setMove(move) {
		selectedMove.value = move
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

		calcResult.value = runDamageCalc(myMon, theirMon, selectedMove.value, {
			attackerSide: attackerSide.value,
			defenderSide: defenderSide.value,
			attackerStatus: attackerStatus.value || undefined,
			defenderStatus: defenderStatus.value || undefined,
			attackerBoosts: Object.values(attackerBoosts.value).some(v => v !== 0) ? attackerBoosts.value : undefined,
			defenderBoosts: Object.values(defenderBoosts.value).some(v => v !== 0) ? defenderBoosts.value : undefined,
			isCrit: isCrit.value,
		})
	}

	function clear() {
		selectedOpponent.value = null
		selectedMyIndex.value = null
		selectedTheirIndex.value = null
		selectedMove.value = null
		calcResult.value = null
		resetConditions()
	}

	function saveOpponentToStorage(trainer) {
		try {
			if (!trainer) {
				localStorage.removeItem(OPPONENT_KEY)
				localStorage.removeItem(LEGACY_OPPONENT_KEY)
				return
			}
			const classId = trainer.classId ?? trainer.class
			const variantId = trainer.variantId ?? 0
			localStorage.setItem(OPPONENT_KEY, JSON.stringify({ classId, variantId }))
			localStorage.removeItem(LEGACY_OPPONENT_KEY)
		} catch (e) {
			console.warn('Failed to save opponent to storage:', e)
		}
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

	watch(selectedOpponent, (trainer) => {
		saveOpponentToStorage(trainer)
	}, { immediate: true })

	watch([selectedMyIndex, selectedTheirIndex], () => {
		saveSelectionToStorage()
	}, { immediate: true })

	return {
		selectedOpponent,
		selectedMyIndex,
		selectedTheirIndex,
		selectedMove,
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
		setOpponent,
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
	}
})
