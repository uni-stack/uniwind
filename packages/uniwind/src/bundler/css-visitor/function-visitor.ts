import type { Function as LightningCSSFunction, TokenOrValue } from 'lightningcss'

const ONE_PX = {
    type: 'token',
    value: { type: 'dimension', unit: 'px', value: 1 },
} satisfies TokenOrValue

const UNSET = {
    type: 'token',
    value: { type: 'ident', value: 'unset' },
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

    // The web has no platform colors, so it takes the fallback, the last argument
    'platform-color'(fn: LightningCSSFunction): TokenOrValue {
        const lastComma = fn.arguments.map(argument => argument.type === 'token' && argument.value.type === 'comma').lastIndexOf(true)
        const fallback = fn.arguments
            .slice(lastComma + 1)
            .filter(argument => argument.type !== 'token' || argument.value.type !== 'white-space')

        return lastComma !== -1 && fallback.length === 1 ? fallback[0]! : UNSET
    }
}
