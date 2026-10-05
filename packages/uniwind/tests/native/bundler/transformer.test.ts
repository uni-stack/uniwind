import type { JsTransformerConfig, JsTransformOptions } from 'metro-transform-worker'
import { transform as workerTransform } from 'metro-transform-worker'
import { transform } from '../../../src/bundler/adapters/metro/transformer'
import type { UniwindMetroConfig } from '../../../src/bundler/types'

jest.mock('metro-transform-worker', () => ({
    transform: jest.fn(async () => ({})),
}))

const config = {
    uniwind: {
        cssEntryFile: './global.css',
        extraThemes: ['premium'],
    },
} as JsTransformerConfig & { uniwind: UniwindMetroConfig }
const options = { type: 'module', platform: 'web' } as JsTransformOptions
const projectRoot = process.cwd()

beforeEach(() => {
    jest.clearAllMocks()
})

test.each(['components/web/metro-injected.mjs', 'components/web/metro-injected.cjs'])(
    'initializes web themes in the emitted %s module',
    async entry => {
        const filePath = `node_modules/uniwind/dist/${entry}`

        await transform(config, projectRoot, filePath, Buffer.from(''), options)

        expect(workerTransform).toHaveBeenCalledWith(
            config,
            projectRoot,
            filePath,
            Buffer.from('import { Uniwind } from \'uniwind\';Uniwind.__reinit(() => ({}), [\'light\', \'dark\', \'premium\']);'),
            options,
        )
    },
)

test('passes other emitted modules through to the worker', async () => {
    const filePath = 'node_modules/uniwind/dist/components/web/View.mjs'
    const data = Buffer.from('export const View = {}')

    await transform(config, projectRoot, filePath, data, options)

    expect(workerTransform).toHaveBeenCalledWith(config, projectRoot, filePath, data, options)
})
