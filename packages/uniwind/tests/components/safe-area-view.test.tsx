import { render } from '@testing-library/react-native'
import * as React from 'react'
import { SafeAreaView as RNSafeAreaView, StyleSheet } from 'react-native'
import SafeAreaView from '../../src/components/native/SafeAreaView'
import { TW_RED_500 } from '../consts'

describe('SafeAreaView', () => {
    test('Basic rendering with className', () => {
        const { UNSAFE_getByType } = render(
            <SafeAreaView
                className="bg-red-500"
                testID="safe-area-view-1"
            />,
        )

        const component = UNSAFE_getByType(RNSafeAreaView)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })
})
