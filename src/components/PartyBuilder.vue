<script setup>
import { computed, ref } from 'vue'
import { calcGen1Stat, getAllMoves, getAllPokemon, getPokemon } from '../services/gamedata'

const props = defineProps({
	party: { type: Array, required: true },
	getSlot: { type: Function, required: true },
	setSlot: { type: Function, required: true },
	/** Optional. When provided, shows Remove link to clear the slot. */
	clearSlot: { type: Function, default: undefined },
	editorTitle: { type: String, default: 'Edit Slot' },
	/** When provided, parent controls selection (e.g. battle store). */
	selectedIndex: { type: Number, default: undefined },
	/** Show nickname field in editor (e.g. for your party). */
	showNickname: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const internalSelectedIndex = ref(null)
const effectiveSelectedIndex = computed(() =>
	props.selectedIndex != null ? props.selectedIndex : internalSelectedIndex.value
)

const allPokemon = getAllPokemon()
const allMoves = getAllMoves()
const pokemonOptions = computed(() =>
	allPokemon
		.map(p => ({ value: p.id, label: p.displayName || p.id }))
		.sort((a, b) => a.label.localeCompare(b.label))
)
const speciesDisplayName = (id) => allPokemon.find(p => p.id === id)?.displayName ?? id
function slotDisplayName(slot) {
	if (!slot?.species) return 'Empty'
	if (slot.nickname?.trim()) return slot.nickname.trim()
	return speciesDisplayName(slot.species)
}
const moveDisplayName = (id) => allMoves.find(m => m.id === id)?.displayName ?? id

const selectedSlot = computed(() =>
	effectiveSelectedIndex.value != null ? props.getSlot(effectiveSelectedIndex.value) : null
)

const availableMoves = computed(() =>
	[...allMoves].sort((a, b) => a.displayName.localeCompare(b.displayName))
)

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
	internalSelectedIndex.value = index
	emit('select', index)
}

function handleRemove() {
	if (effectiveSelectedIndex.value == null || !props.clearSlot) return
	props.clearSlot(effectiveSelectedIndex.value)
}

function updateSlot(field, value) {
	if (effectiveSelectedIndex.value == null) return
	const current = props.getSlot(effectiveSelectedIndex.value)
	const updates = {}
	if (field === 'species') {
		updates.species = value
		updates.moves = [null, null, null, null]
	} else if (field === 'nickname') {
		updates.nickname = value ?? ''
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
	props.setSlot(effectiveSelectedIndex.value, { ...current, ...updates })
}

function hpDv(slot) {
	if (!slot?.dvs) return 0
	const { atk, def, spe, spc } = slot.dvs
	return (atk % 2) * 8 + (def % 2) * 4 + (spe % 2) * 2 + (spc % 2)
}
</script>

<template>
	<div class="party-builder">
		<div class="party-grid">
			<button
				v-for="(slot, i) in party"
				:key="i"
				class="slot-card card"
				:class="{ selected: effectiveSelectedIndex === i, empty: !slot?.species }"
				@click="selectSlot(i)">
				<div class="slot-name">{{ slotDisplayName(slot) }}</div>
				<div class="slot-level" v-if="slot.species">Lv.{{ slot.level }}</div>
				<div class="slot-moves" v-if="slot.species && slot.moves?.filter(Boolean).length">
					<div v-for="mid in slot.moves.filter(Boolean)" :key="mid" class="slot-move">{{ moveDisplayName(mid) }}
					</div>
				</div>
			</button>
		</div>

		<div v-if="selectedSlot" class="editor-panel well">
			<div class="editor-header">
				<h2>{{ editorTitle }} {{ effectiveSelectedIndex + 1 }}</h2>
				<a
					v-if="selectedSlot.species && clearSlot"
					href="#"
					class="remove-link"
					@click.prevent="handleRemove"
				>Remove</a>
			</div>

			<div class="form-group">
				<label>Species</label>
				<select
					:value="selectedSlot.species"
					@change="updateSlot('species', $event.target.value)">
					<option value="">-- Select --</option>
					<option v-for="p in pokemonOptions" :key="p.value" :value="p.value">
						{{ p.label }}
					</option>
				</select>
			</div>

			<div class="form-group" v-if="selectedSlot.species && showNickname">
				<label>Nickname</label>
				<input
					type="text"
					:value="selectedSlot.nickname ?? ''"
					placeholder="Optional"
					@input="updateSlot('nickname', $event.target.value)" />
			</div>
			<div class="form-group" v-if="selectedSlot.species">
				<label>Level</label>
				<input
					type="number"
					min="1"
					max="100"
					:value="selectedSlot.level"
					@input="updateSlot('level', $event.target.value)" />
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
						@input="updateSlot('stat.' + stat, $event.target.value)" />
					<span v-else class="stat-readonly">{{ computedStat(selectedSlot, stat) ?? '-' }}</span>
				</div>
				<div class="toggle-row">
					<button
						type="button"
						class="mode-btn"
						:class="{ active: !selectedSlot.useAdvanced }"
						@click="updateSlot('useAdvanced', false)">
						Stats
					</button>
					<button
						type="button"
						class="mode-btn"
						:class="{ active: selectedSlot.useAdvanced }"
						@click="updateSlot('useAdvanced', true)">
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
						@change="updateSlot('move.' + i, $event.target.value)">
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
.party-builder {
	max-width: 900px;
}
.party-grid {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 0.75rem;
	margin-bottom: 2rem;
}
.slot-card {
	display: flex;
	flex-direction: column;
	padding: 1rem;
	border: 2px solid #ddd;
	cursor: pointer;
	text-align: left;

	&.empty {
		justify-content: center;

		.slot-name {
			color: #999;
		}
	}
	&:hover {
		border-color: #999;
	}
	&.selected {
		border-color: #0d6efd;
		background: #f0f7ff;
	}
}
.slot-name {
	font-weight: 600;
}
.slot-level,
.slot-moves {
	font-size: 0.85rem;
	color: #666;
	margin-top: 0.25rem;
}
.slot-moves {
	margin-top: 0.25rem;
}
.slot-move {
	display: block;
	line-height: 1.2;
}
.editor-panel {
	padding: 1.5rem;
}
.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
}
.editor-header h2 {
	margin: 0;
}
.remove-link {
	font-size: 0.9rem;
	color: #0d6efd;
	text-decoration: none;
	flex-shrink: 0;
}
.remove-link:hover {
	text-decoration: underline;
}
.form-group,
.stats-section,
.moves-section {
	margin-bottom: 1rem;
}
.form-group label,
.stat-row label,
.move-row label {
	display: inline-block;
	width: 80px;
}
.stat-row,
.move-row {
	margin-bottom: 0.5rem;
}
input[type="number"],
select {
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
