<script setup>
import { computed, watch } from 'vue'
import { useBattleStore } from '../stores/battle'
import { usePartyStore } from '../stores/party'
import { getPokemon, getMove, getTrainerDisplayName, getTrainerMonMoves } from '../services/gamedata'

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

const battleStore = useBattleStore()
const partyStore = usePartyStore()

const opponent = computed(() => battleStore.selectedOpponent)
const myParty = computed(() => partyStore.party)
const theirParty = computed(() => opponent.value?.party ?? [])

const myPokemon = computed(() => battleStore.myPokemon)
const theirPokemon = computed(() => battleStore.theirPokemon)

const myMoves = computed(() => {
	const mon = myPokemon.value
	if (!mon?.species || !mon.moves) return []
	return mon.moves.filter(Boolean).map(name => getMove(name)).filter(Boolean)
})

const theirMoves = computed(() => getTrainerMonMoves(theirPokemon.value))

const result = computed(() => battleStore.calcResult)

function damageStr() {
	if (!result.value) return '-'
	const d = result.value.damage
	if (Array.isArray(d)) return d.join('-') + '%'
	return String(d) + '%'
}

function formatDesc() {
	if (!result.value?.desc) return ''
	return result.value.desc()
}

const attackerSpecial = computed(() => battleStore.attackerBoosts.spa)
const defenderSpecial = computed(() => battleStore.defenderBoosts.spa)

watch(
	() => [
		battleStore.myPokemon?.species,
		battleStore.theirPokemon?.species,
		battleStore.selectedMove,
		battleStore.attackerSide,
		battleStore.defenderSide,
		battleStore.attackerStatus,
		battleStore.defenderStatus,
		battleStore.attackerBoosts,
		battleStore.defenderBoosts,
		battleStore.isCrit,
	],
	() => {
		if (battleStore.myPokemon?.species && battleStore.theirPokemon?.species && battleStore.selectedMove) {
			battleStore.calculate()
		}
	},
	{ deep: true }
)
</script>

<template>
	<div class="battle-view">
		<h1>Battle Calculator</h1>

		<div v-if="!opponent" class="empty-state">
			<p>No opponent selected. <router-link to="/opponents">Choose an opponent</router-link> first.</p>
		</div>

		<div v-else class="battle-layout">
			<!-- Pokemon selection row -->
			<div class="selection-row">
				<div class="section my-party">
					<h2>Your Party</h2>
					<div class="party-buttons">
						<button
							v-for="(slot, i) in myParty"
							:key="i"
							class="party-btn"
							:class="{ selected: battleStore.selectedMyIndex === i }"
							@click="battleStore.setMyPokemon(i)"
						>
							{{ (slot.species ? getPokemon(slot.species)?.displayName : null) || 'Empty' }} Lv.{{ slot.level || '-' }}
						</button>
					</div>
				</div>

				<div class="section their-party">
					<h2>{{ getTrainerDisplayName(opponent) }}</h2>
					<div class="party-buttons">
						<button
							v-for="(slot, i) in theirParty"
							:key="i"
							class="party-btn"
							:class="{ selected: battleStore.selectedTheirIndex === i }"
							@click="battleStore.setTheirPokemon(i)"
						>
							{{ getPokemon(slot.species)?.displayName ?? slot.species }} Lv.{{ slot.level }}
						</button>
					</div>
				</div>
			</div>

			<!-- Matchup panel -->
			<div v-if="myPokemon && theirPokemon" class="matchup-panel">
				<div class="matchup-column attacker-column">
					<div class="pokemon-header">
						<strong>{{ getPokemon(myPokemon.species)?.displayName ?? myPokemon.species }}</strong> Lv.{{ myPokemon.level }}
					</div>
					<div class="condition-group">
						<label>Status</label>
						<select
							:value="battleStore.attackerStatus"
							@change="battleStore.setAttackerStatus($event.target.value)"
						>
							<option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
						</select>
					</div>
					<div class="condition-group stat-boosts">
						<label>Stat Boosts</label>
						<div class="boost-row">
							<span>Atk</span>
							<select
								:value="battleStore.attackerBoosts.atk"
								@change="battleStore.setAttackerBoost('atk', Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="boost-row">
							<span>Def</span>
							<select
								:value="battleStore.attackerBoosts.def"
								@change="battleStore.setAttackerBoost('def', Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="boost-row">
							<span>Spc</span>
							<select
								:value="attackerSpecial"
								@change="battleStore.setAttackerSpecial(Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="boost-row">
							<span>Spe</span>
							<select
								:value="battleStore.attackerBoosts.spe"
								@change="battleStore.setAttackerBoost('spe', Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
					</div>
					<div class="condition-group field-toggles">
						<label>Your Side</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								:checked="battleStore.attackerSide.isReflect"
								@change="battleStore.setAttackerSide({ isReflect: $event.target.checked })"
							/>
							Reflect
						</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								:checked="battleStore.attackerSide.isLightScreen"
								@change="battleStore.setAttackerSide({ isLightScreen: $event.target.checked })"
							/>
							Light Screen
						</label>
					</div>
				</div>

				<div class="matchup-center">
					<div class="move-section">
						<h3>Move</h3>
						<div class="move-buttons">
							<button
								v-for="m in myMoves"
								:key="m.id"
								class="move-btn"
								:class="{ selected: battleStore.selectedMove === m.id }"
								@click="battleStore.setMove(m.id)"
							>
								{{ m.displayName }} ({{ m.power }})
							</button>
						</div>
						<label v-if="battleStore.selectedMove" class="checkbox-label crit-toggle">
							<input
								type="checkbox"
								:checked="battleStore.isCrit"
								@change="battleStore.setIsCrit($event.target.checked)"
							/>
							Critical Hit
						</label>
					</div>
					<div v-if="result" class="result-panel">
						<div class="damage">{{ damageStr() }}</div>
						<div class="desc">{{ formatDesc() }}</div>
						<div v-if="result && typeof result.kochance === 'function'" class="ko-chance">
							{{ result.kochance()?.text }}
						</div>
					</div>
					<div v-else-if="battleStore.selectedMove" class="result-placeholder">
						Calculating...
					</div>
				</div>

				<div class="matchup-column defender-column">
					<div class="pokemon-header">
						<strong>{{ getPokemon(theirPokemon.species)?.displayName ?? theirPokemon.species }}</strong> Lv.{{ theirPokemon.level }}
					</div>
					<div class="condition-group">
						<label>Moves</label>
						<div class="moves-list">
							<span v-for="m in theirMoves" :key="m.id" class="move-chip">{{ m.displayName }} ({{ m.power }})</span>
						</div>
					</div>
					<div class="condition-group">
						<label>Status</label>
						<select
							:value="battleStore.defenderStatus"
							@change="battleStore.setDefenderStatus($event.target.value)"
						>
							<option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
						</select>
					</div>
					<div class="condition-group stat-boosts">
						<label>Stat Boosts</label>
						<div class="boost-row">
							<span>Atk</span>
							<select
								:value="battleStore.defenderBoosts.atk"
								@change="battleStore.setDefenderBoost('atk', Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="boost-row">
							<span>Def</span>
							<select
								:value="battleStore.defenderBoosts.def"
								@change="battleStore.setDefenderBoost('def', Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="boost-row">
							<span>Spc</span>
							<select
								:value="defenderSpecial"
								@change="battleStore.setDefenderSpecial(Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
						<div class="boost-row">
							<span>Spe</span>
							<select
								:value="battleStore.defenderBoosts.spe"
								@change="battleStore.setDefenderBoost('spe', Number($event.target.value))"
							>
								<option v-for="b in BOOST_OPTIONS" :key="b" :value="b">{{ b >= 0 ? '+' : '' }}{{ b }}</option>
							</select>
						</div>
					</div>
					<div class="condition-group field-toggles">
						<label>Their Side</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								:checked="battleStore.defenderSide.isReflect"
								@change="battleStore.setDefenderSide({ isReflect: $event.target.checked })"
							/>
							Reflect
						</label>
						<label class="checkbox-label">
							<input
								type="checkbox"
								:checked="battleStore.defenderSide.isLightScreen"
								@change="battleStore.setDefenderSide({ isLightScreen: $event.target.checked })"
							/>
							Light Screen
						</label>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.battle-view {
	max-width: 1100px;
}
.empty-state {
	padding: 2rem;
	background: #f8f9fa;
	border-radius: 8px;
}
.battle-layout {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}
.selection-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1.5rem;
}
.section {
	background: #f8f9fa;
	padding: 1rem 1.5rem;
	border-radius: 8px;
}
.section h2, .section h3 {
	margin-top: 0;
	margin-bottom: 0.75rem;
}
.party-buttons, .move-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}
.party-btn, .move-btn {
	padding: 0.5rem 1rem;
	border: 2px solid #ddd;
	border-radius: 6px;
	background: #fff;
	cursor: pointer;
}
.party-btn:hover, .move-btn:hover {
	border-color: #999;
}
.party-btn.selected, .move-btn.selected {
	border-color: #0d6efd;
	background: #f0f7ff;
}

.matchup-panel {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	gap: 1.5rem;
	align-items: start;
}
.matchup-column {
	background: #f8f9fa;
	padding: 1rem 1.25rem;
	border-radius: 8px;
}
.pokemon-header {
	margin-bottom: 1rem;
	font-size: 1.1rem;
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
.field-toggles .checkbox-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.35rem;
	font-size: 0.9rem;
	cursor: pointer;
}
.field-toggles .checkbox-label input {
	cursor: pointer;
}
.moves-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.35rem;
}
.move-chip {
	display: inline-block;
	padding: 0.25rem 0.5rem;
	font-size: 0.85rem;
	background: #e9ecef;
	border-radius: 4px;
}

.matchup-center {
	background: #f8f9fa;
	padding: 1rem 1.5rem;
	border-radius: 8px;
	min-width: 220px;
}
.move-section h3 {
	margin-bottom: 0.5rem;
}
.crit-toggle {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 0.75rem;
	cursor: pointer;
}
.result-panel .damage {
	font-size: 1.5rem;
	font-weight: 600;
}
.result-panel .desc {
	margin-top: 0.5rem;
	font-size: 0.9rem;
	color: #333;
}
.result-panel .ko-chance {
	margin-top: 0.35rem;
	font-size: 0.9rem;
	color: #555;
}
.result-placeholder {
	margin-top: 0.5rem;
	color: #888;
	font-size: 0.9rem;
}
</style>
