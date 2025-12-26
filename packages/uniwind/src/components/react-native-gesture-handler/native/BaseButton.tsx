import { BaseButton as RNGHBaseButton, BaseButtonProps } from 'react-native-gesture-handler'
import { useStyle } from '../../native/useStyle'
import { copyComponentProperties } from '../../utils'

type BaseButtonPropsWithClassName = BaseButtonProps & { className?: string }

export const BaseButton = copyComponentProperties(RNGHBaseButton, (props: BaseButtonPropsWithClassName) => {
    const style = useStyle(props.className)

    return (
        <RNGHBaseButton
            {...props}
            style={[style, props.style]}
        />
    )
})

export default BaseButton
