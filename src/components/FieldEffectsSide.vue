<script setup>
defineProps({
	label: { type: String, required: true },
	sideEffects: { type: Object, default: () => ({}) },
	onSetSide: { type: Function, default: () => { } },
})
</script>

<template>
	<div class="c-field_effects_side">
		<div class="c-field_effects_side--label">{{ label }}</div>
		<div class="c-field_effects_side--checkboxes">
			<label class="l-checkbox_label">
				<input
					type="checkbox"
					:checked="sideEffects.isReflect"
					@change="onSetSide({ isReflect: $event.target.checked })" />
				Has Reflect
			</label>
			<label class="l-checkbox_label">
				<input
					type="checkbox"
					:checked="sideEffects.isLightScreen"
					@change="onSetSide({ isLightScreen: $event.target.checked })" />
				Has Light Screen
			</label>
			<label class="l-checkbox_label">
				<input
					type="checkbox"
					:checked="sideEffects.isSeeded"
					@change="onSetSide({ isSeeded: $event.target.checked })" />
				Is Leech Seeded
			</label>
		</div>
	</div>
</template>

<style scoped>
.c-field_effects_side {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
.c-field_effects_side--label {
	font-size: 0.85rem;
	font-weight: 600;
	color: var(--house--color--ink-muted);
}
.c-field_effects_side--checkboxes {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem 1rem;
}
.l-checkbox_label {
	display: flex;
	align-items: center;
	gap: 0.35rem;
	font-size: 0.9rem;
	cursor: pointer;
}
</style>
