import { transform as workerTransform } from 'metro-transform-worker'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { transform } from '../../../src/bundler/adapters/metro/transformer'
import { UniwindBundlerConfig } from '../../../src/bundler/config'

jest.mock('metro-transform-worker', () => ({ transform: jest.fn() }))
jest.mock('@expo/metro-config', () => ({ unstable_transformerPath: 'metro-transform-worker' }))

const mockWorker = jest.mocked(workerTransform)
const options = {
    dev: true,
    minify: false,
    platform: 'ios',
    type: 'module',
    inlineRequires: false,
    experimentalImportSupport: false,
    inlinePlatform: true,
    unstable_transformProfile: 'default',
} satisfies Parameters<typeof transform>[4]

let root: string
let entry: string

beforeEach(() => {
    root = realpathSync(mkdtempSync(path.join(tmpdir(), 'uniwind-css-imports-')))
    entry = path.join(root, 'app', 'global.css')
    mkdirSync(path.dirname(entry), { recursive: true })
    writeFileSync(path.join(root, 'app', 'tokens.css'), '@theme static { --color-brand: #123456; }')
    writeFileSync(entry, '@import "./tokens.css"; @tailwind utilities; @source inline("bg-brand");')
    // Artifact generation is independent of the compiler/Metro dependency contract under test.
    jest.spyOn(UniwindBundlerConfig.prototype, 'generateArtifacts').mockResolvedValue(undefined)
    mockWorker.mockImplementation(async (_config, _root, _file, data) => ({
        dependencies: [],
        output: [{ type: 'js/module', data: { code: data.toString(), lineCount: 1, map: [], functionMap: null } }],
    }))
})

afterEach(() => {
    jest.restoreAllMocks()
    mockWorker.mockClear()
    rmSync(root, { force: true, recursive: true })
})

const transformFile = async (file = entry, platform = 'ios', isExpoProject = false, type: 'module' | 'asset' = 'module') => {
    const config = {
        uniwind: { cssEntryFile: path.relative(process.cwd(), entry), isExpoProject },
    } as Parameters<typeof transform>[0]
    const result = await transform(config, root, path.relative(root, file), readFileSync(file), { ...options, platform, type })

    return result.output[0].data.code as string
}

const runNativeModule = (code: string) => {
    const reinit = jest.fn()
    const required: Array<string> = []
    const requireModule = (name: string) => {
        required.push(name)
        return { Uniwind: { __reinit: reinit } }
    }

    new Function('require', code)(requireModule)
    const [stylesheet, , fingerprint] = reinit.mock.calls[0]

    return { required, fingerprint, variables: stylesheet({}).vars }
}

test.each(['ios', 'android'])('registers direct, nested and shared CSS imports once on %s', async platform => {
    mkdirSync(path.join(root, 'shared'))
    mkdirSync(path.join(root, 'app', 'node_modules', '@fixture'), { recursive: true })
    writeFileSync(path.join(root, 'shared', 'theme.css'), '@theme static { --spacing-shared: 8px; }')
    symlinkSync(path.join(root, 'shared'), path.join(root, 'app', 'node_modules', '@fixture', 'theme'), 'dir')
    writeFileSync(path.join(root, 'app', 'nested.css'), '@theme static { --spacing-nested: 4px; }')
    writeFileSync(path.join(root, 'app', 'tokens.css'), '@import "./nested.css"; @theme static { --color-brand: #123456; }')
    writeFileSync(
        entry,
        [
            '@import "./tokens.css";',
            '@import "./nested.css";',
            '@import "@fixture/theme/theme.css";',
            '@tailwind utilities;',
            '@source inline("bg-brand");',
        ].join('\n'),
    )

    const { required } = runNativeModule(await transformFile(entry, platform))

    expect(required.sort()).toEqual(['../shared/theme.css', './nested.css', './tokens.css', 'uniwind'])
})

test('does not register CSS from installed dependencies', async () => {
    mkdirSync(path.join(root, 'app', 'node_modules', 'vendor'), { recursive: true })
    writeFileSync(path.join(root, 'app', 'node_modules', 'vendor', 'theme.css'), '@theme static { --spacing-vendor: 2px; }')
    writeFileSync(entry, '@import "./tokens.css"; @import "vendor/theme.css";')

    expect(runNativeModule(await transformFile()).required).toEqual(['./tokens.css', 'uniwind'])
})

test('recompiles token-only edits and updates the stylesheet fingerprint', async () => {
    const before = runNativeModule(await transformFile())
    writeFileSync(path.join(root, 'app', 'tokens.css'), '@theme static { --color-brand: #654321; }')
    const after = runNativeModule(await transformFile())

    expect(before.required).toContain('./tokens.css')
    expect(before.variables['--color-brand']({})).toBe('#123456')
    expect(after.variables['--color-brand']({})).toBe('#654321')
    expect(after.fingerprint).not.toBe(before.fingerprint)
})

test('updates import dependencies without changing an identical stylesheet fingerprint', async () => {
    const before = runNativeModule(await transformFile())
    writeFileSync(path.join(root, 'app', 'extra.css'), '/* no styles */')
    writeFileSync(entry, `${readFileSync(entry, 'utf8')}\n@import "./extra.css";`)
    const added = runNativeModule(await transformFile())
    writeFileSync(entry, '@import "./tokens.css"; @tailwind utilities; @source inline("bg-brand");')
    const removed = runNativeModule(await transformFile())

    expect(added.required).toEqual(['./extra.css', './tokens.css', 'uniwind'])
    expect(removed.required).toEqual(before.required)
    expect(added.fingerprint).toBe(before.fingerprint)
    expect(removed.fingerprint).toBe(before.fingerprint)
})

test.each(['ios', 'android'])('transforms non-entry CSS into an empty JS module in plain Metro on %s', async platform => {
    const file = path.join(root, 'app', 'tokens.css')

    expect(await transformFile(file, platform)).toBe('')
    expect(mockWorker.mock.calls[0][2]).toBe(path.join('app', 'tokens.css.js'))
})

test('leaves non-entry CSS handling to Expo', async () => {
    const file = path.join(root, 'app', 'tokens.css')

    expect(await transformFile(file, 'ios', true)).toBe(readFileSync(file, 'utf8'))
    expect(mockWorker.mock.calls[0][2]).toBe(path.join('app', 'tokens.css'))
    expect(runNativeModule(await transformFile(entry, 'ios', true)).required).toContain('./tokens.css')
})

test('preserves web CSS output without native dependency requires', async () => {
    const code = await transformFile(entry, 'web')

    expect(code).toContain('--color-brand: #123456')
    expect(code).not.toContain('require(')
    expect(mockWorker.mock.calls[0][2]).toBe(path.join('app', 'global.css'))
    const file = path.join(root, 'app', 'tokens.css')
    expect(await transformFile(file, 'web')).toBe(readFileSync(file, 'utf8'))
})

test('preserves asset and JavaScript transformations', async () => {
    const file = path.join(root, 'app', 'tokens.css')
    expect(await transformFile(file, 'ios', false, 'asset')).toBe(readFileSync(file, 'utf8'))
    const script = path.join(root, 'app', 'index.js')
    writeFileSync(script, 'module.exports = 123')
    expect(await transformFile(script)).toBe('module.exports = 123')
})

test('keeps hidden directories and spaces in local CSS paths relative', async () => {
    mkdirSync(path.join(root, 'app', '.theme'))
    writeFileSync(path.join(root, 'app', '.theme', 'brand tokens.css'), '@theme static { --color-brand: #123456; }')
    writeFileSync(entry, '@import "./.theme/brand tokens.css";')

    expect(runNativeModule(await transformFile()).required).toEqual(['./.theme/brand tokens.css', 'uniwind'])
})
