/** @type {import('vite').UserConfig} */
import vue from '@vitejs/plugin-vue'

export default {
	plugins: [vue()],
	server: {
		port: 7566,
		watch: {
			usePolling: true,
		},
	},
}
