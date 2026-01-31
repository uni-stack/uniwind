import { TextInput as RNTextInput, TextInputProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { toRNWClassName } from './rnw'

export const TextInput = copyComponentProperties(RNTextInput, (props: TextInputProps) => {
    const placeholderTextColor = useUniwindAccent(props.placeholderTextColorClassName)

    return (
        <RNTextInput
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            placeholderTextColor={props.placeholderTextColor ?? placeholderTextColor}
        />
    )
})

export default TextInput
