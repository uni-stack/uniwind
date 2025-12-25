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

describe('CSS Variables - Max-Width Media Queries', () => {
    beforeAll(async () => {
        const cssPath = resolve('./tests/media-queries/max-width.test.css')
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

    test('uses default value when screen width is above max-width threshold', () => {
        UniwindStore.runtime.screen = { width: 600, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )

        expect(getStylesFromId('spacing-sm').padding).toBe(8)
    })

    test('uses media query value when screen width is below max-width threshold', () => {
        UniwindStore.runtime.screen = { width: 400, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )

        expect(getStylesFromId('spacing-sm').padding).toBe(4)
    })

    test('uses media query value when screen width equals max-width threshold', () => {
        UniwindStore.runtime.screen = { width: 480, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )

        expect(getStylesFromId('spacing-sm').padding).toBe(4)
    })

    test('handles multiple variables with max-width', () => {
        UniwindStore.runtime.screen = { width: 400, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="p-spacing-sm" testID="spacing-sm" />
                <View className="p-spacing-md" testID="spacing-md" />
            </React.Fragment>,
        )

        expect(getStylesFromId('spacing-sm').padding).toBe(4)
        expect(getStylesFromId('spacing-md').padding).toBe(12)
    })

    test('updates when screen width changes from above to below threshold', () => {
        UniwindStore.runtime.screen = { width: 600, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        let { getStylesFromId } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )
        expect(getStylesFromId('spacing-sm').padding).toBe(8)

        UniwindStore.runtime.screen = { width: 400, height: 667 }
        act(() => {
            UniwindListener.notify([StyleDependency.Dimensions])
        })

        const { getStylesFromId: getStylesFromId2 } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )
        expect(getStylesFromId2('spacing-sm').padding).toBe(4)
    })

    test('updates when screen width changes from below to above threshold', () => {
        UniwindStore.runtime.screen = { width: 600, height: 667 }
        UniwindListener.notify([StyleDependency.Dimensions])

        let { getStylesFromId } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )
        expect(getStylesFromId('spacing-sm').padding).toBe(8)

        UniwindStore.runtime.screen = { width: 400, height: 667 }
        act(() => {
            UniwindListener.notify([StyleDependency.Dimensions])
        })

        const { getStylesFromId: getStylesFromId2 } = renderUniwind(
            <View className="p-spacing-sm" testID="spacing-sm" />,
        )
        expect(getStylesFromId2('spacing-sm').padding).toBe(4)
    })
})
