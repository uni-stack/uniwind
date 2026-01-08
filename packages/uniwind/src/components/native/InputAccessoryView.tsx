import { ForwardedRef } from 'react'
import { InputAccessoryView as RNInputAccessoryView, InputAccessoryViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const InputAccessoryView = copyComponentProperties(
    RNInputAccessoryView,
    (props: InputAccessoryViewProps & { ref?: ForwardedRef<RNInputAccessoryView> }) => {
        const style = useStyle(props.className, props)
        const backgroundColor = useStyle(props.backgroundColorClassName, props).accentColor

        return (
            <RNInputAccessoryView
                {...props}
                backgroundColor={props.backgroundColor ?? backgroundColor}
                style={[style, props.style]}
            />
        )
    },
)

export default InputAccessoryView
