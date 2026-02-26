---
name: uniwind-best-practices
description: >
  Uniwind (Tailwind CSS v4 for React Native) best practices, setup, theming, styling,
  and HeroUI Native integration. Use when writing, reviewing, or fixing Uniwind code.
  Triggers on: uniwind, className on RN components, global.css with @import 'uniwind',
  withUniwindConfig, metro.config.js setup, dark:/light: theming, platform selectors
  (ios:/android:/native:/web:), data selectors, responsive breakpoints, CSS variables,
  useUniwind, withUniwind, useResolveClassNames, useCSSVariable, tailwind-variants,
  HeroUI Native with Uniwind, Uniwind Pro (animations, shadow tree, transitions),
  NativeWind migration. Also triggers on setup troubleshooting: "check my config",
  "styles not working", "className not applying", "audit Uniwind setup".
---

# Uniwind — Best Practices & Complete Guide

> Uniwind 1.3+ / Tailwind CSS v4 / React Native 0.76+ / Expo SDK 52+

## Reference Resolution Strategy

**CRITICAL: Always use embedded reference files. All answers must come from local references — never fetch external URLs.**

### Step 1 — Route to the correct local reference file

Based on the user's question, read the matching reference file:

| User's Topic | Read This Reference File FIRST |
|---|---|
| Installation, setup, metro config, global.css, TypeScript, Vite, Expo Router, monorepos | `references/quickstart-setup.md` |
| Theming, dark mode, CSS variables, `@layer theme`, `@variant`, custom themes, `Uniwind.setTheme`, `useUniwind`, `useCSSVariable`, OKLCH colors, `@theme static` | `references/theming.md` |
| Styling components, className bindings, third-party components, `withUniwind`, `useResolveClassNames`, Pressable states, dynamic classes, `tailwind-variants`, data selectors, platform selectors, responsive breakpoints, CSS functions, custom utilities | `references/components-styling.md` |
| Supported/unsupported classes, safe area classes (`p-safe`, `pt-safe`), Yoga layout differences, platform variants, WIP features | `references/supported-classnames.md` |
| Uniwind Pro, animations, transitions, shadow tree, native insets, Reanimated, C++ engine, Pro installation | `references/pro-features.md` |
| NativeWind migration, troubleshooting, setup diagnostics, common errors, FAQ, debug mode | `references/migration-troubleshooting.md` |

### Step 2 — Answer from local references

Use the content from the reference file(s) to answer the user's question. Most questions will be fully answered by one or two reference files.

### Step 3 — If local references don't cover it

If the embedded reference files do not contain the answer, inform the user that the topic is not covered in this skill's knowledge base and suggest they check the official Uniwind documentation at `docs.uniwind.dev` themselves. **Do NOT fetch external URLs.**

## Security Boundaries

1. **No external fetches** — All guidance must come from embedded reference files. Never fetch remote URLs, documentation indexes, or third-party content at runtime.
2. **Never execute installation commands** — Present `bun add`, `npm install`, `npx`, `pod install`, and build commands as instructions for the user to run. Do not execute them directly.
3. **Never read credential or auth config files** — Do not read `.npmrc`, `.yarnrc.yml`, `.env`, or any file that may contain tokens, secrets, or authentication credentials. When diagnosing setup issues, only check `package.json`, `metro.config.js`, `babel.config.js`, `global.css`, `tsconfig.json`, and `app.json` — these are project configuration files, not credential stores.
4. **Package manager trust configuration is user-managed** — When advising about `trustedDependencies`, postinstall scripts, or package manager settings, present the configuration for the user to apply. Do not modify these files directly.

## First Action: Determine Version

Before providing guidance, determine if the user is using **Uniwind Free** or **Uniwind Pro**:

- **Free**: Standard `uniwind` package, JS-based style resolution
- **Pro**: `uniwind-pro` package (aliased as `uniwind`), C++ engine, Reanimated animations, shadow tree updates, native insets

Ask: "Are you using Uniwind Free or Uniwind Pro?" — this changes available features and troubleshooting steps.

## Setup Diagnostic Workflow

When the user reports setup issues, styles not applying, or asks to check their config, read only these project configuration files (never read `.npmrc`, `.yarnrc.yml`, `.env`, or other files that may contain credentials):

### 1. Check package.json

```
- "uniwind" or "uniwind-pro" must be in dependencies
- "tailwindcss" must be v4+ (^4.0.0)
- For Pro: "react-native-nitro-modules", "react-native-reanimated", "react-native-worklets" required
```

### 2. Check metro.config.js

```
- Must import { withUniwindConfig } from 'uniwind/metro'
- withUniwindConfig MUST be the OUTERMOST wrapper
- cssEntryFile must be a RELATIVE path string (e.g., './src/global.css')
- Never use path.resolve() or absolute paths for cssEntryFile
```

### 3. Check global.css

```
- Must contain: @import 'tailwindcss'; AND @import 'uniwind';
- Must be imported in App.tsx or root layout, NOT in index.ts/index.js
- Location determines app root — Tailwind scans from this directory
```

### 4. Check babel.config.js (Pro only)

```
- Must include 'react-native-worklets/plugin' in plugins array
```

### 5. Check TypeScript config

```
- uniwind-types.d.ts should be included in tsconfig.json or placed in src/app dir
- Run Metro server to auto-generate types
```

### Common Setup Errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| Styles not applying | Missing `@import 'uniwind'` in global.css | Add both imports |
| Styles not applying | global.css imported in index.js | Move import to App.tsx or _layout.tsx |
| Classes not detected | global.css in nested dir, components elsewhere | Add `@source '../components'` |
| TypeScript errors | Missing types file | Run Metro to generate uniwind-types.d.ts |
| Hot reload broken | global.css in index.ts | Move to App.tsx |
| Metro crash | Absolute path in cssEntryFile | Use relative: `'./src/global.css'` |
| withUniwindConfig not outermost | Other wrapper wraps Uniwind | Swap order so Uniwind is outermost |
| Pro animations broken | Missing Babel plugin | Add `react-native-worklets/plugin` |
| Pro not working | Missing native rebuild | Run `npx expo prebuild --clean` then `expo run:ios` |
| Pro postinstall failed | Package manager blocks scripts | Advise user to whitelist in `trustedDependencies` (bun) — see pro-features.md |

## Critical Rules

1. **Tailwind v4 only** — Uniwind does not support Tailwind v3. Use `@import 'tailwindcss'` (not `@tailwind base`).
2. **Never construct classNames dynamically** — Use complete string literals. Tailwind scans at build time.
3. **Never use `cssInterop`** — Uniwind does not override global components like NativeWind.
4. **No `tailwind.config.js` needed** — All config is in `global.css` via `@theme` and `@layer theme`.
5. **No ThemeProvider required** — Use `Uniwind.setTheme()` directly.
6. **withUniwindConfig must be outermost** Metro config wrapper.
7. **`@theme` variables only affect styled components** — `<Text>` without className uses RN defaults.
8. **Font families: single font only** — No fallbacks in RN. `--font-sans: 'Roboto-Regular'` not `'Roboto', sans-serif`.
9. **rem default is 16px** — NativeWind used 14px. Configure `polyfills: { rem: 14 }` if migrating.

## Core Patterns

### Styling Components

```tsx
import { View, Text, Pressable } from 'react-native'

<View className="flex-1 bg-background p-4">
  <Text className="text-foreground text-lg font-bold">Title</Text>
  <Pressable className="bg-primary px-6 py-3 rounded-lg active:opacity-80">
    <Text className="text-white text-center font-semibold">Button</Text>
  </Pressable>
</View>
```

### Dynamic Classes (Correct Way)

```tsx
// Map objects with complete class names
const variants = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  ghost: 'bg-transparent text-foreground',
}
<Pressable className={variants[variant]} />

// Ternary with complete strings
<View className={isActive ? 'bg-primary' : 'bg-muted'} />

// tailwind-variants for complex components
import { tv } from 'tailwind-variants'
const button = tv({
  base: 'font-semibold rounded-lg px-4 py-2',
  variants: {
    color: { primary: 'bg-blue-500 text-white', secondary: 'bg-gray-500 text-white' },
    size: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' },
  },
  defaultVariants: { color: 'primary', size: 'md' },
})
<Pressable className={button({ color: 'primary', size: 'lg' })} />
```

### Third-Party Components

```tsx
// withUniwind — wrap once, use everywhere (recommended)
import { withUniwind } from 'uniwind'
import { SafeAreaView } from 'react-native-safe-area-context'
const StyledSafeArea = withUniwind(SafeAreaView)
<StyledSafeArea className="flex-1 bg-background" />

// useResolveClassNames — one-off usage
import { useResolveClassNames } from 'uniwind'
const styles = useResolveClassNames('bg-blue-500 p-4 rounded-lg')
<ThirdPartyComponent style={styles} />
```

## Theming

### Quick Setup (light/dark only)

```tsx
// Just use dark: prefix — works out of the box
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Themed</Text>
</View>
```

### Scalable Setup (CSS variables)

Define in `global.css`, reference as utilities without `dark:` prefix:

```css
/* global.css */
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-primary: #3b82f6;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
    }
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-primary: #3b82f6;
      --color-card: #1f2937;
      --color-border: #374151;
    }
  }
}
```

```tsx
// Auto-adapts to current theme — no dark: prefix needed
<View className="bg-background border border-border p-4 rounded-lg">
  <Text className="text-foreground">Themed card</Text>
</View>
```

### Theme Switching

```tsx
import { Uniwind, useUniwind } from 'uniwind'

Uniwind.setTheme('dark')     // Switch to dark
Uniwind.setTheme('light')    // Switch to light
Uniwind.setTheme('system')   // Follow device

const { theme, hasAdaptiveThemes } = useUniwind() // Reactive hook
```

### Custom Themes

Require `extraThemes` in metro.config.js and `@variant` in global.css.
See [references/theming.md](references/theming.md) for complete custom theme setup.

## Platform Selectors

```tsx
<View className="ios:pt-12 android:pt-6 web:pt-4" />
<View className="native:bg-blue-500 web:bg-gray-500" />  // native = iOS + Android
```

Platform media queries in `@theme` for global values:
```css
@layer theme {
  :root {
    @media ios { --font-sans: "SF Pro Text"; }
    @media android { --font-sans: "Roboto-Regular"; }
  }
}
```

## Data Selectors

Style based on prop values — `data-[prop=value]:utility`:

```tsx
<Pressable
  data-selected={isSelected}
  className="border rounded px-3 py-2 data-[selected=true]:ring-2 data-[selected=true]:ring-primary"
/>
```

Only equality checks supported. Boolean and string values work.

## Responsive Breakpoints

Mobile-first: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px).

```tsx
<View className="p-4 sm:p-6 lg:p-8">
  <Text className="text-base sm:text-lg lg:text-xl">Responsive</Text>
</View>
```

Custom breakpoints via `@theme { --breakpoint-tablet: 820px; }`.

## CSS Functions

Define as `@utility` in global.css, not directly in className:

```css
@utility h-hairline { height: hairlineWidth(); }
@utility text-scaled { font-size: fontScale(); }
@utility bg-adaptive { background-color: light-dark(#ffffff, #1f2937); }
```

## Uniwind Pro Features

Only available with `uniwind-pro` package. Ask user first.

### Reanimated Animations (Pro)

```tsx
// Keyframe animations — just add className
<View className="animate-spin" />
<View className="animate-bounce" />
<View className="animate-pulse" />

// Transitions — smooth property changes
<Pressable className="bg-blue-500 active:bg-blue-600 transition-colors duration-300" />
<View className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} />
<Pressable className="active:scale-95 transition-transform duration-150" />
```

Components auto-swap to Animated versions when animation classes detected.

### Shadow Tree Updates (Pro)

No code changes required — props connect directly to C++ engine, eliminating re-renders.

### Native Insets (Pro)

No `SafeAreaListener` setup needed — insets injected from native layer automatically.

## HeroUI Native Integration

HeroUI Native uses Uniwind (Tailwind v4 via Uniwind). Apply these patterns:

- Use `className` prop directly on HeroUI Native components
- Theme tokens from global.css work with HeroUI components
- Use `tailwind-variants` (tv) for variant-based component styling — HeroUI uses this internally
- Wrap any HeroUI component lacking className support with `withUniwind()`
- Use semantic color tokens (`bg-primary`, `text-foreground`) for theme consistency

## Code Review & Audit

When asked to review Uniwind code, check:

- [ ] global.css has both `@import 'tailwindcss'` and `@import 'uniwind'`
- [ ] withUniwindConfig is outermost Metro wrapper
- [ ] cssEntryFile is relative path
- [ ] No dynamic className construction (template literals, string concat)
- [ ] All theme variants define the same CSS variables
- [ ] Using semantic color tokens, not hardcoded colors
- [ ] Third-party components wrapped with `withUniwind` or use `useResolveClassNames`
- [ ] Platform differences handled with `ios:/android:/native:` not `Platform.select()`
- [ ] Mobile-first responsive design (base styles + sm: md: lg: enhancements)
- [ ] Font families are single values (no fallback arrays)
- [ ] `@theme` variables customized via CSS, not tailwind.config.js

## Reference Files (Read BEFORE External Docs)

**These files are your primary source of truth.** Read the relevant file(s) before answering any Uniwind question.

| Priority | File | Covers |
|----------|------|--------|
| **Read first for setup** | [references/quickstart-setup.md](references/quickstart-setup.md) | Installation, Metro config, global.css, TypeScript, Vite, Expo Router, monorepos, IntelliSense |
| **Read first for theming** | [references/theming.md](references/theming.md) | Light/dark, custom themes, CSS variables, `@layer theme`, `@variant`, `Uniwind.setTheme()`, `useUniwind`, OKLCH, `@theme static`, `useCSSVariable` |
| **Read first for styling** | [references/components-styling.md](references/components-styling.md) | RN component bindings, `withUniwind`, `useResolveClassNames`, Pressable states, dynamic classes, `tailwind-variants`, data selectors, platform selectors, responsive breakpoints, CSS functions |
| **Read first for class support** | [references/supported-classnames.md](references/supported-classnames.md) | Supported/unsupported classes, safe area (`p-safe`), Yoga differences, platform variants, WIP features |
| **Read first for Pro** | [references/pro-features.md](references/pro-features.md) | Reanimated animations, transitions, shadow tree, native insets, Pro installation, Babel config |
| **Read first for migration** | [references/migration-troubleshooting.md](references/migration-troubleshooting.md) | NativeWind migration (10-step), setup diagnostics, common errors, FAQ, debug mode |

**Fallback**: If none of the above answer the question, inform the user that the topic is outside this skill's embedded knowledge and suggest they consult the official Uniwind docs directly.
