# BlitzKit

## Git

- Never commit or push.
- Never stage (`git add`, `git mv`, ...) unless the maintainer asks for it. The one exception is deletions: deleted files may always be staged (`git rm`, `git add` on a removed path).
- Move files with plain `mv`, not `git mv`.

## Migration

The `data-driven` branch is migrating off the old system (Radix Themes, the `Duel` store, `PageWrapper`, ...) onto the new components and stores (`Tankopedia`, `Soapstone` stores, `components/Button`, ...). Leftover references to the old system are expected bugs: when something is undefined or a module is missing, look for its replacement in neighboring migrated code rather than restoring the old one.

Pages that are not migrated yet are named `_index.astro` so Astro skips them. Migrating one renames it to `index.astro`.

## Layout

- Components live flat at `src/components/Name/index.tsx` with `index.module.css` beside it. No flat `Name.tsx` files and no nested `components/Parent/components/Child` folders: a sub-component becomes its own top-level folder prefixed with its feature, e.g. `MixerScene/components/Model.tsx` becomes `components/MixerModel/index.tsx`.
- Pages keep their styles in `_index.module.css` next to `_index.tsx`.

## TypeScript

- No return type annotations. Put `satisfies Type` on the returned expression instead.
- Wrap functions defined inside React components in `useCallback`.
- Never inline a complex type (a union of object shapes, etc.) in a signature; name it as an interface or type.
- In object literals, `...spread` entries come first, each on its own line, followed by a blank line, then the custom entries. A single-line object with a spread becomes multi-line.
- When an object literal's values are long expressions, compute them first into `const`s named after their keys, then build the object with shorthand (`{ name, color, tanks: [] }`). Short values stay inline.
- Always hoist values that take work to compute (a function call, math, a lookup, like `"A".charCodeAt(0)` or `1 - SCROLL_ZONE`) and don't change between iterations or calls out of loops and repeatedly called functions into a `const` above them. No exceptions. Plain literals (strings, numbers, selectors like `"[data-row]"`) cost nothing and stay inline.
- A helper function used in only one place gets inlined there. Only extract a function once it has a second caller.
- Assert data that is known to be present with `!` instead of `?.` or `?? 0`; crashing beats silently showing a plausible wrong value. Keep `?.` only where absence is real logic: `optional` proto fields (check the `.proto`), optional script effect fields, and lookups that can legitimately miss.
- Single-line comments use `//`, never `/** */`. Keep `/** */` for multi-line doc comments.

## JSX

- An icon and its text go on separate lines, never `<Icon /> {label}` on one line. Spacing comes from the parent's flex `gap`, not a literal space:

  ```tsx
  <Icon />
  {label}
  ```

- In menu-like items (ContextMenu, DropdownMenu, Select and similar), the icon goes after the text. `ItemIndicator` stays in the left gutter.
- Don't add `aria-label` (or replacements like `aria-labelledby`) for now.

## CSS

- Constant CSS goes in the CSS module, never in `style={{ }}`. Only runtime values (measured sizes, user settings) go inline; split an element's constant and dynamic styles between the two. Presentational props like `width="1em"` on icons are CSS too.
- Toggle state and variants with data attributes (`data-split={bool}` with `.x[data-split="true"]`), never conditional modifier classes.
- CSS module classes are kebab-case, accessed as `styles["tank-image"]`. PascalCase is only for Radix part names in composed components.
- Containers own the padding and space their children with a flex `gap`. Children like `Header`, `Body` and `Actions` don't carry padding to fake spacing; fix the container instead.
- Select elements by their own class, never by structure or tag (`> *`, `> div`, `:first-child`, bare `svg`, `[data-x] > *`). If an element needs styling, give it a class and nest that class under its parent. The exception is content a component renders internally that has no `className` to pass, like the icon inside an `IconButton` (`.swatch svg`).
- Nest CSS to mirror the markup: a child's rules go inside its parent's block (`.marker { .bar { } }`), so the stylesheet reads like the HTML tree.
- Fully rounded corners use `var(--radius-max)`, never `var(--max-size)`.
- `z-index` stays at `1` unless a real overlap needs more.

## Components

- Dialog-like surfaces (`Dialog`, `AlertDialog`, `Popover`) share their extra parts, which live as their own top-level components: `DialogHeader`, `DialogBody`, `DialogActions` and `DialogField` (a labeled control, taking a `label` prop). Each surface attaches them as `X.Header`, `X.Body`, `X.Actions` and `X.Field`; none defines its own copy. Fix their spacing in the part's own CSS module.
- Other extra non-Radix parts of a composed component are local functions in that component's `index.tsx`, `function Name({ className, ...props }: ComponentProps<"div">)` using `classNames(styles["kebab-class"], className)`, spread in with `{ ...composeRadixComponents(_, styles), Name }`. Once a part is shared by several components, it moves out into its own top-level component instead, like the `Dialog*` parts. A part shared across menus (`Discriminator` in DropdownMenu) is styled through a data attribute, since CSS modules re-hash classes per importing file.

## Strings and naming

- Only edit `packages/i18n/strings/en.json`. Other locales are managed by Crowdin; never touch them, even for key renames.
- Name strings and keys after what the game UI calls things (its English strings), not code or XML names. Tier 11 upgrade progression is "augments" everywhere in BlitzKit; "upgrade" stays only where it names a game file, folder or XML tag, and for the modules panel.
- Characteristic group keys follow the UI title (`nitro`, `combat_stabilization`), and item keys are prefixed with their group key (`steady_aim_system_duration`). Item labels stay short and drop what the group title already says.

## Endpoints

- The site is built statically, so Astro endpoint handlers return `new Response(body)` with no `headers`. The file extension decides the type.
