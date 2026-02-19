<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
	<div class="app">
		<nav class="nav">
			<RouterLink to="/party">Party</RouterLink>
			<RouterLink to="/opponents">Opponents</RouterLink>
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
	border-bottom: 1px solid #ddd;
}
.nav a {
	color: #333;
	text-decoration: none;
	font-weight: 500;
}
.nav a.router-link-active {
	color: #0d6efd;
}
.main {
	padding: 2rem;
}
</style>
