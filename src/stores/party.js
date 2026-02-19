import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useSettingsStore } from './settings.js'

const STORAGE_KEY = 'pokemon-calc-party'

function defaultSlot() {
	const settings = useSettingsStore()
	return {
		species: null,
		level: 50,
		stats: { hp: null, atk: null, def: null, spe: null, spc: null },
		dvs: { atk: 15, def: 15, spe: 15, spc: 15 },
		statExp: { hp: 65535, atk: 65535, def: 65535, spe: 65535, spc: 65535 },
		moves: [null, null, null, null],
		useAdvanced: settings.getDefaultUseAdvanced(),
	}
}

function migrateSpdToSpe(obj) {
	if (!obj) return obj
	if ('spd' in obj && !('spe' in obj)) {
		const { spd, ...rest } = obj
		return { ...rest, spe: spd }
	}
	return obj
}

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed = JSON.parse(raw)
			if (parsed.party?.length === 6) {
				return parsed.party.map(slot => {
					const migrated = { ...slot }
					migrated.dvs = migrateSpdToSpe(slot.dvs)
					migrated.statExp = migrateSpdToSpe(slot.statExp)
					migrated.stats = migrateSpdToSpe(slot.stats)
					return { ...defaultSlot(), ...migrated }
				})
			}
		}
	} catch (e) {
		console.warn('Failed to load party from storage:', e)
	}
	return createDefaultParty()
}

function createDefaultParty() {
	return Array(6).fill(null).map(() => ({ ...defaultSlot() }))
}

export const usePartyStore = defineStore('party', () => {
	const party = ref(loadFromStorage())

	function saveToStorage() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ party: party.value }))
		} catch (e) {
			console.warn('Failed to save party:', e)
		}
	}

	watch(party, saveToStorage, { deep: true })

	function setSlot(index, data) {
		if (index >= 0 && index < 6) {
			party.value[index] = { ...defaultSlot(), ...party.value[index], ...data }
		}
	}

	function clearSlot(index) {
		if (index >= 0 && index < 6) {
			party.value[index] = { ...defaultSlot() }
		}
	}

	function getSlot(index) {
		return party.value[index] ?? null
	}

	return {
		party,
		setSlot,
		clearSlot,
		getSlot,
	}
})
