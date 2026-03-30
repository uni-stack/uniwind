import { TextInput as RNTextInput, TextInputProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'
import { useUniwindAccent } from './useUniwindAccent'

export const TextInput = copyComponentProperties(RNTextInput, (props: TextInputProps) => {
    const placeholderTextColor = useUniwindAccent(props.placeholderTextColorClassName)

    return (
        <RNTextInput
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            placeholderTextColor={props.placeholderTextColor ?? placeholderTextColor}
            dataSet={generateDataSet(props)}
        />
    )
})

export default TextInput
