import { Text as ExpoText, type TextProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

type StyleWithWebkitLineClamp = {
    WebkitLineClamp?: number
}

export const Text = copyComponentProperties(ExpoText, (props: TextProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoText
            {...props}
            numberOfLines={props.numberOfLines ?? (style as StyleWithWebkitLineClamp).WebkitLineClamp}
            style={StyleSheet.flatten([style, props.style])}
            textStyle={StyleSheet.flatten([style, props.textStyle]) as TextProps['textStyle']}
        />
    )
})
