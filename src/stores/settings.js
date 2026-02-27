import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pokemon-calc-settings'

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

	/** Reset app-wide settings to defaults (stat input mode, etc.). */
	function resetSettings() {
		statInputMode.value = 'stats'
	}

	/** Clear all localStorage. Reloads the page. */
	function clearAllStorage() {
		localStorage.clear()
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
		resetSettings,
		clearAllStorage,
	}
})
