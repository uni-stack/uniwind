import { generateDataSet } from '../../components/web/generateDataSet'
import type { CSSVariables, RNStyle, UniwindContextType } from '../types'
import { CSSListener } from './cssListener'
import { parseCSSValue, toWebValue } from './webUtils'

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

// Keep the private probe in the current scope; only changed variables invalidate its styles.
const applyScopedVariables = (uniwindContext: UniwindContextType) => {
    if (!dummyParent) {
        return
    }

    const variables: CSSVariables = uniwindContext.variables ?? {}
    const style = dummyParent.style

    Array.from(style).forEach(name => {
        if (name.startsWith('--') && !Object.prototype.hasOwnProperty.call(variables, name)) {
            style.removeProperty(name)
        }
    })

    Object.entries(variables).forEach(([name, value]) => {
        if (!name.startsWith('--')) {
            return
        }

        const next = toWebValue(value)

        if (style.getPropertyValue(name) !== next) {
            style.setProperty(name, next)
        }
    })
}

const getActiveStylesForClass = (className: string) => {
    const extractedStyles = {} as Record<string, string>

    if (!dummy) {
        return extractedStyles
    }

    const computedStyles = window.getComputedStyle(dummy)

    CSSListener.getRulesForClassName(className).forEach(rule => {
        const selector = rule.selectorText

        // element.matches() throws errors if it sees pseudo-elements like ::before
        // So we strip them out safely just for the matching test
        const safeSelector = selector.replace(/::[a-z-]+/gi, '')

        try {
            if (safeSelector !== '' && dummy.matches(safeSelector)) {
                for (const propertyName of rule.style) {
                    extractedStyles[propertyName] = computedStyles.getPropertyValue(propertyName)
                }
            }
        } catch {
            // Failsafe for unparseable selectors
        }
    })

    return extractedStyles
}

export const getWebStyles = (
    className: string | undefined,
    componentProps: Record<string, unknown> | undefined,
    uniwindContext: UniwindContextType,
): RNStyle => {
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

    if (uniwindContext.rtl !== null) {
        dummyParent?.setAttribute('dir', uniwindContext.rtl ? 'rtl' : 'ltr')
    } else {
        dummyParent?.removeAttribute('dir')
    }

    applyScopedVariables(uniwindContext)
    dummy.className = className

    const dataSet = generateDataSet(componentProps ?? {})

    try {
        if (dataSet) {
            Object.entries(dataSet).forEach(([key, value]) => {
                if (value === false || value === undefined) {
                    return
                }

                dummy.dataset[key] = String(value)
            })
        }

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
    } finally {
        if (dataSet) {
            Object.keys(dataSet).forEach(key => {
                delete dummy.dataset[key]
            })
        }
    }
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

    if (uniwindContext.rtl !== null) {
        dummyParent.setAttribute('dir', uniwindContext.rtl ? 'rtl' : 'ltr')
    } else {
        dummyParent.removeAttribute('dir')
    }

    applyScopedVariables(uniwindContext)
    const variable = window.getComputedStyle(dummyParent).getPropertyValue(name)

    return parseCSSValue(variable)
}
