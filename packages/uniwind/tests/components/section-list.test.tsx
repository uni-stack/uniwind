import { render } from '@testing-library/react-native'
import * as React from 'react'
import { SectionList as RNSectionList, StyleSheet } from 'react-native'
import SectionList from '../../src/components/native/SectionList'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('SectionList', () => {
    test('Basic rendering with classNames and colors', () => {
        const { UNSAFE_getByType } = render(
            <SectionList
                sections={[]}
                renderItem={() => null}
                className="bg-red-500"
                contentContainerClassName="bg-blue-500"
                ListHeaderComponentClassName="bg-green-500"
                ListFooterComponentClassName="bg-red-500"
                endFillColorClassName="accent-blue-500"
            />,
        )

        const component = UNSAFE_getByType(RNSectionList)

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

        // Check ListFooterComponentStyle
        expect(StyleSheet.flatten(component.props.ListFooterComponentStyle)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check endFillColor
        expect(component.props.endFillColor).toEqual(TW_BLUE_500)
    })
})
