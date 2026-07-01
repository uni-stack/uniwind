## Uniwind Pro

Paid upgrade with 100% API compatibility. Built on a 2nd-generation C++ engine for apps that demand the best performance. Graduated pricing (billed annually): **$99/seat** (1-3), **$49** (4-6), **$29** (7-15), **$1** (16+). Pricing and licensing: [https://uniwind.dev/pricing](https://uniwind.dev/pricing)

### Pricing & Licensing

- **Graduated per-seat pricing** (billed annually, VAT excluded unless applicable): $99 for seats 1-3, $49 for 4-6, $29 for 7-15, $1 for 16+
- **Individual License**: Personal Pro license per engineer
- **Team License**: Single key management — add or remove members instantly
- **CI/CD License**: Full support for automated and headless build environments
- **Enterprise**: Custom plans available (contact support@uniwind.dev)
- **Priority Support**: Critical issues resolved with priority response times

### Overview

- **C++ style engine**: Forged on the 2nd-gen Unistyles C++ engine. Injects styles directly into the ShadowTree without triggering React re-renders — a direct, optimized highway between classNames and the native layer
- **Performance**: Benchmarked at ~55ms (vs StyleSheet 49ms, traditional Uniwind 81ms, NativeWind 197ms) — near-native speed
- **55+ className props** update without re-renders across 20 components (all component bindings listed above)
- **Reanimated animations**: `animate-*` and `transition-*` via className (Reanimated v4)
- **Native insets & runtime values**: Automatic safe area injection, device rotation, and font size updates — no `SafeAreaListener` setup needed
- **Theme transitions**: Native animated transitions when switching themes (fade, slide, circle mask)
- **Group variants**: Tailwind `group-active:*` / `group-focus:*` propagate parent interaction state through the C++ shadow tree with zero re-renders
- **Default styles**: Experimental `1.2.0+` feature for styling default React Native components from CSS selectors like `View { ... }` and `Text { ... }`
- **Priority support**: Don't let technical hurdles slow your team down

Package: `"uniwind": "npm:uniwind-pro@latest"` in `package.json`.

### Installation

1. Set dependency alias in `package.json`:
   ```json
   { "dependencies": { "uniwind": "npm:uniwind-pro@latest" } }
   ```

2. Install peer dependencies:
   ```bash
   npm install react-native-nitro-modules react-native-reanimated react-native-worklets
   ```

3. Authenticate: `npx uniwind-pro` (interactive — select "Login with GitHub")

4. Add Babel plugin — APPEND `react-native-worklets/plugin` to your existing `plugins` array. Do NOT replace your presets (keep `babel-preset-expo` for Expo, or your bare-RN preset):
   ```js
   // babel.config.js
   module.exports = {
     // your existing presets and config — leave untouched
     plugins: [
       // ...other plugins
       'react-native-worklets/plugin',
     ],
   };
   ```
   If you already use Reanimated, you may already have the worklets plugin configured.

5. Whitelist postinstall if needed:
   - **bun**: Add `"trustedDependencies": ["uniwind"]` to `package.json`
   - **yarn v2+**: Configure in `.yarnrc.yml`
   - **pnpm**: `pnpm config set enable-pre-post-scripts true`

6. Rebuild native app:
   ```bash
   npx expo prebuild --clean && npx expo run:ios
   ```

Pro does **NOT** work with Expo Go. Requires native rebuild.

**Verify installation**: Check for native modules (`.cpp`, `.mm` files) in `node_modules/uniwind`.

### Reanimated Animations (Requires Reanimated v4.0.0+)

```tsx
<View className="size-32 bg-primary rounded animate-spin" />
<View className="size-32 bg-primary rounded animate-bounce" />
<View className="size-32 bg-primary rounded animate-pulse" />
<View className="size-32 bg-primary rounded animate-ping" />

// Loading spinner
<View className="size-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
```

Custom keyframe animations beyond Tailwind defaults:

| Class | Description |
|-------|-------------|
| `animate-wiggle` | Rotational wiggle |
| `animate-shake` | Horizontal shake |
| `animate-flash` | Opacity flash on/off |
| `animate-rubber-band` | Elastic scale stretch |
| `animate-swing` | Pendulum swing |
| `animate-tada` | Scale + rotate attention seeker |
| `animate-heartbeat` | Double-pulse heartbeat |
| `animate-jello` | Rotational jello wobble |
| `animate-float` | Gentle vertical float |
| `animate-breathe` | Subtle breathing scale |
| `animate-tilt` | Alternating tilt rotation |
| `animate-glitch` | Rapid horizontal jitter |

Components auto-swap to Animated versions when animation classes detected:

| Component | Animated Version |
|-----------|------------------|
| `View` | `Animated.View` |
| `Text` | `Animated.Text` |
| `Image` | `Animated.Image` |
| `ImageBackground` | `Animated.ImageBackground` |
| `ScrollView` | `Animated.ScrollView` |
| `FlatList` | `Animated.FlatList` |
| `TextInput` | `Animated.TextInput` |
| `Pressable` | `Animated.Pressable` |

### Entering & Exiting Animations

Drive Reanimated's entering/exiting animations via className — no Reanimated imports needed. Components auto-upgrade when `uw-*` classes are detected.

```tsx
// Bounce in, bounce out
{visible && <View className="size-20 bg-primary rounded-xl uw-entering-bounce-in uw-exiting-bounce-out" />}

// Fade in slowly (1000ms)
{visible && <View className="size-20 bg-primary rounded-xl uw-entering-fade-in uw-entering-duration-1000 uw-exiting-fade-out" />}
```

**Entering presets**: `uw-entering-fade-in` `uw-entering-fade-in-right` `uw-entering-fade-in-left` `uw-entering-fade-in-up` `uw-entering-fade-in-down` `uw-entering-slide-in-right` `uw-entering-slide-in-left` `uw-entering-slide-in-up` `uw-entering-slide-in-down` `uw-entering-zoom-in` `uw-entering-zoom-in-rotate` `uw-entering-zoom-in-left` `uw-entering-zoom-in-right` `uw-entering-zoom-in-up` `uw-entering-zoom-in-down` `uw-entering-zoom-in-easy-up` `uw-entering-zoom-in-easy-down` `uw-entering-bounce-in` `uw-entering-bounce-in-down` `uw-entering-bounce-in-up` `uw-entering-bounce-in-left` `uw-entering-bounce-in-right` `uw-entering-flip-in-x-up` `uw-entering-flip-in-x-down` `uw-entering-flip-in-y-left` `uw-entering-flip-in-y-right` `uw-entering-flip-in-easy-x` `uw-entering-flip-in-easy-y` `uw-entering-stretch-in-x` `uw-entering-stretch-in-y` `uw-entering-rotate-in-down-left` `uw-entering-rotate-in-down-right` `uw-entering-rotate-in-up-left` `uw-entering-rotate-in-up-right` `uw-entering-roll-in-left` `uw-entering-roll-in-right` `uw-entering-pinwheel-in` `uw-entering-light-speed-in-right` `uw-entering-light-speed-in-left`

**Exiting presets**: `uw-exiting-fade-out` `uw-exiting-fade-out-right` `uw-exiting-fade-out-left` `uw-exiting-fade-out-up` `uw-exiting-fade-out-down` `uw-exiting-slide-out-right` `uw-exiting-slide-out-left` `uw-exiting-slide-out-up` `uw-exiting-slide-out-down` `uw-exiting-zoom-out` `uw-exiting-zoom-out-rotate` `uw-exiting-zoom-out-left` `uw-exiting-zoom-out-right` `uw-exiting-zoom-out-up` `uw-exiting-zoom-out-down` `uw-exiting-zoom-out-easy-up` `uw-exiting-zoom-out-easy-down` `uw-exiting-bounce-out` `uw-exiting-bounce-out-down` `uw-exiting-bounce-out-up` `uw-exiting-bounce-out-left` `uw-exiting-bounce-out-right` `uw-exiting-flip-out-x-up` `uw-exiting-flip-out-x-down` `uw-exiting-flip-out-y-left` `uw-exiting-flip-out-y-right` `uw-exiting-flip-out-easy-x` `uw-exiting-flip-out-easy-y` `uw-exiting-stretch-out-x` `uw-exiting-stretch-out-y` `uw-exiting-rotate-out-down-left` `uw-exiting-rotate-out-down-right` `uw-exiting-rotate-out-up-left` `uw-exiting-rotate-out-up-right` `uw-exiting-roll-out-left` `uw-exiting-roll-out-right` `uw-exiting-pinwheel-out` `uw-exiting-light-speed-out-right` `uw-exiting-light-speed-out-left`

**Animation modifiers** (pattern: `uw-{entering|exiting|layout}-{modifier}`):
- Duration: `uw-{type}-duration-75` `uw-{type}-duration-100` ... `uw-{type}-duration-1000` or arbitrary `uw-{type}-duration-{ms}`
- Delay: `uw-{type}-delay-75` ... `uw-{type}-delay-1000` or arbitrary `uw-{type}-delay-{ms}`
- Easing: `uw-{type}-ease-linear` `uw-{type}-ease-in` `uw-{type}-ease-out` `uw-{type}-ease-in-out` `uw-{type}-ease-bounce`
- Spring: `uw-{type}-springify` `uw-{type}-damping-{value}` `uw-{type}-stiffness-{value}` `uw-{type}-mass-{value}`

### Layout Transitions

Animate position/size changes when siblings are added or removed:

```tsx
<View className="w-full gap-2">
  {items.map(item => (
    <View key={item.id} className={`h-14 ${item.color} rounded-xl uw-entering-fade-in uw-exiting-fade-out uw-layout-linear-transition`} />
  ))}
</View>
```

| Class | Description |
|-------|-------------|
| `uw-layout-linear-transition` | Smooth linear repositioning |
| `uw-layout-fading-transition` | Fade during repositioning |
| `uw-layout-jumping-transition` | Bouncy jump to new position |
| `uw-layout-curved-transition` | Curved path repositioning |
| `uw-layout-sequenced-transition` | Sequenced repositioning |
| `uw-layout-entry-exit-transition` | Combined entry/exit during layout |

### Transitions

Smooth property changes when className or state changes:

```tsx
// Color transition on press
<Pressable className="bg-primary active:bg-red-500 transition-colors duration-300" />

// Opacity transition
<View className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} />

// Transform transition
<Pressable className="active:scale-95 transition-transform duration-150" />

// All properties
<Pressable className="bg-primary px-6 py-3 rounded-lg active:scale-95 active:bg-primary/80 transition-all duration-150">
  <Text className="text-white font-semibold">Animated Button</Text>
</Pressable>
```

| Class | Properties |
|-------|------------|
| `transition-none` | No transition |
| `transition-all` | All properties |
| `transition-colors` | Background, border, text colors |
| `transition-opacity` | Opacity |
| `transition-shadow` | Box shadow |
| `transition-transform` | Scale, rotate, translate |

Duration: `duration-75` `duration-100` `duration-150` `duration-200` `duration-300` `duration-500` `duration-700` `duration-1000`

Easing: `ease-linear` `ease-in` `ease-out` `ease-in-out`

Delay: `delay-75` `delay-100` `delay-150` `delay-200` `delay-300` `delay-500` `delay-700` `delay-1000`

### Using Reanimated Directly

Still works with Uniwind classes:

```tsx
import Animated, { FadeIn, FlipInXUp, LinearTransition } from 'react-native-reanimated';

<Animated.Text entering={FadeIn.delay(500)} className="text-foreground text-lg">
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

### Shadow Tree Updates

No code changes needed — props connect directly to C++ engine, eliminating re-renders automatically.

### Shadow Tree Diagnostics

Development-only API to observe what the C++ engine is doing — when components register/unregister with the shadow tree and how styles flow through it. Import from `uniwind/diagnostics`:

```tsx
import { enableDiagnostics } from 'uniwind/diagnostics';

enableDiagnostics({
  reportMounts: true,    // log when components register with the shadow tree
  reportUnmounts: true,  // log when components unregister
  reportUpdates: true,   // log style updates with property-level detail
});
```

All three options default to `false` — enable only what you need (logging everything on a complex screen gets noisy). Update logs are grouped into 🔥 C++ updates (applied via the shadow tree) and ✨ Native updates (props set directly on native views) — both happen with zero React re-renders.

Use for: debugging theme switches (`reportUpdates`), detecting memory leaks (mount/unmount counts should return to zero when navigating away), and verifying zero re-renders.

Platform support: full diagnostics on iOS and Android. On Web, `enableDiagnostics` is a no-op stub that produces no output.

### Group Variants

Tailwind `group` variants propagate parent interaction state to descendants through the C++ shadow tree. No re-renders, no context providers.

```tsx
// Basic group — descendants react to parent press
<Pressable className="group p-4 bg-base rounded-xl">
  <Text className="text-default group-active:text-primary">Press the card</Text>
  <View className="size-8 bg-blue-500 rounded group-active:bg-red-500" />
</Pressable>

// Named groups — descendants pick which ancestor to follow
<Pressable className="group/card p-4 bg-base rounded-xl">
  <Pressable className="group/button px-3 py-1 bg-primary rounded">
    <Text className="text-white group-active/card:opacity-50 group-active/button:font-bold">
      Nested groups
    </Text>
  </Pressable>
</Pressable>
```

**Supported variants**: `group-active:*` (press), `group-focus:*` (focus). Named variants: `group-active/{name}:*`, `group-focus/{name}:*`.

**Supported group parents**: `Pressable` (press + focus), `Text` (press — requires `onPress`, even empty). `TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback`, and `TextInput` do **not** act as group parents — wrap in a `Pressable` marked `group`.

**Not supported**: `group-hover:*` (no pointer hover on native), `group-disabled:*` (parsed but no shadow tree trigger), arbitrary `group-[.selector]:*` variants, implicit `in-*` variants.

### Default Styles (Pro 1.2.0+, Experimental)

Default styles let Pro users define baseline styles for built-in React Native components directly in CSS. They are disabled by default and require an experimental flag.

```js
// metro.config.js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  experimental: {
    defaultStyles: true,
  },
});
```

```css
/* global.css */
View {
  border-color: var(--color-primary);
}

Text {
  font-family: Inter;
  font-size: 16px;
}
```

Effect: every `View` gets `border-color: var(--color-primary)`, every `Text` gets `font-family: Inter` and `font-size: 16px`, unless more specific styles override them.

Rules:
- Available only in Uniwind Pro `1.2.0+`
- Disabled by default; enable `experimental.defaultStyles: true`
- Experimental; may not work for every use case and may change in future releases
- Use React Native component names as selectors, not HTML tags
- Treat as baseline styles; direct `className` styles can override them

Supported component selectors: `ActivityIndicator`, `FlatList`, `Image`, `ImageBackground`, `InputAccessoryView`, `KeyboardAvoidingView`, `Modal`, `Pressable`, `RefreshControl`, `SafeAreaView`, `ScrollView`, `SectionList`, `Switch`, `Text`, `TextInput`, `TouchableHighlight`, `TouchableNativeFeedback`, `TouchableOpacity`, `TouchableWithoutFeedback`, `View`, `VirtualizedList`.

### Suspense Support

Components inside React `Suspense` boundaries are handled correctly. While a subtree is suspended, Uniwind keeps the C++ shadow entries alive so theme updates and runtime changes (dark mode, orientation, etc.) still reach suspended nodes. When the tree unsuspends, styles are already up to date — no flash of stale theme.

### Native Insets

Remove `SafeAreaListener` setup — insets injected from native layer:

```tsx
// With Pro — just use safe area classes directly
<View className="pt-safe pb-safe">{/* content */}</View>
```

### Theme Transitions (Pro)

Native animated transitions when switching themes. Supported on iOS, Android, and Web.

```tsx
import { Uniwind, ThemeTransitionPreset } from 'uniwind';

// Fade transition
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.Fade });

// Slide transitions
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.SlideRightToLeft });
Uniwind.setTheme('light', { preset: ThemeTransitionPreset.SlideLeftToRight });

// Circle mask transitions (expand from a corner or center)
Uniwind.setTheme('ocean', { preset: ThemeTransitionPreset.CircleCenter });

// Blur transitions
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.Blur });
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.BlurRightToLeft });

// No animation
Uniwind.setTheme('light');
```

Available presets:

| Preset | Effect |
|--------|--------|
| `ThemeTransitionPreset.None` | Instant switch, no animation |
| `ThemeTransitionPreset.Fade` | Crossfade between themes |
| `ThemeTransitionPreset.SlideRightToLeft` | Slide new theme in from right |
| `ThemeTransitionPreset.SlideLeftToRight` | Slide new theme in from left |
| `ThemeTransitionPreset.CircleTopRight` | Circle mask expanding from top-right |
| `ThemeTransitionPreset.CircleTopLeft` | Circle mask expanding from top-left |
| `ThemeTransitionPreset.CircleBottomRight` | Circle mask expanding from bottom-right |
| `ThemeTransitionPreset.CircleBottomLeft` | Circle mask expanding from bottom-left |
| `ThemeTransitionPreset.CircleCenter` | Circle mask expanding from center |
| `ThemeTransitionPreset.Blur` | Blur out animation |
| `ThemeTransitionPreset.BlurRightToLeft` | Directional blur from right to left |
| `ThemeTransitionPreset.BlurLeftToRight` | Directional blur from left to right |
