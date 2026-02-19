/**
 * Factory for party stores. Both user party and opponent party share the same
 * slot structure and API; only storage key and default useAdvanced differ.
 *
 * @param {string} id - Pinia store id
 * @param {string} storageKey - localStorage key
 * @param {{ getDefaultUseAdvanced: () => boolean }} options
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export function createPartyStore(id, storageKey, { getDefaultUseAdvanced }) {
	return defineStore(id, () => {
		function defaultSlot() {
			return {
				species: null,
				nickname: '',
				level: 50,
				stats: { hp: null, atk: null, def: null, spe: null, spc: null },
				dvs: { atk: 15, def: 15, spe: 15, spc: 15 },
				statExp: { hp: 65535, atk: 65535, def: 65535, spe: 65535, spc: 65535 },
				moves: [null, null, null, null],
				useAdvanced: getDefaultUseAdvanced(),
			}
		}

		function createDefaultParty() {
			return Array(6)
				.fill(null)
				.map(() => ({ ...defaultSlot() }))
		}

		function loadFromStorage() {
			try {
				const raw = localStorage.getItem(storageKey)
				if (raw) {
					const parsed = JSON.parse(raw)
					if (parsed.party?.length === 6) {
						return parsed.party.map((slot) => ({ ...defaultSlot(), ...slot }))
					}
				}
			} catch (e) {
				console.warn(`Failed to load party from storage (${storageKey}):`, e)
			}
			return createDefaultParty()
		}

		const party = ref(loadFromStorage())

		function saveToStorage() {
			try {
				localStorage.setItem(storageKey, JSON.stringify({ party: party.value }))
			} catch (e) {
				console.warn(`Failed to save party to storage (${storageKey}):`, e)
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

		/** Populate party from trainer data. Trainer slots: { species, level, moves }.
		 *  Gen 1 trainer Pokemon use DVs 9/8/8/8 and 0 Stat EXP. */
		function loadFromTrainer(trainer) {
			const src = trainer?.party ?? []
			for (let i = 0; i < 6; i++) {
				const mon = src[i]
				if (mon) {
					setSlot(i, {
						species: mon.species,
						level: mon.level ?? 50,
						moves: [...(mon.moves ?? []), null, null, null, null].slice(0, 4),
						stats: { hp: null, atk: null, def: null, spe: null, spc: null },
						dvs: { atk: 9, def: 8, spe: 8, spc: 8 },
						statExp: { hp: 0, atk: 0, def: 0, spe: 0, spc: 0 },
						useAdvanced: true,
					})
				} else {
					clearSlot(i)
				}
			}
		}

		return {
			party,
			setSlot,
			clearSlot,
			getSlot,
			loadFromTrainer,
		}
	})
}
