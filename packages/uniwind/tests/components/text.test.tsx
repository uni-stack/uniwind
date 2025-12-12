import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Text from '../../src/components/native/Text'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

describe('Text', () => {
    test('Basic rendering with className and selectionColorClassName', () => {
        const { getByText } = render(
            <Text
                className="text-red-500"
                selectionColorClassName="accent-blue-500"
            >
                Hello World
            </Text>,
        )

        const component = getByText('Hello World')

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_RED_500,
        })

        // Check selectionColor
        expect(component.props.selectionColor).toEqual(TW_BLUE_500)
    })

    test('Rendering with active state (pressed)', () => {
        const { getByText } = render(
            <Text className="text-red-500 active:text-blue-500">
                Press Me
            </Text>,
        )

        const component = getByText('Press Me')

        // Initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_RED_500,
        })

        // Press in
        fireEvent(component, 'pressIn')

        // Active state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_BLUE_500,
        })

        // Press out
        fireEvent(component, 'pressOut')

        // Back to initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_RED_500,
        })
    })

    test('Rendering with disabled state', () => {
        const { getByText } = render(
            <Text
                className="text-red-500 disabled:text-blue-500"
                disabled={true}
            >
                Disabled Text
            </Text>,
        )

        const component = getByText('Disabled Text')

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_BLUE_500,
        })
    })
})
