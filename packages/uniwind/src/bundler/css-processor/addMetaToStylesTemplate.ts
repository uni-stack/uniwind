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

const readVarValues = (varName: string, Processor: ProcessorBuilder) =>
    [Processor.vars[varName], ...Object.values(Processor.scopedVars).map(scopedVars => scopedVars[varName])]
        .filter((value): value is string => typeof value === 'string')

const someVarReads = (
    varName: string,
    Processor: ProcessorBuilder,
    matches: (varName: string) => boolean,
    visited = new Set<string>(),
): boolean => {
    if (visited.has(varName)) {
        return false
    }

    visited.add(varName)

    if (matches(varName)) {
        return true
    }

    return readVarValues(varName, Processor).some(value =>
        extractVarsFromString(value).some(usedVarName => someVarReads(usedVarName, Processor, matches, visited))
    )
}

const hasThemedVarDependency = (varName: string, Processor: ProcessorBuilder) =>
    someVarReads(varName, Processor, name => Object.values(Processor.scopedVars).some(scopedVars => name in scopedVars))

const PLATFORM_COLOR = 'rt.platformColor'

const usesPlatformColorVar = (varName: string, Processor: ProcessorBuilder) =>
    someVarReads(varName, Processor, name => readVarValues(name, Processor).some(value => value.includes(PLATFORM_COLOR)))

export const addMetaToStylesTemplate = (Processor: ProcessorBuilder) => {
    const stylesheetsEntries = Object.entries(Processor.stylesheets)
        .map(([className, stylesPerMediaQuery]) => {
            const styles = stylesPerMediaQuery.map(({ style, meta }) => {
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

                // Android resolves a platform color only when it is applied, so it is reapplied after an appearance change
                if (stringifiedEntries.includes(PLATFORM_COLOR) || usedVars.some(usedVarName => usesPlatformColorVar(usedVarName, Processor))) {
                    dependencies.add(StyleDependency.Theme)
                    dependencies.add(StyleDependency.ColorScheme)
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
                    dataAttributeNames: dataAttributes !== null ? Object.keys(dataAttributes).map(makeSafeForSerialization) : null,
                    dependencies: dependencies.size > 0 ? Array.from(dependencies) : null,
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
