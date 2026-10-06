import { Platform, StyleDependency } from '@/common/consts'
import { isDefined } from '@/common/utils'
import { generateStyleMatcher } from './generateStyleMatcher'
import type { ProcessorBuilder } from './processor'
import { serialize } from './serialize'
import { toCamelCase } from './utils'

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
            const compiledStyles = stylesPerMediaQuery.map(({ styles, meta }, index) => {
                const entries = Object.entries(styles)
                    .flatMap(([property, value]) => Processor.RN.cssToRN(property, value))
                    .map(([property, value]) => [`"${property}"`, `function(vars) { return ${serialize(value)} }`])

                if (meta.platform) {
                    const isTV = currentPlatform === Platform.AndroidTV || currentPlatform === Platform.AppleTV
                    const commonPlatform = isTV ? Platform.TV : Platform.Native

                    if (meta.platform !== commonPlatform && meta.platform !== currentPlatform) {
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

                if (meta.theme !== null || isUsingThemedVar || stringifiedEntries.includes('rt.lightDark')) {
                    dependencies.push(StyleDependency.Theme)
                }

                if (meta.orientation !== null) {
                    dependencies.push(StyleDependency.Orientation)
                }

                if (meta.rtl !== null) {
                    dependencies.push(StyleDependency.Rtl)
                }

                if (
                    meta.minWidthOperator !== null
                    || meta.maxWidthOperator !== null
                    || meta.minHeightOperator !== null
                    || meta.maxHeightOperator !== null
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
                    matches: generateStyleMatcher(meta),
                    minWidth: meta.minWidth,
                    minHeight: meta.minHeight,
                    dependencies: dependencies.length > 0 ? dependencies : null,
                    index,
                    className: makeSafeForSerialization(className),
                    importantProperties: meta.importantProperties
                        .map(property => property.startsWith('--') ? property : toCamelCase(property))
                        .map(makeSafeForSerialization),
                    hasDataAttributes: meta.dataAttributes !== null,
                    complexity: [
                        meta.minWidthOperator !== null,
                        meta.minHeightOperator !== null,
                        meta.theme !== null,
                        meta.orientation !== null,
                        meta.rtl !== null,
                        meta.platform !== null,
                        meta.active !== null,
                        meta.focus !== null,
                        meta.disabled !== null,
                        meta.dataAttributes !== null,
                    ].filter(Boolean).length,
                }
            })

            const filteredStyles = compiledStyles.filter(isDefined)

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
