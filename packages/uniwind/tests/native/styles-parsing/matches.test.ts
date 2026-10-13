import { compile as compileTailwind } from '@tailwindcss/node'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileNativeCSS } from '../../../src/bundler/css-compiler/compileNativeCSS'
import { Orientation, Platform, StyleDependency } from '../../../src/common/consts'
import { UniwindListener } from '../../../src/core/listener'
import { UniwindStore } from '../../../src/core/native/store'
import type { GenerateStyleSheetsCallback, UniwindRuntime } from '../../../src/core/types'

const context = { scopedTheme: null, rtl: null, variables: null }

const compile = (css: string, platform = Platform.iOS) => {
    const config = UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css', extraThemes: ['sepia'] }, platform)
    const code = compileNativeCSS(config, css)
    const generate = (rt: UniwindRuntime): ReturnType<GenerateStyleSheetsCallback> => eval(code)

    return { generate, stylesheet: generate(UniwindStore.runtime).stylesheet }
}

const compileQuery = (query: string) => compile(`@media ${query} { .rule { opacity: 0.5; } }`).stylesheet.rule[0]

describe('Generated style match functions', () => {
    test('retains Tailwind not-print and not-hover utilities on native', async () => {
        const compiler = await compileTailwind('@tailwind utilities;', { base: process.cwd(), onDependency: () => {} })
        const { generate, stylesheet } = compile(compiler.build(['not-print:opacity-50', 'not-hover:opacity-50']))

        UniwindStore.reinit(generate, ['light', 'dark'])

        for (const className of ['not-print:opacity-50', 'not-hover:opacity-50']) {
            expect(stylesheet[className]).toBeDefined()
            expect(UniwindStore.getStyles(className, undefined, undefined, context).styles).toEqual({ opacity: 0.5 })
        }
    })

    test('matches screen and excludes print media at build time', () => {
        const { stylesheet } = compile(`
            @media screen { .screen { opacity: 0.5; } }
            @media print { .print { opacity: 0.5; } }
            @media not screen { .not-screen { opacity: 0.5; } }
            @media not print { .not-print { opacity: 0.5; } }
        `)

        expect(stylesheet.print).toBeUndefined()
        expect(stylesheet['not-screen']).toBeUndefined()

        for (const className of ['screen', 'not-print']) {
            expect(stylesheet[className][0].matches(UniwindStore.runtime, context, undefined, undefined, {})).toBe(true)
            expect(stylesheet[className][0].dependencies).toBeNull()
        }
    })

    test.each(['(hover: hover)', '(not (hover: hover))', 'speech', 'not speech'])(
        'ignores unsupported media conditions without turning their negation into false: %s',
        query => {
            const style = compileQuery(query)

            expect(style).toBeDefined()
            expect(style.matches(UniwindStore.runtime, context, undefined, undefined, {})).toBe(true)
            expect(style.dependencies).toBeNull()
        },
    )

    test.each(['(not (hover: hover)) and (width >= 500px)', 'screen and (not (hover: hover)) and (width >= 500px)'])(
        'keeps supported conditions alongside ignored features: %s',
        query => {
            const style = compileQuery(query)

            for (const [width, expected] of [[499, false], [500, true]] as const) {
                const rt = { ...UniwindStore.runtime, screen: { width, height: 800 } }

                expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected)
            }

            expect(style.dependencies).toContain(StyleDependency.Dimensions)
        },
    )

    test.each(['width', 'height'] as const)('preserves exact %s comparisons and unrounded bounds', dimension => {
        for (
            const [operator, expected] of [
                ['>', [false, false, true]],
                ['>=', [false, true, true]],
                ['<', [true, false, false]],
                ['<=', [true, true, false]],
                ['=', [false, true, false]],
            ] as const
        ) {
            for (const bound of [390.1, 390.2, 390.3, 390.125, 390.1234]) {
                const style = compileQuery(`(${dimension} ${operator} ${bound}px)`)

                for (const [index, value] of [bound - 0.0000001, bound, bound + 0.0000001].entries()) {
                    const rt = { ...UniwindStore.runtime, screen: { width: value, height: value } }

                    expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected[index])
                }

                expect(style.dependencies).toContain(StyleDependency.Dimensions)
                expect(style).not.toHaveProperty('minWidth')
                expect(style).not.toHaveProperty('maxWidth')
            }
        }
    })

    test.each(
        [
            ['(height: 390.1px)', 390.1, 390.1],
            ['(height = 24.38125rem)', 390.1, 390.1],
            ['(width = 50.1vh)', 400.8, 800],
            ['(height = 50.1vw)', 800, 400.8],
        ] as const,
    )('normalizes fractional bounds before unit conversion: %s', (query, width, height) => {
        const style = compileQuery(query)
        const rt = { ...UniwindStore.runtime, screen: { width, height } }

        expect(style.matches(rt, context, undefined, undefined, {})).toBe(true)
        expect(style.matches({ ...rt, screen: { width: width + 0.0000001, height: height + 0.0000001 } }, context, undefined, undefined, {}))
            .toBe(false)
    })

    test('preserves fractional interval boundaries', () => {
        const style = compileQuery('(300.1px <= height <= 500.3px)')

        for (const [height, expected] of [[300.0999999, false], [300.1, true], [500.3, true], [500.3000001, false]] as const) {
            const rt = { ...UniwindStore.runtime, screen: { width: 390, height } }

            expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected)
        }
    })

    test.each(['width', 'height'] as const)('supports min/max queries for %s', dimension => {
        const min = compileQuery(`(min-${dimension}: 300.1px)`)
        const max = compileQuery(`(max-${dimension}: 300.1px)`)

        for (const [value, matchesMin, matchesMax] of [[300.0999999, false, true], [300.1, true, true], [300.1000001, true, false]] as const) {
            const rt = { ...UniwindStore.runtime, screen: { width: value, height: value } }

            expect(min.matches(rt, context, undefined, undefined, {})).toBe(matchesMin)
            expect(max.matches(rt, context, undefined, undefined, {})).toBe(matchesMax)
        }
    })

    test.each(['(300px <= height < 500px)', '(500px > height >= 300px)'])('supports intervals: %s', query => {
        const style = compileQuery(query)

        for (const [height, expected] of [[299.9999, false], [300, true], [499.9999, true], [500, false]] as const) {
            const rt = { ...UniwindStore.runtime, screen: { width: 390, height } }

            expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected)
        }
    })

    test('evaluates viewport-relative bounds against the current runtime', () => {
        const style = compileQuery('(width > 50vh) and (height <= 200vw)')

        for (const [width, height, expected] of [[390, 780, false], [390.0001, 780, true], [500, 900, true], [500, 1100, false]] as const) {
            const rt = { ...UniwindStore.runtime, screen: { width, height } }

            expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected)
        }
    })

    test('preserves nested queries, alternatives, conjunctions, and negation', () => {
        const { stylesheet } = compile(`
            @media (width < 300px), (width > 500px) {
                @media (height >= 800px) and (not (height > 900px)) {
                    .rule { opacity: 0.5; }
                }
            }
        `)
        const style = stylesheet.rule[0]

        for (
            const [width, height, expected] of [[299, 800, true], [501, 900, true], [400, 850, false], [299, 799, false], [501, 901, false]] as const
        ) {
            const rt = { ...UniwindStore.runtime, screen: { width, height } }

            expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected)
        }
    })

    test('retains all nested bounds on the same dimension', () => {
        const { stylesheet } = compile(`
            @media (width > 500px) {
                @media (width >= 300px) { .rule { opacity: 0.5; } }
            }
        `)
        const style = stylesheet.rule[0]

        for (const [width, expected] of [[400, false], [500, false], [500.0001, true]] as const) {
            const rt = { ...UniwindStore.runtime, screen: { width, height: 800 } }

            expect(style.matches(rt, context, undefined, undefined, {})).toBe(expected)
        }
    })

    test('combines media, scoped theme, direction, state, and data conditions', () => {
        const { stylesheet } = compile(`
            @media (height >= 800px) and (orientation: portrait) {
                .rule:where(.sepia):where(:dir(rtl)):active:focus:disabled[data-ready][data-mode="on"] {
                    opacity: 0.5;
                }
            }
        `)
        const style = stylesheet.rule[0]
        const rt = {
            ...UniwindStore.runtime,
            screen: { width: 390, height: 800 },
            orientation: Orientation.Portrait,
            currentThemeName: 'light',
            rtl: false,
        }
        const scoped = { ...context, scopedTheme: 'sepia', rtl: true }
        const props = { 'data-ready': true, 'data-mode': 'on' }
        const state = { isPressed: true, isFocused: true, isDisabled: true }

        expect(style.matches(rt, scoped, props, state, {})).toBe(true)
        expect(style.matches(rt, context, props, state, {})).toBe(false)
        expect(style.matches(rt, { ...scoped, rtl: false }, props, state, {})).toBe(false)
        expect(style.matches(rt, scoped, undefined, state, {})).toBe(false)
        expect(style.matches(rt, scoped, props, undefined, {})).toBe(false)

        for (const key of ['isPressed', 'isFocused', 'isDisabled'] as const) {
            expect(style.matches(rt, scoped, props, { ...state, [key]: false }, {})).toBe(false)
        }

        expect(style.matches({ ...rt, orientation: Orientation.Landscape }, scoped, props, state, {})).toBe(false)
        expect(style.matches({ ...rt, screen: { ...rt.screen, height: 799 } }, scoped, props, state, {})).toBe(false)
        expect(style.dependencies).toEqual(
            expect.arrayContaining([StyleDependency.Theme, StyleDependency.Rtl, StyleDependency.Orientation, StyleDependency.Dimensions]),
        )
        expect(style.hasDataAttributes).toBe(true)
    })

    test('matches color scheme using the scoped theme and subscribes to theme changes', () => {
        const style = compileQuery('(prefers-color-scheme: dark)')
        const rt = { ...UniwindStore.runtime, currentThemeName: 'light' }

        expect(style.matches(rt, context, undefined, undefined, {})).toBe(false)
        expect(style.matches(rt, { ...context, scopedTheme: 'dark' }, undefined, undefined, {})).toBe(true)
        expect(style.matches({ ...rt, currentThemeName: 'dark' }, context, undefined, undefined, {})).toBe(true)
        expect(style.dependencies).toContain(StyleDependency.Theme)
    })

    test('filters platforms at build time and retains their dimension conditions', () => {
        const { stylesheet } = compile(`
            @media android { .android { opacity: 0.5; } }
            @media ios and (height >= 800px) { .ios { opacity: 0.5; } }
        `)

        expect(stylesheet.android).toBeUndefined()
        const rt = { ...UniwindStore.runtime, screen: { width: 390, height: 799 } }

        expect(stylesheet.ios[0].matches(rt, context, undefined, undefined, {})).toBe(false)
        expect(stylesheet.ios[0].matches({ ...rt, screen: { width: 390, height: 800 } }, context, undefined, undefined, {})).toBe(true)
    })

    test('compiles unconditional rules to a predicate without dependencies', () => {
        const style = compile('.rule { opacity: 0.5; }').stylesheet.rule[0]

        expect(style.matches(UniwindStore.runtime, context, undefined, undefined, {})).toBe(true)
        expect(style.dependencies).toBeNull()
        expect(style.hasDataAttributes).toBe(false)
    })
})

describe('Generated match functions in the native store', () => {
    const originalScreen = UniwindStore.runtime.screen

    afterEach(() => {
        UniwindStore.runtime.screen = originalScreen
        UniwindListener.notify([StyleDependency.Dimensions])
    })

    test('invalidates cached matches and nonmatches on height-only changes', () => {
        const { generate } = compile('@media (min-height: 800px) { .rule { opacity: 0.5; } }')
        UniwindStore.reinit(generate, ['light', 'dark'])

        for (const [height, expected] of [[799, {}], [800, { opacity: 0.5 }], [799, {}]] as const) {
            UniwindStore.runtime.screen = { width: 390, height }
            UniwindListener.notify([StyleDependency.Dimensions])
            const result = UniwindStore.getStyles('rule', undefined, undefined, context)

            expect(result.styles).toEqual(expected)
            expect(result.dependencies).toContain(StyleDependency.Dimensions)
        }
    })

    test('does not reuse cached results for changing data props', () => {
        const { generate } = compile('.rule[data-ready="false"][data-mode="on"] { opacity: 0.5; }')
        UniwindStore.reinit(generate, ['light', 'dark'])

        for (
            const [ready, mode, expected] of [[false, 'on', { opacity: 0.5 }], [true, 'on', {}], ['false', 'on', { opacity: 0.5 }], [
                false,
                'off',
                {},
            ]] as const
        ) {
            expect(UniwindStore.getStyles('rule', { 'data-ready': ready, 'data-mode': mode }, undefined, context).styles).toEqual(expected)
        }

        expect(UniwindStore.getStyles('rule', undefined, undefined, context).styles).toEqual({})
    })
})
