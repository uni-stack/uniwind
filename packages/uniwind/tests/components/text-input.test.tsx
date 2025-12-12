import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import TextInput from '../../src/components/native/TextInput'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('TextInput', () => {
    test('Basic rendering with className and color props', () => {
        const { getByTestId } = render(
            <TextInput
                className="bg-red-500"
                cursorColorClassName="accent-blue-500"
                selectionColorClassName="accent-green-500"
                placeholderTextColorClassName="accent-red-500"
                selectionHandleColorClassName="accent-blue-500"
                underlineColorAndroidClassName="accent-green-500"
                testID="text-input-1"
            />,
        )

        const component = getByTestId('text-input-1')

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check cursorColor
        expect(component.props.cursorColor).toEqual(TW_BLUE_500)

        // Check selectionColor
        expect(component.props.selectionColor).toEqual(TW_GREEN_500)

        // Check placeholderTextColor
        expect(component.props.placeholderTextColor).toEqual(TW_RED_500)

        // Check selectionHandleColor
        expect(component.props.selectionHandleColor).toEqual(TW_BLUE_500)

        // Check underlineColorAndroid
        expect(component.props.underlineColorAndroid).toEqual(TW_GREEN_500)
    })

    test('Rendering with focus state', () => {
        const { getByTestId } = render(
            <TextInput
                className="bg-red-500 focus:bg-blue-500"
                testID="text-input-focus"
            />,
        )

        const component = getByTestId('text-input-focus')

        // Initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Focus
        fireEvent(component, 'focus')

        // Focus state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_BLUE_500,
        })

        // Blur
        fireEvent(component, 'blur')

        // Back to initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with active state (pressed)', () => {
        const { getByTestId } = render(
            <TextInput
                className="bg-red-500 active:bg-blue-500"
                testID="text-input-active"
            />,
        )

        const component = getByTestId('text-input-active')

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

    test('Rendering with disabled state (editable=false)', () => {
        const { getByTestId } = render(
            <TextInput
                className="bg-red-500 disabled:bg-blue-500"
                editable={false}
                testID="text-input-disabled"
            />,
        )

        const component = getByTestId('text-input-disabled')

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })
})
