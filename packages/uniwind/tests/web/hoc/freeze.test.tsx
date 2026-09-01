import { act, render } from '@testing-library/react'
import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Uniwind } from '../../../src/core'
import { withUniwind } from '../../../src/hoc/withUniwind'

const state = vi.hoisted(() => ({ color: '#ffffff' }))

vi.mock('../../../src/core/web', async importOriginal => ({
    ...await importOriginal(),
    getWebStyles: () => ({ accentColor: state.color }),
}))

describe('withUniwind freeze', () => {
    afterEach(() => {
        state.color = '#ffffff'
        act(() => Uniwind.setTheme('light'))
    })

    test('catches up after a suspended tree is revealed', () => {
        const pending = { then() {} }
        const seen = vi.fn()
        const Component: React.FC<ActivityIndicatorProps> = (props) => {
            seen(props.color)

            return <ActivityIndicator {...props} />
        }
        const WithUniwind = withUniwind(Component)
        const Suspender = (props: { freeze: boolean; children: React.ReactNode }) => {
            if (props.freeze) {
                throw pending
            }

            return props.children
        }
        const App = ({ freeze }: { freeze: boolean }) => (
            <React.Suspense fallback={null}>
                <Suspender freeze={freeze}>
                    <WithUniwind colorClassName="accent-background" />
                </Suspender>
            </React.Suspense>
        )

        const { rerender } = render(<App freeze={false} />)
        expect(seen).toHaveBeenLastCalledWith('#ffffff')

        rerender(<App freeze />)
        act(() => {
            state.color = '#000000'
            Uniwind.setTheme('dark')
        })
        rerender(<App freeze={false} />)

        expect(seen).toHaveBeenLastCalledWith('#000000')
    })
})
