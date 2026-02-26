<script setup>
import { usePartyStore } from '../stores/party'
import PartyBuilder from '../components/PartyBuilder.vue'

const partyStore = usePartyStore()
</script>

<template>
	<div class="v-party">
		<h1>Party Builder</h1>
		<p class="v-party--lead">Build your team of 6 Pokemon. Data is saved automatically.</p>

		<PartyBuilder
			:party="partyStore.party"
			:get-slot="(i) => partyStore.getSlot(i)"
			:set-slot="(i, data) => partyStore.setSlot(i, data)"
			:clear-slot="(i) => partyStore.clearSlot(i)"
			editor-title="Edit Slot"
			:show-nickname="true"
		/>
	</div>
</template>

<style scoped>
.v-party {
	max-width: 900px;
}
.v-party--lead {
	color: #666;
	margin-bottom: 1.5rem;
}
</style>
