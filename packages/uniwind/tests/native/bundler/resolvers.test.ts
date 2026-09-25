import type { CustomResolutionContext, CustomResolver } from 'metro-resolver'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { nativeResolver, webResolver } from '../../../src/bundler/adapters/metro/resolvers'

test('rewrites dependency imports when the project path contains a react-native directory', () => {
    const root = join(tmpdir(), 'react-native', 'my-app')
    const originModulePath = join(root, 'node_modules', 'heroui-native', 'lib', 'surface.js')
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

    expect(calls).toEqual(['react-native', 'uniwind/components'])
    expect(resolution).toMatchObject({
        type: 'sourceFile',
        filePath: join(root, 'node_modules', 'uniwind/components', 'index.js'),
    })
})

test('does not rewrite unrelated web modules when the project path contains react-native-web', () => {
    const root = join(tmpdir(), 'react-native-web', 'my-app')
    const calls: Array<string> = []
    const resolver: CustomResolver = (_context, moduleName) => {
        calls.push(moduleName)

        return {
            type: 'sourceFile',
            filePath: join(root, 'node_modules', 'other-package', 'View', 'index.js'),
        }
    }
    const context = {
        originModulePath: join(root, 'src', 'App.tsx'),
        resolveRequest: resolver,
    } as CustomResolutionContext

    const resolution = webResolver({
        context,
        moduleName: 'other-package/View',
        platform: 'web',
        resolver,
    })

    expect(calls).toEqual(['other-package/View'])
    expect(resolution).toMatchObject({
        type: 'sourceFile',
        filePath: join(root, 'node_modules', 'other-package', 'View', 'index.js'),
    })
})

test('rewrites React Native Web component files', () => {
    const root = join(tmpdir(), 'my-app')
    const calls: Array<string> = []
    const resolver: CustomResolver = (_context, moduleName) => {
        calls.push(moduleName)

        return {
            type: 'sourceFile',
            filePath: join(root, 'node_modules', 'react-native-web', 'dist', 'exports', 'View', 'index.js'),
        }
    }
    const context = {
        originModulePath: join(root, 'src', 'App.tsx'),
        resolveRequest: resolver,
    } as CustomResolutionContext

    webResolver({ context, moduleName: 'react-native-web', platform: 'web', resolver })

    expect(calls).toEqual(['react-native-web', 'uniwind/components/View'])
})

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

        if (resolution.type !== 'sourceFile') {
            throw new Error(`Expected a source file resolution, got ${resolution.type}`)
        }

        expect(resolution.filePath).toBe(join(root, 'node_modules', 'react-native', 'index.js'))
    } finally {
        rmSync(root, { force: true, recursive: true })
    }
})
