import fs from 'fs'
import path from 'path'
import { generateCSSForInsets } from './insets'
import { generateCSSForThemes } from './themes'
import { generateCSSForVariants } from './variants'

const dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname

export const buildCSS = async (themes: Array<string>, input: string) => {
    const variants = generateCSSForVariants()
    const insets = generateCSSForInsets()
    const themesCSS = await generateCSSForThemes(themes, input)
    const cssFilePath = path.join(dirname, '../../uniwind.css')
    const oldCSSFile = fs.existsSync(cssFilePath)
        ? fs.readFileSync(cssFilePath, 'utf-8')
        : ''

    const newCssFile = [
        variants,
        insets,
        themesCSS,
    ].join('\n')

    if (oldCSSFile === newCssFile) {
        return
    }

    fs.writeFileSync(
        cssFilePath,
        newCssFile,
    )
}
