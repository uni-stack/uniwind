import { render } from '@testing-library/react-native'
import * as React from 'react'
import { RefreshControl as RNRefreshControl, StyleSheet } from 'react-native'
import RefreshControl from '../../src/components/native/RefreshControl'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('RefreshControl', () => {
    test('Basic rendering with className and color props', () => {
        const { UNSAFE_getByType } = render(
            <RefreshControl
                refreshing={false}
                className="bg-red-500"
                colorsClassName="accent-blue-500"
                tintColorClassName="accent-green-500"
                titleColorClassName="accent-red-500"
                progressBackgroundColorClassName="accent-blue-500"
                testID="refresh-control-1"
            />,
        )

        const component = UNSAFE_getByType(RNRefreshControl)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check colors (it should be an array containing the color)
        expect(component.props.colors).toEqual([TW_BLUE_500])

        // Check tintColor
        expect(component.props.tintColor).toEqual(TW_GREEN_500)

        // Check titleColor
        expect(component.props.titleColor).toEqual(TW_RED_500)

        // Check progressBackgroundColor
        expect(component.props.progressBackgroundColor).toEqual(TW_BLUE_500)
    })
})
