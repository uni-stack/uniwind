import { Declaration, MediaQuery, Rule, transform } from 'lightningcss'
import { Polyfills, ProcessMetaValues } from '../types'
import { Color } from './color'
import { CSS } from './css'
import { Functions } from './functions'
import { MQ } from './mq'
import { RN } from './rn'
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

    constructor(private readonly themes: Array<string>, readonly polyfills: Polyfills | undefined) {
        this.vars['--uniwind-em'] = polyfills?.rem ?? 16
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
                const platformKey = `__uniwind-platform-${mq.platform}`
                this.scopedVars[platformKey] ??= {}

                return this.scopedVars[platformKey]
            }

            if (this.declarationConfig.theme === null) {
                return this.vars
            }

            const themeKey = `__uniwind-theme-${this.declarationConfig.theme}`
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

        style[declaration.property] = this.CSS.processValue(declaration.value)

        if (!isVar && important) {
            style.importantProperties.push(declaration.property)
        }
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

                    rule.value.declarations?.declarations?.forEach(declaration => this.addDeclaration(declaration))
                    rule.value.declarations?.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))
                    rule.value.rules?.forEach(rule => this.parseRuleRec(rule))

                    return
                }

                let rtl = null as boolean | null
                let theme = null as string | null
                let active = null as boolean | null
                let focus = null as boolean | null
                let disabled = null as boolean | null
                let dataAttributes = null as Record<string, string> | null

                selector.forEach(selector => {
                    if (selector.type === 'pseudo-class' && selector.kind === 'where') {
                        selector.selectors.forEach(selector => {
                            selector.forEach(selector => {
                                if (selector.type === 'class' && this.themes.includes(selector.name)) {
                                    theme = selector.name
                                }

                                if (selector.type === 'pseudo-class' && selector.kind === 'dir') {
                                    rtl = selector.direction === 'rtl'
                                }
                            })
                        })
                    }

                    if (selector.type === 'pseudo-class' && selector.kind === 'active') {
                        active = true
                    }

                    if (selector.type === 'pseudo-class' && selector.kind === 'focus') {
                        focus = true
                    }

                    if (selector.type === 'pseudo-class' && selector.kind === 'disabled') {
                        disabled = true
                    }

                    // data-x
                    if (selector.type === 'attribute' && selector.operation === null && selector.name.startsWith('data-')) {
                        dataAttributes ??= {}
                        dataAttributes[selector.name] = `"true"`
                    }

                    // data-x=
                    if (selector.type === 'attribute' && selector.operation?.operator === 'equal' && selector.name.startsWith('data-')) {
                        dataAttributes ??= {}
                        dataAttributes[selector.name] = `"${selector.operation.value}"`
                    }
                })

                if ([rtl, theme, active, focus, disabled, dataAttributes].some(Boolean)) {
                    this.declarationConfig.rtl = rtl
                    this.declarationConfig.theme = theme
                    this.declarationConfig.active = active
                    this.declarationConfig.focus = focus
                    this.declarationConfig.disabled = disabled
                    this.declarationConfig.dataAttributes = dataAttributes

                    rule.value.declarations?.declarations?.forEach(declaration => this.addDeclaration(declaration))
                    rule.value.declarations?.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))
                    rule.value.rules?.forEach(rule => this.parseRuleRec(rule))

                    this.declarationConfig.rtl = null
                    this.declarationConfig.theme = null
                    this.declarationConfig.active = null
                    this.declarationConfig.focus = null
                    this.declarationConfig.disabled = null
                    this.declarationConfig.dataAttributes = null

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

        if (rule.type === 'supports') {
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
