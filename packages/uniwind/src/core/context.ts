import { createContext, use } from 'react'
import type { ThemeName } from './types'

export const UniwindContext = createContext({
    scopedTheme: null as ThemeName | null,
    rtl: null as boolean | null,
})

export const useUniwindContext = () => use(UniwindContext)

UniwindContext.displayName = 'UniwindContext'
