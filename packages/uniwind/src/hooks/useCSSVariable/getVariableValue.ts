import { parseCSSValue } from '../../core/web'

const documentStyles = typeof document !== 'undefined'
    ? window.getComputedStyle(document.documentElement)
    : null

export const getVariableValue = (name: string) => {
    if (!documentStyles) {
        return undefined
    }

    const value = documentStyles.getPropertyValue(name).trim()

    if (value === '') {
        return undefined
    }

    return parseCSSValue(value)
}
