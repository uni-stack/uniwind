import { RNStyle, UniwindContextType } from '../types'
import { CSSListener } from './cssListener'
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

const getActiveStylesForClass = (className: string) => {
    const extractedStyles = {} as CSSStyleDeclaration

    if (!dummy) {
        return extractedStyles
    }

    const classNames = className.split(/\s+/).filter(Boolean)
    const computedStyles = window.getComputedStyle(dummy)

    CSSListener.registeredRules.forEach(rule => {
        const selector = rule.selectorText
        const mightMatch = classNames.some((cls) => selector.includes(`.${cls}`))

        if (!mightMatch) {
            return
        }

        // element.matches() throws errors if it sees pseudo-elements like ::before
        // So we strip them out safely just for the matching test
        const safeSelector = selector.replace(/::[a-z-]+/gi, '')

        try {
            if (safeSelector !== '' && dummy.matches(safeSelector)) {
                for (const propertyName of rule.style) {
                    const propertyValue = computedStyles.getPropertyValue(propertyName)
                    const camelCaseName = propertyName.replace(/-([a-z])/g, (g) => (g[1] ?? '').toUpperCase())

                    extractedStyles[camelCaseName] = propertyValue
                }
            }
        } catch {
            // Failsafe for unparseable selectors
        }
    })

    return extractedStyles
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

    const computedStyles = getActiveStylesForClass(className)

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
