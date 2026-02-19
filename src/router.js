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
		meta: { title: 'Party Builder' },
	},
	{
		path: '/opponents',
		name: 'opponents',
		component: () => import('./views/OpponentView.vue'),
		meta: { title: 'Opponents' },
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
	history: createWebHistory(),
	routes,
})

router.afterEach((to) => {
	document.title = to.meta?.title ? `${to.meta.title} | Pokemon Calculator` : 'Pokemon Calculator'
})

export default router
