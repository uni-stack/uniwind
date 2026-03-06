import { ScrollView as RNScrollView, ScrollViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const ScrollView = copyComponentProperties(RNScrollView, (props: ScrollViewProps) => {
    return (
        <RNScrollView
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            contentContainerStyle={[toRNWClassName(props.contentContainerClassName), props.contentContainerStyle]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default ScrollView
