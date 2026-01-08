import { SafeAreaView as RNSafeAreaView, ViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const SafeAreaView = copyComponentProperties(RNSafeAreaView, (props: ViewProps) => {
    const style = useStyle(props.className, props)

    return (
        <RNSafeAreaView
            {...props}
            style={[style, props.style]}
        />
    )
})

export default SafeAreaView
