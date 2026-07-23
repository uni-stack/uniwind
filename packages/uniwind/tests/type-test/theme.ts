import type { ComponentProps } from 'react'
import { ScopedTheme, type ThemeName, Uniwind, useUniwind } from 'uniwind'
import { type Equal, type Expect } from './checks'

type ExpectedThemeName = 'light' | 'dark' | 'premium' | 'custom'

// ThemeName exported from uniwind
type ThemeNameTest = Expect<Equal<ThemeName, ExpectedThemeName>>

// useUniwind.theme
type UseUniwindThemeResult = ReturnType<typeof useUniwind>['theme']
type UseUniwindTest = Expect<Equal<UseUniwindThemeResult, ExpectedThemeName>>

// Uniwind.currentTheme
type UniwindCurrentThemeTest = Expect<Equal<typeof Uniwind.currentTheme, ExpectedThemeName>>

// Uniwind.themes
type UniwindThemesTest = Expect<Equal<typeof Uniwind.themes, Array<ExpectedThemeName>>>

// Uniwind.setTheme
type UniwindSetThemeParameter = Parameters<typeof Uniwind.setTheme>[0]
type UniwindSetThemeTest = Expect<Equal<UniwindSetThemeParameter, ExpectedThemeName | 'system'>>

// Uniwind.updateCSSVariables
type UniwindUpdateCSSVariablesThemeParameter = Parameters<typeof Uniwind.updateCSSVariables>[0]
type UniwindUpdateCSSVariablesThemeTest = Expect<Equal<UniwindUpdateCSSVariablesThemeParameter, ExpectedThemeName>>

// ScopedTheme theme prop
type ScopedThemeThemeProp = ComponentProps<typeof ScopedTheme>['theme']
type ScopedThemeThemePropTest = Expect<Equal<ScopedThemeThemeProp, ExpectedThemeName>>
