## React Navigation Integration

Use `useResolveClassNames` for screen options that only accept `style` objects:

```tsx
import { useResolveClassNames } from 'uniwind';

function Layout() {
  const headerStyle = useResolveClassNames('bg-background');
  const headerTitleStyle = useResolveClassNames('text-foreground font-bold');

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTitleStyle,
      }}
    />
  );
}
```

Keep React Navigation's `<ThemeProvider>` if already in use — it manages navigation-specific theming.

## UI Kit Compatibility

- **HeroUI Native**: Works with Uniwind. Uses `tailwind-variants` (tv) internally. Apply `className` directly on HeroUI components. **Bun users**: Bun uses symlinks for `node_modules`, which can cause Tailwind's Oxide scanner to miss library classes in production builds. Fix: use the resolved path in `@source` and hoist the package:
  ```css
  @source "../../node_modules/heroui-native/lib";
  ```
  ```ini
  # .npmrc
  public-hoist-pattern[]=heroui-native
  ```
- **react-native-reusables**: Compatible.
- **Gluestack v4.1+**: Compatible.
- **Lucide React Native**: Use `withUniwind(LucideIcon)` with `colorClassName="accent-blue-500"` for icon color. Works for all Lucide icons.
- **@shopify/flash-list**: Use `withUniwind(FlashList)` for `className` and `contentContainerClassName` support. Note: `withUniwind` loses generic type params on `ref` — cast manually if needed.

Use semantic color tokens (`bg-primary`, `text-foreground`) for theme consistency across UI kits.

## Supported vs Unsupported Classes

React Native uses the Yoga layout engine. Key differences from web CSS:
- **No CSS cascade/inheritance** — styles don't inherit from parents
- **Flexbox by default** — all views use flexbox with `flexDirection: 'column'`
- **Limited CSS properties** — no floats, grid, pseudo-elements

### Built-in Extra Utilities

Uniwind provides additional utility classes for React Native features not covered by standard Tailwind:

| Class | Effect |
|-------|--------|
| `border-continuous` | Sets `borderCurve: 'continuous'` — smooth, superellipse corners (iOS) |
| `border-circular` | Sets `borderCurve: 'circular'` — standard circular corners (iOS default) |

```tsx
// Smooth iOS-style rounded corners (like SwiftUI's .continuous)
<View className="rounded-2xl border-continuous bg-card p-4">
  <Text className="text-foreground">Smooth corners</Text>
</View>
```

### Supported (all standard Tailwind)

Layout, spacing, sizing, typography, colors, borders, effects, flexbox, positioning, transforms, interactive states.

### Unsupported (web-specific, silently ignored)

- `hover:` `visited:` — use Pressable `active:` instead
- `before:` `after:` `placeholder:` — pseudo-elements
- `float-*` `clear-*` `columns-*`
- `print:` `screen:`
- `break-before-*` `break-after-*` `break-inside-*`
