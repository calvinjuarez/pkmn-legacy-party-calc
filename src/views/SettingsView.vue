<script setup>
import { useSettingsStore } from '../stores/settings';

const settings = useSettingsStore()
</script>

<template>
	<div class="v-settings">
		<h1>Settings</h1>
		<div class="form_group">
			<button type="button" class="btn btn-danger" @click="settings.clearStorageExceptParty()">
				Clear storage (keep party)
			</button>
			<p class="form_help">Removes opponent party, battle selection, and settings. Your party is preserved. Page will
				reload.</p>
		</div>
		<div class="form_group form_group-radio">
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
	</div>
</template>

<style scoped>
.v-settings {
	max-width: 600px;
}
</style>
