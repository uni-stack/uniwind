import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet } from 'react-native'
import Button from '../../../src/components/native/Button'
import View from '../../../src/components/native/View'
import { ScopedTheme } from '../../../src/components/ScopedTheme/ScopedTheme.native'
import { withUniwind } from '../../../src/hoc/withUniwind.native'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'
import { useResolveClassNames } from '../../../src/hooks/useResolveClassNames.native'
import { renderUniwind } from '../utils'

describe('ScopedTheme', () => {
    test('Component styles', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="bg-background" testID="light" />
                <ScopedTheme theme="dark">
                    <View className="bg-background" testID="nested-dark" />
                    <ScopedTheme theme="light">
                        <View className="bg-background" testID="nested-light-in-dark" />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        const light = getStylesFromId('light')
        const nestedDark = getStylesFromId('nested-dark')
        const nestedLightInDark = getStylesFromId('nested-light-in-dark')

        expect(light.backgroundColor).toEqual('#ffffff')
        expect(nestedDark.backgroundColor).toEqual('#000000')
        expect(nestedLightInDark.backgroundColor).toEqual('#ffffff')
    })

    test('Component accents', () => {
        const { getByText } = renderUniwind(
            <React.Fragment>
                <Button colorClassName="accent-background" title="light" />
                <ScopedTheme theme="dark">
                    <Button colorClassName="accent-background" title="nested-dark" />
                    <ScopedTheme theme="light">
                        <Button colorClassName="accent-background" title="nested-light-in-dark" />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        const light = StyleSheet.flatten(getByText('light').props.style)
        const nestedDark = StyleSheet.flatten(getByText('nested-dark').props.style)
        const nestedLightInDark = StyleSheet.flatten(getByText('nested-light-in-dark').props.style)

        expect(light.color).toEqual('#ffffff')
        expect(nestedDark.color).toEqual('#000000')
        expect(nestedLightInDark.color).toEqual('#ffffff')
    })

    test('withUniwind', () => {
        const Component: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />
        const WithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <WithUniwind className="bg-background" testID="light" />
                <ScopedTheme theme="dark">
                    <WithUniwind className="bg-background" testID="nested-dark" />
                    <ScopedTheme theme="light">
                        <WithUniwind className="bg-background" testID="nested-light-in-dark" />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        const light = getStylesFromId('light')
        const nestedDark = getStylesFromId('nested-dark')
        const nestedLightInDark = getStylesFromId('nested-light-in-dark')

        expect(light.backgroundColor).toEqual('#ffffff')
        expect(nestedDark.backgroundColor).toEqual('#000000')
        expect(nestedLightInDark.backgroundColor).toEqual('#ffffff')
    })

    test('useResolveClassNames', () => {
        const light = jest.fn()
        const nestedDark = jest.fn()
        const nestedLightInDark = jest.fn()

        const Component = (props: { test: jest.Mock }) => {
            const { backgroundColor } = useResolveClassNames('bg-background')

            props.test(backgroundColor)

            return null
        }

        renderUniwind(
            <React.Fragment>
                <Component test={light} />
                <ScopedTheme theme="dark">
                    <Component test={nestedDark} />
                    <ScopedTheme theme="light">
                        <Component test={nestedLightInDark} />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(light).toHaveBeenCalledWith('#ffffff')
        expect(nestedDark).toHaveBeenCalledWith('#000000')
        expect(nestedLightInDark).toHaveBeenCalledWith('#ffffff')
    })

    test('useCSSVariable', () => {
        const light = jest.fn()
        const nestedDark = jest.fn()
        const nestedLightInDark = jest.fn()

        const Component = (props: { test: jest.Mock }) => {
            const backgroundColor = useCSSVariable('--color-background')

            props.test(backgroundColor)

            return null
        }

        renderUniwind(
            <React.Fragment>
                <Component test={light} />
                <ScopedTheme theme="dark">
                    <Component test={nestedDark} />
                    <ScopedTheme theme="light">
                        <Component test={nestedLightInDark} />
                    </ScopedTheme>
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(light).toHaveBeenCalledWith('#ffffff')
        expect(nestedDark).toHaveBeenCalledWith('#000000')
        expect(nestedLightInDark).toHaveBeenCalledWith('#ffffff')
    })
})
