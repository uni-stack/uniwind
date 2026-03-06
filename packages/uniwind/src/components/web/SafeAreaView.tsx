import { SafeAreaView as RNSafeAreaView, ViewProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'

export const SafeAreaView = copyComponentProperties(RNSafeAreaView, (props: ViewProps) => {
    return (
        <RNSafeAreaView
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            dataSet={generateDataSet(props)}
        />
    )
})

export default SafeAreaView
