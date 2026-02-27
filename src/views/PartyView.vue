<script setup>
import { RouterLink } from 'vue-router'
import { useBattleStore } from '../stores/battle'
import { usePartyStore } from '../stores/party'
import PartyBuilder from '../components/PartyBuilder.vue'

const partyStore = usePartyStore()
const battleStore = useBattleStore()

function resetParty() {
	partyStore.clearAll()
	battleStore.resetMySelection()
}
</script>

<template>
	<div class="v-party">
		<h1>My Party Builder</h1>
		<p class="lead">Build your team of 6 Pokemon. Data is saved automatically.</p>

		<PartyBuilder
			:party="partyStore.party"
			:get-slot="(i) => partyStore.getSlot(i)"
			:set-slot="(i, data) => partyStore.setSlot(i, data)"
			:clear-slot="(i) => partyStore.clearSlot(i)"
			editor-title="Edit Slot"
			:show-nickname="true"
		/>

		<div class="v-party--footer">
			<button type="button" class="btn btn-danger" @click="resetParty">Reset</button>
			<RouterLink to="/foe" class="btn btn-primary">Next</RouterLink>
		</div>
	</div>
</template>

<style scoped>
.v-party {
	max-width: var(--house--page--max_width);
}
.v-party--footer {
	display: flex;
	gap: 0.5rem;
	margin-top: 1.5rem;
}
</style>
