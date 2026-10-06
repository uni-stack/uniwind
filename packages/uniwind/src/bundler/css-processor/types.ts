import type { ColorScheme, Orientation, Platform } from '@/common/consts'
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
    maxWidth: any
    minWidth: any
    minWidthOperator: '>' | '>=' | null
    maxWidthOperator: '<' | '<=' | null
    minHeight: any
    maxHeight: any
    minHeightOperator: '>' | '>=' | null
    maxHeightOperator: '<' | '<=' | null
    platform: Platform | null
    rtl: boolean | null
    important: boolean
    colorScheme: ColorScheme | null
    theme: string | null
    orientation: Orientation | null
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
    styles: Record<string, unknown>
    meta: MediaQueryResolver & { importantProperties: Array<string> }
}

export type StyleSheetTemplate = Record<string, Array<StyleTemplate>>
