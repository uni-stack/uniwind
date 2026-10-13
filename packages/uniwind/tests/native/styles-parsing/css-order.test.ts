import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileNativeCSS } from '../../../src/bundler/css-compiler/compileNativeCSS'
import { Platform } from '../../../src/common/consts'
import { UniwindStore } from '../../../src/core/native/store'
import type { ComponentState, UniwindRuntime } from '../../../src/core/types'

const compile = (css: string) => {
    const config = UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css' }, Platform.iOS)
    const code = compileNativeCSS(config, css)

    UniwindStore.reinit((rt: UniwindRuntime) => eval(code), ['light', 'dark'])
}

const resolve = (className: string, state: ComponentState = {}, props = {}) =>
    UniwindStore.getStyles(className, props, state, { scopedTheme: 'light', rtl: null, variables: null }).styles

describe('Compiled CSS order', () => {
    test.each(['first last', 'last first'])('ignores className order in %s', className => {
        compile('.first { opacity: 0.25; } .last { opacity: 0.75; }')

        expect(resolve(className).opacity).toBe(0.75)
    })

    test('keeps repeated classes in global source order', () => {
        compile(`
            .repeated { opacity: 0.25; }
            .middle { opacity: 0.5; }
            .repeated { opacity: 0.75; }
        `)

        expect(resolve('repeated middle').opacity).toBe(0.75)
        expect(resolve('middle repeated').opacity).toBe(0.75)
    })

    test.each(['first last', 'last first'])('orders rules across layers, supports and media in %s', className => {
        compile(`
            @layer utilities {
                @supports (display: flex) {
                    @media (width >= 300px) {
                        .first { opacity: 0.25; }
                    }
                }
                @media (width >= 100px) {
                    .last { opacity: 0.75; }
                }
            }
        `)

        expect(resolve(className).opacity).toBe(0.75)
    })

    test('filters state variants before comparing source order', () => {
        compile(`
            .base { opacity: 0.25; }
            .focused:focus { opacity: 0.75; }
            .pressed:active { opacity: 0.5; }
        `)

        expect(resolve('pressed focused base').opacity).toBe(0.25)
        expect(resolve('pressed focused base', { isFocused: true }).opacity).toBe(0.75)
        expect(resolve('pressed focused base', { isFocused: true, isPressed: true }).opacity).toBe(0.5)
    })

    test('compares selector specificity before source order', () => {
        compile(`
            .stacked:focus:active { opacity: 0.25; }
            .focused:focus { opacity: 0.75; }
        `)

        expect(resolve('focused stacked', { isFocused: true, isPressed: true }).opacity).toBe(0.25)
        expect(resolve('stacked focused', { isFocused: true, isPressed: true }).opacity).toBe(0.25)
    })

    test('orders nested rules and declarations after them', () => {
        compile(`
            .nested {
                opacity: 0.25;
                &:focus { opacity: 0.5; }
                opacity: 0.75;
            }
            .last { opacity: 1; }
        `)

        expect(resolve('nested').opacity).toBe(0.75)
        expect(resolve('last nested').opacity).toBe(1)
        expect(resolve('nested', { isFocused: true }).opacity).toBe(0.5)
        expect(resolve('last nested', { isFocused: true }).opacity).toBe(0.5)
    })

    test.each(['first last', 'last first'])('uses source order for inline variables in %s', className => {
        compile(`
            .first { --inline-opacity: 0.25; opacity: var(--inline-opacity); }
            .last { --inline-opacity: 0.75; }
        `)

        expect(resolve(className).opacity).toBe(0.75)
    })

    test.each(['important normal', 'normal important'])('prioritizes important declarations per property in %s', className => {
        compile(`
            .important { opacity: 0.25 !important; width: 10px; }
            .normal:focus { opacity: 0.75; width: 20px; }
        `)

        expect(resolve(className, { isFocused: true })).toMatchObject({ opacity: 0.25, width: 20 })
    })

    test.each(['first last', 'last first'])('uses source order between important declarations in %s', className => {
        compile('.first { opacity: 0.25 !important; } .last { opacity: 0.75 !important; }')

        expect(resolve(className).opacity).toBe(0.75)
    })

    test.each([
        ['border-inline-width', { borderLeftWidth: 4, borderRightWidth: 4 }],
        ['border-block-width', { borderTopWidth: 4, borderBottomWidth: 4 }],
        ['border-width', { borderWidth: 4 }],
        ['padding-inline', { paddingLeft: 4, paddingRight: 4 }],
        ['margin-inline-start', { marginStart: 4 }],
    ])('preserves importance when converting %s to native entries', (property, expected) => {
        compile(`
            .important { ${property}: 4px !important; opacity: 0.25; }
            .normal { ${property}: 1px; opacity: 0.75; }
        `)

        for (const className of ['important normal', 'normal important']) {
            expect(resolve(className)).toMatchObject({ ...expected, opacity: 0.75 })
        }
    })

    test('preserves font-size importance for the generated em variable', () => {
        compile(`
            .important { font-size: 20px !important; width: 2em; }
            .normal { font-size: 10px; }
        `)

        for (const className of ['important normal', 'normal important']) {
            expect(resolve(className)).toMatchObject({ fontSize: 20, width: 40 })
        }
    })

    test.each([
        'padding-inline: 1px; padding-left: 2px; padding-inline: 4px !important;',
        'padding-left: 2px; padding-inline: 4px !important;',
    ])('preserves importance when declarations share a native entry: %s', declarations => {
        compile(`.box { ${declarations} }`)

        expect(resolve('box')).toMatchObject({ paddingLeft: 4, paddingRight: 4 })
    })

    test.each([
        ['normal', 'padding-inline: 1px; padding-left: 2px; padding-inline: 4px;', { paddingLeft: 4, paddingRight: 4 }],
        ['important', 'padding-inline: 1px !important; padding-left: 2px !important; padding-inline: 4px !important;', {
            paddingLeft: 4,
            paddingRight: 4,
        }],
        [
            'unparsed',
            `
            --first: 1px; --side: 2px; --last: 4px;
            border-inline-width: var(--first); border-left-width: var(--side); border-inline-width: var(--last);
        `,
            { borderLeftWidth: 4, borderRightWidth: 4 },
        ],
    ])('keeps the last declaration position for repeated %s properties', (_name, declarations, expected) => {
        compile(`.box { ${declarations} }`)

        expect(resolve('box')).toMatchObject(expected)
    })

    test('keeps a repeated longhand after an intervening shorthand', () => {
        compile('.box { padding-left: 1px; padding-inline: 2px; padding-left: 4px; }')

        expect(resolve('box')).toMatchObject({ paddingLeft: 4, paddingRight: 2 })
    })

    test('keeps a repeated custom property after a generated entry', () => {
        compile('.box { --uniwind-em: 1px; font-size: 2px; --uniwind-em: 4px; width: 2em; }')

        expect(resolve('box')).toMatchObject({ fontSize: 2, width: 8 })
    })

    test('where selectors have zero specificity', () => {
        compile(`
            .themed:where(.light, .light *) { opacity: 0.25; }
            .plain { opacity: 0.75; }
        `)

        expect(resolve('plain themed').opacity).toBe(0.75)
        expect(resolve('themed plain').opacity).toBe(0.75)
    })

    test('counts each data attribute toward specificity', () => {
        compile(`
            .two[data-a][data-b] { opacity: 0.25; }
            .one[data-a] { opacity: 0.75; }
        `)

        expect(resolve('one two', {}, { 'data-a': true, 'data-b': true }).opacity).toBe(0.25)
    })

    test.each(['nested', 'flattened'])('preserves specificity with %s state selectors', shape => {
        compile(`
            ${shape === 'nested' ? '.focused { &:focus { opacity: 0.25; } }' : '.focused:focus { opacity: 0.25; }'}
            .plain { opacity: 0.75; }
        `)

        expect(resolve('focused plain', { isFocused: true }).opacity).toBe(0.25)
        expect(resolve('plain focused', { isFocused: true }).opacity).toBe(0.25)
    })

    test('inherits specificity through nested media queries', () => {
        compile(`
            .focused:focus {
                @media (width >= 100px) { opacity: 0.25; }
            }
            .plain { opacity: 0.75; }
        `)

        expect(resolve('focused plain', { isFocused: true }).opacity).toBe(0.25)
    })

    test('uses specificity between important declarations too', () => {
        compile(`
            .focused:focus { opacity: 0.25 !important; }
            .plain { opacity: 0.75 !important; }
        `)

        expect(resolve('focused plain', { isFocused: true }).opacity).toBe(0.25)
    })

    test('uses the most specific parent in a selector list for nesting', () => {
        compile(`
            .focused:focus, .plain {
                &:active { opacity: 0.25; }
            }
            .later:active { opacity: 0.75; }
        `)

        expect(resolve('later plain', { isPressed: true }).opacity).toBe(0.25)
    })
})

describe('Cascade layers', () => {
    test.each(['early late', 'late early'])('honors declared layer order before specificity in %s', className => {
        compile(`
            @layer components, utilities;
            @layer utilities { .late { opacity: 0.75; } }
            @layer components { .early:focus:active { opacity: 0.25; } }
        `)

        expect(resolve(className, { isFocused: true, isPressed: true }).opacity).toBe(0.75)
    })

    test('keeps reopened layers at their original position', () => {
        compile(`
            @layer first { .first { opacity: 0.25; } }
            @layer last { .last { opacity: 0.75; } }
            @layer first { .reopened { opacity: 0.5; } }
        `)

        expect(resolve('last reopened first').opacity).toBe(0.75)
    })

    test.each(['early late', 'late early'])('reverses layer order per important property in %s', className => {
        compile(`
            @layer first, last;
            @layer first { .early { opacity: 0.25 !important; width: 10px; } }
            @layer last { .late:focus { opacity: 0.75 !important; width: 20px; } }
        `)

        expect(resolve(className, { isFocused: true })).toMatchObject({ opacity: 0.25, width: 20 })
    })

    test.each(['layered unlayered', 'unlayered layered'])('orders unlayered declarations correctly in %s', className => {
        compile(`
            .unlayered { opacity: 0.75; width: 20px !important; }
            @layer utilities { .layered { opacity: 0.25; width: 10px !important; } }
        `)

        expect(resolve(className)).toMatchObject({ opacity: 0.75, width: 10 })
    })

    test('important declarations override normal declarations across layers', () => {
        compile(`
            @layer utilities { .normal:focus { opacity: 0.75; width: 20px !important; } }
            .important { opacity: 0.25 !important; width: 10px; }
        `)

        expect(resolve('important normal', { isFocused: true })).toMatchObject({ opacity: 0.25, width: 20 })
    })

    test.each(['first last', 'last first'])('gives anonymous layers separate positions in %s', className => {
        compile(`
            @layer { .first { opacity: 0.25; width: 10px !important; } }
            @layer { .last { opacity: 0.75; width: 20px !important; } }
        `)

        expect(resolve(className)).toMatchObject({ opacity: 0.75, width: 10 })
    })

    test('orders nested layers within their parent', () => {
        compile(`
            @layer outer.first, outer.last, other;
            @layer outer.last { .last { opacity: 0.75; width: 20px !important; } }
            @layer outer {
                @layer first { .first { opacity: 0.25; width: 10px !important; } }
            }
            @layer other { .other { opacity: 1; width: 30px !important; } }
        `)

        expect(resolve('last first')).toMatchObject({ opacity: 0.75, width: 10 })
        expect(resolve('other last first')).toMatchObject({ opacity: 1, width: 10 })
    })

    test('orders direct layer declarations after sublayers and reverses this for important', () => {
        compile(`
            @layer outer {
                .direct { opacity: 0.75; width: 20px !important; }
                @layer inner { .inner { opacity: 0.25; width: 10px !important; } }
            }
        `)

        expect(resolve('direct inner')).toMatchObject({ opacity: 0.75, width: 10 })
    })

    test('honors layer statements relative to their enclosing layer', () => {
        compile(`
            @layer outer {
                @layer first, last;
                @layer last { .last { opacity: 0.75; } }
                @layer first { .first { opacity: 0.25; } }
            }
        `)

        expect(resolve('last first').opacity).toBe(0.75)
    })

    test('uses layer ranks for inline custom properties', () => {
        compile(`
            @layer first, last;
            @layer last { .last { --inline-opacity: 0.75; } }
            @layer first { .first { --inline-opacity: 0.25; opacity: var(--inline-opacity); } }
        `)

        expect(resolve('last first').opacity).toBe(0.75)
    })
})
