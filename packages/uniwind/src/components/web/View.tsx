import { View as RNView, ViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const View = copyComponentProperties(RNView, (props: ViewProps) => {
    return (
        <RNView
            {...props}
            dataSet={generateDataSet(props)}
            style={[toRNWClassName(props.className), props.style]}
        />
    )
})

export default View
