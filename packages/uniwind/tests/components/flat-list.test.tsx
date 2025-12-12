import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import FlatList from '../../src/components/native/FlatList'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('FlatList', () => {
    test('Basic rendering with classNames and colors', () => {
        const { getByTestId } = render(
            <FlatList
                data={[]}
                renderItem={() => null}
                className="bg-red-500"
                contentContainerClassName="bg-blue-500"
                ListHeaderComponentClassName="bg-green-500"
                endFillColorClassName="accent-red-500"
                testID="flat-list-1"
            />,
        )

        const component = getByTestId('flat-list-1')

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check contentContainerStyle
        expect(StyleSheet.flatten(component.props.contentContainerStyle)).toEqual({
            backgroundColor: TW_BLUE_500,
        })

        // Check ListHeaderComponentStyle
        expect(StyleSheet.flatten(component.props.ListHeaderComponentStyle)).toEqual({
            backgroundColor: TW_GREEN_500,
        })

        // Check endFillColor
        expect(component.props.endFillColor).toEqual(TW_RED_500)
    })
})
