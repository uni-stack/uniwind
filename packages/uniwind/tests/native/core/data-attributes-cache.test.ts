import { UniwindStore } from '../../../src/core/native/store'
import { TW_BLUE_500, TW_RED_500 } from '../../consts'

const context = { scopedTheme: null, rtl: null, variables: null }
const plain = 'bg-blue-500 opacity-50'
const withData = 'bg-blue-500 data-[active=true]:bg-red-500'
const withNumberLikeValue = 'bg-blue-500 data-[x=1]:bg-red-500'

const countResolves = (run: () => void) => {
    const spy = jest.spyOn(UniwindStore as any, 'resolveStyles')

    run()

    const calls = spy.mock.calls.length

    spy.mockRestore()

    return calls
}

const getBackground = (className: string, props?: Record<string, any>) =>
    UniwindStore.getStyles(className, props, undefined, context).styles.backgroundColor

describe('Caching styles that use data attributes', () => {
    test('resolves a class string with a data variant only once for the same props', () => {
        const calls = countResolves(() => {
            for (let i = 0; i < 1000; i++) {
                getBackground(withData, { 'data-active': true })
            }
        })

        expect(calls).toBe(1)
    })

    test('returns the right style when a data attribute changes, and caches each value', () => {
        const calls = countResolves(() => {
            expect(getBackground(withData, { 'data-active': true })).toBe(TW_RED_500)
            expect(getBackground(withData, { 'data-active': false })).toBe(TW_BLUE_500)
            expect(getBackground(withData, undefined)).toBe(TW_BLUE_500)
            expect(getBackground(withData, { 'data-active': 'true' })).toBe(TW_RED_500)
            expect(getBackground(withData, { 'data-active': true })).toBe(TW_RED_500)
            expect(getBackground(withData, { 'data-active': false })).toBe(TW_BLUE_500)
        })

        // One resolve each for true, false, missing and "true"; the repeats hit the cache
        expect(calls).toBe(4)
    })

    test('keeps number and string values apart', () => {
        expect(getBackground(withNumberLikeValue, { 'data-x': '1' })).toBe(TW_RED_500)
        expect(getBackground(withNumberLikeValue, { 'data-x': 1 })).toBe(TW_BLUE_500)
        expect(getBackground(withNumberLikeValue, { 'data-x': '1' })).toBe(TW_RED_500)
    })

    test('ignores data props that the class string does not use', () => {
        const calls = countResolves(() => {
            getBackground(withData, { 'data-active': true, 'data-testid': 'a' })
            getBackground(withData, { 'data-active': true, 'data-testid': 'b' })
            getBackground(plain, { 'data-testid': 'a' })
            getBackground(plain, { 'data-testid': 'b' })
        })

        expect(calls).toBe(2)
    })

    test('keeps nothing extra for class strings without data variants', () => {
        const className = 'opacity-50 bg-blue-500'
        const dataAttributeNames = (UniwindStore as any).dataAttributeNames as Map<string, Array<string>>
        const calls = countResolves(() => {
            for (let i = 0; i < 100; i++) {
                getBackground(className, { 'data-testid': `item-${i}` })
            }
        })

        getBackground(withData, { 'data-active': true })

        expect(calls).toBe(1)
        expect(dataAttributeNames.has(className)).toBe(false)
        expect(dataAttributeNames.get(withData)).toEqual(['data-active'])
    })

    test('stores the first result of a new class string under its data values', () => {
        const className = 'opacity-50 data-[active=true]:bg-red-500'
        const calls = countResolves(() => {
            expect(getBackground(className, { 'data-active': true })).toBe(TW_RED_500)
            expect(getBackground(className, { 'data-active': false })).toBe(undefined)
            expect(getBackground(className, { 'data-active': true })).toBe(TW_RED_500)
        })

        expect(calls).toBe(2)
    })
})
