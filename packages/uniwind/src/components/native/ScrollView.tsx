import { ScrollView as RNScrollView, ScrollViewProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const ScrollView = copyComponentProperties(RNScrollView, (props: ScrollViewProps) => {
    const { Component, style } = useStyle(RNScrollView, props.className)
    const contentContainerStyle = useStyle(props.contentContainerClassName)
    const endFillColor = useUniwindAccent(props.endFillColorClassName)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            contentContainerStyle={[contentContainerStyle, props.contentContainerStyle]}
            endFillColor={props.endFillColor ?? endFillColor}
        />
    )
})

export default ScrollView
