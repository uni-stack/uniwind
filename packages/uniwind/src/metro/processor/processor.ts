import { Declaration, MediaQuery, Rule, transform } from 'lightningcss'
import { MediaQueryResolver, Polyfills, ProcessMetaValues } from '../types'
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

    private varsWithMediaQueries = {} as Record<string, Array<any>>
    private pendingVarReferences = new Map<string, Array<string>>()
    private declarationConfig = this.getDeclarationConfig()

    constructor(private readonly themes: Array<string>, readonly polyfills: Polyfills | undefined) {
        this.vars['--uniwind-em'] = polyfills?.rem ?? 16
    }

    transform(css: string) {
        transform({
            filename: 'tailwind.css',
            code: Buffer.from(css),
            visitor: {
                StyleSheet: styleSheet => {
                    styleSheet.rules.forEach(rule => {
                        this.declarationConfig = this.getDeclarationConfig()
                        this.parseRuleRec(rule)
                    })

                    for (const [className, varNames] of this.pendingVarReferences) {
                        for (const varName of varNames) {
                            const varStyles = this.varsWithMediaQueries[varName]
                            if (!varStyles || varStyles.length === 0) {
                                continue
                            }

                            for (const varStyle of varStyles) {
                                this.stylesheets[className]!.push(varStyle)
                            }
                        }

                        this.pendingVarReferences.delete(className)
                    }
                },
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
        })
    }

    private hasMediaQuery(mq: MediaQueryResolver): boolean {
        return mq.minWidth !== 0 || mq.maxWidth !== Number.MAX_VALUE || mq.orientation !== null || mq.colorScheme !== null
    }

    private addDeclaration(declaration: Declaration, important = false) {
        const isVar = this.declarationConfig.root || this.declarationConfig.className === null
        const mq = this.MQ.processMediaQueries(this.declarationConfig.mediaQueries)
        const { property, value } = this.parseDeclaration(declaration)
        const style = (() => {
            if (!isVar) {
                return this.stylesheets[this.declarationConfig.className!]?.at(-1)
            }

            if (mq.platform !== null) {
                const platformKey = `__uniwind-platform-${mq.platform}`
                this.scopedVars[platformKey] ??= {}

                return this.scopedVars[platformKey]
            }

            if (this.hasMediaQuery(mq)) {
                this.varsWithMediaQueries[property] ??= []
                this.varsWithMediaQueries[property].push({})
                return this.varsWithMediaQueries[property].at(-1)
            }

            if (this.declarationConfig.theme === null) {
                return this.vars
            }

            const themeKey = `__uniwind-theme-${this.declarationConfig.theme}`
            this.scopedVars[themeKey] ??= {}

            return this.scopedVars[themeKey]
        })()

        if (!isVar || this.hasMediaQuery(mq)) {
            Object.assign(style, mq)
            style.importantProperties ??= []
            style.rtl = this.declarationConfig.rtl
            style.theme = mq.colorScheme ?? this.declarationConfig.theme
            style.maxWidth = mq.maxWidth
            style.minWidth = mq.minWidth
            style.orientation = mq.orientation
            style.active = this.declarationConfig.active
            style.focus = this.declarationConfig.focus
            style.disabled = this.declarationConfig.disabled
            this.meta.className = this.declarationConfig.className
        }

        style[property] = value
        if (!isVar && important) {
            style.importantProperties.push(property)
        }

        // Track variable references for later processing (even if media queries don't exist yet)
        const match = typeof value === 'string' ? value.match(/this\[`(.*?)`\]/) : null

        if (match && !isVar) {
            const className = this.declarationConfig.className
            if (className === null) {
                return
            }

            if (!this.pendingVarReferences.has(className)) {
                this.pendingVarReferences.set(className, [])
            }

            const classVars = this.pendingVarReferences.get(className)!
            const varName = match[1]!

            if (!classVars.includes(varName)) {
                classVars.push(varName)
            }
        }
    }

    private parseDeclaration(declaration: Declaration) {
        if (declaration.property === 'unparsed') {
            return {
                property: declaration.value.propertyId.property,
                value: this.CSS.processValue(declaration.value.value),
            }
        }

        if (declaration.property === 'custom') {
            return {
                property: declaration.value.name,
                value: this.CSS.processValue(declaration.value.value),
            }
        }

        return {
            property: declaration.property,
            value: this.CSS.processValue(declaration.value),
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
                })

                if ([rtl, theme, active, focus, disabled].some(Boolean)) {
                    this.declarationConfig.rtl = rtl
                    this.declarationConfig.theme = theme
                    this.declarationConfig.active = active
                    this.declarationConfig.focus = focus
                    this.declarationConfig.disabled = disabled

                    rule.value.declarations?.declarations?.forEach(declaration => this.addDeclaration(declaration))
                    rule.value.declarations?.importantDeclarations?.forEach(declaration => this.addDeclaration(declaration, true))
                    rule.value.rules?.forEach(rule => this.parseRuleRec(rule))

                    this.declarationConfig.rtl = null
                    this.declarationConfig.theme = null
                    this.declarationConfig.active = null
                    this.declarationConfig.focus = null
                    this.declarationConfig.disabled = null

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
            rule.value.rules.forEach(rule => this.parseRuleRec(rule))
            this.declarationConfig = this.getDeclarationConfig()

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
