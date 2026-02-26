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
			<div class="c-matchup_column--side--content">
				<FieldEffectsSide
					:label="sideLabel || label"
					:side-effects="sideEffects"
					:on-set-side="onSetSide" />
			</div>
			<div class="c-matchup_column--main card">
				<div class="c-matchup_column--main--header">
					<strong>{{ label }}</strong>
					<template v-if="pokemon"> Lv.{{ pokemon.level }}</template>
				</div>
				<div v-if="pokemon?.species" class="c-matchup_column--main--stats">
					<span v-for="stat in ['hp','atk','def','spe','spc']" :key="stat" class="l-stat_chip">
						{{ STAT_LABELS[stat] }} {{ displayStat(pokemon, stat) ?? '-' }}
					</span>
				</div>
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
				<div class="c-matchup_column--main--condition_group c-matchup_column--main--condition_group--stat_boosts">
					<label>Stat Boosts</label>
					<div class="c-matchup_column--main--boost_row">
						<span>Atk</span>
						<select :value="boosts.atk" @change="onSetBoost('atk', Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
					<div class="c-matchup_column--main--boost_row">
						<span>Def</span>
						<select :value="boosts.def" @change="onSetBoost('def', Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
					<div class="c-matchup_column--main--boost_row">
						<span>Spc</span>
						<select :value="specialValue" @change="onSetSpecial(Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
					<div class="c-matchup_column--main--boost_row">
						<span>Spe</span>
						<select :value="boosts.spe" @change="onSetBoost('spe', Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.c-matchup_column {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
.c-matchup_column--side--content {
	padding: 0.5rem 1rem;
}
.c-matchup_column--main {
	padding: 1rem 1.25rem;
}
.c-matchup_column--main--header {
	margin-bottom: 0.5rem;
	font-size: 1.1rem;
}
.c-matchup_column--main--stats {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem 1rem;
	margin-bottom: 1rem;
	font-size: 0.85rem;
	color: var(--house--color-muted);
}
.l-stat_chip {
	white-space: nowrap;
}
.c-matchup_column--main--move_section {
	margin-bottom: 1rem;
}
.c-matchup_column--main--move_section label {
	display: block;
	font-size: 0.85rem;
	color: var(--house--color-muted);
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
	padding: 0.25rem 1rem;
	background: var(--house--color-border_subtle);
	border-radius: var(--house--border_radius-md);
	border: 2px solid var(--house--color-border_medium);
	min-height: 2rem;
}
.c-matchup_column--main--condition_group {
	margin-bottom: 1rem;
}
.c-matchup_column--main--condition_group label {
	display: block;
	font-size: 0.85rem;
	color: var(--house--color-muted);
	margin-bottom: 0.25rem;
}
.c-matchup_column--main--condition_group select {
	width: 100%;
	padding: 0.35rem 0.5rem;
	border: 1px solid var(--house--color-border_input);
	border-radius: var(--house--border_radius-sm);
}
.c-matchup_column--main--condition_group--stat_boosts .c-matchup_column--main--boost_row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.35rem;
}
.c-matchup_column--main--condition_group--stat_boosts .c-matchup_column--main--boost_row span {
	font-size: 0.9rem;
	min-width: 2rem;
}
.c-matchup_column--main--condition_group--stat_boosts .c-matchup_column--main--boost_row select {
	width: 4rem;
	padding: 0.25rem;
}
</style>
