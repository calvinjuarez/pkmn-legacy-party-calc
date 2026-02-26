<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({
	side: { type: String, default: 'left', validator: (v) => ['left', 'right'].includes(v) },
	title: { type: String, required: true },
	modelValue: { type: Boolean, default: false },
	/** When 'external', trigger is not rendered (parent provides it elsewhere) */
	triggerPlacement: { type: String, default: 'inline', validator: (v) => ['inline', 'external'].includes(v) },
})

const emit = defineEmits(['update:modelValue'])

function open() {
	emit('update:modelValue', true)
}

function close() {
	emit('update:modelValue', false)
}

function onKeydown(e) {
	if (e.key === 'Escape') close()
}

onMounted(() => {
	document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
	document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
	<div class="c-tray" :class="[`c-tray--${side}`, { 'c-tray--open': modelValue }]">
		<!-- Wide: inline content -->
		<div class="c-tray--inline">
			<slot />
		</div>

		<!-- Narrow: trigger (hidden when triggerPlacement is external) -->
		<div v-show="triggerPlacement !== 'external'" class="c-tray--trigger_wrapper"
			:class="`c-tray--trigger_wrapper-${side}`">
			<button
				type="button"
				class="c-tray--trigger  btn"
				:aria-expanded="modelValue"
				:aria-label="`Open ${title}`"
				@click="open">
				<slot name="trigger">
					<span v-if="side === 'left'" class="c-tray--trigger_content">
						<span class="c-tray--trigger_arrow" aria-hidden="true">→</span>
						<span class="c-tray--trigger_text">{{ title }}</span>
					</span>
					<span v-else class="c-tray--trigger_content">
						<span class="c-tray--trigger_text">{{ title }}</span>
						<span class="c-tray--trigger_arrow" aria-hidden="true">←</span>
					</span>
				</slot>
			</button>
		</div>

		<!-- Narrow: overlay + panel (when open) -->
		<Teleport to="body">
			<template v-if="modelValue">
				<div
					class="c-tray--overlay"
					role="presentation"
					aria-hidden="true"
					@click="close" />
				<div
					class="c-tray--panel"
					:class="`c-tray--panel-${side}`"
					role="dialog"
					:aria-label="title"
					aria-modal="true">
					<button
						type="button"
						class="c-tray--panel--close  btn"
						aria-label="Close"
						@click="close">
						<span v-if="side === 'left'" aria-hidden="true">←</span>
						<span v-else aria-hidden="true">→</span>
					</button>
					<div class="c-tray--panel--body">
						<slot />
					</div>
				</div>
			</template>
		</Teleport>
	</div>
</template>

<style scoped>
/* Breakpoint: tray mode below 900px viewport */

/* Wide: show inline content, hide trigger */
.c-tray--inline {
	display: contents;
}

.c-tray--trigger_wrapper {
	display: none;
}

@media (max-width: 899.99px) {
	.c-tray--inline {
		display: none;
	}

	.c-tray--trigger_wrapper {
		display: block;
		position: fixed;
		top: max(250px, 25%);
		z-index: 100;
	}

	.c-tray--trigger_wrapper.c-tray--trigger_wrapper-left {
		left: 1rem;
		border-radius: var(--house--border_radius-md);
	}

	.c-tray--trigger_wrapper.c-tray--trigger_wrapper-right {
		right: 1rem;
		left: auto;
		border-radius: var(--house--border_radius-md);
	}

	.c-tray--trigger_wrapper .c-tray--trigger {
		box-sizing: border-box;
		box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
		height: 2.75rem;
		padding: 0.875em;
		font-size: 0.85rem;
		line-height: 0.75em;
		overflow: visible;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 1.375rem;
	}

	.c-tray--trigger_arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.1em;
		height: 1.1em;
		flex-shrink: 0;
	}

	.c-tray--trigger_text {
		display: inline-block;
		max-width: 0;
		overflow: hidden;
		white-space: nowrap;
		vertical-align: bottom;
		transition: max-width 0.25s ease-out;
	}

	.c-tray--trigger:hover,
	.c-tray--trigger:focus-visible {
		.c-tray--trigger_content {
			gap: 0.25em;
		}
		.c-tray--trigger_text {
			max-width: 20rem;
		}
	}
}

.c-tray--trigger {
	text-align: center;
}
.c-tray--trigger_content {
	display: inline-flex;
	align-items: center;
	gap: 0;
	transition: gap 0.25s ease-out;
}
.c-tray--trigger_arrow {
	opacity: 0.8;
	font-size: 1.1em;
}

/* Overlay */
.c-tray--overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	z-index: 1000;
	animation: c-tray--fade-in 0.2s ease-out;
}

/* Panel */
.c-tray--panel {
	position: fixed;
	top: 0;
	bottom: 0;
	width: min(320px, 85vw);
	max-width: 100%;
	background: white;
	box-shadow: 0 0 1rem rgba(0, 0, 0, 0.15);
	z-index: 1001;
	display: flex;
	flex-direction: column;
	animation: c-tray--slide-in-left 0.25s ease-out;
}

.c-tray--panel-right {
	right: 0;
	left: auto;
	animation-name: c-tray--slide-in-right;
}

.c-tray--panel-left {
	left: 0;
	right: auto;
}

.c-tray--panel--close {
	position: absolute;
	top: max(250px, 25%);
	z-index: 1;
	box-sizing: border-box;
	box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
	width: 2.75rem;
	height: 2.75rem;
	padding: 0.875em;
	font-size: 0.85rem;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 1.375rem;
}
.c-tray--panel-left .c-tray--panel--close {
	right: -1.375rem;
}
.c-tray--panel-right .c-tray--panel--close {
	left: -1.375rem;
}

.c-tray--panel--body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: auto;
	padding: 1rem 1.25rem;

	& > * {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}
}

@keyframes c-tray--fade-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes c-tray--slide-in-left {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(0);
	}
}

@keyframes c-tray--slide-in-right {
	from {
		transform: translateX(100%);
	}
	to {
		transform: translateX(0);
	}
}
</style>
