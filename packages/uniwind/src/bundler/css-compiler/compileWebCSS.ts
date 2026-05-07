import { transform } from 'lightningcss'
import type { UniwindBundlerConfig } from '../config'
import { UniwindCSSVisitor } from '../css-visitor'

export const compileWebCSS = (bundlerConfig: UniwindBundlerConfig, tailwindCSS: string) => {
    return transform({
        code: Buffer.from(tailwindCSS),
        filename: 'uniwind.css',
        visitor: new UniwindCSSVisitor(bundlerConfig.themes),
    }).code.toString()
}
