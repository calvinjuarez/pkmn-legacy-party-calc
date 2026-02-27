<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PartyBuilder from '../components/PartyBuilder.vue'
import { getPokemon, getTrainerCategories, getTrainerDisplayName } from '../services/gamedata'
import {
	BADGE_VARIANTS,
	DEV_BOSSES,
	E4_ORDER,
	EEVEELUTIONS,
	GYM_ORDER,
	JESSIE_JAMES_VARIANT_IDS,
} from '../services/gamedata.const.js'
import { useBattleStore } from '../stores/battle'
import { useOpponentPartyStore } from '../stores/opponentParty'

const router = useRouter()
const battleStore = useBattleStore()
const opponentPartyStore = useOpponentPartyStore()
const showTrainerPicker = ref(false)
const categories = getTrainerCategories()

function sortByOrder(trainers, order) {
	return [...trainers].sort((a, b) => {
		const ai = order.indexOf(a.class)
		const bi = order.indexOf(b.class)
		if (ai !== bi) return ai - bi
		return a.variantId - b.variantId
	})
}

function detectEeveelution(party) {
	const mon = party?.find(p => EEVEELUTIONS.has(p.species))
	if (!mon) return null
	return getPokemon(mon.species)?.displayName ?? mon.species
}

// Giovanni variant 2 = Viridian Gym fight; variants 0-1 are Rocket boss
const gymLeaders = computed(() => {
	const all = categories.gymLeaders ?? []
	return sortByOrder(
		all.filter(t => !t.isRematch && !(t.class === 'Giovanni' && t.variantId !== 2)),
		GYM_ORDER,
	)
})

const eliteFour = computed(() => {
	const all = categories.eliteFour ?? []
	return sortByOrder(all.filter(t => !t.isRematch), E4_ORDER)
})

const champion = computed(() =>
	(categories.champion ?? []).filter(t => !t.isRematch)
)

const rematches = computed(() => {
	const gym = sortByOrder(
		(categories.gymLeaders ?? []).filter(t => t.isRematch),
		GYM_ORDER,
	)
	const e4 = sortByOrder(
		(categories.eliteFour ?? []).filter(t => t.isRematch),
		E4_ORDER,
	)
	const champ = (categories.champion ?? []).filter(t => t.isRematch)
	return [...gym, ...e4, ...champ]
})

const rivalFights = computed(() => categories.rival ?? [])

const rocketBosses = computed(() => {
	const giovanniRocket = (categories.gymLeaders ?? []).filter(
		t => t.class === 'Giovanni' && t.variantId !== 2 && !t.isRematch
	)
	const jessieJames = (categories.other ?? []).filter(
		t => t.class === 'Rocket' && JESSIE_JAMES_VARIANT_IDS.has(t.variantId)
	)
	const all = [...giovanniRocket, ...jessieJames]
	all.sort((a, b) => {
		const maxLevel = t => Math.max(...t.party.map(p => p.level))
		return maxLevel(a) - maxLevel(b)
	})
	return all
})

const devBosses = computed(() =>
	(categories.other ?? []).filter(t => DEV_BOSSES.has(t.class))
)

function trainerSubtitle(t) {
	if (DEV_BOSSES.has(t.class)) return ''
	// Rival fights: location on first line, eeveelution below (skip if Eevee)
	if (t.class === 'Rival1' || t.class === 'Rival2') {
		const loc = t.location ?? ''
		const evo = detectEeveelution(t.party)
		const line2 = evo && evo !== 'Eevee' ? evo : ''
		return [loc, line2].filter(Boolean).join('\n')
	}
	// Champion variants: show eeveelution (skip if Eevee)
	if (t.class === 'Rival3' && !t.isRematch) {
		const evo = detectEeveelution(t.party)
		return evo && evo !== 'Eevee' ? evo : ''
	}
	// Giovanni non-gym, Jessie & James: location from prepared data
	if ((t.class === 'Giovanni' && t.variantId !== 2) || (t.class === 'Rocket' && JESSIE_JAMES_VARIANT_IDS.has(t.variantId))) {
		return t.location ?? ''
	}
	// Erika, Koga, Sabrina: badge-based scaling variants
	if (BADGE_VARIANTS[t.class] && !t.isRematch) {
		return BADGE_VARIANTS[t.class][t.variantId] ?? ''
	}
	// Other gym leaders with multiple non-rematch variants
	return t.location ?? ''
}

function displayName(t) {
	if (t.class === 'Rocket' && JESSIE_JAMES_VARIANT_IDS.has(t.variantId)) return 'Jessie & James'
	return getTrainerDisplayName(t)
}

function selectTrainer(trainer) {
	opponentPartyStore.loadFromTrainer(trainer)
	battleStore.resetOpponentSelection()
	router.push('/battle')
}

function partySummary(party) {
	return (party ?? []).map(p => `${getPokemon(p.species)?.displayName ?? p.species}\u00A0${p.level}`).join('\n')
}

function resetFoeParty() {
	opponentPartyStore.clearAll()
	battleStore.resetOpponentSelection()
}
</script>

<template>
	<div class="v-opponent">
		<div class="v-opponent--page_header">
			<h1>Foe's Party Builder</h1>
			<div class="v-opponent--header_actions">
				<a
					v-if="!showTrainerPicker"
					href="#"
					class="v-opponent--mode_link"
					@click.prevent="showTrainerPicker = true">Load Trainer</a>
				<a
					v-else
					href="#"
					class="v-opponent--mode_link"
					@click.prevent="showTrainerPicker = false">Set Manually</a>
			</div>
		</div>

		<div v-if="!showTrainerPicker" class="v-opponent--edit_mode">
			<p class="lead">Edit the opponent's party. Use "Load Trainer" to populate from boss data.</p>
			<PartyBuilder
				:party="opponentPartyStore.party"
				:get-slot="(i) => opponentPartyStore.getSlot(i)"
				:set-slot="(i, data) => opponentPartyStore.setSlot(i, data)"
				:clear-slot="(i) => opponentPartyStore.clearSlot(i)"
				editor-title="Edit Slot" />
		</div>

		<div v-else class="v-opponent--trainer_mode">
			<p class="lead">Choose a trainer to load their party into the opponent slots.</p>

			<section class="v-opponent--super_section">
				<h2>League Battles</h2>

				<div v-if="gymLeaders.length" class="v-opponent--category">
					<h3>Gym Leaders</h3>
					<div class="v-opponent--trainers">
						<button
							v-for="t in gymLeaders"
							:key="t.class + t.variantId"
							class="v-opponent--trainer card"
							@click="selectTrainer(t)">
							<div class="v-opponent--trainer--header">
								<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
								<div class="v-opponent--trainer--variant" v-if="trainerSubtitle(t)">{{ trainerSubtitle(t) }}
								</div>
							</div>
							<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
						</button>
					</div>
				</div>

				<div v-if="eliteFour.length" class="v-opponent--category">
					<h3>Elite Four</h3>
					<div class="v-opponent--trainers">
						<button
							v-for="t in eliteFour"
							:key="t.class + t.variantId"
							class="v-opponent--trainer card"
							@click="selectTrainer(t)">
							<div class="v-opponent--trainer--header">
								<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
								<div class="v-opponent--trainer--variant" v-if="trainerSubtitle(t)">{{ trainerSubtitle(t) }}
								</div>
							</div>
							<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
						</button>
					</div>
				</div>

				<div v-if="champion.length" class="v-opponent--category">
					<h3>Champion</h3>
					<p class="v-opponent--category--description">Pick the team variant based on rival's starter.</p>
					<div class="v-opponent--trainers">
						<button
							v-for="t in champion"
							:key="t.class + t.variantId"
							class="v-opponent--trainer card"
							@click="selectTrainer(t)">
							<div class="v-opponent--trainer--header">
								<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
								<div class="v-opponent--trainer--variant" v-if="trainerSubtitle(t)">{{ trainerSubtitle(t) }}
								</div>
							</div>
							<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
						</button>
					</div>
				</div>
			</section>

			<section v-if="rematches.length" class="v-opponent--super_section">
				<h2>Rematches</h2>
				<div class="v-opponent--trainers">
					<button
						v-for="t in rematches"
						:key="t.class + t.variantId"
						class="v-opponent--trainer card"
						@click="selectTrainer(t)">
						<div class="v-opponent--trainer--header">
							<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
							<div class="v-opponent--trainer--variant" v-if="trainerSubtitle(t)">{{ trainerSubtitle(t) }}</div>
						</div>
						<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
					</button>
				</div>
			</section>

			<section class="v-opponent--super_section">
				<h2>Other Bosses</h2>

				<div v-if="rivalFights.length" class="v-opponent--category">
					<h3>Rival</h3>
					<div class="v-opponent--trainers">
						<button
							v-for="t in rivalFights"
							:key="t.class + t.variantId"
							class="v-opponent--trainer card"
							@click="selectTrainer(t)">
							<div class="v-opponent--trainer--header">
								<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
								<div class="v-opponent--trainer--variant" v-if="trainerSubtitle(t)">{{ trainerSubtitle(t) }}
								</div>
							</div>
							<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
						</button>
					</div>
				</div>

				<div v-if="rocketBosses.length" class="v-opponent--category">
					<h3>Rocket</h3>
					<div class="v-opponent--trainers">
						<button
							v-for="t in rocketBosses"
							:key="t.class + t.variantId"
							class="v-opponent--trainer card"
							@click="selectTrainer(t)">
							<div class="v-opponent--trainer--header">
								<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
								<div class="v-opponent--trainer--variant" v-if="trainerSubtitle(t)">{{ trainerSubtitle(t) }}
								</div>
							</div>
							<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
						</button>
					</div>
				</div>

				<div v-if="devBosses.length" class="v-opponent--category">
					<h3>Developer</h3>
					<div class="v-opponent--trainers">
						<button
							v-for="t in devBosses"
							:key="t.class + t.variantId"
							class="v-opponent--trainer card"
							@click="selectTrainer(t)">
							<div class="v-opponent--trainer--header">
								<div class="v-opponent--trainer--name">{{ displayName(t) }}</div>
							</div>
							<div class="v-opponent--trainer--party">{{ partySummary(t.party) }}</div>
						</button>
					</div>
				</div>
			</section>
		</div>

		<div class="v-opponent--footer">
			<button type="button" class="btn btn-danger" @click="resetFoeParty">Reset</button>
			<RouterLink to="/battle" class="btn btn-primary">Next</RouterLink>
		</div>
	</div>
</template>

<style scoped>
.v-opponent--footer {
	display: flex;
	gap: 0.5rem;
	margin-top: 1.5rem;
}
.v-opponent--page_header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
}
.v-opponent--header_actions {
	display: flex;
	align-items: center;
	gap: 1rem;
}
.v-opponent--page_header h1 {
	margin: 0;
}
.v-opponent--mode_link {
	font-size: 0.9rem;
	color: var(--house--color-primary);
	text-decoration: none;
}
.v-opponent--mode_link:hover {
	text-decoration: underline;
}
.v-opponent {
	max-width: var(--house--page--max_width);
}
.v-opponent--super_section {
	margin-bottom: 2.5rem;
}
.v-opponent--super_section h2 {
	margin-bottom: 0.75rem;
}
.v-opponent--category {
	margin-bottom: 1.5rem;
}
.v-opponent--category h3 {
	margin-bottom: 0.5rem;
}
.v-opponent--category--description {
	color: var(--house--color-ink_muted);
	font-size: 0.9rem;
	margin-bottom: 0.75rem;
}
.v-opponent--trainers {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 1rem;
}
.v-opponent--trainer {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	padding: 1rem;
	border: 2px solid var(--house--border_color-interactive);
	cursor: pointer;
	text-align: left;
}
.v-opponent--trainer:hover {
	border-color: var(--house--color-primary);
	background: var(--house--color-primary_faint);
}
.v-opponent--trainer--header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 0.5rem;
}
.v-opponent--trainer--name {
	font-weight: 600;
	font-size: 1.1rem;
	min-width: 0;
}
.v-opponent--trainer--variant {
	font-size: 0.85rem;
	color: var(--house--color-ink_muted);
	flex-shrink: 0;
	text-align: right;
	white-space: pre-line;
	line-height: 1.15;
}
.v-opponent--trainer--party {
	font-size: 0.8rem;
	color: var(--house--color-ink_hint);
	margin-top: 0.5rem;
	line-height: 1.3;
	white-space: pre-line;
}
</style>
