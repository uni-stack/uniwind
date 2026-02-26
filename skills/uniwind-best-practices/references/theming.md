# Theming Reference

## Table of Contents
- [Default Themes](#default-themes)
- [Theme Variant Prefixes (dark:)](#theme-variant-prefixes)
- [CSS Variables with @layer theme](#css-variables-with-layer-theme)
- [Custom Themes](#custom-themes)
- [Theme API](#theme-api)
- [Global CSS @theme Directive](#global-css-theme-directive)
- [Static Theme Variables](#static-theme-variables)
- [OKLCH Color Support](#oklch-color-support)
- [Runtime CSS Variable Updates](#runtime-css-variable-updates)
- [Best Practices](#best-practices)

## Default Themes

Uniwind pre-registers three themes:

| Theme    | Description                              |
|----------|------------------------------------------|
| `light`  | Light theme                              |
| `dark`   | Dark theme                               |
| `system` | Follows device system color scheme       |

No setup required for light/dark. Use `dark:` variant immediately.

## Theme Variant Prefixes

Simplest approach — explicit light/dark styles:

```tsx
<View className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
  <Text className="text-gray-900 dark:text-white text-lg font-bold">Title</Text>
  <Text className="text-gray-600 dark:text-gray-300 mt-2">Description</Text>
</View>
```

**Best for**: Small apps, prototyping, one-off styling.

**Limitations**: Verbose for large apps, doesn't scale to 3+ themes.

## CSS Variables with @layer theme

Scalable approach — define once, use everywhere:

```css
/* global.css */
@import 'tailwindcss';
@import 'uniwind';

@layer theme {
  :root {
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #111827;
      --color-foreground-secondary: #6b7280;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
      --color-border-subtle: #f3f4f6;
      --color-muted: #9ca3af;
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-danger: #ef4444;
      --color-success: #10b981;
      --color-warning: #f59e0b;
    }
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-foreground-secondary: #9ca3af;
      --color-card: #1f2937;
      --color-border: #374151;
      --color-border-subtle: #1f2937;
      --color-muted: #6b7280;
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-danger: #ef4444;
      --color-success: #10b981;
      --color-warning: #f59e0b;
    }
  }
}
```

Usage — no `dark:` prefix needed:

```tsx
<View className="bg-card border border-border p-4 rounded-lg">
  <Text className="text-foreground text-lg font-bold">Title</Text>
  <Text className="text-muted mt-2">Auto-adapts to theme</Text>
</View>
```

Variable naming: `--color-background` → `bg-background`, `text-background`. Drop `--color-` prefix.

**Best for**: Medium-large apps, design systems, 3+ themes.

## Custom Themes

### Step 1: Define in global.css

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
    }

    @variant sunset {
      --color-background: #7c2d12;
      --color-foreground: #fef3c7;
      --color-primary: #f59e0b;
      --color-card: #9a3412;
      --color-border: #b45309;
    }

    @variant high-contrast {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-primary: oklch(0.7 0.25 60);
      --color-card: #0a0a0a;
      --color-border: #ffffff;
    }
  }
}
```

**All themes must define the same set of variables.** Uniwind warns in `__DEV__` about missing variables.

### Step 2: Register in metro.config.js

```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  extraThemes: ['ocean', 'sunset', 'high-contrast'],
})
```

Restart Metro after adding themes.

### Step 3: Use

```tsx
Uniwind.setTheme('ocean')
```

Components using CSS variables automatically work with all themes.

### Theme Switcher Component

```tsx
import { View, Pressable, Text, ScrollView } from 'react-native'
import { Uniwind, useUniwind } from 'uniwind'

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind()
  const activeTheme = hasAdaptiveThemes ? 'system' : theme

  const themes = [
    { name: 'light', label: 'Light' },
    { name: 'dark', label: 'Dark' },
    { name: 'system', label: 'System' },
    { name: 'ocean', label: 'Ocean' },
  ]

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
  )
}
```

## Theme API

### Uniwind Global Object

```tsx
import { Uniwind } from 'uniwind'

// Switch themes
Uniwind.setTheme('dark')
Uniwind.setTheme('light')
Uniwind.setTheme('system')    // Re-enables adaptive themes
Uniwind.setTheme('ocean')     // Custom theme

// Read state
Uniwind.currentTheme           // 'light' | 'dark' | custom
Uniwind.hasAdaptiveThemes      // true if following system

// Update CSS variables at runtime
Uniwind.updateCSSVariables('dark', {
  '--color-primary': '#ff0000',
  '--color-background': '#111111',
})
```

### useUniwind Hook

```tsx
import { useUniwind } from 'uniwind'

const { theme, hasAdaptiveThemes } = useUniwind()
// Re-renders component when theme changes
```

### useCSSVariable Hook

```tsx
import { useCSSVariable } from 'uniwind'

const primaryColor = useCSSVariable('--color-primary')
const chartWidth = useCSSVariable('--chart-line-width')
```

Note: `setTheme('light')` or `setTheme('dark')` also calls React Native's `Appearance.setColorScheme` to sync native components (Alert, Modal, system dialogs).

Setting `system` re-enables adaptive themes following device color scheme changes.

## Global CSS @theme Directive

Customize Tailwind design tokens:

```css
@theme {
  --text-base: 15px;
  --spacing-4: 16px;
  --radius-lg: 12px;
  --color-primary: #3b82f6;
  --color-brand-500: #3b82f6;
  --font-sans: 'Roboto-Regular';
  --font-mono: 'FiraCode-Regular';
  --breakpoint-tablet: 820px;
}
```

`@theme` only customizes Tailwind utilities. Unstyled components use RN defaults.

### Extending Colors

```css
@theme {
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
}
```

Usage: `bg-brand-500`, `text-brand-100`

### Custom Fonts

```css
@theme {
  --font-sans: 'Roboto-Regular';
  --font-sans-medium: 'Roboto-Medium';
  --font-sans-bold: 'Roboto-Bold';
  --font-mono: 'FiraCode-Regular';
}
```

Each weight = separate font file. No fallbacks. Name must match font file name exactly.

For Expo: configure fonts in app.json `expo-font` plugin. For bare RN: use `react-native-asset`.

### Platform-Specific Fonts

```css
@layer theme {
  :root {
    --font-sans: 'Roboto-Regular';
    @media ios { --font-sans: 'SF Pro Text'; }
    @media android { --font-sans: 'Roboto-Regular'; }
    @media web { --font-sans: 'system-ui'; }
  }
}
```

## Static Theme Variables

For JS-only values not used in classNames:

```css
@theme static {
  --chart-line-width: 2;
  --chart-dot-radius: 4;
  --animation-duration: 300;
}
```

Access via `useCSSVariable('--chart-line-width')`.

Use for: chart config, native module values, JS-only calculations.

## OKLCH Color Support

Perceptually uniform colors:

```css
@layer theme {
  :root {
    @variant dark {
      --color-background: oklch(0.13 0.004 17.69);
      --color-foreground: oklch(0.98 0 0);
      --color-primary: oklch(0.6 0.2 240);
    }
    @variant light {
      --color-background: oklch(1 0 0);
      --color-foreground: oklch(0.2 0 0);
      --color-primary: oklch(0.5 0.2 240);
    }
  }
}
```

Benefits: wider gamut, better interpolation, consistent lightness for accessibility.

## Runtime CSS Variable Updates

```tsx
Uniwind.updateCSSVariables('dark', {
  '--color-primary': '#ff0000',
  '--color-background': '#111111',
})
```

Updates are theme-specific and take effect immediately.

## Best Practices

1. **Use semantic variable names** — `--color-background` not `--color-white`
2. **Keep variables consistent across all themes** — same set in every `@variant`
3. **Test all themes** — check contrast and readability in each
4. **Use CSS variables for medium+ apps** — `dark:` prefix doesn't scale
5. **Avoid hardcoded colors in components** — use theme tokens
6. **Use OKLCH for perceptually uniform palettes**
7. **Restart Metro after changing metro.config.js** (extraThemes, etc.)
8. **Use `@theme static` for JS-only values** — keeps them accessible via hooks
