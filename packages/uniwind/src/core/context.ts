import { createContext } from 'react'
import { ThemeName } from './types'

export const UniwindContext = createContext({
    scopedTheme: null as ThemeName | null,
})
