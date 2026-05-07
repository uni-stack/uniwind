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

    return compiler.build(scanner.scan())
}
