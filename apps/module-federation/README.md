# Module Federation conflict reproduction

This example runs one host and two independently compiled remotes. `react`,
`react-native`, and the exact `uniwind` package root are shared as Module
Federation singletons. Each project has a distinctly named Uniwind CSS entry:

- Host: green classes and `--mf-shared-color`
- Remote A: yellow classes and `--mf-shared-color`
- Remote B: blue classes and `--mf-shared-color`

There are three separate signals in each panel:

- An owner-only class proves whether that build's registry or stylesheet remains.
- `mf-conflict` has a different declaration in every build and demonstrates
  selector collision.
- `mf-variable-probe` has the same declaration in every build but reads the
  differently defined `--mf-shared-color`, demonstrating variable collision.

The diagnostic UI uses inline styles except for the colored signal bars. This
keeps the controls readable after the native Uniwind registry is replaced.
Distinct CSS filenames also prevent Expo's CSS HMR identity from replacing an
earlier graph's entire stylesheet, so the web result isolates selector and
variable collisions.

## Run

From the repository root:

```sh
bun install
bun run --cwd apps/module-federation web
```

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

Expo is the React Native and Metro base for this example. The native Uniwind
state replacement and web selector/variable collisions are not Expo-specific;
the compatibility changes needed to load the three graphs are described below.

## Compatibility changes

No Uniwind source files are changed. The following integration code exists
only to get three independent Metro graphs into one runtime:

| Change | Why it is needed here | Production meaning |
| --- | --- | --- |
| Share `react`, `react-native`, and the exact `uniwind` root as versioned singletons; remotes use `import: false` | React and React Native cannot be duplicated safely, and sharing the Uniwind root reproduces the native `__reinit` collision. Uniwind resolver-generated component subpaths are separate modules and are not made singletons by this entry. | Production needs an explicit sharing contract for the Uniwind root and public subpaths so all wrappers use one runtime/store graph. |
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

These changes preserve Module Federation loading only. They intentionally do
not merge, namespace, or isolate Uniwind state.

## Reproduce

1. Confirm both host signals are green.
2. Load Remote A, wait for it to render, then load Remote B.
3. Record the unique and conflict signal colors.
4. Use `Reload runtime`.
5. Load Remote B, wait for it to render, then load Remote A.

A full reload is required between scenarios because loaded JavaScript modules
and web stylesheets remain registered for the lifetime of the runtime.

## Expected failure

### Web

All owner-only signals remain styled because each graph's stylesheet remains
installed. Every `mf-conflict` signal uses the selector definition from the
last loaded remote. Every `mf-variable-probe` resolves the global
`--mf-shared-color` from the last loaded remote. Reversing load order reverses
both collision colors.

### Native

Each CSS entry executes `Uniwind.__reinit(...)`. Loading a remote replaces the
complete native stylesheet registry, variables, and cache. After A then B,
only B's owner-only signal remains styled and every class/variable conflict
signal is blue. After B then A, only A's owner-only signal remains styled and
every class/variable conflict signal is yellow.

This example intentionally contains no merge, namespace, or isolation fix.

## Remaining upstream work

1. Add merge, namespace, or isolation semantics for independently compiled
   native Uniwind registrations and web selectors/variables.
2. Define composable resolver delegation between Uniwind, Module Federation,
   Expo, and other Metro wrappers.
3. Share the Uniwind root and resolver-generated public subpaths as one
   runtime/store graph.
4. Provide an Expo-compatible MF entry/split loader and graph-safe prefixed
   Metro runtime so the local async loader and require bridge are unnecessary.
5. Make remote HMR graph-aware and platform-safe.
