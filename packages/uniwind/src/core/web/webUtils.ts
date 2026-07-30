import { formatHex, formatHex8, parse } from 'culori'

export const toWebValue = (value: string | number) => typeof value === 'number' ? `${value}px` : value

export const formatColor = (color: string) => {
    const parsedColor = parse(color)

    if (!parsedColor) {
        return color
    }

    return parsedColor.alpha !== undefined && parsedColor.alpha !== 1
        ? formatHex8(parsedColor)
        : formatHex(parsedColor)
}

export const parseCSSValue = (value: string) => {
    if (isNaN(Number(value)) && parse(value) !== undefined) {
        return formatColor(value)
    }

    return value
}
