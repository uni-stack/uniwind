import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { copyComponentProperties } from '../utils'
import { useAccentColor } from './useAccentColor'
import { useStyle } from './useStyle'

export const ActivityIndicator = copyComponentProperties(RNActivityIndicator, (props: ActivityIndicatorProps) => {
    const style = useStyle(props.className, props, undefined, 'ActivityIndicator')
    const color = useAccentColor(props.colorClassName, props)

    return (
        <RNActivityIndicator
            {...props}
            style={[style, props.style]}
            color={props.color ?? color}
        />
    )
})

export default ActivityIndicator
