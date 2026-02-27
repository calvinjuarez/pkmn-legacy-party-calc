/**
 * Patches manifest.webmanifest and index.html with absolute base path for GitHub Pages.
 * Run after vite build. Uses VITE_BASE_PATH when set (e.g. /pkmn-legacy-party-calc/).
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const manifestPath = join(distDir, 'manifest.webmanifest')
const indexPath = join(distDir, 'index.html')

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

// Patch index.html (manifest and icon hrefs)
let indexHtml = readFileSync(indexPath, 'utf8')
indexHtml = indexHtml.replace(/%BASE_PATH%/g, baseClean)
writeFileSync(indexPath, indexHtml)
