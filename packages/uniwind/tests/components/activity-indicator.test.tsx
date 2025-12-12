import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import ActivityIndicator from '../../src/components/native/ActivityIndicator'
import { TW_RED_500 } from '../consts'

describe('ActivityIndicator', () => {
    test('Basic rendering with colorClassName', () => {
        const { getByTestId } = render(
            <ActivityIndicator
                className="bg-red-500"
                colorClassName="accent-red-500"
                testID="activity-indicator-1"
            />,
        )

        const component = getByTestId('activity-indicator-1')
        const flatStyle = StyleSheet.flatten(component.props.style)

        expect(flatStyle).toEqual({
            backgroundColor: TW_RED_500,
        })
        expect(component.props.color).toEqual(TW_RED_500)
    })
})
