import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { Platform } from '../../src/common/consts'
import { compileVirtual } from '../../src/metro/compileVirtual'

// Playwright runs globalSetup with cwd = directory containing playwright.config.ts
// which is packages/uniwind/
const ROOT = resolve(process.cwd())

export const GENERATED_DIR = resolve(ROOT, 'tests/e2e/.generated')
export const CSS_PATH = resolve(GENERATED_DIR, 'uniwind.css')
export const BUNDLE_PATH = resolve(GENERATED_DIR, 'getWebStyles.iife.js')

export default async function globalSetup() {
    mkdirSync(GENERATED_DIR, { recursive: true })

    // 1. Compile test.css → real Tailwind CSS for web
    const cssPath = resolve(ROOT, 'tests/test.css')
    const css = readFileSync(cssPath, 'utf-8')

    const compiledCSS = await compileVirtual({
        css,
        cssPath,
        debug: false,
        platform: Platform.Web,
        themes: ['light', 'dark'],
        polyfills: undefined,
    })

    writeFileSync(CSS_PATH, compiledCSS, 'utf-8')
    console.log(`[e2e setup] Compiled CSS written to ${CSS_PATH}`)

    // 2. Bundle getWebStyles.ts into a browser IIFE via esbuild
    // The bundle exports getWebStyles and getWebVariable as globals on window.__uniwind
    const getWebStylesPath = resolve(ROOT, 'src/core/web/getWebStyles')
    const entryContent = [
        `import { getWebStyles, getWebVariable } from ${JSON.stringify(getWebStylesPath)}`,
        'window.__uniwind = { getWebStyles, getWebVariable }',
    ].join('\n')
    const entryPath = resolve(GENERATED_DIR, '_entry.ts')
    writeFileSync(entryPath, entryContent, 'utf-8')

    await build({
        entryPoints: [entryPath],
        bundle: true,
        format: 'iife',
        platform: 'browser',
        outfile: BUNDLE_PATH,
        // getWebStyles uses document/window at module load time,
        // so we must NOT tree-shake the side-effectful top-level code
        treeShaking: false,
        // culori is an ESM-only package; esbuild handles it fine with bundle:true
        mainFields: ['module', 'browser', 'main'],
        conditions: ['browser', 'import', 'default'],
        tsconfig: resolve(ROOT, 'tsconfig.json'),
        logLevel: 'warning',
    })

    console.log(`[e2e setup] Browser bundle written to ${BUNDLE_PATH}`)
}
