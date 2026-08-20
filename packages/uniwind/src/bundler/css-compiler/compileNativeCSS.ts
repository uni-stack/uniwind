import type { UniwindBundlerConfig } from '../config'
import { addMetaToStylesTemplate, ProcessorBuilder, serializeJSObject } from '../css-processor'

export const compileNativeCSS = (bundlerConfig: UniwindBundlerConfig, tailwindCSS: string) => {
    const Processor = new ProcessorBuilder(bundlerConfig)

    Processor.transform(tailwindCSS)

    // Federated remotes resolve Uniwind's runtime globals from the host.
    if (bundlerConfig.isFederationRemote) {
        delete Processor.vars['--uniwind-em']
    }

    const stylesheet = serializeJSObject(
        addMetaToStylesTemplate(Processor, bundlerConfig.platform),
        (key, value) => `"${key}": ${value}`,
    )
    const vars = serializeJSObject(
        Processor.vars,
        (key, value) => `"${key}": vars => ${value}`,
    )
    const scopedVars = Object.fromEntries(
        Object.entries(Processor.scopedVars)
            .map(([scopedVarsName, scopedVars]) => [
                scopedVarsName,
                serializeJSObject(scopedVars, (key, value) => `"${key}": vars => ${value}`),
            ]),
    )
    const serializedScopedVars = Object.entries(scopedVars)
        .map(([scopedVarsName, scopedVars]) => `"${scopedVarsName}": ({ ${scopedVars} }),`)
        .join('')
    const currentColorVar = bundlerConfig.isFederationRemote
        ? ''
        : `currentColor: () => rt.colorScheme === 'dark' ? '#ffffff' : '#000000',`

    return [
        '({',
        `scopedVars: ({ ${serializedScopedVars} }),`,
        `vars: ({ ${currentColorVar} ${vars} }),`,
        `stylesheet: ({ ${stylesheet} }),`,
        '})',
    ].join('')
}
