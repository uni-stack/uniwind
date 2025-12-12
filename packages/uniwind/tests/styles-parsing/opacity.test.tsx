import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Opacity', () => {
    test('Opacity Values', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="opacity-0" testID="opacity-0" />
                <View className="opacity-5" testID="opacity-5" />
                <View className="opacity-10" testID="opacity-10" />
                <View className="opacity-20" testID="opacity-20" />
                <View className="opacity-25" testID="opacity-25" />
                <View className="opacity-30" testID="opacity-30" />
                <View className="opacity-40" testID="opacity-40" />
                <View className="opacity-50" testID="opacity-50" />
                <View className="opacity-60" testID="opacity-60" />
                <View className="opacity-70" testID="opacity-70" />
                <View className="opacity-75" testID="opacity-75" />
                <View className="opacity-80" testID="opacity-80" />
                <View className="opacity-90" testID="opacity-90" />
                <View className="opacity-95" testID="opacity-95" />
                <View className="opacity-100" testID="opacity-100" />
            </React.Fragment>,
        )

        expect(getStylesFromId('opacity-0').opacity).toBe(0)
        expect(getStylesFromId('opacity-5').opacity).toBe(0.05)
        expect(getStylesFromId('opacity-10').opacity).toBe(0.1)
        expect(getStylesFromId('opacity-25').opacity).toBe(0.25)
        expect(getStylesFromId('opacity-50').opacity).toBe(0.5)
        expect(getStylesFromId('opacity-75').opacity).toBe(0.75)
        expect(getStylesFromId('opacity-100').opacity).toBe(1)
    })

    test('Arbitrary Opacity', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="opacity-[.33]" testID="opacity-arbitrary" />
                <View className="opacity-[0.67]" testID="opacity-arbitrary-2" />
            </React.Fragment>,
        )
        expect(getStylesFromId('opacity-arbitrary').opacity).toBe(0.33)
        expect(getStylesFromId('opacity-arbitrary-2').opacity).toBe(0.67)
    })
})
