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

    test('Combined variants', async () => {
        const { stylesheet } = await compileMetadata()

        const expectMeta = (className: string, expected: Partial<StyleSheets[string][number]>) => {
            const meta = stylesheet[className][0]

            expect(meta.theme).toBe(expected.theme ?? null)
            expect(meta.active).toBe(expected.active ?? null)
            expect(meta.focus).toBe(expected.focus ?? null)
            expect(meta.rtl).toBe(expected.rtl ?? null)
            expect(meta.disabled).toBe(expected.disabled ?? null)
            expect(meta.dataAttributes).toEqual(expected.dataAttributes ?? null)
        }

        expectMeta('dark:active:bg-purple-700', { theme: 'dark', active: true })
        expectMeta('dark:active:focus:bg-purple-700', { theme: 'dark', active: true, focus: true })
        expectMeta('active:dark:bg-purple-700', { theme: 'dark', active: true })
    })
})
