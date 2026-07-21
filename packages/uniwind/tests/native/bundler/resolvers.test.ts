import type { CustomResolutionContext, CustomResolver } from 'metro-resolver'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { nativeResolver } from '../../../src/bundler/adapters/metro/resolvers'

test('keeps internal imports internal when Metro reports a symlinked origin', () => {
    const root = mkdtempSync(join(tmpdir(), 'uniwind-resolver-'))

    try {
        const internalRoot = dirname(realpathSync(require.resolve('uniwind/package.json')))
        const linkedRoot = join(root, 'node_modules', 'uniwind')
        mkdirSync(dirname(linkedRoot), { recursive: true })
        symlinkSync(internalRoot, linkedRoot, 'dir')

        const originModulePath = join(linkedRoot, 'src', 'components', 'index.ts')
        expect(realpathSync(originModulePath)).toBe(join(internalRoot, 'src', 'components', 'index.ts'))

        const calls: Array<string> = []
        const resolver: CustomResolver = (_context, moduleName) => {
            calls.push(moduleName)

            return {
                type: 'sourceFile',
                filePath: join(root, 'node_modules', moduleName, 'index.js'),
            }
        }
        const context = {
            originModulePath,
            resolveRequest: resolver,
        } as CustomResolutionContext

        const resolution = nativeResolver({
            context,
            moduleName: 'react-native',
            platform: 'ios',
            resolver,
        })

        expect(calls).toEqual(['react-native'])
        expect(resolution.filePath).toBe(join(root, 'node_modules', 'react-native', 'index.js'))
    } finally {
        rmSync(root, { force: true, recursive: true })
    }
})
