import { act, render } from '@testing-library/react'
import * as React from 'react'
import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { useUniwind } from '../../../src'
import ActivityIndicator from '../../../src/components/web/ActivityIndicator'
import View from '../../../src/components/web/View'
import { Uniwind } from '../../../src/core'
import { withUniwind } from '../../../src/hoc/withUniwind'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'

const state = vi.hoisted(() => ({ color: '#ffffff' }))

vi.mock('../../../src/core/web', async importOriginal => ({
    ...await importOriginal(),
    getWebStyles: () => ({ accentColor: state.color, backgroundColor: state.color }),
    getWebVariable: () => state.color,
}))

describe('freeze', () => {
    afterEach(() => {
        state.color = '#ffffff'
        act(() => Uniwind.setTheme('light'))
    })

    test('external stores catch up after a suspended tree is revealed', () => {
        const pending = { then() {} }
        const themes = vi.fn()
        const variables = vi.fn()
        const auto = vi.fn()
        const manual = vi.fn()
        const AutoComponent: React.FC<ActivityIndicatorProps> = (props) => {
            auto(props)

            return <RNActivityIndicator {...props} />
        }
        const ManualComponent: React.FC<ActivityIndicatorProps> = (props) => {
            manual(props)

            return <RNActivityIndicator {...props} />
        }
        const AutoWithUniwind = withUniwind(AutoComponent)
        const ManualWithUniwind = withUniwind(ManualComponent, {
            style: { fromClassName: 'styleClassName' },
            color: { fromClassName: 'colorClassName', styleProperty: 'accentColor' },
        })
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

        const { getByTestId, rerender } = render(<App freeze={false} />)
        expect(themes).toHaveBeenLastCalledWith('light')
        expect(variables).toHaveBeenLastCalledWith('#ffffff')
        expect(getByTestId('regular-class')).toHaveClass('bg-background')
        expect(getByTestId('regular-color').querySelector<SVGCircleElement>('circle:last-child')?.style.stroke).toBe('rgb(255, 255, 255)')
        expect(auto).toHaveBeenLastCalledWith(expect.objectContaining({ color: '#ffffff' }))
        expect(manual).toHaveBeenLastCalledWith(expect.objectContaining({ color: '#ffffff' }))

        rerender(<App freeze />)
        act(() => {
            state.color = '#000000'
            Uniwind.setTheme('dark')
        })
        rerender(<App freeze={false} />)

        expect(themes).toHaveBeenLastCalledWith('dark')
        expect(variables).toHaveBeenLastCalledWith('#000000')
        expect(getByTestId('regular-class')).toHaveClass('bg-background')
        expect(getByTestId('regular-color').querySelector<SVGCircleElement>('circle:last-child')?.style.stroke).toBe('rgb(0, 0, 0)')
        expect(auto).toHaveBeenLastCalledWith(expect.objectContaining({ color: '#000000' }))
        expect(manual).toHaveBeenLastCalledWith(expect.objectContaining({ color: '#000000' }))
    })
})
