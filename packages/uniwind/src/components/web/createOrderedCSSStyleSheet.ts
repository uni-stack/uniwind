// @ts-expect-error - Importing internal react-native-web module
import originalCreateOrderedCSSStyleSheet from 'react-native-web/dist/exports/StyleSheet/dom/createOrderedCSSStyleSheet'

type OrderedCSSStyleSheet = {
    getTextContent: () => string
}

/**
 * Custom createOrderedCSSStyleSheet that wraps RNW rules in @layer rnw
 * This ensures proper CSS cascade ordering with Tailwind v4 styles.
 */
const createOrderedCSSStyleSheet = (sheet: CSSStyleSheet | null): OrderedCSSStyleSheet => {
    let layerRule: CSSLayerBlockRule | null = null

    if (sheet !== null) {
        // Create @layer rnw {} at the start of the stylesheet
        // All RNW rules will be inserted inside this layer
        const layerIndex = sheet.insertRule('@layer rnw {}', 0)
        layerRule = sheet.cssRules[layerIndex] as CSSLayerBlockRule
    }

    // Pass the layer rule to the original - it has the same interface
    // (cssRules, insertRule) so the original works inside the layer
    const original = originalCreateOrderedCSSStyleSheet(layerRule) as OrderedCSSStyleSheet

    return {
        ...original,
        getTextContent: () => {
            // Wrap SSR output in @layer rnw for hydration consistency
            return `@layer rnw { ${original.getTextContent()} }`
        },
    }
}

export default createOrderedCSSStyleSheet
