import { compile } from '@tailwindcss/node'
import fs from 'fs'
import { transform } from 'lightningcss'
import path from 'path'
import { Logger } from '../metro/logger'

const readFileSafe = (filePath: string) => {
    try {
        return fs.readFileSync(filePath, 'utf-8')
    } catch {
        return null
    }
}

const isExcludedDependency = (url: string) =>
    [
        url.includes('node_modules/tailwindcss'),
        url.includes('node_modules/@tailwindcss'),
        url.includes('node_modules/uniwind'),
    ].some(Boolean)

export const generateCSSForThemes = async (themes: Array<string>, input: string) => {
    // css generation
    const themesVariables = Object.fromEntries(themes.map(theme => [theme, new Set<string>()]))

    const findVariantsRec = async (cssPath: string) => {
        const css = readFileSafe(cssPath)

        if (css === null) {
            return
        }

        const { dependencies } = transform({
            code: Buffer.from(css),
            filename: 'uniwind.css',
            analyzeDependencies: true,
            visitor: {
                Rule: rule => {
                    if (rule.type === 'unknown' && rule.value.name === 'variant') {
                        const [firstPrelude] = rule.value.prelude

                        if (
                            firstPrelude?.type !== 'token'
                            || firstPrelude.value.type !== 'ident'
                            || !themes.includes(firstPrelude.value.value)
                        ) {
                            return
                        }

                        const theme = firstPrelude.value.value

                        rule.value.block?.forEach(block => {
                            if (block.type === 'dashed-ident') {
                                themesVariables[theme]?.add(block.value)
                            }
                        })
                    }
                },
            },
        })

        if (!Array.isArray(dependencies)) {
            return
        }

        const importUrls = new Set<string>()
        const importsCSS = dependencies
            .filter(dependency => {
                if (dependency.url.startsWith('.')) {
                    importUrls.add(path.resolve(path.dirname(cssPath), dependency.url))

                    return false
                }

                return !isExcludedDependency(dependency.url)
            })
            .map(dependency => `@import "${dependency.url}";`).join('\n')

        await compile(importsCSS, {
            base: path.resolve(path.dirname(cssPath)),
            onDependency: dependency => {
                if (isExcludedDependency(dependency)) {
                    return
                }

                importUrls.add(dependency)
            },
        })

        for (const filePath of importUrls) {
            await findVariantsRec(filePath)
        }
    }

    await findVariantsRec(input)

    // Check if all themes have the same variables
    let hasErrors = false as boolean
    const hasVariables = Object.values(themesVariables).some(variables => variables.size > 0)

    Object.values(themesVariables).forEach(variables => {
        Object.entries(themesVariables).forEach(([checkedTheme, checkedVariables]) => {
            variables.forEach(variable => {
                if (!checkedVariables.has(variable)) {
                    Logger.error(`Theme ${checkedTheme} is missing variable ${variable}`)
                    hasErrors = true
                }
            })
        })
    })

    if (hasErrors) {
        Logger.error('All themes must have the same variables')
    }

    const variablesCSS = hasVariables
        ? [
            '',
            '@theme {',
            ...Array.from(Object.values(themesVariables).at(0) ?? []).map(variable => `    ${variable}: unset;`),
            '}',
        ]
        : []
    const uniwindCSS = [
        ...themes.map(theme => `@custom-variant ${theme} (&:where(.${theme}, .${theme} *));`),
        ...variablesCSS,
    ].join('\n')

    return uniwindCSS
}
