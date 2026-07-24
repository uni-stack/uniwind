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
})
