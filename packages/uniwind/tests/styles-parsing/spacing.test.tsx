import * as React from 'react'
import View from '../../src/components/native/View'
import { SCREEN_WIDTH } from '../consts'
import { renderUniwind } from '../utils'

describe('Spacing', () => {
    test('Width and Height', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="w-10" testID="w-10" />
                <View className="w-2" testID="w-2" />
                <View className="h-10" testID="h-10" />
                <View className="w-full" testID="w-full" />
                <View className="h-full" testID="h-full" />
                <View className="w-[100px]" testID="w-custom" />
                <View className="h-[50%]" testID="h-custom" />
                <View className="w-[50vw]" testID="w-50vw" />
            </React.Fragment>,
        )

        expect(getStylesFromId('w-10').width).toBe(40)
        expect(getStylesFromId('w-2').width).toBe(8)
        expect(getStylesFromId('h-10').height).toBe(40)
        expect(getStylesFromId('w-full').width).toBe('100%')
        expect(getStylesFromId('h-full').height).toBe('100%')
        expect(getStylesFromId('w-custom').width).toBe(100)
        expect(getStylesFromId('h-custom').height).toBe('50%')
        expect(getStylesFromId('w-50vw').width).toBe(SCREEN_WIDTH / 2)
    })

    test('Padding', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="p-4" testID="p-4" />
                <View className="px-2" testID="px-2" />
                <View className="py-3" testID="py-3" />
                <View className="pt-1" testID="pt-1" />
                <View className="pr-1" testID="pr-1" />
                <View className="pb-1" testID="pb-1" />
                <View className="pl-1" testID="pl-1" />
            </React.Fragment>,
        )

        const p4 = getStylesFromId('p-4')
        expect(p4.padding).toBe(16)

        const px2 = getStylesFromId('px-2')
        expect(px2.paddingHorizontal).toBe(8)

        const py3 = getStylesFromId('py-3')
        expect(py3.paddingVertical).toBe(12)

        expect(getStylesFromId('pt-1').paddingTop).toBe(4)
        expect(getStylesFromId('pr-1').paddingRight).toBe(4)
        expect(getStylesFromId('pb-1').paddingBottom).toBe(4)
        expect(getStylesFromId('pl-1').paddingLeft).toBe(4)
    })

    test('Margin', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="m-4" testID="m-4" />
                <View className="mx-2" testID="mx-2" />
                <View className="my-3" testID="my-3" />
                <View className="mt-1" testID="mt-1" />
                <View className="mr-1" testID="mr-1" />
                <View className="mb-1" testID="mb-1" />
                <View className="ml-1" testID="ml-1" />
                <View className="-ml-1" testID="-ml-1" />
            </React.Fragment>,
        )

        const m4 = getStylesFromId('m-4')
        expect(m4.margin).toBe(16)

        const mx2 = getStylesFromId('mx-2')
        expect(mx2.marginHorizontal).toBe(8)

        const my3 = getStylesFromId('my-3')
        expect(my3.marginVertical).toBe(12)

        expect(getStylesFromId('mt-1').marginTop).toBe(4)
        expect(getStylesFromId('mr-1').marginRight).toBe(4)
        expect(getStylesFromId('mb-1').marginBottom).toBe(4)
        expect(getStylesFromId('ml-1').marginLeft).toBe(4)
        expect(getStylesFromId('-ml-1').marginLeft).toBe(-4)
    })
})
