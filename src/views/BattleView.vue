<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MatchupColumn from '../components/MatchupColumn.vue'
import { getMove, getPokemon, getTrainerMonMoves } from '../services/gamedata'
import { useBattleStore } from '../stores/battle'
import { useOpponentPartyStore } from '../stores/opponentParty'
import { usePartyStore } from '../stores/party'

const battleStore = useBattleStore()
const partyStore = usePartyStore()
const opponentPartyStore = useOpponentPartyStore()

let isMounted = true
onBeforeUnmount(() => { isMounted = false })

function partyToSlots(party) {
	const arr = Array.isArray(party) ? party : (party?.value ?? [])
	return arr.map((slot, index) => ({ index, slot })).filter(({ slot }) => slot?.species)
}

function slotDisplayName(slot) {
	if (!slot?.species) return 'Empty'
	if (slot.nickname?.trim()) return slot.nickname.trim()
	return getPokemon(slot.species)?.displayName ?? slot.species
}

const myPartySlots = computed(() => partyToSlots(partyStore.party))
const theirPartySlots = computed(() => partyToSlots(opponentPartyStore.party))

const myPokemon = computed(() => battleStore.myPokemon)
const theirPokemon = computed(() => battleStore.theirPokemon)

const myMoves = computed(() => {
	const mon = myPokemon.value
	if (!mon?.species || !mon.moves) return []
	return mon.moves.filter(Boolean).map(name => getMove(name)).filter(Boolean)
})

const theirMoves = computed(() => getTrainerMonMoves(theirPokemon.value))

/** Padded to 4 slots; empty slots are null */
function padMoves(moves, length = 4) {
	const arr = [...(moves ?? [])]
	while (arr.length < length) arr.push(null)
	return arr.slice(0, length)
}

const myMovesPadded = computed(() => padMoves(myMoves.value))
const theirMovesPadded = computed(() => padMoves(theirMoves.value))

const result = computed(() => battleStore.calcResult)
const koChance = computed(() => {
	const r = result.value
	if (!r || r.noDamage || typeof r.kochance !== 'function') return null
	const [, maxDamage] = r.range?.() ?? [0, 0]
	if (maxDamage === 0) return { chance: 0, n: 0, text: 'no damage' }
	return r.kochance()
})

/** Damage roll distribution: [{ damage, count }] sorted by damage, for chart */
const damageDistribution = computed(() => {
	const r = result.value
	if (!r?.damage || r.noDamage || !Array.isArray(r.damage) || r.damage.length === 0) return []
	const counts = {}
	for (const d of r.damage) {
		counts[d] = (counts[d] ?? 0) + 1
	}
	return Object.entries(counts)
		.map(([damage, count]) => ({ damage: Number(damage), count }))
		.sort((a, b) => a.damage - b.damage)
})

const maxDistCount = computed(() =>
	damageDistribution.value.length ? Math.max(...damageDistribution.value.map(d => d.count)) : 1
)

const hoveredDamage = ref(null)

const chartCaption = computed(() => {
	const dist = damageDistribution.value
	if (!dist.length) return ''
	if (hoveredDamage.value != null) {
		const entry = dist.find(d => d.damage === hoveredDamage.value)
		return entry ? `${entry.damage} HP: ${entry.count}/39 rolls` : ''
	}
	const lo = dist[0]?.damage ?? ''
	const hi = dist[dist.length - 1]?.damage ?? ''
	return lo === hi ? `${lo} HP` : `${lo}-${hi} HP`
})

const attackerSpecial = computed(() => battleStore.attackerBoosts.spa)
const defenderSpecial = computed(() => battleStore.defenderBoosts.spa)

onMounted(() => {
	battleStore.ensureValidSelection()
})

watch(
	[() => partyStore.party, () => opponentPartyStore.party],
	() => battleStore.ensureValidSelection(),
	{ deep: true }
)

watch(
	() => [
		battleStore.myPokemon?.species,
		battleStore.theirPokemon?.species,
		battleStore.selectedMove,
		battleStore.moveFromOpponent,
		battleStore.attackerSide,
		battleStore.defenderSide,
		battleStore.attackerStatus,
		battleStore.defenderStatus,
		battleStore.attackerBoosts,
		battleStore.defenderBoosts,
		battleStore.isCrit,
	],
	() => {
		if (!isMounted) return
		if (battleStore.myPokemon?.species && battleStore.theirPokemon?.species && battleStore.selectedMove) {
			battleStore.calculate()
		}
	},
	{ deep: true }
)
</script>

<template>
	<div class="v-battle">
		<h1>Battle Calculator</h1>

		<div class="v-battle--main">
			<aside class="v-battle--sidebar v-battle--sidebar-my_party well">
				<div class="v-battle--sidebar--header">
					<h2>Your Party</h2>
					<router-link to="/party" class="l-edit_link">Edit</router-link>
				</div>
				<div class="v-battle--party_buttons">
					<button
						v-for="{ index, slot } in myPartySlots"
						:key="index"
						class="l-party_button  btn"
						:class="{ selected: battleStore.selectedMyIndex === index }"
						@click="battleStore.setMyPokemon(index)">
						{{ slotDisplayName(slot) }} <small class="l-party_button--level">Lv.{{ slot.level || '-' }}</small>
					</button>
				</div>
			</aside>

			<main class="v-battle--matchup">
				<div v-if="myPokemon && theirPokemon" class="v-battle--matchup_content">
					<div class="l-result_summary card">
						<div class="l-result_summary--main">
							<div v-if="result" class="l-result_summary--panel">
								<div v-if="result.noDamage" class="l-ko_chance-hero l-ko_chance-none">Status move — no damage</div>
								<template v-else>
									<div v-if="koChance?.text" class="l-ko_chance-hero">{{ koChance.text }}</div>
									<div v-else class="l-ko_chance-hero l-ko_chance-none">Not a KO</div>
								</template>
							</div>
							<div v-else-if="battleStore.selectedMove" class="l-result_summary--placeholder">
								Calculating...
							</div>
							<div v-else class="l-result_summary--prompt">
								Select a move
							</div>
							<label v-if="battleStore.selectedMove && !result?.noDamage" class="l-crit_checkbox">
								<input type="checkbox" :checked="battleStore.isCrit"
									@change="battleStore.setIsCrit($event.target.checked)" />
								Critical Hit
							</label>
						</div>
						<div v-if="damageDistribution.length > 0" class="l-damage_chart">
							<div class="l-damage_chart--title">Rolls</div>
							<div class="l-damage_chart--bars">
								<div v-for="{ damage, count } in damageDistribution" :key="damage" class="l-damage_chart--bar"
									:class="{ 'l-damage_chart--bar-hover': hoveredDamage === damage }" @mouseenter="hoveredDamage = damage"
									@mouseleave="hoveredDamage = null">
									<div class="l-damage_chart--bar_fill" :style="{ height: (count / maxDistCount) * 36 + 'px' }" />
								</div>
							</div>
							<div class="l-damage_chart--caption">{{ chartCaption }}</div>
						</div>
					</div>

					<div class="v-battle--matchup_panel">
						<MatchupColumn :label="slotDisplayName(myPokemon) || 'Your Pokémon'" side-label="Your side"
							:pokemon="myPokemon"
							:moves="myMovesPadded" :status="battleStore.attackerStatus" :boosts="battleStore.attackerBoosts"
							:special-value="attackerSpecial" :side-effects="battleStore.attackerSide"
							:is-move-selected="(id) => battleStore.selectedMove === id && !battleStore.moveFromOpponent"
							:on-set-move="(id) => battleStore.setMove(id, false)"
							:on-set-status="battleStore.setAttackerStatus"
							:on-set-boost="battleStore.setAttackerBoost" :on-set-special="battleStore.setAttackerSpecial"
							:on-set-side="battleStore.setAttackerSide" />
						<MatchupColumn :label="slotDisplayName(theirPokemon) || 'Opponent'" side-label="Opponent"
							:pokemon="theirPokemon"
							:moves="theirMovesPadded" :status="battleStore.defenderStatus" :boosts="battleStore.defenderBoosts"
							:special-value="defenderSpecial" :side-effects="battleStore.defenderSide"
							:is-move-selected="(id) => battleStore.selectedMove === id && battleStore.moveFromOpponent"
							:on-set-move="(id) => battleStore.setMove(id, true)" :on-set-status="battleStore.setDefenderStatus"
							:on-set-boost="battleStore.setDefenderBoost" :on-set-special="battleStore.setDefenderSpecial"
							:on-set-side="battleStore.setDefenderSide" />
					</div>
				</div>
				<div v-else class="v-battle--matchup_placeholder well">
					<p>Select a Pokemon from each side to run damage calculations.</p>
				</div>
			</main>

			<aside class="v-battle--sidebar v-battle--sidebar-their_party well">
				<div class="v-battle--sidebar--header">
					<h2>Opponent</h2>
					<router-link to="/opponent" class="l-edit_link">Edit</router-link>
				</div>
				<div class="v-battle--party_buttons">
					<button v-for="{ index, slot } in theirPartySlots" :key="index" class="l-party_button  btn"
						:class="{ selected: battleStore.selectedTheirIndex === index }"
						@click="battleStore.setTheirPokemon(index)">
						{{ slotDisplayName(slot) }} <small class="l-party_button--level">Lv.{{ slot.level || '-' }}</small>
					</button>
				</div>
			</aside>
		</div>
	</div>
</template>

<style scoped>
.v-battle {
	max-width: 1400px;
}
.v-battle--main {
	display: grid;
	grid-template-columns: minmax(min-content, 1fr) minmax(400px, 4fr) minmax(min-content, 1fr);
	gap: 1.5rem;
	align-items: start;
}
.v-battle--sidebar {
	padding: 1rem 1.25rem;
	position: sticky;
	top: 1rem;
}
.v-battle--sidebar--header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}
.v-battle--sidebar--header h2 {
	margin: 0;
	font-size: 1rem;
}
.v-battle--matchup {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.v-battle--matchup_content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.l-result_summary {
	padding: 1.25rem 1.5rem;
	display: flex;
	gap: 1.5rem;
	align-items: stretch;
	min-height: 120px;
}
.l-result_summary--main {
	flex: 1;
	min-width: 0;
}
.l-damage_chart {
	flex-shrink: 0;
	width: 140px;
	border-left: 1px solid #e9ecef;
	padding-left: 1rem;
}
.l-damage_chart--title {
	font-size: 0.7rem;
	color: #999;
	margin-bottom: 0.4rem;
}
.l-damage_chart--bars {
	display: flex;
	align-items: flex-end;
	gap: 1px;
	height: 36px;
}
.l-damage_chart--bar {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	min-width: 2px;
	cursor: default;
}
.l-damage_chart--bar_fill {
	width: 100%;
	min-height: 1px;
	background: #d0d8e8;
	border-radius: 1px 1px 0 0;
	transition: background 0.15s;
}
.l-damage_chart--bar:hover .l-damage_chart--bar_fill,
.l-damage_chart--bar.l-damage_chart--bar-hover .l-damage_chart--bar_fill {
	background: #0d6efd;
}
.l-damage_chart--caption {
	font-size: 0.7rem;
	color: #666;
	margin-top: 0.25rem;
}
.l-ko_chance-hero {
	font-size: 1.35rem;
	font-weight: 600;
	line-height: 1.3;
}
.l-ko_chance-none {
	color: #666;
	font-weight: 500;
}
.l-result_summary--prompt {
	color: #888;
	font-size: 0.9rem;
}
.v-battle--matchup_placeholder {
	padding: 3rem 2rem;
	text-align: center;
	color: #666;
}
.l-edit_link {
	font-size: 0.9rem;
	color: #0d6efd;
	text-decoration: none;
}
.l-edit_link:hover {
	text-decoration: underline;
}
.v-battle--party_buttons {
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	gap: 0.5rem;
}
.l-party_button {
	min-width: 8rem;
}
.l-party_button--level {
	display: block;
	font-size: 0.8em;
	color: var(--house--color-muted);
}
.v-battle--matchup_panel {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1.5rem;
	align-items: start;
}
.l-result_summary .l-result_summary--placeholder {
	color: #888;
	font-size: 0.9rem;
}
.l-crit_checkbox {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 0.75rem;
	font-size: 0.9rem;
	color: var(--house--color-muted);
	cursor: pointer;
}
.l-crit_checkbox input {
	cursor: pointer;
}
</style>
