import type { ForwardedRef } from 'react'
import type { InputAccessoryViewProps } from 'react-native'
import { InputAccessoryView as RNInputAccessoryView } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const InputAccessoryView = copyComponentProperties(
    RNInputAccessoryView,
    (props: InputAccessoryViewProps & { ref?: ForwardedRef<RNInputAccessoryView> }) => {
        const style = useStyle(props.className, props)
        const backgroundColor = useAccentColor(props.backgroundColorClassName, props)

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
