import { generateDataSet } from '../../components/web/generateDataSet'
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
    const extractedStyles = {} as Record<string, string>

    if (!dummy) {
        return extractedStyles
    }

    const classNames = className.split(/\s+/).filter(Boolean)
    const computedStyles = window.getComputedStyle(dummy)

    CSSListener.activeRules.forEach(rule => {
        const selector = rule.selectorText
        const mightMatch = classNames.some((cls) => selector.includes(`.${CSS.escape(cls)}`))

        if (!mightMatch) {
            return
        }

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

    dummy.className = className

    const dataSet = generateDataSet(componentProps ?? {})

    Object.entries(dataSet).forEach(([key, value]) => {
        if (value === false || value === undefined) {
            return
        }

        dummy.dataset[key] = String(value)
    })

    const computedStyles = getActiveStylesForClass(className)

    Object.keys(dataSet).forEach(key => {
        delete dummy.dataset[key]
    })

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
