import { render } from '@testing-library/react-native'
import * as React from 'react'
import { InputAccessoryView as RNInputAccessoryView, Platform, StyleSheet } from 'react-native'
import InputAccessoryView from '../../src/components/native/InputAccessoryView'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

describe('InputAccessoryView', () => {
    beforeAll(() => {
        Platform.OS = 'ios'
    })

    test('Basic rendering with className and backgroundColorClassName', () => {
        const { UNSAFE_getByType } = render(
            <InputAccessoryView
                nativeID="inputAccessoryView1"
                className="bg-red-500"
                backgroundColorClassName="accent-blue-500"
            />,
        )

        const component = UNSAFE_getByType(RNInputAccessoryView)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check backgroundColor
        expect(component.props.backgroundColor).toEqual(TW_BLUE_500)
    })
})
