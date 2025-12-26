import { IconSymbol, IconSymbolName } from '@/components/icon-symbol'
import { UniwindThemes, useStoredTheme } from '@/utils/theme'
import { useResolveClassNames } from '@niibase/uniwind'
import { HeaderButton } from '@react-navigation/elements'
import { router } from 'expo-router'

const THEME_ICON_NAMES: Record<UniwindThemes, IconSymbolName> = {
    dark: 'moon.fill',
    light: 'sun.max.fill',
    sepia: 'camera.filters',
    bubblegum: 'camera.filters',
    system: 'circle.righthalf.filled',
}

export function ThemeSwitchButton() {
    const { storedTheme } = useStoredTheme()
    const primaryStyle = useResolveClassNames('bg-primary')

    const iconName = THEME_ICON_NAMES[storedTheme as UniwindThemes] ?? THEME_ICON_NAMES.system

    return (
        <HeaderButton
            onPress={() => router.push('/theme-selector')}
        >
            <IconSymbol
                name={iconName}
                size={24}
                color={primaryStyle.backgroundColor as string}
                animationSpec={{
                    speed: 4,
                    effect: {
                        type: 'bounce',
                    },
                }}
            />
        </HeaderButton>
    )
}
