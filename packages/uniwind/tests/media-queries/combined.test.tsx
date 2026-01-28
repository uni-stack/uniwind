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

describe('CSS Variables - Combined Media Queries', () => {
    beforeAll(async () => {
        const cssPath = resolve('./tests/media-queries/combined.test.css')
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

    test('matches when both min-width and orientation conditions are met', () => {
        UniwindStore.runtime.screen = { width: 800, height: 375 }
        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindListener.notify([StyleDependency.Dimensions, StyleDependency.Orientation])

        const { getStylesFromId } = renderUniwind(
            <View className="text-xl" testID="text-xl" />,
        )

        expect(getStylesFromId('text-xl').fontSize).toBe(96)
    })

    test('uses default when min-width matches but orientation does not', () => {
        UniwindStore.runtime.screen = { width: 800, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-xl" testID="text-xl" />,
        )

        expect(getStylesFromId('text-xl').fontSize).toBe(24)
    })

    test('matches when both min-width and color-scheme conditions are met', () => {
        UniwindStore.runtime.screen = { width: 800, height: 667 }
        UniwindStore.runtime.colorScheme = ColorScheme.Dark
        UniwindStore.runtime.currentThemeName = ColorScheme.Dark
        UniwindListener.notify([StyleDependency.Dimensions, StyleDependency.ColorScheme, StyleDependency.Theme])

        const { getStylesFromId } = renderUniwind(
            <View className="border-custom" testID="border-width" />,
        )

        expect(getStylesFromId('border-width').borderWidth).toBe(2)
    })

    test('uses default when min-width matches but color-scheme does not', () => {
        UniwindStore.runtime.screen = { width: 800, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="border-custom" testID="border-width" />,
        )

        expect(getStylesFromId('border-width').borderWidth).toBe(1)
    })

    test('uses default when orientation matches but min-width does not', () => {
        UniwindStore.runtime.screen = { width: 500, height: 300 }
        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindListener.notify([StyleDependency.Dimensions, StyleDependency.Orientation])

        const { getStylesFromId } = renderUniwind(
            <View className="text-xl" testID="text-xl" />,
        )

        expect(getStylesFromId('text-xl').fontSize).toBe(24)
    })

    test('handles complex scenario with all conditions', () => {
        UniwindStore.runtime.screen = { width: 800, height: 400 }
        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindStore.runtime.colorScheme = ColorScheme.Dark
        UniwindStore.runtime.currentThemeName = ColorScheme.Dark
        UniwindListener.notify([
            StyleDependency.Dimensions,
            StyleDependency.Orientation,
            StyleDependency.ColorScheme,
            StyleDependency.Theme,
        ])

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-xl" testID="text-xl" />
                <View className="border-custom" testID="border-width" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-xl').fontSize).toBe(96)
        expect(getStylesFromId('border-width').borderWidth).toBe(2)
    })
})
