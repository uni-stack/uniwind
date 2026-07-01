import { act } from '@testing-library/react-native'
import * as React from 'react'
import View from '../../../src/components/native/View'
import { ScopedTheme } from '../../../src/components/ScopedTheme/ScopedTheme.native'
import { ScopedVariables } from '../../../src/components/ScopedVariables/ScopedVariables.native'
import { Uniwind } from '../../../src/core'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'
import { renderUniwind } from '../utils'

// Utility classes below reference custom properties so the Tailwind scanner
// generates them into the native stylesheet:
//   text-(--color-primary) -> color: var(--color-primary)
//   gap-(--gap)            -> gap: var(--gap)
//   bg-background          -> background-color: var(--color-background)

describe('ScopedVariables', () => {
    afterEach(() => {
        act(() => {
            Uniwind.setTheme('light')
            Uniwind.updateCSSVariables('light', { '--color-background': '#ffffff' })
            Uniwind.updateCSSVariables('dark', { '--color-background': '#000000' })
        })
    })

    test('overrides apply inside the subtree, defaults apply outside', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-(--color-primary)" testID="outside" />
                <ScopedVariables variables={{ '--color-primary': '#3b82f6' }}>
                    <View className="text-(--color-primary)" testID="inside" />
                </ScopedVariables>
            </React.Fragment>,
        )

        // Outside the provider the variable is not defined by the theme -> undefined
        expect(getStylesFromId('outside').color).toBeUndefined()
        // Inside the provider the scoped value applies (normalized to hex)
        expect(getStylesFromId('inside').color).toEqual('#3b82f6')
    })

    test('nested providers inherit ancestors, nearest wins on conflict', () => {
        const { getStylesFromId } = renderUniwind(
            <ScopedVariables variables={{ '--color-primary': '#3b82f6', '--gap': 4 }}>
                <View className="text-(--color-primary) gap-(--gap)" testID="outer" />
                <ScopedVariables variables={{ '--color-primary': '#ff0000' }}>
                    <View className="text-(--color-primary) gap-(--gap)" testID="inner" />
                </ScopedVariables>
            </ScopedVariables>,
        )

        // Outer sees its own values
        expect(getStylesFromId('outer').color).toEqual('#3b82f6')
        expect(getStylesFromId('outer').gap).toEqual(4)

        // Inner overrides --color-primary but inherits --gap from the ancestor
        expect(getStylesFromId('inner').color).toEqual('#ff0000')
        expect(getStylesFromId('inner').gap).toEqual(4)
    })

    test('number values are passed through without normalization', () => {
        const { getStylesFromId } = renderUniwind(
            <ScopedVariables variables={{ '--gap': 8 }}>
                <View className="gap-(--gap)" testID="numeric" />
            </ScopedVariables>,
        )

        expect(getStylesFromId('numeric').gap).toEqual(8)
    })

    test('color strings are normalized to hex on native', () => {
        const { getStylesFromId } = renderUniwind(
            <ScopedVariables variables={{ '--color-primary': 'rgb(255, 0, 0)' }}>
                <View className="text-(--color-primary)" testID="rgb" />
                <ScopedVariables variables={{ '--color-primary': 'rgba(0, 255, 0, 0.5)' }}>
                    <View className="text-(--color-primary)" testID="rgba" />
                </ScopedVariables>
            </ScopedVariables>,
        )

        expect(getStylesFromId('rgb').color).toEqual('#ff0000')
        expect(getStylesFromId('rgba').color).toEqual('#00ff0080')
    })

    test('useCSSVariable returns scoped value inside and falls back outside', () => {
        const outside = jest.fn()
        const inside = jest.fn()

        const Probe = (props: { test: jest.Mock }) => {
            props.test(useCSSVariable('--color-background'))

            return null
        }

        renderUniwind(
            <React.Fragment>
                <Probe test={outside} />
                <ScopedVariables variables={{ '--color-background': '#123456' }}>
                    <Probe test={inside} />
                </ScopedVariables>
            </React.Fragment>,
        )

        // Outside -> theme default (light background)
        expect(outside).toHaveBeenCalledWith('#ffffff')
        // Inside -> scoped override
        expect(inside).toHaveBeenCalledWith('#123456')
    })

    test('composes with ScopedTheme: base follows theme, scoped value stays pinned', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="bg-background" testID="base" />
                <ScopedVariables variables={{ '--color-background': '#abcdef' }}>
                    <View className="bg-background" testID="pinned" />
                </ScopedVariables>
                <ScopedTheme theme="dark">
                    <View className="bg-background" testID="scoped-dark" />
                    <ScopedVariables variables={{ '--color-background': '#abcdef' }}>
                        <View className="bg-background" testID="scoped-dark-pinned" />
                    </ScopedVariables>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(getStylesFromId('base').backgroundColor).toEqual('#ffffff')
        expect(getStylesFromId('pinned').backgroundColor).toEqual('#abcdef')
        expect(getStylesFromId('scoped-dark').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('scoped-dark-pinned').backgroundColor).toEqual('#abcdef')

        act(() => {
            Uniwind.setTheme('dark')
        })

        // Base follows the global theme switch, pinned subtree stays put
        expect(getStylesFromId('base').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('pinned').backgroundColor).toEqual('#abcdef')
        // ScopedTheme subtree ignores global theme; pinned override still wins
        expect(getStylesFromId('scoped-dark').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('scoped-dark-pinned').backgroundColor).toEqual('#abcdef')
    })

    test('updating the variables prop re-renders descendants', () => {
        const Wrapper = ({ color }: { color: string }) => (
            <ScopedVariables variables={{ '--color-primary': color }}>
                <View className="text-(--color-primary)" testID="dynamic" />
            </ScopedVariables>
        )

        const { getStylesFromId, rerender } = renderUniwind(<Wrapper color="#3b82f6" />)

        expect(getStylesFromId('dynamic').color).toEqual('#3b82f6')

        act(() => {
            rerender(<Wrapper color="#ff0000" />)
        })

        expect(getStylesFromId('dynamic').color).toEqual('#ff0000')
    })

    test('non "--" keys trigger a dev error and are ignored', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        try {
            const { getStylesFromId } = renderUniwind(
                // @ts-expect-error intentionally passing an invalid key for the dev warning
                <ScopedVariables variables={{ 'color-primary': '#3b82f6', '--gap': 8 }}>
                    <View className="gap-(--gap)" testID="valid" />
                </ScopedVariables>,
            )

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('CSS variable name must start with "--"'),
            )
            // The valid variable still applies
            expect(getStylesFromId('valid').gap).toEqual(8)
        } finally {
            errorSpy.mockRestore()
        }
    })
})
