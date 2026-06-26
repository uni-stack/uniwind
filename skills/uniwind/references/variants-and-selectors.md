## Platform Selectors

Apply platform-specific styles directly in className:

```tsx
// Individual platforms
<View className="ios:bg-red-500 android:bg-blue-500 web:bg-green-500" />

// native: shorthand (iOS + Android)
<View className="native:bg-blue-500 web:bg-gray-500" />

// TV platforms
<View className="tv:p-8 android-tv:bg-black apple-tv:bg-gray-900" />

// Combine with other utilities
<View className="p-4 ios:pt-12 android:pt-6 web:pt-4" />
```

Platform variants in `@layer theme` for global values (use `@variant`, not `@media`):

```css
@layer theme {
  :root {
    @variant ios { --font-sans: 'SF Pro Text'; }
    @variant android { --font-sans: 'Roboto-Regular'; }
    @variant web { --font-sans: 'Inter'; }
  }
}
```

**Prefer platform selectors over `Platform.select()`** — cleaner syntax, no imports needed.

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

// Tabs pattern
<Pressable
  data-selected={route.key === current}
  className="px-4 py-2 rounded-md text-foreground/60
    data-[selected=true]:bg-primary data-[selected=true]:text-white"
>
  <Text>{route.title}</Text>
</Pressable>

// Toggle pattern
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
- No `has-data-*` parent selectors (not supported in React Native)
- Booleans match both boolean and string forms

## Interactive States

```tsx
// active: — when pressed
<Pressable className="bg-primary active:bg-primary/80 active:opacity-90 active:scale-95">
  <Text className="text-white">Press me</Text>
</Pressable>

// disabled: — when disabled prop is true
<Pressable
  disabled={isLoading}
  className="bg-primary disabled:bg-gray-300 disabled:opacity-50"
>
  <Text className="text-white disabled:text-gray-500">Submit</Text>
</Pressable>

// focus: — keyboard/accessibility focus
<TextInput
  className="border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
/>

<Pressable className="bg-card rounded-lg p-4 focus:ring-2 focus:ring-primary">
  <Text className="text-foreground">Focusable</Text>
</Pressable>
```

Components with state support:
- **Pressable**: `active:`, `disabled:`, `focus:`
- **TextInput**: `active:`, `disabled:`, `focus:`
- **Switch**: `disabled:`
- **Text**: `active:`, `disabled:`
- **TouchableOpacity / TouchableHighlight / TouchableNativeFeedback / TouchableWithoutFeedback**: `active:`, `disabled:`

## Responsive Breakpoints

Mobile-first — unprefixed styles apply to all sizes, prefixed styles apply at that breakpoint and above:

| Prefix | Min Width | Typical Device |
|--------|-----------|----------------|
| (none) | 0px | All (mobile) |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Landscape tablets |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

```tsx
// Responsive padding and typography
<View className="p-4 sm:p-6 lg:p-8">
  <Text className="text-base sm:text-lg lg:text-xl font-bold">Responsive</Text>
</View>

// Responsive grid (1 col → 2 col → 3 col)
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

Custom breakpoints:

```css
@theme {
  --breakpoint-xs: 480px;
  --breakpoint-tablet: 820px;
  --breakpoint-3xl: 1920px;
}
```

Usage: `xs:p-2 tablet:p-4 3xl:p-8`

**Design mobile-first** — start with base styles (no prefix), enhance with breakpoints:

```tsx
// CORRECT — mobile-first
<View className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3" />

// WRONG — desktop-first (reversed order is confusing and fragile)
<View className="w-full lg:w-1/2 md:w-3/4 sm:w-full" />
```

## Safe Area Utilities

### Padding

| Class | Description |
|-------|-------------|
| `p-safe` | All sides |
| `pt-safe` / `pb-safe` / `pl-safe` / `pr-safe` | Individual sides |
| `ps-safe` / `pe-safe` | Logical start / end |
| `px-safe` / `py-safe` | Horizontal / vertical |

### Margin

| Class | Description |
|-------|-------------|
| `m-safe` | All sides |
| `mt-safe` / `mb-safe` / `ml-safe` / `mr-safe` | Individual sides |
| `ms-safe` / `me-safe` | Logical start / end |
| `mx-safe` / `my-safe` | Horizontal / vertical |

### Positioning

| Class | Description |
|-------|-------------|
| `inset-safe` | All sides |
| `top-safe` / `bottom-safe` / `left-safe` / `right-safe` | Individual sides |
| `start-safe` / `end-safe` | Logical start / end |
| `x-safe` / `y-safe` | Horizontal / vertical inset |

### Compound Variants

| Pattern | Behavior | Example |
|---------|----------|---------|
| `{prop}-safe-or-{value}` | `Math.max(inset, value)` — ensures minimum spacing | `pt-safe-or-4` |
| `{prop}-safe-offset-{value}` | `inset + value` — adds extra spacing on top of inset | `pb-safe-offset-4` |

### Setup

**Uniwind Free (default)** — requires `react-native-safe-area-context` to update insets.
Wrap your App component in `SafeAreaProvider` and `SafeAreaListener` and call `Uniwind.updateInsets(insets)` in the `onChange` callback:

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
        <View className="pt-safe px-safe">{/* content */}</View>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
```

**Uniwind Pro** — automatic, no setup needed. Insets injected from native layer.
