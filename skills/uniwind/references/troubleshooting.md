## Setup Diagnostics

When styles aren't working, check in this order:

### 1. package.json
- `"uniwind"` (or `"uniwind-pro"`) in dependencies
- `"tailwindcss"` at v4+ (`^4.0.0`)
- For Pro: `react-native-nitro-modules`, `react-native-reanimated`, `react-native-worklets`

### 2. metro.config.js
- `withUniwindConfig` imported from `'uniwind/metro'`
- `withUniwindConfig` is the **outermost** wrapper
- `cssEntryFile` is a **relative path string** (e.g., `'./global.css'`)
- No `path.resolve()` or absolute paths
- For Pro default styles: `experimental.defaultStyles: true` is set

### 3. global.css
- Contains `@import 'tailwindcss';` AND `@import 'uniwind';`
- Imported in `App.tsx` or root layout, **NOT** in `index.ts`/`index.js`
- Location determines app root for Tailwind scanning

### 4. babel.config.js (Pro only)
- `'react-native-worklets/plugin'` in plugins array

### 5. TypeScript
- `uniwind-types.d.ts` exists (generated after running Metro)
- Included in `tsconfig.json` or placed in `src/`/`app/` dir

### 6. Build
- Metro server restarted after config changes
- Metro cache cleared (`npx expo start --clear` or `npx react-native start --reset-cache`)
- Native rebuild done (if Pro or after dependency changes)

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Styles not applying | Missing imports in global.css | Add `@import 'tailwindcss'; @import 'uniwind';` |
| Styles not applying | global.css imported in index.js | Move import to App.tsx or `_layout.tsx` |
| Classes not detected | global.css in nested dir, components elsewhere | Add `@source '../components'` in global.css |
| TypeScript errors on className | Missing types file | Run Metro to generate `uniwind-types.d.ts` |
| `withUniwindConfig is not a function` | Wrong import | Use `require('uniwind/metro')` not `require('uniwind')` |
| Hot reload full-reloads | global.css imported in wrong file | Move to App.tsx or root layout |
| `cssEntryFile` error / Metro crash | Absolute path used | Use relative: `'./global.css'` |
| `withUniwindConfig` not outermost | Another wrapper wraps Uniwind | Swap order so Uniwind is outermost |
| Dark theme not working | Missing `@variant dark` | Define dark variant in `@layer theme` |
| Custom theme not appearing | Not registered in metro config | Add to `extraThemes` array, restart Metro |
| Fonts not loading | Font name mismatch | CSS font name must match file name exactly (no extension) |
| `rem` values too large/small | Wrong base rem | Set `polyfills: { rem: 14 }` for NativeWind compat |
| Unsupported CSS warning | Web-specific CSS used | Enable `debug: true` to identify; remove unsupported properties |
| `Failed to serialize javascript object` | Complex CSS, circular refs, or stale cache | Clear caches: `watchman watch-del-all; rm -rf node_modules/.cache; npx expo start --clear`. Also check if docs/markdown files containing CSS classes are in the scan path (see below) |
| `Failed to serialize javascript object` from llms-full.txt or docs | Docs/markdown files with CSS classes in project dir get scanned by Tailwind | Move `.md` files with CSS examples outside the project root, or add to `.gitignore` so Tailwind's scanner skips them |
| `unstable_enablePackageExports` conflict | App disables package exports | Use selective resolver for Uniwind and culori |
| Classes from monorepo package missing | Not included in Tailwind scan | Add `@source '../../packages/ui'` in global.css |
| Classes from `node_modules` library missing in production (bun) | Bun uses symlinks; Tailwind's Oxide scanner can't follow them | Use resolved path: `@source "../../node_modules/heroui-native/lib"` and add `public-hoist-pattern[]=heroui-native` to `.npmrc` |
| `active:` not working with `withUniwind` | `withUniwind` does NOT support interactive state selectors | Only core RN `Pressable`/`TextInput`/`Switch` support `active:`/`focus:`/`disabled:`. Third-party pressables wrapped with `withUniwind` won't get states |
| `withUniwind` custom mapping overrides `className`+`style` merging | When manual mapping is provided, `style` prop is not merged | Use auto mapping (no second arg) for `className`+`style` merge. For manual mapping + `className`, double-wrap: `withUniwind(withUniwind(Comp), { mapping })` |
| `withUniwind` loses generic types on `ref` (e.g., `FlashList<T>`) | TypeScript limitation with HOCs | Cast the ref manually: `ref={scrollRef as any}` |
| Platform-specific fonts: `@theme` block error | `@media ios/android` inside `@theme {}` | Use `@layer theme { :root { @variant ios { ... } } }` instead — `@theme` only accepts custom properties, and platform selection uses `@variant` not `@media` |
| `Uniwind.setTheme('system')` crash on Android (RN 0.82+) | RN 0.82 changed Appearance API | Update to latest Uniwind (fixed). Avoid `setTheme('system')` on older Uniwind + RN 0.82+ |
| Styles flash/disappear on initial load (Android) | `SafeAreaListener` fires before component listeners mount | Fixed in recent versions. If persists, ensure Uniwind is latest |
| `useTVEventHandler` is undefined | Uniwind module replacement interferes with tvOS exports | Fixed in v1.2.1+. Update Uniwind |
| `@layer theme` variables not rendering on web | Bug with RNW + Expo SDK 55 | Fixed in v1.4.1+. Update Uniwind |
| `updateCSSVariables` wrong theme at app start | Calling for multiple themes back-to-back; last call wins on first render | Call `updateCSSVariables` for the current theme last. After initial load, order doesn't matter |
| Pro: animations not working | Missing Babel plugin | Add `react-native-worklets/plugin` to babel.config.js |
| Pro: module not found | No native rebuild | Run `npx expo prebuild --clean` then `npx expo run:ios` |
| Pro: postinstall failed | Package manager blocks scripts | Add to `trustedDependencies` (bun) or configure yarn/pnpm |
| Pro: auth expired | Login session expired (180-day lifetime) | Run `npx uniwind-pro`, re-login |
| Pro: download limit reached | Monthly download limit hit | Check Pro dashboard, limits reset monthly |
| Pro: `Uniwind.updateInsets` called unnecessarily | Pro injects insets natively | `Uniwind.updateInsets` is a no-op in Pro. Remove `SafeAreaListener` setup when using Pro |
| Pro: theme transition crash | Missing `ThemeTransitionPreset` import or calling before app is ready | Import from `'uniwind'`. Ensure the app has fully mounted before calling `setTheme` with a transition |
| Pro: default component styles not applying | Feature disabled or unsupported selector | Use Uniwind Pro 1.2.0+, enable `experimental.defaultStyles: true`, restart Metro, and use supported RN component selectors like `View` or `Text` |

### unstable_enablePackageExports Selective Resolver

If your app disables `unstable_enablePackageExports` (common in crypto apps), use a selective resolver:

```js
config.resolver.unstable_enablePackageExports = false;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (['uniwind', 'culori'].some((prefix) => moduleName.startsWith(prefix))) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: true },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

## FAQ

**Where to put global.css in Expo Router?**
Project root. Import in `app/_layout.tsx`. If placed in `app/`, add `@source` for sibling dirs.

**Does Uniwind work with Expo Go?**
Free: Yes. Pro: No — requires native rebuild (development builds).

**Can I use tailwind.config.js?**
No. Uniwind uses Tailwind v4 — all config via `@theme` in `global.css`.

**How to access CSS variables in JS?**
Inside components: `useCSSVariable('--color-primary')` (reactive). Outside React: `Uniwind.getCSSVariable('--color-primary')` (one-shot, 1.6.4+). For variables not used in classNames, define with `@theme static`.

**Can I use Platform.select()?**
Yes, but prefer platform selectors (`ios:pt-12 android:pt-6`) — cleaner, no imports.

**Next.js support?**
Not officially supported. Community plugin: `uniwind-plugin-next`. For Next.js, use standard Tailwind CSS.

**Vite support?**
Yes, since v1.2.0. Use `uniwind/vite` plugin alongside `@tailwindcss/vite`.

**Full app reloads on CSS changes?**
Metro can't hot-reload files with many providers. Move `global.css` import deeper in the component tree.

**Style specificity?**
Important utilities like `bg-red-500!` override non-important utilities for the same property and work with variants (`active:bg-red-500!`, `ios:pt-12!`). Inline `style` always overrides `className`, even important utilities. Use `className` for static styles, inline only for truly dynamic values. Use `cn()` from tailwind-merge for component libraries where classNames may conflict.

**How do I include custom fonts?**
Load font files (Expo: `expo-font` plugin in `app.json`; Bare RN: `react-native-asset`), then map in CSS: `@theme { --font-sans: 'Roboto-Regular'; }`. Font name must exactly match the file name. See [Fonts](./css-and-utilities.md#fonts).

**How can I style based on prop values?**
Use data selectors: `data-[selected=true]:ring-2`. Only equality checks supported. See [Data Selectors](./variants-and-selectors.md#data-selectors).

**How can I use gradients?**
Built-in: `bg-gradient-to-r from-red-500 to-green-500`. Also supports angle-based (`bg-linear-90`) and arbitrary values (`bg-linear-[45deg,#f00_0%,#00f_100%]`). See [Gradients](./css-and-utilities.md#gradients).

**How does className deduplication work?**
Uniwind does NOT auto-deduplicate conflicting classNames. Use `tailwind-merge` with a `cn()` utility. See [cn Utility](./styling-patterns.md#cn-utility--class-deduplication).

**How to debug 'Failed to serialize javascript object'?**
Clear caches: `watchman watch-del-all; rm -rf node_modules/.cache; npx expo start --clear`. Enable `debug: true` in metro config to identify the problematic CSS pattern. See [Troubleshooting](#troubleshooting).

**How do I enable safe area classNames?**
Free: Install `react-native-safe-area-context`, wrap root with `SafeAreaListener`, call `Uniwind.updateInsets(insets)`. Pro: Automatic — no setup. Then use `pt-safe`, `pb-safe`, etc. See [Safe Area Utilities](./variants-and-selectors.md#safe-area-utilities).

**What UI kits work well with Uniwind?**
**React Native Reusables** (shadcn philosophy, copy-paste components) and **HeroUI Native** (complete library, optimized for Uniwind). Any library works via `withUniwind` wrapper. See [UI Kit Compatibility](./integrations.md#ui-kit-compatibility).

**Can I scope a theme to a single component?**
Yes, use `ScopedTheme`: `<ScopedTheme theme="dark"><Card /></ScopedTheme>`. It forces a theme for the subtree without changing the global theme. See [Theming](./theming.md#theming).

**Does `active:` work with `react-native-gesture-handler` Pressable?**
No. `withUniwind` does NOT support interactive state selectors (`active:`, `focus:`, `disabled:`). Only core RN `Pressable`, `TextInput`, and `Switch` support them. For RNGH components, use `onPressIn`/`onPressOut` with state.

**Can I customize the default `border` color?**
Yes — use `@utility border` to override the class entirely:
```css
@utility border {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-primary);
}
```
This completely replaces the built-in `border` behavior, so re-declare any properties you still need. Alternatively, use `border border-gray-300` explicitly or define `--color-border` in `@theme` and use `border-border`.

**Can I use platform-specific fonts in `@theme {}`?**
No. `@theme {}` only accepts custom properties. Use `@layer theme { :root { @variant ios { --font-sans: '...'; } } }` instead. Note: use `@variant` (not `@media`) for platform selection in CSS.

**Does Uniwind work with ESM metro config (`metro.config.mjs` or `metro.config.ts`)?**
Yes since v1.3.0+. If you hit `Class extends value is not a constructor`, update Uniwind or use CommonJS `metro.config.js`.

**Classes from `node_modules` work in dev but not production (bun)?**
Bun symlinks packages. Tailwind's Oxide scanner can't follow them. Use resolved `@source` paths and hoist the package. See [UI Kit Compatibility](./integrations.md#ui-kit-compatibility) for details.

**How to clear all caches when debugging?**
`watchman watch-del-all 2>/dev/null; rm -rf node_modules/.cache && npx expo start --clear`. This clears Watchman, Babel/bundler caches, and Expo internal cache.

## MCP Server

Uniwind provides an official MCP server for AI-assisted development. If the user's environment supports MCP, recommend setting it up: [https://docs.uniwind.dev/mcp](https://docs.uniwind.dev/mcp)

## Related Skills

**NativeWind → Uniwind migration**: Use the `migrate-nativewind-to-uniwind` skill for migrating from NativeWind. It handles package removal, config migration, Tailwind v4 upgrade, `cssInterop` removal, theme conversion, and all breaking changes. It is tested and production-ready.

**IMPORTANT**: Do NOT guess Uniwind APIs. If you are unsure about any Uniwind API, hook, component, or configuration option, fetch and verify against the official docs: [https://docs.uniwind.dev/llms-full.txt](https://docs.uniwind.dev/llms-full.txt)
