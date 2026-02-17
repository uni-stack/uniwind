import { transform } from 'lightningcss'
import { processFunctions } from '../css/processFunctions'

export const polyfillWeb = (css: string) => {
    const result = transform({
        code: Buffer.from(css),
        filename: 'uniwind.css',
        visitor: {
            Function: processFunctions,
            Rule: {
                'layer-block': layer => {
                    if (layer.value.name?.at(0) !== 'theme') {
                        return
                    }

                    const firstRule = layer.value.rules.at(0)

                    if (firstRule?.type !== 'style') {
                        return
                    }

                    const firstSelector = firstRule.value.selectors.at(0)?.at(0)

                    if (firstSelector?.type !== 'pseudo-class' || firstSelector.kind !== 'root') {
                        return
                    }

                    const firstNestedRule = firstRule.value.rules?.at(0)

                    if (firstNestedRule?.type !== 'style') {
                        return
                    }

                    const firstNestedSelector = firstNestedRule.value.selectors.at(0)?.at(0)

                    if (firstNestedSelector?.type !== 'nesting') {
                        return
                    }

                    firstRule.value.rules?.forEach((rule) => {
                        if (rule.type !== 'style') {
                            return
                        }

                        const variantSelector = rule.value.selectors.at(0)?.at(1)

                        if (variantSelector?.type !== 'pseudo-class' || variantSelector.kind !== 'where') {
                            return
                        }

                        const variant = variantSelector.selectors.at(0)?.at(0)

                        if (variant?.type !== 'class') {
                            return
                        }

                        layer.value.rules.push({
                            type: 'scope',
                            value: {
                                scopeStart: [[variant]],
                                loc: { column: 0, line: 0, source_index: 0 },
                                rules: [{
                                    type: 'style',
                                    value: {
                                        loc: { column: 0, line: 0, source_index: 0 },
                                        selectors: [[{ type: 'pseudo-class', kind: 'scope' }]],
                                        declarations: rule.value.declarations,
                                    },
                                }],
                            },
                        })
                    })

                    return layer
                },
            },
        },
    })

    return result.code.toString()
}
