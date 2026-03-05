import { RNStyle, UniwindContextType } from '../types'
import { parseCSSValue } from './parseCSSValue'

// Create two dummy elements: one for baseline (no class), one for target (with class)
// We need fresh elements each time to avoid state pollution
const getDummyElements = () => {
    if (typeof document === 'undefined') {
        return null
    }
    
    const parent = Object.assign(document.createElement('div'), {
        style: 'display: none;',
    })
    const baseline = document.createElement('div')
    const target = document.createElement('div')
    
    document.body.appendChild(parent)
    parent.appendChild(baseline)
    parent.appendChild(target)
    
    return { parent, baseline, target }
}

const dummies = getDummyElements()

const getComputedStyles = (element: HTMLDivElement): CSSStyleDeclaration => {
    const computedStyles = window.getComputedStyle(element)
    const styles = {} as CSSStyleDeclaration

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < computedStyles.length; i++) {
        const prop = computedStyles[i] as any
        styles[prop] = computedStyles.getPropertyValue(prop)
    }

    return styles
}

const getObjectDifference = <T extends object>(baseline: T, target: T): T => {
    const diff = {} as T
    const keys = Object.keys(target) as Array<keyof T>

    keys.forEach(key => {
        if (target[key] !== baseline[key]) {
            diff[key] = target[key]
        }
    })

    return diff
}

/**
 * Returns computed styles for a given className.
 * 
 * This function compares styles with and WITHOUT the class applied,
 * returning ONLY the differences explicitly caused by the class.
 * 
 * - Works with Tailwind utilities, custom CSS, media queries, scoped themes
 * - Returns empty object for classes that don't change any computed styles
 * - Includes styles even if they match browser defaults (as long as class explicitly sets them)
 */
export const getWebStyles = (className: string | undefined, uniwindContext: UniwindContextType): RNStyle => {
    if (className === undefined || !dummies) {
        return {}
    }

    const { parent, baseline, target } = dummies

    // Apply scoped theme to parent (affects both children via inheritance)
    if (uniwindContext.scopedTheme !== null) {
        parent.setAttribute('class', uniwindContext.scopedTheme)
    } else {
        parent.removeAttribute('class')
    }

    // Clear any previous classes
    baseline.className = ''
    target.className = ''
    
    // Force reflow to ensure clean state
    void baseline.offsetHeight
    void target.offsetHeight

    // Get baseline styles (no class applied, but WITH scoped theme context)
    const baselineStyles = getComputedStyles(baseline)

    // Apply the target className
    target.className = className
    
    // Force reflow
    void target.offsetHeight

    // Get target styles (with class applied)
    const targetStyles = getComputedStyles(target)

    // Return only the differences caused by the class
    const diff = getObjectDifference(baselineStyles, targetStyles)

    return Object.fromEntries(
        Object.entries(diff)
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
    if (!dummies) {
        return undefined
    }

    const { parent } = dummies

    if (uniwindContext.scopedTheme !== null) {
        parent.setAttribute('class', uniwindContext.scopedTheme)
    } else {
        parent.removeAttribute('class')
    }

    const variable = window.getComputedStyle(parent).getPropertyValue(name)

    return parseCSSValue(variable)
}
