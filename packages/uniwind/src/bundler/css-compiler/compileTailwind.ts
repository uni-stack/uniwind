import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import fs from 'fs'
import path from 'path'
import type { UniwindBundlerConfig } from '../config'

export const compileTailwind = async (bundlerConfig: UniwindBundlerConfig) => {
    const css = await fs.promises.readFile(bundlerConfig.cssPath, 'utf-8')
    const compiler = await compile(css, {
        base: path.dirname(bundlerConfig.cssPath),
        onDependency: () => void 0,
    })
    const scanner = new Scanner({
        sources: [
            ...compiler.sources,
            {
                negated: false,
                pattern: '**/*',
                base: path.dirname(bundlerConfig.cssPath),
            },
        ],
    })
    const scannedCandidates = scanner.scan()
    const sharedClassNames = new Set(bundlerConfig.sharedClassNames)
    let candidates = scannedCandidates

    if (bundlerConfig.isFederationHost) {
        candidates = Array.from(new Set([...scannedCandidates, ...sharedClassNames]))
    } else if (bundlerConfig.isFederationRemote) {
        candidates = scannedCandidates.filter(candidate => !sharedClassNames.has(candidate))
    }

    return compiler.build(candidates)
}
