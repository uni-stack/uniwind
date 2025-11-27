export const stringifyThemes = (themes: Array<string> = []) => `[${themes.map((theme) => `'${theme}'`).join(', ')}]`
