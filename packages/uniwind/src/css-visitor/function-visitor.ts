import { Function as LightningCSSFunction, TokenOrValue } from 'lightningcss'

const ONE_PX = {
    type: 'token',
    value: { type: 'dimension', unit: 'px', value: 1 },
} satisfies TokenOrValue

export class FunctionVisitor {
    [name: string]: (fn: LightningCSSFunction) => TokenOrValue

    pixelRatio(fn: LightningCSSFunction): TokenOrValue {
        return {
            type: 'function',
            value: {
                name: 'calc',
                arguments: [
                    fn.arguments.at(0) ?? ONE_PX,
                    { type: 'token', value: { type: 'delim', value: '*' } },
                    ONE_PX,
                ],
            },
        }
    }

    fontScale(fn: LightningCSSFunction): TokenOrValue {
        return {
            type: 'function',
            value: {
                name: 'calc',
                arguments: [
                    fn.arguments.at(0) ?? ONE_PX,
                    { type: 'token', value: { type: 'delim', value: '*' } },
                    {
                        type: 'token',
                        value: { type: 'dimension', value: 1, unit: 'rem' },
                    },
                ],
            },
        }
    }

    hairlineWidth(): TokenOrValue {
        return ONE_PX
    }
}
