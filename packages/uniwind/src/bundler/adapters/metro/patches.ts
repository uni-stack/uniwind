import type { Graph, Result as GraphResult } from '@expo/metro/metro/DeltaBundler/Graph'
import FileStoreBase from 'metro-cache/private/stores/FileStore'
import type * as MetroGraphModule from 'metro/private/DeltaBundler/Graph'
import type { Options as GraphOptions } from 'metro/private/DeltaBundler/types'
import os from 'os'
import path from 'path'

class FileStore<T> extends FileStoreBase<T> {
    async set(key: Buffer, value: any): Promise<void> {
        if (value?.output?.[0]?.data?.css?.skipCache) {
            return
        }

        return super.set(key, value)
    }
}

export const cacheStore = new FileStore<any>({
    root: path.join(os.tmpdir(), 'metro-cache'),
})

interface TraverseDependencies {
    (paths: readonly string[], options: GraphOptions<any>): Promise<GraphResult<any>>
    __patched?: boolean
}

interface InitialTraverseDependencies {
    (options: GraphOptions<any>): Promise<GraphResult<any>>
    __uniwindLazyCssEntryPatched?: boolean
}

type MetroGraph = typeof MetroGraphModule.Graph

const graphModuleSuffix = path.join('metro', 'src', 'DeltaBundler', 'Graph.js')

// The Metro this package resolves isn't always the one running the server: a CLI can depend on its own copy, as React
// Native CLI's community plugin and `@expo/metro` do, while the workspace hoists another. Both load their Metro graph
// before they evaluate the config that applies these patches, so every Metro graph module already loaded is patched too.
const getMetroGraphs = () => {
    const graphs = new Set<MetroGraph>([(require('metro/private/DeltaBundler/Graph') as typeof MetroGraphModule).Graph])

    Object.entries(require.cache).forEach(([filename, loadedModule]) => {
        const graph = (loadedModule?.exports as Partial<typeof MetroGraphModule> | undefined)?.Graph

        if (filename.endsWith(`${path.sep}${graphModuleSuffix}`) && typeof graph === 'function') {
            graphs.add(graph)
        }
    })

    return graphs
}

export const patchMetroGraphToIncludeCssInLazyGraphs = (cssEntryPath: string) => {
    getMetroGraphs().forEach(GraphClass => {
        // oxlint-disable-next-line @typescript-eslint/unbound-method
        const original_initialTraverseDependencies = GraphClass.prototype.initialTraverseDependencies as unknown as InitialTraverseDependencies

        if (original_initialTraverseDependencies.__uniwindLazyCssEntryPatched) {
            return
        }

        async function initialTraverseDependencies(this: Graph, options: GraphOptions<any>) {
            if (options.lazy && options.transformOptions.dev) {
                const entryPoints = this.entryPoints as Set<string>
                entryPoints.add(cssEntryPath)
            }

            return original_initialTraverseDependencies.call(this, options)
        }

        // @ts-expect-error patch Graph initialTraverseDependencies method
        GraphClass.prototype.initialTraverseDependencies = initialTraverseDependencies
        initialTraverseDependencies.__uniwindLazyCssEntryPatched = true
    })
}

export const patchMetroGraphToSupportUncachedModules = () => {
    getMetroGraphs().forEach(GraphClass => {
        // oxlint-disable-next-line @typescript-eslint/unbound-method
        const original_traverseDependencies = GraphClass.prototype.traverseDependencies as unknown as TraverseDependencies

        if (original_traverseDependencies.__patched) {
            return
        }

        original_traverseDependencies.__patched = true

        function traverseDependencies(this: Graph, paths: Array<string>, options: GraphOptions<any>) {
            this.dependencies.forEach(dependency => {
                if (
                    dependency.output.find(file => (file.data as any)?.css?.skipCache === true)
                    && !paths.includes(dependency.path)
                ) {
                    // @ts-expect-error Hidden property
                    dependency.unstable_transformResultKey = `${dependency.unstable_transformResultKey}.`
                    paths.push(dependency.path)
                }
            })

            return original_traverseDependencies.call(this, paths, options)
        }

        // @ts-expect-error patch Graph traverseDependencies method
        GraphClass.prototype.traverseDependencies = traverseDependencies
        traverseDependencies.__patched = true
    })
}
