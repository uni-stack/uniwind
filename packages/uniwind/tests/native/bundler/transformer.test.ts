import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { isImportedStylesheet } from '../../../src/bundler/adapters/metro/transformer'
import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileTailwind } from '../../../src/bundler/css-compiler/compileTailwind'

let root = ''

beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'uniwind-transformer-'))
})

afterEach(() => {
    rmSync(root, { recursive: true, force: true })
})

const writeFiles = (files: Record<string, string>) => {
    Object.entries(files).forEach(([file, content]) => {
        mkdirSync(dirname(join(root, file)), { recursive: true })
        writeFileSync(join(root, file), content)
    })
}

// The stylesheets Tailwind reports while compiling the entry, as the transformer receives them.
const compileDependencies = async (cssEntryFile: string) => {
    const dependencies: Array<string> = []
    const bundlerConfig = UniwindBundlerConfig.fromMetroConfig({ cssEntryFile: relative(process.cwd(), join(root, cssEntryFile)) }, 'ios')

    await compileTailwind(bundlerConfig, dependency => dependencies.push(dependency))

    return dependencies
}

test.each([
    ['its real path', () => join(realpathSync(root), 'packages', 'uniwind', 'uniwind.css')],
    ['the linked path', () => join(root, 'app', 'node_modules', 'uniwind', 'uniwind.css')],
])('skips the generated artifact of a linked uniwind, given %s', async (_, artifactPath) => {
    // A workspace package or `npm link`: node_modules/uniwind links to a directory outside node_modules.
    writeFiles({
        'packages/uniwind/package.json': JSON.stringify({ name: 'uniwind', style: './uniwind.css' }),
        'packages/uniwind/uniwind.css': '@theme { --color-artifact: #000000; }',
        'packages/brand/package.json': JSON.stringify({ name: 'brand', style: './brand.css' }),
        'packages/brand/brand.css': '@theme { --color-brand: #111111; }',
        'app/node_modules/theme/package.json': JSON.stringify({ name: 'theme', style: './theme.css' }),
        'app/node_modules/theme/theme.css': '@theme { --color-theme: #222222; }',
        'app/global.css': ['@import "uniwind";', '@import "brand";', '@import "theme";', '@import "./tokens.css";'].join('\n'),
        'app/tokens.css': '@theme { --color-token: #333333; }',
    })
    symlinkSync(join(root, 'packages', 'uniwind'), join(root, 'app', 'node_modules', 'uniwind'), 'dir')
    symlinkSync(join(root, 'packages', 'brand'), join(root, 'app', 'node_modules', 'brand'), 'dir')

    const realRoot = realpathSync(root)
    const dependencies = await compileDependencies('app/global.css')

    // Tailwind reports linked stylesheets by their real paths, outside node_modules.
    expect(dependencies).toContain(join(realRoot, 'packages', 'uniwind', 'uniwind.css'))
    expect(dependencies.filter(dependency => isImportedStylesheet(dependency, artifactPath())).sort()).toEqual([
        join(realRoot, 'app', 'tokens.css'),
        join(realRoot, 'packages', 'brand', 'brand.css'),
    ])
})
