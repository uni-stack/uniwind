# Quickstart & Setup Reference

## Table of Contents
- [Installation](#installation)
- [Global CSS File](#global-css-file)
- [Metro Configuration](#metro-configuration)
- [Vite Configuration](#vite-configuration)
- [TypeScript Setup](#typescript-setup)
- [Tailwind IntelliSense](#tailwind-intellisense)
- [Expo Router Placement](#expo-router-placement)
- [Monorepos & @source](#monorepos--source)
- [Complete Metro Config Options](#complete-metro-config-options)

## Installation

> **Agent note**: Present these installation commands as instructions for the user to run. Do not execute them directly.

### New Project (Expo)

```bash
# Option 1: Manual
bun add uniwind tailwindcss

# Option 2: Template
npx create-expo-app -e with-router-uniwind

# Option 3: better-t-stack
bun create better-t-stack@latest --template uniwind
```

### Bare React Native

```bash
npm install uniwind tailwindcss
```

Uniwind requires **Tailwind CSS v4** only. v3 is not supported.

## Global CSS File

Create `global.css` — the CSS entry point:

```css
@import 'tailwindcss';
@import 'uniwind';

/* Custom themes, utilities, and CSS below */
```

### Import Location

Import in your main app component (App.tsx or root layout), **NOT** in index.ts/index.js:

```tsx
// App.tsx or app/_layout.tsx
import './global.css' // Must be here for hot reload

export default function App() { /* ... */ }
```

```tsx
// index.ts — DO NOT import here (breaks hot reload)
import { registerRootComponent } from 'expo'
import App from './App' // global.css imported inside App
registerRootComponent(App)
```

### Location Matters

The directory containing `global.css` is the app root. Tailwind scans for classNames starting from this directory. Files outside need `@source`.

## Metro Configuration

### Expo (Metro)

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const config = getDefaultConfig(__dirname)

// withUniwindConfig MUST be the OUTERMOST wrapper
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',          // Required: relative path
  dtsFile: './src/uniwind-types.d.ts',       // Optional: types location
})
```

### Bare React Native (Metro)

```js
// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
})
```

### Wrapper Order

```js
// CORRECT — Uniwind wraps everything
module.exports = withUniwindConfig(
  withOtherConfig(config, options),
  { cssEntryFile: './src/global.css' }
)

// WRONG — Uniwind is innermost
module.exports = withOtherConfig(
  withUniwindConfig(config, { cssEntryFile: './src/global.css' }),
  options
)
```

## Vite Configuration

Available in Uniwind 1.2.0+:

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { uniwind } from 'uniwind/vite'
import { defineConfig } from 'vite'
import { rnw } from 'vite-plugin-rnw'

export default defineConfig({
  plugins: [
    rnw(),
    tailwindcss(),
    uniwind({
      cssEntryFile: './src/global.css',
      dtsFile: './src/uniwind-types.d.ts',
    }),
  ],
})
```

## TypeScript Setup

Uniwind auto-generates a `.d.ts` file with type definitions for your CSS classes and themes.

Place in `src/` or `app/` for automatic inclusion, or add to tsconfig:

```json
{
  "compilerOptions": {},
  "include": ["./uniwind-types.d.ts"]
}
```

Run Metro server to generate types: `npx expo start`

## Tailwind IntelliSense

### VS Code / Cursor / Windsurf

Instruct the user to add the following to their editor's `settings.json`:

```json
{
  "tailwindCSS.classAttributes": [
    "class", "className", "headerClassName",
    "contentContainerClassName", "columnWrapperClassName",
    "endFillColorClassName", "imageClassName", "tintColorClassName",
    "ios_backgroundColorClassName", "thumbColorClassName",
    "trackColorOnClassName", "trackColorOffClassName",
    "selectionColorClassName", "cursorColorClassName",
    "underlineColorAndroidClassName", "placeholderTextColorClassName",
    "selectionHandleColorClassName", "colorsClassName",
    "progressBackgroundColorClassName", "titleColorClassName",
    "underlayColorClassName", "colorClassName",
    "drawerBackgroundColorClassName", "statusBarBackgroundColorClassName",
    "backdropColorClassName", "backgroundColorClassName",
    "ListFooterComponentClassName", "ListHeaderComponentClassName"
  ],
  "tailwindCSS.classFunctions": ["useResolveClassNames"]
}
```

## Expo Router Placement

Recommended structure with Expo Router:

```
your-project/
├── app/
│   ├── _layout.tsx    ← import '../global.css' here
│   └── index.tsx
├── components/
├── global.css         ← project root (best location)
└── package.json
```

```js
// metro.config.js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',  // project root
})
```

Alternative (global.css in app/ dir — requires @source for siblings):

```css
/* app/global.css */
@import 'tailwindcss';
@import 'uniwind';
@source '../components';  /* Include sibling dirs */
```

## Monorepos & @source

Use `@source` in global.css to include external directories:

```css
@import 'tailwindcss';
@import 'uniwind';

@source '../packages/ui-components';
@source '../packages/shared-components';
```

### When @source is needed

- global.css is nested and components are in sibling/parent dirs
- Shared packages in monorepo workspaces
- Custom UI library outside main app directory
- node_modules packages with Uniwind classes

### When @source is NOT needed

- Components are within the directory containing global.css
- Standard single-app project with global.css at root

## Complete Metro Config Options

```js
module.exports = withUniwindConfig(config, {
  // Required: relative path to CSS entry file
  cssEntryFile: './src/global.css',

  // Optional: custom themes beyond light/dark
  extraThemes: ['ocean', 'sunset', 'premium'],

  // Optional: TypeScript definitions path
  dtsFile: './src/uniwind-types.d.ts',

  // Optional: CSS unit polyfills
  polyfills: {
    rem: 16,  // default 16, NativeWind used 14
  },

  // Optional: enable debug mode (dev only)
  debug: true,  // logs unsupported CSS properties
})
```

### cssEntryFile
- **Required**: relative path string from project root
- Determines the app root for Tailwind scanning
- Never use `path.resolve()` or absolute paths

### extraThemes
- Array of custom theme names
- Each must have matching `@variant` in global.css
- Restart Metro after adding themes

### dtsFile
- Auto-generated TypeScript types for CSS classes
- Place in src/ or app/ for auto-inclusion

### polyfills.rem
- Base font size for rem calculations
- Default: 16 (browser standard)
- Set to 14 when migrating from NativeWind

### debug
- Logs unsupported CSS properties and classNames
- Use during development/migration only
- Disable in production
