import { act } from '@testing-library/react-native'
import * as React from 'react'
import View from '../../../src/components/native/View'
import { Uniwind } from '../../../src/core'
import { renderUniwind } from '../utils'

describe('style reconnection', () => {
    afterEach(() => {
        act(() => Uniwind.setTheme('light'))
    })

    test('catches up with theme changes while Activity is hidden', () => {
        // Keep the child stable so a parent render cannot repair stale styles.
        const child = <View className="bg-background" testID="view" />
        const App = ({ hidden }: { hidden: boolean }) => <React.Activity mode={hidden ? 'hidden' : 'visible'}>{child}</React.Activity>
        const { getStylesFromId, rerender } = renderUniwind(<App hidden={false} />)
        expect(getStylesFromId('view').backgroundColor).toEqual('#ffffff')

        rerender(<App hidden />)
        act(() => Uniwind.setTheme('dark'))
        rerender(<App hidden={false} />)
        expect(getStylesFromId('view').backgroundColor).toEqual('#000000')

        rerender(<App hidden />)
        act(() => Uniwind.setTheme('light'))
        rerender(<App hidden={false} />)
        expect(getStylesFromId('view').backgroundColor).toEqual('#ffffff')

        act(() => Uniwind.setTheme('dark'))
        expect(getStylesFromId('view').backgroundColor).toEqual('#000000')
    })

    test('catches up with theme changes while Suspense is suspended', () => {
        const pending = { then() {} }
        const child = <View className="bg-background" testID="view" />
        const Suspender = ({ freeze }: { freeze: boolean }) => {
            if (freeze) {
                throw pending
            }

            return child
        }
        const App = ({ freeze }: { freeze: boolean }) => (
            <React.Suspense fallback={null}>
                <Suspender freeze={freeze} />
            </React.Suspense>
        )
        const { getStylesFromId, rerender } = renderUniwind(<App freeze={false} />)
        expect(getStylesFromId('view').backgroundColor).toEqual('#ffffff')

        rerender(<App freeze />)
        act(() => Uniwind.setTheme('dark'))
        rerender(<App freeze={false} />)
        expect(getStylesFromId('view').backgroundColor).toEqual('#000000')
    })
})
