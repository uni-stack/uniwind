import type {
    BabelTransformer,
    BabelTransformerArgs,
} from 'metro-babel-transformer'
import { componentTransform } from './component-transform'
import {
    TRANSFORM_COMPONENTS,
    UPSTREAM_BABEL_TRANSFORMER,
} from './constants'

type BabelTransformerModule = BabelTransformer & {
    default?: BabelTransformer
}

const transformerCache = new Map<string, BabelTransformer>()

const getTransformer = (transformerPath: string) => {
    const cached = transformerCache.get(transformerPath)
    if (cached) {
        return cached
    }

    const module = require(transformerPath) as BabelTransformerModule
    const transformer = typeof module.transform === 'function'
        ? module
        : module.default

    if (!transformer || typeof transformer.transform !== 'function') {
        throw new Error(`Uniwind: Invalid upstream Babel transformer at ${transformerPath}`)
    }

    transformerCache.set(transformerPath, transformer)

    return transformer
}

export const transform = (args: BabelTransformerArgs) => {
    const customOptions = args.options.customTransformOptions ?? {}
    const upstreamPath = customOptions[UPSTREAM_BABEL_TRANSFORMER]

    if (typeof upstreamPath !== 'string') {
        throw new Error('Uniwind: Missing upstream Babel transformer path')
    }

    const {
        [TRANSFORM_COMPONENTS]: shouldTransform,
        [UPSTREAM_BABEL_TRANSFORMER]: _upstreamPath,
        ...upstreamCustomOptions
    } = customOptions
    const transformer = getTransformer(upstreamPath)

    return transformer.transform({
        ...args,
        options: {
            ...args.options,
            customTransformOptions: upstreamCustomOptions,
        },
        plugins: shouldTransform
            ? [...args.plugins ?? [], componentTransform]
            : args.plugins,
    })
}
