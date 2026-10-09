import { serialize } from './serialize'
import type { MediaQueryResolver } from './types'

const serializeDimension = (dimension: number | string) => typeof dimension === 'number' ? String(dimension) : serialize(dimension)

export const generateStyleMatcher = (style: MediaQueryResolver) => {
    const conditions: Array<string> = []

    if (style.minWidthOperator !== null) {
        conditions.push(`rt.screen.width ${style.minWidthOperator} (${serializeDimension(style.minWidth)})`)
    }

    if (style.maxWidthOperator !== null) {
        conditions.push(`rt.screen.width ${style.maxWidthOperator} (${serializeDimension(style.maxWidth)})`)
    }

    if (style.minHeightOperator !== null) {
        conditions.push(`rt.screen.height ${style.minHeightOperator} (${serializeDimension(style.minHeight)})`)
    }

    if (style.maxHeightOperator !== null) {
        conditions.push(`rt.screen.height ${style.maxHeightOperator} (${serializeDimension(style.maxHeight)})`)
    }

    if (style.theme !== null) {
        conditions.push(`(context.scopedTheme ?? rt.currentThemeName) === ${JSON.stringify(style.theme)}`)
    }

    if (style.orientation !== null) {
        conditions.push(`rt.orientation === ${JSON.stringify(style.orientation)}`)
    }

    if (style.rtl !== null) {
        conditions.push(`(context.rtl ?? rt.rtl) === ${style.rtl}`)
    }

    if (style.active !== null) {
        conditions.push(`state?.isPressed === ${style.active}`)
    }

    if (style.focus !== null) {
        conditions.push(`state?.isFocused === ${style.focus}`)
    }

    if (style.disabled !== null) {
        conditions.push(`state?.isDisabled === ${style.disabled}`)
    }

    for (const [attribute, expectedValue] of Object.entries(style.dataAttributes ?? {})) {
        const value = `props?.[${JSON.stringify(attribute)}]`
        const serializedValue = JSON.stringify(expectedValue)

        if (expectedValue === 'true' || expectedValue === 'false') {
            conditions.push(`(${value} === ${expectedValue} || ${value} === ${serializedValue})`)
        } else {
            conditions.push(`${value} === ${serializedValue}`)
        }
    }

    return `function(rt, props, state, context) { return ${conditions.join(' && ') || 'true'} }`
}
