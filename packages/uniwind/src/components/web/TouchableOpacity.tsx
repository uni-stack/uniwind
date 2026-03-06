import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const TouchableOpacity = copyComponentProperties(RNTouchableOpacity, (props: TouchableOpacityProps) => {
    return (
        <RNTouchableOpacity
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default TouchableOpacity
