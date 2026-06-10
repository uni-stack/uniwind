import { ScrollView as ExpoScrollView, type ScrollViewProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

export const ScrollView = copyComponentProperties(ExpoScrollView, (props: ScrollViewProps) => {
    const style = useStyle(props.className, props, {
        isDisabled: Boolean(props.disabled),
    })

    return (
        <ExpoScrollView
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
