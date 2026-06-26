import * as React from 'react'
import { PixelRatio } from 'react-native'
import View from '../../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('CSS Functions', () => {
    test('min', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[min(12px,8px)]" testID="min-width" />
                <View className="h-[min(2rem,40px)]" testID="min-height" />
            </React.Fragment>,
        )

        expect(getStylesFromId('min-width').width).toBe(8)
        expect(getStylesFromId('min-height').height).toBe(32)
    })

    test('max', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[max(12px,8px)]" testID="max-width" />
                <View className="h-[max(2rem,40px)]" testID="max-height" />
            </React.Fragment>,
        )

        expect(getStylesFromId('max-width').width).toBe(12)
        expect(getStylesFromId('max-height').height).toBe(40)
    })

    test('calc', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[calc(12px_+_8px)]" testID="calc-add" />
                <View className="h-[calc(3rem_-_8px)]" testID="calc-subtract" />
            </React.Fragment>,
        )

        expect(getStylesFromId('calc-add').width).toBe(20)
        expect(getStylesFromId('calc-subtract').height).toBe(40)
    })

    test('fontScale', () => {
        const getFontScale = jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.5)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[fontScale()]" testID="font-scale" />
                <View className="w-[fontScale(2)]" testID="font-scale-2" />
            </React.Fragment>,
        )

        expect(getStylesFromId('font-scale').width).toBe(1.5)
        expect(getStylesFromId('font-scale-2').width).toBe(3)

        getFontScale.mockRestore()
    })

    test('pixelRatio', () => {
        const get = jest.spyOn(PixelRatio, 'get').mockReturnValue(2)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[pixelRatio()]" testID="pixel-ratio" />
                <View className="w-[pixelRatio(2)]" testID="pixel-ratio-2" />
            </React.Fragment>,
        )

        expect(getStylesFromId('pixel-ratio').width).toBe(2)
        expect(getStylesFromId('pixel-ratio-2').width).toBe(4)

        get.mockRestore()
    })

    test('combinations', () => {
        const get = jest.spyOn(PixelRatio, 'get').mockReturnValue(2)
        const getFontScale = jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(1.5)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-[min(max(4px,8px),calc(20px_-_4px))]" testID="nested-math" />
                <View className="h-[calc(pixelRatio(2)_+_fontScale(4))]" testID="runtime-calc" />
                <View className="m-[max(pixelRatio(2),fontScale(4))]" testID="runtime-max" />
            </React.Fragment>,
        )

        expect(getStylesFromId('nested-math').width).toBe(8)
        expect(getStylesFromId('runtime-calc').height).toBe(10)
        expect(getStylesFromId('runtime-max').margin).toBe(6)

        get.mockRestore()
        getFontScale.mockRestore()
    })
})
