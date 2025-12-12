import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Pressable from '../../src/components/native/Pressable'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

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
