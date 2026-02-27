<script setup>
import { useRouter } from 'vue-router'
import { useBattleStore } from '../stores/battle'
import { useOpponentPartyStore } from '../stores/opponentParty'
import { usePartyStore } from '../stores/party'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const settings = useSettingsStore()
const partyStore = usePartyStore()
const opponentPartyStore = useOpponentPartyStore()
const battleStore = useBattleStore()

function resetMyParty() {
	partyStore.clearAll()
	battleStore.resetMySelection()
}

function resetFoeParty() {
	opponentPartyStore.clearAll()
	battleStore.resetOpponentSelection()
}

function loadExampleParty() {
	if (partyStore.loadExampleParty) {
		partyStore.loadExampleParty()
		battleStore.resetMySelection()
		router.push('/party')
	}
}
</script>

<template>
	<div class="v-settings">
		<h1>Settings</h1>
		<p class="lead">Configure defaults and reset data.</p>
		<div class="form_group form_group-radio form_group-radio-stacked">
			<label class="form_group--label">Default stat input for new slots</label>
			<label class="form_group-radio--option  form--radio">
				<input type="radio" value="stats" :checked="settings.statInputMode === 'stats'"
					@change="settings.setStatInputMode('stats')" />
				Direct &mdash; enter stats shown in the game
			</label>
			<label class="form_group-radio--option  form--radio">
				<input type="radio" value="advanced" :checked="settings.statInputMode === 'advanced'"
					@change="settings.setStatInputMode('advanced')" />
				Calculated &mdash; enter DVs & Stat XP to calculate stats
			</label>
		</div>
		<div class="form_group v-settings--reset" v-if="partyStore.loadExampleParty">
			<label class="form_group--label">Sample data</label>
			<div class="v-settings--reset_buttons">
				<button type="button" class="btn" @click="loadExampleParty">Load Example Party</button>
			</div>
		</div>
		<div class="form_group v-settings--reset">
			<label class="form_group--label">Reset</label>
			<div class="v-settings--reset_buttons">
				<button type="button" class="btn btn-danger" @click="settings.resetSettings()">Reset Settings</button>
				<button type="button" class="btn btn-danger" @click="resetMyParty">Reset My Party</button>
				<button type="button" class="btn btn-danger" @click="resetFoeParty">Reset Foe's Party</button>
				<button type="button" class="btn btn-danger" @click="settings.clearAllStorage()">Reset Everything</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.v-settings {
	max-width: var(--house--page--max_width);
}
.v-settings--reset_buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}
</style>
