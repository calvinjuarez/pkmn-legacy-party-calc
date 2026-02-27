import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		redirect: '/party',
	},
	{
		path: '/party',
		name: 'party',
		component: () => import('./views/PartyView.vue'),
		meta: { title: 'My Party Builder' },
	},
	{
		path: '/foe',
		name: 'foe',
		component: () => import('./views/OpponentView.vue'),
		meta: { title: "Foe's Party Builder" },
	},
	{
		path: '/battle',
		name: 'battle',
		component: () => import('./views/BattleView.vue'),
		meta: { title: 'Battle Calculator' },
	},
	{
		path: '/settings',
		name: 'settings',
		component: () => import('./views/SettingsView.vue'),
		meta: { title: 'Settings' },
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

router.afterEach((to) => {
	document.title = to.meta?.title ? `${to.meta.title} | Pokémon Legacy Party Calculator` : 'Pokémon Legacy Party Calculator'
})

export default router
