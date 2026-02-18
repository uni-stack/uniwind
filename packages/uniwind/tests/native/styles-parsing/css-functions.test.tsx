import * as React from 'react'
import View from '../../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Custom CSS Functions', () => {
    test('fontScale', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[fontScale()]" testID="font-scale" />
                <View className="w-[fontScale(2)]" testID="font-scale-2" />
            </React.Fragment>,
        )

        expect(getStylesFromId('font-scale').width).toBe(1)
        expect(getStylesFromId('font-scale-2').width).toBe(2)
    })

    test('pixelRatio', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[pixelRatio()]" testID="pixel-ratio" />
                <View className="w-[pixelRatio(2)]" testID="pixel-ratio-2" />
            </React.Fragment>,
        )

        expect(getStylesFromId('pixel-ratio').width).toBe(1)
        expect(getStylesFromId('pixel-ratio-2').width).toBe(2)
    })
})
