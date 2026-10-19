## Styling Third-Party Components

### withUniwind (Recommended)

Wrap once at module level, use with `className` everywhere:

```tsx
import { withUniwind } from 'uniwind';
import { Image as ExpoImage } from 'expo-image';
import { BlurView as RNBlurView } from 'expo-blur';
import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

// Module-level wrapping (NEVER inside render functions)
export const Image = withUniwind(ExpoImage);
export const BlurView = withUniwind(RNBlurView);
export const LinearGradient = withUniwind(RNLinearGradient);
```

`withUniwind` automatically maps:
- `style` → `className`
- `{name}Style` → `{name}ClassName`
- `{name}Color` → `{name}ColorClassName` (with accent- prefix)

For custom prop mappings:

```tsx
const StyledProgressBar = withUniwind(ProgressBar, {
  width: {
    fromClassName: 'widthClassName',
    styleProperty: 'width',
  },
});
```

**Usage patterns:**

- **Used in one file only** — define the wrapped component in that same file
- **Used across multiple files** — wrap once in a shared module (e.g., `components/styled.ts`) and re-export

```tsx
// components/styled.ts
import { withUniwind } from 'uniwind';
import { Image as ExpoImage } from 'expo-image';
export const Image = withUniwind(ExpoImage);

// Then import everywhere:
import { Image } from '@/components/styled';
```

**NEVER** call `withUniwind` on the same component in multiple files.

**CRITICAL**: Do NOT use `withUniwind` on components from `react-native` or `react-native-reanimated`. These already have built-in `className` support:

```tsx
// WRONG — View already supports className natively
const StyledView = withUniwind(View);        // DO NOT DO THIS
const StyledText = withUniwind(Text);        // DO NOT DO THIS
const StyledAnimatedView = withUniwind(Animated.View); // DO NOT DO THIS

// CORRECT — only wrap third-party components
const StyledExpoImage = withUniwind(ExpoImage);     // expo-image
const StyledBlurView = withUniwind(BlurView);        // expo-blur
const StyledMotiView = withUniwind(MotiView);        // moti
```

### useResolveClassNames

Converts Tailwind class strings to React Native style objects. Use for one-off cases or components that only accept `style`:

```tsx
import { useResolveClassNames } from 'uniwind';

const headerStyle = useResolveClassNames('bg-primary p-4');
const cardStyle = useResolveClassNames('bg-card dark:bg-card rounded-lg shadow-sm');

// React Navigation screen options
<Stack.Navigator screenOptions={{ headerStyle, cardStyle }} />
```

### Comparison

| Feature | withUniwind | useResolveClassNames |
|---------|-------------|----------------------|
| Setup | Once per component | Per usage |
| Performance | Optimized | Slightly slower |
| Best for | Reusable components | One-off, navigation config |
| Syntax | `className="..."` | `style={...}` |

## Dynamic ClassNames

### NEVER do this (Tailwind scans at build time)

```tsx
// BROKEN — template literal with variable
<View className={`bg-${color}-500`} />
<Text className={`text-${size}`} />
```

### Correct patterns

```tsx
// Ternary with complete class names
<View className={isActive ? 'bg-primary' : 'bg-muted'} />

// Mapping object
const colorMap = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  ghost: 'bg-transparent text-foreground',
};
<Pressable className={colorMap[variant]} />

// Array join for multiple conditions
<View className={[
  'p-4 rounded-lg',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50',
].filter(Boolean).join(' ')} />
```

## tailwind-variants (tv)

For complex component styling with variants and compound variants:

```tsx
import { tv } from 'tailwind-variants';

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
});

<Pressable className={button({ color: 'primary', size: 'lg' })}>
  <Text className="text-white font-semibold">Click</Text>
</Pressable>
```

## cn Utility — Class Deduplication

Uniwind does **NOT** remove conflicting classNames. When two classes set the same property, the winner is decided by the CSS cascade (Uniwind 1.13.0+ / Pro 1.9.0+): `!important`, then cascade layer, then selector specificity, then order in the compiled CSS. **className order does not matter**, so `cn('p-4', props.className)` is what lets a consumer's `p-2` replace the default `p-4`: tailwind-merge removes `p-4`.

### Setup

```bash
npm install tailwind-merge clsx
```

```ts
// lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### When cn Is Required

1. **Merging className props** — component accepts external className that may conflict:

```tsx
import { cn } from '@/lib/cn';

<View className={cn('p-4 bg-white', props.className)} />
<Text className={cn('text-base', isActive && 'text-primary', disabled && 'opacity-50')} />
```

2. **tv() output combined with extra classes** — tv already handles its own variants, but if you add more classes on top:

```tsx
<Pressable className={cn(button({ color: 'primary' }), props.className)} />
```

### When cn Is NOT Needed

- Static className with no conflicts: `<View className="flex-1 p-4 bg-white" />`
- Single custom CSS class with no overlapping Tailwind: `<View className="card-shadow mt-4" />` (if card-shadow only sets box-shadow which no Tailwind class also sets)
- Custom CSS class overlapping a utility: `cn()` can't fix this, because tailwind-merge ignores classes it doesn't know. Control it with cascade layers instead: declare the custom class in `@layer components` so utilities override it (see Priority rules below and `references/css-and-utilities.md`)

## Important Utilities and Style Specificity

Uniwind supports Tailwind's important modifier (`!`) for utilities that must override another utility for the same style property.

```tsx
import { View, Pressable } from 'react-native';

// bg-red-500! has higher priority than bg-blue-500
<View className="bg-blue-500 bg-red-500!" />;

// Important utilities work with state and platform variants
<Pressable className="bg-blue-500 active:bg-red-500!" />;
<View className="pt-4 ios:pt-12! android:pt-8!" />;
```

Priority rules (CSS cascade, Uniwind 1.13.0+ / Pro 1.9.0+), evaluated per style property:
- Important declarations beat normal ones. `bg-red-500!` overrides `bg-blue-500`.
- Then cascade layer: unlayered CSS > `@layer utilities` (Tailwind utilities) > `@layer components` > `@layer base`. For `!important` declarations the layer order is reversed, like in CSS.
- Then selector specificity: classes, state variants (`active:`, `focus:`, `disabled:`) and `data-*` variants each add specificity. `:where(...)` and media queries (breakpoints, `ios:`, `dark:`) add none.
- Then order in the compiled CSS. The order of classes inside `className` never matters: `"p-4 p-2"` and `"p-2 p-4"` resolve the same way.
- Important variants work normally: `active:bg-red-500!`, `ios:pt-12!`, `dark:text-white!`.
- Inline `style` always wins, even over important className utilities: `<View className="bg-red-500!" style={{ backgroundColor: 'blue' }} />` renders blue.
- Use `!` sparingly. For reusable components and consumer overrides, prefer `cn()` with `tailwind-merge`.
