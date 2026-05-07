import type { TouchableWithoutFeedbackProps } from 'react-native'
import { TouchableWithoutFeedback as RNTouchableWithoutFeedback } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const TouchableWithoutFeedback = copyComponentProperties(RNTouchableWithoutFeedback, (props: TouchableWithoutFeedbackProps) => {
    return (
        <RNTouchableWithoutFeedback
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default TouchableWithoutFeedback
