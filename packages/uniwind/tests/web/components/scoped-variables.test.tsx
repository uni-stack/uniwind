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

    test('useCSSVariable reflects an updated variables prop through the cascade', () => {
        const seen: Array<string | number | undefined> = []

        const Probe = () => {
            seen.push(useCSSVariable('--color-primary'))

            return null
        }

        const Wrapper = ({ color }: { color: string }) => (
            <ScopedVariables variables={{ '--color-primary': color }}>
                <Probe />
            </ScopedVariables>
        )

        const { rerender } = render(<Wrapper color="#3b82f6" />)

        rerender(<Wrapper color="#ff0000" />)

        // Mounts with the initial value, then reflects the updated prop
        expect(seen[0]).toEqual('#3b82f6')
        expect(seen.at(-1)).toEqual('#ff0000')
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

    test('applies the variables as inline custom properties on the wrapper', () => {
        const { getByText } = render(
            <ScopedVariables variables={{ '--color-primary': '#3b82f6', '--gap': 8 }}>
                <span>scoped content</span>
            </ScopedVariables>,
        )

        const wrapper = getByText('scoped content').parentElement!

        expect(wrapper.style.getPropertyValue('--color-primary')).toEqual('#3b82f6')
        // Numbers are converted to px, matching updateCSSVariables on web
        expect(wrapper.style.getPropertyValue('--gap')).toEqual('8px')
    })

    test('nested wrappers each carry only their own overrides inline', () => {
        const { getByText } = render(
            <ScopedVariables variables={{ '--color-primary': '#3b82f6', '--gap': 8 }}>
                <ScopedVariables variables={{ '--color-primary': '#ff0000' }}>
                    <span>inner content</span>
                </ScopedVariables>
            </ScopedVariables>,
        )

        const innerWrapper = getByText('inner content').parentElement!

        expect(innerWrapper.style.getPropertyValue('--color-primary')).toEqual('#ff0000')
        // Inner does not redeclare --gap; it inherits through the cascade
        expect(innerWrapper.style.getPropertyValue('--gap')).toEqual('')
    })

    test('invalid keys are not written to the wrapper inline styles', () => {
        const { getByText } = render(
            <ScopedVariables variables={{ 'color-primary': '#3b82f6', '--gap': 8 }}>
                <span>scoped content</span>
            </ScopedVariables>,
        )

        const wrapper = getByText('scoped content').parentElement!

        expect(wrapper.style.getPropertyValue('color-primary')).toEqual('')
        expect(wrapper.style.getPropertyValue('--gap')).toEqual('8px')
    })

    test('getWebVariable applies number values as px and clears them afterwards', () => {
        expect(
            getWebVariable('--gap', { scopedTheme: null, rtl: null, variables: { '--gap': 8 }, variablesCacheKey: null }),
        ).toEqual('8px')

        // The dummy parent is cleared after the read, so a plain read falls back
        expect(
            getWebVariable('--gap', { scopedTheme: null, rtl: null, variables: null, variablesCacheKey: null }),
        ).toEqual('')
    })
})
