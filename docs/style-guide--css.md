# CSS Style Guide

Conventions for styling in this project. See [AGENTS.md](../AGENTS.md) for rules that reference this guide.

## Design tokens

We use CSS custom properties (variables) for shared design values. Define them in `:root` in [src/style.css](../src/style.css).

### Naming

**Prefix:** `--house--` – Namespace for our design system. Easy to find/replace site-wide if it changes.

**Delimiters:**

| Delimiter | Role
| ---       | ---
| `--`      | Separates segments (domain boundaries, hierarchy)
| `_`       | Attaches a variant to the preceding segment
| `-`       | Joins words within a segment (e.g. `border-color`, `top-left`)

**Token structure:**

```text
--house--[domain--]{property}[_{variant}]
```

- **Domain** (optional) – Scope for element-specific tokens. Omitted for global/palette tokens.
- **Property** – The thing being defined.
- **Variant** (optional) – Attached with `_` to domain or property.

**Domain-scoped:**

- `--house--input--border-color`
- `--house--input_email--border-color` (domain variant)
- `--house--input_email--border-radius_top-left` (domain variant + property variant)

**Global** (no domain, implicit “any”):

- `--house--color_muted`

### Composition

Tokens can reference other tokens: `--house--input--border-color: var(--house--color_muted);`

### Registry

| Token                  | Value  | Use
| ---                    | ---    | ---
| `--house--color_muted` | `#555` | Secondary/muted text (labels, stats, subtitles)

## Approach

- **Selector-driven** – Components define styles via semantic selectors (`.stat-chip`, `label`, etc.). The selector owns the decision “this element is muted”; the token supplies the value.
- **No utility classes for tokens** – We don’t add `.text-muted` to markup. Composition happens in the CSS, not in `class=""` attributes.
