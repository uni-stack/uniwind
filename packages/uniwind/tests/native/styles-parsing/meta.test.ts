import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Platform } from '../../../src/common/consts'
import { StyleSheets } from '../../../src/core/types'
import { compileVirtual } from '../../../src/metro/compileVirtual'
import { StyleDependency } from '../../../src/types'

type CompiledResult = {
    stylesheet: StyleSheets
}

const compileMetadata = async (candidates: Array<string>): Promise<CompiledResult> => {
    const cssPath = resolve('./tests/test.css')
    const css = readFileSync(cssPath, 'utf-8')
    const virtualCode = await compileVirtual({
        css,
        cssPath,
        debug: false,
        platform: Platform.iOS,
        themes: ['light', 'dark'],
        polyfills: undefined,
        candidates,
    })

    // oxlint-disable-next-line no-unused-vars
    const rt = {}

    // oxlint-disable-next-line no-eval
    return eval(`(${virtualCode})`)
}

describe('Styles Metadata', () => {
    test('Theme Style Dependency', async () => {
        const { stylesheet } = await compileMetadata(['bg-background', 'bg-foreground'])

        expect(stylesheet['bg-background'][0].dependencies).toContain(StyleDependency.Theme)
        expect(stylesheet['bg-foreground'][0].dependencies).toContain(StyleDependency.Theme)
    })
})
