import { describe, expect, test } from 'vitest'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileWebCSS } from '../../../src/bundler/css-compiler/compileWebCSS'

const compile = (css: string) =>
    compileWebCSS(
        UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css' }, 'web'),
        css,
    ).replace(/\s+/g, ' ')

// Tailwind < 4.3.3 nests the theme variant under `:root`, Tailwind >= 4.3.3
// flattens it into `:root:where(.dark, .dark *)`. Both must become a plain
// `.dark` rule so a scoped theme class can select it.
describe('Theme root rules', () => {
    test('nested theme variant becomes a theme class rule', () => {
        const css = compile('@layer theme { :root { &:where(.dark, .dark *) { --color-background: black; } } }')

        expect(css).toContain('.dark { --color-background: black; }')
        expect(css).not.toContain(':where(.dark')
    })

    test('flattened theme variant becomes a theme class rule', () => {
        const css = compile('@layer theme { :root:where(.dark, .dark *) { --color-background: black; } }')

        expect(css).toContain('.dark { --color-background: black; }')
        expect(css).not.toContain(':where(.dark')
    })

    test('the system color-scheme fallback is left alone', () => {
        const source =
            '@layer theme { @media (prefers-color-scheme: dark) { :root:not(:where(.light, .light *, .dark, .dark *)) { --color-background: black; } } }'

        expect(compile(source)).toContain(':root:not(:where(.light, .light *, .dark, .dark *))')
    })
})
