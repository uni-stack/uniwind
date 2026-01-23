import { Image as RNImage, ImageProps } from 'react-native'
import { useUniwindAccent } from '../../hooks'
import { copyComponentProperties } from '../utils'
import { useStyle } from './useStyle'

export const Image = copyComponentProperties(RNImage, (props: ImageProps) => {
    const { Component, style } = useStyle(RNImage, props.className)
    const tintColor = useUniwindAccent(props.tintColorClassName)

    return (
        <Component
            {...props}
            style={[style, props.style]}
            tintColor={props.tintColor ?? tintColor}
        />
    )
})

export default Image
