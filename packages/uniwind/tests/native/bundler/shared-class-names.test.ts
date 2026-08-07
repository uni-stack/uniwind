import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileCSS } from '../../../src/bundler/css-compiler'
import { Platform } from '../../../src/common/consts'

const sharedClassName = 'bg-[#9333ea]'

const createFixture = () => mkdtempSync(path.join(process.cwd(), '.tmp-shared-class-names-'))

const createConfig = (
    cssPath: string,
    role: 'host' | 'remote',
    platform: Platform,
) => UniwindBundlerConfig.fromMetroConfig(
    {
        cssEntryFile: path.relative(process.cwd(), cssPath),
        federation: role === 'host'
            ? {
                role,
                sharedClassNames: [sharedClassName],
            }
            : {
                role,
                id: 'remote-a',
                sharedClassNames: [sharedClassName],
            },
    },
    platform,
)

describe('federated shared class names', () => {
    test.each([Platform.Web, Platform.iOS])('force-generates shared classes in a %s host build', async (platform) => {
        const directory = createFixture()
        const cssPath = path.join(directory, 'host.css')

        writeFileSync(cssPath, '@import "tailwindcss";')

        try {
            const output = await compileCSS(createConfig(cssPath, 'host', platform))

            expect(output).toContain(platform === Platform.Web ? '.bg-\\[\\#9333ea\\]' : `"${sharedClassName}"`)
            expect(output).toContain('#9333ea')
        } finally {
            rmSync(directory, { force: true, recursive: true })
        }
    })

    test.each([Platform.Web, Platform.iOS])('excludes shared scanned classes from a %s remote build', async (platform) => {
        const directory = createFixture()
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
        writeFileSync(
            path.join(directory, 'Remote.tsx'),
            `export const className = '${sharedClassName} rma:bg-[#123456]'`,
        )

        try {
            const output = await compileCSS(createConfig(cssPath, 'remote', platform))

            expect(output).not.toContain(sharedClassName)
            expect(output).not.toContain('#9333ea')
            expect(output).toContain('#123456')
        } finally {
            rmSync(directory, { force: true, recursive: true })
        }
    })

    test('leaves remote inline sources under Tailwind ownership', async () => {
        const directory = createFixture()
        const cssPath = path.join(directory, 'remote.css')

        writeFileSync(
            cssPath,
            [
                '@import "tailwindcss";',
                `@source inline("${sharedClassName}");`,
            ].join('\n'),
        )

        try {
            const output = await compileCSS(createConfig(cssPath, 'remote', Platform.Web))

            expect(output).toContain('#9333ea')
        } finally {
            rmSync(directory, { force: true, recursive: true })
        }
    })

    test('validates complete shared candidates', () => {
        expect(() =>
            UniwindBundlerConfig.fromMetroConfig({
                cssEntryFile: './unused.css',
                federation: {
                    role: 'host',
                    sharedClassNames: ['two classes'],
                },
            })
        ).toThrow('federation.sharedClassNames')
    })

    test('deduplicates shared candidates', () => {
        const config = UniwindBundlerConfig.fromMetroConfig({
            cssEntryFile: './unused.css',
            federation: {
                role: 'host',
                sharedClassNames: [sharedClassName, sharedClassName],
            },
        })

        expect(config.sharedClassNames).toEqual([sharedClassName])
    })
})
