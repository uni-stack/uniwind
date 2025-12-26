import { DrawerLayoutAndroidProps } from 'react-native'
import { DrawerLayoutAndroid as RNGHDrawerLayoutAndroid } from 'react-native-gesture-handler'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const DrawerLayoutAndroid = copyComponentProperties(
    RNGHDrawerLayoutAndroid,
    (props: DrawerLayoutAndroidProps) => {
        const style = useStyle(props.className)

        return (
            <RNGHDrawerLayoutAndroid
                {...props}
                style={[style, props.style]}
            />
        )
    },
)

export default DrawerLayoutAndroid
