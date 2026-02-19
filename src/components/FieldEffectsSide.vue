<script setup>
defineProps({
	label: { type: String, required: true },
	sideEffects: { type: Object, default: () => ({}) },
	onSetSide: { type: Function, default: () => {} },
})
</script>

<template>
	<div class="field-effects-side">
		<div class="field-effects-label">{{ label }}</div>
		<div class="field-effects-checkboxes">
		<label class="checkbox-label">
			<input
				type="checkbox"
				:checked="sideEffects.isReflect"
				@change="onSetSide({ isReflect: $event.target.checked })"
			/>
			Has Reflect
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				:checked="sideEffects.isLightScreen"
				@change="onSetSide({ isLightScreen: $event.target.checked })"
			/>
			Has Light Screen
		</label>
		<label class="checkbox-label">
			<input
				type="checkbox"
				:checked="sideEffects.isSeeded"
				@change="onSetSide({ isSeeded: $event.target.checked })"
			/>
			Is Leech Seeded
		</label>
		</div>
	</div>
</template>

<style scoped>
.field-effects-side {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
.field-effects-label {
	font-size: 0.85rem;
	font-weight: 600;
	color: #555;
}
.field-effects-checkboxes {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1rem;
}
.checkbox-label {
	display: flex;
	align-items: center;
	gap: 0.35rem;
	font-size: 0.9rem;
	cursor: pointer;
}
.checkbox-label input {
	cursor: pointer;
}
</style>
