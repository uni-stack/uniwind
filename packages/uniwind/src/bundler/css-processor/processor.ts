import { UNIWIND_PLATFORM_VARIABLES, UNIWIND_THEME_VARIABLES } from '@/common/consts'
import { isDefined } from '@/common/utils'
import type { Declaration, MediaQuery, Rule, Selector } from 'lightningcss'
import { transform } from 'lightningcss'
import type { UniwindBundlerConfig } from '../config'
import { Color } from './color'
import { CSS } from './css'
import { Functions } from './functions'
import { MQ } from './mq'
import { RN } from './rn'
import type { ProcessMetaValues } from './types'
import { Units } from './units'
import { Var } from './var'

export class ProcessorBuilder {
    stylesheets = {} as Record<string, Array<any>>
    vars = {} as Record<string, any>
    scopedVars = {} as Record<string, Record<string, any>>
    CSS = new CSS(this)
    RN = new RN(this)
    Var = new Var(this)
    MQ = new MQ(this)
    Color = new Color(this)
    Units = new Units(this)
    Functions = new Functions(this)
    meta = {} as ProcessMetaValues

    private declarationConfig = this.getDeclarationConfig()

    constructor(private readonly bundlerConfig: UniwindBundlerConfig) {
        this.vars['--uniwind-em'] = this.bundlerConfig.polyfills?.rem ?? 16
    }

    transform(css: string) {
        transform({
            filename: 'tailwind.css',
            code: Buffer.from(css),
            visitor: {
                StyleSheet: styleSheet =>
                    styleSheet.rules.forEach(rule => {
                        this.declarationConfig = this.getDeclarationConfig()
                        this.parseRuleRec(rule)
                    }),
            },
        })
    }

    private getDeclarationConfig() {
        return ({
            className: null as string | null,
            rtl: null as boolean | null,
            mediaQueries: [] as Array<MediaQuery>,
            root: false,
            theme: null as string | null,
            active: null as boolean | null,
            focus: null as boolean | null,
            disabled: null as boolean | null,
            dataAttributes: null as Record<string, string> | null,
        })
    }

    private addDeclaration(declaration: Declaration, important = false) {
        const isVar = this.declarationConfig.root || this.declarationConfig.className === null
        const mq = this.MQ.processMediaQueries(this.declarationConfig.mediaQueries)
        const style = (() => {
            if (!isVar) {
                return this.stylesheets[this.declarationConfig.className!]?.at(-1)
            }

            if (mq.platform !== null) {
                const platformKey = `${UNIWIND_PLATFORM_VARIABLES}${mq.platform}`
                this.scopedVars[platformKey] ??= {}

                return this.scopedVars[platformKey]
            }

            if (this.declarationConfig.theme === null) {
                return this.vars
            }

            const themeKey = `${UNIWIND_THEME_VARIABLES}${this.declarationConfig.theme}`
            this.scopedVars[themeKey] ??= {}

            return this.scopedVars[themeKey]
        })()

        if (!isVar) {
            Object.assign(style, mq)
            style.importantProperties ??= []
            style.rtl = this.declarationConfig.rtl
            style.theme = mq.colorScheme ?? this.declarationConfig.theme
            style.active = this.declarationConfig.active
            style.focus = this.declarationConfig.focus
            style.disabled = this.declarationConfig.disabled
            style.dataAttributes = this.declarationConfig.dataAttributes
            this.meta.className = this.declarationConfig.className
        }

        if (declaration.property === 'unparsed') {
            style[declaration.value.propertyId.property] = this.CSS.processValue(declaration.value.value)

            if (!isVar && important) {
                style.importantProperties.push(declaration.value.propertyId.property)
            }

            return
        }

        if (declaration.property === 'custom') {
            style[declaration.value.name] = this.CSS.processValue(declaration.value.value)

            if (!isVar && important) {
                style.importantProperties.push(declaration.value.name)
            }

            return
        }

        style[declaration.property] = this.CSS.processValue(declaration.value, declaration.property)

        if (!isVar && important) {
            style.importantProperties.push(declaration.property)
        }
    }

    /**
     * Variant tokens (`:active`, `:disabled`, `:where(.dark)`, `[data-x]`, ...) found in a selector.
     * Returns null when it carries none, or `unsupported` when a compound the runtime cannot observe
     * (e.g. `[aria-disabled="true"]`) is present: the declarations must then be skipped, not applied
     * under a weaker condition. Tailwind < 4.3.3 nests variants under the class as `&:active`,
     * Tailwind >= 4.3.3 flattens them into the class selector, so both call sites share this.
     */
    private readSelectorVariants(selector: Selector) {
        let rtl = null as boolean | null
        let theme = null as string | null
        let active = null as boolean | null
        let focus = null as boolean | null
        let disabled = null as boolean | null
        let dataAttributes = null as Record<string, string> | null
        let unsupported = false

        selector.forEach(component => {
            // `&` in a nested rule and `:root` carry no condition of their own.
            if (component.type === 'nesting' || (component.type === 'pseudo-class' && component.kind === 'root')) {
                return
            }

            if (component.type === 'pseudo-class' && component.kind === 'where') {
                component.selectors.forEach(selector => {
                    selector.forEach(component => {
                        if (component.type === 'class' && this.bundlerConfig.themes.includes(component.name)) {
                            theme = component.name
                        }

                        if (component.type === 'pseudo-class' && component.kind === 'dir') {
                            rtl = component.direction === 'rtl'
                        }
                    })
                })

                return
            }

            if (component.type === 'pseudo-class' && component.kind === 'active') {
                active = true

                return
            }

            if (component.type === 'pseudo-class' && component.kind === 'focus') {
                focus = true

                return
            }

            if (component.type === 'pseudo-class' && component.kind === 'disabled') {
                disabled = true

                return
            }

            // data-x
            if (component.type === 'attribute' && component.operation === null && component.name.startsWith('data-')) {
                dataAttributes ??= {}
                dataAttributes[component.name] = `"true"`

                return
            }

            // data-x=
            if (component.type === 'attribute' && component.operation?.operator === 'equal' && component.name.startsWith('data-')) {
                dataAttributes ??= {}
                dataAttributes[component.name] = `"${component.operation.value}"`

                return
            }

            unsupported = true
        })

        if (unsupported) {
            return 'unsupported'
        }

        if (![rtl, theme, active, focus, disabled, dataAttributes].some(isDefined)) {
            return null
        }

        return { rtl, theme, active, focus, disabled, dataAttributes }
    }

    private withSelectorVariants(
        variants: Exclude<ReturnType<ProcessorBuilder['readSelectorVariants']>, null | 'unsupported'>,
        parse: () => void,
    ) {
        this.declarationConfig.rtl ??= variants.rtl
        this.declarationConfig.theme ??= variants.theme
        this.declarationConfig.active ??= variants.active
        this.declarationConfig.focus ??= variants.focus
        this.declarationConfig.disabled ??= variants.disabled
        this.declarationConfig.dataAttributes ??= variants.dataAttributes

        parse()

        this.declarationConfig.rtl = null
        this.declarationConfig.theme = null
        this.declarationConfig.active = null
        this.declarationConfig.focus = null
        this.declarationConfig.disabled = null
        this.declarationConfig.dataAttributes = null
    }

    private parseRuleRec(rule: Rule<Declaration, MediaQuery>) {
        if (this.declarationConfig.className !== null) {
            const lastStyle = this.stylesheets[this.declarationConfig.className]?.at(-1)

            if (lastStyle !== undefined && Object.keys(lastStyle).length > 0) {
                this.stylesheets[this.declarationConfig.className]?.push({})
            }
        }

        if (rule.type === 'style') {
            rule.value.selectors.forEach(selector => {
                const [maybeClassNameSelector] = selector
                const newClassName = maybeClassNameSelector?.type === 'class' ? maybeClassNameSelector.name : undefined

                if (newClassName !== undefined) {
                    this.declarationConfig.className = newClassName
                    this.stylesheets[newClassName] ??= []
                    this.stylesheets[newClassName].push({})

                    // Tailwind >= 4.3.3 emits `.active\:x:active {}` instead of nesting
                    // `&:active` under the class, so the variant tokens follow the class token.
                    const variants = this.readSelectorVariants(selector.slice(1))

                    if (variants === 'unsupported') {
                        return
                    }

                    const parseClassRule = () => {
                        rule.value.declarations?.declarations?.forEach(declaration => this.addDeclaration(declaration))
                        rule.value.declarations?.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))
                        rule.value.rules?.forEach(rule => this.parseRuleRec(rule))
                    }

                    if (variants === null) {
                        parseClassRule()
                    } else {
                        this.withSelectorVariants(variants, parseClassRule)
                    }

                    return
                }

                const variants = this.readSelectorVariants(selector)

                if (variants === 'unsupported') {
                    return
                }

                if (variants !== null) {
                    this.withSelectorVariants(variants, () => {
                        rule.value.declarations?.declarations?.forEach(declaration => this.addDeclaration(declaration))
                        rule.value.declarations?.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))
                        rule.value.rules?.forEach(rule => this.parseRuleRec(rule))
                    })

                    return
                }

                selector.forEach(selectorToken => {
                    if (selectorToken.type === 'pseudo-class' && selectorToken.kind === 'root') {
                        this.declarationConfig.root = true

                        rule.value.declarations?.declarations?.forEach(declaration => this.addDeclaration(declaration))
                        rule.value.declarations?.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))
                        rule.value.rules?.forEach(rule => this.parseRuleRec(rule))
                    }
                })
            })

            return
        }

        // Skip web: variant
        if (rule.type === 'supports' && rule.value.condition.value !== 'div > div') {
            rule.value.rules.forEach(rule => this.parseRuleRec(rule))

            return
        }

        if (rule.type === 'media') {
            const { mediaQueries } = rule.value.query

            this.declarationConfig.mediaQueries.push(...mediaQueries)
            rule.value.rules.forEach(rule => {
                this.parseRuleRec(rule)
                this.declarationConfig = this.getDeclarationConfig()
            })

            return
        }

        if (rule.type === 'layer-block') {
            rule.value.rules.forEach(rule => this.parseRuleRec(rule))

            return
        }

        if (rule.type === 'nested-declarations') {
            rule.value.declarations.declarations?.forEach(declaration => this.addDeclaration(declaration))
            rule.value.declarations.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))

            return
        }

        if (rule.type === 'property' && rule.value.initialValue) {
            this.vars[rule.value.name] = this.CSS.processValue(rule.value.initialValue)
        }
    }
}
