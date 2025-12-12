import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Layout', () => {
    test('Flexbox', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="flex-1" testID="flex-1" />
                <View className="flex-row" testID="flex-row" />
                <View className="flex-col" testID="flex-col" />
                <View className="items-center" testID="items-center" />
                <View className="items-start" testID="items-start" />
                <View className="items-end" testID="items-end" />
                <View className="justify-between" testID="justify-between" />
                <View className="justify-center" testID="justify-center" />
                <View className="justify-start" testID="justify-start" />
                <View className="justify-end" testID="justify-end" />
                <View className="self-start" testID="self-start" />
                <View className="self-center" testID="self-center" />
                <View className="flex-wrap" testID="flex-wrap" />
                <View className="flex-nowrap" testID="flex-nowrap" />
            </React.Fragment>,
        )

        const flex1 = getStylesFromId('flex-1')
        expect(flex1.flexGrow).toBe(1)
        expect(flex1.flexShrink).toBe(1)
        expect(flex1.flexBasis).toBe('0%')
        expect(getStylesFromId('flex-row').flexDirection).toBe('row')
        expect(getStylesFromId('flex-col').flexDirection).toBe('column')
        expect(getStylesFromId('items-center').alignItems).toBe('center')
        expect(getStylesFromId('items-start').alignItems).toBe('flex-start')
        expect(getStylesFromId('items-end').alignItems).toBe('flex-end')
        expect(getStylesFromId('justify-between').justifyContent).toBe('space-between')
        expect(getStylesFromId('justify-center').justifyContent).toBe('center')
        expect(getStylesFromId('justify-start').justifyContent).toBe('flex-start')
        expect(getStylesFromId('justify-end').justifyContent).toBe('flex-end')
        expect(getStylesFromId('self-start').alignSelf).toBe('flex-start')
        expect(getStylesFromId('self-center').alignSelf).toBe('center')
        expect(getStylesFromId('flex-wrap').flexWrap).toBe('wrap')
        expect(getStylesFromId('flex-nowrap').flexWrap).toBe('nowrap')
    })

    test('Positioning', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="absolute" testID="absolute" />
                <View className="relative" testID="relative" />
                <View className="top-0" testID="top-0" />
                <View className="bottom-0" testID="bottom-0" />
                <View className="left-0" testID="left-0" />
                <View className="right-0" testID="right-0" />
                <View className="inset-0" testID="inset-0" />
                <View className="z-10" testID="z-10" />
                <View className="z-0" testID="z-0" />
            </React.Fragment>,
        )

        expect(getStylesFromId('absolute').position).toBe('absolute')
        expect(getStylesFromId('relative').position).toBe('relative')
        expect(getStylesFromId('top-0').top).toBe(0)
        expect(getStylesFromId('bottom-0').bottom).toBe(0)
        expect(getStylesFromId('left-0').left).toBe(0)
        expect(getStylesFromId('right-0').right).toBe(0)

        const inset = getStylesFromId('inset-0')
        expect(inset.inset).toBe(0)

        expect(getStylesFromId('z-10').zIndex).toBe(10)
        expect(getStylesFromId('z-0').zIndex).toBe(0)
    })

    test('Display & Overflow', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                {/* <View className="hidden" testID="hidden" /> */}
                <View className="flex" testID="flex" />
                <View className="overflow-hidden" testID="overflow-hidden" />
                <View className="overflow-visible" testID="overflow-visible" />
            </React.Fragment>,
        )

        // expect(getStylesFromId('hidden').display).toBe('none')
        expect(getStylesFromId('flex').display).toBe('flex')
        expect(getStylesFromId('overflow-hidden').overflow).toBe('hidden')
        expect(getStylesFromId('overflow-visible').overflow).toBe('visible')
    })
})
