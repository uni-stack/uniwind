import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import View from '../../src/components/native/View'
import { TW_RED_500 } from '../consts'

describe('View', () => {
    test('Basic rendering', () => {
        const { getByTestId } = render(
            <React.Fragment>
                <View className="bg-red-500" testID="view-1" />
            </React.Fragment>,
        )

        const view = getByTestId('view-1')

        expect(StyleSheet.flatten(view.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })
})
