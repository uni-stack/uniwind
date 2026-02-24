# Components & Styling Reference

## Table of Contents
- [React Native Component Bindings](#react-native-component-bindings)
- [Pressable & Interactive States](#pressable--interactive-states)
- [Third-Party Components](#third-party-components)
- [Dynamic ClassNames](#dynamic-classnames)
- [Tailwind Variants](#tailwind-variants)
- [Data Selectors](#data-selectors)
- [Platform Selectors](#platform-selectors)
- [Responsive Breakpoints](#responsive-breakpoints)
- [CSS Functions](#css-functions)
- [Custom CSS Classes](#custom-css-classes)
- [Custom Utilities](#custom-utilities)
- [Styling Convention](#styling-convention)

## React Native Component Bindings

All core RN components support `className` prop. Some have additional className props for specific sub-properties:

### View
```tsx
<View className="flex-1 bg-white p-4 rounded-lg" />
```

### Text
```tsx
<Text className="text-lg font-bold text-gray-900" />
```

### Pressable
```tsx
<Pressable className="bg-blue-500 px-6 py-3 rounded-lg active:opacity-80" />
```

### Image
```tsx
<Image className="w-24 h-24 rounded-full" source={source} />
// Additional: tintColorClassName="accent-blue-500"
```

### TextInput
```tsx
<TextInput
  className="border border-gray-300 rounded-lg px-4 py-2 text-base"
  placeholderTextColorClassName="accent-gray-400"
  selectionColorClassName="accent-blue-500"
  cursorColorClassName="accent-blue-500"
/>
```

### ScrollView
```tsx
<ScrollView
  className="flex-1"
  contentContainerClassName="p-4 gap-4"
/>
```

### FlatList
```tsx
<FlatList
  className="flex-1"
  contentContainerClassName="p-4"
  columnWrapperClassName="gap-4"  // for numColumns > 1
  ListHeaderComponentClassName="pb-4"
  ListFooterComponentClassName="pt-4"
/>
```

### Switch
```tsx
<Switch
  className="my-2"
  thumbColorClassName="accent-white"
  trackColorOnClassName="accent-blue-500"
  trackColorOffClassName="accent-gray-300"
  ios_backgroundColorClassName="accent-gray-200"
/>
```

### ActivityIndicator
```tsx
<ActivityIndicator colorClassName="accent-blue-500" />
```

### SafeAreaView
```tsx
<SafeAreaView className="flex-1 bg-background" />
```

### Modal
```tsx
<Modal
  className="flex-1"
  backdropColorClassName="accent-black/50"
  statusBarBackgroundColorClassName="accent-transparent"
/>
```

### RefreshControl
```tsx
<RefreshControl
  className="my-2"
  colorsClassName="accent-blue-500"
  progressBackgroundColorClassName="accent-white"
  tintColorClassName="accent-blue-500"
  titleColorClassName="accent-blue-500"
/>
```

## Styling Convention

- **For `style` props**: Use regular Tailwind classes (`className="p-4 bg-blue-500"`)
- **For non-style props** (like `color`, `tintColor`): Use `accent-` prefix (`colorClassName="accent-blue-500"`)

## Pressable & Interactive States

```tsx
// Active state
<Pressable className="bg-blue-500 active:bg-blue-600 active:opacity-80">
  <Text className="text-white">Press me</Text>
</Pressable>

// Disabled state
<Pressable
  disabled={isLoading}
  className="bg-blue-500 disabled:bg-gray-300 disabled:opacity-50"
>
  <Text className="text-white disabled:text-gray-500">Submit</Text>
</Pressable>

// With transitions (Pro only)
<Pressable className="bg-blue-500 active:scale-95 transition-transform duration-150">
  <Text className="text-white">Animated Press</Text>
</Pressable>
```

## Third-Party Components

### withUniwind (Recommended)

Wrap once, use with className everywhere:

```tsx
import { withUniwind } from 'uniwind'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { MotiView } from 'moti'

const StyledSafeArea = withUniwind(SafeAreaView)
const StyledBlurView = withUniwind(BlurView)
const StyledMotiView = withUniwind(MotiView)

// Usage
<StyledSafeArea className="flex-1 bg-background p-4">
  <StyledBlurView className="p-4 rounded-lg" />
</StyledSafeArea>
```

### useResolveClassNames (One-off)

Convert classNames to style objects:

```tsx
import { useResolveClassNames } from 'uniwind'

const MyComponent = () => {
  const cardStyle = useResolveClassNames('bg-white dark:bg-gray-900 p-4 rounded-lg')
  return <ThirdPartyCard style={cardStyle} />
}
```

### Comparison

| Feature         | withUniwind         | useResolveClassNames |
|-----------------|---------------------|----------------------|
| Setup           | Once per component  | Per usage            |
| Performance     | Optimized           | Slightly slower      |
| Best for        | Reusable components | One-off cases        |
| Syntax          | `className="..."`   | `style={...}`        |

## Dynamic ClassNames

### NEVER do this (build-time scanning fails)

```tsx
// BROKEN — Tailwind can't detect at build time
<View className={`bg-${color}-500`} />
<Text className={`text-${size}`} />
<View className={`bg-{{ error ? 'red' : 'green' }}-600`} />
```

### Correct patterns

```tsx
// Ternary with complete class names
<View className={error ? 'bg-red-600' : 'bg-green-600'} />

// Mapping object
const colorMap = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  ghost: 'bg-transparent text-gray-900',
}
<Pressable className={colorMap[variant]} />

// Array join for multiple conditions
<View className={[
  'p-4 rounded-lg',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50',
].filter(Boolean).join(' ')} />
```

## Tailwind Variants

For complex component styling, use `tailwind-variants`:

```tsx
import { tv } from 'tailwind-variants'

const button = tv({
  base: 'font-semibold rounded-lg px-4 py-2 items-center justify-center',
  variants: {
    color: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      danger: 'bg-red-500 text-white',
      ghost: 'bg-transparent text-foreground border border-border',
    },
    size: {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
    disabled: {
      true: 'opacity-50',
    },
  },
  compoundVariants: [
    { color: 'primary', size: 'lg', class: 'bg-blue-600' },
  ],
  defaultVariants: { color: 'primary', size: 'md' },
})

// Usage
<Pressable className={button({ color: 'primary', size: 'lg' })}>
  <Text className="text-white font-semibold">Click</Text>
</Pressable>
```

## Data Selectors

Style based on prop values using `data-[prop=value]:utility`:

```tsx
// Boolean props
<Pressable
  data-selected={isSelected}
  className="border rounded px-3 py-2 data-[selected=true]:ring-2 data-[selected=true]:ring-primary"
/>

// String props
<View
  data-state={isOpen ? 'open' : 'closed'}
  className="p-4 data-[state=open]:bg-muted/50 data-[state=closed]:bg-transparent"
/>

// Multiple data selectors
<View
  data-status={status}
  data-size={size}
  className="
    data-[status=success]:bg-green-500 data-[status=success]:text-white
    data-[status=error]:bg-red-500 data-[status=error]:text-white
    data-[size=sm]:px-2 data-[size=md]:px-3 data-[size=lg]:px-4
  "
/>
```

### Tabs Example

```tsx
<Pressable
  data-selected={route.key === current}
  className="px-4 py-2 rounded-md text-foreground/60
    data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
>
  <Text>{route.title}</Text>
</Pressable>
```

### Toggle Example

```tsx
<Pressable
  data-checked={enabled}
  className="h-6 w-10 rounded-full bg-muted data-[checked=true]:bg-primary"
>
  <View className="h-5 w-5 rounded-full bg-background translate-x-0 data-[checked=true]:translate-x-4" />
</Pressable>
```

**Rules**:
- Only equality selectors supported (`data-[prop=value]`)
- No presence-only selectors (`data-[prop]` — not supported)
- Booleans match both boolean and string forms
- Use semantic prop names (state, status, variant, disabled)

## Platform Selectors

Apply platform-specific styles directly in className:

```tsx
// Individual platforms
<View className="ios:bg-red-500 android:bg-blue-500 web:bg-green-500" />

// native: shorthand (iOS + Android)
<View className="native:bg-blue-500 web:bg-gray-500" />

// Combine with other utilities
<View className="p-4 ios:pt-12 android:pt-6 web:pt-4" />
```

### Platform Media Queries in @theme

For global values:

```css
@layer theme {
  :root {
    @media ios { --font-sans: "SF Pro Text"; --spacing-4: 20px; }
    @media android { --font-sans: "Roboto-Regular"; --spacing-4: 18px; }
    @media web { --font-sans: "Inter"; --spacing-4: 16px; }
  }
}
```

**Prefer platform selectors over `Platform.select()`** — cleaner syntax, no imports needed.

## Responsive Breakpoints

Mobile-first system:

| Prefix | Min Width | Typical Device       |
|--------|-----------|----------------------|
| (none) | 0px       | All devices (mobile) |
| `sm:`  | 640px     | Large phones         |
| `md:`  | 768px     | Tablets              |
| `lg:`  | 1024px    | Landscape tablets    |
| `xl:`  | 1280px    | Desktops             |
| `2xl:` | 1536px    | Large desktops       |

```tsx
// Responsive layout
<View className="p-4 sm:p-6 lg:p-8">
  <Text className="text-base sm:text-lg lg:text-xl">Responsive</Text>
</View>

// Responsive grid
<View className="flex-row flex-wrap">
  <View className="w-full sm:w-1/2 lg:w-1/3 p-2">
    <View className="bg-card p-4 rounded"><Text>Item</Text></View>
  </View>
</View>

// Responsive visibility
<View className="hidden sm:flex flex-row gap-4">
  <Text>Visible on tablet+</Text>
</View>
<View className="flex sm:hidden">
  <Text>Mobile only</Text>
</View>
```

### Custom Breakpoints

```css
@theme {
  --breakpoint-xs: 480px;
  --breakpoint-tablet: 820px;
  --breakpoint-3xl: 1920px;
}
```

Usage: `xs:p-2 tablet:p-4 3xl:p-8`

**Design mobile-first**: start with base styles, enhance with breakpoint prefixes.

## CSS Functions

Must be defined as `@utility` in global.css:

### hairlineWidth()
Thinnest displayable line:
```css
@utility h-hairline { height: hairlineWidth(); }
@utility border-hairline { border-width: hairlineWidth(); }
```

### fontScale()
Respects device accessibility font scale:
```css
@utility text-scaled { font-size: fontScale(); }
@utility text-sm-scaled { font-size: fontScale(0.9); }
```

### pixelRatio()
Scales by device pixel density:
```css
@utility w-icon { width: pixelRatio(); }
@utility w-avatar { width: pixelRatio(2); }
```

### light-dark()
Theme-aware values:
```css
@utility bg-adaptive { background-color: light-dark(#ffffff, #1f2937); }
@utility text-adaptive { color: light-dark(#111827, #f9fafb); }
```

## Custom CSS Classes

Define in global.css alongside Tailwind:

```css
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

```tsx
<View className="card p-4 m-2">
  <Text className="text-lg font-bold">Mixed</Text>
</View>
```

### light-dark() in custom CSS
```css
.adaptive-card {
  background-color: light-dark(#ffffff, #1f2937);
  color: light-dark(#111827, #f9fafb);
}
```

**Rules**:
- Keep selectors flat — no deep nesting
- Prefer Tailwind utilities for simple styles
- Use custom CSS for complex reusable patterns
- Compiled at build time — no runtime overhead

## Custom Utilities

```css
@utility h-hairline { height: hairlineWidth(); }
@utility text-scaled { font-size: fontScale(); }
```

Use in className like any Tailwind class: `<View className="h-hairline" />`
