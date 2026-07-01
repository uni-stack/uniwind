import { render } from '@testing-library/react'
import * as React from 'react'
import { ScopedVariables } from '../../../src'
import { getWebVariable } from '../../../src/core/web'
import { useCSSVariable } from '../../../src/hooks/useCSSVariable'

describe('ScopedVariables (web)', () => {
    test('scoped custom property resolves on a child, falls back outside', () => {
        const outside = jest.fn()
        const inside = jest.fn()

        const Probe = ({ test }: { test: jest.Mock }) => {
            test(useCSSVariable('--color-primary'))

            return null
        }

        render(
            <React.Fragment>
                <Probe test={outside} />
                <ScopedVariables variables={{ '--color-primary': '#3b82f6' }}>
                    <Probe test={inside} />
                </ScopedVariables>
            </React.Fragment>,
        )

        // Not defined by the theme in the web test env -> empty string
        expect(outside).toHaveBeenCalledWith('')
        // Inside the provider the scoped value resolves through the DOM cascade
        expect(inside).toHaveBeenCalledWith('#3b82f6')
    })

    test('nested providers inherit ancestors and the nearest wins', () => {
        const values: Array<Record<string, string | number | undefined>> = []

        const Probe = () => {
            values.push({
                primary: useCSSVariable('--color-primary'),
                gap: useCSSVariable('--gap'),
            })

            return null
        }

        render(
            <ScopedVariables variables={{ '--color-primary': '#3b82f6', '--gap': 8 }}>
                <Probe />
                <ScopedVariables variables={{ '--color-primary': '#ff0000' }}>
                    <Probe />
                </ScopedVariables>
            </ScopedVariables>,
        )

        const [outer, inner] = values

        expect(outer).toEqual({ primary: '#3b82f6', gap: '8px' })
        // Inner overrides the color but inherits --gap from the ancestor
        expect(inner).toEqual({ primary: '#ff0000', gap: '8px' })
    })

    test('renders a display:contents wrapper around children', () => {
        const { getByText } = render(
            <ScopedVariables variables={{ '--color-primary': '#3b82f6' }}>
                <span>scoped content</span>
            </ScopedVariables>,
        )

        expect(getByText('scoped content').parentElement).toHaveStyle({ display: 'contents' })
    })

    test('getWebVariable applies number values as px and clears them afterwards', () => {
        expect(
            getWebVariable('--gap', { scopedTheme: null, rtl: null, variables: { '--gap': 8 }, variablesCacheKey: null }),
        ).toEqual('8px')

        // After resolving with scoped variables, the dummy parent no longer
        // carries the property (it is cleared), so a plain read falls back.
        expect(
            getWebVariable('--gap', { scopedTheme: null, rtl: null, variables: null, variablesCacheKey: null }),
        ).toEqual('')
    })

    test('cacheKey prop is accepted on web and does not change the resolved value', () => {
        // The web read path has no memo cache, so cacheKey is a no-op there;
        // it must still resolve scoped variables normally.
        const inside = jest.fn()

        const Probe = ({ test }: { test: jest.Mock }) => {
            test(useCSSVariable('--color-primary'))

            return null
        }

        render(
            <ScopedVariables variables={{ '--color-primary': '#3b82f6' }} cacheKey="stable">
                <Probe test={inside} />
            </ScopedVariables>,
        )

        expect(inside).toHaveBeenCalledWith('#3b82f6')
    })
})
