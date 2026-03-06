import fs from 'fs'
import path from 'path'
import { EXTRA_UTILITIES_CSS } from './extraUtilities'
import { INSETS_CSS } from './insets'
import { OVERWRITE_CSS } from './overwrite'
import { generateCSSForThemes } from './themes'
import { VARIANTS_CSS } from './variants'

const dirname = typeof __dirname !== 'undefined' ? __dirname : import.meta.dirname

export const buildCSS = async (themes: Array<string>, input: string) => {
    const themesCSS = await generateCSSForThemes(themes, input)
    const cssFilePath = path.join(dirname, '../../uniwind.css')
    const oldCSSFile = fs.existsSync(cssFilePath)
        ? fs.readFileSync(cssFilePath, 'utf-8')
        : ''

    const newCssFile = [
        VARIANTS_CSS,
        INSETS_CSS,
        OVERWRITE_CSS,
        EXTRA_UTILITIES_CSS,
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
