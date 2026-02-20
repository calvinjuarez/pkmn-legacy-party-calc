import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	plugins: [vue()],
	test: {
		include: ['src/**/*.test.js', 'patches/**/*.test.js'],
	},
	server: {
		port: 7566,
		watch: {
			usePolling: true,
		},
	},
})
