import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { generateCSSForThemes } from '../../../src/bundler/artifacts/css/themes'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileCSS } from '../../../src/bundler/css-compiler'
import { Platform } from '../../../src/common/consts'

describe('Tailwind prefix support', () => {
    test('accepts prefix import modifiers during artifact generation', async () => {
        const directory = mkdtempSync(path.join(process.cwd(), '.tmp-prefix-artifacts-'))
        const cssPath = path.join(directory, 'remote.css')

        writeFileSync(
            cssPath,
            [
                '@layer theme, base, components, utilities;',
                '@import "tailwindcss/theme.css" layer(theme) prefix(rma);',
                '@import "tailwindcss/utilities.css" layer(utilities) prefix(rma);',
                '@import "uniwind";',
            ].join('\n'),
        )

        try {
            await expect(generateCSSForThemes(['light', 'dark'], cssPath)).resolves.toContain('@custom-variant light')
        } finally {
            rmSync(directory, { force: true, recursive: true })
        }
    })

    test('processes Tailwind prefixes before Lightning CSS', async () => {
        const directory = mkdtempSync(path.join(process.cwd(), '.tmp-prefix-compile-'))
        const cssPath = path.join(directory, 'remote.css')

        writeFileSync(
            cssPath,
            [
                '@import "tailwindcss" prefix(rma);',
                '@source inline("rma:flex rma:bg-red-500");',
            ].join('\n'),
        )

        try {
            const config = UniwindBundlerConfig.fromMetroConfig(
                {
                    cssEntryFile: path.relative(process.cwd(), cssPath),
                },
                Platform.Web,
            )
            const webCSS = await compileCSS(config)

            expect(webCSS).toContain('.rma\\:flex')
            expect(webCSS).toContain('.rma\\:bg-red-500')
            expect(webCSS).not.toContain('prefix(rma)')
        } finally {
            rmSync(directory, { force: true, recursive: true })
        }
    })
})
