import { act } from '@testing-library/react-native'
import * as React from 'react'
import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { useUniwind } from '../../../src'
import ActivityIndicator from '../../../src/components/native/ActivityIndicator'
import View from '../../../src/components/native/View'
import { Uniwind } from '../../../src/core'
import { withUniwind } from '../../../src/hoc/withUniwind.native'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'
import { renderUniwind } from '../utils'

const Component: React.FC<ActivityIndicatorProps> = (props) => <RNActivityIndicator {...props} />
const AutoWithUniwind = withUniwind(Component)
const ManualWithUniwind = withUniwind(Component, {
    style: { fromClassName: 'styleClassName' },
    color: { fromClassName: 'colorClassName', styleProperty: 'accentColor' },
})

describe('freeze', () => {
    afterEach(() => {
        act(() => Uniwind.setTheme('light'))
    })

    test('external stores catch up after a suspended tree is revealed', () => {
        const pending = { then() {} }
        const themes = jest.fn()
        const variables = jest.fn()

        const Suspender = (props: { freeze: boolean; children: React.ReactNode }) => {
            if (props.freeze) {
                throw pending
            }

            return props.children
        }
        const ThemeProbe = () => {
            themes(useUniwind().theme)

            return null
        }
        const VariableProbe = () => {
            variables(useCSSVariable('--color-background'))

            return null
        }
        const App = ({ freeze }: { freeze: boolean }) => (
            <React.Suspense fallback={null}>
                <Suspender freeze={freeze}>
                    <ThemeProbe />
                    <VariableProbe />
                    <View className="bg-background" testID="regular-class" />
                    <ActivityIndicator colorClassName="accent-background" testID="regular-color" />
                    <AutoWithUniwind className="bg-background" colorClassName="accent-background" testID="auto" />
                    <ManualWithUniwind
                        styleClassName="bg-background"
                        colorClassName="accent-background"
                        testID="manual"
                    />
                </Suspender>
            </React.Suspense>
        )

        const { getByTestId, getStylesFromId, rerender } = renderUniwind(<App freeze={false} />)
        expect(themes).toHaveBeenLastCalledWith('light')
        expect(variables).toHaveBeenLastCalledWith('#ffffff')
        expect(getStylesFromId('regular-class').backgroundColor).toBe('#ffffff')
        expect(getByTestId('regular-color').props.color).toBe('#ffffff')
        expect(getStylesFromId('auto').backgroundColor).toBe('#ffffff')
        expect(getByTestId('auto').props.color).toBe('#ffffff')
        expect(getStylesFromId('manual').backgroundColor).toBe('#ffffff')
        expect(getByTestId('manual').props.color).toBe('#ffffff')

        rerender(<App freeze />)
        act(() => Uniwind.setTheme('dark'))
        rerender(<App freeze={false} />)

        expect(themes).toHaveBeenLastCalledWith('dark')
        expect(variables).toHaveBeenLastCalledWith('#000000')
        expect(getStylesFromId('regular-class').backgroundColor).toBe('#000000')
        expect(getByTestId('regular-color').props.color).toBe('#000000')
        expect(getStylesFromId('auto').backgroundColor).toBe('#000000')
        expect(getByTestId('auto').props.color).toBe('#000000')
        expect(getStylesFromId('manual').backgroundColor).toBe('#000000')
        expect(getByTestId('manual').props.color).toBe('#000000')
    })
})
