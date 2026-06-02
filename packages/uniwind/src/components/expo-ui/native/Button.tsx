import { Button as ExpoButton, type ButtonProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const Button = copyComponentProperties(ExpoButton, (props: ButtonProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoButton
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
