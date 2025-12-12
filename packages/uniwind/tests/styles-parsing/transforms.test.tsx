import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Transforms', () => {
    test('Scale', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="scale-0" testID="scale-0" />
                <View className="scale-50" testID="scale-50" />
                <View className="scale-100" testID="scale-100" />
                <View className="scale-150" testID="scale-150" />
                <View className="scale-x-50" testID="scale-x-50" />
                <View className="scale-y-50" testID="scale-y-50" />
            </React.Fragment>,
        )

        expect(getStylesFromId('scale-0').transform).toEqual([{ scaleX: 0 }, { scaleY: 0 }])
        expect(getStylesFromId('scale-50').transform).toEqual([{ scaleX: 0.5 }, { scaleY: 0.5 }])
        expect(getStylesFromId('scale-100').transform).toEqual([{ scaleX: 1 }, { scaleY: 1 }])
        expect(getStylesFromId('scale-150').transform).toEqual([{ scaleX: 1.5 }, { scaleY: 1.5 }])
        expect(getStylesFromId('scale-x-50').transform).toEqual([{ scaleX: 0.5 }, { scaleY: 1 }])
        expect(getStylesFromId('scale-y-50').transform).toEqual([{ scaleX: 1 }, { scaleY: 0.5 }])
    })

    test('Rotate', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="rotate-45" testID="rotate-45" />
                <View className="rotate-90" testID="rotate-90" />
                <View className="rotate-180" testID="rotate-180" />
                <View className="-rotate-90" testID="-rotate-90" />
            </React.Fragment>,
        )

        expect(getStylesFromId('rotate-45').transform).toEqual([{ rotateZ: '45deg' }])
        expect(getStylesFromId('rotate-90').transform).toEqual([{ rotateZ: '90deg' }])
        expect(getStylesFromId('rotate-180').transform).toEqual([{ rotateZ: '180deg' }])
        expect(getStylesFromId('-rotate-90').transform).toEqual([{ rotateZ: '-90deg' }])
    })

    test('Translate', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="translate-x-0" testID="translate-x-0" />
                <View className="translate-x-4" testID="translate-x-4" />
                <View className="translate-y-4" testID="translate-y-4" />
                <View className="-translate-x-4" testID="-translate-x-4" />
            </React.Fragment>,
        )

        expect(getStylesFromId('translate-x-0').transform).toEqual([{ translateX: 0 }, { translateY: 0 }])
        expect(getStylesFromId('translate-x-4').transform).toEqual([{ translateX: 16 }, { translateY: 0 }])
        expect(getStylesFromId('translate-y-4').transform).toEqual([{ translateX: 0 }, { translateY: 16 }])
        expect(getStylesFromId('-translate-x-4').transform).toEqual([{ translateX: -16 }, { translateY: 0 }])
    })

    test('Skew', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="skew-x-0" testID="skew-x-0" />
                <View className="skew-x-12" testID="skew-x-12" />
                <View className="skew-y-12" testID="skew-y-12" />
            </React.Fragment>,
        )

        expect(getStylesFromId('skew-x-0').transform).toEqual([{ skewX: '0deg' }])
        expect(getStylesFromId('skew-x-12').transform).toEqual([{ skewX: '12deg' }])
        expect(getStylesFromId('skew-y-12').transform).toEqual([{ skewY: '12deg' }])
    })

    test('Combined Transforms', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="scale-50 rotate-45 translate-x-4 skew-x-12" testID="combined" />
            </React.Fragment>,
        )

        // Order based on parser implementation: Translate -> Rotate -> Scale -> Skew
        expect(getStylesFromId('combined').transform).toEqual([
            { translateX: 16 },
            { translateY: 0 },
            { rotateZ: '45deg' },
            { scaleX: 0.5 },
            { scaleY: 0.5 },
            { skewX: '12deg' },
        ])
    })
})
