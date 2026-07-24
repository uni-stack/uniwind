import { waitFor } from '@testing-library/react'
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
        const dispose = CSSListener.subscribeToClassName('remote-responsive', listener)
        const style = document.createElement('style')

        try {
            style.textContent = '@media (min-width: 600px) { .remote-responsive { background-color: blue; } }'
            document.head.appendChild(style)

            await waitFor(() => {
                expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 600px)')
                expect(listener).toHaveBeenCalled()
            })

            listener.mockClear()
            mediaQueryList.matches = true
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.remote-responsive')).toBe(true)
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
})
