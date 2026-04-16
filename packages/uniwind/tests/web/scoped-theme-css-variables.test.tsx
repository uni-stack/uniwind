import { act, render } from '@testing-library/react'
import * as React from 'react'
import { ScopedTheme } from '../../src/components/ScopedTheme/ScopedTheme'
import { Uniwind } from '../../src/core/config/config'
import { getWebVariable } from '../../src/core/web/getWebStyles'
import { useCSSVariable } from '../../src/hooks/useCSSVariable'

describe('Scoped theme + CSS variables (web)', () => {
    afterEach(() => {
        Uniwind.setTheme('light')
        document.documentElement.removeAttribute('style')
    })

    test('getWebVariable reads runtime update for scoped theme while global theme stays light', () => {
        Uniwind.setTheme('light')
        Uniwind.updateCSSVariables('custom', { '--test-scoped-web-a': '#aabbcc' })

        const value = getWebVariable('--test-scoped-web-a', { scopedTheme: 'custom' })

        expect(value).toMatch(/^#aabbcc$/i)
    })

    test('useCSSVariable rerenders only affected custom scoped theme', () => {
        const base = jest.fn()
        const nestedScopedTestTheme = jest.fn()

        const Component = (props: { test: jest.Mock }) => {
            const v = useCSSVariable('--test-scoped-web-b')

            props.test(v)

            return null
        }

        Uniwind.setTheme('light')

        render(
            <React.Fragment>
                <Component test={base} />
                <ScopedTheme theme="custom">
                    <Component test={nestedScopedTestTheme} />
                </ScopedTheme>
            </React.Fragment>,
        )

        expect(Uniwind.currentTheme).toEqual('light')
        expect(base).toHaveBeenCalledTimes(1)
        expect(nestedScopedTestTheme).toHaveBeenCalledTimes(1)

        act(() => {
            Uniwind.updateCSSVariables('custom', { '--test-scoped-web-b': '#ddeeff' })
        })

        expect(base).toHaveBeenCalledTimes(1)
        expect(nestedScopedTestTheme).toHaveBeenCalledTimes(2)
        expect(nestedScopedTestTheme.mock.calls[1][0]).toMatch(/^#ddeeff$/i)
    })
})
