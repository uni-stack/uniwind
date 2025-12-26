import { storage } from '@/utils/storage'
import { DarkTheme, DefaultTheme } from '@react-navigation/native'

import { Uniwind } from '@niibase/uniwind'
import { useCallback } from 'react'
import { Appearance } from 'react-native'
import { useMMKVString } from 'react-native-mmkv'

export type UniwindThemes = typeof Uniwind.currentTheme | 'system'
type NativeColorScheme = 'light' | 'dark' | undefined
const SELECTED_THEME_KEY = 'SELECTED_THEME'

export const getNativeColorScheme = (
    theme: UniwindThemes,
): NativeColorScheme => {
    const colorSchemeMap: Record<string, NativeColorScheme> = {
        sepia: 'light',
        bubblegum: 'light',
        system: undefined,
    }

    return colorSchemeMap[theme] ?? (theme as NativeColorScheme)
}

export const useStoredTheme = () => {
    const [storedTheme, setStoredTheme] = useMMKVString(
        SELECTED_THEME_KEY,
        storage,
    )

    const storeAndSetTheme = useCallback(
        (t: UniwindThemes) => {
            // Set the theme
            Uniwind.setTheme(t)

            // Store the theme
            setStoredTheme(t)
        },
        [setStoredTheme],
    )

    return {
        storedTheme: (storedTheme ?? 'system') as UniwindThemes,
        storeAndSetTheme,
    } as const
}

export const getStoredThemeSync = () => {
    const theme = storage.getString(SELECTED_THEME_KEY) as
        | UniwindThemes
        | undefined

    return theme ?? 'system'
}

const SepiaNavigationTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        background: '#F6F1E6',
        card: '#F6F1E6',
    },
}

const BubblegumNavigationTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        background: '#F7E6EE',
        card: '#F7E6EE',
    },
}

const LightNavigationTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        background: '#fff',
        card: '#fff',
    },
}

export const getNavigationTheme = (uniwindTheme: UniwindThemes) => {
    const themeMap: Record<
        UniwindThemes,
        typeof DarkTheme | typeof DefaultTheme
    > = {
        light: LightNavigationTheme,
        dark: DarkTheme,
        sepia: SepiaNavigationTheme,
        bubblegum: BubblegumNavigationTheme,
        system: Appearance.getColorScheme() === 'dark' ? DarkTheme : DefaultTheme,
    }
    return themeMap[uniwindTheme]
}
