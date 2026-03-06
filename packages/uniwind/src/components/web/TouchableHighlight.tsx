import { TouchableHighlight as RNTouchableHighlight, TouchableHighlightProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const TouchableHighlight = copyComponentProperties(RNTouchableHighlight, (props: TouchableHighlightProps) => {
    const underlayColor = useUniwindAccent(props.underlayColorClassName)

    return (
        <RNTouchableHighlight
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            underlayColor={props.underlayColor ?? underlayColor}
            dataSet={generateDataSet(props)}
        />
    )
})

export default TouchableHighlight
