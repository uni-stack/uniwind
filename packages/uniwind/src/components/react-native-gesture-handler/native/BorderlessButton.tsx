import { BorderlessButton as RNGHBorderlessButton, BorderlessButtonProps } from 'react-native-gesture-handler'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

export const BorderlessButton = copyComponentProperties(
    RNGHBorderlessButton,
    (props: BorderlessButtonProps) => {
        const style = useStyle(props.className)

        return (
            <RNGHBorderlessButton
                {...props}
                style={[style, props.style]}
            />
        )
    },
)

export default BorderlessButton
