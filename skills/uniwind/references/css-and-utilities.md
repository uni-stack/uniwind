## CSS Functions

Uniwind provides CSS functions for device-aware and theme-aware styling. These can be used everywhere (custom CSS classes, `@utility`, etc.) — but NOT inside `@theme {}`, which only accepts static values and color functions with `var()` channels (see [OKLCH colors](./theming.md#oklch-colors-support)). The exception is `platform-color()`, which also works in `@theme` color variables. Use `@utility` to create reusable Tailwind-style utility classes:

### hairlineWidth()

Returns the thinnest line width displayable on the device. Use for subtle borders and dividers.

```css
@utility h-hairline { height: hairlineWidth(); }
@utility border-hairline { border-width: hairlineWidth(); }
@utility w-hairline { width: calc(hairlineWidth() * 10); }
```

```tsx
<View className="h-hairline bg-gray-300" />
<View className="border-hairline border-gray-200 rounded-lg p-4" />
```

### fontScale(multiplier?)

Multiplies a base value by the device's font scale accessibility setting. Ensures text respects user preferences for larger or smaller text.

- **`fontScale()`** — uses multiplier 1 (device font scale × 1)
- **`fontScale(0.9)`** — smaller scale
- **`fontScale(1.2)`** — larger scale

```css
@utility text-sm-scaled { font-size: fontScale(0.9); }
@utility text-base-scaled { font-size: fontScale(); }
@utility text-lg-scaled { font-size: fontScale(1.2); }
```

```tsx
<Text className="text-sm-scaled text-gray-600">Small accessible text</Text>
<Text className="text-base-scaled">Regular accessible text</Text>
```

### pixelRatio(multiplier?)

Multiplies a value by the device's pixel ratio. Creates pixel-perfect designs that scale across screen densities.

- **`pixelRatio()`** — uses multiplier 1 (device pixel ratio × 1)
- **`pixelRatio(2)`** — double the pixel ratio

```css
@utility w-icon { width: pixelRatio(); }
@utility w-avatar { width: pixelRatio(2); }
```

```tsx
<Image source={{ uri: 'avatar.png' }} className="w-avatar rounded-full" />
```

### light-dark(lightValue, darkValue)

Returns different values based on the current theme mode. Automatically adapts when the theme changes — no manual switching logic needed.

- First parameter: value for light theme
- Second parameter: value for dark theme

```css
@utility bg-adaptive { background-color: light-dark(#ffffff, #1f2937); }
@utility text-adaptive { color: light-dark(#111827, #f9fafb); }
@utility border-adaptive { border-color: light-dark(#e5e7eb, #374151); }
```

```tsx
<View className="bg-adaptive border-adaptive border rounded-lg p-4">
  <Text className="text-adaptive">Adapts to light/dark theme</Text>
</View>
```

Also works in custom CSS classes (not just `@utility`):

```css
.adaptive-card {
  background-color: light-dark(#ffffff, #1f2937);
  color: light-dark(#111827, #f9fafb);
}
```

### platform-color(name..., fallback) (Uniwind 1.14.0+ / Pro 1.10.0+)

Uses a system color through React Native's `PlatformColor`, with a fallback for other platforms and for web.

- A name starting with `?` or `@` is an **Android resource** (`?attr/colorPrimary`, `?android:attr/textColorPrimary`, `@android:color/holo_blue_light`)
- Any other name is an **iOS semantic color** (`label`, `systemBlue`)
- With two or more arguments, the **last one is the fallback** — any color or a `var()`

```css
@theme {
  --color-system-label: platform-color(label, ?android:attr/textColorPrimary, #000000);
  --color-system-blue: platform-color(systemBlue, @android:color/holo_blue_light, #007aff);
}

@utility bg-accent-system {
  background-color: platform-color(systemBlue, ?attr/colorPrimary, #007aff);
}
```

```tsx
<View className="bg-accent-system p-4">
  <Text className="text-system-label">Follows the system label color</Text>
</View>
```

- On a platform with no matching name, and on web, the fallback is the whole color
- From React Native 0.88 the fallback is also passed to `PlatformColor`, so iOS uses it when a semantic color doesn't exist
- On Android, classes that use `platform-color()` are applied again after theme and OS appearance changes, so theme attributes and `values-night` colors stay in sync
- **A missing Android resource crashes the app** from React Native 0.88, even with a fallback (below 0.88 it draws nothing). Only use resources your app or Android provides
- Attributes that hold a color state list (e.g. `?android:attr/textColorPrimary`) draw nothing before React Native 0.89

### min() / max() (Uniwind 1.10.0+ / Pro 1.5.0+)

`min()` returns the smallest of its arguments, `max()` the largest. Use them to cap or floor a size, e.g. a width that follows the screen but never grows past a fixed value.

```css
@utility w-card { width: min(90vw, 480px); }
@utility h-header { height: min(25vh, 12rem); }
```

Because they are standard CSS functions, they also work in arbitrary values:

```tsx
<View className="w-[min(90vw,480px)] min-h-[max(50vh,320px)]" />
```

- Arguments can be `px`, `rem`, `vw` and `vh` lengths, plain numbers, and other functions such as `min()` / `max()`, `calc()`, `pixelRatio()` and `fontScale()`
- **Percentages are not supported** inside `min()` / `max()`

### clamp() — not supported on native

`clamp()` has no native implementation. It only works when every argument is a constant, because Lightning CSS folds it at build time (`clamp(10px, 50px, 30px)` → `30px`). With a runtime value such as `vw` or `vh`, the declaration is dropped on native. Nest `min()` and `max()` instead:

```css
/* clamp(100px, 50vw, 300px) */
@utility w-fluid { width: min(max(100px, 50vw), 300px); }
```

```tsx
<View className="w-[min(max(100px,50vw),300px)]" />
```

## Custom CSS & Utilities

### Custom CSS Classes

Uniwind supports custom CSS class names defined in `global.css`. They are compiled at build time — no runtime overhead. Use them when you need styles that are hard to express as Tailwind utilities (e.g., complex box-shadow, multi-property bundles).

```css
/* global.css */
.card-shadow {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.adaptive-surface {
  background-color: light-dark(#ffffff, #1f2937);
  color: light-dark(#111827, #f9fafb);
}

.container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
}
```

Apply via `className` just like any Tailwind class:

```tsx
<View className="card-shadow" />
```

### Mixing Custom CSS with Tailwind

You can combine custom CSS classes with Tailwind utilities in a single `className`:

```tsx
<View className="card-shadow p-4 m-2">
  <Text className="adaptive-surface mb-2">{title}</Text>
  <View className="container flex-row">{children}</View>
</View>
```

**Conflicts follow the CSS cascade** (Uniwind 1.13.0+ / Pro 1.9.0+). When a custom class and a Tailwind utility set the **same property**, native resolves it the same way the browser does: `!important` first, then cascade layer, then selector specificity, then order in the compiled CSS. The order of classes inside `className` does not matter.

Tailwind utilities are emitted in `@layer utilities`. For normal (non-`!important`) declarations, unlayered CSS beats layered CSS, so a custom class written at the top level of `global.css` overrides utilities (for `!important` declarations the layer order is reversed):

```css
/* global.css */
.card-shadow {
  border-radius: 12px; /* unlayered: beats rounded-2xl */
}
```

```tsx
// .card-shadow wins, border-radius is 12px (same result for "rounded-2xl card-shadow")
<View className="card-shadow rounded-2xl" />

// cn() does NOT help here: tailwind-merge doesn't know `card-shadow`, so both classes stay
<View className={cn('card-shadow', 'rounded-2xl')} />
```

To make a custom class a base that utilities can override, put it in `@layer components`:

```css
/* global.css */
@layer components {
  .card-shadow {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
```

```tsx
// rounded-2xl wins, border-radius is 16px
<View className="card-shadow rounded-2xl" />
```

**Rule of thumb**: Put reusable custom classes in `@layer components` so consumers can override them with utilities. Keep a class unlayered only when it must win over utilities. Use `!` (`rounded-2xl!`) to force a single utility over an unlayered class.

### Guidelines for Custom CSS

- Keep selectors flat — no deep nesting or child selectors
- Prefer Tailwind utilities for simple, single-property styles
- Use custom classes for complex or multi-property bundles that would be verbose in className
- Use `light-dark()` for theme-aware custom classes
- Use `platform-color()` for OS system colors (iOS semantic colors, Android resources) with a fallback
- Custom classes are great for shared design tokens that don't fit Tailwind's naming (e.g., `.card`, `.chip`, `.badge-dot`)

### Custom Utilities (@utility)

The `@utility` directive creates utility classes that work exactly like built-in Tailwind classes. Three main use cases:

#### 1. Variable-driven utilities (runtime-injected values)

Create a utility whose value comes from a CSS variable injected at runtime via `updateCSSVariables`. Use `@theme static` to declare the variable so Uniwind tracks it even before it is updated:

```css
/* global.css */
@theme static {
  --header-height: 0px;
}

@utility p-safe-header {
  padding-top: var(--header-height);
}
```

Inject the real value at runtime (e.g., from react-navigation's layout event):

```tsx
import { Uniwind } from 'uniwind'

// e.g., inside a navigation layout listener
Uniwind.updateCSSVariables(Uniwind.currentTheme, {
  '--header-height': headerHeight,
})
```

```tsx
<View className="p-safe-header flex-1" />
```

#### 2. Brand-new utilities (no Tailwind equivalent)

For styles that have no built-in Tailwind class:

```css
@utility h-hairline { height: hairlineWidth(); }
@utility text-scaled { font-size: fontScale(); }
@utility card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

Usage like any Tailwind class: `<View className="h-hairline card-shadow" />`

#### 3. Overriding existing Tailwind utilities

Use `@utility` to completely replace what a built-in class does. Example: make `border` always use `--color-primary`:

```css
@utility border {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-primary);
}
```

## @theme Directive

Customize Tailwind design tokens in `global.css`:

```css
@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;

  /* Typography */
  --font-sans: 'Roboto-Regular';
  --font-sans-medium: 'Roboto-Medium';
  --font-sans-bold: 'Roboto-Bold';
  --font-mono: 'FiraCode-Regular';

  /* Spacing & sizing */
  --text-base: 15px;
  --spacing-4: 16px;
  --radius-lg: 12px;

  /* Breakpoints */
  --breakpoint-tablet: 820px;
}
```

Usage: `bg-brand-500`, `text-brand-900`, `font-sans`, `font-mono`, `rounded-lg`.

## Fonts

React Native requires a **single font** per family — no fallbacks:

```css
@theme {
  --font-sans: 'Roboto-Regular';
  --font-sans-bold: 'Roboto-Bold';
  --font-mono: 'FiraCode-Regular';
}
```

Font name must **exactly match** the font file name (without extension).

**Expo**: Configure fonts in `app.json` with the `expo-font` plugin, then reference in CSS.

**Bare RN**: Use `react-native-asset` to link fonts, same CSS config.

**Platform-specific fonts** (use `@variant`, not `@media`):

```css
@layer theme {
  :root {
    @variant ios { --font-sans: 'SF Pro Text'; }
    @variant android { --font-sans: 'Roboto-Regular'; }
    @variant web { --font-sans: 'system-ui'; }
  }
}
```

## Drop Shadow Filter (Uniwind 1.12.0+ / Pro 1.7.0+)

Tailwind's `drop-shadow-*` utilities compile to React Native's `filter` style, with preset sizes, arbitrary values and color modifiers, and combine with other filters like `blur-*`:

```tsx
<View className="drop-shadow-md" />
<View className="drop-shadow-lg drop-shadow-red-500" />
<View className="drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]" />
<View className="blur-sm drop-shadow-lg" />
```

- Unlike `shadow-*` (React Native `boxShadow`), `drop-shadow-*` follows the rendered shape of the view and its children
- **Android**: rendered with `RenderEffect`, so it needs Android 12 (API 31)+. Below that the whole filter chain of the element is dropped, not just the drop shadow
- **iOS**: React Native gates `drop-shadow` (and `blur`, `grayscale`, `saturate`, `contrast`, `hue-rotate`) behind the `enableSwiftUIBasedFilters` flag, off at the stable release level. Opt in with `RCTReactNativeFactory(delegate: delegate, releaseLevel: .Canary)` on RN 0.87+ or `.Experimental` on RN 0.83 - 0.86. The release level also enables other React Native flags, so test before shipping
- `backdrop-blur-*` / `backdrop-filter` are ignored on native

## Gradients

Built-in support — no extra dependencies:

```tsx
<View className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 p-4 rounded-lg">
  <Text className="text-white font-bold">Gradient</Text>
</View>
```

For `expo-linear-gradient`, you can wrap it with `withUniwind` for className-based layout and styling (padding, border-radius, flex, etc.), but the `colors` prop is an array that cannot be resolved via className — it must be provided explicitly. Use `useCSSVariable` to get theme-aware colors:

```tsx
import { useCSSVariable } from 'uniwind';
import { withUniwind } from 'uniwind';
import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

const LinearGradient = withUniwind(RNLinearGradient);

function GradientCard() {
  // useCSSVariable returns string | number | undefined
  const primary = useCSSVariable('--color-primary');
  const secondary = useCSSVariable('--color-secondary');

  // Guard against undefined — LinearGradient.colors requires valid ColorValues
  if (!primary || !secondary) {
    return null;
  }

  return (
    <LinearGradient
      className="flex-1 rounded-2xl p-6"
      colors={[primary as string, secondary as string]}
    >
      <Text className="text-white font-bold">Themed gradient</Text>
    </LinearGradient>
  );
}
```

Alternatively, export a wrapped component from a shared module for reuse:

```tsx
// components/styled.ts
import { withUniwind } from 'uniwind';
import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

export const LinearGradient = withUniwind(RNLinearGradient);
```

```tsx
// usage — className handles layout, colors still passed manually
import { LinearGradient } from '@/components/styled';

<LinearGradient className="rounded-xl p-4" colors={['#ff6b6b', '#4ecdc4']}>
  <Text className="text-white">Static gradient</Text>
</LinearGradient>
```
