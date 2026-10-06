import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { ProcessorBuilder } from '../../../src/bundler/css-processor'
import { Platform } from '../../../src/common/consts'

const compile = (css: string) => {
    const config = UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css' }, Platform.iOS)
    const processor = new ProcessorBuilder(config)

    processor.transform(css)

    return processor
}

const rules = ':root { --root-width: 10px; } .after-root { width: 42px; }'

describe(':root parser state', () => {
    test.each([
        ['plain', '.sibling&', false],
        ['active', '.sibling&:active', true],
    ])('keeps nested %s class declarations out of root variables', (_name, selector, active) => {
        const processor = compile(`
            :root {
                &:root { --inner: 1px; }
                ${selector} { width: 5px !important; }
            }
        `)

        expect(processor.stylesheets.sibling[0].styles.width).toBe(5)
        expect(processor.stylesheets.sibling[0].meta.active).toBe(active || null)
        expect(processor.stylesheets.sibling[0].meta.importantProperties).toContain('width')
        expect(processor.vars.width).toBeUndefined()
        expect(processor.vars['--inner']).toBeDefined()
    })

    test('preserves root declarations after nested class and root rules', () => {
        const processor = compile(`
            :root {
                .before& { height: 3px; }
                &:root { --inner: 1px; }
                --after: 2px;
            }
        `)

        expect(processor.vars['--after']).toBeDefined()
        expect(processor.stylesheets.before[0].styles.height).toBe(3)
        expect(processor.vars.height).toBeUndefined()
        expect(processor.stylesheets.before.some(style => '--after' in style.styles)).toBe(false)
    })

    test.each(['.box, :root', ':root, .box'])('preserves the outer root state in %s', selector => {
        const processor = compile(`
            ${selector} {
                &:root { --inner: 1px; }
                --after: 2px;
            }
            .after-root { width: 42px; }
        `)

        expect(processor.vars['--inner']).toBeDefined()
        expect(processor.vars['--after']).toBeDefined()
        expect(processor.vars.width).toBeUndefined()
        expect(processor.stylesheets['after-root'][0].styles.width).toBe(42)
    })

    test.each([
        ['top level', rules],
        ['layer', `@layer utilities { ${rules} }`],
        ['supports', `@supports (display: grid) { ${rules} }`],
    ])('does not leak into the next class at %s', (_name, css) => {
        const processor = compile(css)

        expect(processor.vars['--root-width']).toBeDefined()
        expect(processor.vars.width).toBeUndefined()
        expect(processor.stylesheets['after-root'][0].styles.width).toBe(42)
    })

    test.each([
        ['layer', `@layer utilities { ${rules} }`],
        ['supports', `@supports (display: grid) { ${rules} }`],
    ])('preserves the media condition around a %s', (_name, css) => {
        const processor = compile(`@media ios { ${css} }`)
        const style = processor.stylesheets['after-root'][0]

        expect(style.styles.width).toBe(42)
        expect(style.meta.platform).toBe(Platform.iOS)
        expect(processor.vars.width).toBeUndefined()
    })
})
