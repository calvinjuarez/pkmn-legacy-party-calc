# Pokemon Yellow Legacy Damage Calculator

A damage calculator for the [Yellow Legacy](https://github.com/pret/yellow-legacy) ROM hack. Build your party, select an opponent (gym leader, Elite Four, or Champion), and run damage calculations.

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

## Architecture

- **Party Builder** (`/party`): Edit your team of 6 Pokemon (species, level, DVs, Stat Exp, moves). Persists to localStorage.
- **Opponents** (`/opponents`): Browse gym leaders, Elite Four, Champion (Rival), and other trainers. Select one to load their team.
- **Battle Calculator** (`/battle`): Pick your Pokemon, the opponent's Pokemon, choose a move, and see damage results.

Key architecture decisions are documented in [docs/adr/](docs/adr/).
