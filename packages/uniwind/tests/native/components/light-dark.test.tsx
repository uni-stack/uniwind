import { act } from '@testing-library/react-native'
import * as React from 'react'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileNativeCSS } from '../../../src/bundler/css-compiler/compileNativeCSS'
import { Platform, StyleDependency } from '../../../src/common/consts'
import View from '../../../src/components/native/View'
import { ScopedTheme } from '../../../src/components/ScopedTheme/ScopedTheme.native'
import { Uniwind } from '../../../src/core'
import { UniwindStore } from '../../../src/core/native/store'
import type { UniwindRuntime } from '../../../src/core/types'
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

    test('restores the resolution theme even when a getter throws', () => {
        const runtime = UniwindStore.runtime
        const lightDark = jest.spyOn(runtime, 'lightDark').mockImplementationOnce(() => {
            throw new Error('getter failed')
        })

        try {
            expect(() =>
                UniwindStore.getStyles('direct', undefined, undefined, {
                    scopedTheme: 'dark',
                    rtl: null,
                    variables: null,
                })
            ).toThrow('getter failed')
        } finally {
            lightDark.mockRestore()
        }

        expect(runtime.resolvingThemeName).toBeUndefined()
        expect(runtime.currentThemeName).toBe('light')
        expect(runtime.lightDark('#ffffff', '#000000')).toBe('#ffffff')
    })
})
