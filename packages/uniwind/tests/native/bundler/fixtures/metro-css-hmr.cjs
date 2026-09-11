const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { createRequire } = require('node:module')

// Run directly: node packages/uniwind/tests/native/bundler/fixtures/metro-css-hmr.cjs bare ios
const packageRoot = path.resolve(__dirname, '../../../..')
const repo = path.resolve(packageRoot, '../..')
const req = createRequire(path.join(repo, 'package.json'))
const { default: IncrementalBundler } = req('metro/private/IncrementalBundler')
const [kind = 'bare', platform = 'ios'] = process.argv.slice(2)
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'uniwind-live-metro-')))
const entry = path.join(root, 'index.js')
const css = path.join(root, 'global.css')
const tokens = path.join(root, 'tokens.css')
const nested = path.join(root, 'nested.css')
const runtime = path.join(root, 'runtime.js')
const results = { kind, platform, pid: process.pid, updates: [] }

async function main() {
    fs.symlinkSync(path.join(repo, 'node_modules'), path.join(root, 'node_modules'), 'dir')
    const isolatedPackage = path.join(root, 'uniwind')
    // Build current sources in isolation so the test cannot use stale dist output.
    execFileSync(process.execPath, [
        '--input-type=module',
        '-e',
        `
        import { build } from 'unbuild';
        await build(process.cwd(), false, {
            hooks: {
                'build:prepare': ctx => {
                    ctx.options.entries = ctx.options.entries.filter(entry => entry.name === 'metro/index' || entry.name === 'metro/transformer');
                    ctx.options.outDir = process.argv[1];
                    // This fixture does not build the other package exports.
                    ctx.options.failOnWarn = false;
                },
            },
        });
    `,
        path.join(isolatedPackage, 'dist'),
    ], { cwd: packageRoot, stdio: 'pipe', timeout: 15_000 })
    const { withUniwindConfig } = require(path.join(isolatedPackage, 'dist/metro/index.cjs'))
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'uniwind-hmr-fixture', private: true }))
    fs.writeFileSync(
        path.join(root, 'babel.config.js'),
        `module.exports = { presets: [${JSON.stringify(req.resolve(kind === 'expo' ? 'babel-preset-expo' : '@react-native/babel-preset'))}] };`,
    )
    fs.writeFileSync(entry, `require('./global.css'); global.__fixtureSession = 'retained';`)
    fs.writeFileSync(runtime, 'module.exports = { Uniwind: { __reinit() {} } };')
    fs.writeFileSync(css, '@import "./tokens.css"; @tailwind utilities; @source inline("bg-brand");')
    fs.writeFileSync(tokens, '@import "./nested.css";')
    fs.writeFileSync(nested, '@theme static { --color-brand: #123456; }')
    const { getDefaultConfig } = req(kind === 'expo' ? '@expo/metro-config' : '@react-native/metro-config')
    let config = await getDefaultConfig(root)
    config.maxWorkers = 1
    config.watchFolders = [root, path.join(repo, 'node_modules'), path.join(repo, 'packages/uniwind')]
    config.resolver.useWatchman = false
    config.resolver.nodeModulesPaths = [path.join(repo, 'node_modules')]
    config.resolver.resolveRequest = (context, moduleName, target) =>
        moduleName === 'uniwind'
            ? { type: 'sourceFile', filePath: runtime }
            : context.resolveRequest(context, moduleName, target)
    config.reporter = { update() {} }
    config = withUniwindConfig(config, {
        cssEntryFile: path.relative(process.cwd(), css),
        dtsFile: path.join(root, 'uniwind-types.d.ts'),
    })
    results.expoWorker = config.transformer.uniwind.isExpoProject
    assert.equal(results.expoWorker, kind === 'expo')
    const bundler = new IncrementalBundler(config, { watch: true })
    let unlisten
    try {
        await bundler.ready()
        let { revision } = await bundler.initializeGraph(entry, {
            dev: true,
            hot: true,
            minify: false,
            platform,
            type: 'module',
            unstable_transformProfile: 'default',
        }, { customResolverOptions: {} })
        assert(revision.graph.dependencies.has(tokens), 'direct CSS missing from Metro graph')
        assert(revision.graph.dependencies.has(nested), 'nested CSS missing from Metro graph')
        const codeFor = file => revision.graph.dependencies.get(file).output.find(output => output.type.startsWith('js/')).data.code
        assert(codeFor(css).includes('#123456'), 'initial token missing')
        results.cssModules = [css, tokens, nested].map(file => path.basename(file))
        for (const color of ['#654321', '#123456']) {
            const change = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Metro did not report a token-only change in 15s')), 15000)
                const watcher = bundler.getBundler().getWatcher()
                const listener = event => {
                    if (Array.from(event.changes.modifiedFiles, ([file]) => file).some(file => path.join(event.rootDir, file) === nested)) {
                        clearTimeout(timeout)
                        resolve()
                    }
                }
                watcher.on('change', listener)
                unlisten = () => {
                    clearTimeout(timeout)
                    watcher.off('change', listener)
                }
            })
            fs.writeFileSync(nested, `@theme static { --color-brand: ${color}; }`)
            await change
            unlisten()
            const update = await bundler.updateGraph(revision, false)
            revision = update.revision
            assert(update.delta.modified.has(css), 'CSS entry did not appear in the HMR delta')
            assert(!update.delta.modified.has(entry), 'JavaScript entry changed during a token-only update')
            assert(codeFor(css).includes(color), `Updated token ${color} missing from CSS entry`)
            results.updates.push({ color, modified: [...update.delta.modified.keys()].map(file => path.basename(file)), reset: update.delta.reset })
            assert.equal(update.delta.reset, false)
        }
        console.log(JSON.stringify(results, null, 2))
    } finally {
        unlisten?.()
        await bundler.end()
    }
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
}).finally(() => fs.rmSync(root, { recursive: true, force: true }))
