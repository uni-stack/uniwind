import * as React from 'react'
import View from '../../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Platform Color', () => {
    test('Names per platform with a fallback', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="bg-[platform-color(systemBlue,?attr/colorPrimary,#007aff)]" testID="both" />
                <View className="bg-[platform-color(@android:color/holo_blue_light,#ff0000)]" testID="android-only" />
                <View className="bg-[platform-color(systemRed)]" testID="no-fallback" />
                <View className="bg-[platform-color(system_red,#ff0000)]" testID="underscore" />
                <View className="text-system-label" testID="theme" />
            </React.Fragment>,
        )

        expect(getStylesFromId('both').backgroundColor).toEqual({ semantic: ['systemBlue'], fallback: '#007aff' })
        expect(getStylesFromId('android-only').backgroundColor).toBe('#ff0000')
        expect(getStylesFromId('no-fallback').backgroundColor).toEqual({ semantic: ['systemRed'] })
        expect(getStylesFromId('underscore').backgroundColor).toEqual({ semantic: ['system_red'], fallback: '#ff0000' })
        expect(getStylesFromId('theme').color).toEqual({ semantic: ['label'], fallback: '#000000' })
    })
})
