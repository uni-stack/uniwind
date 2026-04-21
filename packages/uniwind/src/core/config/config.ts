import { arrayEquals } from '../../common/utils'
import { StyleDependency } from '../../types'
import { UniwindListener } from '../listener'
import { Logger } from '../logger'
import { CSSVariables, GenerateStyleSheetsCallback, ThemeName } from '../types'
import { getWebVariable } from '../web'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

type UniwindCSSRule = {
    style: CSSStyleDeclaration
    theme: ThemeName
}

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    private cssRules?: Array<UniwindCSSRule>

    constructor() {
        super()
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
                uniwindRules.map(rule => [rule.theme, getWebVariable(varName, { scopedTheme: rule.theme })]),
            )

            uniwindRules.forEach(rule => {
                if (rule.theme === theme) {
                    rule.style.setProperty(
                        varName,
                        typeof varValue === 'number' ? `${varValue}px` : varValue,
                    )

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
