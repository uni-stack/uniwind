import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileCSS } from '../../../src/bundler/css-compiler'
import { Platform, StyleDependency } from '../../../src/common/consts'
import { UniwindStore } from '../../../src/core/native/store'
import type { ComponentState, StyleSheets } from '../../../src/core/types'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../consts'

type CompiledResult = {
    stylesheet: StyleSheets
}

const compileMetadata = async (): Promise<CompiledResult> => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: './tests/test.css',
    }, Platform.iOS)
    const virtualCode = await compileCSS(bundlerConfig)

    // oxlint-disable-next-line no-unused-vars
    const rt = { screen: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } }

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

        const expectMatches = (className: string, state: ComponentState) => {
            const style = stylesheet[className][0]
            const context = { scopedTheme: 'dark', rtl: null, variables: null }
            const rt = UniwindStore.runtime

            expect(style.matches(rt, context, undefined, state, {})).toBe(true)
            expect(style.matches(rt, { ...context, scopedTheme: 'light' }, undefined, state, {})).toBe(false)
            expect(style.matches(rt, context, undefined, {}, {})).toBe(false)
            expect(style).not.toHaveProperty('theme')
            expect(style).not.toHaveProperty('active')
            expect(style).not.toHaveProperty('dataAttributes')
        }

        expectMatches('dark:active:bg-purple-700', { isPressed: true })
        expectMatches('dark:active:focus:bg-purple-700', { isPressed: true, isFocused: true })
        expectMatches('active:dark:bg-purple-700', { isPressed: true })
    })
})
