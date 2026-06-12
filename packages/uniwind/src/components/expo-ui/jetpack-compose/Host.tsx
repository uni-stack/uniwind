import { Host as ExpoHost, type HostProps } from '@expo/ui/jetpack-compose'
import { StyleSheet } from 'react-native'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const Host = copyComponentProperties(ExpoHost, (props: HostProps) => {
    const style = useStyle(props.className, props)

    return (
        <ExpoHost
            {...props}
            style={StyleSheet.flatten([style, props.style])}
        />
    )
})
