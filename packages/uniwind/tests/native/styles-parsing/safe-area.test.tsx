import * as React from 'react'
import { LayoutDirection } from '../../../src'
import View from '../../../src/components/native/View'
import { SAFE_AREA_INSET_BOTTOM, SAFE_AREA_INSET_LEFT, SAFE_AREA_INSET_RIGHT, SAFE_AREA_INSET_TOP, SCREEN_HEIGHT, TW_SPACING } from '../../consts'
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
                <View className="p-safe-or-test" testID="p-or-test-spacing" />
            </React.Fragment>,
        )

        expect(getStylesFromId('p-safe').paddingTop).toBe(SAFE_AREA_INSET_TOP)
        expect(getStylesFromId('p-safe').paddingBottom).toBe(SAFE_AREA_INSET_BOTTOM)
        expect(getStylesFromId('p-safe').paddingLeft).toBe(SAFE_AREA_INSET_LEFT)
        expect(getStylesFromId('p-safe').paddingRight).toBe(SAFE_AREA_INSET_RIGHT)
        expect(getStylesFromId('pt-safe').paddingTop).toBe(SAFE_AREA_INSET_TOP + TW_SPACING * 4)
        expect(getStylesFromId('mb-safe-or-4').marginBottom).toBe(SAFE_AREA_INSET_BOTTOM)
        expect(getStylesFromId('h-screen-safe').height).toBe(SCREEN_HEIGHT - SAFE_AREA_INSET_TOP - SAFE_AREA_INSET_BOTTOM)
        expect(getStylesFromId('inset-safe').top).toBe(SAFE_AREA_INSET_TOP + 10)
        expect(getStylesFromId('inset-safe').bottom).toBe(SAFE_AREA_INSET_BOTTOM + 10)
        expect(getStylesFromId('inset-safe').left).toBe(SAFE_AREA_INSET_LEFT + 10)
        expect(getStylesFromId('inset-safe').right).toBe(SAFE_AREA_INSET_RIGHT + 10)
        expect(getStylesFromId('p-or-test-spacing').paddingTop).toBe(123)
    })

    test('logical Safe Area insets follow layout direction', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="ms-safe me-safe-offset-4 ps-safe-or-2 pe-safe start-safe end-safe-offset-4" testID="ltr" />
                <LayoutDirection rtl>
                    <View className="ms-safe me-safe-offset-4 ps-safe-or-2 pe-safe start-safe end-safe-offset-4" testID="rtl" />
                </LayoutDirection>
            </React.Fragment>,
        )

        expect(getStylesFromId('ltr').marginStart).toBe(SAFE_AREA_INSET_LEFT)
        expect(getStylesFromId('ltr').marginEnd).toBe(SAFE_AREA_INSET_RIGHT + TW_SPACING * 4)
        expect(getStylesFromId('ltr').paddingStart).toBe(TW_SPACING * 2)
        expect(getStylesFromId('ltr').paddingEnd).toBe(SAFE_AREA_INSET_RIGHT)
        expect(getStylesFromId('ltr').start).toBe(SAFE_AREA_INSET_LEFT)
        expect(getStylesFromId('ltr').end).toBe(SAFE_AREA_INSET_RIGHT + TW_SPACING * 4)

        expect(getStylesFromId('rtl').marginStart).toBe(SAFE_AREA_INSET_RIGHT)
        expect(getStylesFromId('rtl').marginEnd).toBe(SAFE_AREA_INSET_LEFT + TW_SPACING * 4)
        expect(getStylesFromId('rtl').paddingStart).toBe(SAFE_AREA_INSET_RIGHT)
        expect(getStylesFromId('rtl').paddingEnd).toBe(SAFE_AREA_INSET_LEFT)
        expect(getStylesFromId('rtl').start).toBe(SAFE_AREA_INSET_RIGHT)
        expect(getStylesFromId('rtl').end).toBe(SAFE_AREA_INSET_LEFT + TW_SPACING * 4)
    })
})
