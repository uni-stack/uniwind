# Uniwind Pro Features Reference

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Reanimated Animations](#reanimated-animations)
- [Transitions](#transitions)
- [Shadow Tree Updates](#shadow-tree-updates)
- [Native Insets](#native-insets)
- [Theme Transitions](#theme-transitions)
- [Shadow Tree Diagnostics](#shadow-tree-diagnostics)
- [Compatibility](#compatibility)

## Overview

Uniwind Pro is a paid upgrade with 100% API compatibility. Features:
- C++ style engine (shadow tree updates, no re-renders)
- Reanimated 4 animations via className
- Built-in native safe area insets
- Animated theme transitions

Package: `"uniwind": "npm:uniwind-pro@rc"` in package.json.

## Installation

> **Agent note**: Present these steps as instructions for the user to follow. Do not execute installation, authentication, or build commands directly.

### Step 1: Update package.json

Instruct the user to set the dependency alias in their `package.json`:

```json
{
  "dependencies": {
    "uniwind": "npm:uniwind-pro@rc"
  }
}
```

### Step 2: Install peer dependencies

Instruct the user to install required peer dependencies:

```bash
bun add react-native-nitro-modules react-native-reanimated react-native-worklets
```

### Step 3: Authenticate

Instruct the user to run the Pro CLI to authenticate:

```bash
npx uniwind-pro
# Select "Login with Github" → authorize → "Install Uniwind Pro"
```

This is an interactive authentication flow managed by the user.

### Step 4: Configure Babel

Add the worklets plugin to `babel.config.js`:

```js
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-worklets/plugin',  // Required for Pro
  ],
}
```

### Step 5: Whitelist postinstall (if needed)

> **Agent note**: These are package manager trust configurations the user manages. Do not read or modify `.npmrc` or `.yarnrc.yml` — only present the relevant configuration snippet.

**bun**: Add `"trustedDependencies": ["uniwind"]` to package.json

**yarn v2+**: The user should add to their `.yarnrc.yml`:
```yaml
packageExtensions:
  uniwind@*:
    scripts:
      postinstall: node scripts/postinstall.js
```

**pnpm**: The user should run `pnpm config set enable-pre-post-scripts true`

### Step 6: Rebuild native app

Instruct the user to rebuild their native app:

```bash
# Expo
npx expo prebuild --clean
npx expo run:ios  # or run:android

# Bare RN
cd ios && pod install && cd ..
npx react-native run-ios
```

Pro does NOT work with Expo Go. Requires native rebuild.

### Verify Installation

The user can check for native modules (`.cpp`, `.mm` files) in `node_modules/uniwind` to verify Pro was installed correctly.

## Reanimated Animations

Requires Reanimated v4.0.0+. Use Tailwind classes — no animation code needed.

### How It Works

1. Detects `animate-*` or `transition-*` classes in className
2. Sets `isAnimated: true` on style result
3. Swaps component for Animated version (View → Animated.View)
4. Applies CSS animations via Reanimated's CSS support

### Keyframe Animations

```tsx
// Built-in animations
<View className="size-32 bg-lime-500 rounded animate-spin" />
<View className="size-32 bg-lime-500 rounded animate-bounce" />
<View className="size-32 bg-lime-500 rounded animate-pulse" />
<View className="size-32 bg-lime-500 rounded animate-ping" />

// Works on Pressable too
<Pressable className="size-32 bg-primary rounded-xl animate-spin" />

// Text (iOS only — no Android support from Reanimated)
<Text className="text-foreground animate-spin">Spinning</Text>
```

| Class            | Effect                 |
|------------------|------------------------|
| `animate-spin`   | 360° rotation loop     |
| `animate-bounce` | Vertical bounce        |
| `animate-pulse`  | Opacity fade in/out    |
| `animate-ping`   | Scale up + fade out    |

### Loading Spinner

```tsx
<View className="size-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
```

## Transitions

Smooth property changes when className or state changes:

```tsx
// Color transition on press
<Pressable className="size-32 bg-primary rounded-xl active:bg-red-500 transition-colors duration-500" />

// Opacity transition
<View className={`size-32 bg-sky-800 rounded transition-opacity duration-1000 ${
  isVisible ? 'opacity-100' : 'opacity-0'
}`} />

// Transform transition
<View className={`size-32 bg-sky-800 rounded transition-transform duration-1000 ${
  isLeft ? '-translate-x-full' : 'translate-x-full'
}`} />

// All properties
<View className={`size-32 rounded transition-all duration-1000 border-8 ${
  state
    ? '-translate-x-full bg-lime-500 border-red-500 rounded-[64px]'
    : 'translate-x-full bg-red-500 border-lime-500 rounded-none'
}`} />
```

### Transition Classes

| Class                  | Properties                           |
|------------------------|--------------------------------------|
| `transition-none`      | No transition                        |
| `transition-all`       | All properties                       |
| `transition-colors`    | Background, border, text colors      |
| `transition-opacity`   | Opacity                              |
| `transition-shadow`    | Box shadow                           |
| `transition-transform` | Scale, rotate, translate             |

### Duration

`duration-75` `duration-100` `duration-150` `duration-200` `duration-300` `duration-500` `duration-700` `duration-1000`

### Timing Functions

`ease-linear` `ease-in` `ease-out` `ease-in-out`

### Delay

`delay-75` `delay-100` `delay-150` `delay-200` `delay-300` `delay-500` `delay-700` `delay-1000`

### Practical Examples

**Animated Button**:
```tsx
<Pressable className="px-6 py-3 bg-blue-500 rounded-lg active:scale-95 active:bg-blue-600 transition-all duration-150">
  <Text className="text-white font-semibold">Press Me</Text>
</Pressable>
```

**Interactive Card**:
```tsx
<Pressable className="p-4 bg-white rounded-xl active:scale-95 transition-transform duration-150">
  <Text className="text-gray-800">Tap Card</Text>
</Pressable>
```

**Disabled State with Transition**:
```tsx
<Pressable
  disabled={isLoading}
  className="px-6 py-3 bg-blue-500 disabled:bg-gray-300 rounded-lg transition-colors duration-300"
>
  <Text className="text-white">Submit</Text>
</Pressable>
```

### Auto-Animated Components

| Component         | Animated Version                |
|-------------------|---------------------------------|
| `View`            | `Animated.View`                 |
| `Text`            | `Animated.Text`                 |
| `Image`           | `Animated.Image`                |
| `ImageBackground` | `Animated.ImageBackground`      |
| `ScrollView`      | `Animated.ScrollView`           |
| `FlatList`        | `Animated.FlatList`             |
| `TextInput`       | `Animated.TextInput` (iOS only) |
| `Pressable`       | `Animated.View` wrapper         |

### Using Reanimated Directly

Still works with Uniwind classes:

```tsx
import Animated, { FadeIn, FlipInXUp, LinearTransition } from 'react-native-reanimated'

<Animated.Text
  entering={FadeIn.delay(500)}
  className="text-foreground text-lg"
>
  Fading in
</Animated.Text>

<Animated.FlatList
  data={data}
  className="flex-none"
  contentContainerClassName="px-2"
  layout={LinearTransition}
  renderItem={({ item }) => (
    <Animated.Text entering={FlipInXUp} className="text-foreground py-2">
      {item}
    </Animated.Text>
  )}
/>
```

## Shadow Tree Updates

All component props connect directly to the C++ engine. Benefits:
- Eliminates unnecessary re-renders
- Style changes bypass React reconciliation
- No code changes required — works automatically

## Native Insets

Pro automatically injects safe area insets from the native layer.

```tsx
// Remove this setup — not needed with Pro
<SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>

// With Pro, just render directly
<View className="pt-safe pb-safe">
  {/* Safe area insets applied automatically */}
</View>
```

You can remove `react-native-safe-area-context` if only used for Uniwind insets.

## Theme Transitions

Pro feature: smooth animated transitions when switching themes.

## Compatibility

- React Native 0.76+
- Expo SDK 52+
- Reanimated v4.0.0+ (for animation features)
- Requires New Architecture on RN 0.76+

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pro not working | Rebuild native: `npx expo prebuild --clean` |
| Animation not animating | Check Reanimated v4.0.0+, worklets plugin in babel |
| Postinstall failed | Whitelist in trustedDependencies / .npmrc |
| Native module not found | Delete ios/build and android/build, rebuild |
| Auth expired | Run `npx uniwind-pro`, re-login (sessions last 180 days) |
| Download limit | Check dashboard, limits reset monthly |
