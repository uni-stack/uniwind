import { buildCSS } from '../css'
import { buildDtsFile } from '../utils/buildDtsFile'
import { stringifyThemes } from '../utils/stringifyThemes'

type InjectThemesConfig = {
    themes: Array<string>
    dtsPath?: string
    input: string
}

export const injectThemes = async ({
    themes,
    dtsPath = 'uniwind-types.d.ts',
    input,
}: InjectThemesConfig) => {
    const stringifiedThemes = stringifyThemes(themes)

    buildDtsFile(dtsPath, stringifiedThemes)
    await buildCSS(themes, input)

    // js generation
    return stringifiedThemes
}
