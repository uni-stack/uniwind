import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const ActivityIndicator = copyComponentProperties(RNActivityIndicator, (props: ActivityIndicatorProps) => {
    const style = useStyle(props.className, props)
    const color = useStyle(props.colorClassName, props).accentColor

    return (
        <RNActivityIndicator
            {...props}
            style={[style, props.style]}
            color={props.color ?? color}
        />
    )
})

export default ActivityIndicator
