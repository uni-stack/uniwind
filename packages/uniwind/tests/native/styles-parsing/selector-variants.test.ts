import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { ProcessorBuilder } from '../../../src/bundler/css-processor'
import { Platform } from '../../../src/common/consts'

const compile = (css: string) => {
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: './tests/test.css',
        extraThemes: ['sepia'],
    }, Platform.iOS)
    const processor = new ProcessorBuilder(bundlerConfig)

    processor.transform(css)

    return processor.stylesheets
}

// Tailwind < 4.3.3 nests variants under the class, Tailwind >= 4.3.3 flattens
// them into the class selector. The processor must read both.
const shapes = [
    ['nested', (className: string, variant: string) => `.${className} { ${variant} { opacity: 0.5; } }`],
    ['flattened', (className: string, variant: string) => `.${className}${variant.slice(1)} { opacity: 0.5; }`],
] as const

describe('Selector variants', () => {
    describe.each(shapes)('%s selectors', (_shape, rule) => {
        test('active', () => {
            const [style] = compile(rule('active\\:opacity-50', '&:active'))['active:opacity-50']

            expect(style.active).toBe(true)
            expect(style.opacity).toBe(0.5)
        })

        test('focus', () => {
            const [style] = compile(rule('focus\\:opacity-50', '&:focus'))['focus:opacity-50']

            expect(style.focus).toBe(true)
        })

        test('disabled', () => {
            const [style] = compile(rule('disabled\\:opacity-50', '&:disabled'))['disabled:opacity-50']

            expect(style.disabled).toBe(true)
        })

        test('theme', () => {
            const [style] = compile(rule('sepia\\:opacity-50', '&:where(.sepia, .sepia *)'))['sepia:opacity-50']

            expect(style.theme).toBe('sepia')
        })

        test('rtl', () => {
            const [style] = compile(rule('rtl\\:opacity-50', '&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)'))['rtl:opacity-50']

            expect(style.rtl).toBe(true)
        })

        test('data attribute', () => {
            const [style] = compile(rule('data-\\[x\\=on\\]\\:opacity-50', '&[data-x="on"]'))['data-[x=on]:opacity-50']

            expect(style.dataAttributes).toEqual({ 'data-x': '"on"' })
        })

        test('a compound native cannot observe never becomes unconditional', () => {
            // `disabled:` also emits `[aria-disabled="true"]`.
            const styles = compile(rule('disabled\\:opacity-50', '&[aria-disabled="true"]'))['disabled:opacity-50']

            expect(styles.every(style => style.opacity === undefined)).toBe(true)
        })

        test('an unobservable compound stacked on a supported variant is skipped, not weakened', () => {
            // `disabled:active:` emits `:disabled:active` and `[aria-disabled="true"]:active`.
            // The second must not survive as a plain `active` style.
            const styles = compile(rule('disabled\\:active\\:opacity-50', '&[aria-disabled="true"]:active'))['disabled:active:opacity-50']

            expect(styles.every(style => style.opacity === undefined)).toBe(true)
        })

        test('stacked supported variants keep every condition', () => {
            const [style] = compile(rule('disabled\\:active\\:opacity-50', '&:disabled:active'))['disabled:active:opacity-50']

            expect(style.disabled).toBe(true)
            expect(style.active).toBe(true)
            expect(style.opacity).toBe(0.5)
        })
    })

    test('a plain class keeps no variant flags', () => {
        const [style] = compile('.opacity-50 { opacity: 0.5; }')['opacity-50']

        expect(style.active).toBeNull()
        expect(style.disabled).toBeNull()
        expect(style.opacity).toBe(0.5)
    })
})
