import { act } from '@testing-library/react-native'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import * as React from 'react'
import View from '../../src/components/native/View'
import { UniwindListener } from '../../src/core/listener'
import { UniwindStore } from '../../src/core/native/store'
import { compileVirtual } from '../../src/metro/compileVirtual'
import { Platform } from '../../src/metro/types'
import { Orientation, StyleDependency } from '../../src/types'
import { renderUniwind } from '../utils'

describe('CSS Variables in Media Queries', () => {
    beforeAll(async () => {
        const cssPath = resolve('./tests/media-queries/variables.test.css')
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
        UniwindStore.reinit()
    })

    describe('min-width media queries', () => {
        test('uses default value when screen width is below media query threshold', () => {
            UniwindStore.runtime.screen = { width: 400, height: 667 }
            UniwindListener.notify([StyleDependency.Dimensions])

            const { getStylesFromId } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(16)
        })

        test('uses media query value when screen width is above threshold', () => {
            UniwindStore.runtime.screen = { width: 800, height: 667 }
            UniwindListener.notify([StyleDependency.Dimensions])

            const { getStylesFromId } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(32)
        })

        test('uses media query value when screen width equals threshold', () => {
            UniwindStore.runtime.screen = { width: 640, height: 667 }
            UniwindListener.notify([StyleDependency.Dimensions])

            const { getStylesFromId } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(32)
        })

        test('handles multiple variables with media queries', () => {
            UniwindStore.runtime.screen = { width: 800, height: 667 }

            const { getStylesFromId } = renderUniwind(
                <React.Fragment>
                    <View className="text-base" testID="text-base" />
                    <View className="text-lg" testID="text-lg" />
                </React.Fragment>,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(32)
            expect(getStylesFromId('text-lg').fontSize).toBe(48)
        })
    })

    describe('dynamic screen width changes', () => {
        test('updates variable value when screen width changes from below to above threshold', () => {
            UniwindStore.runtime.screen = { width: 400, height: 667 }
            UniwindListener.notify([StyleDependency.Dimensions])

            let { getStylesFromId } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(16)

            UniwindStore.runtime.screen = { width: 800, height: 667 }
            act(() => {
                UniwindListener.notify([StyleDependency.Dimensions])
            })

            const { getStylesFromId: getStylesFromId2 } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId2('text-base').fontSize).toBe(32)
        })

        test('updates variable value when screen width changes from above to below threshold', () => {
            UniwindStore.runtime.screen = { width: 800, height: 667 }
            UniwindStore.reinit() // Force a style rebuild

            const { getStylesFromId } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(32)

            UniwindStore.runtime.screen = { width: 400, height: 667 }
            act(() => {
                UniwindListener.notify([StyleDependency.Dimensions])
            })

            const { getStylesFromId: getStylesFromId2 } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId2('text-base').fontSize).toBe(16)
        })
    })

    describe('fallback to default values', () => {
        test('falls back to default when no media query matches', () => {
            UniwindStore.runtime.screen = { width: 300, height: 667 }
            UniwindListener.notify([StyleDependency.Dimensions])

            const { getStylesFromId } = renderUniwind(
                <View className="text-base" testID="text-base" />,
            )

            expect(getStylesFromId('text-base').fontSize).toBe(16)
        })
    })
})
