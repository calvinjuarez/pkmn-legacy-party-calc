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
| `_`       | Joins words within a segment (e.g. `border_radius`, `top_right`)
| `-`       | Attaches variant to preceding segment (e.g. `input-email`, `border_radius-top_right`)

**Token structure:**

```text
--house--[domain--]{property}[-{variant}]
```

- **Domain** (optional) – Scope for element-specific tokens. Omitted for global/palette tokens.
- **Property** – The thing being defined.
- **Variant** (optional) – Attached with `-` to domain or property.

**Domain-scoped:**

- `--house--input--border_color`
- `--house--input-email--border_color` (domain variant)
- `--house--input-email--border_radius-top_right` (domain variant + property variant)

**Global** (no domain, implicit “any”):

- `--house--color-muted`

### Composition

Tokens can reference other tokens: `--house--input--border_color: var(--house--color-muted);`

### Registry

| Token                         | Value  | Use
| ---                           | ---    | ---
| `--house--color-muted`        | `#555` | Secondary/muted text (labels, stats, form help, descriptions)
| `--house--color-text_placeholder` | `#888` | Placeholder text
| `--house--color-text_primary` | `#333` | Primary text (nav default)
| `--house--color-border`       | `#ddd` | Default borders
| `--house--color-border_hover` | `#999` | Hover-state borders
| `--house--color-border_subtle`| `#e9ecef` | Subtle borders (cards, dividers)
| `--house--color-border_medium`| `#dee2e6` | Medium borders (move slots)
| `--house--color-border_input` | `#ccc` | Form control borders
| `--house--color-bg_subtle`   | `#f8f9fa` | Subtle backgrounds (well)
| `--house--color-primary`      | `#0d6efd` | Primary blue (links, selected)
| `--house--color-primary_bg`  | `#f0f7ff` | Primary tint background
| `--house--color-danger`       | `#dc3545` | Danger/outline
| `--house--color-chart_bar`    | `#d0d8e8` | Chart bar fill (neutral)
| `--house--border_radius-lg`  | `8px`  | Cards, wells
| `--house--border_radius-md`   | `6px`  | Buttons, move slots
| `--house--border_radius-sm`  | `4px`  | Form controls, mode buttons

## Class naming

Component classes use the same delimiter conventions as design tokens.

**Delimiters:**

| Delimiter | Role
| ---       | ---
| `_`       | Word join (word boundary)
| `-`       | Variant/modifier
| `--`      | Child/element

**Mnemonic:** One underscore = word join; one hyphen = modifier; two hyphens = element.

**Scope prefixes:**

| Prefix   | Meaning
| ---      | ---
| `v-`     | View layout — structural containers, tied to a view
| `c-`     | Component layout — structural containers, tied to a component
| `l-`     | Local — presentational, might be promoted to global
| *(none)* | Global — shared across the app

**Example:**

```html
<button class="l-foo_item">
	Label <small class="l-foo_item--sublabel">sublabel</small>
</button>
```

Here: `l-foo_item` is the block; `l-foo_item--sublabel` is the sublabel child; `l-foo_item-active` would be a variant.

## Approach

- **Selector-driven** – Components define styles via semantic selectors (`.foo_label`, `label`, etc.). The selector owns the decision “this element is muted”; the token supplies the value.
- **No utility classes for tokens** – We don’t add `.text-muted` to markup. Composition happens in the CSS, not in `class=""` attributes.
