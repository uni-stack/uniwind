import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileCSS } from '../../../src/bundler/css-compiler'
import { compileNativeCSS } from '../../../src/bundler/css-compiler/compileNativeCSS'
import { Orientation, Platform, StyleDependency } from '../../../src/common/consts'
import { UniwindStore } from '../../../src/core/native/store'
import type { StyleSheets, UniwindRuntime } from '../../../src/core/types'

type CompiledResult = {
    stylesheet: StyleSheets
}

const compileMetadata = async (): Promise<CompiledResult> => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: './tests/test.css',
    }, Platform.iOS)
    const virtualCode = await compileCSS(bundlerConfig)

    return new Function('rt', `return ${virtualCode}`)(UniwindStore.runtime)
}

const compileStyles = (css: string): StyleSheets => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: './tests/test.css',
        extraThemes: ['sepia'],
    }, Platform.iOS)
    const code = compileNativeCSS(bundlerConfig, css)

    return new Function('rt', `return ${code}`)(UniwindStore.runtime).stylesheet
}

const context = { scopedTheme: null, rtl: null, variables: null }

describe('Styles Metadata', () => {
    test('Theme Style Dependency', async () => {
        const { stylesheet } = await compileMetadata()

        expect(stylesheet['bg-background'][0].dependencies).toContain(StyleDependency.Theme)
        expect(stylesheet['bg-foreground'][0].dependencies).toContain(StyleDependency.Theme)
    })

    test('Combined variants', async () => {
        const { stylesheet } = await compileMetadata()

        for (const className of ['dark:active:bg-purple-700', 'dark:active:focus:bg-purple-700', 'active:dark:bg-purple-700']) {
            const { matches } = stylesheet[className][0]
            const rt = { ...UniwindStore.runtime, currentThemeName: 'dark' }

            expect(matches(rt, undefined, { isPressed: true, isFocused: true }, context)).toBe(true)
            expect(matches(rt, undefined, { isPressed: false, isFocused: true }, context)).toBe(false)
            expect(matches({ ...rt, currentThemeName: 'light' }, undefined, { isPressed: true, isFocused: true }, context)).toBe(false)
            expect(matches(rt, undefined, undefined, context)).toBe(false)
        }

        expect(stylesheet['dark:active:focus:bg-purple-700'][0].matches(
            { ...UniwindStore.runtime, currentThemeName: 'dark' },
            undefined,
            { isPressed: true, isFocused: false },
            context,
        )).toBe(false)
    })

    test('generated records replace matching metadata with predicates', () => {
        const [style] = compileStyles('.plain { opacity: 0.5; }').plain

        expect(style.matches(UniwindStore.runtime, undefined, undefined, context)).toBe(true)
        expect(style.hasDataAttributes).toBe(false)
        expect(style.dependencies).toBeNull()

        for (const key of ['maxWidth', 'maxHeight', 'theme', 'orientation', 'rtl', 'active', 'focus', 'disabled', 'dataAttributes', 'colorScheme']) {
            expect(style).not.toHaveProperty(key)
        }
    })

    test('stacked conditions honor scoped themes and direction', () => {
        const [style] = compileStyles(`
            @media (width >= 200px) {
                @media (orientation: landscape) {
                    .stacked:where(.sepia, .sepia *):where(:dir(rtl)):active:focus:disabled[data-x="on"] { opacity: 0.5; }
                }
            }
        `).stacked
        const rt = {
            ...UniwindStore.runtime,
            screen: { width: 200, height: 100 },
            orientation: Orientation.Landscape,
            currentThemeName: 'light',
            rtl: false,
        }
        const scopedContext = { ...context, scopedTheme: 'sepia', rtl: true }
        const state = { isPressed: true, isFocused: true, isDisabled: true }
        const props = { 'data-x': 'on' }

        expect(style.matches(rt, props, state, scopedContext)).toBe(true)
        expect(style.matches({ ...rt, screen: { width: 199.99, height: 100 } }, props, state, scopedContext)).toBe(false)
        expect(style.matches({ ...rt, orientation: Orientation.Portrait }, props, state, scopedContext)).toBe(false)
        expect(style.matches(rt, props, state, { ...scopedContext, scopedTheme: 'light' })).toBe(false)
        expect(style.matches(rt, props, state, { ...scopedContext, rtl: false })).toBe(false)
        expect(style.matches(rt, props, { ...state, isDisabled: false }, scopedContext)).toBe(false)
        expect(style.matches(rt, { 'data-x': 'off' }, state, scopedContext)).toBe(false)
        expect(style.matches(rt, undefined, state, scopedContext)).toBe(false)
        expect(style.hasDataAttributes).toBe(true)
        expect(style.dependencies).toEqual(expect.arrayContaining([
            StyleDependency.Dimensions,
            StyleDependency.Theme,
            StyleDependency.Orientation,
            StyleDependency.Rtl,
        ]))
    })

    test.each(['true', 'false'])('data conditions accept boolean and string %s values', value => {
        const [style] = compileStyles(`.data[data-enabled="${value}"] { opacity: 0.5; }`).data

        expect(style.matches(UniwindStore.runtime, { 'data-enabled': value }, undefined, context)).toBe(true)
        expect(style.matches(UniwindStore.runtime, { 'data-enabled': value === 'true' }, undefined, context)).toBe(true)
        expect(style.matches(UniwindStore.runtime, { 'data-enabled': value !== 'true' }, undefined, context)).toBe(false)
        expect(style.matches(UniwindStore.runtime, undefined, undefined, context)).toBe(false)
    })

    test('viewport-relative bounds use current dimensions', () => {
        const [style] = compileStyles('@media (width >= 50vh) { .dynamic { opacity: 0.5; } }').dynamic
        const rt = { ...UniwindStore.runtime, screen: { width: 300, height: 400 } }

        expect(style.matches(rt, undefined, undefined, context)).toBe(true)
        rt.screen = { width: 300, height: 800 }
        expect(style.matches(rt, undefined, undefined, context)).toBe(false)
    })

    describe.each(
        [
            ['width', '0px', 0],
            ['width', '390.125px', 390.125],
            ['width', '50vh', 390.125],
            ['height', '0px', 0],
            ['height', '390.125px', 390.125],
            ['height', '50vw', 390.125],
        ] as const,
    )('%s comparisons against %s', (dimension, bound, threshold) => {
        test.each(
            [
                ['>', [false, false, true]],
                ['>=', [false, true, true]],
                ['<', [true, false, false]],
                ['<=', [true, true, false]],
            ] as const,
        )('preserves %s at and immediately beside the boundary', (operator, expected) => {
            const [style] = compileStyles(`@media (${dimension} ${operator} ${bound}) { .comparison { opacity: 0.5; } }`).comparison
            const rt: UniwindRuntime = { ...UniwindStore.runtime, screen: { width: 780.25, height: 780.25 } }

            for (const [index, value] of [threshold - 0.001, threshold, threshold + 0.001].entries()) {
                rt.screen[dimension] = value
                expect(style.matches(rt, undefined, undefined, context)).toBe(expected[index])
            }

            expect(style.dependencies).toContain(StyleDependency.Dimensions)
            expect(style).not.toHaveProperty('minWidthOperator')
            expect(style).not.toHaveProperty('maxWidthOperator')
            expect(style).not.toHaveProperty('minHeightOperator')
            expect(style).not.toHaveProperty('maxHeightOperator')
        })
    })

    test('lower and upper width bounds keep their own operators', () => {
        const [style] = compileStyles(`
            @media (width > 200px) {
                @media (width <= 400px) {
                    .interval { opacity: 0.5; }
                }
            }
        `).interval
        const rt = { ...UniwindStore.runtime, screen: { width: 200, height: 800 } }

        for (const [width, expected] of [[200, false], [200.001, true], [400, true], [400.001, false]] as const) {
            rt.screen.width = width
            expect(style.matches(rt, undefined, undefined, context)).toBe(expected)
        }
    })

    test('viewport-relative height bounds follow width changes', () => {
        const [style] = compileStyles('@media (height >= 50vw) { .dynamic { opacity: 0.5; } }').dynamic
        const rt = { ...UniwindStore.runtime, screen: { width: 400, height: 300 } }

        expect(style.matches(rt, undefined, undefined, context)).toBe(true)
        rt.screen.width = 800
        expect(style.matches(rt, undefined, undefined, context)).toBe(false)
    })
})
