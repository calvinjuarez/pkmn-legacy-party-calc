import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pokemon-calc-settings'
const PARTY_KEY = 'pokemon-calc-party'

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			const parsed = JSON.parse(raw)
			return {
				statInputMode: parsed.statInputMode === 'advanced' ? 'advanced' : 'stats',
			}
		}
	} catch (e) {
		console.warn('Failed to load settings from storage:', e)
	}
	return { statInputMode: 'stats' }
}

export const useSettingsStore = defineStore('settings', () => {
	const statInputMode = ref(loadFromStorage().statInputMode)

	function setStatInputMode(mode) {
		if (mode === 'stats' || mode === 'advanced') {
			statInputMode.value = mode
		}
	}

	function getDefaultUseAdvanced() {
		return statInputMode.value === 'advanced'
	}

	/** Clear all localStorage except party. Reloads the page. */
	function clearStorageExceptParty() {
		const keep = localStorage.getItem(PARTY_KEY)
		localStorage.clear()
		if (keep != null) localStorage.setItem(PARTY_KEY, keep)
		window.location.reload()
	}

	watch(statInputMode, (val) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ statInputMode: val }))
		} catch (e) {
			console.warn('Failed to save settings:', e)
		}
	}, { immediate: true })

	return {
		statInputMode,
		setStatInputMode,
		getDefaultUseAdvanced,
		clearStorageExceptParty,
	}
})
