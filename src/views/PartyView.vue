<script setup>
import { ref, computed } from 'vue'
import { usePartyStore } from '../stores/party'
import { getAllPokemon, getAllMoves, getPokemon, calcGen1Stat } from '../services/gamedata'

const partyStore = usePartyStore()
const selectedIndex = ref(null)

const allPokemon = getAllPokemon()
const allMoves = getAllMoves()
const pokemonOptions = computed(() =>
	allPokemon
		.map(p => ({ value: p.id, label: p.displayName || p.id }))
		.sort((a, b) => a.label.localeCompare(b.label))
)
const speciesDisplayName = (id) => allPokemon.find(p => p.id === id)?.displayName ?? id
const moveDisplayName = (id) => allMoves.find(m => m.id === id)?.displayName ?? id

const selectedSlot = computed(() =>
	selectedIndex.value != null ? partyStore.getSlot(selectedIndex.value) : null
)

const availableMoves = computed(() =>
	[...allMoves].sort((a, b) => a.displayName.localeCompare(b.displayName))
)

/** Computed stat value for display when in advanced mode */
function computedStat(slot, stat) {
	if (!slot?.species) return null
	const species = getPokemon(slot.species)
	if (!species) return null
	const bs = species.baseStats
	const level = slot.level ?? 50
	const dvs = slot.dvs ?? { atk: 15, def: 15, spe: 15, spc: 15 }
	const statExp = slot.statExp ?? { hp: 65535, atk: 65535, def: 65535, spe: 65535, spc: 65535 }
	return calcGen1Stat(stat, bs[stat], level, dvs, statExp[stat] ?? 65535)
}

function selectSlot(index) {
	selectedIndex.value = index
}

function updateSlot(field, value) {
	if (selectedIndex.value == null) return
	const current = partyStore.getSlot(selectedIndex.value)
	const updates = {}
	if (field === 'species') {
		updates.species = value
		updates.moves = [null, null, null, null]
	} else if (field === 'level') {
		updates.level = Math.max(1, Math.min(100, parseInt(value, 10) || 50))
	} else if (field === 'useAdvanced') {
		updates.useAdvanced = value
	} else if (field.startsWith('stat.')) {
		const stat = field.split('.')[1]
		const num = parseInt(value, 10)
		updates.stats = { ...current.stats, [stat]: isNaN(num) ? null : num }
	} else if (field.startsWith('dv.')) {
		const stat = field.split('.')[1]
		updates.dvs = { ...current.dvs, [stat]: Math.max(0, Math.min(15, parseInt(value, 10) || 0)) }
	} else if (field.startsWith('statExp.')) {
		const stat = field.split('.')[1]
		updates.statExp = { ...current.statExp, [stat]: Math.max(0, Math.min(65535, parseInt(value, 10) || 0)) }
	} else if (field.startsWith('move.')) {
		const idx = parseInt(field.split('.')[1], 10)
		const moves = [...(current.moves || [null, null, null, null])]
		moves[idx] = value || null
		updates.moves = moves
	}
	partyStore.setSlot(selectedIndex.value, { ...current, ...updates })
}

function hpDv(slot) {
	if (!slot?.dvs) return 0
	const { atk, def, spe, spc } = slot.dvs
	return (atk % 2) * 8 + (def % 2) * 4 + (spe % 2) * 2 + (spc % 2)
}
</script>

<template>
	<div class="party-view">
		<h1>Party Builder</h1>
		<p class="lead">Build your team of 6 Pokemon. Data is saved automatically.</p>

		<div class="party-grid">
			<button
				v-for="(slot, i) in partyStore.party"
				:key="i"
				class="slot-card"
				:class="{ selected: selectedIndex === i }"
				@click="selectSlot(i)"
			>
				<div class="slot-name">{{ slot.species ? speciesDisplayName(slot.species) : 'Empty' }}</div>
				<div class="slot-level" v-if="slot.species">Lv.{{ slot.level }}</div>
				<div class="slot-moves" v-if="slot.species && slot.moves?.filter(Boolean).length">
					{{ slot.moves?.filter(Boolean).map(mid => moveDisplayName(mid)).join(', ') || '-' }}
				</div>
			</button>
		</div>

		<div v-if="selectedSlot" class="editor-panel">
			<h2>Edit Slot {{ selectedIndex + 1 }}</h2>

			<div class="form-group">
				<label>Species</label>
				<select
					:value="selectedSlot.species"
					@change="updateSlot('species', $event.target.value)"
				>
					<option value="">-- Select --</option>
					<option v-for="p in pokemonOptions" :key="p.value" :value="p.value">
						{{ p.label }}
					</option>
				</select>
			</div>

			<div class="form-group" v-if="selectedSlot.species">
				<label>Level</label>
				<input
					type="number"
					min="1"
					max="100"
					:value="selectedSlot.level"
					@input="updateSlot('level', $event.target.value)"
				/>
			</div>

			<div v-if="selectedSlot.species" class="stats-section">
				<h3>Stats</h3>
				<div class="stat-row" v-for="stat in ['hp','atk','def','spe','spc']" :key="stat">
					<label>{{ stat.toUpperCase() }}</label>
					<input
						v-if="!selectedSlot.useAdvanced"
						type="number"
						min="0"
						:value="selectedSlot.stats?.[stat] ?? ''"
						:placeholder="String(computedStat(selectedSlot, stat) ?? '')"
						@input="updateSlot('stat.' + stat, $event.target.value)"
					/>
					<span v-else class="stat-readonly">{{ computedStat(selectedSlot, stat) ?? '-' }}</span>
				</div>
				<div class="toggle-row">
					<button
						type="button"
						class="mode-btn"
						:class="{ active: !selectedSlot.useAdvanced }"
						@click="updateSlot('useAdvanced', false)"
					>
						Stats
					</button>
					<button
						type="button"
						class="mode-btn"
						:class="{ active: selectedSlot.useAdvanced }"
						@click="updateSlot('useAdvanced', true)"
					>
						Advanced
					</button>
				</div>
			</div>

			<div v-if="selectedSlot.species && selectedSlot.useAdvanced" class="stats-section">
				<h3>DVs (0-15)</h3>
				<div class="stat-row">
					<label>Atk</label>
					<input type="number" min="0" max="15" :value="selectedSlot.dvs?.atk ?? 15"
						@input="updateSlot('dv.atk', $event.target.value)" />
				</div>
				<div class="stat-row">
					<label>Def</label>
					<input type="number" min="0" max="15" :value="selectedSlot.dvs?.def ?? 15"
						@input="updateSlot('dv.def', $event.target.value)" />
				</div>
				<div class="stat-row">
					<label>Spe</label>
					<input type="number" min="0" max="15" :value="selectedSlot.dvs?.spe ?? 15"
						@input="updateSlot('dv.spe', $event.target.value)" />
				</div>
				<div class="stat-row">
					<label>Spc</label>
					<input type="number" min="0" max="15" :value="selectedSlot.dvs?.spc ?? 15"
						@input="updateSlot('dv.spc', $event.target.value)" />
				</div>
				<div class="stat-row">
					<label>HP (calc)</label>
					<span>{{ hpDv(selectedSlot) }}</span>
				</div>
			</div>

			<div v-if="selectedSlot.species && selectedSlot.useAdvanced" class="stats-section">
				<h3>Stat Experience (0-65535)</h3>
				<div class="stat-row" v-for="stat in ['hp','atk','def','spe','spc']" :key="stat">
					<label>{{ stat.toUpperCase() }}</label>
					<input type="number" min="0" max="65535" :value="selectedSlot.statExp?.[stat] ?? 65535"
						@input="updateSlot('statExp.' + stat, $event.target.value)" />
				</div>
			</div>

			<div v-if="selectedSlot.species" class="moves-section">
				<h3>Moves</h3>
				<div class="move-row" v-for="(_, i) in 4" :key="i">
					<label>Move {{ i + 1 }}</label>
					<select
						:value="selectedSlot.moves?.[i] ?? ''"
						@change="updateSlot('move.' + i, $event.target.value)"
					>
						<option value="">-- None --</option>
						<option v-for="m in availableMoves" :key="m.id" :value="m.id">
							{{ m.displayName }} ({{ m.power }}/{{ m.type }})
						</option>
					</select>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.party-view {
	max-width: 900px;
}
.lead {
	color: #666;
	margin-bottom: 1.5rem;
}
.party-grid {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 0.75rem;
	margin-bottom: 2rem;
}
.slot-card {
	padding: 1rem;
	border: 2px solid #ddd;
	border-radius: 8px;
	background: #fff;
	cursor: pointer;
	text-align: left;
}
.slot-card:hover {
	border-color: #999;
}
.slot-card.selected {
	border-color: #0d6efd;
	background: #f0f7ff;
}
.slot-name {
	font-weight: 600;
}
.slot-level, .slot-moves {
	font-size: 0.85rem;
	color: #666;
	margin-top: 0.25rem;
}
.editor-panel {
	background: #f8f9fa;
	padding: 1.5rem;
	border-radius: 8px;
}
.form-group, .stats-section, .moves-section {
	margin-bottom: 1rem;
}
.form-group label, .stat-row label, .move-row label {
	display: inline-block;
	width: 80px;
}
.stat-row, .move-row {
	margin-bottom: 0.5rem;
}
input[type="number"], select {
	padding: 0.25rem 0.5rem;
}
.toggle-row {
	display: flex;
	gap: 0.5rem;
	align-items: center;
	margin-top: 0.75rem;
}
.mode-btn {
	padding: 0.25rem 0.75rem;
	border: 2px solid #ddd;
	border-radius: 4px;
	background: #fff;
	cursor: pointer;
}
.mode-btn:hover {
	border-color: #999;
}
.mode-btn.active {
	border-color: #0d6efd;
	background: #0d6efd;
	color: #fff;
}
.stat-readonly {
	display: inline-block;
	min-width: 4em;
}
</style>
