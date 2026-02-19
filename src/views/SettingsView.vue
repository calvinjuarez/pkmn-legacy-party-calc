<script setup>
import { useSettingsStore } from '../stores/settings'

const settings = useSettingsStore()
</script>

<template>
	<div class="settings-view">
		<h1>Settings</h1>
		<div class="form-group">
			<label>Default stat input for new slots</label>
			<div class="radio-group">
				<label class="radio-option">
					<input type="radio" value="stats" :checked="settings.statInputMode === 'stats'" @change="settings.setStatInputMode('stats')" />
					Stats (HP, Atk, Def, Spd, Spc) — enter values from your game screen
				</label>
				<label class="radio-option">
					<input type="radio" value="advanced" :checked="settings.statInputMode === 'advanced'" @change="settings.setStatInputMode('advanced')" />
					Advanced (DVs + Stat Exp) — for precise control
				</label>
			</div>
		</div>
	</div>
</template>

<style scoped>
.settings-view {
	max-width: 600px;
}
.form-group {
	margin-bottom: 1rem;
}
.form-group > label {
	display: block;
	font-weight: 600;
	margin-bottom: 0.5rem;
}
.radio-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
.radio-option {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	cursor: pointer;
}
.radio-option input {
	margin-top: 0.25rem;
}
</style>
