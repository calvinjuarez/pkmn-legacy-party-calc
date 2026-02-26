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
	<div class="c-party_builder">
		<div class="c-party_builder--members">
			<button
				v-for="(slot, i) in party"
				:key="i"
				class="c-party_builder--member card"
				:class="{ selected: effectiveSelectedIndex === i, 'c-party_builder--member-empty': !slot?.species }"
				@click="selectSlot(i)">
				<div class="c-party_builder--member--name">{{ slotDisplayName(slot) }}</div>
				<div class="c-party_builder--member--level" v-if="slot.species">Lv.{{ slot.level }}</div>
				<div class="c-party_builder--member--moves" v-if="slot.species && slot.moves?.filter(Boolean).length">
					<div v-for="mid in slot.moves.filter(Boolean)" :key="mid" class="c-party_builder--member--move">{{
						moveDisplayName(mid) }}
					</div>
				</div>
			</button>
		</div>

		<div v-if="selectedSlot" class="c-party_builder--editor_panel well">
			<div class="c-party_builder--editor_panel--header">
				<h2>{{ editorTitle }} {{ effectiveSelectedIndex + 1 }}</h2>
				<button
					v-if="selectedSlot.species && clearSlot"
					type="button"
					class="btn btn-danger"
					@click="handleRemove">Clear</button>
			</div>

			<div class="form_group form_group-inline">
				<label class="form_group--label">Species</label>
				<select
					:value="selectedSlot.species"
					@change="updateSlot('species', $event.target.value)">
					<option value="">-- Select --</option>
					<option v-for="p in pokemonOptions" :key="p.value" :value="p.value">
						{{ p.label }}
					</option>
				</select>
			</div>

			<div class="form_group form_group-inline" v-if="selectedSlot.species && showNickname">
				<label class="form_group--label">Nickname</label>
				<input
					type="text"
					:value="selectedSlot.nickname ?? ''"
					placeholder="Optional"
					@input="updateSlot('nickname', $event.target.value)" />
			</div>
			<div class="form_group form_group-inline" v-if="selectedSlot.species">
				<label class="form_group--label">Level</label>
				<input
					type="number"
					min="1"
					max="100"
					:value="selectedSlot.level"
					@input="updateSlot('level', $event.target.value)" />
			</div>

			<div v-if="selectedSlot.species" class="c-party_builder--section c-party_builder--section-moves">
				<h3>Moves</h3>
				<div class="c-party_builder--move_row" v-for="(_, i) in 4" :key="i">
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

			<div v-if="selectedSlot.species" class="c-party_builder--section c-party_builder--section-stats">
				<div class="c-party_builder--section--header">
					<h3>Stats</h3>
					<a
						v-if="!selectedSlot.useAdvanced"
						href="#"
						class="c-party_builder--mode_link"
						@click.prevent="updateSlot('useAdvanced', true)">Calculate from DV &amp; Stat Exp</a>
					<a
						v-else
						href="#"
						class="c-party_builder--mode_link"
						@click.prevent="updateSlot('useAdvanced', false)">Enter Stats Directly</a>
				</div>

				<div class="c-party_builder--section--content" :class="{ 'is-advanced': selectedSlot.useAdvanced }">
					<div class="
						c-party_builder--section--content--item
						c-party_builder--section--content--item-in_game_stats
					">
						<h4 v-if="selectedSlot.useAdvanced">In-Game</h4>
						<div class="c-party_builder--stat_rows">
							<div class="c-party_builder--stat_row" v-for="stat in ['hp','atk','def','spe','spc']" :key="stat">
								<label>{{ stat.toUpperCase() }}</label>
								<input
									v-if="!selectedSlot.useAdvanced"
									type="number"
									min="0"
									:value="selectedSlot.stats?.[stat] ?? ''"
									:placeholder="String(computedStat(selectedSlot, stat) ?? '')"
									@input="updateSlot('stat.' + stat, $event.target.value)" />
								<input v-else class="l-stat_calculated" :value="computedStat(selectedSlot, stat) ?? '-'"
									readonly />
							</div>
						</div>
					</div>

					<div v-if="selectedSlot.species && selectedSlot.useAdvanced"
						class="c-party_builder--section--content--item">
						<h4>DVs <small>(0-15)</small></h4>
						<div class="c-party_builder--stat_rows">
							<div class="c-party_builder--stat_row">
								<label>HP</label>
								<input class="l-stat_calculated" :value="hpDv(selectedSlot)" readonly>
							</div>
							<div class="c-party_builder--stat_row">
								<label>ATK</label>
								<input type="number" min="0" max="15" :value="selectedSlot.dvs?.atk ?? 15"
									@input="updateSlot('dv.atk', $event.target.value)" />
							</div>
							<div class="c-party_builder--stat_row">
								<label>DEF</label>
								<input type="number" min="0" max="15" :value="selectedSlot.dvs?.def ?? 15"
									@input="updateSlot('dv.def', $event.target.value)" />
							</div>
							<div class="c-party_builder--stat_row">
								<label>SPE</label>
								<input type="number" min="0" max="15" :value="selectedSlot.dvs?.spe ?? 15"
									@input="updateSlot('dv.spe', $event.target.value)" />
							</div>
							<div class="c-party_builder--stat_row">
								<label>SPC</label>
								<input type="number" min="0" max="15" :value="selectedSlot.dvs?.spc ?? 15"
									@input="updateSlot('dv.spc', $event.target.value)" />
							</div>
						</div>
					</div>

					<div v-if="selectedSlot.species && selectedSlot.useAdvanced"
						class="c-party_builder--section--content--item">
						<h4>Stat&nbsp;XP <small>(0-65535)</small></h4>
						<div class="c-party_builder--stat_rows">
							<div class="c-party_builder--stat_row" v-for="stat in ['hp','atk','def','spe','spc']" :key="stat">
								<label>{{ stat.toUpperCase() }}</label>
								<input type="number" min="0" max="65535" :value="selectedSlot.statExp?.[stat] ?? 65535"
									@input="updateSlot('statExp.' + stat, $event.target.value)" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.c-party_builder {
	container-type: inline-size;
	container-name: party_builder;
	max-width: 900px;
}
.c-party_builder--members {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0.75rem;
	margin-bottom: 2rem;

	@container party_builder (min-width: 400px) {
		grid-template-columns: repeat(3, 1fr);
	}
	@container party_builder (min-width: 650px) {
		grid-template-columns: repeat(6, 1fr);
	}
}
.c-party_builder--member {
	display: flex;
	flex-direction: column;
	padding: 0.75rem;
	border: 2px solid var(--house--border_color-interactive);
	cursor: pointer;
	text-align: left;

	&.c-party_builder--member-empty {
		justify-content: center;

		.c-party_builder--member--name {
			color: var(--house--color-ink_hint);
		}
	}
	&:hover {
		border-color: var(--house--border_color-interactive_hover);
	}
	&.selected {
		border-color: var(--house--color-primary);
		background: var(--house--color-primary_faint);
	}
}
.c-party_builder--member--name {
	font-weight: 600;
}
.c-party_builder--member--level,
.c-party_builder--member--moves {
	font-size: 0.85rem;
	color: var(--house--color-ink_muted);
	margin-top: 0.25rem;
}
.c-party_builder--member--moves {
	margin-top: 0.25rem;
}
.c-party_builder--member--move {
	display: block;
	line-height: 1.2;
	white-space: nowrap;
	text-overflow: ellipsis;
	min-width: 0;
	width: 100%;
	max-width: min-content;
}
.c-party_builder--editor_panel {
	padding: 1.5rem;
}
.c-party_builder--editor_panel--header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;

	h2 {
		margin: 0;
	}
}
.c-party_builder--mode_link {
	font-size: 0.9rem;
	color: var(--house--color-primary);
	text-decoration: none;
	flex-shrink: 0;

	&:hover {
		text-decoration: underline;
	}
}
.c-party_builder--section {
	margin-bottom: 1rem;
}
.c-party_builder--section--header {
	display: flex;
	align-items: end;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
}
.c-party_builder--section--content {
	&.is-advanced {
		@container party_builder (min-width: 400px) {
			display: grid;
			grid-template-columns: max-content max-content 1fr;
			grid-template-rows: repeat(2, auto);
			gap: 0.5rem max(2rem, 10%);

			@container (max-width: 599.99px) {
				grid-template-columns: max-content 1fr;

				.c-party_builder--section--content--item-in_game_stats {
					grid-column: span 2;

					.c-party_builder--stat_rows {
						display: flex;
					}
					.c-party_builder--stat_rows label {
						width: auto;
					}
				}
			}
		}
	}
}
.c-party_builder--section--content--item {}

.c-party_builder--stat_rows {}
.c-party_builder--stat_row,
.c-party_builder--move_row {
	margin-bottom: 0.5rem;

	label {
		width: 80px;
		color: var(--house--color-ink_muted);
	}
}

.l-stat_calculated {
	display: inline-block;
	width: 3.5em;
}
</style>
