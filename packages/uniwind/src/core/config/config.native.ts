import { UniwindStore } from '../native'
import { GenerateStyleSheetsCallback } from '../types'
import { UniwindConfigBuilder as UniwindConfigBuilderBase } from './config.common'

class UniwindConfigBuilder extends UniwindConfigBuilderBase {
    constructor() {
        super()
    }

    // @ts-expect-error Overriding protected method
    __reinit(generateStyleSheetCallback: GenerateStyleSheetsCallback, themes: Array<string>) {
        // @ts-expect-error Accessing protected method
        super.__reinit(themes)
        UniwindStore.reinit(generateStyleSheetCallback)
    }

    onThemeChange() {
        UniwindStore.runtime.currentThemeName = this.currentTheme
        UniwindStore.reinit()
    }
}

export const Uniwind = new UniwindConfigBuilder()
