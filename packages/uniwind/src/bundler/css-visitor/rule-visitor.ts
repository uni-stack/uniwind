import { ReturnedDeclaration, ReturnedMediaQuery, ReturnedRule, Rule, SelectorComponent } from 'lightningcss'

type LightningRuleVisitor = Rule<ReturnedDeclaration, ReturnedMediaQuery>
type LightningRuleVisitors = Partial<
    {
        [K in LightningRuleVisitor['type']]: (rule: Extract<LightningRuleVisitor, { type: K }>) => ReturnedRule | Array<ReturnedRule> | void
    }
>

export class RuleVisitor implements LightningRuleVisitors {
    processedClassNames = new Set<string>()
    processedVariables = new Set<string>()
    currentLayerName = ''

    constructor(private readonly themes: Array<string>) {}

    'layer-block' = (layer: Extract<LightningRuleVisitor, { type: 'layer-block' }>) => {
        this.currentLayerName = layer.value.name?.join('') ?? ''
    }

    style = (styleRule: Extract<LightningRuleVisitor, { type: 'style' }>) => {
        const firstSelector = styleRule.value.selectors.at(0)?.at(0)

        if (this.currentLayerName === 'theme' && firstSelector?.type === 'pseudo-class' && firstSelector.kind === 'root') {
            return this.removeNulls(this.processThemeRoot(styleRule)) as Array<ReturnedRule>
        }

        if (firstSelector?.type === 'class') {
            return this.processClassStyle(styleRule, firstSelector)
        }
    }

    cleanup() {
        this.currentLayerName = ''
        this.processedClassNames.clear()
        this.processedVariables.clear()
    }

    private processThemeRoot(styleRule: Extract<LightningRuleVisitor, { type: 'style' }>): Array<ReturnedRule> {
        const themeScopedRules = styleRule.value.rules?.filter(rule => {
            if (rule.type !== 'style') {
                return false
            }

            const firstSelector = rule.value.selectors.at(0)?.at(0)
            const secondSelector = rule.value.selectors.at(0)?.at(1)

            return firstSelector?.type === 'nesting' && secondSelector?.type === 'pseudo-class' && secondSelector.kind === 'where'
        }) ?? []
        const nonThemeRules = styleRule.value.rules?.filter(rule => !themeScopedRules.includes(rule))
        const processedThemeScopedRules = themeScopedRules.map(rule => {
            if (rule.type !== 'style') {
                return rule
            }

            const secondSelector = rule.value.selectors.at(0)?.at(1)

            if (secondSelector?.type === 'pseudo-class' && secondSelector.kind === 'where') {
                return this.processThemeStyle(rule, secondSelector)
            }

            return rule
        })

        return [
            {
                type: 'style',
                value: {
                    loc: styleRule.value.loc,
                    selectors: styleRule.value.selectors,
                    rules: nonThemeRules,
                    declarations: styleRule.value.declarations,
                },
            },
            ...processedThemeScopedRules,
        ]
    }

    private processThemeStyle(
        styleRule: Extract<LightningRuleVisitor, { type: 'style' }>,
        secondSelector: Extract<SelectorComponent, { type: 'pseudo-class'; kind: 'where' }>,
    ): ReturnedRule {
        const whereSelector = secondSelector.selectors.at(0)?.at(0)

        if (whereSelector?.type !== 'class') {
            return styleRule
        }

        const selectedVariant = this.themes.find(theme => whereSelector.name === theme)

        if (selectedVariant === undefined || this.processedVariables.has(selectedVariant)) {
            return styleRule
        }

        this.processedVariables.add(selectedVariant)

        return {
            type: 'style' as const,
            value: {
                loc: styleRule.value.loc,
                selectors: [[{ type: 'class' as const, name: selectedVariant }]],
                declarations: styleRule.value.declarations,
                rules: styleRule.value.rules,
            },
        }
    }

    private processClassStyle(
        styleRule: Extract<LightningRuleVisitor, { type: 'style' }>,
        firstSelector: Extract<SelectorComponent, { type: 'class' }>,
    ): ReturnedRule | void {
        const selectedVariant = this.themes.find(theme => firstSelector.name.includes(`${theme}:`))

        if (selectedVariant === undefined || this.processedClassNames.has(firstSelector.name)) {
            return
        }

        this.processedClassNames.add(firstSelector.name)

        return {
            type: 'scope',
            value: {
                loc: styleRule.value.loc,
                rules: [styleRule],
                scopeStart: [[{ type: 'class', name: selectedVariant }]],
                scopeEnd: this.themes
                    .filter(theme => theme !== selectedVariant)
                    .map(theme => [{ type: 'class', name: theme }]),
            },
        }
    }

    // Fixes lightningcss serialization bug
    private removeNulls(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(v => this.removeNulls(v))
        }

        if (typeof value === 'object' && value !== null) {
            return Object.fromEntries(
                Object.entries(value)
                    .filter(([_, value]) => {
                        if (value === null) {
                            return false
                        }

                        return true
                    })
                    .map(([key, value]) => [key, this.removeNulls(value)]),
            )
        }

        return value
    }
}
