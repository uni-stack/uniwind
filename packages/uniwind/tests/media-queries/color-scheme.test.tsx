import { act } from '@testing-library/react-native'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as React from 'react'
import View from '../../src/components/native/View'
import { UniwindListener } from '../../src/core/listener'
import { UniwindStore } from '../../src/core/native/store'
import { compileVirtual } from '../../src/metro/compileVirtual'
import { Platform } from '../../src/metro/types'
import { ColorScheme, Orientation, StyleDependency } from '../../src/types'
import { renderUniwind } from '../utils'

describe('CSS Variables - Color Scheme Media Queries', () => {
    beforeAll(async () => {
        const cssPath = resolve('./tests/media-queries/color-scheme.test.css')
        const css = readFileSync(cssPath, 'utf-8')
        const virtualCode = await compileVirtual({
            css,
            cssPath,
            debug: true,
            platform: Platform.iOS,
            themes: ['light', 'dark'],
            polyfills: undefined,
        })

        eval(
            `const { Uniwind } = require('../../src/core/config/config.native');
            Uniwind.__reinit(rt => ${virtualCode}, ['light', 'dark']);
        `,
        )
    })

    beforeEach(() => {
        UniwindStore.runtime.screen = { width: 375, height: 667 }
        UniwindStore.runtime.orientation = Orientation.Portrait
        UniwindStore.runtime.colorScheme = ColorScheme.Light
        UniwindStore.runtime.currentThemeName = ColorScheme.Light
        UniwindStore.reinit()
    })

    test('uses default value in light color scheme', () => {
        const { getStylesFromId } = renderUniwind(
            <View className="text-color-primary" testID="color-primary" />,
        )

        expect(getStylesFromId('color-primary').color).toBe('#000000')
    })

    test('uses media query value in dark color scheme', () => {
        UniwindStore.runtime.currentThemeName = ColorScheme.Dark
        UniwindStore.runtime.colorScheme = ColorScheme.Dark
        UniwindListener.notify([StyleDependency.Theme, StyleDependency.ColorScheme])

        const { getStylesFromId } = renderUniwind(
            <View className="text-color-primary" testID="color-primary" />,
        )

        expect(getStylesFromId('color-primary').color).toBe('#ffffff')
    })

    test('updates when color scheme changes', () => {
        UniwindStore.runtime.currentThemeName = ColorScheme.Light
        UniwindStore.runtime.colorScheme = ColorScheme.Light
        UniwindListener.notify([StyleDependency.Theme, StyleDependency.ColorScheme])

        let { getStylesFromId } = renderUniwind(
            <View className="text-color-primary" testID="color-primary" />,
        )

        expect(getStylesFromId('color-primary').color).toBe('#000000')

        UniwindStore.runtime.currentThemeName = ColorScheme.Dark
        UniwindStore.runtime.colorScheme = ColorScheme.Dark
        act(() => {
            UniwindListener.notify([StyleDependency.Theme, StyleDependency.ColorScheme])
        })

        const { getStylesFromId: getStylesFromId2 } = renderUniwind(
            <View className="text-color-primary" testID="color-primary" />,
        )

        expect(getStylesFromId2('color-primary').color).toBe('#ffffff')
    })
})
