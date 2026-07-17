import { Uniwind } from '../../../src/core/config/config'

type UniwindForTest = {
    updateCSSVariables: typeof Uniwind.updateCSSVariables
    __reinit: (_: () => {}, themes: Array<string>) => void
    cssRules?: Array<unknown>
}

const uniwind = Uniwind as unknown as UniwindForTest

const getDynamicStyleElement = () => document.getElementById('uniwind-dynamic-styles') as HTMLStyleElement | null

const getDynamicRules = () =>
    Array.from(getDynamicStyleElement()?.sheet?.cssRules ?? [])
        .filter((rule): rule is CSSStyleRule => 'selectorText' in rule && 'style' in rule)

const getRule = (selectorText: string) => getDynamicRules().find(rule => rule.selectorText === selectorText)

const resetUniwind = (themes: Array<string> = ['light', 'dark']) => {
    uniwind.cssRules = undefined
    getDynamicStyleElement()?.remove()
    uniwind.__reinit(() => ({}), themes)
}

describe('Uniwind web config', () => {
    beforeAll(() => {
        Object.defineProperty(HTMLStyleElement.prototype, 'innerText', {
            configurable: true,
            get() {
                return this.textContent ?? ''
            },
            set(value: string) {
                this.textContent = value
            },
        })
    })

    beforeEach(() => {
        resetUniwind()
    })

    afterEach(() => {
        resetUniwind()
    })

    test('updateCSSVariables creates scoped rules', () => {
        uniwind.updateCSSVariables('dark', { '--color-background': '#123456' })

        expect(getDynamicStyleElement()).not.toBeNull()
        expect(getDynamicRules().map(rule => rule.selectorText)).toEqual(['.light', '.dark'])
        expect(getRule('.dark')?.style.getPropertyValue('--color-background')).toBe('#123456')
    })

    test('__reinit rebuilds dynamic rules when themes change', () => {
        uniwind.updateCSSVariables('dark', { '--color-background': '#123456' })

        uniwind.__reinit(() => ({}), ['light', 'dark', 'premium'])
        uniwind.updateCSSVariables('premium', { '--color-background': '#abcdef' })

        expect(document.querySelectorAll('#uniwind-dynamic-styles')).toHaveLength(1)
        expect(getDynamicRules().map(rule => rule.selectorText)).toEqual(['.light', '.dark', '.premium'])
        expect(getRule('.premium')?.style.getPropertyValue('--color-background')).toBe('#abcdef')
    })
})

describe('Uniwind web config initial theme', () => {
    // The theme is adopted in the constructor, so the module has to be loaded
    // after <html> already carries the class
    const loadUniwind = (rootClassName: string) => {
        document.documentElement.className = rootClassName

        let instance: typeof Uniwind | undefined

        jest.isolateModules(() => {
            instance = (require('../../../src/core/config/config') as { Uniwind: typeof Uniwind }).Uniwind
        })

        return instance as typeof Uniwind
    }

    afterEach(() => {
        document.documentElement.className = ''
    })

    test('adopts the theme already applied to <html>', () => {
        const instance = loadUniwind('dark')

        expect(instance.currentTheme).toBe('dark')
        expect(instance.hasAdaptiveThemes).toBe(false)
    })

    test('keeps adaptive themes when <html> has no registered theme class', () => {
        const instance = loadUniwind('no-theme-here')

        expect(instance.currentTheme).toBe('light')
        expect(instance.hasAdaptiveThemes).toBe(true)
    })
})
