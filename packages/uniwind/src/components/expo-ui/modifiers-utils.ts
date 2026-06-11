import type { Button } from '@expo/ui'
import { tint } from '@expo/ui/swift-ui/modifiers'
import type { ComponentProps } from 'react'
import { Platform } from 'react-native'
import type { RNStyle } from '../../core/types'

type UniversalModifiers = NonNullable<ComponentProps<typeof Button>['modifiers']>

const isIOS = Platform.OS === 'ios'
const isAndroid = Platform.OS === 'android'

export const addModifiersFromStyle = (style: RNStyle, modifiers: UniversalModifiers | undefined) => {
    const styleModifiers = [] as UniversalModifiers

    if (style.accentColor) {
        if (isIOS) {
            styleModifiers.push(tint(style.accentColor))
        }

        if (isAndroid) {}
    }

    return [...styleModifiers, ...modifiers ?? []]
}
