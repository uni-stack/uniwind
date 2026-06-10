import { Icon as ExpoIcon, type IconProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useAccentColor } from '../../../native/useAccentColor'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

export const Icon = copyComponentProperties(ExpoIcon, (props: IconProps) => {
    const state = {
        isDisabled: Boolean(props.disabled),
    }
    const style = useStyle(props.className, props, state)
    const color = useAccentColor(props.colorClassName, props, state)
    const size = [style.fontSize, style.width, style.height].find(value => typeof value === 'number')

    return (
        <ExpoIcon
            {...props}
            color={props.color ?? color}
            size={props.size ?? size}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
