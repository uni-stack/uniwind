import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet, Text, VirtualizedList as RNVirtualizedList } from 'react-native'
import VirtualizedList from '../../src/components/native/VirtualizedList'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500, TW_YELLOW_500 } from '../consts'

describe('VirtualizedList', () => {
    const data = ['Item 1', 'Item 2']
    const getItem = (data: string[], index: number) => data[index]
    const getItemCount = (data: string[]) => data.length
    const renderItem = ({ item }: { item: string }) => <Text>{item}</Text>
    const keyExtractor = (item: string) => item

    test('Basic rendering with className', () => {
        const { UNSAFE_getByType } = render(
            <VirtualizedList
                data={data}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                className="bg-red-500"
            />,
        )

        const component = UNSAFE_getByType(RNVirtualizedList)

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    test('Rendering with contentContainerClassName', () => {
        const { UNSAFE_getByType } = render(
            <VirtualizedList
                data={data}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerClassName="bg-blue-500"
            />,
        )

        const component = UNSAFE_getByType(RNVirtualizedList)

        expect(StyleSheet.flatten(component.props.contentContainerStyle)).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })

    test('Rendering with ListHeaderComponentClassName', () => {
        const { UNSAFE_getByType } = render(
            <VirtualizedList
                data={data}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={<Text>Header</Text>}
                ListHeaderComponentClassName="bg-green-500"
            />,
        )

        const component = UNSAFE_getByType(RNVirtualizedList)

        expect(StyleSheet.flatten(component.props.ListHeaderComponentStyle)).toEqual({
            backgroundColor: TW_GREEN_500,
        })
    })

    test('Rendering with ListFooterComponentClassName', () => {
        const { UNSAFE_getByType } = render(
            <VirtualizedList
                data={data}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={<Text>Footer</Text>}
                ListFooterComponentClassName="bg-yellow-500"
            />,
        )

        const component = UNSAFE_getByType(RNVirtualizedList)

        expect(StyleSheet.flatten(component.props.ListFooterComponentStyle)).toEqual({
            backgroundColor: TW_YELLOW_500,
        })
    })

    test('Rendering with endFillColorClassName', () => {
        const { UNSAFE_getByType } = render(
            <VirtualizedList
                data={data}
                getItem={getItem}
                getItemCount={getItemCount}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                endFillColorClassName="accent-red-500"
            />,
        )

        const component = UNSAFE_getByType(RNVirtualizedList)

        expect(component.props.endFillColor).toBe(TW_RED_500)
    })
})
