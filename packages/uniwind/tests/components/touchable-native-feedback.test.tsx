import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { Platform, StyleSheet, TouchableNativeFeedback as RNTouchableNativeFeedback, View } from 'react-native'
import TouchableNativeFeedback from '../../src/components/native/TouchableNativeFeedback'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('TouchableNativeFeedback', () => {
    beforeAll(() => {
        Platform.OS = 'android'
    })

    test('Basic rendering with className', () => {
        const { UNSAFE_getByType } = render(
            <TouchableNativeFeedback
                className="bg-red-500"
                testID="touchable-native-feedback-1"
            >
                <View />
            </TouchableNativeFeedback>,
        )

        const component = UNSAFE_getByType(RNTouchableNativeFeedback)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with active state (pressed)', () => {
        const { getByTestId, UNSAFE_getByType } = render(
            <TouchableNativeFeedback
                className="bg-red-500 active:bg-blue-500"
                testID="touchable-native-feedback-active"
            >
                <View />
            </TouchableNativeFeedback>,
        )

        const component = UNSAFE_getByType(RNTouchableNativeFeedback)
        const touchable = getByTestId('touchable-native-feedback-active')

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
            <TouchableNativeFeedback
                className="bg-red-500 disabled:bg-green-500"
                disabled={true}
                testID="touchable-native-feedback-disabled"
            >
                <View />
            </TouchableNativeFeedback>,
        )

        const component = UNSAFE_getByType(RNTouchableNativeFeedback)

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_GREEN_500,
        })
    })
})
