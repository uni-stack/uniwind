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
import { ColorScheme, Orientation } from '../types'

export type Polyfills = {
    rem?: number
}

export type UniwindConfig = {
    cssEntryFile: string
    themes: Array<string>
    extraThemes?: Array<string>
    dtsFile?: string
    polyfills?: Polyfills
    debug?: boolean
}

export type MediaQueryResolver = {
    maxWidth: number | null
    minWidth: number | null
    platform: Platform | null
    rtl: boolean | null
    important: boolean
    importantProperties?: Array<string>
    colorScheme: ColorScheme | null
    theme: string | null
    orientation: Orientation | null
    disabled: boolean | null
    active: boolean | null
    focus: boolean | null
}

export const enum Platform {
    Android = 'android',
    iOS = 'ios',
    Web = 'web',
    Native = 'native',
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

export type ProcessMetaValues = {
    className?: string | null
}

export type StyleSheetTemplate = {
    [K: string]: Array<MediaQueryResolver & Record<string, unknown>>
}
