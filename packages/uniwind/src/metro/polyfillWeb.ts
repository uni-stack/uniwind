import { transform } from 'lightningcss'
import { processFunctions } from '../css/processFunctions'

export const polyfillWeb = (css: string, themes: Array<string>) => {
    const processedClassNames = new Set<string>()

    const result = transform({
        code: Buffer.from(css),
        filename: 'uniwind.css',
        visitor: {
            Function: processFunctions,
            Rule: {
                style: styleRule => {
                    const firstSelector = styleRule.value.selectors.at(0)?.at(0)

                    if (firstSelector?.type !== 'class') {
                        return
                    }

                    const selectedVariant = themes.find(theme => firstSelector.name.includes(`${theme}:`))

                    if (selectedVariant === undefined || processedClassNames.has(selectedVariant)) {
                        return
                    }

                    processedClassNames.add(selectedVariant)

                    return {
                        type: 'scope',
                        value: {
                            loc: styleRule.value.loc,
                            scopeStart: [[{ type: 'class', name: selectedVariant }]],
                            rules: [styleRule],
                        },
                    }
                },
            },
        },
    })

    return result.code.toString()
}
