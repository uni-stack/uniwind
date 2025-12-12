import { render } from '@testing-library/react-native'
import * as React from 'react'
import { KeyboardAvoidingView as RNKeyboardAvoidingView, StyleSheet } from 'react-native'
import KeyboardAvoidingView from '../../src/components/native/KeyboardAvoidingView'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

describe('KeyboardAvoidingView', () => {
    test('Basic rendering with className and contentContainerClassName', () => {
        const { UNSAFE_getByType } = render(
            <KeyboardAvoidingView
                className="bg-red-500"
                contentContainerClassName="bg-blue-500"
                testID="keyboard-avoiding-view-1"
                behavior="padding"
            />,
        )

        const component = UNSAFE_getByType(RNKeyboardAvoidingView)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual(expect.objectContaining({
            backgroundColor: TW_RED_500,
        }))

        // Check contentContainerStyle
        expect(StyleSheet.flatten(component.props.contentContainerStyle)).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })
})
