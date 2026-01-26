// @ts-expect-error - Importing internal react-native-web module
import originalCreateOrderedCSSStyleSheet from 'react-native-web/dist/exports/StyleSheet/dom/createOrderedCSSStyleSheet'

type OrderedCSSStyleSheet = {
    getTextContent: () => string
    insert: (cssText: string, groupValue: number) => void
}

/**
 * Custom createOrderedCSSStyleSheet that wraps RNW rules in @layer rnw
 * This ensures proper CSS cascade ordering with Tailwind v4 styles.
 */
const createOrderedCSSStyleSheet = (sheet: CSSStyleSheet | null) => {
    let layerRule = null
    let fakeSheet = null

    if (sheet !== null) {
        // Use existing layer rule if it already exists
        if (typeof CSSLayerBlockRule !== 'undefined' && sheet.cssRules[0] instanceof CSSLayerBlockRule) {
            layerRule = sheet.cssRules[0]
        } else {
            // otherwise insert a layer rule
            const layerIndex = sheet.insertRule('@layer rnw {}', 0)
            layerRule = sheet.cssRules[layerIndex]
        }

        // Create a fake sheet that excludes the layer rule
        fakeSheet = {
            // Increment index by 1 to skip the layer rule
            insertRule: (text: string, index?: number) => sheet.insertRule(text, index === undefined ? 1 : index + 1),
            get cssRules() {
                return Array.from(sheet.cssRules).slice(1)
            },
        }
    }

    const originalLayered: OrderedCSSStyleSheet = originalCreateOrderedCSSStyleSheet(layerRule)
    const original: OrderedCSSStyleSheet = originalCreateOrderedCSSStyleSheet(fakeSheet)

    return {
        getTextContent: () => {
            return `@layer rnw { ${originalLayered.getTextContent()} }\n${original.getTextContent()}`
        },
        insert: (cssText: string, groupValue: number) => {
            if (groupValue <= 1) {
                originalLayered.insert(cssText, groupValue)

                return
            }

            original.insert(cssText, groupValue)
        },
    }
}

export default createOrderedCSSStyleSheet
