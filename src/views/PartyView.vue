<script setup>
import { usePartyStore } from '../stores/party'
import PartyBuilder from '../components/PartyBuilder.vue'

const partyStore = usePartyStore()
</script>

<template>
	<div class="party-view">
		<h1>Party Builder</h1>
		<p class="lead">Build your team of 6 Pokemon. Data is saved automatically.</p>

		<PartyBuilder
			:party="partyStore.party"
			:get-slot="(i) => partyStore.getSlot(i)"
			:set-slot="(i, data) => partyStore.setSlot(i, data)"
			editor-title="Edit Slot"
			:show-nickname="true"
		/>
	</div>
</template>

<style scoped>
.party-view {
	max-width: 900px;
}
.lead {
	color: #666;
	margin-bottom: 1.5rem;
}
</style>
