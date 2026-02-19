import { createContext, useContext } from 'react'
import { ThemeName } from './types'

export const UniwindContext = createContext({
    scopedTheme: null as ThemeName | null,
})

export const useUniwindContext = () => useContext(UniwindContext)
