import { ImageBackground as RNImageBackground, ImageBackgroundProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const ImageBackground = copyComponentProperties(RNImageBackground, (props: ImageBackgroundProps) => {
    const { Component, style } = useStyle(RNImageBackground, props.className)
    const imageStyle = useStyle(props.imageClassName)
    const tintColor = useUniwindAccent(props.tintColorClassName)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            imageStyle={[imageStyle, props.imageStyle]}
            tintColor={props.tintColor ?? tintColor}
        />
    )
})

export default ImageBackground
