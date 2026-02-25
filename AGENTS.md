# AI Agent Rules & Guidelines

## Code Style

Use tab indentation.

### CSS

- Native CSS nesting is allowed. Target modern browsers only.
- Use `--house--*` design tokens for shared values.

**Full docs:** [docs/style-guide--css.md](docs/style-guide--css.md)

### HTML

- Group classes in `class=""` by family; double-space between groups.

**Full docs:** [docs/style-guide--html.md](docs/style-guide--html.md)

### Markdown

- Fenced code blocks must specify a language (use `text` for plain text).
- No bold/italic as pseudo-headings; use proper heading levels.

**Full docs:** [docs/style-guide--markdown.md](docs/style-guide--markdown.md)

## Commit Guidelines

- **Small, atomic commits** – Each commit does one logical thing and leaves the app in a working state.
- **Conventional commits** – Use `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` etc. in the subject.
- **Imperative mood** – Subject line: "Add X" not "Added X".
- **Functional** – Every commit should build and run; avoid broken intermediate states.

## Testing

- Tests live next to the code they test (`*.test.js` colocated)
- Run `npm run test` (watch) or `npm run test:run` (single run)

## Documentation

- Write docs for the things we build.
- For key architecture decisions, write ADR docs to `docs/adr`. When writing an ADR doc, read [docs/adr/README.md](docs/adr/README.md).

## Patch-package

When editing patched dependencies (e.g. `node_modules/@smogon/calc`):

1. **Edit the files** – Make your changes in `node_modules`.
2. **Regenerate the patch** – Run `npx patch-package @smogon/calc` (or the relevant package name) to update the patch file.
3. **Restart the dev server** – Vite caches pre-bundled dependencies; restart `npm run dev` (and clear `node_modules/.vite` if needed) so the patched package is used.

`patch-package` diffs the current `node_modules` state against the original package and produces the patch. You can edit on top of an already-patched package; the regenerated patch will include all changes.
