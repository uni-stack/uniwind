import { Host as ExpoHost, type UniversalHostProps } from '@expo/ui'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../../native/useStyle'
import { copyComponentProperties } from '../../../utils'

export const Host = copyComponentProperties(ExpoHost, (props: UniversalHostProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoHost
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
