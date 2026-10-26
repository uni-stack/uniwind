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

    test.each([
        `source('./')`,
        'source(none)',
        'prefix(tw)',
        'theme(static)',
    ])('@import with %s still collects theme variables', async option => {
        fs.writeFileSync(path.join(dir, 'theme.css'), '@variant dark { --color-background: black; }')
        fs.writeFileSync(
            path.join(dir, 'global.css'),
            [
                `@import 'tailwindcss' ${option};`,
                `@import './theme.css' ${option};`,
                '@variant light { --color-background: white; }',
            ].join('\n'),
        )

        const css = await generateCSSForThemes(['light', 'dark'], path.join(dir, 'global.css'))

        expect(css).toContain('--color-background: unset;')
    })
})
