import { render } from '@testing-library/react-native'
import * as React from 'react'
import { ScrollView as RNScrollView, StyleSheet } from 'react-native'
import ScrollView from '../../src/components/native/ScrollView'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

describe('ScrollView', () => {
    test('Basic rendering with className, contentContainerClassName and endFillColorClassName', () => {
        const { UNSAFE_getByType } = render(
            <ScrollView
                className="bg-red-500"
                contentContainerClassName="bg-blue-500"
                endFillColorClassName="accent-red-500"
                testID="scroll-view-1"
            />,
        )

        const component = UNSAFE_getByType(RNScrollView)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check contentContainerStyle
        expect(StyleSheet.flatten(component.props.contentContainerStyle)).toEqual({
            backgroundColor: TW_BLUE_500,
        })

        // Check endFillColor
        expect(component.props.endFillColor).toEqual(TW_RED_500)
    })
})
