import { describe, expect, test } from 'vitest'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileWebCSS } from '../../../src/bundler/css-compiler/compileWebCSS'

const compile = (css: string) =>
    compileWebCSS(
        UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: './tests/test.css' }, 'web'),
        css,
    ).replace(/\s+/g, ' ')

describe('platform-color()', () => {
    test('the web takes the fallback', () => {
        const css = compile('.a { background-color: platform-color(systemBlue, ?attr/colorPrimary, #007aff); }')

        expect(css).toContain('background-color: #007aff')
        expect(css).not.toContain('platform-color')
    })

    test('a variable fallback stays a variable', () => {
        expect(compile('.a { color: platform-color(label, var(--fallback)); }')).toContain('color: var(--fallback)')
    })

    test('a theme variable takes the fallback', () => {
        expect(compile('@layer theme { :root { --color-system-label: platform-color(label, #000000); } }')).toContain(
            '--color-system-label: #000',
        )
    })

    test('without a fallback the color is unset', () => {
        expect(compile('.a { color: platform-color(label); }')).toContain('color: unset')
    })
})
