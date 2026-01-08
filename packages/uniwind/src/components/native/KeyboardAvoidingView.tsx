import { KeyboardAvoidingView as RNKeyboardAvoidingView, KeyboardAvoidingViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const KeyboardAvoidingView = copyComponentProperties(RNKeyboardAvoidingView, (props: KeyboardAvoidingViewProps) => {
    const style = useStyle(props.className, props)
    const contentContainerStyle = useStyle(props.contentContainerClassName, props)

    return (
        <RNKeyboardAvoidingView
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
        />
    )
})

export default KeyboardAvoidingView
