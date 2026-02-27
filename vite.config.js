import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode ?? 'development', process.cwd(), 'VITE_')
	return {
		base: env.VITE_BASE_PATH ?? '/',
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
	}
})
