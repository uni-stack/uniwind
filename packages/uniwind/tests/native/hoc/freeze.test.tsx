import { act } from '@testing-library/react-native'
import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { useUniwind } from '../../../src'
import { Uniwind } from '../../../src/core'
import { withUniwind } from '../../../src/hoc/withUniwind.native'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'
import { renderUniwind } from '../utils'

const Component: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />
const WithUniwind = withUniwind(Component)

describe('withUniwind freeze', () => {
    afterEach(() => {
        act(() => Uniwind.setTheme('light'))
    })

    test('catches up after a suspended tree is revealed', () => {
        const pending = { then() {} }
        const seen = jest.fn()

        const Suspender = (props: { freeze: boolean; children: React.ReactNode }) => {
            if (props.freeze) {
                throw pending
            }

            return props.children
        }
        const Probe = () => {
            const background = useCSSVariable(['--color-background'])[0]
            seen(useUniwind().theme, background)

            return <WithUniwind className="bg-background" testID="probe" />
        }
        const App = ({ freeze }: { freeze: boolean }) => (
            <React.Suspense fallback={null}>
                <Suspender freeze={freeze}>
                    <Probe />
                </Suspender>
            </React.Suspense>
        )

        const { getStylesFromId, rerender } = renderUniwind(<App freeze={false} />)
        expect(seen).toHaveBeenLastCalledWith('light', '#ffffff')
        expect(getStylesFromId('probe').backgroundColor).toBe('#ffffff')

        rerender(<App freeze />)
        act(() => Uniwind.setTheme('dark'))
        rerender(<App freeze={false} />)

        expect(seen).toHaveBeenLastCalledWith('dark', '#000000')
        expect(getStylesFromId('probe').backgroundColor).toBe('#000000')
    })
})
