import type { Platform, StyleDependency } from '@/common/consts'
import type {
    AbsoluteFontWeight,
    Declaration,
    GradientItemFor_DimensionPercentageFor_LengthValue,
    LineDirection,
    MathFunctionFor_DimensionPercentageFor_LengthValue,
    MathFunctionFor_Length,
    MediaFeatureValue,
    ParsedComponent,
    Token,
    TokenOrValue,
    UnresolvedColor,
} from 'lightningcss'

export type MediaQueryResolver = {
    conditions: Array<string>
    dependencies: Array<StyleDependency>
    platform: Platform | null
    rtl: boolean | null
    important: boolean
    importantProperties?: Array<string>
    theme: string | null
    disabled: boolean | null
    active: boolean | null
    focus: boolean | null
    dataAttributes: Record<string, string> | null
}

type TakeArray<T> = T extends Array<any> ? T : never

export type DeclarationValues =
    | Declaration['value']
    | TakeArray<Declaration['value']>[number]
    | TokenOrValue
    | Token
    | ParsedComponent
    | Array<TokenOrValue>
    | MediaFeatureValue
    | MathFunctionFor_DimensionPercentageFor_LengthValue
    | MathFunctionFor_Length
    | LineDirection
    | GradientItemFor_DimensionPercentageFor_LengthValue
    | AbsoluteFontWeight
    | UnresolvedColor

export type DeclarationProperty = Declaration['property']

export type ProcessMetaValues = {
    className?: string | null
}

export type StyleTemplate = {
    style: Record<string, unknown>
    meta: MediaQueryResolver & { complexity: number; importantComplexity: number }
}

export type StyleSheetTemplate = {
    [K: string]: Array<StyleTemplate>
}
