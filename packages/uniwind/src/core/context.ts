import { createContext, useContext } from 'react'
import type { ThemeName } from './types'

export const UniwindContext = createContext({
    scopedTheme: null as ThemeName | null,
})

export const useUniwindContext = () => useContext(UniwindContext)

UniwindContext.displayName = 'UniwindContext'
