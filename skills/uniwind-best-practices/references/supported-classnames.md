# Supported ClassNames & Responsive Breakpoints

## Table of Contents
- [Supported ClassNames Overview](#supported-classnames-overview)
- [Standard Tailwind Classes](#standard-tailwind-classes)
- [Platform-Specific Variants](#platform-specific-variants)
- [Safe Area Classes](#safe-area-classes)
- [Data Selectors](#data-selectors)
- [Work in Progress](#work-in-progress)
- [Unsupported Classes](#unsupported-classes)
- [Responsive Breakpoints Detailed Guide](#responsive-breakpoints-detailed-guide)

## Supported ClassNames Overview

React Native uses the Yoga layout engine, not browser CSS. Key differences:

- **No CSS cascade/inheritance**: Styles don't inherit from parent components
- **Flexbox by default**: All views use `flexbox` with `flexDirection: 'column'` by default
- **Limited CSS properties**: Only a subset of CSS is supported (no floats, grid, pseudo-elements, etc.)
- **Different units**: No `em` or percentage-based units for most properties

Most Tailwind classes just work. If a class name isn't listed below as unsupported or with special behavior, assume Uniwind fully supports it.

## Standard Tailwind Classes

All standard Tailwind utility classes are supported:

- **Layout**: `container`, `flex`, `block`, `hidden`, etc.
- **Spacing**: `p-*`, `m-*`, `space-*`, `gap-*`
- **Sizing**: `w-*`, `h-*`, `min-w-*`, `max-w-*`, `size-*`, etc.
- **Typography**: `text-*`, `font-*`, `leading-*`, `tracking-*`, etc.
- **Colors**: `bg-*`, `text-*`, `border-*`, `shadow-*`, etc.
- **Borders**: `border-*`, `rounded-*`, `ring-*`
- **Effects**: `shadow-*`, `opacity-*`
- **Flexbox**: `justify-*`, `items-*`, `content-*`, `flex-*`, etc.
- **Positioning**: `absolute`, `relative`, `top-*`, `left-*`, `inset-*`, etc.
- **Transforms**: `translate-*`, `rotate-*`, `scale-*`, `skew-*`
- **Interactive states**: `focus:`, `active:`, `disabled:`

## Platform-Specific Variants

```tsx
<View className="ios:bg-blue-500" />
<View className="android:bg-green-500" />
<View className="web:bg-red-500" />
<View className="native:bg-purple-500" />  // iOS + Android
```

## Safe Area Classes

Safe area utilities for handling device notches, home indicators, and status bars:

### Padding

| Class | Description |
|-------|-------------|
| `p-safe` | Padding on all sides based on safe area insets |
| `pt-safe` | Padding top |
| `pb-safe` | Padding bottom |
| `pl-safe` | Padding left |
| `pr-safe` | Padding right |
| `px-safe` | Padding horizontal |
| `py-safe` | Padding vertical |

### Margin

| Class | Description |
|-------|-------------|
| `m-safe` | Margin on all sides based on safe area insets |
| `mt-safe` | Margin top |
| `mb-safe` | Margin bottom |
| `ml-safe` | Margin left |
| `mr-safe` | Margin right |
| `mx-safe` | Margin horizontal |
| `my-safe` | Margin vertical |

### Positioning

| Class | Description |
|-------|-------------|
| `inset-safe` | Inset on all sides |
| `top-safe` | Top position |
| `bottom-safe` | Bottom position |
| `left-safe` | Left position |
| `right-safe` | Right position |
| `x-safe` | Horizontal inset |
| `y-safe` | Vertical inset |

### Compound Safe Area Classes

| Pattern | Behavior |
|---------|----------|
| `{property}-safe-or-{value}` | `Math.max(inset, value)` — ensures minimum spacing |
| `{property}-safe-offset-{value}` | `inset + value` — adds extra spacing on top of inset |

Examples:
```tsx
<View className="pt-safe-or-4" />       // max(topInset, 16px)
<View className="pb-safe-offset-4" />   // bottomInset + 16px
```

### Setup Requirements

**Free version**: Requires `react-native-safe-area-context` with `SafeAreaListener`:

```tsx
import { SafeAreaListener } from 'react-native-safe-area-context'
import { Uniwind } from 'uniwind'

export const Root = () => (
  <SafeAreaListener
    onChange={({ insets }) => {
      Uniwind.updateInsets(insets)
    }}
  >
    {/* app content */}
  </SafeAreaListener>
)
```

**Pro version**: Automatically injected from native layer — no setup needed.

## Data Selectors

Supported with `data-[prop=value]:utility` syntax:

```tsx
<View
  data-state={isOpen ? 'open' : 'closed'}
  className="data-[state=open]:bg-blue-500 data-[state=closed]:bg-transparent"
/>
```

Only equality checks supported. See [Data Selectors in components-styling.md](components-styling.md#data-selectors) for full docs.

## Work in Progress

| Class | Status | Notes |
|-------|--------|-------|
| `group-*` | WIP | Group variants for parent-child styling |
| `grid-*` | WIP | CSS Grid support being added by React Native / Expo team |

## Unsupported Classes

Web-specific classes with no React Native equivalent (will be silently ignored):

- **Pseudo-classes**: `hover:*`, `visited:*` (use Pressable states instead)
- **Pseudo-elements**: `before:*`, `after:*`, `placeholder:*`
- **Media queries**: `print:*`, `screen:*`
- **Float & Clear**: `float-*`, `clear-*`
- **Break**: `break-before-*`, `break-after-*`, `break-inside-*`
- **Columns**: `columns-*`
- **Some aspect ratios**: Limited support for certain variants

For interactive states like hover, use `Pressable` with `active:` state classes.

## Responsive Breakpoints Detailed Guide

### Default Breakpoints

| Breakpoint | Min Width | CSS | Typical Device |
|------------|-----------|-----|----------------|
| `sm` | 640px | `@media (min-width: 640px)` | Large phones |
| `md` | 768px | `@media (min-width: 768px)` | Tablets |
| `lg` | 1024px | `@media (min-width: 1024px)` | Landscape tablets |
| `xl` | 1280px | `@media (min-width: 1280px)` | Desktops |
| `2xl` | 1536px | `@media (min-width: 1536px)` | Large desktops |

Mobile-first: unprefixed utilities apply to all sizes, prefixed apply at breakpoint and above.

### Basic Usage

```tsx
import { View, Text } from 'react-native'

export const ResponsiveCard = () => (
  <View className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg">
    <Text className="text-base sm:text-lg lg:text-xl font-bold">
      Responsive Typography
    </Text>
    <Text className="text-sm sm:text-base lg:text-lg text-gray-600">
      This text size adapts to screen width
    </Text>
  </View>
)
```

### Mobile-First Design

```tsx
// CORRECT — mobile-first
<View className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3" />

// WRONG — desktop-first
<View className="w-full lg:w-1/2 md:w-3/4 sm:w-full" />
```

### Responsive Grid

```tsx
<View className="flex-row flex-wrap">
  {/* 1 col mobile, 2 col tablet, 3 col desktop */}
  <View className="w-full sm:w-1/2 lg:w-1/3 p-2">
    <View className="bg-card p-4 rounded">
      <Text className="text-foreground">Item</Text>
    </View>
  </View>
</View>
```

### Responsive Spacing

```tsx
<View className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
  <Text className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">
    Responsive Heading
  </Text>
</View>
```

### Responsive Visibility

```tsx
{/* Hidden on mobile, visible on tablet+ */}
<View className="hidden sm:flex flex-row gap-4">
  <Text>Home</Text>
  <Text>About</Text>
</View>

{/* Visible on mobile only */}
<View className="flex sm:hidden">
  <Text>Menu icon</Text>
</View>
```

### Custom Breakpoints

Override defaults or add new ones in global.css:

```css
@theme {
  /* Override */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;

  /* Add new */
  --breakpoint-xs: 480px;
  --breakpoint-tablet: 820px;
  --breakpoint-3xl: 1920px;
}
```

Usage: `xs:p-2 tablet:p-4 3xl:p-8`

### Best Practices

1. **Design mobile-first** — base styles for mobile, enhance with breakpoint prefixes
2. **Use semantic breakpoint names** — `tablet`, `desktop` over arbitrary sizes
3. **Limit to 3-5 breakpoints** — too many = hard to maintain
4. **Test on real devices** — emulators may not reflect actual breakpoint behavior
