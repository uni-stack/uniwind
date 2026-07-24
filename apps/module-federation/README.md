# Module Federation style isolation demo

This example runs one host and two independently compiled remotes. `react`,
`react-native`, and the exact `uniwind` package root are shared as Module
Federation singletons. It demonstrates Strategy A:

- The host owns the only full Tailwind entry and Preflight in `host/global.css`.
- Remote A emits a CSS delta with the explicit `rma` prefix and registers its
  native delta under the MF container name `remoteA`.
- Remote B emits a CSS delta with the explicit `rmb` prefix and registers its
  native delta under the MF container name `remoteB`.

There are three separate signals in each panel:

- An owner-only class proves that all three registrations remain installed.
- Each build uses the same semantic `mf-conflict` utility name. Remote selectors
  become `rma:mf-conflict` and `rmb:mf-conflict`, so they cannot collide.
- Each build defines `--color-mf-shared`. Tailwind emits remote variables as
  `--rma-color-mf-shared` and `--rmb-color-mf-shared`.

The diagnostic UI uses inline styles except for the colored signal bars. This
keeps the controls independent from the behavior under test. Each signal prints
its declared value and the value currently resolved by Uniwind, so verification
does not depend on distinguishing colors visually.

## Run

From the repository root:

```sh
bun install
bun run --cwd apps/module-federation web
```

With the web servers running, a separate terminal can execute the headed
browser assertions used to verify both load orders:

```sh
bun run --cwd apps/module-federation verify:web
```

The verifier uses the repository's existing Playwright installation; the demo
does not add Playwright as a dependency. If Chromium is not installed locally,
run `bunx playwright install chromium` once.

For the iOS simulator:

```sh
bun run --cwd apps/module-federation ios
```

The iOS command requires Xcode and CocoaPods. It generates the ignored
`host/ios` directory when needed, builds a local debug app, and installs it in
the simulator. It does not use Expo Go.

Both commands start three Metro servers:

| Project | Port |
| --- | --- |
| Host | 8081 |
| Remote A | 8082 |
| Remote B | 8083 |

Stop all three servers with:

```sh
bun run --cwd apps/module-federation stop
```

The remote URLs use `localhost`, so the native example targets the iOS
simulator rather than a physical device.

Expo is the React Native and Metro base for this example. The native owner
merge and web prefix isolation are not Expo-specific; the compatibility changes
needed to load the three graphs are described below.

## Strategy A integration

The remotes deliberately write their prefixes in both CSS and source
`className` values. There is no `StyleNamespace`, runtime class mapping, or
shared-class contract in this strategy.

`metro.shared.js` derives Uniwind's native owner ID from the existing Module
Federation `name`. The host keeps the normal `__reinit` path. Remote CSS modules
emit `__mergeStyles(remoteName, ...)`, so each remote replaces only its own
registration during HMR and disposes only its own registration.

On web, Tailwind prefixing isolates generated selectors and theme variables.
The remote entries import only `tailwindcss/theme.css`,
`tailwindcss/utilities.css`, and `uniwind`; they do not import Preflight.

## MF/Expo compatibility changes

The following integration code exists only to get three independent Metro
graphs into one runtime:

| Change | Why it is needed here | Production meaning |
| --- | --- | --- |
| Share `react`, `react-native`, and the exact `uniwind` root as versioned singletons; remotes use `import: false` | React and React Native cannot be duplicated safely, and native style deltas must reach the host's Uniwind store. Uniwind resolver-generated component subpaths are separate modules and are not made singletons by this entry. | Production needs an explicit sharing contract for the Uniwind root and public subpaths so all wrappers use one runtime/store graph. |
| Apply `withModuleFederation` before `withUniwindConfig`, then explicitly route generated `.mf-metro` imports through MF's resolver | Both wrappers own `resolveRequest`. Without explicit composition, Uniwind can rewrite MF runtime/provider imports and the remote container fails to initialize. | Production Metro configuration needs equivalent resolver composition until the integrations compose automatically. |
| Resolve package-internal Uniwind self-imports with the base resolver | Letting MF turn imports originating inside the Uniwind package back into its shared proxy can create provider cycles or route web-injected modules through the wrong resolver. | This origin-path exception is a temporary interoperability shim; the integrations need a defined resolver delegation contract. |
| Import `mf:init-host` explicitly and reinstall `mf:async-require` after importing Expo | Expo's web virtual entry bypasses MF's generated host-entry stub, and Expo installs its own split-bundle loader during startup. Explicit ordering makes startup deterministic on web and iOS. | An Expo-based production host needs equivalent startup ordering until MF handles Expo entries directly. |
| Capture Metro's active `__r` as `<federationName>__r` in `getRunModuleStatement` | MF emits prefixed require calls, but its experimental runtime patch does not reach Expo 57's prepended Metro runtime. Without the alias, evaluated remote modules cannot execute. | Demo-only Expo 57/MF bridge. It preserves each prefixed require function but does not restore unprefixed global Metro state after evaluating a remote; production needs an upstream graph-safe runtime integration. |
| Replace `mf:async-require` with `expo-federation-async-require.js` | MF's adapter wraps a prefixed `__loadBundleAsync` that is not initialized in this Expo 57 startup path, causing `loadBundleAsync is not a function`. The local adapter captures its graph prefix at module initialization, then fetches/evaluates bundles and populates that graph's shared/remote registries. | This implementation is a demo compatibility bridge, not a proposed production loader. A production app should use an upstream-supported loader/cache implementation with the same graph isolation and registry semantics. |
| Resolve `mf:remote-hmr` to a no-op | MF imports this module only from generated remote entries. Its implementation uses a native React Native deep import on web, and cross-registering remote entry points against the host graph caused Metro to resolve nonexistent host modules such as `./remoteA`. | Development-only. Production bundles have no HMR; a development environment needs graph-aware remote HMR before this can be re-enabled. This resolver rule does not change the host entry's HMR configuration. |
| Add CORS headers on all three Metro servers | Web manifests and bundles are fetched across ports 8081-8083. | Required only when production remotes are served from different origins and those origins do not already provide suitable CORS headers. |
| Alias `culori` to `culori/require` in Babel | This is the same Expo/Uniwind compatibility used by `apps/expo-example`; it selects Culori's bundled CommonJS entry for Metro. | Not specific to Module Federation. Keep only while the chosen Metro setup needs it. |
| Build a local iOS host instead of opening Expo Go | Expo Go's shell failed to reconnect reliably to the three-server setup even after all bundles compiled. The local app is also representative of how a native MF host is shipped. | Production always uses an app-owned native binary. The generated debug project is ignored here because Expo config can regenerate it. |

The audit removed two earlier experiments: remote URLs are no longer rewritten
with `hot=false`, and no custom rule disables host HMR. Both load orders work
without those overrides. Full `--no-dev` mode was also rejected because it
prevents the local development runtime from loading normally.

## Verify

1. Confirm all three host signals resolve to `#16a34a`.
2. Load Remote A, wait for it to render, then load Remote B.
3. Confirm Remote A stays `#facc15`, Remote B stays `#2563eb`, and the host
   stays `#16a34a`.
4. Use `Reload runtime`.
5. Load Remote B, wait for it to render, then load Remote A.
6. Confirm the same values remain stable.

A full reload is required between scenarios because loaded JavaScript modules
and web stylesheets remain registered for the lifetime of the runtime.

Expected on web and native: all nine signals retain their declared values in
both load orders. Web selectors and variables are unique by prefix. Native
styles and variables are merged by owner, with the host registration taking
precedence over accidental unprefixed conflicts.

## Remaining upstream work

1. Define composable resolver delegation between Uniwind, Module Federation,
   Expo, and other Metro wrappers.
2. Share the Uniwind root and resolver-generated public subpaths as one
   runtime/store graph.
3. Provide an Expo-compatible MF entry/split loader and graph-safe prefixed
   Metro runtime so the local async loader and require bridge are unnecessary.
4. Make remote HMR graph-aware and platform-safe.
