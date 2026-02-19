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
	<div class="matchup-column">
		<div class="matchup-card-back well">
			<div class="matchup-card-back-content">
				<FieldEffectsSide
					:label="sideLabel || label"
					:side-effects="sideEffects"
					:on-set-side="onSetSide" />
			</div>
			<div class="matchup-card card">
				<div class="pokemon-header">
					<strong>{{ label }}</strong>
					<template v-if="pokemon"> Lv.{{ pokemon.level }}</template>
				</div>
				<div v-if="pokemon?.species" class="pokemon-stats">
					<span v-for="stat in ['hp','atk','def','spe','spc']" :key="stat" class="stat-chip">
						{{ STAT_LABELS[stat] }} {{ displayStat(pokemon, stat) ?? '-' }}
					</span>
				</div>
				<div class="move-section">
					<label>Move</label>
					<div class="move-buttons">
						<template v-for="(m, i) in moves" :key="m?.id ?? i">
							<button
								v-if="m"
								class="btn btn-nowrap"
								:class="{ selected: isMoveSelected(m.id) }"
								@click="onSetMove(m.id)">
								{{ m.displayName }} ({{ m.power }})
							</button>
							<div v-else class="move-slot-empty" />
						</template>
					</div>
				</div>
				<div class="condition-group">
					<label>Status</label>
					<select :value="status" @change="onSetStatus($event.target.value)">
						<option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
					</select>
				</div>
				<div class="condition-group stat-boosts">
					<label>Stat Boosts</label>
					<div class="boost-row">
						<span>Atk</span>
						<select :value="boosts.atk" @change="onSetBoost('atk', Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
					<div class="boost-row">
						<span>Def</span>
						<select :value="boosts.def" @change="onSetBoost('def', Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
					<div class="boost-row">
						<span>Spc</span>
						<select :value="specialValue" @change="onSetSpecial(Number($event.target.value))">
							<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
						</select>
					</div>
					<div class="boost-row">
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
.matchup-column {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
.matchup-card-back-content {
	padding: 0.5rem 1rem;
}
.matchup-card {
	padding: 1rem 1.25rem;
}
.pokemon-header {
	margin-bottom: 0.5rem;
	font-size: 1.1rem;
}
.pokemon-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem 1rem;
	margin-bottom: 1rem;
	font-size: 0.85rem;
	color: #555;
}
.stat-chip {
	white-space: nowrap;
}
.move-section {
	margin-bottom: 1rem;
}
.move-section label {
	display: block;
	font-size: 0.85rem;
	color: #555;
	margin-bottom: 0.25rem;
}
.move-buttons {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.35rem;
}
.move-buttons .btn {
	padding-left: 0;
	padding-right: 0;
}
.move-slot-empty {
	padding: 0.25rem 1rem;
	background: #e9ecef;
	border-radius: 6px;
	border: 2px solid #dee2e6;
	min-height: 2rem;
}
.condition-group {
	margin-bottom: 1rem;
}
.condition-group label {
	display: block;
	font-size: 0.85rem;
	color: #555;
	margin-bottom: 0.25rem;
}
.condition-group select {
	width: 100%;
	padding: 0.35rem 0.5rem;
	border: 1px solid #ccc;
	border-radius: 4px;
}
.stat-boosts .boost-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.35rem;
}
.stat-boosts .boost-row span {
	font-size: 0.9rem;
	min-width: 2rem;
}
.stat-boosts .boost-row select {
	width: 4rem;
	padding: 0.25rem;
}
</style>
