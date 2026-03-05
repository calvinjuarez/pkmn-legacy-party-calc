# ADR-016: Service Worker for Offline Support

## Status

Accepted

## See also

- [ADR-003](003-localstorage-for-party-persistence.md) – Party and battle state persist in localStorage; the service worker complements this by ensuring the app shell loads offline.

## Context

The app has no external API calls and uses localStorage for persistence (ADR-003), so it is well-suited for offline use. The gap was that without a service worker, the browser cannot load the app when offline: the initial HTML request fails, lazy-loaded route chunks are not cached, and direct navigation to deep links fails. Users who had previously visited the app would see a "no connection" page instead of the calculator.

## Decision

Add a service worker that precaches all build artifacts. Use vite-plugin-pwa with Workbox's generateSW strategy. The service worker:

- Precaches the app shell (HTML, JS, CSS, manifest, icons) at install time
- Serves cached content when the network is unavailable
- Uses a navigation fallback so SPA routes load correctly when offline (e.g. refresh on `/battle` serves the app shell)

We keep the existing PWA manifest; the plugin handles service worker registration and precache generation.

## Consequences

**Pros:**
- Full offline capability: the app loads and runs without network
- No backend required
- Updates apply automatically on next visit (configurable)
- Works with GitHub Pages and subpath deployment

**Cons:**
- Service worker adds complexity to the build
- Users must visit once while online before offline works
- Cache invalidation is handled by the plugin; custom logic would require injectManifest strategy
