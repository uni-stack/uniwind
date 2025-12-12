import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet, TouchableOpacity as RNTouchableOpacity, View } from 'react-native'
import TouchableOpacity from '../../src/components/native/TouchableOpacity'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('TouchableOpacity', () => {
    test('Basic rendering with className', () => {
        const { UNSAFE_getByType } = render(
            <TouchableOpacity
                className="bg-red-500"
                testID="touchable-opacity-1"
            >
                <View />
            </TouchableOpacity>,
        )

        const component = UNSAFE_getByType(RNTouchableOpacity)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with active state (pressed)', () => {
        const { getByTestId, UNSAFE_getByType } = render(
            <TouchableOpacity
                className="bg-red-500 active:bg-blue-500"
                testID="touchable-opacity-active"
            >
                <View />
            </TouchableOpacity>,
        )

        const component = UNSAFE_getByType(RNTouchableOpacity)
        const touchable = getByTestId('touchable-opacity-active')

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
            <TouchableOpacity
                className="bg-red-500 disabled:bg-green-500"
                disabled={true}
                testID="touchable-opacity-disabled"
            >
                <View />
            </TouchableOpacity>,
        )

        const component = UNSAFE_getByType(RNTouchableOpacity)

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_GREEN_500,
        })
    })
})
