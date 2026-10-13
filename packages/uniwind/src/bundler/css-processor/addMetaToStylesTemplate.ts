import { Platform, StyleDependency } from '@/common/consts'
import { isDefined } from '@/common/utils'
import type { ProcessorBuilder } from './processor'
import { serialize } from './serialize'

const extractVarsFromString = (value: string) => {
    const varsIndexes = [...value.matchAll(/vars\[/g)].map(m => m.index)

    return varsIndexes.map(index => {
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

const hasThemedVarDependency = (varName: string, Processor: ProcessorBuilder, visited = new Set<string>()): boolean => {
    if (visited.has(varName)) {
        return false
    }

    visited.add(varName)

    const isScopedVar = Object.values(Processor.scopedVars).some(scopedVars => varName in scopedVars)

    if (isScopedVar) {
        return true
    }

    const globalVarValue = Processor.vars[varName]

    if (typeof globalVarValue !== 'string') {
        return false
    }

    return extractVarsFromString(globalVarValue).some(usedVarName => {
        return hasThemedVarDependency(usedVarName, Processor, visited)
    })
}

export const addMetaToStylesTemplate = (Processor: ProcessorBuilder, currentPlatform: Platform) => {
    const stylesheetsEntries = Object.entries(Processor.stylesheets)
        .map(([className, stylesPerMediaQuery]) => {
            const styles = stylesPerMediaQuery.map(({ style, meta }, index) => {
                const {
                    platform,
                    rtl,
                    theme,
                    orientation,
                    minWidth,
                    maxWidth,
                    colorScheme,
                    importantProperties,
                    active,
                    focus,
                    disabled,
                    dataAttributes,
                    complexity,
                    importantComplexity,
                } = meta

                const nativeEntries = new Map<string, any>()
                const nativeImportantProperties = new Set<string>()

                for (const [property, value] of Object.entries(style)) {
                    const important = importantProperties?.includes(property) ?? false

                    for (const [nativeProperty, nativeValue] of Processor.RN.cssToRN(property, value)) {
                        if (!important && nativeImportantProperties.has(nativeProperty)) {
                            continue
                        }

                        nativeEntries.set(nativeProperty, nativeValue)

                        if (important) {
                            nativeImportantProperties.add(nativeProperty)
                        }
                    }
                }

                const entries = Array.from(nativeEntries)
                    .map(([property, value]) => [`"${property}"`, `function(vars) { return ${serialize(value)} }`])

                if (platform) {
                    const isTV = currentPlatform === Platform.AndroidTV || currentPlatform === Platform.AppleTV
                    const commonPlatform = isTV ? Platform.TV : Platform.Native

                    if (platform !== commonPlatform && platform !== currentPlatform) {
                        return null
                    }
                }

                if (entries.length === 0) {
                    return null
                }

                const dependencies: Array<StyleDependency> = []
                const stringifiedEntries = JSON.stringify(entries)
                const usedVars = extractVarsFromString(stringifiedEntries)
                const isUsingThemedVar = usedVars.some(usedVarName => hasThemedVarDependency(usedVarName, Processor))

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
                    dependencies: dependencies.length > 0 ? dependencies : null,
                    index,
                    className: makeSafeForSerialization(className),
                    active,
                    focus,
                    disabled,
                    importantProperties: Array.from(nativeImportantProperties).map(makeSafeForSerialization),
                    dataAttributes,
                    complexity,
                    importantComplexity,
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
