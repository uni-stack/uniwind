import { transform } from 'lightningcss'
import { processFunctions } from '../css/processFunctions'

export const polyfillWeb = (css: string) => {
    const result = transform({
        code: Buffer.from(css),
        filename: 'uniwind.css',
        visitor: {
            Function: processFunctions,
        },
    })

    return result.code.toString()
}
