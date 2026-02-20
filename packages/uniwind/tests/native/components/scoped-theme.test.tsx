import { act } from '@testing-library/react-native'
import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet } from 'react-native'
import Button from '../../../src/components/native/Button'
import View from '../../../src/components/native/View'
import { ScopedTheme } from '../../../src/components/ScopedTheme/ScopedTheme.native'
import { Uniwind } from '../../../src/core'
import { withUniwind } from '../../../src/hoc/withUniwind.native'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'
import { useResolveClassNames } from '../../../src/hooks/useResolveClassNames.native'
import { renderUniwind } from '../utils'

describe('ScopedTheme', () => {
    afterEach(() => {
        Uniwind.setTheme('light')
    })

    test('Component styles', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="bg-background" testID="base" />
                <ScopedTheme theme="dark">
                    <View className="bg-background" testID="nested-dark" />
                    <ScopedTheme theme="light">
                        <View className="bg-background" testID="nested-light-in-dark" />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(getStylesFromId('base').backgroundColor).toEqual('#ffffff')
        expect(getStylesFromId('nested-dark').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('nested-light-in-dark').backgroundColor).toEqual('#ffffff')

        act(() => {
            Uniwind.setTheme('dark')
        })

        expect(getStylesFromId('base').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('nested-dark').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('nested-light-in-dark').backgroundColor).toEqual('#ffffff')
    })

    test('Component accents', () => {
        const { getByText } = renderUniwind(
            <React.Fragment>
                <Button colorClassName="accent-background" title="base" />
                <ScopedTheme theme="dark">
                    <Button colorClassName="accent-background" title="nested-dark" />
                    <ScopedTheme theme="light">
                        <Button colorClassName="accent-background" title="nested-light-in-dark" />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        const getColor = (text: string) => StyleSheet.flatten(getByText(text).props.style).color

        expect(getColor('base')).toEqual('#ffffff')
        expect(getColor('nested-dark')).toEqual('#000000')
        expect(getColor('nested-light-in-dark')).toEqual('#ffffff')

        act(() => {
            Uniwind.setTheme('dark')
        })

        expect(getColor('base')).toEqual('#000000')
        expect(getColor('nested-dark')).toEqual('#000000')
        expect(getColor('nested-light-in-dark')).toEqual('#ffffff')
    })

    test('withUniwind', () => {
        const Component: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />
        const WithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <WithUniwind className="bg-background" testID="base" />
                <ScopedTheme theme="dark">
                    <WithUniwind className="bg-background" testID="nested-dark" />
                    <ScopedTheme theme="light">
                        <WithUniwind className="bg-background" testID="nested-light-in-dark" />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(getStylesFromId('base').backgroundColor).toEqual('#ffffff')
        expect(getStylesFromId('nested-dark').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('nested-light-in-dark').backgroundColor).toEqual('#ffffff')

        act(() => {
            Uniwind.setTheme('dark')
        })

        expect(getStylesFromId('base').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('nested-dark').backgroundColor).toEqual('#000000')
        expect(getStylesFromId('nested-light-in-dark').backgroundColor).toEqual('#ffffff')
    })

    test('useResolveClassNames', () => {
        const base = jest.fn()
        const nestedDark = jest.fn()
        const nestedLightInDark = jest.fn()

        const Component = (props: { test: jest.Mock }) => {
            const { backgroundColor } = useResolveClassNames('bg-background')

            props.test(backgroundColor)

            return null
        }

        renderUniwind(
            <React.Fragment>
                <Component test={base} />
                <ScopedTheme theme="dark">
                    <Component test={nestedDark} />
                    <ScopedTheme theme="light">
                        <Component test={nestedLightInDark} />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(base).toHaveBeenCalledWith('#ffffff')
        expect(nestedDark).toHaveBeenCalledWith('#000000')
        expect(nestedLightInDark).toHaveBeenCalledWith('#ffffff')

        act(() => {
            Uniwind.setTheme('dark')
        })

        expect(base).toHaveBeenLastCalledWith('#000000')
        expect(nestedDark).toHaveBeenLastCalledWith('#000000')
        expect(nestedLightInDark).toHaveBeenLastCalledWith('#ffffff')
    })

    test('useCSSVariable', () => {
        const base = jest.fn()
        const nestedDark = jest.fn()
        const nestedLightInDark = jest.fn()

        const Component = (props: { test: jest.Mock }) => {
            const backgroundColor = useCSSVariable('--color-background')

            props.test(backgroundColor)

            return null
        }

        renderUniwind(
            <React.Fragment>
                <Component test={base} />
                <ScopedTheme theme="dark">
                    <Component test={nestedDark} />
                    <ScopedTheme theme="light">
                        <Component test={nestedLightInDark} />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(base).toHaveBeenCalledWith('#ffffff')
        expect(nestedDark).toHaveBeenCalledWith('#000000')
        expect(nestedLightInDark).toHaveBeenCalledWith('#ffffff')

        act(() => {
            Uniwind.setTheme('dark')
        })

        expect(base).toHaveBeenLastCalledWith('#000000')
        expect(nestedDark).toHaveBeenLastCalledWith('#000000')
        expect(nestedLightInDark).toHaveBeenLastCalledWith('#ffffff')
    })
})
