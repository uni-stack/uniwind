import { act } from '@testing-library/react-native'
import { formatHex, formatHex8, parse } from 'culori'
import * as React from 'react'
import { ScopedVariables, Uniwind, useCSSVariable } from '../../src'
import { createVarGetter } from '../../src/core/native/native-utils'
import { renderUniwind } from './utils'

jest.mock('culori', () => {
    const actual = jest.requireActual('culori')

    return {
        ...actual,
        parse: jest.fn(actual.parse),
        formatHex: jest.fn(actual.formatHex),
        formatHex8: jest.fn(actual.formatHex8),
    }
})

describe('createVarGetter', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    test.each([
        [42, 42],
        [0, 0],
        ['red', '#ff0000'],
        ['rgb(255, 0, 0)', '#ff0000'],
        ['rgba(255, 0, 0, 1)', '#ff0000'],
        ['rgba(0, 255, 0, 0.5)', '#00ff0080'],
        ['transparent', '#00000000'],
        ['not-a-color', 'not-a-color'],
        ['', ''],
    ])('normalizes %p once across repeated reads', (value, expected) => {
        const getter = createVarGetter(value)

        expect(parse).not.toHaveBeenCalled()

        // Var accepts a vars map, but this getter's value is independent of it.
        expect(getter({})).toBe(expected)
        expect(getter({ '--other': () => 'blue' })).toBe(expected)
        expect(getter({})).toBe(expected)
        expect(parse).toHaveBeenCalledTimes(typeof value === 'number' ? 0 : 1)
        expect(jest.mocked(formatHex).mock.calls.length + jest.mocked(formatHex8).mock.calls.length)
            .toBe(typeof expected === 'string' && expected.startsWith('#') ? 1 : 0)
    })

    test('caches an undefined formatter result', () => {
        jest.mocked(formatHex).mockReturnValueOnce(undefined)
        const getter = createVarGetter('red')

        expect(getter({})).toBeUndefined()
        expect(getter({})).toBeUndefined()
        expect(parse).toHaveBeenCalledTimes(1)
        expect(formatHex).toHaveBeenCalledTimes(1)
    })

    test('ScopedVariables reuses normalization across public hook reads', () => {
        const seen = jest.fn()
        const Probe = () => {
            seen(useCSSVariable('--memoized-scoped-color'))

            return null
        }

        renderUniwind(
            <ScopedVariables variables={{ '--memoized-scoped-color': 'rgb(12, 34, 56)' }}>
                <Probe />
                <Probe />
            </ScopedVariables>,
        )

        expect(seen).toHaveBeenCalledWith('#0c2238')
        expect(jest.mocked(parse).mock.calls.filter(([value]) => value === 'rgb(12, 34, 56)')).toHaveLength(1)
    })

    test('updateCSSVariables normalizes once per update through the public API', () => {
        const seen = jest.fn()
        const Probe = () => {
            seen(useCSSVariable('--memoized-theme-color'))

            return null
        }

        Uniwind.updateCSSVariables('light', { '--memoized-theme-color': 'rgba(12, 34, 56, 0.5)' })
        expect(parse).not.toHaveBeenCalled()

        const { unmount } = renderUniwind(
            <React.Fragment>
                <Probe />
                <Probe />
            </React.Fragment>,
        )

        expect(seen).toHaveBeenCalledWith('#0c223880')
        expect(jest.mocked(parse).mock.calls.filter(([value]) => value === 'rgba(12, 34, 56, 0.5)')).toHaveLength(1)

        act(() => {
            Uniwind.updateCSSVariables('light', { '--memoized-theme-color': 'rgb(56, 34, 12)' })
        })

        expect(seen.mock.calls.at(-1)).toEqual(['#38220c'])
        expect(jest.mocked(parse).mock.calls.filter(([value]) => value === 'rgb(56, 34, 12)')).toHaveLength(1)
        unmount()
    })
})
