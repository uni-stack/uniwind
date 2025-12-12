import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Pressable from '../../src/components/native/Pressable'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('Pressable', () => {
    test('Basic rendering with className', () => {
        const { getByTestId } = render(
            <Pressable
                className="bg-red-500"
                testID="pressable-1"
            />,
        )

        const component = getByTestId('pressable-1')
        const flatStyle = StyleSheet.flatten(component.props.style)

        expect(flatStyle).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with active state (pressed)', () => {
        const { getByTestId } = render(
            <Pressable
                className="bg-red-500 active:bg-green-500"
                testID="pressable-active"
            />,
        )

        const component = getByTestId('pressable-active')

        // Initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Press in
        fireEvent(component, 'responderGrant', {
            nativeEvent: {
                changedTouches: [],
                identifier: '1',
                locationX: 0,
                locationY: 0,
                pageX: 0,
                pageY: 0,
                target: '1',
                timestamp: Date.now(),
                touches: [],
            },
            touchHistory: {
                touchBank: [],
            },
            persist: jest.fn(),
        })

        // Active state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_GREEN_500,
        })
    })

    test('Rendering with disabled state', () => {
        const { getByTestId } = render(
            <Pressable
                className="bg-red-500 disabled:bg-blue-500"
                disabled={true}
                testID="pressable-disabled"
            />,
        )

        const component = getByTestId('pressable-disabled')
        const flatStyle = StyleSheet.flatten(component.props.style)

        expect(flatStyle).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })
})
