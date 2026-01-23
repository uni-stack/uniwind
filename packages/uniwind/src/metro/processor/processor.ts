import { Declaration, MediaQuery, Rule, transform } from 'lightningcss'
import { CSSAnimationKeyframes } from 'react-native-reanimated'
import { parseTransformsMutation } from '../../core/native/parsers/transforms'
import { AnimationFrame, MediaQueryResolver, Polyfills, ProcessMetaValues } from '../types'
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
    keyframes = {} as Record<string, CSSAnimationKeyframes>
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

    private parseKeyFrames(animationFrames: AnimationFrame): CSSAnimationKeyframes {
        const [selectors, styles] = animationFrames
        const result: CSSAnimationKeyframes = {}

        for (let i = 0; i < selectors.length; i++) {
            const selectorString = selectors[i]!
            const styleObj = styles[i]!

            // Split selector string by comma to handle multiple selectors like "0%, 100%"
            const individualSelectors = typeof selectorString === 'string'
                ? selectorString.split(',').map(s => s.trim()).filter(Boolean)
                : [selectorString]

            // Resolve styles using cssToRN
            const resolvedStyles: Record<string, any> = {}

            for (const [property, value] of Object.entries(styleObj)) {
                const resolved = this.RN.cssToRN(property, value)

                for (const [resolvedProperty, resolvedValue] of resolved) {
                    resolvedStyles[resolvedProperty] = resolvedValue
                }

                if (property === 'transform') {
                    parseTransformsMutation(resolvedStyles)
                }
            }

            // Assign resolved styles to each individual selector
            for (const selector of individualSelectors) {
                if (result[selector] !== undefined) {
                    result[selector] = {
                        ...result[selector],
                        ...resolvedStyles,
                    }
                } else {
                    result[selector] = { ...resolvedStyles }
                }
            }
        }

        return result
    }

    private parseDeclaration(declaration: Declaration) {
        const parseValue = (property: string, value: any) => {
            if (property === 'animation') {
                return this.CSS.processAnimation(value)
            }

            return this.CSS.processValue(value)
        }

        if (declaration.property === 'unparsed') {
            const property = declaration.value.propertyId.property

            return {
                property,
                value: parseValue(property, declaration.value.value),
            }
        }

        if (declaration.property === 'custom') {
            const property = declaration.value.name

            return {
                property,
                value: parseValue(property, declaration.value.value),
            }
        }

        return {
            property: declaration.property,
            value: parseValue(declaration.property, declaration.value),
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

        if (rule.type === 'keyframes') {
            const keyframes: AnimationFrame = [[], []]
            rule.value.keyframes.forEach((keyframe) => {
                const selectors = keyframe.selectors.map((selector) => {
                    switch (selector.type) {
                        case 'percentage':
                            return keyframe.selectors.length > 0
                                ? `${selector.value * 100}%`
                                : selector.value
                        case 'from':
                        case 'to':
                            return selector.type
                        case 'timeline-range-percentage':
                            return keyframe.selectors.length > 0
                                ? `${selector.value.percentage}%`
                                : selector.value.percentage
                        default:
                            return ''
                    }
                })

                keyframes[0].push(selectors.join(', '))

                const keyframeStyle: Record<string, any> = {}
                keyframe.declarations.declarations?.forEach((declaration) => {
                    keyframeStyle[declaration.property] = !Array.isArray(declaration.value) || declaration.property.startsWith('animation-')
                        ? this.CSS.processValue(declaration.value)
                        : declaration.value.flatMap(value => this.CSS.processValue(value))
                })

                keyframes[1].push(keyframeStyle)
            })

            this.keyframes[rule.value.name.value] = this.parseKeyFrames(keyframes)
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
