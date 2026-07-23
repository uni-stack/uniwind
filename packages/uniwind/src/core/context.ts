import { createContext, use } from 'react'
import type { CSSVariables, ThemeName } from './types'

export const UniwindContext = createContext({
    scopedTheme: null as ThemeName | null,
    rtl: null as boolean | null,
    variables: null as CSSVariables | null,
    variablesCacheKey: null as string | null,
})

export const useUniwindContext = () => use(UniwindContext)

UniwindContext.displayName = 'UniwindContext'
