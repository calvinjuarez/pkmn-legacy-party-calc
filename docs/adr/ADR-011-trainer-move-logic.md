# ADR-011: Trainer Move Logic Emulates Gen 1 Game

## Context

Trainer Pokemon moves were derived using "last 4 from learnset at level" padded with a fallback move. This produced incorrect results (e.g. Brock's Geodude showed Tackle twice, then Rock Throw, Defense Curl).

## Decision

Emulate the actual Gen 1 game logic:

1. **Start with level1Moves** (wMonHMoves from base stats) — e.g. Geodude has [TACKLE]
2. **Add learnset moves to empty slots** (WriteMonMoves) — for Geodude at 10: DEFENSE_CURL (level 6) goes to first empty slot
3. **Apply special_moves overrides** — e.g. Brock's Geodude gets ROCK_THROW in slot 3

Result for Brock's Geodude L10: Tackle, Defense Curl, Rock Throw, (empty).

## Status

Accepted. Implemented in `scripts/parsers/trainers.js` `getMovesAtLevel()`.
