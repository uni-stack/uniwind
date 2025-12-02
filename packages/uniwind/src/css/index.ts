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
    const cssFile = path.join(dirname, '../../uniwind.css')
    const oldCSSFile = fs.existsSync(cssFile)
        ? fs.readFileSync(cssFile, 'utf-8')
        : ''

    if (oldCSSFile === cssFile) {
        return
    }

    fs.writeFileSync(
        cssFile,
        [
            variants,
            insets,
            themesCSS,
        ].join('\n'),
    )
}
