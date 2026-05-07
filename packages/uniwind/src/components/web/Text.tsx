import type { TextProps } from 'react-native'
import { Text as RNText } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const Text = copyComponentProperties(RNText, (props: TextProps) => {
    return (
        <RNText
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default Text
