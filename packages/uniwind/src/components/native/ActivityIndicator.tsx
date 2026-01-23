import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const ActivityIndicator = copyComponentProperties(RNActivityIndicator, (props: ActivityIndicatorProps) => {
    const { Component, style } = useStyle(RNActivityIndicator, props.className, { isPressed: Boolean(props.animating) })
    const color = useUniwindAccent(props.colorClassName)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            color={props.color ?? color}
        />
    )
})

export default ActivityIndicator
