import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { generateDataSet } from './generateDataSet'
import { toRNWClassName } from './rnw'
import { useUniwindAccent } from './useUniwindAccent'

export const ActivityIndicator = copyComponentProperties(RNActivityIndicator, (props: ActivityIndicatorProps) => {
    const color = useUniwindAccent(props.colorClassName)

    return (
        <RNActivityIndicator
            {...props}
            style={[toRNWClassName(props.className), props.style]}
            color={props.color ?? color}
            dataSet={generateDataSet(props)}
        />
    )
})

export default ActivityIndicator
