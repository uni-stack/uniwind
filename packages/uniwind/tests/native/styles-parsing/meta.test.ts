import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileCSS } from '../../../src/bundler/css-compiler'
import { Platform, StyleDependency } from '../../../src/common/consts'
import { StyleSheets } from '../../../src/core/types'

type CompiledResult = {
    stylesheet: StyleSheets
}

const compileMetadata = async (): Promise<CompiledResult> => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: './tests/test.css',
    }, Platform.iOS)
    const virtualCode = await compileCSS(bundlerConfig)

    // oxlint-disable-next-line no-unused-vars
    const rt = {}

    // oxlint-disable-next-line no-eval
    return eval(`(${virtualCode})`)
}

describe('Styles Metadata', () => {
    test('Theme Style Dependency', async () => {
        const { stylesheet } = await compileMetadata()

        expect(stylesheet['bg-background'][0].dependencies).toContain(StyleDependency.Theme)
        expect(stylesheet['bg-foreground'][0].dependencies).toContain(StyleDependency.Theme)
    })
})
