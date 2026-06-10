import { Spacer as ExpoSpacer, type SpacerProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

export const Spacer = copyComponentProperties(ExpoSpacer, (props: SpacerProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })
    const size = [style.width, style.height].find(value => typeof value === 'number')

    return (
        <ExpoSpacer
            {...props}
            flexible={props.flexible ?? style.flex === 1}
            size={props.size ?? size}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
