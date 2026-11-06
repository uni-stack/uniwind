import { act } from '@testing-library/react-native'
import * as React from 'react'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileNativeCSS } from '../../../src/bundler/css-compiler/compileNativeCSS'
import { Platform, StyleDependency } from '../../../src/common/consts'
import View from '../../../src/components/native/View'
import { ScopedTheme } from '../../../src/components/ScopedTheme/ScopedTheme.native'
import { Uniwind } from '../../../src/core'
import { lightDark } from '../../../src/core/native/native-utils'
import { UniwindStore } from '../../../src/core/native/store'
import type { GenerateStyleSheetsCallback, UniwindRuntime } from '../../../src/core/types'
import { getVariableValue } from '../../../src/hooks/useCSSVariable/getVariableValue.native'
import { renderUniwind } from '../utils'

describe('Native light-dark()', () => {
    beforeEach(() => {
        Uniwind.setTheme('light')
        const config = UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css' }, Platform.iOS)
        const code = compileNativeCSS(config, '.direct { background-color: light-dark(#ffffff, #000000); }')

        UniwindStore.reinit((rt: UniwindRuntime) => eval(code), ['light', 'dark'])
    })

    afterEach(() => {
        act(() => Uniwind.setTheme('light'))
    })

    describe.each(['light', 'dark'])('with global theme %s', initialTheme => {
        test('follows scoped themes across global switches', () => {
            Uniwind.setTheme(initialTheme)
            const { getStylesFromId } = renderUniwind(
                <React.Fragment>
                    <View className="direct" testID="base" />
                    <ScopedTheme theme="dark">
                        <View className="direct" testID="dark" />
                        <ScopedTheme theme="light">
                            <View className="direct" testID="light" />
                        </ScopedTheme>
                    </ScopedTheme>
                </React.Fragment>,
            )

            for (const theme of [initialTheme, initialTheme === 'light' ? 'dark' : 'light', initialTheme]) {
                act(() => Uniwind.setTheme(theme))

                expect(getStylesFromId('base').backgroundColor).toBe(theme === 'dark' ? '#000000' : '#ffffff')
                expect(getStylesFromId('dark').backgroundColor).toBe('#000000')
                expect(getStylesFromId('light').backgroundColor).toBe('#ffffff')
            }
        })
    })

    test('tracks global theme but keeps scoped caches independent', () => {
        const resolve = (scopedTheme: string | null) =>
            UniwindStore.getStyles('direct', undefined, undefined, { scopedTheme, rtl: null, variables: null })
        const global = resolve(null)
        const light = resolve('light')
        const dark = resolve('dark')

        expect(global.dependencies).toContain(StyleDependency.Theme)
        expect(global.dependencySum & (1 << StyleDependency.Theme)).not.toBe(0)
        expect(light.dependencies).not.toContain(StyleDependency.Theme)
        expect(dark.dependencies).not.toContain(StyleDependency.Theme)
        expect(light.dependencySum & (1 << StyleDependency.Theme)).toBe(0)
        expect(dark.dependencySum & (1 << StyleDependency.Theme)).toBe(0)

        act(() => Uniwind.setTheme('dark'))

        expect(resolve(null).styles.backgroundColor).toBe('#000000')
        expect(resolve('light')).toBe(light)
        expect(resolve('dark')).toBe(dark)

        act(() => Uniwind.setTheme('light'))

        expect(resolve(null).styles.backgroundColor).toBe('#ffffff')
        expect(resolve('light')).toBe(light)
        expect(resolve('dark')).toBe(dark)
    })

    test('updates when the scoped theme prop changes', () => {
        const { getStylesFromId, rerender } = renderUniwind(
            <ScopedTheme theme="light">
                <View className="direct" testID="scoped" />
            </ScopedTheme>,
        )

        expect(getStylesFromId('scoped').backgroundColor).toBe('#ffffff')

        rerender(
            <ScopedTheme theme="dark">
                <View className="direct" testID="scoped" />
            </ScopedTheme>,
        )

        expect(getStylesFromId('scoped').backgroundColor).toBe('#000000')
    })

    test.each(['light', 'dark', 'sepia'])('lightDark uses its explicit %s theme argument', themeName => {
        Uniwind.setTheme('dark')

        expect(lightDark('#ffffff', '#000000', themeName)).toBe(themeName === 'dark' ? '#000000' : '#ffffff')
    })

    test('forwards the theme through style and variable getter chains', () => {
        const config = UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css' }, Platform.iOS)
        const code = compileNativeCSS(
            config,
            `
            :root { --alias: var(--adaptive); }
            .direct { background-color: light-dark(#ffffff, #000000); }
            .variable { background-color: var(--alias); }
        `,
        )

        UniwindStore.reinit((rt: UniwindRuntime) => {
            const generated: ReturnType<GenerateStyleSheetsCallback> = eval(code)
            // Use a compiled light-dark getter as the leaf to exercise variable forwarding
            // independently of the parser's support for light-dark in custom properties.
            generated.vars['--adaptive'] = generated.stylesheet.direct[0].entries[0][1]

            return generated
        }, ['light', 'dark'])

        for (const scopedTheme of ['light', 'dark']) {
            const context = { scopedTheme, rtl: null, variables: null }
            const expected = scopedTheme === 'dark' ? '#000000' : '#ffffff'

            expect(UniwindStore.getStyles('variable', undefined, undefined, context).styles.backgroundColor).toBe(expected)
            expect(getVariableValue('--alias', context)).toBe(expected)
        }
    })
})
