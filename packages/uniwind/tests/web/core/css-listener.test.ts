import { afterEach, expect, test, vi } from 'vitest'
import { CSSListener } from '../../../src/core/web/cssListener'

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

test('notifies class subscribers after discovering a stylesheet injected later', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestIdleCallback', undefined)

    const style = document.createElement('style')
    style.textContent = '.accent-late { accent-color: rgb(255, 0, 0); }'

    const listener = vi.fn(() => {
        const rule = Array.from(CSSListener.activeRules).find(rule => rule.selectorText === '.accent-late')
        return rule?.style.getPropertyValue('accent-color')
    })
    const dispose = CSSListener.subscribeToClassName('accent-late', listener)

    try {
        document.head.appendChild(style)
        await Promise.resolve()

        expect(listener).not.toHaveBeenCalled()
        await vi.advanceTimersByTimeAsync(50)

        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveLastReturnedWith('rgb(255, 0, 0)')

        // A scan with no new stylesheet should not invalidate resolved styles.
        const meta = document.createElement('meta')
        document.head.appendChild(meta)
        await Promise.resolve()
        await vi.advanceTimersByTimeAsync(50)
        expect(listener).toHaveBeenCalledTimes(1)
        meta.remove()
    } finally {
        dispose()
        style.remove()
        await Promise.resolve()
        await vi.advanceTimersByTimeAsync(50)
    }
})
