import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { patchMetroGraphToIncludeCssInLazyGraphs, patchMetroGraphToSupportUncachedModules } from '../../../src/bundler/adapters/metro/patches'

type FakeModule = {
    path: string
    output: Array<{ data: Record<string, unknown> }>
    unstable_transformResultKey: string
}

type FakeGraph = {
    dependencies: Map<string, FakeModule>
    entryPoints: Set<string>
    traverseDependencies: (paths: Array<string>, options: unknown) => Promise<{ paths: Array<string> }>
    initialTraverseDependencies: (options: unknown) => Promise<{ entryPoints: Array<string> }>
}

// Another Metro copy than the one this package resolves, already loaded the way a CLI loads its own Metro
// (React Native CLI's community plugin depends on one) before it evaluates the config.
const fakeMetroGraphSource = `
class Graph {
    constructor() {
        this.dependencies = new Map()
        this.entryPoints = new Set(['/app/index.js'])
    }

    async traverseDependencies(paths) {
        return { paths: [...paths] }
    }

    async initialTraverseDependencies() {
        return { entryPoints: [...this.entryPoints] }
    }
}

module.exports = { Graph }
`

let root: string
let CliGraph: new () => FakeGraph

beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'uniwind-metro-patches-'))
    const graphModulePath = join(root, 'node_modules', 'metro', 'src', 'DeltaBundler', 'Graph.js')

    mkdirSync(join(graphModulePath, '..'), { recursive: true })
    writeFileSync(graphModulePath, fakeMetroGraphSource)
    CliGraph = require(graphModulePath).Graph

    patchMetroGraphToSupportUncachedModules()
    patchMetroGraphToIncludeCssInLazyGraphs('/app/global.css')
})

afterAll(() => {
    rmSync(root, { recursive: true, force: true })
})

test('re-traverses uncached modules in every loaded Metro graph', async () => {
    const graph = new CliGraph()
    const cssEntry: FakeModule = { path: '/app/global.css', output: [{ data: { css: { skipCache: true } } }], unstable_transformResultKey: 'key' }
    const cachedModule: FakeModule = { path: '/app/App.tsx', output: [{ data: {} }], unstable_transformResultKey: 'key' }

    graph.dependencies.set(cssEntry.path, cssEntry)
    graph.dependencies.set(cachedModule.path, cachedModule)

    await expect(graph.traverseDependencies(['/app/tokens.css'], {})).resolves.toEqual({
        paths: ['/app/tokens.css', '/app/global.css'],
    })
    expect(cssEntry.unstable_transformResultKey).toBe('key.')
    expect(cachedModule.unstable_transformResultKey).toBe('key')
})

test('adds the CSS entry to lazy development graphs of every loaded Metro graph', async () => {
    await expect(new CliGraph().initialTraverseDependencies({ lazy: true, transformOptions: { dev: true } })).resolves.toEqual({
        entryPoints: ['/app/index.js', '/app/global.css'],
    })
    await expect(new CliGraph().initialTraverseDependencies({ lazy: false, transformOptions: { dev: true } })).resolves.toEqual({
        entryPoints: ['/app/index.js'],
    })
})

test('patches each Metro graph once', () => {
    const { traverseDependencies } = CliGraph.prototype

    patchMetroGraphToSupportUncachedModules()

    expect(CliGraph.prototype.traverseDependencies).toBe(traverseDependencies)
})
