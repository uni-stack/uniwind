import { RectButton as RNGHRectButton, RectButtonProps } from 'react-native-gesture-handler'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const RectButton = copyComponentProperties(RNGHRectButton, (props: RectButtonProps) => {
    const style = useStyle(props.className)

    return (
        <RNGHRectButton
            {...props}
            style={[style, props.style]}
        />
    )
})

export default RectButton
