import type { GradientValue } from 'react-native'

type InferFromReadonlyArray<T> = T extends ReadonlyArray<infer U> ? U : never

const gradientDirectionTokens = new Set(['to', 'top', 'right', 'bottom', 'left'])

export const resolveGradient = (value: string) => {
    const tokens = value.split(', ')
    const directionToken = tokens.find(token => token.includes('to') || token.includes('deg'))
    const filtered = tokens.filter(token => token !== directionToken)

    const colorStops = filtered.map(token => {
        const [color, position] = token.split(' ')

        return {
            color: color!,
            positions: position !== undefined ? [position] : undefined,
        } satisfies InferFromReadonlyArray<GradientValue['colorStops']>
    })

    const direction = directionToken
        ?.split(' ')
        .reduce((acc, token) => {
            if (gradientDirectionTokens.has(token) || token.includes('deg')) {
                return `${acc} ${token.replace(',', '')}`
            }

            return acc
        }, '')
        .trim()

    return [
        {
            colorStops,
            type: 'linear-gradient',
            direction,
        },
    ] satisfies Array<GradientValue>
}
