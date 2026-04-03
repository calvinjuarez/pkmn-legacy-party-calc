# Enhancement: Source PNG Sprites + On-the-Fly Colorization

## Status

Proposed

## Summary

Use Yellow Legacy’s **grayscale source PNGs** (four luminance levels) in the web app together with **ROM-aligned palette data** extracted from ASM. At display time, map each pixel’s gray step to a **palette index**, then to **RGB** from the species’ palette class—no generic CSS “filters” on the PNG. Optionally copy normalized assets into **`public/sprites/`** for deploy without the Yellow Legacy submodule, with **`ATTRIBUTION.md`** beside them.

## Motivation

The party/battle UI is text-only today. Showing species art improves scanability and ties the calculator to the hack players actually run. Pre-colored PNG libraries (e.g. retail rips) do not match Yellow Legacy’s grayscale sources or palette tables. Building from **submodule + extract pipeline** keeps the app aligned with [ADR-002](../adr/002-extract-data-at-build-time.md) (build-time JSON from ASM) and the **parse / transform** split described in [ADR-006](../adr/006-extract-prepare-display-pipeline.md): mechanical extraction first, then transforms (palette expansion, joins), not ad hoc duplication in Vue.

## Scope

| Target                                | Role in this enhancement
| ---                                   | ---
| **Yellow Legacy** (current submodule) | Primary: grayscale fronts (and optionally backs/icons), palettes from `data/sgb/sgb_palettes.asm` and `data/pokemon/palettes.asm`, dex-scoped joins.
| **Crystal Legacy** (future)           | Possibly the same **idea** (pret-style PNG sources + palette tables); paths and palette layout would differ—revisit when that hack is a first-class target.
| **Emerald Legacy** (future)           | Gen III sources are typically **already full-color**; the “indexed grayscale + per-line GBC palette” pipeline is **not required** for faithful display.

## Facts from the Yellow Legacy tree

- **Front / back PNGs:** `yellow-legacy-v1.0.9/gfx/pokemon/front/`, `.../back/` — battle sprites as grayscale sources for the ROM build.
- **Party icons:** `yellow-legacy-v1.0.9/gfx/icons/` — filenames **do not always match** battle pic stems (e.g. `mr_mime.png` vs `mrmime` for fronts).
- **Grayscale (sampled):** decoded pixels use **only** four values **`0`, `85`, `170`, `255`** (even thirds of 0–255). Extraction or runtime can **assert** this; assets that break it need a quantization step.
- **Palettes in ROM:** `MonsterPalettes` in [`data/pokemon/palettes.asm`](../../yellow-legacy-v1.0.9/data/pokemon/palettes.asm) — one byte per slot in **national dex order** (after MissingNo); join to app data via **`dexId`** on each species in `src/data/pokemon.json`. **Eleven** distinct `PAL_*` values appear across those entries (including `PAL_CINNABAR` for Porygon). Full RGB555 rows live in [`data/sgb/sgb_palettes.asm`](../../yellow-legacy-v1.0.9/data/sgb/sgb_palettes.asm) as **`SuperPalettes`** (SGB) and **`GBCBasePalettes`** (CGB); four colors per row (`NUM_PAL_COLORS` in `constants/palette_constants.asm`).
- **Extract entrypoint today:** [`scripts/extract-data.js`](../../scripts/extract-data.js) — pokemon/moves/learnsets/types parsers and trainer decoration; **no** palette or sprite asset pipeline yet.

## Data model (extraction)

- **`paletteId → color list`** (checked-in JSON): each entry is **four** colors. Store **canonical ROM form** per channel: **0–31** (RGB555), optionally add a **transform** that emits **8-bit sRGB** triplets using one documented rule (e.g. bit-replication `(c << 3) | (c >> 2)` per channel, or `round(c * 255 / 31)`). Parse **all** `SuperPalettes` / `GBCBasePalettes` rows if the extractor is a generic ASM→JSON transliterator—not only “monster” rows.
- **Per-species `paletteId`:** join from `MonsterPalettes` using **`dexId`**. Do **not** check in a second **flat** `speciesId → [4 colors]` map; a tiny runtime join (or memoized getter) is enough.
- **Pokemon `spriteStem` (or equivalent):** canonical basename aligned with `data/pokemon/base_stats/<stem>.asm` — used to build URLs after deploy (see below).

**Open choice:** treat **GBC** or **SGB** table as default for web preview, or ship both and switch in the UI.

## Extraction architecture

- **Separate parser module** for palette ASM (e.g. `scripts/parsers/palettes.js`) — do not fold into `pokemon.js`.
- **Transforms** (same pipeline family as trainer “decoration” in spirit, but numeric / join): RGB555→8-bit on palette blobs; merge **`paletteId`** onto each pokemon record after parse.
- Trainer-style **semantic** enrichments stay separate; **transform** here means derived fields and joins, per [ADR-006](../adr/006-extract-prepare-display-pipeline.md).

## Deploy: `public/sprites/` + canonical names

- **Copy** required PNGs from the submodule into **`public/sprites/`** so GitHub Pages and CI do **not** require submodule init to serve images. Vite serves [`public/`](../../public/) at the site root (`/sprites/...`).
- **Rename on copy** to a single convention: **`<stem>.<role>.png`** with `role` in `{ front, back, icon }` and **`stem`** equal to the **base_stats** / battle pic stem (e.g. `mrmime.front.png`, `mrmime.icon.png`). Maintain a **small mapping** from upstream icon filenames (`mr_mime.png`, `nidoran_f.png`, …) to those canonical names—the Vue app should not embed Yellow Legacy folder quirks.
- Trigger via `npm run extract-data`, a dedicated `npm run copy-sprites`, or equivalent—pick one workflow and document it.
- **Edge cases:** fail or warn when a mapped source file is missing; re-run when the submodule updates.

## Attribution

- Add **`public/sprites/ATTRIBUTION.md`** next to the shipped PNGs. Credit artists **per** [Yellow Legacy’s README](../../yellow-legacy-v1.0.9/README.md) for the **roles** you actually bundle (backs, overworld, party icons, one-off credits such as Porygon front, etc.). Include a **link** to the upstream README—especially the **Sprite Artists** section—e.g. [Pokemon Yellow Legacy — README (Sprite Artists)](https://github.com/cRz-Shadows/Pokemon_Yellow_Legacy/blob/main/README.md#sprite-artists) (confirm fragment if GitHub’s heading anchor differs). Link the hack and pret lineage as appropriate.
- Optional: short note in app footer or docs pointing to `/sprites/ATTRIBUTION.md` or the same URLs.
- Do **not** ship asset categories whose README credit requirements you are not meeting.

## Colorization model (runtime)

1. Load grayscale PNG (or use cached bitmap).
2. Map each pixel’s value to **index 0–3** (match the four ROM luminance steps; quantize if a future asset has extra values).
3. Resolve **four RGB colors** from `paletteId` → palette table (then use 8-bit RGB in canvas/shader).
4. **Not** “hue-rotate the PNG”—that is not the same as hardware palette indexing.

**Lightest gray (`255`)** is used for both **background** and **highlights** on some sprites. “True” transparency requires a rule such as **edge-connected** flood-fill on `255`, not `if (v === 255) → transparent`. For a **small framed preview** on a light background, **opaque** sprites (white stays white) may be acceptable and simpler.

## Rendering options (open)

| Approach   | Notes
| ---        | ---
| **Canvas** | `ImageData` loop: read gray, map index, write RGBA—easy to debug.
| **SVG**    | `feComponentTransfer` can approximate per-channel LUTs; fiddly if inputs are not cleanly quantized.
| **WebGL**  | Fragment shader with `uniform vec4 u_colors[4]`; preprocess flood-fill on CPU if you need a mask.

Choose later; the enhancement doc only needs the **data** contract above.

## Implementation considerations

- **Join vs memoize:** `getPalette(species)` can do `palettes[pokemon.paletteId]` with optional memoization—no second generated JSON for a flat species→RGB map.
- **Bundle size:** copying hundreds of PNGs increases repo weight; acceptable for a dedicated assets commit.
- **CI:** static hosting should not depend on submodule checkout for **`/sprites/*`** once files are committed under `public/sprites/`.

## Risks and future work

- Submodule updates can change ASM or PNGs—re-run extract and copy; review diffs.
- **Shiny** / alternate forms / **back** sprites only if product scope expands.
- **Crystal Legacy** prerequisites (paths, palette format) when that hack is supported.

## References

- [ADR-002: Extract data at build time](../adr/002-extract-data-at-build-time.md)
- [ADR-006: Extract / prepare / display pipeline](../adr/006-extract-prepare-display-pipeline.md)
- [Markdown style guide](../style-guide--markdown.md)
