import { RawButton as RNGHRawButton, RawButtonProps } from 'react-native-gesture-handler'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const RawButton = copyComponentProperties(RNGHRawButton, (props: RawButtonProps) => {
    const style = useStyle(props.className)

    return (
        <RNGHRawButton
            {...props}
            style={[style, props.style]}
        />
    )
})

export default RawButton
