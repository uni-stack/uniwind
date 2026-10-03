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
        ['top level', rules],
        ['layer', `@layer utilities { ${rules} }`],
        ['supports', `@supports (display: grid) { ${rules} }`],
    ])('does not leak into the next class at %s', (_name, css) => {
        const processor = compile(css)

        expect(processor.vars['--root-width']).toBeDefined()
        expect(processor.vars.width).toBeUndefined()
        expect(processor.stylesheets['after-root'][0].width).toBe(42)
    })

    test.each([
        ['layer', `@layer utilities { ${rules} }`],
        ['supports', `@supports (display: grid) { ${rules} }`],
    ])('preserves the media condition around a %s', (_name, css) => {
        const processor = compile(`@media ios { ${css} }`)
        const style = processor.stylesheets['after-root'][0]

        expect(style.width).toBe(42)
        expect(style.platform).toBe(Platform.iOS)
        expect(processor.vars.width).toBeUndefined()
    })
})
