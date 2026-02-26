# Design System – Tokens

Token reference for the design system. See [style-guide--css.md](style-guide--css.md) for naming conventions and implementation details.

## De-facto tokens

Use `white` and `black` directly. No custom property needed.

## Definitions (100–600 scale)

### Grays

| Token                         | Value  |
| ---                           | ---
| `--house--gray-100`          | `#f2f2f2`
| `--house--gray-200`          | `#e0e0e0`
| `--house--gray-300`          | `#c9c9c9`
| `--house--gray-400`          | `#999`
| `--house--gray-500`          | `#666`
| `--house--gray-600`          | `#333`

### Blues

| Token                         | Value  |
| ---                           | ---
| `--house--blue-100`          | `#f0f7ff`
| `--house--blue-200`          | `#c7dcff`
| `--house--blue-300`          | `#93c5fd`
| `--house--blue-400`          | `#60a5fa`
| `--house--blue-500`          | `#0d6efd`
| `--house--blue-600`          | `#0a5dd9`

### Reds

| Token                         | Value  |
| ---                           | ---
| `--house--red-100`           | `#fef2f2`
| `--house--red-200`           | `#fecaca`
| `--house--red-300`           | `#fca5a5`
| `--house--red-400`           | `#f87171`
| `--house--red-500`           | `#dc3545`
| `--house--red-600`           | `#b91c1c`

## Semantic families (4 faintness levels + dark)

Each family has: base, dark, muted, hint, faint.

| Family   | Base    | Dark    | Muted   | Hint    | Faint   |
| ---      | ---     | ---     | ---     | ---     | ---     |
| Ink      | `gray-600` | `black` | `gray-500` | `gray-400` | `gray-100` |
| Primary  | `blue-500` | `blue-600` | `blue-400` | `blue-200` | `blue-100` |
| Danger   | `red-500`  | `red-600`  | `red-400`  | `red-200`  | `red-100`  |

Token pattern: `--house--color-{family}`, `--house--color-{family}_dark`, `--house--color-{family}_muted`, `--house--color-{family}_hint`, `--house--color-{family}_faint`.

## Applications

### Borders

| Token                               | References | Use
| ---                                 | ---        | ---
| `--house--border_color`            | `gray-100` | Subtle borders (cards, dividers, move slots)
| `--house--border_color-interactive` | `gray-200` | Default interactive borders, form control borders
| `--house--border_color-interactive_hover` | `gray-400` | Hover-state borders

### Border radius

| Token                         | Value  | Use
| ---                           | ---    | ---
| `--house--border_radius-lg`  | `8px`  | Cards, wells
| `--house--border_radius-md`   | `6px`  | Buttons, move slots
| `--house--border_radius-sm`  | `4px`  | Form controls, mode buttons

### Inputs

| Token                               | References | Use
| ---                                 | ---        | ---
| `--house--input--padding_x`        | `0.5rem`   | Horizontal padding
| `--house--input--padding_y`        | `0.25rem`  | Vertical padding
| `--house--input--padding`          | composite  | Shorthand: `padding_y padding_x`
| `--house--input--border_radius`    | `border_radius-sm` | Form control corners
| `--house--input--border_color`     | `border_color-interactive` | Default form border
| `--house--input-focus--border_color` | `color-primary_muted` | Focus ring / outline
