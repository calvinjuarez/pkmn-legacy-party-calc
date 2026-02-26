<script setup>
import { calcGen1Stat, getPokemon } from '../services/gamedata'
import FieldEffectsSide from './FieldEffectsSide.vue'

function displayStat(pokemon, stat) {
	if (!pokemon?.species) return null
	const s = pokemon.stats?.[stat]
	if (s != null && s !== '') return Number(s)
	const species = getPokemon(pokemon.species)
	if (!species) return null
	const bs = species.baseStats
	const level = pokemon.level ?? 50
	const dvs = pokemon.dvs ?? { atk: 15, def: 15, spe: 15, spc: 15 }
	const statExp = pokemon.statExp ?? { hp: 65535, atk: 65535, def: 65535, spe: 65535, spc: 65535 }
	return calcGen1Stat(stat, bs[stat], level, dvs, statExp[stat] ?? 65535)
}

const STAT_LABELS = { hp: 'HP', atk: 'Atk', def: 'Def', spe: 'Spd', spc: 'Spc' }

const STATUS_OPTIONS = [
	{ value: '', label: 'None' },
	{ value: 'brn', label: 'Burn' },
	{ value: 'par', label: 'Paralyze' },
	{ value: 'psn', label: 'Poison' },
	{ value: 'slp', label: 'Sleep' },
	{ value: 'frz', label: 'Freeze' },
	{ value: 'tox', label: 'Toxic' },
]

const BOOST_OPTIONS = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]

defineProps({
	label: { type: String, required: true },
	sideLabel: { type: String, default: '' },
	onOpenParty: { type: Function, default: undefined },
	pokemon: { type: Object, default: null },
	moves: { type: Array, default: () => [] },
	status: { type: String, default: '' },
	boosts: { type: Object, required: true },
	specialValue: { type: Number, default: 0 },
	sideEffects: { type: Object, default: () => ({}) },
	isMoveSelected: { type: Function, default: () => false },
	onSetMove: { type: Function, default: () => { } },
	onSetStatus: { type: Function, default: () => { } },
	onSetBoost: { type: Function, default: () => { } },
	onSetSpecial: { type: Function, default: () => { } },
	onSetSide: { type: Function, default: () => { } },
})
</script>

<template>
	<div class="c-matchup_column">
		<div class="c-matchup_column--side well">
			<div class="c-matchup_column--preamble">
				<FieldEffectsSide
					:label="sideLabel || label"
					:side-effects="sideEffects"
					:on-set-side="onSetSide" />
			</div>
			<div class="c-matchup_column--main card">
				<div class="c-matchup_column--main--header">
					<span class="c-matchup_column--header_label">
						<strong>{{ label }}</strong>&nbsp;
						<small v-if="pokemon">
							<span
								class="hidden-vw_600_down">Lv.</span>{{ pokemon.level }}
						</small>
					</span>
					<button
						v-if="onOpenParty"
						type="button"
						class="c-matchup_column--swap_btn  btn btn-primary"
						aria-label="Change Pokemon"
						title="Tap to change Pokemon"
						@click="onOpenParty">
						↔
					</button>
				</div>
				<dl v-if="pokemon?.species" class="c-matchup_column--stats">
					<div v-for="stat in ['hp','atk','def','spe','spc']" :key="stat" class="c-matchup_column--stat">
						<dt>{{ STAT_LABELS[stat] }}</dt>
						<dd>{{ displayStat(pokemon, stat) ?? '-' }}</dd>
					</div>
				</dl>
				<div class="c-matchup_column--main--move_section">
					<label>Move</label>
					<div class="c-matchup_column--main--move_buttons">
						<template v-for="(m, i) in moves" :key="m?.id ?? i">
							<button
								v-if="m"
								class="btn btn-nowrap"
								:class="{ selected: isMoveSelected(m.id) }"
								@click="onSetMove(m.id)">
								{{ m.displayName }} ({{ m.power }})
							</button>
							<div v-else class="l-move_slot-empty" />
						</template>
					</div>
				</div>
				<div class="c-matchup_column--main--condition_group">
					<label>Status</label>
					<select :value="status" @change="onSetStatus($event.target.value)">
						<option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
					</select>
				</div>
				<div class="c-matchup_column--main--condition_group c-matchup_column--main--condition_group-boosts">
					<label>Stat Boosts</label>
					<div class="c-matchup_column--boosts">
						<div class="c-matchup_column--boost">
							<label>Atk</label>
							<select :value="boosts.atk" @change="onSetBoost('atk', Number($event.target.value))">
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="c-matchup_column--boost">
							<label>Def</label>
							<select :value="boosts.def" @change="onSetBoost('def', Number($event.target.value))">
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="c-matchup_column--boost">
							<label>Spc</label>
							<select :value="specialValue" @change="onSetSpecial(Number($event.target.value))">
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="c-matchup_column--boost">
							<label>Spe</label>
							<select :value="boosts.spe" @change="onSetBoost('spe', Number($event.target.value))">
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.c-matchup_column {
	container-type: inline-size;
	container-name: matchup_column;
}
.c-matchup_column--preamble,
.c-matchup_column--main {
	padding: 1rem 1.25rem;
}
.c-matchup_column--preamble {
	/* keeps content aligned with --main (card) content */
	border: 1px solid transparent;
}
.c-matchup_column--main {}
.c-matchup_column--main--header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-wrap: nowrap;
	margin-bottom: 0.5rem;
	font-size: 1.1rem;
}
.c-matchup_column--header_label {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.c-matchup_column--swap_btn {
	display: none;
	margin-left: auto;
	box-sizing: border-box;
	width: 2rem;
	height: 2rem;
	padding: 0;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border-radius: 1rem;
}
@media (max-width: 899.99px) {
	.c-matchup_column--swap_btn {
		display: inline-flex;
	}
}
@media (max-width: 399.99px) {
	.c-matchup_column--main--header {
		position: relative;
		padding-right: 1rem;
	}
	.c-matchup_column--swap_btn {
		position: absolute;
		right: -1rem;
		top: 50%;
		transform: translateY(-50%);
		margin-left: 0;
	}
}

.c-matchup_column--stats {
	max-width: max(70%, 12rem);
	display: flex;
	gap: 0.25rem 0.5rem;
	justify-content: space-between;
	margin-bottom: 0.75rem;
	font-size: 0.85em;
	color: var(--house--color-ink_muted);
}
.c-matchup_column--stat {
	white-space: nowrap;
}

.c-matchup_column--main--move_section {
	margin-bottom: 1rem;
}
.c-matchup_column--main--move_section label {
	display: block;
	font-size: 0.85rem;
	color: var(--house--color-ink_muted);
	margin-bottom: 0.25rem;
}
.c-matchup_column--main--move_buttons {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(max(45%, 10em), 1fr));
	gap: 0.35rem;
}
.c-matchup_column--main--move_buttons .btn {
	padding-left: 0;
	padding-right: 0;
}

.l-move_slot-empty {
	padding: 0.5rem 1rem;
	background: var(--house--border_color);
	border-radius: var(--house--border_radius-md);
	border: 2px solid transparent;

	&:empty::before {
		/* non-breaking space */
		content: '\00A0';
	}
}

.c-matchup_column--main--condition_group {
	margin-bottom: 1rem;
}
.c-matchup_column--main--condition_group label {
	display: block;
	font-size: 0.85rem;
	color: var(--house--color-ink_muted);
	margin-bottom: 0.25rem;
}
.c-matchup_column--main--condition_group-boosts {
	container-type: inline-size;
}
.c-matchup_column--boosts {
	@container (min-width: 10rem) {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.25rem 0.75rem;
		grid-template-columns: repeat(2, 1fr);
	}
	@container (min-width: 16rem) {
		grid-template-columns: repeat(4, 1fr);
	}
}

.c-matchup_column--boost {
	@container (max-width: 10rem) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	label {
		font-size: 0.9rem;
		min-width: 1.5rem;
	}
}
</style>
