import { RNStyle } from '../core/types'

const toKebabCase = (str: string) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

const generateExtraUtilities = (map: Record<string, RNStyle>) => {
    return Object.entries(map)
        .map(([name, style]) =>
            [
                `@utility ${name} {`,
                ...Object.entries(style).map(([key, value]) => `  ${toKebabCase(key)}: ${value};`),
                `}`,
                '',
            ].join('\n')
        ).join('\n')
}

const EXTRA_UTILITIES_MAP = {
    'border-continuous': {
        borderCurve: 'continuous',
    },
} satisfies Record<string, RNStyle>

export const EXTRA_UTILITIES_CSS = generateExtraUtilities(EXTRA_UTILITIES_MAP)
