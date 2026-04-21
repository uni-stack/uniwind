import type { Graph, Result as GraphResult } from '@expo/metro/metro/DeltaBundler/Graph'
import FileStoreBase from 'metro-cache/private/stores/FileStore'
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

export const patchMetroGraphToSupportUncachedModules = () => {
    const { Graph } = require('metro/private/DeltaBundler/Graph') as typeof import('metro/private/DeltaBundler/Graph')

    // oxlint-disable-next-line @typescript-eslint/unbound-method
    const original_traverseDependencies = Graph.prototype.traverseDependencies as unknown as TraverseDependencies

    if (original_traverseDependencies.__patched) {
        return
    }

    original_traverseDependencies.__patched = true

    function traverseDependencies(this: Graph, paths: Array<string>, options: GraphOptions<any>) {
        this.dependencies.forEach(dependency => {
            if (
                dependency.output.find(file => file.data.css?.skipCache === true)
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
    Graph.prototype.traverseDependencies = traverseDependencies
    traverseDependencies.__patched = true
}
