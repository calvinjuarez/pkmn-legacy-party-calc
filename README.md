# pkmn-legacy-party-calc

A party-aware damage calculator for playthroughs of the [Yellow Legacy](https://github.com/cRz-Shadows/Pokemon_Yellow_Legacy) ROM hack. Build your party, select an opponent (gym leader, Elite Four, or Champion), and run damage calculations—without re-entering your team every time.

## Yellow Legacy

This tool is built for [Pokémon Yellow Legacy](https://github.com/cRz-Shadows/Pokemon_Yellow_Legacy), a ROM hack by TheSmithPlays that polishes Pokémon Yellow while staying true to Gen 1. Trainer data is extracted from the hack's source. Currently targets **v1.0.9** (because that's the version I'm playing).

I hope to support more Legacy hacks (Crystal Legacy, Emerald Legacy) as well as multiple versions of each hack in the future. Stay tuned.

## Setup

```bash
nvm use
npm install
```

Ensure the `yellow-legacy-v1.0.9` submodule is initialized:

```bash
git submodule update --init
```

## Data Extraction

Game data is extracted from the Yellow Legacy ASM source. Run after cloning or when the submodule is updated:

```bash
npm run extract-data
```

This generates `src/data/*.json` from the ROM hack's assembly files.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The app deploys to GitHub Pages on push to `main`. Live at [https://calvinjuarez.github.io/pkmn-legacy-party-calc/](https://calvinjuarez.github.io/pkmn-legacy-party-calc/).

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**

## Architecture

- **My Party Builder** (`/party`): Edit your team of 6 Pokemon (species, level, DVs, Stat Exp, moves). Persists to localStorage.
- **Foe's Party Builder** (`/foe`): Browse gym leaders, Elite Four, Champion (Rival), and other trainers. Select one to load their team.
- **Battle Calculator** (`/battle`): Pick your Pokemon, the foe's Pokemon, choose a move, and see damage results.

Key architecture decisions are documented in [docs/adr/](docs/adr/).
