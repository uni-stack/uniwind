# Uniwind Context

This document captures working context for `packages/uniwind`, the published `uniwind` package in this monorepo. Keep it current when architecture, public APIs, supported platforms, or build/runtime contracts change.

## Product

Uniwind is Tailwind CSS bindings for React Native and React Native Web. It lets users write `className` props on React Native components while doing as much style work as possible at build time.

Primary promise: fast Tailwind styling for React Native with web parity where practical.

Positioning: Uniwind optimizes for build-time Tailwind-to-React-Native artifacts, minimal runtime work, and React Native Web parity. It is not primarily a full design-system/runtime styling framework, a NativeWind compatibility layer, or a web-first CSS bridge.

Core user-facing features:

- Out-of-the-box `className` bindings for React Native components.
- Tailwind v4 CSS compilation into native runtime style artifacts or web CSS.
- Light, dark, and extra named themes.
- `active`, `focus`, `disabled`, RTL, orientation, responsive, data attribute, and platform-aware variants.
- CSS custom property reads and updates from React Native code.
- Scoped themes through `ScopedTheme`.
- Scoped layout direction through `LayoutDirection`.
- Scoped CSS variables through `ScopedVariables`.
- Metro and Vite integration.

Supported platforms: iOS, Android, web, Android TV, and Apple TV. Other React Native targets are out of scope until tests and docs explicitly cover them.

## Package Boundaries

Important paths:

- `packages/uniwind/src/index.ts`: public package entrypoint.
- `packages/uniwind/src/components`: React Native component wrappers and web exports.
- `packages/uniwind/src/core`: runtime config, listeners, native style store, and web style extraction.
- `packages/uniwind/src/hooks`: public hooks.
- `packages/uniwind/src/hoc`: `withUniwind` for custom components.
- `packages/uniwind/src/bundler`: Metro/Vite adapters, Tailwind compilation, CSS processing, artifact generation.
- `packages/uniwind/tests`: native, web, type, and e2e tests.
- `packages/uniwind/uniwind.css`: package-level CSS artifact referenced by package `style` export.

Public exports from `src/index.ts`:

- `Uniwind` runtime/config object.
- `LayoutDirection` component.
- `ScopedTheme` component.
- `ScopedVariables` component.
- `withUniwind` HOC and related types.
- `useCSSVariable`, `useResolveClassNames`, `useUniwind` hooks.
- `ThemeName` and `UniwindConfig` types.

Package subpath exports:

- `uniwind`: main runtime API.
- `uniwind/components`: React Native component replacements.
- `uniwind/components/*`: individual component replacements.
- `uniwind/metro`: Metro adapter.
- `uniwind/vite`: Vite plugin.
- `uniwind/types`: generated/user-facing type support.

Stability policy: public package and subpath exports are semver-stable. Generated artifact internals are implementation details unless explicitly documented, with two notable user-facing surfaces: generated theme typings and the package `style` export (`uniwind.css`).

Dependency policy: peer dependency floors are support contracts. Raising support floors for Tailwind, React, or React Native requires semver-major unless an upstream ecosystem break makes that impossible to honor.

## Runtime Model

Native runtime:

- Build output injects a generated stylesheet callback into `Uniwind.__reinit(...)`.
- `UniwindStore` holds generated style records, theme variables, scoped variables, runtime state, and per-theme caches.
- `UniwindStore.getStyles(className, props, state, context)` resolves classes into React Native style objects.
- Cache keys include class names, component state, whether theme is scoped, layout direction, and a key derived from the merged `ScopedVariables` map.
- During resolve, `ScopedVariables` overrides are overlaid onto a prototype-chained clone of the theme vars so unset variables fall through to the theme.
- Resolved styles subscribe to only dependencies they use, then invalidate cache entries on change.
- Runtime dependencies are represented by `StyleDependency`: theme, dimensions, orientation, insets, font scale, RTL, adaptive themes, and variables.
- Native style resolution filters rules by screen width, orientation, theme, RTL, active/focus/disabled state, and `data-*` props.
- Native post-processing adapts CSS concepts to RN shapes, including line-height multipliers, shadows, transforms, gradients, visibility, borders, outlines, and font variants.

Web runtime:

- Web keeps styles in CSS and passes `{ $$css: true, tailwind: className }` through RNW style arrays.
- `getWebStyles` uses a hidden DOM element to compute style values when a JS value is needed, such as color extraction or `useResolveClassNames`.
- `CSSListener` tracks active CSS rules and media queries, then notifies subscribers when class-dependent media rules change.
- `ScopedTheme` renders a `div` with the theme class and `display: contents` on web.
- `LayoutDirection` renders a contents-style wrapper with `direction`/`dir` semantics so RTL/LTR variants can be scoped to a subtree.
- `ScopedVariables` renders a `display: contents` wrapper and sets its variables as inline custom properties on that wrapper, so the real DOM cascade resolves `var(--name)` to the scoped value for every descendant (numbers become px). During JS reads (`getWebVariable` / `useResolveClassNames`) it also applies the variables to the hidden `dummyParent`, then clears them.
- Dynamic CSS variable updates are written into a generated `#uniwind-dynamic-styles` style element.

Shared runtime:

- `Uniwind.setTheme(theme | 'system')` switches explicit themes or returns to system-adaptive light/dark.
- `Uniwind.currentTheme` and `Uniwind.hasAdaptiveThemes` back `useUniwind`.
- `Uniwind.updateCSSVariables(theme, variables)` updates theme variables and notifies variable subscribers.
- `Uniwind.updateInsets(insets)` is native-only behavior and updates safe-area-style runtime values.
- `ScopedTheme` sets `UniwindContext.scopedTheme`; scoped subtree ignores global theme changes for style resolution.
- `LayoutDirection` sets `UniwindContext.rtl`; scoped subtree uses that direction for RTL/LTR variant resolution instead of global runtime RTL.
- `ScopedVariables` sets `UniwindContext.variables`; the subtree overrides CSS variables for style resolution and `useCSSVariable` without mutating the global theme. Nested providers merge with ancestors, nearest wins.

## Build And Bundler Model

Configuration shape:

- `cssEntryFile`: required CSS entry path, resolved from `process.cwd()`.
- `extraThemes`: optional named themes added to default `light` and `dark`.
- `dtsFile`: optional generated declaration file path, default `uniwind-types.d.ts`.
- Metro-only `polyfills.rem`: custom rem base, default `16`.
- Metro-only `debug` and `isTV` flags exist in types.

Compilation flow:

- `compileTailwind` reads `cssEntryFile`, runs Tailwind v4 compile, scans files under the CSS entry directory, and builds final CSS.
- `compileCSS` routes to web or native by platform.
- `compileWebCSS` runs Lightning CSS with `UniwindCSSVisitor` and returns CSS.
- `compileNativeCSS` runs `ProcessorBuilder`, serializes variables, scoped variables, and native stylesheet metadata into JS source.
- `UniwindBundlerConfig.generateArtifacts` writes CSS artifacts and generated theme typings.
- Internal package aliases such as `@/*` are only safe inside `packages/uniwind/src/bundler`. Bundler files are built and transformed to JS, but runtime/component/hook/HOC files are published directly as `.ts`/`.tsx` React Native entrypoints, so aliases in those files are not rewritten.

Metro integration:

- `withUniwindConfig(config, uniwindConfig)` patches Metro graph support for uncached modules.
- Metro adds `css` as source extension and removes it from asset extensions.
- Metro transformer handles the configured CSS entry file specially.
- Metro transformer worker selection is lazy, cached per Expo/non-Expo config type, and follows Expo transformer paths or Expo-specific config markers.
- Native platform CSS transforms into a JS module that calls `Uniwind.__reinit(...)`.
- Web platform CSS transforms into CSS plus web runtime setup.
- Resolver swaps React Native component imports to Uniwind-aware implementations where needed.

Vite integration:

- `uniwind(config)` returns a pre-Vite plugin.
- Vite aliases `react-native` to Uniwind web components, except imports from Uniwind internals resolve back to `react-native-web`.
- Vite replaces RNW `createOrderedCSSStyleSheet` with Uniwind's ordered stylesheet implementation.
- Vite uses Lightning CSS with `UniwindCSSVisitor`.
- Vite generates artifacts on `buildStart` and `generateBundle`.

## CSS Processing

Native processing converts Tailwind-generated CSS into metadata-rich style records.

Important concepts:

- A `Style` record stores entries, breakpoint bounds, orientation, theme, RTL, native flag, dependencies, source index, class name, important properties, selector complexity, pseudo-states, and data attributes.
- CSS variables live in `vars`; theme and platform-scoped variables live in `scopedVars` with internal prefixes.
- The processor treats declarations under `:root` or outside class rules as variables.
- Theme variants are recognized from known theme names.
- Data attribute variants support boolean `data-x` and exact `data-x="value"` matching against component props.
- Media queries drive dimensions, orientation, color scheme, platform, and native/web-specific metadata.
- Important declarations are preserved as `importantProperties`.
- Unsupported CSS features may be silently ignored on native. Prefer documenting support coverage over adding noisy runtime failures for every unsupported CSS construct.

Web visitor behavior:

- Theme root rules in Tailwind theme layer become theme class rules.
- Theme-prefixed class rules are scoped with CSS `@scope` to selected theme classes and excluded from other themes.
- Visitor state is cleaned between transforms.

## Components And HOC

Native components:

- Native wrappers import the underlying `react-native` component.
- `useStyle(className, props, state)` resolves `className` through `UniwindStore` and subscribes to style dependencies.
- Most components combine generated style before user style: `[generatedStyle, props.style]`, preserving user overrides.
- Stateful components such as `Pressable` pass `pressed`, `focused`, and `disabled` state into style resolution.
- Accent-capable components use `accentColor` extraction helpers where needed.

Web components:

- Web wrappers import from `react-native` as resolved by bundler aliases.
- Web wrappers map `className` to RNW CSS style markers through `toRNWClassName`.
- Web wrappers pass generated `dataSet` so data attribute variants can match.

`withUniwind`:

- Auto mode maps `className`-style props to matching RN style props and color class props to color props.
- Manual mode maps custom class props to custom target props and can extract a single style property.
- Native mode resolves to concrete RN style objects.
- Web mode usually emits RNW CSS style markers and uses computed style only for extracted values.

## Testing And Quality Gates

Package scripts:

- `bun run build`: unbuild package outputs.
- `bun run check:typescript`: TypeScript no-emit check.
- `bun run lint`: oxlint on `src`.
- `bun run circular:check`: dpdm circular dependency check.
- `bun run test:native`: Jest native tests.
- `bun run test:web`: Jest web tests.
- `bun run test:types`: type-level tests.
- `bun run test:e2e`: Playwright e2e tests.

Root scripts use Turbo for monorepo-wide build, typecheck, lint, test, format, and circular checks.

Testing layout:

- `tests/native`: component behavior and native style parsing.
- `tests/web`: web config, components, and HOC behavior.
- `tests/type-test`: public type expectations.
- `tests/e2e`: browser checks for web style extraction and generated artifacts.

Source-of-truth policy: repository code and tests win for implementation details. External docs at `docs.uniwind.dev` describe intended public behavior and should be updated when public behavior changes.

## Engineering Constraints

- Runtime performance matters. Prefer build-time CSS processing and narrow runtime invalidation over broad recomputation.
- Preserve user style precedence when adding component wrappers.
- Keep native and web behavior aligned unless platform constraints require divergence.
- Any new runtime dependency should map to `StyleDependency` and invalidate only affected subscribers.
- Theme-aware changes must account for global theme, adaptive system theme, and `ScopedTheme`.
- CSS variables must keep lazy getter semantics on native because values may depend on current runtime state.
- Avoid introducing compatibility paths without known consumers or persisted behavior.
- Add tests for native, web, and types when changing public API or cross-platform behavior.
