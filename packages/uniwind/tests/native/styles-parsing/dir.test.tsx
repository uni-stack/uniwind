import * as React from 'react'
import { I18nManager } from 'react-native'
import { LayoutDirection } from '../../../src'
import View from '../../../src/components/native/View'
import { UniwindStore } from '../../../src/core/native'
import { TW_BLUE_500, TW_RED_500 } from '../../consts'
import { renderUniwind } from '../utils'

describe('Dir', () => {
    const mockRTL = (isRTL: boolean) => {
        jest.replaceProperty(I18nManager, 'isRTL', isRTL)
        UniwindStore.runtime.rtl = I18nManager.isRTL
    }

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('RTL global', () => {
        mockRTL(true)

        const { getStylesFromId } = renderUniwind(
            <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />,
        )

        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('LTR global', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <View className="ltr:bg-red-500 bg-blue-500" testID="ltr-red" />,
        )

        expect(getStylesFromId('ltr-red').backgroundColor).toBe(TW_RED_500)
    })

    test('LayoutDirection rtl', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <LayoutDirection rtl>
                <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />
            </LayoutDirection>,
        )

        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('LayoutDirection ltr', () => {
        mockRTL(true)

        const { getStylesFromId } = renderUniwind(
            <LayoutDirection rtl={false}>
                <View className="ltr:bg-red-500 bg-blue-500" testID="ltr-red" />
            </LayoutDirection>,
        )

        expect(getStylesFromId('ltr-red').backgroundColor).toBe(TW_RED_500)
    })

    test('Nested LayoutDirection', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <LayoutDirection rtl={false}>
                <View className="ltr:bg-red-500 bg-blue-500" testID="ltr-red" />
                <LayoutDirection rtl>
                    <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />
                </LayoutDirection>
            </LayoutDirection>,
        )

        expect(getStylesFromId('ltr-red').backgroundColor).toBe(TW_RED_500)
        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('LayoutDirection without rtl falls back to global rtl', () => {
        mockRTL(true)

        const { getStylesFromId } = renderUniwind(
            <LayoutDirection>
                <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />
            </LayoutDirection>,
        )

        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('Nested LayoutDirection without rtl inherits parent rtl', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <LayoutDirection rtl>
                <LayoutDirection>
                    <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />
                </LayoutDirection>
            </LayoutDirection>,
        )

        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('LayoutDirection cache separates explicit rtl values', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <LayoutDirection rtl={false}>
                    <View className="rtl:bg-red-500 bg-blue-500" testID="ltr-blue" />
                </LayoutDirection>
                <LayoutDirection rtl>
                    <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />
                </LayoutDirection>
            </React.Fragment>,
        )

        expect(getStylesFromId('ltr-blue').backgroundColor).toBe(TW_BLUE_500)
        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })
})
