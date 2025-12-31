import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import path from 'path'
import { addMetaToStylesTemplate } from './addMetaToStylesTemplate'
import { Logger } from './logger'
import { polyfillWeb } from './polyfillWeb'
import { ProcessorBuilder } from './processor'
import { Platform, Polyfills } from './types'
import { serializeJSObject } from './utils'

type CompileVirtualConfig = {
    cssPath: string
    css: string
    platform: Platform
    themes: Array<string>
    polyfills: Polyfills | undefined
    debug: boolean | undefined
    candidates?: Array<string>
}

export const compileVirtual = async ({ css, cssPath, platform, themes, polyfills, debug, candidates }: CompileVirtualConfig) => {
    const compiler = await compile(css, {
        base: path.dirname(cssPath),
        onDependency: () => void 0,
    })
    const scanner = new Scanner({
        sources: [
            ...compiler.sources,
            {
                negated: false,
                pattern: '**/*',
                base: path.dirname(cssPath),
            },
        ],
    })
    const tailwindCSS = compiler.build(candidates ?? scanner.scan())

    if (platform === Platform.Web) {
        return polyfillWeb(tailwindCSS)
    }

    const Processor = new ProcessorBuilder(themes, polyfills)

    Logger.debug = debug === true
    Processor.transform(tailwindCSS)

    const stylesheet = serializeJSObject(
        addMetaToStylesTemplate(Processor, platform),
        (key, value) => `"${key}": ${value}`,
    )
    const vars = serializeJSObject(
        Processor.vars,
        (key, value) => `get "${key}"() { return ${value} }`,
    )
    const scopedVars = Object.fromEntries(
        Object.entries(Processor.scopedVars)
            .map(([scopedVarsName, scopedVars]) => [
                scopedVarsName,
                serializeJSObject(scopedVars, (key, value) => `get "${key}"() { return ${value} }`),
            ]),
    )
    const serializedScopedVars = Object.entries(scopedVars)
        .map(([scopedVarsName, scopedVars]) => `"${scopedVarsName}": ({ ${scopedVars} }),`)
        .join('')
    const currentColorVar = `get currentColor() { return rt.colorScheme === 'dark' ? '#ffffff' : '#000000' },`

    return [
        '({',
        `scopedVars: ({ ${serializedScopedVars} }),`,
        `vars: ({ ${currentColorVar} ${vars} }),`,
        `stylesheet: ({ ${stylesheet} }),`,
        '})',
    ].join('')
}
