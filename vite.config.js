import { copyFileSync } from 'fs'
import { join } from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode ?? 'development', process.cwd(), 'VITE_')
	const base = env.VITE_BASE_PATH ?? '/'

	return {
		base,
		plugins: [
			vue(),
			{
				name: 'github-pages-404',
				closeBundle() {
					const outDir = join(process.cwd(), 'dist')
					copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
				},
			},
		],
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
