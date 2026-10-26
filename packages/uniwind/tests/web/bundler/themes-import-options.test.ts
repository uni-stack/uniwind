import fs from 'fs'
import path from 'path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { generateCSSForThemes } from '../../../src/bundler/artifacts/css/themes'

describe('Tailwind import options', () => {
    let dir: string

    beforeEach(() => {
        dir = fs.mkdtempSync(path.join(__dirname, '.tmp-themes-'))
    })

    afterEach(() => {
        fs.rmSync(dir, { recursive: true, force: true })
    })

    const generate = async (globalCSS: Array<string>, themeFile = 'theme.css') => {
        fs.writeFileSync(
            path.join(dir, themeFile),
            [
                '@variant light { --color-background: white; }',
                '@variant dark { --color-background: black; }',
            ].join('\n'),
        )
        fs.writeFileSync(path.join(dir, 'global.css'), globalCSS.join('\n'))

        return generateCSSForThemes(['light', 'dark'], path.join(dir, 'global.css'))
    }

    test.each([
        `source('./')`,
        `source("./src/(app)")`,
        `source('./src/(app);')`,
        'source(none)',
        'prefix(tw)',
        'theme(static)',
    ])('@import with %s still collects theme variables', async option => {
        const css = await generate([
            `@import 'tailwindcss' ${option};`,
            `@import './theme.css' ${option};`,
        ])

        expect(css).toContain('--color-background: unset;')
    })

    test('quotes inside comments do not break option stripping', async () => {
        const css = await generate([
            `@import 'tailwindcss' /* don't */ source('./');`,
            `@import './theme.css';`,
        ])

        expect(css).toContain('--color-background: unset;')
    })

    test('option-like text inside the import path is kept', async () => {
        const css = await generate([
            `@import 'tailwindcss' source('./');`,
            `@import './theme source(none).css';`,
        ], 'theme source(none).css')

        expect(css).toContain('--color-background: unset;')
    })
})
