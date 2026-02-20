# AI Agent Rules & Guidelines

Use tab indentation.

Native CSS nesting is allowed. Target modern browsers only.

Write docs for the things we build. For key architecture decisions, write ADR docs to docs/adr.  When writing an ADR doc, read [docs/adr/README.md](docs/adr/README.md).

## Commit Guidelines

- **Small, atomic commits** – Each commit does one logical thing and leaves the app in a working state.
- **Conventional commits** – Use `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` etc. in the subject.
- **Imperative mood** – Subject line: "Add X" not "Added X".
- **Functional** – Every commit should build and run; avoid broken intermediate states.

## Patch-package

When editing patched dependencies (e.g. `node_modules/@smogon/calc`):

1. **Reverse the patch first** – Run `npx patch-package --reverse` so edits are made against the clean, unpatched state.
2. **Edit the clean files** – Make your changes in `node_modules`.
3. **Regenerate the patch** – Run `npx patch-package @smogon/calc` (or the relevant package name) to create the updated patch file.

This ensures patches are always written against the pristine package, not against an already-patched state.
