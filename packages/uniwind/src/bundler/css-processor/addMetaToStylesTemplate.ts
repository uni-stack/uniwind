import { StyleDependency } from '@/common/consts'
import { isDefined } from '@/common/utils'
import { generateMatches } from './matches'
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
        return JSON.stringify(value)
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

export const addMetaToStylesTemplate = (Processor: ProcessorBuilder) => {
    const stylesheetsEntries = Object.entries(Processor.stylesheets)
        .map(([className, stylesPerMediaQuery]) => {
            const styles = stylesPerMediaQuery.map(({ style, meta }, index) => {
                const {
                    rtl,
                    theme,
                    importantProperties,
                    dataAttributes,
                    complexity,
                    importantComplexity,
                } = meta

                if (meta.conditions.includes('false')) {
                    return null
                }

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

                if (entries.length === 0) {
                    return null
                }

                const matches = generateMatches(meta)
                const dependencies = new Set(meta.dependencies)
                const stringifiedEntries = JSON.stringify(entries) + matches
                const usedVars = extractVarsFromString(stringifiedEntries)
                const isUsingThemedVar = usedVars.some(usedVarName => hasThemedVarDependency(usedVarName, Processor))

                if (usedVars.length > 0) {
                    dependencies.add(StyleDependency.Variables)
                }

                if (theme !== null || isUsingThemedVar || stringifiedEntries.includes('rt.lightDark')) {
                    dependencies.add(StyleDependency.Theme)
                }

                if (rtl !== null) {
                    dependencies.add(StyleDependency.Rtl)
                }

                if (stringifiedEntries.includes('rt.screen')) {
                    dependencies.add(StyleDependency.Dimensions)
                }

                if (stringifiedEntries.includes('rt.insets')) {
                    dependencies.add(StyleDependency.Insets)
                }

                if (stringifiedEntries.includes('rt.fontScale')) {
                    dependencies.add(StyleDependency.FontScale)
                }

                return {
                    entries,
                    matches,
                    hasDataAttributes: dataAttributes !== null,
                    dependencies: dependencies.size > 0 ? Array.from(dependencies) : null,
                    index,
                    className: makeSafeForSerialization(className),
                    importantProperties: Array.from(nativeImportantProperties).map(makeSafeForSerialization),
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
