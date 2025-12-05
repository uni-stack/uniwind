import { StyleDependency } from '../types'
import { ProcessorBuilder } from './processor'
import { Platform, StyleSheetTemplate } from './types'
import { isDefined, serialize, toCamelCase } from './utils'

const extractVarsFromString = (value: string) => {
    const thisIndexes = [...value.matchAll(/this\[/g)].map(m => m.index)

    return thisIndexes.map(index => {
        const afterIndex = value.slice(index + 5)
        const closingIndex = afterIndex.indexOf(']')
        const varName = afterIndex.slice(0, closingIndex)

        return varName.replace(/[`"\\]/g, '')
    })
}

const makeSafeForSerialization = (value: any) => {
    if (value === null) {
        return null
    }

    if (typeof value === 'string') {
        return `"${value}"`
    }

    return value
}

export const addMetaToStylesTemplate = (Processor: ProcessorBuilder, currentPlatform: Platform) => {
    const stylesheetsEntries = Object.entries(Processor.stylesheets as StyleSheetTemplate)
        .map(([className, stylesPerMediaQuery]) => {
            const styles = stylesPerMediaQuery.map((style, index) => {
                const {
                    platform,
                    rtl,
                    theme,
                    orientation,
                    minWidth,
                    maxWidth,
                    colorScheme,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    important,
                    importantProperties,
                    active,
                    focus,
                    disabled,
                    ...rest
                } = style

                const entries = Object.entries(rest)
                    .flatMap(([property, value]) => Processor.RN.cssToRN(property, value))
                    .map(([property, value]) => [`"${property}"`, `function() { return ${serialize(value)} }`])

                if (platform && platform !== Platform.Native && platform !== currentPlatform) {
                    return null
                }

                if (entries.length === 0) {
                    return null
                }

                const dependencies: Array<StyleDependency> = []
                const stringifiedEntries = JSON.stringify(entries)
                const usedVars = extractVarsFromString(stringifiedEntries)
                const isUsingThemedVar = usedVars.some(usedVarName => {
                    return Object.values(Processor.scopedVars).some(scopedVars => {
                        const scopedVarsNames = Object.keys(scopedVars)

                        return scopedVarsNames.includes(usedVarName)
                    })
                })

                if (usedVars.length > 0) {
                    dependencies.push(StyleDependency.Variables)
                }

                if (theme !== null || isUsingThemedVar || stringifiedEntries.includes('rt.lightDark')) {
                    dependencies.push(StyleDependency.Theme)
                }

                if (orientation !== null) {
                    dependencies.push(StyleDependency.Orientation)
                }

                if (rtl !== null) {
                    dependencies.push(StyleDependency.Rtl)
                }

                if (
                    Number(minWidth) !== 0
                    || Number(maxWidth) !== Number.MAX_VALUE
                    || stringifiedEntries.includes('rt.screen')
                ) {
                    dependencies.push(StyleDependency.Dimensions)
                }

                if (stringifiedEntries.includes('rt.insets')) {
                    dependencies.push(StyleDependency.Insets)
                }

                if (stringifiedEntries.includes('rt.fontScale')) {
                    dependencies.push(StyleDependency.FontScale)
                }

                return {
                    entries,
                    minWidth,
                    maxWidth,
                    theme: makeSafeForSerialization(theme),
                    orientation: makeSafeForSerialization(orientation),
                    rtl,
                    colorScheme: makeSafeForSerialization(colorScheme),
                    native: platform !== null,
                    dependencies: dependencies.length > 0 ? dependencies : null,
                    index,
                    className: makeSafeForSerialization(className),
                    active,
                    focus,
                    disabled,
                    importantProperties: importantProperties
                        ?.map(property => property.startsWith('--') ? property : toCamelCase)
                        .map(makeSafeForSerialization) ?? [],
                    complexity: [
                        minWidth !== 0,
                        theme !== null,
                        orientation !== null,
                        rtl !== null,
                        platform !== null,
                        active !== null,
                        focus !== null,
                        disabled !== null,
                    ].filter(Boolean).length,
                }
            })

            const filteredStyles = styles.filter(isDefined)

            if (filteredStyles.length === 0) {
                return null
            }

            return [
                className,
                filteredStyles,
            ] as const
        })
        .filter(isDefined)
    const stylesheets = Object.fromEntries(stylesheetsEntries) as Record<string, any>

    return stylesheets
}
