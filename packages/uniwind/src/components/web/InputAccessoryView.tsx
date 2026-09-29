import type { InputAccessoryViewProps } from 'react-native'
import * as ReactNative from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

const RNInputAccessoryView = ReactNative.InputAccessoryView ?? ReactNative.View

export const InputAccessoryView = copyComponentProperties(RNInputAccessoryView, (props: InputAccessoryViewProps) => {
    return (
        <RNInputAccessoryView
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default InputAccessoryView
