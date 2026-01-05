import * as React from 'react'
import View from '../../src/components/native/View'
import { SAFE_AREA_INSET_BOTTOM, SAFE_AREA_INSET_TOP, SCREEN_HEIGHT, TW_SPACING } from '../consts'
import { renderUniwind } from '../utils'

describe('Safe Area', () => {
    test('Safe Area insets', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="p-safe" testID="p-safe" />
                <View className="pt-safe-offset-4" testID="pt-safe" />
                <View className="mb-safe-or-4" testID="mb-safe-or-4" />
                <View className="inset-safe-offset-[10px]" testID="inset-safe" />
                <View className="h-screen-safe" testID="h-screen-safe" />
            </React.Fragment>,
        )

        expect(getStylesFromId('p-safe').paddingTop).toBe(SAFE_AREA_INSET_TOP)
        expect(getStylesFromId('p-safe').paddingBottom).toBe(SAFE_AREA_INSET_BOTTOM)
        expect(getStylesFromId('pt-safe').paddingTop).toBe(SAFE_AREA_INSET_TOP + TW_SPACING * 4)
        expect(getStylesFromId('mb-safe-or-4').marginBottom).toBe(SAFE_AREA_INSET_BOTTOM)
        expect(getStylesFromId('h-screen-safe').height).toBe(SCREEN_HEIGHT - SAFE_AREA_INSET_TOP - SAFE_AREA_INSET_BOTTOM)
        expect(getStylesFromId('inset-safe').top).toBe(SAFE_AREA_INSET_TOP + 10)
        expect(getStylesFromId('inset-safe').bottom).toBe(SAFE_AREA_INSET_BOTTOM + 10)
        expect(getStylesFromId('inset-safe').left).toBe(10)
        expect(getStylesFromId('inset-safe').right).toBe(10)
    })
})
