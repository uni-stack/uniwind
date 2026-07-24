import { Logger } from '@/bundler/logger'
import { compile } from '@tailwindcss/node'
import fs from 'fs'
import { transform } from 'lightningcss'
import path from 'path'

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

const removeImportsForAnalysis = (css: string) => css.replace(/@import(?:[^;"']+|"[^"]*"|'[^']*')+;/g, '')

export const generateCSSForThemes = async (themes: Array<string>, input: string) => {
    // css generation
    const themesVariables = Object.fromEntries(themes.map(theme => [theme, new Set<string>()]))
    const inputPath = path.resolve(input)
    const cssPaths = new Set([inputPath])
    const inputCSS = readFileSafe(inputPath)

    if (inputCSS !== null) {
        await compile(inputCSS, {
            base: path.dirname(inputPath),
            onDependency: dependency => {
                if (!isExcludedDependency(dependency)) {
                    cssPaths.add(dependency)
                }
            },
        })
    }

    for (const cssPath of cssPaths) {
        const css = readFileSafe(cssPath)

        if (css === null) {
            continue
        }

        transform({
            // Tailwind owns import resolution, including prefix(...). Lightning
            // CSS only inspects import-free source for Uniwind theme metadata.
            code: Buffer.from(removeImportsForAnalysis(css)),
            filename: 'uniwind.css',
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
    }

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
        ...themes.map(theme => {
            const notOtherThemes = themes.map(t => `.${t}, .${t} *`)

            if (theme === 'dark' || theme === 'light') {
                return [
                    `@custom-variant ${theme} {`,
                    `   &:where(.${theme}, .${theme} *) {`,
                    '       @slot;',
                    '   }',
                    '',
                    `   @media (prefers-color-scheme: ${theme}) {`,
                    `       &:not(:where(${notOtherThemes.join(', ')})) {`,
                    '           @slot;',
                    '       }',
                    '   }',
                    '}',
                    '',
                ].join('\n')
            }

            return `@custom-variant ${theme} (&:where(.${theme}, .${theme} *));`
        }),
        ...variablesCSS,
    ].join('\n')

    return uniwindCSS
}
