import { SafeAreaView as RNSafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context'
import { copyComponentProperties } from '../utils'
import { toRNWClassName } from './rnw'

export const SafeAreaView = copyComponentProperties(RNSafeAreaView, (props: SafeAreaViewProps) => {
    return (
        <RNSafeAreaView
            {...props}
            style={[toRNWClassName(props.className), props.style]}
        />
    )
})

export default SafeAreaView
