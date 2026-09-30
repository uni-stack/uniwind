import type { MetroConfig } from 'metro-config'
import type { CustomResolutionContext, CustomResolver, Resolution } from 'metro-resolver'
import { realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { withUniwindConfig } from '../../../src/bundler/adapters/metro/metro'

const mockMetroResolve = jest.fn<Resolution, Parameters<CustomResolver>>()

jest.mock('node:module', () => ({
    ...jest.requireActual('node:module'),
    createRequire: () => () => ({ resolve: mockMetroResolve }),
}))

jest.mock('../../../src/bundler/adapters/metro/patches', () => ({
    cacheStore: {},
    patchMetroGraphToIncludeCssInLazyGraphs: () => {},
    patchMetroGraphToSupportUncachedModules: () => {},
}))

const projectRoot = join('/', 'workspace', 'apps', 'pro-app')
const internalRoot = dirname(realpathSync(require.resolve('uniwind/package.json')))
const internalEntry = join(internalRoot, 'src', 'index.ts')
const hoistedEntry = join('/', 'workspace', 'node_modules', 'uniwind', 'src', 'index.ts')

const resolveUniwind = (configuredResolver: CustomResolver) => {
    const config = withUniwindConfig({
        projectRoot,
        resolver: { resolveRequest: configuredResolver },
    } as MetroConfig, { cssEntryFile: './global.css' })
    const context = {
        originModulePath: join(projectRoot, 'src', 'App.tsx'),
        resolveRequest: configuredResolver,
    } as CustomResolutionContext

    return config.resolver!.resolveRequest!(context, 'uniwind', 'ios')
}

beforeEach(() => {
    mockMetroResolve.mockReset()
})

test('resolves uniwind again with metro-resolver when the configured resolver picks another copy', () => {
    mockMetroResolve.mockReturnValue({ type: 'sourceFile', filePath: internalEntry })
    const configuredResolver = jest.fn<Resolution, Parameters<CustomResolver>>(() => ({ type: 'sourceFile', filePath: hoistedEntry }))

    const resolution = resolveUniwind(configuredResolver)

    expect(configuredResolver).toHaveBeenCalledTimes(1)
    expect(mockMetroResolve).toHaveBeenCalledTimes(1)

    const [context, moduleName, platform] = mockMetroResolve.mock.calls[0]!

    expect(context.originModulePath).toBe(join(projectRoot, 'package.json'))
    expect(context.resolveRequest).toBe(mockMetroResolve)
    expect(moduleName).toBe('uniwind')
    expect(platform).toBe('ios')
    expect(resolution).toEqual({ type: 'sourceFile', filePath: internalEntry })
})

test('keeps the configured resolution when it points to this uniwind copy', () => {
    const configuredResolver = jest.fn<Resolution, Parameters<CustomResolver>>(() => ({ type: 'sourceFile', filePath: internalEntry }))

    const resolution = resolveUniwind(configuredResolver)

    expect(mockMetroResolve).not.toHaveBeenCalled()
    expect(configuredResolver.mock.calls[0]![0].originModulePath).toBe(join(projectRoot, 'package.json'))
    expect(resolution).toEqual({ type: 'sourceFile', filePath: internalEntry })
})
