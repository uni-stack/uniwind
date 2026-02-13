---
name: migrate-nativewind-to-uniwind
description: >
  Migrate a React Native project from NativeWind to Uniwind. Use when the user wants to
  replace NativeWind with Uniwind, upgrade from NativeWind, switch to Uniwind, or mentions
  NativeWind-to-Uniwind migration. Handles package removal, config migration, Tailwind 4
  upgrade, cssInterop removal, theme conversion, and all breaking changes.
---

# Migrate NativeWind to Uniwind

Uniwind replaces NativeWind with better performance and stability. It requires **Tailwind CSS 4** and uses CSS-based theming instead of JS config.

## Pre-Migration Checklist

Before starting, read the project's existing config files to understand the current setup:
- `package.json` (NativeWind version, dependencies)
- `tailwind.config.js` / `tailwind.config.ts`
- `metro.config.js`
- `babel.config.js`
- `global.css` or equivalent CSS entry file
- `nativewind-env.d.ts` or `nativewind.d.ts`
- Any file using `cssInterop` or `remapProps` from `nativewind`
- Any file importing from `react-native-css-interop`
- Any ThemeProvider from NativeWind (`vars()` usage)

## Step 1: Remove NativeWind and Related Packages

Uninstall ALL of these packages (if present):
```bash
npm uninstall nativewind react-native-css-interop
# or
yarn remove nativewind react-native-css-interop
# or
bun remove nativewind react-native-css-interop
```

**CRITICAL**: `react-native-css-interop` is a NativeWind dependency that must be removed. It is commonly missed during migration. Search the entire codebase for any imports from it:
```bash
rg "react-native-css-interop" -g "*.{ts,tsx,js,jsx}"
```

Remove every import and usage found.

## Step 2: Install Uniwind and Tailwind 4

```bash
npm install uniwind tailwindcss@latest
# or
yarn add uniwind tailwindcss@latest
# or
bun add uniwind tailwindcss@latest
```

Ensure `tailwindcss` is version 4+.

## Step 3: Update babel.config.js

Remove the NativeWind babel preset:
```js
// REMOVE this line from presets array:
// 'nativewind/babel'
```

No Uniwind babel preset is needed.

## Step 4: Update metro.config.js

Replace NativeWind's metro config with Uniwind's. `withUniwindConfig` must be the **outermost wrapper**.

**Before (NativeWind):**
```js
const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, { input: './global.css' });
```

**After (Uniwind):**
```js
const { getDefaultConfig } = require('expo/metro-config');
// For bare RN: const { getDefaultConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  polyfills: { rem: 14 },
});
```

`cssEntryFile` must be a **relative path string** from project root (e.g. `./global.css` or `./app/global.css`).
Do **not** use absolute paths or `path.resolve(...)` / `path.join(...)` for this option.

```js
// ❌ Broken
cssEntryFile: path.resolve(__dirname, 'app', 'global.css')

// ✅ Correct
cssEntryFile: './app/global.css'
```

**Always set `polyfills.rem` to 14** to match NativeWind's default rem value and prevent spacing/sizing differences after migration.

If the project uses custom themes beyond `light`/`dark` (e.g. defined via NativeWind's `vars()` or a custom ThemeProvider), register them with `extraThemes`. Do NOT include `light` or `dark` — they are added automatically:

```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  polyfills: { rem: 14 },
  extraThemes: ['ocean', 'sunset', 'premium'],
});
```

Options:
- `cssEntryFile` (required): relative path string to CSS entry file (from project root)
- `polyfills.rem` (required for migration): set to `14` to match NativeWind's rem base
- `extraThemes` (required if project has custom themes): array of custom theme names — do NOT include `light`/`dark`
- `dtsFile` (optional): path for generated TypeScript types, defaults to `./uniwind-types.d.ts`
- `debug` (optional): log unsupported CSS properties during dev

## Step 5: Update global.css

Replace NativeWind's Tailwind 3 directives with Tailwind 4 imports:

**Before:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After:**
```css
@import 'tailwindcss';
@import 'uniwind';
```

## Step 6: Update CSS Entry Import

Ensure `global.css` is imported in your main App component (e.g., `App.tsx`), NOT in the root `index.ts`/`index.js` where you register the app — importing there breaks hot reload.

## Step 7: Delete NativeWind Type Definitions

Delete `nativewind-env.d.ts` or `nativewind.d.ts`. Uniwind auto-generates its own types at the path specified by `dtsFile`.

## Step 8: Delete tailwind.config.js

Remove `tailwind.config.js` / `tailwind.config.ts` entirely. All theme config moves to CSS using Tailwind 4's `@theme` directive.

Migrate custom theme values to `global.css`:

**Before (tailwind.config.js):**
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#00a8ff',
        secondary: '#273c75',
      },
      fontFamily: {
        normal: ['Roboto-Regular'],
        bold: ['Roboto-Bold'],
      },
    },
  },
};
```

**After (global.css):**
```css
@import 'tailwindcss';
@import 'uniwind';

@theme {
  --color-primary: #00a8ff;
  --color-secondary: #273c75;
  --font-normal: 'Roboto-Regular';
  --font-bold: 'Roboto-Bold';
}
```

Font families must specify a **single font** — React Native doesn't support font fallbacks.

## Step 9: Remove ALL cssInterop and remapProps Usage

**This is the most commonly missed step.** Search the entire codebase:

```bash
rg "cssInterop|remapProps" -g "*.{ts,tsx,js,jsx}"
```

Replace every `cssInterop()` / `remapProps()` call with Uniwind's `withUniwind()`:

**Before (NativeWind):**
```tsx
import { cssInterop } from 'react-native-css-interop';
import { Image } from 'expo-image';

cssInterop(Image, { className: 'style' });
```

**After (Uniwind):**
```tsx
import { withUniwind } from 'uniwind';
import { Image as ExpoImage } from 'expo-image';

export const Image = withUniwind(ExpoImage);
```

`withUniwind` automatically maps `className` → `style` and other common props. For custom prop mappings:

```tsx
const StyledProgressBar = withUniwind(ProgressBar, {
  width: {
    fromClassName: 'widthClassName',
    styleProperty: 'width',
  },
});
```

Define wrapped components at **module level** (not inside render functions). Each component should only be wrapped once:

- **Used in one file only** — define the wrapped component in that same file:
  ```tsx
  // screens/ProfileScreen.tsx
  import { withUniwind } from 'uniwind';
  import { BlurView as RNBlurView } from '@react-native-community/blur';

  const BlurView = withUniwind(RNBlurView);

  export function ProfileScreen() {
    return <BlurView className="flex-1" />;
  }
  ```

- **Used across multiple files** — wrap once in a shared module and re-export:
  ```tsx
  // components/styled.ts
  import { withUniwind } from 'uniwind';
  import { Image as ExpoImage } from 'expo-image';
  import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

  export const Image = withUniwind(ExpoImage);
  export const LinearGradient = withUniwind(RNLinearGradient);
  ```
  Then import from the shared module everywhere:
  ```tsx
  import { Image, LinearGradient } from '@/components/styled';
  ```

Never call `withUniwind` on the same component in multiple files — wrap once, import everywhere.

**IMPORTANT**: Do NOT wrap components from `react-native` or `react-native-reanimated` with `withUniwind` — they already support `className` out of the box. This includes `View`, `Text`, `Image`, `ScrollView`, `FlatList`, `Pressable`, `TextInput`, `Animated.View`, etc. Only use `withUniwind` for **third-party** components (e.g. `expo-image`, `expo-linear-gradient`, `@react-native-community/blur`).

**IMPORTANT — accent- prefix for non-style color props**: React Native components have props like `color`, `tintColor`, `backgroundColor` that are NOT part of the `style` object. To set these via Tailwind classes, use the `accent-` prefix with the corresponding `*ClassName` prop:

```tsx
// color prop → colorClassName with accent- prefix
<ActivityIndicator
    className="m-4"
    size="large"
    colorClassName="accent-blue-500 dark:accent-blue-400"
/>

// color prop on Button
<Button
    colorClassName="accent-background"
    title="Press me"
/>

// tintColor prop → tintColorClassName with accent- prefix
<Image
    className="w-6 h-6"
    tintColorClassName="accent-red-500"
    source={icon}
/>
```

Rule: `className` accepts any Tailwind utility for style-based props. For non-style props (color, tintColor, etc.), use `{propName}ClassName` with the `accent-` prefix. This applies to all built-in React Native components.

## Step 10: Migrate NativeWind Theme Variables

**Before (NativeWind JS themes with `vars()`):**
```tsx
import { vars } from 'nativewind';

export const themes = {
  light: vars({
    '--color-primary': '#00a8ff',
    '--color-typography': '#000',
  }),
  dark: vars({
    '--color-primary': '#273c75',
    '--color-typography': '#fff',
  }),
};

// In JSX:
<View style={themes[colorScheme]}>
```

**After (Uniwind CSS themes):**
```css
@layer theme {
  :root {
    @variant light {
      --color-primary: #00a8ff;
      --color-typography: #000;
    }
    @variant dark {
      --color-primary: #273c75;
      --color-typography: #fff;
    }
  }
}
```

**IMPORTANT**: All theme variants must define the exact same set of CSS variables. If `light` defines `--color-primary` and `--color-typography`, then `dark` (and any custom theme) must also define both. Mismatched variables will cause a Uniwind runtime error.

No ThemeProvider wrapper needed. Remove the NativeWind `<ThemeProvider>` or `vars()` wrapper from JSX. Keep React Navigation's `<ThemeProvider>` if used.

If the project has **custom themes beyond light/dark** (e.g. `ocean`, `premium`), you must:
1. Define them in CSS using `@variant`:
```css
@layer theme {
  :root {
    @variant ocean {
      --color-primary: #0ea5e9;
      --color-background: #0c4a6e;
    }
  }
}
```
2. Register them in metro.config.js via `extraThemes` (skip `light`/`dark` — they are auto-added):
```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  polyfills: { rem: 14 },
  extraThemes: ['ocean', 'premium'],
});
```

## Step 11: Migrate Safe Area Utilities

NativeWind's safe area classes need explicit setup in Uniwind:

```tsx
import { SafeAreaProvider, SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <View className="pt-safe px-safe">
          {/* content */}
        </View>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
```

## Step 12: Verify rem Value

NativeWind uses 14px as the base rem, Uniwind defaults to 16px. Step 4 already sets `polyfills: { rem: 14 }` in metro config to preserve NativeWind's spacing. If the user explicitly wants Uniwind's default (16px), they can remove the polyfill — but warn them that all spacing/sizing will shift.

## Step 13: Handle className Deduplication

Uniwind does NOT auto-deduplicate conflicting classNames (NativeWind did). If your codebase relies on override patterns like ``className={`p-4 ${overrideClass}`}``, set up a `cn` utility.

First, check if the project already has a `cn` helper (common in shadcn/ui projects):
```bash
rg "export function cn|export const cn" -g "*.{ts,tsx,js}"
```

If it exists, keep it as-is. If not, install dependencies and create it:

```bash
npm install tailwind-merge clsx
```

Create `lib/cn.ts` (or wherever utils live in the project):
```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

Usage:
```tsx
import { cn } from '@/lib/cn';

<View className={cn('p-4 bg-white', props.className)} />
<Text className={cn('text-base', isActive && 'text-blue-500', disabled && 'opacity-50')} />
```

Use `cn` instead of raw `twMerge` — it handles conditional classes, arrays, and falsy values via `clsx` before deduplicating with `tailwind-merge`.

## Step 14: Update Animated Class Names

If the project used NativeWind `animated-*` / transition class patterns, migrate those to explicit `react-native-reanimated` usage. Uniwind OSS does not provide NativeWind-style animated class behavior.

Use this migration guide section as the source of truth:
- https://docs.uniwind.dev/migration-from-nativewind

## Step 15: Clean Up Remaining NativeWind References

Final sweep — search for and remove any remaining references:

```bash
rg "nativewind|NativeWind|native-wind" -g "*.{ts,tsx,js,jsx,json,css}"
```

Check for:
- NativeWind imports in any file
- `nativewind` in `package.json` (devDependencies too)
- `react-native-css-interop` in `package.json`
- NativeWind babel preset in `babel.config.js`
- NativeWind metro wrapper in `metro.config.js`
- `nativewind-env.d.ts` or `nativewind.d.ts` files
- Any `cssInterop()` or `remapProps()` calls
- Any `vars()` imports from `nativewind`

## Uniwind APIs & Patterns

### useUniwind — Theme Access (re-renders on change)

Docs: https://docs.uniwind.dev/api/use-uniwind

```tsx
import { useUniwind } from 'uniwind';

const { theme, hasAdaptiveThemes } = useUniwind();
// theme: current theme name — "light", "dark", "system", or custom
// hasAdaptiveThemes: true if app follows system color scheme
```

Use for: displaying theme name in UI, conditional rendering by theme, side effects on theme change.

### Uniwind Static API — Theme Access (no re-render)

Access theme info without causing re-renders:
```tsx
import { Uniwind } from 'uniwind';

Uniwind.currentTheme    // "light", "dark", "system", or custom
Uniwind.hasAdaptiveThemes // true if following system color scheme
```

Use for: logging, analytics, imperative logic outside render.

### useResolveClassNames — Convert classNames to Style Objects

Docs: https://docs.uniwind.dev/api/use-resolve-class-names

Converts Tailwind classes into React Native style objects. Use when working with components that don't support `className` and can't be wrapped with `withUniwind` (e.g. react-navigation theme config):

```tsx
import { useResolveClassNames } from 'uniwind';

const headerStyle = useResolveClassNames('bg-blue-500');
const cardStyle = useResolveClassNames('bg-white dark:bg-gray-900');

<Stack.Navigator
  screenOptions={{
    headerStyle: headerStyle,
    cardStyle: cardStyle,
  }}
/>
```

### useCSSVariable — Access CSS Variables in JS

Docs: https://docs.uniwind.dev/api/use-css-variable

Retrieve CSS variable values programmatically. Variable must be prefixed with `--` and match a variable defined in `global.css`:

```tsx
import { useCSSVariable } from 'uniwind';

const primaryColor = useCSSVariable('--color-primary');
const spacing = useCSSVariable('--spacing-4');
```

Use for: animations, third-party library configs, calculations with design tokens.

### CSS Functions — Custom Utilities

Docs: https://docs.uniwind.dev/api/css-functions

Define custom utilities using device-aware CSS functions like `hairlineWidth()`, `fontScale()`, `pixelRatio()`:

```css
@theme {
  --width-hairline: hairlineWidth();
}
```

Then use as: `<View className="w-hairline" />`

### Platform Selectors

Docs: https://docs.uniwind.dev/api/platform-select

Apply styles conditionally per platform using `ios:`, `android:`, `web:`, `native:` prefixes:

```tsx
<View className="ios:bg-red-500 android:bg-blue-500 web:bg-green-500">
  <Text className="ios:text-white android:text-white web:text-black">
    Platform-specific styles
  </Text>
</View>
```

### Theme Switching

Docs: https://docs.uniwind.dev/theming/basics

By default Uniwind follows the system color scheme (adaptive themes). To switch themes programmatically:

```tsx
import { Uniwind } from 'uniwind';

Uniwind.setTheme('dark');     // force dark
Uniwind.setTheme('light');    // force light
Uniwind.setTheme('system');   // follow system (default)
Uniwind.setTheme('ocean');    // custom theme (must be in extraThemes)
```

### Style Based on Themes — Prefer CSS Variables

Docs: https://docs.uniwind.dev/theming/style-based-on-themes

**Prefer using CSS variable-based classes over explicit dark:/light: variants.** Instead of:
```tsx
// Avoid this pattern
<View className="light:bg-white dark:bg-black" />
```

Define a CSS variable and use it directly:
```css
@layer theme {
  :root {
    @variant light { --color-background: #ffffff; }
    @variant dark { --color-background: #000000; }
  }
}
```
```tsx
// Preferred — automatically adapts to theme
<View className="bg-background" />
```

This is cleaner, easier to maintain, and works automatically with custom themes too.

### Runtime CSS Variable Updates

Docs: https://docs.uniwind.dev/theming/update-css-variables

Update theme variables at runtime, e.g. based on user preferences or API responses:

```tsx
import { Uniwind } from 'uniwind';

// Preconfigure theme based on user input or API response
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff6600',
  '--color-background': '#1a1a2e',
});
```

This pattern should be used only when the app has real runtime theming needs (for example, user-selected brand colors or API-driven themes).

### Variants with tailwind-variants

Docs: https://docs.uniwind.dev/tailwind-basics#advanced-pattern-variants-and-compound-variants

For component variants and compound variants, use the `tailwind-variants` library:

```tsx
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'px-4 py-2 rounded-lg',
  variants: {
    color: {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
    },
    size: {
      sm: 'text-sm',
      lg: 'text-lg px-6 py-3',
    },
  },
});

<Pressable className={button({ color: 'primary', size: 'lg' })} />
```

### Monorepo Support

Docs: https://docs.uniwind.dev/monorepos

If the project is a monorepo, add `@source` directives in `global.css` so Tailwind scans packages outside the CSS entry file's directory (only if that directory has components with Tailwind classes):

```css
@import 'tailwindcss';
@import 'uniwind';
@source "../../packages/ui/src";
@source "../../packages/shared/src";
```

### FAQ

Docs: https://docs.uniwind.dev/faq

**Custom Fonts**: Uniwind maps className to font-family only — font files must be loaded separately (expo-font plugin in `app.json` or `react-native-asset` for bare RN). Font family names in `@theme` must exactly match filenames (without extension). Use platform media queries for per-platform fonts:
```css
@media ios { --font-sans: 'SF Pro Text'; }
@media android { --font-sans: 'Roboto-Regular'; }
```

**Data Selectors**: Use `data-[prop=value]:utility` for prop-based styling. Only equality checks supported:
```tsx
<View data-state={isOpen ? 'open' : 'closed'} className="data-[state=open]:bg-muted/50" />
```

**global.css Location in Expo Router**: Place at project root and import in root layout (`app/_layout.tsx`). If placed in `app/`, components outside need `@source` directives. Tailwind scans from `global.css` location.

**Full App Reloads on CSS Changes**: Metro can't hot-reload files with many providers. Move `global.css` import deeper in the component tree (e.g. navigation root or home screen) to fix.

**Gradients**: Built-in support, no extra deps needed. Use `bg-gradient-to-r from-red-500 via-yellow-500 to-green-500`. For `expo-linear-gradient`, use `useCSSVariable` to get colors — `withUniwind` won't work since gradient props are arrays.

**Style Specificity**: Inline `style` always overrides `className`. Use `className` for static styles, inline only for truly dynamic values. Avoid mixing both for the same property.

**Serialization Errors** (`Failed to serialize javascript object`): Clear caches: `watchman watch-del-all 2>/dev/null; rm -rf node_modules/.cache && npx expo start --clear`. Common causes: complex `@theme` configs, circular CSS variable references.

**Metro unstable_enablePackageExports Conflicts**: Some apps (crypto etc.) disable this, breaking Uniwind. Use selective resolver:
```js
config.resolver.unstable_enablePackageExports = false;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (['uniwind', 'culori'].some((prefix) => moduleName.startsWith(prefix))) {
    return context.resolveRequest({ ...context, unstable_enablePackageExports: true }, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

**Safe Area Classes**: `p-safe`, `pt-safe`, `pb-safe`, `px-safe`, `py-safe`, `m-safe`, `mt-safe`, etc. Also supports `-or-{value}` (min spacing) and `-offset-{value}` (extra spacing) variants.

**Next.js**: Not officially supported. Uniwind is for Metro and Vite. Community plugin: `uniwind-plugin-next`. For Next.js, use standard Tailwind CSS and share design tokens.

**Vite**: Supported since v1.2.0. Use `uniwind/vite` plugin alongside `@tailwindcss/vite`.

**UI Kits**: HeroUI Native, react-native-reusables and Gluestack 4.1+ works great with Uniwind

## Known Issues & Gotchas

1. **data-* attributes**: Uniwind supports `data-[prop=value]:utility` syntax for conditional styling, similar to NativeWind.
2. **Animated styles**: Migrate NativeWind animated classes to `react-native-reanimated` directly. Uniwind Pro has built-in Reanimated support.

## Verification

After migration, verify:
1. `npx react-native start --reset-cache` (clear Metro cache) or with expo `npx expo start -c`
2. All screens render correctly on iOS and Android
3. Theme switching works (light/dark)
4. Custom fonts load correctly
5. Safe area insets apply properly
6. No console warnings about missing styles
7. No remaining imports from `nativewind` or `react-native-css-interop`

**IMPORTANT**: Do NOT guess Uniwind APIs. If you are unsure about any Uniwind API, hook, component, or configuration option, fetch and verify against the official docs: [https://docs.uniwind.dev/llms-full.txt](https://docs.uniwind.dev/llms-full.txt)
