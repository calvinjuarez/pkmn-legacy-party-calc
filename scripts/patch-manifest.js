/**
 * Patches manifest.webmanifest with absolute base path for GitHub Pages.
 * Run after vite build. Uses VITE_BASE_PATH when set.
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const manifestPath = join(distDir, 'manifest.webmanifest')

const base = process.env.VITE_BASE_PATH ?? '/'
const baseClean = base.endsWith('/') ? base : base + '/'

// Patch manifest
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
manifest.start_url = baseClean
manifest.icons = manifest.icons.map((icon) => ({
	...icon,
	src: baseClean + icon.src.replace(/^\.\//, ''),
}))
writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t'))
