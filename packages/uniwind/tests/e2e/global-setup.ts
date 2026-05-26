import Bun from 'bun'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { UniwindBundlerConfig } from '../../src/bundler/config'
import { compileCSS } from '../../src/bundler/css-compiler'
import { Platform } from '../../src/common/consts'

// Playwright runs globalSetup with cwd = directory containing playwright.config.ts
// which is packages/uniwind/
const ROOT = resolve(process.cwd())

export const GENERATED_DIR = resolve(ROOT, 'tests/e2e/.generated')
export const CSS_PATH = resolve(GENERATED_DIR, 'uniwind.css')
export const BUNDLE_PATH = resolve(GENERATED_DIR, 'getWebStyles.iife.js')

export default async function globalSetup() {
    mkdirSync(GENERATED_DIR, { recursive: true })

    // 1. Compile test.css → real Tailwind CSS for web
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({
        cssEntryFile: 'tests/test.css',
    }, Platform.Web)
    const compiledCSS = await compileCSS(bundlerConfig)

    writeFileSync(CSS_PATH, compiledCSS, 'utf-8')
    console.log(`[e2e setup] Compiled CSS written to ${CSS_PATH}`)

    // 2. Bundle getWebStyles.ts into a browser IIFE via Bun
    // The bundle exports getWebStyles and getWebVariable as globals on window.__uniwind
    const getWebStylesPath = resolve(ROOT, 'src/core/web/getWebStyles')
    const entryContent = [
        `import { getWebStyles, getWebVariable } from ${JSON.stringify(getWebStylesPath)}`,
        'window.__uniwind = { getWebStyles, getWebVariable }',
    ].join('\n')
    const entryPath = resolve(GENERATED_DIR, '_entry.ts')
    writeFileSync(entryPath, entryContent, 'utf-8')

    const bundle = await Bun.build({
        entrypoints: [entryPath],
        target: 'browser',
        format: 'iife',
        outdir: GENERATED_DIR,
        naming: {
            entry: 'getWebStyles.iife.js',
        },
        conditions: ['browser', 'import', 'default'],
    })

    if (!bundle.success) {
        throw new Error(bundle.logs.map(log => log.message).join('\n'))
    }

    console.log(`[e2e setup] Browser bundle written to ${BUNDLE_PATH}`)
}
