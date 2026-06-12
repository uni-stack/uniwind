import { DropdownMenu as ExpoDropdownMenu, type DropdownMenuProps } from '@expo/ui/jetpack-compose'
import type { ComponentType, ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { useAccentColor } from '../../native/useAccentColor'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

type UniwindDropdownMenu = ComponentType<DropdownMenuProps> & {
    Items: ComponentType<{ children: ReactNode }>
    Preview: ComponentType<{ children: ReactNode }>
    Trigger: ComponentType<{ children: ReactNode }>
}

export const DropdownMenu: UniwindDropdownMenu = copyComponentProperties(ExpoDropdownMenu, (props: DropdownMenuProps) => {
    const style = useStyle(props.className, props)
    const color = useAccentColor(props.colorClassName, props)

    return (
        <ExpoDropdownMenu
            {...props}
            color={props.color ?? color}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
