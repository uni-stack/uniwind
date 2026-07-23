import { StyleDependency } from '../../common/consts'
import { arrayEquals } from '../../common/utils'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import type { CSSVariables, GenerateStyleSheetsCallback, ThemeName } from '../types'
import { getWebVariable, toWebValue } from '../web'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

type UniwindCSSRule = {
    style: CSSStyleDeclaration
    theme: ThemeName
}

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    private cssRules?: Array<UniwindCSSRule>

    constructor() {
        super()

        if (typeof document === 'undefined') {
            return
        }

        // Adopt the theme already applied to <html>, e.g. by an SSR anti-flicker script
        const rootClasses = document.documentElement.classList
        const rootTheme = this.themes.find((theme) => rootClasses.contains(theme))
        if (rootTheme) {
            this.setTheme(rootTheme)
        }
    }

    updateCSSVariables(theme: ThemeName, variables: CSSVariables) {
        if (typeof document === 'undefined') {
            return
        }

        const uniwindRules = this.getUniwindDynamicCSSRules()

        Object.entries(variables).forEach(([varName, varValue]) => {
            if (!varName.startsWith('--') && __DEV__) {
                Logger.error(`CSS variable name must start with "--", instead got: ${varName}`)
            }

            const existingRules: Record<ThemeName, string | undefined> = Object.fromEntries(
                uniwindRules.map(
                    rule => [rule.theme, getWebVariable(varName, { scopedTheme: rule.theme, rtl: null, variables: null, variablesCacheKey: null })],
                ),
            )

            uniwindRules.forEach(rule => {
                if (rule.theme === theme) {
                    rule.style.setProperty(varName, toWebValue(varValue))

                    return
                }

                rule.style.setProperty(varName, existingRules[rule.theme] ?? null)
            })
        })

        UniwindListener.notify([StyleDependency.Variables])
    }

    protected __reinit(generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) {
        const oldThemes = this.themes
        super.__reinit(generateStyleSheetCallback, themes)

        if (arrayEquals(themes, oldThemes)) {
            return
        }

        this.cssRules = undefined

        if (typeof document !== 'undefined') {
            document.querySelector('#uniwind-dynamic-styles')?.remove()
        }
    }

    private getUniwindDynamicCSSRules() {
        if (this.cssRules) {
            return this.cssRules
        }

        if (typeof document === 'undefined') {
            return []
        }

        const styleElement = document.createElement('style')

        styleElement.innerText = this.themes.reduce(
            (acc, theme) => {
                return `${acc}.${theme}{}`
            },
            '',
        )
        styleElement.setAttribute('id', 'uniwind-dynamic-styles')
        document.head.appendChild(styleElement)

        const cssRules = Array.from(styleElement.sheet?.cssRules ?? [])
            .filter((rule): rule is CSSStyleRule => 'selectorText' in rule && 'style' in rule)
            .map((rule): UniwindCSSRule => ({ style: rule.style, theme: rule.selectorText.replace('.', '') }))

        this.cssRules = cssRules

        return cssRules
    }
}

export const Uniwind = new UniwindConfigBuilder()
