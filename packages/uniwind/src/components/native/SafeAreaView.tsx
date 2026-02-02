import { SafeAreaView as RNSafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const SafeAreaView = copyComponentProperties(RNSafeAreaView, (props: SafeAreaViewProps) => {
    const style = useStyle(props.className, props)

    return (
        <RNSafeAreaView
            {...props}
            style={[style, props.style]}
        />
    )
})

export default SafeAreaView
