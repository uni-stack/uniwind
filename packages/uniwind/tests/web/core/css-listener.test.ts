import { act, renderHook, waitFor } from '@testing-library/react'
import { Uniwind, useCSSVariable } from '../../../src'
import { CSSListener } from '../../../src/core/web'

describe('CSSListener', () => {
    test('notifies class subscribers when a stylesheet loads, unloads, and reloads', async () => {
        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName('remote-class', listener)

        const style = document.createElement('style')
        style.textContent = '.remote-class { background-color: rgb(250, 204, 21); }'
        document.head.appendChild(style)

        await waitFor(() => {
            expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.remote-class')).toBe(true)
            expect(listener).toHaveBeenCalled()
        })

        listener.mockClear()
        style.remove()

        await waitFor(() => {
            expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.remote-class')).toBe(false)
            expect(listener).toHaveBeenCalled()
        })

        listener.mockClear()
        document.head.appendChild(style)

        await waitFor(() => {
            expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.remote-class')).toBe(true)
            expect(listener).toHaveBeenCalled()
        })

        dispose()
        style.remove()
    })

    test('retains media-query subscriptions for classes loaded later', async () => {
        const originalMatchMedia = window.matchMedia
        const mediaListeners = new Set<EventListener>()
        const mediaQueryList = {
            addEventListener: (_: string, listener: EventListener) => mediaListeners.add(listener),
            dispatchEvent: () => true,
            matches: false,
            media: '(min-width: 600px)',
            onchange: null,
            removeEventListener: (_: string, listener: EventListener) => mediaListeners.delete(listener),
        }

        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: jest.fn(() => mediaQueryList),
        })

        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName('rma:md:bg-blue-500', listener)
        const style = document.createElement('style')

        try {
            style.textContent = '@media (min-width: 600px) { .rma\\:md\\:bg-blue-500 { background-color: blue; } }'
            document.head.appendChild(style)

            await waitFor(() => {
                expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 600px)')
                expect(listener).toHaveBeenCalled()
            })

            listener.mockClear()
            mediaQueryList.matches = true
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.rma\\:md\\:bg-blue-500')).toBe(true)
            expect(listener).toHaveBeenCalled()
        } finally {
            dispose()
            style.remove()
            Object.defineProperty(window, 'matchMedia', {
                configurable: true,
                value: originalMatchMedia,
            })
        }
    })

    test('updates public CSS variable APIs as a remote stylesheet loads and unloads', async () => {
        const variableName = '--rma-color-mf-shared'
        const style = document.createElement('style')
        const { result } = renderHook(() => useCSSVariable(variableName))

        expect(Uniwind.getCSSVariable(variableName)).toBe('')
        expect(result.current).toBe('')

        try {
            style.textContent = `.light, .light * { ${variableName}: #facc15; }`
            act(() => document.head.appendChild(style))

            await waitFor(() => {
                expect(Uniwind.getCSSVariable(variableName)).toBe('#facc15')
                expect(result.current).toBe('#facc15')
            })

            act(() => style.remove())

            await waitFor(() => {
                expect(Uniwind.getCSSVariable(variableName)).toBe('')
                expect(result.current).toBe('')
            })
        } finally {
            style.remove()
        }
    })
})
