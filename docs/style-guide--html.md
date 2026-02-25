# HTML Style Guide

Conventions for markup in this project. See [AGENTS.md](../AGENTS.md) for rules that reference this guide.

## Class attribute grouping

Group classes in the `class` attribute by family. Use double space (or newline, if the list is long) to separate groups. Order groups from local/specific to generic.

```html
<button class="party-button party-button-empty  btn btn-main  ml-2 text-center">
```

Here: `party-button*` (component-specific) → `btn*` (shared component) → utilities.
