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

describe('CSS Variables - Orientation Media Queries', () => {
    beforeAll(async () => {
        const cssPath = resolve('./tests/media-queries/orientation.test.css')
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

    test('uses default value in portrait orientation', () => {
        UniwindStore.runtime.orientation = Orientation.Portrait
        UniwindStore.runtime.screen = { width: 375, height: 667 }
        UniwindListener.notify([StyleDependency.Orientation, StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(16)
    })

    test('uses media query value in landscape orientation', () => {
        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindStore.runtime.screen = { width: 667, height: 375 }
        UniwindListener.notify([StyleDependency.Orientation, StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(40)
    })

    test('updates when orientation changes', () => {
        UniwindStore.runtime.orientation = Orientation.Portrait
        UniwindStore.runtime.screen = { width: 375, height: 667 }
        UniwindListener.notify([StyleDependency.Orientation, StyleDependency.Dimensions])

        let { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(16)

        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindStore.runtime.screen = { width: 667, height: 375 }
        act(() => {
            UniwindListener.notify([StyleDependency.Orientation, StyleDependency.Dimensions])
        })

        const { getStylesFromId: getStylesFromId2 } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId2('text-base').fontSize).toBe(40)
    })

    test('handles multiple variables with orientation', () => {
        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindStore.runtime.screen = { width: 667, height: 375 }
        UniwindListener.notify([StyleDependency.Orientation, StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-base" testID="text-base" />
                <View className="p-spacing-md" testID="spacing-md" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(40)
        expect(getStylesFromId('spacing-md').padding).toBe(24)
    })

    test('orientation takes precedence over min-width when both match separately', () => {
        UniwindStore.runtime.screen = { width: 500, height: 300 }
        UniwindStore.runtime.orientation = Orientation.Landscape
        UniwindListener.notify([StyleDependency.Orientation, StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="text-base" testID="text-base" />,
        )

        expect(getStylesFromId('text-base').fontSize).toBe(40)
    })
})
