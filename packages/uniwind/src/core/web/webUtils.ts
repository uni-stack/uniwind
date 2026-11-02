import { parseColorText, toHexColor } from '../../uniparser/src/common/color'

export const toWebValue = (value: string | number) => typeof value === 'number' ? `${value}px` : value

export const formatColor = (color: string) => {
    const parsedColor = parseColorText(color)

    return parsedColor === undefined ? color : toHexColor(parsedColor)
}

export const parseCSSValue = (value: string) => {
    if (isNaN(Number(value)) && parseColorText(value) !== undefined) {
        return formatColor(value)
    }

    return value
}
