import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet, TouchableHighlight as RNTouchableHighlight, View } from 'react-native'
import TouchableHighlight from '../../src/components/native/TouchableHighlight'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('TouchableHighlight', () => {
    test('Basic rendering with className and underlayColorClassName', () => {
        const { UNSAFE_getByType } = render(
            <TouchableHighlight
                className="bg-red-500"
                underlayColorClassName="accent-blue-500"
                testID="touchable-highlight-1"
            >
                <View />
            </TouchableHighlight>,
        )

        const component = UNSAFE_getByType(RNTouchableHighlight)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check underlayColor
        expect(component.props.underlayColor).toEqual(TW_BLUE_500)
    })

    test('Rendering with active state (pressed)', () => {
        const { getByTestId } = render(
            <TouchableHighlight
                className="bg-red-500 active:bg-blue-500"
                testID="touchable-highlight-active"
            >
                <View />
            </TouchableHighlight>,
        )

        const component = getByTestId('touchable-highlight-active')

        // Initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Press in
        fireEvent(component, 'pressIn')

        // Active state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_BLUE_500,
        })

        // Press out
        fireEvent(component, 'pressOut')

        // Back to initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with disabled state', () => {
        const { getByTestId } = render(
            <TouchableHighlight
                className="bg-red-500 disabled:bg-green-500"
                disabled={true}
                testID="touchable-highlight-disabled"
            >
                <View />
            </TouchableHighlight>,
        )

        const component = getByTestId('touchable-highlight-disabled')

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_GREEN_500,
        })
    })
})
