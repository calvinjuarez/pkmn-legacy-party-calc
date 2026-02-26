<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
	<div class="app">
		<nav class="nav">
			<RouterLink to="/party">Party</RouterLink>
			<RouterLink to="/opponent">Opponent</RouterLink>
			<RouterLink to="/battle">Battle</RouterLink>
			<RouterLink to="/settings">Settings</RouterLink>
		</nav>
		<main class="main">
			<RouterView />
		</main>
	</div>
</template>

<style scoped>
.app {
	min-height: 100vh;
}
.nav {
	display: flex;
	gap: 1rem;
	padding: 1rem 2rem;
	border-bottom: 1px solid var(--house--border_color-interactive);
}
.nav a {
	color: var(--house--color-ink);
	text-decoration: none;
	font-weight: 500;
}
.nav a.router-link-active {
	color: var(--house--color-primary);
}
.main {
	padding: 2rem;
}
</style>
