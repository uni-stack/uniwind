import { RNHostView as ExpoRNHostView, type RNHostViewProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const RNHostView = copyComponentProperties(ExpoRNHostView, (props: RNHostViewProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoRNHostView
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
