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

describe('CSS Variables - Min-Width Media Queries', () => {
    beforeAll(async () => {
        const cssPath = resolve('./tests/media-queries/min-width.test.css')
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

    test('uses default value when screen width is below first threshold', () => {
        UniwindStore.runtime.screen = { width: 300, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(16)
    })

    test('uses media query value when screen width is above first threshold', () => {
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

    test('uses highest matching breakpoint value', () => {
        UniwindStore.runtime.screen = { width: 1200, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-base" testID="text-base" />
                <View className="text-lg" testID="text-lg" />
                <View className="text-xl" testID="text-xl" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(48)
        expect(getStylesFromId('text-lg').fontSize).toBe(64)
        expect(getStylesFromId('text-xl').fontSize).toBe(80)
    })

    test('handles multiple variables with same media query', () => {
        UniwindStore.runtime.screen = { width: 800, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-base" testID="text-base" />
                <View className="text-lg" testID="text-lg" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(32)
        expect(getStylesFromId('text-lg').fontSize).toBe(48)
    })

    test('handles multiple breakpoints with different values', () => {
        UniwindStore.runtime.screen = { width: 500, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(24)
    })

    test('prefers higher minWidth when multiple media queries match', () => {
        UniwindStore.runtime.screen = { width: 900, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(32)
    })

    test('updates when screen width changes across multiple breakpoints', () => {
        UniwindStore.runtime.screen = { width: 400, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )
        expect(getStylesFromId('text-base').fontSize).toBe(24)

        UniwindStore.runtime.screen = { width: 800, height: 667 }
        act(() => {
            UniwindListener.notify([StyleDependency.Dimensions])
        })

        const { getStylesFromId: getStylesFromId2 } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )
        expect(getStylesFromId2('text-base').fontSize).toBe(32)

        UniwindStore.runtime.screen = { width: 1200, height: 667 }
        act(() => {
            UniwindListener.notify([StyleDependency.Dimensions])
        })

        const { getStylesFromId: getStylesFromId3 } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )
        expect(getStylesFromId3('text-base').fontSize).toBe(48)
    })

    test('handles very small screen widths', () => {
        UniwindStore.runtime.screen = { width: 200, height: 300 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(16)
    })

    test('handles very large screen widths', () => {
        UniwindStore.runtime.screen = { width: 2000, height: 1500 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(48)
    })

    test('handles exact breakpoint boundaries', () => {
        UniwindStore.runtime.screen = { width: 1024, height: 768 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(48)
    })
})
