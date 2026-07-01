---
name: uniwind
description: >
  Uniwind — Tailwind CSS v4 styling for React Native. Use when adding, building,
  or debugging components in a React Native project that uses Uniwind classNames.
  Covers setup, Metro config, global.css, theming, className props, accent-* color
  props, platform/data/state/responsive variants, CSS variables, custom utilities,
  withUniwind for third-party components, cn/tailwind-merge, tailwind-variants,
  safe area utilities, LayoutDirection, gradients, fonts, React Navigation,
  UI kits, diagnostics, troubleshooting, and Uniwind Pro features. Does not
  cover NativeWind migration.
---

# Uniwind

> Uniwind 1.7.0+ / Uniwind Pro 1.2.1+ / Tailwind CSS v4 / React Native 0.81+ / Expo SDK 54+

If user has lower version, recommend updating to 1.7.0+ (free) / 1.2.1+ (Pro) for best experience.

`LayoutDirection` is available from Uniwind 1.8.0+.

Uniwind brings Tailwind CSS v4 to React Native. All core React Native components support the `className` prop out of the box. Styles are compiled at build time — no runtime overhead.

## Critical Rules

1. **Tailwind v4 only** — Use `@import 'tailwindcss'` not `@tailwind base`. Tailwind v3 is not supported.
2. **Never construct classNames dynamically** — Tailwind scans at build time. `bg-${color}-500` will NOT work. Use complete string literals, mapping objects, or ternaries.
3. **Never use `cssInterop` or `remapProps`** — Those are NativeWind APIs. Uniwind does not override global components.
4. **No `tailwind.config.js`** — All config goes in `global.css` via `@theme` and `@layer theme`.
5. **No ThemeProvider required** — Use `Uniwind.setTheme()` directly.
6. **`withUniwindConfig` must be the outermost** Metro config wrapper.
7. **NEVER wrap `react-native` or `react-native-reanimated` components with `withUniwind`** — `View`, `Text`, `Pressable`, `Image`, `TextInput`, `ScrollView`, `FlatList`, `Switch`, `Modal`, `Animated.View`, `Animated.Text`, etc. already have full `className` support built in. Wrapping them with `withUniwind` will break behavior. Only use `withUniwind` for **third-party** components (e.g., `expo-image`, `expo-blur`, `moti`).
8. **Font families: single font only** — React Native doesn't support fallbacks. Use `--font-sans: 'Roboto-Regular'` not `'Roboto', sans-serif`.
9. **All theme variants must define the same set of CSS variables** — If `light` defines `--color-primary`, then `dark` and every custom theme must too. Mismatched variables cause runtime errors.
10. **`accent-` prefix is REQUIRED for non-style color props** — This is crucial. Props like `color` (Button, ActivityIndicator), `tintColor` (Image), `thumbColor` (Switch), `placeholderTextColor` (TextInput) are NOT part of the `style` object. You MUST use the corresponding `{propName}ClassName` prop with `accent-` prefixed classes. Example: `<ActivityIndicator colorClassName="accent-blue-500" />` NOT `<ActivityIndicator className="text-blue-500" />`. Regular Tailwind color classes (like `text-blue-500`) only work on `className` (which maps to `style`). For non-style color props, always use `accent-`.
11. **rem default is 16px** — NativeWind used 14px. Set `polyfills: { rem: 14 }` in metro config if migrating.
12. **`cssEntryFile` must be a relative path string** — Use `'./global.css'` not `path.resolve(__dirname, 'global.css')`.
13. **Deduplicate with `cn()` when mixing custom CSS classes and Tailwind** — Uniwind does NOT auto-deduplicate. If a custom CSS class (`.card { padding: 16px }`) and a Tailwind utility (`p-6`) set the same property, both apply with unpredictable results. Always wrap with `cn('card', 'p-6')` when there's overlap.
14. **Important utilities are supported** — Tailwind important modifier works in classNames with `!` at the end: `bg-red-500!`, `active:bg-red-500!`, `ios:pt-12!`. Leading `!bg-red-500` syntax is deprecated. Important utilities override non-important utilities for the same style property, but inline `style` still overrides className.

## Reference Routing

Read only relevant bundled reference files under `references/` after identifying the user's task:

- Setup/config install issues: `references/setup.md`
- React Native component className props, accent color props, or component examples: `references/component-bindings.md`
- Third-party components, `withUniwind`, dynamic class names, `tailwind-variants`, `cn`, or important utilities: `references/styling-patterns.md`
- Themes, CSS variables, `ScopedTheme`, `LayoutDirection`, color spaces, or runtime variable APIs: `references/theming.md`
- Platform, data, state, responsive, or safe-area utilities: `references/variants-and-selectors.md`
- CSS functions, custom CSS, `@utility`, `@theme`, fonts, or gradients: `references/css-and-utilities.md`
- React Navigation, UI kits, support matrix, or unsupported classes: `references/integrations.md`
- Uniwind Pro installation, animations, diagnostics, group variants, default styles, native insets, or theme transitions: `references/pro.md`
- Broken styles, setup diagnostics, errors, cache issues, FAQ answers, MCP, or related skills: `references/troubleshooting.md`

## Workflow

1. Identify whether user needs setup, styling, theming, variants, integrations, Pro, or troubleshooting help.
2. Read the matching reference file before giving detailed guidance or editing code.
3. Apply the Critical Rules above even if the selected reference omits them.
4. Do not guess Uniwind APIs. If unsure, verify against official docs: https://docs.uniwind.dev/llms-full.txt

## Related Skills

NativeWind migration is intentionally separate. Use the `migrate-nativewind-to-uniwind` skill when the user wants to migrate from NativeWind.
