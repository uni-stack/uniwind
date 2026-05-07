import type { UniwindBundlerConfig } from '../config'
import { addMetaToStylesTemplate, ProcessorBuilder, serializeJSObject } from '../css-processor'

export const compileNativeCSS = (bundlerConfig: UniwindBundlerConfig, tailwindCSS: string) => {
    const Processor = new ProcessorBuilder(bundlerConfig.themes, bundlerConfig.polyfills)

    Processor.transform(tailwindCSS)

    const stylesheet = serializeJSObject(
        addMetaToStylesTemplate(Processor, bundlerConfig.platform),
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
