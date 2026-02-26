# Migration & Troubleshooting Reference

## Table of Contents
- [NativeWind Migration](#nativewind-migration)
- [Setup Diagnostic Checklist](#setup-diagnostic-checklist)
- [Common Errors & Fixes](#common-errors--fixes)
- [FAQ](#faq)
- [Debug Mode](#debug-mode)

## NativeWind Migration

### Key Differences

| Feature | NativeWind | Uniwind |
|---------|-----------|---------|
| Tailwind version | v3 | v4 only |
| Default rem | 14px | 16px |
| Config file | tailwind.config.js | global.css (@theme) |
| Theme system | ThemeProvider + vars() | CSS @layer theme + @variant |
| Global overrides | cssInterop | Not needed |
| Babel preset | nativewind/babel | None required (free) |

### 10-Step Migration

> **Agent note**: Present these migration steps as instructions for the user to follow. Do not execute install or build commands directly.

#### Step 1: Install Uniwind

Instruct the user to install:

```bash
bun add uniwind tailwindcss@^4
```

#### Step 2: Remove NativeWind Babel preset

```js
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  // Remove: 'nativewind/babel'
}
```

#### Step 3: Update Metro config

```js
const { withUniwindConfig } = require('uniwind/metro')
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
})
```

#### Step 4: Update global.css imports

```css
@import 'tailwindcss';
@import 'uniwind';
```

Replace any `@tailwind base; @tailwind components; @tailwind utilities;` with the above.

#### Step 5: Delete nativewind.d.ts

No longer needed.

#### Step 6: Convert CSS to Tailwind v4 syntax

Follow [Tailwind v4 migration guide](https://tailwindcss.com/docs/theme). Key change: `@theme` replaces `theme.extend` in config.

#### Step 7: Migrate theme variables from JS to CSS

**Before** (NativeWind):
```ts
import { vars } from 'nativewind'
export const themes = {
  light: vars({ '--color-primary': '#00a8ff' }),
  dark: vars({ '--color-primary': '#273c75' }),
}
```

**After** (Uniwind):
```css
@layer theme {
  :root {
    @variant light { --color-primary: #00a8ff; }
    @variant dark { --color-primary: #273c75; }
  }
}
```

Delete the vars helper file.

#### Step 8: Delete tailwind.config.js

All config now in global.css via `@theme` directive.

**Before** (tailwind.config.js):
```js
module.exports = {
  content: ['./App.tsx'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors: { primary: 'var(--color-primary)' } } },
}
```

**After** (global.css):
```css
@theme {
  --color-primary: #3b82f6;
}
```

#### Step 9: Migrate font families

**Before**: `fontFamily: { normal: ['Roboto-Regular', 'sans-serif'] }`

**After**: `--font-normal: 'Roboto-Regular';` (single font, no fallbacks)

```css
@theme {
  --font-normal: 'Roboto-Regular';
  --font-medium: 'Roboto-Medium';
  --font-bold: 'Roboto-Bold';
  --font-mono: 'FiraCode-Regular';
}
```

#### Step 10: (Optional) Customize rem

To keep NativeWind's 14px rem:

```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  polyfills: { rem: 14 },
})
```

### Post-Migration Cleanup

- Remove NativeWind's ThemeProvider (keep React Navigation's ThemeProvider if used)
- Remove `useColorScheme` from NativeWind — use `useUniwind` instead
- Remove `cssInterop` calls — not needed in Uniwind
- Delete `tailwind.config.js`
- Delete `nativewind.d.ts`
- Clear Metro cache: `npx expo start --clear`

## Setup Diagnostic Checklist

When styles aren't working, check in this order:

### 1. Dependencies

```
[ ] "uniwind" (or "uniwind-pro") in package.json dependencies
[ ] "tailwindcss" at v4+ (^4.0.0)
[ ] For Pro: "react-native-nitro-modules", "react-native-reanimated", "react-native-worklets"
```

### 2. Metro Configuration

```
[ ] withUniwindConfig imported from 'uniwind/metro'
[ ] withUniwindConfig is the OUTERMOST wrapper
[ ] cssEntryFile is a RELATIVE path (./src/global.css)
[ ] cssEntryFile points to existing file
[ ] No path.resolve() or absolute paths
```

### 3. Global CSS

```
[ ] File contains @import 'tailwindcss';
[ ] File contains @import 'uniwind';
[ ] Imports are at the top of the file
[ ] File is imported in App.tsx or root layout (NOT index.ts)
```

### 4. Babel (Pro only)

```
[ ] 'react-native-worklets/plugin' in plugins array
```

### 5. TypeScript

```
[ ] uniwind-types.d.ts exists (generated after running Metro)
[ ] Included in tsconfig.json or placed in src/app dir
```

### 6. Build

```
[ ] Metro server restarted after config changes
[ ] Metro cache cleared (npx expo start --clear)
[ ] Native rebuild done (if Pro or after dependency changes)
```

## Common Errors & Fixes

| Error / Symptom | Cause | Fix |
|-----------------|-------|-----|
| `className` has no effect | Missing Uniwind imports in global.css | Add `@import 'tailwindcss'; @import 'uniwind';` |
| Styles not updating on save | global.css imported in index.ts | Move import to App.tsx or _layout.tsx |
| Some classes not detected | global.css in nested dir | Add `@source '../components'` for external dirs |
| TypeScript errors on className | Missing types file | Run Metro to generate uniwind-types.d.ts |
| `withUniwindConfig is not a function` | Wrong import | `require('uniwind/metro')` not `require('uniwind')` |
| Hot reload full-reloads | global.css in wrong file | Import in App.tsx, not index.ts |
| `cssEntryFile` error | Absolute path used | Use relative: `'./src/global.css'` |
| Dark theme not working | Missing `@variant dark` in global.css | Define dark variant in `@layer theme` |
| Custom theme not appearing | Not registered in Metro | Add to `extraThemes` array, restart Metro |
| Fonts not loading | Font name mismatch | CSS font name must match file name exactly |
| `rem` values too large/small | Different base than expected | Set `polyfills: { rem: 14 }` for NativeWind compat |
| Unsupported CSS warning | Web-specific CSS used | Enable `debug: true` in Metro to identify |
| Pro: animations not working | Missing Babel plugin | Add `react-native-worklets/plugin` |
| Pro: module not found | No native rebuild | `npx expo prebuild --clean` then run |
| Pro: postinstall failed | Package manager blocks scripts | Add to `trustedDependencies` (bun) |
| Classes from monorepo package missing | Not included in scan | Add `@source '../packages/ui'` |

## FAQ

### Where to put global.css in Expo Router?

Best: project root. Import in `app/_layout.tsx`:

```
project/
├── app/_layout.tsx  ← import '../global.css'
├── components/
├── global.css       ← here
└── metro.config.js  ← cssEntryFile: './global.css'
```

Alternative: in `app/` dir, but add `@source '../components'` for sibling dirs.

### How to include custom fonts?

**Expo**: Configure in app.json with `expo-font` plugin, then in global.css:

```css
@theme {
  --font-sans: 'Roboto-Regular';
  --font-bold: 'Roboto-Bold';
}
```

Font name in CSS must exactly match font file name (without extension).

**Bare RN**: Use `react-native-asset` to link fonts, same CSS config.

### How to style based on prop values?

Use data selectors:

```tsx
<View data-state="open" className="data-[state=open]:bg-blue-500" />
```

### Can I use Platform.select()?

You can, but prefer platform selectors:

```tsx
// Prefer this
<View className="ios:pt-12 android:pt-6" />

// Over this
<View className={Platform.select({ ios: 'pt-12', android: 'pt-6' })} />
```

### Does Uniwind work with Expo Go?

Uniwind Free: Yes, works with Expo Go.
Uniwind Pro: No, requires native rebuild (development builds).

### Can I use tailwind.config.js?

No. Uniwind uses Tailwind v4 which uses CSS-based configuration (`@theme` directive in global.css).

### How to access CSS variables in JavaScript?

```tsx
import { useCSSVariable } from 'uniwind'
const color = useCSSVariable('--color-primary')
```

For variables not used in classNames, define with `@theme static`.

## Debug Mode

Enable in Metro config to identify unsupported CSS:

```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  debug: true,
})
```

Output example:
```
Uniwind Error [CSS Processor] - Unsupported value type - "filters" for className headerBlur
```

Use during development and migration. Disable in production.
