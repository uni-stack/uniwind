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
    const root = join(tmpdir(), 'react-native-web', 'my-app')
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

test.each(
    [
        ['root export', join('react-native-web', 'dist', 'index.js'), './exports/View', 'exports/View/index.js', false],
        ['component import', join('react-native-web', 'dist', 'exports', 'Pressable', 'index.js'), '../View', 'exports/View/index.js', false],
        [
            'nested installation',
            join('.pnpm', 'react-native-web@0.21.3', 'node_modules', 'react-native-web', 'dist', 'index.js'),
            './exports/View',
            'exports/View/index.js',
            false,
        ],
        [
            'Animated component',
            join('react-native-web', 'dist', 'vendor', 'react-native', 'Animated', 'components', 'AnimatedView.js'),
            '../../../../exports/View',
            'exports/View/index.js',
            true,
        ],
        [
            'stylesheet override',
            join('react-native-web', 'dist', 'exports', 'StyleSheet', 'dom', 'index.js'),
            './createOrderedCSSStyleSheet',
            'exports/StyleSheet/dom/createOrderedCSSStyleSheet.js',
            true,
        ],
    ] as const,
)('handles RNW internal imports: %s', (_name, origin, moduleName, target, shouldRewrite) => {
    const root = join(tmpdir(), 'my-app', 'node_modules')
    const filePath = join(root, 'react-native-web', 'dist', target)
    const component = target.includes('createOrderedCSSStyleSheet') ? 'createOrderedCSSStyleSheet' : 'View'
    const wrapper = join(root, 'uniwind', 'components', `${component}.js`)
    const resolver = jest.fn<ReturnType<CustomResolver>, Parameters<CustomResolver>>((_context, name) => ({
        type: 'sourceFile',
        filePath: name.startsWith('uniwind/components/') ? wrapper : filePath,
    }))
    const context = {
        originModulePath: join(root, origin),
        resolveRequest: resolver as CustomResolver,
    } as CustomResolutionContext

    const resolution = webResolver({ context, moduleName, platform: 'web', resolver })

    expect(resolution).toEqual({ type: 'sourceFile', filePath: shouldRewrite ? wrapper : filePath })
    expect(resolver.mock.calls.map(([, name]) => name)).toEqual(
        shouldRewrite
            ? [moduleName, `uniwind/components/${component}`]
            : [moduleName],
    )
})

test.each(['dist', join('dist', 'cjs')])('does not create an InputAccessoryView import cycle through the RNW %s root', (distribution) => {
    const rnwRoot = dirname(require.resolve('react-native-web/package.json'))
    const rootIndex = join(rnwRoot, distribution, 'index.js')
    const componentIndex = join(rnwRoot, distribution, 'exports', 'InputAccessoryView', 'index.js')
    const wrapper = join(dirname(realpathSync(require.resolve('uniwind/package.json'))), 'src', 'components', 'web', 'InputAccessoryView.tsx')
    const resolver = jest.fn<ReturnType<CustomResolver>, Parameters<CustomResolver>>((_context, moduleName) => ({
        type: 'sourceFile',
        filePath: moduleName === 'react-native'
            ? rootIndex
            : moduleName === 'uniwind/components/InputAccessoryView'
            ? wrapper
            : componentIndex,
    }))
    const resolveFrom = (originModulePath: string, moduleName: string) =>
        webResolver({
            context: { originModulePath, resolveRequest: resolver as CustomResolver } as CustomResolutionContext,
            moduleName,
            platform: 'web',
            resolver,
        })

    // The wrapper's namespace import loads the RNW root. Its InputAccessoryView
    // export must not resolve back to the wrapper while the root is initializing.
    expect(resolveFrom(wrapper, 'react-native')).toEqual({ type: 'sourceFile', filePath: rootIndex })
    expect(resolveFrom(rootIndex, './exports/InputAccessoryView')).toEqual({ type: 'sourceFile', filePath: componentIndex })
    expect(resolver.mock.calls.map(([, moduleName]) => moduleName)).toEqual(['react-native', './exports/InputAccessoryView'])

    // Application component imports must still receive the styled wrapper.
    expect(resolveFrom(join(tmpdir(), 'my-app', 'App.tsx'), 'react-native-web/dist/exports/InputAccessoryView')).toEqual({
        type: 'sourceFile',
        filePath: wrapper,
    })
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
