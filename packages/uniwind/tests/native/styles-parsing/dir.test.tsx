import * as React from 'react'
import { I18nManager } from 'react-native'
import View from '../../../src/components/native/View'
import { UniwindStore } from '../../../src/core/native'
import { TW_RED_500 } from '../../consts'
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
            <React.Fragment>
                <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" />
            </React.Fragment>,
        )

        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('LTR global', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="ltr:bg-red-500 bg-blue-500" testID="ltr-red" />
            </React.Fragment>,
        )

        expect(getStylesFromId('ltr-red').backgroundColor).toBe(TW_RED_500)
    })

    test('inline RTL', () => {
        mockRTL(false)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="rtl:bg-red-500 bg-blue-500" testID="rtl-red" style={{ direction: 'rtl' }} />
            </React.Fragment>,
        )

        expect(getStylesFromId('rtl-red').backgroundColor).toBe(TW_RED_500)
    })

    test('inline LTR', () => {
        mockRTL(true)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="ltr:bg-red-500 bg-blue-500" testID="ltr-red" style={{ direction: 'ltr' }} />
            </React.Fragment>,
        )

        expect(getStylesFromId('ltr-red').backgroundColor).toBe(TW_RED_500)
    })
})
