## Theming

### Quick Setup (dark: prefix)

Works immediately — no configuration needed:

```tsx
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Themed</Text>
</View>
```

Best for small apps and prototyping. Does not scale to custom themes.

### Scalable Setup (CSS Variables)

Define in `global.css`, use everywhere without `dark:` prefix:

```css
@layer theme {
  :root {
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #111827;
      --color-foreground-secondary: #6b7280;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
      --color-muted: #9ca3af;
      --color-primary: #3b82f6;
      --color-danger: #ef4444;
      --color-success: #10b981;
    }
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-foreground-secondary: #9ca3af;
      --color-card: #1f2937;
      --color-border: #374151;
      --color-muted: #6b7280;
      --color-primary: #3b82f6;
      --color-danger: #ef4444;
      --color-success: #10b981;
    }
  }
}
```

```tsx
// Auto-adapts to current theme — no dark: prefix needed
<View className="bg-card border border-border p-4 rounded-lg">
  <Text className="text-foreground text-lg font-bold">Title</Text>
  <Text className="text-muted mt-2">Subtitle</Text>
</View>
```

Variable naming: `--color-background` → `bg-background`, `text-background`.

**Prefer CSS variables over explicit `dark:` variants** — they're cleaner, maintain easier, and work with custom themes automatically.

### Custom Themes

**Step 1** — Define in `global.css`:

```css
@layer theme {
  :root {
    @variant light { /* ... */ }
    @variant dark { /* ... */ }
    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
      --color-primary: #06b6d4;
      --color-card: #0e7490;
      --color-border: #155e75;
      /* Must define ALL the same variables as light/dark */
    }
  }
}
```

**Step 2** — Register in `metro.config.js` (exclude `light`/`dark` — they're automatic):

```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  extraThemes: ['ocean'],
});
```

Restart Metro after adding themes.

**Step 3** — Use:

```tsx
Uniwind.setTheme('ocean');
```

### Theme API

```tsx
import { Uniwind, useUniwind } from 'uniwind';

// Imperative (no re-render)
Uniwind.setTheme('dark');          // Force dark
Uniwind.setTheme('light');         // Force light
Uniwind.setTheme('system');        // Follow device (re-enables adaptive themes)
Uniwind.setTheme('ocean');         // Custom theme (must be in extraThemes)
Uniwind.currentTheme;              // Current theme name
Uniwind.hasAdaptiveThemes;         // true if following system

// Reactive hook (re-renders on change)
const { theme, hasAdaptiveThemes } = useUniwind();
```

`Uniwind.setTheme('light')` / `setTheme('dark')` also calls `Appearance.setColorScheme` to sync native components (Alert, Modal, system dialogs).

By default Uniwind uses "system" theme - follows device color scheme. If user wants to override it, just
call Uniwind.setTheme with desired theme. It can be done above the React component to avoid theme switching at runtime.

### Theme Switcher Example

```tsx
import { View, Pressable, Text, ScrollView } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? 'system' : theme;

  const themes = [
    { name: 'light', label: 'Light' },
    { name: 'dark', label: 'Dark' },
    { name: 'system', label: 'System' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2 p-4">
        {themes.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => Uniwind.setTheme(t.name)}
            className={`px-4 py-3 rounded-lg items-center ${
              activeTheme === t.name ? 'bg-primary' : 'bg-card border border-border'
            }`}
          >
            <Text className={`text-sm ${
              activeTheme === t.name ? 'text-white' : 'text-foreground'
            }`}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};
```

### ScopedTheme

Apply a different theme to a subtree without changing the global theme:

```tsx
import { ScopedTheme } from 'uniwind';

<View className="gap-3">
  <PreviewCard />

  <ScopedTheme theme="dark">
    <PreviewCard />  {/* Renders with dark theme */}
  </ScopedTheme>

  <ScopedTheme theme="ocean">
    <PreviewCard />  {/* Renders with ocean theme */}
  </ScopedTheme>
</View>
```

- Nearest `ScopedTheme` wins (nested scopes supported)
- Hooks (`useUniwind`, `useResolveClassNames`, `useCSSVariable`) resolve against the nearest scoped theme
- `withUniwind`-wrapped components inside the scope also resolve scoped theme values
- Custom themes require registration in `extraThemes`

### LayoutDirection (v1.8.0+)

Scope RTL/LTR variants to a subtree without changing global device RTL state:

```tsx
import { LayoutDirection } from 'uniwind';

<View className="gap-3">
  <Text className="ltr:text-left rtl:text-right">Uses global RTL state</Text>

  <LayoutDirection rtl>
    <Text className="ltr:text-left rtl:text-right">Forced RTL subtree</Text>
  </LayoutDirection>

  <LayoutDirection rtl={false}>
    <Text className="ltr:text-left rtl:text-right">Forced LTR subtree</Text>
  </LayoutDirection>
</View>
```

- Available from `uniwind@1.8.0`.
- `rtl` prop: `true` forces RTL, `false` forces LTR.
- Omit `rtl` to inherit parent `LayoutDirection`; outside any parent it falls back to global RTL state.
- Nearest `LayoutDirection` wins (nested scopes supported).
- Prefer `LayoutDirection` over inline `style={{ direction: 'rtl' }}` for `rtl:`/`ltr:` variant scoping.
- Hooks (`useResolveClassNames`, `useCSSVariable`) and `withUniwind`-wrapped components inside the scope resolve against the nearest layout direction.

### useCSSVariable

Access CSS variable values in JavaScript:

```tsx
import { useCSSVariable } from 'uniwind';

const primaryColor = useCSSVariable('--color-primary');
const spacing = useCSSVariable('--spacing-4');

// Multiple variables at once
const [bg, fg] = useCSSVariable(['--color-background', '--color-foreground']) as [string, string]
```

Use for: animations, chart libraries, third-party component configs, calculations with design tokens.

It's required to cast the result of `useCSSVariable` as it can return: string | number | undefined.
Uniwind doesn't know if given variable exist and what type it is, so it returns union type.

### getCSSVariable

Read CSS variable values outside of React (event handlers, async callbacks, utility modules, worklets). Available in Uniwind 1.6.4+.

```ts
import { Uniwind } from 'uniwind';

const primary = Uniwind.getCSSVariable('--color-primary');
const [bg, fg] = Uniwind.getCSSVariable(['--color-background', '--color-foreground']) as [string, string];
```

Same value rules as `useCSSVariable` (variable must be used in a `className` or declared in `@theme static`). Same return type: `string | number | undefined`. Cast as needed.

Not reactive — value is read once. For reactive values inside components use `useCSSVariable`. Use `getCSSVariable` for one-shot reads (onPress handlers, utility functions, native module configs).

### Runtime CSS Variable Updates

Update theme variables at runtime (e.g., user-selected brand colors or API-driven themes):

```tsx
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff6600',
  '--color-background': '#fafafa',
});
```

Updates are theme-specific and take effect immediately.

### @theme static

For JS-only values not used in classNames:

```css
@theme static {
  --chart-line-width: 2;
  --chart-dot-radius: 4;
  --animation-duration: 300;
}
```

Access via `useCSSVariable('--chart-line-width')`. Use for: chart configs, animation durations, native module values.

### OKLCH Colors support

Perceptually uniform color format — wider gamut, consistent lightness:

```css
@layer theme {
  :root {
    @variant light {
      --color-primary: oklch(0.5 0.2 240);
      --color-background: oklch(1 0 0);
    }
    @variant dark {
      --color-primary: oklch(0.6 0.2 240);
      --color-background: oklch(0.13 0.004 17.69);
    }
  }
}
```

### Display P3 Colors support

Wide-gamut color format for devices that support the P3 color space (most modern iPhones and Macs). Uniwind parses `color(display-p3 ...)` values and converts them for native use:

```css
@layer theme {
  :root {
    @variant light {
      --color-primary: color(display-p3 0.2 0.4 1);
      --color-accent: color(display-p3 1 0.3 0.3);
    }
    @variant dark {
      --color-primary: color(display-p3 0.3 0.5 1);
      --color-accent: color(display-p3 1 0.4 0.4);
    }
  }
}
```
