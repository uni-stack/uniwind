import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet, TouchableWithoutFeedback as RNTouchableWithoutFeedback, View } from 'react-native'
import TouchableWithoutFeedback from '../../src/components/native/TouchableWithoutFeedback'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('TouchableWithoutFeedback', () => {
    test('Basic rendering with className', () => {
        const { UNSAFE_getByType } = render(
            <TouchableWithoutFeedback
                className="bg-red-500"
                testID="touchable-without-feedback-1"
            >
                <View />
            </TouchableWithoutFeedback>,
        )

        const component = UNSAFE_getByType(RNTouchableWithoutFeedback)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with active state (pressed)', () => {
        const { getByTestId, UNSAFE_getByType } = render(
            <TouchableWithoutFeedback
                className="bg-red-500 active:bg-blue-500"
                testID="touchable-without-feedback-active"
            >
                <View />
            </TouchableWithoutFeedback>,
        )

        const component = UNSAFE_getByType(RNTouchableWithoutFeedback)
        const touchable = getByTestId('touchable-without-feedback-active')

        // Initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Press in
        fireEvent(touchable, 'pressIn')

        // Active state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_BLUE_500,
        })

        // Press out
        fireEvent(touchable, 'pressOut')

        // Back to initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with disabled state', () => {
        const { UNSAFE_getByType } = render(
            <TouchableWithoutFeedback
                className="bg-red-500 disabled:bg-green-500"
                disabled={true}
                testID="touchable-without-feedback-disabled"
            >
                <View />
            </TouchableWithoutFeedback>,
        )

        const component = UNSAFE_getByType(RNTouchableWithoutFeedback)

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_GREEN_500,
        })
    })
})
