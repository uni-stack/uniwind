export const enum Platform {
    Android = 'android',
    iOS = 'ios',
    Web = 'web',
    Native = 'native',
    TV = 'tv',
    AndroidTV = 'android-tv',
    AppleTV = 'apple-tv',
}

export const UNIWIND_PLATFORM_VARIABLES = '__uniwind-platform-'
export const UNIWIND_THEME_VARIABLES = '__uniwind-theme-'

export enum StyleDependency {
    ColorScheme = 1,
    Theme = 2,
    Dimensions = 3,
    Orientation = 4,
    Insets = 5,
    FontScale = 6,
    Rtl = 7,
    AdaptiveThemes = 8,
    Variables = 9,
}

export const enum Orientation {
    Portrait = 'portrait',
    Landscape = 'landscape',
}

export const enum ColorScheme {
    Light = 'light',
    Dark = 'dark',
}
