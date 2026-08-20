import { act, renderHook, waitFor } from '@testing-library/react'
import { Uniwind, useCSSVariable } from '../../../src'
import { CSSListener } from '../../../src/core/web'

describe('CSSListener', () => {
    test('notifies class subscribers when a stylesheet loads, unloads, and reloads', async () => {
        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName('remote-class', listener)
        const style = document.createElement('style')

        try {
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
        } finally {
            dispose()
            style.remove()
        }
    })

    test('removes rules while a stylesheet is disabled', async () => {
        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName('disabled-class', listener)
        const style = document.createElement('style')

        try {
            style.textContent = '.disabled-class { background-color: red; }'
            document.head.appendChild(style)

            await waitFor(() => {
                expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.disabled-class')).toBe(true)
            })

            listener.mockClear()
            style.setAttribute('disabled', '')

            await waitFor(() => {
                expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.disabled-class')).toBe(false)
                expect(listener).toHaveBeenCalled()
            })

            listener.mockClear()
            style.removeAttribute('disabled')

            await waitFor(() => {
                expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.disabled-class')).toBe(true)
                expect(listener).toHaveBeenCalled()
            })
        } finally {
            dispose()
            style.remove()
        }
    })

    test('tracks stylesheet-level media queries', async () => {
        const originalMatchMedia = window.matchMedia
        const mediaListeners = new Set<EventListener>()
        const mediaQueryList = {
            addEventListener: (_: string, listener: EventListener) => mediaListeners.add(listener),
            dispatchEvent: () => true,
            matches: false,
            media: '(min-width: 900px)',
            onchange: null,
            removeEventListener: (_: string, listener: EventListener) => mediaListeners.delete(listener),
        }

        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: jest.fn(() => mediaQueryList),
        })

        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName('sheet-media-class', listener)
        const style = document.createElement('style')

        try {
            style.media = '(min-width: 900px)'
            style.textContent = '.sheet-media-class { background-color: red; }'
            document.head.appendChild(style)

            await waitFor(() => {
                expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 900px)')
                expect(mediaListeners.size).toBe(1)
                expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.sheet-media-class')).toBe(false)
            })

            listener.mockClear()
            mediaQueryList.matches = true
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            await waitFor(() => {
                expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.sheet-media-class')).toBe(true)
                expect(listener).toHaveBeenCalled()
            })

            listener.mockClear()
            mediaQueryList.matches = false
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            await waitFor(() => {
                expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === '.sheet-media-class')).toBe(false)
                expect(listener).toHaveBeenCalled()
            })
        } finally {
            dispose()
            style.remove()

            await waitFor(() => expect(mediaListeners.size).toBe(0))
            Object.defineProperty(window, 'matchMedia', {
                configurable: true,
                value: originalMatchMedia,
            })
        }
    })

    test('reuses stylesheet lookups across a media-query change batch', async () => {
        const originalMatchMedia = window.matchMedia
        const mediaListeners = new Set<EventListener>()
        const mediaQueryList = {
            addEventListener: (_: string, listener: EventListener) => mediaListeners.add(listener),
            dispatchEvent: () => true,
            matches: false,
            media: '(min-width: 1000px)',
            onchange: null,
            removeEventListener: (_: string, listener: EventListener) => mediaListeners.delete(listener),
        }

        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: jest.fn(() => mediaQueryList),
        })

        const querySelectorAll = jest.spyOn(document, 'querySelectorAll')
        const style = document.createElement('style')
        const styleSheetSelector = 'link[rel~="stylesheet"], style'
        const styleSheetQueryCount = () =>
            querySelectorAll.mock.calls
                .filter(([selector]) => selector === styleSheetSelector)
                .length

        try {
            style.textContent = `
                @media (min-width: 1000px) {
                    .batch-class-a { background-color: red; }
                    .batch-class-b { background-color: blue; }
                }
            `
            const baselineQueryCount = styleSheetQueryCount()

            document.head.appendChild(style)

            await waitFor(() => expect(mediaListeners.size).toBe(2))

            expect(styleSheetQueryCount() - baselineQueryCount).toBeGreaterThan(0)

            querySelectorAll.mockClear()
            mediaQueryList.matches = true
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            expect(styleSheetQueryCount()).toBe(1)
            expect(Array.from(CSSListener.activeRules).filter(rule => rule.selectorText.startsWith('.batch-class-'))).toHaveLength(2)
        } finally {
            style.remove()

            await waitFor(() => expect(mediaListeners.size).toBe(0))
            querySelectorAll.mockRestore()
            Object.defineProperty(window, 'matchMedia', {
                configurable: true,
                value: originalMatchMedia,
            })
        }
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

            await waitFor(() => expect(mediaListeners.size).toBe(0))
            Object.defineProperty(window, 'matchMedia', {
                configurable: true,
                value: originalMatchMedia,
            })
        }
    })

    test('notifies theme-variant media-query subscribers', async () => {
        const originalMatchMedia = window.matchMedia
        const mediaListeners = new Set<EventListener>()
        const mediaQueryList = {
            addEventListener: (_: string, listener: EventListener) => mediaListeners.add(listener),
            dispatchEvent: () => true,
            matches: false,
            media: '(min-width: 700px)',
            onchange: null,
            removeEventListener: (_: string, listener: EventListener) => mediaListeners.delete(listener),
        }

        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: jest.fn(() => mediaQueryList),
        })

        const className = 'rma:md:dark:bg-blue-500'
        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName(className, listener)
        const style = document.createElement('style')
        const selector = '.rma\\:md\\:dark\\:bg-blue-500:where(.dark, .dark *)'

        try {
            style.textContent = `@media (min-width: 700px) { ${selector} { background-color: blue; } }`
            document.head.appendChild(style)

            await waitFor(() => {
                expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 700px)')
                expect(listener).toHaveBeenCalled()
            })

            listener.mockClear()
            mediaQueryList.matches = true
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            expect(Array.from(CSSListener.activeRules).some(rule => rule.selectorText === selector)).toBe(true)
            expect(listener).toHaveBeenCalledTimes(1)
        } finally {
            dispose()
            style.remove()

            await waitFor(() => expect(mediaListeners.size).toBe(0))
            Object.defineProperty(window, 'matchMedia', {
                configurable: true,
                value: originalMatchMedia,
            })
        }
    })

    test('removes media-query handlers when stylesheets reload', async () => {
        const originalMatchMedia = window.matchMedia
        const mediaListeners = new Set<EventListener>()
        const mediaQueryList = {
            addEventListener: (_: string, listener: EventListener) => mediaListeners.add(listener),
            dispatchEvent: () => true,
            matches: false,
            media: '(min-width: 800px)',
            onchange: null,
            removeEventListener: (_: string, listener: EventListener) => mediaListeners.delete(listener),
        }

        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: jest.fn(() => mediaQueryList),
        })

        const listener = jest.fn()
        const dispose = CSSListener.subscribeToClassName('rma:lg:bg-blue-500', listener)
        const style = document.createElement('style')
        style.textContent = '@media (min-width: 800px) { .rma\\:lg\\:bg-blue-500 { background-color: blue; } }'

        try {
            document.head.appendChild(style)
            await waitFor(() => expect(mediaListeners.size).toBe(1))

            style.remove()
            await waitFor(() => expect(mediaListeners.size).toBe(0))

            document.head.appendChild(style)
            await waitFor(() => expect(mediaListeners.size).toBe(1))

            listener.mockClear()
            mediaQueryList.matches = true
            mediaListeners.forEach(mediaListener => mediaListener(new Event('change')))

            expect(listener).toHaveBeenCalledTimes(1)
        } finally {
            dispose()
            style.remove()

            await waitFor(() => expect(mediaListeners.size).toBe(0))
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
