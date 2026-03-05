import { RNStyle, UniwindContextType } from '../types'
import { parseCSSValue } from './parseCSSValue'

const dummyParent = typeof document !== 'undefined'
    ? Object.assign(document.createElement('div'), {
        style: 'display: none',
    })
    : null
const dummy = typeof document !== 'undefined'
    ? document.createElement('div')
    : null

if (dummyParent && dummy) {
    document.body.appendChild(dummyParent)
    dummyParent.appendChild(dummy)
}

const getComputedStyles = () => {
    if (!dummy) {
        return {} as CSSStyleDeclaration
    }

    const computedStyles = window.getComputedStyle(dummy)
    const styles = {} as CSSStyleDeclaration

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < computedStyles.length; i++) {
        // Typescript is unable to infer it properly
        const prop = computedStyles[i] as any

        styles[prop] = computedStyles.getPropertyValue(prop)
    }

    return styles
}

const initialStyles = typeof document !== 'undefined'
    ? getComputedStyles()
    : {} as CSSStyleDeclaration

const getObjectDifference = <T extends object>(obj1: T, obj2: T): T => {
    const diff = {} as T
    const keys = Object.keys(obj2) as Array<keyof T>

    keys.forEach(key => {
        if (obj2[key] !== obj1[key]) {
            diff[key] = obj2[key]
        }
    })

    return diff
}

export const getWebStyles = (className: string | undefined, uniwindContext: UniwindContextType): RNStyle => {
    if (className === undefined) {
        return {}
    }

    if (!dummy) {
        return {}
    }

    if (uniwindContext.scopedTheme !== null) {
        dummyParent?.setAttribute('class', uniwindContext.scopedTheme)
    } else {
        dummyParent?.removeAttribute('class')
    }

    dummy.className = className

    // Single snapshot of computed styles for efficiency
    const computedSnapshot = getComputedStyles()
    const computedStyles = getObjectDifference(initialStyles, computedSnapshot)

    // Approach #2: Include font-size and line-height for ANY class that changes them
    // This handles Tailwind utilities AND custom CSS classes like .test { font-size: 16px; }
    // Check if computed values differ from initial/inherited values
    if (computedSnapshot['font-size'] !== initialStyles['font-size']) {
        computedStyles['font-size'] = computedSnapshot['font-size']
    }
    if (computedSnapshot['line-height'] !== initialStyles['line-height']) {
        computedStyles['line-height'] = computedSnapshot['line-height']
    }

    return Object.fromEntries(
        Object.entries(computedStyles)
            .map(([key, value]) => {
                const parsedKey = key[0] === '-'
                    ? key
                    : key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

                return [
                    parsedKey,
                    parseCSSValue(value),
                ]
            }),
    )
}

export const getWebVariable = (name: string, uniwindContext: UniwindContextType) => {
    if (!dummyParent) {
        return undefined
    }

    if (uniwindContext.scopedTheme !== null) {
        dummyParent.setAttribute('class', uniwindContext.scopedTheme)
    } else {
        dummyParent.removeAttribute('class')
    }

    const variable = window.getComputedStyle(dummyParent).getPropertyValue(name)

    return parseCSSValue(variable)
}
