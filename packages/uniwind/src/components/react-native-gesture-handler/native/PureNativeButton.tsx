import { PureNativeButton as RNGHPureNativeButton, RawButtonProps } from 'react-native-gesture-handler'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const PureNativeButton = copyComponentProperties(RNGHPureNativeButton, (props: RawButtonProps) => {
    const style = useStyle(props.className)

    return (
        <RNGHPureNativeButton
            {...props}
            style={[style, props.style]}
        />
    )
})

export default PureNativeButton
